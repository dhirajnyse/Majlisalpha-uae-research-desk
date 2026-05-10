# MajlisAlpha AED Scenario Lab

AED Scenario Lab turns UAE evidence into auditable valuation cases. It connects disclosures, macro drivers, ownership signals, corporate actions, peer context, and answer-quality checks into base, upside, downside, rate-shock, and corporate-action-adjusted scenarios.

## Purpose

The desk should never treat valuation as a free-floating number. Every scenario needs assumption provenance: where the assumption came from, when it was observed, which source supports it, how sensitive it is, and who reviewed it.

The lab records each scenario as an auditable item:

- scenario ID
- ticker
- scenario type
- assumption name and value
- sensitivity range
- source route
- official URL
- evidence date
- affected metrics
- affected briefs
- owner
- reviewer status
- unresolved gaps
- next action

## Scenario Types

- Base case: revenue growth, margin path, cash conversion, discount rate, terminal multiple, and dividend policy.
- Rate shock: deposit cost, loan growth, mortgage demand, cap rate, refinancing cost, and discount-rate spread.
- Upside case: volume growth, pricing power, project pipeline, capital return, ownership catalyst, and margin expansion.
- Downside case: margin compression, funding stress, execution delay, liquidity weakness, governance risk, and stale evidence.
- Corporate action adjustment: share count, dividends, rights issue dilution, buybacks, capital changes, and effective date.

## Workflow

1. Select ticker and scenario type.
2. Pull evidence from disclosures, macro, ownership, corporate action, and peer modules.
3. Record each material assumption with source URL and evidence date.
4. Run sensitivity range and affected metric mapping.
5. Route weak assumptions to Claim Trace Inspector, Answer Quality Lab, Portfolio Risk Radar, or Compliance Audit Center.
6. Mark the scenario export-ready only after reviewer approval.

## Escalation Rules

- Missing official URL or evidence date routes back to Source Refresh Scheduler.
- Valuation range or committee-language changes go to Answer Quality Lab and Claim Trace Inspector.
- Scenarios depending on corporate actions, ownership changes, or macro drivers must link back to those trackers before export.
- Anything that could sound like investment advice goes to Compliance Audit Center and remains not share-ready.

## Launch Gate

AED Scenario Lab is pilot-ready when every exported scenario has ticker, scenario type, assumption provenance, official URL, evidence date, sensitivity range, affected metrics, owner, reviewer status, and unresolved gaps.

It is not ready when a material assumption is unsourced, stale, unreviewed, missing sensitivity range, or disconnected from the evidence modules.

