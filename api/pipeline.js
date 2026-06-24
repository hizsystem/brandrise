// 구글 시트(BC-BR) → 보드/대시보드용 JSON. revenue-bot 권한 Apps Script를 경유해 비공개 시트 읽기.
// · 인증 게이트: br_auth 쿠키(미들웨어 동일 HMAC) — 팀(로그인)만.
// · 시트 토큰·URL은 Vercel env(SHEET_APPS_URL, SHEET_TOKEN) — 레포·클라이언트 노출 0.
// · 매핑: BC-BR 탭. 보드=활성(협의중·발송 + 7월~ 시작 수주, 드랍·OOS·이월 제외). 요약=시트 상단 집계셀.
const crypto = require('crypto');

// 모듈 레벨 캐시(워밍된 람다 인스턴스가 재사용) — Apps Script 왕복(~2초, 콜드 시 10초+)을 대부분 건너뜀.
// · 누수 위험 0: 인증은 매 요청 함수에서 확인(CDN 캐싱 아님).
// · 실패 시 스테일 폴백: Apps Script가 죽어도 직전 데이터를 내려 빈 보드 방지.
let _cache = null;            // { at:number, payload:object }
const CACHE_TTL = 90 * 1000;  // 90초

function verifyToken(token, secret) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const exp = token.slice(0, i), sig = token.slice(i + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update(exp).digest('hex');
  if (expected.length !== sig.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)); } catch (e) { return false; }
}
function getCookie(req, name) {
  const c = req.headers.cookie || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  if (!m) return '';
  try { return decodeURIComponent(m[1]); } catch (e) { return ''; }
}

const STAGE = {
  '수주 협의중': 'consult', '견적서 발송 대기': 'pending', '견적서 발송 완료': 'sent',
  '수주 완료': 'won', '플젝 드랍': 'dropped'
};
function s(v) { return v == null ? '' : String(v).trim(); }
function num(v) { var n = Number(v); return isFinite(n) ? n : 0; }
// "2026.06.09(화)" / "26.05" → "YYYY-MM-DD" (일 없으면 빈값)
function parseDate(v) {
  var m = s(v).match(/(\d{4}|\d{2})[.\-/](\d{1,2})[.\-/](\d{1,2})/);
  if (!m) return '';
  var y = m[1].length === 2 ? '20' + m[1] : m[1];
  var pad = function (x) { return (x.length < 2 ? '0' : '') + x; };
  return y + '-' + pad(m[2]) + '-' + pad(m[3]);
}
// 계약 시작 "26/07/01~..." → 연*12+월 (없으면 null)
function contractStart(v) {
  var m = s(v).match(/(\d{2})[\/.](\d{1,2})/);
  if (!m) return null;
  return (2000 + Number(m[1])) * 12 + Number(m[2]);
}

module.exports = async (req, res) => {
  const secret = process.env.AUTH_SECRET;
  if (!secret) { res.status(503).send('Server auth not configured'); return; }
  if (!verifyToken(getCookie(req, 'br_auth'), secret)) { res.status(401).send('Unauthorized'); return; }

  // 워밍 캐시 즉답 (90초 이내) — 시트 왕복 생략.
  if (_cache && (Date.now() - _cache.at) < CACHE_TTL) {
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Pipeline-Cache', 'HIT');
    res.status(200).json(_cache.payload);
    return;
  }

  const base = process.env.SHEET_APPS_URL, tok = process.env.SHEET_TOKEN;
  if (!base || !tok) { res.status(503).json({ error: 'sheet not configured' }); return; }

  try {
    const url = base + '?token=' + encodeURIComponent(tok) + '&tab=BC-BR';
    const r = await fetch(url, { redirect: 'follow' });
    if (!r.ok) throw new Error('apps script ' + r.status);
    const data = await r.json();
    const rows = (data && data.rows) || [];

    const ACTIVE_FROM = 2026 * 12 + 7; // 26/07 이후 시작분만 '수주완료'로 보드 노출
    const brands = [];
    const summary = {};
    let kpiTarget = 0, kpiRate = 0;

    rows.forEach(function (row, idx) {
      const label = s(row[2]);
      if (label === 'KPI 달성율') { kpiTarget = num(row[3]); kpiRate = num(row[4]); return; }
      const stage = STAGE[label];
      if (!stage) return;
      const c3 = row[3];
      if (typeof c3 === 'number') {            // 상단 집계 행 (회사 요약)
        summary[stage] = { count: num(c3), amount: num(row[4]) };
        return;
      }
      const name = s(c3);
      if (!name) return;                        // 프로젝트 목록 행
      if (/OOS|이월/.test(name)) return;        // 서브 라인 제외
      if (stage === 'dropped') return;          // 드랍 제외(보드)
      if (stage === 'won') {
        const cs = contractStart(row[7]);
        if (cs !== null && cs < ACTIVE_FROM) return; // 이미 진행 중인 기존 수주 제외(최근/예정 수주만)
      }
      brands.push({
        slug: 'br-' + (s(row[1]) || idx),
        name: name,
        company: s(row[4]),
        source: s(row[5]),
        consultDate: parseDate(row[6]),
        contract: s(row[7]),
        amount: num(row[8]),
        monthly: num(row[9]),
        owner: s(row[10]),
        scope: s(row[11]),
        tier: s(row[13]),
        note: s(row[14]) || s(row[15]),
        prep: /PREP/i.test(s(row[17])),
        quoteSentDate: s(row[18]),
        quoteType: s(row[19]),
        defaultStage: stage
      });
    });

    const payload = {
      ok: true, brands: brands, summary: summary,
      kpi: { target: kpiTarget, rate: kpiRate },
      updatedAt: Date.now()
    };
    _cache = { at: Date.now(), payload: payload };   // 워밍 캐시 갱신
    res.setHeader('Cache-Control', 'no-store');
    res.setHeader('X-Pipeline-Cache', 'MISS');
    res.status(200).json(payload);
  } catch (e) {
    // 시트 호출 실패 → 직전 데이터라도 내려 빈 보드 방지(스테일 폴백).
    if (_cache && _cache.payload) {
      res.setHeader('Cache-Control', 'no-store');
      res.setHeader('X-Pipeline-Cache', 'STALE');
      res.status(200).json(_cache.payload);
      return;
    }
    res.status(502).json({ error: 'sheet read failed: ' + (e && e.message ? e.message : 'unknown') });
  }
};
