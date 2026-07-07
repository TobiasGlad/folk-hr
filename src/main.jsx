import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Users, BriefcaseBusiness, Shapes, ArrowUpDown,
  Settings, Search, Bell, UserPlus, SlidersHorizontal, ChevronRight, CalendarDays,
  Check, LockKeyhole, Plus, X, Trash2, Upload, Download, FileText,
  Building2, Clock3, ShieldCheck, Pencil, MoreHorizontal, Menu, ListChecks, LogOut
} from 'lucide-react';
import './styles.css';

// Första datamängden är lokal och fungerar som seed tills appen kopplas mot backend.
const recruitmentStageLabels = ['CV', 'Registerutdrag', 'Provpass', 'Checklista'];
const initialGroupTypes = ['LSS', 'HVB', 'Skola', 'Verksamhetsstöd', 'Assistent', 'Administration', 'Vikarier'];
const defaultColorTheme = 'folk';
const colorThemes = [
  { id: 'folk', name: 'Folk', description: 'Nuvarande gröna färgskala', colors: ['#0c5948', '#e5f0ec', '#f4f7f6'] },
  { id: 'mikaelgarden', name: 'Mikaelgården', description: 'Profilfärger från mikaelgarden.se', colors: ['#a64356', '#ebdcb1', '#f7f8f3'] },
];
const initialGroups = ['Örjanshuset', 'Lauerhuset', 'Skogshuset', 'Prachthuset', 'Enebacken', 'Tobiashuset', 'Solglimt', 'Lärare', 'Assistent', 'Alla boendehus', 'Vikarier'];
const initialAdmins = [
  { id: 1, name: 'Tobias Glad', email: 'tobias.glad@mikaelgarden.se', role: 'Admin', password: 'Herzen222' },
];
const initialPeopleSeed = [
  { id: 1, name: 'Elin Berg', initials: 'EB', email: 'elin.berg@folk.se', phone: '070-182 31 40', unit: 'Örjanshuset', group: 'LSS', role: 'Stödassistent', rate: 100, stage: 2, status: 'Rekrytering', start: '2026-08-18', employmentDate: '2026-08-18', probationEnd: '2027-02-18', color: '#d9e9e2' },
  { id: 2, name: 'Marcus Lind', initials: 'ML', email: 'marcus.lind@folk.se', phone: '072-881 15 02', unit: 'Skogshuset', group: 'LSS', role: 'Boendestödjare', rate: 80, stage: 1, status: 'Rekrytering', start: '2026-09-01', employmentDate: '2026-09-01', probationEnd: '2027-03-01', color: '#e6e0d8' },
  { id: 3, name: 'Sara Ahmed', initials: 'SA', email: 'sara.ahmed@folk.se', phone: '073-491 44 88', unit: 'Vikarier', group: 'Vikarier', role: 'Stödassistent', rate: 100, stage: 3, status: 'Rekrytering', start: '2026-07-15', employmentDate: '2026-07-15', probationEnd: '2027-01-15', color: '#e4dbe8' },
  { id: 4, name: 'Oskar Persson', initials: 'OP', email: 'oskar.persson@folk.se', phone: '070-390 22 17', unit: 'Örjanshuset', group: 'LSS', role: 'Samordnare', rate: 100, stage: 4, status: 'Anställd', start: '2025-12-01', employmentDate: '2025-12-01', probationEnd: '2026-08-24', color: '#dae2ec' },
  { id: 5, name: 'Linnea Karlsson', initials: 'LK', email: 'linnea.karlsson@folk.se', phone: '076-228 18 19', unit: 'Skogshuset', group: 'LSS', role: 'Stödassistent', rate: 75, stage: 4, status: 'Anställd', start: '2026-01-12', employmentDate: '2026-01-12', probationEnd: '2026-09-02', color: '#eee0d7' },
  { id: 6, name: 'Jonas Nilsson', initials: 'JN', email: 'jonas.nilsson@folk.se', phone: '070-225 91 02', unit: 'Vikarier', group: 'Vikarier', role: 'Timvikarie', rate: 40, stage: 4, status: 'Anställd', start: '2026-03-10', employmentDate: '2026-03-10', probationEnd: '2026-09-15', color: '#dbe8df' },
];
const storageKey = 'folk-hr-state-v5';
const defaultRetentionDays = 30;
const documentKinds = ['CV', 'Registerutdrag', 'Kvitto', 'Intyg', 'Avtal', 'Annat'];
const apiStatePath = '/api/state';

async function loadBackendState() {
  const response = await fetch(apiStatePath, { headers: { accept: 'application/json' } });
  if (!response.ok) throw new Error('Kunde inte ladda data från backend');
  return response.json();
}

async function saveBackendState(state) {
  const response = await fetch(apiStatePath, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(state),
  });
  if (!response.ok) throw new Error('Kunde inte spara data till backend');
  return response.json();
}

function makeRecruitmentSteps(completedCount = 0, existing = []) {
  return recruitmentStageLabels.map((label, index) => {
    const current = existing[index] || {};
    return {
      id: current.id || `step-${index}`,
      label,
      note: current.note || '',
      completed: typeof current.completed === 'boolean' ? current.completed : index < completedCount,
      savedAt: current.savedAt || null,
      savedBy: current.savedBy || null,
      approvedAt: current.approvedAt || null,
      approvedBy: current.approvedBy || null,
      file: current.file || null,
      documentKind: current.documentKind || '',
      documentLabel: current.documentLabel || '',
    };
  });
}

function constrainRecruitmentSteps(steps) {
  let blocked = false;
  return steps.map(step => {
    if (blocked) {
      return { ...step, completed: false };
    }
    if (!step.completed) {
      blocked = true;
    }
    return step;
  });
}

function normalizeDocument(doc, fallback = {}) {
  if (!doc && !fallback) return null;
  const name = doc?.name || fallback.name || 'Dokument';
  const dataUrl = doc?.dataUrl || fallback.dataUrl || '';
  const uploadedAt = doc?.uploadedAt || fallback.uploadedAt || fallback.createdAt || new Date().toISOString();
  return {
    id: doc?.id || fallback.id || `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    kind: doc?.kind || doc?.documentKind || fallback.kind || fallback.documentKind || doc?.type || fallback.type || 'Annat',
    label: doc?.label || fallback.label || doc?.documentLabel || fallback.documentLabel || '',
    note: doc?.note || fallback.note || '',
    uploadedAt,
    source: doc?.source || fallback.source || 'Medarbetare',
    stepId: doc?.stepId || fallback.stepId || '',
    stepLabel: doc?.stepLabel || fallback.stepLabel || '',
    mimeType: doc?.mimeType || doc?.type || fallback.mimeType || fallback.type || '',
    dataUrl,
  };
}

function normalizeDocuments(documents = [], recruitmentSteps = []) {
  const normalized = documents.map((doc, index) => normalizeDocument(doc, { id: doc?.id || `doc-${index}` })).filter(Boolean);
  const derived = recruitmentSteps.flatMap(step => {
    if (!step?.file) return [];
    return [normalizeDocument(step.file, {
      id: step.file.id || `step-doc-${step.id}`,
      name: step.file.name || step.documentLabel || step.label || 'Dokument',
      kind: step.documentKind || 'Annat',
      label: step.documentLabel || step.label || '',
      source: 'Rekrytering',
      stepId: step.id,
      stepLabel: step.label,
      uploadedAt: step.savedAt || new Date().toISOString(),
      mimeType: step.file.type || step.file.mimeType || '',
      dataUrl: step.file.dataUrl || '',
    })];
  });
  const seen = new Set();
  return [...normalized, ...derived].filter(doc => {
    const key = doc.dataUrl ? `${doc.kind}|${doc.name}|${doc.dataUrl}` : `${doc.kind}|${doc.name}|${doc.uploadedAt}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function createDocumentEntry(fileRecord, meta = {}) {
  return normalizeDocument({
    name: fileRecord.name,
    mimeType: fileRecord.mimeType || fileRecord.type || '',
    dataUrl: fileRecord.dataUrl,
    kind: meta.kind || 'Annat',
    label: meta.label || '',
    note: meta.note || '',
    source: meta.source || 'Medarbetare',
    stepId: meta.stepId || '',
    stepLabel: meta.stepLabel || '',
  });
}

function applyDocumentUpload(person, fileRecord, meta = {}, stepIndex = null) {
  const recruitment = person.recruitment || { steps: makeRecruitmentSteps(0, []) };
  const steps = Array.isArray(recruitment.steps) ? recruitment.steps.map((step, index) => {
    if (index !== stepIndex) return step;
    return {
      ...step,
      file: {
        name: fileRecord.name,
        type: fileRecord.mimeType || fileRecord.type || '',
        dataUrl: fileRecord.dataUrl,
      },
      documentKind: meta.kind || step.documentKind || 'Annat',
      documentLabel: meta.label || step.documentLabel || '',
    };
  }) : recruitment.steps;
  const documents = normalizeDocuments([...(person.documents || []), createDocumentEntry(fileRecord, meta)], steps);
  return normalizePerson({
    ...person,
    recruitment: {
      ...recruitment,
      steps,
    },
    documents,
  });
}

function makeDocumentDownloadName(document) {
  return document.name || `dokument-${document.kind || 'annat'}`;
}

function normalizePerson(person, unitToGroupType = new Map()) {
  const recruitment = person.recruitment || {};
  const stage = Number(person.stage || 0);
  const steps = constrainRecruitmentSteps(makeRecruitmentSteps(stage, recruitment.steps || []));
  if (person.status === 'Anställd') {
    steps.forEach(step => { step.completed = true; });
  }
  const unit = person.unit || person.groupUnit || person.group || '';
  const group = person.group || person.groupType || unitToGroupType.get(unit) || '';
  const documents = normalizeDocuments(Array.isArray(person.documents) ? person.documents : [], steps);
  return {
    ...person,
    unit,
    group,
    documents,
    recruitment: {
      steps,
      rejectedAt: recruitment.rejectedAt || null,
      rejectedReason: recruitment.rejectedReason || '',
      promotedAt: recruitment.promotedAt || null,
      promotedBy: recruitment.promotedBy || null,
      rejectedBy: recruitment.rejectedBy || null,
    },
  };
}

function normalizePeople(people, unitToGroupType = new Map()) {
  return people.map(person => normalizePerson(person, unitToGroupType));
}

function createCandidateFromForm(data, actor = null) {
  const initials = data.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return normalizePerson({
    id: Date.now(),
    name: data.name,
    initials,
    email: data.email,
    phone: data.phone,
    unit: '',
    group: '',
    role: '',
    rate: Number(data.rate),
    stage: 0,
    status: 'Rekrytering',
    start: data.employmentDate || new Date().toISOString().slice(0, 10),
    employmentDate: data.employmentDate || '',
    probationEnd: data.probationEnd || '',
    noticeDate: data.noticeDate || '',
    terminationDate: data.terminationDate || '',
    color: '#dce9e3',
    createdAt: new Date().toISOString(),
    createdBy: actor,
  });
}

function createEmployeeFromForm(data, actor = null) {
  const initials = data.name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  const completedSteps = makeRecruitmentSteps(recruitmentStageLabels.length).map(step => ({
    ...step,
    completed: true,
    note: step.note || 'Genomförd sedan tidigare',
    savedAt: new Date().toISOString(),
    savedBy: actor,
    approvedAt: new Date().toISOString(),
    approvedBy: actor,
  }));
  return normalizePerson({
    id: Date.now(),
    name: data.name,
    initials,
    email: data.email,
    phone: data.phone,
    unit: data.unit,
    group: data.group,
    role: data.role,
    rate: Number(data.rate),
    stage: recruitmentStageLabels.length,
    status: 'Anställd',
    start: data.employmentDate || new Date().toISOString().slice(0, 10),
    employmentDate: data.employmentDate || '',
    probationEnd: data.probationEnd || '',
    noticeDate: data.noticeDate || '',
    terminationDate: data.terminationDate || '',
    color: '#dce9e3',
    createdAt: new Date().toISOString(),
    createdBy: actor,
    hiredAt: new Date().toISOString(),
    hiredBy: actor,
    recruitment: {
      steps: completedSteps,
      promotedAt: new Date().toISOString(),
      promotedBy: actor,
    },
  });
}

function futureDateISO(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function normalizeUser(user) {
  return {
    id: user.id || Date.now(),
    name: user.name || '',
    email: (user.email || '').trim(),
    role: user.role || (user.isAdmin ? 'Admin' : 'Användare'),
    password: user.password || '',
    createdAt: user.createdAt || null,
    createdBy: user.createdBy || null,
  };
}

function normalizeUsers(users = []) {
  return users.map(normalizeUser).filter(user => user.email);
}

function ensureSeedUsers(users = []) {
  const legacyEmails = new Set(['karin.andersson@folk.se']);
  const normalized = normalizeUsers(users).filter(user => !legacyEmails.has(user.email.toLowerCase()));
  const byEmail = new Map(normalized.map(user => [user.email.toLowerCase(), user]));
  normalizeUsers(initialAdmins).forEach(seedUser => {
    byEmail.set(seedUser.email.toLowerCase(), { ...byEmail.get(seedUser.email.toLowerCase()), ...seedUser });
  });
  return Array.from(byEmail.values());
}

function publicUser(user) {
  if (!user) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

function userInitials(name = '') {
  return name.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase() || 'U';
}

function formatActor(actor) {
  return actor?.name || actor?.email || '-';
}

function formatAudit(actor, dateIso) {
  const actorName = formatActor(actor);
  const date = dateIso ? formatDate(dateIso) : '';
  return date ? `${actorName} · ${date}` : actorName;
}

function normalizeGroups(groups) {
  return Array.from(new Set((Array.isArray(groups) ? groups : []).map(group => (typeof group === 'string' ? group : group?.name || group?.unit || '')).filter(Boolean)));
}

function normalizeGroupTypes(groupTypes) {
  return Array.from(new Set((Array.isArray(groupTypes) ? groupTypes : []).map(groupType => (typeof groupType === 'string' ? groupType : groupType?.type || groupType?.group || '')).filter(Boolean)));
}

function loadState() {
  const fallback = {
    people: normalizePeople(initialPeopleSeed),
    groups: normalizeGroups(initialGroups),
    groupTypes: normalizeGroupTypes(initialGroupTypes),
    calendarEvents: [],
    admins: ensureSeedUsers(initialAdmins),
    retentionDays: defaultRetentionDays,
    colorTheme: defaultColorTheme,
  };
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    const legacyGroups = Array.isArray(parsed.groups) ? parsed.groups : [];
    const legacyGroupNames = normalizeGroups(legacyGroups);
    const legacyGroupTypes = normalizeGroupTypes(legacyGroups);
    const unitToGroupType = new Map(legacyGroups.map(group => [typeof group === 'string' ? group : group?.name || group?.unit || '', typeof group === 'string' ? '' : group?.type || group?.groupType || '']).filter(([unit]) => Boolean(unit)));
    const peopleSource = Array.isArray(parsed.people) ? parsed.people : fallback.people;
    const migratedPeople = peopleSource.map(person => {
      const rawGroup = person?.group || person?.groupType || '';
      const unit = person?.unit || person?.groupUnit || (legacyGroupNames.includes(rawGroup) ? rawGroup : '');
      const group = person?.groupType || (legacyGroupTypes.includes(rawGroup) ? rawGroup : '') || unitToGroupType.get(unit) || '';
      return { ...person, unit, group };
    });
    return {
      people: normalizePeople(migratedPeople, unitToGroupType),
      groups: normalizeGroups(Array.isArray(parsed.groups) && parsed.groups.length ? parsed.groups : fallback.groups),
      groupTypes: normalizeGroupTypes(Array.isArray(parsed.groupTypes) && parsed.groupTypes.length ? parsed.groupTypes : (legacyGroups.length ? legacyGroups.map(group => typeof group === 'string' ? group : group?.type || group?.groupType || '') : fallback.groupTypes)),
      calendarEvents: Array.isArray(parsed.calendarEvents) ? parsed.calendarEvents : fallback.calendarEvents,
      admins: ensureSeedUsers(Array.isArray(parsed.admins) && parsed.admins.length ? parsed.admins : fallback.admins),
      retentionDays: Number(parsed.retentionDays) || fallback.retentionDays,
      colorTheme: colorThemes.some(theme => theme.id === parsed.colorTheme) ? parsed.colorTheme : fallback.colorTheme,
    };
  } catch {
    return fallback;
  }
}

function isWithinRetention(dateIso, retentionDays) {
  if (!dateIso) return false;
  const ms = new Date(dateIso).getTime();
  if (Number.isNaN(ms)) return false;
  return Date.now() - ms <= retentionDays * 24 * 60 * 60 * 1000;
}

function pruneRejectedPeople(people, retentionDays) {
  const next = people.filter(person => person.status !== 'Avvisad' || isWithinRetention(person.recruitment?.rejectedAt, retentionDays));
  return next.length === people.length ? people : next;
}

function groupOrder(allGroups, presentGroups) {
  const known = allGroups.filter(group => presentGroups.includes(groupLabel(group)));
  const knownNames = known.map(groupLabel);
  const extras = presentGroups.filter(group => !knownNames.includes(group)).sort((a, b) => a.localeCompare(b, 'sv'));
  return [...known, ...extras];
}

function groupLabel(group) {
  return typeof group === 'string' ? group : group?.name || group?.unit || '';
}

function groupType(group) {
  return typeof group === 'string' ? '' : group?.type || group?.groupType || '';
}

function personUnit(person) {
  return person?.unit || person?.groupUnit || person?.group || '';
}

function personGroup(person) {
  return person?.group || person?.groupType || '';
}

function getRecruitmentSteps(person) {
  return makeRecruitmentSteps(person.stage || 0, person.recruitment?.steps || []);
}

function completedStepCount(person) {
  return getRecruitmentSteps(person).filter(step => step.completed).length;
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ name: file.name, mimeType: file.type, dataUrl: reader.result });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function addDays(dateIso, days) {
  if (!dateIso) return '';
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function formatDate(dateIso) {
  if (!dateIso) return '-';
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const splitLine = line => {
    const cells = [];
    let current = '';
    let quoted = false;
    for (let i = 0; i < line.length; i += 1) {
      const ch = line[i];
      if (ch === '"') {
        if (quoted && line[i + 1] === '"') {
          current += '"';
          i += 1;
        } else {
          quoted = !quoted;
        }
      } else if (ch === ',' && !quoted) {
        cells.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
    cells.push(current);
    return cells.map(value => value.trim());
  };
  const headers = splitLine(lines[0]).map(h => h.toLowerCase());
  return lines.slice(1).map(line => {
    const cells = splitLine(line);
    return headers.reduce((acc, header, index) => {
      acc[header] = cells[index] || '';
      return acc;
    }, {});
  });
}

function buildCalendarEvents(people, manualEvents = []) {
  const derived = people.flatMap(person => {
    const employmentDate = person.employmentDate || person.start;
    const probationEnd = person.probationEnd || addDays(employmentDate, 183);
    const events = [];
    if (employmentDate) {
      events.push({
        id: `employment-${person.id}`,
        title: person.name,
        type: 'Anställningsdatum',
        date: employmentDate,
        personId: person.id,
        group: person.group,
        note: `${person.role} · ${person.status}`,
      });
    }
    if (probationEnd) {
      events.push({
        id: `probation-${person.id}`,
        title: person.name,
        type: 'Provanställning upphör',
        date: probationEnd,
        personId: person.id,
        group: person.group,
        note: person.status === 'Anställd' ? 'Övergår till anställning' : 'Planerat omvandlingsdatum',
      });
    }
    if (person.noticeDate) {
      events.push({
        id: `notice-${person.id}`,
        title: person.name,
        type: 'Uppsägning inlämnad',
        date: person.noticeDate,
        personId: person.id,
        group: person.group,
        note: person.terminationDate ? `Sista dag ${person.terminationDate}` : '',
      });
    }
    if (person.terminationDate) {
      events.push({
        id: `termination-${person.id}`,
        title: person.name,
        type: 'Sista anställningsdag',
        date: person.terminationDate,
        personId: person.id,
        group: person.group,
        note: person.noticeDate ? `Uppsägning ${person.noticeDate}` : '',
      });
    }
    return events;
  });
  return [...derived, ...manualEvents].filter(event => event.date).sort((a, b) => new Date(a.date) - new Date(b.date) || a.type.localeCompare(b.type, 'sv'));
}

function exportCalendarCsv(events) {
  const header = 'Datum,Titel,Typ,Grupp,Medarbetar-ID,Anteckning';
  const rows = events.map(event => [event.date, event.title, event.type, event.group || '', event.personId || '', event.note || ''].map(value => `"${String(value).replaceAll('"', '""')}"`).join(','));
  return `${header}\n${rows.join('\n')}`;
}

function importCalendarCsv(text) {
  return parseCsv(text).map((row, index) => ({
    id: row.id || `manual-${Date.now()}-${index}`,
    title: row.titel || row.title || 'Kalenderhändelse',
    type: row.typ || row.type || 'Manuell händelse',
    date: row.datum || row.date || '',
    group: row.grupp || row.group || '',
    personId: row['medarbetar-id'] || row.personid || row.personId || '',
    note: row.anteckning || row.note || '',
  })).filter(event => event.date);
}

function Avatar({ person, large = false }) {
  // Initialerna räcker i listvyerna och undviker att appen blir beroende av bildhantering.
  return <div className={`avatar ${large ? 'avatar-lg' : ''}`} style={{ background: person.color }}>{person.initials}</div>;
}

function Modal({ title, children, onClose, wide = false }) {
  // Gemensam modalram för formulär, rekryteringssteg och personprofiler.
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className={`modal ${wide ? 'wide' : ''}`} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
      <header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Stäng"><X size={20}/></button></header>
      {children}
    </section>
  </div>;
}

function PageHeader({ title, subtitle, onAdd, addLabel = 'Ny medarbetare' }) {
  // Återanvänds i alla vyer så att rubrik, undertitel och primär handling beter sig likadant.
  return <div className="page-head"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>{onAdd ? <button className="primary" onClick={onAdd}><UserPlus size={18}/>{addLabel}</button> : null}</div>;
}

function Progress({ person, compact = false }) {
  // Stegindikatorn läser samma rekryteringsdata som används i kandidatmodulen.
  const steps = getRecruitmentSteps(person);
  const doneCount = steps.filter(step => step.completed).length;
  return <div className={`progress ${compact ? 'compact' : ''}`} aria-label={`Rekryteringssteg för ${person.name}`}>
    {steps.map((step, index) => {
      const done = step.completed;
      const current = index === doneCount && !done;
      const locked = index > doneCount;
      return <div className="step-wrap" key={step.id}>
        {index > 0 ? <span className={`step-line ${done ? 'done' : ''}`} /> : null}
        <button className={`step ${done ? 'done' : ''} ${current ? 'current' : ''}`} disabled={locked || done} title={locked ? 'Föregående steg måste slutföras först' : step.label}>
          {done ? <Check size={15}/> : locked ? <LockKeyhole size={12}/> : <span className="dot" />}
        </button>
        {!compact ? <small>{step.label}</small> : null}
      </div>;
    })}
  </div>;
}

function PersonForm({ actor, onSave, onClose }) {
  // Formuläret skapar en ny rekryteringskandidat med de fält resten av appen förväntar sig.
  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    onSave(createCandidateFromForm(data, actor));
  };

  return <form className="form" onSubmit={submit}>
    <label>Fullständigt namn<input name="name" required placeholder="Förnamn Efternamn" /></label>
    <div className="form-grid"><label>E-post<input type="email" name="email" required placeholder="namn@organisation.se" /></label><label>Telefon<input name="phone" required placeholder="070-000 00 00" /></label></div>
    <label>Tjänstgöringsgrad<input name="rate" type="number" min="0" max="100" defaultValue="100" /></label>
    <div className="form-grid"><label>Anställningsdatum<input name="employmentDate" type="date" /></label><label>Provanställning upphör<input name="probationEnd" type="date" /></label></div>
    <div className="form-grid"><label>Uppsägning inlämnad<input name="noticeDate" type="date" /></label><label>Sista anställningsdag<input name="terminationDate" type="date" /></label></div>
    <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Skapa kandidat</button></div>
  </form>;
}

function EmployeeForm({ groups, groupTypes, actor, onSave, onClose }) {
  // Direkt tillagd medarbetare hoppar över kandidatlistan men markerar rekryteringskraven som redan uppfyllda.
  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    onSave(createEmployeeFromForm(data, actor));
  };

  const unitOptions = groups.length ? groups : [''];
  const groupOptions = groupTypes.length ? groupTypes : [''];

  return <form className="form" onSubmit={submit}>
    <label>Fullständigt namn<input name="name" required placeholder="Förnamn Efternamn" /></label>
    <div className="form-grid"><label>E-post<input type="email" name="email" required placeholder="namn@organisation.se" /></label><label>Telefon<input name="phone" required placeholder="070-000 00 00" /></label></div>
    <div className="form-grid"><label>Enhet<select name="unit" required>{unitOptions.map(unit => <option key={unit || 'tom-enhet'} value={unit}>{unit || 'Välj enhet'}</option>)}</select></label><label>Grupp<select name="group" required>{groupOptions.map(group => <option key={group || 'tom-grupp'} value={group}>{group || 'Välj grupp'}</option>)}</select></label></div>
    <label>Roll<input name="role" required placeholder="Ex. Stödassistent" /></label>
    <label>Tjänstgöringsgrad<input name="rate" type="number" min="0" max="100" defaultValue="100" /></label>
    <div className="form-grid"><label>Anställningsdatum<input name="employmentDate" type="date" /></label><label>Provanställning upphör<input name="probationEnd" type="date" /></label></div>
    <div className="form-grid"><label>Uppsägning inlämnad<input name="noticeDate" type="date" /></label><label>Sista anställningsdag<input name="terminationDate" type="date" /></label></div>
    <label className="check-confirm"><input name="recruitmentDone" type="checkbox" required /><span>Alla checkpunkter för rekryteringen är gjorda sedan tidigare.</span></label>
    <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Lägg till medarbetare</button></div>
  </form>;
}

function Overview({ people, onOpenRecruitment, onOpenFilters }) {
  // Översikten visar en snabb bild av organisationen och pågående rekryteringar.
  const active = people.filter(person => person.status === 'Anställd');
  const candidates = people.filter(person => person.status === 'Rekrytering');
  const deadlines = active.slice(0, 4);

  return <>
    <PageHeader title="Översikt" onAdd={onOpenRecruitment} addLabel="Ny Rekrytering" />
    <div className="metrics">
      <div><Users/><span><b>{active.length}</b>Aktiva medarbetare</span></div>
      <div><BriefcaseBusiness/><span><b>{candidates.length}</b>I rekrytering</span></div>
      <div className="urgent"><CalendarDays/><span><b>{deadlines.length}</b>Provanställning inom 60 dagar</span></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel recruitment"><div className="panel-head"><h2>Pågående rekryteringar</h2><button className="secondary small" onClick={onOpenFilters}><SlidersHorizontal size={16}/>Filter</button></div>
        <div className="recruit-head"><span>Namn</span><span>Grupp</span><span>Nästa steg</span><span>Omfattning</span><span>Status</span></div>
        {candidates.map(person => <div className="recruit-row" key={person.id}>
          <span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span>
          <span>{person.group}</span><Progress person={person} compact /><span>{person.rate} %</span><span className="status"><i/>Pågående<ChevronRight size={17}/></span>
        </div>)}
      </section>
      <aside className="panel deadlines"><div className="panel-head"><h2>Viktiga datum</h2></div>
        {deadlines.map((p, i) => <button className="deadline" key={p.id}><span className={i === deadlines.length - 1 ? 'red' : ''}/><div><b>{p.name}</b><small>Provanställning slutar</small><em><CalendarDays size={14}/>{new Date(p.probationEnd || addDays(p.employmentDate || p.start, 183)).toLocaleDateString('sv-SE', { day: 'numeric', month: 'short', year: 'numeric' })}</em></div><ChevronRight size={17}/></button>)}
      </aside>
    </div>
  </>;
}

function Employees({ people, groups, query, setSelectedId, onAdd, onOpenFilters }) {
  // Medarbetarvyn filtrerar först och grupperar sedan så att listan går att läsa snabbt.
  const normalized = query.toLowerCase();
  const rows = people.filter(person => person.status === 'Anställd' && `${person.name} ${person.unit || ''} ${person.group || ''} ${person.role} ${person.education || ''}`.toLowerCase().includes(normalized));
  const grouped = rows.reduce((acc, person) => {
    const unit = person.unit || '';
    acc[unit] = acc[unit] || [];
    acc[unit].push(person);
    return acc;
  }, {});
  const orderedGroups = groupOrder(groups, Object.keys(grouped));

  return <>
    <PageHeader title="Medarbetare" subtitle={`${rows.length} aktiva profiler`} onAdd={onAdd} addLabel="Lägg till medarbetare" />
    <section className="panel list-panel">
      <div className="panel-head"><h2>Alla medarbetare</h2><button className="secondary small" onClick={onOpenFilters}><SlidersHorizontal size={16}/>Filtrera</button></div>
      <div className="employee-head"><span>Medarbetare</span><span>Enhet</span><span>Grupp</span><span>Utbildning</span><span>Tjänstgöringsgrad</span><span>Provanställning upphör</span><span/></div>
      {rows.length ? orderedGroups.map(unit => { const unitName = groupLabel(unit); return <div key={unitName} className="group-section"><div className="group-section-head"><h3>{unitName}</h3><span>{(grouped[unitName] || []).length} personer</span></div>{(grouped[unitName] || []).map(person => <button className="employee-row" key={person.id} onClick={() => setSelectedId(person.id)}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.education || '-'}</span><span>{person.rate} %</span><span>{person.probationEnd ? new Date(person.probationEnd).toLocaleDateString('sv-SE') : '-'}</span><ChevronRight size={17}/></button>)}</div>; }) : <div className="empty-state">Inga aktiva medarbetare matchar sökningen.</div>}
    </section>
  </>;
}

function PeopleSearchResults({ people, groups, query, groupFilter, dateFrom, dateTo, setSelectedId }) {
  const normalized = query.trim().toLocaleLowerCase('sv');
  const rows = people.filter(person => {
    const searchable = [person.name, person.role, person.unit, person.group, person.email, person.phone, person.status].filter(Boolean).join(' ').toLocaleLowerCase('sv');
    const personDate = person.employmentDate || person.start || '';
    const matchesQuery = !normalized || searchable.includes(normalized);
    const matchesGroup = groupFilter === 'Alla' || person.unit === groupFilter;
    const matchesFrom = !dateFrom || (personDate && personDate >= dateFrom);
    const matchesTo = !dateTo || (personDate && personDate <= dateTo);
    return matchesQuery && matchesGroup && matchesFrom && matchesTo;
  }).sort((a, b) => a.name.localeCompare(b.name, 'sv'));

  return <>
    <PageHeader title="Sökresultat" subtitle={`${rows.length} personer matchar valda sök- och filtervillkor`} />
    <section className="panel people-search-panel">
      <div className="people-search-head"><span>Person</span><span>Enhet</span><span>Grupp</span><span>Anställnings-/startdatum</span><span>Status</span><span /></div>
      {rows.length ? rows.map(person => {
        const personDate = person.employmentDate || person.start;
        return <button className="people-search-row" key={person.id} onClick={() => setSelectedId(person.id)}>
          <span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role || person.email}</small></span></span>
          <span>{person.unit || '-'}</span>
          <span>{person.group || '-'}</span>
          <span>{personDate ? formatDate(personDate) : '-'}</span>
          <span><span className={person.status === 'Avvisad' ? 'tag danger' : 'tag'}>{person.status}</span></span>
          <ChevronRight size={17}/>
        </button>;
      }) : <div className="empty-state">Inga personer matchar sökningen och de valda filtren.</div>}
    </section>
  </>;
}

function Calendar({ people, calendarEvents, setCalendarEvents }) {
  // Kalendern kombinerar personbundna datum med manuellt importerade händelser.
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Alla');
  const allEvents = useMemo(() => buildCalendarEvents(people, calendarEvents), [people, calendarEvents]);
  const normalized = query.toLowerCase();
  const filtered = allEvents.filter(event => {
    const matchesQuery = `${event.title} ${event.type} ${event.group} ${event.note}`.toLowerCase().includes(normalized);
    const matchesFilter = filter === 'Alla' || event.type === filter;
    return matchesQuery && matchesFilter;
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = filtered.filter(event => new Date(event.date) >= today).slice(0, 5);
  const typeOptions = ['Alla', ...Array.from(new Set(allEvents.map(event => event.type)))];
  const grouped = filtered.reduce((acc, event) => {
    const month = new Date(`${event.date}T00:00:00`).toLocaleDateString('sv-SE', { month: 'long', year: 'numeric' });
    acc[month] = acc[month] || [];
    acc[month].push(event);
    return acc;
  }, {});
  const months = Object.keys(grouped).sort((a, b) => new Date(grouped[a][0].date) - new Date(grouped[b][0].date));

  const handleImport = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    const imported = importCalendarCsv(text);
    setCalendarEvents(prev => [...prev, ...imported]);
    event.target.value = '';
  };

  const exportCsv = () => {
    const csv = exportCalendarCsv(allEvents);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kalender.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <PageHeader title="Kalender" subtitle="Anställning, provanställning, uppsägning och importerade händelser" />
    <div className="metrics calendar-metrics">
      <div><CalendarDays/><span><b>{allEvents.length}</b>Datum i kalendern</span></div>
      <div><Clock3/><span><b>{upcoming.length}</b>Kommande datum</span></div>
      <div><Download/><span><b>{calendarEvents.length}</b>Importerade rader</span></div>
    </div>
    <section className="panel calendar-toolbar">
      <div className="calendar-controls">
        <div className="search calendar-search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök datum, person eller händelsetyp"/></div>
        <label className="calendar-select"><span>Händelsetyp</span><select value={filter} onChange={e => setFilter(e.target.value)}>{typeOptions.map(option => <option key={option}>{option}</option>)}</select></label>
        <label className="secondary file-button"><Upload size={16}/>Importera CSV<input type="file" accept=".csv" onChange={handleImport} /></label>
        <button className="primary" onClick={exportCsv}><Download size={16}/>Exportera CSV</button>
      </div>
    </section>
    <div className="calendar-grid">
      <section className="panel calendar-list">
        <div className="panel-head"><div><h2>Alla datum</h2><p>Sorterat per månad och filtrerat i realtid.</p></div></div>
        {months.length ? months.map(month => <div key={month} className="calendar-month"><div className="calendar-month-head"><h3>{month}</h3><span>{grouped[month].length} händelser</span></div>{grouped[month].map(event => <div className="calendar-row" key={event.id}><div className="calendar-date"><b>{formatDate(event.date)}</b><small>{event.type}</small></div><div className="calendar-main"><strong>{event.title}</strong><span>{event.group || 'Intern kalender'}{event.note ? ` · ${event.note}` : ''}</span></div><ChevronRight size={17}/></div>)}</div>) : <div className="empty-state">Inga datum matchar filtret.</div>}
      </section>
      <aside className="panel calendar-side">
        <div className="panel-head"><h2>Kommande</h2></div>
        {upcoming.length ? upcoming.map(event => <div className="calendar-upcoming" key={`${event.id}-upcoming`}><span className="tag">{event.type}</span><b>{event.title}</b><small>{formatDate(event.date)}</small></div>) : <div className="empty-state">Inga kommande datum.</div>}
      </aside>
    </div>
  </>;
}

function Recruitment({ people, setPeople, setSelectedId, retentionDays, currentUser, onAdd }) {
  // Rekryteringsvyn är nu den enda platsen där kandidater går igenom steg, filer och beslut.
  const activeCandidates = people.filter(person => person.status === 'Rekrytering');
  const archivedCandidates = people.filter(person => person.status === 'Avvisad' && isWithinRetention(person.recruitment?.rejectedAt, retentionDays));

  const rejectCandidate = id => {
    setPeople(prev => prev.map(person => person.id === id ? {
      ...person,
      status: 'Avvisad',
      recruitment: {
        ...person.recruitment,
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser,
        rejectedReason: person.recruitment?.rejectedReason || '',
      },
    } : person));
  };

  return <>
    <PageHeader title="Rekrytering" subtitle="Steg, filer och beslut samlas per kandidat" onAdd={onAdd} addLabel="Ny Rekrytering" />
    <div className="metrics recruitment-metrics">
      <div><BriefcaseBusiness/><span><b>{activeCandidates.length}</b>Pågående kandidater</span></div>
      <div><Clock3/><span><b>{archivedCandidates.length}</b>Avvisade i arkiv</span></div>
      <div><Check/><span><b>{recruitmentStageLabels.length}</b>Steg i flödet</span></div>
    </div>
    <section className="panel recruitment-panel">
      <div className="panel-head"><div><h2>Pågående kandidater</h2><p>Öppna en kandidat för att fylla i stegen och fatta beslut.</p></div></div>
      <div className="candidate-list">
        {activeCandidates.length ? activeCandidates.map(person => <article className="candidate" key={person.id}>
          <button className="candidate-main" onClick={() => setSelectedId(person.id)}>
            <Avatar person={person} large />
            <span>
              <h3>{person.name}</h3>
              <p>{person.role} · {person.unit || '-'} · {person.group || '-'} · {person.rate} %</p>
            </span>
          </button>
          <div className="candidate-body">
            <Progress person={person} />
            <div className="candidate-actions">
              <button className="secondary small" onClick={() => setSelectedId(person.id)}><Pencil size={15}/>Öppna</button>
              <button className="secondary small danger" onClick={() => rejectCandidate(person.id)}><X size={15}/>Avvisa</button>
            </div>
          </div>
        </article>) : <div className="empty-state">Inga kandidater är aktiva just nu.</div>}
      </div>
    </section>
    <section className="panel archive-panel">
      <div className="panel-head"><div><h2>Avvisade kandidater</h2><p>Sparas i {retentionDays} dagar innan de städas bort automatiskt.</p></div></div>
      <div className="archive-list">
        {archivedCandidates.length ? archivedCandidates.map(person => <button className="archive-row" key={person.id} onClick={() => setSelectedId(person.id)}>
          <span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span>
          <span>{person.unit || '-'}</span>
          <span>{person.group || '-'}</span>
          <span>{person.recruitment?.rejectedAt ? new Date(person.recruitment.rejectedAt).toLocaleDateString('sv-SE') : '-'}</span>
          <ChevronRight size={17}/>
        </button>) : <div className="empty-state">Inga avvisade kandidater inom sparad tidsperiod.</div>}
      </div>
    </section>
  </>;
}

function RecruitmentStepCard({ stageLabel, step, index, locked, onChange, onSave, onUpload }) {
  const [documentKind, setDocumentKind] = useState(step.documentKind || documentKinds[0]);
  const [documentLabel, setDocumentLabel] = useState(step.documentLabel || '');

  useEffect(() => {
    setDocumentKind(step.documentKind || documentKinds[0]);
    setDocumentLabel(step.documentLabel || '');
  }, [step.id, step.documentKind, step.documentLabel]);

  const handleFile = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const nextFile = await readFileAsDataUrl(file);
    onUpload(index, nextFile, { kind: documentKind, label: documentLabel });
    event.target.value = '';
  };

  return <section className="step-card">
    <div className="step-card-head">
      <div><strong>{index + 1}. {stageLabel}</strong><small>{step.completed ? 'Klar' : locked ? 'Låst tills föregående steg är klart' : 'Pågående'}</small></div>
      <label className="step-toggle"><input type="checkbox" checked={step.completed} disabled={locked} onChange={e => onChange(index, { completed: e.target.checked })} /> Klar</label>
    </div>
    <label className="step-field"><span>Anteckning</span><textarea rows="3" value={step.note} disabled={locked} onChange={e => onChange(index, { note: e.target.value })} placeholder="Skriv beslut, observationer eller nästa åtgärd..." /></label>
    <div className="document-upload-grid">
      <label>Dokumenttyp<select value={documentKind} disabled={locked} onChange={e => setDocumentKind(e.target.value)}>{documentKinds.map(kind => <option key={kind} value={kind}>{kind}</option>)}</select></label>
      <label>Benämning<input value={documentLabel} disabled={locked} onChange={e => setDocumentLabel(e.target.value)} placeholder="CV, intyg, kvitto..." /></label>
    </div>
    <div className="step-file-row">
      <label className={`secondary file-button ${locked ? 'disabled' : ''}`}><Upload size={16}/>Ladda upp fil<input type="file" disabled={locked} onChange={handleFile} /></label>
      <span className="file-chip">{step.file?.name ? `${step.documentKind || 'Dokument'} · ${step.file.name}` : 'Ingen fil uppladdad'}</span>
    </div>
    <div className="step-card-actions">
      <button type="button" className="secondary small" disabled={locked} onClick={() => onSave(index)}><Check size={15}/>Spara steg</button>
      <div className="step-audit">
        {step.approvedBy ? <span>Godkänd av {formatAudit(step.approvedBy, step.approvedAt)}</span> : null}
        {step.savedAt ? <span>Sparad av {formatAudit(step.savedBy, step.savedAt)}</span> : <span>Inte sparad</span>}
      </div>
    </div>
  </section>;
}

function DocumentShelf({ person, setPeople, title, subtitle, uploadLabel = 'Ladda upp fil', stepIndex = null }) {
  const documents = person.documents || [];
  const [kind, setKind] = useState(documentKinds[0]);
  const [label, setLabel] = useState('');

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readFileAsDataUrl(file);
    setPeople(prev => prev.map(current => current.id === person.id ? applyDocumentUpload(current, fileRecord, {
      kind,
      label,
      source: stepIndex === null ? 'Medarbetare' : 'Rekrytering',
      stepId: stepIndex === null ? '' : current.recruitment?.steps?.[stepIndex]?.id || '',
      stepLabel: stepIndex === null ? '' : current.recruitment?.steps?.[stepIndex]?.label || '',
    }, stepIndex) : current));
    setKind(documentKinds[0]);
    setLabel('');
    event.target.value = '';
  };

  return <section className="document-section">
    <div className="panel-head document-section-head"><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="document-list">
      {documents.length ? documents.map(doc => <div className="document-row" key={doc.id}>
        <div className="document-row-main">
          <strong>{doc.name}</strong>
          <span>{doc.kind}{doc.label ? ` · ${doc.label}` : ''}</span>
          <small>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('sv-SE') : 'Okänt datum'}</small>
        </div>
        <a className="secondary small" href={doc.dataUrl} download={makeDocumentDownloadName(doc)}><Download size={15}/>Hämta</a>
      </div>) : <div className="empty-state">Inga uppladdade dokument ännu.</div>}
    </div>
    <div className="document-upload-grid">
      <label>Dokumenttyp<select value={kind} onChange={e => setKind(e.target.value)}>{documentKinds.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
      <label>Benämning<input value={label} onChange={e => setLabel(e.target.value)} placeholder="CV, registerutdrag, intyg..." /></label>
    </div>
    <label className="secondary file-button document-upload-button"><Upload size={16}/>{uploadLabel}<input type="file" onChange={handleUpload} /></label>
  </section>;
}

function CandidateDetail({ person, setPeople, groups, groupTypes, currentUser, onClose, onPromote, onReject }) {
  // Denna vy visar samma kandidatdata som listan, men med redigerbara steg, filer och slutplacering.
  const [draft, setDraft] = useState(() => constrainRecruitmentSteps(getRecruitmentSteps(person)));
  const [finalPlacement, setFinalPlacement] = useState(() => ({ unit: person.unit || groupLabel(groups[0]) || '', group: person.group || groupTypes[0] || '', role: person.role || '' }));

  useEffect(() => {
    setDraft(constrainRecruitmentSteps(getRecruitmentSteps(person)));
    setFinalPlacement({ unit: person.unit || groupLabel(groups[0]) || '', group: person.group || groupTypes[0] || '', role: person.role || '' });
  }, [person.id, person.recruitment, person.stage, groups, groupTypes]);

  const updateDraft = (index, patch) => {
    setDraft(prev => {
      const next = prev.map((step, stepIndex) => {
        if (stepIndex !== index) return step;
        const changed = { ...step, ...patch };
        if ('completed' in patch) {
          changed.approvedAt = patch.completed ? new Date().toISOString() : null;
          changed.approvedBy = patch.completed ? currentUser : null;
        }
        return changed;
      });
      if ('completed' in patch) {
        const priorComplete = next.slice(0, index).every(step => step.completed);
        if (patch.completed && !priorComplete) return prev;
        if (!patch.completed) {
          return next.map((step, stepIndex) => stepIndex > index ? { ...step, completed: false, approvedAt: null, approvedBy: null } : step);
        }
      }
      return constrainRecruitmentSteps(next);
    });
  };

  const saveStep = index => {
    const now = new Date().toISOString();
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      recruitment: {
        ...current.recruitment,
        steps: draft.map((step, stepIndex) => stepIndex === index ? { ...step, savedAt: now, savedBy: currentUser } : step),
      },
    }) : current));
  };

  const uploadStepDocument = async (index, fileRecord, meta) => {
    setPeople(prev => prev.map(current => current.id === person.id ? applyDocumentUpload(current, fileRecord, {
      ...meta,
      source: 'Rekrytering',
      stepId: current.recruitment?.steps?.[index]?.id || '',
      stepLabel: current.recruitment?.steps?.[index]?.label || '',
    }, index) : current));
  };

  const saveFinalPlacement = () => {
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      unit: finalPlacement.unit,
      group: finalPlacement.group,
      role: finalPlacement.role,
    }) : current));
  };

  const allDone = draft.every(step => step.completed);
  const doneCount = draft.filter(step => step.completed).length;
  const activeLabel = draft[doneCount]?.label || recruitmentStageLabels[recruitmentStageLabels.length - 1];
  const canPromote = allDone && finalPlacement.unit && finalPlacement.group && finalPlacement.role;

  return <Modal title="Rekryteringsprofil" onClose={onClose} wide>
    <div className="profile-head">
      <Avatar person={person} large />
      <div><h2>{person.name}</h2><p>{person.role || '-'} · {person.unit || '-'}</p></div>
      <span className="tag">{person.status === 'Rekrytering' ? `Steg ${doneCount + 1} av ${recruitmentStageLabels.length}` : person.status}</span>
    </div>
    <div className="profile-grid recruitment-summary">
      <div><label>E-post</label><b>{person.email}</b></div>
      <div><label>Telefon</label><b>{person.phone}</b></div>
      <div><label>Enhet</label><b>{person.unit || '-'}</b></div>
      <div><label>Grupp</label><b>{person.group || '-'}</b></div>
      <div><label>Tjänstgöringsgrad</label><b>{person.rate} %</b></div>
      <div><label>Aktuellt steg</label><b>{activeLabel}</b></div>
      <div><label>Skapad av</label><b>{formatAudit(person.createdBy, person.createdAt)}</b></div>
    </div>
    <div className="recruitment-editor">
      {draft.map((step, index) => { const locked = index > 0 && !draft.slice(0, index).every(item => item.completed); return <RecruitmentStepCard key={step.id} stageLabel={recruitmentStageLabels[index]} step={step} index={index} locked={locked} onChange={updateDraft} onSave={saveStep} onUpload={uploadStepDocument} />; })}
    </div>
    <div className="final-placement">
      <div className="panel-head"><div><h2>Slutlig placering</h2><p>Välj enhet, grupp och roll innan kandidaten flyttas till Medarbetare.</p></div></div>
      <div className="form-grid final-placement-grid">
        <label>Enhet<select value={finalPlacement.unit} onChange={e => setFinalPlacement(prev => ({ ...prev, unit: e.target.value }))}>{groups.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></label>
        <label>Grupp<select value={finalPlacement.group} onChange={e => setFinalPlacement(prev => ({ ...prev, group: e.target.value }))}>{groupTypes.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
      </div>
      <div className="form-grid final-placement-grid">
        <label>Roll<input value={finalPlacement.role} onChange={e => setFinalPlacement(prev => ({ ...prev, role: e.target.value }))} placeholder="Roll i anställning" /></label>
      </div>
      <div className="placement-actions">
        <button type="button" className="secondary small" onClick={saveFinalPlacement}>Spara placering</button>
        <span className="tag">Obligatoriskt innan anställning</span>
      </div>
    </div>
    <div className="candidate-footer">
      <button type="button" className="secondary danger" onClick={() => onReject(person.id)}><X size={15}/>Avvisa kandidat</button>
      <button type="button" className="primary" disabled={!canPromote} onClick={() => { saveFinalPlacement(); onPromote(person.id, finalPlacement); }}><UserPlus size={16}/>Flytta till Medarbetare</button>
    </div>
  </Modal>;
}

function EmployeeDetail({ person, setPeople, onClose, onEdit }) {
  // För en färdig medarbetare visas profilvyn med samma data som i redigeringen plus dokumentlista.
  return <Modal title="Medarbetarprofil" onClose={onClose} wide>
    <div className="profile-head">
      <Avatar person={person} large />
      <div><h2>{person.name}</h2><p>{person.role || '-'} · {person.unit || '-'}</p></div>
      <button className="secondary small" onClick={onEdit}><Pencil size={15}/>Redigera</button>
    </div>
    <div className="profile-grid">
      <div><label>E-post</label><b>{person.email}</b></div>
      <div><label>Telefon</label><b>{person.phone}</b></div>
      <div><label>Roll</label><b>{person.role || '-'}</b></div>
      <div><label>Enhet</label><b>{person.unit || '-'}</b></div>
      <div><label>Grupp</label><b>{person.group || '-'}</b></div>
      <div><label>Utbildning</label><b>{person.education || '-'}</b></div>
      <div><label>Tjänstgöringsgrad</label><b>{person.rate} %</b></div>
      <div><label>Första anställningsdag</label><b>{person.employmentDate ? new Date(person.employmentDate).toLocaleDateString('sv-SE') : (person.start ? new Date(person.start).toLocaleDateString('sv-SE') : '-')}</b></div>
      <div><label>Provanställning upphör</label><b>{person.probationEnd ? new Date(person.probationEnd).toLocaleDateString('sv-SE') : '-'}</b></div>
      <div><label>Startdatum i systemet</label><b>{person.start ? new Date(person.start).toLocaleDateString('sv-SE') : '-'}</b></div>
      <div><label>Skapad av</label><b>{formatAudit(person.createdBy, person.createdAt)}</b></div>
      <div><label>Anställd av</label><b>{formatAudit(person.hiredBy || person.recruitment?.promotedBy, person.hiredAt || person.recruitment?.promotedAt)}</b></div>
    </div>
    <DocumentShelf
      person={person}
      setPeople={setPeople}
      title="Dokument"
      subtitle="CV, registerutdrag, kvitton, intyg och andra filer samlas här."
    />
  </Modal>;
}

function EmployeeEditForm({ person, groups, groupTypes, onClose, onSave }) {
  // Redigeringsformuläret skriver tillbaka hela personobjektet och håller datumfält för äldre anställningar.
  const [form, setForm] = useState(() => ({
    name: person.name || '',
    email: person.email || '',
    phone: person.phone || '',
    unit: person.unit || groupLabel(groups[0]) || '',
    group: person.group || groupTypes[0] || '',
    role: person.role || '',
    education: person.education || '',
    rate: person.rate ?? 100,
    employmentDate: person.employmentDate || person.start || '',
    probationEnd: person.probationEnd || '',
    start: person.start || '',
  }));

  const submit = e => {
    e.preventDefault();
    onSave({
      ...person,
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      unit: form.unit,
      group: form.group,
      role: form.role.trim(),
      education: form.education.trim(),
      rate: Number(form.rate),
      employmentDate: form.employmentDate,
      probationEnd: form.probationEnd,
      start: form.start || form.employmentDate,
    });
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  return <Modal title="Redigera medarbetare" onClose={onClose} wide>
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <label>Namn<input value={form.name} onChange={e => update('name', e.target.value)} required /></label>
        <label>E-post<input type="email" value={form.email} onChange={e => update('email', e.target.value)} required /></label>
      </div>
      <div className="form-grid">
        <label>Telefon<input value={form.phone} onChange={e => update('phone', e.target.value)} required /></label>
        <label>Enhet<select value={form.unit} onChange={e => update('unit', e.target.value)}>{groups.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></label>
      </div>
      <div className="form-grid">
        <label>Grupp<select value={form.group} onChange={e => update('group', e.target.value)}>{groupTypes.map(option => <option key={option} value={option}>{option}</option>)}</select></label>
        <label>Roll<input value={form.role} onChange={e => update('role', e.target.value)} required /></label>
      </div>
      <div className="form-grid">
        <label>Utbildning<input value={form.education} onChange={e => update('education', e.target.value)} placeholder="Ex. undersköterska, beteendevetare" /></label>
        <label>Tjänstgöringsgrad<input type="number" min="0" max="100" value={form.rate} onChange={e => update('rate', e.target.value)} /></label>
      </div>
      <div className="form-grid">
        <label>Första anställningsdag<input type="date" value={form.employmentDate} onChange={e => update('employmentDate', e.target.value)} /></label>
        <label>Provanställning upphör<input type="date" value={form.probationEnd} onChange={e => update('probationEnd', e.target.value)} /></label>
      </div>
      <label>Startdatum i systemet<input type="date" value={form.start} onChange={e => update('start', e.target.value)} /></label>
      <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Spara ändringar</button></div>
    </form>
  </Modal>;
}
function RejectedDetail({ person, onClose, retentionDays }) {
  // Avvisade kandidater visas fortfarande under den tid admin har valt att spara dem.
  return <Modal title="Avvisad kandidat" onClose={onClose} wide>
    <div className="profile-head">
      <Avatar person={person} large />
      <div><h2>{person.name}</h2><p>{person.role} · {person.unit || '-'} · {person.group || '-'}</p></div>
      <span className="tag danger">Avvisad</span>
    </div>
    <div className="profile-grid">
      <div><label>E-post</label><b>{person.email}</b></div>
      <div><label>Telefon</label><b>{person.phone}</b></div>
      <div><label>Avvisad</label><b>{person.recruitment?.rejectedAt ? new Date(person.recruitment.rejectedAt).toLocaleDateString('sv-SE') : '-'}</b></div>
      <div><label>Bevaras till</label><b>{person.recruitment?.rejectedAt ? new Date(new Date(person.recruitment.rejectedAt).getTime() + retentionDays * 24 * 60 * 60 * 1000).toLocaleDateString('sv-SE') : '-'}</b></div>
    </div>
  </Modal>;
}

function PersonDetail({ person, setPeople, groups, groupTypes, currentUser, onClose, onPromote, onReject, retentionDays }) {
  // Ett enda valpunkt för alla profiler, där vyerna skiljer sig beroende på status.
  const [editing, setEditing] = useState(false);
  if (person.status === 'Rekrytering') {
    return <CandidateDetail person={person} setPeople={setPeople} groups={groups} groupTypes={groupTypes} currentUser={currentUser} onClose={onClose} onPromote={onPromote} onReject={onReject} />;
  }
  if (person.status === 'Avvisad') {
    return <RejectedDetail person={person} onClose={onClose} retentionDays={retentionDays} />;
  }
  if (editing) {
    return <EmployeeEditForm person={person} groups={groups} groupTypes={groupTypes} onClose={() => setEditing(false)} onSave={updated => { setPeople(prev => prev.map(current => current.id === updated.id ? normalizePerson(updated) : current)); setEditing(false); }} />;
  }
  return <EmployeeDetail person={person} setPeople={setPeople} onClose={onClose} onEdit={() => setEditing(true)} />;
}

function Groups({ groups, groupTypes, setGroups, setGroupTypes, people, setPeople }) {
  // Gruppvyn används för att administrera organisationens enheter och grupper som två separata listor.
  const [newGroupType, setNewGroupType] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [editingGroupType, setEditingGroupType] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [draftGroupType, setDraftGroupType] = useState('');
  const [draftUnit, setDraftUnit] = useState('');

  const updateGroupType = (prevValue, nextValue) => {
    const trimmed = nextValue.trim();
    if (!trimmed) return;
    setGroupTypes(prev => prev.map(value => value === prevValue ? trimmed : value));
    setPeople(prev => prev.map(person => person.group === prevValue ? { ...person, group: trimmed } : person));
  };

  const updateUnit = (prevValue, nextValue) => {
    const trimmed = nextValue.trim();
    if (!trimmed) return;
    setGroups(prev => prev.map(value => value === prevValue ? trimmed : value));
    setPeople(prev => prev.map(person => person.unit === prevValue ? { ...person, unit: trimmed } : person));
  };

  const removeGroupType = value => {
    setGroupTypes(prev => prev.filter(item => item !== value));
    setPeople(prev => prev.map(person => person.group === value ? { ...person, group: '' } : person));
  };

  const removeUnit = value => {
    setGroups(prev => prev.filter(item => item !== value));
    setPeople(prev => prev.map(person => person.unit === value ? { ...person, unit: '' } : person));
  };

  const addGroupType = event => {
    event.preventDefault();
    const value = newGroupType.trim();
    if (!value || groupTypes.includes(value)) return;
    setGroupTypes(prev => [...prev, value]);
    setNewGroupType('');
  };

  const addUnit = event => {
    event.preventDefault();
    const value = newUnit.trim();
    if (!value || groups.includes(value)) return;
    setGroups(prev => [...prev, value]);
    setNewUnit('');
  };

  return <>
    <PageHeader title="Grupper" subtitle="Administrera enheter och grupper som två separata listor" />
    <div className="group-admin-grid">
      <section className="panel group-text-panel">
        <div className="panel-head"><div><h2>Grupper</h2><p>HVB, LSS, Skola och andra gruppindelningar.</p></div><span className="tag">{groupTypes.length} grupper</span></div>
        <form className="group-create-fields group-inline-form" onSubmit={addGroupType}>
          <label><span>Ny grupp</span><input value={newGroupType} onChange={e => setNewGroupType(e.target.value)} placeholder="Ex. LSS" /></label>
          <button className="primary" type="submit"><Plus size={17}/>Lägg till grupp</button>
        </form>
        <div className="group-text-list">
          {groupTypes.map(value => <div className="group-text-row" key={value}>
            <div className="group-row-icon"><Building2 size={20}/></div>
            <div className="group-text-main"><strong>{value}</strong><span>{people.filter(person => person.group === value).length} personer</span></div>
            <button type="button" className="secondary small" onClick={() => { setEditingGroupType(value); setDraftGroupType(value); }} aria-label={`Redigera ${value}`}><Pencil size={15}/>Redigera</button>
            <button type="button" className="secondary small danger" onClick={() => removeGroupType(value)} aria-label={`Ta bort ${value}`}><Trash2 size={15}/>Ta bort</button>
            {editingGroupType === value ? <div className="group-text-edit">
              <label><span>Grupp</span><input className="group-name" value={draftGroupType} onChange={e => setDraftGroupType(e.target.value)} placeholder="Nytt gruppnamn" /></label>
              <div className="group-edit-actions"><button type="button" className="secondary small" onClick={() => setEditingGroupType(null)}>Avbryt</button><button type="button" className="primary small" onClick={() => { updateGroupType(value, draftGroupType); setEditingGroupType(null); }}>Spara ändringar</button></div>
            </div> : null}
          </div>)}
        </div>
      </section>
      <section className="panel group-text-panel">
        <div className="panel-head"><div><h2>Enheter</h2><p>Örjanshuset, Skogshuset, Prachthuset och andra enheter.</p></div><span className="tag">{groups.length} enheter</span></div>
        <form className="group-create-fields group-inline-form" onSubmit={addUnit}>
          <label><span>Ny enhet</span><input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Ex. Örjanshuset" /></label>
          <button className="primary" type="submit"><Plus size={17}/>Lägg till enhet</button>
        </form>
        <div className="group-text-list">
          {groups.map(value => <div className="group-text-row" key={value}>
            <div className="group-row-icon"><Building2 size={20}/></div>
            <div className="group-text-main"><strong>{value}</strong><span>{people.filter(person => person.unit === value).length} personer</span></div>
            <button type="button" className="secondary small" onClick={() => { setEditingUnit(value); setDraftUnit(value); }} aria-label={`Redigera ${value}`}><Pencil size={15}/>Redigera</button>
            <button type="button" className="secondary small danger" onClick={() => removeUnit(value)} aria-label={`Ta bort ${value}`}><Trash2 size={15}/>Ta bort</button>
            {editingUnit === value ? <div className="group-text-edit">
              <label><span>Enhet</span><input className="group-name" value={draftUnit} onChange={e => setDraftUnit(e.target.value)} placeholder="Nytt enhetsnamn" /></label>
              <div className="group-edit-actions"><button type="button" className="secondary small" onClick={() => setEditingUnit(null)}>Avbryt</button><button type="button" className="primary small" onClick={() => { updateUnit(value, draftUnit); setEditingUnit(null); }}>Spara ändringar</button></div>
            </div> : null}
          </div>)}
        </div>
      </section>
    </div>
  </>;
}
function ImportExport({ people }) {
  // Exporten delar samma datamodell som resten av appen så att personregistret går att flytta vidare.
  const exportCsv = () => {
    const header = 'Namn,E-post,Telefon,Enhet,Grupp,Roll,Tjänstgöringsgrad';
    const body = people.map(person => [person.name, person.email, person.phone, person.unit, person.group, person.role, person.rate].map(value => `"${value}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'kontaktuppgifter.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return <>
    <PageHeader title="Import & export" subtitle="Flytta kontaktuppgifter med CSV" />
    <div className="transfer-grid">
      <section className="transfer"><Upload/><h2>Importera kontakter</h2><p>Ladda upp en CSV-fil med namn, e-post, telefon och grupp.</p><label className="secondary file-button">Välj CSV-fil<input type="file" accept=".csv" /></label></section>
      <section className="transfer"><Download/><h2>Exportera kontakter</h2><p>Hämta aktuella kontaktuppgifter för alla profiler.</p><button className="primary" onClick={exportCsv}>Exportera {people.length} personer</button></section>
    </div>
  </>;
}

function LoginScreen({ users, setUsers, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const matchedUser = users.find(user => user.email.toLowerCase() === email.trim().toLowerCase());
  const needsPassword = matchedUser && !matchedUser.password;

  const submit = event => {
    event.preventDefault();
    setMessage('');
    if (!matchedUser) {
      setMessage('E-postadressen är inte registrerad. Kontakta admin.');
      return;
    }
    if (needsPassword) {
      if (password.length < 6) {
        setMessage('Välj ett lösenord med minst 6 tecken.');
        return;
      }
      if (password !== confirmPassword) {
        setMessage('Lösenorden matchar inte.');
        return;
      }
      const updated = { ...matchedUser, password };
      setUsers(prev => prev.map(user => user.id === matchedUser.id ? updated : user));
      onLogin(publicUser(updated));
      return;
    }
    if (matchedUser.password !== password) {
      setMessage('Fel lösenord.');
      return;
    }
    onLogin(publicUser(matchedUser));
  };

  return <div className="login-shell">
    <section className="login-panel">
      <div className="login-brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div>
      <form className="form" onSubmit={submit}>
        <label>E-postadress<input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="namn@organisation.se" required /></label>
        <label>Lösenord<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={needsPassword ? 'Välj lösenord' : 'Lösenord'} required /></label>
        {needsPassword ? <label>Bekräfta lösenord<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Upprepa lösenord" required /></label> : null}
        {needsPassword ? <p className="login-hint">Första inloggningen: välj ett lösenord för ditt konto.</p> : null}
        {message ? <p className="login-error">{message}</p> : null}
        <button className="primary">{needsPassword ? 'Skapa lösenord och logga in' : 'Logga in'}</button>
      </form>
    </section>
  </div>;
}

function Admin({ groups, people, admins, setAdmins, currentUser, onCurrentUserUpdate, retentionDays, setRetentionDays, colorTheme, setColorTheme }) {
  // Administrationsvyn styr behöriga användare och grundregler för systemet.
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const addAdmin = event => {
    event.preventDefault();
    const name = adminName.trim();
    const email = adminEmail.trim();
    if (!name || !email) return;
    const exists = admins.some(admin => admin.email.toLowerCase() === email.toLowerCase());
    if (exists) return;
    if (currentUser?.role !== 'Admin') return;
    setAdmins(prev => [...prev, { id: Date.now(), name, email, role: 'Användare', password: '', createdAt: new Date().toISOString(), createdBy: currentUser }]);
    setAdminName('');
    setAdminEmail('');
  };

  const removeAdmin = id => {
    if (currentUser?.role !== 'Admin' || id === currentUser.id) return;
    const target = admins.find(admin => admin.id === id);
    if (!target) return;
    const adminCount = admins.filter(admin => admin.role === 'Admin').length;
    if (target.role === 'Admin' && adminCount <= 1) return;
    const confirmed = window.confirm(`Ta bort användaren ${target.name}? Personen kommer inte längre kunna logga in.`);
    if (!confirmed) return;
    setAdmins(prev => prev.filter(admin => admin.id !== id));
  };
  const canManageUsers = currentUser?.role === 'Admin';

  const changePassword = event => {
    event.preventDefault();
    const storedUser = admins.find(admin => admin.id === currentUser?.id);
    if (!storedUser) return;
    if (storedUser.password !== currentPassword) {
      setPasswordMessage('Nuvarande lösenord stämmer inte.');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage('Det nya lösenordet måste vara minst 6 tecken.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMessage('De nya lösenorden matchar inte.');
      return;
    }
    const updatedUser = { ...storedUser, password: newPassword };
    setAdmins(prev => prev.map(admin => admin.id === storedUser.id ? updatedUser : admin));
    onCurrentUserUpdate(publicUser(updatedUser));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage('Lösenordet är uppdaterat.');
  };

  return <>
    <PageHeader title="Administration" subtitle="Systemets inställningar och behörigheter" />
    <section className="panel theme-panel">
      <div className="panel-head"><div><h2>Färgskala</h2><p>Välj färgprofil för hela Folk.</p></div><span className="tag">{colorThemes.find(theme => theme.id === colorTheme)?.name}</span></div>
      <div className="theme-options">
        {colorThemes.map(theme => <button type="button" key={theme.id} className={colorTheme === theme.id ? "theme-option selected" : "theme-option"} aria-pressed={colorTheme === theme.id} onClick={() => setColorTheme(theme.id)}>
          <span className="theme-swatches" aria-hidden="true">{theme.colors.map(color => <i key={color} style={{ backgroundColor: color }} />)}</span>
          <span><strong>{theme.name}</strong><small>{theme.description}</small></span>
          <span className="theme-check">{colorTheme === theme.id ? "Vald" : "Välj"}</span>
        </button>)}
      </div>
    </section>
    <section className="panel admin-users">
      <div className="panel-head"><div><h2>Användare</h2><p>Admin skapar användare. Nya användare väljer lösenord vid första inloggningen.</p></div><span className="tag">{admins.length} användare</span></div>
      {canManageUsers ? <form className="admin-user-form" onSubmit={addAdmin}>
        <label>Namn<input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Förnamn Efternamn" required /></label>
        <label>E-postadress<input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="namn@organisation.se" required /></label>
        <button className="primary"><Plus size={17}/>Lägg till</button>
      </form> : <div className="empty-state">Endast admin kan skapa användare.</div>}
      <div className="admin-user-list">
        {admins.map(admin => {
          const isCurrent = admin.id === currentUser?.id;
          const isLastAdmin = admin.role === 'Admin' && admins.filter(user => user.role === 'Admin').length <= 1;
          const canRemove = canManageUsers && !isCurrent && !isLastAdmin;
          const removeReason = isCurrent ? 'Du kan inte ta bort dig själv' : isLastAdmin ? 'Sista admin kan inte tas bort' : 'Endast admin kan ta bort användare';
          return <div className="admin-user-row" key={admin.id}><div className="mini-avatar">{userInitials(admin.name)}</div><span><strong>{admin.name}</strong><small>{admin.email} · {admin.role}{admin.password ? '' : ' · väntar på lösenord'}</small></span><button className="secondary small danger" disabled={!canRemove} title={canRemove ? `Ta bort ${admin.name}` : removeReason} onClick={() => removeAdmin(admin.id)}><Trash2 size={15}/>Ta bort</button></div>;
        })}
      </div>
    </section>
    <section className="panel password-panel">
      <div className="panel-head"><div><h2>Byt lösenord</h2><p>Uppdatera lösenordet för ditt konto.</p></div></div>
      <form className="password-form" onSubmit={changePassword}>
        <label>Nuvarande lösenord<input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></label>
        <label>Nytt lösenord<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></label>
        <label>Bekräfta nytt lösenord<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></label>
        <button className="primary">Spara lösenord</button>
      </form>
      {passwordMessage ? <div className={passwordMessage.includes('uppdaterat') ? 'password-message success' : 'password-message'}>{passwordMessage}</div> : null}
    </section>
    <div className="admin-list">
      <section><ShieldCheck/><div><h3>Behörigheter</h3><p>HR-ansvariga kan se allt. Användare kan också ändra struktur och inställningar.</p></div><span className="tag">Aktivt</span></section>
      <section><ListChecks/><div><h3>Rekryteringsflöde</h3><p>{recruitmentStageLabels.length} obligatoriska steg är aktiva.</p></div><span className="tag">Aktivt</span></section>
      <section><Clock3/><div><h3>Avvisade kandidater</h3><p>Sparas i valda dagar innan de rensas ur arkivet.</p></div><label className="admin-number"><input type="number" min="1" max="3650" value={retentionDays} onChange={e => setRetentionDays(Math.max(1, Number(e.target.value) || 1))} /> dagar</label></section>
      <section><Shapes/><div><h3>Organisation</h3><p>{groupTypes.length} grupper och {groups.length} enheter.</p></div><span className="tag">Synkroniserat</span></section>
    </div>
  </>;
}

function App() {
  // Tillståndet speglas mot backend/SQLite och använder localStorage som fallback för session och offline-start.
  const seed = loadState();
  const [active, setActive] = useState('Översikt');
  const [people, setPeople] = useState(seed.people);
  const [groups, setGroups] = useState(seed.groups);
  const [groupTypes, setGroupTypes] = useState(seed.groupTypes);
  const [calendarEvents, setCalendarEvents] = useState(seed.calendarEvents);
  const [admins, setAdmins] = useState(seed.admins);
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const email = localStorage.getItem(`${storageKey}-session`);
      const user = seed.admins.find(admin => admin.email === email);
      return user?.password ? publicUser(user) : null;
    } catch {
      return null;
    }
  });
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState('');
  const [retentionDays, setRetentionDays] = useState(seed.retentionDays);
  const [colorTheme, setColorTheme] = useState(seed.colorTheme);
  const [query, setQuery] = useState('');
  const [newRecruitmentOpen, setNewRecruitmentOpen] = useState(false);
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [menu, setMenu] = useState(false);
  const [groupFilter, setGroupFilter] = useState("Alla");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const peopleGroupOptions = ["Alla", ...Array.from(new Set([...groups, ...people.map(person => person.unit).filter(Boolean)]))];
  const hasPeopleFilters = Boolean(query.trim() || groupFilter !== "Alla" || dateFrom || dateTo);
  const navigateTo = label => {
    setActive(label);
    setMenu(false);
    setFiltersOpen(false);
    setQuery("");
    setGroupFilter("Alla");
    setDateFrom("");
    setDateTo("");
  };

  useEffect(() => {
    setPeople(prev => pruneRejectedPeople(prev, retentionDays));
  }, [retentionDays]);

  useEffect(() => {
    let cancelled = false;
    loadBackendState()
      .then(state => {
        if (cancelled) return;
        const localBackup = loadState();
        const shouldMigrateLocal = (!Array.isArray(state.people) || state.people.length === 0) && localBackup.people.length > 0;
        const source = shouldMigrateLocal ? localBackup : state;
        const nextAdmins = ensureSeedUsers(source.admins || []);
        const legacyGroups = Array.isArray(source.groups) ? source.groups : [];
        const unitToGroupType = new Map(legacyGroups.map(group => [typeof group === 'string' ? group : group?.name || group?.unit || '', typeof group === 'string' ? '' : group?.type || group?.groupType || '']).filter(([unit]) => Boolean(unit)));
        setPeople(normalizePeople(Array.isArray(source.people) ? source.people : [], unitToGroupType));
        setGroups(normalizeGroups(Array.isArray(source.groups) && source.groups.length ? source.groups : initialGroups));
        setGroupTypes(normalizeGroupTypes(Array.isArray(source.groupTypes) && source.groupTypes.length ? source.groupTypes : (legacyGroups.length ? legacyGroups.map(group => typeof group === 'string' ? group : group?.type || group?.groupType || '') : initialGroupTypes)));
        setCalendarEvents(Array.isArray(source.calendarEvents) ? source.calendarEvents : []);
        setAdmins(nextAdmins);
        setRetentionDays(Number(source.retentionDays) || defaultRetentionDays);
        setColorTheme(colorThemes.some(theme => theme.id === source.colorTheme) ? source.colorTheme : defaultColorTheme);
        const sessionEmail = localStorage.getItem(`${storageKey}-session`);
        const sessionUser = nextAdmins.find(admin => admin.email === sessionEmail);
        setCurrentUser(sessionUser?.password ? publicUser(sessionUser) : null);
        setBackendError(shouldMigrateLocal ? 'Lokal data migreras till backenddatabasen.' : '');
      })
      .catch(() => {
        if (!cancelled) setBackendError('Backend kunde inte nås. Appen använder lokal fallback tills servern startas.');
      })
      .finally(() => {
        if (!cancelled) setBackendLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = colorTheme;
  }, [colorTheme]);

  useEffect(() => {
    if (backendLoading) return;
    const state = { people, groups, groupTypes, calendarEvents, admins, retentionDays, colorTheme };
    localStorage.setItem(storageKey, JSON.stringify(state));
    saveBackendState(state).catch(() => setBackendError('Kunde inte spara till backend. Kontrollera att servern kör.'));
  }, [people, groups, calendarEvents, admins, retentionDays, colorTheme, backendLoading]);

  const login = user => {
    setCurrentUser(user);
    localStorage.setItem(`${storageKey}-session`, user.email);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(`${storageKey}-session`);
  };

  const updateCurrentUser = user => {
    setCurrentUser(user);
    localStorage.setItem(`${storageKey}-session`, user.email);
  };

  const selectedPerson = useMemo(() => people.find(person => person.id === selectedId) || null, [people, selectedId]);

  const updatePerson = (id, updater) => {
    setPeople(prev => prev.map(person => person.id === id ? normalizePerson(updater(person)) : person));
  };

  const promoteCandidate = (id, finalPlacement = {}) => {
    updatePerson(id, person => ({
      ...person,
      unit: finalPlacement.unit || person.unit,
      group: finalPlacement.group || person.group,
      role: finalPlacement.role || person.role,
      status: 'Anställd',
      recruitment: {
        ...person.recruitment,
        promotedAt: new Date().toISOString(),
        promotedBy: currentUser,
        steps: person.recruitment.steps.map(step => ({ ...step, completed: true, approvedAt: step.approvedAt || new Date().toISOString(), approvedBy: step.approvedBy || currentUser })),
      },
      start: person.employmentDate || new Date().toISOString().slice(0, 10),
      hiredAt: new Date().toISOString(),
      hiredBy: currentUser,
    }));
    setSelectedId(null);
    setActive('Medarbetare');
  };

  const rejectCandidate = id => {
    updatePerson(id, person => ({
      ...person,
      status: 'Avvisad',
      recruitment: {
        ...person.recruitment,
        rejectedAt: new Date().toISOString(),
        rejectedBy: currentUser,
        rejectedReason: person.recruitment?.rejectedReason || '',
      },
    }));
    setSelectedId(null);
  };

  const page = useMemo(() => {
    if (hasPeopleFilters) return <PeopleSearchResults people={people} groups={groups} query={query} groupFilter={groupFilter} dateFrom={dateFrom} dateTo={dateTo} setSelectedId={setSelectedId} />;
    if (active === 'Översikt') return <Overview people={people} onOpenRecruitment={() => setNewRecruitmentOpen(true)} onOpenFilters={() => setFiltersOpen(true)} />;
    if (active === 'Medarbetare') return <Employees people={people} groups={groups} query={query} setSelectedId={setSelectedId} onAdd={() => setNewEmployeeOpen(true)} onOpenFilters={() => setFiltersOpen(true)} />;
    if (active === 'Rekrytering') return <Recruitment people={people} setPeople={setPeople} setSelectedId={setSelectedId} retentionDays={retentionDays} currentUser={currentUser} onAdd={() => setNewRecruitmentOpen(true)} />;
    if (active === 'Kalender') return <Calendar people={people} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} />;
    if (active === 'Grupper') return <Groups groups={groups} groupTypes={groupTypes} setGroups={setGroups} setGroupTypes={setGroupTypes} people={people} setPeople={setPeople} />;
    if (active === 'Import & export') return <ImportExport people={people} />;
    return <Admin groups={groups} people={people} admins={admins} setAdmins={setAdmins} currentUser={currentUser} onCurrentUserUpdate={updateCurrentUser} retentionDays={retentionDays} setRetentionDays={setRetentionDays} colorTheme={colorTheme} setColorTheme={setColorTheme} />;
  }, [active, people, groups, groupTypes, query, groupFilter, dateFrom, dateTo, hasPeopleFilters, admins, currentUser, retentionDays, colorTheme]);

  if (backendLoading) {
    return <div className="login-shell"><section className="login-panel"><div className="login-brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div><p className="loading-state">Laddar data från backend...</p></section></div>;
  }

  if (!currentUser) {
    return <LoginScreen users={admins} setUsers={setAdmins} onLogin={login} />;
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <nav>{[
        ['Översikt', LayoutDashboard],
        ['Medarbetare', Users],
        ['Rekrytering', BriefcaseBusiness],
        ['Kalender', CalendarDays],
        ['Grupper', Shapes],
        ['Import & export', ArrowUpDown],
        ['Administration', Settings],
      ].map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => navigateTo(label)}><Icon size={20}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-foot"><div className="mini-avatar">{userInitials(currentUser.name)}</div><span><b>{currentUser.name}</b><small>{currentUser.role}</small></span></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Öppna meny" onClick={() => setMenu(!menu)}><Menu/></button>
        <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök namn, roll, e-post, telefon, enhet eller grupp"/></div>
        <button className={hasPeopleFilters ? "secondary topbar-filter active" : "secondary topbar-filter"} aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/><span>Filter</span></button>
        <button className="icon-btn" aria-label="Notiser"><Bell size={20}/></button>
        <button className="user"><span>{userInitials(currentUser.name)}</span><b>{currentUser.name}</b></button>
        <button className="icon-btn" aria-label="Logga ut" onClick={logout}><LogOut size={19}/></button>
      </header>
      {filtersOpen ? <div className="people-filter-bar">
        <label><span>Enhet</span><select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>{peopleGroupOptions.map(option => <option key={option}>{option}</option>)}</select></label>
        <label><span>Från och med</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)} /></label>
        <label><span>Till och med</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} /></label>
        <button className="secondary" disabled={!hasPeopleFilters} onClick={() => { setQuery(""); setGroupFilter("Alla"); setDateFrom(""); setDateTo(""); }}>Rensa allt</button>
      </div> : null}
      <main>{backendError ? <div className="backend-alert">{backendError}</div> : null}{page}</main>
    </div>
    {newRecruitmentOpen ? <Modal title="Ny Rekrytering" onClose={() => setNewRecruitmentOpen(false)}><PersonForm actor={currentUser} onClose={() => setNewRecruitmentOpen(false)} onSave={person => { setPeople(prev => [...prev, person]); setNewRecruitmentOpen(false); setActive('Rekrytering'); }} /></Modal> : null}
    {newEmployeeOpen ? <Modal title="Lägg till medarbetare" onClose={() => setNewEmployeeOpen(false)}><EmployeeForm groups={groups} groupTypes={groupTypes} actor={currentUser} onClose={() => setNewEmployeeOpen(false)} onSave={person => { setPeople(prev => [...prev, person]); setNewEmployeeOpen(false); setActive('Medarbetare'); }} /></Modal> : null}
    {selectedPerson ? <PersonDetail person={selectedPerson} setPeople={setPeople} groups={groups} groupTypes={groupTypes} currentUser={currentUser} onClose={() => setSelectedId(null)} onPromote={promoteCandidate} onReject={rejectCandidate} retentionDays={retentionDays} /> : null}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
