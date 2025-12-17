from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key_1234'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'home'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return render_template('index.html')

# [수정됨] 회원가입 (질문/답변 저장 추가)
@app.route('/register', methods=['POST'])
def register():
    student_id = request.form['student_id']
    password = request.form['password']
    name = request.form['name']
    question = request.form['security_question'] # 추가됨
    answer = request.form['security_answer']     # 추가됨
    
    if User.query.filter_by(student_id=student_id).first():
        flash('이미 가입된 학번입니다.', 'danger')
        return redirect(url_for('home'))
    
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
    # DB에 질문과 답변도 같이 저장
    new_user = User(
        student_id=student_id, 
        password_hash=hashed_pw, 
        name=name,
        security_question=question,
        security_answer=answer
    )
    db.session.add(new_user)
    db.session.commit()
    
    flash('회원가입 성공! 로그인해주세요.', 'success')
    return redirect(url_for('home'))

@app.route('/login', methods=['POST'])
def login():
    student_id = request.form['student_id']
    password = request.form['password']
    
    user = User.query.filter_by(student_id=student_id).first()
    
    if user and bcrypt.check_password_hash(user.password_hash, password):
        login_user(user)
        flash(f'환영합니다, {user.name}님!', 'success')
    else:
        flash('학번 또는 비밀번호가 틀렸습니다.', 'danger')
        
    return redirect(url_for('home'))

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('로그아웃 되었습니다.', 'info')
    return redirect(url_for('home'))

# [추가됨] 비밀번호 찾기 1단계: 사용자 확인 및 질문 가져오기
@app.route('/check_user_for_reset', methods=['POST'])
def check_user_for_reset():
    data = request.get_json()
    student_id = data.get('student_id')
    name = data.get('name')
    
    user = User.query.filter_by(student_id=student_id).first()
    
    # 이름과 학번이 일치하면 질문을 돌려줌
    if user and user.name == name:
        return jsonify({'status': 'success', 'question': user.security_question})
    else:
        return jsonify({'status': 'fail', 'message': '일치하는 회원 정보가 없습니다.'})

# [추가됨] 비밀번호 찾기 2단계: 정답 확인 및 변경
@app.route('/reset_password', methods=['POST'])
def reset_password():
    student_id = request.form['student_id']
    answer = request.form['security_answer']
    new_password = request.form['new_password']
    
    user = User.query.filter_by(student_id=student_id).first()
    
    # 답변이 일치하는지 확인
    if user and user.security_answer == answer:
        hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password_hash = hashed_pw
        db.session.commit()
        flash('비밀번호가 성공적으로 변경되었습니다. 로그인해주세요.', 'success')
    else:
        flash('보안 질문의 답변이 틀렸습니다.', 'danger')
        
    return redirect(url_for('home'))

if __name__ == '__main__':
    app.run(debug=True)