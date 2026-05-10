# Release Handoff Center

The Release Handoff Center is the operating surface for sharing MajlisAlpha builds without losing the correct link, upload rule, or post-upload checks. It is intentionally practical: the person testing a release should be able to open one panel and know which live URL to use, which package is expected, what must be visible at the GitHub repository root, and what to check after Pages deploys.

## Purpose

Earlier release cycles can fail for simple reasons: a wrapper folder is uploaded, the browser is still showing stale CSS, the wrong case is used in the Pages path, or the tester does not know which URL is current. The handoff center reduces those mistakes by making the current version, cache key, live link, and upload guidance visible inside the app itself.

## Handoff Fields

- Release version and cache key.
- GitHub Pages live URL and expected repository path.
- Upload package name.
- Root upload rule: extract the ZIP and upload the contents, not the wrapper folder.
- Pages Doctor health status.
- Copyable handoff note for chat, email, or deployment notes.
- Exportable JSON for a structured release record.

## Post-Upload Checks

After uploading a release, confirm that `index.html`, `app.js`, `styles.css`, `launch.css`, `assets/`, `data/`, `docs/`, and `.nojekyll` are visible at the repository root. Then wait for the GitHub Pages deployment action to turn green, open the live URL, hard refresh, and verify Pages Doctor shows `Ready - 100%`.

## Operating Rule

The Release Handoff Center does not replace Pages Doctor. It wraps Pages Doctor into a shareable release note. Pages Doctor proves the live site is healthy; Release Handoff tells the operator what to upload, what link to open, and what exact note to send once the build is ready.

## Release Checklist

Before sharing a new MajlisAlpha build:

- Confirm the Release card shows the intended version.
- Confirm the Live Link card uses the case-correct GitHub Pages URL.
- Confirm the Upload Package card says to upload root contents only.
- Copy the handoff note.
- Open Pages Doctor and confirm health is green.
- Open Session Snapshot Board if the build includes test-session evidence.

