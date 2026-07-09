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

const groupCategoryOptions = ['LSS', 'HVB', 'Skola', 'Verksamhet'];
const initialGroupTypes = groupCategoryOptions;
const legacyDefaultGroupTypes = ['Verksamhetsstöd', 'Assistent', 'Administration', 'Vikarier'];
const initialGroups = [
  { name: 'Björkhagen', types: ['LSS'] },
  { name: 'Solbacken', types: ['Skola', 'HVB'] },
  { name: 'Ängslyckan', types: ['HVB', 'LSS'] },
];
const initialAdmins = [
  { id: 1, name: 'Tobias Glad', email: 'tobias.glad@mikaelgarden.se', role: 'Admin', password: 'Herzen222' },
];
const initialPeopleSeed = [
  { id: 1, firstName: 'Elin', lastName: 'Berg', name: 'Elin Berg', initials: 'EB', personalNumber: '19870412-2384', address: 'Lindvägen 14, 153 31 Järna', email: 'elin.berg@folk.se', phone: '070-182 31 40', education: 'Undersköterska', unit: 'Björkhagen', group: 'LSS', role: 'Stödassistent', rate: 100, employmentType: 'Tillsvidare', status: 'Anställd', start: '2025-08-18', employmentDate: '2025-08-18', probationStart: '2025-08-18', probationEnd: '2026-02-18', color: '#d9e9e2' },
  { id: 2, firstName: 'Marcus', lastName: 'Lind', name: 'Marcus Lind', initials: 'ML', personalNumber: '19920308-4172', address: 'Stationsgatan 7, 153 30 Järna', email: 'marcus.lind@folk.se', phone: '072-881 15 02', education: 'Socialpedagog', unit: 'Björkhagen', group: 'LSS', role: 'Boendestödjare', rate: 80, employmentType: 'Provanställning', status: 'Anställd', start: '2026-02-01', employmentDate: '2026-02-01', probationStart: '2026-02-01', probationEnd: '2026-08-01', color: '#e6e0d8' },
  { id: 3, firstName: 'Sara', lastName: 'Ahmed', name: 'Sara Ahmed', initials: 'SA', personalNumber: '19961122-6541', address: 'Parkgatan 22, 151 34 Södertälje', email: 'sara.ahmed@folk.se', phone: '073-491 44 88', education: 'Barnskötare', unit: 'Solbacken', group: 'Skola', role: 'Elevassistent', rate: 100, employmentType: 'Tidsbegränsad', status: 'Anställd', start: '2026-01-15', employmentDate: '2026-01-15', probationStart: '', probationEnd: '', color: '#e4dbe8' },
  { id: 4, firstName: 'Oskar', lastName: 'Persson', name: 'Oskar Persson', initials: 'OP', personalNumber: '19811004-1198', address: 'Mossstigen 3, 153 35 Järna', email: 'oskar.persson@folk.se', phone: '070-390 22 17', education: 'Socionom', unit: 'Solbacken', group: 'HVB', role: 'Samordnare', rate: 100, employmentType: 'Tillsvidare', status: 'Anställd', start: '2024-11-01', employmentDate: '2024-11-01', probationStart: '2024-11-01', probationEnd: '2025-05-01', color: '#dae2ec' },
  { id: 5, firstName: 'Linnea', lastName: 'Karlsson', name: 'Linnea Karlsson', initials: 'LK', personalNumber: '19980519-7835', address: 'Ekgården 5, 153 32 Järna', email: 'linnea.karlsson@folk.se', phone: '076-228 18 19', education: 'Behandlingspedagog', unit: 'Ängslyckan', group: 'HVB', role: 'Behandlingsassistent', rate: 75, employmentType: 'Provanställning', status: 'Anställd', start: '2026-03-12', employmentDate: '2026-03-12', probationStart: '2026-03-12', probationEnd: '2026-09-12', color: '#eee0d7' },
  { id: 6, firstName: 'Jonas', lastName: 'Nilsson', name: 'Jonas Nilsson', initials: 'JN', personalNumber: '19790630-3326', address: 'Torgvägen 9, 153 36 Järna', email: 'jonas.nilsson@folk.se', phone: '070-225 91 02', education: 'Vård- och omsorgsprogrammet', unit: 'Ängslyckan', group: 'LSS', role: 'Timvikarie', rate: 40, employmentType: 'Timanställning', status: 'Anställd', start: '2026-04-10', employmentDate: '2026-04-10', probationStart: '', probationEnd: '', color: '#dbe8df' },
];

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
db.exec('PRAGMA foreign_keys = ON');
db.exec(`
  CREATE TABLE IF NOT EXISTS app_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    state_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL DEFAULT '',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS people (
    id INTEGER PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    personal_number TEXT NOT NULL UNIQUE,
    address TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    education TEXT NOT NULL DEFAULT '',
    role TEXT NOT NULL DEFAULT '',
    group_id INTEGER REFERENCES groups(id) ON UPDATE CASCADE ON DELETE SET NULL,
    group_type TEXT NOT NULL DEFAULT '',
    employment_start TEXT NOT NULL DEFAULT '',
    employment_type TEXT NOT NULL DEFAULT '',
    probation_start TEXT NOT NULL DEFAULT '',
    probation_end TEXT NOT NULL DEFAULT '',
    rate INTEGER NOT NULL DEFAULT 100,
    status TEXT NOT NULL DEFAULT 'Anställd',
    color TEXT NOT NULL DEFAULT '#dce9e3',
    documents_json TEXT NOT NULL DEFAULT '[]',
    recruitment_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS person_field_definitions (
    key TEXT PRIMARY KEY,
    label TEXT NOT NULL,
    data_type TEXT NOT NULL DEFAULT 'text',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS person_field_values (
    person_id INTEGER NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    key TEXT NOT NULL REFERENCES person_field_definitions(key) ON DELETE CASCADE,
    value TEXT NOT NULL DEFAULT '',
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (person_id, key)
  );
`);

const groupLabel = group => (typeof group === 'string' ? group : group?.name || group?.unit || '');
const normalizeGroupTypes = groupTypes => {
  const values = (Array.isArray(groupTypes) ? groupTypes : [groupTypes]).flatMap(groupType => {
    if (typeof groupType === 'string') return groupType.split(',').map(value => value.trim());
    if (Array.isArray(groupType?.types)) return groupType.types;
    return groupType?.type || groupType?.group || '';
  });
  return Array.from(new Set(values.filter(Boolean)));
};
const normalizeGroups = groups => {
  const byName = new Map();
  (Array.isArray(groups) ? groups : []).forEach(group => {
    const name = groupLabel(group);
    if (!name) return;
    const types = normalizeGroupTypes(typeof group === 'string' ? [] : (group.types || group.type || group.groupTypes || group.groupType || []));
    const current = byName.get(name) || { name, types: [] };
    byName.set(name, { name, types: normalizeGroupTypes([...current.types, ...types]) });
  });
  return Array.from(byName.values());
};
const initialsFor = name => name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'P';
const splitName = person => {
  const fullName = String(person.name || '').trim();
  const parts = fullName.split(/\s+/).filter(Boolean);
  return {
    firstName: person.firstName || person.first_name || parts[0] || '',
    lastName: person.lastName || person.last_name || parts.slice(1).join(' ') || '',
  };
};
const parseJson = (value, fallback) => {
  try { return value ? JSON.parse(value) : fallback; } catch { return fallback; }
};

function ensureSeedUsers(state) {
  const users = Array.isArray(state.admins) ? state.admins : [];
  const byEmail = new Map(users.map(user => [String(user.email || '').toLowerCase(), user]));
  for (const seedUser of initialAdmins) {
    byEmail.set(seedUser.email.toLowerCase(), { ...byEmail.get(seedUser.email.toLowerCase()), ...seedUser });
  }
  return { ...state, admins: Array.from(byEmail.values()) };
}

function normalizeState(state) {
  return ensureSeedUsers({
    people: Array.isArray(state.people) ? state.people : [],
    groups: normalizeGroups(Array.isArray(state.groups) && state.groups.length ? state.groups : initialGroups),
    groupTypes: groupCategoryOptions,
    admins: Array.isArray(state.admins) ? state.admins : initialAdmins,
    colorTheme: ['folk', 'mikaelgarden'].includes(state.colorTheme) ? state.colorTheme : 'folk',
  });
}

function groupIdForName(name, type = '') {
  const trimmed = groupLabel(name).trim();
  if (!trimmed) return null;
  db.prepare(`
    INSERT INTO groups (name, type, updated_at)
    VALUES (?, ?, ?)
    ON CONFLICT(name) DO UPDATE SET type = COALESCE(NULLIF(excluded.type, ''), groups.type), active = 1, updated_at = excluded.updated_at
  `).run(trimmed, normalizeGroupTypes(type).join(','), new Date().toISOString());
  return db.prepare('SELECT id FROM groups WHERE name = ?').get(trimmed)?.id || null;
}

function toDbPerson(person) {
  const { firstName, lastName } = splitName(person);
  const name = `${firstName} ${lastName}`.trim() || person.name || 'Namnlös';
  const groupId = groupIdForName(person.unit || person.groupName || person.groupUnit || '', person.group || person.groupType || '');
  return {
    id: Number(person.id) || Date.now(),
    firstName: firstName || name,
    lastName,
    personalNumber: person.personalNumber || person.personnummer || person.ssn || `saknas-${Number(person.id) || Date.now()}`,
    address: person.address || person.adress || '',
    email: person.email || '',
    phone: person.phone || person.telefon || '',
    education: person.education || person.utbildning || '',
    role: person.role || person.roll || '',
    groupId,
    groupType: person.group || person.groupType || '',
    employmentStart: person.employmentDate || person.employmentStart || person.start || '',
    employmentType: person.employmentType || person.anstallningstyp || '',
    probationStart: person.probationStart || '',
    probationEnd: person.probationEnd || '',
    rate: Number(person.rate) || 100,
    status: person.status || 'Anställd',
    color: person.color || '#dce9e3',
    documentsJson: JSON.stringify(Array.isArray(person.documents) ? person.documents : []),
    recruitmentJson: JSON.stringify({}),
  };
}

function upsertPerson(person) {
  const p = toDbPerson(person);
  db.prepare(`
    INSERT INTO people (
      id, first_name, last_name, personal_number, address, email, phone, education, role, group_id, group_type,
      employment_start, employment_type, probation_start, probation_end, rate, status, color, documents_json, recruitment_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      first_name = excluded.first_name,
      last_name = excluded.last_name,
      personal_number = excluded.personal_number,
      address = excluded.address,
      email = excluded.email,
      phone = excluded.phone,
      education = excluded.education,
      role = excluded.role,
      group_id = excluded.group_id,
      group_type = excluded.group_type,
      employment_start = excluded.employment_start,
      employment_type = excluded.employment_type,
      probation_start = excluded.probation_start,
      probation_end = excluded.probation_end,
      rate = excluded.rate,
      status = excluded.status,
      color = excluded.color,
      documents_json = excluded.documents_json,
      recruitment_json = excluded.recruitment_json,
      updated_at = excluded.updated_at
  `).run(
    p.id, p.firstName, p.lastName, p.personalNumber, p.address, p.email, p.phone, p.education, p.role, p.groupId, p.groupType,
    p.employmentStart, p.employmentType, p.probationStart, p.probationEnd, p.rate, p.status, p.color, p.documentsJson, p.recruitmentJson, new Date().toISOString()
  );
}

function seedRelationalTables() {
  const count = db.prepare('SELECT COUNT(*) AS count FROM people').get().count;
  if (count === 0) {
    for (const group of initialGroups) groupIdForName(group, group.types || []);
    for (const person of initialPeopleSeed) upsertPerson(person);
  }
}

function peopleFromDb() {
  return db.prepare(`
    SELECT people.*, groups.name AS unit_name
    FROM people
    LEFT JOIN groups ON groups.id = people.group_id
    ORDER BY groups.name COLLATE NOCASE, people.last_name COLLATE NOCASE, people.first_name COLLATE NOCASE
  `).all().map(row => {
    const name = `${row.first_name} ${row.last_name}`.trim();
    const employmentDate = row.employment_start || '';
    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      name,
      initials: initialsFor(name),
      personalNumber: row.personal_number,
      address: row.address,
      email: row.email,
      phone: row.phone,
      education: row.education,
      role: row.role,
      unit: row.unit_name || '',
      group: row.group_type || '',
      employmentDate,
      employmentStart: employmentDate,
      employmentType: row.employment_type,
      probationStart: row.probation_start,
      probationEnd: row.probation_end,
      rate: row.rate,
      status: row.status,
      start: employmentDate,
      color: row.color,
      documents: parseJson(row.documents_json, []),
    };
  });
}

function groupsFromDb() {
  return db.prepare('SELECT name, type FROM groups WHERE active = 1 ORDER BY name COLLATE NOCASE').all().map(row => {
    const types = normalizeGroupTypes(row.type);
    return { name: row.name, types: types.length ? types : ['Verksamhet'] };
  });
}

function metadataState() {
  const row = db.prepare('SELECT state_json FROM app_state WHERE id = 1').get();
  return row ? normalizeState(parseJson(row.state_json, {})) : normalizeState({});
}

function readState() {
  seedRelationalTables();
  const metadata = metadataState();
  const people = peopleFromDb();
  const groups = groupsFromDb();
  const usedGroupTypes = people.map(person => person.group).filter(Boolean);
  const groupTypes = normalizeGroupTypes([...groupCategoryOptions, ...groups.flatMap(group => group.types || []), ...usedGroupTypes]);
  return normalizeState({ ...metadata, people, groups, groupTypes });
}

function writeState(state) {
  const next = normalizeState(state);
  for (const group of next.groups) groupIdForName(group, group.types || group.type || []);
  for (const person of next.people) upsertPerson(person);
  const saved = { ...next, people: peopleFromDb(), groups: groupsFromDb() };
  db.prepare(`
    INSERT INTO app_state (id, state_json, updated_at)
    VALUES (1, ?, ?)
    ON CONFLICT(id) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at
  `).run(JSON.stringify({ ...saved, people: [] }), new Date().toISOString());
  return saved;
}

seedRelationalTables();

function sendJson(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(body));
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
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
      sendJson(res, 200, { ok: true, database: dbPath });
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
  console.log(`Folk. backend listening on http://localhost:${port}`);
  console.log(`SQLite database: ${dbPath}`);
});
