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
- Portfolio Risk Radar for triaging UAE watchlists by concentration, catalyst pressure, evidence freshness, and next analyst action.
- Claim Trace Inspector for auditing brief claims against source snippets, official URLs, reviewer status, and unresolved evidence gaps.
- Disclosure Alert Watchtower for routing ADX, DFM, Nasdaq Dubai CANDI, SCA, and issuer IR updates into assigned research actions.
- Analyst Mission Control for converting alerts, claim gaps, portfolio risks, peer checks, and pilot requests into owner-assigned tasks.
- Answer Quality Lab for scoring source coverage, claim trace, UAE specificity, valuation logic, user value, and review readiness before export.
- Customer Signal Room for turning real pilot questions, objections, repeat usage, paid intent, and coverage requests into product decisions.
- Pilot Session Command Center for logging demo users, real questions, source blockers, trust objections, paid intent, and follow-up actions.
- Pilot Follow-Up Board for converting demo notes into account stages, priorities, offer lanes, blockers, next dates, and conversion actions.
- Pilot Outreach Composer for drafting WhatsApp, email, LinkedIn, and call-script follow-ups from the live pilot pipeline.
- Pilot Conversion Pipeline for tracking replies, close probability, expected AED MRR, pricing tier, blockers, and next close action.
- Pilot KPI Board for tracking activation, source readiness, answer quality, repeat usage, paid intent, trust friction, and scale readiness.
- Compliance Audit Center for keeping exports source-backed, non-advisory, reviewable, and audit-ready.
- Source Refresh Scheduler for assigning official source refresh cadence, freshness windows, owners, and stale-evidence escalation.
- Corporate Action Tracker for dividends, board decisions, AGMs, rights issues, capital changes, and trading status events.
- Ownership Pulse Monitor for major holders, government-linked ownership, free float, foreign-ownership room, insider moves, and strategic stake changes.
- Macro & Rates Radar for rates, oil, AED/USD peg context, real estate liquidity, bank funding, inflation, and government-spending read-throughs.
- AED Scenario Lab for base, upside, downside, rate-shock, and corporate-action-adjusted valuation cases.
- Committee Pack Builder for turning source-backed briefs, scenarios, risk registers, and review status into committee-ready packets.
- Coverage Command Center, Evidence-to-Brief Workbench, Memo Review Room, Decision Journal, Source Intake Doctor, Pilot Session Command Center, Pilot Follow-Up Board, Pilot Outreach Composer, Pilot Conversion Pipeline, Launch Control Room, and Pages Deployment Doctor.
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
- data/portfolio-risk-radar.json: portfolio exposure buckets, risk signals, next actions, and radar launch gate.
- data/claim-trace-inspector.json: claim types, trace statuses, review workflow, and export readiness gate.
- data/disclosure-alert-watchtower.json: official source routes, alert types, SLA rules, triage fields, and review statuses.
- data/analyst-mission-control.json: workflow lanes, task priorities, statuses, required fields, and publish-readiness gate.
- data/answer-quality-lab.json: answer score bands, evaluation dimensions, failure reasons, and export quality gate.
- data/customer-signal-room.json: pilot signal types, required fields, decision rules, metrics, and roadmap gate.
- data/pilot-kpi-board.json: pilot health bands, KPI targets, scale gates, and review cadence.
- data/compliance-audit-center.json: control areas, audit events, required export fields, and compliance launch gate.
- data/source-refresh-scheduler.json: source cadences, refresh statuses, escalation rules, required fields, and freshness gate.
- data/corporate-action-tracker.json: UAE corporate action event types, statuses, required fields, workflow, escalation rules, and launch gate.
- data/ownership-pulse-monitor.json: ownership signal types, required fields, workflow, escalation rules, statuses, and launch gate.
- data/macro-rates-radar.json: macro driver types, affected sectors, required fields, workflow, escalation rules, statuses, and launch gate.
- data/aed-scenario-lab.json: scenario types, assumptions, required fields, workflow, escalation rules, statuses, and export gate.
- data/committee-pack-builder.json: committee pack sections, statuses, required fields, workflow, escalation rules, and launch gate.

## Operating playbooks

- docs/UAE_SOURCE_PLAYBOOK.md: first source-collection sprint and REAL-evidence rules.
- docs/PILOT_COMMAND_CENTER.md: operational sprint plan for the first three UAE issuers.
- docs/PILOT_REVENUE_PLAYBOOK.md: 14-day pilot plan for validating users, source usage, and paid intent.
- docs/CATALYST_CALENDAR.md: source-first operating workflow for monitoring UAE market catalysts.
- docs/PEER_BENCHMARK_MATRIX.md: source-first peer comparison workflow and launch gate.
- docs/PORTFOLIO_RISK_RADAR.md: portfolio triage workflow for concentration, catalysts, evidence freshness, and action tracking.
- docs/CLAIM_TRACE_INSPECTOR.md: claim-level audit workflow for supported, inferred, source-blocked, and rejected claims.
- docs/DISCLOSURE_ALERT_WATCHTOWER.md: official-disclosure alert routing workflow for source-first research actions.
- docs/ANALYST_MISSION_CONTROL.md: operating queue for owned analyst tasks, priorities, lanes, and publish readiness.
- docs/ANSWER_QUALITY_LAB.md: repeatable answer-evaluation rubric and publish-readiness quality gate.
- docs/CUSTOMER_SIGNAL_ROOM.md: pilot feedback workflow for demand, objections, paid intent, and roadmap decisions.
- docs/PILOT_KPI_BOARD.md: founder/operator KPI view for deciding whether to scale the UAE pilot.
- docs/COMPLIANCE_AUDIT_CENTER.md: non-advisory, source-provenance, review, and export-control workflow.
- docs/SOURCE_REFRESH_SCHEDULER.md: official-source freshness workflow and stale-evidence escalation rules.
- docs/CORPORATE_ACTION_TRACKER.md: dividend, board, AGM, capital-action, and trading-status workflow.
- docs/OWNERSHIP_PULSE_MONITOR.md: major-holder, foreign-room, free-float, insider, and strategic-stake workflow.
- docs/MACRO_RATES_RADAR.md: rates, oil, AED/USD peg, real estate liquidity, funding, inflation, and sector read-through workflow.
- docs/AED_SCENARIO_LAB.md: source-backed base, upside, downside, rate-shock, and corporate-action valuation workflow.
- docs/COMMITTEE_PACK_BUILDER.md: review-ready decision packet workflow for thesis, evidence, scenarios, risks, and controls.
- docs/GITHUB_PAGES_DEPLOYMENT.md: GitHub Pages upload, settings, and smoke-test checklist.

## Quality checks

Run these before uploading a release ZIP or pushing to GitHub Pages:

```bash
node --check app.js
node scripts/static-check.mjs
```

## Important note

The bundled companies use real UAE listed-company tickers, but the starter disclosures and fundamentals are synthetic so the prototype is safe to evaluate. Import real annual reports, exchange disclosures, earnings-call transcripts, ownership updates, rating notes, or model notes before using the workflow for live research. MajlisAlpha is research software, not investment advice. The valuation panel is a scenario lens, not a price target.
