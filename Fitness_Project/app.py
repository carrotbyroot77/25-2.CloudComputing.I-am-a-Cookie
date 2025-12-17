import os  # [필수] 운영체제 기능 사용
from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
from flask_bcrypt import Bcrypt
from flask_login import LoginManager, login_user, logout_user, login_required, current_user
from models import db, User

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret_key_1234'

# [수정됨] 데이터베이스 경로를 '절대 경로'로 설정 (서버에서 파일 위치 못 찾는 문제 해결)
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'home'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# 앱 시작 시 DB 생성
with app.app_context():
    db.create_all()

# 1. 메인 페이지 (랭킹 표시)
@app.route('/')
def home():
    # 헬스력(fitness_score) 높은 순서대로 상위 5명 가져오기
    top_users = User.query.order_by(User.fitness_score.desc()).limit(5).all()
    return render_template('index.html', top_users=top_users)

# 2. 회원가입
@app.route('/register', methods=['POST'])
def register():
    student_id = request.form['student_id']
    password = request.form['password']
    name = request.form['name']
    question = request.form['security_question']
    answer = request.form['security_answer']
    
    if User.query.filter_by(student_id=student_id).first():
        flash('이미 가입된 학번입니다.', 'danger')
        return redirect(url_for('home'))
    
    hashed_pw = bcrypt.generate_password_hash(password).decode('utf-8')
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

# 3. 로그인
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

# 4. 로그아웃
@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('로그아웃 되었습니다.', 'info')
    return redirect(url_for('home'))

# 5. 비밀번호 찾기 (본인 확인)
@app.route('/check_user_for_reset', methods=['POST'])
def check_user_for_reset():
    data = request.get_json()
    student_id = data.get('student_id')
    name = data.get('name')
    
    user = User.query.filter_by(student_id=student_id).first()
    
    if user and user.name == name:
        return jsonify({'status': 'success', 'question': user.security_question})
    else:
        return jsonify({'status': 'fail', 'message': '정보가 일치하지 않습니다.'})

# 6. 비밀번호 변경
@app.route('/reset_password', methods=['POST'])
def reset_password():
    student_id = request.form['student_id']
    answer = request.form['security_answer']
    new_password = request.form['new_password']
    
    user = User.query.filter_by(student_id=student_id).first()
    
    if user and user.security_answer == answer:
        hashed_pw = bcrypt.generate_password_hash(new_password).decode('utf-8')
        user.password_hash = hashed_pw
        db.session.commit()
        flash('비밀번호가 변경되었습니다. 로그인해주세요.', 'success')
    else:
        flash('보안 질문의 정답이 틀렸습니다.', 'danger')
        
    return redirect(url_for('home'))

# 7. 점수 저장 기능
@app.route('/submit_score', methods=['POST'])
@login_required
def submit_score():
    data = request.get_json()
    score = data.get('score')
    
    # 로그인한 사용자의 점수 업데이트
    current_user.fitness_score = score
    db.session.commit()
    
    return jsonify({'status': 'success', 'message': '랭킹에 반영되었습니다!'})

if __name__ == '__main__':
    app.run(debug=True)