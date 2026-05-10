# MajlisAlpha GitHub Pages Deployment

Use this checklist whenever a new MajlisAlpha release is uploaded to GitHub Pages.

## Repository

Recommended repository name: `Majlisalpha-uae-research-desk`

Public URL:

`https://dhirajnyse.github.io/Majlisalpha-uae-research-desk/`

The URL path follows the repository name. If the repo name uses capital `M`, keep that casing in the link.

## Before Upload

Run from the repository root:

```bash
node --check app.js
node --check scripts/serve-static.mjs
node scripts/static-check.mjs
```

Confirm these paths are at the repository root:

- `index.html`
- `app.js`
- `styles.css`
- `launch.css`
- `assets/`
- `data/`
- `docs/`
- `scripts/`
- `.github/workflows/static-checks.yml`
- `.nojekyll`
- `site.webmanifest`
- `README.md`
- `SECURITY.md`

## Pages Settings

1. Open GitHub repository Settings.
2. Go to Pages.
3. Select Deploy from branch.
4. Select `main`.
5. Select `/root`.
6. Wait for the `pages build and deployment` action to turn green.

## Smoke Test

After deployment:

1. Open the public URL.
2. Confirm the top bar says `MajlisAlpha`.
3. Run `What are the risks for $FAB?`.
4. Open `Source playbook`.
5. Open `Revenue pilot`.
6. Open `Catalyst calendar`.
7. Open `Peer matrix`.
8. Open `Portfolio radar`.
9. Open `Claim trace`.
10. Open `Disclosure alerts`.
11. Open `Mission control`.
12. Open `Quality lab`.
13. Open `Customer signals`.
14. Open `Investor Momentum Ledger`.
15. Open `Investor Update Composer`.
16. Open `Investor Objection Desk`.
17. Open `Investor Commitment Tracker`.
18. Open `Investor Close Plan Room`.
19. Open `Investor Terms & Follow-Up Room`.
20. Open `Investor IC Memo Room`.
21. Open `Investor Decision Room`.
22. Open `Funding Round Command Center`.
23. Open `Board Pack War Room`.
24. Open `Pilot KPI`.
25. Open `Compliance audit`.
26. Open `Refresh scheduler`.
27. Open `Corporate actions`.
28. Open `Ownership pulse`.
29. Open `Macro radar`.
30. Open `Scenario lab`.
31. Open `Committee pack`.
32. Open one official source link in a new tab.
33. Export Markdown or PDF from a generated brief.

If the public URL returns 404 after a green Pages build, wait two to five minutes and hard refresh. If it still fails, check repository name casing and Pages branch/root settings.

