import { readCatalog, selectGroup } from '../lib/catalog.mjs';
import { authorize, privateHeaders as headers } from '../lib/auth.mjs';

export default {
  async fetch(request) {
    if (request.method !== 'GET') return Response.json({ error: 'METHOD_NOT_ALLOWED' }, { status: 405, headers: { ...headers, Allow: 'GET' } });
    try {
      const { group, response } = authorize(request);
      if (response) return response;
      return Response.json(selectGroup(await readCatalog(), group), { headers });
    } catch {
      console.error('CATALOG_UNAVAILABLE');
      return Response.json({ error: 'CATALOG_UNAVAILABLE' }, { status: 503, headers: { ...headers, 'Retry-After': '2' } });
    }
  }
};
