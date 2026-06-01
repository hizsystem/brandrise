import { next } from '@vercel/edge';

// 브랜드라이즈 산출물 인증 게이트 (노출 정리 A안).
// 기밀 폴더(견적/제안서/상담준비/리서치 등)만 비밀번호 게이트, 그 외(마케팅 랜딩·진단 퍼널·
// 공유 페이지)는 그대로 공개. Vercel Edge Middleware는 정적 파일 서빙 전 실행되므로
// 정적 HTML까지 막을 수 있다.

export const config = {
  // 전 경로에서 실행하되(누락 위험 0), 아래 GATED 접두사만 실제 차단.
  matcher: ['/((?!_vercel).*)'],
};

const COOKIE = 'br_auth';

// 비밀번호 인증이 필요한 기밀 폴더 (이름 표준화됨 → 신규 산출물 자동 보호)
const GATED = ['/quote', '/proposals', '/new-biz', '/prep', '/consulting', '/research', '/reports'];

function isGated(path: string): boolean {
  return GATED.some((p) => path === p || path.startsWith(p + '/'));
}

function hex(buf: ArrayBuffer): string {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function verify(token: string, secret: string): Promise<boolean> {
  const dot = token.lastIndexOf('.');
  if (dot < 0) return false;
  const exp = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(exp)));
  if (expected.length !== sig.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
  return diff === 0;
}

export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // 기밀 폴더가 아니면 무조건 공개 통과 (랜딩·진단·공유 페이지·로그인 페이지 전부 포함)
  if (!isGated(path)) {
    return next();
  }

  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    // 환경변수 미설정 시 안전하게 차단 (절대 열어두지 않는다)
    return new Response('Server auth not configured', { status: 503 });
  }

  const cookie = request.headers.get('cookie') ?? '';
  const m = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  const token = m ? decodeURIComponent(m[1]) : '';

  if (token && (await verify(token, secret))) {
    return next();
  }

  // 미인증 → 로그인 페이지로. 원래 가려던 경로 보존.
  const login = new URL('/login.html', url.origin);
  login.searchParams.set('redirect', path + url.search);
  return Response.redirect(login.toString(), 302);
}
