/**
 * 그리니팅 견적서 자동 생성 — 강훈 서식(병합 레이아웃) 재현 / 단일 안 3블록
 * ─────────────────────────────────────────────────────────────
 * 실행: 강훈 복제본(green 소유) → 탭 1개만 남기고 → 확장 → Apps Script → 붙여넣기 → buildGreenitingQuote
 * ⚠️ 엔진(renderQuote_)은 심박 빌더와 동일 — 데이터 객체만 교체했다. 엔진 수정 금지(전 브랜드 영향).
 *
 * 구조: 브랜드 기획(1,000) + 인스타 운영(1,000, 2개월) + CRM(500, 2개월) = 2,500만 (VAT 별도)
 * 내용 칸 = 평이체(무슨 작업) / 우측 G열 가안 = 미팅 발언(왜 필요)
 */

var SHEET_GR = '견적';   // → 그리니팅 단일 안

var COL = { A:200, B:430, C:135, D:90, E:140 };
var CLR = { band:'#4a6fd4', light:'#dbe5fb', gray:'#efefef', dark:'#d9d9d9', border:'#cfcfcf' };

function buildGreenitingQuote() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var KPI = [
    "· 그리니팅 브랜드 토대 구축 파트너십 — 비어 있던 '브랜드 기획'을 채우고 대표 서사를 전환되는 콘텐츠로 발신",
    "· 단기 목표: 9월 김미경TV 출연·신제품 런칭에 맞춰 브랜드 자산(서사·콘텐츠·CRM)을 완성",
    "· 핵심 갭 해소: 보유한 무기(DPPH 92%·안토시아닌 186mg 항산화 데이터)를 소비자가 보는 자산으로 전환",
    "· 장기 목표: 공구(53%) 의존을 줄이고 신규 유입을 재구매로 잡는 CRM 기반 자생 성장",
    "· 운영 기간: 6월 하순 착수 기준 — 브랜드 기획 약 1개월 선행 → 인스타·CRM 약 2개월"
  ];
  var NOTES = [
    "· 본 견적서의 금액은 VAT 별도 기준입니다.",
    "· 광고 집행비·인플루언서 협찬비·촬영 실비·인쇄비는 별도입니다.",
    "· 결제: 착수금 50% / 중간금 30% / 잔금 20%.",
    "· 기존 외주(메타 광고·데이터라이즈 CRM 발송)와는 '유지 + 디렉션'으로 역할을 분담합니다.",
    "· 자료 회신·브랜드 방향 변경 시 일정·비용이 조정될 수 있습니다."
  ];

  // 추가 논의 영역 (합계 아래 / 가격 없음 / 후속 단계)
  var DISCUSS = [
    {label:'메타 광고 디렉션', desc:'ROAS 양호한 집행은 유지하고, 브랜드 감도·소재·전략 디렉션만 (집행비 별도)'},
    {label:'1년 파트너십 확장', desc:'콘텐츠·CRM 월간 운영 리테이너 — 토대 구축 후 월 단위 별도 견적'}
  ];

  // 마케팅 방향 가안 (우측 G열) — 미팅 발언 그대로 / 블록 순서와 동일
  var P_BRAND =
    "● 브랜드 기획\n\n" +
    "목표)\n" +
    "· 막혀 있던 대표 서사 + 항산화 데이터(DPPH 92%)를 브랜드 언어로 정리\n" +
    "· '스무디 가격표'가 아닌 프리미엄 웰니스로 카테고리 재정의\n" +
    "· 9월 김미경TV·신제품 런칭에 쓸 브랜드 자산(포지셔닝·메시지·소개서) 완성\n\n" +
    "운영방식)\n" +
    "· 브랜드 워크샵 2회로 대표·팀 언어를 끌어내 방향 정렬\n" +
    "· 시장·경쟁·타겟 분석 → 포지셔닝·메시지 체계로 고정\n" +
    "· 브랜드북·브랜드 소개서로 산출 (이후 콘텐츠·CRM의 기준)";
  var P_INSTA =
    "● 인스타그램 리뉴얼 + 콘텐츠 운영\n\n" +
    "목표)\n" +
    "· 그리니팅 제품력(DPPH 92%·HPP 비가열·유기농·저당)에 맞춘 프리미엄 브랜드 스토리텔링 콘텐츠 개발\n" +
    "· 소셜미디어 노출 강화 + 자사몰 유입 연결 설계\n" +
    "· 정기 브랜딩 콘텐츠 발신 — 사람·제품·원물 3축 (제품력 텔링 / 레시피 / 패키징 노출)\n\n" +
    "운영방식)\n" +
    "· 인스타그램의 경우 브랜드에서 보유한 기본 사진, 영상 콘텐츠가 중요\n" +
    "· 초기 1개월은 브랜디드 사진, 영상 콘텐츠를 최대한 많이 개발\n" +
    "· 이후 운영은 그리니팅 내부, 기획·디렉션은 브랜드라이즈 (브랜드사 인원 협력 필요)\n\n" +
    "** 운영중인 타사 브랜드 예시 — 기획보드/무드보드 (베지어트 · 스타벅스앳홈 · 네스카페)\n" +
    "   → 시트 우측(H열~)에 콘텐츠 캘린더·피드 예시 이미지 첨부";
  var P_CRM =
    "● CRM — 재구매·리텐션\n\n" +
    "목표)\n" +
    "· 신규 유입을 재구매·정기구독으로 잡는 CRM 로드맵 설계\n" +
    "· 신규·재구매·이탈 세그먼트별 맞춤 메시지로 리텐션 강화\n" +
    "· 쿠폰 남발 대신 가치 기반 메시지로 재구매율·LTV 향상\n\n" +
    "운영방식)\n" +
    "· 현재 데이터라이즈 발송은 유지, 그 위 전략·자동화·최적화만 디렉션\n" +
    "· 세그먼트 메시지 기획 → 발송 → 리텐션 성과 측정까지 자동화 흐름 구축\n" +
    "· 공구(53%) 의존을 줄이고 자사몰 재구매 기반으로 전환";

  var g = {
    title:'[브랜드라이즈] 그리니팅 브랜드 파트너십 — 견적', ver:'2026-06-11 ver.',
    kpi:KPI, notes:NOTES,
    discuss:{ name:'추가 논의 영역 (후속 단계 / 별도 견적)', items:DISCUSS },
    blocks:[
      { name:'0) 브랜드 기획', staffing:'대표 1인, 디렉터 1인, 기획 1인 / 약 1개월',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'시장 & 경쟁 브랜드 분석', desc:'건강 스무디·주스(웰니스) 시장과 경쟁 브랜드 포지셔닝 분석\n온라인 채널별 가격대·리뷰·브랜드 인식 스캐닝'},
          {label:'타겟 분석 & 포지셔닝 전략', desc:'핵심 고객 페르소나 도출 (건강·항산화 관심 소비자 등) + 그리니팅이 설 자리 정의'},
          {label:'제품 라인업 & 세트 구성 방향', desc:'신제품(토마토 비프스튜 등) 런칭 라인업 정리 + 세트·가격 구성 방향'},
          {label:'파운더 서사 & 브랜드 스토리', desc:'대표 창업 이야기 + 그리니팅의 무기(항산화 데이터)를 소비자가 알아듣는 말로 정리'},
          {label:'브랜드 보이스 & 슬로건', desc:'브랜드 말투·톤 정의 + 슬로건 방향 제시 및 확정 1안 선정'},
          {label:'브랜드 워크샵 2회', desc:'대표·팀이 함께하는 워크샵 2회 — 막혀 있던 대표 이야기를 끌어내고 방향을 맞춤'}
        ],
        deliver:['· 브랜드 분석 보고서 (경쟁사·타겟·포지셔닝 맵)', '· 브랜드 소개서 (브랜드북)'] },
      { name:'1) 인스타그램 리뉴얼 기획 / 채널 운영', staffing:'기획 1~2인, 디자인 1인, 외주 촬영 1팀 / 약 2개월',
        danga:10000000, qty:'1', subtotal:10000000,
        items:[
          {label:'마켓 리서치 & 분석', desc:'기존 브랜드·제품·경쟁 콘텐츠 리서치 및 레퍼런스 분석'},
          {label:'인스타그램 무드보드 개발', desc:'내부 디자이너가 이어서 작업할 수 있는 시각 기준 매뉴얼 / 피그마 셋팅'},
          {label:'브랜디드 콘텐츠 기획 + 대시보드', desc:'원료·사람·제품 3꼭지 콘텐츠 기획 + 레퍼런스 / 내부 관리용 콘텐츠 대시보드 셋팅'},
          {label:'콘텐츠 촬영', desc:'촬영 기획 + 현장 디렉팅 / 1일 풀데이 촬영 (A컷 30컷+, B컷 20컷+) / 스튜디오 렌탈 포함'},
          {label:'대표 계정(@greeniting.choi) 서사 운영', desc:"'대표 계정 먼저, 브랜드가 따라간다' — 대표 스토리 포맷·톤·운영 가이드"},
          {label:'인스타그램 채널 운영', desc:'2개월 실제 채널 운영 (광고비 별도)'},
          {label:'인플루언서 바이럴 / 씨딩', desc:'시딩 진행 (인플루언서 섭외·콘텐츠 확인) — 협찬·재료비 별도'}
        ],
        deliver:['· 브랜디드 사진·영상 + 인스타 콘텐츠', '· 무드보드·콘텐츠 대시보드 (내부 인계용)', '· 인플루언서 시딩 콘텐츠'] },
      { name:'2) CRM (재구매·리텐션)', staffing:'CRM 기획 1인, 디렉터 1인 / 약 2개월',
        danga:5000000, qty:'1', subtotal:5000000,
        items:[
          {label:'CRM 로드맵 설계', desc:'공구 의존을 줄이고 재구매·정기구독을 유도하는 CRM 전략 로드맵 수립'},
          {label:'자동화 시스템 구축', desc:'메시지 자동 발송 흐름 구축 (현재 데이터라이즈 발송은 유지, 그 위 최적화)'},
          {label:'세그먼트 설계', desc:'신규·재구매·이탈 고객 등 유저 세그먼테이션 설계'},
          {label:'메시지 기획 & 리텐션 성과 측정', desc:'세그먼트별 메시지 기획 + 리텐션(재구매율) 성과 측정·최적화'}
        ],
        deliver:['· CRM 로드맵 + 세그먼트 설계서', '· 세그먼트별 메시지 기획안 + 성과 리포트'] }
    ],
    total:25000000, options:[],
    proposals:[P_BRAND, P_INSTA, P_CRM]
  };

  renderQuote_(ss, SHEET_GR, '견적 · 그리니팅(2,500만)', g);

  try { SpreadsheetApp.getUi().alert('✅ 그리니팅 견적 생성 완료. 「견적」 탭 확인.'); }
  catch(e){ Logger.log('완료'); }
}

/* ───────────────── 범용 렌더 엔진 (심박 빌더와 동일 / 수정 금지) ───────────────── */
function renderQuote_(ss, sheetName, newName, d) {
  var sh = ss.getSheetByName(newName) || ss.getSheetByName(sheetName);
  if (!sh) sh = ss.insertSheet(sheetName);
  ss.getSheets().forEach(function(s){
    if (s.getName()===newName && s.getSheetId()!==sh.getSheetId() && ss.getSheets().length>1) {
      try { ss.deleteSheet(s); } catch(e){}
    }
  });
  try { sh.getRange(1,1,sh.getMaxRows(),sh.getMaxColumns()).breakApart(); } catch(e){}
  sh.clear(); sh.clearNotes();

  var rows = [], merges = [], priceMerges = [], proposalRanges = [];
  function push(arr){ rows.push(arr); return rows.length; }

  var rTitle = push([d.title, '', '', '', d.ver]);
  push(['','','','','']);

  var rBand = push(['파트너십의 KPI','','','','']);
  merges.push([rBand,1,1,5]);

  var lines = Math.max(d.kpi.length, d.notes.length);
  var rKpi = push([d.kpi.join('\n'), '', d.notes.join('\n'), '', '']);
  for (var i=1;i<lines;i++) push(['','','','','']);
  merges.push([rKpi,1,lines,2]);
  merges.push([rKpi,3,lines,3]);
  push(['','','','','']);

  var rHead = push(['구분','항목','단가','수량','계약 견적']);

  var blockHdr = [], deliverRows = [], subRows = [];
  d.blocks.forEach(function(b, bi){
    var rH = push([b.name, '', b.staffing, '', '']);
    blockHdr.push(rH); merges.push([rH,3,1,3]);
    var itemStart = rows.length + 1;
    b.items.forEach(function(it){ push([it.label, it.desc, '', '', '']); });
    var itemEnd = rows.length;
    if (itemEnd >= itemStart) {
      priceMerges.push([3, itemStart, itemEnd, b.danga]);
      priceMerges.push([4, itemStart, itemEnd, b.qty]);
      priceMerges.push([5, itemStart, itemEnd, b.subtotal]);
    }
    var rD = push(['>> 최종 납품 작업물', b.deliver.join('\n'), '', '', '']);
    deliverRows.push(rD);
    var rS = push(['소       계','','','', b.subtotal]); subRows.push(rS);
    merges.push([rS,1,1,4]);
    if (d.proposals && d.proposals[bi]) proposalRanges.push([rH, rS, d.proposals[bi]]);
  });
  var rTotal = push(['합       계 (VAT 별도)','','','', d.total]);
  merges.push([rTotal,1,1,4]);

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

  var rDiscHdr = 0;
  if (d.discuss){
    push(['','','','','']);
    rDiscHdr = push([d.discuss.name, '', '', '', '']);
    merges.push([rDiscHdr,1,1,5]);
    d.discuss.items.forEach(function(it){ push([it.label, it.desc, '', '', '']); });
  }

  var last = rows.length;

  sh.getRange(1,1,last,5).setValues(rows);

  merges.forEach(function(m){ try{ sh.getRange(m[0],m[1],m[2],m[3]).merge(); }catch(e){} });
  priceMerges.forEach(function(p){
    var rng = sh.getRange(p[1],p[0],p[2]-p[1]+1,1);
    try{ rng.merge(); }catch(e){}
    sh.getRange(p[1],p[0]).setValue(p[3]);
  });

  sh.setColumnWidth(1,COL.A); sh.setColumnWidth(2,COL.B);
  sh.setColumnWidth(3,COL.C); sh.setColumnWidth(4,COL.D); sh.setColumnWidth(5,COL.E);

  sh.getRange(1,1,last,5).setFontFamily('Noto Sans KR').setFontSize(10)
    .setVerticalAlignment('middle').setWrap(true);

  sh.getRange(rTitle,1).setFontSize(14).setFontWeight('bold');
  sh.getRange(rTitle,5).setHorizontalAlignment('right').setFontColor('#888888');
  sh.getRange(rBand,1).setBackground(CLR.band).setFontColor('#ffffff').setFontWeight('bold').setFontSize(11);
  sh.getRange(rKpi,1,lines,5).setVerticalAlignment('top').setFontSize(9.5);
  sh.getRange(rHead,1,1,5).setBackground(CLR.light).setFontWeight('bold').setHorizontalAlignment('center');
  blockHdr.forEach(function(r){
    sh.getRange(r,1).setFontWeight('bold');
    sh.getRange(r,3).setHorizontalAlignment('center').setFontColor('#555555');
  });
  deliverRows.forEach(function(r){ sh.getRange(r,1,1,5).setBackground(CLR.light); sh.getRange(r,1).setFontWeight('bold'); });
  subRows.forEach(function(r){ sh.getRange(r,1,1,5).setBackground(CLR.gray).setFontWeight('bold'); sh.getRange(r,1).setHorizontalAlignment('center'); });
  sh.getRange(rTotal,1,1,5).setBackground(CLR.dark).setFontWeight('bold'); sh.getRange(rTotal,1).setHorizontalAlignment('center');
  if (rOptHdr){
    sh.getRange(rOptHdr,1).setFontWeight('bold');
    sh.getRange(rOptHdr,3).setHorizontalAlignment('center').setFontColor('#555555');
  }
  if (rOptSub){
    sh.getRange(rOptSub,1,1,5).setBackground(CLR.gray).setFontWeight('bold');
    sh.getRange(rOptSub,1).setHorizontalAlignment('center');
  }
  if (rDiscHdr){
    sh.getRange(rDiscHdr,1,1,5).setBackground(CLR.light);
    sh.getRange(rDiscHdr,1).setFontWeight('bold');
  }
  sh.getRange(rHead,3,last-rHead+1,1).setNumberFormat('#,##0').setHorizontalAlignment('center');
  sh.getRange(rHead,4,last-rHead+1,1).setHorizontalAlignment('center');
  sh.getRange(rHead,5,last-rHead+1,1).setNumberFormat('#,##0').setHorizontalAlignment('center');
  sh.getRange(rHead,1,last-rHead+1,5).setBorder(true,true,true,true,true,true,CLR.border,SpreadsheetApp.BorderStyle.SOLID);

  if (proposalRanges.length){
    sh.setColumnWidth(6, 28);
    sh.setColumnWidth(7, 380);
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
  ss.getSheets().forEach(function(s){
    if (s.getName()===sheetName && s.getSheetId()!==sh.getSheetId() && ss.getSheets().length>1) {
      try { ss.deleteSheet(s); } catch(e){}
    }
  });
}
