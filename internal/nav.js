/*
 * BRANDRISE 내부 공용 상단 네비 — 전 /internal 페이지가 <script src="/internal/nav.js"></script> 한 줄로 공유.
 * · 스타일+마크업 자가 주입(페이지는 스크립트 한 줄만 추가, 마운트 div 불필요).
 * · 현재 페이지 자동 하이라이트. 운영 도구(영업프로세스·파이프라인·견적빌더) ‖ 단계 매뉴얼(회사소개·상담·견적콜).
 */
(function () {
  if (document.getElementById('br-topnav')) return;

  var OP = [
    { h: '/internal/sales-process/', t: '영업 프로세스' },
    { h: '/internal/pipeline/',      t: '파이프라인 보드' },
    { h: '/internal/quote-builder/', t: '견적 빌더' },
    { h: '/internal/win-dashboard/', t: '수주 현황' }
  ];
  var MAN = [
    { h: '/internal/company-intro/',      t: '회사소개' },
    { h: '/internal/consult-playbook/',   t: '상담' },
    { h: '/internal/quote-call-playbook/',t: '견적콜' }
  ];

  function norm(p) { return p.replace(/index\.html$/, '').replace(/\/+$/, '/'); }
  var here = norm(location.pathname);
  function on(h) { var n = norm(h); return here === n || (n !== '/internal/' && here.indexOf(n) === 0); }
  function link(x) { return '<a href="' + x.h + '"' + (on(x.h) ? ' class="on"' : '') + '>' + x.t + '</a>'; }

  var css =
    '#br-topnav{position:sticky;top:0;z-index:50;background:#0f172a;border-bottom:1px solid rgba(255,255,255,.07);font-family:Pretendard,-apple-system,sans-serif}'
    + '#br-topnav .in{max-width:1180px;margin:0 auto;padding:7px 26px;display:flex;align-items:center;gap:12px;min-height:50px;flex-wrap:wrap}'
    + '#br-topnav .wm{font-size:13px;font-weight:800;color:#fff;white-space:nowrap;text-decoration:none}#br-topnav .wm b{color:#a5b4fc}'
    + '#br-topnav .lk{display:flex;align-items:center;gap:2px;flex-wrap:wrap}'
    + '#br-topnav a.nv{font-size:12.5px;font-weight:600;color:#cbd5e1;text-decoration:none;padding:6px 10px;border-radius:8px;white-space:nowrap}'
    + '#br-topnav a.nv:hover{background:rgba(255,255,255,.08);color:#fff}'
    + '#br-topnav a.nv.on{background:rgba(165,180,252,.18);color:#fff;font-weight:800}'
    + '#br-topnav .sep{width:1px;height:16px;background:rgba(255,255,255,.14);margin:0 6px}'
    + '#br-topnav .grp{font-size:10px;font-weight:800;letter-spacing:.1em;color:#64748b;padding:0 3px}'
    + '@media print{#br-topnav{display:none}}';

  function nv(x) { return '<a class="nv' + (on(x.h) ? ' on' : '') + '" href="' + x.h + '">' + x.t + '</a>'; }
  var html = '<div class="in"><a class="wm" href="/internal/">BRANDRISE <b>시스템</b></a><div class="lk">'
    + '<span class="grp">도구</span>'
    + OP.map(nv).join('')
    + '<span class="sep"></span><span class="grp">단계 매뉴얼</span>'
    + MAN.map(nv).join('')
    + '</div></div>';

  var style = document.createElement('style'); style.id = 'br-topnav-css'; style.textContent = css;
  document.head.appendChild(style);
  var nav = document.createElement('nav'); nav.id = 'br-topnav'; nav.innerHTML = html;
  document.body.insertBefore(nav, document.body.firstChild);
})();
