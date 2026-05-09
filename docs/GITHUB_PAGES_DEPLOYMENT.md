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
8. Open one official source link in a new tab.
9. Export Markdown or PDF from a generated brief.

If the public URL returns 404 after a green Pages build, wait two to five minutes and hard refresh. If it still fails, check repository name casing and Pages branch/root settings.
