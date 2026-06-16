/**
 * BRANDRISE 견적서 구글시트 빌더 — 통합표준 템플릿 (강훈 서식 병합 레이아웃)
 * ─────────────────────────────────────────────────────────────────────
 * 정본: 1,000만 초과 고액 견적 (quote/_FORMAT.md 규모별 분기)
 * 사용법: 강훈 워크북 복제본 → 확장 → Apps Script → 이 파일 붙여넣기
 *        → "교체 영역"의 데이터 객체만 브랜드에 맞게 교체 → buildBrandQuote 실행
 *
 * ⚠️ renderQuote_() = 브랜드 무관 범용 렌더 엔진 — 수정 금지.
 *    레이아웃·서식 로직 수정은 모든 브랜드에 영향 → 이 템플릿에서만 고치고 전파.
 *    (최신 검증 사례: quote/simbak/simbak-quote-builder.gs, 2026-06-08)
 *
 * 강훈 서식의 3대 요소:
 *  ① 파트너십 KPI(좌 A:B) ↔ 비고(우 C:E) 좌우 2단 병합
 *  ② 블록당 단가/수량/계약견적 = 항목 행에 걸친 세로 병합 1칸
 *  ③ 구분(A열) 항목별 소제목 + 항목(B열) 설명
 * + G열 "마케팅 방향 가안" (블록 헤더~소계 범위에 정렬)
 *
 * 견적 원칙 (quote/_FORMAT.md):
 *  · 단가 공유 원칙 — 공통 항목 단가는 브랜드 불문 동일. 총액 조정은 항목·블록·수량으로만.
 *  · ⛔ M/M 노임단가표(투여율·1일인건비·제경비) 금지.
 *  · 2안 앵커링 — 코어 = 하한 앵커, 풀 = 토대를 제대로. 금액 차이는 블록 깊이로.
 *  · 가안의 예시 브랜드 = 우리 작업사례 + 벤치마크 롤모델. ⛔ 직접 경쟁사 금지.
 *  · 가안 첫 줄 = "현재 → 되고 싶은 모습" 화살표 한 줄. 미팅 발언 그대로가 가장 강하다.
 */

// ═══════════ 교체 영역 ① — 탭명·실행 함수명 ═══════════
var SHEET_FULL = '견적A';   // → {브랜드} 풀
var SHEET_CORE = '견적B';   // → {브랜드} 코어

var COL = { A:200, B:430, C:135, D:90, E:140 };
var CLR = { band:'#4f46e5', light:'#eef2ff', gray:'#efefef', dark:'#d9d9d9', border:'#cfcfcf' }; // 인디고 통일 (2026-06-11)

function buildBrandQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ═══════════ 교체 영역 ② — KPI(파트너십 방향 3~4줄) · 비고 ═══════════
  var KPI = [
    "· {브랜드} ○○ 파트너십 — 한 줄 방향 (미팅에서 합의한 문장)",
    "· 단기 목표: …",
    "· 장기 목표: … (후속 단계)",
    "· 프로젝트 운영 기간: ○월 착수 기준 약 ○개월"
  ];
  var NOTES = [
    "· 본 견적서의 금액은 VAT 별도 기준입니다.",
    "· 인쇄·샘플 제작·광고비·물류 비용은 별도입니다.",
    "· 결제: 착수금 50% / 중간금 30% / 잔금 20%.",
    "· 계약 후 브랜드 방향성이 크게 변경될 경우 일정·비용이 조정될 수 있습니다."
  ];

  // ═══════════ 교체 영역 ③ — 추가 논의 영역 (가격 없는 후속 항목) ═══════════
  var DISCUSS_CORE = [
    {label:'자사몰 활성화 세팅', desc:'자사몰 활성화 + D2C 전환 설계'},
    {label:'고객 CRM 운영', desc:'고객 CRM 세팅 및 기획 운영'}
  ];
  var DISCUSS_FULL = [
    {label:'고객 CRM 운영', desc:'고객 CRM 세팅 및 기획 운영'},
    {label:'퍼포먼스 광고 운영', desc:'전환 캠페인 + 리텐션 (월 단위 리테이너)'}
  ];

  // ═══════════ 교체 영역 ④ — 마케팅 방향 가안 (blocks와 동일 순서!) ═══════════
  // 3단 구조: 개선지점(라벨은 "현재" — 대표 자존심 고려) / 목표 / 운영방식·예시 브랜드
  // 핵심 블록(대표 페인 직결)은 3단으로 길게, 나머지는 압축형 한 셀.
  var P_BLOCK0 =
    "● 제안\n{현재 모습} → {되고 싶은 모습} (화살표 한 줄 — 미팅 발언 그대로)\n" +
    "· 현재: …\n" +
    "· 목표: …\n" +
    "· 예시 브랜드: {우리 작업사례} · {벤치마크 롤모델}";
  var P_BLOCK1 =
    "● 제안\n{현재} → {목표}\n" +
    "· 현재: …\n· 목표: …\n· 예시 브랜드: …";

  // ═══════════ 교체 영역 ⑤ — 코어/풀 데이터 ═══════════
  // 블록은 0~4에서 취사: 0)브랜드 기획 1)BI·패키지 2)자사몰 3)SNS·인플루언서 4)촬영(옵션)
  var core = {
    title:'[브랜드라이즈] {브랜드} ○○ — 견적 코어', ver:'YYYY-MM-DD ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'2) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_CORE },
    blocks:[
      { name:'0) 브랜드 기획', staffing:'디렉터 1인, 기획 1인 / 약 4주',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'시장 & 경쟁 브랜드 분석', desc:'카테고리 포지셔닝 분석\n채널별 가격대/리뷰/감도 스캐닝'},
          {label:'타겟 분석 & 포지셔닝 전략', desc:'핵심 타겟 페르소나 도출'},
          {label:'메시지 하우스', desc:'핵심 1 + 지지 3 + 증거 매핑'}
        ],
        deliver:['· 브랜드 전략 슬라이드 (포지셔닝·타겟·메시지 맵)'] },
      { name:'1) {두 번째 블록}', staffing:'…/ 약 ○주',
        danga:0, qty:'1', subtotal:0,
        items:[
          {label:'…', desc:'…'}
        ],
        deliver:['· …'] }
    ],
    total:10000000, options:[],
    proposals:[P_BLOCK0, P_BLOCK1]   // blocks와 동일 순서·동일 개수
  };

  var full = {
    title:'[브랜드라이즈] {브랜드} ○○ — 견적 풀', ver:'YYYY-MM-DD ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'3) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_FULL },
    blocks:[
      // 코어 블록 + 깊이 확장 (기간·산출물·블록 추가). 공통 항목 단가는 코어와 동일 유지.
    ],
    total:0, options:[],
    proposals:[]
  };

  renderQuote_(ss, SHEET_CORE, '견적B · {브랜드} 코어(○○만)', core);
  renderQuote_(ss, SHEET_FULL, '견적A · {브랜드} 풀(○○만)', full);

  // 복제 원본의 잔여 탭 제거 (탭명은 워크북에 맞게 수정)
  ['매출','제품','사업목표'].forEach(function(n){
    var sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  try { SpreadsheetApp.getUi().alert('✅ {브랜드} 견적 생성 완료. 견적A(풀)/견적B(코어) 탭 확인.'); }
  catch(e){ Logger.log('완료'); }
}

// ═══════════════════════════════════════════════════════════════════
// v3 (2026-06-15 1차 논의) — 셀렉 매트릭스 자동 산출
// ─────────────────────────────────────────────────────────────────
// 미팅 핵심: 견적 금액은 고정 불가(시가). 항목별 난이도(L1·L2·L3)를
// 상담 중 셀렉하면 단가가 자동 합산되어 blocks/total로 조립된다.
//  · 난이도 = 투입 주체/사양:  L1 경량(프리랜서) / L2 표준(내부)★ / L3 풀(외주·고사양)
//  · 단가 공유 원칙: 아래 단가는 브랜드 불문 동일. L2 = 현 NGT 단가 앵커.
//  · 매출 envelope: 연 마케팅비 ≈ 매출 × 15%(화장품 등 최대 30%).
//    3~6개월분으로 환산해 '셀렉 총액이 그 안에 드는지' sanity check.
// ═══════════════════════════════════════════════════════════════════

// 단가 매트릭스 (원). monthly:true 항목은 단가=월정액 → subtotal=단가×개월.
var SELECT_MATRIX = {
  '진단':     { name:'데이터 진단 + 시장 서베이',          L1: 5000000,  L2:10000000, L3:20000000 },
  '아이덴티티':{ name:'브랜드 아이덴티티 정립 + 제품체계 전략', L1:10000000, L2:20000000, L3:35000000 },
  '디자인':   { name:'브랜드 로고 & 패키지 디자인 리뉴얼',     L1:15000000, L2:30000000, L3:50000000 },
  '촬영':     { name:'사진 촬영(제품·라이프스타일) + 콘텐츠 제작', L1: 5000000,  L2:15000000, L3:30000000 },
  '마케팅':   { name:'인스타그램 콘텐츠 기획 & 운영',    L1:10000000, L2:20000000, L3:40000000 },
  'IMC':      { name:'브랜드 IMC 전략 파트너십 / 대행사 fee', L1:  600000,  L2: 1400000, L3: 3000000, monthly:true },
  '자사몰':   { name:'자사몰(카페24) 세팅',       L1:12000000, L2:20000000, L3:30000000, optional:true }
};

// 매출 구간 → 추정 마케팅비(×15%) → 투입. 셀렉 총액 sanity check 용.
function budgetEnvelope_(annualRevenueWon) {
  var mk = Math.round(annualRevenueWon * 0.15);
  var band = annualRevenueWon < 1e8  ? '구간1 (~1억) · PM급'
           : annualRevenueWon < 1e9  ? '구간2 (1~10억) · 팀장·PM급'
           : annualRevenueWon < 5e9  ? '구간3 (10~50억) · 팀장급(일부 대표)'
           :                            '구간4 (50~100억+) · 대표 투입·수주확률↑';
  return { annualMarketing: mk, half: Math.round(mk/2), band: band };
}

// 셀렉 → blocks/total 조립. renderQuote_가 그대로 소비하는 형태로 반환.
//   selection 예: [{key:'진단', level:'L2'}, {key:'IMC', level:'L2', months:6}, ...]
function composeFromSelection_(selection, meta) {
  var blocks = [], total = 0, proposals = [];
  selection.forEach(function(s){
    var m = SELECT_MATRIX[s.key]; if (!m) return;
    var unit = m[s.level]; if (unit == null) return;
    var months = m.monthly ? (s.months || 6) : 1;
    var sub = unit * months;
    total += sub;
    blocks.push({
      name: (s.label || m.name) + ' [' + s.level + ']',
      staffing: s.staffing || (m.monthly ? months + '개월 상시' : '협의'),
      danga: unit, qty: m.monthly ? String(months) : '1', subtotal: sub,
      items: (s.items && s.items.length) ? s.items : [{label: m.name, desc: s.desc || '셀렉 레벨 ' + s.level}],
      deliver: s.deliver || ['· 협의']
    });
    proposals.push(s.proposal || '');
  });
  return {
    title: (meta && meta.title) || '[브랜드라이즈] 견적 — 셀렉',
    ver: (meta && meta.ver) || 'YYYY-MM-DD ver.',
    kpi: (meta && meta.kpi) || [], notes: (meta && meta.notes) || [],
    discuss: meta && meta.discuss, blocks: blocks, total: total,
    options: [], proposals: proposals
  };
}

// 셀렉 기반 견적 생성 — buildBrandQuote 대신 이걸 실행.
// "교체 영역" = SELECTION_FULL / SELECTION_CORE / REVENUE_WON 만 손대면 된다.
function buildSelectQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ═══ 교체 영역 ⑥ — 매출(원) · KPI · 비고 ═══
  var REVENUE_WON = 13500000000;        // {브랜드} 연매출(원) — 예: NGT 135억
  var env = budgetEnvelope_(REVENUE_WON);
  var KPI = [
    "· {브랜드} 파트너십 — 한 줄 방향 (미팅 합의 문장)",
    "· 매출 " + (REVENUE_WON/1e8) + "억 → " + env.band,
    "· 추정 연 마케팅비(×15%): 약 " + Math.round(env.annualMarketing/1e8*10)/10 + "억 / 6개월 약 " + Math.round(env.half/1e8*10)/10 + "억",
    "· 셀렉 총액이 위 envelope 안에 드는지 확인"
  ];
  var NOTES = [
    "· 본 견적서의 금액은 VAT 별도 기준입니다.",
    "· 인쇄·샘플 제작·광고비·물류 비용은 별도입니다.",
    "· 결제: 착수금 50% / 중간금 30% / 잔금 20%.",
    "· 항목·난이도(L1·L2·L3)·수량으로 범위 조정 — 단가는 브랜드 불문 동일."
  ];

  // ═══ 교체 영역 ⑦ — 풀/코어 셀렉 (key + level[, months]) ═══
  // key: 진단·아이덴티티·디자인·촬영·마케팅·IMC  /  level: L1·L2·L3
  var SELECTION_FULL = [
    { key:'IMC',      level:'L2', months:6 },
    { key:'진단',     level:'L2' },
    { key:'아이덴티티', level:'L2' },
    { key:'디자인',   level:'L2' },
    { key:'촬영',     level:'L2' },
    { key:'마케팅',   level:'L2' }
  ];
  var SELECTION_CORE = [
    { key:'진단',     level:'L2' },
    { key:'아이덴티티', level:'L2' }
  ];

  var meta = { kpi:KPI, notes:NOTES };
  var full = composeFromSelection_(SELECTION_FULL,
    Object.assign({ title:'[브랜드라이즈] {브랜드} — 견적 풀(셀렉)', ver:'YYYY-MM-DD ver.' }, meta));
  var core = composeFromSelection_(SELECTION_CORE,
    Object.assign({ title:'[브랜드라이즈] {브랜드} — 견적 코어(셀렉)', ver:'YYYY-MM-DD ver.' }, meta));

  renderQuote_(ss, SHEET_CORE, '견적B · {브랜드} 코어(셀렉)', core);
  renderQuote_(ss, SHEET_FULL, '견적A · {브랜드} 풀(셀렉)', full);

  ['매출','제품','사업목표'].forEach(function(n){
    var sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });
  try {
    SpreadsheetApp.getUi().alert('✅ 셀렉 견적 생성 완료. 풀=' + (full.total/1e4).toLocaleString() +
      '만 / 코어=' + (core.total/1e4).toLocaleString() + '만 · envelope ' + env.band);
  } catch(e){ Logger.log('완료 · 풀 ' + full.total + ' / 코어 ' + core.total); }
}

// ═══════════════════════════════════════════════════════════════════
// 범용 렌더 엔진 — 여기부터는 수정 금지 (모든 브랜드 공용)
// ═══════════════════════════════════════════════════════════════════
function renderQuote_(ss, sheetName, newName, d) {
  // 멱등 처리: 입력명 또는 출력명 어느 쪽이든 기존 탭 재사용
  var sh = ss.getSheetByName(newName) || ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);
  // 같은 출력명을 가진 '다른' 잔여 탭이 있으면 제거 (실패 재실행 청소)
  ss.getSheets().forEach(function(s){
    if (s.getName()===newName && s.getSheetId()!==sh.getSheetId() && ss.getSheets().length>1) {
      try { ss.deleteSheet(s); } catch(e){}
    }
  });
  try { sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).breakApart(); } catch(e){}
  sh.clear(); sh.clearNotes();

  var rows = [], merges = [], priceMerges = [], proposalRanges = [];
  function push(arr){ rows.push(arr); return rows.length; } // 반환 = 1-based 행번호

  // ── 1. 타이틀
  var rTitle = push([d.title, '', '', '', d.ver]);
  push(['','','','','']);

  // ── 2. KPI 밴드 (A:E 병합)
  var rBand = push(['파트너십의 KPI','','','','']);
  merges.push([rBand,1,1,5]);

  // ── 3. KPI(좌 A:B) ↔ 비고(우 C:E) 좌우 2단 — 높이 확보용 다중행 병합
  var lines = Math.max(d.kpi.length, d.notes.length);
  var rKpi = push([d.kpi.join('\n'), '', d.notes.join('\n'), '', '']);
  for (var i=1;i<lines;i++) push(['','','','','']);
  merges.push([rKpi,1,lines,2]);  // KPI
  merges.push([rKpi,3,lines,3]);  // 비고
  push(['','','','','']);

  // ── 4. 표 헤더
  var rHead = push(['구분','항목','단가','수량','계약 견적']);

  // ── 5. 블록
  var blockHdr = [], deliverRows = [], subRows = [];
  d.blocks.forEach(function(b, bi){
    var rH = push([b.name, '', b.staffing, '', '']);   // 스태핑 밴드 C:E
    blockHdr.push(rH); merges.push([rH,3,1,3]);
    var itemStart = rows.length + 1;
    b.items.forEach(function(it){ push([it.label, it.desc, '', '', '']); });
    var itemEnd = rows.length;
    if (itemEnd >= itemStart) {
      priceMerges.push([3, itemStart, itemEnd, b.danga]);    // 단가 세로병합
      priceMerges.push([4, itemStart, itemEnd, b.qty]);      // 수량 세로병합
      priceMerges.push([5, itemStart, itemEnd, b.subtotal]); // 계약견적 세로병합
    }
    var rD = push(['>> 최종 납품 작업물', b.deliver.join('\n'), '', '', '']);
    deliverRows.push(rD);
    var rS = push(['소       계','','','', b.subtotal]); subRows.push(rS);
    merges.push([rS,1,1,4]);
    if (d.proposals && d.proposals[bi]) proposalRanges.push([rH, rS, d.proposals[bi]]);
  });
  var rTotal = push(['합       계 (VAT 별도)','','','', d.total]);
  merges.push([rTotal,1,1,4]);

  // ── 6. 선택 블록 (합계 아래, 별도 / itemized 가격)
  var rOptHdr = 0, rOptSub = 0;
  if (d.optionBlock){
    var ob = d.optionBlock;
    push(['','','','','']);
    rOptHdr = push([ob.name, '', ob.staffing, '', '']);
    merges.push([rOptHdr,3,1,3]);
    ob.itemized.forEach(function(it){ push([it.label, it.desc, it.danga, it.qty, it.amount]); });
    rOptSub = push(['소       계 (선택)','','','', ob.subtotal]);
    merges.push([rOptSub,1,1,4]);
  }

  // ── 7. 추가 논의 영역 (합계 아래, 가격 없음 / 후속 단계)
  var rDiscHdr = 0;
  if (d.discuss){
    push(['','','','','']);
    rDiscHdr = push([d.discuss.name, '', '', '', '']);
    merges.push([rDiscHdr,1,1,5]);   // 헤더 A:E 병합
    d.discuss.items.forEach(function(it){ push([it.label, it.desc, '', '', '']); });
  }

  var last = rows.length;

  // ── 값 일괄 입력
  sh.getRange(1,1,last,5).setValues(rows);

  // ── 병합 적용
  merges.forEach(function(m){ try{ sh.getRange(m[0],m[1],m[2],m[3]).merge(); }catch(e){} });
  priceMerges.forEach(function(p){
    var rng = sh.getRange(p[1],p[0],p[2]-p[1]+1,1);
    try{ rng.merge(); }catch(e){}
    sh.getRange(p[1],p[0]).setValue(p[3]);
  });

  // ── 열 너비
  sh.setColumnWidth(1,COL.A); sh.setColumnWidth(2,COL.B);
  sh.setColumnWidth(3,COL.C); sh.setColumnWidth(4,COL.D); sh.setColumnWidth(5,COL.E);

  // ── 전역 서식
  sh.getRange(1,1,last,5).setFontFamily('Noto Sans KR').setFontSize(10)
    .setVerticalAlignment('middle').setWrap(true);

  // 타이틀
  sh.getRange(rTitle,1).setFontSize(14).setFontWeight('bold');
  sh.getRange(rTitle,5).setHorizontalAlignment('right').setFontColor('#888888');
  // KPI 밴드
  sh.getRange(rBand,1).setBackground(CLR.band).setFontColor('#ffffff').setFontWeight('bold').setFontSize(11);
  // KPI/비고 본문
  sh.getRange(rKpi,1,lines,5).setVerticalAlignment('top').setFontSize(9.5);
  // 표 헤더
  sh.getRange(rHead,1,1,5).setBackground(CLR.light).setFontWeight('bold').setHorizontalAlignment('center');
  // 블록 헤더 (구분명 굵게, 스태핑 가운데)
  blockHdr.forEach(function(r){
    sh.getRange(r,1).setFontWeight('bold');
    sh.getRange(r,3).setHorizontalAlignment('center').setFontColor('#555555');
  });
  // 납품 행
  deliverRows.forEach(function(r){ sh.getRange(r,1,1,5).setBackground(CLR.light); sh.getRange(r,1).setFontWeight('bold'); });
  // 소계
  subRows.forEach(function(r){ sh.getRange(r,1,1,5).setBackground(CLR.gray).setFontWeight('bold'); sh.getRange(r,1).setHorizontalAlignment('center'); });
  // 합계
  sh.getRange(rTotal,1,1,5).setBackground(CLR.dark).setFontWeight('bold'); sh.getRange(rTotal,1).setHorizontalAlignment('center');
  // 선택 블록
  if (rOptHdr){
    sh.getRange(rOptHdr,1).setFontWeight('bold');
    sh.getRange(rOptHdr,3).setHorizontalAlignment('center').setFontColor('#555555');
  }
  if (rOptSub){
    sh.getRange(rOptSub,1,1,5).setBackground(CLR.gray).setFontWeight('bold');
    sh.getRange(rOptSub,1).setHorizontalAlignment('center');
  }
  // 추가 논의 영역 헤더 (연한 배경 + 굵게, 가격 없음)
  if (rDiscHdr){
    sh.getRange(rDiscHdr,1,1,5).setBackground(CLR.light);
    sh.getRange(rDiscHdr,1).setFontWeight('bold');
  }
  // 숫자 서식 (단가 C, 계약견적 E) + 수량 D 가운데
  sh.getRange(rHead,3,last-rHead+1,1).setNumberFormat('#,##0').setHorizontalAlignment('center');
  sh.getRange(rHead,4,last-rHead+1,1).setHorizontalAlignment('center');
  sh.getRange(rHead,5,last-rHead+1,1).setNumberFormat('#,##0').setHorizontalAlignment('center');
  // 테두리 (표 영역)
  sh.getRange(rHead,1,last-rHead+1,5).setBorder(true,true,true,true,true,true,CLR.border,SpreadsheetApp.BorderStyle.SOLID);

  // ── 8. 우측 '마케팅 방향 가안' (G열) — 견적표(A:E)와 별개 패스 / 블록 헤더~소계 범위에 정렬
  if (proposalRanges.length){
    sh.setColumnWidth(6, 28);    // F 간격
    sh.setColumnWidth(7, 380);   // G 가안
    sh.getRange(rHead,7).setValue('마케팅 방향의 가안 제시')
      .setFontFamily('Noto Sans KR').setFontWeight('bold').setFontSize(11)
      .setBackground(CLR.light).setHorizontalAlignment('center').setVerticalAlignment('middle');
    proposalRanges.forEach(function(p){
      var r0=p[0], r1=p[1];
      try { sh.getRange(r0,7,r1-r0+1,1).merge(); } catch(e){}
      sh.getRange(r0,7).setValue(p[2])
        .setFontFamily('Noto Sans KR').setFontSize(9.5)
        .setVerticalAlignment('top').setWrap(true).setBackground('#ffffff')
        .setBorder(true,true,true,true,false,false,CLR.border,SpreadsheetApp.BorderStyle.SOLID);
    });
  }

  if (sh.getName() !== newName) sh.setName(newName);
  // 콘텐츠를 출력 탭으로 옮겼으니, 입력명으로 남은 잔여 빈 탭 제거
  ss.getSheets().forEach(function(s){
    if (s.getName()===sheetName && s.getSheetId()!==sh.getSheetId() && ss.getSheets().length>1) {
      try { ss.deleteSheet(s); } catch(e){}
    }
  });
}
