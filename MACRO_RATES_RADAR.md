# MajlisAlpha Disclosure Alert Watchtower

Disclosure Alert Watchtower converts UAE market notices into assigned research actions. It is the operating layer between official sources and the rest of the MajlisAlpha workflow.

## Purpose

ADX, DFM, Nasdaq Dubai CANDI, SCA, and issuer IR pages can all produce material research events. The watchtower gives each alert a route, event type, owner, priority, SLA, and next workflow step.

## Source Routes

Start with four official routes:

- ADX disclosures.
- DFM market disclosures.
- Nasdaq Dubai CANDI.
- SCA and issuer investor-relations pages.

An alert without an official route should stay watch-only or source-blocked.

## Alert Types

The first alert set covers:

- Results releases.
- Dividend or distribution changes.
- Board meetings and AGM items.
- Ownership or related-party updates.
- Capital actions and trading-status items.

Each alert type should route to the right workflow. A results release should move through Source Intake Doctor, Claim Trace Inspector, and Peer Benchmark Matrix. A capital action may need Portfolio Risk Radar and Decision Journal immediately.

## Required Triage Fields

Each actionable alert needs:

- Official URL.
- Source route.
- Issuer and ticker.
- Event type.
- Source timestamp.
- Priority.
- Owner.
- SLA.
- Next workflow step.
- Review status.

## Launch Gate

The watchtower is pilot-ready when priority alerts have official URLs, owners, SLA, next workflow step, and review status. If the source route is missing, the item should not become an actionable research task.
