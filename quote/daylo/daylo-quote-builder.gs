/**
 * BRANDRISE 견적서 구글시트 빌더 — 데이로(주식회사 이일오)
 * ─────────────────────────────────────────────────────────────────────
 * 생성: 2026-08-19 · 상담: 2026-08-19 · 전달 목표: 2026-08-25(화) 고벤처포럼
 * 엔진: quote/_template/quote-builder-template.gs 의 renderQuote_() (수정 금지)
 * 단가 출처: internal/price-data.js (SSOT) — 진단1,000 / 아이덴티티 L1 1,000·L2 2,000
 *           / 디자인 L2 3,000 / 무드보드 500 / 인스타기획 300
 * 4열 근거표: clients/brandrise/prep/2026-08-19-consult-daylo-wrapup.md §6
 *
 * 견적B(코어) 4,000만 = 브랜드 코어 라이트 1,000 + BI·패키지 3,000
 * 견적A(풀)   6,800만 = 진단 1,000 + 아이덴티티 2,000 + 디자인 3,000 + 무드보드 500 + 인스타기획 300
 */

// ═══════════ 교체 영역 ① — 탭명·실행 함수명 ═══════════
var SHEET_FULL = '견적A';   // → 데이로 풀
var SHEET_CORE = '견적B';   // → 데이로 코어

var COL = { A:200, B:430, C:135, D:90, E:140 };
var CLR = { band:'#4f46e5', light:'#eef2ff', gray:'#efefef', dark:'#d9d9d9', border:'#cfcfcf' };

function buildDayloQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  // ═══════════ 교체 영역 ② — KPI · 비고 ═══════════
  var KPI = [
    "· 데이로 브랜드 리뉴얼 파트너십 — '눈' 하면 떠오르는 브랜드의 기준을 만든다",
    "· 단기(11월 신제품 출시): 올리브영 매대에서 이기는 패키지 + 브랜드 코어 확정",
    "· 장기(2027~2028): 렌즈케어 → 아이뷰티 → 수면·피로 확장을 담는 브랜드 구조 설계",
    "· 운영 기간: 9월 착수 기준 약 8주 (10월 내 패키지 완료 = 11월 출시 역산)"
  ];
  var NOTES = [
    "· 본 견적서의 금액은 VAT 별도 기준입니다.",
    "· 인쇄·샘플 제작·촬영·광고비·물류 비용은 별도입니다.",
    "· 결제: 착수금 50% / 중간금 30% / 잔금 20%.",
    "· 브랜드명·제품 대명사는 후보 발굴과 검증(해외 발음성·상표 충돌 확인)까지 진행하며, 최종 결정은 대표님이 하십니다.",
    "· 정부지원사업(청년창업사관학교 등) 연계 시 파트별 분리 청구가 가능합니다.",
    "· 계약 후 브랜드 방향성이 크게 변경될 경우 일정·비용이 조정될 수 있습니다."
  ];

  // ═══════════ 교체 영역 ③ — 추가 논의 영역 ═══════════
  var DISCUSS_CORE = [
    {label:'브랜드 아이덴티티 풀 워크샵', desc:'제품체계·확장(아이뷰티·수면) 엄브렐라 구조 설계 — 견적A 참조'},
    {label:'인스타그램 무드보드 + 콘텐츠 기획', desc:'비주얼 기준을 채널 운영 문법으로 — 견적A 참조'},
    {label:'신제품 촬영', desc:'11월 출시 제품컷 (하우스 / 스타일리스트 구성별 별도 견적)'}
  ];
  var DISCUSS_FULL = [
    {label:'인스타그램 콘텐츠 운영', desc:'월 6~8건 기획·제작·업로드 (월 단위 리테이너)'},
    {label:'신제품 촬영', desc:'11월 출시 제품컷 (하우스 / 스타일리스트 구성별 별도 견적)'},
    {label:'자사몰 리뉴얼 · CRM', desc:'D2C 전환 설계 + 재구매 리텐션 운영'},
    {label:'정부지원사업 연계', desc:'청년창업사관학교 등 — 브랜딩 파트를 지원금 트랙으로 분리 진행'}
  ];

  // ═══════════ 교체 영역 ④ — 마케팅 방향 가안 (blocks와 동일 순서) ═══════════
  var P_DIAG =
    "● 제안\n" +
    "\"국내에 레퍼런스가 없다\" → 해외에서 이미 검증된 길을 가져온다\n\n" +
    "· 현재: 렌즈케어는 국내 비교 대상이 사실상 없어, 방향을 정할 근거가 대표님 감각에만 의존합니다.\n" +
    "· 목표: 눈을 축으로 확장한 해외 브랜드 8~10곳을 실물로 사서 해부합니다.\n" +
    "  (제품 아키텍처 / 슬로건 / 패키지 / 채널 / 확장 순서)\n" +
    "· 왜 필요한가: 2028년 아이뷰티·수면 확장은 이미 밟아간 길이 있습니다.\n" +
    "  그 길의 성공·실패 조건을 먼저 알고 시작하는 것과 아닌 것의 차이가 큽니다.\n" +
    "· 산출물: 글로벌 아이케어 레퍼런스 해부 보고서";
  var P_IDENTITY =
    "● 제안\n" +
    "\"습윤제\"는 남이 가져갔다 → 우리만 쓸 수 있는 말을 만든다\n\n" +
    "· 현재: 검색량을 500에서 15,000으로 키운 건 데이로인데,\n" +
    "  '습윤제'는 상표가 되지 않는 일반명사라 후발주자가 그대로 올라탑니다.\n" +
    "· 목표: 브랜드명과 제품 대명사를 하나의 체계로 설계합니다.\n" +
    "  (리뉴·페브리즈·스타일러처럼 카테고리를 대신하는 단어)\n" +
    "· 함께 잡는 것: 2028년 아이뷰티·수면 라인이 같은 이름 아래 들어올 수 있는 구조,\n" +
    "  그리고 그 구조를 한 문장으로 세우는 슬로건.\n" +
    "· 진행: 워크샵 2회 + 대표님 사전 설문 → 키워드 도출 → 후보 검증(해외 발음성·상표 충돌)\n" +
    "· 예시 브랜드: 베지어트(재정의로 올리브영 입점) · 빙커(해외 시장 선택 후 캐나다 억대)";
  var P_DESIGN =
    "● 제안\n" +
    "\"솔직히 제 제품 못생겼습니다\" → 인플루언서가 받자마자 올리고 싶은 제품\n\n" +
    "· 현재: 제품력과 매출은 이미 증명됐지만, 패키지가 그 수준을 따라가지 못합니다.\n" +
    "· 목표(대표님이 말씀하신 기준 그대로):\n" +
    "  ① 올리브영 스킨케어 매대에서 뒤지지 않는다\n" +
    "  ② 인플루언서가 받자마자 인스타에 올리고 싶다\n" +
    "  ③ 설명 없이도 이해된다\n" +
    "  ④ 기존 강자와 나란히 놨을 때 그쪽이 올드해 보인다\n" +
    "· 진행: 예쁜 디자인이 아니라 전략에서 내려온 디자인.\n" +
    "  경쟁 제품과 나란히 놓인 매대 상태를 구현해 '손이 가는가'로 검증합니다.\n" +
    "· 범위: 로고 / 습윤제·세척기 2종 패키지 / 동봉물(사용 가이드) / 선물세트 확장 가이드\n" +
    "· 예시 브랜드: 베지어트 — 패키지 전면 개편 직후 올리브영 MD 다이렉트 연락, 7월 올영 픽으로 매출 3배";
  var P_MOOD =
    "● 제안\n" +
    "제품이 바뀌면 채널도 같은 얼굴이어야 합니다\n\n" +
    "· 현재: 인스타그램이 광고 소재 창구에 가깝고, 브랜드의 얼굴로는 쌓이지 않는 상태입니다.\n" +
    "· 목표: 피그마 무드보드로 톤·컬러·촬영 앵글·자막 규칙을 고정해\n" +
    "  누가 만들어도 같은 얼굴이 나오게 합니다.\n" +
    "· 산출물: 인스타그램 무드보드 (피그마 원본 전달)";
  var P_PLAN =
    "● 제안\n" +
    "루틴을 파는 브랜드는 콘텐츠도 루틴이어야 합니다\n\n" +
    "· 현재: 콘텐츠가 제품 소구 단발로 소비되고, 다음 편이 이어지지 않습니다.\n" +
    "· 목표: 착용 전·중·후 루틴을 콘텐츠 시리즈 구조로 설계합니다.\n" +
    "· 산출물: 콘텐츠 카테고리 정의 + 시리즈 포맷 + 1개월치 예시안\n" +
    "· 운영 대행은 별도(추가 논의 영역)입니다.";
  var P_CORE_LIGHT =
    "● 제안\n" +
    "\"주말에 혼자 정리해봤습니다\" → 그 초안을 실행 가능한 기준으로\n\n" +
    "· 현재: 대표님이 미션·비전·코어밸류를 이미 정리해 오셨습니다. 방향은 맞습니다.\n" +
    "  다만 이 문장들이 아직 패키지·채널을 결정해 주는 기준까지는 내려오지 않았습니다.\n" +
    "· 목표: 해외 아이케어 브랜드 레퍼런스로 대조해 기준을 확정하고,\n" +
    "  브랜드명·제품 대명사 방향을 1차로 잡습니다.\n" +
    "· 진행: 대표님 사전 설문 → 레퍼런스 대조 → 워크샵 1회 → 브랜드 코어 시트\n" +
    "· 산출물: 브랜드 코어 시트 + 네이밍 방향 리포트 (패키지 디자인의 입력값)\n" +
    "· 예시 브랜드: 베지어트 · 빙커";

  // ═══════════ 교체 영역 ⑤ — 코어/풀 데이터 ═══════════
  var core = {
    title:'[브랜드라이즈] 데이로 브랜드 리뉴얼 — 견적 코어', ver:'2026-08-19 ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'2) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_CORE },
    blocks:[
      { name:'0) 브랜드 코어 정립 (라이트)', staffing:'디렉터 1인, 기획 1인 / 약 3주',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'글로벌 아이케어 레퍼런스 대조', desc:'눈을 축으로 확장한 해외 브랜드 스캐닝\n제품 아키텍처·슬로건·패키지 비교'},
          {label:'브랜드 코어 검증', desc:'대표님 정리안(미션·비전·코어밸류) 검증 및 정렬\n패키지·채널을 결정할 수 있는 기준 문장으로 확정'},
          {label:'네이밍 방향 1차', desc:'브랜드명·제품 대명사 후보 방향 도출\n해외 발음성·상표 충돌 1차 체크'}
        ],
        deliver:['· 브랜드 코어 시트 (포지셔닝·기준 문장·타겟)','· 네이밍 방향 리포트'] },
      { name:'1) BI 로고 & 패키지 디자인', staffing:'디자인 디렉터 1인, 디자이너 1인 / 약 5주',
        danga:30000000, qty:'1', subtotal:30000000,
        items:[
          {label:'브랜드 로고 리뉴얼', desc:'로고 · 컬러 · 타이포 시스템'},
          {label:'패키지 디자인 2종', desc:'습윤제 / 세척기 2세대\n매대 진열 시뮬레이션 검증 포함'},
          {label:'동봉물 디자인', desc:'사용 가이드 · 리플렛 구성 설계'},
          {label:'디자인 가이드', desc:'상세페이지·상세컷 적용 예시 포함\n선물세트 확장 가이드'}
        ],
        deliver:['· 로고 및 BI 가이드','· 패키지 디자인 원고 2종 (인쇄 입고용)','· 동봉물 디자인','· 브랜드 디자인 가이드북'] }
    ],
    total:40000000, options:[],
    proposals:[P_CORE_LIGHT, P_DESIGN]
  };

  var full = {
    title:'[브랜드라이즈] 데이로 브랜드 리뉴얼 — 견적 풀', ver:'2026-08-19 ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'3) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_FULL },
    blocks:[
      { name:'0) 데이터·시장 진단', staffing:'디렉터 1인, 리서처 1인 / 약 3주',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'글로벌 아이케어 레퍼런스 해부', desc:'눈을 축으로 확장한 해외 브랜드 8~10곳\n실물 구매 후 제품 아키텍처·슬로건·패키지·채널 해부'},
          {label:'카테고리 확장 경로 분석', desc:'렌즈케어 → 아이뷰티 → 수면·피로\n각 단계 선점 브랜드와 진입 조건 정리'},
          {label:'고객·시장 서베이', desc:'렌즈 착용 루틴 실사용 조사\n대표님 보유 고객 인터뷰 자료 통합 해석'}
        ],
        deliver:['· 글로벌 아이케어 레퍼런스 해부 보고서','· 카테고리 확장 경로 분석'] },
      { name:'1) 브랜드 아이덴티티 & 제품체계 전략', staffing:'디렉터 1인, 기획 1인 / 워크샵 2회 · 약 4주',
        danga:20000000, qty:'1', subtotal:20000000,
        items:[
          {label:'브랜드 코어 확정', desc:'미션·비전·코어밸류 검증 후 확정\n브랜드 한 문장(슬로건) 도출'},
          {label:'제품 대명사 · 네이밍 체계', desc:'브랜드명 후보 + 제품별 대명사 설계\n해외 발음성·상표 충돌 검증 (최종 결정은 대표님)'},
          {label:'제품체계·확장 구조', desc:'2027 렌즈케어 / 2028 아이뷰티·수면을 담는\n엄브렐라 구조 및 서브라인 네이밍 룰'},
          {label:'브랜드 워크샵 2회', desc:'사전 설문 → 키워드 도출 → 워크샵\n회차별 분석 보고서 제공'}
        ],
        deliver:['· 브랜드 아이덴티티 정의서','· 네이밍 체계 및 후보 검증 리포트','· 제품 확장 구조도','· 워크샵 회차별 보고서'] },
      { name:'2) BI 로고 & 패키지 디자인', staffing:'디자인 디렉터 1인, 디자이너 1인 / 약 5주',
        danga:30000000, qty:'1', subtotal:30000000,
        items:[
          {label:'브랜드 로고 리뉴얼', desc:'로고 · 컬러 · 타이포 시스템'},
          {label:'패키지 디자인 2종', desc:'습윤제 / 세척기 2세대\n매대 진열 시뮬레이션 검증 포함'},
          {label:'동봉물 디자인', desc:'사용 가이드 · 리플렛 구성 설계'},
          {label:'디자인 가이드', desc:'상세페이지·상세컷 적용 예시 포함\n선물세트 확장 가이드'}
        ],
        deliver:['· 로고 및 BI 가이드','· 패키지 디자인 원고 2종 (인쇄 입고용)','· 동봉물 디자인','· 브랜드 디자인 가이드북'] },
      { name:'3) 인스타그램 무드보드', staffing:'아트 디렉터 1인 / 약 2주',
        danga:5000000, qty:'1', subtotal:5000000,
        items:[
          {label:'채널 비주얼 기준 설계', desc:'톤 · 컬러 · 촬영 앵글 · 자막 규칙'},
          {label:'피드 무드보드 (피그마)', desc:'9~12컷 그리드 기준안'}
        ],
        deliver:['· 인스타그램 무드보드 (피그마 원본)'] },
      { name:'4) 인스타그램 콘텐츠 기획', staffing:'콘텐츠 기획 1인 / 약 2주',
        danga:3000000, qty:'1', subtotal:3000000,
        items:[
          {label:'콘텐츠 카테고리 정의', desc:'착용 전·중·후 루틴 기반 시리즈 구조'},
          {label:'시리즈 포맷 · 1개월 예시안', desc:'포맷별 훅·구성·CTA 설계'}
        ],
        deliver:['· 콘텐츠 기획서 (카테고리·포맷·1개월 예시안)'] }
    ],
    total:68000000, options:[],
    proposals:[P_DIAG, P_IDENTITY, P_DESIGN, P_MOOD, P_PLAN]
  };

  renderQuote_(ss, SHEET_CORE, '견적B · 데이로 코어(4,000만)', core);
  renderQuote_(ss, SHEET_FULL, '견적A · 데이로 풀(6,800만)', full);

  ['매출','제품','사업목표'].forEach(function(n){
    var sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  try { SpreadsheetApp.getUi().alert('✅ 데이로 견적 생성 완료. 견적A(풀)/견적B(코어) 탭 확인.'); }
  catch(e){ Logger.log('완료'); }
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
