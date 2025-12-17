from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    
    # [랭킹용] 헬스 점수
    fitness_score = db.Column(db.Integer, default=0)
    
    # [비밀번호 찾기용] 질문과 답변 (이게 있어야 합니다!)
    security_question = db.Column(db.String(200), nullable=False, default="") 
    security_answer = db.Column(db.String(200), nullable=False, default="")

    def __repr__(self):
        return f'<User {self.name}>'