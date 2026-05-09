# Pilot Conversion Pipeline

The Pilot Conversion Pipeline turns outreach replies into a measurable launch board. It completes the pilot loop after session logging, follow-up capture, and outreach drafting by showing which accounts are moving toward paid use and which blockers still need work.

## Inputs

Each conversion record captures:

- Account or user.
- Stage, from new reply through interested, source review, proposal, paid pilot, won, or lost.
- Plan lane, including discovery, AED 199 pilot, AED 399 desk, or team invoice.
- Close probability and expected AED monthly recurring revenue.
- Next date, reply type, blocker, close action, and note.

## Operating Rule

A conversion record should be created only when there is an observable signal: a reply, a pricing question, a request for a source review, a proposal ask, a paid-pilot step, or a clear lost reason. Compliments without a next action should remain in the follow-up board until they become real pipeline evidence.

## Metrics

The board tracks open deals, weighted monthly recurring revenue, warm replies, paid or won accounts, and blockers. Weighted MRR is calculated from expected monthly revenue times close probability, so the launch view stays conservative.

## Review

The pipeline can be exported as JSON or copied as a Markdown report. These are product and sales workflow notes for MajlisAlpha pilot operations and are not investment advice.
