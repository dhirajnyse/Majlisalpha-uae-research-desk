# MajlisAlpha

Evidence-backed UAE market research for investors who want cited answers instead of headline summaries. MajlisAlpha lets users ask complex questions across annual reports, ADX/DFM disclosures, Nasdaq Dubai CANDI records, earnings-call notes, ownership updates, and AED valuation scenarios.

## Product positioning

Name: MajlisAlpha

Tagline: Ask UAE disclosures. See the signal.

Audience: UAE retail investors, GCC family offices, active market participants, and finance professionals who want a repeatable research workflow for ADX, DFM, and Nasdaq Dubai issuers.

Brand feel: premium UAE boardroom, source-first research, emerald glass, warm gold, sand-stone neutrals, and precise institutional typography.

Suggested SaaS packaging:

- Starter: AED 79/month for saved briefs and limited imports.
- Pro: AED 199/month for broader coverage and scenario exports.
- Desk: AED 399/month for alerts, watchlists, review logs, and repeatable coverage workflows.

## What is included

- Client-side retrieval over a synthetic UAE-market disclosure corpus.
- Starter watchlist: IHC, FAB, ADNOCGAS, ALDAR, EAND, EMAAR, DEWA, DIB, ENBD, and AIRARABIA.
- Source-ranked answers with citation cards, confidence scoring, and management-tone read-throughs.
- Risk questions return exactly three cited risk factors with severity labels.
- UAE-style ticker aliases such as $FAB, $EMAAR, $ADNOCGAS, $ALDAR, and $DEWA.
- Company filters, document toggles, text/file import, saved briefs, copy-to-clipboard, Markdown export, and PDF export.
- Company dossier with KPI summary, document timeline, source mix, risk checklist, and one-click research questions.
- Source Pack Studio for building verified source records in the browser and exporting source-pack JSON.
- Official-source helper links for ADX, DFM, Nasdaq Dubai CANDI, SCA, and company IR pages.
- UAE Source Playbook section with direct official-source routes and REAL-evidence rules.
- Pilot Command Center with a seven-day plan for making FAB, EMAAR, and ADNOCGAS review-ready.
- Revenue Pilot Console for testing 10 pilot users, 50 real questions, paid intent, and launch readiness.
- UAE Catalyst Calendar for tracking source-backed earnings windows, board decisions, dividends, ownership updates, and macro read-throughs.
- Peer Benchmark Matrix for comparing UAE banks, property names, energy/utilities, and platform issuers with cited source logic.
- Coverage Command Center, Evidence-to-Brief Workbench, Memo Review Room, Decision Journal, Source Intake Doctor, and Launch Control Room.
- AED valuation lens with revenue growth, FCF margin, terminal multiple, and discount-rate sensitivities.
- A 3D-style SVG brand mark in assets/majlisalpha-logo.svg plus social preview artwork.

## Open the app

Open the deployed GitHub Pages URL. Because the app loads JSON from the data folder, local file:// opening may be blocked by browser fetch rules. For local testing, use any small static web server from the project root.

## Data architecture

The application shell is in index.html, styles.css, launch.css, and app.js. The research universe lives in data/:

- data/companies.json: UAE companies, model assumptions, thesis text, and risk-factor templates.
- data/documents.json: Starter synthetic source sections used by retrieval.
- data/questions.json: Left-rail question templates.
- data/watchlists.json: Watchlist definitions and ticker aliases.
- data/source-pack-template.json: Copyable template for adding real annual reports, results summaries, ownership extracts, and ADX/DFM/Nasdaq Dubai disclosures.
- data/official-sources.json: Official UAE source index for ADX, DFM, Nasdaq Dubai CANDI, SCA, and company IR workflows.
- data/pilot-sprint.json: Seven-day pilot sprint plan and launch gate.
- data/pilot-revenue.json: Revenue pilot targets, ICPs, demo script, pricing hypotheses, conversion signals, and scale gate.
- data/catalyst-calendar.json: UAE catalyst watch streams, source policy, required fields, and calendar readiness gate.
- data/peer-benchmark.json: UAE peer groups, benchmark metrics, source routes, matrix gate, and starter outputs.

## Operating playbooks

- docs/UAE_SOURCE_PLAYBOOK.md: first source-collection sprint and REAL-evidence rules.
- docs/PILOT_COMMAND_CENTER.md: operational sprint plan for the first three UAE issuers.
- docs/PILOT_REVENUE_PLAYBOOK.md: 14-day pilot plan for validating users, source usage, and paid intent.
- docs/CATALYST_CALENDAR.md: source-first operating workflow for monitoring UAE market catalysts.
- docs/PEER_BENCHMARK_MATRIX.md: source-first peer comparison workflow and launch gate.
- docs/GITHUB_PAGES_DEPLOYMENT.md: GitHub Pages upload, settings, and smoke-test checklist.

## Quality checks

Run these before uploading a release ZIP or pushing to GitHub Pages:

```bash
node --check app.js
node scripts/static-check.mjs
```

## Important note

The bundled companies use real UAE listed-company tickers, but the starter disclosures and fundamentals are synthetic so the prototype is safe to evaluate. Import real annual reports, exchange disclosures, earnings-call transcripts, ownership updates, rating notes, or model notes before using the workflow for live research. MajlisAlpha is research software, not investment advice. The valuation panel is a scenario lens, not a price target.
