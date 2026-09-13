import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readCatalog, selectGroup } from '../lib/catalog.mjs';
import { authorize, privateHeaders } from '../lib/auth.mjs';

export default {
  async fetch(request) {
    if (request.method !== 'GET') return new Response(null, { status: 405, headers: { ...privateHeaders, Allow: 'GET' } });
    try {
      const { group, response } = authorize(request);
      if (response) return response;
      const file = new URL(request.url).searchParams.get('file');
      if (!/^assets\/situbite-[a-z0-9-]+\.jpg$/.test(file || '')) return new Response(null, { status: 404, headers: privateHeaders });
      const catalog = selectGroup(await readCatalog(), group);
      const allowed = new Set([...catalog.people.map(person => person.avatar), ...catalog.items.flatMap(item => item.images.map(image => image.src))]);
      if (!allowed.has(file)) return new Response(null, { status: 404, headers: privateHeaders });
      const body = await readFile(join(process.cwd(), 'dist', file));
      return new Response(body, { headers: { ...privateHeaders, 'Content-Type': 'image/jpeg', 'Cross-Origin-Resource-Policy': 'same-origin' } });
    } catch {
      return new Response(null, { status: 503, headers: privateHeaders });
    }
  }
};
