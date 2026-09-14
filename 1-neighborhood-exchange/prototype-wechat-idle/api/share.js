import { authorize, privateHeaders } from '../lib/auth.mjs';
import { invitation } from '../lib/share.mjs';

export default {
  async fetch(request) {
    if (request.method !== 'GET') return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405, headers: { ...privateHeaders, Allow: 'GET' } });
    try {
      const auth = authorize(request);
      if (auth.response) return auth.response;
      return Response.json({ path: `/${auth.group}#invite=${invitation(auth.group)}` }, { headers: privateHeaders });
    } catch {
      return Response.json({ error: 'SHARE_UNAVAILABLE' }, { status: 503, headers: privateHeaders });
    }
  }
};
