// 비밀번호 검증 → 서명 쿠키 발급. Edge 런타임(Web Crypto).
export const config = { runtime: 'edge' };

const COOKIE = 'br_auth';
const MAX_AGE = 60 * 60 * 24 * 30; // 30일

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function sign(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value)));
}

function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const password = process.env.SITE_PASSWORD;
  const secret = process.env.AUTH_SECRET;
  if (!password || !secret) {
    return new Response('Server auth not configured', { status: 503 });
  }

  let input = '';
  let redirect = '/';
  const ct = request.headers.get('content-type') ?? '';
  if (ct.includes('application/json')) {
    const body = await request.json().catch(() => ({}));
    input = String(body.password ?? '');
    redirect = String(body.redirect ?? '/');
  } else {
    const form = await request.formData();
    input = String(form.get('password') ?? '');
    redirect = String(form.get('redirect') ?? '/');
  }

  const origin = new URL(request.url).origin;

  if (!safeEqual(input, password)) {
    const back = new URL('/login.html', origin);
    back.searchParams.set('error', '1');
    if (redirect && redirect !== '/') back.searchParams.set('redirect', redirect);
    return Response.redirect(back.toString(), 302);
  }

  // 오픈 리다이렉트 방지: 내부 절대경로만 허용
  if (!redirect.startsWith('/') || redirect.startsWith('//')) redirect = '/';

  const exp = String(Date.now() + MAX_AGE * 1000);
  const token = `${exp}.${await sign(exp, secret)}`;

  const headers = new Headers();
  headers.set('Location', new URL(redirect, origin).toString());
  headers.append(
    'Set-Cookie',
    `${COOKIE}=${encodeURIComponent(token)}; Path=/; Max-Age=${MAX_AGE}; HttpOnly; Secure; SameSite=Lax`,
  );
  return new Response(null, { status: 302, headers });
}
