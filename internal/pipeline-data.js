/*
 * BRANDRISE 파이프라인 공용 데이터 (보드 + 견적 빌더 공유)
 * · 정적 사이트(github.io)라 백엔드 없음 → 단계·견적 상태는 localStorage 저장.
 * · 단가는 "표준 가안" (단가 공유 원칙: 공통 항목 단가는 브랜드 불문 동일 유지, 빌더에서 조정 가능).
 * · 수정 시 두 페이지(pipeline/, quote-builder/)가 함께 읽으므로 여기 한 곳만 고친다.
 */
(function (g) {
  // ── 단계 정의 (id / 라벨 / 색 토큰) ──────────────────────────────
  var STAGES = [
    { id: 'consult', label: '수주 협의중',     tone: 'slate' },
    { id: 'pending', label: '견적서 발송 대기', tone: 'amber' },
    { id: 'sent',    label: '견적서 발송 완료', tone: 'indigo' },
    { id: 'won',     label: '수주 완료',        tone: 'green' },
    { id: 'dropped', label: '플젝 드랍',        tone: 'red' }
  ];

  // ── 진행 중 브랜드 (2026-06-23 기준) ─────────────────────────────
  // prep: 리서치 페이지 유무. prepSlug 지정 시 research/{prepSlug}/, 미지정 시 research/{slug}/.
  var BRANDS = [
    { slug: 'dayna',               name: '데이나 (리테이너)',        prep: false },
    { slug: 'supersave',           name: '슈퍼세이브 (곰보배추)',     prep: false },
    { slug: 'afreeday',            name: 'A Free Day (부족한녀석들)', prep: true, prepSlug: 'budokhan-nyeoseokdeul' },
    { slug: 'queensbucket',        name: '쿠앤즈버킷',               prep: true  },
    { slug: 'simbak',              name: '심박',                    prep: true  },
    { slug: 'ecomom-sangol',       name: '에코맘',                  prep: true  },
    { slug: 'ashuniverse',         name: '아슈니버스',               prep: true  },
    { slug: 'lutea',               name: '루테아 / 제니글로벌',       prep: true  },
    { slug: 'mixroom',             name: '믹스룸',                  prep: true  },
    { slug: 'natural-good-things', name: '네추럴굿띵스',             prep: true  },
    { slug: 'yoosom',              name: '마티어 (유솜)',            prep: true  },
    { slug: 'kkotppang',           name: '꽃빵',                    prep: true  },
    { slug: 'small-habit',         name: '작은 습관 (&dm)',          prep: true, prepSlug: 'anddm' },
    { slug: 'healernet',           name: '힐러넷 (요프리)',          prep: true  },
    { slug: 'elegaiter',           name: '사이클룩스 / Elegaiter',    prep: true  },
    { slug: 'blupino',             name: '블루피노',                 prep: true  }
  ];

  // ── localStorage 키 + 헬퍼 ──────────────────────────────────────
  var STAGE_KEY = 'br_pipeline_stage_v1';        // { slug: stageId }
  var CUSTOM_KEY = 'br_custom_brands_v1';        // [ {slug,name,prep:false,custom:true} ]
  var QUOTE_KEY = function (slug) { return 'br_quote_' + slug + '_v1'; };

  // ── 사용자가 추가한 브랜드(프로젝트) ─────────────────────────────
  function readCustom() {
    try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; }
    catch (e) { return []; }
  }
  function writeCustom(list) { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); }
  function allBrands() { return BRANDS.concat(readCustom()); }

  function slugify(name) {
    var base = String(name || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    if (!base) base = 'brand';
    var used = {}; allBrands().forEach(function (b) { used[b.slug] = 1; });
    var s = base, n = 2;
    while (used[s]) { s = base + '-' + n; n++; }
    return s;
  }
  function addCustom(name) {
    var nm = String(name || '').trim(); if (!nm) return null;
    var b = { slug: slugify(nm), name: nm, prep: false, custom: true };
    var list = readCustom(); list.push(b); writeCustom(list);
    return b;
  }
  function removeCustom(slug) {
    writeCustom(readCustom().filter(function (b) { return b.slug !== slug; }));
    // 단계·견적 데이터도 정리
    var m = readStages(); if (m[slug]) { delete m[slug]; localStorage.setItem(STAGE_KEY, JSON.stringify(m)); }
    try { localStorage.removeItem(QUOTE_KEY(slug)); } catch (e) {}
  }

  function readStages() {
    try { return JSON.parse(localStorage.getItem(STAGE_KEY)) || {}; }
    catch (e) { return {}; }
  }
  function writeStage(slug, stageId) {
    var m = readStages(); m[slug] = stageId;
    localStorage.setItem(STAGE_KEY, JSON.stringify(m));
  }
  function getStage(slug) { return readStages()[slug] || 'consult'; }

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

  g.BR = {
    STAGES: STAGES, BRANDS: BRANDS,
    allBrands: allBrands, addCustom: addCustom, removeCustom: removeCustom, readCustom: readCustom,
    readStages: readStages, writeStage: writeStage, getStage: getStage,
    readQuote: readQuote, writeQuote: writeQuote,
    stageById: stageById, brandBySlug: brandBySlug, won: won
  };
})(window);
