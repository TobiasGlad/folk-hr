# Aktuellt arbete for Codex

Projekt: Folk HR
Repo: /srv/web-projects/folk-hr
GitHub: https://github.com/TobiasGlad/folk-hr
Branch: main

## Senaste arbetslage

Senast uppdaterad: 2026-07-14

Vi arbetar med Folk HR, framfor allt rekryteringsflodet, medarbetarprofiler och dokumenthantering.

Senaste pushade commit:

- 5669127 Improve recruitment and document workflow

Det som nyligen gjorts:

- Kandidater kan flyttas vidare utan att ladda upp ovrig fil.
- Knappen heter `Flytta till Medarbetare` i stallet for `Anstall`.
- Dubbel `Avsluta`-knapp ar borttagen nar `Avsla kandidat` fyller samma funktion.
- Checklistans kryssruta ligger under enheterna.
- Information fran rekryteringsprocessen sparas in i motsvarande falt pa medarbetarprofilen.
- Medarbetarprofil visar vem som skapat profilen, bade vid rekrytering och via `Lagg till medarbetare`.
- Dokumentstatus visar `Finns` eller `Finns ej`.
- `Tystnadsplikt` och `Checklista` har egna dokumentrutor.
- `Ovriga dokument` ligger sist och ar enda icke-obligatoriska dokumentrutan.
- Texten `Filbox` ar borttagen och dokumenttitlar visas utan fetstil.
- Efter 10 minuters passivitet visas en fraga om anvandaren vill fortsatta vara inloggad eller logga ut.

## Starta efter crash eller omstart

Snabbstart for alla Folk-tjanster:

```bash
cd /srv/web-projects/folk-hr
scripts/folk-restart.sh
scripts/folk-status.sh
```

Frontend/Vite kor normalt pa:

- http://localhost:5173

Backend/API kor lokalt pa:

- http://localhost:8020

Backend serverar inte frontend-HTML som standard. Appen ska oppnas via frontendporten `5173`; port `8020` ar bara for API.

Loggar finns lokalt i:

- work/runtime/logs/backend.log
- work/runtime/logs/frontend.log

Pid-filer finns lokalt i:

- work/runtime/pids/backend.pid
- work/runtime/pids/frontend.pid

## Verifiering innan push

```bash
cd /srv/web-projects/folk-hr
npm run build
node --check server/server.js
git diff --check
git status --short --branch
```

## Automatisk systemstart

Servicefiler finns under `scripts/systemd/` och kan installeras med:

```bash
cd /srv/web-projects/folk-hr
scripts/install-systemd-user-services.sh
```

Det installerar och startar:

- folk-hr-backend.service
- folk-hr-frontend.service

Om tjansterna inte startar efter en hel datoromstart kan anvandar-linger behova slas pa en gang av en sudo-anvandare:

```bash
sudo loginctl enable-linger tobias
```

## Codex efter crash

En Codex-session kan inte aterstarta samma chatt av sig sjalv efter en datorcrash. Starta en ny Codex-session och be den lasa denna fil for lage och fortsatta arbetet:

```text
Las /srv/web-projects/folk-hr/CODEX_WORKSTATE.md och fortsatt med Folk.
```
