import { checkInvitation } from '../lib/share.mjs';
import { groups, privateHeaders, checkPassword, sessionToken, sessionCookie } from '../lib/auth.mjs';
import { allowLogin } from '../lib/login-limit.mjs';

export default {
  async fetch(request) {
    const respond = (error, status, extra = {}) => Response.json({ error }, { status, headers: { ...privateHeaders, ...extra } });
    if (!['POST', 'DELETE'].includes(request.method)) return respond('METHOD_NOT_ALLOWED', 405, { Allow: 'POST, DELETE' });
    const group = new URL(request.url).searchParams.get('group');
    if (!groups.includes(group)) return respond('GROUP_REQUIRED', 400);
    if (request.headers.get('origin') !== new URL(request.url).origin) return respond('ORIGIN_NOT_ALLOWED', 403);
    if (request.method === 'DELETE') return Response.json({ ok: true }, { headers: { ...privateHeaders, 'Set-Cookie': sessionCookie(request, group) } });
    if (!request.headers.get('content-type')?.startsWith('application/json')) return respond('JSON_REQUIRED', 415);
    try {
      const text = await request.text();
      if (text.length > 1024) return respond('BODY_TOO_LARGE', 413);
      let body;
      try { body = JSON.parse(text); } catch { return respond('INVALID_INPUT', 400); }
      const credential = body?.invite ?? body?.password;
      if (typeof credential !== 'string' || !credential.length || credential.length > 128) return respond('INVALID_INPUT', 400);
      if (!await allowLogin(request, group)) return respond('TOO_MANY_ATTEMPTS', 429, { 'Retry-After': '900' });
      if (!(body.invite !== undefined ? checkInvitation(group, body.invite) : await checkPassword(group, body.password))) return respond('INCORRECT_PASSWORD', 401);
      return Response.json({ ok: true }, { headers: { ...privateHeaders, 'Set-Cookie': sessionCookie(request, group, sessionToken(group)) } });
    } catch {
      console.error('ACCESS_UNAVAILABLE');
      return respond('ACCESS_UNAVAILABLE', 503);
    }
  }
};
