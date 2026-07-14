import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Users, Shapes, Archive,
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
const inactivityPromptDelayMs = 10 * 60 * 1000;
const inactivityEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart', 'focus'];
const documentKinds = ['CV', 'Anställningsavtal', 'Registerutdrag', 'Övrigt'];
const documentStatusFields = [
  { key: 'hasCv', label: 'CV', kind: 'CV' },
  { key: 'hasEmploymentContract', label: 'Anställningsavtal', kind: 'Anställningsavtal' },
  { key: 'hasRegisterExtract', label: 'Registerutdrag', kind: 'Registerutdrag' },
  { key: 'hasOtherDocuments', label: 'Övriga dokument', kind: 'Övrigt' },
];
const employeeDocumentCategories = [
  { id: 'cv', kind: 'CV', title: 'CV', description: 'Uppladdat CV för medarbetaren.', labelTitle: 'Filtitel', placeholder: 'Exempel: CV 2026', uploadLabel: 'Ladda upp CV', emptyLabel: 'CV', required: true },
  { id: 'agreement', kind: 'Anställningsavtal', title: 'Anställningsavtal', description: 'Avtal och signerade anställningshandlingar.', labelTitle: 'Filtitel', placeholder: 'Exempel: Signerat avtal', uploadLabel: 'Ladda upp avtal', emptyLabel: 'Anställningsavtal', required: true },
  { id: 'register', kind: 'Registerutdrag', title: 'Registerutdrag', description: 'Registerutdrag och kontrollunderlag.', labelTitle: 'Filtitel', placeholder: 'Exempel: Utdrag 2026', uploadLabel: 'Ladda upp utdrag', emptyLabel: 'Registerutdrag', required: true },
  { id: 'confidentiality', kind: 'Övrigt', matchLabel: 'tystnadsplikt', fixedLabel: 'Tystnadsplikt', title: 'Tystnadsplikt', description: 'Dokument för tystnadsplikt.', labelTitle: 'Filtitel', placeholder: 'Exempel: Signerad tystnadsplikt', uploadLabel: 'Ladda upp tystnadsplikt', emptyLabel: 'Tystnadsplikt', required: true },
  { id: 'checklist', kind: 'Övrigt', matchLabel: 'checklista', fixedLabel: 'Checklista', title: 'Checklista', description: 'Checklistadokument från rekrytering eller anställning.', labelTitle: 'Filtitel', placeholder: 'Exempel: Checklista signerad', uploadLabel: 'Ladda upp checklista', emptyLabel: 'Checklista', required: true },
  { id: 'other', kind: 'Övrigt', title: 'Övriga dokument', description: 'Frivilliga dokument som inte hör till någon av de fasta rutorna.', labelTitle: 'Filtitel', placeholder: 'Exempel: Diplom, intyg eller delegation', uploadLabel: 'Ladda upp övrigt', emptyLabel: 'Övrigt dokument', requiresLabel: true },
];
const apiStatePath = '/api/state';
const acceptedDocumentAccept = '.doc,.docx,.pdf,.png,.jpg,.jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/pdf,image/png,image/jpeg';
const acceptedDocumentExtensions = ['.doc', '.docx', '.pdf', '.png', '.jpg', '.jpeg'];
const acceptedDocumentMimeTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/pdf', 'image/png', 'image/jpeg'];

function isAllowedDocumentFile(file) {
  const name = String(file?.name || '').toLocaleLowerCase('sv');
  const mime = String(file?.type || '').toLocaleLowerCase('sv');
  return acceptedDocumentMimeTypes.includes(mime) || acceptedDocumentExtensions.some(extension => name.endsWith(extension));
}

async function readAllowedDocumentAsDataUrl(file) {
  if (!isAllowedDocumentFile(file)) {
    window.alert('Formatet stöds inte. Tillåtna format är Word, PDF, PNG och JPG.');
    return null;
  }
  return readFileAsDataUrl(file);
}


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

function dataUrlToUint8Array(dataUrl = '') {
  const base64 = String(dataUrl).split(',')[1] || '';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

function readZipName(bytes, offset, length) {
  return new TextDecoder().decode(bytes.slice(offset, offset + length));
}

async function inflateRaw(bytes) {
  if (!('DecompressionStream' in window)) throw new Error('Saknar stöd för Word-förhandsvisning i webbläsaren.');
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function extractDocxEntry(bytes, entryName) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let offset = 0; offset < bytes.length - 30; offset += 1) {
    if (view.getUint32(offset, true) !== 0x04034b50) continue;
    const method = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const name = readZipName(bytes, offset + 30, fileNameLength);
    const dataStart = offset + 30 + fileNameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    if (name === entryName) {
      const compressed = bytes.slice(dataStart, dataEnd);
      if (method === 0) return compressed;
      if (method === 8) return inflateRaw(compressed);
      throw new Error('Word-filen använder en komprimering som inte kan förhandsvisas.');
    }
    offset = Math.max(offset, dataEnd - 1);
  }
  throw new Error('Kunde inte hitta dokumenttext i Word-filen.');
}

function docxXmlToText(xmlText) {
  const xml = new DOMParser().parseFromString(xmlText, 'application/xml');
  const paragraphs = Array.from(xml.getElementsByTagName('w:p'));
  const textBlocks = paragraphs.map(paragraph => Array.from(paragraph.getElementsByTagName('w:t')).map(node => node.textContent || '').join('')).filter(Boolean);
  return textBlocks.join('\n\n').trim();
}

async function previewDocxText(document) {
  const bytes = dataUrlToUint8Array(document.dataUrl);
  const documentXml = await extractDocxEntry(bytes, 'word/document.xml');
  const xmlText = new TextDecoder().decode(documentXml);
  return docxXmlToText(xmlText) || 'Word-dokumentet innehåller ingen läsbar text.';
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

const recruitmentStepOrder = ['interview', 'agreement', 'trial', 'approval'];
const recruitmentStepLabels = {
  interview: 'Intervju',
  agreement: 'Avtal',
  trial: 'Provpass',
  approval: 'Godkännande',
};

function normalizeRecruitment(recruitment = {}) {
  const rawStep = recruitment.step === 'checklist' ? 'approval' : recruitment.step;
  const step = recruitmentStepOrder.includes(rawStep) ? rawStep : 'interview';
  return {
    step,
    interviewDone: Boolean(recruitment.interviewDone),
    interviewCompletedAt: recruitment.interviewCompletedAt || '',
    trialDate: recruitment.trialDate || '',
    trialUnit: recruitment.trialUnit || '',
    trialDraftDate: recruitment.trialDraftDate || '',
    trialDraftUnit: recruitment.trialDraftUnit || '',
    trialPasses: Array.isArray(recruitment.trialPasses) ? recruitment.trialPasses : (recruitment.trialDate && recruitment.trialUnit ? [{ id: 'legacy-trial', date: recruitment.trialDate, unit: recruitment.trialUnit }] : []),
    trialDone: Boolean(recruitment.trialDone),
    agreementDone: Boolean(recruitment.agreementDone),
    checklistDone: Boolean(recruitment.checklistDone),
    referenceComment: recruitment.referenceComment || '',
    assignedUnits: Array.isArray(recruitment.assignedUnits) ? recruitment.assignedUnits : [],
    closedAt: recruitment.closedAt || '',
    closedReason: recruitment.closedReason || '',
  };
}

function recruitmentStepIndex(step) {
  return Math.max(0, recruitmentStepOrder.indexOf(step));
}

function recruitmentProgress(candidate) {
  const recruitment = normalizeRecruitment(candidate.recruitment || {});
  return recruitmentStepIndex(recruitment.step) + 1;
}

function hasMeaningfulRecruitment(recruitment = {}) {
  const normalized = normalizeRecruitment(recruitment);
  return normalized.step !== 'interview' || normalized.interviewDone || normalized.agreementDone || normalized.trialDone || normalized.checklistDone || normalized.trialPasses.length > 0 || normalized.trialDraftDate || normalized.trialDraftUnit || normalized.assignedUnits.length > 0 || normalized.referenceComment;
}

function shouldPreferLocalRecruitment(localRecruitment = {}, backendRecruitment = {}) {
  const local = normalizeRecruitment(localRecruitment);
  const backend = normalizeRecruitment(backendRecruitment);
  if (!hasMeaningfulRecruitment(local)) return false;
  if (!hasMeaningfulRecruitment(backend)) return true;
  if (local.trialPasses.length > backend.trialPasses.length) return true;
  if (recruitmentStepIndex(local.step) > recruitmentStepIndex(backend.step)) return true;
  if (local.assignedUnits.length > backend.assignedUnits.length) return true;
  return false;
}

function mergeLocalRecruitment(backendPeople = [], localPeople = []) {
  const localById = new Map((Array.isArray(localPeople) ? localPeople : []).map(person => [person.id, person]));
  return (Array.isArray(backendPeople) ? backendPeople : []).map(person => {
    const local = localById.get(person.id);
    if (!local || !shouldPreferLocalRecruitment(local.recruitment, person.recruitment)) return person;
    return { ...person, recruitment: normalizeRecruitment({ ...(person.recruitment || {}), ...(local.recruitment || {}) }) };
  });
}

function createRecruitmentCandidate(data, actor = null) {
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
    email: data.email || '',
    phone: data.phone || '',
    education: data.education || '',
    unit: '',
    group: '',
    role: data.role || '',
    rate: Number(data.rate || 100),
    employmentType: '',
    status: 'Rekrytering',
    start: '',
    employmentDate: '',
    color: '#dce9e3',
    createdAt: new Date().toISOString(),
    createdBy: actor,
    documents: Array.isArray(data.documents) ? data.documents : [],
    notes: [],
    recruitment: normalizeRecruitment({ step: 'interview' }),
  });
}

function normalizePerson(person, unitToGroupType = new Map()) {
  const unit = person.unit || person.groupUnit || person.group || '';
  const group = person.group || person.groupType || unitToGroupType.get(unit) || '';
  const documents = normalizeDocuments(Array.isArray(person.documents) ? person.documents : []);
  const notes = normalizeNotes(person.notes || person.anteckningar || []);
  const recruitment = normalizeRecruitment(person.recruitment || {});
  const hasProbation = person.hasProbation !== undefined ? Boolean(person.hasProbation) : Boolean(person.probationEnd || person.employmentType === 'Provanställning');
  return {
    ...person,
    unit,
    group,
    recruitment,
    hasProbation,
    probationStart: '',
    probationEnd: hasProbation ? (person.probationEnd || '') : '',
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
    hasProbation: data.hasProbation === 'on' || data.hasProbation === true,
    probationStart: '',
    probationEnd: (data.hasProbation === 'on' || data.hasProbation === true) ? (data.probationEnd || '') : '',
    noticeDate: data.noticeDate || '',
    terminationDate: data.terminationDate || '',
    color: '#dce9e3',
    createdAt: new Date().toISOString(),
    createdBy: actor,
    profileCreatedAt: new Date().toISOString(),
    profileCreatedBy: actor,
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
  const role = user.role || (user.isAdmin ? 'Admin' : 'Användare');
  return {
    id: user.id || Date.now(),
    name: user.name || '',
    email: (user.email || '').trim(),
    role,
    password: user.password || '',
    mustChangePassword: Boolean(user.mustChangePassword || user.passwordChangeRequired),
    groupAccess: Array.isArray(user.groupAccess) ? user.groupAccess : [],
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
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    mustChangePassword: Boolean(user.mustChangePassword),
    groupAccess: Array.isArray(user.groupAccess) ? user.groupAccess : [],
  };
}

function userCanSeeAll(user) {
  return user?.role === 'Admin';
}

function allowedGroupNames(user) {
  return new Set(Array.isArray(user?.groupAccess) ? user.groupAccess : []);
}

function filterPeopleForUser(people, user) {
  if (userCanSeeAll(user)) return people;
  const allowed = allowedGroupNames(user);
  return people.filter(person => allowed.has(person.unit));
}

function filterGroupsForUser(groups, user) {
  if (userCanSeeAll(user)) return groups;
  const allowed = allowedGroupNames(user);
  return groups.filter(group => allowed.has(groupLabel(group)));
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

function loadUiState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(`${storageKey}-ui`) || '{}');
    return {
      active: parsed.active || 'Översikt',
      peopleTab: parsed.peopleTab || 'list',
      overviewMode: parsed.overviewMode || 'default',
      query: parsed.query || '',
      groupFilter: Array.isArray(parsed.groupFilter) ? parsed.groupFilter : [],
      dateFrom: parsed.dateFrom || '',
      dateTo: parsed.dateTo || '',
      sortField: parsed.sortField || 'name',
      sortDirection: parsed.sortDirection || 'asc',
      filterPanelTab: parsed.filterPanelTab || 'filters',
      searchColumnKeys: Array.isArray(parsed.searchColumnKeys) ? parsed.searchColumnKeys : defaultSearchColumnKeys,
    };
  } catch {
    return {
      active: 'Översikt',
      peopleTab: 'list',
      overviewMode: 'default',
      query: '',
      groupFilter: [],
      dateFrom: '',
      dateTo: '',
      sortField: 'name',
      sortDirection: 'asc',
      filterPanelTab: 'filters',
      searchColumnKeys: defaultSearchColumnKeys,
    };
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

function isTrialHouseGroup(group) {
  const label = groupLabel(group).toLocaleLowerCase('sv');
  const types = groupTypesFor(group).map(type => type.toLocaleLowerCase('sv'));
  return !label.includes('vikarie') && !types.some(type => type.includes('vikarie'));
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
  const [hasProbation, setHasProbation] = useState(false);
  const groupOptions = groupCategoriesFor(groups, selectedUnit, groupTypes.length ? groupTypes : groupCategoryOptions);

  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    onSave(createEmployeeFromForm({ ...data, unit: selectedUnit, group: groupOptions.includes(data.group) ? data.group : groupOptions[0] || '', documents }, actor));
  };

  const handleDocumentUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readAllowedDocumentAsDataUrl(file);
    if (!fileRecord) return;
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
    <div className="form-grid"><label className="checkbox-field"><input name="hasProbation" type="checkbox" checked={hasProbation} onChange={e => setHasProbation(e.target.checked)} />Provanställning</label>{hasProbation ? <label>Provanställning slut<input name="probationEnd" type="date" /></label> : <div />}</div>
    <div className="form-grid"><label>Uppsägning inlämnad<input name="noticeDate" type="date" /></label><label>Sista anställningsdag<input name="terminationDate" type="date" /></label></div>
    <section className="inline-document-upload">
      <div className="panel-head"><div><h2>Dokument</h2><p>CV, anställningsavtal, intyg och andra filer.</p></div><span className="tag">{documents.length} filer</span></div>
      <div className="document-upload-grid">
        <label>Dokumenttyp<input value={documentKind} onChange={e => setDocumentKind(e.target.value)} placeholder="CV, anställningsavtal, intyg..." /></label>
        <label>Benämning<input value={documentLabel} onChange={e => setDocumentLabel(e.target.value)} placeholder="Kort beskrivning eller version" /></label>
      </div>
      <label className="secondary file-button document-upload-button"><Upload size={16}/>Ladda upp dokument<input type="file" accept={acceptedDocumentAccept} onChange={handleDocumentUpload} /></label>
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


function RecruitmentDocumentList({ documents, emptyText, onPreview, onRemove }) {
  const rows = normalizeDocuments(documents || []);
  if (!rows.length) return <div className="document-empty-row required">{emptyText}</div>;
  return <div className="recruitment-doc-list">
    {rows.map(document => <div className="document-row compact" key={document.id}>
      <div className="document-row-main"><strong>{document.name}</strong><span>{document.kind || 'Dokument'}{document.label ? ` · ${document.label}` : ''}</span><small>{document.uploadedAt ? new Date(document.uploadedAt).toLocaleDateString('sv-SE') : 'Idag'}</small></div>
      <div className="document-row-actions"><button type="button" className="secondary small" onClick={() => onPreview(document)}><FileText size={15}/>Visa</button><a className="secondary small" href={document.dataUrl} download={makeDocumentDownloadName(document)}><Download size={15}/>Hämta</a>{onRemove ? <button type="button" className="secondary small danger danger-compact" onClick={() => onRemove(document.id)}><Trash2 size={14}/>Ta bort</button> : null}</div>
    </div>)}
  </div>;
}


function RecruitmentAddForm({ actor, onSave, onClose }) {
  const [cvDocument, setCvDocument] = useState(null);
  const [previewDocument, setPreviewDocument] = useState(null);

  const submit = event => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget));
    onSave(createRecruitmentCandidate({ ...data, documents: cvDocument ? [cvDocument] : [] }, actor));
  };

  const handleCvUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readAllowedDocumentAsDataUrl(file);
    if (!fileRecord) return;
    setCvDocument(createDocumentEntry(fileRecord, { kind: 'CV', label: 'CV', source: 'Rekrytering' }));
    event.target.value = '';
  };

  return <form className="form" onSubmit={submit}>
    <label>Fullständigt namn<input name="name" required placeholder="Förnamn Efternamn" /></label>
    <div className="form-grid"><label>Personnummer<input name="personalNumber" placeholder="ÅÅÅÅMMDD-XXXX" /></label><label>Telefon<input name="phone" placeholder="070-000 00 00" /></label></div>
    <label>Adress<input name="address" placeholder="Gata, postnummer och ort" /></label>
    <div className="form-grid"><label>E-post<input type="email" name="email" placeholder="namn@organisation.se" /></label><label>Utbildning<input name="education" placeholder="Ex. undersköterska" /></label></div>
    <label>Roll<input name="role" placeholder="Ex. Stödassistent" /></label>
    <section className="inline-document-upload recruitment-initial-cv">
      <div className="panel-head"><div><h2>CV</h2><p>Ladda upp CV direkt när rekryteringen skapas.</p></div>{cvDocument ? <span className="doc-status ok">Finns</span> : <span className="doc-status required">Måste ordnas</span>}</div>
      {cvDocument ? <div className="document-row compact"><div className="document-row-main"><strong>{cvDocument.name}</strong><span>CV</span></div><div className="document-row-actions"><button type="button" className="secondary small" onClick={() => setPreviewDocument(cvDocument)}><FileText size={15}/>Visa</button><button type="button" className="secondary small danger danger-compact" onClick={() => setCvDocument(null)}><Trash2 size={14}/>Ta bort</button></div></div> : <div className="document-empty-row required">Inget CV uppladdat ännu.</div>}
      <label className="secondary file-button document-upload-button"><Upload size={16}/>Ladda upp CV<input type="file" accept={acceptedDocumentAccept} onChange={handleCvUpload} /></label>
    </section>
    <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Lägg till i rekrytering</button></div>
    <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
  </form>;
}

function RecruitmentUploadButton({ label, kind, documentLabel, candidate, setPeople }) {
  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readAllowedDocumentAsDataUrl(file);
    if (!fileRecord) return;
    setPeople(prev => prev.map(person => person.id === candidate.id ? applyDocumentUpload(person, fileRecord, {
      kind,
      label: documentLabel,
      source: 'Rekrytering',
      stepLabel: recruitmentStepLabels[normalizeRecruitment(candidate.recruitment).step],
    }) : person));
    event.target.value = '';
  };
  return <label className="secondary file-button recruitment-upload"><Upload size={15}/>{label}<input type="file" accept={acceptedDocumentAccept} onChange={handleUpload} /></label>;
}

function RecruitmentStepBar({ step, canOpenStep, onStepChange }) {
  const currentIndex = recruitmentStepIndex(step);
  return <div className="recruitment-stepbar">
    {recruitmentStepOrder.map((item, index) => {
      const isCurrent = index === currentIndex;
      const canOpen = canOpenStep(item);
      const className = `${index < currentIndex ? 'done' : isCurrent ? 'current' : ''}${canOpen ? ' open' : ' locked'}`.trim();
      return <button type="button" key={item} className={className} disabled={!canOpen || isCurrent} onClick={() => onStepChange(item)}><span>{index + 1}</span><b>{recruitmentStepLabels[item]}</b></button>;
    })}
  </div>;
}

function RecruitmentCandidatePanel({ candidate, groups, groupTypes, setPeople, actor }) {
  const recruitment = normalizeRecruitment(candidate.recruitment || {});
  const groupNames = groups.map(groupLabel).filter(Boolean);
  const trialGroupNames = groups.filter(isTrialHouseGroup).map(groupLabel).filter(Boolean);
  const defaultTrialUnit = trialGroupNames[0] || '';
  const normalizedTrialUnit = trialGroupNames.includes(recruitment.trialDraftUnit || recruitment.trialUnit) ? (recruitment.trialDraftUnit || recruitment.trialUnit) : defaultTrialUnit;
  const [trialDate, setTrialDate] = useState(recruitment.trialDraftDate || '');
  const [trialUnit, setTrialUnit] = useState(normalizedTrialUnit);
  const [selectedUnits, setSelectedUnits] = useState(recruitment.assignedUnits || []);
  const [trialPasses, setTrialPasses] = useState(recruitment.trialPasses || []);
  const [previewDocument, setPreviewDocument] = useState(null);
  const trialGroupKey = trialGroupNames.join('|');
  const recruitmentStateKey = JSON.stringify(candidate.recruitment || {});
  useEffect(() => {
    const next = normalizeRecruitment(candidate.recruitment || {});
    setTrialDate(next.trialDraftDate || '');
    setTrialUnit(trialGroupNames.includes(next.trialDraftUnit || next.trialUnit) ? (next.trialDraftUnit || next.trialUnit) : defaultTrialUnit);
    setSelectedUnits(next.assignedUnits || []);
    setTrialPasses(next.trialPasses || []);
  }, [candidate.id, defaultTrialUnit, trialGroupKey, recruitmentStateKey]);

  const hasCv = documentsByKind(candidate, 'CV').length > 0;
  const hasRegisterExtract = documentsByKind(candidate, 'Registerutdrag').length > 0;
  const hasConfidentiality = normalizeDocuments(candidate.documents || []).some(document => String(document.label || document.name || '').toLocaleLowerCase('sv').includes('tystnadsplikt'));
  const interviewReady = hasCv && hasRegisterExtract && hasConfidentiality;
  const hasAgreement = documentsByKind(candidate, 'Anställningsavtal').length > 0;
  const interviewDocuments = normalizeDocuments(candidate.documents || []).filter(document => documentKindMatches(document, 'CV') || documentKindMatches(document, 'Registerutdrag') || String(document.label || document.name || '').toLocaleLowerCase('sv').includes('tystnadsplikt'));
  const agreementDocuments = documentsByKind(candidate, 'Anställningsavtal');
  const checklistDocuments = normalizeDocuments(candidate.documents || []).filter(document => String(document.label || document.kind || document.name || '').toLocaleLowerCase('sv').includes('checklista'));
  const otherApprovalDocuments = normalizeDocuments(candidate.documents || []).filter(document => {
    const label = String(document.label || document.name || '').toLocaleLowerCase('sv');
    return documentKindMatches(document, 'Övrigt') && !label.includes('tystnadsplikt') && !label.includes('checklista');
  });
  const updateRecruitment = patch => setPeople(prev => prev.map(person => person.id === candidate.id ? normalizePerson({ ...person, recruitment: normalizeRecruitment({ ...(person.recruitment || {}), ...patch }) }) : person));
  const removeRecruitmentDocument = id => {
    setPeople(prev => prev.map(person => person.id === candidate.id ? normalizePerson({
      ...person,
      documents: (person.documents || []).filter(document => document.id !== id),
    }) : person));
  };
  const markInterviewDone = () => updateRecruitment({ interviewDone: true, interviewCompletedAt: new Date().toISOString(), step: 'agreement' });
  const persistTrialPasses = (updater, extraPatch = {}) => {
    setTrialPasses(prev => updater(prev));
    setPeople(prev => prev.map(person => {
      if (person.id !== candidate.id) return person;
      const currentRecruitment = normalizeRecruitment(person.recruitment || {});
      const nextPasses = updater(currentRecruitment.trialPasses || []);
      return normalizePerson({
        ...person,
        recruitment: normalizeRecruitment({
          ...currentRecruitment,
          trialPasses: nextPasses,
          trialDate: nextPasses[0]?.date || '',
          trialUnit: nextPasses[0]?.unit || '',
          ...extraPatch,
        }),
      });
    }));
  };
  const updateTrialDate = value => {
    setTrialDate(value);
    updateRecruitment({ trialDraftDate: value, trialDraftUnit: trialUnit });
  };
  const updateTrialUnit = value => {
    setTrialUnit(value);
    updateRecruitment({ trialDraftDate: trialDate, trialDraftUnit: value });
  };
  const addTrialPass = () => {
    if (!trialDate || !trialUnit) return;
    const newPass = { id: `trial-${Date.now()}-${Math.random().toString(16).slice(2)}`, date: trialDate, unit: trialUnit };
    persistTrialPasses(passes => [...passes, newPass], { trialDraftDate: '', trialDraftUnit: trialUnit });
    setTrialDate('');
  };
  const removeTrialPass = id => persistTrialPasses(passes => passes.filter(pass => pass.id !== id));
  const markTrialDone = () => {
    const latestPasses = normalizeRecruitment(candidate.recruitment || {}).trialPasses || trialPasses;
    updateRecruitment({ trialPasses: latestPasses, trialDate: latestPasses[0]?.date || '', trialUnit: latestPasses[0]?.unit || '', trialDone: true, step: 'approval' });
  };
  const markAgreementDone = () => updateRecruitment({ agreementDone: true, step: 'trial' });
  const toggleUnit = unit => {
    const nextUnits = selectedUnits.includes(unit) ? selectedUnits.filter(item => item !== unit) : [...selectedUnits, unit];
    setSelectedUnits(nextUnits);
    updateRecruitment({ assignedUnits: nextUnits });
  };
  const archiveRecruitmentCandidate = reason => {
    const confirmed = window.confirm(`${reason} ${candidate.name}? Personen flyttas till Arkiv.`);
    if (!confirmed) return;
    setPeople(prev => prev.map(person => person.id === candidate.id ? normalizePerson({
      ...person,
      status: 'Arkiverad',
      archivedAt: new Date().toISOString(),
      archivedBy: actor,
      recruitment: normalizeRecruitment({ ...(person.recruitment || {}), closedAt: new Date().toISOString(), closedReason: reason }),
    }) : person));
  };
  const closeCandidate = () => archiveRecruitmentCandidate('Avsluta rekryteringen för');
  const rejectCandidate = () => archiveRecruitmentCandidate('Avslå kandidaten');
  const currentStepIndex = recruitmentStepIndex(recruitment.step);
  const canOpenStep = step => {
    if (step === 'interview') return true;
    if (step === 'agreement') return recruitment.interviewDone || interviewReady || currentStepIndex >= recruitmentStepIndex('agreement');
    if (step === 'trial') return recruitment.agreementDone || hasAgreement || currentStepIndex >= recruitmentStepIndex('trial');
    if (step === 'approval') return recruitment.trialDone || trialPasses.length >= 2 || currentStepIndex >= recruitmentStepIndex('approval');
    return false;
  };
  const goToStep = step => {
    if (!canOpenStep(step)) return;
    updateRecruitment({ step });
  };
  const previousStep = currentStepIndex > 0 ? recruitmentStepOrder[currentStepIndex - 1] : '';
  const backButton = previousStep ? <button type="button" className="secondary" onClick={() => goToStep(previousStep)}>Tillbaka till {recruitmentStepLabels[previousStep]}</button> : null;
  const approvalReady = hasCv && hasRegisterExtract && hasAgreement && recruitment.checklistDone && trialPasses.length >= 2 && selectedUnits.length > 0 && Boolean(recruitment.referenceComment.trim());
  const hireCandidate = () => {
    const units = selectedUnits.length ? selectedUnits : (trialUnit ? [trialUnit] : []);
    if (!units.length) return;
    const now = new Date().toISOString();
    const employmentDate = now.slice(0, 10);
    const primaryUnit = units[0];
    const categories = groupCategoriesFor(groups, primaryUnit, groupTypes);
    setPeople(prev => prev.map(person => {
      if (person.id !== candidate.id) return person;
      const referenceText = normalizeRecruitment(person.recruitment || {}).referenceComment.trim();
      const referenceNote = referenceText ? normalizeNote({ text: 'Referenstagning: ' + referenceText, createdBy: actor, createdAt: now }) : null;
      return normalizePerson({
        ...person,
        status: 'Anställd',
        unit: primaryUnit,
        group: person.group || categories[0] || '',
        assignedUnits: units,
        employmentDate,
        start: employmentDate,
        profileCreatedAt: now,
        profileCreatedBy: actor,
        hiredAt: now,
        hiredBy: actor,
        notes: referenceNote ? [...(person.notes || []), referenceNote] : (person.notes || []),
        recruitment: normalizeRecruitment({ ...(person.recruitment || {}), checklistDone: true, assignedUnits: units, closedAt: now, closedReason: 'Anställd' }),
      });
    }));
  };

  return <section className="recruitment-detail panel">
    <div className="panel-head"><div><h2>{candidate.name}</h2><p>{candidate.role || 'Roll saknas'} · {candidate.email || candidate.phone || 'Kontakt saknas'}</p></div><div className="recruitment-head-actions"><span className="tag">{recruitmentStepLabels[recruitment.step]}</span><button type="button" className="secondary small danger danger-compact" onClick={rejectCandidate}><Trash2 size={14}/>Avslå kandidat</button></div></div>
    <RecruitmentStepBar step={recruitment.step} canOpenStep={canOpenStep} onStepChange={goToStep} />
    {recruitment.step === 'interview' ? <div className="recruitment-step-content">
      <div className="step-card"><div className="step-card-head"><div><strong>Intervju</strong><small>CV, registerutdrag och tystnadsplikt ska laddas upp i detta steg.</small></div><div className="doc-status-stack"><span className={hasCv ? 'doc-status ok' : 'doc-status required'}>CV {hasCv ? 'finns' : 'saknas'}</span><span className={hasRegisterExtract ? 'doc-status ok' : 'doc-status required'}>Utdrag {hasRegisterExtract ? 'finns' : 'saknas'}</span><span className={hasConfidentiality ? 'doc-status ok' : 'doc-status required'}>Tystnadsplikt {hasConfidentiality ? 'finns' : 'saknas'}</span></div></div>
        <div className="recruitment-upload-grid">
          <RecruitmentUploadButton label="Ladda upp CV" kind="CV" documentLabel="CV" candidate={candidate} setPeople={setPeople} />
          <RecruitmentUploadButton label="Ladda upp registerutdrag" kind="Registerutdrag" documentLabel="Registerutdrag" candidate={candidate} setPeople={setPeople} />
          <RecruitmentUploadButton label="Ladda upp tystnadsplikt" kind="Övrigt" documentLabel="Tystnadsplikt" candidate={candidate} setPeople={setPeople} />
        </div>
        <RecruitmentDocumentList documents={interviewDocuments} emptyText="Inga dokument" onPreview={setPreviewDocument} onRemove={removeRecruitmentDocument} />
        <div className="step-card-actions"><span>{interviewReady ? 'CV, registerutdrag och tystnadsplikt är uppladdade.' : 'CV, registerutdrag och tystnadsplikt ska finnas innan du går vidare.'}</span><button type="button" className="primary" disabled={!interviewReady} onClick={markInterviewDone}>Steget är klart</button></div>
      </div>
    </div> : null}
    {recruitment.step === 'trial' ? <div className="recruitment-step-content">
      <div className="step-card"><div className="step-card-head"><div><strong>Provpass</strong><small>Lägg till minst två provpass med datum och enhet.</small></div><span className={trialPasses.length >= 2 ? 'doc-status ok' : 'doc-status required'}>{trialPasses.length}/2</span></div>
        <div className="form-grid"><label className="step-field"><span>Datum för provpass</span><input type="date" value={trialDate} onChange={e => updateTrialDate(e.target.value)} /></label><label className="step-field"><span>Enhet</span><select value={trialUnit} onChange={e => updateTrialUnit(e.target.value)}>{trialGroupNames.length ? trialGroupNames.map(name => <option key={name} value={name}>{name}</option>) : <option value="">Inga hus tillgängliga</option>}</select></label></div>
        <div className="trial-pass-actions"><button type="button" className="secondary small" disabled={!trialDate || !trialUnit} onClick={addTrialPass}><Plus size={14}/>Lägg till provpass</button></div>
        <div className="trial-pass-list">{trialPasses.length ? trialPasses.map((pass, index) => <div key={pass.id} className="trial-pass-row"><span><strong>Provpass {index + 1}</strong><small>{formatDate(pass.date)} · {pass.unit}</small></span><button type="button" className="secondary small danger danger-compact" onClick={() => removeTrialPass(pass.id)}><Trash2 size={14}/>Ta bort</button></div>) : <div className="document-empty-row required">Inga provpass tillagda.</div>}</div>
        <div className="step-card-actions"><span>{trialPasses.length >= 2 ? 'Minst två provpass är tillagda.' : 'Minst två provpass krävs för att gå vidare.'}</span><div className="step-action-buttons">{backButton}<button type="button" className="primary" disabled={trialPasses.length < 2} onClick={markTrialDone}>Steget är klart</button></div></div>
      </div>
    </div> : null}
    {recruitment.step === 'agreement' ? <div className="recruitment-step-content">
      <div className="step-card"><div className="step-card-head"><div><strong>Avtal</strong><small>Ladda upp anställningsavtal. Filen hamnar under Avtal i medarbetarprofilen.</small></div>{hasAgreement ? <span className="doc-status ok">Finns</span> : <span className="doc-status required">Måste ordnas</span>}</div>
        <RecruitmentUploadButton label="Ladda upp avtal" kind="Anställningsavtal" documentLabel="Anställningsavtal" candidate={candidate} setPeople={setPeople} />
        <RecruitmentDocumentList documents={agreementDocuments} emptyText="Inget avtal uppladdat ännu." onPreview={setPreviewDocument} onRemove={removeRecruitmentDocument} />
        <div className="step-card-actions"><span>{hasAgreement ? 'Avtalet är uppladdat.' : 'Avtal krävs för att gå vidare.'}</span><div className="step-action-buttons">{backButton}<button type="button" className="primary" disabled={!hasAgreement} onClick={markAgreementDone}>Steget är klart</button></div></div>
      </div>
    </div> : null}
    {recruitment.step === 'approval' ? <div className="recruitment-step-content">
      <div className="step-card"><div className="step-card-head"><div><strong>Godkännande</strong><small>Granska rekryteringen, markera checklistan, ladda upp dokument och kommentera referenstagning.</small></div>{approvalReady ? <span className="doc-status ok">Redo</span> : <span className="doc-status required">Ej klar</span>}</div>
        <div className="approval-summary-grid">
          <div><strong>Intervju</strong><span>{hasCv && hasRegisterExtract ? 'CV och registerutdrag finns' : 'CV eller registerutdrag saknas'}</span></div>
          <div><strong>Avtal</strong><span>{hasAgreement ? 'Anställningsavtal finns' : 'Anställningsavtal saknas'}</span></div>
          <div><strong>Checklista</strong><span>{recruitment.checklistDone ? 'Checklista klar' : 'Checklista kvar'}{checklistDocuments.length ? ` · ${checklistDocuments.length} dokument` : ''}</span></div>
          <div><strong>Provpass</strong><span>{trialPasses.length >= 2 ? `${trialPasses.length} provpass tillagda` : `${trialPasses.length}/2 provpass`}</span></div>
          <div><strong>Enheter</strong><span>{selectedUnits.length ? selectedUnits.join(', ') : 'Inga enheter valda'}</span></div>
        </div>
        <div className="group-multi-filter"><span>Enheter personen ska tillhöra</span><div>{groupNames.map(name => <label key={name}><input type="checkbox" checked={selectedUnits.includes(name)} onChange={() => toggleUnit(name)} />{name}</label>)}</div></div>
        <label className="check-confirm"><input type="checkbox" checked={recruitment.checklistDone} onChange={e => updateRecruitment({ checklistDone: e.target.checked })} /><span>Checklista klar</span></label>
        <div className="recruitment-upload-grid"><RecruitmentUploadButton label="Ladda upp checklista" kind="Övrigt" documentLabel="Checklista" candidate={candidate} setPeople={setPeople} /></div>
        <RecruitmentDocumentList documents={checklistDocuments} emptyText="Ingen checklista uppladdad" onPreview={setPreviewDocument} onRemove={removeRecruitmentDocument} />
        <label className="step-field"><span>Kommentar om referenstagning</span><textarea value={recruitment.referenceComment} onChange={e => updateRecruitment({ referenceComment: e.target.value })} placeholder="Ex. referenser tagna och tillfrågade, datum och kort notering" /></label>
        <div className="recruitment-upload-grid"><RecruitmentUploadButton label="Ladda upp övrig fil (frivilligt)" kind="Övrigt" documentLabel="Övrigt" candidate={candidate} setPeople={setPeople} /></div>
        <RecruitmentDocumentList documents={otherApprovalDocuments} emptyText="Inga övriga dokument, frivilligt" onPreview={setPreviewDocument} onRemove={removeRecruitmentDocument} />
        <div className="step-card-actions"><span>{approvalReady ? 'Alla krav är klara för godkännande. Övriga filer är frivilliga.' : 'CV, registerutdrag, avtal, checklista, minst två provpass, minst en enhet och kommentar om referenstagning krävs innan anställning. Övriga filer är frivilliga.'}</span><div className="step-action-buttons">{backButton}<button type="button" className="primary" disabled={!approvalReady} onClick={hireCandidate}>Flytta till Medarbetare</button></div></div>
      </div>
    </div> : null}
    <DocumentPreviewModal document={previewDocument} onClose={() => setPreviewDocument(null)} />
  </section>;
}

function Recruitment({ people, groups, groupTypes, setPeople, actor, onAdd }) {
  const candidates = people.filter(person => person.status === 'Rekrytering').sort((a, b) => recruitmentProgress(b) - recruitmentProgress(a));
  const [selectedCandidateId, setSelectedCandidateId] = useState(null);
  const selectedCandidate = candidates.find(candidate => candidate.id === selectedCandidateId) || candidates[0] || null;
  useEffect(() => {
    if (!selectedCandidate && selectedCandidateId) setSelectedCandidateId(null);
  }, [selectedCandidate, selectedCandidateId]);

  return <>
    <PageHeader title="Rekrytering" subtitle={`${candidates.length} aktiva kandidater`} onAdd={onAdd} addLabel="Lägg till person" />
    <div className="recruitment-layout">
      <section className="panel recruitment-list-panel">
        <div className="panel-head"><div><h2>Kandidater</h2><p>Personer i rekryteringsflödet.</p></div></div>
        <div className="candidate-list compact">{candidates.length ? candidates.map(candidate => { const recruitment = normalizeRecruitment(candidate.recruitment); return <button type="button" className={selectedCandidate?.id === candidate.id ? 'candidate-row active' : 'candidate-row'} key={candidate.id} onClick={() => setSelectedCandidateId(candidate.id)}><span className="person-cell"><Avatar person={candidate}/><span><b>{candidate.name}</b><small>{candidate.role || candidate.email || candidate.phone || '-'}</small></span></span><span className="tag muted">{recruitmentStepLabels[recruitment.step]}</span></button>; }) : <div className="empty-state">Inga personer i rekrytering.</div>}</div>
      </section>
      {selectedCandidate ? <RecruitmentCandidatePanel candidate={selectedCandidate} groups={groups} groupTypes={groupTypes} setPeople={setPeople} actor={actor} /> : <section className="panel"><div className="empty-state">Lägg till en person för att starta rekrytering.</div></section>}
    </div>
  </>;
}


function ArchiveView({ people, setSelectedId, onDelete }) {
  const rows = people.filter(person => person.status === 'Arkiverad');
  return <>
    <PageHeader title="Arkiv" subtitle={`${rows.length} borttagna medarbetare`} />
    <section className="panel list-panel archive-people-panel">
      <div className="panel-head"><div><h2>Avslutade medarbetare</h2><p>Radering här tar bort personen permanent.</p></div></div>
      <div className="employee-head archive-employee-head"><span>Medarbetare</span><span>Grupp</span><span>Roll</span><span>Borttagen</span><span>Borttagen av</span><span/></div>
      {rows.length ? rows.map(person => <div className="employee-row archive-employee-row" key={person.id} role="button" tabIndex={0} onClick={() => setSelectedId(person.id)} onKeyDown={event => { if (event.key === 'Enter') setSelectedId(person.id); }}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.email || person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.role || '-'}</span><span>{person.archivedAt ? formatDate(person.archivedAt) : '-'}</span><span>{formatActor(person.archivedBy)}</span><button type="button" className="icon-btn danger danger-icon row-delete" title={`Radera ${person.name} permanent`} aria-label={`Radera ${person.name} permanent`} onClick={event => { event.stopPropagation(); onDelete(person); }}><Trash2 size={13}/></button></div>) : <div className="empty-state">Arkivet är tomt.</div>}
    </section>
  </>;
}

function Overview({ people, groups, mode, onNavigate, onShowProbation, setSelectedId }) {
  // Översikten visar en snabb bild av personregistret.
  const active = people.filter(person => person.status === 'Anställd');
  const probationPeople = active
    .filter(person => person.hasProbation && person.probationEnd)
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
      <div className="employee-head probation-head"><span>Medarbetare</span><span>Grupp</span><span>Typ</span><span>Roll</span><span>Slutar</span><span/></div>
      {probationPeople.length ? probationPeople.map(person => <button type="button" className="employee-row probation-row" key={person.id} onClick={() => setSelectedId(person.id)}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.role || '-'}</span><span>{person.probationEnd ? formatDate(person.probationEnd) : '-'}</span><ChevronRight size={17}/></button>) : <div className="empty-state">Inga aktiva provanställningar.</div>}
    </section> : <section className="panel list-panel">
      <div className="panel-head"><div><h2>Senast i personregistret</h2><p>Snabbvy över de första aktiva profilerna.</p></div></div>
      <div className="employee-head overview-employee-head"><span>Medarbetare</span><span>Grupp</span><span>Typ</span><span>Utbildning</span><span>Tjänstgöringsgrad</span><span>Anställningsstart</span></div>
      {active.slice(0, 6).map(person => <div className="employee-row overview-employee-row" key={person.id}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.education || '-'}</span><span>{person.rate} %</span><span>{person.employmentDate ? formatDate(person.employmentDate) : '-'}</span></div>)}
    </section>}
  </>;
}

function Employees({ people, groups, query, setSelectedId, onAdd, onArchive, peopleTab, setPeopleTab, searchPanel, searchResults, hasPeopleFilters }) {
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
    <div className="employee-page-tabs" role="tablist" aria-label="Medarbetarvy"><button type="button" className={peopleTab === 'list' ? 'active' : ''} onClick={() => setPeopleTab('list')}>Lista</button><button type="button" className={peopleTab === 'search' ? 'active' : ''} onClick={() => setPeopleTab('search')}>Sök och filtrering</button></div>
    {peopleTab === 'search' ? <section className="employee-search-tab">{searchPanel}{hasPeopleFilters ? searchResults : <section className="panel"><div className="empty-state">Välj sökord, filter eller sortering för att visa sökresultat.</div></section>}</section> : <section className="panel list-panel">
      <div className="panel-head"><h2>Alla medarbetare</h2><button className="secondary small" onClick={() => setPeopleTab('search')}><SlidersHorizontal size={16}/>Sök och filtrera</button></div>
      <div className="employee-head main-employee-head"><span>Medarbetare</span><span>Grupp</span><span>Typ</span><span>Utbildning</span><span>Tjänstgöringsgrad</span><span>Telefon</span><span>Dokument</span><span/></div>
      {rows.length ? orderedGroups.map(unit => { const unitName = groupLabel(unit); return <div key={unitName} className="group-section"><div className="group-section-head"><h3>{unitName}</h3><span>{(grouped[unitName] || []).length} personer</span></div>{(grouped[unitName] || []).map(person => { const docStatus = documentListStatus(person); return <div className="employee-row main-employee-row" key={person.id} role="button" tabIndex={0} onClick={() => setSelectedId(person.id)} onKeyDown={event => { if (event.key === 'Enter') setSelectedId(person.id); }}><span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span><span>{person.unit || '-'}</span><span>{person.group || '-'}</span><span>{person.education || '-'}</span><span>{person.rate} %</span><span>{person.phone || '-'}</span><span className={docStatus.missing.length ? 'employee-doc-warning' : 'employee-doc-ok'} title={docStatus.missing.length ? `Saknas: ${docStatus.missing.join(', ')}` : 'Alla dokument finns'}>{docStatus.label}</span><button type="button" className="icon-btn danger danger-icon row-delete" title={`Ta bort ${person.name}`} aria-label={`Ta bort ${person.name}`} onClick={event => { event.stopPropagation(); onArchive(person); }}><Trash2 size={13}/></button></div>; })}</div>; }) : <div className="empty-state">Inga aktiva medarbetare matchar sökningen.</div>}
    </section>}
  </>;
}


const personFieldLabels = {
  name: 'Namn',
  firstName: 'Förnamn',
  lastName: 'Efternamn',
  personalNumber: 'Personnummer',
  address: 'Adress',
  email: 'E-post',
  phone: 'Telefon',
  education: 'Utbildning',
  role: 'Roll',
  unit: 'Grupp',
  group: 'Typ',
  rate: 'Tjänstgöringsgrad',
  employmentDate: 'Anställningsstart',
  employmentStart: 'Anställningsstart',
  employmentType: 'Anställningstyp',
  hasProbation: 'Provanställning',
  probationEnd: 'Provanställning slut',
  noticeDate: 'Uppsägning inlämnad',
  terminationDate: 'Sista anställningsdag',
  status: 'Status',
  start: 'Startdatum',
  createdAt: 'Tillagd i Folk',
  hiredAt: 'Anställd i Folk',
  hasCv: 'CV',
  hasEmploymentContract: 'Anställningsavtal',
  hasRegisterExtract: 'Registerutdrag',
  hasOtherDocuments: 'Övriga dokument',
};
const hiddenSearchFields = new Set(['id', 'initials', 'color', 'documents', 'notes', 'createdBy', 'hiredBy', 'recruitment']);
const preferredSearchFieldOrder = ['name', 'firstName', 'lastName', 'personalNumber', 'email', 'phone', 'address', 'unit', 'group', 'role', 'education', 'employmentType', 'rate', 'employmentDate', 'hasCv', 'hasEmploymentContract', 'hasRegisterExtract', 'hasOtherDocuments', 'hasProbation', 'probationEnd', 'noticeDate', 'terminationDate', 'status', 'createdAt'];
const dateFieldKeys = new Set(['employmentDate', 'employmentStart', 'start', 'probationEnd', 'noticeDate', 'terminationDate', 'createdAt', 'hiredAt']);
const defaultSearchColumnKeys = ['unit', 'group', 'role', 'employmentType', 'employmentDate', 'hasCv', 'hasEmploymentContract', 'hasRegisterExtract', 'status'];

function fieldLabel(key) {
  return personFieldLabels[key] || key.replace(/([A-Z])/g, ' $1').replace(/[_-]/g, ' ').replace(/^./, char => char.toLocaleUpperCase('sv'));
}

function isSearchableValue(value) {
  return value !== null && value !== undefined && ['string', 'number', 'boolean'].includes(typeof value);
}


function documentKindMatches(document, kind) {
  const value = String(document?.kind || '').toLocaleLowerCase('sv');
  if (kind === 'Anställningsavtal') return ['anställningsavtal', 'avtal'].includes(value);
  if (kind === 'Övrigt') return !['cv', 'anställningsavtal', 'avtal', 'registerutdrag'].includes(value);
  return value === kind.toLocaleLowerCase('sv');
}

function documentsByKind(person, kind) {
  return normalizeDocuments(person?.documents || []).filter(document => documentKindMatches(document, kind));
}

function documentLabelMatches(document, needle) {
  return String(document?.label || document?.name || '').toLocaleLowerCase('sv').includes(needle);
}

function documentsForCategory(documents, category) {
  return normalizeDocuments(documents || []).filter(document => {
    if (category.matchLabel) return documentKindMatches(document, category.kind) && documentLabelMatches(document, category.matchLabel);
    if (category.kind === 'Övrigt') return documentKindMatches(document, 'Övrigt') && !documentLabelMatches(document, 'tystnadsplikt') && !documentLabelMatches(document, 'checklista');
    return documentKindMatches(document, category.kind);
  });
}

function missingRequiredDocuments(person) {
  const documents = normalizeDocuments(person?.documents || []);
  return employeeDocumentCategories
    .filter(category => category.required && documentsForCategory(documents, category).length === 0)
    .map(category => category.title);
}

function documentListStatus(person) {
  const missing = missingRequiredDocuments(person);
  return { missing, label: missing.length ? `${missing.length} saknas` : 'OK' };
}

function documentStatusFor(person, key) {
  const field = documentStatusFields.find(item => item.key === key);
  if (!field) return '';
  return documentsByKind(person, field.kind).length ? 'Finns' : 'Saknas';
}

function getPersonFieldValue(person, key) {
  if (documentStatusFields.some(field => field.key === key)) return documentStatusFor(person, key);
  const value = person?.[key];
  if (isSearchableValue(value)) return value;
  if (Array.isArray(value)) return value.map(item => isSearchableValue(item) ? item : '').filter(Boolean).join(', ');
  if (value && typeof value === 'object' && !hiddenSearchFields.has(key)) {
    return Object.values(value).filter(isSearchableValue).join(' ');
  }
  return '';
}

function personSearchText(person, fields) {
  return fields.map(field => getPersonFieldValue(person, field.key)).filter(Boolean).join(' ').toLocaleLowerCase('sv');
}

function discoverPersonFields(people) {
  const keys = new Set();
  people.forEach(person => {
    Object.entries(person || {}).forEach(([key, value]) => {
      if (hiddenSearchFields.has(key)) return;
      if (isSearchableValue(value) || (value && typeof value === 'object' && !Array.isArray(value))) keys.add(key);
    });
  });
  documentStatusFields.forEach(field => keys.add(field.key));
  return Array.from(keys)
    .map(key => ({ key, label: fieldLabel(key), isDate: dateFieldKeys.has(key), isNumeric: people.some(person => typeof person?.[key] === 'number') }))
    .sort((a, b) => {
      const ai = preferredSearchFieldOrder.indexOf(a.key);
      const bi = preferredSearchFieldOrder.indexOf(b.key);
      if (ai !== -1 || bi !== -1) return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
      return a.label.localeCompare(b.label, 'sv');
    });
}

function formatFieldValue(value, field) {
  if (value === null || value === undefined || value === '') return '-';
  if (field?.isDate) return formatDate(String(value).slice(0, 10));
  if (typeof value === 'boolean') return value ? 'Ja' : 'Nej';
  if (field?.key === 'rate') return `${value} %`;
  if (Array.isArray(value)) return value.join(', ') || '-';
  if (typeof value === 'object') return Object.values(value).filter(isSearchableValue).join(', ') || '-';
  return String(value);
}

function compareFieldValues(a, b, field, direction) {
  const av = getPersonFieldValue(a, field.key);
  const bv = getPersonFieldValue(b, field.key);
  let result;
  if (field.isNumeric) {
    result = (Number(av) || 0) - (Number(bv) || 0);
  } else if (field.isDate) {
    result = String(av || '').localeCompare(String(bv || ''), 'sv');
  } else {
    result = String(av || '').localeCompare(String(bv || ''), 'sv', { numeric: true, sensitivity: 'base' });
  }
  return direction === 'desc' ? -result : result;
}


function exportSearchResultsPdf(rows, columns) {
  const escapeHtml = value => String(value ?? '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
  const headers = ['Person', ...columns.map(column => column.label)];
  const body = rows.map(person => `<tr><td><strong>${escapeHtml(person.name)}</strong><br><small>${escapeHtml(person.email || person.phone || person.role || '')}</small></td>${columns.map(column => `<td>${escapeHtml(formatFieldValue(getPersonFieldValue(person, column.key), column))}</td>`).join('')}</tr>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Folk sökresultat</title><style>body{font-family:Arial,sans-serif;color:#17211e;margin:24px}h1{font-size:20px;margin:0 0 6px}p{font-size:12px;color:#68736f;margin:0 0 16px}table{width:100%;border-collapse:collapse;font-size:10px}th,td{border:1px solid #d8dfdc;padding:5px 6px;text-align:left;vertical-align:top}th{background:#eef2f0;font-size:9px;text-transform:uppercase}tr:nth-child(even){background:#f7faf9}small{color:#68736f}</style></head><body><h1>Folk sökresultat</h1><p>${rows.length} personer · ${new Date().toLocaleDateString('sv-SE')}</p><table><thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead><tbody>${body || '<tr><td>Inga resultat</td></tr>'}</tbody></table><script>window.addEventListener('load',()=>{window.print();});</script></body></html>`;
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  printWindow.document.write(html);
  printWindow.document.close();
}

function PeopleSearchResults({ people, query, groupFilter, dateFrom, dateTo, sortField, sortDirection, searchColumnKeys, setSelectedId }) {
  const fields = useMemo(() => discoverPersonFields(people), [people]);
  const normalized = query.trim().toLocaleLowerCase('sv');
  const activeDateField = fields.find(field => field.key === 'employmentDate') || { key: 'employmentDate', label: 'Anställningsstart', isDate: true };
  const activeSortField = fields.find(field => field.key === sortField) || fields.find(field => field.key === 'name') || fields[0] || { key: 'name', label: 'Namn' };
  const rows = people.filter(person => {
    const searchable = personSearchText(person, fields);
    const personDate = String(getPersonFieldValue(person, activeDateField.key) || '').slice(0, 10);
    const matchesQuery = !normalized || searchable.includes(normalized);
    const selectedGroups = Array.isArray(groupFilter) ? groupFilter : (groupFilter && groupFilter !== 'Alla' ? [groupFilter] : []);
    const matchesGroup = selectedGroups.length === 0 || selectedGroups.includes(person.unit);
    const matchesFrom = !dateFrom || (personDate && personDate >= dateFrom);
    const matchesTo = !dateTo || (personDate && personDate <= dateTo);
    return matchesQuery && matchesGroup && matchesFrom && matchesTo;
  }).sort((a, b) => compareFieldValues(a, b, activeSortField, sortDirection));
  const selectedColumnKeys = Array.isArray(searchColumnKeys) ? searchColumnKeys : defaultSearchColumnKeys;
  const visibleColumns = selectedColumnKeys
    .filter((key, index, list) => key && list.indexOf(key) === index && !['name', 'firstName', 'lastName'].includes(key))
    .map(key => fields.find(field => field.key === key) || { key, label: fieldLabel(key), isDate: dateFieldKeys.has(key) });
  const resultGridStyle = {
    '--search-columns': `150px repeat(${visibleColumns.length}, 104px) 32px`,
    '--search-table-width': `${Math.max(820, 220 + visibleColumns.length * 118)}px`,
  };
  const activeSummary = [
    query.trim() ? `Sök: ${query.trim()}` : '',
    (Array.isArray(groupFilter) ? groupFilter : []).length ? `Grupper: ${groupFilter.join(', ')}` : '',
    dateFrom || dateTo ? `${activeDateField.label}: ${dateFrom || 'start'} till ${dateTo || 'slut'}` : '',
  ].filter(Boolean);

  return <>
    <PageHeader title="Sökresultat" subtitle={`${rows.length} av ${people.length} personer matchar valda villkor`} />
    <section className="search-workbench">
      <div className="search-chip-panel">
        <div><strong>Aktiva villkor</strong><span>{activeSummary.length ? `${activeSummary.length} filter` : 'Inga filter'}</span></div>
        <div className="search-chip-list">{activeSummary.length ? activeSummary.map(item => <span key={item}>{item}</span>) : <span>Alla synliga personer visas</span>}</div>
      </div>
      <div className="result-toolbar">
        <div><strong>Resultat</strong><span>{rows.length} poster · {visibleColumns.length} kolumner</span></div>
        <div><span>Sorterat på</span><strong>{activeSortField.label} {sortDirection === 'asc' ? '↑' : '↓'}</strong></div>
        <button type="button" className="secondary small" onClick={() => exportSearchResultsPdf(rows, visibleColumns)}><Download size={14}/>PDF</button>
      </div>
    </section>
    <section className="panel people-search-panel advanced-search-panel" aria-label="Sökresultat">
      <div className="result-table-scroll">
        <table className="result-table" style={{ '--result-table-width': resultGridStyle['--search-table-width'] }}>
          <thead><tr><th>Person</th>{visibleColumns.map(field => <th key={field.key}>{field.label}</th>)}<th /></tr></thead>
          <tbody>{rows.length ? rows.map(person => <tr key={person.id} onClick={() => setSelectedId(person.id)} tabIndex={0} onKeyDown={event => { if (event.key === 'Enter') setSelectedId(person.id); }}>
            <td><span className="table-person"><Avatar person={person}/><span><b>{person.name}</b><small>{person.email || person.phone || person.role}</small></span></span></td>
            {visibleColumns.map(field => <td key={field.key} title={formatFieldValue(getPersonFieldValue(person, field.key), field)}>{field.key === 'status' ? <span className={person.status === 'Avvisad' ? 'tag danger' : 'tag'}>{person.status}</span> : documentStatusFields.some(item => item.key === field.key) ? <span className={getPersonFieldValue(person, field.key) === 'Finns' ? 'doc-status ok' : 'doc-status missing'}>{getPersonFieldValue(person, field.key)}</span> : formatFieldValue(getPersonFieldValue(person, field.key), field)}</td>)}
            <td className="row-open"><ChevronRight size={13}/></td>
          </tr>) : <tr><td colSpan={visibleColumns.length + 2}>Inga personer matchar sökningen och de valda filtren.</td></tr>}</tbody>
        </table>
      </div>
    </section>
  </>;
}

function documentMime(document) {
  return document.mimeType || document.type || '';
}

function documentName(document) {
  return String(document?.name || '').toLocaleLowerCase('sv');
}

function isDocxDocument(document) {
  const mime = documentMime(document);
  return mime.includes('officedocument.wordprocessingml.document') || documentName(document).endsWith('.docx');
}

function isLegacyDocDocument(document) {
  const mime = documentMime(document);
  return mime === 'application/msword' || documentName(document).endsWith('.doc');
}

function canInlinePreview(document) {
  const mime = documentMime(document);
  return mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('text/') || isDocxDocument(document) || isLegacyDocDocument(document);
}

function DocumentPreviewModal({ document, onClose }) {
  const [wordPreview, setWordPreview] = useState({ loading: false, text: '', error: '' });
  useEffect(() => {
    let cancelled = false;
    if (!document || !isDocxDocument(document)) {
      setWordPreview({ loading: false, text: '', error: '' });
      return () => { cancelled = true; };
    }
    setWordPreview({ loading: true, text: '', error: '' });
    previewDocxText(document)
      .then(text => { if (!cancelled) setWordPreview({ loading: false, text, error: '' }); })
      .catch(error => { if (!cancelled) setWordPreview({ loading: false, text: '', error: error.message || 'Kunde inte förhandsvisa Word-dokumentet.' }); });
    return () => { cancelled = true; };
  }, [document]);

  if (!document) return null;
  const mime = documentMime(document);
  const isImage = mime.startsWith('image/');
  const isPdf = mime === 'application/pdf';
  const isText = mime.startsWith('text/');
  const isDocx = isDocxDocument(document);
  const isLegacyDoc = isLegacyDocDocument(document);
  return <Modal title="Förhandsvisa dokument" onClose={onClose} wide>
    <div className="document-preview-head">
      <div><strong>{document.name}</strong><span>{document.kind || 'Dokument'}{document.label ? ` · ${document.label}` : ''}</span></div>
      <a className="secondary small" href={document.dataUrl} download={makeDocumentDownloadName(document)}><Download size={15}/>Hämta</a>
    </div>
    <div className="document-preview-frame">
      {isImage ? <img src={document.dataUrl} alt={document.name} /> : null}
      {isPdf || isText ? <iframe title={document.name} src={document.dataUrl} /> : null}
      {isDocx ? <div className="word-preview">{wordPreview.loading ? <p>Läser Word-dokument...</p> : wordPreview.error ? <div className="document-preview-fallback"><FileText size={34}/><strong>Kunde inte förhandsvisa Word-dokumentet</strong><p>{wordPreview.error}</p></div> : <pre>{wordPreview.text}</pre>}</div> : null}
      {isLegacyDoc ? <div className="document-preview-fallback"><FileText size={34}/><strong>Äldre Word-format</strong><p>.doc-filer kan sparas och hämtas, men direkt förhandsvisning kräver att filen sparas som .docx.</p></div> : null}
      {!canInlinePreview(document) ? <div className="document-preview-fallback"><FileText size={34}/><strong>Ingen inbyggd förhandsvisning</strong><p>Den här filtypen kan sparas i Folk och hämtas, men webbläsaren kan inte visa den direkt.</p></div> : null}
    </div>
  </Modal>;
}

function DocumentCategorySection({ person, setPeople, category, documents, onPreview }) {
  const [label, setLabel] = useState('');

  const handleUpload = async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    const fileRecord = await readAllowedDocumentAsDataUrl(file);
    if (!fileRecord) return;
    const customTitle = label.trim();
    const description = category.fixedLabel ? category.fixedLabel + (customTitle ? ': ' + customTitle : '') : customTitle;
    setPeople(prev => prev.map(current => current.id === person.id ? applyDocumentUpload(current, fileRecord, {
      kind: category.kind,
      label: description,
      source: 'Medarbetare',
    }) : current));
    setLabel('');
    event.target.value = '';
  };

  const removeDocument = id => {
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      documents: (current.documents || []).filter(document => document.id !== id),
    }) : current));
  };

  const isMissingRequired = category.required && documents.length === 0;

  return <article className="document-category">
    <div className="document-category-head">
      <div>
        <h3>{category.title}{category.required ? <span className="doc-required-label">Obligatorisk</span> : null}</h3>
        <p>{isMissingRequired ? 'Finns ej.' : category.description}</p>
      </div>
      <span className={documents.length ? 'doc-status ok' : (category.required ? 'doc-status required' : 'doc-status missing')}>{documents.length ? 'Finns' : (category.required ? 'Finns ej' : 'Saknas')}</span>
    </div>
    <div className="document-category-list">
      {documents.length ? documents.map(doc => <div className="document-row compact" key={doc.id}>
        <div className="document-row-main">
          <span className="document-file-name">{doc.name}</span>
          <span><em>Filtitel</em>{doc.label || category.emptyLabel}</span>
          <small>{doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString('sv-SE') : 'Okänt datum'}</small>
        </div>
        <div className="document-row-actions">
          <button type="button" className="secondary small icon-only" aria-label="Visa dokument" title="Visa" onClick={() => onPreview(doc)}><FileText size={15}/></button>
          <a className="secondary small icon-only" aria-label="Hämta dokument" title="Hämta" href={doc.dataUrl} download={makeDocumentDownloadName(doc)}><Download size={15}/></a>
          <button type="button" className="secondary small danger danger-compact icon-only" aria-label="Ta bort dokument" title="Ta bort" onClick={() => removeDocument(doc.id)}><Trash2 size={14}/></button>
        </div>
      </div>) : <div className="document-empty-row">Ingen fil uppladdad.</div>}
    </div>
    <div className="document-category-upload">
      <label><span>{category.labelTitle}</span><input value={label} onChange={e => setLabel(e.target.value)} placeholder={category.placeholder} /></label>
      <label className="secondary file-button document-upload-button"><Upload size={16}/>{category.uploadLabel}<input type="file" accept={acceptedDocumentAccept} onChange={handleUpload} /></label>
    </div>
  </article>;
}

function DocumentShelf({ person, setPeople, title, subtitle }) {
  const documents = normalizeDocuments(person.documents || []);
  const [previewDocument, setPreviewDocument] = useState(null);
  const categoryDocuments = category => documentsForCategory(documents, category);
  const categories = employeeDocumentCategories;

  return <section className="document-section">
    <div className="panel-head document-section-head"><div><h2>{title}</h2>{subtitle ? <p>{subtitle}</p> : null}</div></div>
    <div className="document-category-grid">
      {categories.map(category => <DocumentCategorySection
        key={category.id}
        person={person}
        setPeople={setPeople}
        category={category}
        documents={categoryDocuments(category)}
        onPreview={setPreviewDocument}
      />)}
    </div>
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

function EmployeeDetail({ person, setPeople, actor, onClose, onEdit, onArchive }) {
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
        <div className="profile-actions"><button className="secondary small" onClick={onEdit}><Pencil size={15}/>Redigera</button>{person.status !== 'Arkiverad' ? <button type="button" className="icon-btn danger danger-icon" title={`Ta bort ${person.name}`} aria-label={`Ta bort ${person.name}`} onClick={() => onArchive(person)}><Trash2 size={13}/></button> : null}</div>
      </div>
      <div className="profile-grid">
        <div><label>Personnummer</label><b>{person.personalNumber || '-'}</b></div>
        <div><label>Telefon</label><b>{person.phone}</b></div>
        <div><label>Adress</label><b>{person.address || '-'}</b></div>
        <div><label>E-post</label><b>{person.email}</b></div>
        <div><label>Roll</label><b>{person.role || '-'}</b></div>
        <div><label>Grupp</label><b>{person.unit || '-'}</b></div>
        <div><label>Enheter</label><b>{Array.isArray(person.assignedUnits) && person.assignedUnits.length ? person.assignedUnits.join(', ') : (person.unit || '-')}</b></div>
        <div><label>Typ</label><b>{person.group || '-'}</b></div>
        <div><label>Utbildning</label><b>{person.education || '-'}</b></div>
        <div><label>Anställningstyp</label><b>{person.employmentType || '-'}</b></div>
        <div><label>Tjänstgöringsgrad</label><b>{person.rate} %</b></div>
        <div><label>Anställningsstart</label><b>{person.employmentDate ? new Date(person.employmentDate).toLocaleDateString('sv-SE') : (person.start ? new Date(person.start).toLocaleDateString('sv-SE') : '-')}</b></div>
        {person.hasProbation ? <div><label>Provanställning slut</label><b>{person.probationEnd ? new Date(person.probationEnd).toLocaleDateString('sv-SE') : '-'}</b></div> : null}
        <div><label>Skapad av</label><b>{formatAudit(person.profileCreatedBy || person.createdBy || person.hiredBy, person.profileCreatedAt || person.createdAt || person.hiredAt)}</b></div>
        <div className="profile-empty-cell" aria-hidden="true" />
        <div className="employment-counter"><label>Anställd i</label><b>{duration ? duration.days.toLocaleString('sv-SE') : '-'}</b><small>{duration ? `dagar sedan ${formatDate(duration.startValue)}` : 'Anställningsstart saknas'}</small></div>
      </div>
    </> : null}
    {profileTab === 'documents' ? <DocumentShelf
      person={person}
      setPeople={setPeople}
      title="Dokument"
      subtitle="CV, anställningsavtal, registerutdrag och övriga dokument samlas här."
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
    hasProbation: Boolean(person.hasProbation || person.probationEnd),
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
      hasProbation: Boolean(form.hasProbation),
      probationStart: '',
      probationEnd: form.hasProbation ? form.probationEnd : '',
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
        <label className="checkbox-field"><input type="checkbox" checked={form.hasProbation} onChange={e => update('hasProbation', e.target.checked)} />Provanställning</label>
      </div>
      <div className="form-grid">
        {form.hasProbation ? <label>Provanställning slut<input type="date" value={form.probationEnd} onChange={e => update('probationEnd', e.target.value)} /></label> : <div />}
        <label>Startdatum i systemet<input type="date" value={form.start} onChange={e => update('start', e.target.value)} /></label>
      </div>
      <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Spara ändringar</button></div>
    </form>
  </Modal>;
}
function PersonDetail({ person, setPeople, groups, groupTypes, currentUser, onClose, onArchive }) {
  // Ett enda valpunkt för medarbetarprofiler.
  const [editing, setEditing] = useState(false);
  if (editing) {
    return <EmployeeEditForm person={person} groups={groups} groupTypes={groupTypes} onClose={() => setEditing(false)} onSave={updated => { setPeople(prev => prev.map(current => current.id === updated.id ? normalizePerson(updated) : current)); setEditing(false); }} />;
  }
  return <EmployeeDetail person={person} setPeople={setPeople} actor={currentUser} onClose={onClose} onEdit={() => setEditing(true)} onArchive={onArchive} />;
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

function Groups({ groups, setGroups, people, setPeople, canManage = true }) {
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
    <PageHeader title="Grupper" subtitle={canManage ? "Administrera grupper och markera om de hör till LSS, HVB, Skola, Verksamhet eller Kontor" : "Grupper du har tillgång till"} />
    <section className="panel group-text-panel">
      <div className="panel-head"><div><h2>Grupper</h2><p>{canManage ? 'Varje grupp kan ha en eller flera kategorier.' : 'Grupper du har behörighet till.'}</p></div><span className="tag">{groups.length} grupper</span></div>
      {canManage ? <form className="group-create-fields group-inline-form" onSubmit={addUnit}>
        <label><span>Ny grupp</span><input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="Ex. Björkhagen" /></label>
        <label><span>Kategorier</span><TypeCheckboxes selected={newTypes} onChange={setNewTypes} /></label>
        <button className="primary" type="submit"><Plus size={17}/>Lägg till grupp</button>
      </form> : null}
      <div className="group-text-list">
        {groups.map(group => { const name = groupLabel(group); const types = groupTypesFor(group); return <div className="group-text-row" key={name}>
          <div className="group-row-icon"><Building2 size={20}/></div>
          <div className="group-text-main"><strong>{name}</strong><span>{types.length ? types.join(', ') : 'Ingen kategori'} · {people.filter(person => person.unit === name).length} personer</span></div>
          {canManage ? <button type="button" className="secondary small" onClick={() => { setEditingUnit(name); setDraftUnit(name); setDraftTypes(types.length ? types : ['Verksamhet']); }} aria-label={`Redigera ${name}`}><Pencil size={15}/>Redigera</button> : null}
          {canManage ? <button type="button" className="secondary small danger danger-compact" onClick={() => removeUnit(name)} aria-label={`Ta bort ${name}`}><Trash2 size={14}/>Ta bort</button> : null}
          {canManage && editingUnit === name ? <div className="group-text-edit">
            <label><span>Grupp</span><input className="group-name" value={draftUnit} onChange={e => setDraftUnit(e.target.value)} placeholder="Nytt gruppnamn" /></label>
            <label><span>Kategorier</span><TypeCheckboxes selected={draftTypes} onChange={setDraftTypes} /></label>
            <div className="group-edit-actions"><button type="button" className="secondary small" onClick={() => setEditingUnit(null)}>Avbryt</button><button type="button" className="primary small" onClick={() => { updateUnit(name, draftUnit, draftTypes); setEditingUnit(null); }}>Spara ändringar</button></div>
          </div> : null}
        </div>; })}
      </div>
    </section>
  </>;
}

function LoginScreen({ users, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const matchedUser = users.find(user => user.email.toLowerCase() === email.trim().toLowerCase());

  const submit = event => {
    event.preventDefault();
    setMessage('');
    if (!matchedUser) {
      setMessage('E-postadressen är inte registrerad. Kontakta admin.');
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
        <label>Lösenord<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Tillfälligt eller eget lösenord" required /></label>
        {matchedUser?.mustChangePassword ? <p className="login-hint">Du loggar in med ett tillfälligt lösenord och måste byta lösenord direkt efter inloggning.</p> : null}
        {message ? <p className="login-error">{message}</p> : null}
        <button className="primary">Logga in</button>
      </form>
    </section>
  </div>;
}

function ForcePasswordChange({ currentUser, admins, setAdmins, onCurrentUserUpdate }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const submit = event => {
    event.preventDefault();
    setMessage('');
    if (newPassword.length < 6) {
      setMessage('Det nya lösenordet måste vara minst 6 tecken.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage('Lösenorden matchar inte.');
      return;
    }
    const storedUser = admins.find(admin => admin.id === currentUser?.id);
    if (!storedUser) return;
    const updated = { ...storedUser, password: newPassword, mustChangePassword: false };
    setAdmins(prev => prev.map(admin => admin.id === updated.id ? updated : admin));
    onCurrentUserUpdate(publicUser(updated));
  };

  return <div className="login-shell">
    <section className="login-panel">
      <div className="login-brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div>
      <form className="form" onSubmit={submit}>
        <p className="login-hint">Du måste byta ditt tillfälliga lösenord innan du kan fortsätta.</p>
        <label>Nytt lösenord<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></label>
        <label>Bekräfta nytt lösenord<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></label>
        {message ? <p className="login-error">{message}</p> : null}
        <button className="primary">Spara nytt lösenord</button>
      </form>
    </section>
  </div>;
}
function Admin({ groups, people, admins, setAdmins, currentUser, onCurrentUserUpdate, colorTheme, setColorTheme }) {
  // Administrationsvyn styr behöriga användare och grundregler för systemet.
  const [activeAdminTab, setActiveAdminTab] = useState('overview');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  const addAdmin = event => {
    event.preventDefault();
    const name = adminName.trim();
    const email = adminEmail.trim();
    if (!name || !email || temporaryPassword.length < 6) return;
    const exists = admins.some(admin => admin.email.toLowerCase() === email.toLowerCase());
    if (exists) return;
    if (currentUser?.role !== 'Admin') return;
    setAdmins(prev => [...prev, { id: Date.now(), name, email, role: 'Användare', password: temporaryPassword, mustChangePassword: true, groupAccess: selectedGroups, createdAt: new Date().toISOString(), createdBy: currentUser }]);
    setAdminName('');
    setAdminEmail('');
    setTemporaryPassword('');
    setSelectedGroups([]);
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
  const groupOptions = groups.map(groupLabel).filter(Boolean);
  const toggleSelectedGroup = groupName => setSelectedGroups(prev => prev.includes(groupName) ? prev.filter(name => name !== groupName) : [...prev, groupName]);
  const updateUserGroups = (id, groupName, checked) => {
    if (!canManageUsers) return;
    setAdmins(prev => prev.map(admin => {
      if (admin.id !== id) return admin;
      const current = Array.isArray(admin.groupAccess) ? admin.groupAccess : [];
      const groupAccess = checked ? Array.from(new Set([...current, groupName])) : current.filter(name => name !== groupName);
      return { ...admin, groupAccess };
    }));
  };

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
    const updatedUser = { ...storedUser, password: newPassword, mustChangePassword: false };
    setAdmins(prev => prev.map(admin => admin.id === storedUser.id ? updatedUser : admin));
    onCurrentUserUpdate(publicUser(updatedUser));
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setPasswordMessage('Lösenordet är uppdaterat.');
  };

  const adminTabs = [
    { id: 'overview', label: 'Översikt' },
    { id: 'users', label: 'Användare' },
    { id: 'appearance', label: 'Utseende' },
    { id: 'security', label: 'Lösenord' },
  ];

  return <>
    <PageHeader title="Administration" subtitle="Systemets inställningar och behörigheter" />
    <section className="admin-tabs" role="tablist" aria-label="Administrationsflikar">
      {adminTabs.map(tab => <button type="button" key={tab.id} role="tab" aria-selected={activeAdminTab === tab.id} className={activeAdminTab === tab.id ? 'active' : ''} onClick={() => setActiveAdminTab(tab.id)}>{tab.label}</button>)}
    </section>
    {activeAdminTab === 'overview' ? <div className="admin-overview">
      <section className="admin-summary-grid">
        <div><Users/><span><b>{admins.length}</b>Användare</span></div>
        <div><Shapes/><span><b>{groups.length}</b>Grupper</span></div>
        <div><ShieldCheck/><span><b>{people.length}</b>Profiler i systemet</span></div>
      </section>
      <div className="admin-list">
        <section><ShieldCheck/><div><h3>Behörigheter</h3><p>Admin ser alla grupper och medarbetare. Användare ser bara medarbetare i tilldelade grupper.</p></div><span className="tag">Aktivt</span></section>
        <section><Shapes/><div><h3>Organisation</h3><p>{groups.length} grupper är tillgängliga för behörighetsstyrning.</p></div><span className="tag">Synkroniserat</span></section>
        <section><Settings/><div><h3>Färgskala</h3><p>Aktiv profil är {colorThemes.find(theme => theme.id === colorTheme)?.name}.</p></div><span className="tag">Vald</span></section>
      </div>
    </div> : null}
    {activeAdminTab === 'users' ? <section className="panel admin-users">
      <div className="panel-head"><div><h2>Användare</h2><p>Admin skapar konto, tilldelar grupper och anger ett tillfälligt lösenord som måste bytas vid första inloggning.</p></div><span className="tag">{admins.length} användare</span></div>
      {canManageUsers ? <form className="admin-user-form" onSubmit={addAdmin}>
        <label>Namn<input value={adminName} onChange={e => setAdminName(e.target.value)} placeholder="Förnamn Efternamn" required /></label>
        <label>E-postadress<input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="namn@organisation.se" required /></label>
        <label>Tillfälligt lösenord<input type="text" value={temporaryPassword} onChange={e => setTemporaryPassword(e.target.value)} placeholder="Minst 6 tecken" required /></label>
        <div className="admin-group-picker"><span>Grupper</span>{groupOptions.map(groupName => <label key={groupName}><input type="checkbox" checked={selectedGroups.includes(groupName)} onChange={() => toggleSelectedGroup(groupName)} />{groupName}</label>)}</div>
        <button className="primary"><Plus size={17}/>Lägg till</button>
      </form> : <div className="empty-state">Endast admin kan skapa användare.</div>}
      <div className="admin-user-list">
        {admins.map(admin => {
          const isCurrent = admin.id === currentUser?.id;
          const isLastAdmin = admin.role === 'Admin' && admins.filter(user => user.role === 'Admin').length <= 1;
          const canRemove = canManageUsers && !isCurrent && !isLastAdmin;
          const removeReason = isCurrent ? 'Du kan inte ta bort dig själv' : isLastAdmin ? 'Sista admin kan inte tas bort' : 'Endast admin kan ta bort användare';
          return <div className="admin-user-row" key={admin.id}>
            <div className="mini-avatar">{userInitials(admin.name)}</div>
            <span><strong>{admin.name}</strong><small>{admin.email} · {admin.role}{admin.mustChangePassword ? ' · måste byta lösenord' : ''}</small></span>
            <div className="admin-user-groups">{userCanSeeAll(admin) ? <small>Alla grupper</small> : groupOptions.map(groupName => <label key={groupName}><input type="checkbox" disabled={!canManageUsers} checked={(admin.groupAccess || []).includes(groupName)} onChange={event => updateUserGroups(admin.id, groupName, event.target.checked)} />{groupName}</label>)}</div>
            <button className="secondary small danger danger-compact" disabled={!canRemove} title={canRemove ? `Ta bort ${admin.name}` : removeReason} onClick={() => removeAdmin(admin.id)}><Trash2 size={14}/>Ta bort</button>
          </div>;
        })}
      </div>
    </section> : null}
    {activeAdminTab === 'appearance' ? <section className="panel theme-panel">
      <div className="panel-head"><div><h2>Färgskala</h2><p>Välj färgprofil för hela Folk.</p></div><span className="tag">{colorThemes.find(theme => theme.id === colorTheme)?.name}</span></div>
      <div className="theme-options">
        {colorThemes.map(theme => <button type="button" key={theme.id} className={colorTheme === theme.id ? "theme-option selected" : "theme-option"} aria-pressed={colorTheme === theme.id} onClick={() => setColorTheme(theme.id)}>
          <span className="theme-swatches" aria-hidden="true">{theme.colors.map(color => <i key={color} style={{ backgroundColor: color }} />)}</span>
          <span><strong>{theme.name}</strong><small>{theme.description}</small></span>
          <span className="theme-check">{colorTheme === theme.id ? "Vald" : "Välj"}</span>
        </button>)}
      </div>
    </section> : null}
    {activeAdminTab === 'security' ? <section className="panel password-panel">
      <div className="panel-head"><div><h2>Byt lösenord</h2><p>Uppdatera lösenordet för ditt konto.</p></div></div>
      <form className="password-form" onSubmit={changePassword}>
        <label>Nuvarande lösenord<input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required /></label>
        <label>Nytt lösenord<input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required /></label>
        <label>Bekräfta nytt lösenord<input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required /></label>
        <button className="primary">Spara lösenord</button>
      </form>
      {passwordMessage ? <div className={passwordMessage.includes('uppdaterat') ? 'password-message success' : 'password-message'}>{passwordMessage}</div> : null}
    </section> : null}
  </>;
}

function SearchFilterPanel({ filterPanelTab, setFilterPanelTab, peopleGroupOptions, groupFilter, toggleGroupFilter, searchableFields, dateFrom, setDateFrom, dateTo, setDateTo, sortField, setSortField, sortDirection, setSortDirection, hasPeopleFilters, clearFilters, searchColumnKeys, setSearchColumnKeys, availableSearchColumns, toggleSearchColumn }) {
  const showColumns = filterPanelTab === 'columns';
  const showFilters = !showColumns;
  return <div className="people-filter-shell embedded-filter-shell">
    <div className="filter-tabs" role="tablist" aria-label="Sökfilter">
      <button type="button" className={showFilters ? 'active' : ''} aria-selected={showFilters} onClick={() => setFilterPanelTab('filters')}>Filter och sortering</button>
      <button type="button" className={showColumns ? 'active' : ''} aria-selected={showColumns} onClick={() => setFilterPanelTab('columns')}>Kolumner i listan</button>
    </div>
    {showFilters ? <div className="filter-grid-panel">
      <section className="filter-card filter-card-wide"><div className="filter-card-head"><strong>Grupper</strong><span>Visa en eller flera grupper</span></div><div className="group-multi-filter"><div>{peopleGroupOptions.map(option => <label key={option}><input type="checkbox" checked={groupFilter.includes(option)} onChange={() => toggleGroupFilter(option)} />{option}</label>)}</div></div></section>
      <section className="filter-card"><div className="filter-card-head"><strong>Datum</strong><span>Välj datum från och till</span></div><div className="filter-two"><label><span>Från</span><input type="date" value={dateFrom} max={dateTo || undefined} onChange={e => setDateFrom(e.target.value)} /></label><label><span>Till</span><input type="date" value={dateTo} min={dateFrom || undefined} onChange={e => setDateTo(e.target.value)} /></label></div></section>
      <section className="filter-card"><div className="filter-card-head"><strong>Sortering</strong><span>Styr ordning i resultatlistan</span></div><label><span>Sortera på</span><select value={sortField} onChange={e => setSortField(e.target.value)}>{searchableFields.map(field => <option key={field.key} value={field.key}>{field.label}</option>)}</select></label><label><span>Ordning</span><select value={sortDirection} onChange={e => setSortDirection(e.target.value)}><option value="asc">Stigande</option><option value="desc">Fallande</option></select></label></section>
      <section className="filter-card filter-actions-card"><div className="filter-card-head"><strong>Åtgärder</strong><span>Rensa alla aktiva villkor</span></div><button type="button" className="secondary filter-clear" disabled={!hasPeopleFilters} onClick={clearFilters}>Rensa allt</button></section>
    </div> : <div className="column-picker-panel">
      <div className="column-picker-head"><span>{availableSearchColumns.filter(field => searchColumnKeys.includes(field.key)).length} kolumner visas i sökresultatet och PDF</span><button type="button" className="secondary small" onClick={() => setSearchColumnKeys(defaultSearchColumnKeys)}>Standard</button></div>
      <div className="column-picker-grid">{availableSearchColumns.map(field => <label key={field.key}><input type="checkbox" checked={searchColumnKeys.includes(field.key)} onChange={() => toggleSearchColumn(field.key)} />{field.label}</label>)}</div>
    </div>}
  </div>;
}

function App() {
  // Tillståndet speglas mot backend/SQLite och använder localStorage som fallback för session och offline-start.
  const seed = loadState();
  const savedUi = loadUiState();
  const [active, setActive] = useState(savedUi.active);
  const [peopleTab, setPeopleTab] = useState(savedUi.peopleTab);
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
  const saveQueueRef = useRef(Promise.resolve());
  const [colorTheme, setColorTheme] = useState(seed.colorTheme);
  const [query, setQuery] = useState(savedUi.query);
  const [newEmployeeOpen, setNewEmployeeOpen] = useState(false);
  const [newRecruitmentOpen, setNewRecruitmentOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [menu, setMenu] = useState(false);
  const [groupFilter, setGroupFilter] = useState(savedUi.groupFilter);
  const [dateFrom, setDateFrom] = useState(savedUi.dateFrom);
  const [dateTo, setDateTo] = useState(savedUi.dateTo);
  const [sortField, setSortField] = useState(savedUi.sortField);
  const [sortDirection, setSortDirection] = useState(savedUi.sortDirection);
  const [filterPanelTab, setFilterPanelTab] = useState(savedUi.filterPanelTab);
  const [searchColumnKeys, setSearchColumnKeys] = useState(savedUi.searchColumnKeys);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [overviewMode, setOverviewMode] = useState(savedUi.overviewMode);
  const [sessionPromptOpen, setSessionPromptOpen] = useState(false);
  const visiblePeople = useMemo(() => filterPeopleForUser(people, currentUser), [people, currentUser]);
  const visibleGroups = useMemo(() => filterGroupsForUser(groups, currentUser), [groups, currentUser]);
  const activeVisiblePeople = useMemo(() => visiblePeople.filter(person => person.status === 'Anställd'), [visiblePeople]);
  const recruitmentVisiblePeople = useMemo(() => visiblePeople.filter(person => person.status === 'Rekrytering'), [visiblePeople]);
  const archivedVisiblePeople = useMemo(() => visiblePeople.filter(person => person.status === 'Arkiverad'), [visiblePeople]);
  const navigationItems = useMemo(() => [
    ['Översikt', LayoutDashboard],
    ['Medarbetare', Users],
    ['Rekrytering', UserPlus],
    ['Grupper', Shapes],
    ['Arkiv', Archive],
    ...(userCanSeeAll(currentUser) ? [['Administration', Settings]] : []),
  ], [currentUser]);
  const peopleGroupOptions = Array.from(new Set([...visibleGroups.map(groupLabel), ...activeVisiblePeople.map(person => person.unit).filter(Boolean)])).filter(Boolean);
  const searchableFields = useMemo(() => discoverPersonFields(activeVisiblePeople), [activeVisiblePeople]);
  const availableSearchColumns = searchableFields.filter(field => !['name', 'firstName', 'lastName'].includes(field.key));
  const availableSearchColumnKeys = new Set(availableSearchColumns.map(field => field.key));
  const effectiveSearchColumnKeys = searchColumnKeys.filter((key, index, list) => availableSearchColumnKeys.has(key) && list.indexOf(key) === index);
  const toggleSearchColumn = key => setSearchColumnKeys(prev => prev.includes(key) ? prev.filter(value => value !== key) : [...prev, key]);
  const hasPeopleFilters = Boolean(query.trim() || groupFilter.length || dateFrom || dateTo || sortField !== "name" || sortDirection !== "asc");
  const toggleGroupFilter = groupName => setGroupFilter(prev => prev.includes(groupName) ? prev.filter(name => name !== groupName) : [...prev, groupName]);

  const navigateTo = label => {
    setActive(label);
    if (label !== 'Medarbetare') setPeopleTab('list');
    setOverviewMode('default');
    setMenu(false);
    setFiltersOpen(false);
    setFilterPanelTab("filters");
    setQuery("");
    setGroupFilter([]);
    setDateFrom("");
    setDateTo("");
    setSortField("name");
    setSortDirection("asc");
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
        const sourcePeople = Array.isArray(source.people) ? source.people : [];
        const mergedPeople = shouldMigrateLocal ? sourcePeople : mergeLocalRecruitment(sourcePeople, localBackup.people);
        setPeople(normalizePeople(mergedPeople, unitToGroupType));
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
    saveQueueRef.current = saveQueueRef.current
      .catch(() => {})
      .then(() => saveBackendState(state))
      .catch(() => setBackendError('Kunde inte spara till backend. Kontrollera att servern kör.'));
  }, [people, groups, groupTypes, admins, colorTheme, backendLoading]);

  useEffect(() => {
    const uiState = { active, peopleTab, overviewMode, query, groupFilter, dateFrom, dateTo, sortField, sortDirection, filterPanelTab, searchColumnKeys };
    localStorage.setItem(`${storageKey}-ui`, JSON.stringify(uiState));
  }, [active, peopleTab, overviewMode, query, groupFilter, dateFrom, dateTo, sortField, sortDirection, filterPanelTab, searchColumnKeys]);

  const login = user => {
    setSessionPromptOpen(false);
    setCurrentUser(user);
    localStorage.setItem(`${storageKey}-session`, user.email);
  };

  const logout = () => {
    setSessionPromptOpen(false);
    setCurrentUser(null);
    localStorage.removeItem(`${storageKey}-session`);
  };

  const keepSessionActive = () => {
    setSessionPromptOpen(false);
  };

  useEffect(() => {
    if (!currentUser || sessionPromptOpen) return undefined;

    let timerId = window.setTimeout(() => setSessionPromptOpen(true), inactivityPromptDelayMs);
    const resetTimer = () => {
      window.clearTimeout(timerId);
      timerId = window.setTimeout(() => setSessionPromptOpen(true), inactivityPromptDelayMs);
    };

    inactivityEvents.forEach(eventName => window.addEventListener(eventName, resetTimer, { passive: true }));
    return () => {
      window.clearTimeout(timerId);
      inactivityEvents.forEach(eventName => window.removeEventListener(eventName, resetTimer));
    };
  }, [currentUser, sessionPromptOpen]);

  const updateCurrentUser = user => {
    setCurrentUser(user);
    localStorage.setItem(`${storageKey}-session`, user.email);
  };

  const clearPeopleFilters = () => {
    setQuery("");
    setGroupFilter([]);
    setDateFrom("");
    setDateTo("");
    setSortField("name");
    setSortDirection("asc");
  };

  const searchFilterPanel = <SearchFilterPanel filterPanelTab={filterPanelTab} setFilterPanelTab={setFilterPanelTab} peopleGroupOptions={peopleGroupOptions} groupFilter={groupFilter} toggleGroupFilter={toggleGroupFilter} searchableFields={searchableFields} dateFrom={dateFrom} setDateFrom={setDateFrom} dateTo={dateTo} setDateTo={setDateTo} sortField={sortField} setSortField={setSortField} sortDirection={sortDirection} setSortDirection={setSortDirection} hasPeopleFilters={hasPeopleFilters} clearFilters={clearPeopleFilters} searchColumnKeys={effectiveSearchColumnKeys} setSearchColumnKeys={setSearchColumnKeys} availableSearchColumns={availableSearchColumns} toggleSearchColumn={toggleSearchColumn} />;

  const searchResults = <PeopleSearchResults people={activeVisiblePeople} query={query} groupFilter={groupFilter} dateFrom={dateFrom} dateTo={dateTo} sortField={sortField} sortDirection={sortDirection} searchColumnKeys={effectiveSearchColumnKeys} setSelectedId={setSelectedId} />;

  const archivePerson = person => {
    if (!person || person.status === 'Arkiverad') return;
    const confirmed = window.confirm(`Ta bort ${person.name}? Personen flyttas till Arkiv och kan inte längre ses i aktiva medarbetarlistan.`);
    if (!confirmed) return;
    setPeople(prev => prev.map(current => current.id === person.id ? normalizePerson({
      ...current,
      status: 'Arkiverad',
      archivedAt: new Date().toISOString(),
      archivedBy: currentUser,
    }) : current));
    setSelectedId(null);
  };

  const deleteArchivedPerson = person => {
    if (!person || person.status !== 'Arkiverad') return;
    const confirmed = window.confirm(`Radera ${person.name} permanent? Det här går inte att ångra.`);
    if (!confirmed) return;
    setPeople(prev => prev.filter(current => current.id !== person.id));
    setSelectedId(current => current === person.id ? null : current);
  };

  const selectedPerson = useMemo(() => visiblePeople.find(person => person.id === selectedId) || null, [visiblePeople, selectedId]);

  const page = useMemo(() => {
    if (hasPeopleFilters && !['Medarbetare', 'Rekrytering', 'Arkiv', 'Administration'].includes(active)) return searchResults;
    if (active === 'Översikt') return <Overview people={activeVisiblePeople} groups={visibleGroups} mode={overviewMode} onNavigate={navigateTo} onShowProbation={() => setOverviewMode('probation')} setSelectedId={setSelectedId} />;
    if (active === 'Medarbetare') return <Employees people={activeVisiblePeople} groups={visibleGroups} query={query} setSelectedId={setSelectedId} onAdd={() => setNewEmployeeOpen(true)} onArchive={archivePerson} peopleTab={peopleTab} setPeopleTab={setPeopleTab} searchPanel={searchFilterPanel} searchResults={searchResults} hasPeopleFilters={hasPeopleFilters} />;
    if (active === 'Rekrytering') return <Recruitment people={recruitmentVisiblePeople} groups={visibleGroups} groupTypes={groupTypes} setPeople={setPeople} actor={currentUser} onAdd={() => setNewRecruitmentOpen(true)} />;
    if (active === 'Arkiv') return <ArchiveView people={archivedVisiblePeople} setSelectedId={setSelectedId} onDelete={deleteArchivedPerson} />;
    if (active === 'Grupper') return <Groups groups={visibleGroups} setGroups={setGroups} people={activeVisiblePeople} setPeople={setPeople} canManage={userCanSeeAll(currentUser)} />;
    if (active === 'Administration' && userCanSeeAll(currentUser)) return <Admin groups={groups} people={people} admins={admins} setAdmins={setAdmins} currentUser={currentUser} onCurrentUserUpdate={updateCurrentUser} colorTheme={colorTheme} setColorTheme={setColorTheme} />;
    return <Overview people={activeVisiblePeople} groups={visibleGroups} mode={overviewMode} onNavigate={navigateTo} onShowProbation={() => setOverviewMode('probation')} setSelectedId={setSelectedId} />;
  }, [active, peopleTab, activeVisiblePeople, recruitmentVisiblePeople, archivedVisiblePeople, visiblePeople, visibleGroups, people, groups, groupTypes, query, groupFilter, dateFrom, dateTo, sortField, sortDirection, searchColumnKeys, effectiveSearchColumnKeys, filterPanelTab, hasPeopleFilters, admins, currentUser, colorTheme, overviewMode]);

  if (backendLoading) {
    return <div className="login-shell"><section className="login-panel"><div className="login-brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div><p className="loading-state">Laddar data från backend...</p></section></div>;
  }

  if (!currentUser) {
    return <LoginScreen users={admins} onLogin={login} />;
  }

  if (currentUser.mustChangePassword) {
    return <ForcePasswordChange currentUser={currentUser} admins={admins} setAdmins={setAdmins} onCurrentUserUpdate={updateCurrentUser} />;
  }

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`}>
      <div className="brand"><strong>Folk<span>.</span></strong><small>Medarbetarkoll</small></div>
      <nav>{navigationItems.map(([label, Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => navigateTo(label)}><Icon size={20}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-foot"><div className="mini-avatar">{userInitials(currentUser.name)}</div><span><b>{currentUser.name}</b><small>{currentUser.role}</small></span></div>
    </aside>
    <div className="main-wrap">
      <header className="topbar">
        <button className="mobile-menu" aria-label="Öppna meny" onClick={() => setMenu(!menu)}><Menu/></button>
        <div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök namn, roll, e-post, telefon, grupp eller typ"/></div>
        <button className="user"><span>{userInitials(currentUser.name)}</span><b>{currentUser.name}</b></button>
        <button className="icon-btn" aria-label="Logga ut" onClick={logout}><LogOut size={19}/></button>
      </header>
      {filtersOpen && active !== 'Medarbetare' ? searchFilterPanel : null}
      <main>{backendError ? <div className="backend-alert">{backendError}</div> : null}{page}</main>
    </div>
    {newEmployeeOpen ? <Modal title="Lägg till medarbetare" onClose={() => setNewEmployeeOpen(false)}><EmployeeForm groups={visibleGroups} groupTypes={groupTypes} actor={currentUser} onClose={() => setNewEmployeeOpen(false)} onSave={person => { setPeople(prev => [...prev, person]); setNewEmployeeOpen(false); setActive('Medarbetare'); }} /></Modal> : null}
    {newRecruitmentOpen ? <Modal title="Lägg till person i rekrytering" onClose={() => setNewRecruitmentOpen(false)}><RecruitmentAddForm actor={currentUser} onClose={() => setNewRecruitmentOpen(false)} onSave={person => { setPeople(prev => [...prev, person]); setNewRecruitmentOpen(false); setActive('Rekrytering'); }} /></Modal> : null}
    {selectedPerson ? <PersonDetail person={selectedPerson} setPeople={setPeople} groups={visibleGroups} groupTypes={groupTypes} currentUser={currentUser} onClose={() => setSelectedId(null)} onArchive={archivePerson} /> : null}
    {sessionPromptOpen ? <div className="modal-backdrop session-timeout-backdrop" role="dialog" aria-modal="true" aria-labelledby="session-timeout-title">
      <section className="session-timeout-modal">
        <h2 id="session-timeout-title">Vill du fortsätta vara inloggad?</h2>
        <p>Du har varit passiv i 10 minuter. Fortsätt sessionen eller logga ut.</p>
        <div className="session-timeout-actions">
          <button type="button" className="secondary" onClick={logout}>Logga ut</button>
          <button type="button" className="primary" autoFocus onClick={keepSessionActive}>Fortsätt vara inloggad</button>
        </div>
      </section>
    </div> : null}
  </div>;
}

createRoot(document.getElementById('root')).render(<App />);
