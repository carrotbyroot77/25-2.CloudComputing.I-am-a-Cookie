$(document).ready(function () {
    $('#fitnessForm').on('submit', function (e) {
        e.preventDefault();
        calculateFitness();
    });
});

function calculateFitness() {
    // 입력값 가져오기
    const age = parseInt($('#age').val());
    const gender = $('#gender').val();
    const height = parseInt($('#height').val());
    const weight = parseInt($('#weight').val());
    const pushups = parseInt($('#pushups').val());
    const situps = parseInt($('#situps').val());
    const plank = parseInt($('#plank').val());
    const running = parseFloat($('#running').val());

    // BMI 계산
    const bmi = weight / ((height / 100) ** 2);

    // 각 운동별 점수 계산
    const pushupsScore = calculatePushupsScore(pushups, age, gender);
    const situpsScore = calculateSitupsScore(situps, age, gender);
    const plankScore = calculatePlankScore(plank, age, gender);
    const runningScore = calculateRunningScore(running, age, gender);

    // 총 헬스력 점수 (100점 만점)
    const totalScore = Math.round((pushupsScore + situpsScore + plankScore + runningScore) / 4);

    // 등급 결정
    const grade = getGrade(totalScore);
    const gradeColor = getGradeColor(grade);

    // 결과 표시
    displayResult(bmi, totalScore, grade, gradeColor, {
        pushups: pushupsScore,
        situps: situpsScore,
        plank: plankScore,
        running: runningScore
    });
}

function calculatePushupsScore(count, age, gender) {
    let baseScore = 0;

    if (gender === 'male') {
        if (age <= 25) {
            baseScore = Math.min(count * 2, 100);
        } else if (age <= 35) {
            baseScore = Math.min(count * 2.2, 100);
        } else if (age <= 45) {
            baseScore = Math.min(count * 2.5, 100);
        } else {
            baseScore = Math.min(count * 3, 100);
        }
    } else {
        if (age <= 25) {
            baseScore = Math.min(count * 2.5, 100);
        } else if (age <= 35) {
            baseScore = Math.min(count * 2.8, 100);
        } else if (age <= 45) {
            baseScore = Math.min(count * 3.2, 100);
        } else {
            baseScore = Math.min(count * 3.5, 100);
        }
    }

    return Math.min(baseScore, 100);
}

function calculateSitupsScore(count, age, gender) {
    let baseScore = 0;

    if (gender === 'male') {
        if (age <= 25) {
            baseScore = Math.min(count * 1.8, 100);
        } else if (age <= 35) {
            baseScore = Math.min(count * 2, 100);
        } else if (age <= 45) {
            baseScore = Math.min(count * 2.3, 100);
        } else {
            baseScore = Math.min(count * 2.7, 100);
        }
    } else {
        if (age <= 25) {
            baseScore = Math.min(count * 2.2, 100);
        } else if (age <= 35) {
            baseScore = Math.min(count * 2.5, 100);
        } else if (age <= 45) {
            baseScore = Math.min(count * 2.8, 100);
        } else {
            baseScore = Math.min(count * 3.2, 100);
        }
    }

    return Math.min(baseScore, 100);
}

function calculatePlankScore(seconds, age, gender) {
    let baseScore = 0;

    if (gender === 'male') {
        if (seconds >= 120) baseScore = 100;
        else if (seconds >= 90) baseScore = 85;
        else if (seconds >= 60) baseScore = 70;
        else if (seconds >= 30) baseScore = 50;
        else baseScore = 25;
    } else {
        if (seconds >= 90) baseScore = 100;
        else if (seconds >= 60) baseScore = 85;
        else if (seconds >= 45) baseScore = 70;
        else if (seconds >= 25) baseScore = 50;
        else baseScore = 25;
    }

    // 나이 보정
    if (age > 40) baseScore += 10;
    if (age > 50) baseScore += 15;

    return Math.min(baseScore, 100);
}

function calculateRunningScore(minutes, age, gender) {
    let baseScore = 0;

    if (gender === 'male') {
        // 남성 기준: 4분 100점 만점
        if (minutes <= 4) baseScore = 100;
        else if (minutes <= 5) baseScore = 90;
        else if (minutes <= 6) baseScore = 80;
        else if (minutes <= 7) baseScore = 70;
        else if (minutes <= 8) baseScore = 60;
        else if (minutes <= 9) baseScore = 50;
        else if (minutes <= 10) baseScore = 40;
        else if (minutes <= 12) baseScore = 30;
        else if (minutes <= 15) baseScore = 20;
        else baseScore = 10;
    } else {
        // 여성 기준: 5분 100점 만점 (남성보다 1분 여유)
        if (minutes <= 5) baseScore = 100;
        else if (minutes <= 6) baseScore = 90;
        else if (minutes <= 7) baseScore = 80;
        else if (minutes <= 8) baseScore = 70;
        else if (minutes <= 9) baseScore = 60;
        else if (minutes <= 10) baseScore = 50;
        else if (minutes <= 11) baseScore = 40;
        else if (minutes <= 13) baseScore = 30;
        else if (minutes <= 16) baseScore = 20;
        else baseScore = 10;
    }

    // 나이 보정
    if (age > 35) baseScore += 5;
    if (age > 45) baseScore += 10;
    if (age > 55) baseScore += 15;

    return Math.min(baseScore, 100);
}

function getGrade(score) {
    if (score >= 90) return 'S급';
    else if (score >= 80) return 'A급';
    else if (score >= 70) return 'B급';
    else if (score >= 60) return 'C급';
    else if (score >= 50) return 'D급';
    else return 'F급';
}

function getGradeColor(grade) {
    switch (grade) {
        case 'S급': return '#ff6b6b';
        case 'A급': return '#ff9f43';
        case 'B급': return '#feca57';
        case 'C급': return '#48dbfb';
        case 'D급': return '#0abde3';
        default: return '#778ca3';
    }
}

function getBMIStatus(bmi) {
    if (bmi < 18.5) return { status: '저체중', color: '#74b9ff' };
    else if (bmi < 23) return { status: '정상', color: '#00b894' };
    else if (bmi < 25) return { status: '과체중', color: '#fdcb6e' };
    else return { status: '비만', color: '#e17055' };
}

function displayResult(bmi, totalScore, grade, gradeColor, scores) {
    const bmiStatus = getBMIStatus(bmi);



    const resultHTML = `
        <div class="row text-center">
            <div class="col-md-6 mb-3">
                <div class="p-3 rounded" style="background-color: ${gradeColor}20; border: 2px solid ${gradeColor};">
                    <h3 style="color: ${gradeColor}; margin: 0;">${grade}</h3>
                    <p class="mb-0 fw-bold">총 점수: ${totalScore}점</p>
                </div>
            </div>
            <div class="col-md-6 mb-3">
                <div class="p-3 rounded" style="background-color: ${bmiStatus.color}20; border: 2px solid ${bmiStatus.color};">
                    <h5 style="color: ${bmiStatus.color}; margin: 0;">BMI: ${bmi.toFixed(1)}</h5>
                    <p class="mb-0 fw-bold">${bmiStatus.status}</p>
                </div>
            </div>
        </div>
        
        <div class="row mt-3 mb-3">
            <div class="col-12">
                <div class="p-3 rounded text-center" style="background: linear-gradient(135deg, #f8e71c, #f39c12); color: #2c3e50;">
                    <h4 style="margin: 0; font-weight: bold;">🎉 체력 측정 완료!</h4>
                    <p class="mb-0">랭킹에 반영되었습니다</p>
                </div>
            </div>
        </div>
        
        <div class="row mt-3">
            <div class="col-md-6 mb-2">
                <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <span>� 팔굽크혀펴기</span>
                    <span class="fw-bold">${scores.pushups}점</span>
                </div>
            </div>
            <div class="col-md-6 mb-2">
                <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <span>🏃‍♂️ 윗몸일으키기</span>
                    <span class="fw-bold">${scores.situps}점</span>
                </div>
            </div>
            <div class="col-md-6 mb-2">
                <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <span>🔥 플랭크</span>
                    <span class="fw-bold">${scores.plank}점</span>
                </div>
            </div>
            <div class="col-md-6 mb-2">
                <div class="d-flex justify-content-between align-items-center p-2 bg-light rounded">
                    <span>🏃 달리기</span>
                    <span class="fw-bold">${scores.running}점</span>
                </div>
            </div>
        </div>
        
        <div class="mt-4 p-3 bg-info bg-opacity-10 rounded">
            <h6 class="text-info mb-2">💡 개선 제안</h6>
            <p class="mb-0 small">${getAdvice(totalScore, scores)}</p>
        </div>
    `;

    $('#resultContent').html(resultHTML);
    $('#result').slideDown();

    // 결과로 스크롤
    $('html, body').animate({
        scrollTop: $('#result').offset().top - 100
    }, 500);

    // 체력 측정 결과를 저장 (로그인한 경우)
    saveFitnessResult(totalScore, grade);
}

function getAdvice(totalScore, scores) {
    let advice = [];

    if (scores.pushups < 70) {
        advice.push("팔굽혀펴기 연습을 늘려보세요");
    }
    if (scores.situps < 70) {
        advice.push("복근 운동을 강화해보세요");
    }
    if (scores.plank < 70) {
        advice.push("코어 근력 향상이 필요합니다");
    }
    if (scores.running < 70) {
        advice.push("유산소 운동을 늘려보세요");
    }

    if (advice.length === 0) {
        return "훌륭한 체력입니다! 현재 수준을 유지하세요. 🎉";
    } else if (totalScore >= 70) {
        return advice.join(", ") + "를 통해 더욱 완벽한 체력을 만들어보세요!";
    } else {
        return "꾸준한 운동으로 " + advice.join(", ") + "를 개선해보세요. 화이팅! 💪";
    }
}

// 체력 측정 결과를 저장
async function saveFitnessResult(totalScore, grade) {
    // custom.js의 currentUser 변수 확인
    if (typeof currentUser === 'undefined' || !currentUser) {
        console.log('로그인하지 않은 상태 - 체력 측정 결과 저장 불가');

        // 로그인 안내 메시지 추가
        setTimeout(() => {
            const loginNotice = `
                <div class="mt-3 p-3 rounded" style="background-color: #fff3cd; border: 2px solid #f8e71c;">
                    <h6 style="color: #856404; margin: 0;">⚠️ 로그인하면 체력 측정 결과가 랭킹에 저장됩니다!</h6>
                    <p class="mb-0 small" style="color: #856404;">로그인 후 체력 측정을 다시 해보세요.</p>
                </div>
            `;
            $('#resultContent').append(loginNotice);
        }, 500);
        return;
    }

    console.log(`체력 측정 결과 저장: ${grade} (${totalScore}점)`);

    try {
        // custom.js의 API_ENDPOINT 사용
        const API_ENDPOINT = window.API_ENDPOINT || 'https://j1q5osenkd.execute-api.ap-northeast-2.amazonaws.com/prod';

        const requestBody = {
            studentId: currentUser.studentId,
            fitnessScore: totalScore,
            fitnessGrade: grade,
            type: 'fitness_test'
        };

        console.log('체력 측정 결과 서버 전송:', requestBody);

        const response = await fetch(`${API_ENDPOINT}/fitness-result`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('체력 측정 결과 저장 성공:', data);

            // 현재 사용자 체력점수 업데이트
            currentUser.fitnessScore = totalScore;
            localStorage.setItem('owoonhan_user', JSON.stringify(currentUser));

            // custom.js의 UI 업데이트 함수 호출
            if (typeof updateUIForLoggedInUser === 'function') {
                updateUIForLoggedInUser();
            }

            // 성공 알림
            setTimeout(() => {
                alert(`🎉 체력 측정 완료!\n\n등급: ${grade} (${totalScore}점)\n\n랭킹에 반영되었습니다!`);

                // 랭킹 새로고침
                if (typeof refreshRankingAfterFitnessTest === 'function') {
                    refreshRankingAfterFitnessTest();
                }
            }, 1000);

        } else {
            throw new Error('서버 저장 실패');
        }

    } catch (error) {
        console.error('체력 측정 결과 저장 오류:', error);

        // 서버 실패 시 로컬에만 저장
        currentUser.fitnessScore = totalScore;
        localStorage.setItem('owoonhan_user', JSON.stringify(currentUser));

        if (typeof updateUIForLoggedInUser === 'function') {
            updateUIForLoggedInUser();
        }

        setTimeout(() => {
            alert(`🎉 체력 측정 완료! (로컬 저장)\n\n등급: ${grade} (${totalScore}점)\n\n랭킹에 반영되었습니다!\n\n※ 서버 연결 후 동기화됩니다.`);

            // 로컬 랭킹 업데이트
            if (typeof updateLocalRankingWithCurrentUser === 'function') {
                updateLocalRankingWithCurrentUser();
            }
        }, 1000);
    }
}