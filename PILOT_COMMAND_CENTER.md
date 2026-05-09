# Live Smoke Test Center

The Live Smoke Test Center is the post-upload confidence check for MajlisAlpha. It exists so a tester can confirm the live GitHub Pages build behaves before sharing the link with another person. It checks the core deployment path, not the investment quality of any answer.

## What It Checks

- Release version and cache key alignment.
- Data packs for companies, documents, and question templates.
- Required runtime nodes for the desk, workflow panels, release handoff, session snapshot, Pages Doctor, and Back to Top button.
- Embedded CSS fallback for recovery from stale external CSS.
- Pages Doctor health.
- Browser storage availability.
- Export and copy surfaces.
- Case-correct live path.

## Manual Smoke Path

After uploading the release to GitHub Pages, hard refresh the live URL, then open the Live Smoke Test Center. A green score means the main page, data, runtime, fallback styles, and release workflow are present. Then open Pages Doctor and confirm `Ready - 100%`. Finally run one sample question and confirm the answer, Brief Workbench, Session Snapshot Board, Release Handoff Center, and Back to Top button all behave.

## Copy And Export

Use Copy Smoke Report when sending a quick pass/fail note after an upload. Use Export Smoke JSON when saving a structured release artifact for later audit. Both outputs are operating notes for deployment health only.

## Operating Rule

Do not share the live link as the current build until Live Smoke Test and Pages Doctor agree. If the smoke test points to a failed check, use the next-action button to jump to the relevant workflow and resolve it before packaging or uploading again.

## Release Checklist

- Confirm the version card matches the intended release.
- Confirm data packs are loaded.
- Confirm runtime nodes show all present.
- Confirm style fallback includes smoke test, release handoff, session snapshot, and top button styles.
- Confirm Pages Doctor is green.
- Confirm copy/export buttons exist.
- Confirm the bottom-right Back to Top button still works from deep sections.
