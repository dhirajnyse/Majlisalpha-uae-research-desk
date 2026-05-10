# MajlisAlpha Pilot Command Center

The Pilot Command Center is the operating plan for turning MajlisAlpha from a strong static prototype into a UAE research workflow that can be tested with real evidence.

## Sprint Goal

Make `FAB`, `EMAAR`, and `ADNOCGAS` credible enough for pilot review. The desk does not need broad coverage yet. It needs a narrow, trusted source base and a repeatable review path.

## Seven-Day Sprint

1. FAB: collect the annual report, latest results, and one ADX disclosure.
2. EMAAR: collect the annual report, latest results, and one DFM disclosure.
3. ADNOCGAS: collect the annual report, latest results, and one dividend or project disclosure.
4. Run Source Intake Doctor on every pasted record.
5. Generate one risk memo packet for each priority issuer.
6. Save a human review and decision journal entry for each memo.
7. Run the launch gate and GitHub Pages smoke test.

The structured sprint data is stored in `data/pilot-sprint.json`.

## Launch Gate

MajlisAlpha should be called pilot-ready only when:

- Static checks pass.
- Each priority issuer has at least three REAL source records.
- Each priority issuer has one reviewed memo packet.
- No memo presents synthetic evidence as production-grade research.
- The GitHub Pages public URL passes the smoke test.

## Next Product Move

After the first sprint, add a small backend only for ingestion and audit storage. Keep the current GitHub Pages shell as the product surface until the source workflow and pricing signal are proven.

