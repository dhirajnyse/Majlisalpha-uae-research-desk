# Security Baseline

MajlisAlpha UAE v1 is a static browser prototype. It stores imported documents, saved notes, review logs, and waitlist drafts in local browser storage only. No broker credentials, paid data-provider secrets, or API keys are required for the static build.

## Current controls

- Content Security Policy in index.html limits script execution to same-origin app files and only allows the configured waitlist endpoint for form submission.
- User-provided source URLs are parsed with the browser URL API, length-limited, and restricted to http/https; REAL records must use https.
- Official helper links are normalized before rendering and open with rel="noopener noreferrer".
- Uploaded research files are limited by extension, per-file size, total batch size, and text length before entering the local browser corpus.
- User-entered content is rendered through escaping helpers before insertion into the page.

## Production checklist

Before treating MajlisAlpha as a production research product, add authenticated accounts, server-side source ingestion, malware scanning for uploads, auditable source review logs, rate limits, dependency scanning, privacy notices, data-retention rules, and a vulnerability disclosure channel.
