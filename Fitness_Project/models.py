from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin

db = SQLAlchemy()

class User(UserMixin, db.Model):
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    name = db.Column(db.String(50), nullable=False)
    fitness_score = db.Column(db.Integer, default=0)
    
    # 회원가입단계/ 추후에 비밀번호 찾기를 위한 보안 질문과 답변을 저장할 컬럼
    security_question = db.Column(db.String(200), nullable=False)
    security_answer = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.name}>'