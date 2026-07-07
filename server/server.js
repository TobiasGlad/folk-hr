import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join, resolve } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const rootDir = resolve(new URL('..', import.meta.url).pathname);
const dataDir = join(rootDir, 'data');
const dbPath = join(dataDir, 'folk.db');
const distDir = join(rootDir, 'dist');
const port = Number(process.env.PORT || 8020);

const initialGroups = [
  { id: 1, name: 'Örjanshuset', type: 'LSS' },
  { id: 2, name: 'Skogshuset', type: 'LSS' },
  { id: 3, name: 'Vikarier', type: 'Vikarier' },
];
const initialAdmins = [
  { id: 1, name: 'Tobias Glad', email: 'tobias.glad@mikaelgarden.se', role: 'Admin', password: 'Herzen222' },
];
const initialPeopleSeed = [
  { id: 1, name: 'Elin Berg', initials: 'EB', email: 'elin.berg@folk.se', phone: '070-182 31 40', group: 'Örjanshuset', role: 'Stödassistent', rate: 100, stage: 2, status: 'Rekrytering', start: '2026-08-18', employmentDate: '2026-08-18', probationEnd: '2027-02-18', color: '#d9e9e2' },
  { id: 2, name: 'Marcus Lind', initials: 'ML', email: 'marcus.lind@folk.se', phone: '072-881 15 02', group: 'Skogshuset', role: 'Boendestödjare', rate: 80, stage: 1, status: 'Rekrytering', start: '2026-09-01', employmentDate: '2026-09-01', probationEnd: '2027-03-01', color: '#e6e0d8' },
  { id: 3, name: 'Sara Ahmed', initials: 'SA', email: 'sara.ahmed@folk.se', phone: '073-491 44 88', group: 'Vikarier', role: 'Stödassistent', rate: 100, stage: 3, status: 'Rekrytering', start: '2026-07-15', employmentDate: '2026-07-15', probationEnd: '2027-01-15', color: '#e4dbe8' },
  { id: 4, name: 'Oskar Persson', initials: 'OP', email: 'oskar.persson@folk.se', phone: '070-390 22 17', group: 'Örjanshuset', role: 'Samordnare', rate: 100, stage: 4, status: 'Anställd', start: '2025-12-01', employmentDate: '2025-12-01', probationEnd: '2026-08-24', color: '#dae2ec' },
  { id: 5, name: 'Linnea Karlsson', initials: 'LK', email: 'linnea.karlsson@folk.se', phone: '076-228 18 19', group: 'Skogshuset', role: 'Stödassistent', rate: 75, stage: 4, status: 'Anställd', start: '2026-01-12', employmentDate: '2026-01-12', probationEnd: '2026-09-02', color: '#eee0d7' },
  { id: 6, name: 'Jonas Nilsson', initials: 'JN', email: 'jonas.nilsson@folk.se', phone: '070-225 91 02', group: 'Vikarier', role: 'Timvikarie', rate: 40, stage: 4, status: 'Anställd', start: '2026-03-10', employmentDate: '2026-03-10', probationEnd: '2026-09-15', color: '#dbe8df' },
];
const normalizeGroups = groups => groups.map(group => (
  group && group.name === 'Vikarier' && group.type !== 'Vikarier'
    ? { ...group, type: 'Vikarier' }
    : group
));


const seedState = {
  people: initialPeopleSeed,
  groups: normalizeGroups(initialGroups),
  calendarEvents: [],
  admins: initialAdmins,
  retentionDays: 30,
  colorTheme: "folk",
};

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
`);

function ensureSeedUsers(state) {
  const users = Array.isArray(state.admins) ? state.admins : [];
  const byEmail = new Map(users.map(user => [String(user.email || '').toLowerCase(), user]));
  for (const seedUser of seedState.admins) {
    byEmail.set(seedUser.email.toLowerCase(), { ...byEmail.get(seedUser.email.toLowerCase()), ...seedUser });
  }
  return { ...state, admins: Array.from(byEmail.values()) };
}

function readState() {
  const row = db.prepare('SELECT state_json FROM app_state WHERE id = 1').get();
  if (!row) {
    writeState(seedState);
    return seedState;
  }
  try {
    const state = ensureSeedUsers(JSON.parse(row.state_json));
    const hasBadInitialSeed = (!Array.isArray(state.people) || state.people.length === 0)
      && Array.isArray(state.groups)
      && state.groups.some(group => group.name === 'Orjanshuset' || group.name === 'Verksamhetsstod');
    if (hasBadInitialSeed) {
      return writeState(seedState);
    }
    return { ...state, groups: normalizeGroups(Array.isArray(state.groups) ? state.groups : seedState.groups) };
  } catch {
    return seedState;
  }
}

function writeState(state) {
  const next = ensureSeedUsers({
    people: Array.isArray(state.people) ? state.people : [],
    groups: normalizeGroups(Array.isArray(state.groups) ? state.groups : seedState.groups),
    calendarEvents: Array.isArray(state.calendarEvents) ? state.calendarEvents : [],
    admins: Array.isArray(state.admins) ? state.admins : seedState.admins,
    retentionDays: Number(state.retentionDays) || seedState.retentionDays,
    colorTheme: ["folk", "mikaelgarden"].includes(state.colorTheme) ? state.colorTheme : seedState.colorTheme,
  });
  db.prepare(`
    INSERT INTO app_state (id, state_json, updated_at)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
  `).run(JSON.stringify(next), new Date().toISOString());
  return next;
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

async function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const requested = url.pathname === '/' ? '/index.html' : url.pathname;
  const filePath = resolve(join(distDir, requested));
  const safePath = filePath.startsWith(distDir) ? filePath : join(distDir, 'index.html');
  const target = await stat(safePath).then(info => info.isFile() ? safePath : join(distDir, 'index.html')).catch(() => join(distDir, 'index.html'));
  const body = await readFile(target);
  res.writeHead(200, { 'content-type': mimeTypes[extname(target)] || 'application/octet-stream' });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname === '/api/health') {
      sendJson(res, 200, { ok: true });
      return;
    }
    if (url.pathname === '/api/state' && req.method === 'GET') {
      sendJson(res, 200, readState());
      return;
    }
    if (url.pathname === '/api/state' && req.method === 'PUT') {
      const state = await readJson(req);
      sendJson(res, 200, writeState(state));
      return;
    }
    if (url.pathname.startsWith('/api/')) {
      sendJson(res, 404, { error: 'Not found' });
      return;
    }
    await serveStatic(req, res);
  } catch (error) {
    sendJson(res, 500, { error: error.message });
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Folk backend listening on http://localhost:${port}`);
  console.log(`SQLite database: ${dbPath}`);
});
