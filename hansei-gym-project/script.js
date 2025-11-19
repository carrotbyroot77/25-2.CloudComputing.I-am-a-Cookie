// 인체 부위별 데이터
const bodyParts = {
  shoulder: {
    name: "어깨",
    desc: "어깨(삼각근)는 상체의 실루엣과 안정성을 담당하는 부위로, 바른 자세와 상·하체 연결에 중요한 역할을 합니다.",
    exercises: [
      {
        name: "덤벨 숄더프레스",
        level: "초급~중급",
        desc: "기본적인 어깨 강화 운동으로, 앉아서 덤벨을 위로 밀어 올립니다.",
        url: "https://www.youtube.com/results?search_query=%EB%8D%A4%EB%B2%A8+%EC%88%84%EB%8D%94%ED%94%84%EB%A0%88%EC%8A%A4"
      },
      {
        name: "사이드 레터럴 레이즈",
        level: "중급",
        desc: "덤벨을 옆으로 들어 올려 어깨 측면을 집중적으로 강화합니다.",
        url: "https://www.youtube.com/results?search_query=%EC%82%AC%EC%9D%B4%EB%93%9C+%EB%A0%88%ED%84%B0%EB%9F%AC+%EB%A0%88%EC%9D%B4%EC%A6%88"
      }
    ]
  },
  chest: {
    name: "가슴",
    desc: "가슴(대흉근)은 상체 전면의 큰 근육으로, 밀어내는 힘과 상체 안정성에 중요한 근육입니다.",
    exercises: [
      {
        name: "벤치프레스",
        level: "중급",
        desc: "바벨을 이용해 가슴과 삼두를 동시에 강화하는 대표적인 가슴 운동입니다.",
        url: "https://www.youtube.com/results?search_query=%EB%B2%A4%EC%B9%98%ED%94%84%EB%A0%88%EC%8A%A4"
      },
      {
        name: "푸시업",
        level: "초급~중급",
        desc: "기구 없이도 어디서나 할 수 있는 전신 가슴 운동으로, 코어 안정에도 도움이 됩니다.",
        url: "https://www.youtube.com/results?search_query=%ED%91%B8%EC%8B%9C%EC%97%85+%EC%9E%98%ED%95%98%EB%8A%94+%EB%B2%95"
      }
    ]
  },
  back: {
    name: "등",
    desc: "등 근육은 자세 유지, 척추 보호, 당기는 동작에 관여하며, 상체 밸런스를 잡아 줍니다.",
    exercises: [
      {
        name: "랫 풀다운",
        level: "초급~중급",
        desc: "머신을 이용해 등을 넓게 만들어 주는 대표적인 등 운동입니다.",
        url: "https://www.youtube.com/results?search_query=%EB%9E%AB%ED%92%80%EB%8B%A4%EC%9A%B4"
      },
      {
        name: "시티드 로우",
        level: "중급",
        desc: "앉은 자세에서 케이블을 당겨 등 중앙부를 자극하는 운동입니다.",
        url: "https://www.youtube.com/results?search_query=%EC%8B%9C%ED%8B%B0%EB%93%9C+%EB%A1%9C%EC%9A%B0"
      }
    ]
  },
  abs: {
    name: "복근",
    desc: "복근은 코어 중심부로, 허리 보호와 몸통 안정성, 자세 유지에 중요한 역할을 합니다.",
    exercises: [
      {
        name: "크런치",
        level: "초급",
        desc: "상체를 살짝 들어 올려 복부를 수축하는 기본 복근 운동입니다.",
        url: "https://www.youtube.com/results?search_query=%ED%81%AC%EB%9F%B0%EC%B9%98+%EB%B3%B5%EA%B7%BC"
      },
      {
        name: "레그 레이즈",
        level: "중급",
        desc: "다리를 들어 올리는 동작으로, 하복부를 집중적으로 자극합니다.",
        url: "https://www.youtube.com/results?search_query=%EB%A0%88%EA%B7%B8%EB%A0%88%EC%9D%B4%EC%A6%88+%EB%B3%B5%EA%B7%BC"
      }
    ]
  },
  legs: {
    name: "하체",
    desc: "하체(대퇴사두근, 햄스트링, 둔근 등)는 몸에서 가장 큰 근육들이 모여 있어 기초 체력과 전신 대사량에 큰 영향을 줍니다.",
    exercises: [
      {
        name: "스쿼트",
        level: "초급~고급",
        desc: "전신을 쓰는 대표적인 하체 운동으로, 엉덩이와 허벅지를 고르게 발달시킵니다.",
        url: "https://www.youtube.com/results?search_query=%EC%8A%A4%EC%BF%BC%ED%8A%B8+%EC%9E%98%ED%95%98%EB%8A%94+%EB%B2%95"
      },
      {
        name: "레그프레스 머신",
        level: "초급~중급",
        desc: "무게 조절이 쉬워, 초보자도 비교적 안전하게 하체를 강화할 수 있는 머신 운동입니다.",
        url: "https://www.youtube.com/results?search_query=%EB%A0%88%EA%B7%B8%ED%94%84%EB%A0%88%EC%8A%A4"
      }
    ]
  }
};

// 부위 정보 표시 영역
const partInfoEl = document.getElementById("part-info");
const bodyPartItems = document.querySelectorAll(".body-part-item");
const hotspots = document.querySelectorAll(".hotspot");

function clearActive() {
  bodyPartItems.forEach((item) => item.classList.remove("active"));
}

function setActivePart(partKey) {
  clearActive();
  const activeItem = document.querySelector(`.body-part-item[data-part="${partKey}"]`);
  if (activeItem) {
    activeItem.classList.add("active");
  }
}

// 부위 정보 렌더링
function showBodyPart(partKey) {
  const data = bodyParts[partKey];
  if (!data) return;

  partInfoEl.classList.remove("empty");
  partInfoEl.innerHTML = "";

  const title = document.createElement("h3");
  title.className = "part-title";
  title.textContent = data.name;

  const desc = document.createElement("p");
  desc.className = "part-desc";
  desc.textContent = data.desc;

  const listTitle = document.createElement("p");
  listTitle.style.fontSize = "13px";
  listTitle.style.fontWeight = "600";
  listTitle.style.marginBottom = "4px";
  listTitle.textContent = "추천 운동";

  const ul = document.createElement("ul");
  ul.className = "exercise-list";

  data.exercises.forEach((ex) => {
    const li = document.createElement("li");
    li.className = "exercise-item";

    const header = document.createElement("div");
    header.className = "exercise-header";

    const nameEl = document.createElement("span");
    nameEl.className = "exercise-name";
    nameEl.textContent = ex.name;

    const levelEl = document.createElement("span");
    levelEl.className = "exercise-level";
    levelEl.textContent = ex.level;

    header.appendChild(nameEl);
    header.appendChild(levelEl);

    const body = document.createElement("div");
    body.className = "exercise-body";

    const descEl = document.createElement("p");
    descEl.className = "exercise-desc";
    descEl.textContent = ex.desc;

    const link = document.createElement("a");
    link.className = "exercise-link";
    link.href = ex.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "영상 보기 ▶";

    body.appendChild(descEl);
    body.appendChild(link);

    li.appendChild(header);
    li.appendChild(body);
    ul.appendChild(li);
  });

  partInfoEl.appendChild(title);
  partInfoEl.appendChild(desc);
  partInfoEl.appendChild(listTitle);
  partInfoEl.appendChild(ul);

  setActivePart(partKey);
}

// 리스트 클릭 이벤트
bodyPartItems.forEach((item) => {
  item.addEventListener("click", () => {
    const part = item.getAttribute("data-part");
    showBodyPart(part);
  });
});

// 핫스팟 클릭 이벤트
hotspots.forEach((btn) => {
  btn.addEventListener("click", () => {
    const part = btn.getAttribute("data-part");
    showBodyPart(part);
  });
});

// 헬스력 점수 계산 로직
const fitnessForm = document.getElementById("fitness-form");
const fitnessResultEl = document.getElementById("fitness-result");

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function calculateFitnessScore(values) {
  const weeklyScore = clamp(values.weeklyWorkouts, 0, 7) / 7 * 25;
  const squatScore = clamp(values.squatReps, 0, 40) / 40 * 25;
  const pushupScore = clamp(values.pushupReps, 0, 40) / 40 * 20;
  const plankScore = clamp(values.plankSeconds, 0, 180) / 180 * 15;
  const cardioScore = clamp(values.cardioMinutes, 0, 40) / 40 * 15;

  const total = weeklyScore + squatScore + pushupScore + plankScore + cardioScore;
  // 0~100 사이로 제한
  return Math.round(clamp(total, 0, 100));
}

function getLevelLabel(score) {
  if (score < 40) return "헬린이(입문 단계)";
  if (score < 65) return "헬중수(꾸준히 하면 성장 확실)";
  if (score < 85) return "헬고수(체계적인 루틴 유지 중)";
  return "헬창 직전(상위권 체력 보유)";
}

fitnessForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(fitnessForm);
  const values = {
    weeklyWorkouts: Number(formData.get("weeklyWorkouts")) || 0,
    squatReps: Number(formData.get("squatReps")) || 0,
    pushupReps: Number(formData.get("pushupReps")) || 0,
    plankSeconds: Number(formData.get("plankSeconds")) || 0,
    cardioMinutes: Number(formData.get("cardioMinutes")) || 0
  };

  const score = calculateFitnessScore(values);
  const level = getLevelLabel(score);

  fitnessResultEl.innerHTML = `
    <p><strong>당신의 헬스력 점수는 ${score}점</strong> 입니다.</p>
    <p>등급: <strong>${level}</strong></p>
    <p style="margin-top:4px; font-size:12px; color:#6b7280;">
      ※ 이 점수는 간단한 자가 진단용입니다. 최종 프로젝트에서는 서버(AWS Lambda)로 저장하여 랭킹에 반영할 예정입니다.
    </p>
  `;
});
