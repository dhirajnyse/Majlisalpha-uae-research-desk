# MajlisAlpha Analyst Mission Control

Analyst Mission Control is the operating queue for MajlisAlpha. It turns alerts, source gaps, claim issues, peer checks, portfolio risks, and pilot customer requests into owned work.

## Why It Exists

The product now has many strong research layers. Without a central queue, important work can get lost between source intake, claim review, portfolio triage, and customer pilots. Mission Control gives each task an owner, lane, priority, due window, source state, reviewer state, and next action.

## Workflow Lanes

Start with five lanes:

- Source intake.
- Claim trace.
- Peer and portfolio review.
- Pilot customer work.
- Publish readiness.

Each lane has a completion signal. A source task is not done until URL, issuer, period, date, text, and source label are verified. A publish task is not done until sources, claims, memo status, and decision record agree.

## Priority Rules

Use four priorities:

- Urgent: two-hour SLA for trading status, capital action, material dividend change, or high-impact source correction.
- High: eight-hour SLA for results releases, ownership updates, claim-blocking gaps, or pilot customer requests.
- Normal: 24-hour SLA for routine source refresh, peer updates, catalyst watch items, or memo polish.
- Blocked: no SLA until the missing source, owner, or reviewer issue is resolved.

## Required Task Fields

Each active task needs:

- Task ID.
- Workflow lane.
- Ticker.
- Source route.
- Priority.
- Owner.
- Due window.
- Source state.
- Reviewer state.
- Next action.
- Publish readiness.

## Launch Gate

Mission Control is pilot-ready when every high-priority alert, claim gap, and portfolio risk has owner, SLA, next action, and review status. If owner, source state, or next action is missing, the task cannot be marked ready-to-publish.
