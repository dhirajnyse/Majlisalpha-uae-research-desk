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
assert(app.includes('const DATA_VERSION = "20260510-uae-61";'), "app.js DATA_VERSION is not aligned with UAE v61.");
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
assert(index.includes("session-snapshot-board") && index.includes("Session Snapshot Board"), "index.html is missing the Session Snapshot Board section.");
assert(index.includes("session-snapshot-grid"), "index.html is missing the embedded Session Snapshot styles.");
assert(index.includes("release-handoff-center") && index.includes("Release Handoff Center"), "index.html is missing the Release Handoff Center section.");
assert(index.includes("release-handoff-grid"), "index.html is missing the embedded Release Handoff styles.");
assert(index.includes("live-smoke-test") && index.includes("Live Smoke Test Center"), "index.html is missing the Live Smoke Test Center section.");
assert(index.includes("smoke-test-grid"), "index.html is missing the embedded Live Smoke Test styles.");
assert(index.includes("pilot-demo-script") && index.includes("Pilot Demo Script Center"), "index.html is missing the Pilot Demo Script Center section.");
assert(index.includes("demo-script-grid"), "index.html is missing the embedded Pilot Demo Script styles.");
assert(index.includes("pilot-learning-loop") && index.includes("Pilot Learning Loop Center"), "index.html is missing the Pilot Learning Loop Center section.");
assert(index.includes("learning-loop-grid"), "index.html is missing the embedded Pilot Learning Loop styles.");
assert(index.includes("founder-weekly-review") && index.includes("Founder Weekly Review Center"), "index.html is missing the Founder Weekly Review Center section.");
assert(index.includes("founder-review-grid"), "index.html is missing the embedded Founder Weekly Review styles.");
assert(index.includes("pilot-onboarding-room") && index.includes("Pilot Onboarding Room"), "index.html is missing the Pilot Onboarding Room section.");
assert(index.includes("pilot-onboarding-grid"), "index.html is missing the embedded Pilot Onboarding Room styles.");
assert(index.includes("pilot-success-plan") && index.includes("Pilot Success Plan Center"), "index.html is missing the Pilot Success Plan Center section.");
assert(index.includes("pilot-success-grid"), "index.html is missing the embedded Pilot Success Plan styles.");
assert(index.includes("pilot-value-proof") && index.includes("Pilot Value Proof Center"), "index.html is missing the Pilot Value Proof Center section.");
assert(index.includes("pilot-value-grid"), "index.html is missing the embedded Pilot Value Proof styles.");
assert(index.includes("pilot-evidence-ledger") && index.includes("Pilot Evidence Ledger"), "index.html is missing the Pilot Evidence Ledger section.");
assert(index.includes("pilot-evidence-grid"), "index.html is missing the embedded Pilot Evidence Ledger styles.");
assert(index.includes("pilot-proof-packet") && index.includes("Pilot Proof Packet Builder"), "index.html is missing the Pilot Proof Packet Builder section.");
assert(index.includes("pilot-proof-grid"), "index.html is missing the embedded Pilot Proof Packet styles.");
assert(index.includes("pilot-close-room") && index.includes("Pilot Close Room"), "index.html is missing the Pilot Close Room section.");
assert(index.includes("pilot-close-grid"), "index.html is missing the embedded Pilot Close Room styles.");
assert(index.includes("paid-pilot-delivery") && index.includes("Paid Pilot Delivery Board"), "index.html is missing the Paid Pilot Delivery Board section.");
assert(index.includes("paid-delivery-grid"), "index.html is missing the embedded Paid Pilot Delivery styles.");
assert(index.includes("renewal-expansion-board") && index.includes("Renewal &amp; Expansion Board"), "index.html is missing the Renewal & Expansion Board section.");
assert(index.includes("renewal-expansion-grid"), "index.html is missing the embedded Renewal & Expansion styles.");
assert(index.includes("account-health-command") && index.includes("Account Health Command Center"), "index.html is missing the Account Health Command Center section.");
assert(index.includes("account-health-grid"), "index.html is missing the embedded Account Health styles.");
assert(index.includes("founder-revenue-forecast") && index.includes("Founder Revenue Forecast Center"), "index.html is missing the Founder Revenue Forecast Center section.");
assert(index.includes("founder-revenue-grid"), "index.html is missing the embedded Founder Revenue styles.");
assert(index.includes("founder-board-pack") && index.includes("Founder Board Pack Center"), "index.html is missing the Founder Board Pack Center section.");
assert(index.includes("founder-board-grid"), "index.html is missing the embedded Founder Board styles.");
assert(index.includes("founder-diligence-room") && index.includes("Founder Diligence Room"), "index.html is missing the Founder Diligence Room section.");
assert(index.includes("founder-diligence-grid"), "index.html is missing the embedded Founder Diligence styles.");
assert(index.includes("investor-data-room") && index.includes("Investor Data Room"), "index.html is missing the Investor Data Room section.");
assert(index.includes("investor-data-grid"), "index.html is missing the embedded Investor Data Room styles.");
assert(index.includes("investor-intro-room") && index.includes("Investor Intro Room"), "index.html is missing the Investor Intro Room section.");
assert(index.includes("investor-intro-grid"), "index.html is missing the embedded Investor Intro Room styles.");
assert(index.includes("investor-reply-pipeline") && index.includes("Investor Reply Pipeline"), "index.html is missing the Investor Reply Pipeline section.");
assert(index.includes("investor-reply-grid"), "index.html is missing the embedded Investor Reply Pipeline styles.");
assert(index.includes("investor-meeting-prep") && index.includes("Investor Meeting Prep Room"), "index.html is missing the Investor Meeting Prep Room section.");
assert(index.includes("investor-meeting-grid"), "index.html is missing the embedded Investor Meeting Prep Room styles.");
assert(index.includes("investor-follow-through") && index.includes("Investor Follow-Through Board"), "index.html is missing the Investor Follow-Through Board section.");
assert(index.includes("investor-follow-grid"), "index.html is missing the embedded Investor Follow-Through Board styles.");
assert(index.includes("investor-momentum-ledger") && index.includes("Investor Momentum Ledger"), "index.html is missing the Investor Momentum Ledger section.");
assert(index.includes("investor-momentum-grid"), "index.html is missing the embedded Investor Momentum Ledger styles.");
assert(index.includes("investor-update-composer") && index.includes("Investor Update Composer"), "index.html is missing the Investor Update Composer section.");
assert(index.includes("investor-update-grid"), "index.html is missing the embedded Investor Update Composer styles.");
assert(index.includes("investor-objection-desk") && index.includes("Investor Objection Desk"), "index.html is missing the Investor Objection Desk section.");
assert(index.includes("investor-objection-grid"), "index.html is missing the embedded Investor Objection Desk styles.");
assert(index.includes("investor-commitment-tracker") && index.includes("Investor Commitment Tracker"), "index.html is missing the Investor Commitment Tracker section.");
assert(index.includes("investor-commitment-grid"), "index.html is missing the embedded Investor Commitment Tracker styles.");
assert(index.includes("investor-close-plan") && index.includes("Investor Close Plan Room"), "index.html is missing the Investor Close Plan Room section.");
assert(index.includes("investor-close-grid"), "index.html is missing the embedded Investor Close Plan styles.");
assert(index.includes("investor-terms-followup") && index.includes("Investor Terms &amp; Follow-Up Room"), "index.html is missing the Investor Terms & Follow-Up Room section.");
assert(index.includes("investor-terms-grid"), "index.html is missing the embedded Investor Terms & Follow-Up styles.");
assert(index.includes("investor-ic-memo") && index.includes("Investor IC Memo Room"), "index.html is missing the Investor IC Memo Room section.");
assert(index.includes("investor-ic-grid"), "index.html is missing the embedded Investor IC Memo styles.");
assert(index.includes("investor-decision-room") && index.includes("Investor Decision Room"), "index.html is missing the Investor Decision Room section.");
assert(index.includes("investor-decision-grid"), "index.html is missing the embedded Investor Decision Room styles.");
assert(index.includes("funding-round-command") && index.includes("Funding Round Command Center"), "index.html is missing the Funding Round Command Center section.");
assert(index.includes("funding-round-grid"), "index.html is missing the embedded Funding Round Command Center styles.");
assert(index.includes("board-pack-war-room") && index.includes("Board Pack War Room"), "index.html is missing the Board Pack War Room section.");
assert(index.includes("board-pack-war-grid"), "index.html is missing the embedded Board Pack War Room styles.");
assert(index.includes("scrollTopButton") && index.includes("Back to top"), "index.html is missing the floating Back to Top button.");
assert(index.includes("scroll-top-button"), "index.html is missing the embedded floating top button styles.");
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
assert(app.includes("renderSessionSnapshotBoard") && app.includes("MajlisAlphaSessionSnapshot"), "app.js is missing the Session Snapshot runtime.");
assert(app.includes("renderReleaseHandoffCenter") && app.includes("MajlisAlphaReleaseHandoff"), "app.js is missing the Release Handoff runtime.");
assert(app.includes("renderLiveSmokeTestCenter") && app.includes("MajlisAlphaSmokeTest"), "app.js is missing the Live Smoke Test runtime.");
assert(app.includes("renderPilotDemoScriptCenter") && app.includes("MajlisAlphaDemoScript"), "app.js is missing the Pilot Demo Script runtime.");
assert(app.includes("renderPilotLearningLoopCenter") && app.includes("MajlisAlphaLearningLoop"), "app.js is missing the Pilot Learning Loop runtime.");
assert(app.includes("renderFounderWeeklyReviewCenter") && app.includes("MajlisAlphaFounderReview"), "app.js is missing the Founder Weekly Review runtime.");
assert(app.includes("renderPilotOnboardingRoom") && app.includes("MajlisAlphaPilotOnboarding"), "app.js is missing the Pilot Onboarding Room runtime.");
assert(app.includes("renderPilotSuccessPlanCenter") && app.includes("MajlisAlphaPilotSuccessPlan"), "app.js is missing the Pilot Success Plan runtime.");
assert(app.includes("renderPilotValueProofCenter") && app.includes("MajlisAlphaPilotValueProof"), "app.js is missing the Pilot Value Proof runtime.");
assert(app.includes("renderPilotEvidenceLedger") && app.includes("pilotEvidenceLedger"), "app.js is missing the Pilot Evidence Ledger runtime.");
assert(app.includes("renderPilotProofPacketBuilder") && app.includes("MajlisAlphaPilotProofPacket"), "app.js is missing the Pilot Proof Packet runtime.");
assert(app.includes("renderPilotCloseRoom") && app.includes("MajlisAlphaPilotCloseRoom"), "app.js is missing the Pilot Close Room runtime.");
assert(app.includes("renderPaidPilotDeliveryBoard") && app.includes("MajlisAlphaPaidPilotDelivery"), "app.js is missing the Paid Pilot Delivery runtime.");
assert(app.includes("renderRenewalExpansionBoard") && app.includes("MajlisAlphaRenewalExpansion"), "app.js is missing the Renewal & Expansion runtime.");
assert(app.includes("renderAccountHealthCommandCenter") && app.includes("MajlisAlphaAccountHealth"), "app.js is missing the Account Health runtime.");
assert(app.includes("renderFounderRevenueForecastCenter") && app.includes("MajlisAlphaFounderRevenue"), "app.js is missing the Founder Revenue Forecast runtime.");
assert(app.includes("renderFounderBoardPackCenter") && app.includes("MajlisAlphaFounderBoardPack"), "app.js is missing the Founder Board Pack runtime.");
assert(app.includes("renderFounderDiligenceRoom") && app.includes("MajlisAlphaFounderDiligence"), "app.js is missing the Founder Diligence Room runtime.");
assert(app.includes("renderInvestorDataRoom") && app.includes("MajlisAlphaInvestorDataRoom"), "app.js is missing the Investor Data Room runtime.");
assert(app.includes("renderInvestorIntroRoom") && app.includes("MajlisAlphaInvestorIntroRoom"), "app.js is missing the Investor Intro Room runtime.");
assert(app.includes("renderInvestorReplyPipeline") && app.includes("MajlisAlphaInvestorReplyPipeline"), "app.js is missing the Investor Reply Pipeline runtime.");
assert(app.includes("renderInvestorMeetingPrepRoom") && app.includes("MajlisAlphaInvestorMeetingPrep"), "app.js is missing the Investor Meeting Prep Room runtime.");
assert(app.includes("renderInvestorFollowThroughBoard") && app.includes("MajlisAlphaInvestorFollowThrough"), "app.js is missing the Investor Follow-Through Board runtime.");
assert(app.includes("renderInvestorMomentumLedger") && app.includes("MajlisAlphaInvestorMomentumLedger"), "app.js is missing the Investor Momentum Ledger runtime.");
assert(app.includes("renderInvestorUpdateComposer") && app.includes("MajlisAlphaInvestorUpdateComposer"), "app.js is missing the Investor Update Composer runtime.");
assert(app.includes("renderInvestorObjectionDesk") && app.includes("MajlisAlphaInvestorObjectionDesk"), "app.js is missing the Investor Objection Desk runtime.");
assert(app.includes("renderInvestorCommitmentTracker") && app.includes("MajlisAlphaInvestorCommitmentTracker"), "app.js is missing the Investor Commitment Tracker runtime.");
assert(app.includes("renderInvestorClosePlanRoom") && app.includes("MajlisAlphaInvestorClosePlan"), "app.js is missing the Investor Close Plan Room runtime.");
assert(app.includes("renderInvestorTermsFollowupRoom") && app.includes("MajlisAlphaInvestorTermsFollowup"), "app.js is missing the Investor Terms & Follow-Up Room runtime.");
assert(app.includes("renderInvestorIcMemoRoom") && app.includes("MajlisAlphaInvestorIcMemo"), "app.js is missing the Investor IC Memo Room runtime.");
assert(app.includes("renderInvestorDecisionRoom") && app.includes("MajlisAlphaInvestorDecisionRoom"), "app.js is missing the Investor Decision Room runtime.");
assert(app.includes("renderFundingRoundCommandCenter") && app.includes("MajlisAlphaFundingRoundCommand"), "app.js is missing the Funding Round Command Center runtime.");
assert(app.includes("renderBoardPackWarRoom") && app.includes("MajlisAlphaBoardPackWarRoom"), "app.js is missing the Board Pack War Room runtime.");
assert(app.includes("scrollTopButton") && app.includes("window.scrollTo"), "app.js is missing the floating top button runtime.");

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
  "docs/SESSION_SNAPSHOT_BOARD.md",
  "docs/RELEASE_HANDOFF_CENTER.md",
  "docs/LIVE_SMOKE_TEST_CENTER.md",
  "docs/PILOT_DEMO_SCRIPT_CENTER.md",
  "docs/PILOT_LEARNING_LOOP_CENTER.md",
  "docs/FOUNDER_WEEKLY_REVIEW_CENTER.md",
  "docs/PILOT_ONBOARDING_ROOM.md",
  "docs/PILOT_SUCCESS_PLAN_CENTER.md",
  "docs/PILOT_VALUE_PROOF_CENTER.md",
  "docs/PILOT_EVIDENCE_LEDGER.md",
  "docs/PILOT_PROOF_PACKET_BUILDER.md",
  "docs/PILOT_CLOSE_ROOM.md",
  "docs/PAID_PILOT_DELIVERY_BOARD.md",
  "docs/RENEWAL_EXPANSION_BOARD.md",
  "docs/ACCOUNT_HEALTH_COMMAND_CENTER.md",
  "docs/FOUNDER_REVENUE_FORECAST_CENTER.md",
  "docs/FOUNDER_BOARD_PACK_CENTER.md",
  "docs/FOUNDER_DILIGENCE_ROOM.md",
  "docs/INVESTOR_DATA_ROOM.md",
  "docs/INVESTOR_INTRO_ROOM.md",
  "docs/INVESTOR_REPLY_PIPELINE.md",
  "docs/INVESTOR_MEETING_PREP_ROOM.md",
  "docs/INVESTOR_FOLLOW_THROUGH_BOARD.md",
  "docs/INVESTOR_MOMENTUM_LEDGER.md",
  "docs/INVESTOR_UPDATE_COMPOSER.md",
  "docs/INVESTOR_OBJECTION_DESK.md",
  "docs/INVESTOR_COMMITMENT_TRACKER.md",
  "docs/INVESTOR_CLOSE_PLAN_ROOM.md",
  "docs/INVESTOR_TERMS_FOLLOWUP_ROOM.md",
  "docs/INVESTOR_IC_MEMO_ROOM.md",
  "docs/INVESTOR_DECISION_ROOM.md",
  "docs/FUNDING_ROUND_COMMAND_CENTER.md",
  "docs/BOARD_PACK_WAR_ROOM.md",
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




