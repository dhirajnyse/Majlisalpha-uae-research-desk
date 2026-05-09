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
assert(app.includes('const DATA_VERSION = "20260509-uae-06";'), "app.js DATA_VERSION is not aligned with UAE v6.");
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
assert(index.includes("https://dhirajnyse.github.io/Majlisalpha-uae-research-desk/"), "index.html is missing the case-correct GitHub Pages URL.");
assert(manifest.includes("/Majlisalpha-uae-research-desk/"), "site.webmanifest start_url is missing the case-correct GitHub Pages path.");
assert(index.includes("brief-workbench") && app.includes("renderBriefWorkbench"), "app.js or index.html is missing the evidence-to-brief workbench.");
assert(index.includes("memo-review-room") && app.includes("renderMemoReviewRoom"), "app.js or index.html is missing the memo review room.");
assert(index.includes("launch-control-room") && app.includes("renderLaunchControlRoom"), "app.js or index.html is missing the launch control room.");
assert(index.includes("source-intake-doctor") && app.includes("renderSourceIntakeDoctor"), "app.js or index.html is missing the source intake doctor.");
assert(index.includes("investment-gate") && app.includes("renderInvestmentGate"), "app.js or index.html is missing the investment readiness gate.");

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
