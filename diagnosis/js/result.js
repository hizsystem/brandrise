// ============ CONTENT DATA ============

const AREAS = [
  { id: 'brand', name: '브랜드 일관성', icon: '🎨' },
  { id: 'tracking', name: '성과 추적', icon: '📊' },
  { id: 'content', name: '콘텐츠 체계', icon: '📝' },
  { id: 'customer', name: '고객 이해', icon: '👤' },
  { id: 'growth', name: '성장 병목', icon: '🚀' },
  { id: 'speed', name: '실행 속도', icon: '⚡' }
];

const GRADES = {
  D: { label: 'D', name: '시작 전', message: '마케팅의 기초 체력부터 만들어야 합니다. 지금이 가장 빠른 타이밍이에요.', css: 'grade-D' },
  C: { label: 'C', name: '기초 단계', message: '시작은 했지만, 체계 없이 달리고 있어요. 방향부터 잡으면 속도가 붙습니다.', css: 'grade-C' },
  B: { label: 'B', name: '성장 단계', message: '기본기는 있어요. 몇 가지 병목만 풀면 확실히 달라집니다.', css: 'grade-B' },
  A: { label: 'A', name: '고도화 단계', message: '잘하고 계세요. 다음 레벨로 가려면 정밀한 튜닝이 필요한 시점입니다.', css: 'grade-A' }
};

// "지금 상태" 텍스트 (선택한 답변 리프레이밍)
const STATUS_TEXT = {
  brand:    ['브랜드다운 게 뭔지 기준이 아직 없는 상태입니다', '느낌은 있지만 공유가 안 되고 있어요', '가이드는 있는데 실제로 안 지켜지고 있어요', '누가 만들어도 일관된 결과가 나옵니다'],
  tracking: ['마케팅이 매출에 기여하는지 파악이 안 되고 있어요', '감으로는 아는데 데이터로 증명이 안 됩니다', '주요 채널의 유입과 전환을 추적하고 있어요', '데이터 기반으로 예산을 배분하고 있습니다'],
  content:  ['계획 없이 그때그때 올리고 있어요', '계획은 있지만 자주 밀리고 있어요', '캘린더 기반으로 꾸준히 발행하고 있어요', '성과 기반으로 기획을 조정하고 있습니다'],
  customer: ['고객이 왜 우리를 선택하는지 아직 모릅니다', '가설은 있지만 고객에게 직접 검증하진 않았어요', '고객 피드백에서 패턴을 발견했어요', '차별점이 명확하고 마케팅에 반영 중입니다'],
  growth:   ['뭘 먼저 해야 할지 아직 파악이 안 됐어요', '여러 가지를 하고 있지만 확신이 없어요', '핵심 레버는 알지만 실행이 부족해요', '실행 중인 액션플랜이 있습니다'],
  speed:    ['아이디어는 많은데 실행된 게 거의 없어요', '대표가 직접 하다 보니 1-2개월씩 걸려요', '담당자가 있어서 2주 내 실행 가능해요', '1주 내 테스트하고 빠르게 조정합니다']
};

// "다음 레벨" 액션 조언
const ACTION_TEXT = {
  brand:    ['로고·컬러·폰트 3가지만 정하면 기준이 생깁니다.', '1장짜리 가이드를 만들어 팀/외주에 공유하세요.', '실행 체크리스트를 만들면 지켜지기 시작합니다.', '잘하고 계세요. 이 일관성을 유지하면서 다른 영역에 집중하세요.'],
  tracking: ['GA4 설치부터. 무료이고 검색하면 10분이면 됩니다.', 'UTM 태깅을 시작하면 채널별 기여도가 바로 보입니다.', '주간 리포트 루틴 하나만 잡으면 데이터 기반 의사결정이 됩니다.', '잘하고 계세요. 데이터 기반 운영이 가장 큰 강점입니다.'],
  content:  ['주 1회, 1개 채널부터 시작하세요. 그것만으로 충분합니다.', '월간 캘린더 하나만 만드세요. 노션이나 시트면 됩니다.', '콘텐츠별 성과(저장/공유/유입)를 보고 잘 되는 포맷에 집중하세요.', '잘하고 계세요. 체계적 운영이 큰 자산입니다.'],
  customer: ['고객 3명에게 "왜 우리를 선택했나요?"만 물어보세요.', '리뷰·문의에서 반복되는 키워드를 뽑아보세요.', '세그먼트별로 메시지를 다르게 테스트해보세요.', '잘하고 계세요. 고객 이해가 마케팅의 기초 체력입니다.'],
  growth:   ['지금 매출의 80%가 어디서 오는지 먼저 파악하세요.', '2가지 중 ROI 높은 1개를 골라 4주만 집중하세요.', '실행 로드맵에 주간 마일스톤을 넣으세요.', '잘하고 계세요. 집중력이 가장 큰 무기입니다.'],
  speed:    ['이번 주 1가지만 정해서 금요일까지 해보세요.', '마케팅 전담 or 파트너를 정하면 속도가 완전히 달라집니다.', '주간 스프린트 → 결과 체크 → 조정 루틴을 만드세요.', '잘하고 계세요. 빠른 실행력이 최고의 경쟁력입니다.']
};

// ============ PARSE URL ============

const params = new URLSearchParams(window.location.search);
const scores = (params.get('s') || '').split(',').map(Number);
const q7 = (params.get('q7') || '').split(',').filter(Boolean);
const company = params.get('c') || '회사';
const name = params.get('n') || '';
const email = params.get('e') || '';

// Validate
if (scores.length !== 6 || scores.some(isNaN)) {
  document.getElementById('resultArea').innerHTML = `
    <div class="text-center" style="padding:80px 0">
      <h2>진단 결과를 찾을 수 없습니다.</h2>
      <p style="margin-top:16px">
        <a href="diagnosis.html" class="cta-btn-outline">진단 다시 하기</a>
      </p>
    </div>
  `;
} else {
  renderResult();
}

// ============ RENDER ============

function renderResult() {
  const total = scores.reduce((a, b) => a + b, 0);
  const pct = Math.round((total / 24) * 100);
  let gradeKey = 'D';
  if (total >= 19) gradeKey = 'A';
  else if (total >= 14) gradeKey = 'B';
  else if (total >= 10) gradeKey = 'C';
  const grade = GRADES[gradeKey];

  // Sort areas by score (lowest first) for card display
  const areaScores = AREAS.map((area, i) => ({
    ...area,
    score: scores[i],
    index: i
  }));
  const sorted = [...areaScores].sort((a, b) => a.score - b.score);
  const weakestId = sorted[0].id;

  // Build HTML
  const html = `
    <!-- Section 1: Score Summary -->
    <div class="score-section slide-up">
      <p style="font-size:15px;color:var(--sub);margin-bottom:8px">${esc(company)}의 마케팅 성숙도</p>
      <div class="score-number">${total}<span class="score-total"> / 24</span></div>
      <div class="score-bar-wrap">
        <div class="score-bar-fill" id="scoreBarFill" style="width:0%"></div>
      </div>
      <span class="grade-badge ${grade.css}">${grade.label} — ${grade.name}</span>
      <p class="grade-message" style="margin-top:16px">${grade.message}</p>
    </div>

    <!-- Section 2: Area Cards -->
    <div class="result-cards">
      ${sorted.map(area => renderCard(area, area.id === weakestId)).join('')}
    </div>

    <!-- Section 3: CTA -->
    <div class="cta-section">
      <p class="lead-text">
        여기까지는 일반적인 진단입니다.<br>
        <strong>귀사 상황에 딱 맞는 처방</strong>이 필요하시면<br>
        30분이면 충분합니다.
      </p>
      <div style="margin-top:28px">
        <a href="https://docs.google.com/forms/d/e/1FAIpQLSfLsR8V8WjI-9WaM0G55hwHDzrsOeBv8gXc8PwUBXQJZ7Y-xQ/viewform" target="_blank" class="cta-btn" style="max-width:340px">
          30분 무료 상담 신청하기
        </a>
      </div>
      <div class="cta-benefits" style="margin-top:20px">
        <span class="benefit">· 우리 업종·단계에 맞는 우선순위</span>
        <span class="benefit">· 바로 실행 가능한 맞춤 액션 3가지</span>
        <span class="benefit">· 상담 후 강요 없음, 방향만 잡아드립니다</span>
      </div>
    </div>

    <!-- Share -->
    <div class="share-row">
      <button class="cta-btn-outline" id="shareBtn">내 진단 결과 공유하기</button>
    </div>
  `;

  document.getElementById('resultArea').innerHTML = html;

  // Animate score bar
  requestAnimationFrame(() => {
    setTimeout(() => {
      document.getElementById('scoreBarFill').style.width = pct + '%';
    }, 300);
  });

  // Share button
  document.getElementById('shareBtn').addEventListener('click', () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        document.getElementById('shareBtn').textContent = '링크가 복사됐습니다!';
        setTimeout(() => {
          document.getElementById('shareBtn').textContent = '내 진단 결과 공유하기';
        }, 2000);
      });
    } else {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      document.getElementById('shareBtn').textContent = '링크가 복사됐습니다!';
    }
  });
}

function renderCard(area, isWeakest) {
  const score = area.score;
  const statusIdx = score - 1; // 0-indexed
  const statusText = STATUS_TEXT[area.id][statusIdx];
  const actionText = ACTION_TEXT[area.id][statusIdx];
  const isMax = score === 4;

  // Dots
  const dots = Array.from({ length: 4 }, (_, i) => {
    const filled = i < score;
    const colorClass = isMax ? 'filled green' : (filled ? 'filled' : '');
    return `<span class="dot ${colorClass}"></span>`;
  }).join('');

  return `
    <div class="result-card ${isWeakest ? 'weakest' : ''}">
      <div class="result-card-header">
        <span class="result-card-title">${area.icon} ${area.name}</span>
        <div class="result-card-dots">${dots} <span style="font-size:13px;color:var(--muted);margin-left:8px">${score}/4</span></div>
      </div>
      <div class="result-card-status">
        ${esc(statusText)}
      </div>
      <div class="result-card-action">
        <span class="arrow">&rarr;</span> ${esc(actionText)}
      </div>
    </div>
  `;
}

// ============ UTIL ============

function esc(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
