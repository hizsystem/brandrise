/**
 * 모수 v2 트리거 진단서 — 진단 폼 로직
 *
 * 구조: 12문항(A·B·C) + 결과지 진입 게이트 4문항(G) = 16 step
 * 판정: 2축(F/T × S/G) → 4유형(FS/FG/TS/TG)
 * 영역: 6항목(B1~B6) 1~4점, 합계 6~24점
 * 처방: C1 복수선택(최대 2) + C2 자유서술(30~80자)
 * Redirect: /result?code=XX&B1=N&...&c2=...&email=...
 */

// ============ 12문항 + 게이트 4문항 ============

const QUESTIONS = [
  // ----- A. 정체성 분류 (4유형 판정용) -----
  {
    id: 'A1', section: 'A',
    title: '우리 회사의 마케팅, 누가 가장 많이 결정하나요?',
    options: [
      { label: '거의 다 내가 직접 결정한다', score: { F: 2 } },
      { label: '큰 방향은 내가, 실행은 마케터/외주가 결정한다', score: { F: 1 } },
      { label: '큰 방향은 마케터, 나는 컨펌만 한다', score: { T: 1 } },
      { label: '마케터·대행사한테 거의 다 위임돼 있다', score: { T: 2 } },
    ]
  },
  {
    id: 'A2', section: 'A',
    title: '마케팅 회의는 보통 누가 들어가나요?',
    options: [
      { label: '나 혼자 (또는 외부 미팅에서 받아만 옴)', score: { F: 2 } },
      { label: '나 + 마케터 1명', score: { F: 1 } },
      { label: '마케터 + 다른 팀원들이 들어가고, 나는 결과만 본다', score: { T: 1 } },
      { label: '마케터·대행사가 알아서 진행하고, 나는 보고만 받는다', score: { T: 2 } },
    ]
  },
  {
    id: 'A3', section: 'A',
    title: '우리 회사 마케팅은 지금 누가 실무를 굴리나요?',
    options: [
      { label: '사실상 나 혼자 한다 (외주는 단발성)', score: { S: 2 } },
      { label: '마케터 1명 또는 인턴 1명 + 나', score: { S: 1 } },
      { label: '마케팅 담당 2~3명 팀이 있다', score: { G: 1 } },
      { label: '마케팅·콘텐츠·광고 분리된 팀 (3명 이상)', score: { G: 2 } },
    ]
  },
  {
    id: 'A4', section: 'A',
    title: '마케팅 일이 막혔을 때, 가장 먼저 하는 행동은?',
    options: [
      { label: '내가 직접 손대거나 다른 일 미루고 본다', score: { S: 2 } },
      { label: '내가 외부에 물어본다 (대행사·지인·강의)', score: { S: 1 } },
      { label: '마케터에게 "어떻게 풀 거냐"고 묻고 답을 본다', score: { G: 1 } },
      { label: '팀이 알아서 풀고 결론만 가져온다', score: { G: 2 } },
    ]
  },

  // ----- B. 영역 진단 6문항 (1~4점 척도) -----
  {
    id: 'B1', section: 'B', area: '브랜드 일관성',
    title: '채널마다 우리 회사가 같은 얼굴로 보이나요?',
    subtitle: '인스타·홈페이지·상세페이지·광고 — 톤·메시지·비주얼이 같은 회사로 인지되는지',
    options: scaleOptions()
  },
  {
    id: 'B2', section: 'B', area: '데이터·대시보드 성숙도', tag2026: true,
    title: '매주 마케팅 의사결정에 쓰이는 숫자가 한 눈에 보이나요?',
    subtitle: '매출·전환율·CAC(고객 한 명 데려오는 비용)·채널별 성과 — 월말 보고서가 아니라 매주 보는 대시보드',
    options: scaleOptions()
  },
  {
    id: 'B3', section: 'B', area: '콘텐츠 체계',
    title: '콘텐츠 발행이 시스템으로 굴러가나요, 그때그때 만드나요?',
    subtitle: '월간 캘린더·시리즈 구조·아카이빙·재활용 — 발행이 시스템인지',
    options: scaleOptions()
  },
  {
    id: 'B4', section: 'B', area: '고객 이해',
    title: '우리 고객이 누구이고 왜 사는지, 검증된 형태로 정리돼 있나요?',
    subtitle: '페르소나·구매 동기·이탈 사유 — 직감이 아니라 데이터·인터뷰로',
    options: scaleOptions()
  },
  {
    id: 'B5', section: 'B', area: 'AI·자동화 도입도', tag2026: true,
    title: '마케팅 워크플로우에 AI나 자동화가 박혀 있나요?',
    subtitle: '콘텐츠 생산·고객 응대·리포트·광고 운영 — 어느 한 군데라도 AI/자동화가 살아있는지',
    options: scaleOptions()
  },
  {
    id: 'B6', section: 'B', area: '실행 속도',
    title: '가설 → 실행 → 측정의 한 사이클이 얼마나 빠른가요?',
    options: [
      { label: '2주 이내', score: { value: 4 } },
      { label: '약 1개월', score: { value: 3 } },
      { label: '분기에 한 번 정도', score: { value: 2 } },
      { label: '측정 자체가 잘 안 됨', score: { value: 1 } },
    ]
  },

  // ----- C. 처방 트리거 -----
  {
    id: 'C1', section: 'C', type: 'multi', maxSelect: 2,
    title: '지금 가장 시급하게 풀어야 할 과제는? (최대 2개)',
    options: [
      { label: '신규 고객 유입이 안 늘고 있다', value: 'inflow' },
      { label: '광고비를 늘려도 매출이 비례해서 안 오른다', value: 'roas' },
      { label: '콘텐츠를 만들어도 반응·전환이 약하다', value: 'content' },
      { label: '데이터·성과를 보면서 결정하고 싶은데 시스템이 없다', value: 'data' },
      { label: '마케터에게 맡겼지만 잘 굴러가는지 검증이 안 된다', value: 'verify' },
      { label: '다음 단계(브랜드·확장·해외)로 가려는데 무엇부터인지 모르겠다', value: 'next' },
    ]
  },
  {
    id: 'C2', section: 'C', type: 'textarea', minLen: 30, maxLen: 80,
    title: '한 줄로, 지금 가장 답답한 것은 무엇인가요?',
    placeholder: '예) 광고비는 매달 200만 쓰는데 신규 매출이 200만이 안 늘어요'
  },

  // ----- P. PMF 단계 (2026-05-15 신규 축, 8유형 확장) -----
  {
    id: 'P1', section: 'P',
    title: '우리 회사 매출, 지금 어떻게 굴러가나요?',
    options: [
      { label: '아직 들쭉날쭉 — 어떤 고객이 왜 사는지 가설 단계입니다', value: 'pre' },
      { label: '반복 구매가 발생 — 핵심 고객이 어느 정도 명확합니다', value: 'post' },
    ]
  },

  // ----- G. 결과지 진입 게이트 (회사 정보) -----
  {
    id: 'G1', section: 'G',
    title: '우리 회사는 지금 어느 단계인가요?',
    options: [
      { label: '시드 또는 그 이전', value: 'seed' },
      { label: '프리A', value: 'pre-a' },
      { label: '시리즈A 이상', value: 'series-a-plus' },
      { label: '비투자 (자영업·SMB·꾸준한 매출 운영 중)', value: 'non-vc' },
    ]
  },
  {
    id: 'G2', section: 'G',
    title: '마케팅 인력은 몇 명인가요?',
    options: [
      { label: '0명 (대표 직접)', value: '0' },
      { label: '1~2명', value: '1-2' },
      { label: '3명 이상', value: '3+' },
      { label: '외주 운영', value: 'outsource' },
    ]
  },
  {
    id: 'G3', section: 'G', type: 'email',
    title: '결과지 받을 이메일을 알려주세요',
    subtitle: '결과지 PDF + 30분 1:1 무료 처방 신청 안내를 보내드립니다.',
    placeholder: 'name@company.com'
  },
  {
    id: 'G4', section: 'G', type: 'text', optional: true,
    title: '회사명 (선택)',
    subtitle: '결과지의 한 줄 진단 카피를 회사명으로 개인화해드립니다.',
    placeholder: '브랜드라이즈'
  },
];

function scaleOptions() {
  return [
    { label: '거의 그렇지 않다', score: { value: 1 } },
    { label: '그런 편이다', score: { value: 2 } },
    { label: '잘 되어 있다', score: { value: 3 } },
    { label: '매우 잘 되어 있다', score: { value: 4 } },
  ];
}

// ============ State ============

const STORAGE_KEY = 'brandrise_diagnosis_v2_state';
let state = loadState() || { step: 0, responses: {} };

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch {}
}

// ============ Render ============

const formContainer = document.getElementById('formContainer');
const stepLabel = document.getElementById('stepLabel');
const progressBar = document.getElementById('progressBar');
const backBtn = document.getElementById('backBtn');

function render() {
  const q = QUESTIONS[state.step];
  if (!q) return submit();

  // Progress
  const totalDiagnosis = 13; // A+B+C = 12, G는 게이트로 별도 표기
  const isGate = q.section === 'G';
  if (isGate) {
    const gateIdx = state.step - totalDiagnosis + 1; // 1~4
    stepLabel.textContent = `결과 보기 ${gateIdx} / 4`;
    progressBar.style.width = '100%';
  } else {
    const idx = state.step + 1;
    stepLabel.textContent = `${String(idx).padStart(2, '0')} / ${totalDiagnosis}`;
    progressBar.style.width = `${(idx / totalDiagnosis) * 100}%`;
  }

  // Back button
  backBtn.style.visibility = state.step > 0 ? 'visible' : 'hidden';

  // Render question
  formContainer.innerHTML = renderQuestion(q);
  formContainer.classList.remove('slide-up');
  void formContainer.offsetWidth; // reflow
  formContainer.classList.add('slide-up');

  attachHandlers(q);
}

function renderQuestion(q) {
  const tag2026 = q.tag2026 ? `<span class="tag-lime">2026 핵심 격차</span>` : '';
  const sectionLabel = q.section === 'A' ? '정체성'
    : q.section === 'B' ? `영역 · ${q.area}`
    : q.section === 'C' ? '시급 진단'
    : '회사 정보';

  let bodyHtml = '';

  if (q.type === 'textarea') {
    bodyHtml = `
      <textarea class="c2-textarea" id="c2Input" placeholder="${q.placeholder}"
        minlength="${q.minLen}" maxlength="${q.maxLen}"
      >${escapeHtml(state.responses[q.id]?.value || '')}</textarea>
      <div class="c2-counter"><span id="c2Count">0</span> / ${q.maxLen}자 (최소 ${q.minLen}자)</div>
      <button class="cta-btn" id="textareaNext" style="margin-top:24px;opacity:0.5;pointer-events:none">다음 →</button>
    `;
  } else if (q.type === 'email') {
    bodyHtml = `
      <input type="email" class="c2-textarea" id="emailInput" placeholder="${q.placeholder}"
        value="${escapeHtml(state.responses[q.id]?.value || '')}" style="min-height:auto;height:56px"
      />
      <button class="cta-btn" id="emailNext" style="margin-top:24px;opacity:0.5;pointer-events:none">결과 보기 →</button>
    `;
  } else if (q.type === 'text') {
    bodyHtml = `
      <input type="text" class="c2-textarea" id="textInput" placeholder="${q.placeholder}"
        value="${escapeHtml(state.responses[q.id]?.value || '')}" style="min-height:auto;height:56px"
      />
      <button class="cta-btn" id="textNext" style="margin-top:24px">${q.optional ? '건너뛰고 결과 보기 →' : '다음 →'}</button>
    `;
  } else if (q.type === 'multi') {
    const selected = new Set(state.responses[q.id]?.values || []);
    bodyHtml = `
      <div class="option-list" id="multiOptions">
        ${q.options.map((opt, i) => `
          <div class="option-item multi ${selected.has(opt.value) ? 'selected' : ''}" data-value="${opt.value}">
            ${opt.label}
          </div>
        `).join('')}
      </div>
      <p class="text-sm" style="margin-top:12px;text-align:center">최대 2개까지 선택할 수 있습니다.</p>
      <button class="cta-btn" id="multiNext" style="margin-top:24px;opacity:0.5;pointer-events:none">다음 →</button>
    `;
  } else {
    // Single choice (radio)
    const selected = state.responses[q.id]?.optionIdx;
    bodyHtml = `
      <div class="option-list">
        ${q.options.map((opt, i) => `
          <label class="option-item ${selected === i ? 'selected' : ''}" data-idx="${i}">
            <input type="radio" name="${q.id}" value="${i}" ${selected === i ? 'checked' : ''} hidden>
            <span class="hotkey">${i + 1}</span>
            ${opt.label}
          </label>
        `).join('')}
      </div>
    `;
  }

  return `
    <div class="step-meta">
      <span class="step-section-label">${sectionLabel}</span>
      ${tag2026}
    </div>
    <p class="question-text">${q.title}</p>
    ${q.subtitle ? `<p class="question-subtitle">${q.subtitle}</p>` : ''}
    ${bodyHtml}
  `;
}

// ============ Handlers ============

function attachHandlers(q) {
  if (q.type === 'textarea') {
    const input = document.getElementById('c2Input');
    const counter = document.getElementById('c2Count');
    const btn = document.getElementById('textareaNext');
    const update = () => {
      const len = input.value.length;
      counter.textContent = len;
      const valid = len >= q.minLen && len <= q.maxLen;
      btn.style.opacity = valid ? '1' : '0.5';
      btn.style.pointerEvents = valid ? 'auto' : 'none';
    };
    input.addEventListener('input', update);
    btn.addEventListener('click', () => {
      state.responses[q.id] = { value: input.value };
      saveState();
      next();
    });
    update();
    input.focus();
  } else if (q.type === 'email') {
    const input = document.getElementById('emailInput');
    const btn = document.getElementById('emailNext');
    const update = () => {
      const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
      btn.style.opacity = valid ? '1' : '0.5';
      btn.style.pointerEvents = valid ? 'auto' : 'none';
    };
    input.addEventListener('input', update);
    btn.addEventListener('click', () => {
      state.responses[q.id] = { value: input.value.trim() };
      saveState();
      next();
    });
    update();
    input.focus();
  } else if (q.type === 'text') {
    const input = document.getElementById('textInput');
    const btn = document.getElementById('textNext');
    btn.addEventListener('click', () => {
      state.responses[q.id] = { value: input.value.trim() };
      saveState();
      next();
    });
    input.focus();
  } else if (q.type === 'multi') {
    const cards = formContainer.querySelectorAll('#multiOptions .option-item');
    const btn = document.getElementById('multiNext');
    const updateBtn = () => {
      const selected = formContainer.querySelectorAll('#multiOptions .option-item.selected');
      const valid = selected.length >= 1 && selected.length <= q.maxSelect;
      btn.style.opacity = valid ? '1' : '0.5';
      btn.style.pointerEvents = valid ? 'auto' : 'none';
    };
    cards.forEach(card => {
      card.addEventListener('click', () => {
        const selected = formContainer.querySelectorAll('#multiOptions .option-item.selected');
        if (card.classList.contains('selected')) {
          card.classList.remove('selected');
        } else if (selected.length < q.maxSelect) {
          card.classList.add('selected');
        }
        updateBtn();
      });
    });
    btn.addEventListener('click', () => {
      const values = [...formContainer.querySelectorAll('#multiOptions .option-item.selected')]
        .map(c => c.dataset.value);
      state.responses[q.id] = { values };
      saveState();
      next();
    });
    updateBtn();
  } else {
    // Single choice — auto next on click (300ms delay)
    const cards = formContainer.querySelectorAll('.option-item');
    cards.forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        cards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        state.responses[q.id] = { optionIdx: idx, score: q.options[idx].score };
        saveState();
        setTimeout(next, 300);
      });
    });
  }
}

backBtn.addEventListener('click', () => {
  if (state.step > 0) {
    state.step -= 1;
    saveState();
    render();
  }
});

// 키보드 단축키 1/2/3/4
document.addEventListener('keydown', (e) => {
  const q = QUESTIONS[state.step];
  if (!q) return;
  if (q.type === 'textarea' || q.type === 'email' || q.type === 'text') return;
  if (q.type === 'multi') return; // multi는 키보드 단축키 X (혼동 방지)
  const num = parseInt(e.key, 10);
  if (num >= 1 && num <= 4) {
    const card = formContainer.querySelector(`.option-item[data-idx="${num - 1}"]`);
    if (card) card.click();
  }
});

function next() {
  state.step += 1;
  saveState();
  render();
}

// ============ Submit ============

function calculateType(responses) {
  let F = 0, T = 0, S = 0, G = 0;
  ['A1', 'A2'].forEach(id => {
    const s = responses[id]?.score || {};
    F += s.F || 0; T += s.T || 0;
  });
  ['A3', 'A4'].forEach(id => {
    const s = responses[id]?.score || {};
    S += s.S || 0; G += s.G || 0;
  });
  const ft = F >= T ? 'F' : 'T'; // 동률 시 F (A1 우선)
  const sg = S >= G ? 'S' : 'G';
  const pmf = responses.P1?.value === 'post' ? 'M' : 'P'; // P1 미응답 시 Pre-PMF 기본
  return ft + sg + pmf;
}

function calculateScores(responses) {
  return {
    B1: responses.B1?.score?.value || 0,
    B2: responses.B2?.score?.value || 0,
    B3: responses.B3?.score?.value || 0,
    B4: responses.B4?.score?.value || 0,
    B5: responses.B5?.score?.value || 0,
    B6: responses.B6?.score?.value || 0,
  };
}

function submit() {
  const code = calculateType(state.responses);
  const scores = calculateScores(state.responses);
  const c1 = state.responses.C1?.values?.join(',') || '';
  const c2 = state.responses.C2?.value || '';
  const stage = state.responses.G1?.value || '';
  const team = state.responses.G2?.value || '';
  const email = state.responses.G3?.value || '';
  const company = state.responses.G4?.value || '';

  // POST to API (fire-and-forget — 결과 페이지 이동 막지 않음)
  fetch('/api/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'diagnosis-v2',
      code, scores, c1, c2, stage, team, email, company,
      timestamp: Date.now(),
    }),
  }).catch(err => console.error('submit failed', err));

  // Meta Pixel Lead event (init 활성화 후 자동 작동)
  if (typeof fbq === 'function') {
    fbq('track', 'Lead', { content_name: 'diagnosis_v2_complete', code });
  }

  // Redirect to result
  const params = new URLSearchParams({
    code,
    ...Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, String(v)])),
    c1, c2, stage, team, email, company,
  });
  clearState();
  window.location.href = `/result?${params.toString()}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// ============ Init ============

render();
