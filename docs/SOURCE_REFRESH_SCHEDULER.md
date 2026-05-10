# MajlisAlpha Source Refresh Scheduler

Source Refresh Scheduler keeps MajlisAlpha honest about source freshness. It turns official UAE source monitoring into an operating cadence so stale evidence becomes assigned work instead of quietly leaking into answers.

## Purpose

The scheduler answers five operational questions:

1. Which official route needs checking?
2. How often should it be refreshed?
3. Who owns the refresh?
4. Which answers or exports depend on it?
5. Where does it escalate when it is stale, blocked, or material?

The rule is simple: no current source, no current claim.

## Source Cadences

- Daily: ADX disclosures, DFM disclosures, and Nasdaq Dubai CANDI notices.
- Weekly: SCA public notices and priority issuer investor-relations pages.
- Monthly: source-pack completeness, stale citations, synthetic records waiting for REAL replacement, and pilot-demanded coverage gaps.

Daily routes focus on results, board decisions, dividends, trading status, corporate actions, issuer announcements, sukuk or bond updates, and other market-sensitive notices.

Weekly routes focus on regulatory notices, annual reports, quarterly presentations, earnings calls, ownership updates, sustainability reports, and issuer obligation changes.

Monthly reviews check whether the product is carrying stale citations, missing official URLs, weak source labels, or synthetic records that should be replaced before expansion.

## Refresh Statuses

- `due`: the source is inside the work queue and has not been refreshed yet.
- `fresh`: the source was checked inside its freshness window.
- `stale`: the source is past its allowed window.
- `blocked`: the source could not be verified, opened, or linked.
- `escalated`: the source is now owned by a mission, alert, intake, quality, or compliance workflow.
- `reviewed`: the refresh was checked by the right reviewer and can support answers.

## Required Fields

Every refresh record should capture source route, official URL, issuer, ticker, document type, last checked timestamp, freshness status, owner, reviewer status, affected answers, and next action.

These fields make freshness auditable. They also allow the desk to show when an answer is current, when it is only source-backed historically, and when it should be blocked from export.

## Escalation

- If a daily route is older than 24 hours, create a Disclosure Alert Watchtower item and block current-event wording until refreshed.
- If a priority issuer IR route is older than seven days, assign the coverage owner and flag affected answers in Answer Quality Lab.
- If the official URL is missing or unreachable, route it to Source Intake Doctor and keep the source in synthetic or needs-review status.
- If a refresh changes a material claim, open Claim Trace Inspector before export.
- If stale evidence blocks a customer-facing brief, escalate to Compliance Audit Center and mark the export not share-ready.

## Launch Gate

Source Refresh Scheduler is pilot-ready when priority routes have owners, freshness windows, last-checked timestamps, official URLs, and escalation paths.

It is not ready when any pilot-critical answer depends on a stale, blocked, unreviewed, or unlinked source route.

