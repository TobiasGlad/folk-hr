# Folk HR

En modulär, lokal HR-prototyp byggd med React och Vite.

## Starta

Installera beroenden om det behövs:

```powershell
npm install
```

Starta backend med SQLite-databas:

```powershell
npm run server
```

Starta Vite i en annan terminal:

```powershell
npm run dev
```

Öppna sedan adressen som visas i Vite-terminalen. Frontend kör normalt på `http://localhost:5173`. Backend/API kör lokalt på `http://localhost:8020` och databasen skapas i `data/folk.db`. Backend serverar inte frontend-HTML som standard, så appen ska öppnas via frontendporten `5173`. Port `8020` är bara API.

## Ingår i prototypen

- Översikt för HR och administrationsnavigering
- Medarbetarprofiler med kontaktuppgifter, tjänstgöringsgrad, LAS-datum och filuppladdning
- Rekryteringsflöde där nästa steg är låst tills föregående steg godkänts
- Redigerbara checklistesteg och definierbara grupper
- CSV-export och gränssnitt för CSV-import
- Responsiv dator- och mobilvy

Data sparas i en lokal SQLite-databas via Node-backend. För produktion behövs fortfarande härdade lösenord, serverstyrda sessioner, behörighetskontroller per API-anrop, säker fillagring och juridiskt verifierade LAS-beräkningar.
