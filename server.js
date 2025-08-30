// Minimal local API to persist data to a repo file.
// Run: node server.js (uses port 8787)
import { createServer } from 'http';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const DATA_DIR = join(__dirname, 'data');
const DATA_FILE = join(DATA_DIR, 'rocky.json');

async function ensureDataFile() {
  if (!existsSync(DATA_DIR)) await mkdir(DATA_DIR, { recursive: true });
  if (!existsSync(DATA_FILE)) await writeFile(DATA_FILE, JSON.stringify({ version: 1, days: [], goals: [] }, null, 2));
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    ...headers,
  });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'OPTIONS') return send(res, 204, '');
    if (req.url === '/api/load' && req.method === 'GET') {
      await ensureDataFile();
      const data = await readFile(DATA_FILE, 'utf-8');
      return send(res, 200, data);
    }
    if (req.url === '/api/save' && req.method === 'POST') {
      await ensureDataFile();
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const body = Buffer.concat(chunks).toString('utf-8') || '{}';
      // Basic validation to ensure valid JSON
      JSON.parse(body);
      await writeFile(DATA_FILE, body);
      return send(res, 200, { ok: true });
    }
    return send(res, 404, { error: 'Not Found' });
  } catch (e) {
    return send(res, 500, { error: (e && e.message) || 'Internal Error' });
  }
});

server.listen(PORT, () => {
  console.log(`[rocky] data API on http://localhost:${PORT}`);
});

