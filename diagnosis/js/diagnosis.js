// ============ DATA ============

const QUESTIONS = [
  {
    id: 'brand',
    area: '브랜드 일관성',
    question: '새 콘텐츠나 마케팅 자료를 만들 때,\n\'우리 브랜드답다\'고 느껴지나요?',
    options: [
      '뭐가 우리 브랜드다운 건지 기준 자체가 없다',
      '느낌은 있는데, 문서화된 건 없다',
      '가이드는 있지만 잘 안 지켜진다',
      '누가 만들어도 일관된 톤과 비주얼이 나온다'
    ]
  },
  {
    id: 'tracking',
    area: '성과 추적',
    question: '지난 달 마케팅에서 \'이 활동이 매출에\n기여했다\'고 증명할 수 있나요?',
    options: [
      '마케팅이 매출에 기여하는지 솔직히 모른다',
      '감으로는 아는데 데이터로 증명 못 한다',
      '주요 채널의 유입·전환은 추적 중이다',
      '채널별 ROAS를 알고 예산을 데이터로 배분한다'
    ]
  },
  {
    id: 'content',
    area: '콘텐츠 체계',
    question: '다음 달에 어떤 콘텐츠를 어디에 올릴지,\n지금 바로 말할 수 있나요?',
    options: [
      '그때그때 생각나면 올린다',
      '대략 계획은 있지만 자주 밀린다',
      '캘린더가 있고 주 2회 이상 꾸준히 한다',
      '시리즈별 기획이 있고 성과 기반으로 조정한다'
    ]
  },
  {
    id: 'customer',
    area: '고객 이해',
    question: '우리 고객이 경쟁사 대신 우리를 선택하는\n\'진짜 이유\' 1가지를 말할 수 있나요?',
    options: [
      '솔직히 잘 모르겠다',
      '우리 생각은 있는데, 고객에게 직접 물어본 적은 없다',
      '고객 인터뷰·리뷰에서 패턴을 발견했다',
      '명확한 차별점이 있고 마케팅에 반영 중이다'
    ]
  },
  {
    id: 'growth',
    area: '성장 병목',
    question: '지금 매출을 2배로 만들려면,\n가장 먼저 뭘 해야 할지 알고 있나요?',
    options: [
      '어디서부터 손대야 할지 모르겠다',
      '여러 가지 시도 중인데 뭐가 맞는지 확신이 없다',
      '핵심 레버 1-2개는 파악했지만 실행이 부족하다',
      '액션플랜이 있고 실행 중이다'
    ]
  },
  {
    id: 'speed',
    area: '실행 속도',
    question: '마케팅 아이디어가 나왔을 때,\n실행까지 보통 얼마나 걸리나요?',
    options: [
      '아이디어는 많은데 실행된 게 거의 없다',
      '1-2개월 (대표가 직접 하느라)',
      '2주 내 가능 (담당자 or 파트너 있음)',
      '1주 내 테스트하고, 결과 기반으로 빠르게 돈다'
    ]
  }
];

const Q7_OPTIONS = [
  { id: 'branding', label: '브랜딩 정립 (로고, 톤앤매너, 가이드라인)' },
  { id: 'content', label: '콘텐츠 체계화 (SNS, 블로그, 영상)' },
  { id: 'ads', label: '광고 시작 또는 최적화 (메타, 구글)' },
  { id: 'conversion', label: '매출 전환 개선 (랜딩페이지, 퍼널)' }
];

const INDUSTRIES = [
  '식품·음료', '뷰티·화장품', '패션·의류',
  '테크·SaaS', '라이프스타일', '교육', '기타'
];

const STAGES = [
  '예비창업',
  '초기 (매출 1억 미만)',
  '성장기 (1-10억)',
  '확장기 (10억+)'
];

// ============ STATE ============

const TOTAL_STEPS = 9; // info(1) + info(2) + Q1-Q6(6) + Q7(1)
let currentStep = 0;
let formData = {
  company: '', name: '', email: '', phone: '',
  industry: '', stage: '',
  scores: [],    // [Q1score, Q2score, ..., Q6score]
  q7: []         // ['branding', 'content', ...]
};

// ============ RENDER ============

const container = document.getElementById('formContainer');
const stepLabel = document.getElementById('stepLabel');
const progressBar = document.getElementById('progressBar');
const backBtn = document.getElementById('backBtn');

function render() {
  const pct = Math.round(((currentStep + 1) / TOTAL_STEPS) * 100);
  stepLabel.textContent = `STEP ${currentStep + 1} / ${TOTAL_STEPS}`;
  progressBar.style.width = pct + '%';
  backBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';

  if (currentStep === 0) {
    renderInfoStep1();
  } else if (currentStep === 1) {
    renderInfoStep2();
  } else if (currentStep >= 2 && currentStep <= 7) {
    renderQuestion(currentStep - 2);
  } else if (currentStep === 8) {
    renderQ7();
  }

  // Animate in
  const card = container.querySelector('.slide-target');
  if (card) {
    card.style.opacity = '0';
    card.style.transform = 'translateY(16px)';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      card.style.opacity = '1';
      card.style.transform = 'translateY(0)';
    });
  }
}

function renderInfoStep1() {
  container.innerHTML = `
    <div class="slide-target">
      <p class="question-text">기본 정보를 입력해주세요.</p>
      <div class="form-group">
        <label>회사명 <span class="required">*</span></label>
        <input type="text" class="form-input" id="f-company" placeholder="브랜드명 또는 회사명" value="${esc(formData.company)}">
      </div>
      <div class="form-group">
        <label>이름 <span class="required">*</span></label>
        <input type="text" class="form-input" id="f-name" placeholder="대표자 또는 담당자명" value="${esc(formData.name)}">
      </div>
      <div class="form-group">
        <label>이메일 <span class="required">*</span></label>
        <input type="email" class="form-input" id="f-email" placeholder="결과 안내를 받으실 이메일" value="${esc(formData.email)}">
      </div>
      <div class="form-group">
        <label>연락처</label>
        <input type="tel" class="form-input" id="f-phone" placeholder="010-0000-0000 (선택)" value="${esc(formData.phone)}">
      </div>
      <div style="margin-top:24px">
        <button class="cta-btn" id="info1Next" type="button">다음</button>
      </div>
    </div>
  `;

  document.getElementById('info1Next').addEventListener('click', () => {
    const company = document.getElementById('f-company').value.trim();
    const name = document.getElementById('f-name').value.trim();
    const email = document.getElementById('f-email').value.trim();
    const phone = document.getElementById('f-phone').value.trim();

    if (!company || !name || !email) {
      alert('회사명, 이름, 이메일은 필수입니다.');
      return;
    }
    if (!email.includes('@')) {
      alert('올바른 이메일을 입력해주세요.');
      return;
    }

    formData.company = company;
    formData.name = name;
    formData.email = email;
    formData.phone = phone;
    goNext();
  });

  // Enter key
  container.querySelectorAll('input').forEach(input => {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('info1Next').click();
    });
  });
}

function renderInfoStep2() {
  container.innerHTML = `
    <div class="slide-target">
      <p class="question-text">${esc(formData.company)}에 대해<br>조금만 더 알려주세요.</p>
      <div class="form-group">
        <label>업종 <span class="required">*</span></label>
        <select class="form-input" id="f-industry">
          <option value="">선택해주세요</option>
          ${INDUSTRIES.map(i => `<option value="${esc(i)}" ${formData.industry === i ? 'selected' : ''}>${esc(i)}</option>`).join('')}
        </select>
      </div>
      <div class="form-group">
        <label>현재 단계 <span class="required">*</span></label>
        <select class="form-input" id="f-stage">
          <option value="">선택해주세요</option>
          ${STAGES.map(s => `<option value="${esc(s)}" ${formData.stage === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
        </select>
      </div>
      <div style="margin-top:24px">
        <button class="cta-btn" id="info2Next" type="button">진단 시작하기</button>
      </div>
    </div>
  `;

  document.getElementById('info2Next').addEventListener('click', () => {
    const industry = document.getElementById('f-industry').value;
    const stage = document.getElementById('f-stage').value;
    if (!industry || !stage) {
      alert('업종과 현재 단계를 선택해주세요.');
      return;
    }
    formData.industry = industry;
    formData.stage = stage;
    goNext();
  });
}

function renderQuestion(qIndex) {
  const q = QUESTIONS[qIndex];
  const existingScore = formData.scores[qIndex];

  container.innerHTML = `
    <div class="slide-target">
      <p style="font-size:13px;color:var(--orange);font-weight:600;margin-bottom:12px">${esc(q.area)}</p>
      <p class="question-text">${q.question.replace(/\n/g, '<br>')}</p>
      <div class="option-list">
        ${q.options.map((opt, i) => `
          <div class="option-item ${existingScore === i + 1 ? 'selected' : ''}" data-score="${i + 1}">
            <span class="hotkey">${i + 1}</span>${esc(opt)}
          </div>
        `).join('')}
      </div>
    </div>
  `;

  container.querySelectorAll('.option-item').forEach(item => {
    item.addEventListener('click', () => {
      const score = parseInt(item.dataset.score);
      formData.scores[qIndex] = score;

      // Visual feedback
      container.querySelectorAll('.option-item').forEach(o => o.classList.remove('selected'));
      item.classList.add('selected');

      // Auto-advance after delay
      setTimeout(goNext, 350);
    });
  });

  // Keyboard shortcuts
  document.onkeydown = (e) => {
    const num = parseInt(e.key);
    if (num >= 1 && num <= 4) {
      const items = container.querySelectorAll('.option-item');
      if (items[num - 1]) items[num - 1].click();
    }
  };
}

function renderQ7() {
  container.innerHTML = `
    <div class="slide-target">
      <p style="font-size:13px;color:var(--orange);font-weight:600;margin-bottom:12px">시급 과제</p>
      <p class="question-text">지금 가장 시급한<br>마케팅 과제는?</p>
      <p class="text-sm" style="margin-bottom:24px">복수 선택 가능합니다.</p>
      <div class="option-list">
        ${Q7_OPTIONS.map(opt => `
          <div class="option-item multi ${formData.q7.includes(opt.id) ? 'selected' : ''}" data-id="${opt.id}">
            ${esc(opt.label)}
          </div>
        `).join('')}
      </div>
      <div style="margin-top:32px">
        <button class="cta-btn" id="submitBtn" type="button">결과 보기</button>
      </div>
    </div>
  `;

  container.querySelectorAll('.option-item.multi').forEach(item => {
    item.addEventListener('click', () => {
      const id = item.dataset.id;
      if (formData.q7.includes(id)) {
        formData.q7 = formData.q7.filter(x => x !== id);
        item.classList.remove('selected');
      } else {
        formData.q7.push(id);
        item.classList.add('selected');
      }
    });
  });

  document.getElementById('submitBtn').addEventListener('click', submitForm);

  // Clear keyboard handler
  document.onkeydown = null;
}

// ============ NAVIGATION ============

function goNext() {
  if (currentStep < TOTAL_STEPS - 1) {
    currentStep++;
    render();
  }
}

function goBack() {
  if (currentStep > 0) {
    currentStep--;
    render();
  }
}

backBtn.addEventListener('click', goBack);

// ============ SUBMIT ============

async function submitForm() {
  const btn = document.getElementById('submitBtn');
  btn.textContent = '분석 중...';
  btn.disabled = true;

  const totalScore = formData.scores.reduce((a, b) => a + b, 0);
  let grade = 'D';
  if (totalScore >= 19) grade = 'A';
  else if (totalScore >= 14) grade = 'B';
  else if (totalScore >= 10) grade = 'C';

  // Find weakest area
  const areas = QUESTIONS.map((q, i) => ({ id: q.id, area: q.area, score: formData.scores[i] }));
  areas.sort((a, b) => a.score - b.score);
  const weakest = areas[0].area;

  const payload = {
    company: formData.company,
    name: formData.name,
    email: formData.email,
    phone: formData.phone,
    industry: formData.industry,
    stage: formData.stage,
    scores: formData.scores,
    q7: formData.q7,
    totalScore,
    grade,
    weakest,
    timestamp: new Date().toISOString()
  };

  // Send to API (fire and forget - don't block the user)
  try {
    fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch (e) {
    // Silent fail - don't block user experience
  }

  // Build result URL
  const params = new URLSearchParams({
    s: formData.scores.join(','),
    q7: formData.q7.join(','),
    c: formData.company,
    n: formData.name,
    e: formData.email
  });

  // Navigate to result
  window.location.href = `result.html?${params.toString()}`;
}

// ============ UTIL ============

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ============ INIT ============

render();
