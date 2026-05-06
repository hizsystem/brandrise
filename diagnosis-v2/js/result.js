/**
 * 모수 v2 트리거 진단서 — 결과지 렌더링
 *
 * 입력: URL params { code, B1~B6, c1, c2, stage, team, email, company }
 * 렌더: Hero(코드+별명+캐치) / PART 1(점수표) / PART 2(위험·격차·인용 카드) / PART 3(처방+CTA)
 *
 * 카피 데이터(NICKNAMES, CATCHPHRASES, RISK_BODY, PRESCRIPTIONS)는 시드 받기 전 placeholder.
 * 워크샵 1·2·3 산출물 받으면 이 파일의 데이터 객체만 교체하면 됨.
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

// ============ 카피 데이터 (★ 시드 받기 전 placeholder) ============

// TODO(시드 워크샵 1): 별명 4세트 + 한줄 캐치
const NICKNAMES = {
  FS: '{TBD: FS 별명}',
  FG: '{TBD: FG 별명}',
  TS: '{TBD: TS 별명 — 골든 타겟}',
  TG: '{TBD: TG 별명}',
};

const CATCHPHRASES = {
  FS: '{TBD: FS 한줄 캐치}',
  FG: '{TBD: FG 한줄 캐치}',
  TS: '{TBD: TS 한줄 캐치}',
  TG: '{TBD: TG 한줄 캐치}',
};

// TODO(시드 워크샵 2): TS형 처방 헤드라인 6개
// TS형 시드 받은 뒤, FS/FG/TG는 시드를 변주해서 자동 생성 (24개 매트릭스)
const PRESCRIPTIONS = {
  TS: {
    B1: { headline: '{TBD: TS·B1 처방 헤드라인}', body: '{TBD: TS·B1 첫 단락}' },
    B2: { headline: '{TBD: TS·B2 처방 헤드라인}', body: '{TBD: TS·B2 첫 단락}' },
    B3: { headline: '{TBD: TS·B3 처방 헤드라인}', body: '{TBD: TS·B3 첫 단락}' },
    B4: { headline: '{TBD: TS·B4 처방 헤드라인}', body: '{TBD: TS·B4 첫 단락}' },
    B5: { headline: '{TBD: TS·B5 처방 헤드라인}', body: '{TBD: TS·B5 첫 단락}' },
    B6: { headline: '{TBD: TS·B6 처방 헤드라인}', body: '{TBD: TS·B6 첫 단락}' },
  },
  // FS/FG/TG는 TS 시드 변주 후 채움
  FS: {}, FG: {}, TG: {},
};

// 4유형별 함정 한 줄 (PART 1 하단)
const TRAP_DIAGNOSIS = {
  FS: '{TBD: FS는 대체로 이런 함정에 잘 빠져요 — 1인 다역이 만든 무계획성}',
  FG: '{TBD: FG는 대체로 이런 함정에 잘 빠져요 — 광고비 의존이 만든 콘텐츠 정체}',
  TS: '{TBD: TS는 대체로 이런 함정에 잘 빠져요 — 위임은 했으나 검증 도구가 없어서}',
  TG: '{TBD: TG는 대체로 이런 함정에 잘 빠져요 — 팀이 커진 만큼 의사결정 속도가 떨어짐}',
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
    headline: '{시드 받기 전 placeholder}',
    body: '{시드 받기 전 placeholder}'
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
