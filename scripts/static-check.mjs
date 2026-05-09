import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const failures = [];
function read(path) { return readFileSync(join(root, path), "utf8"); }
function assert(condition, message) { if (!condition) failures.push(message); }
function listFiles(dir) {
  return readdirSync(join(root, dir)).flatMap((entry) => {
    const path = join(dir, entry);
    const fullPath = join(root, path);
    return statSync(fullPath).isDirectory() ? listFiles(path) : [path];
  });
}

const index = read("index.html");
const app = read("app.js");
const manifest = read("site.webmanifest");
assert(index.includes("Content-Security-Policy"), "index.html is missing the CSP meta tag.");
assert(index.includes("UAE readiness gate v1"), "index.html does not show the UAE readiness gate marker.");
assert(!/\son[a-z]+\s*=/i.test(index), "index.html contains an inline event handler.");
assert(app.includes('const DATA_VERSION = "20260509-uae-27";'), "app.js DATA_VERSION is not aligned with UAE v27.");
assert(app.includes("normalizeExternalUrl"), "app.js is missing source URL normalization.");
assert(app.includes("MAX_IMPORT_FILE_BYTES"), "app.js is missing import size limits.");
assert(app.includes("STARTER_PACK_TICKERS"), "app.js is missing the starter pack list.");
assert(app.includes("FAB") && app.includes("EMAAR") && app.includes("ADNOCGAS"), "app.js is missing UAE starter tickers.");
assert(app.includes("ADX disclosures") && app.includes("DFM disclosures") && app.includes("Nasdaq Dubai CANDI"), "app.js is missing UAE official source helpers.");
assert(index.includes("source-playbook") && index.includes("UAE Source Playbook"), "index.html is missing the UAE Source Playbook section.");
assert(index.includes("pilot-command") && index.includes("Pilot Command Center"), "index.html is missing the Pilot Command Center section.");
assert(index.includes("revenue-pilot") && index.includes("Revenue Pilot Console"), "index.html is missing the Revenue Pilot Console section.");
assert(index.includes("catalyst-calendar") && index.includes("UAE Catalyst Calendar"), "index.html is missing the UAE Catalyst Calendar section.");
assert(index.includes("peer-benchmark") && index.includes("Peer Benchmark Matrix"), "index.html is missing the Peer Benchmark Matrix section.");
assert(index.includes("portfolio-risk-radar") && index.includes("Portfolio Risk Radar"), "index.html is missing the Portfolio Risk Radar section.");
assert(index.includes("claim-trace") && index.includes("Claim Trace Inspector"), "index.html is missing the Claim Trace Inspector section.");
assert(index.includes("disclosure-alerts") && index.includes("Disclosure Alert Watchtower"), "index.html is missing the Disclosure Alert Watchtower section.");
assert(index.includes("analyst-mission-control") && index.includes("Analyst Mission Control"), "index.html is missing the Analyst Mission Control section.");
assert(index.includes("answer-quality-lab") && index.includes("Answer Quality Lab"), "index.html is missing the Answer Quality Lab section.");
assert(index.includes("customer-signal-room") && index.includes("Customer Signal Room"), "index.html is missing the Customer Signal Room section.");
assert(index.includes("pilot-kpi-board") && index.includes("Pilot KPI Board"), "index.html is missing the Pilot KPI Board section.");
assert(index.includes("compliance-audit") && index.includes("Compliance Audit Center"), "index.html is missing the Compliance Audit Center section.");
assert(index.includes("source-refresh") && index.includes("Source Refresh Scheduler"), "index.html is missing the Source Refresh Scheduler section.");
assert(index.includes("corporate-actions") && index.includes("Corporate Action Tracker"), "index.html is missing the Corporate Action Tracker section.");
assert(index.includes("ownership-pulse") && index.includes("Ownership Pulse Monitor"), "index.html is missing the Ownership Pulse Monitor section.");
assert(index.includes("macro-rates-radar") && index.includes("Macro &amp; Rates Radar"), "index.html is missing the Macro & Rates Radar section.");
assert(index.includes("aed-scenario-lab") && index.includes("AED Scenario Lab"), "index.html is missing the AED Scenario Lab section.");
assert(index.includes("committee-pack-builder") && index.includes("Committee Pack Builder"), "index.html is missing the Committee Pack Builder section.");
assert(index.includes("pages-deployment-doctor") && index.includes("Pages Deployment Doctor"), "index.html is missing the Pages Deployment Doctor section.");
assert(index.includes("pages-doctor-grid"), "index.html is missing the embedded Pages Doctor styles.");
assert(index.includes("pilot-session-command") && index.includes("Pilot Session Command Center"), "index.html is missing the Pilot Session Command Center section.");
assert(index.includes("pilot-session-summary"), "index.html is missing the embedded Pilot Session styles.");
assert(index.includes("pilot-followup-board") && index.includes("Pilot Follow-Up Board"), "index.html is missing the Pilot Follow-Up Board section.");
assert(index.includes("pilot-followup-summary"), "index.html is missing the embedded Pilot Follow-Up styles.");
assert(index.includes("pilot-outreach-composer") && index.includes("Pilot Outreach Composer"), "index.html is missing the Pilot Outreach Composer section.");
assert(index.includes("pilot-outreach-summary"), "index.html is missing the embedded Pilot Outreach styles.");
assert(index.includes("pilot-conversion-pipeline") && index.includes("Pilot Conversion Pipeline"), "index.html is missing the Pilot Conversion Pipeline section.");
assert(index.includes("pilot-conversion-summary"), "index.html is missing the embedded Pilot Conversion styles.");
assert(index.includes("https://dhirajnyse.github.io/Majlisalpha-uae-research-desk/"), "index.html is missing the case-correct GitHub Pages URL.");
assert(manifest.includes("/Majlisalpha-uae-research-desk/"), "site.webmanifest start_url is missing the case-correct GitHub Pages path.");
assert(index.includes("brief-workbench") && app.includes("renderBriefWorkbench"), "app.js or index.html is missing the evidence-to-brief workbench.");
assert(index.includes("memo-review-room") && app.includes("renderMemoReviewRoom"), "app.js or index.html is missing the memo review room.");
assert(index.includes("launch-control-room") && app.includes("renderLaunchControlRoom"), "app.js or index.html is missing the launch control room.");
assert(index.includes("source-intake-doctor") && app.includes("renderSourceIntakeDoctor"), "app.js or index.html is missing the source intake doctor.");
assert(index.includes("investment-gate") && app.includes("renderInvestmentGate"), "app.js or index.html is missing the investment readiness gate.");
assert(app.includes("renderPagesDeploymentDoctor") && app.includes("MajlisAlphaPagesDoctor"), "app.js is missing the Pages Deployment Doctor runtime.");
assert(app.includes("renderPilotSessionCommandCenter") && app.includes("pilotSessions"), "app.js is missing the Pilot Session runtime.");
assert(app.includes("renderPilotFollowupBoard") && app.includes("pilotFollowups"), "app.js is missing the Pilot Follow-Up runtime.");
assert(app.includes("renderPilotOutreachComposer") && app.includes("pilotOutreachDrafts"), "app.js is missing the Pilot Outreach runtime.");
assert(app.includes("renderPilotConversionPipeline") && app.includes("pilotConversions"), "app.js is missing the Pilot Conversion runtime.");

for (const file of listFiles("data").filter((name) => name.endsWith(".json"))) {
  try {
    JSON.parse(read(file));
  } catch (error) {
    failures.push(file + " is not valid JSON: " + error.message);
  }
}

for (const required of [
  "README.md",
  "SECURITY.md",
  "docs/ARCHITECTURE.md",
  "docs/DATA_PROVENANCE.md",
  "docs/REAL_SOURCE_STARTER_PACK.md",
  "docs/SOURCE_COLLECTION_ASSISTANT.md",
  "docs/REAL_FILING_CAPTURE_MODE.md",
  "docs/BRIEF_WORKBENCH.md",
  "docs/MEMO_REVIEW_ROOM.md",
  "docs/LAUNCH_CONTROL_ROOM.md",
  "docs/SOURCE_INTAKE_DOCTOR.md",
  "docs/INVESTMENT_READINESS_GATE.md",
  "docs/LAUNCH_ROADMAP.md",
  "docs/REPO_OPERATIONS.md",
  "docs/UAE_SOURCE_PLAYBOOK.md",
  "docs/PILOT_COMMAND_CENTER.md",
  "docs/PILOT_REVENUE_PLAYBOOK.md",
  "docs/CATALYST_CALENDAR.md",
  "docs/PEER_BENCHMARK_MATRIX.md",
  "docs/PORTFOLIO_RISK_RADAR.md",
  "docs/CLAIM_TRACE_INSPECTOR.md",
  "docs/DISCLOSURE_ALERT_WATCHTOWER.md",
  "docs/ANALYST_MISSION_CONTROL.md",
  "docs/ANSWER_QUALITY_LAB.md",
  "docs/CUSTOMER_SIGNAL_ROOM.md",
  "docs/PILOT_FOLLOWUP_BOARD.md",
  "docs/PILOT_OUTREACH_COMPOSER.md",
  "docs/PILOT_CONVERSION_PIPELINE.md",
  "docs/PILOT_KPI_BOARD.md",
  "docs/COMPLIANCE_AUDIT_CENTER.md",
  "docs/SOURCE_REFRESH_SCHEDULER.md",
  "docs/CORPORATE_ACTION_TRACKER.md",
  "docs/OWNERSHIP_PULSE_MONITOR.md",
  "docs/MACRO_RATES_RADAR.md",
  "docs/AED_SCENARIO_LAB.md",
  "docs/COMMITTEE_PACK_BUILDER.md",
  "docs/GITHUB_PAGES_DEPLOYMENT.md"
]) {
  assert(read(required).trim().length > 200, required + " is missing or too short.");
}

if (failures.length) {
  console.error("MajlisAlpha static checks failed:");
  for (const failure of failures) console.error("- " + failure);
  process.exit(1);
}

console.log("MajlisAlpha static checks passed.");



