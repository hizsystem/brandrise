/*
 * BRANDRISE 파이프라인 공용 데이터 (보드 + 견적 빌더 공유)
 * · 정적 사이트(github.io)라 백엔드 없음 → 단계·견적 상태는 localStorage 저장.
 * · 단가는 "표준 가안" (단가 공유 원칙: 공통 항목 단가는 브랜드 불문 동일 유지, 빌더에서 조정 가능).
 * · 수정 시 두 페이지(pipeline/, quote-builder/)가 함께 읽으므로 여기 한 곳만 고친다.
 */
(function (g) {
  // ── 옛 정적 복사본(github.io) 차단 ───────────────────────────────
  //   github.io엔 서버(/api/pipeline)가 없어 구글시트에 닿지 못한다(영원히 빈 보드).
  //   시트 라이브는 Vercel에만 있으므로 같은 경로의 운영 사이트로 즉시 이동.
  try {
    if (location.hostname.indexOf('github.io') >= 0) {
      var _p = location.pathname.replace(/^\/[^/]+/, '');   // '/brandrise' 프로젝트 접두 제거
      location.replace('https://brandrise-hiz.vercel.app' + _p + location.search + location.hash);
      return;
    }
  } catch (e) {}

  // ── 단계 정의 (id / 라벨 / 색 토큰) ──────────────────────────────
  var STAGES = [
    { id: 'pending', label: '견적서 발송 대기', tone: 'amber' },
    { id: 'sent',    label: '견적서 발송 완료', tone: 'indigo' },
    { id: 'won',     label: '수주 완료',        tone: 'green' },
    { id: 'dropped', label: '플젝 드랍',        tone: 'red' }
  ];

  // ── 진행 중 브랜드 = 구글 시트(BC-BR) 라이브. /api/pipeline가 채운다. ──
  //   전엔 하드코딩이었으나 이제 시트가 원본(손복사 없음). loadLive()가 BRANDS를 채우고 ready 발화.
  var BRANDS = [];
  var _loaded = false, _readyCbs = [], _summary = {}, _kpi = {}, _monthly = {};
  var _loadOk = null;   // null=로드 전, true=시트 로드 성공, false=실패(빈 화면과 구분)

  // ── localStorage 키 + 헬퍼 ──────────────────────────────────────
  var STAGE_KEY = 'br_pipeline_stage_v1';        // { slug: stageId }
  var CUSTOM_KEY = 'br_custom_brands_v1';        // [ {slug,name,prep,prepUrl?,custom:true} ]
  var HIDDEN_KEY = 'br_hidden_brands_v1';        // [ slug ] — 숨긴 기본 브랜드
  var DATE_KEY = 'br_consult_date_v1';           // { slug: 'YYYY-MM-DD' } 상담일
  var QUOTE_KEY = function (slug) { return 'br_quote_' + slug + '_v1'; };

  // ── 사용자가 추가한 브랜드(프로젝트) + 기본 브랜드 숨김 ────────────
  function readCustom() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeCustom(list) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); }
  function readHidden() {
    try { return JSON.parse(localStorage.getItem(HIDDEN_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeHidden(list) { localStorage.setItem(HIDDEN_KEY, JSON.stringify(list)); }

  function allBrands() {
    var hidden = readHidden();
    var base = BRANDS.filter(function (b) { return hidden.indexOf(b.slug) < 0; });
    return base.concat(readCustom());
  }

  function slugify(name) {
    var base = String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!base) base = 'brand';
    var used = {}; BRANDS.concat(readCustom()).forEach(function (b) { used[b.slug] = 1; });
    var s = base, n = 2;
    while (used[s]) { s = base + '-' + n; n++; }
    return s;
  }
  function addCustom(name, prepUrl) {
    var nm = String(name || '').trim(); if (!nm) return null;
    var url = String(prepUrl || '').trim();
    var b = { slug: slugify(nm), name: nm, prep: !!url, custom: true };
    if (url) b.prepUrl = url;
    var list = readCustom(); list.push(b); writeCustom(list);
    return b;
  }
  // 모든 카드 삭제 가능: 커스텀=목록서 제거 / 기본=숨김 목록에 추가
  function removeBrand(slug) {
    var custom = readCustom();
    if (custom.some(function (b) { return b.slug === slug; })) {
      writeCustom(custom.filter(function (b) { return b.slug !== slug; }));
    } else {
      var h = readHidden(); if (h.indexOf(slug) < 0) { h.push(slug); writeHidden(h); }
    }
    var m = readStages(); if (m[slug]) { delete m[slug]; localStorage.setItem(STAGE_KEY, JSON.stringify(m)); }
    var d = readDates(); if (d[slug]) { delete d[slug]; writeDates(d); }
    try { localStorage.removeItem(QUOTE_KEY(slug)); } catch (e) {}
  }
  function restoreHidden() { writeHidden([]); }   // 숨긴 기본 브랜드 전체 복원

  // ── 상담일 ──────────────────────────────────────────────────────
  function readDates() { try { return JSON.parse(localStorage.getItem(DATE_KEY)) || {}; } catch (e) { return {}; } }
  function writeDates(m) { localStorage.setItem(DATE_KEY, JSON.stringify(m)); }
  function getDate(slug) {
    var m = readDates(); if (slug in m) return m[slug];
    var b = brandBySlug(slug); return (b && b.consultDate) || '';
  }
  function setDate(slug, val) { var m = readDates(); if (val) m[slug] = val; else delete m[slug]; writeDates(m); }
  // 상담일로부터 경과 일수 (오늘 기준, 미설정 시 null)
  function daysSince(slug) {
    var v = getDate(slug); if (!v) return null;
    var d = new Date(v + 'T00:00:00'); if (isNaN(d.getTime())) return null;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    return Math.round((now.getTime() - d.getTime()) / 86400000);
  }

  function readStages() {
    try { return JSON.parse(localStorage.getItem(STAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeStage(slug, stageId) {
    var m = readStages(); m[slug] = stageId;
    localStorage.setItem(STAGE_KEY, JSON.stringify(m));
  }
  function getStage(slug) {
    var m = readStages(); if (m[slug]) return m[slug];
    var b = brandBySlug(slug); return (b && b.defaultStage) || 'pending';
  }

  function readQuote(slug) {
    try { return JSON.parse(localStorage.getItem(QUOTE_KEY(slug))); }
    catch (e) { return null; }
  }
  function writeQuote(slug, data) {
    localStorage.setItem(QUOTE_KEY(slug), JSON.stringify(data));
  }

  function stageById(id) {
    for (var i = 0; i < STAGES.length; i++) if (STAGES[i].id === id) return STAGES[i];
    return STAGES[0];
  }
  function brandBySlug(slug) {
    var all = allBrands();
    for (var i = 0; i < all.length; i++) if (all[i].slug === slug) return all[i];
    return null;
  }
  function won(n) { return (n || 0).toLocaleString('ko-KR') + '원'; }

  // ── 시트 라이브 로드 (/api/pipeline) ──────────────────────────────
  // _readyCbs는 비우지 않는다 → 캐시 즉시표시 후 백그라운드 갱신 때 다시 렌더(렌더는 멱등).
  function _fireReady() { _loaded = true; _readyCbs.forEach(function (cb) { try { cb(); } catch (e) {} }); }
  function ready(cb) { _readyCbs.push(cb); if (_loaded) { try { cb(); } catch (e) {} } }

  var CACHE_KEY = 'br_pipeline_cache_v1';   // 직전 시트 응답(회사 공통 데이터라 안전)
  function _apply(d) {
    if (d && d.ok && Array.isArray(d.brands)) {
      BRANDS.length = 0; d.brands.forEach(function (b) { BRANDS.push(b); });
      _summary = d.summary || {}; _kpi = d.kpi || {}; _monthly = d.monthly || {}; _loadOk = true;
      return true;
    }
    return false;
  }
  function loadLive() {
    if (typeof fetch !== 'function') { _loadOk = false; _fireReady(); return; }
    // 0) 직전 캐시 즉시 표시(체감 0초) — 시트 왕복 ~2초 동안 빈 화면 안 보이게.
    try { if (_apply(JSON.parse(localStorage.getItem(CACHE_KEY)))) _fireReady(); } catch (e) {}
    // 1) 백그라운드 최신화 (20초 타임아웃 → Apps Script 콜드 스타트 여유, 무한 스피너 방지)
    var ctrl = (typeof AbortController === 'function') ? new AbortController() : null;
    var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, 20000);
    fetch('/api/pipeline', { credentials: 'same-origin', signal: ctrl ? ctrl.signal : undefined })
      .then(function (r) { return r.ok ? r.json() : Promise.reject('http ' + r.status); })
      .then(function (d) {
        clearTimeout(timer);
        if (_apply(d)) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(d)); } catch (e) {} }
        else if (_loadOk !== true) { _loadOk = false; }
        _fireReady();
      })
      .catch(function (e) {
        clearTimeout(timer);
        if (_loadOk !== true) _loadOk = false;   // 캐시도 없을 때만 '실패' 표시
        try { console.warn('pipeline 라이브 로드 실패:', e); } catch (x) {}
        _fireReady();
      });
  }

  g.BR = {
    STAGES: STAGES, BRANDS: BRANDS,
    allBrands: allBrands, addCustom: addCustom, removeBrand: removeBrand, readCustom: readCustom, restoreHidden: restoreHidden,
    getDate: getDate, setDate: setDate, daysSince: daysSince,
    readStages: readStages, writeStage: writeStage, getStage: getStage,
    readQuote: readQuote, writeQuote: writeQuote,
    stageById: stageById, brandBySlug: brandBySlug, won: won,
    ready: ready, loaded: function () { return _loaded; }, loadOk: function () { return _loadOk; },
    refresh: function () { try { localStorage.removeItem(CACHE_KEY); } catch (e) {} loadLive(); },  // 배경 시트 최신화
    summary: function () { return _summary; }, kpi: function () { return _kpi; }, monthly: function () { return _monthly; }
  };

  loadLive();
})(window);
