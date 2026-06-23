/*
 * BRANDRISE 견적서 문서 빌더 (공유 모듈) · 비게이트 자산(/share/)
 * · 견적 빌더(internal/quote-builder) · 공유 뷰어(/share/quote/) · PDF 함수(/api/quote-pdf)가 함께 사용.
 * · buildDoc({brand, lines, rev, date}) → 완결된 견적서 HTML 문서 문자열. (internal 빌더의 buildQuoteDoc 정본)
 * · pack/unpack = 공유 링크용 압축 직렬화(짧은 키). lz-string과 함께 사용.
 * · 이 파일은 단가 같은 기밀을 담지 않는다(렌더 로직·스타일뿐). 게이트 밖에 둬야 빌더+뷰어가 공유 가능.
 */
(function (g) {
  function esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
  function fmt(n){ return (+n||0).toLocaleString(); }
  function won(manwon){ return ((+manwon||0)*10000).toLocaleString()+'원'; }
  function lineTotal(l){ var a=+l.amount, q=+l.qty; if(!isFinite(a)||!isFinite(q)) return 0; return (a>0?a:0)*(q>0?q:0); }
  function today(){ var d=new Date(), p=function(n){return(n<10?'0':'')+n;}; return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate()); }

  function envNote(rev,t){
    var rv=parseFloat(rev)||0; if(rv<=0) return '';
    var half=Math.round(rv*750);
    return '<div class="co ac"><span class="lab">예산 ENVELOPE · 매출 기반 가늠자</span>연 마케팅비 ≈ <b>매출 × 15%</b> → 6개월치(매출억 × 750만)로 수주 규모를 가늠합니다. <b>매출 '+rv+'억 → 6개월 envelope ≈ '+fmt(half)+'만</b> · 선택 합계 '+fmt(t)+'만 = '+(t<=half?'<b>envelope 안에 합리적으로 듦.</b>':'<b>envelope 초과 — 항목·난이도 협의 조정.</b>')+'</div>';
  }

  var CSS=':root{--ink:#0f172a;--ink2:#334155;--muted:#64748b;--line:#e7e9ee;--line2:#eef1f5;--bg:#fbfcfd;--card:#fff;--soft:#f6f8fb;--ac:#4f46e5;--ac-50:#eef2ff;--ac-100:#e0e7ff;--ac-700:#3730a3}'
    +'*{margin:0;padding:0;box-sizing:border-box}body{font-family:Pretendard,-apple-system,sans-serif;background:var(--bg);color:var(--ink);line-height:1.7;font-size:14px;word-break:keep-all}'
    +'.hero{background:var(--ink);color:#fff;padding:48px 0 40px}.hero .in{max-width:860px;margin:0 auto;padding:0 32px}'
    +'.badge{display:inline-block;font-size:11px;font-weight:700;letter-spacing:.16em;color:#c7d2fe;border:1px solid rgba(199,210,254,.3);border-radius:999px;padding:5px 13px;margin-bottom:18px}'
    +'.hero h1{font-size:clamp(26px,4.4vw,34px);font-weight:800;letter-spacing:-.03em;line-height:1.18;margin-bottom:10px}.hero h1 .hl{background:linear-gradient(transparent 60%,rgba(165,180,252,.55) 60%);padding:0 2px}'
    +'.hero .meta{display:flex;gap:10px;flex-wrap:wrap;margin-top:20px}.hero .chip{font-size:12px;font-weight:600;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.14);border-radius:8px;padding:7px 12px}.hero .chip b{color:#a5b4fc}'
    +'.wrap{max-width:860px;margin:0 auto;padding:32px 32px 80px}.sec-k{display:inline-block;font-size:11px;font-weight:800;letter-spacing:.16em;color:var(--ac);background:var(--ac-50);border:1px solid var(--ac-100);border-radius:999px;padding:4px 12px;margin-bottom:12px}'
    +'h2{font-size:22px;font-weight:800;letter-spacing:-.025em;margin-bottom:8px}.lead{font-size:13.5px;color:var(--ink2);margin-bottom:16px}'
    +'table{width:100%;border-collapse:collapse;font-size:12.5px;margin:8px 0;border:1px solid var(--line);border-radius:12px;overflow:hidden;font-variant-numeric:tabular-nums}'
    +'th{background:var(--ac-50);color:var(--ac-700);font-weight:800;text-align:right;padding:11px 13px;font-size:11.5px;border-bottom:1px solid var(--ac-100)}th:first-child{text-align:left}'
    +'td{padding:12px 13px;border-bottom:1px solid var(--line2);text-align:right;color:var(--ink2)}td.nm{text-align:left;font-weight:700;color:var(--ink)}td.c{text-align:center}'
    +'tr:nth-child(even) td{background:var(--soft)}'
    +'.t{display:inline-block;font-size:11px;font-weight:700;padding:2px 9px;border-radius:7px}.t.n{background:#f1f5f9;color:var(--muted)}'
    +'.total{background:var(--ink);color:#fff;border-radius:14px;padding:22px 26px;display:flex;justify-content:space-between;align-items:center;margin:16px 0;flex-wrap:wrap;gap:8px}'
    +'.total .tl2{font-size:13px;color:#94a3b8;font-weight:700;letter-spacing:.06em}.total .tv{font-size:26px;font-weight:800;letter-spacing:-.02em;color:#a5b4fc}.total .tv small{font-size:13px;font-weight:600;color:#cbd5e1;margin-left:8px}'
    +'.co{border-radius:12px;padding:14px 18px;margin:12px 0;font-size:13px;line-height:1.7;border:1px solid var(--line)}.co.ac{background:var(--ac-50);border-color:var(--ac-100)}.co .lab{display:block;font-size:11px;font-weight:800;letter-spacing:.1em;margin-bottom:5px;text-transform:uppercase;color:var(--ac)}.co b{color:var(--ink)}'
    +'footer{border-top:1px solid var(--line);padding:24px 0;text-align:center;color:var(--muted);font-size:12px;line-height:1.8;margin-top:8px}'
    +'@media print{.hero,.total,.co,th{-webkit-print-color-adjust:exact;print-color-adjust:exact}}';

  // 완결 견적서 HTML 문서. internal 빌더 buildQuoteDoc과 동일 출력.
  function buildDoc(opt){
    opt=opt||{};
    var brand=opt.brand||'BRAND';
    var lines=Array.isArray(opt.lines)?opt.lines:[];
    var rev=opt.rev;
    var date=opt.date||today();
    var used=lines.filter(function(l){ return lineTotal(l)>0; });
    var t=0; used.forEach(function(l){ t+=lineTotal(l); });
    if(!t) return null;
    var rows=used.map(function(l){
      var qtag=l.monthly?' <span class="t n">월·'+(+l.qty||0)+'개월</span>':((+l.qty||1)!==1?' <span class="t n">×'+(+l.qty||0)+'</span>':'');
      return '<tr><td class="nm">'+esc(l.name)+qtag+'</td><td>'+fmt(l.amount)+'</td><td class="c">'+(+l.qty||0)+'</td><td><b>'+fmt(lineTotal(l))+'</b></td></tr>';
    }).join('');
    return '<!DOCTYPE html><html lang="ko"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>'+esc(brand)+' · 1차 견적 | BRANDRISE</title>'
      +'<link href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css" rel="stylesheet"><style>'+CSS+'</style></head><body>'
      +'<div class="hero"><div class="in"><div class="badge">BRAND CONSULTING QUOTE · 1차 견적</div><h1>'+esc(brand)+' · 1차 <span class="hl">견적</span></h1>'
      +'<div class="meta"><span class="chip">견적일 <b>'+esc(date)+'</b></span><span class="chip">합계 <b>'+won(t)+' (VAT 별도)</b></span></div></div></div>'
      +'<div class="wrap"><section><div class="sec-k">QUOTE</div><h2>1차 견적 내역</h2>'
      +'<p class="lead">PREP 상담 셀렉 기반 1차 제안입니다. <b>단가 공유 원칙</b>: 공통 항목 단가는 브랜드 불문 동일. (단위: 만원 · VAT 별도)</p>'
      +'<table><thead><tr><th>항목</th><th style="width:20%">단가(만원)</th><th class="c" style="width:12%">수량</th><th style="width:22%">합계(만원)</th></tr></thead><tbody>'+rows+'</tbody></table>'
      +'<div class="total"><div class="tl2">합계 (VAT 별도)</div><div class="tv">'+won(t)+' <small>= '+fmt(t)+'만 · '+(t/10000).toFixed(3)+'억</small></div></div>'
      +envNote(rev,t)
      +'<div class="co"><span class="lab">비고</span>· 본 견적은 <b>1차 제안</b>이며 VAT 별도입니다. 항목·범위는 데이터 정밀 진단 결과에 따라 협의로 조정됩니다.<br>· 월 단위 항목은 개월 기준 합계입니다. 촬영 스튜디오·인쇄 실비는 별도 산정.</div>'
      +'</section></div><footer><b>BRANDRISE</b> by HIZ · Brand · IMC Consulting<br>본 1차 견적은 상담 준비(PREP) 셀렉 기반입니다 — 확정 견적은 진단 후 별도 발송됩니다.</footer></body></html>';
  }

  // ── 공유 링크 직렬화 (짧은 키로 URL 절약) ──
  function pack(opt){
    return {
      b: opt.brand,
      r: opt.rev,
      d: opt.date,
      l: (Array.isArray(opt.lines)?opt.lines:[]).filter(function(l){ return lineTotal(l)>0; })
           .map(function(l){ return { n:l.name, a:+l.amount||0, q:+l.qty||0, m:l.monthly?1:0 }; })
    };
  }
  // 공유 링크는 외부 입력(누구나 #q= 조작 가능) → 길이·개수·숫자 상한으로 뷰어 멈춤·비정상값 방어.
  function clampNum(n){ n=+n; return (isFinite(n) && n>=0) ? Math.min(n, 1e9) : 0; }
  function clampStr(s){ s=String(s==null?'':s); return s.length>300 ? s.slice(0,300) : s; }
  function unpack(p){
    p=p||{};
    var arr=Array.isArray(p.l)?p.l.slice(0,80):[];
    return {
      brand: clampStr(p.b), rev: clampNum(p.r), date: clampStr(p.d),
      lines: arr.map(function(x){ x=x||{}; return { name:clampStr(x.n), amount:clampNum(x.a), qty:clampNum(x.q), monthly:!!x.m }; })
    };
  }

  g.BRQuote = { buildDoc: buildDoc, pack: pack, unpack: unpack, esc: esc, fmt: fmt, won: won, lineTotal: lineTotal };
})(typeof window !== 'undefined' ? window : this);
