// 쿠키 만료 → 로그인 페이지로.
export const config = { runtime: 'edge' };

export default async function handler(request: Request): Promise<Response> {
  const origin = new URL(request.url).origin;
  const headers = new Headers();
  headers.set('Location', `${origin}/login.html`);
  headers.append('Set-Cookie', `br_auth=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`);
  return new Response(null, { status: 302, headers });
}
