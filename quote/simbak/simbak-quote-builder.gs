/**
 * 심박 견적서 자동 생성 v2 — 강훈 서식(병합 레이아웃) 완전 재현
 * ─────────────────────────────────────────────────────────────
 * 실행: 강훈 복제본(1yMx, green 소유) → 확장 → Apps Script → 붙여넣기 → buildSimbakQuote
 * ⚠️ 탭명이 견적A/견적B가 아니면 SHEET_FULL/SHEET_CORE 수정.
 *
 * 강훈 서식의 3대 요소를 재현:
 *  ① 파트너십 KPI(좌 A:B) ↔ 비고(우 C:E) 좌우 2단 병합
 *  ② 블록당 단가/수량/계약견적 = 항목 행에 걸친 세로 병합 1칸
 *  ③ 구분(A열) 항목별 소제목 + 항목(B열) 설명
 */

var SHEET_FULL = '견적A';   // → 심박 풀(7,000만)
var SHEET_CORE = '견적B';   // → 심박 코어(4,800만)

var COL = { A:200, B:430, C:135, D:90, E:140 };
var CLR = { band:'#4a6fd4', light:'#dbe5fb', gray:'#efefef', dark:'#d9d9d9', border:'#cfcfcf' };

function buildSimbakQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var KPI = [
    "· 심박 브랜드 토대 구축 파트너십 — 흩어진 채널·패키지를 '하나의 심박'으로 통합",
    "· 단기 목표: 수출 10개국·특허·인증 자산을 패키지·SNS의 소비자 언어로 번역",
    "· 장기 목표: 자사몰 중심 D2C 매출 기반 확보 (후속 단계)",
    "· 프로젝트 운영 기간: 가을 시즌(8~10월) 출시 정합 — 6월 초 착수 기준"
  ];
  var NOTES = [
    "· 본 견적서의 금액은 VAT 별도 기준입니다.",
    "· 인쇄·샘플 제작·광고비·물류·인증 갱신 비용은 별도입니다.",
    "· 결제: 착수금 50% / 중간금 30% / 잔금 20%.",
    "· 계약 후 브랜드 방향성이 크게 변경될 경우 일정·비용이 조정될 수 있습니다."
  ];

  // 추가 논의 영역 (후속 단계 / 가격 없음) — 쿠엔즈버킷·오늘의평야 표준 차용
  // 코어: 자사몰 미포함 → 자사몰을 추가 논의로 / 풀: 자사몰 본 블록 포함 → CRM·퍼포먼스만
  var DISCUSS_CORE = [
    {label:'자사몰 활성화 세팅', desc:'카페24 기준 자사몰 활성화 + D2C 전환 설계'},
    {label:'고객 CRM 운영', desc:'고객 CRM 세팅 및 기획 운영'},
    {label:'메타 광고 운영', desc:'메타 광고 콘텐츠 기획 운영'}
  ];
  var DISCUSS_FULL = [
    {label:'고객 CRM 운영', desc:'고객 CRM 세팅 및 기획 운영'},
    {label:'메타 광고 운영', desc:'메타 광고 콘텐츠 기획 운영'},
    {label:'퍼포먼스 광고 운영', desc:'전환 캠페인 + 정기배송·리텐션 (월 단위 리테이너)'}
  ];

  var core = {
    title:'[브랜드라이즈] 심박 브랜드 리뉴얼 — 견적 코어', ver:'2026-06-08 ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'3) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_CORE },
    blocks:[
      { name:'0) 브랜드 기획', staffing:'대표 1인, 디렉터 1인, 기획 1인 / 약 4주',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'시장 & 경쟁 브랜드 분석', desc:'콤부차·베이커리 카테고리 포지셔닝 분석\n온라인 채널별 가격대/리뷰/브랜드 감도 스캐닝'},
          {label:'타겟 분석 & 포지셔닝 전략', desc:'핵심 타겟 페르소나 도출 (건강 관심·프리미엄 선물 수요 등)'},
          {label:'브랜드 아이덴티티 시스템(BIS)', desc:"3개 브랜드명 → 단일 '심박' 통합 아이덴티티 체계"},
          {label:'메시지 하우스 & 스토리텔링', desc:'핵심 1 + 지지 3 + 증거(수출 10개국·특허·인증) 매핑'},
          {label:'브랜드북', desc:'국문 브랜드북 + 핵심 메시지 영문 요약'}
        ],
        deliver:['· 브랜드 전략 슬라이드 (포지셔닝·타겟·메시지 맵)', '· 브랜드북'] },
      { name:'1) 패키지 디자인 리뉴얼 3종', staffing:'디렉터 1인, 디자인디렉터 1인, 디자이너 2인 / 약 6주',
        danga:25000000, qty:'3종', subtotal:25000000,
        items:[
          {label:'패키지·라벨 풀 리뉴얼 3종', desc:'프로틴 콤부차 / 샤인머스켓 빵 / 주력 1종 패키지·라벨 풀 리뉴얼\n국문/영문 표기 + 인증·산지 신뢰자산 시각화'},
          {label:'기프트셋 (선물 패키지)', desc:'명절·외국인·기업 선물용 기프트 패키지 디자인'},
          {label:'MD 제안용 셀시트', desc:'백화점·면세점·해외 바이어 제안용 셀시트'}
        ],
        deliver:['· 패키지 3종 + 기프트셋 + 셀시트 인쇄용 디자인 파일', '· 패키지 디자인 가이드'] },
      { name:'2) 인스타그램 기획 + 촬영', staffing:'기획 1인, 디자이너 1인, 외주 촬영 1팀 / 약 1개월',
        danga:13000000, qty:'1', subtotal:13000000,
        items:[
          {label:'인스타 3계정 → 1계정 통합 설계', desc:"흩어진 계정을 '심박' 하나로 합치는 구조 설계 (메인 계정·피드 분류·기존 게시물 이관)"},
          {label:'무드보드 + 콘텐츠 캘린더', desc:'브랜드 무드보드 + 3개월 콘텐츠 캘린더 (월 12~16건)'},
          {label:'콘텐츠 촬영', desc:'촬영 기획 + 디렉팅 / 1일 풀데이 (A컷 30컷+, B컷 20컷+) / 스튜디오 렌탈 포함'},
          {label:'릴스 패턴 + 캡션 기준', desc:'릴스 시나리오 패턴 + 캡션/해시태그 기준'}
        ],
        deliver:['· 인스타 무드보드 + 3개월 콘텐츠 기획안', '· 브랜디드 사진/영상 (촬영 결과물, 운영은 심박 내부)'] }
    ],
    total:48000000, options:[]
  };

  var full = {
    title:'[브랜드라이즈] 심박 브랜드 리뉴얼 — 견적 풀', ver:'2026-06-08 ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'4) 추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS_FULL },
    blocks:[
      { name:'0) 브랜드 기획', staffing:'대표 1인, 디렉터 1인, 기획 1인 / 약 4주',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'시장 & 경쟁 브랜드 분석', desc:'콤부차·베이커리 카테고리 포지셔닝 분석\n온라인 채널별 가격대/리뷰/브랜드 감도 스캐닝'},
          {label:'타겟 분석 & 포지셔닝 전략', desc:'핵심 타겟 페르소나 도출 (건강 관심·프리미엄 선물 수요 등)'},
          {label:'브랜드 아이덴티티 시스템(BIS)', desc:"3개 브랜드명 → 단일 '심박' 통합 아이덴티티 체계"},
          {label:'메시지 하우스 & 스토리텔링', desc:'핵심 1 + 지지 3 + 증거(수출 10개국·특허·인증) 매핑'},
          {label:'브랜드북', desc:'국문 브랜드북 + 핵심 메시지 영문 요약'}
        ],
        deliver:['· 브랜드 전략 슬라이드 (포지셔닝·타겟·메시지 맵)', '· 브랜드북'] },
      { name:'1) 패키지 리뉴얼 3종 + 기프트셋 + 셀시트', staffing:'디렉터 1인, 디자인디렉터 1인, 디자이너 2인 / 약 6주',
        danga:25000000, qty:'3종', subtotal:25000000,
        items:[
          {label:'패키지·라벨 풀 리뉴얼 3종', desc:'프로틴 콤부차 / 샤인머스켓 빵 / 주력 1종 패키지·라벨 풀 리뉴얼\n국문/영문 표기 + 인증·산지 신뢰자산 시각화'},
          {label:'기프트셋 (선물 패키지)', desc:'명절·외국인·기업 선물용 기프트 패키지 디자인'},
          {label:'MD 제안용 셀시트', desc:'백화점·면세점·해외 바이어 제안용 셀시트'}
        ],
        deliver:['· 패키지 3종 + 기프트셋 + 셀시트 인쇄용 디자인 파일', '· 패키지 디자인 가이드'] },
      { name:'2) 인스타그램 기획 + 촬영 + 시딩', staffing:'기획 2인, 디자이너 1인, 외주 촬영 1팀(4인) / 약 3개월',
        danga:25000000, qty:'1', subtotal:25000000,
        items:[
          {label:'인스타 3계정 → 1계정 통합 설계', desc:"흩어진 계정을 '심박' 하나로 합치는 구조 설계 (메인 계정·피드 분류·기존 게시물 이관)"},
          {label:'무드보드 + 3개월 콘텐츠 캘린더', desc:'브랜드 무드보드 + 월 12~16건 3개월 콘텐츠 기획'},
          {label:'콘텐츠 촬영', desc:'촬영 기획·디렉팅 / 1일 풀데이 (A컷 30컷+, B컷 20컷+) + 0.5일 (사진 A컷 10·영상 5컷) / 스튜디오 렌탈 포함'},
          {label:'릴스 시나리오 + 인플루언서 시딩', desc:'릴스 시나리오 패턴 + 시딩 후보 5~10명/월 (월 50인 무가, 유가 별도)'},
          {label:'월간 KPI 리포트', desc:'도달·저장·유입 월간 리포트 (운영 실행은 심박 내부)'}
        ],
        deliver:['· 무드보드 + 3개월 콘텐츠 기획안', '· 브랜디드 사진(60컷+)·영상 + 인플루언서 시딩 리스트'] },
      { name:'3) 자사몰 셋팅', staffing:'기획 1인, 디자이너 1인 / 약 1개월',
        danga:10000000, qty:'플랫폼 1개', subtotal:10000000,
        items:[
          {label:'자사몰 3개 → 1개 통합 설계', desc:'메인·상세·브랜드스토리·마이페이지 화면 구조 리뉴얼 설계'},
          {label:'신뢰자산 통합 모듈', desc:'수출 10개국·특허·면세점·HACCP·ISO 배지 통합 노출'},
          {label:'구매 전환 퍼널 설계', desc:'1초 회원가입 유도 + 상시 할인 → 시즌 이벤트 가이드 + CTA 동선'}
        ],
        deliver:['· 자사몰 통합 설계안 + 와이어프레임', '· 상세 페이지 디자인 (구현은 심박 팀)'] }
    ],
    total:70000000, options:[]
  };

  renderQuote_(ss, SHEET_CORE, '견적B · 심박 코어(4,800만)', core);
  renderQuote_(ss, SHEET_FULL, '견적A · 심박 풀(7,000만)', full);

  ['매출','제품','사업목표'].forEach(function(n){
    var sh = ss.getSheetByName(n);
    if (sh && ss.getSheets().length > 1) ss.deleteSheet(sh);
  });

  try { SpreadsheetApp.getUi().alert('✅ 심박 견적 v2 생성 완료. 견적A(풀)/견적B(코어) 탭 확인.'); }
  catch(e){ Logger.log('완료'); }
}

function renderQuote_(ss, sheetName, newName, d) {
  // 멱등 처리: 입력명(견적A) 또는 출력명(견적A · 심박…) 어느 쪽이든 기존 탭 재사용
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

  var rows = [], merges = [], priceMerges = [];
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
  d.blocks.forEach(function(b){
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

  if (sh.getName() !== newName) sh.setName(newName);
  // 콘텐츠를 출력 탭으로 옮겼으니, 입력명(견적A/견적B)으로 남은 잔여 빈 탭 제거
  ss.getSheets().forEach(function(s){
    if (s.getName()===sheetName && s.getSheetId()!==sh.getSheetId() && ss.getSheets().length>1) {
      try { ss.deleteSheet(s); } catch(e){}
    }
  });
}
