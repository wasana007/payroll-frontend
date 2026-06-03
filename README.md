# payroll-frontend

Payroll Reporting React-frontend for et hendelsesdrevet lønnsrapporteringssystem med Kafka-basert asynkron behandling,
correlationId-sporing og automatisk feildiagnostikk via LogSenseAI.
Kommuniserer med en Java Spring Boot/Kafka-backend for å sende lønnsdata, spore behandling og hente resultater asynkront.

 
## 🎥 Demo

### 🎬 Payroll - Klikk på bildet nedenfor for å se hele demoen på YouTube ▶️
[![Payroll Demo](https://img.youtube.com/vi/gF_LzKdxD3g/maxresdefault.jpg)](https://youtu.be/gF_LzKdxD3g)


## Oversikt

React-applikasjon som lar HR-team rapportere lønn til
🔗 [Backend (Java Spring Boot + Kafka)](https://github.com/wasana007/payroll-backend)
og motta skatteberegningsresultater asynkront via polling.
Ved feil sendes log events automatisk til LogSenseAI for AI-basert rotårsaksanalyse.

## Funksjoner

- Lønnsrapporteringsskjema med Employee ID, Salary og interaktiv måneds-/årsvelger
- Send lønnsdata til backend via POST
- Sanntids statusvisning: `PENDING` → `COMPLETED` / `FAILED`
- Polling mot `GET /api/v1/payroll/{correlationId}`
- Animert progress bar under behandling
- Viser `correlationId` for sporing
- Ved feil: direktelenke til LogSenseAI for AI-analyse
- Historikktabell med alle innsendte rapporter i sesjonen

## Teknologi

| Teknologi | Versjon |
|---|---|
| React | 18+ |
| Vite | 5+ |

## Kom i gang

**Forutsetninger:** Node.js 18+ og
🔗 [Backend (Java Spring Boot + Kafka)](https://github.com/wasana007/payroll-backend)
kjørende på `http://localhost:8282`

```bash
npm install
npm run dev
```

Åpnes på `http://localhost:3001`

## Konfigurasjon

Konfigureres i `src/config.js`:

| Variabel | Standard | Beskrivelse |
|---|---|---|
| `API_BASE_URL` | `http://localhost:8282` | Payroll backend |
| `API_URL` | `http://localhost:8282/api/v1/payroll` | Payroll endpoint |
| `LOGSENSE_URL` | `http://localhost:3000` | LogSenseAI dashboard |
| `POLL_INTERVAL` | `1500` | Polling-intervall i ms |
| `POLL_MAX` | `20` | Maks polling-forsøk (~30 sek) |

## Relasjon til backend og LogSenseAI

```
payroll-frontend (port 3001)
      │
      │  POST /api/v1/payroll          → send lønnsrapport
      │  GET  /api/v1/payroll/{id}     → poll resultat
      ▼
payroll-backend (port 8282)
      │
      │  ved feil → Kafka topic: payroll-log-events
      ▼
logsense-ai-backend (port 8080)
      │
      │  AI analyserer rotårsak automatisk
      ▼
logsense-ai-frontend (port 3000)  ← "View analysis →"
```

## Statusflyt

```
PENDING   → Behandles asynkront via Kafka
COMPLETED → Skatteberegning fullført, resultat vises
FAILED    → Feil oppstod, LogSenseAI-knapp vises
```

## Prosjektstruktur

```
src/
├── main.tsx                  # Inngangspunkt
├── App.tsx                   # Hovedkomponent, global state, polling-logikk
├── App.css                   # Styling
├── config.ts                 # Alle konfigurasjonskonstanter
├── vite-env.d.ts             # Vite type declarations
├── types/
│   └── payroll.ts            # Delte domenetyper (Status, PayrollResult, HistoryItem)
├── utils/
│   └── formatTid.ts          # Formaterer tidspunkt til norsk datostreng
└── components/
    ├── PayrollForm.tsx       # Skjema: Ansatt-ID, Lønn, Måned
    ├── StatusCard.tsx        # PENDING / COMPLETED / FAILED + resultvisning
    └── HistoryTable.tsx      # Historikktabell over innsendte rapporter
```

## Scripts

```bash
npm run dev     # Start utviklingsserver på localhost:3001
npm run build   # Bygg for produksjon
npm run preview # Forhåndsvis produksjonsbygg
```