// 견적 HTML → PDF (Node 서버리스). 작성자(빌더, 로그인 상태)가 호출.
// · 인증 게이트: br_auth 쿠키 검증(미들웨어와 동일 HMAC). 팀만 호출 가능 → 남용·SSRF 표면 축소.
// · 렌더 격리: setContent + 요청 인터셉트로 폰트 CDN(jsdelivr)·data URI만 허용, 그 외 전부 차단(SSRF 방지).
// · 한글: 견적 HTML이 Pretendard(jsdelivr)를 @font-face로 불러옴 → networkidle + document.fonts.ready 대기 후 캡처.
const crypto = require('crypto');

// br_auth = "<exp>.<hex sig>",  sig = HMAC-SHA256(exp, AUTH_SECRET)  (middleware.ts와 동일 규약)
function verifyToken(token, secret) {
  if (!token) return false;
  const i = token.lastIndexOf('.');
  if (i < 0) return false;
  const exp = token.slice(0, i), sig = token.slice(i + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  const expected = crypto.createHmac('sha256', secret).update(exp).digest('hex');
  if (expected.length !== sig.length) return false;
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)); }
  catch (e) { return false; }
}

function getCookie(req, name) {
  const c = req.headers.cookie || '';
  const m = c.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return m ? decodeURIComponent(m[1]) : '';
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') { res.status(405).send('Method Not Allowed'); return; }

  const secret = process.env.AUTH_SECRET;
  if (!secret) { res.status(503).send('Server auth not configured'); return; }
  if (!verifyToken(getCookie(req, 'br_auth'), secret)) { res.status(401).send('Unauthorized'); return; }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  const html = body && body.html;
  const rawName = (body && body.name) || 'quote';
  if (!html || typeof html !== 'string' || html.length > 600000) { res.status(400).send('Bad Request'); return; }

  let browser;
  try {
    // ESM 전용 패키지(@sparticuz/chromium@149, puppeteer-core@25) → CJS에서는 동적 import.
    const chromiumMod = await import('@sparticuz/chromium');
    const chromium = chromiumMod.default || chromiumMod;
    const puppeteerMod = await import('puppeteer-core');
    const puppeteer = puppeteerMod.default || puppeteerMod;

    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: { width: 920, height: 1300, deviceScaleFactor: 2 },
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });
    const page = await browser.newPage();

    // SSRF 차단 — 폰트 CDN과 data URI 외 모든 외부 요청 차단.
    await page.setRequestInterception(true);
    page.on('request', (r) => {
      const u = r.url();
      if (u.startsWith('data:') || u.indexOf('cdn.jsdelivr.net') !== -1) r.continue();
      else r.abort();
    });

    await page.setContent(html, { waitUntil: 'networkidle0', timeout: 20000 });
    try { await page.evaluateHandle('document.fonts.ready'); } catch (e) {}

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    const safe = String(rawName).replace(/[\r\n"]/g, '').slice(0, 120);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition',
      "attachment; filename=\"quote.pdf\"; filename*=UTF-8''" + encodeURIComponent(safe) + '.pdf');
    res.setHeader('Cache-Control', 'no-store');
    // page.pdf()는 Uint8Array 반환 → Buffer로 감싸야 res.send가 JSON 직렬화 않고 raw 바이트 전송.
    res.status(200).send(Buffer.from(pdf));
  } catch (e) {
    res.status(500).send('PDF render failed: ' + (e && e.message ? e.message : 'unknown'));
  } finally {
    if (browser) { try { await browser.close(); } catch (e) {} }
  }
};
