/**
 * 모수 v2 트리거 진단서 — 결과지 렌더링
 *
 * 입력: URL params { code, B1~B6, c1, c2, stage, team, email, company }
 * 렌더: Hero(코드+별명+캐치) / PART 1(점수표) / PART 2(위험·격차·인용 카드) / PART 3(처방+CTA)
 *
 * 카피 데이터(NICKNAMES, CATCHPHRASES, RISK_BODY, PRESCRIPTIONS) 워크샵 1 확정 시드 박힘 (2026-05-13).
 * 출처: specs/2026-05-12-chatgpt-workshop-1-nickname-catchphrase.md (우성민 챗GPT 워크샵 1 확정)
 * 톤: 짧은 단정문 · 자존감 인정 + 결핍 호명 · 자기 비하 없음
 */

// ============ URL Params ============

const params = new URLSearchParams(window.location.search);
const code = params.get('code') || 'TS';
const scores = {
  B1: parseInt(params.get('B1') || '0', 10),
  B2: parseInt(params.get('B2') || '0', 10),
  B3: parseInt(params.get('B3') || '0', 10),
  B4: parseInt(params.get('B4') || '0', 10),
  B5: parseInt(params.get('B5') || '0', 10),
  B6: parseInt(params.get('B6') || '0', 10),
};
const c1 = (params.get('c1') || '').split(',').filter(Boolean);
const c2 = params.get('c2') || '';
const stage = params.get('stage') || '';
const team = params.get('team') || '';
const company = params.get('company') || '';

// ============ 영역 메타 ============

const AREA_META = {
  B1: { name: '브랜드 일관성' },
  B2: { name: '데이터·대시보드 성숙도', tag2026: true },
  B3: { name: '콘텐츠 체계' },
  B4: { name: '고객 이해' },
  B5: { name: 'AI·자동화 도입도', tag2026: true },
  B6: { name: '실행 속도' },
};

// ============ 카피 데이터 (워크샵 1 확정 시드 / 2026-05-13) ============
// 시드 출처: specs/2026-05-12-chatgpt-workshop-1-nickname-catchphrase.md (우성민 챗GPT 워크샵 1 확정)

const NICKNAMES = {
  FS: '감각 운영자',
  FG: '성장 설계자',
  TS: '성과 확인형',
  TG: '다음 체계 설계자',
};

const CATCHPHRASES = {
  FS: '올리고 있지만, 쌓이고 있지는 않습니다',
  FG: '광고비는 늘었는데 성장 곡선은 평평합니다',
  TS: '마케팅은 돌아가는데, 매출 연결이 안 보입니다',
  TG: '다음 성장은 실행보다 시스템에서 나옵니다',
};

// 24개 처방 매트릭스 (4유형 × 6영역). 각 유형 캐치카피의 정서를 6영역으로 변주.
// FS: "쌓이고 있지 않습니다" / FG: "성장 곡선은 평평합니다" / TS: "매출 연결이 안 보입니다" / TG: "시스템에서 나옵니다"
const PRESCRIPTIONS = {
  TS: {
    B1: {
      headline: '마케터가 만든 4개 채널이 4개의 회사처럼 움직이고 있습니다',
      body: '채널마다 결정자가 다르고 검수자는 사장님 한 명인 위임 6개월차의 흔한 패턴입니다. 검수자가 사장님이면, 사장님이 멈출 때 일관성이 멈춥니다.'
    },
    B2: {
      headline: '매주 결정해야 할 숫자가 매월 한 번만 도착합니다',
      body: '매주 봐야 할 마케팅 의사결정(매출·전환율·CAC·채널별 성과)이 월 1회만 도착하면 결정 속도가 30일 뒤로 밀립니다. 2026년 시장에서 이 격차는 12개월 안에 매출 2~3배로 벌어집니다.'
    },
    B3: {
      headline: '콘텐츠는 매주 올라가는데 왜 올리는지의 답이 안 보입니다',
      body: '발행은 시스템으로 굴러가도 시리즈의 의도·KPI·다음 시즌이 사장님 화면에 안 보이면 콘텐츠는 6개월 뒤 평가가 안 되는 누적물이 됩니다. 위임은 발행에서 끝나고 평가는 사장님 손에 남아야 합니다.'
    },
    B4: {
      headline: '페르소나는 받았는데, 그게 진짜 우리 고객인지 검증이 비어 있습니다',
      body: '위임된 페르소나가 사장님의 영업·매출 데이터와 한 번도 맞춰진 적 없다면 고객의 구매 동기는 가설로만 운영됩니다. 검증되지 않은 페르소나는 광고·콘텐츠·랜딩의 정확도를 동시에 떨어뜨립니다.'
    },
    B5: {
      headline: '우리 마케터가 AI를 어디까지 쓰는지 사장님이 답할 수 없습니다',
      body: '콘텐츠 생산·고객 응대·리포트·광고 운영 중 단 1개 영역에서도 AI/자동화가 없다면 2026년에는 같은 인건비로 만드는 산출물의 차이가 빠르게 벌어집니다. 위임 6개월차에 가장 빨리 보완해야 할 격차입니다.'
    },
    B6: {
      headline: '가설은 세웠다는데 결론은 한 달 뒤에 도착합니다',
      body: '가설→실행→측정의 한 사이클이 2주 안에 닫히지 않으면 회사는 학습 속도가 아닌 보고서 속도로 굴러갑니다. TS형의 답답함은 대부분 마케터 역량이 아니라 사이클 타임에서 옵니다.'
    },
  },
  FS: {
    B1: {
      headline: '톤은 사장님 안에서 통일되지만, 회사 밖으로 나갈 가이드가 한 줄도 없습니다',
      body: '1인 다역 회사는 사장님 한 명이 톤 가이드 그 자체라 사장님이 멈출 때 일관성이 멈춥니다. 한 줄짜리 가이드를 외부에 남기는 게 첫 한 수입니다.'
    },
    B2: {
      headline: '매주 결정에 쓸 숫자가 사장님 머릿속에만 있습니다',
      body: '사장님의 직감은 빠르지만 다음 사람에게 이양되지 않습니다. 매주 보는 숫자 3개를 종이 한 장에 적는 순간 회사는 처음으로 데이터를 갖습니다.'
    },
    B3: {
      headline: '매주 올리고 있지만, 6개월 뒤 평가될 누적이 안 만들어지고 있습니다',
      body: '콘텐츠 발행이 사장님 일정에 묶여 있어 시리즈가 끊기는 빈도가 가장 큽니다. 30분 콘텐츠 1개를 매주 같은 요일에 박는 것만으로 시스템이 시작됩니다.'
    },
    B4: {
      headline: '사장님이 만난 고객 5명의 이해는 깊은데, 회사 밖에 한 줄도 안 남아있습니다',
      body: '1인 다역 회사의 고객 이해는 사장님 머릿속에 가장 깊지만 한 줄도 외부에 남지 않는 회사가 가장 많습니다. 인터뷰 5건을 종이에 옮기는 순간 회사의 첫 페르소나가 생깁니다.'
    },
    B5: {
      headline: '사장님이 직접 쓰는 AI는 빠른데, 회사 워크플로우에는 박혀 있지 않습니다',
      body: '사장님이 쓰는 AI가 다음 사람에게 이양되지 않는 게 1인 다역 회사의 흔한 격차입니다. AI가 쓰이는 워크플로우 1개를 글로 적는 순간 회사의 자산이 됩니다.'
    },
    B6: {
      headline: '가설을 세우는 사람과 검증하는 사람이 같아 사이클이 닫히지 않습니다',
      body: '사장님이 가설·실행·검증을 모두 하면 가설을 부정하기가 가장 어렵습니다. 외부 검증자 1명(데이터·고객 인터뷰)을 사이클에 넣는 게 첫 한 수입니다.'
    },
  },
  FG: {
    B1: {
      headline: '광고 톤과 자사 채널 톤이 다른 회사로 보이는 12개월 구간입니다',
      body: '광고로 데려온 고객이 자사 채널에서 이탈하는 12개월 구간입니다. ROAS 하락의 절반은 톤 분리에서 옵니다.'
    },
    B2: {
      headline: '광고비 곡선은 매주 보면서 매출 곡선은 매월 봅니다',
      body: '광고비와 매출의 측정 주기가 어긋난 회사는 12개월 안에 효율 한 단계가 떨어집니다. 매주 같은 화면에 두 곡선을 띄우는 게 첫 한 수입니다.'
    },
    B3: {
      headline: '광고 소재는 매주 도는데 자사 채널 콘텐츠는 누적되지 않습니다',
      body: '광고가 멈췄을 때 매출이 즉시 멈추는 구조는 자사 채널 누적이 약하다는 신호입니다. 광고 KPI와 자사 채널 KPI를 분리해 보는 게 첫 한 수입니다.'
    },
    B4: {
      headline: '광고 타게팅은 정교한데 고객 인터뷰 기록은 비어 있습니다',
      body: '타게팅 정교도와 고객 인터뷰 깊이의 격차가 벌어지면 광고가 데려오는 고객과 실제 구매자가 분리됩니다. 분기 1회 5건 인터뷰로 갭이 닫힙니다.'
    },
    B5: {
      headline: '광고는 자동화됐는데 콘텐츠·고객 응대는 사람 시간으로만 굴러갑니다',
      body: '광고만 자동화하고 나머지를 사람 시간으로 굴리는 회사는 인건비 곡선이 매출 곡선을 추월합니다. 2026년의 격차는 자동화 영역의 폭에서 벌어집니다.'
    },
    B6: {
      headline: '캠페인 1개의 학습이 다음 캠페인에 박히기까지 한 분기가 걸립니다',
      body: '캠페인 학습 속도가 분기 단위면 광고 효율이 12개월 안에 한 단계 떨어집니다. 캠페인 종료 후 1주 안에 학습 1줄을 박는 사이클이 격차를 만듭니다.'
    },
  },
  TG: {
    B1: {
      headline: '팀이 커진 만큼 채널마다 결정자가 늘어 톤이 흩어지고 있습니다',
      body: '팀 규모가 커진 회사에서 가장 먼저 깨지는 게 톤 일관성입니다. 가이드라인 1장과 분기별 검수 사이클이 다음 한 뼘의 시작점입니다.'
    },
    B2: {
      headline: '팀별 대시보드는 있지만, 사장님 화면의 한 장 대시보드는 비어 있습니다',
      body: '팀이 자체 대시보드를 굴리는 회사도 사장님이 다음 한 수를 결정할 한 장 대시보드는 따로입니다. 2026년의 격차는 팀 대시보드가 아니라 의사결정 대시보드에서 벌어집니다.'
    },
    B3: {
      headline: '콘텐츠 발행은 시스템인데, 시리즈의 다음 시즌은 안 정해져 있습니다',
      body: '팀이 갖춰진 회사도 6개월 이상 가는 시리즈를 굴리는 데는 약합니다. 분기별 시리즈 1개 + 상시 발행 시스템의 분리가 다음 한 뼘의 구조입니다.'
    },
    B4: {
      headline: '팀이 만든 페르소나가 다음 단계 신규 세그먼트를 못 따라잡고 있습니다',
      body: '1→10에서 잡힌 페르소나가 10→100을 못 따라가는 게 TG형의 흔한 정체 지점입니다. 6개월 단위 갱신 사이클이 필요합니다.'
    },
    B5: {
      headline: '팀별 AI 도입은 진행 중인데, 회사 차원의 자동화 지도는 비어 있습니다',
      body: '팀별로 AI를 쓰는 회사는 많지만 회사 차원에서 어디까지 자동화됐는지를 한 장에 정리한 회사는 드뭅니다. 다음 한 뼘은 이 지도에서 시작됩니다.'
    },
    B6: {
      headline: '팀 의사결정 사이클이 회사가 자라는 속도보다 길어졌습니다',
      body: '팀 규모가 커진 회사의 의사결정 사이클이 가장 빨리 늘어납니다. 분기 단위를 격주 단위로 줄이는 구조 1개가 다음 한 뼘의 시작점입니다.'
    },
  },
};

// 4유형별 함정 한 줄 (PART 1 하단)
const TRAP_DIAGNOSIS = {
  FS: '1인 다역으로 굴리는 회사는, 사장님의 체력과 시간에 매출 곡선이 묶여 있습니다.',
  FG: '광고비로 끌어올린 매출은 데이터 기반 의사결정이 안 깔리면 12개월 안에 다시 정체에 도착합니다.',
  TS: '위임은 했지만 검증 도구가 없는 상태가 6개월 이상이면, 마케터 교체보다 검증 시스템 부재가 원인일 가능성이 큽니다.',
  TG: '팀 규모는 갖췄지만 다음 단계 가설이 비어있는 회사는 셀프 진단보다 정밀 자문이 어울립니다.',
};

// 위험 신호 본문 (4유형 × 위험도)
const RISK_BODY = {
  FS: '대표 한 명이 모든 결정을 짊어진 구조라, 사장님이 멈추면 회사 마케팅이 멈춥니다.',
  FG: '광고비 곡선과 매출 곡선이 분리되기 시작하는 12개월 구간을 지나는 중입니다.',
  TS: '위임은 됐는데 검증이 안 되는 상태가 6개월 이상이면, "마케터 교체"가 답이 아닐 가능성이 큽니다.',
  TG: '팀 규모는 갖췄지만 다음 단계(브랜드·확장·해외)의 가설이 비어있습니다.',
};

// 2026 격차 카드 (B2 또는 B5 1~2점 시 표시)
const TREND_GAP = {
  B2: {
    headline: '데이터·대시보드가 1~2점 — 매주 의사결정을 직감으로 하고 있습니다',
    body: '2026년 시장에서 매주 데이터를 보지 못하는 회사와 보는 회사의 격차는 12개월 안에 매출 2~3배 차이로 벌어집니다.'
  },
  B5: {
    headline: 'AI·자동화 도입도가 1~2점 — 마케팅 워크플로우가 사람 시간으로만 굴러갑니다',
    body: '2026년에는 콘텐츠·고객 응대·리포트 중 최소 1개 영역이 AI/자동화로 굴러가지 않으면, 같은 인건비로 만들 수 있는 산출물의 차이가 빠르게 벌어집니다.'
  },
};

// ============ 렌더 ============

function renderHero() {
  document.getElementById('heroCode').textContent = `${code} · 코드`;
  document.getElementById('heroNickname').textContent = NICKNAMES[code] || code;
  document.getElementById('heroCatchphrase').textContent = CATCHPHRASES[code] || '';

  const ogTitle = `${NICKNAMES[code] || code} — 브랜드 성장 처방전`;
  document.getElementById('ogTitle').textContent = ogTitle;
  document.querySelector('meta[property="og:title"]').setAttribute('content', ogTitle);
}

function renderPart1() {
  // 점수 카드, 낮은 순 정렬
  const sorted = Object.entries(scores).sort((a, b) => a[1] - b[1]);
  const wrap = document.getElementById('part1Scores');
  wrap.innerHTML = sorted.map(([id, val]) => {
    const meta = AREA_META[id];
    const lowClass = val <= 2 ? 'score-card-low' : '';
    const tag = meta.tag2026 ? '<span class="tag-lime" style="margin-left:8px">2026</span>' : '';
    return `
      <div class="score-card ${lowClass}">
        <span class="score-card-name">${meta.name}${tag}</span>
        <span class="score-card-value">${val} / 4</span>
      </div>
    `;
  }).join('');

  // 종합 점수
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  document.getElementById('totalScore').textContent = total;

  // 함정 한 줄
  document.getElementById('part1Diagnosis').textContent = TRAP_DIAGNOSIS[code] || '';
}

function renderPart2() {
  // 위험도
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  const riskEl = document.getElementById('riskLevel');
  const labelEl = document.getElementById('riskLabel');
  let level;
  if (total <= 11) {
    level = 'high'; labelEl.textContent = '탈락 위험도 — 높음';
    riskEl.className = 'risk-card risk-card-high';
  } else if (total <= 17) {
    level = 'mid'; labelEl.textContent = '탈락 위험도 — 중간';
    riskEl.className = 'risk-card risk-card-mid';
  } else {
    level = 'low'; labelEl.textContent = '탈락 위험도 — 낮음';
    riskEl.className = 'risk-card risk-card-low';
  }
  document.getElementById('riskBody').textContent = RISK_BODY[code] || '';

  // 2026 트렌드 격차 카드 (B2 또는 B5 가장 낮은 쪽 우선)
  const lowB2 = scores.B2 <= 2;
  const lowB5 = scores.B5 <= 2;
  if (lowB2 || lowB5) {
    const pickKey = lowB5 && (!lowB2 || scores.B5 <= scores.B2) ? 'B5' : 'B2';
    const gap = TREND_GAP[pickKey];
    document.getElementById('trendGapHeadline').textContent = gap.headline;
    document.getElementById('trendGapBody').textContent = gap.body;
    document.getElementById('trendGapCard').style.display = 'block';
  }

  // C2 키워드 인용 카드 3장 (placeholder — 키워드 추출은 시드 받은 뒤 정교화)
  const c2Excerpt = c2 ? `"${c2.slice(0, 60)}${c2.length > 60 ? '…' : ''}"` : '(C2 응답 없음)';
  const cards = [
    {
      label: '본인이 쓴 답에서',
      body: c2Excerpt + ' — 이 한 줄 안에 우리가 본 핵심 신호가 있습니다.'
    },
    {
      label: '점수 패턴에서',
      body: `${AREA_META[Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]].name}이 가장 낮은 패턴은 ${code}형에서 자주 보입니다.`
    },
    {
      label: '시급 과제 선택에서',
      body: c1.length > 0
        ? `"${c1.map(id => ({ inflow: '신규 고객 유입', roas: '광고 ROAS', content: '콘텐츠 반응', data: '데이터·시스템', verify: '마케터 검증', next: '다음 단계' })[id] || id).join('", "')}" — 이건 위 ${AREA_META[Object.entries(scores).sort((a, b) => a[1] - b[1])[0][0]].name} 점수와 직결됩니다.`
        : '시급 과제를 선택하지 않으셨습니다.'
    },
  ];
  document.getElementById('diagnosticCards').innerHTML = cards.map(c => `
    <div class="risk-card" style="border-left:3px solid var(--orange)">
      <div style="font-size:12px;color:var(--orange);font-family:var(--mono);letter-spacing:0.05em;text-transform:uppercase;margin-bottom:8px">${c.label}</div>
      <p style="font-size:14px;line-height:1.6;color:var(--text);margin:0">${c.body}</p>
    </div>
  `).join('');

  // 격차 시각화 (가장 낮은 3영역, 현재 → +2점 가정)
  const lowest3 = Object.entries(scores).sort((a, b) => a[1] - b[1]).slice(0, 3);
  document.getElementById('gapVisualization').innerHTML = lowest3.map(([id, val]) => {
    const after = Math.min(val + 2, 4);
    return `
      <div style="margin-bottom:16px">
        <div style="font-size:13px;color:var(--sub);margin-bottom:8px">${AREA_META[id].name}</div>
        <div class="gap-bar-row">
          <span class="gap-bar-label">현재</span>
          <div class="gap-bar-track"><div class="gap-bar-fill gap-bar-fill-now" style="width:${val * 25}%"></div></div>
          <span class="gap-bar-value">${val}/4</span>
        </div>
        <div class="gap-bar-row">
          <span class="gap-bar-label">12주 후</span>
          <div class="gap-bar-track"><div class="gap-bar-fill gap-bar-fill-after" style="width:${after * 25}%"></div></div>
          <span class="gap-bar-value">${after}/4</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderPart3() {
  // 1순위 처방: 가장 낮은 영역
  const lowest = Object.entries(scores).sort((a, b) => a[1] - b[1])[0];
  const [areaId] = lowest;
  const prescription = PRESCRIPTIONS[code]?.[areaId] || PRESCRIPTIONS.TS?.[areaId] || {
    headline: `${AREA_META[areaId].name} 영역의 다음 한 수가 비어 있습니다`,
    body: '진단 결과를 바탕으로 한 정밀 처방은 30분 1:1에서 이어집니다.'
  };

  document.getElementById('prescriptionArea').textContent = `1순위 · ${AREA_META[areaId].name}`;
  document.getElementById('prescriptionHeadline').textContent = prescription.headline;
  document.getElementById('prescriptionBody').textContent = prescription.body;

  // TG형 자연 이탈 안내
  if (code === 'TG' || stage === 'series-a-plus' || team === '3+') {
    document.getElementById('tgExitNotice').style.display = 'block';
  }

  // 1:1 예약 CTA URL — 추후 캘린더 링크로 교체
  document.getElementById('bookingCta').href = `mailto:hi@brandrise.kr?subject=${encodeURIComponent(`[1:1 처방] ${code} · ${company || '진단자'}`)}&body=${encodeURIComponent('진단 결과 PDF를 보고 1:1 처방 받고 싶습니다.\n\n코드: ' + code + '\n회사: ' + company)}`;
}

function renderShare() {
  const shareUrl = window.location.origin + '/result?code=' + code;
  const shareText = `${NICKNAMES[code] || code} — 브랜드 성장 처방전`;

  document.getElementById('shareLink').addEventListener('click', () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      const btn = document.getElementById('shareLink');
      const orig = btn.textContent;
      btn.textContent = '복사됨!';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    });
  });

  document.getElementById('shareKakao').addEventListener('click', () => {
    // 카톡 SDK 미연결 — 일단 링크 복사로 대체
    navigator.clipboard.writeText(`${shareText}\n${shareUrl}`).then(() => {
      const btn = document.getElementById('shareKakao');
      const orig = btn.textContent;
      btn.textContent = '복사됨! 카톡에 붙여넣으세요';
      setTimeout(() => { btn.textContent = orig; }, 2000);
    });
  });
}

// ============ Init ============

renderHero();
renderPart1();
renderPart2();
renderPart3();
renderShare();
