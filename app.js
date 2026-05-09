# MajlisAlpha UAE Source Playbook

MajlisAlpha should move from synthetic evidence to verified UAE evidence in a controlled order. The first goal is not maximum coverage; it is a small source library that an analyst would trust.

## Priority Companies

Start with `FAB`, `EMAAR`, and `ADNOCGAS`. Together they test bank, property, and energy-infrastructure workflows across ADX, DFM, company IR, and market disclosure pages.

## Required Evidence Slots

- Annual report: business overview, MD&A, risk factors, liquidity, capital allocation, debt, and dividend policy.
- Earnings call or investor presentation: prepared remarks, analyst Q&A, guidance, and management tone.
- Quarterly results: revenue, profit, margin, segment movement, balance sheet, and management commentary.
- Ownership disclosure: anchor shareholder, foreign ownership room, free float, related-party context, and governance notes.
- Exchange disclosure: board decisions, dividends, transactions, ratings, financing, project updates, and regulatory notices.

## Official Source Route

Use company IR pages for annual reports, presentations, and investor updates. Use ADX disclosures, DFM disclosures, Nasdaq Dubai CANDI, and SCA pages for market filings, exchange notices, and regulatory context.

The working source index is in `data/official-sources.json`.

## REAL Evidence Rule

A source can be marked `real` only when five fields agree:

- Official URL
- Issuer and ticker
- Source text
- Period
- Publication date

If one field is uncertain, keep the record as `imported` and leave the memo in analyst-review status.

## First Collection Sprint

1. Collect FAB annual report, latest results, and one exchange disclosure.
2. Collect EMAAR annual report, latest results, and one DFM disclosure.
3. Collect ADNOCGAS annual report, latest results, and one dividend or project disclosure.
4. Paste each source into Source Studio.
5. Run Source Intake Doctor before marking anything REAL.
6. Export the source pack JSON and review it before replacing `data/documents.json`.
