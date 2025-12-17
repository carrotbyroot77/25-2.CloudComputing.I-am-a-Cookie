import os
import time
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional, Tuple

import boto3
from botocore.exceptions import ClientError
from flask_login import UserMixin


# =========================
# DynamoDB 연결
# =========================
_TABLE_NAME = os.environ.get("TABLE_NAME")
if not _TABLE_NAME:
    # 로컬/테스트에서 에러가 더 친절하게 보이도록
    raise RuntimeError("환경변수 TABLE_NAME 이 설정되어 있지 않습니다. (Lambda Env Var에 TABLE_NAME 추가 필요)")

_ddb = boto3.resource("dynamodb")
_table = _ddb.Table(_TABLE_NAME)


# =========================
# SQLAlchemy 흉내내는 최소 DB/Session
# (app.py가 db.session.add/commit, db.init_app, db.create_all을 호출하므로)
# =========================
class _Session:
    def __init__(self):
        self._pending_add: List["User"] = []
        self._pending_save: List["User"] = []

    def add(self, obj: "User") -> None:
        # 신규 생성으로 간주
        obj._is_new = True
        obj._dirty = True
        self._pending_add.append(obj)

    def commit(self) -> None:
        # add() 없이 속성만 바꾼 객체도 commit 시 저장되도록(예: current_user.fitness_score = score)
        # 단, 이런 객체는 app.py에서 참조 중인 객체만 해당됨.
        # 여기서는 pending 목록에 있는 것만 저장하지만,
        # User 객체는 __setattr__로 dirty 표시를 하므로 save() 호출로 추가될 수 있음.
        to_save = []
        to_save.extend(self._pending_add)
        to_save.extend(self._pending_save)

        # 중복 제거
        uniq = []
        seen = set()
        for u in to_save:
            k = (u.student_id,)
            if k not in seen:
                uniq.append(u)
                seen.add(k)

        for user in uniq:
            _put_user_item(user)
            user._dirty = False
            user._is_new = False

        self._pending_add.clear()
        self._pending_save.clear()

    def mark_for_save(self, obj: "User") -> None:
        if obj not in self._pending_save:
            self._pending_save.append(obj)


class _DB:
    def __init__(self):
        self.session = _Session()

    def init_app(self, app) -> None:
        # SQLAlchemy init_app 대체(필요없지만 app.py 호환용)
        return

    def create_all(self) -> None:
        # DynamoDB는 스키마 생성이 아니라서 no-op
        return


db = _DB()


# =========================
# Query 흉내내는 최소 구현
# =========================
class _Field:
    """User.fitness_score.desc() 같은 표현을 흉내내기 위한 필드"""
    def __init__(self, name: str):
        self.name = name

    def desc(self) -> Tuple[str, str]:
        return (self.name, "desc")

    def asc(self) -> Tuple[str, str]:
        return (self.name, "asc")


class _Query:
    def __init__(self, model_cls):
        self.model_cls = model_cls
        self._filters: Dict[str, Any] = {}
        self._order: Optional[Tuple[str, str]] = None
        self._limit: Optional[int] = None

    def filter_by(self, **kwargs) -> "_Query":
        self._filters.update(kwargs)
        return self

    def first(self) -> Optional["User"]:
        # 현재 app.py는 filter_by(student_id=...).first() 형태로만 사용함
        student_id = self._filters.get("student_id")
        if not student_id:
            # 소규모 전제: 조건 없으면 scan 첫 번째
            users = self.all()
            return users[0] if users else None
        return _get_user_by_student_id(student_id)

    def get(self, user_id: int) -> Optional["User"]:
        # app.py의 load_user: User.query.get(int(user_id))
        # DynamoDB 키가 id 기반이 아니라 student_id 기반이라 "소수" 전제에서 scan으로 찾음
        return _get_user_by_id(user_id)

    def order_by(self, order_expr) -> "_Query":
        # order_expr: ('fitness_score','desc') 형태로 들어오도록 설계
        if isinstance(order_expr, tuple) and len(order_expr) == 2:
            self._order = order_expr
        return self

    def limit(self, n: int) -> "_Query":
        self._limit = int(n)
        return self

    def all(self) -> List["User"]:
        # 소수 전제: scan 후 파이썬 정렬
        users = _scan_all_users()

        if self._order:
            field, direction = self._order
            reverse = direction == "desc"
            users.sort(key=lambda u: getattr(u, field, 0), reverse=reverse)

        if self._limit is not None:
            users = users[: self._limit]

        return users


# =========================
# User 모델 (Flask-Login 호환)
# =========================
@dataclass
class User(UserMixin):
    # 기존 SQLAlchemy 컬럼과 동일한 이름 유지 (app.py 호환)
    id: int
    student_id: str
    password_hash: str
    name: str
    fitness_score: int = 0
    security_question: str = ""
    security_answer: str = ""

    # 내부 상태
    _dirty: bool = field(default=False, init=False, repr=False)
    _is_new: bool = field(default=False, init=False, repr=False)

    # SQLAlchemy처럼: User.fitness_score.desc()
    fitness_score_field = _Field("fitness_score")

    def __setattr__(self, key, value):
        super().__setattr__(key, value)
        # 유저 속성 변경 시 dirty 표시해서 commit 시 저장될 수 있게
        if key in {"password_hash", "name", "fitness_score", "security_question", "security_answer"}:
            try:
                super().__setattr__("_dirty", True)
                db.session.mark_for_save(self)
            except Exception:
                pass

    @property
    def fitness_score(self):
        return self.__dict__.get("fitness_score", 0)

    @fitness_score.setter
    def fitness_score(self, value):
        self.__dict__["fitness_score"] = int(value) if value is not None else 0
        self._dirty = True
        db.session.mark_for_save(self)

    # SQLAlchemy의 User.query 역할
    query = _Query(model_cls=None)  # 아래에서 바인딩


# Query에 모델 클래스 바인딩
User.query = _Query(User)

# app.py에서 User.fitness_score.desc()를 쓰고 있어서 이 표현을 “비슷하게” 지원
# (실제 사용은: User.query.order_by(User.fitness_score.desc()) 이므로,
#  User.fitness_score 를 _Field로 제공해야 함)
User.fitness_score = _Field("fitness_score")  # type: ignore


# =========================
# DynamoDB 저장/조회 구현
# =========================
def _user_pk(student_id: str) -> str:
    return f"USER#{student_id}"

def _user_sk() -> str:
    return "PROFILE"

def _put_user_item(user: User) -> None:
    item = {
        "pk": _user_pk(user.student_id),
        "sk": _user_sk(),
        "id": int(user.id),
        "student_id": user.student_id,
        "password_hash": user.password_hash,
        "name": user.name,
        "fitness_score": int(user.fitness_score),
        "security_question": user.security_question or "",
        "security_answer": user.security_answer or "",
    }
    _table.put_item(Item=item)

def _from_item(item: Dict[str, Any]) -> User:
    return User(
        id=int(item.get("id", 0)),
        student_id=item.get("student_id", ""),
        password_hash=item.get("password_hash", ""),
        name=item.get("name", ""),
        fitness_score=int(item.get("fitness_score", 0)),
        security_question=item.get("security_question", ""),
        security_answer=item.get("security_answer", ""),
    )

def _get_user_by_student_id(student_id: str) -> Optional[User]:
    try:
        resp = _table.get_item(Key={"pk": _user_pk(student_id), "sk": _user_sk()})
        item = resp.get("Item")
        return _from_item(item) if item else None
    except ClientError:
        return None

def _get_user_by_id(user_id: int) -> Optional[User]:
    # 소수 전제: scan해서 id 일치 찾기
    users = _scan_all_users()
    for u in users:
        if int(u.id) == int(user_id):
            return u
    return None

def _scan_all_users() -> List[User]:
    users: List[User] = []
    scan_kwargs = {
        "FilterExpression": "begins_with(#pk, :prefix) AND #sk = :sk",
        "ExpressionAttributeNames": {"#pk": "pk", "#sk": "sk"},
        "ExpressionAttributeValues": {":prefix": "USER#", ":sk": _user_sk()},
    }

    resp = _table.scan(**scan_kwargs)
    for item in resp.get("Items", []):
        users.append(_from_item(item))

    while "LastEvaluatedKey" in resp:
        resp = _table.scan(ExclusiveStartKey=resp["LastEvaluatedKey"], **scan_kwargs)
        for item in resp.get("Items", []):
            users.append(_from_item(item))

    return users


# =========================
# (선택) 신규 사용자 생성 헬퍼
# app.py에서 User(...)로 만들고 db.session.add/commit 하는 흐름을 유지해도 되지만,
# ID 자동 생성이 필요하면 아래 함수를 쓰는 게 더 안전함.
# =========================
def create_user(
    student_id: str,
    password_hash: str,
    name: str,
    security_question: str,
    security_answer: str,
) -> User:
    # int(user_id) 캐스팅을 유지하려고 "숫자" ID 생성
    new_id = int(time.time() * 1000)  # 밀리초 타임스탬프
    user = User(
        id=new_id,
        student_id=student_id,
        password_hash=password_hash,
        name=name,
        fitness_score=0,
        security_question=security_question or "",
        security_answer=security_answer or "",
    )
    return user
