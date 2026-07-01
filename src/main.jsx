import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  LayoutDashboard, Users, BriefcaseBusiness, ListChecks, Shapes, ArrowUpDown,
  Settings, Search, Bell, UserPlus, SlidersHorizontal, ChevronRight, CalendarDays,
  Check, LockKeyhole, Plus, X, Trash2, Upload, Download, Camera, FileText,
  Building2, Clock3, ShieldCheck, Pencil, MoreHorizontal, Menu
} from 'lucide-react';
import './styles.css';

const initialSteps = ['CV', 'Registerutdrag', 'Provpass', 'Checklista'];
const initialGroups = ['Örjanshuset', 'Skogshuset', 'Vikarier'];
const initialPeople = [
  { id: 1, name: 'Elin Berg', initials: 'EB', email: 'elin.berg@folk.se', phone: '070-182 31 40', group: 'Örjanshuset', role: 'Stödassistent', rate: 100, stage: 2, status: 'Rekrytering', start: '2026-08-18', las: '2027-02-18', color: '#d9e9e2' },
  { id: 2, name: 'Marcus Lind', initials: 'ML', email: 'marcus.lind@folk.se', phone: '072-881 15 02', group: 'Skogshuset', role: 'Boendestödjare', rate: 80, stage: 1, status: 'Rekrytering', start: '2026-09-01', las: '2027-03-01', color: '#e6e0d8' },
  { id: 3, name: 'Sara Ahmed', initials: 'SA', email: 'sara.ahmed@folk.se', phone: '073-491 44 88', group: 'Vikarier', role: 'Stödassistent', rate: 100, stage: 3, status: 'Rekrytering', start: '2026-07-15', las: '2027-01-15', color: '#e4dbe8' },
  { id: 4, name: 'Oskar Persson', initials: 'OP', email: 'oskar.persson@folk.se', phone: '070-390 22 17', group: 'Örjanshuset', role: 'Samordnare', rate: 100, stage: 4, status: 'Anställd', start: '2025-12-01', las: '2026-08-24', color: '#dae2ec' },
  { id: 5, name: 'Linnea Karlsson', initials: 'LK', email: 'linnea.karlsson@folk.se', phone: '076-228 18 19', group: 'Skogshuset', role: 'Stödassistent', rate: 75, stage: 4, status: 'Anställd', start: '2026-01-12', las: '2026-09-02', color: '#eee0d7' },
  { id: 6, name: 'Jonas Nilsson', initials: 'JN', email: 'jonas.nilsson@folk.se', phone: '070-225 91 02', group: 'Vikarier', role: 'Timvikarie', rate: 40, stage: 4, status: 'Anställd', start: '2026-03-10', las: '2026-09-15', color: '#dbe8df' },
];

const navItems = [
  ['Översikt', LayoutDashboard], ['Medarbetare', Users], ['Rekrytering', BriefcaseBusiness],
  ['Checklistor', ListChecks], ['Grupper', Shapes], ['Import & export', ArrowUpDown], ['Administration', Settings]
];

function Avatar({ person, large = false }) {
  return <div className={`avatar ${large ? 'avatar-lg' : ''}`} style={{ background: person.color }}>{person.initials}</div>;
}

function Progress({ person, steps, compact = false, onAdvance }) {
  return <div className={`progress ${compact ? 'compact' : ''}`} aria-label={`Rekryteringssteg för ${person.name}`}>
    {steps.map((step, index) => {
      const done = index < person.stage;
      const current = index === person.stage;
      const locked = index > person.stage;
      return <div className="step-wrap" key={step}>
        {index > 0 ? <span className={`step-line ${done ? 'done' : ''}`} /> : null}
        <button className={`step ${done ? 'done' : ''} ${current ? 'current' : ''}`} disabled={locked || done || !onAdvance} onClick={() => onAdvance?.(person.id)} title={locked ? 'Föregående steg måste slutföras först' : step}>
          {done ? <Check size={15}/> : locked ? <LockKeyhole size={12}/> : <span className="dot" />}
        </button>
        {!compact ? <small>{step}</small> : null}
      </div>;
    })}
  </div>;
}

function Modal({ title, children, onClose, wide = false }) {
  return <div className="modal-backdrop" onMouseDown={onClose}>
    <section className={`modal ${wide ? 'wide' : ''}`} onMouseDown={e => e.stopPropagation()} role="dialog" aria-modal="true">
      <header><h2>{title}</h2><button className="icon-btn" onClick={onClose} aria-label="Stäng"><X size={20}/></button></header>
      {children}
    </section>
  </div>;
}

function PersonForm({ groups, onSave, onClose }) {
  const submit = e => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    onSave({ ...data, rate: Number(data.rate), initials: data.name.split(' ').map(x => x[0]).slice(0,2).join('').toUpperCase(), stage: 0, status: 'Rekrytering', color: '#dce9e3' });
  };
  return <form className="form" onSubmit={submit}>
    <div className="photo-upload"><Camera size={22}/><span>Lägg till porträttbild</span><input type="file" accept="image/*" aria-label="Porträttbild" /></div>
    <label>Fullständigt namn<input name="name" required placeholder="Förnamn Efternamn" /></label>
    <div className="form-grid"><label>E-post<input type="email" name="email" required placeholder="namn@organisation.se" /></label><label>Telefon<input name="phone" required placeholder="070-000 00 00" /></label></div>
    <div className="form-grid"><label>Grupp<select name="group">{groups.map(g => <option key={g}>{g}</option>)}</select></label><label>Tjänstgöringsgrad<input name="rate" type="number" min="0" max="100" defaultValue="100" /></label></div>
    <label>Roll<input name="role" required placeholder="Stödassistent" /></label>
    <div className="form-actions"><button type="button" className="secondary" onClick={onClose}>Avbryt</button><button className="primary">Skapa kandidat</button></div>
  </form>;
}

function PageHeader({ title, subtitle, onAdd }) {
  return <div className="page-head"><div><h1>{title}</h1>{subtitle ? <p>{subtitle}</p> : null}</div>{onAdd ? <button className="primary" onClick={onAdd}><UserPlus size={18}/>Ny medarbetare</button> : null}</div>;
}

function Overview({ people, steps, setPeople, onOpen }) {
  const recruiting = people.filter(p => p.status === 'Rekrytering');
  const dates = people.filter(p => p.status === 'Anställd').slice(0,4);
  const advance = id => setPeople(prev => prev.map(p => p.id === id ? { ...p, stage: Math.min(p.stage + 1, steps.length) } : p));
  return <>
    <PageHeader title="Översikt" onAdd={onOpen}/>
    <div className="metrics">
      <div><Users/><span><b>{people.filter(p => p.status === 'Anställd').length}</b>Aktiva medarbetare</span></div>
      <div><BriefcaseBusiness/><span><b>{recruiting.length}</b>I rekrytering</span></div>
      <div className="urgent"><CalendarDays/><span><b>{dates.length}</b>LAS inom 60 dagar</span></div>
    </div>
    <div className="dashboard-grid">
      <section className="panel recruitment"><div className="panel-head"><h2>Pågående rekryteringar</h2><button className="secondary small"><SlidersHorizontal size={16}/>Filter</button></div>
        <div className="recruit-head"><span>Namn</span><span>Grupp</span><span>Nästa steg</span><span>Omfattning</span><span>Status</span></div>
        {recruiting.map(person => <div className="recruit-row" key={person.id}>
          <span className="person-cell"><Avatar person={person}/><span><b>{person.name}</b><small>{person.role}</small></span></span>
          <span>{person.group}</span><Progress person={person} steps={steps} onAdvance={advance}/><span>{person.rate} %</span><span className="status"><i/>Pågående<ChevronRight size={17}/></span>
        </div>)}
      </section>
      <aside className="panel deadlines"><div className="panel-head"><h2>Viktiga datum</h2></div>
        {dates.map((p, i) => <button className="deadline" key={p.id}><span className={i === dates.length - 1 ? 'red' : ''}/><div><b>{p.name}</b><small>{i < 2 ? 'Provanställning slutar' : 'LAS 60-dagarsgräns'}</small><em><CalendarDays size={14}/>{new Date(p.las).toLocaleDateString('sv-SE', {day:'numeric', month:'short', year:'numeric'})}</em></div><ChevronRight size={17}/></button>)}
      </aside>
    </div>
  </>;
}

function Employees({ people, query, setSelected }) {
  const rows = people.filter(p => p.status === 'Anställd' && `${p.name} ${p.group} ${p.role}`.toLowerCase().includes(query.toLowerCase()));
  return <><PageHeader title="Medarbetare" subtitle={`${rows.length} aktiva profiler`}/><section className="panel list-panel"><div className="panel-head"><h2>Alla medarbetare</h2><button className="secondary small"><SlidersHorizontal size={16}/>Filtrera</button></div>
    <div className="employee-head"><span>Medarbetare</span><span>Grupp</span><span>Tjänstgöringsgrad</span><span>LAS / tillsvidare</span><span/></div>
    {rows.map(p => <button className="employee-row" key={p.id} onClick={() => setSelected(p)}><span className="person-cell"><Avatar person={p}/><span><b>{p.name}</b><small>{p.role}</small></span></span><span>{p.group}</span><span>{p.rate} %</span><span>{new Date(p.las).toLocaleDateString('sv-SE')}</span><ChevronRight size={17}/></button>)}
  </section></>;
}

function Recruitment({ people, steps, setPeople, setSelected }) {
  const candidates = people.filter(p => p.status === 'Rekrytering');
  const advance = id => setPeople(prev => prev.map(p => p.id === id ? { ...p, stage: Math.min(p.stage + 1, steps.length) } : p));
  return <><PageHeader title="Rekrytering" subtitle="Varje steg låser upp nästa när det är godkänt"/><div className="candidate-list">
    {candidates.map(p => <section className="candidate" key={p.id}><button className="candidate-main" onClick={() => setSelected(p)}><Avatar person={p} large/><span><h3>{p.name}</h3><p>{p.role} · {p.group} · {p.rate} %</p></span></button><Progress person={p} steps={steps} onAdvance={advance}/><button className="secondary small" onClick={() => advance(p.id)} disabled={p.stage >= steps.length}><Check size={16}/>{p.stage >= steps.length ? 'Klar för anställning' : `Godkänn ${steps[p.stage]}`}</button></section>)}
  </div></>;
}

function ChecklistEditor({ steps, setSteps }) {
  const [newStep, setNewStep] = useState('');
  const add = e => { e.preventDefault(); if (newStep.trim()) { setSteps(s => [...s, newStep.trim()]); setNewStep(''); } };
  return <><PageHeader title="Checklistor" subtitle="Ordningen styr rekryteringsflödet"/><section className="panel settings-panel"><div className="panel-head"><div><h2>Anställningskrav</h2><p>Kandidaten kan inte gå vidare förrän föregående punkt är godkänd.</p></div></div>
    <div className="step-list">{steps.map((s,i) => <div key={`${s}-${i}`}><span className="drag"><MoreHorizontal/><b>{i+1}</b></span><span><strong>{s}</strong><small>{i === 0 ? 'Första obligatoriska steget' : `Låses upp efter ${steps[i-1]}`}</small></span><button className="icon-btn danger" onClick={() => setSteps(x => x.filter((_,j) => j !== i))} aria-label={`Ta bort ${s}`}><Trash2 size={17}/></button></div>)}</div>
    <form className="inline-add" onSubmit={add}><input value={newStep} onChange={e => setNewStep(e.target.value)} placeholder="Nytt steg, t.ex. Referenser"/><button className="primary"><Plus size={17}/>Lägg till steg</button></form>
  </section></>;
}

function Groups({ groups, setGroups, people }) {
  const [name, setName] = useState('');
  return <><PageHeader title="Grupper" subtitle="Sortera personer efter enhet, arbetsplats eller anställningsform"/><div className="group-grid">{groups.map(g => <section className="group" key={g}><Building2/><div><h3>{g}</h3><p>{people.filter(p => p.group === g).length} personer</p></div><button className="icon-btn danger" onClick={() => setGroups(x => x.filter(v => v !== g))}><Trash2 size={17}/></button></section>)}</div>
    <form className="inline-add group-add" onSubmit={e => {e.preventDefault(); if(name.trim()){setGroups(x => [...x,name.trim()]); setName('')}}}><input value={name} onChange={e => setName(e.target.value)} placeholder="Namn på ny grupp"/><button className="primary"><Plus size={17}/>Skapa grupp</button></form></>;
}

function ImportExport({ people }) {
  const exportCsv = () => {
    const header = 'Namn,E-post,Telefon,Grupp,Roll,Tjänstgöringsgrad';
    const body = people.map(p => [p.name,p.email,p.phone,p.group,p.role,p.rate].map(v => `"${v}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([`${header}\n${body}`], {type:'text/csv;charset=utf-8'}));
    const a = document.createElement('a'); a.href = url; a.download = 'kontaktuppgifter.csv'; a.click(); URL.revokeObjectURL(url);
  };
  return <><PageHeader title="Import & export" subtitle="Flytta kontaktuppgifter med CSV"/><div className="transfer-grid"><section className="transfer"><Upload/><h2>Importera kontakter</h2><p>Ladda upp en CSV-fil med namn, e-post, telefon och grupp.</p><label className="secondary file-button">Välj CSV-fil<input type="file" accept=".csv"/></label></section><section className="transfer"><Download/><h2>Exportera kontakter</h2><p>Hämta aktuella kontaktuppgifter för alla profiler.</p><button className="primary" onClick={exportCsv}>Exportera {people.length} personer</button></section></div></>;
}

function Admin({ people, steps, groups }) {
  return <><PageHeader title="Administration" subtitle="Systemets inställningar och behörigheter"/><div className="admin-list"><section><ShieldCheck/><div><h3>Behörigheter</h3><p>HR-ansvariga kan se allt. Administratörer kan också ändra struktur och inställningar.</p></div><button className="secondary small"><Pencil size={15}/>Hantera</button></section><section><ListChecks/><div><h3>Rekryteringsflöde</h3><p>{steps.length} obligatoriska steg är aktiva.</p></div><span className="tag">Aktivt</span></section><section><Shapes/><div><h3>Organisation</h3><p>{groups.length} grupper och {people.length} profiler.</p></div><span className="tag">Synkroniserat</span></section></div></>;
}

function PersonDetail({ person, steps, onClose }) {
  return <Modal title="Medarbetarprofil" onClose={onClose} wide><div className="profile-head"><Avatar person={person} large/><div><h2>{person.name}</h2><p>{person.role} · {person.group}</p></div><button className="secondary small"><Pencil size={15}/>Redigera</button></div><div className="profile-grid"><div><label>E-post</label><b>{person.email}</b></div><div><label>Telefon</label><b>{person.phone}</b></div><div><label>Tjänstgöringsgrad</label><b>{person.rate} %</b></div><div><label>LAS / tillsvidare</label><b>{new Date(person.las).toLocaleDateString('sv-SE')}</b></div></div><div className="document-box"><div><FileText/><span><b>Dokument</b><small>CV, avtal och registerutdrag</small></span></div><label className="secondary file-button"><Upload size={16}/>Ladda upp fil<input type="file" multiple /></label></div>{person.status === 'Rekrytering' ? <div className="profile-progress"><h3>Rekryteringsstatus</h3><Progress person={person} steps={steps}/></div> : null}</Modal>;
}

function App() {
  const [active, setActive] = useState('Översikt');
  const [people, setPeople] = useState(initialPeople);
  const [steps, setSteps] = useState(initialSteps);
  const [groups, setGroups] = useState(initialGroups);
  const [query, setQuery] = useState('');
  const [newPerson, setNewPerson] = useState(false);
  const [selected, setSelected] = useState(null);
  const [menu, setMenu] = useState(false);
  const page = useMemo(() => {
    const common = { people, steps, setPeople, setSelected };
    if (active === 'Översikt') return <Overview {...common} onOpen={() => setNewPerson(true)}/>;
    if (active === 'Medarbetare') return <Employees people={people} query={query} setSelected={setSelected}/>;
    if (active === 'Rekrytering') return <Recruitment {...common}/>;
    if (active === 'Checklistor') return <ChecklistEditor steps={steps} setSteps={setSteps}/>;
    if (active === 'Grupper') return <Groups groups={groups} setGroups={setGroups} people={people}/>;
    if (active === 'Import & export') return <ImportExport people={people}/>;
    return <Admin people={people} steps={steps} groups={groups}/>;
  }, [active, people, steps, groups, query]);
  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'open' : ''}`}><div className="brand">Folk<span>.</span></div><nav>{navItems.map(([label,Icon]) => <button key={label} className={active === label ? 'active' : ''} onClick={() => {setActive(label);setMenu(false)}}><Icon size={20}/><span>{label}</span></button>)}</nav><div className="sidebar-foot"><div className="mini-avatar">KA</div><span><b>Karin Andersson</b><small>Administratör</small></span></div></aside>
    <div className="main-wrap"><header className="topbar"><button className="mobile-menu" aria-label="Öppna meny" onClick={() => setMenu(!menu)}><Menu/></button><div className="search"><Search size={18}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Sök medarbetare, grupp eller rekrytering"/></div><button className="icon-btn" aria-label="Notiser"><Bell size={20}/></button><button className="user"><span>KA</span><b>Karin Andersson</b></button></header><main>{page}</main></div>
    {newPerson ? <Modal title="Ny medarbetare" onClose={() => setNewPerson(false)}><PersonForm groups={groups} onClose={() => setNewPerson(false)} onSave={p => { setPeople(x => [...x,{...p,id:Date.now()}]); setNewPerson(false); setActive('Rekrytering'); }}/></Modal> : null}
    {selected ? <PersonDetail person={selected} steps={steps} onClose={() => setSelected(null)}/> : null}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
