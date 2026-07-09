import { createReadStream, existsSync } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleLlmGenerateRequest, isLlmGeneratePath } from './llm-api.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const port = Number(process.env.PORT || 5173);
const host = process.env.HOST || '127.0.0.1';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

function sendNotFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('Not found');
}

function safeJoin(base, urlPath) {
  const decodedPath = decodeURIComponent(urlPath);
  const normalizedPath = path.normalize(decodedPath).replace(/^(\.\.[/\\])+/, '');
  const filePath = path.join(base, normalizedPath);

  if (!filePath.startsWith(base)) {
    return null;
  }

  return filePath;
}

async function serveStatic(req, res) {
  const url = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const requestedPath = url.pathname === '/' ? '/index.html' : url.pathname;
  let filePath = safeJoin(distDir, requestedPath);

  if (!filePath) {
    sendNotFound(res);
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (fileStat.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  } catch {
    const fallbackPath = path.join(distDir, 'index.html');
    if (!existsSync(fallbackPath)) {
      sendNotFound(res);
      return;
    }

    filePath = fallbackPath;
  }

  const ext = path.extname(filePath);
  res.statusCode = 200;
  res.setHeader('Content-Type', MIME_TYPES[ext] || 'application/octet-stream');
  createReadStream(filePath).pipe(res);
}

createServer((req, res) => {
  if (isLlmGeneratePath(req.url)) {
    handleLlmGenerateRequest(req, res);
    return;
  }

  serveStatic(req, res).catch(() => {
    res.statusCode = 500;
    res.end('Internal server error');
  });
}).listen(port, host, () => {
  console.log(`Server listening on http://${host}:${port}`);
});
