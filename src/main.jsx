import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Users, Shapes,
  Settings, Search, UserPlus, SlidersHorizontal, ChevronRight,
  Plus, X, Trash2, Upload, Download,
  Building2, ShieldCheck, Pencil, Menu, LogOut, FileText
} from 'lucide-react';
import './styles.css';

// Första datamängden är lokal och fungerar som seed tills appen kopplas mot backend.
const groupCategoryOptions = ['LSS', 'HVB', 'Skola', 'Verksamhet', 'Kontor'];
const initialGroupTypes = groupCategoryOptions;
const defaultColorTheme = 'folk';
const colorThemes = [
  { id: 'folk', name: 'Folk', description: 'Nuvarande gröna färgskala', colors: ['#0c5948', '#e5f0ec', '#f4f7f6'] },
  { id: 'mikaelgarden', name: 'Mikaelgården', description: 'Profilfärger från mikaelgarden.se', colors: ['#a64356', '#ebdcb1', '#f7f8f3'] },
];
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
const storageKey = 'folk-state-v1';
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

function normalizeDocuments(documents = []) {
  return documents.map((doc, index) => normalizeDocument(doc, { id: doc?.id || `doc-${index}` })).filter(Boolean);
}

function normalizeNote(note, fallback = {}) {
  const text = (note?.text || note?.body || fallback.text || '').trim();
  if (!text) return null;
  return {
    id: note?.id || fallback.id || `note-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    text,
    createdAt: note?.createdAt || note?.date || fallback.createdAt || new Date().toISOString(),
    createdBy: publicUser(note?.createdBy || note?.author || fallback.createdBy || null),
  };
}

function normalizeNotes(notes = []) {
  return (Array.isArray(notes) ? notes : []).map((note, index) => normalizeNote(note, { id: note?.id || `note-${index}` })).filter(Boolean);
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

function applyDocumentUpload(person, fileRecord, meta = {}) {
  const documents = normalizeDocuments([...(person.documents || []), createDocumentEntry(fileRecord, meta)]);
  return normalizePerson({ ...person, documents });
}

function makeDocumentDownloadName(document) {
  return document.name || `dokument-${document.kind || 'annat'}`;
}

function employmentDuration(person) {
  const startValue = person.employmentDate || person.start || person.employmentStart || '';
  if (!startValue) return null;
  const start = new Date(`${startValue}T00:00:00`);
  if (Number.isNaN(start.getTime())) return null;
  const today = new Date();
  const current = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const days = Math.max(0, Math.floor((current - start) / 86400000));
  return { startValue, days };
}

function normalizePerson(person, unitToGroupType = new Map()) {
  const unit = person.unit || person.groupUnit || person.group || '';
  const group = person.group || person.groupType || unitToGroupType.get(unit) || '';
  const documents = normalizeDocuments(Array.isArray(person.documents) ? person.documents : []);
  const notes = normalizeNotes(person.notes || person.anteckningar || []);
  return {
    ...person,
    unit,
    group,
    documents,
    notes,
  };
}

function normalizePeople(people, unitToGroupType = new Map()) {
  return people.map(person => normalizePerson(person, unitToGroupType));
}

function splitFullName(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  return { firstName: parts[0] || '', lastName: parts.slice(1).join(' ') };
}

function createEmployeeFromForm(data, actor = null) {
  const { firstName, lastName } = splitFullName(data.name);
  const fullName = `${firstName} ${lastName}`.trim();
  const initials = fullName.split(' ').map(part => part[0]).slice(0, 2).join('').toUpperCase();
  return normalizePerson({
    id: Date.now(),
    firstName,
    lastName,
    name: fullName,
    initials,
    personalNumber: data.personalNumber || '',
    address: data.address || '',
    email: data.email,
    phone: data.phone,
    education: data.education || '',
    unit: data.unit,
    group: data.group,
    role: data.role,
    rate: Number(data.rate),
    status: 'Anställd',
    start: data.employmentDate || new Date().toISOString().slice(0, 10),
    employmentDate: data.employmentDate || '',
    employmentType: data.employmentType || '',
    probationStart: data.probationStart || '',
    probationEnd: data.probationEnd || '',
    noticeDate: data.noticeDate || '',
    terminationDate: data.terminationDate || '',
    color: '#dce9e3',
    createdAt: new Date().toISOString(),
    createdBy: actor,
    hiredAt: new Date().toISOString(),
    hiredBy: actor,
    documents: Array.isArray(data.documents) ? data.documents : [],
    notes: [],
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

function normalizeGroupTypes(groupTypes) {
  const values = (Array.isArray(groupTypes) ? groupTypes : []).flatMap(groupType => {
    if (typeof groupType === 'string') return groupType.split(',').map(value => value.trim());
    if (Array.isArray(groupType?.types)) return groupType.types;
    return groupType?.type || groupType?.group || '';
  });
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeGroups(groups) {
  const byName = new Map();
  (Array.isArray(groups) ? groups : []).forEach(group => {
    const name = groupLabel(group);
    if (!name) return;
    const types = normalizeGroupTypes(typeof group === 'string' ? [] : (group.types || group.type || group.groupTypes || group.groupType || []));
    const current = byName.get(name) || { name, types: [] };
    byName.set(name, { name, types: normalizeGroupTypes([...current.types, ...types]) });
  });
  return Array.from(byName.values());
}

function loadState() {
  const fallback = {
    people: normalizePeople(initialPeopleSeed),
    groups: normalizeGroups(initialGroups),
    groupTypes: normalizeGroupTypes(initialGroupTypes),
    admins: ensureSeedUsers(initialAdmins),
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
      admins: ensureSeedUsers(Array.isArray(parsed.admins) && parsed.admins.length ? parsed.admins : fallback.admins),
      colorTheme: colorThemes.some(theme => theme.id === parsed.colorTheme) ? parsed.colorTheme : fallback.colorTheme,
    };
  } catch {
    return fallback;
  }
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

function groupTypesFor(group) {
  return normalizeGroupTypes(typeof group === 'string' ? [] : (group?.types || group?.type || group?.groupTypes || group?.groupType || []));
}

function groupType(group) {
  return groupTypesFor(group).join(', ');
}

function groupCategoriesFor(groups, unit, fallback = groupCategoryOptions) {
  const match = groups.find(group => groupLabel(group) === unit);
  const categories = match ? groupTypesFor(match) : [];
  return categories.length ? categories : fallback;
}

function personUnit(person) {
  return person?.unit || person?.groupUnit || person?.group || '';
}

function personGroup(person) {
  return person?.group || person?.groupType || '';
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

function Avatar({ person, large = false }) {
  // Initialerna räcker i listvyerna och undviker att appen blir beroende av bildhantering.
  return <div className={`avatar ${large ? 'avatar-lg' : ''}`} style={{ background: person.color }}>{person.initials}</div>;
}

function Modal({ title, children, onClose, wide = false }) {
  // Gemensam modalram för formulär och personprofiler.
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className={`modal ${wide ? 'wide' : ''}`} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
      <header><h2>{title}</h2><button type="button" className="icon-btn" onClick={onClose} aria-label="Stäng"><X size={20}/></button></header>
      {children}
    </section>
  </div>;
}

function PageHeader({ title, subtitle, onAdd, addLabel = 'Ny medarbetare' }) {
  // Återanvänds i alla vyer så att rubrik, undertitel och primär handling beter sig likadant.
  return <div className="page-head"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>{onAdd ? <button className="primary" onClick={onAdd}><UserPlus size={18}/>{addLabel}</button> : null}</div>;
}

function EmployeeForm({ groups, groupTypes, actor, onSave, onClose }) {
  // Direkt tillagd medarbetare skapas direkt i personregistret.
  const unitOptions = groups.length ? groups : [''];
  const [selectedUnit, setSelectedUnit] = useState(groupLabel(unitOptions[0]));
  const [documents, setDocuments] = useState([]);
  const [documentKind, setDocumentKind] = useState('');
  const [documentLabel, setDocumentLabel] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);
  const groupOptions = groupCategoriesFor(groups, selectedUnit, groupTypes.length ? groupTypes : groupCategoryOptions);

  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    onSave(createEmployeeFromForm({ ...data, unit: selectedUnit, group: groupOptions.includes(data.group) ? data.group : groupOptions[0] || '', documents }, actor));
  };

  const handleDocumentUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readFileAsDataUrl(file);
    const document = createDocumentEntry(fileRecord, {
      kind: documentKind.trim() || 'Dokument',
      label: documentLabel.trim(),
      source: 'Medarbetare',
    });
    setDocuments(prev => [...prev, document]);
    setDocumentKind('');
    setDocumentLabel('');
    event.target.value = '';
  };

  const removeDocument = id => setDocuments(prev => prev.filter(document => document.id !== id));

  return <form className="form" onSubmit={submit}>
    <label>Fullständigt namn<input name="name" required placeholder="Förnamn Efternamn" /></label>
    <div className="form-grid"><label>Personnummer<input name="personalNumber" required placeholder="ÅÅÅÅMMDD-XXXX" /></label><label>Telefon<input name="phone" required placeholder="070-000 00 00" /></label></div>
    <label>Adress<input name="address" required placeholder="Gata, postnummer och ort" /></label>
    <div className="form-grid"><label>E-post<input type="email" name="email" required placeholder="namn@organisation.se" /></label><label>Utbildning<input name="education" placeholder="Ex. undersköterska" /></label></div>
    <div className="form-grid"><label>Grupp<select name="unit" value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)} required>{unitOptions.map(unit => { const label = groupLabel(unit); return <option key={label || 'tom-grupp'} value={label}>{label || 'Välj grupp'}</option>; })}</select></label><label>Typ<select name="group" required>{groupOptions.map(group => <option key={group || 'tom-typ'} value={group}>{group || 'Välj typ'}</option>)}</select></label></div>
    <div className="form-grid"><label>Roll<input name="role" required placeholder="Ex. Stödassistent" /></label><label>Tjänstgöringsgrad<input name="rate" type="number" min="0" max="100" defaultValue="100" /></label></div>
    <div className="form-grid"><label>Anställningsstart<input name="employmentDate" type="date" /></label><label>Anställningstyp<input name="employmentType" placeholder="Ex. tillsvidare" /></label></div>
    <div className="form-grid"><label>Provanställning start<input name="probationStart" type="date" /></label><label>Provanställning slut<input name="probationEnd" type="date" /></label></div>
    <div className="form-grid"><label>Uppsägning inlämnad<input name="noticeDate" type="date" /></label><label>Sista anställningsdag<input name="terminationDate" type="date" /></label></div>
    <section className="inline-document-upload">
      <div className="panel-head"><div><h2>Dokument</h2><p>CV, anställningsavtal, intyg och andra filer.</p></div><span className="tag">{documents.length} filer</span></div>
      <div className="document-upload-grid">
        <label>Dokumenttyp<input value={documentKind} onChange={e => setDocumentKind(e.target.value)} placeholder="CV, anställningsavtal, intyg..." /></label>
        <label>Benämning<input value={documentLabel} onChange={e => setDocumentLabel(e.target.value)} placeholder="Kort beskrivning eller version" /></label>
      </div>
      <label className="secondary file-button document-upload-button"><Upload size={16}/>Ladda upp dokument<input type="file" onChange={handleDocumentUpload} /></label>
      <div className="document-list">
        {documents.length ? documents.map(document => <div className="document-row" key={document.id}>
          <div className="document-row-main"><strong>{document.name}</strong><span>{document.kind}{document.label ? ` · ${document.label}` : ''}</span><small>{document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString('sv-SE') : 'Idag'}</small></div>
          <div className="document-row-actions"><button type="button" className="secondary small" onClick={() => setPreviewDocument(document)}><FileText size={15}/>Visa</button><a className="secondary small" href={document.dataUrl} download={makeDocumentDownloadName(document)}><Download size={15}/>Hämta</a><button type="button" className="secondary small danger danger-compact" onClick={() => removeDocument(document.id)}><Trash2 size={14}/>Ta bort</button></div>
        </div>) : <div className="empty-state">Inga dokument uppladdade ännu.</div>}
      </div>
    </section>
    <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Lägg till medarbetare</button></div>
    <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
  </form>;
}

function Overview({ people, groups, mode, onNavigate, onShowProbation, setSelectedId }) {
  // Översikten visar en snabb bild av personregistret.
  const active = people.filter(person => person.status === 'Anställd');
  const probationPeople = active
    .filter(person => person.employmentType === 'Provanställning' || person.probationEnd)
    .sort((a, b) => String(a.probationEnd || '9999-12-31').localeCompare(String(b.probationEnd || '9999-12-31')));
  const groupCount = groups.length || new Set(active.map(person => person.unit).filter(Boolean)).size;

  return <>
    <PageHeader title="Översikt" />
    <div className="metrics">
      <button type="button" className="metric-card" onClick={() => onNavigate('Medarbetare')}><Users/><span><b>{active.length}</b>Aktiva medarbetare</span></button>
      <button type="button" className="metric-card" onClick={() => onNavigate('Grupper')}><Shapes/><span><b>{groupCount}</b>Grupper</span></button>
      <button type="button" className="metric-card urgent" onClick={onShowProbation}><ShieldCheck/><span><b>{probationPeople.length}</b>Med provanställning</span></button>
    </div>
    {mode === 'probation' ? <section className="panel list-panel">
      <div className="panel-head"><div><h2>Provanställningar</h2><p>Medarbetare som går provanställning och när den upphör.</p></div></div>
      <div className="employee-head probation-head"><span>Medarbetare</span><span>Grupp</span><span>Typ</span><span>Roll</span><span>Start</span><span>Slutar</span><span/></div>
      {probationPeople.length ? probationPeople.map(person => <button type="button" className="employee-row probation-row" key={person.id} onClick={() => setSelectedId(person.id)}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.role || '-'}</span><span>{person.probationStart ? formatDate(person.probationStart) : '-'}</span><span>{person.probationEnd ? formatDate(person.probationEnd) : '-'}</span><ChevronRight size={17}/></button>) : <div className="empty-state">Inga aktiva provanställningar.</div>}
    </section> : <section className="panel list-panel">
      <div className="panel-head"><div><h2>Senast i personregistret</h2><p>Snabbvy över de första aktiva profilerna.</p></div></div>
      <div className="employee-head overview-employee-head"><span>Medarbetare</span><span>Grupp</span><span>Typ</span><span>Utbildning</span><span>Tjänstgöringsgrad</span><span>Anställningsstart</span></div>
      {active.slice(0, 6).map(person => <div className="employee-row overview-employee-row" key={person.id}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.education || '-'}</span><span>{person.rate} %</span><span>{person.employmentDate ? formatDate(person.employmentDate) : '-'}</span></div>)}
    </section>}
  </>;
}

function Employees({ people, groups, query, setSelectedId, onAdd, onOpenFilters }) {
  // Medarbetarvyn filtrerar först och grupperar sedan så att listan går att läsa snabbt.
  const normalized = query.toLowerCase();
  const rows = people.filter(person => person.status === 'Anställd' && `${person.name} ${person.personalNumber || ''} ${person.address || ''} ${person.unit || ''} ${person.group || ''} ${person.role} ${person.education || ''} ${person.employmentType || ''}`.toLowerCase().includes(normalized));
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
      <div className="employee-head"><span>Medarbetare</span><span>Grupp</span><span>Typ</span><span>Utbildning</span><span>Tjänstgöringsgrad</span><span>Provanställning upphör</span><span/></div>
      {rows.length ? orderedGroups.map(unit => { const unitName = groupLabel(unit); return <div key={unitName} className="group-section"><div className="group-section-head"><h3>{unitName}</h3><span>{(grouped[unitName] || []).length} personer</span></div>{(grouped[unitName] || []).map(person => <button className="employee-row" key={person.id} onClick={() => setSelectedId(person.id)}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.education || '-'}</span><span>{person.rate} %</span><span>{person.probationEnd ? new Date(person.probationEnd).toLocaleDateString('sv-SE') : '-'}</span><ChevronRight size={17}/></button>)}</div>; }) : <div className="empty-state">Inga aktiva medarbetare matchar sökningen.</div>}
    </section>
  </>;
}

function PeopleSearchResults({ people, groups, query, groupFilter, dateFrom, dateTo, setSelectedId }) {
  const normalized = query.trim().toLocaleLowerCase('sv');
  const rows = people.filter(person => {
    const searchable = [person.name, person.personalNumber, person.address, person.role, person.unit, person.group, person.email, person.phone, person.education, person.employmentType, person.status].filter(Boolean).join(' ').toLocaleLowerCase('sv');
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
      <div className="people-search-head"><span>Person</span><span>Grupp</span><span>Typ</span><span>Anställnings-/startdatum</span><span>Status</span><span /></div>
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

function documentMime(document) {
  return document.mimeType || document.type || '';
}

function canInlinePreview(document) {
  const mime = documentMime(document);
  return mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('text/') || mime.includes('word') || mime.includes('officedocument');
}

function DocumentPreviewModal({ document, onClose }) {
  if (!document) return null;
  const mime = documentMime(document);
  const isImage = mime.startsWith('image/');
  const isPdf = mime === 'application/pdf';
  const isText = mime.startsWith('text/');
  const isOffice = mime.includes('word') || mime.includes('officedocument');
  return <Modal title="Förhandsvisa dokument" onClose={onClose} wide>
    <div className="document-preview-head">
      <div><strong>{document.name}</strong><span>{document.kind || 'Dokument'}{document.label ? ` · ${document.label}` : ''}</span></div>
      <a className="secondary small" href={document.dataUrl} download={makeDocumentDownloadName(document)}><Download size={15}/>Hämta</a>
    </div>
    <div className="document-preview-frame">
      {isImage ? <img src={document.dataUrl} alt={document.name} /> : null}
      {isPdf || isText ? <iframe title={document.name} src={document.dataUrl} /> : null}
      {isOffice ? <div className="document-preview-fallback"><FileText size={34}/><strong>Förhandsvisning beror på webbläsaren</strong><p>Word- och Office-filer kan inte alltid visas direkt i webbläsaren. Filen är sparad och kan hämtas med knappen ovan.</p></div> : null}
      {!canInlinePreview(document) ? <div className="document-preview-fallback"><FileText size={34}/><strong>Ingen inbyggd förhandsvisning</strong><p>Den här filtypen kan sparas i Folk och hämtas, men webbläsaren kan inte visa den direkt.</p></div> : null}
    </div>
  </Modal>;
}

function DocumentShelf({ person, setPeople, title, subtitle, uploadLabel = 'Ladda upp fil' }) {
  const documents = person.documents || [];
  const [kind, setKind] = useState('');
  const [label, setLabel] = useState('');
  const [previewDocument, setPreviewDocument] = useState(null);

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readFileAsDataUrl(file);
    setPeople(prev => prev.map(current => current.id === person.id ? applyDocumentUpload(current, fileRecord, {
      kind: kind.trim() || 'Dokument',
      label,
      source: 'Medarbetare',
    }) : current));
    setKind('');
    setLabel('');
    event.target.value = '';
  };

  const removeDocument = id => {
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      documents: (current.documents || []).filter(document => document.id !== id),
    }) : current));
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
        <div className="document-row-actions">
          <button type="button" className="secondary small" onClick={() => setPreviewDocument(doc)}><FileText size={15}/>Visa</button>
          <a className="secondary small" href={doc.dataUrl} download={makeDocumentDownloadName(doc)}><Download size={15}/>Hämta</a>
          <button type="button" className="secondary small danger danger-compact" onClick={() => removeDocument(doc.id)}><Trash2 size={14}/>Ta bort</button>
        </div>
      </div>) : <div className="empty-state">Inga uppladdade dokument ännu.</div>}
    </div>
    <div className="document-upload-grid">
      <label>Dokumenttyp<input value={kind} onChange={e => setKind(e.target.value)} placeholder="CV, anställningsavtal, intyg..." /></label>
      <label>Benämning<input value={label} onChange={e => setLabel(e.target.value)} placeholder="Kort beskrivning eller version" /></label>
    </div>
    <label className="secondary file-button document-upload-button"><Upload size={16}/>{uploadLabel}<input type="file" onChange={handleUpload} /></label>
    <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
  </section>;
}

function NotesPanel({ person, setPeople, actor }) {
  const notes = normalizeNotes(person.notes || []);
  const [text, setText] = useState('');

  const addNote = event => {
    event.preventDefault();
    const note = normalizeNote({ text, createdBy: actor, createdAt: new Date().toISOString() });
    if (!note) return;
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      notes: [note, ...(current.notes || [])],
    }) : current));
    setText('');
  };

  const removeNote = id => {
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      notes: (current.notes || []).filter(note => note.id !== id),
    }) : current));
  };

  return <section className="notes-section">
    <form className="note-form" onSubmit={addNote}>
      <label>Ny anteckning<textarea value={text} onChange={e => setText(e.target.value)} placeholder="Skriv en daterad anteckning..." rows="4" /></label>
      <div className="note-form-actions"><span>Författare: {formatActor(actor)}</span><button className="primary" disabled={!text.trim()}>Lägg till anteckning</button></div>
    </form>
    <div className="note-list">
      {notes.length ? notes.map(note => <article className="note-row" key={note.id}>
        <div className="note-meta"><strong>{formatActor(note.createdBy)}</strong><span>{note.createdAt ? new Date(note.createdAt).toLocaleString('sv-SE') : 'Okänt datum'}</span></div>
        <p>{note.text}</p>
        <button type="button" className="secondary small danger danger-icon" aria-label="Ta bort anteckning" title="Ta bort anteckning" onClick={() => removeNote(note.id)}><Trash2 size={13}/></button>
      </article>) : <div className="empty-state">Inga anteckningar ännu.</div>}
    </div>
  </section>;
}

function EmployeeDetail({ person, setPeople, actor, onClose, onEdit }) {
  // För en färdig medarbetare visas profilvyn med samma data som i redigeringen plus dokumentlista.
  const [profileTab, setProfileTab] = useState('profile');
  const duration = employmentDuration(person);
  return <Modal title="Medarbetarprofil" onClose={onClose} wide>
    <div className="profile-tabs profile-tabs-top" role="tablist" aria-label="Medarbetarprofil">
      <button type="button" className={profileTab === 'profile' ? 'active' : ''} onClick={() => setProfileTab('profile')}>Profil</button>
      <button type="button" className={profileTab === 'documents' ? 'active' : ''} onClick={() => setProfileTab('documents')}>Dokument</button>
      <button type="button" className={profileTab === 'notes' ? 'active' : ''} onClick={() => setProfileTab('notes')}>Anteckningar</button>
    </div>
    {profileTab === 'profile' ? <>
      <div className="profile-head">
        <Avatar person={person} large />
        <div><h2>{person.name}</h2><p>{person.role || '-'} · {person.unit || '-'}</p></div>
        <button className="secondary small" onClick={onEdit}><Pencil size={15}/>Redigera</button>
      </div>
      <div className="profile-grid">
        <div><label>Personnummer</label><b>{person.personalNumber || '-'}</b></div>
        <div><label>Telefon</label><b>{person.phone}</b></div>
        <div><label>Adress</label><b>{person.address || '-'}</b></div>
        <div><label>E-post</label><b>{person.email}</b></div>
        <div><label>Roll</label><b>{person.role || '-'}</b></div>
        <div><label>Grupp</label><b>{person.unit || '-'}</b></div>
        <div><label>Typ</label><b>{person.group || '-'}</b></div>
        <div><label>Utbildning</label><b>{person.education || '-'}</b></div>
        <div><label>Anställningstyp</label><b>{person.employmentType || '-'}</b></div>
        <div><label>Tjänstgöringsgrad</label><b>{person.rate} %</b></div>
        <div><label>Anställningsstart</label><b>{person.employmentDate ? new Date(person.employmentDate).toLocaleDateString('sv-SE') : (person.start ? new Date(person.start).toLocaleDateString('sv-SE') : '-')}</b></div>
        <div><label>Provanställning start</label><b>{person.probationStart ? new Date(person.probationStart).toLocaleDateString('sv-SE') : '-'}</b></div>
        <div><label>Provanställning slut</label><b>{person.probationEnd ? new Date(person.probationEnd).toLocaleDateString('sv-SE') : '-'}</b></div>
        <div><label>Skapad av</label><b>{formatAudit(person.createdBy, person.createdAt)}</b></div>
        <div><label>Anställd av</label><b>{formatAudit(person.hiredBy, person.hiredAt)}</b></div>
      </div>
      <div className="employment-counter">
        <span>Anställd i</span>
        <strong>{duration ? duration.days.toLocaleString('sv-SE') : '-'}</strong>
        <small>{duration ? `dagar sedan ${formatDate(duration.startValue)}` : 'Anställningsstart saknas'}</small>
      </div>
    </> : null}
    {profileTab === 'documents' ? <DocumentShelf
      person={person}
      setPeople={setPeople}
      title="Dokument"
      subtitle="CV, anställningsavtal, registerutdrag, intyg och andra filer samlas här."
    /> : null}
    {profileTab === 'notes' ? <NotesPanel person={person} setPeople={setPeople} actor={actor} /> : null}
  </Modal>;
}

function EmployeeEditForm({ person, groups, groupTypes, onClose, onSave }) {
  // Redigeringsformuläret skriver tillbaka hela personobjektet och håller datumfält för äldre anställningar.
  const [form, setForm] = useState(() => ({
    name: person.name || '',
    personalNumber: person.personalNumber || '',
    address: person.address || '',
    email: person.email || '',
    phone: person.phone || '',
    unit: person.unit || groupLabel(groups[0]) || '',
    group: person.group || groupCategoriesFor(groups, person.unit || groupLabel(groups[0]) || '', groupTypes)[0] || '',
    role: person.role || '',
    education: person.education || '',
    employmentType: person.employmentType || '',
    rate: person.rate ?? 100,
    employmentDate: person.employmentDate || person.start || '',
    probationStart: person.probationStart || '',
    probationEnd: person.probationEnd || '',
    start: person.start || '',
  }));

  const submit = e => {
    e.preventDefault();
    onSave({
      ...person,
      ...splitFullName(form.name),
      name: form.name.trim(),
      personalNumber: form.personalNumber.trim(),
      address: form.address.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      unit: form.unit,
      group: form.group,
      role: form.role.trim(),
      education: form.education.trim(),
      employmentType: form.employmentType.trim(),
      rate: Number(form.rate),
      employmentDate: form.employmentDate,
      probationStart: form.probationStart,
      probationEnd: form.probationEnd,
      start: form.start || form.employmentDate,
    });
  };

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const updateUnit = value => setForm(prev => {
    const options = groupCategoriesFor(groups, value, groupTypes);
    return { ...prev, unit: value, group: options.includes(prev.group) ? prev.group : options[0] || '' };
  });

  return <Modal title="Redigera medarbetare" onClose={onClose} wide>
    <form className="form" onSubmit={submit}>
      <div className="form-grid">
        <label>Namn<input value={form.name} onChange={e => update('name', e.target.value)} required /></label>
        <label>Personnummer<input value={form.personalNumber} onChange={e => update('personalNumber', e.target.value)} required /></label>
      </div>
      <label>Adress<input value={form.address} onChange={e => update('address', e.target.value)} required /></label>
      <div className="form-grid">
        <label>E-post<input type="email" value={form.email} onChange={e => update('email', e.target.value)} required /></label>
        <label>Telefon<input value={form.phone} onChange={e => update('phone', e.target.value)} required /></label>
      </div>
      <div className="form-grid">
        <label>Grupp<select value={form.unit} onChange={e => updateUnit(e.target.value)}>{groups.map(unit => { const label = groupLabel(unit); return <option key={label} value={label}>{label}</option>; })}</select></label>
        <label>Typ<select value={form.group} onChange={e => update('group', e.target.value)}>{groupCategoriesFor(groups, form.unit, groupTypes).map(option => <option key={option} value={option}>{option}</option>)}</select></label>
      </div>
      <div className="form-grid">
        <label>Roll<input value={form.role} onChange={e => update('role', e.target.value)} required /></label>
        <label>Utbildning<input value={form.education} onChange={e => update('education', e.target.value)} placeholder="Ex. undersköterska, beteendevetare" /></label>
      </div>
      <div className="form-grid">
        <label>Anställningstyp<input value={form.employmentType} onChange={e => update('employmentType', e.target.value)} placeholder="Ex. tillsvidare" /></label>
        <label>Tjänstgöringsgrad<input type="number" min="0" max="100" value={form.rate} onChange={e => update('rate', e.target.value)} /></label>
      </div>
      <div className="form-grid">
        <label>Anställningsstart<input type="date" value={form.employmentDate} onChange={e => update('employmentDate', e.target.value)} /></label>
        <label>Provanställning start<input type="date" value={form.probationStart} onChange={e => update('probationStart', e.target.value)} /></label>
      </div>
      <div className="form-grid">
        <label>Provanställning slut<input type="date" value={form.probationEnd} onChange={e => update('probationEnd', e.target.value)} /></label>
        <label>Startdatum i systemet<input type="date" value={form.start} onChange={e => update('start', e.target.value)} /></label>
      </div>
      <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Spara ändringar</button></div>
    </form>
  </Modal>;
}
function PersonDetail({ person, setPeople, groups, groupTypes, currentUser, onClose }) {
  // Ett enda valpunkt för medarbetarprofiler.
  const [editing, setEditing] = useState(false);
  if (editing) {
    return <EmployeeEditForm person={person} groups={groups} groupTypes={groupTypes} onClose={() => setEditing(false)} onSave={updated => { setPeople(prev => prev.map(current => current.id === updated.id ? normalizePerson(updated) : current)); setEditing(false); }} />;
  }
  return <EmployeeDetail person={person} setPeople={setPeople} actor={currentUser} onClose={onClose} onEdit={() => setEditing(true)} />;
}

function TypeCheckboxes({ selected, onChange }) {
  const selectedSet = new Set(selected);
  return <div className="type-checks">
    {groupCategoryOptions.map(option => <label key={option}><input type="checkbox" checked={selectedSet.has(option)} onChange={event => {
      const next = event.target.checked ? [...selectedSet, option] : [...selectedSet].filter(value => value !== option);
      onChange(next);
    }} />{option}</label>)}
  </div>;
}

function Groups({ groups, setGroups, people, setPeople }) {
  // Gruppvyn administrerar organisatoriska grupper och vilka kategorier varje grupp tillhör.
  const [newUnit, setNewUnit] = useState('');
  const [newTypes, setNewTypes] = useState([]);
  const [editingUnit, setEditingUnit] = useState(null);
  const [draftUnit, setDraftUnit] = useState('');
  const [draftTypes, setDraftTypes] = useState([]);

  const addUnit = event => {
    event.preventDefault();
    const name = newUnit.trim();
    if (!name || groups.some(group => groupLabel(group) === name)) return;
    setGroups(prev => [...prev, { name, types: newTypes.length ? newTypes : ['Verksamhet'] }]);
    setNewUnit('');
    setNewTypes([]);
  };

  const updateUnit = (prevValue, nextValue, nextTypes) => {
    const name = nextValue.trim();
    if (!name) return;
    const types = nextTypes.length ? nextTypes : ['Verksamhet'];
    setGroups(prev => prev.map(group => groupLabel(group) === prevValue ? { name, types } : group));
    setPeople(prev => prev.map(person => {
      if (person.unit !== prevValue) return person;
      return { ...person, unit: name, group: types.includes(person.group) ? person.group : types[0] };
    }));
  };

  const removeUnit = value => {
    setGroups(prev => prev.filter(group => groupLabel(group) !== value));
    setPeople(prev => prev.map(person => person.unit === value ? { ...person, unit: '', group: '' } : person));
  };

  return <>
    <PageHeader title="Grupper" subtitle="Administrera grupper och markera om de hör till LSS, HVB, Skola, Verksamhet eller Kontor" />
    <section className="panel group-text-panel">
      <div className="panel-head"><div><h2>Grupper</h2><p>Varje grupp kan ha en eller flera kategorier.</p></div><span className="tag">{groups.length} grupper</span></div>
      <form className="group-create-fields group-inline-form" onSubmit={addUnit}>
        <label><span>Ny grupp</span><input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Ex. Björkhagen" /></label>
        <label><span>Kategorier</span><TypeCheckboxes selected={newTypes} onChange={setNewTypes} /></label>
        <button className="primary" type="submit"><Plus size={17}/>Lägg till grupp</button>
      </form>
      <div className="group-text-list">
        {groups.map(group => { const name = groupLabel(group); const types = groupTypesFor(group); return <div className="group-text-row" key={name}>
          <div className="group-row-icon"><Building2 size={20}/></div>
          <div className="group-text-main"><strong>{name}</strong><span>{types.length ? types.join(', ') : 'Ingen kategori'} · {people.filter(person => person.unit === name).length} personer</span></div>
          <button type="button" className="secondary small" onClick={() => { setEditingUnit(name); setDraftUnit(name); setDraftTypes(types.length ? types : ['Verksamhet']); }} aria-label={`Redigera ${name}`}><Pencil size={15}/>Redigera</button>
          <button type="button" className="secondary small danger danger-compact" onClick={() => removeUnit(name)} aria-label={`Ta bort ${name}`}><Trash2 size={14}/>Ta bort</button>
          {editingUnit === name ? <div className="group-text-edit">
            <label><span>Grupp</span><input className="group-name" value={draftUnit} onChange={e => setDraftUnit(e.target.value)} placeholder="Nytt gruppnamn" /></label>
            <label><span>Kategorier</span><TypeCheckboxes selected={draftTypes} onChange={setDraftTypes} /></label>
            <div className="group-edit-actions"><button type="button" className="secondary small" onClick={() => setEditingUnit(null)}>Avbryt</button><button type="button" className="primary small" onClick={() => { updateUnit(name, draftUnit, draftTypes); setEditingUnit(null); }}>Spara ändringar</button></div>
          </div> : null}
        </div>; })}
      </div>
    </section>
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

function Admin({ groups, people, admins, setAdmins, currentUser, onCurrentUserUpdate, colorTheme, setColorTheme }) {
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
          return <div className="admin-user-row" key={admin.id}><div className="mini-avatar">{userInitials(admin.name)}</div><span><strong>{admin.name}</strong><small>{admin.email} · {admin.role}{admin.password ? '' : ' · väntar på lösenord'}</small></span><button className="secondary small danger danger-compact" disabled={!canRemove} title={canRemove ? `Ta bort ${admin.name}` : removeReason} onClick={() => removeAdmin(admin.id)}><Trash2 size={14}/>Ta bort</button></div>;
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
      <section><Shapes/><div><h3>Organisation</h3><p>{groups.length} grupper.</p></div><span className="tag">Synkroniserat</span></section>
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
  const [colorTheme, setColorTheme] = useState(seed.colorTheme);
  const [query, setQuery] = useState('');
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [menu, setMenu] = useState(false);
  const [groupFilter, setGroupFilter] = useState("Alla");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [overviewMode, setOverviewMode] = useState('default');
  const peopleGroupOptions = ["Alla", ...Array.from(new Set([...groups.map(groupLabel), ...people.map(person => person.unit).filter(Boolean)]))];
  const hasPeopleFilters = Boolean(query.trim() || groupFilter !== "Alla" || dateFrom || dateTo);
  const navigateTo = label => {
    setActive(label);
    setOverviewMode('default');
    setMenu(false);
    setFiltersOpen(false);
    setQuery("");
    setGroupFilter("Alla");
    setDateFrom("");
    setDateTo("");
  };


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
        setGroupTypes(groupCategoryOptions);
        setAdmins(nextAdmins);
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
    const state = { people, groups, groupTypes, admins, colorTheme };
    localStorage.setItem(storageKey, JSON.stringify(state));
    saveBackendState(state).catch(() => setBackendError('Kunde inte spara till backend. Kontrollera att servern kör.'));
  }, [people, groups, groupTypes, admins, colorTheme, backendLoading]);

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

  const page = useMemo(() => {
    if (hasPeopleFilters) return <PeopleSearchResults people={people} groups={groups} query={query} groupFilter={groupFilter} dateFrom={dateFrom} dateTo={dateTo} setSelectedId={setSelectedId} />;
    if (active === 'Översikt') return <Overview people={people} groups={groups} mode={overviewMode} onNavigate={navigateTo} onShowProbation={() => setOverviewMode('probation')} setSelectedId={setSelectedId} />;
    if (active === 'Medarbetare') return <Employees people={people} groups={groups} query={query} setSelectedId={setSelectedId} onAdd={() => setNewEmployeeOpen(true)} onOpenFilters={() => setFiltersOpen(true)} />;
    if (active === 'Grupper') return <Groups groups={groups} setGroups={setGroups} people={people} setPeople={setPeople} />;
    return <Admin groups={groups} people={people} admins={admins} setAdmins={setAdmins} currentUser={currentUser} onCurrentUserUpdate={updateCurrentUser} colorTheme={colorTheme} setColorTheme={setColorTheme} />;
  }, [active, people, groups, groupTypes, query, groupFilter, dateFrom, dateTo, hasPeopleFilters, admins, currentUser, colorTheme, overviewMode]);

  if (backendLoading) {
    return <div className="login-shell"><section className="login-panel"><div className="login-brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div><p className="loading-state">Laddar data från backend...</p></section></div>;
  }

  if (!currentUser) {
    return <LoginScreen users={admins} setUsers={setAdmins} onLogin={login} />;
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <div className="brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div>
      <nav>{[
        ['Översikt', LayoutDashboard],
        ['Medarbetare', Users],
        ['Grupper', Shapes],
        ['Administration', Settings],
      ].map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => navigateTo(label)}><Icon size={20}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-foot"><div className="mini-avatar">{userInitials(currentUser.name)}</div><span><b>{currentUser.name}</b><small>{currentUser.role}</small></span></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Öppna meny" onClick={() => setMenu(!menu)}><Menu/></button>
        <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök namn, roll, e-post, telefon, grupp eller typ"/></div>
        <button className={hasPeopleFilters ? "secondary topbar-filter active" : "secondary topbar-filter"} aria-expanded={filtersOpen} onClick={() => setFiltersOpen(!filtersOpen)}><SlidersHorizontal size={17}/><span>Filter</span></button>
        <button className="user"><span>{userInitials(currentUser.name)}</span><b>{currentUser.name}</b></button>
        <button className="icon-btn" aria-label="Logga ut" onClick={logout}><LogOut size={19}/></button>
      </header>
      {filtersOpen ? <div className="people-filter-bar">
        <label><span>Grupp</span><select value={groupFilter} onChange={e => setGroupFilter(e.target.value)}>{peopleGroupOptions.map(option => <option key={option}>{option}</option>)}</select></label>
        <label><span>Från och med</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)} /></label>
        <label><span>Till och med</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} /></label>
        <button className="secondary" disabled={!hasPeopleFilters} onClick={() => { setQuery(""); setGroupFilter("Alla"); setDateFrom(""); setDateTo(""); }}>Rensa allt</button>
      </div> : null}
      <main>{backendError ? <div className="backend-alert">{backendError}</div> : null}{page}</main>
    </div>
    {newEmployeeOpen ? <Modal title="Lägg till medarbetare" onClose={() => setNewEmployeeOpen(false)}><EmployeeForm groups={groups} groupTypes={groupTypes} actor={currentUser} onClose={() => setNewEmployeeOpen(false)} onSave={person => { setPeople(prev => [...prev, person]); setNewEmployeeOpen(false); setActive('Medarbetare'); }} /></Modal> : null}
    {selectedPerson ? <PersonDetail person={selectedPerson} setPeople={setPeople} groups={groups} groupTypes={groupTypes} currentUser={currentUser} onClose={() => setSelectedId(null)} /> : null}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
