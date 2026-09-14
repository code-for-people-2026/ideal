import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';

const root = resolve('dist');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css', '.json': 'application/json', '.jpg': 'image/jpeg' };
export function startServer(port = Number(process.env.PORT || 4187)) {
  const server = http.createServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://' + req.headers.host);
      if (/^\/(baolong|luanshan)\/$/.test(url.pathname)) {
        res.writeHead(307, { Location: url.pathname.slice(0, -1) }).end();
        return;
      }
      if (['/api/catalog', '/api/access', '/api/media', '/api/share'].includes(url.pathname)) {
        const { default: handler } = await import('..' + url.pathname + '.js');
        const chunks = [];
        for await (const chunk of req) chunks.push(chunk);
        const response = await handler.fetch(new Request(url, { method: req.method, headers: req.headers, ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) }));
        res.writeHead(response.status, Object.fromEntries(response.headers));
        res.end(Buffer.from(await response.arrayBuffer()));
        return;
      }
      if (!['/', '/index.html', '/baolong', '/luanshan', '/app.js', '/style.css', '/share.js', '/qrcode.js'].includes(url.pathname)) { res.writeHead(404).end(); return; }
      const extras = { '/share.js': resolve('web/share.js'), '/qrcode.js': resolve('node_modules/qrcode-generator/dist/qrcode.mjs') };
      const file = extras[url.pathname] || resolve(root, '.' + decodeURIComponent(['/', '/baolong', '/luanshan'].includes(url.pathname) ? '/index.html' : url.pathname));
      if (!extras[url.pathname] && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
      const body = await readFile(file);
      res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
      res.end(body);
    } catch { res.writeHead(404).end(); }
  });
  return new Promise(resolve => server.listen(port, '127.0.0.1', () => resolve(server)));
}
if (process.argv[1]?.replaceAll('\\', '/').endsWith('/scripts/dev-server.mjs')) {
  const server = await startServer();
  console.log(`本地预览：http://127.0.0.1:${server.address().port}`);
}
