# MajlisAlpha Claim Trace Inspector

Claim Trace Inspector is the trust layer for MajlisAlpha briefs. It makes each material claim inspectable before the answer becomes a PDF, committee memo, or saved research note.

## Why It Matters

Research products fail when confident wording hides weak evidence. A brief can sound polished while mixing source-backed facts, analyst inference, stale data, and unsupported statements. Claim Trace Inspector separates those pieces so reviewers can see what is supported, what is inferred, and what is blocked.

## Claim Types

Start with five claim families:

- Valuation assumptions.
- Risk statements.
- Management-tone reads.
- Peer rankings.
- Portfolio alerts.

Each family has different evidence requirements. A valuation assumption needs model inputs and an analyst reason. A peer ranking needs source snippets for each ranked issuer. A portfolio alert needs exposure context and a next action.

## Trace Statuses

Use four statuses:

- Supported: backed by source text, official URL, period, issuer, and reviewer status.
- Inferred: uses analyst judgment from cited evidence and needs explicit reasoning.
- Source-blocked: missing, stale, synthetic, or unreviewed evidence.
- Rejected: conflicts with the source or overstates what the evidence supports.

## Review Workflow

1. Split the brief into material claims.
2. Attach source snippet, official URL, issuer, period, and document type.
3. Classify each claim.
4. Send weak claims back to Source Studio, Intake Doctor, or Memo Review Room.
5. Export only when material claims have reviewer status.

## Launch Gate

The inspector is pilot-ready when every exported brief can list material claims, trace statuses, evidence snippets, and unresolved gaps. If a claim depends on synthetic evidence or missing source text, the export must label it source-blocked.

