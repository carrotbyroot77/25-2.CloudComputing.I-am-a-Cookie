// ⭐ 여기를 당신의 API Gateway URL로 변경하세요!
const API_ENDPOINT = 'https://j1q5osenkd.execute-api.ap-northeast-2.amazonaws.com/prod';
// 예시: https://abc123defg.execute-api.ap-northeast-2.amazonaws.com/prod

// 전역 변수로 설정 (fitness-calculator.js에서 접근 가능)
window.API_ENDPOINT = API_ENDPOINT;

// 현재 로그인한 사용자 정보
let currentUser = null;

// 페이지 로드 시 초기화
$(document).ready(function () {
    console.log('오-운-한 시스템 초기화...');

    // 스무스 스크롤
    $('.page-scroll a').bind('click', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 50
        }, 1250, 'easeInOutExpo');
        event.preventDefault();
    });

    // 시작하기 버튼 클릭 시 프로그램 섹션으로 스크롤
    $('.hero-content .btn-action').on('click', function (e) {
        e.preventDefault();
        $('html, body').animate({
            scrollTop: $('#classes').offset().top - 50
        }, 1000);
    });



    // 로그인 버튼 이벤트 - 강제로 바인딩
    bindLoginButton();

    // Enter 키로 로그인
    $('#login input').on('keypress', function (e) {
        if (e.which === 13) {
            handleLogin();
        }
    });

    // 네비게이션 로그인 링크 초기화
    initializeNavigation();

    // 로컬스토리지에서 사용자 정보 확인
    checkLoginStatus();

    // 랭킹 섹션 생성 및 데이터 로드
    createRankingSection();
    setTimeout(() => {
        loadRanking();
        loadRankingData();
    }, 500);

    // 페이지 완전 로드 후 네비게이션 상태 재확인
    setTimeout(() => {
        if (currentUser) {
            console.log('페이지 로드 완료 후 네비게이션 재확인');
            updateNavigationForLoggedInUser();
        }
    }, 500);
});

// 로그인 버튼 이벤트 바인딩
function bindLoginButton() {
    const $loginButton = $('#login .btn-action');
    console.log('로그인 버튼 바인딩:', $loginButton.length);

    $loginButton.off('click').on('click', function (e) {
        e.preventDefault();
        const buttonText = $(this).text();
        console.log('버튼 클릭됨:', buttonText);

        if (buttonText === '로그인') {
            handleLogin();
        } else if (buttonText === '로그아웃') {
            handleLogout();
        }
    });
}

// 네비게이션 초기화
function initializeNavigation() {
    console.log('네비게이션 초기화 시작');

    // 페이지 로드 시 기본 스크롤 이벤트 설정
    setTimeout(() => {
        resetNavigationToLogin();
    }, 100);
}

// 로그인 상태 확인
function checkLoginStatus() {
    const savedUser = localStorage.getItem('owoonhan_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateUIForLoggedInUser();
            console.log('로그인 상태 복원:', currentUser.name);
        } catch (e) {
            console.error('로그인 정보 복원 실패:', e);
            localStorage.removeItem('owoonhan_user');
        }
    }
}

// 로그인 처리
async function handleLogin() {
    const studentId = $('#login input[type="text"]').val().trim();
    const password = $('#login input[type="password"]').val().trim();

    if (!studentId || !password) {
        alert('학번과 비밀번호를 입력해주세요.');
        return;
    }

    // 로딩 표시
    const $btn = $('#login .btn-action');
    const originalText = $btn.text();
    $btn.text('로그인 중...').prop('disabled', true);

    try {
        console.log('로그인 시도:', studentId);

        const response = await fetch(`${API_ENDPOINT}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                studentId: studentId,
                password: password
            })
        });

        const data = await response.json();
        console.log('로그인 응답:', data);

        if (data.success) {
            currentUser = {
                studentId: studentId,
                name: data.data.name,
                department: data.data.department,
                totalHP: data.data.totalHP
            };

            // 로컬스토리지에 저장
            localStorage.setItem('owoonhan_user', JSON.stringify(currentUser));

            // 즉시 UI 업데이트 (강제 실행)
            console.log('로그인 성공 - 즉시 UI 업데이트 시작');
            updateUIForLoggedInUser();

            // 약간의 지연 후 한 번 더 확인 (DOM 업데이트 보장)
            setTimeout(() => {
                console.log('지연 후 UI 재확인');
                updateUIForLoggedInUser();
            }, 100);

            alert(`환영합니다, ${currentUser.name}님!`);

            // 입력 필드 초기화
            $('#login input').val('');
        } else {
            alert(data.message || '로그인에 실패했습니다.');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('서버 연결에 실패했습니다.\nAPI Gateway URL을 확인해주세요.');
    } finally {
        $btn.text(originalText).prop('disabled', false);
    }
}

// 로그인 후 UI 업데이트
function updateUIForLoggedInUser() {
    if (currentUser) {
        console.log('UI 업데이트 시작:', currentUser.name);

        // 로그인 섹션 UI 업데이트 - 강제로 각 요소 개별 처리
        const $loginSection = $('#login');
        const $title = $loginSection.find('.cta-inner h1');
        const $description = $loginSection.find('.cta-inner p');
        const $button = $loginSection.find('.btn-action');
        const $inputs = $loginSection.find('input');
        const $links = $loginSection.find('a').not('.btn-action');

        console.log('로그인 섹션 요소들:', {
            title: $title.length,
            description: $description.length,
            button: $button.length,
            inputs: $inputs.length,
            links: $links.length
        });

        // 제목 변경
        $title.text(`환영합니다, ${currentUser.name}님!`);

        // 설명 변경
        $description.html(
            `체력점수: <strong style="color: #f8e71c; font-size: 24px;">${currentUser.fitnessScore || 0}점</strong><br>` +
            `${currentUser.department} | ${currentUser.studentId}`
        );

        // 버튼 변경
        $button.text('로그아웃');

        // 입력 필드와 링크 숨기기
        $inputs.closest('.form-group').hide();
        $links.parent().hide();

        console.log('로그인 섹션 UI 업데이트 완료');
        console.log('현재 버튼 텍스트:', $button.text());

        // 네비게이션 메뉴 업데이트
        updateNavigationForLoggedInUser();
    }
}

// 네비게이션 메뉴를 로그인 상태로 업데이트
function updateNavigationForLoggedInUser() {
    // 강제로 네비게이션 HTML 교체
    const $navList = $('.navbar-nav');
    const currentNavHtml = $navList.html();

    if (currentNavHtml.includes('로그인') && !currentNavHtml.includes('로그아웃')) {
        console.log('네비게이션 HTML 직접 교체');
        const newNavHtml = currentNavHtml.replace(
            '<li><a class="page-scroll" href="#login">로그인</a></li>',
            '<li><a class="page-scroll" href="#logout" id="logout-link">로그아웃</a></li>'
        );
        $navList.html(newNavHtml);

        // 로그아웃 링크에 이벤트 바인딩
        $('#logout-link').on('click', function (e) {
            e.preventDefault();
            handleLogout();
        });

        console.log('네비게이션 업데이트 완료');
    }
}

// 로그아웃 처리
function handleLogout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        console.log('로그아웃 처리 시작');
        currentUser = null;
        localStorage.removeItem('owoonhan_user');

        // 로그인 섹션 UI 초기화 - 강제로 각 요소 개별 처리
        const $loginSection = $('#login');
        const $title = $loginSection.find('.cta-inner h1');
        const $description = $loginSection.find('.cta-inner p');
        const $button = $loginSection.find('.btn-action');
        const $inputs = $loginSection.find('input');
        const $links = $loginSection.find('a').not('.btn-action');

        // 제목 초기화
        $title.text('오-운-한 로그인');

        // 설명 초기화
        $description.html(
            '로그인하고 당신의 체력측정 결과를 서버에 저장하세요.<br class="hidden-xs">' +
            '한세대학교 학번으로 간편하게 이용할 수 있습니다.'
        );

        // 버튼 초기화
        $button.text('로그인');

        // 입력 필드와 링크 다시 보이기
        $inputs.closest('.form-group').show();
        $links.parent().show();
        $inputs.val('');

        console.log('로그인 섹션 UI 초기화 완료');
        console.log('현재 버튼 텍스트:', $button.text());

        // 네비게이션 메뉴 초기화
        resetNavigationToLogin();

        alert('로그아웃되었습니다.');
    }
}

// 네비게이션 메뉴를 로그인 상태로 초기화
function resetNavigationToLogin() {
    // 강제로 네비게이션 HTML 교체
    const $navList = $('.navbar-nav');
    const currentNavHtml = $navList.html();

    if (currentNavHtml.includes('로그아웃')) {
        console.log('네비게이션 HTML 로그인으로 복원');
        const newNavHtml = currentNavHtml.replace(
            '<li><a class="page-scroll" href="#logout" id="logout-link">로그아웃</a></li>',
            '<li><a class="page-scroll" href="#login">로그인</a></li>'
        );
        $navList.html(newNavHtml);

        // 기본 스크롤 이벤트 다시 바인딩
        $('.page-scroll a').off('click.scroll').on('click.scroll', function (event) {
            var $anchor = $(this);
            if ($anchor.attr('href').startsWith('#')) {
                $('html, body').stop().animate({
                    scrollTop: $($anchor.attr('href')).offset().top - 50
                }, 1250, 'easeInOutExpo');
                event.preventDefault();
            }
        });

        console.log('네비게이션 초기화 완료');
    }
}



// 숫자 애니메이션
function animateValue($element, start, end, duration) {
    let startTimestamp = null;
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const current = Math.floor(progress * (end - start) + start);
        $element.html(`${current} <span style="font-size: 30px; color: #f8e71c;">HP</span>`);
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

// 랭킹 데이터 로드
async function loadRanking() {
    try {
        console.log('랭킹 데이터 로드 중...');

        const response = await fetch(`${API_ENDPOINT}/ranking`);
        const data = await response.json();

        if (data.success && data.ranking.length > 0) {
            console.log(`랭킹 로드 완료: ${data.ranking.length}명`);
            updateRankingDisplay(data.ranking);
        } else {
            console.log('랭킹 데이터 없음');
        }
    } catch (error) {
        console.error('Ranking load error:', error);
        // 랭킹 로드 실패는 조용히 처리 (사용자에게 알리지 않음)
    }
}

// 새로운 랭킹 테이블 데이터 로드
async function loadRankingData() {
    console.log('랭킹 테이블 데이터 로드 시작');

    // 로딩 상태 표시
    showRankingState('loading');

    try {
        const response = await fetch(`${API_ENDPOINT}/ranking`);

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('랭킹 테이블 응답:', data);

        if (data.success && data.ranking && data.ranking.length > 0) {
            console.log(`랭킹 테이블 로드 완료: ${data.ranking.length}명`);
            displayRankingTable(data.ranking.slice(0, 10)); // TOP 10만 표시
        } else {
            console.log('랭킹 테이블 데이터 없음');
            showRankingState('empty');
        }

    } catch (error) {
        console.error('랭킹 테이블 로드 오류:', error);

        // 서버 연결 실패 시 로컬 더미 데이터 표시
        console.log('로컬 더미 랭킹 데이터 사용');
        displayLocalRankingData();
    }
}

// 랭킹 상태 표시 (loading, empty, error, table)
function showRankingState(state) {
    console.log('랭킹 상태 변경:', state);

    // 새로운 랭킹 섹션의 요소들만 선택
    const $rankingSection = $('#ranking');
    const $loading = $rankingSection.find('.ranking-loading');
    const $table = $rankingSection.find('.ranking-table');
    const $empty = $rankingSection.find('.ranking-empty');
    const $error = $rankingSection.find('.ranking-error');

    // 모든 상태 숨기기
    $loading.hide();
    $table.hide();
    $empty.hide();
    $error.hide();

    // 랭킹 섹션 자체는 항상 보이게 유지
    $rankingSection.show();

    switch (state) {
        case 'loading':
            $loading.show();
            console.log('로딩 상태 표시');
            break;
        case 'table':
            $table.show();
            console.log('테이블 상태 표시');
            break;
        case 'empty':
            $empty.show();
            console.log('빈 상태 표시');
            break;
        case 'error':
            $error.show();
            console.log('오류 상태 표시');
            break;
    }
}

// 체력점수에서 등급 계산
function getGradeFromScore(score) {
    if (score >= 90) return 'S급';
    else if (score >= 80) return 'A급';
    else if (score >= 70) return 'B급';
    else if (score >= 60) return 'C급';
    else if (score >= 50) return 'D급';
    else return 'F급';
}

// 등급별 색상 반환
function getGradeColor(grade) {
    switch (grade) {
        case 'S급': return 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
        case 'A급': return 'linear-gradient(135deg, #ff9f43, #ff7675)';
        case 'B급': return 'linear-gradient(135deg, #feca57, #ff9ff3)';
        case 'C급': return 'linear-gradient(135deg, #48dbfb, #0abde3)';
        case 'D급': return 'linear-gradient(135deg, #0abde3, #006ba6)';
        default: return 'linear-gradient(135deg, #778ca3, #5f6769)';
    }
}



// 랭킹 테이블 표시 (개선된 UI)
function displayRankingTable(ranking) {
    console.log('랭킹 테이블 표시:', ranking);

    // 랭킹 섹션이 존재하는지 확인하고 없으면 생성
    if ($('#ranking').length === 0) {
        createRankingSection();
    }

    // 새로운 랭킹 섹션의 tbody만 선택
    const $rankingSection = $('#ranking');
    const $tbody = $rankingSection.find('.ranking-tbody');

    if ($tbody.length === 0) {
        console.error('새로운 랭킹 테이블 tbody를 찾을 수 없습니다.');
        return;
    }

    console.log('랭킹 테이블 tbody 찾음:', $tbody.length);
    $tbody.empty();

    ranking.forEach((user, index) => {
        const rank = index + 1;
        let rankDisplay = rank;
        let rankClass = '';
        let rankBadge = '';

        // 상위 3등에 메달과 배지 추가
        if (rank === 1) {
            rankDisplay = '🥇';
            rankClass = 'rank-gold';
            rankBadge = '<span class="rank-badge gold-badge">1등</span>';
        } else if (rank === 2) {
            rankDisplay = '🥈';
            rankClass = 'rank-silver';
            rankBadge = '<span class="rank-badge silver-badge">2등</span>';
        } else if (rank === 3) {
            rankDisplay = '🥉';
            rankClass = 'rank-bronze';
            rankBadge = '<span class="rank-badge bronze-badge">3등</span>';
        } else {
            rankBadge = `<span class="rank-badge default-badge">${rank}등</span>`;
        }

        // 현재 로그인한 사용자 하이라이트
        const isCurrentUser = currentUser && currentUser.studentId === user.studentId;

        // 체력점수 기준 레벨 계산 (20점당 1레벨)
        const level = Math.floor((user.fitnessScore || 0) / 20) + 1;

        const rowHTML = `
            <tr class="ranking-row ${isCurrentUser ? 'current-user' : ''}" data-rank="${rank}">
                <td class="rank-cell">
                    <div class="rank-container">
                        <div class="rank-medal ${rankClass}">${rankDisplay}</div>
                        ${rankBadge}
                    </div>
                </td>
                <td class="user-info-cell">
                    <div class="user-info">
                        <div class="user-name">
                            ${user.name}${isCurrentUser ? ' <span class="me-indicator">(나)</span>' : ''}
                            <span class="user-level">Lv.${level}</span>
                        </div>
                        <div class="user-department">${user.department}</div>
                    </div>
                </td>
                <td class="fitness-cell" style="text-align: center; padding: 20px 15px; vertical-align: middle;">
                    <div class="fitness-score">
                        <div style="font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 8px;">
                            ${user.fitnessScore || 0}점
                        </div>
                        <div style="font-size: 14px; color: #95a5a6;">
                            ${getGradeFromScore(user.fitnessScore || 0)}
                        </div>
                    </div>
                </td>
            </tr>
        `;

        $tbody.append(rowHTML);
    });

    // 랭킹 테이블 스타일 추가
    addRankingTableStyles();
    showRankingState('table');
    console.log('랭킹 테이블 표시 완료');
}

// 로컬 더미 랭킹 데이터 (서버 연결 실패 시)
function displayLocalRankingData() {
    const dummyRanking = [
        { name: '서희우', department: '융합보안학과', fitnessScore: 95, studentId: '22001001' },
        { name: '이동현', department: '체육학과', fitnessScore: 92, studentId: '22002001' },
        { name: '이건희', department: '융합보안학과', fitnessScore: 88, studentId: '22001002' },
        { name: '정원영', department: '디자인학부', fitnessScore: 82, studentId: '25001001' },
        { name: '박지영', department: '경영학과', fitnessScore: 78, studentId: '24001001' },
        { name: '김민수', department: '컴퓨터공학과', fitnessScore: 75, studentId: '23001001' },
        { name: '장민호', department: '기계공학과', fitnessScore: 71, studentId: '24002001' },
        { name: '최수진', department: '간호학과', fitnessScore: 68, studentId: '23002001' },
        { name: '윤서연', department: '영어영문학과', fitnessScore: 65, studentId: '25002001' },
        { name: '한지우', department: '건축학과', fitnessScore: 58, studentId: '23003001' }
    ];

    // 현재 사용자가 로그인되어 있다면 랭킹에 추가
    if (currentUser) {
        const userInRanking = dummyRanking.find(user => user.studentId === currentUser.studentId);
        if (!userInRanking) {
            dummyRanking.push({
                name: currentUser.name,
                department: currentUser.department,
                fitnessScore: currentUser.fitnessScore || 0,
                studentId: currentUser.studentId
            });
        } else {
            // 기존 사용자 정보 업데이트
            userInRanking.fitnessScore = currentUser.fitnessScore || 0;
        }

        // 체력점수 기준으로 정렬
        dummyRanking.sort((a, b) => (b.fitnessScore || 0) - (a.fitnessScore || 0));
    }

    console.log('로컬 더미 랭킹 표시');
    displayRankingTable(dummyRanking.slice(0, 10));
}

// 랭킹 표시 업데이트 (기존 리뷰 섹션용) - 비활성화
function updateRankingDisplay(ranking) {
    console.log('기존 리뷰 섹션 랭킹 표시는 비활성화됨 - 새로운 랭킹 테이블 사용');
    // 기존 리뷰 섹션의 랭킹 표시는 더 이상 사용하지 않음
    // 모든 랭킹은 새로운 랭킹 테이블에서만 표시
}

// 부위별 운동 영상 팝업
function showWorkoutVideo(bodyPart) {
    const videos = {
        'shoulder': 'https://www.youtube.com/watch?v=qEwKCR5JCog',
        'chest': 'https://www.youtube.com/watch?v=IODxDxX7oi4',
        'abs': 'https://www.youtube.com/watch?v=1919eTCoESo',
        'arms': 'https://www.youtube.com/watch?v=kwG2ipFRgfo',
        'back': 'https://www.youtube.com/watch?v=eE7dzZ6xN_g',
        'legs': 'https://www.youtube.com/watch?v=IB3EGw1QOjk'
    };

    const videoUrl = videos[bodyPart];
    if (videoUrl) {
        window.open(videoUrl, '_blank', 'width=1000,height=700');
    } else {
        alert('해당 부위의 운동 영상이 준비 중입니다.');
    }
}

// 체력측정 후 랭킹 새로고침
function refreshRankingAfterFitnessTest() {
    console.log('체력측정 후 랭킹 새로고침 시작');

    // 로컬 랭킹 데이터 업데이트 (즉시 반영)
    if (currentUser) {
        updateLocalRankingWithCurrentUser();
    }

    // 서버 랭킹 데이터 새로고침 (약간의 지연 후)
    setTimeout(() => {
        loadRanking();
        loadRankingData();
    }, 500);
}

// 현재 사용자 정보로 로컬 랭킹 업데이트
function updateLocalRankingWithCurrentUser() {
    if (!currentUser) return;

    console.log('로컬 랭킹에 현재 사용자 정보 반영');

    // 더미 데이터에 현재 사용자 추가/업데이트
    const dummyRanking = [
        { name: '서희우', department: '융합보안학과', fitnessScore: 95, studentId: '22001001' },
        { name: '이동현', department: '체육학과', fitnessScore: 92, studentId: '22002001' },
        { name: '이건희', department: '융합보안학과', fitnessScore: 88, studentId: '22001002' },
        { name: '정원영', department: '디자인학부', fitnessScore: 82, studentId: '25001001' },
        { name: '박지영', department: '경영학과', fitnessScore: 78, studentId: '24001001' },
        { name: '김민수', department: '컴퓨터공학과', fitnessScore: 75, studentId: '23001001' },
        { name: '장민호', department: '기계공학과', fitnessScore: 71, studentId: '24002001' },
        { name: '최수진', department: '간호학과', fitnessScore: 68, studentId: '23002001' },
        { name: '윤서연', department: '영어영문학과', fitnessScore: 65, studentId: '25002001' },
        { name: '한지우', department: '건축학과', fitnessScore: 58, studentId: '23003001' }
    ];

    // 현재 사용자 정보 추가/업데이트
    const userIndex = dummyRanking.findIndex(user => user.studentId === currentUser.studentId);
    if (userIndex !== -1) {
        dummyRanking[userIndex].fitnessScore = currentUser.fitnessScore || 0;
    } else {
        dummyRanking.push({
            name: currentUser.name,
            department: currentUser.department,
            fitnessScore: currentUser.fitnessScore || 0,
            studentId: currentUser.studentId
        });
    }

    // 체력점수 기준으로 정렬
    dummyRanking.sort((a, b) => (b.fitnessScore || 0) - (a.fitnessScore || 0));

    // 즉시 랭킹 테이블 업데이트
    displayRankingTable(dummyRanking.slice(0, 10));
}

// 랭킹 테이블 스타일 추가
function addRankingTableStyles() {
    // 이미 스타일이 추가되었는지 확인
    if ($('#ranking-table-styles').length > 0) return;

    const styles = `
        <style id="ranking-table-styles">
            .ranking-row {
                transition: all 0.3s ease;
                border-bottom: 1px solid #eee;
            }
            
            .ranking-row:hover {
                background-color: #f8f9fa !important;
                transform: translateY(-2px);
                box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            
            .ranking-row.current-user {
                background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%) !important;
                border: 2px solid #f8e71c;
                font-weight: bold;
            }
            
            .rank-cell {
                text-align: center;
                padding: 20px 15px;
                vertical-align: middle;
            }
            
            .rank-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .rank-medal {
                font-size: 24px;
                line-height: 1;
            }
            
            .rank-badge {
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 11px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .gold-badge {
                background: linear-gradient(135deg, #ffd700, #ffed4e);
                color: #8b6914;
                box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
            }
            
            .silver-badge {
                background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
                color: #666;
                box-shadow: 0 2px 4px rgba(192, 192, 192, 0.3);
            }
            
            .bronze-badge {
                background: linear-gradient(135deg, #cd7f32, #daa520);
                color: #5d4e37;
                box-shadow: 0 2px 4px rgba(205, 127, 50, 0.3);
            }
            
            .default-badge {
                background: linear-gradient(135deg, #6c757d, #868e96);
                color: white;
            }
            
            .user-info-cell {
                padding: 20px 15px;
                vertical-align: middle;
            }
            
            .user-info {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .user-name {
                font-size: 16px;
                font-weight: 600;
                color: #2c3e50;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .user-level {
                background: linear-gradient(135deg, #667eea, #764ba2);
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 11px;
                font-weight: bold;
            }
            
            .me-indicator {
                background: #f8e71c;
                color: #2c3e50;
                padding: 2px 6px;
                border-radius: 8px;
                font-size: 11px;
                font-weight: bold;
            }
            
            .user-department {
                font-size: 13px;
                color: #7f8c8d;
                font-weight: 500;
            }
            
            .hp-cell {
                padding: 20px 15px;
                vertical-align: middle;
                text-align: center;
            }
            
            .hp-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 8px;
            }
            
            .hp-value {
                font-size: 18px;
                font-weight: bold;
                color: #f8e71c;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
            }
            
            .hp-progress-bar {
                width: 100px;
                height: 8px;
                background: #ecf0f1;
                border-radius: 4px;
                overflow: hidden;
                box-shadow: inset 0 1px 3px rgba(0,0,0,0.1);
            }
            
            .hp-progress {
                height: 100%;
                background: linear-gradient(90deg, #f8e71c, #f39c12);
                border-radius: 4px;
                transition: width 0.5s ease;
                box-shadow: 0 1px 2px rgba(248, 231, 28, 0.3);
            }
            
            .hp-level-info {
                font-size: 10px;
                color: #95a5a6;
                font-weight: 500;
            }
            
            /* 테이블 전체 스타일 개선 */
            .ranking-table table {
                border-collapse: separate;
                border-spacing: 0;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            }
            
            .ranking-table thead th {
                background: linear-gradient(135deg, #2c3e50, #34495e);
                color: white;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 20px 15px;
                border: none;
            }
            
            .ranking-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            /* 반응형 디자인 */
            @media (max-width: 768px) {
                .rank-cell, .user-info-cell, .hp-cell {
                    padding: 15px 10px;
                }
                
                .user-name {
                    font-size: 14px;
                }
                
                .hp-value {
                    font-size: 16px;
                }
                
                .hp-progress-bar {
                    width: 80px;
                }
            }
        </style>
    `;

    $('head').append(styles);
}

// 기존 랭킹 테이블을 새로운 버전으로 완전 교체
function replaceOldRankingWithNew() {
    console.log('기존 랭킹 테이블을 새로운 버전으로 교체');

    // 기존 랭킹 섹션 찾기 및 제거
    const $existingRanking = $('#ranking');
    if ($existingRanking.length > 0) {
        console.log('기존 랭킹 섹션 발견 - 완전 제거');
        $existingRanking.remove();
    }

    // 새로운 랭킹 섹션 생성
    createRankingSection();
}

// 랭킹 섹션 즉시 표시
function showRankingSection() {
    console.log('랭킹 섹션 즉시 표시');

    // 랭킹 섹션이 없다면 동적으로 생성
    if ($('#ranking').length === 0) {
        createRankingSection();
    }

    // 랭킹 섹션 표시
    const $rankingSection = $('#ranking');
    $rankingSection.show();

    // 초기 로딩 상태 표시
    showRankingState('loading');
}

// 랭킹 섹션 동적 생성 (완전히 새로운 버전)
function createRankingSection() {
    console.log('새로운 랭킹 섹션 생성');

    const rankingSectionHTML = `
        <div id="ranking" class="ranking-section text-center" style="background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); padding: 80px 0; display: block !important;">
            <div class="container">
                <div class="row">
                    <div class="col-md-12">
                        <div class="ranking-intro">
                            <h1 class="wow fadeInUp" data-wow-delay="0s" style="color: #2c3e50; font-size: 42px; font-weight: 700; margin-bottom: 20px;">
                                🏆 한세 체력 랭킹 TOP 10
                            </h1>
                            <p class="wow fadeInUp" data-wow-delay="0.2s" style="font-size: 18px; color: #7f8c8d; margin-bottom: 50px;"> 
                                한세대학교 학생들의 체력 순위를 확인해보세요! <br class="hidden-xs">
                                상위권에 도전해보세요! 💪
                            </p>
                        </div>
                        
                        <div class="col-md-10 col-md-offset-1">
                            <div class="ranking-table-container wow fadeInUp" data-wow-delay="0.4s" style="background: #ffffff; padding: 40px; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); min-height: 500px;">
                                
                                <!-- 로딩 상태 -->
                                <div class="ranking-loading" style="display: none; padding: 60px 0;">
                                    <div style="font-size: 48px; margin-bottom: 20px;">⏳</div>
                                    <h3 style="color: #888; margin: 0; font-size: 24px;">랭킹 데이터를 불러오는 중...</h3>
                                    <div style="margin-top: 20px;">
                                        <div class="loading-spinner" style="display: inline-block; width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #f8e71c; border-radius: 50%; animation: spin 1s linear infinite;"></div>
                                    </div>
                                </div>
                                
                                <!-- 랭킹 테이블 -->
                                <div class="ranking-table" style="display: none;">
                                    <div class="table-responsive">
                                        <table class="table" style="margin-bottom: 0; border-radius: 15px; overflow: hidden;">
                                            <thead>
                                                <tr>
                                                    <th style="text-align: center; width: 20%; padding: 25px 15px;">순위</th>
                                                    <th style="text-align: left; width: 50%; padding: 25px 15px;">학생 정보</th>
                                                    <th style="text-align: center; width: 30%; padding: 25px 15px;">체력점수</th>
                                                </tr>
                                            </thead>
                                            <tbody class="ranking-tbody">
                                                <!-- 랭킹 데이터가 여기에 동적으로 추가됩니다 -->
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                                
                                <!-- 데이터 없음 상태 -->
                                <div class="ranking-empty" style="display: none; padding: 60px 0;">
                                    <div style="font-size: 48px; margin-bottom: 20px;">📊</div>
                                    <h3 style="color: #888; margin: 0 0 15px 0; font-size: 24px;">아직 랭킹 데이터가 없습니다</h3>
                                    <p style="color: #aaa; font-size: 16px;">첫 번째 랭킹 등록자가 되어보세요!</p>
                                    <button class="btn btn-primary" onclick="loadRankingData()" style="margin-top: 20px; padding: 12px 30px; font-size: 16px;">
                                        다시 시도
                                    </button>
                                </div>
                                
                                <!-- 오류 상태 -->
                                <div class="ranking-error" style="display: none; padding: 60px 0;">
                                    <div style="font-size: 48px; margin-bottom: 20px;">⚠️</div>
                                    <h3 style="color: #dc3545; margin: 0 0 15px 0; font-size: 24px;">랭킹 데이터를 불러올 수 없습니다</h3>
                                    <p style="color: #aaa; font-size: 16px;">잠시 후 다시 시도해주세요.</p>
                                    <button class="btn btn-primary" onclick="loadRankingData()" style="margin-top: 20px; padding: 12px 30px; font-size: 16px;">
                                        다시 시도
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
            
            #ranking {
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            }
            
            .ranking-section {
                position: relative;
                z-index: 10;
            }
        </style>
    `;

    // 체력 측정 섹션(#fitness) 바로 앞에 삽입
    const $fitnessSection = $('#fitness');
    if ($fitnessSection.length > 0) {
        console.log('체력 측정 섹션 앞에 랭킹 섹션 삽입');
        $fitnessSection.before(rankingSectionHTML);
    } else {
        // fitness 섹션이 없다면 body에 추가
        console.log('body에 랭킹 섹션 추가');
        $('body').append(rankingSectionHTML);
    }

    // 랭킹 테이블 스타일 즉시 적용
    addRankingTableStyles();
}

console.log('🏋️ 오-운-한 스크립트 로드 완료!');