# MajlisAlpha Architecture

MajlisAlpha is a static GitHub Pages application for UAE market research. The first build keeps all retrieval, source import, memo generation, review logs, and AED valuation scenarios in the browser so the product can be shipped without backend infrastructure.

## Current Shell

- index.html provides the app structure, CSP, metadata, launch sections, and research workspace panels.
- styles.css and launch.css define the premium UAE research-desk interface.
- app.js loads JSON from data/, ranks matching source chunks, produces cited answers, saves local notes, exports PDFs/Markdown, and manages source workflow state.
- data/ contains the starter UAE universe and synthetic evidence.

## Production Direction

The next backend should add source ingestion for ADX, DFM, Nasdaq Dubai CANDI, SCA pages, and company IR sites; OCR/PDF parsing; reviewed source storage; user accounts; audit logs; and scheduled disclosure refresh jobs. The product should keep every answer tied to source passages, source quality labels, and analyst review decisions.
