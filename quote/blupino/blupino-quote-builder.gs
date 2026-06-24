/**
 * 블루피노(BLUPINO) 견적서 자동 생성 — 강훈 서식(병합 레이아웃) 재현
 * ─────────────────────────────────────────────────────────────
 * 실행: 강훈 복제본 시트 → 확장 → Apps Script → 붙여넣기 → buildBlupinoQuote
 * 기반: 2026-06-24 2차 상담(대표 권윤정 직접 진행) — ★ 1차 제안(내부 견적 검토 후 확정)
 * 구조: 워크샵 입구 + 2안 (코어 2,200만 / 풀 4,500만, VAT 별도)
 * ⚠️ 탭명이 견적A/견적B가 아니면 SHEET_FULL/SHEET_CORE 수정.
 * ⛔ 직접 경쟁사(골든메달 마르티넬리)는 견적서에 넣지 않는다 — 벤치마크 롤모델만(그라자·리추얼스).
 */

var SHEET_FULL = '견적A';   // → 블루피노 풀(4,500만)
var SHEET_CORE = '견적B';   // → 블루피노 코어(2,200만)

var COL = { A:200, B:430, C:135, D:90, E:140 };
var CLR = { band:'#4a6fd4', light:'#dbe5fb', gray:'#efefef', dark:'#d9d9d9', border:'#cfcfcf' };

function buildBlupinoQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var KPI = [
    "· 블루피노 브랜드 토대 + 사업전략 파트너십 — 검증된 제품(캔 충진 세계 유일·코스트코 발굴·무인양품 PB)을 받아낼 'BLUPINO' 그릇 구축",
    "· 입구: 브랜드/사업 워크샵으로 내년 사업플랜·IR 전략·우선순위 정리 → 머리만 많은 상태를 의사결정 프레임으로",
    "· 단기: BLUPINO 단일 브랜드 자산화(정체성·비주얼) — 국내 청송 사과 IP 더블다운",
    "· 중기: 해외 웰니스 드링크 IP 확장 토대 (미국 프리미엄 채널·투자 IR 연결)",
    "· 운영: 워크샵 1개월 → 2개월차 브랜딩 진입 (대표 소화 속도 정합)"
  ];
  var NOTES = [
    "· ★ 본 견적은 2026-06-24 2차 상담 기반 1차 제안 — 내부 검토 후 확정됩니다.",
    "· 금액은 VAT 별도 기준입니다.",
    "· 인쇄·샘플 제작·광고비·촬영 외 실비·인증 비용은 별도입니다.",
    "· 결제: 착수금 50% / 중간금 30% / 잔금 20%.",
    "· 계약 후 브랜드 방향성이 크게 변경될 경우 일정·비용이 조정될 수 있습니다."
  ];

  // 추가 논의 영역 (후속 단계 / 가격 없음)
  var DISCUSS_CORE = [
    {label:'인스타그램 리뉴얼·콘텐츠', desc:'3대째 농부 스토리 + 청송 사과밭 비주얼 콘텐츠 (유튜브 아닌 인스타 우선)'},
    {label:'청송 사과밭·제조현장 촬영', desc:'진정성 비주얼 자산 확보 (워크샵·브랜드 토대 합의 후)'},
    {label:'IR 장표 디자인 + 정부지원 설계', desc:'투자 IR 장표 + 팁스·스케일업·식품벤처육성 트랙 동행 설계'}
  ];
  var DISCUSS_FULL = [
    {label:'IR 장표 풀 디자인', desc:'투자사 5곳 후속 IR — 사업계획 = 브랜드 확장성 서사로 장표화 (5억 충진장비→코스트코 60억)'},
    {label:'정부지원 트랙 설계', desc:'내년 팁스·스케일업(농식품 5억 매칭)·식품벤처육성·디딤돌 R&D 동행 설계'},
    {label:'해외 웰니스 진출 + 자사몰 D2C', desc:'미국 프리미엄 채널(홀푸드·스퀘어) 웰니스 드링크 IP + 자사몰 D2C 첫 채널 (월 단위 리테이너)'}
  ];

  // 마케팅 방향 가안 (견적표 우측 G열) — 2026-06-24 미팅 발언 기반 / 블록 순서와 동일
  var P_WORKSHOP =
    "● 워크샵 제안 (입구)\n머리만 너무 많은 상태 → 내년 사업플랜·IR·우선순위 한 장으로\n" +
    "· 현재: 자판기·쌀음료·웰니스·수출·선물박스·유튜브 등 아이디어 과포화, 우선순위 미정\n" +
    "· 목표: 투트랙(국내 사과 IP / 해외 웰니스 드링크 IP) 전략 + 내년 사업·IR 플랜 정리\n" +
    "· 운영방식: 대표 동행 워크샵 → 의사결정 프레임 (브랜딩보다 먼저, 소화 속도 정합)\n" +
    "· 예시: 강훈목장·심박(우리 사업동행 사례)";
  var P_BRAND =
    "● 브랜드 토대 제안\n'예쁜 제품' → 아무도 못 건드는 'BLUPINO' 브랜드 (그릇)\n" +
    "· 현재: 검증은 끝났는데(코스트코·무인양품 PB) BLUPINO 자산이 비어 카피·갑을에 취약\n" +
    "· 목표: 포지셔닝·메시지 + BLUPINO 단일 브랜드 자산화 (250ml 통일 라벨·캔 정비)\n" +
    "· 방향: 미국 수출 염두 — 10년 가는·판 흔드는 디자인 베이스\n" +
    "· 예시: 그라자(원물 하나→미국 유니콘) · 리추얼스";
  var P_INSTA =
    "● 인스타 리뉴얼 제안\n방치된 인스타 → 3대째 농부 스토리 + 키치한 바이럴 투트랙\n" +
    "· 현재: 인스타 방치·관리 공백 / 대표는 유튜브 고민 중이나 식품은 인스타가 적합\n" +
    "· 운영방식: 제품 감도는 높게 + 콘텐츠는 키치하게 / 기획·촬영 브랜드라이즈, 운영은 내부\n" +
    "· 예시: 베지어트(원물 플레이 저장 폭발) · 그라자(키치 바이럴)";
  var P_SHOOT =
    "● 촬영 제안\n포스트코 박스 그대로 → 청송 사과밭·제조현장 진정성 비주얼\n" +
    "· 현재: 진정성(농사→제조→판매 직접)에 비해 보여줄 시각 언어 부재\n" +
    "· 목표: 3대째 청송 농부 + 당일 착즙 제조 스토리를 브랜드 비주얼 자산으로\n" +
    "· 활용: 인스타·IR·박람회(카페쇼·신세계)·해외 셀시트 공용";

  var core = {
    title:'[브랜드라이즈] 블루피노 브랜드 토대 — 견적 코어', ver:'2026-06-24 ver. (1차 제안)',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'2) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_CORE },
    blocks:[
      { name:'0) 브랜드·사업 워크샵 + 전략', staffing:'대표 1인, 디렉터 1인, 기획 1인 / 약 4주',
        danga:12000000, qty:'1', subtotal:12000000,
        items:[
          {label:'브랜드/사업 워크샵 (입구)', desc:'대표 동행 워크샵 — 과포화된 아이디어를 의사결정 프레임으로\n내년 사업플랜 + IR 전략 + 우선순위 정리'},
          {label:'투트랙 전략 설계', desc:'국내 사과 IP 더블다운 / 해외 웰니스 드링크 IP 확장 — 두 축 정의'},
          {label:'시장 & 경쟁 분석', desc:'무첨가 과채 탄산·웰니스 드링크 카테고리 포지셔닝 (경쟁사 내부 분석)'},
          {label:'타겟 & 포지셔닝', desc:'핵심 타겟 정의(카페 B2B / 20~40 소비자 / 선물 수요) + 포지셔닝'},
          {label:'메시지 하우스', desc:'핵심 1 + 지지 3 + 증거(캔 충진 세계 유일·코스트코·무인양품 PB) 매핑'}
        ],
        deliver:['· 브랜드/사업 워크샵 결과 (사업플랜·IR 전략·우선순위)', '· 브랜드 전략 슬라이드 (포지셔닝·타겟·메시지 맵)'] },
      { name:'1) BI·핵심 패키지 정비', staffing:'디자인디렉터 1인, 디자이너 1~2인 / 약 4주',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'BLUPINO 단일 브랜드 자산화', desc:'로고·컬러·타이포 정비 — BLUPINO 단일 아이덴티티 체계'},
          {label:'핵심 패키지 라벨 정비', desc:'250ml 통일(주스·탄산) 라벨 + 캔 디자인 정비 / 미국 수출 염두 방향'},
          {label:'MD·B2B 셀시트', desc:'카페·베이커리·호텔·바이어 제안용 셀시트'}
        ],
        deliver:['· BI 가이드 + 핵심 패키지 라벨·캔 디자인 파일', '· B2B 셀시트'] }
    ],
    total:22000000, options:[],
    proposals:[P_WORKSHOP, P_BRAND]
  };

  var full = {
    title:'[브랜드라이즈] 블루피노 브랜드 토대 + 콘텐츠 — 견적 풀', ver:'2026-06-24 ver. (1차 제안)',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'4) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_FULL },
    blocks:[
      { name:'0) 브랜드·사업 워크샵 + 전략 (풀)', staffing:'대표 1인, 디렉터 1인, 기획 1인 / 약 4주',
        danga:15000000, qty:'1', subtotal:15000000,
        items:[
          {label:'브랜드/사업 워크샵 (입구)', desc:'대표 동행 워크샵 — 과포화 아이디어를 의사결정 프레임으로\n내년 사업플랜 + IR 전략 + 우선순위 정리'},
          {label:'투트랙 전략 + 웰니스 IP 확장 설계', desc:'국내 사과 IP / 해외 웰니스 드링크 IP — 확장성(사과만이 아닌 건강 드링크) 구조 설계'},
          {label:'시장 & 경쟁 분석', desc:'무첨가 과채 탄산·웰니스 드링크 카테고리 포지셔닝 (경쟁사 내부 분석)'},
          {label:'타겟 & 포지셔닝', desc:'핵심 타겟 정의 + 포지셔닝 + 국내/수출 인식 차이 반영'},
          {label:'메시지 하우스 + IR 베이스', desc:'핵심 1 + 지지 3 + 증거 매핑 / 투자 IR 장표 베이스'}
        ],
        deliver:['· 워크샵 결과(사업플랜·IR 전략·우선순위)', '· 브랜드 전략 슬라이드 + IR 메시지 베이스'] },
      { name:'1) BI·패키지 리뉴얼 + 셀시트', staffing:'디자인디렉터 1인, 디자이너 2인 / 약 6주',
        danga:15000000, qty:'1', subtotal:15000000,
        items:[
          {label:'BLUPINO 단일 브랜드 자산화', desc:'로고·컬러·타이포 풀 정비 — 미국향 10년 가는 디자인 방향'},
          {label:'패키지·라벨 리뉴얼', desc:'250ml 통일(주스·탄산) + 캔 디자인 풀 리뉴얼 / 국문·영문 표기'},
          {label:'기프트셋 (선물 박스)', desc:'여름 선물 수요 대응 — 기억에 남는 선물 패키지 구조·디자인'},
          {label:'MD·B2B·해외 셀시트', desc:'카페·베이커리·호텔·해외 바이어 제안용 셀시트'}
        ],
        deliver:['· BI 가이드 + 패키지·캔 리뉴얼 + 기프트셋 인쇄용 파일', '· 셀시트'] },
      { name:'2) 인스타그램 리뉴얼 + 콘텐츠 + 시딩', staffing:'기획 1인, 디자이너 1인 / 약 1개월',
        danga:8000000, qty:'1', subtotal:8000000,
        items:[
          {label:'인스타 리뉴얼 설계', desc:'방치된 계정 → 3대째 농부 스토리 + 키치한 바이럴 투트랙 구조'},
          {label:'무드보드 + 콘텐츠 캘린더', desc:'브랜드 무드보드 + 1개월 집중 콘텐츠 기획 (제품 감도 ↑ / 콘텐츠 키치)'},
          {label:'릴스 패턴 + 인플루언서 시딩', desc:'릴스 시나리오 + 카페·푸드 시딩 후보 (운영은 내부)'}
        ],
        deliver:['· 인스타 무드보드 + 콘텐츠 기획안', '· 릴스 패턴 + 시딩 리스트'] },
      { name:'3) 청송 사과밭·제조현장 촬영', staffing:'기획 1인, 외주 촬영 1팀 / 약 1개월',
        danga:7000000, qty:'1', subtotal:7000000,
        items:[
          {label:'촬영 기획·디렉팅', desc:'3대째 청송 농부 + 당일 착즙 제조 스토리 비주얼 기획'},
          {label:'현장 촬영 (사진·영상)', desc:'청송 사과밭·제조현장 1일 풀데이 (A컷·B컷 + 릴스 소스)'},
          {label:'비주얼 자산 정리', desc:'인스타·IR·박람회·해외 셀시트 공용 비주얼 자산 셋'}
        ],
        deliver:['· 브랜디드 사진·영상 (촬영 결과물)', '· 비주얼 자산 가이드'] }
    ],
    total:45000000, options:[],
    proposals:[P_WORKSHOP, P_BRAND, P_INSTA, P_SHOOT]
  };

  renderQuote_(ss, SHEET_CORE, '견적B · 블루피노 코어(2,200만)', core);
  renderQuote_(ss, SHEET_FULL, '견적A · 블루피노 풀(4,500만)', full);

  ['매출','제품','사업목표'].forEach(function(n){
    var sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  try { SpreadsheetApp.getUi().alert('✅ 블루피노 견적 생성 완료. 견적A(풀)/견적B(코어) 탭 확인.'); }
  catch(e){ Logger.log('완료'); }
}

function renderQuote_(ss, sheetName, newName, d) {
  // 멱등 처리: 입력명(견적A) 또는 출력명(견적A · 블루피노…) 어느 쪽이든 기존 탭 재사용
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

  // ── 2. KPI 밴드 (A:E 병합, 파랑)
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

  // ── 6. 선택 촬영 블록 (합계 아래, 별도 / itemized 가격)
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
  // 선택 촬영 블록
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
  // 콘텐츠를 출력 탭으로 옮겼으니, 입력명(견적A/견적B)으로 남은 잔여 빈 탭 제거
  ss.getSheets().forEach(function(s){
    if (s.getName()===sheetName && s.getSheetId()!==sh.getSheetId() && ss.getSheets().length>1) {
      try { ss.deleteSheet(s); } catch(e){}
    }
  });
}
