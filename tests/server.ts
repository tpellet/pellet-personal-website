import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';

const base = new URL(process.env.E2E_BASE_URL ?? 'http://127.0.0.1:4173/pellet-personal-website/');
const root = resolve(process.env.E2E_SITE_DIR ?? 'public');
const types: Record<string, string> = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.xml': 'application/xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp',
};

createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url ?? '/', base).pathname);
    if (!path.startsWith(base.pathname)) {
      response.writeHead(404).end();
      return;
    }
    let file = resolve(root, path.slice(base.pathname.length));
    if (file !== root && !file.startsWith(root + sep)) {
      response.writeHead(403).end();
      return;
    }
    let status = 200;
    try {
      if ((await stat(file)).isDirectory()) file = resolve(file, 'index.html');
      await stat(file);
    } catch {
      file = resolve(root, '404.html');
      status = 404;
    }
    response.writeHead(status, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream' });
    response.end(await readFile(file));
  } catch {
    response.writeHead(500).end();
  }
}).listen(Number(base.port), base.hostname);
