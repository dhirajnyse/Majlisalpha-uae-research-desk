# MajlisAlpha Committee Pack Builder

Committee Pack Builder turns UAE research into a review-ready decision packet. It combines the desk's thesis, sources, scenarios, risks, quality checks, and compliance controls into one auditable package.

## Purpose

A strong research product needs more than a good answer. It needs a packet that a serious user can review, challenge, and archive. The committee pack makes every material claim visible with source path, evidence date, scenario assumptions, risk register, reviewer status, and non-advisory framing.

The pack records:

- pack ID
- ticker
- user question
- brief ID
- source list
- scenario list
- risk register
- claim trace status
- answer quality score
- reviewer status
- non-advisory disclaimer
- unresolved gaps
- export timestamp
- next action

## Pack Sections

- Decision narrative: question, thesis, why now, decision use, and non-advisory framing.
- Evidence appendix: claims, official URLs, source dates, source status, refresh status, and snippets.
- Scenario table: base, upside, downside, rate-shock, corporate-action adjustment, sensitivity ranges, and assumption provenance.
- Risk register: severity, source status, mitigation, unresolved gaps, macro pressure, ownership risk, and corporate-action issues.
- Review and export controls: reviewer, decision, quality score, disclaimer status, export timestamp, and share-ready status.

## Workflow

1. Select brief, ticker, and committee question.
2. Pull source-backed claims and official URLs.
3. Attach AED scenarios and sensitivity ranges.
4. Attach risk register, macro drivers, ownership signals, and corporate actions.
5. Run answer quality and compliance checks.
6. Mark the pack committee-ready only after reviewer approval.

## Escalation Rules

- Source-blocked or stale evidence routes to Source Refresh Scheduler and keeps the pack blocked.
- Unreviewed scenario assumptions route to AED Scenario Lab and Answer Quality Lab.
- Missing risk gaps route to Portfolio Risk Radar and Claim Trace Inspector.
- Advisory-sounding language routes to Compliance Audit Center and requires non-advisory rewrite.

## Launch Gate

Committee Pack Builder is pilot-ready when each pack has source list, scenario table, risk register, claim trace status, quality score, reviewer status, disclaimer, unresolved gaps, and export timestamp.

It is not ready when any material claim, assumption, risk, or scenario lacks source provenance or reviewer status.

