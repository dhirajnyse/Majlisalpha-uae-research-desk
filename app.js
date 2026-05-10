"use strict";

const STORAGE_KEYS = {
  uploads: "majlisalpha-uae-uploads-v1",
  notes: "majlisalpha-uae-notes-v1",
  waitlist: "majlisalpha-uae-waitlist-v1",
  valuationCases: "majlisalpha-uae-valuation-cases-v1",
  sourcePack: "majlisalpha-uae-source-pack-v1",
  sourceProgress: "majlisalpha-uae-source-progress-v1",
  memoReviews: "majlisalpha-uae-memo-reviews-v1",
  decisionJournal: "majlisalpha-uae-decision-journal-v1",
  pilotSessions: "majlisalpha-uae-pilot-sessions-v1",
  pilotFollowups: "majlisalpha-uae-pilot-followups-v1",
  pilotOutreachDrafts: "majlisalpha-uae-pilot-outreach-drafts-v1",
  pilotConversions: "majlisalpha-uae-pilot-conversions-v1",
  pilotEvidenceLedger: "majlisalpha-uae-pilot-evidence-ledger-v1"
};

const WAITLIST_ENDPOINT = "https://formsubmit.co/ajax/dhirajnyse@gmail.com";
const DATA_VERSION = "20260510-uae-61";
const LIVE_PAGES_URL = "https://dhirajnyse.github.io/Majlisalpha-uae-research-desk/";
const EXPECTED_PAGES_PATH = "/Majlisalpha-uae-research-desk/";
const MAX_IMPORT_FILE_BYTES = 2 * 1024 * 1024;
const MAX_IMPORT_TOTAL_BYTES = 8 * 1024 * 1024;
const MAX_SOURCE_TEXT_CHARS = 120000;
const MAX_SOURCE_URL_LENGTH = 2048;
const STARTER_PACK_TICKERS = ["FAB", "EMAAR", "ADNOCGAS"];
const TRUSTED_SOURCE_DOMAINS = [
  "adx.ae",
  "dfm.ae",
  "nasdaqdubai.com",
  "sca.gov.ae",
  "dfsa.ae",
  "ihcuae.com",
  "bankfab.com",
  "adnocgas.ae",
  "aldar.com",
  "eand.com",
  "emaar.com",
  "dewa.gov.ae",
  "dib.ae",
  "emiratesnbd.com",
  "airarabia.com",
  "google.com"
];
const DATA_FILES = {
  companies: "data/companies.json",
  documents: "data/documents.json",
  questions: "data/questions.json",
  watchlists: "data/watchlists.json"
};

const REAL_SOURCE_REQUIREMENTS = [
  {
    key: "annual-report",
    label: "Annual report",
    type: "Annual report",
    pattern: /annual|ar\b/i,
    instruction: "Collect business overview, MD&A, risk factors, liquidity, capital allocation, dividends, debt, and UAE-market outlook from the latest annual report."
  },
  {
    key: "concall",
    label: "Earnings call",
    type: "Earnings call transcript",
    pattern: /earnings call|transcript|call|earnings/i,
    instruction: "Collect prepared remarks plus analyst Q&A where management discusses UAE demand, margins, funding costs, dividends, capital allocation, and near-term risks."
  },
  {
    key: "results",
    label: "Results",
    type: "Quarterly results",
    pattern: /quarter|results|financial/i,
    instruction: "Collect revenue, profit, margin, segment performance, balance-sheet movement, cash flow, and management commentary from the latest results pack."
  },
  {
    key: "ownership",
    label: "Ownership",
    type: "Ownership disclosure",
    pattern: /ownership|ownership|foreign|free float/i,
    instruction: "Collect anchor shareholder position, foreign ownership room, free float, institutional ownership, and material shareholder changes."
  },
  {
    key: "announcement",
    label: "Disclosure",
    type: "Exchange disclosure",
    pattern: /exchange|announcement|disclosure|adx|dfm|nasdaq dubai/i,
    instruction: "Collect the exact exchange disclosure text for material transactions, dividends, projects, financing, ratings, regulatory actions, or governance events."
  }
];

const MARKET_SOURCE_LINKS = {
  "annual-report": [
    { label: "ADX listed companies", url: "https://www.adx.ae/english/Pages/Securities.aspx" },
    { label: "DFM listed companies", url: "https://www.dfm.ae/issuers/listed-securities/securities" },
    { label: "Nasdaq Dubai CANDI", url: "https://www.nasdaqdubai.com/candi" }
  ],
  concall: [
    { label: "ADX disclosures", url: "https://www.adx.ae/english/Pages/Market-Information/Disclosures.aspx" },
    { label: "DFM disclosures", url: "https://www.dfm.ae/market-information/market-disclosures" },
    { label: "Nasdaq Dubai CANDI", url: "https://www.nasdaqdubai.com/candi" }
  ],
  results: [
    { label: "ADX report centre", url: "https://www.adx.ae/english/Pages/Market-Information/Report-Center.aspx" },
    { label: "DFM disclosures", url: "https://www.dfm.ae/market-information/market-disclosures" },
    { label: "ADX XBRL", url: "https://xbrl.adx.ae" }
  ],
  ownership: [
    { label: "ADX ownership disclosures", url: "https://www.adx.ae/english/Pages/Market-Information/Disclosures.aspx" },
    { label: "DFM disclosures", url: "https://www.dfm.ae/market-information/market-disclosures" },
    { label: "SCA issuer information", url: "https://www.sca.gov.ae" }
  ],
  announcement: [
    { label: "ADX disclosures", url: "https://www.adx.ae/english/Pages/Market-Information/Disclosures.aspx" },
    { label: "DFM disclosures", url: "https://www.dfm.ae/market-information/market-disclosures" },
    { label: "Nasdaq Dubai CANDI", url: "https://www.nasdaqdubai.com/candi" }
  ]
};

const COMPANY_IR_LINKS = {
  IHC: "https://www.ihcuae.com/investor-relations",
  FAB: "https://www.bankfab.com/en-ae/about-fab/investor-relations",
  ADNOCGAS: "https://www.adnocgas.ae/en/investors",
  ALDAR: "https://www.aldar.com/en/investors",
  EAND: "https://www.eand.com/en/investors",
  EMAAR: "https://www.emaar.com/en/investor-relations/",
  DEWA: "https://www.dewa.gov.ae/en/about-us/investor-relations",
  DIB: "https://www.dib.ae/investor-relations",
  ENBD: "https://www.emiratesnbd.com/en/investor-relations",
  AIRARABIA: "https://www.airarabia.com/en/investor-relations"
};

const SOURCE_PROGRESS_STAGES = [
  { id: "queued", label: "Queued" },
  { id: "collected", label: "Collected" },
  { id: "pasted", label: "Pasted" },
  { id: "verified", label: "Verified" }
];

let SAMPLE_COMPANIES = [];
let PUBLIC_TICKER_ALIASES = {};
let RISK_FACTOR_LIBRARY = {};
let SAMPLE_DOCS = [];
let QUESTION_TEMPLATES = [];
let WATCHLIST_CONFIG = { defaultWatchlist: "starter-uae-largecap", watchlists: [], aliases: {} };

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "but",
  "by",
  "can",
  "do",
  "does",
  "for",
  "from",
  "has",
  "have",
  "if",
  "in",
  "into",
  "is",
  "it",
  "its",
  "of",
  "on",
  "or",
  "our",
  "over",
  "than",
  "that",
  "the",
  "their",
  "this",
  "to",
  "was",
  "we",
  "what",
  "when",
  "where",
  "which",
  "with",
  "year"
]);

const INTENTS = [
  {
    id: "margin",
    label: "Margin durability",
    terms: ["margin", "gross", "operating", "nim", "pricing", "price", "durability", "yield", "mix", "cost", "spread", "arpu"]
  },
  {
    id: "growth",
    label: "Growth quality",
    terms: ["growth", "revenue", "demand", "volume", "backlog", "orders", "deposit", "loan", "subscriber", "contract", "pipeline"]
  },
  {
    id: "risk",
    label: "Risk factors",
    terms: ["risk", "risks", "factor", "factors", "pressure", "headwind", "volatile", "delay", "commodity", "regulatory", "ownership change", "anchor shareholder", "npa"]
  },
  {
    id: "rates",
    label: "Rate sensitivity",
    terms: ["rate", "rates", "interest", "repo", "deposit", "debt", "financing", "discount", "refinancing", "credit", "leverage"]
  },
  {
    id: "cash",
    label: "Cash conversion",
    terms: ["cash", "fcf", "free", "capex", "capital", "liquidity", "working", "inventory", "accrual", "conversion"]
  },
  {
    id: "tone",
    label: "Management tone",
    terms: ["tone", "confidence", "call", "earnings call", "management", "said", "acknowledged", "expects", "guidance", "q&a"]
  },
  {
    id: "valuation",
    label: "Valuation",
    terms: ["valuation", "multiple", "model", "terminal", "discount", "value", "assumption", "equity", "pe", "ev"]
  },
  {
    id: "governance",
    label: "Governance and ownership",
    terms: ["governance", "anchor shareholder", "ownership change", "ownership", "related party", "auditor", "sca", "board"]
  }
];

const SYNONYMS = {
  durable: ["durability", "resilient", "stable", "visibility", "backlog"],
  margin: ["gross", "operating", "pricing", "yield", "mix", "cost", "spread", "nim"],
  moat: ["pricing", "backlog", "contract", "retention", "visibility", "franchise"],
  rates: ["interest", "repo", "deposit", "debt", "financing", "discount", "refinancing"],
  cash: ["fcf", "free", "liquidity", "capex", "conversion", "accrual"],
  call: ["management", "earnings call", "q&a", "guidance", "expects", "said"],
  risk: ["headwind", "pressure", "delay", "volatile", "commodity", "regulatory"],
  valuation: ["multiple", "terminal", "discount", "equity", "model", "pe"],
  governance: ["anchor shareholder", "ownership change", "ownership", "auditor", "board", "sca"]
};

const POSITIVE_TERMS = [
  "accelerated",
  "improved",
  "expanded",
  "stable",
  "strong",
  "visibility",
  "backlog",
  "retention",
  "cash",
  "net cash",
  "pricing",
  "growth",
  "contracted",
  "deposit",
  "utilisation",
  "capital discipline",
  "free cash flow"
];

const NEGATIVE_TERMS = [
  "risk",
  "pressure",
  "headwind",
  "delay",
  "volatile",
  "commodity",
  "ownership change",
  "slippage",
  "npa",
  "debt",
  "negative",
  "inflation",
  "cost of funds",
  "financing",
  "regulatory",
  "working capital"
];

const state = {
  documents: [],
  activeTickers: new Set(),
  enabledDocIds: new Set(),
  answerDepth: "brief",
  selectedTicker: "",
  tickerFocus: null,
  lastFocusKey: null,
  uploadedDocs: [],
  sourcePackDocs: [],
  sourceProgress: {},
  notes: [],
  memoReviews: [],
  decisionJournal: [],
  pilotSessions: [],
  pilotFollowups: [],
  pilotOutreachDrafts: [],
  pilotConversions: [],
  pilotEvidenceLedger: [],
  waitlistLeads: [],
  valuationCases: [],
  importReport: null,
  lastBrief: null,
  lastAnswerMeta: null,
  activeSourceTask: null,
  currentCitations: [],
  onlySelectedTicker: true,
  isRunning: false
};

const els = {};

document.addEventListener("DOMContentLoaded", () => {
  init().catch((error) => {
    console.error(error);
    showDataLoadError(error);
  });
});

async function init() {
  cacheElements();
  await loadDeskData();
  window.MajlisAlphaRunAnalysis = submitCurrentQuestion;
  window.MajlisAlphaScanDisclosure = scanFilingFromCurrentQuestion;
  state.uploadedDocs = loadJson(STORAGE_KEYS.uploads, []);
  state.sourcePackDocs = loadJson(STORAGE_KEYS.sourcePack, []).map((doc) => normalizeDocumentRecord(doc, "real"));
  state.sourceProgress = normalizeSourceProgress(loadJson(STORAGE_KEYS.sourceProgress, {}));
  state.notes = loadJson(STORAGE_KEYS.notes, []);
  state.memoReviews = loadJson(STORAGE_KEYS.memoReviews, []).map(normalizeMemoReview);
  state.decisionJournal = loadJson(STORAGE_KEYS.decisionJournal, []).map(normalizeDecisionEntry);
  state.pilotSessions = loadJson(STORAGE_KEYS.pilotSessions, []).map(normalizePilotSession);
  state.pilotFollowups = loadJson(STORAGE_KEYS.pilotFollowups, []).map(normalizePilotFollowup);
  state.pilotOutreachDrafts = loadJson(STORAGE_KEYS.pilotOutreachDrafts, []).map(normalizePilotOutreachDraft);
  state.pilotConversions = loadJson(STORAGE_KEYS.pilotConversions, []).map(normalizePilotConversion);
  state.pilotEvidenceLedger = loadJson(STORAGE_KEYS.pilotEvidenceLedger, []).map(normalizePilotEvidenceEntry);
  state.waitlistLeads = loadJson(STORAGE_KEYS.waitlist, []);
  state.valuationCases = loadJson(STORAGE_KEYS.valuationCases, []);
  state.activeTickers = new Set(getDefaultWatchlistTickers());
  state.selectedTicker = state.activeTickers.values().next().value || SAMPLE_COMPANIES[0]?.ticker || "";
  state.documents = [...SAMPLE_DOCS, ...state.sourcePackDocs, ...state.uploadedDocs];
  state.documents.forEach((doc) => state.enabledDocIds.add(doc.id));
  for (const doc of state.sourcePackDocs) {
    state.activeTickers.add(doc.ticker);
  }
  for (const doc of state.uploadedDocs) {
    state.activeTickers.add(doc.ticker);
  }

  renderImportTickerOptions();
  renderSourceBuilderTickerOptions();
  renderSourceBuilderSections();
  renderSourceAssistantLinks();
  renderSourcePackList();
  renderSourceMatrixOptions();
  renderSourceMatrix();
  renderRealSourceStarterPack();
  renderSourceQueueOptions();
  renderSourceQueue();
  renderSourceHubOptions();
  renderSourceHub();
  renderSourceWorkspace();
  renderTemplates();
  renderCoverage();
  renderLibrary();
  renderImportSummary();
  renderContextBand();
  renderValuationOptions();
  renderCompanyDossier();
  renderValuationCases();
  renderNotebook();
  renderBriefWorkbench();
  renderInvestmentGate();
  renderMemoReviewRoom();
  renderDecisionJournal();
  renderLaunchControlRoom();
  renderPilotSessionCommandCenter();
  renderPilotFollowupBoard();
  renderPilotOutreachComposer();
  renderPilotConversionPipeline();
  renderSessionSnapshotBoard();
  renderPagesDeploymentDoctor();
  renderReleaseHandoffCenter();
  renderLiveSmokeTestCenter();
  renderPilotDemoScriptCenter();
  renderPilotLearningLoopCenter();
  renderFounderWeeklyReviewCenter();
  renderPilotOnboardingRoom();
  renderPilotSuccessPlanCenter();
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderInvestorIcMemoRoom();
  renderInvestorDecisionRoom();
  renderFundingRoundCommandCenter();
  renderBoardPackWarRoom();
  bindEvents();
  updateValuationFromCompany();
  updateValuation();
  renderEvidence([]);
  drawSignalMap();
}

async function loadDeskData() {
  const [companies, documents, questions, watchlists] = await Promise.all([
    fetchJson(DATA_FILES.companies),
    fetchJson(DATA_FILES.documents),
    fetchJson(DATA_FILES.questions),
    fetchJson(DATA_FILES.watchlists)
  ]);

  SAMPLE_COMPANIES = companies.map(normalizeCompanyRecord);
  SAMPLE_DOCS = documents.map((doc) => normalizeDocumentRecord(doc, "synthetic"));
  QUESTION_TEMPLATES = questions;
  WATCHLIST_CONFIG = watchlists;
  PUBLIC_TICKER_ALIASES = watchlists.aliases || {};
  RISK_FACTOR_LIBRARY = Object.fromEntries(SAMPLE_COMPANIES.map((company) => [company.ticker, company.riskFactors || []]));
}

async function fetchJson(path) {
  const response = await fetch(`${path}?v=${DATA_VERSION}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Could not load ${path} (${response.status})`);
  }
  return response.json();
}

function showDataLoadError(error) {
  cacheElements();
  const message = window.location.protocol === "file:"
    ? "MajlisAlpha loads its data from JSON files. Open it through GitHub Pages or a local web server so the browser can fetch the data folder."
    : "MajlisAlpha could not load its data files. Confirm the data folder was uploaded at the repository root.";
  if (els.answerPanel) {
    els.answerPanel.innerHTML = `
      <div class="empty-state">
        <div class="empty-kicker">Data unavailable</div>
        <h2>Source pack files did not load.</h2>
        <p>${escapeHtml(message)} ${escapeHtml(error.message || "")}</p>
      </div>
    `;
  }
}

function cacheElements() {
  els.templateStack = document.querySelector("#templateStack");
  els.questionCount = document.querySelector("#questionCount");
  els.coverageList = document.querySelector("#coverageList");
  els.selectAllTickers = document.querySelector("#selectAllTickers");
  els.libraryList = document.querySelector("#libraryList");
  els.documentCount = document.querySelector("#documentCount");
  els.fileInput = document.querySelector("#fileInput");
  els.fileDrop = document.querySelector(".file-drop");
  els.importSummary = document.querySelector("#importSummary");
  els.pasteForm = document.querySelector("#pasteForm");
  els.importTickerSelect = document.querySelector("#importTickerSelect");
  els.pasteTicker = document.querySelector("#pasteTicker");
  els.pasteType = document.querySelector("#pasteType");
  els.pasteTitle = document.querySelector("#pasteTitle");
  els.pasteText = document.querySelector("#pasteText");
  els.clearUploads = document.querySelector("#clearUploads");
  els.queryForm = document.querySelector("#queryForm");
  els.queryInput = document.querySelector("#queryInput");
  els.memoShortcuts = document.querySelector(".memo-shortcuts");
  els.scanFilingButton = document.querySelector("#scanFilingButton");
  els.runAnalysisButton = document.querySelector("#runAnalysisButton");
  els.onlySelectedTicker = document.querySelector("#onlySelectedTicker");
  els.contextBand = document.querySelector("#contextBand");
  els.answerPanel = document.querySelector("#answerPanel");
  els.briefWorkbench = document.querySelector("#brief-workbench");
  els.briefWorkbenchStatus = document.querySelector("#briefWorkbenchStatus");
  els.briefWorkbenchSummary = document.querySelector("#briefWorkbenchSummary");
  els.briefReadinessGrid = document.querySelector("#briefReadinessGrid");
  els.briefSourceMap = document.querySelector("#briefSourceMap");
  els.copyBriefPacket = document.querySelector("#copyBriefPacket");
  els.exportBriefPacketJson = document.querySelector("#exportBriefPacketJson");
  els.openBriefNextGap = document.querySelector("#openBriefNextGap");
  els.briefWorkbenchResult = document.querySelector("#briefWorkbenchResult");
  els.investmentGateStatus = document.querySelector("#investmentGateStatus");
  els.investmentGateSummary = document.querySelector("#investmentGateSummary");
  els.investmentGateChecks = document.querySelector("#investmentGateChecks");
  els.runInvestmentGate = document.querySelector("#runInvestmentGate");
  els.openInvestmentGateGap = document.querySelector("#openInvestmentGateGap");
  els.copyInvestmentGateNote = document.querySelector("#copyInvestmentGateNote");
  els.investmentGateResult = document.querySelector("#investmentGateResult");
  els.memoReviewForm = document.querySelector("#memoReviewForm");
  els.memoReviewContext = document.querySelector("#memoReviewContext");
  els.memoReviewDecision = document.querySelector("#memoReviewDecision");
  els.memoReviewConviction = document.querySelector("#memoReviewConviction");
  els.memoReviewOwner = document.querySelector("#memoReviewOwner");
  els.memoReviewNote = document.querySelector("#memoReviewNote");
  els.memoReviewRisk = document.querySelector("#memoReviewRisk");
  els.saveMemoReview = document.querySelector("#saveMemoReview");
  els.exportMemoReviews = document.querySelector("#exportMemoReviews");
  els.copyMemoReviews = document.querySelector("#copyMemoReviews");
  els.clearMemoReviews = document.querySelector("#clearMemoReviews");
  els.memoReviewResult = document.querySelector("#memoReviewResult");
  els.memoReviewList = document.querySelector("#memoReviewList");
  els.memoReviewCount = document.querySelector("#memoReviewCount");
  els.decisionJournalForm = document.querySelector("#decisionJournalForm");
  els.decisionJournalContext = document.querySelector("#decisionJournalContext");
  els.decisionJournalDecision = document.querySelector("#decisionJournalDecision");
  els.decisionJournalStrength = document.querySelector("#decisionJournalStrength");
  els.decisionJournalHorizon = document.querySelector("#decisionJournalHorizon");
  els.decisionJournalDate = document.querySelector("#decisionJournalDate");
  els.decisionJournalOwner = document.querySelector("#decisionJournalOwner");
  els.decisionJournalNote = document.querySelector("#decisionJournalNote");
  els.decisionJournalTrigger = document.querySelector("#decisionJournalTrigger");
  els.decisionJournalEvidenceTask = document.querySelector("#decisionJournalEvidenceTask");
  els.saveDecisionJournalEntry = document.querySelector("#saveDecisionJournalEntry");
  els.exportDecisionJournal = document.querySelector("#exportDecisionJournal");
  els.copyDecisionJournal = document.querySelector("#copyDecisionJournal");
  els.clearDecisionJournal = document.querySelector("#clearDecisionJournal");
  els.decisionJournalResult = document.querySelector("#decisionJournalResult");
  els.decisionJournalList = document.querySelector("#decisionJournalList");
  els.decisionJournalCount = document.querySelector("#decisionJournalCount");
  els.pilotSessionForm = document.querySelector("#pilotSessionForm");
  els.pilotSessionUser = document.querySelector("#pilotSessionUser");
  els.pilotSessionSegment = document.querySelector("#pilotSessionSegment");
  els.pilotSessionOutcome = document.querySelector("#pilotSessionOutcome");
  els.pilotSessionPaidIntent = document.querySelector("#pilotSessionPaidIntent");
  els.pilotSessionQuestion = document.querySelector("#pilotSessionQuestion");
  els.pilotSessionTickers = document.querySelector("#pilotSessionTickers");
  els.pilotSessionSourceStatus = document.querySelector("#pilotSessionSourceStatus");
  els.pilotSessionObjection = document.querySelector("#pilotSessionObjection");
  els.pilotSessionNextStep = document.querySelector("#pilotSessionNextStep");
  els.savePilotSession = document.querySelector("#savePilotSession");
  els.prefillPilotSession = document.querySelector("#prefillPilotSession");
  els.exportPilotSessions = document.querySelector("#exportPilotSessions");
  els.copyPilotSessions = document.querySelector("#copyPilotSessions");
  els.clearPilotSessions = document.querySelector("#clearPilotSessions");
  els.pilotSessionResult = document.querySelector("#pilotSessionResult");
  els.pilotSessionSummary = document.querySelector("#pilotSessionSummary");
  els.pilotSessionList = document.querySelector("#pilotSessionList");
  els.pilotSessionCount = document.querySelector("#pilotSessionCount");
  els.pilotFollowupForm = document.querySelector("#pilotFollowupForm");
  els.pilotFollowupAccount = document.querySelector("#pilotFollowupAccount");
  els.pilotFollowupStage = document.querySelector("#pilotFollowupStage");
  els.pilotFollowupPriority = document.querySelector("#pilotFollowupPriority");
  els.pilotFollowupNextDate = document.querySelector("#pilotFollowupNextDate");
  els.pilotFollowupOffer = document.querySelector("#pilotFollowupOffer");
  els.pilotFollowupBlocker = document.querySelector("#pilotFollowupBlocker");
  els.pilotFollowupNextAction = document.querySelector("#pilotFollowupNextAction");
  els.pilotFollowupSessionNote = document.querySelector("#pilotFollowupSessionNote");
  els.prefillPilotFollowup = document.querySelector("#prefillPilotFollowup");
  els.exportPilotFollowups = document.querySelector("#exportPilotFollowups");
  els.copyPilotFollowups = document.querySelector("#copyPilotFollowups");
  els.clearPilotFollowups = document.querySelector("#clearPilotFollowups");
  els.pilotFollowupResult = document.querySelector("#pilotFollowupResult");
  els.pilotFollowupSummary = document.querySelector("#pilotFollowupSummary");
  els.pilotFollowupList = document.querySelector("#pilotFollowupList");
  els.pilotFollowupCount = document.querySelector("#pilotFollowupCount");
  els.pilotOutreachForm = document.querySelector("#pilotOutreachForm");
  els.pilotOutreachAccount = document.querySelector("#pilotOutreachAccount");
  els.pilotOutreachChannel = document.querySelector("#pilotOutreachChannel");
  els.pilotOutreachTone = document.querySelector("#pilotOutreachTone");
  els.pilotOutreachOffer = document.querySelector("#pilotOutreachOffer");
  els.pilotOutreachEvidenceHook = document.querySelector("#pilotOutreachEvidenceHook");
  els.pilotOutreachBlocker = document.querySelector("#pilotOutreachBlocker");
  els.pilotOutreachNextAction = document.querySelector("#pilotOutreachNextAction");
  els.pilotOutreachCta = document.querySelector("#pilotOutreachCta");
  els.prefillPilotOutreach = document.querySelector("#prefillPilotOutreach");
  els.copyPilotOutreach = document.querySelector("#copyPilotOutreach");
  els.exportPilotOutreach = document.querySelector("#exportPilotOutreach");
  els.clearPilotOutreach = document.querySelector("#clearPilotOutreach");
  els.pilotOutreachResult = document.querySelector("#pilotOutreachResult");
  els.pilotOutreachSummary = document.querySelector("#pilotOutreachSummary");
  els.pilotOutreachPreview = document.querySelector("#pilotOutreachPreview");
  els.pilotOutreachList = document.querySelector("#pilotOutreachList");
  els.pilotOutreachCount = document.querySelector("#pilotOutreachCount");
  els.pilotConversionForm = document.querySelector("#pilotConversionForm");
  els.pilotConversionAccount = document.querySelector("#pilotConversionAccount");
  els.pilotConversionStage = document.querySelector("#pilotConversionStage");
  els.pilotConversionPlan = document.querySelector("#pilotConversionPlan");
  els.pilotConversionProbability = document.querySelector("#pilotConversionProbability");
  els.pilotConversionMrr = document.querySelector("#pilotConversionMrr");
  els.pilotConversionNextDate = document.querySelector("#pilotConversionNextDate");
  els.pilotConversionReply = document.querySelector("#pilotConversionReply");
  els.pilotConversionBlocker = document.querySelector("#pilotConversionBlocker");
  els.pilotConversionCloseAction = document.querySelector("#pilotConversionCloseAction");
  els.pilotConversionNote = document.querySelector("#pilotConversionNote");
  els.prefillPilotConversion = document.querySelector("#prefillPilotConversion");
  els.exportPilotConversions = document.querySelector("#exportPilotConversions");
  els.copyPilotConversions = document.querySelector("#copyPilotConversions");
  els.clearPilotConversions = document.querySelector("#clearPilotConversions");
  els.pilotConversionResult = document.querySelector("#pilotConversionResult");
  els.pilotConversionSummary = document.querySelector("#pilotConversionSummary");
  els.pilotConversionList = document.querySelector("#pilotConversionList");
  els.pilotConversionCount = document.querySelector("#pilotConversionCount");
  els.sessionSnapshotSummary = document.querySelector("#sessionSnapshotSummary");
  els.sessionSnapshotGrid = document.querySelector("#sessionSnapshotGrid");
  els.openSessionSnapshotNext = document.querySelector("#openSessionSnapshotNext");
  els.copySessionSnapshot = document.querySelector("#copySessionSnapshot");
  els.exportSessionSnapshot = document.querySelector("#exportSessionSnapshot");
  els.sessionSnapshotResult = document.querySelector("#sessionSnapshotResult");
  els.releaseHandoffSummary = document.querySelector("#releaseHandoffSummary");
  els.releaseHandoffGrid = document.querySelector("#releaseHandoffGrid");
  els.openReleaseLiveUrl = document.querySelector("#openReleaseLiveUrl");
  els.openReleaseDoctor = document.querySelector("#openReleaseDoctor");
  els.copyReleaseHandoff = document.querySelector("#copyReleaseHandoff");
  els.exportReleaseHandoff = document.querySelector("#exportReleaseHandoff");
  els.releaseHandoffResult = document.querySelector("#releaseHandoffResult");
  els.smokeTestSummary = document.querySelector("#smokeTestSummary");
  els.smokeTestGrid = document.querySelector("#smokeTestGrid");
  els.smokeTestChecklist = document.querySelector("#smokeTestChecklist");
  els.openSmokeTestNext = document.querySelector("#openSmokeTestNext");
  els.openSmokeTestDoctor = document.querySelector("#openSmokeTestDoctor");
  els.copySmokeTestReport = document.querySelector("#copySmokeTestReport");
  els.exportSmokeTestReport = document.querySelector("#exportSmokeTestReport");
  els.smokeTestResult = document.querySelector("#smokeTestResult");
  els.demoScriptSummary = document.querySelector("#demoScriptSummary");
  els.demoScriptGrid = document.querySelector("#demoScriptGrid");
  els.demoScriptChecklist = document.querySelector("#demoScriptChecklist");
  els.openDemoScriptNext = document.querySelector("#openDemoScriptNext");
  els.prefillDemoPilotSession = document.querySelector("#prefillDemoPilotSession");
  els.copyDemoScript = document.querySelector("#copyDemoScript");
  els.exportDemoScript = document.querySelector("#exportDemoScript");
  els.demoScriptResult = document.querySelector("#demoScriptResult");
  els.learningLoopSummary = document.querySelector("#learningLoopSummary");
  els.learningLoopGrid = document.querySelector("#learningLoopGrid");
  els.learningLoopQueue = document.querySelector("#learningLoopQueue");
  els.openLearningLoopNext = document.querySelector("#openLearningLoopNext");
  els.copyLearningLoop = document.querySelector("#copyLearningLoop");
  els.exportLearningLoop = document.querySelector("#exportLearningLoop");
  els.learningLoopResult = document.querySelector("#learningLoopResult");
  els.founderReviewSummary = document.querySelector("#founderReviewSummary");
  els.founderReviewGrid = document.querySelector("#founderReviewGrid");
  els.founderReviewDecisions = document.querySelector("#founderReviewDecisions");
  els.openFounderReviewNext = document.querySelector("#openFounderReviewNext");
  els.copyFounderReview = document.querySelector("#copyFounderReview");
  els.exportFounderReview = document.querySelector("#exportFounderReview");
  els.founderReviewResult = document.querySelector("#founderReviewResult");
  els.pilotOnboardingSummary = document.querySelector("#pilotOnboardingSummary");
  els.pilotOnboardingGrid = document.querySelector("#pilotOnboardingGrid");
  els.pilotOnboardingChecklist = document.querySelector("#pilotOnboardingChecklist");
  els.openPilotOnboardingNext = document.querySelector("#openPilotOnboardingNext");
  els.prefillPilotOnboardingFollowup = document.querySelector("#prefillPilotOnboardingFollowup");
  els.copyPilotOnboarding = document.querySelector("#copyPilotOnboarding");
  els.exportPilotOnboarding = document.querySelector("#exportPilotOnboarding");
  els.pilotOnboardingResult = document.querySelector("#pilotOnboardingResult");
  els.pilotSuccessSummary = document.querySelector("#pilotSuccessSummary");
  els.pilotSuccessGrid = document.querySelector("#pilotSuccessGrid");
  els.pilotSuccessTimeline = document.querySelector("#pilotSuccessTimeline");
  els.openPilotSuccessNext = document.querySelector("#openPilotSuccessNext");
  els.prefillPilotSuccessOutreach = document.querySelector("#prefillPilotSuccessOutreach");
  els.copyPilotSuccess = document.querySelector("#copyPilotSuccess");
  els.exportPilotSuccess = document.querySelector("#exportPilotSuccess");
  els.pilotSuccessResult = document.querySelector("#pilotSuccessResult");
  els.pilotValueSummary = document.querySelector("#pilotValueSummary");
  els.pilotValueGrid = document.querySelector("#pilotValueGrid");
  els.pilotValueEvidence = document.querySelector("#pilotValueEvidence");
  els.openPilotValueNext = document.querySelector("#openPilotValueNext");
  els.prefillPilotValueConversion = document.querySelector("#prefillPilotValueConversion");
  els.copyPilotValue = document.querySelector("#copyPilotValue");
  els.exportPilotValue = document.querySelector("#exportPilotValue");
  els.pilotValueResult = document.querySelector("#pilotValueResult");
  els.pilotEvidenceSummary = document.querySelector("#pilotEvidenceSummary");
  els.pilotEvidenceForm = document.querySelector("#pilotEvidenceForm");
  els.pilotEvidenceAccount = document.querySelector("#pilotEvidenceAccount");
  els.pilotEvidenceType = document.querySelector("#pilotEvidenceType");
  els.pilotEvidenceStatus = document.querySelector("#pilotEvidenceStatus");
  els.pilotEvidenceImpact = document.querySelector("#pilotEvidenceImpact");
  els.pilotEvidenceDate = document.querySelector("#pilotEvidenceDate");
  els.pilotEvidenceTitle = document.querySelector("#pilotEvidenceEntryTitle");
  els.pilotEvidenceNote = document.querySelector("#pilotEvidenceNote");
  els.useDeskForPilotEvidence = document.querySelector("#useDeskForPilotEvidence");
  els.copyPilotEvidence = document.querySelector("#copyPilotEvidence");
  els.exportPilotEvidence = document.querySelector("#exportPilotEvidence");
  els.clearPilotEvidence = document.querySelector("#clearPilotEvidence");
  els.pilotEvidenceGrid = document.querySelector("#pilotEvidenceGrid");
  els.pilotEvidenceCount = document.querySelector("#pilotEvidenceCount");
  els.pilotEvidenceResult = document.querySelector("#pilotEvidenceResult");
  els.pilotProofPacketSummary = document.querySelector("#pilotProofPacketSummary");
  els.pilotProofPacketGrid = document.querySelector("#pilotProofPacketGrid");
  els.pilotProofPacketSections = document.querySelector("#pilotProofPacketSections");
  els.openPilotProofPacketNext = document.querySelector("#openPilotProofPacketNext");
  els.prefillProofPacketOutreach = document.querySelector("#prefillProofPacketOutreach");
  els.copyPilotProofPacket = document.querySelector("#copyPilotProofPacket");
  els.exportPilotProofPacket = document.querySelector("#exportPilotProofPacket");
  els.pilotProofPacketResult = document.querySelector("#pilotProofPacketResult");
  els.pilotCloseSummary = document.querySelector("#pilotCloseSummary");
  els.pilotCloseGrid = document.querySelector("#pilotCloseGrid");
  els.pilotCloseScripts = document.querySelector("#pilotCloseScripts");
  els.openPilotCloseNext = document.querySelector("#openPilotCloseNext");
  els.prefillPilotCloseConversion = document.querySelector("#prefillPilotCloseConversion");
  els.copyPilotCloseRoom = document.querySelector("#copyPilotCloseRoom");
  els.exportPilotCloseRoom = document.querySelector("#exportPilotCloseRoom");
  els.pilotCloseResult = document.querySelector("#pilotCloseResult");
  els.paidDeliverySummary = document.querySelector("#paidDeliverySummary");
  els.paidDeliveryGrid = document.querySelector("#paidDeliveryGrid");
  els.paidDeliveryTimeline = document.querySelector("#paidDeliveryTimeline");
  els.openPaidDeliveryNext = document.querySelector("#openPaidDeliveryNext");
  els.prefillPaidDeliveryFollowup = document.querySelector("#prefillPaidDeliveryFollowup");
  els.copyPaidDelivery = document.querySelector("#copyPaidDelivery");
  els.exportPaidDelivery = document.querySelector("#exportPaidDelivery");
  els.paidDeliveryResult = document.querySelector("#paidDeliveryResult");
  els.renewalExpansionSummary = document.querySelector("#renewalExpansionSummary");
  els.renewalExpansionGrid = document.querySelector("#renewalExpansionGrid");
  els.renewalExpansionPlays = document.querySelector("#renewalExpansionPlays");
  els.openRenewalExpansionNext = document.querySelector("#openRenewalExpansionNext");
  els.prefillRenewalExpansionFollowup = document.querySelector("#prefillRenewalExpansionFollowup");
  els.copyRenewalExpansion = document.querySelector("#copyRenewalExpansion");
  els.exportRenewalExpansion = document.querySelector("#exportRenewalExpansion");
  els.renewalExpansionResult = document.querySelector("#renewalExpansionResult");
  els.accountHealthSummary = document.querySelector("#accountHealthSummary");
  els.accountHealthGrid = document.querySelector("#accountHealthGrid");
  els.accountHealthRows = document.querySelector("#accountHealthRows");
  els.openAccountHealthNext = document.querySelector("#openAccountHealthNext");
  els.prefillAccountHealthFollowup = document.querySelector("#prefillAccountHealthFollowup");
  els.copyAccountHealth = document.querySelector("#copyAccountHealth");
  els.exportAccountHealth = document.querySelector("#exportAccountHealth");
  els.accountHealthResult = document.querySelector("#accountHealthResult");
  els.founderRevenueSummary = document.querySelector("#founderRevenueSummary");
  els.founderRevenueGrid = document.querySelector("#founderRevenueGrid");
  els.founderRevenueScenarios = document.querySelector("#founderRevenueScenarios");
  els.openFounderRevenueNext = document.querySelector("#openFounderRevenueNext");
  els.prefillFounderRevenueConversion = document.querySelector("#prefillFounderRevenueConversion");
  els.copyFounderRevenue = document.querySelector("#copyFounderRevenue");
  els.exportFounderRevenue = document.querySelector("#exportFounderRevenue");
  els.founderRevenueResult = document.querySelector("#founderRevenueResult");
  els.founderBoardSummary = document.querySelector("#founderBoardSummary");
  els.founderBoardGrid = document.querySelector("#founderBoardGrid");
  els.founderBoardSections = document.querySelector("#founderBoardSections");
  els.openFounderBoardNext = document.querySelector("#openFounderBoardNext");
  els.openFounderBoardRevenue = document.querySelector("#openFounderBoardRevenue");
  els.copyFounderBoard = document.querySelector("#copyFounderBoard");
  els.exportFounderBoard = document.querySelector("#exportFounderBoard");
  els.founderBoardResult = document.querySelector("#founderBoardResult");
  els.founderDiligenceSummary = document.querySelector("#founderDiligenceSummary");
  els.founderDiligenceGrid = document.querySelector("#founderDiligenceGrid");
  els.founderDiligenceQuestions = document.querySelector("#founderDiligenceQuestions");
  els.openFounderDiligenceNext = document.querySelector("#openFounderDiligenceNext");
  els.openFounderDiligenceBoard = document.querySelector("#openFounderDiligenceBoard");
  els.copyFounderDiligence = document.querySelector("#copyFounderDiligence");
  els.exportFounderDiligence = document.querySelector("#exportFounderDiligence");
  els.founderDiligenceResult = document.querySelector("#founderDiligenceResult");
  els.investorDataSummary = document.querySelector("#investorDataSummary");
  els.investorDataGrid = document.querySelector("#investorDataGrid");
  els.investorDataPackage = document.querySelector("#investorDataPackage");
  els.openInvestorDataNext = document.querySelector("#openInvestorDataNext");
  els.openInvestorDataDiligence = document.querySelector("#openInvestorDataDiligence");
  els.copyInvestorDataRoom = document.querySelector("#copyInvestorDataRoom");
  els.exportInvestorDataRoom = document.querySelector("#exportInvestorDataRoom");
  els.investorDataResult = document.querySelector("#investorDataResult");
  els.investorIntroSummary = document.querySelector("#investorIntroSummary");
  els.investorIntroGrid = document.querySelector("#investorIntroGrid");
  els.investorIntroDrafts = document.querySelector("#investorIntroDrafts");
  els.openInvestorIntroNext = document.querySelector("#openInvestorIntroNext");
  els.openInvestorIntroData = document.querySelector("#openInvestorIntroData");
  els.copyInvestorIntroRoom = document.querySelector("#copyInvestorIntroRoom");
  els.exportInvestorIntroRoom = document.querySelector("#exportInvestorIntroRoom");
  els.investorIntroResult = document.querySelector("#investorIntroResult");
  els.investorReplySummary = document.querySelector("#investorReplySummary");
  els.investorReplyGrid = document.querySelector("#investorReplyGrid");
  els.investorReplyRows = document.querySelector("#investorReplyRows");
  els.openInvestorReplyNext = document.querySelector("#openInvestorReplyNext");
  els.openInvestorReplyIntro = document.querySelector("#openInvestorReplyIntro");
  els.copyInvestorReplyPipeline = document.querySelector("#copyInvestorReplyPipeline");
  els.exportInvestorReplyPipeline = document.querySelector("#exportInvestorReplyPipeline");
  els.investorReplyResult = document.querySelector("#investorReplyResult");
  els.investorMeetingSummary = document.querySelector("#investorMeetingSummary");
  els.investorMeetingGrid = document.querySelector("#investorMeetingGrid");
  els.investorMeetingAgenda = document.querySelector("#investorMeetingAgenda");
  els.openInvestorMeetingNext = document.querySelector("#openInvestorMeetingNext");
  els.openInvestorMeetingReply = document.querySelector("#openInvestorMeetingReply");
  els.copyInvestorMeetingPrep = document.querySelector("#copyInvestorMeetingPrep");
  els.exportInvestorMeetingPrep = document.querySelector("#exportInvestorMeetingPrep");
  els.investorMeetingResult = document.querySelector("#investorMeetingResult");
  els.investorFollowSummary = document.querySelector("#investorFollowSummary");
  els.investorFollowGrid = document.querySelector("#investorFollowGrid");
  els.investorFollowRows = document.querySelector("#investorFollowRows");
  els.openInvestorFollowNext = document.querySelector("#openInvestorFollowNext");
  els.openInvestorFollowMeeting = document.querySelector("#openInvestorFollowMeeting");
  els.copyInvestorFollowThrough = document.querySelector("#copyInvestorFollowThrough");
  els.exportInvestorFollowThrough = document.querySelector("#exportInvestorFollowThrough");
  els.investorFollowResult = document.querySelector("#investorFollowResult");
  els.investorMomentumSummary = document.querySelector("#investorMomentumSummary");
  els.investorMomentumGrid = document.querySelector("#investorMomentumGrid");
  els.investorMomentumRows = document.querySelector("#investorMomentumRows");
  els.openInvestorMomentumNext = document.querySelector("#openInvestorMomentumNext");
  els.openInvestorMomentumFollow = document.querySelector("#openInvestorMomentumFollow");
  els.copyInvestorMomentumLedger = document.querySelector("#copyInvestorMomentumLedger");
  els.exportInvestorMomentumLedger = document.querySelector("#exportInvestorMomentumLedger");
  els.investorMomentumResult = document.querySelector("#investorMomentumResult");
  els.investorUpdateSummary = document.querySelector("#investorUpdateSummary");
  els.investorUpdateGrid = document.querySelector("#investorUpdateGrid");
  els.investorUpdateDrafts = document.querySelector("#investorUpdateDrafts");
  els.openInvestorUpdateNext = document.querySelector("#openInvestorUpdateNext");
  els.openInvestorUpdateMomentum = document.querySelector("#openInvestorUpdateMomentum");
  els.copyInvestorUpdateComposer = document.querySelector("#copyInvestorUpdateComposer");
  els.exportInvestorUpdateComposer = document.querySelector("#exportInvestorUpdateComposer");
  els.investorUpdateResult = document.querySelector("#investorUpdateResult");
  els.investorObjectionSummary = document.querySelector("#investorObjectionSummary");
  els.investorObjectionGrid = document.querySelector("#investorObjectionGrid");
  els.investorObjectionRows = document.querySelector("#investorObjectionRows");
  els.openInvestorObjectionNext = document.querySelector("#openInvestorObjectionNext");
  els.openInvestorObjectionUpdate = document.querySelector("#openInvestorObjectionUpdate");
  els.copyInvestorObjectionDesk = document.querySelector("#copyInvestorObjectionDesk");
  els.exportInvestorObjectionDesk = document.querySelector("#exportInvestorObjectionDesk");
  els.investorObjectionResult = document.querySelector("#investorObjectionResult");
  els.investorCommitmentSummary = document.querySelector("#investorCommitmentSummary");
  els.investorCommitmentGrid = document.querySelector("#investorCommitmentGrid");
  els.investorCommitmentRows = document.querySelector("#investorCommitmentRows");
  els.openInvestorCommitmentNext = document.querySelector("#openInvestorCommitmentNext");
  els.openInvestorCommitmentObjection = document.querySelector("#openInvestorCommitmentObjection");
  els.copyInvestorCommitmentTracker = document.querySelector("#copyInvestorCommitmentTracker");
  els.exportInvestorCommitmentTracker = document.querySelector("#exportInvestorCommitmentTracker");
  els.investorCommitmentResult = document.querySelector("#investorCommitmentResult");
  els.investorCloseSummary = document.querySelector("#investorCloseSummary");
  els.investorCloseGrid = document.querySelector("#investorCloseGrid");
  els.investorCloseRows = document.querySelector("#investorCloseRows");
  els.openInvestorCloseNext = document.querySelector("#openInvestorCloseNext");
  els.openInvestorCloseCommitment = document.querySelector("#openInvestorCloseCommitment");
  els.copyInvestorClosePlan = document.querySelector("#copyInvestorClosePlan");
  els.exportInvestorClosePlan = document.querySelector("#exportInvestorClosePlan");
  els.investorCloseResult = document.querySelector("#investorCloseResult");
  els.investorTermsSummary = document.querySelector("#investorTermsSummary");
  els.investorTermsGrid = document.querySelector("#investorTermsGrid");
  els.investorTermsRows = document.querySelector("#investorTermsRows");
  els.openInvestorTermsNext = document.querySelector("#openInvestorTermsNext");
  els.openInvestorTermsClosePlan = document.querySelector("#openInvestorTermsClosePlan");
  els.copyInvestorTermsRoom = document.querySelector("#copyInvestorTermsRoom");
  els.exportInvestorTermsRoom = document.querySelector("#exportInvestorTermsRoom");
  els.investorTermsResult = document.querySelector("#investorTermsResult");
  els.investorIcSummary = document.querySelector("#investorIcSummary");
  els.investorIcGrid = document.querySelector("#investorIcGrid");
  els.investorIcRows = document.querySelector("#investorIcRows");
  els.openInvestorIcNext = document.querySelector("#openInvestorIcNext");
  els.openInvestorIcTerms = document.querySelector("#openInvestorIcTerms");
  els.copyInvestorIcMemo = document.querySelector("#copyInvestorIcMemo");
  els.exportInvestorIcMemo = document.querySelector("#exportInvestorIcMemo");
  els.investorIcResult = document.querySelector("#investorIcResult");
  els.investorDecisionSummary = document.querySelector("#investorDecisionSummary");
  els.investorDecisionGrid = document.querySelector("#investorDecisionGrid");
  els.investorDecisionRows = document.querySelector("#investorDecisionRows");
  els.openInvestorDecisionNext = document.querySelector("#openInvestorDecisionNext");
  els.openInvestorDecisionIc = document.querySelector("#openInvestorDecisionIc");
  els.copyInvestorDecisionRoom = document.querySelector("#copyInvestorDecisionRoom");
  els.exportInvestorDecisionRoom = document.querySelector("#exportInvestorDecisionRoom");
  els.investorDecisionResult = document.querySelector("#investorDecisionResult");
  els.fundingRoundSummary = document.querySelector("#fundingRoundSummary");
  els.fundingRoundGrid = document.querySelector("#fundingRoundGrid");
  els.fundingRoundRows = document.querySelector("#fundingRoundRows");
  els.openFundingRoundNext = document.querySelector("#openFundingRoundNext");
  els.openFundingRoundDecision = document.querySelector("#openFundingRoundDecision");
  els.copyFundingRoundCommand = document.querySelector("#copyFundingRoundCommand");
  els.exportFundingRoundCommand = document.querySelector("#exportFundingRoundCommand");
  els.fundingRoundResult = document.querySelector("#fundingRoundResult");
  els.boardPackWarSummary = document.querySelector("#boardPackWarSummary");
  els.boardPackWarGrid = document.querySelector("#boardPackWarGrid");
  els.boardPackWarRows = document.querySelector("#boardPackWarRows");
  els.openBoardPackWarNext = document.querySelector("#openBoardPackWarNext");
  els.openBoardPackWarRound = document.querySelector("#openBoardPackWarRound");
  els.copyBoardPackWarRoom = document.querySelector("#copyBoardPackWarRoom");
  els.exportBoardPackWarRoom = document.querySelector("#exportBoardPackWarRoom");
  els.boardPackWarResult = document.querySelector("#boardPackWarResult");
  els.pagesDoctorSummary = document.querySelector("#pagesDoctorSummary");
  els.pagesDoctorGrid = document.querySelector("#pagesDoctorGrid");
  els.pagesDoctorStatus = document.querySelector("#pagesDoctorStatus");
  els.pagesDoctorChecklist = document.querySelector("#pagesDoctorChecklist");
  els.copyPagesDoctorChecklist = document.querySelector("#copyPagesDoctorChecklist");
  els.openLivePagesUrl = document.querySelector("#openLivePagesUrl");
  els.pagesDoctorResult = document.querySelector("#pagesDoctorResult");
  els.scrollTopButton = document.querySelector("#scrollTopButton");
  els.launchControlStatus = document.querySelector("#launchControlStatus");
  els.launchControlSummary = document.querySelector("#launchControlSummary");
  els.launchControlStats = document.querySelector("#launchControlStats");
  els.launchBlockerCount = document.querySelector("#launchBlockerCount");
  els.launchBlockerList = document.querySelector("#launchBlockerList");
  els.launchCompanyList = document.querySelector("#launchCompanyList");
  els.launchTestPlan = document.querySelector("#launchTestPlan");
  els.openLaunchBlocker = document.querySelector("#openLaunchBlocker");
  els.exportLaunchAudit = document.querySelector("#exportLaunchAudit");
  els.copyLaunchChecklist = document.querySelector("#copyLaunchChecklist");
  els.launchControlResult = document.querySelector("#launchControlResult");
  els.evidenceList = document.querySelector("#evidenceList");
  els.evidenceCount = document.querySelector("#evidenceCount");
  els.signalCanvas = document.querySelector("#signalCanvas");
  els.signalStamp = document.querySelector("#signalStamp");
  els.valuationTicker = document.querySelector("#valuationTicker");
  els.growthSlider = document.querySelector("#growthSlider");
  els.marginSlider = document.querySelector("#marginSlider");
  els.multipleSlider = document.querySelector("#multipleSlider");
  els.discountSlider = document.querySelector("#discountSlider");
  els.growthValue = document.querySelector("#growthValue");
  els.marginValue = document.querySelector("#marginValue");
  els.multipleValue = document.querySelector("#multipleValue");
  els.discountValue = document.querySelector("#discountValue");
  els.valuePerShare = document.querySelector("#valuePerShare");
  els.equityValue = document.querySelector("#equityValue");
  els.valuationFootnote = document.querySelector("#valuationFootnote");
  els.saveValuationCase = document.querySelector("#saveValuationCase");
  els.valuationCaseList = document.querySelector("#valuationCaseList");
  els.companyDossier = document.querySelector("#companyDossier");
  els.copyBrief = document.querySelector("#copyBrief");
  els.saveBrief = document.querySelector("#saveBrief");
  els.exportBrief = document.querySelector("#exportBrief");
  els.exportPdfBrief = document.querySelector("#exportPdfBrief");
  els.notebookList = document.querySelector("#notebookList");
  els.clearNotes = document.querySelector("#clearNotes");
  els.waitlistForm = document.querySelector("#waitlistForm");
  els.waitlistEmail = document.querySelector("#waitlistEmail");
  els.waitlistProfile = document.querySelector("#waitlistProfile");
  els.waitlistPlan = document.querySelector("#waitlistPlan");
  els.waitlistNeed = document.querySelector("#waitlistNeed");
  els.waitlistTickers = document.querySelector("#waitlistTickers");
  els.waitlistQuestion = document.querySelector("#waitlistQuestion");
  els.waitlistResult = document.querySelector("#waitlistResult");
  els.sourcePackForm = document.querySelector("#sourcePackForm");
  els.sourceBuilderTicker = document.querySelector("#sourceBuilderTicker");
  els.sourceBuilderType = document.querySelector("#sourceBuilderType");
  els.sourceBuilderStatus = document.querySelector("#sourceBuilderStatus");
  els.sourceBuilderPeriod = document.querySelector("#sourceBuilderPeriod");
  els.sourceBuilderDate = document.querySelector("#sourceBuilderDate");
  els.sourceBuilderUrl = document.querySelector("#sourceBuilderUrl");
  els.sourceBuilderTitleInput = document.querySelector("#sourceBuilderTitleInput");
  els.sourceBuilderSections = document.querySelector("#sourceBuilderSections");
  els.activeSourceTask = document.querySelector("#activeSourceTask");
  els.sourceAssistantText = document.querySelector("#sourceAssistantText");
  els.applySourceAssistant = document.querySelector("#applySourceAssistant");
  els.loadSampleFiling = document.querySelector("#loadSampleFiling");
  els.runSourceIntakeDoctor = document.querySelector("#runSourceIntakeDoctor");
  els.copySourceCitationNote = document.querySelector("#copySourceCitationNote");
  els.clearSourceAssistant = document.querySelector("#clearSourceAssistant");
  els.filingCapturePreview = document.querySelector("#filingCapturePreview");
  els.sourceIntakeDoctor = document.querySelector("#source-intake-doctor");
  els.sourceAssistantLinks = document.querySelector("#sourceAssistantLinks");
  els.sourceAssistantResult = document.querySelector("#sourceAssistantResult");
  els.sourceConfidenceChecklist = document.querySelector("#sourceConfidenceChecklist");
  els.sourceBuilderResult = document.querySelector("#sourceBuilderResult");
  els.exportSourcePack = document.querySelector("#exportSourcePack");
  els.exportMergedDocuments = document.querySelector("#exportMergedDocuments");
  els.returnToDossier = document.querySelector("#returnToDossier");
  els.sourcePackJsonInput = document.querySelector("#sourcePackJsonInput");
  els.clearSourcePack = document.querySelector("#clearSourcePack");
  els.sourcePackList = document.querySelector("#sourcePackList");
  els.sourcePackCount = document.querySelector("#sourcePackCount");
  els.exportReadiness = document.querySelector("#exportReadiness");
  els.matrixTickerFilter = document.querySelector("#matrixTickerFilter");
  els.matrixStatusFilter = document.querySelector("#matrixStatusFilter");
  els.matrixNextGap = document.querySelector("#matrixNextGap");
  els.copyCoverageMatrix = document.querySelector("#copyCoverageMatrix");
  els.downloadCoverageMatrix = document.querySelector("#downloadCoverageMatrix");
  els.sourceMatrixSummary = document.querySelector("#sourceMatrixSummary");
  els.sourceMatrix = document.querySelector("#sourceMatrix");
  els.sourceMatrixResult = document.querySelector("#sourceMatrixResult");
  els.sourceMatrixExport = document.querySelector("#sourceMatrixExport");
  els.realStarterSummary = document.querySelector("#realStarterSummary");
  els.realStarterGrid = document.querySelector("#realStarterGrid");
  els.realStarterResult = document.querySelector("#realStarterResult");
  els.queueTickerFilter = document.querySelector("#queueTickerFilter");
  els.queueStatusFilter = document.querySelector("#queueStatusFilter");
  els.generateSourceTasks = document.querySelector("#generateSourceTasks");
  els.exportChecklistCsv = document.querySelector("#exportChecklistCsv");
  els.copyChecklistCsv = document.querySelector("#copyChecklistCsv");
  els.sourceQueueSummary = document.querySelector("#sourceQueueSummary");
  els.sourceQueueList = document.querySelector("#sourceQueueList");
  els.sourceQueueResult = document.querySelector("#sourceQueueResult");
  els.hubTickerSelect = document.querySelector("#hubTickerSelect");
  els.hubRequirementSelect = document.querySelector("#hubRequirementSelect");
  els.sourceHubTask = document.querySelector("#sourceHubTask");
  els.sourceLinkPanel = document.querySelector("#sourceLinkPanel");
  els.loadHubTask = document.querySelector("#loadHubTask");
  els.copyHubTask = document.querySelector("#copyHubTask");
  els.exportAssistantTasks = document.querySelector("#exportAssistantTasks");
  els.sourceHubResult = document.querySelector("#sourceHubResult");
  els.workspaceFilter = document.querySelector("#workspaceFilter");
  els.workspaceBatchSize = document.querySelector("#workspaceBatchSize");
  els.buildWorkspaceBatch = document.querySelector("#buildWorkspaceBatch");
  els.exportWorkspaceProgress = document.querySelector("#exportWorkspaceProgress");
  els.exportWorkspacePack = document.querySelector("#exportWorkspacePack");
  els.sourceWorkspaceSummary = document.querySelector("#sourceWorkspaceSummary");
  els.sourceWorkspaceList = document.querySelector("#sourceWorkspaceList");
  els.sourceWorkspaceResult = document.querySelector("#sourceWorkspaceResult");
}

function normalizeCompanyRecord(company) {
  return {
    ...company,
    ticker: normalizeTicker(company.ticker),
    riskFactors: Array.isArray(company.riskFactors) ? company.riskFactors : []
  };
}

function normalizeDocumentRecord(doc, fallbackStatus = "synthetic") {
  return {
    ...doc,
    ticker: normalizeTicker(doc.ticker),
    sourceStatus: normalizeSourceStatus(doc.sourceStatus || fallbackStatus),
    sourceLabel: doc.sourceLabel || defaultSourceLabel(doc.sourceStatus || fallbackStatus),
    sourceUrl: doc.sourceUrl || "",
    sections: Array.isArray(doc.sections) ? doc.sections : []
  };
}

function getDefaultWatchlistTickers() {
  const defaultWatchlist = (WATCHLIST_CONFIG.watchlists || []).find((watchlist) => watchlist.id === WATCHLIST_CONFIG.defaultWatchlist)
    || (WATCHLIST_CONFIG.watchlists || [])[0];
  const tickers = defaultWatchlist ? defaultWatchlist.tickers : SAMPLE_COMPANIES.map((company) => company.ticker);
  return tickers.filter((ticker) => SAMPLE_COMPANIES.some((company) => company.ticker === ticker));
}

function bindEvents() {
  els.queryForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitCurrentQuestion();
  });

  els.queryInput.addEventListener("input", () => {
    syncTickerFocus(els.queryInput.value);
  });

  els.memoShortcuts.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const prompt = makeMemoPrompt(button.dataset.memo);
      els.queryInput.value = prompt;
      runAnalysis(prompt);
    });
  });

  els.scanFilingButton.addEventListener("click", (event) => {
    event.preventDefault();
    scanFilingFromCurrentQuestion();
  });
  els.runAnalysisButton.addEventListener("click", (event) => {
    event.preventDefault();
    submitCurrentQuestion();
  });

  if (els.onlySelectedTicker) {
    els.onlySelectedTicker.addEventListener("change", () => {
      state.onlySelectedTicker = els.onlySelectedTicker.checked;
      if (els.queryInput.value.trim() && state.currentCitations.length) {
        runAnalysis(els.queryInput.value.trim());
      }
    });
  }

  document.querySelectorAll(".segment").forEach((button) => {
    button.addEventListener("click", () => {
      state.answerDepth = button.dataset.depth;
      document.querySelectorAll(".segment").forEach((candidate) => candidate.classList.toggle("is-active", candidate === button));
      if (els.queryInput.value.trim()) {
        runAnalysis(els.queryInput.value.trim());
      }
    });
  });

  els.selectAllTickers.addEventListener("click", () => {
    state.activeTickers = new Set(getCompanies().map((company) => company.ticker));
    renderCoverage();
    renderContextBand();
    renderCompanyDossier();
    drawSignalMap();
  });

  els.fileInput.addEventListener("change", async () => {
    const files = Array.from(els.fileInput.files || []);
    await processFiles(files);
    els.fileInput.value = "";
  });

  els.importTickerSelect.addEventListener("change", () => {
    els.pasteTicker.value = els.importTickerSelect.value;
    state.selectedTicker = els.importTickerSelect.value;
    renderValuationOptions();
    renderCompanyDossier();
    updateValuationFromCompany();
    updateValuation();
    drawSignalMap();
  });

  els.fileDrop.addEventListener("dragover", (event) => {
    event.preventDefault();
    els.fileDrop.classList.add("is-dragging");
  });

  els.fileDrop.addEventListener("dragleave", () => {
    els.fileDrop.classList.remove("is-dragging");
  });

  els.fileDrop.addEventListener("drop", async (event) => {
    event.preventDefault();
    els.fileDrop.classList.remove("is-dragging");
    const files = Array.from(event.dataTransfer.files || []);
    await processFiles(files);
  });

  els.pasteForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const text = els.pasteText.value.trim().slice(0, MAX_SOURCE_TEXT_CHARS);
    if (!text) {
      els.pasteText.focus();
      return;
    }
    const added = addUploadedDocs([
      makeUploadedDoc({
        ticker: els.pasteTicker.value,
        title: els.pasteTitle.value,
        type: els.pasteType.value,
        text
      })
    ]);
    state.importReport = makeImportReport(added, []);
    renderImportSummary();
    els.pasteText.value = "";
  });

  els.clearUploads.addEventListener("click", () => {
    state.uploadedDocs = [];
    rebuildDocumentCorpus();
    state.activeTickers = new Set(SAMPLE_COMPANIES.map((company) => company.ticker));
    for (const doc of state.sourcePackDocs) {
      state.activeTickers.add(doc.ticker);
    }
    saveJson(STORAGE_KEYS.uploads, []);
    state.importReport = null;
    renderImportSummary();
    renderCoverage();
    renderLibrary();
    renderImportTickerOptions();
    renderContextBand();
    renderValuationOptions();
    renderCompanyDossier();
    updateValuationFromCompany();
    updateValuation();
    drawSignalMap();
  });

  els.valuationTicker.addEventListener("change", () => {
    state.selectedTicker = els.valuationTicker.value;
    updateValuationFromCompany();
    updateValuation();
    renderCompanyDossier();
    drawSignalMap();
  });

  [els.growthSlider, els.marginSlider, els.multipleSlider, els.discountSlider].forEach((slider) => {
    slider.addEventListener("input", updateValuation);
  });

  els.saveValuationCase.addEventListener("click", saveValuationCase);
  els.copyBrief.addEventListener("click", copyCurrentBrief);
  els.saveBrief.addEventListener("click", saveCurrentBrief);
  if (els.exportPdfBrief) {
    els.exportPdfBrief.addEventListener("click", exportPdfBrief);
  }
  els.exportBrief.addEventListener("click", exportCurrentBrief);
  if (els.copyBriefPacket) {
    els.copyBriefPacket.addEventListener("click", copyBriefPacket);
  }
  if (els.exportBriefPacketJson) {
    els.exportBriefPacketJson.addEventListener("click", exportBriefPacketJson);
  }
  if (els.openBriefNextGap) {
    els.openBriefNextGap.addEventListener("click", openBriefNextGap);
  }
  if (els.runInvestmentGate) {
    els.runInvestmentGate.addEventListener("click", () => {
      renderInvestmentGate({ focus: true });
      flashInvestmentGateResult("Investment Readiness Gate refreshed.", "neutral");
    });
  }
  if (els.openInvestmentGateGap) {
    els.openInvestmentGateGap.addEventListener("click", openInvestmentGateGap);
  }
  if (els.copyInvestmentGateNote) {
    els.copyInvestmentGateNote.addEventListener("click", copyInvestmentGateNote);
  }
  if (els.memoReviewForm) {
    els.memoReviewForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveMemoReview();
    });
  }
  if (els.exportMemoReviews) {
    els.exportMemoReviews.addEventListener("click", exportMemoReviewLog);
  }
  if (els.copyMemoReviews) {
    els.copyMemoReviews.addEventListener("click", copyMemoReviewLog);
  }
  if (els.clearMemoReviews) {
    els.clearMemoReviews.addEventListener("click", clearMemoReviews);
  }
  if (els.decisionJournalForm) {
    els.decisionJournalForm.addEventListener("submit", (event) => {
      event.preventDefault();
      saveDecisionJournalEntry();
    });
  }
  if (els.exportDecisionJournal) {
    els.exportDecisionJournal.addEventListener("click", exportDecisionJournalLog);
  }
  if (els.copyDecisionJournal) {
    els.copyDecisionJournal.addEventListener("click", copyDecisionJournalLog);
  }
  if (els.clearDecisionJournal) {
    els.clearDecisionJournal.addEventListener("click", clearDecisionJournal);
  }
  if (els.copyPagesDoctorChecklist) {
    els.copyPagesDoctorChecklist.addEventListener("click", copyPagesDoctorChecklist);
  }
  if (els.openLivePagesUrl) {
    els.openLivePagesUrl.addEventListener("click", () => {
      window.open(LIVE_PAGES_URL, "_blank", "noopener,noreferrer");
    });
  }
  if (els.pilotSessionForm) {
    els.pilotSessionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      savePilotSession();
    });
  }
  if (els.prefillPilotSession) {
    els.prefillPilotSession.addEventListener("click", prefillPilotSessionFromDesk);
  }
  if (els.exportPilotSessions) {
    els.exportPilotSessions.addEventListener("click", exportPilotSessions);
  }
  if (els.copyPilotSessions) {
    els.copyPilotSessions.addEventListener("click", copyPilotSessions);
  }
  if (els.clearPilotSessions) {
    els.clearPilotSessions.addEventListener("click", clearPilotSessions);
  }
  if (els.pilotFollowupForm) {
    els.pilotFollowupForm.addEventListener("submit", (event) => {
      event.preventDefault();
      savePilotFollowup();
    });
  }
  if (els.prefillPilotFollowup) {
    els.prefillPilotFollowup.addEventListener("click", prefillPilotFollowupFromLatestSession);
  }
  if (els.exportPilotFollowups) {
    els.exportPilotFollowups.addEventListener("click", exportPilotFollowups);
  }
  if (els.copyPilotFollowups) {
    els.copyPilotFollowups.addEventListener("click", copyPilotFollowups);
  }
  if (els.clearPilotFollowups) {
    els.clearPilotFollowups.addEventListener("click", clearPilotFollowups);
  }
  if (els.pilotOutreachForm) {
    els.pilotOutreachForm.addEventListener("submit", (event) => {
      event.preventDefault();
      generatePilotOutreachDraft();
    });
  }
  if (els.prefillPilotOutreach) {
    els.prefillPilotOutreach.addEventListener("click", prefillPilotOutreachFromFollowup);
  }
  if (els.copyPilotOutreach) {
    els.copyPilotOutreach.addEventListener("click", copyLatestPilotOutreach);
  }
  if (els.exportPilotOutreach) {
    els.exportPilotOutreach.addEventListener("click", exportPilotOutreachDrafts);
  }
  if (els.clearPilotOutreach) {
    els.clearPilotOutreach.addEventListener("click", clearPilotOutreachDrafts);
  }
  if (els.pilotConversionForm) {
    els.pilotConversionForm.addEventListener("submit", (event) => {
      event.preventDefault();
      savePilotConversion();
    });
  }
  if (els.prefillPilotConversion) {
    els.prefillPilotConversion.addEventListener("click", prefillPilotConversionFromPipeline);
  }
  if (els.exportPilotConversions) {
    els.exportPilotConversions.addEventListener("click", exportPilotConversions);
  }
  if (els.copyPilotConversions) {
    els.copyPilotConversions.addEventListener("click", copyPilotConversions);
  }
  if (els.clearPilotConversions) {
    els.clearPilotConversions.addEventListener("click", clearPilotConversions);
  }
  if (els.openSessionSnapshotNext) {
    els.openSessionSnapshotNext.addEventListener("click", openSessionSnapshotNextAction);
  }
  if (els.copySessionSnapshot) {
    els.copySessionSnapshot.addEventListener("click", copySessionSnapshot);
  }
  if (els.exportSessionSnapshot) {
    els.exportSessionSnapshot.addEventListener("click", exportSessionSnapshot);
  }
  if (els.openReleaseLiveUrl) {
    els.openReleaseLiveUrl.addEventListener("click", () => {
      window.open(LIVE_PAGES_URL, "_blank", "noopener,noreferrer");
    });
  }
  if (els.openReleaseDoctor) {
    els.openReleaseDoctor.addEventListener("click", () => {
      document.querySelector("#pages-deployment-doctor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      flashReleaseHandoffResult("Opened Pages Doctor.", "neutral");
    });
  }
  if (els.copyReleaseHandoff) {
    els.copyReleaseHandoff.addEventListener("click", copyReleaseHandoff);
  }
  if (els.exportReleaseHandoff) {
    els.exportReleaseHandoff.addEventListener("click", exportReleaseHandoff);
  }
  if (els.openSmokeTestNext) {
    els.openSmokeTestNext.addEventListener("click", openSmokeTestNextAction);
  }
  if (els.openSmokeTestDoctor) {
    els.openSmokeTestDoctor.addEventListener("click", () => {
      document.querySelector("#pages-deployment-doctor")?.scrollIntoView({ behavior: "smooth", block: "start" });
      flashSmokeTestResult("Opened Pages Doctor.", "neutral");
    });
  }
  if (els.copySmokeTestReport) {
    els.copySmokeTestReport.addEventListener("click", copySmokeTestReport);
  }
  if (els.exportSmokeTestReport) {
    els.exportSmokeTestReport.addEventListener("click", exportSmokeTestReport);
  }
  if (els.openDemoScriptNext) {
    els.openDemoScriptNext.addEventListener("click", openDemoScriptNextStep);
  }
  if (els.prefillDemoPilotSession) {
    els.prefillDemoPilotSession.addEventListener("click", prefillPilotSessionFromDemoScript);
  }
  if (els.copyDemoScript) {
    els.copyDemoScript.addEventListener("click", copyDemoScript);
  }
  if (els.exportDemoScript) {
    els.exportDemoScript.addEventListener("click", exportDemoScript);
  }
  if (els.openLearningLoopNext) {
    els.openLearningLoopNext.addEventListener("click", openLearningLoopNextAction);
  }
  if (els.copyLearningLoop) {
    els.copyLearningLoop.addEventListener("click", copyPilotLearningLoop);
  }
  if (els.exportLearningLoop) {
    els.exportLearningLoop.addEventListener("click", exportPilotLearningLoop);
  }
  if (els.openFounderReviewNext) {
    els.openFounderReviewNext.addEventListener("click", openFounderReviewNextDecision);
  }
  if (els.copyFounderReview) {
    els.copyFounderReview.addEventListener("click", copyFounderWeeklyReview);
  }
  if (els.exportFounderReview) {
    els.exportFounderReview.addEventListener("click", exportFounderWeeklyReview);
  }
  if (els.openPilotOnboardingNext) {
    els.openPilotOnboardingNext.addEventListener("click", openPilotOnboardingNextAction);
  }
  if (els.prefillPilotOnboardingFollowup) {
    els.prefillPilotOnboardingFollowup.addEventListener("click", prefillPilotOnboardingFollowup);
  }
  if (els.copyPilotOnboarding) {
    els.copyPilotOnboarding.addEventListener("click", copyPilotOnboardingPlan);
  }
  if (els.exportPilotOnboarding) {
    els.exportPilotOnboarding.addEventListener("click", exportPilotOnboardingPlan);
  }
  if (els.openPilotSuccessNext) {
    els.openPilotSuccessNext.addEventListener("click", openPilotSuccessNextMilestone);
  }
  if (els.prefillPilotSuccessOutreach) {
    els.prefillPilotSuccessOutreach.addEventListener("click", prefillPilotSuccessOutreach);
  }
  if (els.copyPilotSuccess) {
    els.copyPilotSuccess.addEventListener("click", copyPilotSuccessPlan);
  }
  if (els.exportPilotSuccess) {
    els.exportPilotSuccess.addEventListener("click", exportPilotSuccessPlan);
  }
  if (els.openPilotValueNext) {
    els.openPilotValueNext.addEventListener("click", openPilotValueNextProof);
  }
  if (els.prefillPilotValueConversion) {
    els.prefillPilotValueConversion.addEventListener("click", prefillPilotValueConversion);
  }
  if (els.copyPilotValue) {
    els.copyPilotValue.addEventListener("click", copyPilotValueProof);
  }
  if (els.exportPilotValue) {
    els.exportPilotValue.addEventListener("click", exportPilotValueProof);
  }
  if (els.pilotEvidenceForm) {
    els.pilotEvidenceForm.addEventListener("submit", (event) => {
      event.preventDefault();
      savePilotEvidenceEntry();
    });
  }
  if (els.useDeskForPilotEvidence) {
    els.useDeskForPilotEvidence.addEventListener("click", prefillPilotEvidenceFromDesk);
  }
  if (els.copyPilotEvidence) {
    els.copyPilotEvidence.addEventListener("click", copyPilotEvidenceLedger);
  }
  if (els.exportPilotEvidence) {
    els.exportPilotEvidence.addEventListener("click", exportPilotEvidenceLedger);
  }
  if (els.clearPilotEvidence) {
    els.clearPilotEvidence.addEventListener("click", clearPilotEvidenceLedger);
  }
  if (els.openPilotProofPacketNext) {
    els.openPilotProofPacketNext.addEventListener("click", openPilotProofPacketNext);
  }
  if (els.prefillProofPacketOutreach) {
    els.prefillProofPacketOutreach.addEventListener("click", prefillProofPacketOutreach);
  }
  if (els.copyPilotProofPacket) {
    els.copyPilotProofPacket.addEventListener("click", copyPilotProofPacket);
  }
  if (els.exportPilotProofPacket) {
    els.exportPilotProofPacket.addEventListener("click", exportPilotProofPacket);
  }
  if (els.openPilotCloseNext) {
    els.openPilotCloseNext.addEventListener("click", openPilotCloseNext);
  }
  if (els.prefillPilotCloseConversion) {
    els.prefillPilotCloseConversion.addEventListener("click", prefillPilotCloseConversion);
  }
  if (els.copyPilotCloseRoom) {
    els.copyPilotCloseRoom.addEventListener("click", copyPilotCloseRoom);
  }
  if (els.exportPilotCloseRoom) {
    els.exportPilotCloseRoom.addEventListener("click", exportPilotCloseRoom);
  }
  if (els.openPaidDeliveryNext) {
    els.openPaidDeliveryNext.addEventListener("click", openPaidDeliveryNext);
  }
  if (els.prefillPaidDeliveryFollowup) {
    els.prefillPaidDeliveryFollowup.addEventListener("click", prefillPaidDeliveryFollowup);
  }
  if (els.copyPaidDelivery) {
    els.copyPaidDelivery.addEventListener("click", copyPaidDeliveryBoard);
  }
  if (els.exportPaidDelivery) {
    els.exportPaidDelivery.addEventListener("click", exportPaidDeliveryBoard);
  }
  if (els.openRenewalExpansionNext) {
    els.openRenewalExpansionNext.addEventListener("click", openRenewalExpansionNext);
  }
  if (els.prefillRenewalExpansionFollowup) {
    els.prefillRenewalExpansionFollowup.addEventListener("click", prefillRenewalExpansionFollowup);
  }
  if (els.copyRenewalExpansion) {
    els.copyRenewalExpansion.addEventListener("click", copyRenewalExpansionBoard);
  }
  if (els.exportRenewalExpansion) {
    els.exportRenewalExpansion.addEventListener("click", exportRenewalExpansionBoard);
  }
  if (els.openAccountHealthNext) {
    els.openAccountHealthNext.addEventListener("click", openAccountHealthNext);
  }
  if (els.prefillAccountHealthFollowup) {
    els.prefillAccountHealthFollowup.addEventListener("click", prefillAccountHealthFollowup);
  }
  if (els.copyAccountHealth) {
    els.copyAccountHealth.addEventListener("click", copyAccountHealthCommandCenter);
  }
  if (els.exportAccountHealth) {
    els.exportAccountHealth.addEventListener("click", exportAccountHealthCommandCenter);
  }
  if (els.openFounderRevenueNext) {
    els.openFounderRevenueNext.addEventListener("click", openFounderRevenueNext);
  }
  if (els.prefillFounderRevenueConversion) {
    els.prefillFounderRevenueConversion.addEventListener("click", prefillFounderRevenueConversion);
  }
  if (els.copyFounderRevenue) {
    els.copyFounderRevenue.addEventListener("click", copyFounderRevenueForecast);
  }
  if (els.exportFounderRevenue) {
    els.exportFounderRevenue.addEventListener("click", exportFounderRevenueForecast);
  }
  if (els.openFounderBoardNext) {
    els.openFounderBoardNext.addEventListener("click", openFounderBoardNext);
  }
  if (els.openFounderBoardRevenue) {
    els.openFounderBoardRevenue.addEventListener("click", openFounderBoardRevenue);
  }
  if (els.copyFounderBoard) {
    els.copyFounderBoard.addEventListener("click", copyFounderBoardPack);
  }
  if (els.exportFounderBoard) {
    els.exportFounderBoard.addEventListener("click", exportFounderBoardPack);
  }
  if (els.openFounderDiligenceNext) {
    els.openFounderDiligenceNext.addEventListener("click", openFounderDiligenceNext);
  }
  if (els.openFounderDiligenceBoard) {
    els.openFounderDiligenceBoard.addEventListener("click", openFounderDiligenceBoard);
  }
  if (els.copyFounderDiligence) {
    els.copyFounderDiligence.addEventListener("click", copyFounderDiligenceMemo);
  }
  if (els.exportFounderDiligence) {
    els.exportFounderDiligence.addEventListener("click", exportFounderDiligenceRoom);
  }
  if (els.openInvestorDataNext) {
    els.openInvestorDataNext.addEventListener("click", openInvestorDataNext);
  }
  if (els.openInvestorDataDiligence) {
    els.openInvestorDataDiligence.addEventListener("click", openInvestorDataDiligence);
  }
  if (els.copyInvestorDataRoom) {
    els.copyInvestorDataRoom.addEventListener("click", copyInvestorDataRoomMemo);
  }
  if (els.exportInvestorDataRoom) {
    els.exportInvestorDataRoom.addEventListener("click", exportInvestorDataRoom);
  }
  if (els.openInvestorIntroNext) {
    els.openInvestorIntroNext.addEventListener("click", openInvestorIntroNext);
  }
  if (els.openInvestorIntroData) {
    els.openInvestorIntroData.addEventListener("click", openInvestorIntroData);
  }
  if (els.copyInvestorIntroRoom) {
    els.copyInvestorIntroRoom.addEventListener("click", copyInvestorIntroRoomMemo);
  }
  if (els.exportInvestorIntroRoom) {
    els.exportInvestorIntroRoom.addEventListener("click", exportInvestorIntroRoom);
  }
  if (els.openInvestorReplyNext) {
    els.openInvestorReplyNext.addEventListener("click", openInvestorReplyNext);
  }
  if (els.openInvestorReplyIntro) {
    els.openInvestorReplyIntro.addEventListener("click", openInvestorReplyIntro);
  }
  if (els.copyInvestorReplyPipeline) {
    els.copyInvestorReplyPipeline.addEventListener("click", copyInvestorReplyPipeline);
  }
  if (els.exportInvestorReplyPipeline) {
    els.exportInvestorReplyPipeline.addEventListener("click", exportInvestorReplyPipeline);
  }
  if (els.openInvestorMeetingNext) {
    els.openInvestorMeetingNext.addEventListener("click", openInvestorMeetingNext);
  }
  if (els.openInvestorMeetingReply) {
    els.openInvestorMeetingReply.addEventListener("click", openInvestorMeetingReply);
  }
  if (els.copyInvestorMeetingPrep) {
    els.copyInvestorMeetingPrep.addEventListener("click", copyInvestorMeetingPrep);
  }
  if (els.exportInvestorMeetingPrep) {
    els.exportInvestorMeetingPrep.addEventListener("click", exportInvestorMeetingPrep);
  }
  if (els.openInvestorFollowNext) {
    els.openInvestorFollowNext.addEventListener("click", openInvestorFollowNext);
  }
  if (els.openInvestorFollowMeeting) {
    els.openInvestorFollowMeeting.addEventListener("click", openInvestorFollowMeeting);
  }
  if (els.copyInvestorFollowThrough) {
    els.copyInvestorFollowThrough.addEventListener("click", copyInvestorFollowThrough);
  }
  if (els.exportInvestorFollowThrough) {
    els.exportInvestorFollowThrough.addEventListener("click", exportInvestorFollowThrough);
  }
  if (els.openInvestorMomentumNext) {
    els.openInvestorMomentumNext.addEventListener("click", openInvestorMomentumNext);
  }
  if (els.openInvestorMomentumFollow) {
    els.openInvestorMomentumFollow.addEventListener("click", openInvestorMomentumFollow);
  }
  if (els.copyInvestorMomentumLedger) {
    els.copyInvestorMomentumLedger.addEventListener("click", copyInvestorMomentumLedger);
  }
  if (els.exportInvestorMomentumLedger) {
    els.exportInvestorMomentumLedger.addEventListener("click", exportInvestorMomentumLedger);
  }
  if (els.openInvestorUpdateNext) {
    els.openInvestorUpdateNext.addEventListener("click", openInvestorUpdateNext);
  }
  if (els.openInvestorUpdateMomentum) {
    els.openInvestorUpdateMomentum.addEventListener("click", openInvestorUpdateMomentum);
  }
  if (els.copyInvestorUpdateComposer) {
    els.copyInvestorUpdateComposer.addEventListener("click", copyInvestorUpdateComposer);
  }
  if (els.exportInvestorUpdateComposer) {
    els.exportInvestorUpdateComposer.addEventListener("click", exportInvestorUpdateComposer);
  }
  if (els.openInvestorObjectionNext) {
    els.openInvestorObjectionNext.addEventListener("click", openInvestorObjectionNext);
  }
  if (els.openInvestorObjectionUpdate) {
    els.openInvestorObjectionUpdate.addEventListener("click", openInvestorObjectionUpdate);
  }
  if (els.copyInvestorObjectionDesk) {
    els.copyInvestorObjectionDesk.addEventListener("click", copyInvestorObjectionDesk);
  }
  if (els.exportInvestorObjectionDesk) {
    els.exportInvestorObjectionDesk.addEventListener("click", exportInvestorObjectionDesk);
  }
  if (els.openInvestorCommitmentNext) {
    els.openInvestorCommitmentNext.addEventListener("click", openInvestorCommitmentNext);
  }
  if (els.openInvestorCommitmentObjection) {
    els.openInvestorCommitmentObjection.addEventListener("click", openInvestorCommitmentObjection);
  }
  if (els.copyInvestorCommitmentTracker) {
    els.copyInvestorCommitmentTracker.addEventListener("click", copyInvestorCommitmentTracker);
  }
  if (els.exportInvestorCommitmentTracker) {
    els.exportInvestorCommitmentTracker.addEventListener("click", exportInvestorCommitmentTracker);
  }
  if (els.openInvestorCloseNext) {
    els.openInvestorCloseNext.addEventListener("click", openInvestorCloseNext);
  }
  if (els.openInvestorCloseCommitment) {
    els.openInvestorCloseCommitment.addEventListener("click", openInvestorCloseCommitment);
  }
  if (els.copyInvestorClosePlan) {
    els.copyInvestorClosePlan.addEventListener("click", copyInvestorClosePlan);
  }
  if (els.exportInvestorClosePlan) {
    els.exportInvestorClosePlan.addEventListener("click", exportInvestorClosePlan);
  }
  if (els.openInvestorTermsNext) {
    els.openInvestorTermsNext.addEventListener("click", openInvestorTermsNext);
  }
  if (els.openInvestorTermsClosePlan) {
    els.openInvestorTermsClosePlan.addEventListener("click", openInvestorTermsClosePlan);
  }
  if (els.copyInvestorTermsRoom) {
    els.copyInvestorTermsRoom.addEventListener("click", copyInvestorTermsRoom);
  }
  if (els.exportInvestorTermsRoom) {
    els.exportInvestorTermsRoom.addEventListener("click", exportInvestorTermsRoom);
  }
  if (els.openInvestorIcNext) {
    els.openInvestorIcNext.addEventListener("click", openInvestorIcNext);
  }
  if (els.openInvestorIcTerms) {
    els.openInvestorIcTerms.addEventListener("click", openInvestorIcTerms);
  }
  if (els.copyInvestorIcMemo) {
    els.copyInvestorIcMemo.addEventListener("click", copyInvestorIcMemo);
  }
  if (els.exportInvestorIcMemo) {
    els.exportInvestorIcMemo.addEventListener("click", exportInvestorIcMemo);
  }
  if (els.openInvestorDecisionNext) {
    els.openInvestorDecisionNext.addEventListener("click", openInvestorDecisionNext);
  }
  if (els.openInvestorDecisionIc) {
    els.openInvestorDecisionIc.addEventListener("click", openInvestorDecisionIc);
  }
  if (els.copyInvestorDecisionRoom) {
    els.copyInvestorDecisionRoom.addEventListener("click", copyInvestorDecisionRoom);
  }
  if (els.exportInvestorDecisionRoom) {
    els.exportInvestorDecisionRoom.addEventListener("click", exportInvestorDecisionRoom);
  }
  if (els.openFundingRoundNext) {
    els.openFundingRoundNext.addEventListener("click", openFundingRoundNext);
  }
  if (els.openFundingRoundDecision) {
    els.openFundingRoundDecision.addEventListener("click", openFundingRoundDecision);
  }
  if (els.copyFundingRoundCommand) {
    els.copyFundingRoundCommand.addEventListener("click", copyFundingRoundCommand);
  }
  if (els.exportFundingRoundCommand) {
    els.exportFundingRoundCommand.addEventListener("click", exportFundingRoundCommand);
  }
  if (els.openBoardPackWarNext) {
    els.openBoardPackWarNext.addEventListener("click", openBoardPackWarNext);
  }
  if (els.openBoardPackWarRound) {
    els.openBoardPackWarRound.addEventListener("click", openBoardPackWarRound);
  }
  if (els.copyBoardPackWarRoom) {
    els.copyBoardPackWarRoom.addEventListener("click", copyBoardPackWarRoom);
  }
  if (els.exportBoardPackWarRoom) {
    els.exportBoardPackWarRoom.addEventListener("click", exportBoardPackWarRoom);
  }
  if (els.scrollTopButton) {
    els.scrollTopButton.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
  if (els.openLaunchBlocker) {
    els.openLaunchBlocker.addEventListener("click", openLaunchBlocker);
  }
  if (els.exportLaunchAudit) {
    els.exportLaunchAudit.addEventListener("click", exportLaunchAuditPack);
  }
  if (els.copyLaunchChecklist) {
    els.copyLaunchChecklist.addEventListener("click", copyLaunchUploadChecklist);
  }
  els.clearNotes.addEventListener("click", () => {
    state.notes = [];
    saveJson(STORAGE_KEYS.notes, state.notes);
    renderNotebook();
  });

  els.waitlistForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitWaitlistLead();
  });

  els.sourceBuilderTicker.addEventListener("change", () => {
    state.selectedTicker = els.sourceBuilderTicker.value;
    renderSourceAssistantLinks();
    renderValuationOptions();
    renderImportTickerOptions();
    renderCompanyDossier();
    updateValuationFromCompany();
    updateValuation();
    drawSignalMap();
  });

  els.sourceBuilderType.addEventListener("change", () => {
    renderSourceBuilderSections();
    renderSourceAssistantLinks();
    renderActiveSourceTask();
    renderFilingCapturePreview();
    renderSourceIntakeDoctor();
  });

  if (els.sourceBuilderUrl) {
    els.sourceBuilderUrl.addEventListener("input", () => {
      if (normalizeExternalUrl(els.sourceBuilderUrl.value)) markActiveSourceTaskStage("collected");
      renderActiveSourceTask();
      renderFilingCapturePreview();
      renderSourceIntakeDoctor();
    });
  }

  [els.sourceBuilderTicker, els.sourceBuilderStatus, els.sourceBuilderPeriod, els.sourceBuilderDate, els.sourceBuilderTitleInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", renderFilingCapturePreview);
    input.addEventListener("change", renderFilingCapturePreview);
    input.addEventListener("input", renderSourceIntakeDoctor);
    input.addEventListener("change", renderSourceIntakeDoctor);
  });

  if (els.applySourceAssistant) {
    els.applySourceAssistant.addEventListener("click", applySourceAssistant);
  }

  if (els.sourceAssistantText) {
    els.sourceAssistantText.addEventListener("input", () => {
      els.sourceAssistantText.dataset.sample = "";
      renderFilingCapturePreview();
      renderSourceIntakeDoctor();
    });
  }

  if (els.loadSampleFiling) {
    els.loadSampleFiling.addEventListener("click", loadSampleFilingText);
  }

  if (els.clearSourceAssistant) {
    els.clearSourceAssistant.addEventListener("click", () => {
      els.sourceAssistantText.value = "";
      els.sourceAssistantText.dataset.sample = "";
      renderFilingCapturePreview();
      renderSourceIntakeDoctor();
      flashSourceAssistantResult("Paste cleared.", "neutral");
    });
  }

  if (els.sourceConfidenceChecklist) {
    els.sourceConfidenceChecklist.querySelectorAll("input[type='checkbox']").forEach((input) => {
      input.addEventListener("change", renderFilingCapturePreview);
      input.addEventListener("change", renderSourceIntakeDoctor);
    });
  }

  if (els.runSourceIntakeDoctor) {
    els.runSourceIntakeDoctor.addEventListener("click", () => {
      renderSourceIntakeDoctor({ focus: true });
    });
  }

  if (els.copySourceCitationNote) {
    els.copySourceCitationNote.addEventListener("click", copySourceCitationNote);
  }

  els.sourcePackForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addSourcePackDocFromBuilder();
  });

  els.exportSourcePack.addEventListener("click", exportSourcePackJson);
  els.exportMergedDocuments.addEventListener("click", exportMergedDocumentsJson);

  if (els.returnToDossier) {
    els.returnToDossier.addEventListener("click", returnToDossier);
  }

  els.sourcePackJsonInput.addEventListener("change", async () => {
    const file = els.sourcePackJsonInput.files && els.sourcePackJsonInput.files[0];
    if (file) {
      await importSourcePackJson(file);
      els.sourcePackJsonInput.value = "";
    }
  });

  els.clearSourcePack.addEventListener("click", () => {
    state.sourcePackDocs = [];
    rebuildDocumentCorpus();
    saveJson(STORAGE_KEYS.sourcePack, []);
    renderSourcePackList();
    renderSourceMatrixOptions();
    renderSourceMatrix();
    renderRealSourceStarterPack();
    renderSourceQueueOptions();
    renderSourceQueue();
    state.importReport = null;
    renderImportSummary();
    flashBuilderResult("Builder pack cleared. Starter and uploaded sources are unchanged.", "neutral");
  });

  if (els.queueTickerFilter) {
    els.queueTickerFilter.addEventListener("change", renderSourceQueue);
  }

  if (els.queueStatusFilter) {
    els.queueStatusFilter.addEventListener("change", renderSourceQueue);
  }

  if (els.matrixTickerFilter) {
    els.matrixTickerFilter.addEventListener("change", renderSourceMatrix);
  }

  if (els.matrixStatusFilter) {
    els.matrixStatusFilter.addEventListener("change", renderSourceMatrix);
  }

  if (els.matrixNextGap) {
    els.matrixNextGap.addEventListener("click", openNextCoverageGap);
  }

  if (els.copyCoverageMatrix) {
    els.copyCoverageMatrix.addEventListener("click", copyCoverageMatrixCsv);
  }

  if (els.downloadCoverageMatrix) {
    els.downloadCoverageMatrix.addEventListener("click", downloadCoverageMatrixCsv);
  }

  if (els.generateSourceTasks) {
    els.generateSourceTasks.addEventListener("click", () => {
      if (els.queueStatusFilter) els.queueStatusFilter.value = "priority";
      renderSourceQueue();
      flashSourceQueueResult("Priority queue refreshed for missing and synthetic evidence.", "neutral");
    });
  }

  if (els.exportChecklistCsv) {
    els.exportChecklistCsv.addEventListener("click", exportSourceChecklistCsv);
  }

  if (els.copyChecklistCsv) {
    els.copyChecklistCsv.addEventListener("click", copySourceChecklistCsv);
  }

  if (els.hubTickerSelect) {
    els.hubTickerSelect.addEventListener("change", renderSourceHub);
  }

  if (els.hubRequirementSelect) {
    els.hubRequirementSelect.addEventListener("change", renderSourceHub);
  }

  if (els.loadHubTask) {
    els.loadHubTask.addEventListener("click", () => {
      const item = getCurrentSourceHubItem();
      if (item) loadSourceTaskIntoBuilder(item.company.ticker, item.requirement.key);
    });
  }

  if (els.copyHubTask) {
    els.copyHubTask.addEventListener("click", copySourceHubTask);
  }

  if (els.exportAssistantTasks) {
    els.exportAssistantTasks.addEventListener("click", exportAssistantTaskList);
  }

  if (els.workspaceFilter) {
    els.workspaceFilter.addEventListener("change", renderSourceWorkspace);
  }

  if (els.workspaceBatchSize) {
    els.workspaceBatchSize.addEventListener("change", renderSourceWorkspace);
  }

  if (els.buildWorkspaceBatch) {
    els.buildWorkspaceBatch.addEventListener("click", () => {
      renderSourceWorkspace();
      flashSourceWorkspaceResult("Today's source-collection batch is ready.", "neutral");
      document.querySelector("#source-workspace")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  if (els.exportWorkspaceProgress) {
    els.exportWorkspaceProgress.addEventListener("click", exportWorkspaceProgressReport);
  }

  if (els.exportWorkspacePack) {
    els.exportWorkspacePack.addEventListener("click", exportWorkspaceJsonPack);
  }
}

function submitCurrentQuestion() {
  if (state.isRunning) return;
  const question = els.queryInput.value.trim();
  if (!question) {
    els.queryInput.focus();
    return;
  }
  state.isRunning = true;
  showRunFeedback();
  window.setTimeout(() => {
    runAnalysis(question);
    clearRunFeedback();
  }, 180);
}

function showRunFeedback() {
  if (!els.runAnalysisButton) return;
  els.runAnalysisButton.textContent = "Analyzing...";
  els.runAnalysisButton.classList.add("is-running");
  els.answerPanel.innerHTML = `
    <div class="empty-state is-analyzing">
      <div class="empty-kicker">Analyzing</div>
      <h2>Scanning retrieved UAE-market evidence.</h2>
      <p>Matching the question to annual reports, exchange disclosures, earnings-call tone, ticker context, and valuation read-through.</p>
    </div>
  `;
}

function clearRunFeedback() {
  state.isRunning = false;
  if (!els.runAnalysisButton) return;
  els.runAnalysisButton.textContent = "Run analysis";
  els.runAnalysisButton.classList.remove("is-running");
}

function renderImportTickerOptions() {
  if (!els.importTickerSelect) return;
  const companies = getCompanies();
  els.importTickerSelect.innerHTML = companies.map((company) => {
    const selected = company.ticker === state.selectedTicker ? "selected" : "";
    return `<option value="${escapeAttr(company.ticker)}" ${selected}>${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</option>`;
  }).join("");
  els.pasteTicker.value = state.selectedTicker || companies[0]?.ticker || "CUSTOM";
}

function renderSourceBuilderTickerOptions() {
  if (!els.sourceBuilderTicker) return;
  const companies = getCompanies();
  els.sourceBuilderTicker.innerHTML = companies.map((company) => {
    const selected = company.ticker === state.selectedTicker ? "selected" : "";
    return `<option value="${escapeAttr(company.ticker)}" ${selected}>${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</option>`;
  }).join("");
}

function renderSourceBuilderSections() {
  if (!els.sourceBuilderSections) return;
  const templates = getSourceSectionTemplates(els.sourceBuilderType ? els.sourceBuilderType.value : "Annual report");
  els.sourceBuilderSections.innerHTML = templates.map((title, index) => `
    <label>
      <span>${escapeHtml(title)}</span>
      <textarea data-section-title="${escapeAttr(title)}" rows="${index === 0 ? 5 : 4}" placeholder="Paste ${escapeAttr(title.toLowerCase())} text here"></textarea>
    </label>
  `).join("");
  els.sourceBuilderSections.querySelectorAll("textarea").forEach((textarea) => {
    textarea.addEventListener("input", () => {
      renderActiveSourceTask();
      renderFilingCapturePreview();
      renderSourceIntakeDoctor();
    });
  });
  renderFilingCapturePreview();
  renderSourceIntakeDoctor();
}

function getSourceSectionTemplates(type) {
  if (/annual/i.test(type)) return ["Business overview", "Management discussion and analysis", "Risk factors", "Liquidity and capital resources"];
  if (/earnings call|transcript/i.test(type)) return ["Prepared remarks", "Analyst Q&A", "Management tone"];
  if (/quarter|results/i.test(type)) return ["Results summary", "Segment performance", "Management commentary"];
  if (/ownership|ownership change/i.test(type)) return ["Ownership disclosure", "Anchor shareholder holding and ownership change", "Institutional ownership"];
  if (/exchange|announcement|disclosure/i.test(type)) return ["Disclosure extract", "Management rationale", "Investment impact"];
  if (/rating|credit/i.test(type)) return ["Rating action", "Credit strengths", "Credit risks"];
  if (/valuation|model/i.test(type)) return ["Scenario assumptions", "Valuation bridge", "Sensitivity notes"];
  return ["Source summary", "Key evidence", "Risks and watch items"];
}

function applySourceAssistant() {
  if (!els.sourceAssistantText) return;
  const rawText = els.sourceAssistantText.value.trim().slice(0, MAX_SOURCE_TEXT_CHARS);
  if (rawText.replace(/\s+/g, "").length < 120) {
    els.sourceAssistantText.focus();
    flashSourceAssistantResult("Paste at least a few paragraphs from the source before detecting sections.", "error");
    return;
  }
  const draft = makeSourceAssistantDraft(rawText);
  const company = getCompany(draft.ticker);
  const sampleMode = els.sourceAssistantText.dataset.sample === "true";
  state.selectedTicker = draft.ticker;
  renderSourceBuilderTickerOptions();
  els.sourceBuilderTicker.value = draft.ticker;
  els.sourceBuilderType.value = draft.type;
  els.sourceBuilderStatus.value = sampleMode ? "imported" : "real";
  els.sourceBuilderPeriod.value = draft.period;
  els.sourceBuilderDate.value = new Date().toISOString().slice(0, 10);
  els.sourceBuilderTitleInput.value = draft.title;
  renderSourceBuilderSections();
  fillSourceBuilderSections(draft.sections);
  renderSourceAssistantLinks();
  renderImportTickerOptions();
  renderValuationOptions();
  renderCompanyDossier();
  updateValuationFromCompany();
  updateValuation();
  drawSignalMap();
  markActiveSourceTaskStage("pasted");
  renderFilingCapturePreview(draft);
  renderSourceIntakeDoctor();
  const urlWarning = els.sourceBuilderUrl.value.trim() ? "" : " Add the source URL before shipping as REAL.";
  const sampleWarning = sampleMode ? " Sample text is marked IMP, not REAL." : "";
  flashSourceAssistantResult(`${company ? company.ticker : draft.ticker} ${draft.type} detected with ${draft.sections.length} citation section${draft.sections.length === 1 ? "" : "s"}.${urlWarning}${sampleWarning}`, urlWarning || sampleMode ? "neutral" : "success");
}

function makeSourceAssistantDraft(rawText) {
  const text = normalizeSourceAssistantText(rawText);
  const ticker = detectAssistantTicker(text);
  const type = detectAssistantSourceType(text);
  const period = detectAssistantPeriod(text, type);
  const company = getCompany(ticker);
  return {
    ticker,
    type,
    period,
    title: `${company ? company.name : ticker} ${shortDocType(type)} source ${period}`.trim(),
    sections: makeAssistantSections(text, type)
  };
}

function loadSampleFilingText() {
  if (!els.sourceAssistantText) return;
  const ticker = normalizeTicker(state.activeSourceTask?.ticker || els.sourceBuilderTicker?.value || state.selectedTicker);
  const company = getCompany(ticker);
  const requirement = state.activeSourceTask
    ? REAL_SOURCE_REQUIREMENTS.find((item) => item.key === state.activeSourceTask.requirementKey) || getBuilderRequirement()
    : getBuilderRequirement();
  const sampleText = makeSampleFilingText(company, requirement);
  els.sourceAssistantText.value = sampleText;
  els.sourceAssistantText.dataset.sample = "true";
  if (els.sourceBuilderStatus) els.sourceBuilderStatus.value = "imported";
  if (els.sourceBuilderTicker && company) els.sourceBuilderTicker.value = company.ticker;
  if (els.sourceBuilderType && requirement) els.sourceBuilderType.value = requirement.type;
  renderSourceBuilderSections();
  renderSourceAssistantLinks();
  renderFilingCapturePreview(makeSourceAssistantDraft(sampleText));
  renderSourceIntakeDoctor();
  flashSourceAssistantResult("Training sample loaded as IMP review. Use it to learn the flow, not as REAL evidence.", "neutral");
}

function makeSampleFilingText(company, requirement) {
  const safeCompany = company || getCompany(state.selectedTicker);
  const label = requirement ? requirement.label : "Results";
  const ticker = safeCompany ? safeCompany.ticker : "FAB";
  const name = safeCompany ? safeCompany.name : "First Abu Dhabi Bank";
  if (/results/i.test(label)) {
    return `${name} ${ticker} quarterly results training sample for Q4 FY2026. This sample is not an official filing and should remain imported review evidence. Results summary: consolidated revenue increased on resilient consumer and digital services performance, while energy margins remained sensitive to refining spreads and feedstock costs. Segment performance: retail store additions, telecom subscriber quality, and new-energy project timing were cited as key operating variables. Management commentary: management said capital allocation remains disciplined, cash conversion will be monitored, and near-term demand should be read with commodity and currency volatility in mind.`;
  }
  if (/earnings call/i.test(label)) {
    return `${name} ${ticker} earnings call transcript training sample for Q4 FY2026. This sample is not an official filing and should remain imported review evidence. Prepared remarks: management described demand trends, operating discipline, and investment priorities. Analyst Q&A: analysts asked about margins, capital expenditure, working capital, and execution risk. Management tone: management sounded balanced, highlighting growth opportunities while acknowledging cost inflation and timing uncertainty.`;
  }
  if (/ownership/i.test(label)) {
    return `${name} ${ticker} ownership disclosure training sample for FY2026. This sample is not an official filing and should remain imported review evidence. Ownership disclosure: anchor shareholder holding, institutional ownership, and public ownership should be checked against the official exchange filing. Anchor shareholder holding and ownership change: verify whether any ownership change or encumbrance is disclosed. Institutional ownership: compare FII, DII, and mutual fund movement with prior periods.`;
  }
  if (/announcement/i.test(label)) {
    return `${name} ${ticker} exchange disclosure training sample for FY2026. This sample is not an official filing and should remain imported review evidence. Announcement extract: the company disclosed a material update requiring investor review. Management rationale: the announcement should be read for strategic intent, capital impact, and governance context. Investment impact: verify whether the event changes revenue visibility, risk, leverage, or execution timing.`;
  }
  return `${name} ${ticker} annual report training sample for FY2026. This sample is not an official filing and should remain imported review evidence. Business overview: the company describes its operating segments, growth priorities, and market position. Management discussion and analysis: management discusses demand, margin movement, working capital, and capital expenditure. Risk factors: commodity prices, regulation, competition, execution timing, and currency movement may affect results. Liquidity and capital resources: review free cash flow, debt, cash balances, and funding needs before using the source for investment research.`;
}

function renderFilingCapturePreview(draft = null) {
  if (!els.filingCapturePreview) return;
  const rawText = els.sourceAssistantText ? els.sourceAssistantText.value.trim() : "";
  const detected = draft || (rawText.replace(/\s+/g, "").length >= 120 ? makeSourceAssistantDraft(rawText) : null);
  const ticker = normalizeTicker((detected && detected.ticker) || els.sourceBuilderTicker?.value || state.selectedTicker);
  const company = getCompany(ticker);
  const requirement = detected
    ? REAL_SOURCE_REQUIREMENTS.find((item) => item.type === detected.type) || getBuilderRequirement()
    : getBuilderRequirement();
  const status = normalizeSourceStatus(els.sourceBuilderStatus ? els.sourceBuilderStatus.value : "real");
  const sourceUrl = normalizeExternalUrl(els.sourceBuilderUrl ? els.sourceBuilderUrl.value : "");
  const sections = detected
    ? detected.sections
    : els.sourceBuilderSections
      ? Array.from(els.sourceBuilderSections.querySelectorAll("textarea"))
          .map((textarea) => ({ title: textarea.dataset.sectionTitle || "Source section", text: textarea.value.trim() }))
          .filter((section) => section.text.replace(/\s+/g, "").length > 30)
      : [];
  const impact = makeBuilderReadinessImpact(ticker, requirement, status);
  const confidence = getSourceConfidenceChecks();
  const sourceMode = els.sourceAssistantText && els.sourceAssistantText.dataset.sample === "true" ? "Training sample" : "Pasted filing";

  if (!rawText && !sections.length && !sourceUrl) {
    els.filingCapturePreview.innerHTML = `
      <div class="filing-preview-empty">
        Paste filing text or click Load sample filing to preview company, source type, sections, and readiness impact before adding evidence.
      </div>
    `;
    return;
  }

  els.filingCapturePreview.innerHTML = `
    <div class="filing-preview-card">
      <div>
        <span>${escapeHtml(sourceMode)}</span>
        <strong>${escapeHtml(company ? company.ticker : ticker)} ${escapeHtml(requirement ? requirement.label : "Source")} capture preview</strong>
      </div>
      <dl>
        <div><dt>Detected company</dt><dd>${escapeHtml(company ? company.name : ticker)}</dd></div>
        <div><dt>Source type</dt><dd>${escapeHtml(detected ? detected.type : els.sourceBuilderType?.value || "Source")}</dd></div>
        <div><dt>Period</dt><dd>${escapeHtml(detected ? detected.period : els.sourceBuilderPeriod?.value || "Current")}</dd></div>
        <div><dt>Sections</dt><dd>${escapeHtml(sections.length)} ready</dd></div>
      </dl>
    </div>
    <div class="filing-preview-card is-impact">
      <div>
        <span>Before / after readiness</span>
        <strong>${escapeHtml(impact.requirementLabel)}: ${escapeHtml(impact.beforeStatus)} -> ${escapeHtml(impact.afterStatus)}</strong>
      </div>
      <p>${escapeHtml(impact.companyReadyBefore)} REAL now, ${escapeHtml(impact.companyReadyAfter)} REAL after add. ${escapeHtml(impact.packImpact)}</p>
    </div>
    <div class="filing-preview-card ${status === "real" && !confidence.ready ? "is-warning" : "is-ok"}">
      <div>
        <span>Confidence gate</span>
        <strong>${status === "real" ? `${confidence.count}/3 REAL checks confirmed` : "REAL checks not required for IMP/SYN drafts"}</strong>
      </div>
      <p>${escapeHtml(status === "real" ? confidence.message : "Imported or synthetic drafts can be saved without the REAL verification checklist.")}</p>
    </div>
  `;
}

function renderSourceIntakeDoctor(options = {}) {
  if (!els.sourceIntakeDoctor) return;
  const audit = makeSourceIntakeAudit();
  if (els.copySourceCitationNote) els.copySourceCitationNote.disabled = !audit.hasAnyInput;
  const rows = audit.checks.map((check) => `
    <article class="source-intake-check ${check.passed ? "is-pass" : check.severity === "High" ? "is-high" : "is-warning"}">
      <span>${check.passed ? "OK" : check.severity}</span>
      <strong>${escapeHtml(check.label)}</strong>
      <p>${escapeHtml(check.detail)}</p>
    </article>
  `).join("");

  els.sourceIntakeDoctor.innerHTML = `
    <div class="source-intake-hero ${escapeAttr(audit.statusClass)}">
      <div>
        <span>Source Intake Doctor</span>
        <strong>${escapeHtml(audit.statusLabel)}</strong>
        <p>${escapeHtml(audit.summary)}</p>
      </div>
      <div class="source-intake-score">
        <span>Intake score</span>
        <strong>${escapeHtml(audit.score)}%</strong>
      </div>
    </div>
    <div class="source-intake-stats">
      <article><span>Company</span><strong>${escapeHtml(audit.companyLabel)}</strong><em>${escapeHtml(audit.sourceType)}</em></article>
      <article><span>URL</span><strong>${escapeHtml(audit.urlLabel)}</strong><em>${escapeHtml(audit.urlHost || "No host")}</em></article>
      <article><span>Sections</span><strong>${escapeHtml(audit.readySections)}/${escapeHtml(audit.totalSections)}</strong><em>${escapeHtml(audit.totalWords)} words</em></article>
      <article><span>Quality</span><strong>${escapeHtml(audit.qualityLabel)}</strong><em>${escapeHtml(audit.periodLabel)}</em></article>
    </div>
    <div class="source-intake-checks">
      ${rows}
    </div>
  `;

  if (options.focus) {
    els.sourceIntakeDoctor.scrollIntoView({ behavior: "smooth", block: "center" });
    flashSourceAssistantResult(`${audit.statusLabel}. Intake score ${audit.score}%.`, audit.blockers.length ? "error" : audit.warnings.length ? "neutral" : "success");
  }
}

function makeSourceIntakeAudit() {
  const ticker = normalizeTicker(els.sourceBuilderTicker?.value || state.selectedTicker || "CUSTOM");
  const company = getCompany(ticker);
  const sourceType = els.sourceBuilderType?.value || "Research note";
  const status = normalizeSourceStatus(els.sourceBuilderStatus?.value || "real");
  const rawUrl = (els.sourceBuilderUrl?.value || "").trim();
  const sourceUrl = normalizeExternalUrl(rawUrl);
  const urlHost = sourceUrl ? new URL(sourceUrl).hostname : "";
  const title = (els.sourceBuilderTitleInput?.value || "").trim();
  const period = (els.sourceBuilderPeriod?.value || "").trim();
  const date = (els.sourceBuilderDate?.value || "").trim();
  const sampleMode = els.sourceAssistantText?.dataset.sample === "true";
  const rawPaste = (els.sourceAssistantText?.value || "").trim();
  const sections = getBuilderSectionDrafts();
  const readySections = sections.filter((section) => section.text.replace(/\s+/g, " ").trim().length >= 120);
  const totalWords = countWords([rawPaste, ...sections.map((section) => section.text)].join(" "));
  const combinedText = [rawPaste, ...sections.map((section) => section.text)].join(" ");
  const confidence = getSourceConfidenceChecks();
  const textMentionsCompany = sourceTextMentionsCompany(combinedText, company, ticker);
  const checks = [
    {
      label: "Company match",
      passed: Boolean(company && textMentionsCompany),
      severity: "Medium",
      weight: 12,
      detail: company
        ? textMentionsCompany
          ? `${company.ticker} appears aligned with the pasted source text.`
          : `Selected company is ${company.ticker}, but the pasted text does not clearly mention it.`
        : "Select a covered company before creating a source record."
    },
    {
      label: "Source URL",
      passed: status !== "real" ? !rawUrl || Boolean(sourceUrl) : Boolean(sourceUrl && isHttpsUrl(sourceUrl)),
      severity: "High",
      weight: 18,
      detail: status === "real"
        ? sourceUrl && isHttpsUrl(sourceUrl)
          ? `REAL source URL is valid HTTPS. ${sourceUrlTrustNote(sourceUrl)}`
          : "REAL records require a valid HTTPS source URL."
        : rawUrl && !sourceUrl
          ? "Draft URL is not valid. Fix it or leave it blank."
          : "IMP/SYN drafts can be saved without an official URL."
    },
    {
      label: "Official host review",
      passed: !sourceUrl || isTrustedSourceUrl(sourceUrl),
      severity: "Medium",
      weight: 10,
      detail: sourceUrl
        ? isTrustedSourceUrl(sourceUrl)
          ? `${urlHost} is on the trusted source-domain list.`
          : `${urlHost} is not on the trusted list. Verify it manually before marking REAL.`
        : "No source host to review yet."
    },
    {
      label: "Citation depth",
      passed: readySections.length >= 2 && totalWords >= 80,
      severity: "High",
      weight: 20,
      detail: `${readySections.length} citation section${readySections.length === 1 ? "" : "s"} are long enough. Target at least 2 with useful source text.`
    },
    {
      label: "Period and date",
      passed: Boolean(period && date && title),
      severity: "Medium",
      weight: 14,
      detail: period && date && title ? `${period} dated ${date} with a record title.` : "Add period, date, and record title before shipping."
    },
    {
      label: "Training sample guard",
      passed: !(sampleMode && status === "real"),
      severity: "High",
      weight: 14,
      detail: sampleMode ? "Training samples must remain IMP review, not REAL evidence." : "No training-sample flag detected."
    },
    {
      label: "REAL confidence checks",
      passed: status !== "real" || confidence.ready,
      severity: "High",
      weight: 12,
      detail: status === "real" ? confidence.message : "REAL confirmation checklist is not required for IMP/SYN drafts."
    }
  ];
  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0) || 1;
  const score = Math.round((checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0) / maxScore) * 100);
  const blockers = checks.filter((check) => !check.passed && check.severity === "High");
  const warnings = checks.filter((check) => !check.passed && check.severity !== "High");
  const statusLabel = blockers.length
    ? "Not ready for live corpus"
    : warnings.length
      ? "Review before adding"
      : "Ready to add";
  const statusClass = blockers.length ? "is-blocked" : warnings.length ? "is-review" : "is-ready";
  const hasAnyInput = Boolean(rawPaste || rawUrl || sections.some((section) => section.text.trim()));
  return {
    ticker,
    company,
    companyLabel: company ? `${company.ticker} - ${company.name}` : ticker,
    sourceType,
    status,
    rawUrl,
    sourceUrl,
    urlHost,
    urlLabel: sourceUrl ? (isHttpsUrl(sourceUrl) ? "HTTPS" : "HTTP") : "Missing",
    qualityLabel: status.toUpperCase(),
    periodLabel: period || "No period",
    title,
    period,
    date,
    sampleMode,
    rawPaste,
    sections,
    readySections: readySections.length,
    totalSections: sections.length,
    totalWords,
    checks,
    blockers,
    warnings,
    score,
    statusLabel,
    statusClass,
    hasAnyInput,
    summary: blockers.length
      ? `${blockers.length} high-priority issue${blockers.length === 1 ? "" : "s"} should be fixed before adding this source.`
      : warnings.length
        ? `${warnings.length} review warning${warnings.length === 1 ? "" : "s"} remains before this source is clean.`
        : "Source fields, citation text, and REAL confidence checks look ready."
  };
}

function getBuilderSectionDrafts() {
  if (!els.sourceBuilderSections) return [];
  return Array.from(els.sourceBuilderSections.querySelectorAll("textarea")).map((textarea) => ({
    title: textarea.dataset.sectionTitle || textarea.previousElementSibling?.textContent || "Source section",
    text: textarea.value.replace(/\s+/g, " ").trim()
  })).filter((section) => section.text.length || section.title);
}

function sourceTextMentionsCompany(text, company, ticker) {
  const haystack = String(text || "").toLowerCase();
  if (!haystack.trim()) return false;
  if (ticker && haystack.includes(String(ticker).toLowerCase())) return true;
  if (company && haystack.includes(company.name.toLowerCase())) return true;
  if (!company) return false;
  return company.name.toLowerCase().split(/\s+/).filter((word) => word.length > 4).some((word) => haystack.includes(word));
}

function countWords(text) {
  return (String(text || "").match(/\b[a-zA-Z0-9][a-zA-Z0-9./-]*\b/g) || []).length;
}

async function copySourceCitationNote() {
  const audit = makeSourceIntakeAudit();
  if (!audit.hasAnyInput) {
    flashSourceAssistantResult("Add source text or a URL before copying a citation note.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makeSourceCitationNote(audit));
  flashSourceAssistantResult(copied ? "Citation note copied." : "Clipboard blocked. Use the visible source fields as fallback.", copied ? "success" : "error");
}

function makeSourceCitationNote(audit) {
  const checks = audit.checks.map((check) => `- ${check.passed ? "OK" : check.severity}: ${check.label} - ${check.detail}`).join("\n");
  const sections = audit.sections
    .filter((section) => section.text.trim())
    .map((section) => `### ${section.title}\n${snippetLong(section.text, 700)}`)
    .join("\n\n") || "No citation sections pasted yet.";
  return [
    "# MajlisAlpha Source Intake Note",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Company: ${audit.companyLabel}`,
    `Source type: ${audit.sourceType}`,
    `Quality: ${audit.qualityLabel}`,
    `Period: ${audit.period || "Missing"}`,
    `Date: ${audit.date || "Missing"}`,
    `Source URL: ${audit.sourceUrl || "Missing"}`,
    `Intake doctor: ${audit.statusLabel} (${audit.score}%)`,
    "",
    "## Checks",
    checks,
    "",
    "## Citation Sections",
    sections,
    "",
    "_Verify official source URL, exact document identity, and period/date before treating this as REAL evidence._"
  ].join("\n");
}

function makeBuilderReadinessImpact(ticker, requirement, status) {
  const safeRequirement = requirement || REAL_SOURCE_REQUIREMENTS[0];
  const docs = getCompanyDocs(ticker);
  const checklist = makeRealDataChecklist(docs);
  const beforeCompleteness = makeRealSourceCompleteness(checklist);
  const currentItem = checklist.find((item) => item.key === safeRequirement.key) || checklist[0];
  const afterStatus = status === "real" ? "REAL ready" : status === "imported" ? "IMP review" : "SYN starter";
  const companyReadyBefore = beforeCompleteness.percent === 100
    ? `${REAL_SOURCE_REQUIREMENTS.length}/${REAL_SOURCE_REQUIREMENTS.length}`
    : `${checklist.filter((item) => item.statusKey === "real").length}/${REAL_SOURCE_REQUIREMENTS.length}`;
  const realDelta = currentItem && currentItem.statusKey !== "real" && status === "real" ? 1 : 0;
  const companyReadyAfter = `${Math.min(REAL_SOURCE_REQUIREMENTS.length, checklist.filter((item) => item.statusKey === "real").length + realDelta)}/${REAL_SOURCE_REQUIREMENTS.length}`;
  const packImpact = STARTER_PACK_TICKERS.includes(ticker) && realDelta
    ? "Starter pack REAL count will increase by 1."
    : STARTER_PACK_TICKERS.includes(ticker)
      ? "Starter pack readiness will not increase until this is marked REAL."
    : "This company is outside the current starter pack.";
  return {
    requirementLabel: safeRequirement.label,
    beforeStatus: currentItem ? currentItem.status : "Needed",
    afterStatus,
    companyReadyBefore,
    companyReadyAfter,
    packImpact
  };
}

function getSourceConfidenceChecks() {
  const checks = els.sourceConfidenceChecklist
    ? Array.from(els.sourceConfidenceChecklist.querySelectorAll("input[type='checkbox']"))
    : [];
  const count = checks.filter((input) => input.checked).length;
  const missing = checks
    .filter((input) => !input.checked)
    .map((input) => input.parentElement ? input.parentElement.textContent.trim() : "verification check");
  return {
    count,
    total: checks.length,
    ready: checks.length > 0 && count === checks.length,
    message: missing.length ? `Missing: ${missing.join(", ")}.` : "All REAL source checks are confirmed."
  };
}

function isSourceConfidenceReady() {
  return getSourceConfidenceChecks().ready;
}

function resetSourceConfidenceChecks() {
  if (!els.sourceConfidenceChecklist) return;
  els.sourceConfidenceChecklist.querySelectorAll("input[type='checkbox']").forEach((input) => {
    input.checked = false;
  });
}

function normalizeSourceAssistantText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function detectAssistantTicker(text) {
  const haystack = text.toLowerCase();
  const selected = normalizeTicker(els.sourceBuilderTicker ? els.sourceBuilderTicker.value : state.selectedTicker);
  const found = getCompanies().find((company) => {
    const nameWords = company.name.toLowerCase().split(/\s+/).filter((word) => word.length > 4);
    return haystack.includes(company.ticker.toLowerCase()) || haystack.includes(company.name.toLowerCase()) || nameWords.some((word) => haystack.includes(word));
  });
  return found ? found.ticker : selected || "CUSTOM";
}

function detectAssistantSourceType(text) {
  const lower = text.toLowerCase();
  if (/ownership|anchor shareholder holding|ownership change|public ownership|institutional ownership/.test(lower)) return "Ownership disclosure";
  if (/exchange disclosure|market disclosure|corporate disclosure|adx|dfm|nasdaq dubai|candi|order win|rating action|press release/.test(lower)) return "Exchange disclosure";
  if (/analyst q&a|question-and-answer|earnings call|conference call|earnings call|transcript|prepared remarks/.test(lower)) return "Earnings call transcript";
  if (/quarterly results|results summary|quarter ended|segment revenue|ebitda|profit after tax|financial results/.test(lower)) return "Quarterly results";
  if (/credit rating|rating rationale|credit strengths|credit risks/.test(lower)) return "Credit rating note";
  if (/valuation|dcf|terminal multiple|scenario|sensitivity/.test(lower)) return "Valuation model";
  if (/annual report|board's report|management discussion|mda|md&a|risk factors|liquidity and capital resources/.test(lower)) return "Annual report";
  return els.sourceBuilderType ? els.sourceBuilderType.value || "Research note" : "Research note";
}

function detectAssistantPeriod(text, type) {
  const clean = text.replace(/\s+/g, " ");
  const quarter = clean.match(/\bQ[1-4]\s*(?:FY|FY\s*)?20\d{2}\b/i);
  if (quarter) return quarter[0].replace(/\s+/g, " ").toUpperCase();
  const quarterEnded = clean.match(/\bquarter ended\s+([A-Za-z]+\s+\d{1,2},?\s+20\d{2}|[A-Za-z]+\s+20\d{2}|20\d{2})/i);
  if (quarterEnded) return `Quarter ended ${quarterEnded[1]}`;
  const fy = clean.match(/\bFY\s?20\d{2}\b/i) || clean.match(/\b20\d{2}\s?-\s?\d{2}\b/);
  if (fy) return fy[0].replace(/\s+/g, "").replace("-", "-").toUpperCase().replace(/^20(\d{2})-(\d{2})$/, "FY20$1-$2");
  if (/quarter|results|earnings call/i.test(type)) return "Q4 FY2026";
  return "FY2026";
}

function makeAssistantSections(text, type) {
  const templates = getSourceSectionTemplates(type);
  const sectionized = sectionizeImportedText(text);
  const sourceSections = sectionized.length ? sectionized : splitSourceTextIntoSections(text, templates.length);
  return templates.map((title, index) => {
    const matched = findBestAssistantSection(title, sourceSections);
    const fallback = sourceSections[index] || sourceSections[0] || { text };
    return {
      title,
      text: snippetLong((matched || fallback).text, index === 0 ? 1200 : 950)
    };
  }).filter((section) => section.text.replace(/\s+/g, "").length > 30);
}

function findBestAssistantSection(title, sections) {
  const keywords = assistantSectionKeywords(title);
  let best = null;
  let bestScore = 0;
  for (const section of sections) {
    const haystack = `${section.title || ""} ${section.text || ""}`.toLowerCase();
    const score = keywords.reduce((sum, word) => sum + (haystack.includes(word) ? 1 : 0), 0);
    if (score > bestScore) {
      best = section;
      bestScore = score;
    }
  }
  return bestScore ? best : null;
}

function assistantSectionKeywords(title) {
  const lower = title.toLowerCase();
  if (/business/.test(lower)) return ["business", "overview", "segment", "revenue", "operations"];
  if (/discussion|analysis|commentary|prepared/.test(lower)) return ["management", "discussion", "analysis", "commentary", "outlook", "prepared"];
  if (/risk/.test(lower)) return ["risk", "uncertain", "volatility", "competition", "regulatory", "inflation"];
  if (/liquidity|capital|cash/.test(lower)) return ["liquidity", "capital", "cash", "debt", "borrowings", "capex"];
  if (/q&a|tone/.test(lower)) return ["question", "answer", "analyst", "management", "expects", "guidance"];
  if (/results|segment/.test(lower)) return ["results", "revenue", "margin", "profit", "segment", "ebitda"];
  if (/ownership|anchor shareholder|ownership change|institutional/.test(lower)) return ["ownership", "anchor shareholder", "ownership change", "institutional", "public"];
  if (/disclosure|announcement|rationale|impact/.test(lower)) return ["disclosure", "order", "approval", "transaction", "rationale", "impact"];
  return ["source", "summary", "evidence", "watch"];
}

function splitSourceTextIntoSections(text, count) {
  const sentences = text.replace(/\n+/g, " ").match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const sections = [];
  const target = Math.max(450, Math.ceil(text.length / Math.max(count, 1)));
  let buffer = [];
  for (const sentence of sentences) {
    buffer.push(sentence.trim());
    if (buffer.join(" ").length >= target && sections.length < count - 1) {
      sections.push({ title: `Detected section ${sections.length + 1}`, text: buffer.join(" ") });
      buffer = [];
    }
  }
  if (buffer.length) sections.push({ title: `Detected section ${sections.length + 1}`, text: buffer.join(" ") });
  return sections;
}

function fillSourceBuilderSections(sections) {
  const textareas = Array.from(els.sourceBuilderSections.querySelectorAll("textarea"));
  sections.forEach((section, index) => {
    if (!textareas[index]) return;
    textareas[index].dataset.sectionTitle = section.title;
    textareas[index].previousElementSibling.textContent = section.title;
    textareas[index].value = section.text;
  });
  renderFilingCapturePreview();
  renderSourceIntakeDoctor();
}

function snippetLong(text, maxLength) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).replace(/\s+\S*$/, "")}.`;
}

function flashSourceAssistantResult(message, tone = "neutral") {
  if (!els.sourceAssistantResult) return;
  els.sourceAssistantResult.className = `builder-result is-${tone}`;
  els.sourceAssistantResult.textContent = message;
}

function normalizeExternalUrl(value) {
  const raw = String(value || "").trim();
  if (!raw || raw.length > MAX_SOURCE_URL_LENGTH) return "";
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return "";
    url.hash = url.hash.slice(0, 180);
    return url.href;
  } catch (error) {
    return "";
  }
}

function isHttpsUrl(value) {
  try {
    return new URL(value).protocol === "https:";
  } catch (error) {
    return false;
  }
}

function isTrustedSourceUrl(value) {
  try {
    const host = new URL(value).hostname.toLowerCase();
    return TRUSTED_SOURCE_DOMAINS.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch (error) {
    return false;
  }
}

function sourceUrlTrustNote(value) {
  if (!value) return "";
  return isTrustedSourceUrl(value)
    ? "Official source URL captured."
    : "URL captured. Verify this host before shipping as REAL evidence.";
}

function renderSourceAssistantLinks() {
  if (!els.sourceAssistantLinks) return;
  const ticker = normalizeTicker(els.sourceBuilderTicker ? els.sourceBuilderTicker.value : state.selectedTicker);
  const company = getCompany(ticker);
  const requirement = getBuilderRequirement();
  if (!company || !requirement) {
    els.sourceAssistantLinks.innerHTML = `
      <div class="source-url-helper-empty">Select a company and source type to see official collection links.</div>
    `;
    return;
  }
  const item = {
    company,
    requirement,
    statusLabel: "URL helper",
    currentEvidence: "Builder source URL"
  };
  const links = sourceLinksForTask(item)
    .map((link) => ({ ...link, url: normalizeExternalUrl(link.url) }))
    .filter((link) => link.url)
    .slice(0, 5);
  els.sourceAssistantLinks.innerHTML = `
    <div class="source-url-helper-head">
      <div>
        <span>Official Source URL Helper</span>
        <strong>${escapeHtml(company.ticker)} ${escapeHtml(requirement.label)} links</strong>
      </div>
      <button type="button" data-open-hub-from-helper="${escapeAttr(company.ticker)}" data-open-hub-key="${escapeAttr(requirement.key)}">Open hub</button>
    </div>
    <div class="source-collection-guide">
      <strong>Beginner flow for ${escapeHtml(company.ticker)} ${escapeHtml(requirement.label)}</strong>
      <ol>
        <li>Click <b>Open source site</b> for ADX, DFM, or Company IR.</li>
        <li>Search the company, open the latest matching document, and copy useful text.</li>
        <li>Return here, click <b>Fill URL</b>, paste the text above, then click <b>Detect and fill builder</b>.</li>
      </ol>
    </div>
    <div class="source-url-helper-list">
      ${links.map((link) => `
        <article>
          <div class="source-url-copy">
            <span>${escapeHtml(link.label)}</span>
            <strong>${escapeHtml(link.note)}</strong>
          </div>
          <div class="source-url-actions">
            <a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer" data-open-source-url="${escapeAttr(link.url)}">Open source site</a>
            <button type="button" data-use-source-url="${escapeAttr(link.url)}">Fill URL</button>
          </div>
        </article>
      `).join("")}
    </div>
  `;
  els.sourceAssistantLinks.querySelectorAll("a[data-open-source-url]").forEach((link) => {
    link.addEventListener("click", () => {
      markActiveSourceTaskStage("collected");
      flashSourceAssistantResult("Source site opened. Search the company, open the latest matching document, then copy citation text back here.", "neutral");
    });
  });
  els.sourceAssistantLinks.querySelectorAll("button[data-use-source-url]").forEach((button) => {
    button.addEventListener("click", () => {
      const url = normalizeExternalUrl(button.dataset.useSourceUrl || "");
      if (!url) {
        flashSourceAssistantResult("That helper link is not a valid http/https URL.", "error");
        return;
      }
      els.sourceBuilderUrl.value = url;
      markActiveSourceTaskStage("collected");
      renderActiveSourceTask();
      renderFilingCapturePreview();
      renderSourceIntakeDoctor();
      flashSourceAssistantResult(`Source URL filled. Now paste source text above and click Detect and fill builder. ${sourceUrlTrustNote(url)}`, "success");
    });
  });
  const hubButton = els.sourceAssistantLinks.querySelector("button[data-open-hub-from-helper]");
  if (hubButton) {
    hubButton.addEventListener("click", () => {
      openSourceTaskInHub(hubButton.dataset.openHubFromHelper, hubButton.dataset.openHubKey);
    });
  }
}

function getBuilderRequirement() {
  const type = els.sourceBuilderType ? els.sourceBuilderType.value : "";
  if (state.activeSourceTask && state.activeSourceTask.requirementKey) {
    const active = REAL_SOURCE_REQUIREMENTS.find((item) => item.key === state.activeSourceTask.requirementKey);
    if (active && active.type === type) return active;
  }
  return REAL_SOURCE_REQUIREMENTS.find((item) => item.type === type)
    || REAL_SOURCE_REQUIREMENTS.find((item) => item.pattern.test(type))
    || REAL_SOURCE_REQUIREMENTS[0];
}

function addSourcePackDocFromBuilder() {
  const doc = makeSourcePackDocFromBuilder();
  if (!doc) return;
  state.sourcePackDocs = [doc, ...state.sourcePackDocs].slice(0, 40);
  state.selectedTicker = doc.ticker;
  state.activeTickers.add(doc.ticker);
  saveJson(STORAGE_KEYS.sourcePack, state.sourcePackDocs);
  rebuildDocumentCorpus();
  updateProgressFromSourceDoc(doc);
  renderSourcePackList();
  renderSourceMatrixOptions();
  renderSourceMatrix();
  renderRealSourceStarterPack();
  renderBriefWorkbench();
  renderInvestmentGate();
  renderMemoReviewRoom();
  renderLaunchControlRoom();
  renderPagesDeploymentDoctor();
  resetSourceConfidenceChecks();
  renderFilingCapturePreview();
  renderSourceIntakeDoctor();
  state.importReport = makeImportReport([doc], []);
  renderImportSummary();
  flashBuilderResult(`${doc.ticker} ${doc.type} added as ${shortSourceStatus(doc)} evidence and enabled in the live corpus. Use Return to dossier to confirm completeness.`, "success");
  renderActiveSourceTask({
    ticker: doc.ticker,
    label: shortDocType(doc.type),
    status: "Saved to live corpus",
    instruction: "Return to the dossier to confirm completeness, or export documents JSON when this source is ready to ship."
  });
}

function makeSourcePackDocFromBuilder() {
  const ticker = normalizeTicker(els.sourceBuilderTicker.value || state.selectedTicker || "CUSTOM");
  const company = getCompany(ticker);
  const type = els.sourceBuilderType.value || "Research note";
  const period = (els.sourceBuilderPeriod.value || "Current period").trim();
  const date = els.sourceBuilderDate.value || new Date().toISOString().slice(0, 10);
  const status = normalizeSourceStatus(els.sourceBuilderStatus.value || "real");
  const title = (els.sourceBuilderTitleInput.value || `${ticker} ${type}`).trim();
  const rawSourceUrl = (els.sourceBuilderUrl.value || "").trim();
  const sourceUrl = normalizeExternalUrl(rawSourceUrl);
  const sections = Array.from(els.sourceBuilderSections.querySelectorAll("textarea"))
    .map((textarea) => ({
      title: textarea.dataset.sectionTitle || "Source section",
      text: textarea.value.replace(/\s+/g, " ").trim()
    }))
    .filter((section) => section.text.length > 30);

  if (rawSourceUrl && !sourceUrl) {
    if (els.sourceBuilderUrl) els.sourceBuilderUrl.focus();
    flashBuilderResult("Use a valid http/https Source URL under 2048 characters, or leave the field blank for non-REAL draft records.", "error");
    return null;
  }

  if (status === "real" && !sourceUrl) {
    if (els.sourceBuilderUrl) els.sourceBuilderUrl.focus();
    flashBuilderResult("REAL records need an official https Source URL before they can enter the live corpus.", "error");
    return null;
  }

  if (status === "real" && !isHttpsUrl(sourceUrl)) {
    if (els.sourceBuilderUrl) els.sourceBuilderUrl.focus();
    flashBuilderResult("REAL records must use an https Source URL. Use imported or synthetic quality for offline drafts.", "error");
    return null;
  }

  if (status === "real" && !isSourceConfidenceReady()) {
    flashBuilderResult("Confirm all three REAL source checks before adding verified evidence.", "error");
    if (els.sourceConfidenceChecklist) els.sourceConfidenceChecklist.scrollIntoView({ behavior: "smooth", block: "center" });
    return null;
  }

  if (!sections.length) {
    const firstTextarea = els.sourceBuilderSections.querySelector("textarea");
    if (firstTextarea) firstTextarea.focus();
    flashBuilderResult("Paste at least one source section with enough text before adding it.", "error");
    return null;
  }

  const intakeAudit = makeSourceIntakeAudit();
  if (status === "real" && intakeAudit.blockers.length) {
    renderSourceIntakeDoctor({ focus: true });
    flashBuilderResult(`Source Intake Doctor blocked REAL save: ${intakeAudit.blockers[0].label}.`, "error");
    return null;
  }

  return normalizeDocumentRecord({
    id: makeSourceRecordId(ticker, type, period, date),
    ticker,
    company: company ? company.name : `${ticker} source pack`,
    type,
    period,
    date,
    sourceStatus: status,
    sourceLabel: sourceStatusLabel({ sourceStatus: status }),
    sourceUrl,
    title,
    sections
  }, status);
}

function makeSourceRecordId(ticker, type, period, date) {
  const slug = `${ticker}-${type}-${period}-${date}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 84);
  return `source-${slug}-${Date.now().toString(36)}`;
}

function renderSourcePackList() {
  if (!els.sourcePackList) return;
  if (els.sourcePackCount) {
    els.sourcePackCount.textContent = `${state.sourcePackDocs.length} record${state.sourcePackDocs.length === 1 ? "" : "s"}`;
  }
  renderExportReadiness();
  if (!state.sourcePackDocs.length) {
    els.sourcePackList.innerHTML = `<div class="empty-list">Verified source records you build here will appear in this pack.</div>`;
    return;
  }
  els.sourcePackList.innerHTML = state.sourcePackDocs.map((doc) => `
    <article class="source-pack-item">
      <div>
        <span class="source-badge ${sourceStatusClass(doc)}">${escapeHtml(shortSourceStatus(doc))}</span>
        <strong>${escapeHtml(doc.ticker)} - ${escapeHtml(doc.type)}</strong>
        <p>${escapeHtml(doc.period)} - ${escapeHtml(doc.date)} - ${doc.sections.length} section${doc.sections.length === 1 ? "" : "s"}</p>
      </div>
      <button type="button" data-source-doc-id="${escapeAttr(doc.id)}" aria-label="Load source record">Load</button>
    </article>
  `).join("");
  els.sourcePackList.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const doc = state.sourcePackDocs.find((item) => item.id === button.dataset.sourceDocId);
      if (!doc) return;
      state.selectedTicker = doc.ticker;
      renderSourceBuilderTickerOptions();
      els.sourceBuilderType.value = doc.type;
      els.sourceBuilderStatus.value = normalizeSourceStatus(doc.sourceStatus);
      els.sourceBuilderPeriod.value = doc.period;
      els.sourceBuilderDate.value = doc.date;
      els.sourceBuilderUrl.value = doc.sourceUrl || "";
      els.sourceBuilderTitleInput.value = doc.title || `${doc.ticker} ${doc.type}`;
      renderSourceBuilderSections();
      const textareas = Array.from(els.sourceBuilderSections.querySelectorAll("textarea"));
      doc.sections.forEach((section, index) => {
        if (textareas[index]) {
          textareas[index].dataset.sectionTitle = section.title;
          textareas[index].previousElementSibling.textContent = section.title;
          textareas[index].value = section.text;
        }
      });
      renderFilingCapturePreview();
      renderSourceIntakeDoctor();
      flashBuilderResult(`${doc.ticker} source record loaded into the builder.`, "neutral");
    });
  });
}

function renderExportReadiness() {
  if (!els.exportReadiness) return;
  const docs = state.sourcePackDocs;
  const uploadTarget = "data/documents.json";
  if (!docs.length) {
    els.exportReadiness.innerHTML = `
      <div class="export-status is-empty">
        <span>Export readiness</span>
        <strong>No builder records yet</strong>
        <p>Use Replace with REAL, Upgrade next source, or paste a verified source below. The export checklist will update as records are added.</p>
      </div>
      <div class="export-path">
        <span>GitHub target</span>
        <code>${escapeHtml(uploadTarget)}</code>
      </div>
    `;
    return;
  }

  const summary = makeExportReadinessSummary(docs);
  const statusClass = summary.ready ? "is-ready" : "is-review";
  const statusTitle = summary.ready ? "Ready to export full documents.json" : "Review before shipping";
  const statusText = summary.ready
    ? `Builder pack has ${summary.realCount} REAL record${summary.realCount === 1 ? "" : "s"} with source URLs and no SYN starter records.`
    : summary.reviewNote;
  els.exportReadiness.innerHTML = `
    <div class="export-status ${statusClass}">
      <span>Export readiness</span>
      <strong>${escapeHtml(statusTitle)}</strong>
      <p>${escapeHtml(statusText)}</p>
    </div>
    <div class="export-stats" aria-label="Source pack readiness statistics">
      ${makeExportStat("Records", summary.total)}
      ${makeExportStat("REAL", summary.realCount)}
      ${makeExportStat("IMP", summary.importedCount)}
      ${makeExportStat("SYN", summary.syntheticCount)}
      ${makeExportStat("URLs missing", summary.missingUrls)}
      ${makeExportStat("Sections", summary.sectionCount)}
    </div>
    <ol class="export-steps">
      <li><strong>Export source pack</strong><span>Review or share only the builder records.</span></li>
      <li><strong>Export full documents.json</strong><span>Use this when you want the live site corpus updated.</span></li>
      <li><strong>Upload in GitHub</strong><span>Replace <code>${escapeHtml(uploadTarget)}</code>, commit, then refresh the site with <code>?v=15</code>.</span></li>
    </ol>
    <div class="export-path">
      <span>Public app reads from</span>
      <code>${escapeHtml(uploadTarget)}</code>
    </div>
  `;
}

function makeExportReadinessSummary(docs) {
  const total = docs.length;
  const realCount = docs.filter((doc) => normalizeSourceStatus(doc.sourceStatus) === "real").length;
  const importedCount = docs.filter((doc) => normalizeSourceStatus(doc.sourceStatus) === "imported").length;
  const syntheticCount = docs.filter((doc) => normalizeSourceStatus(doc.sourceStatus) === "synthetic").length;
  const missingUrls = docs.filter((doc) => normalizeSourceStatus(doc.sourceStatus) === "real" && !(doc.sourceUrl || "").trim()).length;
  const sectionCount = docs.reduce((sum, doc) => sum + (Array.isArray(doc.sections) ? doc.sections.length : 0), 0);
  const notes = [];
  if (!realCount) notes.push("add at least one REAL verified source");
  if (missingUrls) notes.push(`${missingUrls} REAL record${missingUrls === 1 ? " needs" : "s need"} source URL`);
  if (syntheticCount) notes.push(`${syntheticCount} SYN starter record${syntheticCount === 1 ? "" : "s"} still in the builder pack`);
  if (importedCount) notes.push(`${importedCount} imported record${importedCount === 1 ? "" : "s"} should be reviewed before marking REAL`);
  return {
    total,
    realCount,
    importedCount,
    syntheticCount,
    missingUrls,
    sectionCount,
    ready: total > 0 && realCount > 0 && syntheticCount === 0 && missingUrls === 0,
    reviewNote: notes.length ? `Before replacing public data, ${notes.join(", ")}.` : "Review record titles, periods, dates, URLs, and pasted sections before export."
  };
}

function makeExportStat(label, value) {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function exportSourcePackJson() {
  if (!state.sourcePackDocs.length) {
    flashBuilderResult("Add at least one source record before exporting the builder source pack.", "error");
    return;
  }
  const filename = `majlisalpha-documents-source-pack-${new Date().toISOString().slice(0, 10)}.json`;
  downloadTextFile(filename, JSON.stringify(state.sourcePackDocs, null, 2), "application/json;charset=utf-8");
  flashBuilderResult(`Exported ${state.sourcePackDocs.length} builder source record${state.sourcePackDocs.length === 1 ? "" : "s"}. For the public site, merge it into data/documents.json or use Export full documents.json.`, "success");
}

function exportMergedDocumentsJson() {
  const mergedDocs = dedupeDocuments([...SAMPLE_DOCS, ...state.sourcePackDocs, ...state.uploadedDocs]);
  const filename = "documents.json";
  downloadTextFile(filename, JSON.stringify(mergedDocs, null, 2), "application/json;charset=utf-8");
  flashBuilderResult(`Exported full documents.json with ${mergedDocs.length} records. Upload it to GitHub at data/documents.json, then refresh the public site with ?v=15.`, "success");
}

async function importSourcePackJson(file) {
  try {
    const text = await file.text();
    const parsed = JSON.parse(text);
    const docs = normalizeImportedSourcePack(parsed);
    if (!docs.length) {
      flashBuilderResult("No valid source records found in that JSON file.", "error");
      return;
    }
    const existingIds = new Set(state.sourcePackDocs.map((doc) => doc.id));
    const freshDocs = docs.map((doc) => existingIds.has(doc.id) ? { ...doc, id: `${doc.id}-${Date.now().toString(36)}` } : doc);
    state.sourcePackDocs = dedupeDocuments([...freshDocs, ...state.sourcePackDocs]).slice(0, 80);
    freshDocs.forEach((doc) => state.activeTickers.add(doc.ticker));
    saveJson(STORAGE_KEYS.sourcePack, state.sourcePackDocs);
    rebuildDocumentCorpus();
    freshDocs.forEach(updateProgressFromSourceDoc);
    renderSourcePackList();
    renderSourceMatrixOptions();
    renderSourceMatrix();
    renderRealSourceStarterPack();
    state.importReport = makeImportReport(freshDocs, []);
    renderImportSummary();
    flashBuilderResult(`Imported ${freshDocs.length} source record${freshDocs.length === 1 ? "" : "s"} from JSON.`, "success");
  } catch (error) {
    flashBuilderResult(`Could not import JSON: ${error.message}`, "error");
  }
}

function normalizeImportedSourcePack(parsed) {
  const records = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed.documents)
      ? parsed.documents
      : Array.isArray(parsed.sourcePackDocs)
        ? parsed.sourcePackDocs
        : [];
  return records
    .map((doc) => normalizeDocumentRecord(doc, doc.sourceStatus || "real"))
    .filter((doc) => doc.ticker && doc.type && doc.sections.some((section) => String(section.text || "").trim().length > 30));
}

function dedupeDocuments(docs) {
  const seen = new Set();
  const deduped = [];
  for (const doc of docs) {
    const key = doc.id || `${doc.ticker}-${doc.type}-${doc.period}-${doc.date}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(doc);
  }
  return deduped;
}

function flashBuilderResult(message, tone = "neutral") {
  if (!els.sourceBuilderResult) return;
  els.sourceBuilderResult.className = `builder-result is-${tone}`;
  els.sourceBuilderResult.textContent = message;
}

function renderSourceMatrixOptions() {
  if (!els.matrixTickerFilter) return;
  const current = els.matrixTickerFilter.value || "all";
  const companies = getCompanies();
  els.matrixTickerFilter.innerHTML = [
    `<option value="all">All companies</option>`,
    ...companies.map((company) => `<option value="${escapeAttr(company.ticker)}">${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</option>`)
  ].join("");
  els.matrixTickerFilter.value = companies.some((company) => company.ticker === current) ? current : "all";
}

function renderSourceMatrix() {
  if (!els.sourceMatrix || !els.sourceMatrixSummary) return;
  const rows = buildCoverageMatrixRows();
  const visibleRows = filterCoverageMatrixRows(rows);
  const allItems = rows.flatMap((row) => row.items);
  const counts = countSourceQueueStatuses(allItems);
  const totalSlots = allItems.length || 1;
  const realPercent = Math.round((counts.real / totalSlots) * 100);
  const gapCount = counts.missing + counts.synthetic;

  els.sourceMatrixSummary.innerHTML = [
    makeSourceQueueStat("Companies", rows.length),
    makeSourceQueueStat("Source slots", allItems.length),
    makeSourceQueueStat("REAL coverage", `${realPercent}%`),
    makeSourceQueueStat("Open gaps", gapCount)
  ].join("");

  if (!visibleRows.length) {
    els.sourceMatrix.innerHTML = `
      <tbody>
        <tr>
          <td><div class="empty-list">No coverage rows match this view.</div></td>
        </tr>
      </tbody>
    `;
    return;
  }

  els.sourceMatrix.innerHTML = `
    <thead>
      <tr>
        <th>Company</th>
        <th>Ready</th>
        ${REAL_SOURCE_REQUIREMENTS.map((requirement) => `<th>${escapeHtml(requirement.label)}</th>`).join("")}
        <th>Next action</th>
      </tr>
    </thead>
    <tbody>
      ${visibleRows.map((row) => renderCoverageMatrixRow(row)).join("")}
    </tbody>
  `;

  els.sourceMatrix.querySelectorAll("button[data-matrix-ticker]").forEach((button) => {
    button.addEventListener("click", () => loadSourceTaskIntoBuilder(button.dataset.matrixTicker, button.dataset.matrixKey));
  });
  els.sourceMatrix.querySelectorAll("button[data-matrix-next-ticker]").forEach((button) => {
    button.addEventListener("click", () => loadSourceTaskIntoBuilder(button.dataset.matrixNextTicker, button.dataset.matrixNextKey));
  });
}

function buildCoverageMatrixRows() {
  return getCompanies().map((company) => {
    const docs = getCompanyDocs(company.ticker);
    const items = REAL_SOURCE_REQUIREMENTS.map((requirement) => {
      const status = getRequirementStatus(docs, requirement);
      return {
        company,
        requirement,
        ...status,
        currentEvidence: status.doc
          ? `${shortSourceStatus(status.doc)} ${status.doc.type} (${status.doc.period || status.doc.date || "current"})`
          : "No matching source record"
      };
    });
    const realCount = items.filter((item) => item.statusKey === "real").length;
    const nextGap = items.find((item) => item.statusKey === "missing")
      || items.find((item) => item.statusKey === "synthetic")
      || items.find((item) => item.statusKey === "imported")
      || items[0];
    return {
      company,
      items,
      realCount,
      completeness: Math.round((realCount / REAL_SOURCE_REQUIREMENTS.length) * 100),
      nextGap
    };
  });
}

function filterCoverageMatrixRows(rows) {
  const tickerFilter = els.matrixTickerFilter ? els.matrixTickerFilter.value : "all";
  const statusFilter = els.matrixStatusFilter ? els.matrixStatusFilter.value : "priority";
  return rows.filter((row) => {
    const tickerMatch = tickerFilter === "all" || row.company.ticker === tickerFilter;
    const statusMatch = statusFilter === "all"
      || row.items.some((item) => item.statusKey === statusFilter)
      || statusFilter === "priority" && row.items.some((item) => item.statusKey === "missing" || item.statusKey === "synthetic");
    return tickerMatch && statusMatch;
  });
}

function renderCoverageMatrixRow(row) {
  return `
    <tr>
      <th scope="row">
        <span>${escapeHtml(row.company.ticker)}</span>
        <strong>${escapeHtml(row.company.name)}</strong>
      </th>
      <td>
        <div class="matrix-ready">
          <strong>${escapeHtml(row.completeness)}%</strong>
          <span>${escapeHtml(row.realCount)}/${escapeHtml(REAL_SOURCE_REQUIREMENTS.length)} REAL</span>
        </div>
      </td>
      ${row.items.map((item) => renderCoverageMatrixCell(item)).join("")}
      <td>
        <button class="matrix-next-button" type="button" data-matrix-next-ticker="${escapeAttr(row.company.ticker)}" data-matrix-next-key="${escapeAttr(row.nextGap.requirement.key)}">
          ${escapeHtml(row.nextGap.statusKey === "real" ? "Review REAL" : `Open ${row.nextGap.requirement.label}`)}
        </button>
      </td>
    </tr>
  `;
}

function renderCoverageMatrixCell(item) {
  return `
    <td>
      <button
        class="matrix-status ${escapeAttr(item.className)}"
        type="button"
        data-matrix-ticker="${escapeAttr(item.company.ticker)}"
        data-matrix-key="${escapeAttr(item.requirement.key)}"
        title="${escapeAttr(item.currentEvidence)}"
      >
        <strong>${escapeHtml(item.statusLabel)}</strong>
        <span>${escapeHtml(item.currentEvidence)}</span>
      </button>
    </td>
  `;
}

function openNextCoverageGap() {
  const rows = filterCoverageMatrixRows(buildCoverageMatrixRows());
  const next = rows.flatMap((row) => row.items)
    .find((item) => item.statusKey === "missing" || item.statusKey === "synthetic")
    || rows.flatMap((row) => row.items).find((item) => item.statusKey === "imported")
    || rows[0]?.items[0];
  if (!next) {
    flashSourceMatrixResult("No coverage gap matches this view.", "error");
    return;
  }
  loadSourceTaskIntoBuilder(next.company.ticker, next.requirement.key);
  flashSourceMatrixResult(`${next.company.ticker} ${next.requirement.label} opened in Source Pack Studio.`, "success");
}

function makeCoverageMatrixCsv() {
  const rows = filterCoverageMatrixRows(buildCoverageMatrixRows());
  const headers = ["Ticker", "Company", "Completeness", ...REAL_SOURCE_REQUIREMENTS.map((item) => item.label), "Next action"];
  const dataRows = rows.map((row) => [
    row.company.ticker,
    row.company.name,
    `${row.completeness}%`,
    ...row.items.map((item) => `${item.statusLabel} - ${item.currentEvidence}`),
    `${row.nextGap.requirement.label} - ${row.nextGap.statusLabel}`
  ]);
  return [headers, ...dataRows].map((row) => row.map(csvCell).join(",")).join("\n");
}

async function copyCoverageMatrixCsv() {
  const csv = makeCoverageMatrixCsv();
  hideCoverageMatrixExport();
  const copied = await copyTextToClipboard(csv);
  if (copied) {
    flashSourceMatrixResult("Copied the visible coverage matrix as CSV.", "success");
  } else {
    showCoverageMatrixExport(csv);
    flashSourceMatrixResult("Clipboard copy was blocked. CSV is shown below and can also be downloaded.", "error");
  }
}

function downloadCoverageMatrixCsv() {
  const csv = makeCoverageMatrixCsv();
  const filename = `majlisalpha-coverage-matrix-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadTextFile(filename, csv, "text/csv;charset=utf-8");
  hideCoverageMatrixExport();
  flashSourceMatrixResult("Downloaded the visible coverage matrix as CSV.", "success");
}

function showCoverageMatrixExport(csv) {
  if (!els.sourceMatrixExport) return;
  els.sourceMatrixExport.hidden = false;
  els.sourceMatrixExport.innerHTML = `
    <div>
      <strong>Manual CSV copy</strong>
      <span>Clipboard access is blocked in this browser session. Select the CSV below or use Download CSV.</span>
    </div>
    <textarea readonly rows="8">${escapeHtml(csv)}</textarea>
  `;
  const textarea = els.sourceMatrixExport.querySelector("textarea");
  if (textarea) {
    textarea.focus();
    textarea.select();
  }
}

function hideCoverageMatrixExport() {
  if (!els.sourceMatrixExport) return;
  els.sourceMatrixExport.hidden = true;
  els.sourceMatrixExport.innerHTML = "";
}

function flashSourceMatrixResult(message, tone = "neutral") {
  if (!els.sourceMatrixResult) return;
  els.sourceMatrixResult.className = `builder-result is-${tone}`;
  els.sourceMatrixResult.textContent = message;
}

function renderRealSourceStarterPack() {
  if (!els.realStarterGrid || !els.realStarterSummary) return;
  const starterRows = STARTER_PACK_TICKERS
    .map(makeStarterPackCompany)
    .filter(Boolean);
  const totalSlots = starterRows.length * REAL_SOURCE_REQUIREMENTS.length || 1;
  const realSlots = starterRows.reduce((sum, row) => sum + row.realCount, 0);
  const importedSlots = starterRows.reduce((sum, row) => sum + row.importedCount, 0);
  const readyCount = starterRows.filter((row) => row.investmentReady).length;

  els.realStarterSummary.innerHTML = [
    makeSourceQueueStat("Priority companies", starterRows.length),
    makeSourceQueueStat("REAL sources", `${realSlots}/${totalSlots}`),
    makeSourceQueueStat("Imported review", importedSlots),
    makeSourceQueueStat("Investment-ready", readyCount)
  ].join("");

  els.realStarterGrid.innerHTML = starterRows.map(renderStarterPackCard).join("");

  els.realStarterGrid.querySelectorAll("button[data-starter-ticker]").forEach((button) => {
    button.addEventListener("click", () => {
      loadSourceTaskIntoBuilder(button.dataset.starterTicker, button.dataset.starterKey);
      flashRealStarterResult(`${button.dataset.starterTicker} ${button.dataset.starterLabel} opened in Source Studio.`, "success");
    });
  });

  els.realStarterGrid.querySelectorAll("button[data-starter-question]").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.starterQuestion || "";
      els.queryInput.value = question;
      runAnalysis(question);
      document.querySelector("#desk")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

function makeStarterPackCompany(ticker) {
  const company = getCompany(ticker);
  if (!company) return null;
  const docs = getCompanyDocs(company.ticker);
  const checklist = makeRealDataChecklist(docs);
  const realCount = checklist.filter((item) => item.statusKey === "real").length;
  const importedCount = checklist.filter((item) => item.statusKey === "imported").length;
  const syntheticCount = checklist.filter((item) => item.statusKey === "synthetic").length;
  const missingCount = checklist.filter((item) => item.statusKey === "missing").length;
  const completeness = makeRealSourceCompleteness(checklist);
  const hasAnnual = checklist.some((item) => item.key === "annual-report" && item.statusKey === "real");
  const hasManagement = checklist.some((item) => ["concall", "results"].includes(item.key) && item.statusKey === "real");
  const next = checklist.find((item) => item.statusKey === "missing")
    || checklist.find((item) => item.statusKey === "synthetic")
    || checklist.find((item) => item.statusKey === "imported")
    || checklist[0];
  const investmentReady = realCount === checklist.length;
  const pilotReady = !investmentReady && realCount >= 3 && hasAnnual && hasManagement;
  const label = investmentReady
    ? "Investment-use ready"
    : pilotReady
      ? "Pilot review ready"
      : "Prototype evidence only";
  const className = investmentReady ? "is-ready" : pilotReady ? "is-review" : "is-blocked";
  return {
    company,
    checklist,
    completeness,
    realCount,
    importedCount,
    syntheticCount,
    missingCount,
    next,
    investmentReady,
    pilotReady,
    label,
    className
  };
}

function renderStarterPackCard(row) {
  const nextLabel = row.next ? row.next.label : "Annual report";
  const question = `What are the most important source-backed risks for $${row.company.ticker}?`;
  return `
    <article class="starter-pack-card ${escapeAttr(row.className)}">
      <div class="starter-pack-head">
        <div>
          <span>${escapeHtml(row.label)}</span>
          <strong>${escapeHtml(row.company.ticker)} - ${escapeHtml(row.company.name)}</strong>
        </div>
        <em>${escapeHtml(row.completeness.percent)}%</em>
      </div>
      <p>${escapeHtml(row.realCount)}/${escapeHtml(row.checklist.length)} REAL source types. ${escapeHtml(row.syntheticCount)} SYN starter, ${escapeHtml(row.missingCount)} missing, ${escapeHtml(row.importedCount)} imported review.</p>
      <div class="starter-pack-slots">
        ${row.checklist.map((item) => `
          <button
            type="button"
            class="${escapeAttr(item.className)}"
            data-starter-ticker="${escapeAttr(row.company.ticker)}"
            data-starter-key="${escapeAttr(item.key)}"
            data-starter-label="${escapeAttr(item.label)}"
          >
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.status)}</span>
          </button>
        `).join("")}
      </div>
      <div class="starter-pack-actions">
        <button class="secondary-button" type="button" data-starter-ticker="${escapeAttr(row.company.ticker)}" data-starter-key="${escapeAttr(row.next ? row.next.key : "annual-report")}" data-starter-label="${escapeAttr(nextLabel)}">
          Replace ${escapeHtml(nextLabel)}
        </button>
        <button class="secondary-button" type="button" data-starter-question="${escapeAttr(question)}">Test answer</button>
      </div>
    </article>
  `;
}

function flashRealStarterResult(message, tone = "neutral") {
  if (!els.realStarterResult) return;
  els.realStarterResult.className = `builder-result is-${tone}`;
  els.realStarterResult.textContent = message;
}

function renderSourceQueueOptions() {
  if (!els.queueTickerFilter) return;
  const current = els.queueTickerFilter.value || "all";
  const companies = getCompanies();
  els.queueTickerFilter.innerHTML = [
    `<option value="all">All companies</option>`,
    ...companies.map((company) => `<option value="${escapeAttr(company.ticker)}">${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</option>`)
  ].join("");
  els.queueTickerFilter.value = companies.some((company) => company.ticker === current) ? current : "all";
}

function renderSourceQueue() {
  if (!els.sourceQueueList || !els.sourceQueueSummary) return;
  const items = buildSourceQueueItems();
  const tickerFilter = els.queueTickerFilter ? els.queueTickerFilter.value : "all";
  const statusFilter = els.queueStatusFilter ? els.queueStatusFilter.value : "priority";
  const filtered = items.filter((item) => {
    const tickerMatch = tickerFilter === "all" || item.company.ticker === tickerFilter;
    const statusMatch = statusFilter === "all"
      || item.statusKey === statusFilter
      || statusFilter === "priority" && (item.statusKey === "missing" || item.statusKey === "synthetic");
    return tickerMatch && statusMatch;
  });
  const counts = countSourceQueueStatuses(items);

  els.sourceQueueSummary.innerHTML = [
    makeSourceQueueStat("Missing", counts.missing),
    makeSourceQueueStat("SYN starter", counts.synthetic),
    makeSourceQueueStat("IMP review", counts.imported),
    makeSourceQueueStat("REAL ready", counts.real)
  ].join("");

  if (!filtered.length) {
    els.sourceQueueList.innerHTML = `<div class="empty-list">No source tasks match this filter.</div>`;
    return;
  }

  els.sourceQueueList.innerHTML = filtered.map((item) => `
    <article class="source-task-card ${escapeAttr(item.className)}">
      <div class="source-task-head">
        <div>
          <span>${escapeHtml(item.company.ticker)} - ${escapeHtml(item.company.name)}</span>
          <strong>${escapeHtml(item.requirement.label)}</strong>
        </div>
        <em>${escapeHtml(item.statusLabel)}</em>
      </div>
      <p>${escapeHtml(item.requirement.instruction)}</p>
      <div class="source-task-meta">
        <span>Current evidence</span>
        <strong>${escapeHtml(item.currentEvidence)}</strong>
      </div>
      <div class="source-task-linkbar">
        ${sourceLinksForTask(item).slice(0, 3).map((link) => `<a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(link.label)}</a>`).join("")}
      </div>
      <div class="source-task-actions">
        <button class="secondary-button" type="button" data-hub-ticker="${escapeAttr(item.company.ticker)}" data-hub-key="${escapeAttr(item.requirement.key)}">Collect links</button>
        <button class="secondary-button" type="button" data-queue-ticker="${escapeAttr(item.company.ticker)}" data-queue-key="${escapeAttr(item.requirement.key)}">Open in studio</button>
      </div>
    </article>
  `).join("");

  els.sourceQueueList.querySelectorAll("button[data-queue-ticker]").forEach((button) => {
    button.addEventListener("click", () => {
      loadSourceTaskIntoBuilder(button.dataset.queueTicker, button.dataset.queueKey);
    });
  });
  els.sourceQueueList.querySelectorAll("button[data-hub-ticker]").forEach((button) => {
    button.addEventListener("click", () => {
      openSourceTaskInHub(button.dataset.hubTicker, button.dataset.hubKey);
    });
  });
}

function makeSourceQueueStat(label, value) {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function countSourceQueueStatuses(items) {
  return items.reduce((counts, item) => {
    counts[item.statusKey] = (counts[item.statusKey] || 0) + 1;
    return counts;
  }, { missing: 0, synthetic: 0, imported: 0, real: 0 });
}

function buildSourceQueueItems() {
  return getCompanies().flatMap((company) => {
    const docs = getCompanyDocs(company.ticker);
    return REAL_SOURCE_REQUIREMENTS.map((requirement) => {
      const status = getRequirementStatus(docs, requirement);
      return {
        company,
        requirement,
        ...status,
        currentEvidence: status.doc
          ? `${shortSourceStatus(status.doc)} ${status.doc.type} (${status.doc.period || status.doc.date || "current"})`
          : "No matching source record"
      };
    });
  });
}

function getRequirementStatus(docs, requirement) {
  const matches = docs.filter((doc) => requirement.pattern.test(`${doc.type || ""} ${doc.period || ""} ${doc.title || ""}`));
  const real = matches.find((doc) => normalizeSourceStatus(doc.sourceStatus) === "real");
  const imported = matches.find((doc) => normalizeSourceStatus(doc.sourceStatus) === "imported");
  const synthetic = matches.find((doc) => normalizeSourceStatus(doc.sourceStatus) === "synthetic");
  if (real) return { statusKey: "real", statusLabel: "REAL ready", className: "is-real", doc: real };
  if (imported) return { statusKey: "imported", statusLabel: "IMP review", className: "is-imported", doc: imported };
  if (synthetic) return { statusKey: "synthetic", statusLabel: "SYN starter", className: "is-synthetic", doc: synthetic };
  return { statusKey: "missing", statusLabel: "Needed", className: "is-missing", doc: null };
}

function loadSourceTaskIntoBuilder(ticker, requirementKey) {
  if (!els.sourceBuilderTicker || !els.sourceBuilderType) return;
  const requirement = REAL_SOURCE_REQUIREMENTS.find((item) => item.key === requirementKey) || REAL_SOURCE_REQUIREMENTS[0];
  const company = getCompany(ticker);
  state.selectedTicker = normalizeTicker(ticker);
  renderSourceBuilderTickerOptions();
  els.sourceBuilderTicker.value = state.selectedTicker;
  els.sourceBuilderType.value = requirement.type;
  els.sourceBuilderStatus.value = "real";
  els.sourceBuilderPeriod.value = /quarter|results|earnings call/i.test(requirement.type) ? "Q4 FY2026" : "FY2026";
  els.sourceBuilderDate.value = new Date().toISOString().slice(0, 10);
  els.sourceBuilderUrl.value = "";
  els.sourceBuilderTitleInput.value = `${company ? company.name : state.selectedTicker} ${requirement.label} source`;
  resetSourceConfidenceChecks();
  renderSourceBuilderSections();
  renderSourceAssistantLinks();
  state.activeSourceTask = {
    ticker: state.selectedTicker,
    requirementKey: requirement.key,
    label: requirement.label,
    status: "Replacement task loaded",
    instruction: requirement.instruction
  };
  renderActiveSourceTask(state.activeSourceTask);
  renderImportTickerOptions();
  renderValuationOptions();
  renderCompanyDossier();
  updateValuationFromCompany();
  updateValuation();
  drawSignalMap();
  flashBuilderResult(`${state.selectedTicker} ${requirement.label} task loaded. Paste the source text and add it as REAL evidence.`, "neutral");
  document.querySelector("#source-builder")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderActiveSourceTask(task = state.activeSourceTask) {
  if (!els.activeSourceTask) return;
  if (!task) {
    els.activeSourceTask.hidden = true;
    els.activeSourceTask.innerHTML = "";
    return;
  }
  const company = getCompany(task.ticker);
  const steps = makeSourceCollectionSteps(task);
  els.activeSourceTask.hidden = false;
  els.activeSourceTask.innerHTML = `
    <div class="active-source-head">
      <div>
        <span>Active replacement task</span>
        <strong>${escapeHtml(task.ticker)} ${escapeHtml(task.label)}</strong>
        <p>${escapeHtml(task.instruction || "Paste verified source sections, add the source URL, then add to live corpus.")}</p>
      </div>
      <button type="button" data-active-task-return="${escapeAttr(company ? company.ticker : task.ticker)}">Return to dossier</button>
    </div>
    <div class="source-collection-steps" aria-label="Source collection steps">
      ${steps.map((step, index) => `
        <div class="${step.done ? "is-done" : "is-next"}">
          <span>${index + 1}</span>
          <strong>${escapeHtml(step.label)}</strong>
          <p>${escapeHtml(step.help)}</p>
        </div>
      `).join("")}
    </div>
  `;
  const button = els.activeSourceTask.querySelector("button[data-active-task-return]");
  if (button) button.addEventListener("click", returnToDossier);
}

function makeSourceCollectionSteps(task) {
  const taskId = sourceTaskId(task.ticker, task.requirementKey);
  const progress = state.sourceProgress[taskId] || { stage: "queued" };
  const stageRank = { queued: 0, collected: 1, pasted: 2, verified: 3 };
  const rank = stageRank[progress.stage] || 0;
  const sourceUrl = normalizeExternalUrl(els.sourceBuilderUrl ? els.sourceBuilderUrl.value : "");
  const hasSections = els.sourceBuilderSections
    ? Array.from(els.sourceBuilderSections.querySelectorAll("textarea")).some((textarea) => textarea.value.replace(/\s+/g, "").length > 80)
    : false;
  return [
    {
      label: "Open source site",
      help: "Use the buttons below to open ADX, DFM, Nasdaq Dubai, SCA, or Company IR.",
      done: rank >= 1
    },
    {
      label: "Fill source URL",
      help: "Click Fill URL after choosing the official source page.",
      done: Boolean(sourceUrl)
    },
    {
      label: "Paste source text",
      help: "Paste relevant results, earnings call, annual report, ownership, or announcement text into the big box.",
      done: rank >= 2 || hasSections
    },
    {
      label: "Detect and review",
      help: "Click Detect and fill builder, then review the filled source sections.",
      done: hasSections
    },
    {
      label: "Add to live corpus",
      help: "Only add as REAL after the URL and pasted text match the official source.",
      done: rank >= 3
    }
  ];
}

function markActiveSourceTaskStage(stage) {
  if (!state.activeSourceTask) return;
  const taskId = sourceTaskId(state.activeSourceTask.ticker, state.activeSourceTask.requirementKey);
  const normalizedStage = SOURCE_PROGRESS_STAGES.some((item) => item.id === stage) ? stage : "queued";
  const current = state.sourceProgress[taskId];
  const rank = { queued: 0, collected: 1, pasted: 2, verified: 3 };
  if (current && (rank[current.stage] || 0) > (rank[normalizedStage] || 0)) return;
  state.sourceProgress[taskId] = {
    ...(current || {}),
    taskId,
    stage: normalizedStage,
    updatedAt: new Date().toISOString()
  };
  saveJson(STORAGE_KEYS.sourceProgress, state.sourceProgress);
  renderSourceWorkspace();
}

function returnToDossier() {
  const ticker = state.activeSourceTask ? state.activeSourceTask.ticker : state.selectedTicker;
  if (ticker) {
    state.selectedTicker = ticker;
    renderCompanyDossier();
  }
  document.querySelector(".dossier-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function makeSourceChecklistCsv() {
  const headers = ["Ticker", "Company", "Source type", "Status", "Current evidence", "Collection note"];
  const rows = buildSourceQueueItems().map((item) => [
    item.company.ticker,
    item.company.name,
    item.requirement.label,
    item.statusLabel,
    item.currentEvidence,
    item.requirement.instruction
  ]);
  return [headers, ...rows].map((row) => row.map(csvCell).join(",")).join("\n");
}

function exportSourceChecklistCsv() {
  const filename = `majlisalpha-real-data-checklist-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadTextFile(filename, makeSourceChecklistCsv(), "text/csv;charset=utf-8");
  flashSourceQueueResult("Exported the full real-data checklist as CSV.", "success");
}

function copySourceChecklistCsv() {
  const csv = makeSourceChecklistCsv();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(csv).catch(() => fallbackCopy(csv));
  } else {
    fallbackCopy(csv);
  }
  flashSourceQueueResult("Copied the real-data checklist CSV.", "success");
}

function flashSourceQueueResult(message, tone = "neutral") {
  if (!els.sourceQueueResult) return;
  els.sourceQueueResult.className = `builder-result is-${tone}`;
  els.sourceQueueResult.textContent = message;
}

function renderSourceHubOptions() {
  if (!els.hubTickerSelect || !els.hubRequirementSelect) return;
  const currentTicker = els.hubTickerSelect.value || state.selectedTicker || getCompanies()[0]?.ticker || "";
  const currentRequirement = els.hubRequirementSelect.value || "annual-report";
  els.hubTickerSelect.innerHTML = getCompanies().map((company) => {
    return `<option value="${escapeAttr(company.ticker)}">${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</option>`;
  }).join("");
  els.hubRequirementSelect.innerHTML = REAL_SOURCE_REQUIREMENTS.map((requirement) => {
    return `<option value="${escapeAttr(requirement.key)}">${escapeHtml(requirement.label)}</option>`;
  }).join("");
  els.hubTickerSelect.value = getCompany(currentTicker) ? currentTicker : getCompanies()[0]?.ticker || "";
  els.hubRequirementSelect.value = REAL_SOURCE_REQUIREMENTS.some((item) => item.key === currentRequirement) ? currentRequirement : "annual-report";
}

function renderSourceWorkspace() {
  if (!els.sourceWorkspaceList || !els.sourceWorkspaceSummary) return;
  const items = buildSourceQueueItems().map((item) => ({ ...item, progress: getSourceTaskProgress(item) }));
  const counts = countWorkspaceStages(items);
  const filtered = filterWorkspaceItems(items);
  const limit = Number(els.workspaceBatchSize ? els.workspaceBatchSize.value : 6) || 6;
  const batch = filtered.slice(0, limit);

  els.sourceWorkspaceSummary.innerHTML = [
    makeWorkspaceStat("Queued", counts.queued),
    makeWorkspaceStat("Collected", counts.collected),
    makeWorkspaceStat("Pasted", counts.pasted),
    makeWorkspaceStat("Verified", counts.verified)
  ].join("");

  if (!batch.length) {
    els.sourceWorkspaceList.innerHTML = `<div class="empty-list">No workspace tasks match this view.</div>`;
    return;
  }

  els.sourceWorkspaceList.innerHTML = batch.map((item) => `
    <article class="workspace-task-card stage-${escapeAttr(item.progress.stage)} ${escapeAttr(item.className)}">
      <div class="workspace-task-top">
        <div>
          <span>${escapeHtml(item.company.ticker)} - ${escapeHtml(item.company.name)}</span>
          <strong>${escapeHtml(item.requirement.label)}</strong>
        </div>
        <em>${escapeHtml(progressStageLabel(item.progress.stage))}</em>
      </div>
      <p>${escapeHtml(item.requirement.instruction)}</p>
      <div class="source-task-meta">
        <span>Evidence status</span>
        <strong>${escapeHtml(item.statusLabel)} - ${escapeHtml(item.currentEvidence)}</strong>
      </div>
      <div class="workspace-stage-grid">
        ${SOURCE_PROGRESS_STAGES.map((stage) => `
          <button type="button" class="${item.progress.stage === stage.id ? "is-active" : ""}" data-progress-task="${escapeAttr(sourceTaskId(item.company.ticker, item.requirement.key))}" data-progress-stage="${escapeAttr(stage.id)}">${escapeHtml(stage.label)}</button>
        `).join("")}
      </div>
      <div class="source-task-actions">
        <button class="secondary-button" type="button" data-workspace-hub-ticker="${escapeAttr(item.company.ticker)}" data-workspace-hub-key="${escapeAttr(item.requirement.key)}">Collect links</button>
        <button class="secondary-button" type="button" data-workspace-studio-ticker="${escapeAttr(item.company.ticker)}" data-workspace-studio-key="${escapeAttr(item.requirement.key)}">Open in studio</button>
      </div>
    </article>
  `).join("");

  els.sourceWorkspaceList.querySelectorAll("button[data-progress-task]").forEach((button) => {
    button.addEventListener("click", () => {
      setSourceTaskProgress(button.dataset.progressTask, button.dataset.progressStage);
    });
  });
  els.sourceWorkspaceList.querySelectorAll("button[data-workspace-hub-ticker]").forEach((button) => {
    button.addEventListener("click", () => openSourceTaskInHub(button.dataset.workspaceHubTicker, button.dataset.workspaceHubKey));
  });
  els.sourceWorkspaceList.querySelectorAll("button[data-workspace-studio-ticker]").forEach((button) => {
    button.addEventListener("click", () => loadSourceTaskIntoBuilder(button.dataset.workspaceStudioTicker, button.dataset.workspaceStudioKey));
  });
}

function filterWorkspaceItems(items) {
  const view = els.workspaceFilter ? els.workspaceFilter.value : "pending";
  const priority = items
    .filter((item) => view === "all"
      || view === "verified" && item.progress.stage === "verified"
      || view === "active" && ["queued", "collected", "pasted"].includes(item.progress.stage)
      || view === "pending" && item.progress.stage !== "verified")
    .sort((a, b) => workspacePriority(a) - workspacePriority(b));
  return priority;
}

function workspacePriority(item) {
  const statusRank = { missing: 0, synthetic: 1, imported: 2, real: 3 };
  const stageRank = { queued: 0, collected: 1, pasted: 2, verified: 3 };
  return (stageRank[item.progress.stage] || 0) * 10 + (statusRank[item.statusKey] ?? 4);
}

function makeWorkspaceStat(label, value) {
  return `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
    </div>
  `;
}

function countWorkspaceStages(items) {
  return items.reduce((counts, item) => {
    counts[item.progress.stage] = (counts[item.progress.stage] || 0) + 1;
    return counts;
  }, { queued: 0, collected: 0, pasted: 0, verified: 0 });
}

function getSourceTaskProgress(item) {
  const id = sourceTaskId(item.company.ticker, item.requirement.key);
  const saved = state.sourceProgress[id];
  if (saved) return saved;
  return {
    stage: item.statusKey === "real" ? "verified" : "queued",
    updatedAt: "",
    taskId: id
  };
}

function setSourceTaskProgress(taskId, stage) {
  const normalizedStage = SOURCE_PROGRESS_STAGES.some((item) => item.id === stage) ? stage : "queued";
  state.sourceProgress[taskId] = {
    ...(state.sourceProgress[taskId] || {}),
    taskId,
    stage: normalizedStage,
    updatedAt: new Date().toISOString()
  };
  saveJson(STORAGE_KEYS.sourceProgress, state.sourceProgress);
  renderSourceWorkspace();
  if (state.activeSourceTask && sourceTaskId(state.activeSourceTask.ticker, state.activeSourceTask.requirementKey) === taskId) {
    renderActiveSourceTask();
  }
  flashSourceWorkspaceResult(`Task marked ${progressStageLabel(normalizedStage)}.`, "success");
}

function updateProgressFromSourceDoc(doc) {
  const requirement = REAL_SOURCE_REQUIREMENTS.find((item) => item.pattern.test(`${doc.type || ""} ${doc.period || ""} ${doc.title || ""}`));
  if (!requirement) return;
  const stage = normalizeSourceStatus(doc.sourceStatus) === "real" ? "verified" : "pasted";
  const taskId = sourceTaskId(doc.ticker, requirement.key);
  state.sourceProgress[taskId] = {
    ...(state.sourceProgress[taskId] || {}),
    taskId,
    stage,
    updatedAt: new Date().toISOString()
  };
  saveJson(STORAGE_KEYS.sourceProgress, state.sourceProgress);
  renderSourceWorkspace();
  if (state.activeSourceTask && sourceTaskId(state.activeSourceTask.ticker, state.activeSourceTask.requirementKey) === taskId) {
    renderActiveSourceTask();
  }
}

function sourceTaskId(ticker, requirementKey) {
  return `${normalizeTicker(ticker)}:${requirementKey}`;
}

function progressStageLabel(stage) {
  return SOURCE_PROGRESS_STAGES.find((item) => item.id === stage)?.label || "Queued";
}

function normalizeSourceProgress(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return Object.fromEntries(Object.entries(raw).map(([taskId, value]) => {
    const stage = SOURCE_PROGRESS_STAGES.some((item) => item.id === value?.stage) ? value.stage : "queued";
    return [taskId, {
      taskId,
      stage,
      updatedAt: value?.updatedAt || ""
    }];
  }));
}

function makeWorkspaceProgressRows() {
  return buildSourceQueueItems().map((item) => {
    const progress = getSourceTaskProgress(item);
    return {
      ticker: item.company.ticker,
      company: item.company.name,
      sourceType: item.requirement.label,
      sourceStatus: item.statusLabel,
      progress: progressStageLabel(progress.stage),
      updatedAt: progress.updatedAt || "",
      currentEvidence: item.currentEvidence,
      collectionNote: item.requirement.instruction
    };
  });
}

function exportWorkspaceProgressReport() {
  const rows = makeWorkspaceProgressRows();
  const headers = ["Ticker", "Company", "Source type", "Evidence status", "Workspace progress", "Updated at", "Current evidence", "Collection note"];
  const csvRows = rows.map((row) => [
    row.ticker,
    row.company,
    row.sourceType,
    row.sourceStatus,
    row.progress,
    row.updatedAt,
    row.currentEvidence,
    row.collectionNote
  ]);
  const filename = `majlisalpha-source-workspace-progress-${new Date().toISOString().slice(0, 10)}.csv`;
  downloadTextFile(filename, [headers, ...csvRows].map((row) => row.map(csvCell).join(",")).join("\n"), "text/csv;charset=utf-8");
  flashSourceWorkspaceResult("Exported workspace progress CSV.", "success");
}

function exportWorkspaceJsonPack() {
  const mergedDocs = dedupeDocuments([...SAMPLE_DOCS, ...state.sourcePackDocs, ...state.uploadedDocs]);
  const payload = {
    exportedAt: new Date().toISOString(),
    dataVersion: DATA_VERSION,
    documents: mergedDocs,
    sourceProgress: state.sourceProgress,
    progressReport: makeWorkspaceProgressRows()
  };
  const filename = `majlisalpha-workspace-pack-${new Date().toISOString().slice(0, 10)}.json`;
  downloadTextFile(filename, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
  flashSourceWorkspaceResult("Exported workspace JSON with documents and progress.", "success");
}

function flashSourceWorkspaceResult(message, tone = "neutral") {
  if (!els.sourceWorkspaceResult) return;
  els.sourceWorkspaceResult.className = `builder-result is-${tone}`;
  els.sourceWorkspaceResult.textContent = message;
}

function renderSourceHub() {
  if (!els.sourceHubTask || !els.sourceLinkPanel) return;
  const item = getCurrentSourceHubItem();
  if (!item) {
    els.sourceHubTask.innerHTML = `<div class="empty-list">Select a company and source type.</div>`;
    els.sourceLinkPanel.innerHTML = "";
    return;
  }
  const links = sourceLinksForTask(item);
  els.sourceHubTask.innerHTML = `
    <span class="source-badge ${escapeAttr(item.className.replace("is-", "source-"))}">${escapeHtml(item.statusLabel)}</span>
    <h3>${escapeHtml(item.company.ticker)} ${escapeHtml(item.requirement.label)} collection task</h3>
    <p>${escapeHtml(item.requirement.instruction)}</p>
    <div class="source-task-meta">
      <span>Current evidence</span>
      <strong>${escapeHtml(item.currentEvidence)}</strong>
    </div>
  `;
  els.sourceLinkPanel.innerHTML = `
    <div class="panel-heading">
      <h2>Source Links</h2>
      <span>${escapeHtml(item.company.ticker)}</span>
    </div>
    <div class="source-link-list">
      ${links.map((link) => `
        <a href="${escapeAttr(link.url)}" target="_blank" rel="noopener noreferrer">
          <span>${escapeHtml(link.label)}</span>
          <strong>${escapeHtml(link.note)}</strong>
        </a>
      `).join("")}
    </div>
  `;
}

function getCurrentSourceHubItem() {
  const ticker = normalizeTicker(els.hubTickerSelect ? els.hubTickerSelect.value : state.selectedTicker);
  const requirementKey = els.hubRequirementSelect ? els.hubRequirementSelect.value : "annual-report";
  const company = getCompany(ticker);
  const requirement = REAL_SOURCE_REQUIREMENTS.find((item) => item.key === requirementKey);
  if (!company || !requirement) return null;
  const status = getRequirementStatus(getCompanyDocs(company.ticker), requirement);
  return {
    company,
    requirement,
    ...status,
    currentEvidence: status.doc
      ? `${shortSourceStatus(status.doc)} ${status.doc.type} (${status.doc.period || status.doc.date || "current"})`
      : "No matching source record"
  };
}

function openSourceTaskInHub(ticker, requirementKey) {
  if (!els.hubTickerSelect || !els.hubRequirementSelect) return;
  els.hubTickerSelect.value = normalizeTicker(ticker);
  els.hubRequirementSelect.value = requirementKey;
  renderSourceHub();
  flashSourceHubResult("Collection links loaded for the selected task.", "neutral");
  document.querySelector("#source-hub")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function sourceLinksForTask(item) {
  const ticker = item.company.ticker;
  const encodedTicker = encodeURIComponent(ticker);
  const companySearch = encodeURIComponent(`${ticker} ${item.company.name} ${item.requirement.label}`);
  const links = [
    {
      label: "Company IR",
      url: COMPANY_IR_LINKS[ticker] || `https://www.google.com/search?q=${companySearch}+investor+relations`,
      note: "Primary source for annual reports, presentations, earnings-call notes, and investor updates."
    },
    ...((MARKET_SOURCE_LINKS[item.requirement.key] || []).map((link) => ({
      ...link,
      note: "Official market filing page. Search or filter by ticker, company name, period, and filing type."
    }))),
    {
      label: "Market source search",
      url: `https://www.google.com/search?q=${companySearch}+UAE+listed+company+financials`,
      note: "Fast cross-check for public company documents, ratios, and notes before the source is pasted into MajlisAlpha."
    },
    {
      label: "Web source search",
      url: `https://www.google.com/search?q=${companySearch}+site%3A${encodeURIComponent(new URL(COMPANY_IR_LINKS[ticker] || "https://www.adx.ae").hostname)}`,
      note: "Fallback search scoped to the likely official site."
    }
  ];
  return links
    .map((link) => ({ ...link, url: normalizeExternalUrl(link.url) }))
    .filter((link) => link.url);
}

function makeSourceHubTaskText(item = getCurrentSourceHubItem()) {
  if (!item) return "";
  const links = sourceLinksForTask(item).map((link) => `- ${link.label}: ${link.url}`).join("\n");
  return [
    `# MajlisAlpha Source Task: ${item.company.ticker} ${item.requirement.label}`,
    "",
    `Company: ${item.company.name}`,
    `Ticker: ${item.company.ticker}`,
    `Status: ${item.statusLabel}`,
    `Current evidence: ${item.currentEvidence}`,
    "",
    "Collection note:",
    item.requirement.instruction,
    "",
    "Open these sources:",
    links,
    "",
    "Paste into Source Pack Studio:",
    getSourceSectionTemplates(item.requirement.type).map((section) => `- ${section}`).join("\n"),
    "",
    "Mark as REAL only after the source URL, period, date, and pasted sections have been checked."
  ].join("\n");
}

function copySourceHubTask() {
  const task = makeSourceHubTaskText();
  if (!task) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(task).catch(() => fallbackCopy(task));
  } else {
    fallbackCopy(task);
  }
  flashSourceHubResult("Copied the selected acquisition task.", "success");
}

function exportAssistantTaskList() {
  const priorityTasks = buildSourceQueueItems().filter((item) => item.statusKey === "missing" || item.statusKey === "synthetic");
  const content = [
    "# MajlisAlpha Source Acquisition Task List",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    "",
    ...priorityTasks.map((item) => makeSourceHubTaskText(item))
  ].join("\n\n---\n\n");
  const filename = `majlisalpha-source-acquisition-tasks-${new Date().toISOString().slice(0, 10)}.md`;
  downloadTextFile(filename, content, "text/markdown;charset=utf-8");
  flashSourceHubResult(`Exported ${priorityTasks.length} priority source task${priorityTasks.length === 1 ? "" : "s"}.`, "success");
}

function flashSourceHubResult(message, tone = "neutral") {
  if (!els.sourceHubResult) return;
  els.sourceHubResult.className = `builder-result is-${tone}`;
  els.sourceHubResult.textContent = message;
}

function renderTemplates() {
  els.questionCount.textContent = String(QUESTION_TEMPLATES.length);
  els.templateStack.innerHTML = QUESTION_TEMPLATES.map((question) => {
    return `<button class="template-button" type="button" data-question="${escapeAttr(question)}">${escapeHtml(question)}</button>`;
  }).join("");

  els.templateStack.querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      const question = button.dataset.question;
      els.queryInput.value = question;
      runAnalysis(question);
    });
  });
}

function renderCoverage() {
  const companies = getCompanies();
  els.coverageList.innerHTML = companies.map((company) => {
    const checked = state.activeTickers.has(company.ticker) ? "checked" : "";
    const riskClass = company.risk > 65 ? "negative" : company.risk > 50 ? "mixed" : "positive";
    return `
      <label class="company-row">
        <input type="checkbox" data-ticker="${escapeAttr(company.ticker)}" ${checked} />
        <span class="company-main">
          <strong>${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</strong>
          <span>${escapeHtml(company.sector)} - ${escapeHtml(company.thesis)}</span>
        </span>
        <span class="company-score ${riskClass}">${Math.round(company.sentiment)} sig</span>
      </label>
    `;
  }).join("");

  els.coverageList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.activeTickers.add(input.dataset.ticker);
      } else {
        state.activeTickers.delete(input.dataset.ticker);
      }
      if (!state.activeTickers.size) {
        state.activeTickers.add(input.dataset.ticker);
        input.checked = true;
      }
      renderContextBand();
      renderCompanyDossier();
      drawSignalMap();
    });
  });
}

function renderLibrary() {
  const docs = state.documents;
  els.documentCount.textContent = `${docs.length} docs`;
  els.libraryList.innerHTML = docs.map((doc) => {
    const checked = state.enabledDocIds.has(doc.id) ? "checked" : "";
    return `
      <label class="source-toggle">
        <input type="checkbox" data-doc-id="${escapeAttr(doc.id)}" ${checked} />
        <span class="source-main">
          <strong>${escapeHtml(doc.ticker)} - ${escapeHtml(doc.period)}</strong>
          <span>${escapeHtml(doc.company)} - ${escapeHtml(doc.date)}</span>
        </span>
        <span class="source-kind ${sourceStatusClass(doc)}">${escapeHtml(shortDocType(doc.type))} - ${escapeHtml(shortSourceStatus(doc))}</span>
      </label>
    `;
  }).join("");

  els.libraryList.querySelectorAll("input").forEach((input) => {
    input.addEventListener("change", () => {
      if (input.checked) {
        state.enabledDocIds.add(input.dataset.docId);
      } else {
        state.enabledDocIds.delete(input.dataset.docId);
      }
      renderContextBand();
      renderCompanyDossier();
    });
  });
}

function renderImportSummary(report = state.importReport) {
  if (!els.importSummary) return;
  if (!report) {
    els.importSummary.innerHTML = `
      <strong>Import status</strong>
      <span>Paste or upload source text to build a private browser corpus for this session.</span>
    `;
    return;
  }

  const skippedText = report.skipped.length
    ? `<em>${report.skipped.length} skipped: ${escapeHtml(report.skipped.map((item) => `${item.name}${item.reason ? ` (${item.reason})` : ""}`).join(", "))}</em>`
    : "";
  els.importSummary.innerHTML = `
    <strong>${report.added.length} source${report.added.length === 1 ? "" : "s"} imported</strong>
    <span>${escapeHtml(report.sections)} sections, ${escapeHtml(report.metrics)} metrics, ${escapeHtml(report.tickers.join(", ") || "CUSTOM")} coverage updated as imported evidence.</span>
    ${skippedText}
  `;
}

function renderCompanyDossier() {
  if (!els.companyDossier) return;
  const company = getCompany(state.selectedTicker);
  if (!company) {
    els.companyDossier.innerHTML = `<div class="empty-list">Select a company to open its dossier.</div>`;
    return;
  }

  const docs = getCompanyDocs(company.ticker);
  const enabledDocs = docs.filter((doc) => state.enabledDocIds.has(doc.id));
  const latestDocs = [...docs]
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 4);
  const riskFactors = (RISK_FACTOR_LIBRARY[company.ticker] || makeGenericRiskBlueprint(company)).slice(0, 3);
  const sourceMix = sourceMixForDocs(enabledDocs);
  const sourceQuality = sourceStatusSummary(enabledDocs);
  const checklist = makeRealDataChecklist(docs);
  const completeness = makeRealSourceCompleteness(checklist);
  const questions = [
    `What changed in $${company.ticker} disclosures and management tone?`,
    `What are the three most material risks for $${company.ticker}?`,
    `Which valuation assumptions should I flex first for $${company.ticker}?`
  ];

  els.companyDossier.innerHTML = `
    <div class="dossier-head">
      <span>${escapeHtml(company.sector)}</span>
      <strong>${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</strong>
      <p>${escapeHtml(company.thesis)}</p>
    </div>
    <div class="dossier-kpis">
      <div><span>Revenue</span><strong>${escapeHtml(formatMoney(company.revenue))}</strong></div>
      <div><span>Op margin</span><strong>${escapeHtml(company.opMargin)}%</strong></div>
      <div><span>FCF margin</span><strong>${escapeHtml(company.fcfMargin)}%</strong></div>
      <div><span>Risk</span><strong>${escapeHtml(company.risk)}</strong></div>
    </div>
    <div class="dossier-block">
      <span>Source coverage</span>
      <strong>${enabledDocs.length}/${docs.length} docs enabled</strong>
      <p>${escapeHtml(sourceMix || "Enable or import documents to build a richer source mix.")}</p>
      <p>${escapeHtml(sourceQuality || "No source quality labels yet.")}</p>
    </div>
    <div class="real-source-score">
      <div>
        <span>Real source completeness</span>
        <strong>${escapeHtml(completeness.percent)}%</strong>
      </div>
      <p>${escapeHtml(completeness.summary)}</p>
      <button class="checklist-action" type="button" data-checklist-ticker="${escapeAttr(company.ticker)}" data-checklist-key="${escapeAttr(completeness.nextKey)}">Upgrade next source</button>
    </div>
    <div class="real-data-checklist">
      <span>Real data checklist</span>
      ${checklist.map((item) => `
        <div class="${escapeAttr(item.className)}">
          <strong>${escapeHtml(item.label)}</strong>
          <em>${escapeHtml(item.status)}</em>
          <button class="checklist-action" type="button" data-checklist-ticker="${escapeAttr(company.ticker)}" data-checklist-key="${escapeAttr(item.key)}">${item.statusKey === "real" ? "Review" : "Replace with REAL"}</button>
        </div>
      `).join("")}
    </div>
    <div class="dossier-timeline">
      ${latestDocs.length ? latestDocs.map((doc) => `
        <article>
          <span class="${sourceStatusClass(doc)}">${escapeHtml(shortDocType(doc.type))} - ${escapeHtml(shortSourceStatus(doc))}</span>
          <strong>${escapeHtml(doc.period)}</strong>
          <em>${escapeHtml(doc.date)}</em>
        </article>
      `).join("") : `<div class="empty-list">No company documents yet.</div>`}
    </div>
    <div class="dossier-risk-list">
      ${riskFactors.map((factor) => `
        <div>
          <span>${escapeHtml(factor.severity)}</span>
          <strong>${escapeHtml(factor.title)}</strong>
        </div>
      `).join("")}
    </div>
    <div class="dossier-actions">
      ${questions.map((question) => `<button class="dossier-question" type="button" data-question="${escapeAttr(question)}">${escapeHtml(question)}</button>`).join("")}
    </div>
  `;

  els.companyDossier.querySelectorAll(".dossier-question").forEach((button) => {
    button.addEventListener("click", () => {
      els.queryInput.value = button.dataset.question;
      runAnalysis(button.dataset.question);
    });
  });
  els.companyDossier.querySelectorAll(".checklist-action").forEach((button) => {
    button.addEventListener("click", () => {
      loadSourceTaskIntoBuilder(button.dataset.checklistTicker, button.dataset.checklistKey);
    });
  });
}

function renderContextBand() {
  const enabledDocs = getEnabledDocs();
  const activeCompanies = getCompanies().filter((company) => state.activeTickers.has(company.ticker));
  const averageMargin = activeCompanies.length
    ? activeCompanies.reduce((sum, company) => sum + company.opMargin, 0) / activeCompanies.length
    : 0;
  const averageRisk = activeCompanies.length
    ? activeCompanies.reduce((sum, company) => sum + company.risk, 0) / activeCompanies.length
    : 0;
  const citationCount = state.currentCitations.length;
  const focusTile = state.tickerFocus
    ? {
        label: "Ticker focus",
        value: state.tickerFocus.rawTicker,
        sub: state.tickerFocus.isAlias ? `${state.tickerFocus.ticker} demo proxy` : state.tickerFocus.company.name
      }
    : { label: "Active companies", value: activeCompanies.length, sub: activeCompanies.map((company) => company.ticker).join(", ") || "None" };

  const tiles = [
    focusTile,
    { label: "Enabled docs", value: enabledDocs.length, sub: sourceStatusSummary(enabledDocs) || `${state.uploadedDocs.length} uploaded` },
    { label: "Avg op margin", value: `${averageMargin.toFixed(1)}%`, sub: "Selected coverage" },
    { label: "Risk index", value: Math.round(averageRisk), sub: citationCount ? `${citationCount} current citations` : "Pre-query baseline" }
  ];

  els.contextBand.innerHTML = tiles.map((tile) => `
    <div class="metric-tile">
      <span>${escapeHtml(tile.label)}</span>
      <strong>${escapeHtml(String(tile.value))}</strong>
      <em>${escapeHtml(tile.sub)}</em>
    </div>
  `).join("");
}

function renderValuationOptions() {
  const companies = getCompanies();
  els.valuationTicker.innerHTML = companies.map((company) => {
    const selected = company.ticker === state.selectedTicker ? "selected" : "";
    return `<option value="${escapeAttr(company.ticker)}" ${selected}>${escapeHtml(company.ticker)} - ${escapeHtml(company.name)}</option>`;
  }).join("");
}

function scanFilingFromCurrentQuestion() {
  const current = els.queryInput.value.trim();
  const focus = syncTickerFocus(current) || state.tickerFocus || {
    rawTicker: state.selectedTicker,
    ticker: state.selectedTicker,
    company: getCompany(state.selectedTicker),
    isAlias: false,
    note: ""
  };
  const tickerToken = focus.rawTicker || focus.ticker;
  const filingPrompt = current
    ? `${current} Scan annual-report risk factors, MD&A, debt schedule, ownership disclosure, and earnings-call tone.`
    : `Scan annual-report risk factors, MD&A, debt schedule, ownership disclosure, and earnings-call tone for $${tickerToken}.`;
  els.queryInput.value = filingPrompt;
  runAnalysis(filingPrompt);
}

function makeMemoPrompt(kind) {
  const company = getCompany(state.selectedTicker);
  const ticker = company ? company.ticker : "FAB";
  const peerTickers = getCompanies()
    .filter((item) => item.ticker !== ticker && state.activeTickers.has(item.ticker))
    .slice(0, 3)
    .map((item) => `$${item.ticker}`)
    .join(", ");
  const prompts = {
    risk: `Write a risk memo for $${ticker}. Identify the three most material risks, cite annual-report or announcement evidence, and state what would invalidate the base case.`,
    tone: `Compare earnings-call tone and annual-report language for $${ticker}. Where does management sound more cautious or more confident than the written disclosure?`,
    valuation: `For $${ticker}, which valuation assumptions should I flex first: revenue growth, FCF margin, terminal multiple, discount rate, capex, leverage, or credit cost?`,
    peer: `Compare $${ticker}${peerTickers ? ` with ${peerTickers}` : ""} on growth quality, margin durability, cash conversion, leverage, and disclosure risk.`,
    committee: `Draft an investment committee brief for $${ticker}: bottom line, evidence stack, risk factors, valuation read-through, and what would change the answer.`
  };
  return prompts[kind] || prompts.risk;
}

function syncTickerFocus(question) {
  const focus = resolveTickerFocus(question);
  if (!focus) return null;
  const key = `${focus.rawTicker}->${focus.ticker}`;
  if (key === state.lastFocusKey) return focus;

  state.lastFocusKey = key;
  state.tickerFocus = focus;
  state.selectedTicker = focus.ticker;
  state.activeTickers.add(focus.ticker);
  renderCoverage();
  renderContextBand();
  renderValuationOptions();
  renderCompanyDossier();
  updateValuationFromCompany();
  updateValuation();
  drawSignalMap();
  return focus;
}

function resolveTickerFocus(question) {
  const text = String(question || "");
  const companies = getCompanies();
  const tickerMatch = text.match(/\$([A-Z][A-Z0-9.]{0,11})\b/i);
  const rawTicker = tickerMatch ? normalizeTicker(tickerMatch[1]) : "";
  if (rawTicker) {
    const direct = companies.find((company) => company.ticker.toUpperCase() === rawTicker);
    if (direct) {
      return { rawTicker, ticker: direct.ticker, company: direct, isAlias: false, note: "" };
    }
    const alias = PUBLIC_TICKER_ALIASES[rawTicker];
    if (alias) {
      const company = getCompany(alias.ticker);
      return { rawTicker, ticker: company.ticker, company, isAlias: true, note: alias.note };
    }
  }

  const lower = text.toLowerCase();
  const directMention = companies.find((company) => {
    return lower.includes(company.ticker.toLowerCase()) || lower.includes(company.name.toLowerCase());
  });
  if (!directMention) return null;
  return {
    rawTicker: directMention.ticker,
    ticker: directMention.ticker,
    company: directMention,
    isAlias: false,
    note: ""
  };
}

function addTickerContext(question, focus) {
  if (!focus) return question;
  const aliasText = focus.isAlias ? `${focus.rawTicker} maps to ${focus.ticker} as a static demo proxy. ${focus.note}.` : "";
  return `${question} ${focus.ticker} ${focus.company.name} ${aliasText}`;
}

function runAnalysis(question) {
  if (!question) {
    els.queryInput.focus();
    return;
  }

  const tickerFocus = syncTickerFocus(question);
  const retrievalQuestion = addTickerContext(question, tickerFocus);
  const explicitCompare = isExplicitCompareQuestion(question);
  const docs = getGuardedDocs(getEnabledDocs(), tickerFocus, explicitCompare);
  if (!docs.length) {
    renderNoDocs(question);
    return;
  }

  const chunks = buildChunks(docs);
  const ranked = rankChunks(retrievalQuestion, chunks, { tickerFocus, explicitCompare }).slice(0, 8);
  if (!ranked.length) {
    renderNoHits(question);
    return;
  }

  const citations = ranked.slice(0, 6).map((chunk, index) => ({
    ...chunk,
    citationId: `C${index + 1}`
  }));
  state.currentCitations = citations;

  const intent = detectIntent(retrievalQuestion);
  const guardMeta = makeEvidenceGuardMeta(question, citations, tickerFocus, explicitCompare);
  const answerModel = buildAnswerModel(question, citations, intent, tickerFocus, guardMeta);
  state.lastBrief = answerModel.plainText;
  state.lastAnswerMeta = answerModel.meta;
  renderAnswer(answerModel);
  renderEvidence(citations);
  renderContextBand();
  renderBriefWorkbench();
  renderInvestmentGate();
  renderMemoReviewRoom();
  renderLaunchControlRoom();
  renderSessionSnapshotBoard();
  renderPilotDemoScriptCenter();
  renderPilotLearningLoopCenter();
  renderFounderWeeklyReviewCenter();
  renderPilotOnboardingRoom();
  renderPilotSuccessPlanCenter();
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderInvestorIcMemoRoom();
  renderInvestorDecisionRoom();
  renderFundingRoundCommandCenter();
  renderBoardPackWarRoom();
  drawSignalMap(citations);
}

function renderNoDocs(question) {
  state.currentCitations = [];
  state.lastBrief = `No enabled documents for: ${question}`;
  state.lastAnswerMeta = null;
  els.answerPanel.innerHTML = `
    <div class="empty-state">
      <div class="empty-kicker">No corpus</div>
      <h2>No enabled documents match the selected coverage.</h2>
      <p>Enable at least one source document or select another company, then run the analysis again.</p>
    </div>
  `;
  renderEvidence([]);
  renderBriefWorkbench();
  renderInvestmentGate();
  renderMemoReviewRoom();
  renderLaunchControlRoom();
  renderContextBand();
  renderSessionSnapshotBoard();
  renderPilotDemoScriptCenter();
  renderPilotLearningLoopCenter();
  renderFounderWeeklyReviewCenter();
  renderPilotOnboardingRoom();
  renderPilotSuccessPlanCenter();
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderInvestorIcMemoRoom();
  renderInvestorDecisionRoom();
  renderFundingRoundCommandCenter();
  renderBoardPackWarRoom();
}

function renderNoHits(question) {
  state.currentCitations = [];
  state.lastBrief = `No high-confidence passages for: ${question}`;
  state.lastAnswerMeta = null;
  els.answerPanel.innerHTML = `
    <div class="empty-state">
      <div class="empty-kicker">Low recall</div>
      <h2>No strong source passages were retrieved.</h2>
      <p>Try a narrower question, enable more documents, or import an annual report, earnings call, exchange disclosure, or ownership section with the relevant disclosure.</p>
    </div>
  `;
  renderEvidence([]);
  renderBriefWorkbench();
  renderInvestmentGate();
  renderMemoReviewRoom();
  renderLaunchControlRoom();
  renderContextBand();
  renderSessionSnapshotBoard();
  renderPilotDemoScriptCenter();
  renderPilotLearningLoopCenter();
  renderFounderWeeklyReviewCenter();
  renderPilotOnboardingRoom();
  renderPilotSuccessPlanCenter();
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderInvestorIcMemoRoom();
  renderInvestorDecisionRoom();
  renderFundingRoundCommandCenter();
  renderBoardPackWarRoom();
}

function buildAnswerModel(question, citations, intent, tickerFocus = null, guardMeta = null) {
  const compareMode = guardMeta ? guardMeta.compareMode : isExplicitCompareQuestion(question);
  const grouped = groupCitationsByTicker(citations);
  const rankedCompanies = rankCompaniesForQuestion(question, grouped, intent);
  const primaryCompany = tickerFocus && tickerFocus.company
    ? tickerFocus.company
    : rankedCompanies[0] || getCompany(state.selectedTicker);
  const readiness = makeStarterPackCompany(primaryCompany ? primaryCompany.ticker : state.selectedTicker);
  const confidence = computeConfidence(citations, rankedCompanies);
  const quality = guardMeta || makeEvidenceGuardMeta(question, citations, tickerFocus, compareMode);
  const headline = makeHeadline(question, compareMode, rankedCompanies, intent);
  const thesis = makeThesis(compareMode, rankedCompanies, citations, intent);
  const toneMeter = makeToneMeter(rankedCompanies, citations);
  const focusNotice = makeTickerFocusNotice(tickerFocus);
  const guardNotice = makeEvidenceGuardNotice(quality);
  const readinessNotice = makeInvestmentReadinessNotice(readiness);
  const evidenceBullets = citations.slice(0, state.answerDepth === "brief" ? 3 : 5).map((citation, index) => {
    return `<li>${makeEvidenceSentence(citation, intent)} ${citationLink(index)}</li>`;
  }).join("");
  const riskFactorSection = intent.id === "risk" ? makeRiskFactorSection(citations, rankedCompanies) : "";
  const watchItems = makeWatchItems(citations, rankedCompanies, intent);
  const valuationRead = makeValuationRead(rankedCompanies[0], intent);
  const debate = makeDebate(citations, rankedCompanies);
  const table = makeCompanyTable(rankedCompanies);

  const sections = [
    `
      <section class="answer-section">
        <h3>Bottom line</h3>
        <p>${thesis}</p>
      </section>
    `
  ];

  if (intent.id === "risk") {
    sections.push(riskFactorSection);
  } else {
    sections.push(`
      <section class="answer-section">
        <h3>Evidence</h3>
        <ul>${evidenceBullets}</ul>
      </section>
    `);
  }

  if (state.answerDepth !== "brief") {
    sections.push(`
      <section class="answer-section">
        <h3>Source-weighted ranking</h3>
        ${table}
      </section>
    `);
    sections.push(`
      <section class="answer-section">
        <h3>What the committee would debate</h3>
        <p>${debate}</p>
      </section>
    `);
  }

  sections.push(`
    <section class="answer-section">
      <h3>Valuation read-through</h3>
      <p>${valuationRead}</p>
    </section>
  `);

  if (state.answerDepth === "committee") {
    sections.push(`
      <section class="answer-section">
        <h3>What would change the answer</h3>
        <p>${watchItems}</p>
      </section>
    `);
  }

  const html = `
    <div class="answer-header">
      <div>
        <div class="answer-kicker">${escapeHtml(intent.label)}</div>
        <h2>${headline}</h2>
      </div>
      <div class="confidence-box">
        <span>Confidence</span>
        <strong>${confidence}%</strong>
      </div>
      <div class="confidence-box evidence-quality-box ${escapeAttr(quality.qualityClass)}">
        <span>Evidence quality</span>
        <strong>${quality.score}%</strong>
      </div>
    </div>
    <div class="answer-body">
      ${readinessNotice}
      ${guardNotice}
      ${focusNotice}
      ${toneMeter.html}
      ${sections.join("")}
    </div>
  `;

  const plainParts = [
    `${intent.label} | ${confidence}% confidence`,
    readiness ? `Investment readiness: ${readiness.label} (${readiness.realCount}/${readiness.checklist.length} REAL source types)` : "",
    `Evidence quality: ${quality.score}% (${quality.label})`,
    `Management tone: ${toneMeter.label} (${toneMeter.percent}/100)`,
    tickerFocus ? `Ticker focus: ${tickerFocus.rawTicker}${tickerFocus.isAlias ? ` maps to ${tickerFocus.ticker} (${tickerFocus.note})` : ""}` : "",
    stripHtml(headline),
    stripHtml(thesis),
    intent.id === "risk" ? "3 cited risk factors:" : "Evidence:"
  ].filter(Boolean);

  if (intent.id === "risk") {
    plainParts.push(makeRiskFactorPlainText(citations, rankedCompanies));
    plainParts.push("Evidence stack:");
  }

  plainParts.push(
    ...citations.slice(0, 5).map((citation, index) => `${index + 1}. ${citation.company} ${citation.type} ${citation.section}: ${snippet(citation.text, 240)}`),
    `Valuation read-through: ${stripHtml(valuationRead)}`
  );

  const plainText = plainParts.join("\n\n");
  const meta = {
    question,
    ticker: primaryCompany ? primaryCompany.ticker : "Desk",
    company: primaryCompany ? primaryCompany.name : "Research desk",
    intentLabel: intent.label,
    confidence,
    evidenceQuality: quality.score,
    qualityLabel: quality.label,
    qualityClass: quality.qualityClass,
    guarded: state.onlySelectedTicker && !quality.compareMode,
    compareMode: quality.compareMode,
    mismatchCount: quality.mismatches.length,
    syntheticCount: quality.syntheticCount,
    investmentReady: readiness ? readiness.investmentReady : false,
    investmentReadinessLabel: readiness ? readiness.label : "Unknown readiness",
    realSourceCount: readiness ? readiness.realCount : 0,
    requiredSourceCount: readiness ? readiness.checklist.length : REAL_SOURCE_REQUIREMENTS.length,
    nextRealSource: readiness && readiness.next ? readiness.next.label : "Annual report",
    citationCount: citations.length,
    citations: citations.map((citation) => ({
      citationId: citation.citationId,
      ticker: citation.ticker,
      company: citation.company,
      type: citation.type,
      section: citation.section,
      sourceStatus: normalizeSourceStatus(citation.sourceStatus)
    }))
  };

  return { html, plainText, citations, confidence, headline: stripHtml(headline), meta };
}

function makeToneMeter(rankedCompanies, citations) {
  const score = rankedCompanies[0]
    ? rankedCompanies[0].tone
    : citations.reduce((sum, citation) => sum + toneScore(citation.text), 0) / Math.max(citations.length, 1);
  const percent = Math.max(5, Math.min(95, Math.round(50 + score * 12)));
  const label = percent >= 62 ? "Bullish" : percent <= 38 ? "Bearish" : "Balanced";
  const cls = percent >= 62 ? "positive" : percent <= 38 ? "negative" : "mixed";
  const evidenceCount = citations.filter((citation) => /call|earnings call|management|q&a|prepared/i.test(`${citation.type} ${citation.section}`)).length;
  const sourceText = evidenceCount
    ? `${evidenceCount} management-commentary source${evidenceCount === 1 ? "" : "s"} pulled into the read.`
    : "Tone inferred from the retrieved annual-report, announcement, and model language.";

  return {
    label,
    percent,
    html: `
      <section class="tone-meter-card ${cls}" aria-label="Management tone meter">
        <div class="tone-meter-top">
          <span>Management tone</span>
          <strong>${escapeHtml(label)} ${percent}/100</strong>
        </div>
        <div class="tone-track" aria-hidden="true">
          <i style="left: ${percent}%"></i>
        </div>
        <div class="tone-scale">
          <span>Bearish</span>
          <span>Balanced</span>
          <span>Bullish</span>
        </div>
        <p>${escapeHtml(sourceText)}</p>
      </section>
    `
  };
}

function makeTickerFocusNotice(focus) {
  if (!focus) return "";
  const aliasText = focus.isAlias
    ? ` Static demo maps $${focus.rawTicker} to ${focus.ticker} (${focus.note}) until live market data is connected.`
    : "";
  return `
    <section class="ticker-focus-card">
      <span>Ticker focus</span>
      <strong>${escapeHtml(focus.company.ticker)} - ${escapeHtml(focus.company.name)}</strong>
      <p>${escapeHtml(focus.company.thesis || "Research context updated from the question input.")}${escapeHtml(aliasText)}</p>
    </section>
  `;
}

function makeInvestmentReadinessNotice(readiness) {
  if (!readiness) return "";
  const isReady = readiness.investmentReady;
  const nextText = readiness.next && !isReady
    ? ` Next replacement: ${readiness.next.label}.`
    : "";
  const message = isReady
    ? "All required source types are REAL. The report can be reviewed as investment-use ready, subject to human judgement."
    : `Prototype evidence only. ${readiness.realCount}/${readiness.checklist.length} required source types are REAL, so this report should not be used as investment-grade research yet.${nextText}`;
  return `
    <section class="investment-readiness-card ${escapeAttr(readiness.className)}">
      <div>
        <span>Investment-use readiness</span>
        <strong>${escapeHtml(readiness.label)} - ${escapeHtml(readiness.completeness.percent)}% real-source coverage</strong>
      </div>
      <p>${escapeHtml(message)}</p>
    </section>
  `;
}

function makeEvidenceGuardNotice(meta) {
  if (!meta) return "";
  const syntheticText = meta.syntheticCount
    ? `${meta.syntheticCount} SYN citation${meta.syntheticCount === 1 ? "" : "s"} are demo-only and should be replaced before investment use.`
    : "No SYN citations in the current answer.";
  const mismatchText = meta.mismatches.length
    ? `${meta.mismatches.length} off-ticker citation${meta.mismatches.length === 1 ? "" : "s"} detected: ${meta.mismatches.map((citation) => citation.citationId).join(", ")}.`
    : meta.compareMode
      ? "Comparative citations are allowed for this question."
      : "No off-ticker citations in the current answer.";
  return `
    <section class="evidence-guard-card ${escapeAttr(meta.qualityClass)}">
      <div>
        <span>Evidence guard</span>
        <strong>${escapeHtml(meta.label)} - ${meta.score}% quality</strong>
      </div>
      <p>${escapeHtml(meta.message)} ${escapeHtml(mismatchText)} ${escapeHtml(syntheticText)}</p>
    </section>
  `;
}

function renderAnswer(answerModel) {
  els.answerPanel.innerHTML = answerModel.html;
  els.answerPanel.querySelectorAll(".citation-link").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        document.querySelectorAll(".evidence-card").forEach((card) => card.classList.remove("is-active"));
        target.classList.add("is-active");
      }
    });
  });
}

function renderEvidence(citations) {
  els.evidenceCount.textContent = String(citations.length);
  if (!citations.length) {
    els.evidenceList.innerHTML = `<div class="empty-list">Retrieved passages will appear here with source metadata and relevance scores.</div>`;
    return;
  }
  els.evidenceList.innerHTML = citations.map((citation) => `
    <article class="evidence-card ${normalizeSourceStatus(citation.sourceStatus) === "synthetic" ? "is-synthetic-evidence" : ""}" id="evidence-${escapeAttr(citation.citationId)}">
      <div class="evidence-meta">
        <span>${escapeHtml(citation.citationId)} - ${escapeHtml(citation.ticker)}</span>
        <span><i class="source-badge ${sourceStatusClass(citation)}">${escapeHtml(shortSourceStatus(citation))}</i>${citation.score.toFixed(1)}</span>
      </div>
      <strong>${escapeHtml(citation.type)} - ${escapeHtml(citation.period)} - ${escapeHtml(citation.section)}</strong>
      <p>${escapeHtml(snippet(citation.text, 280))}</p>
      ${normalizeSourceStatus(citation.sourceStatus) === "synthetic" ? `<em class="synthetic-warning">Demo-only SYN citation. Replace with REAL source before investment use.</em>` : ""}
    </article>
  `).join("");
}

function renderInvestmentGate(options = {}) {
  if (!els.investmentGateSummary || !els.investmentGateChecks) return;
  const audit = makeInvestmentGateAudit();
  if (els.investmentGateStatus) els.investmentGateStatus.textContent = audit.statusLabel;
  if (els.openInvestmentGateGap) els.openInvestmentGateGap.disabled = !audit.nextGap;
  if (els.copyInvestmentGateNote) els.copyInvestmentGateNote.disabled = !audit.hasBrief;

  els.investmentGateSummary.innerHTML = `
    <div class="investment-gate-hero ${escapeAttr(audit.statusClass)}">
      <div>
        <span>${escapeHtml(audit.exportLabel)}</span>
        <strong>${escapeHtml(audit.statusLabel)}</strong>
        <p>${escapeHtml(audit.summary)}</p>
      </div>
      <div class="investment-gate-score">
        <span>Gate score</span>
        <strong>${escapeHtml(audit.score)}%</strong>
      </div>
    </div>
    <div class="investment-gate-metrics">
      <article><span>Focus</span><strong>${escapeHtml(audit.meta.ticker)}</strong><em>${escapeHtml(audit.meta.company)}</em></article>
      <article><span>Confidence</span><strong>${escapeHtml(audit.meta.confidence)}%</strong><em>${escapeHtml(audit.confidenceLabel)}</em></article>
      <article><span>Evidence</span><strong>${escapeHtml(audit.meta.evidenceQuality)}%</strong><em>${escapeHtml(audit.evidenceLabel)}</em></article>
      <article><span>REAL coverage</span><strong>${escapeHtml(audit.meta.realSourceCount)}/${escapeHtml(audit.meta.requiredSourceCount)}</strong><em>${escapeHtml(audit.coverageLabel)}</em></article>
    </div>
  `;

  els.investmentGateChecks.innerHTML = audit.checks.map((check) => `
    <article class="investment-gate-check ${escapeAttr(check.severity)}">
      <span>${check.passed ? "Pass" : check.required ? "Blocker" : "Review"}</span>
      <strong>${escapeHtml(check.label)}</strong>
      <p>${escapeHtml(check.detail)}</p>
    </article>
  `).join("");

  if (options.focus && els.investmentGateSummary) {
    els.investmentGateSummary.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

function makeInvestmentGateAudit() {
  const packet = makeBriefPacket();
  const meta = packet.meta || {};
  const latestReview = getLatestMemoReviewForTicker(meta.ticker);
  const syntheticCount = packet.citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "synthetic").length;
  const importedCount = packet.citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "imported").length;
  const realCitationCount = packet.citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
  const sourceTypes = new Set(packet.citations.map((citation) => citation.type));
  const confidence = Number(meta.confidence || 0);
  const evidenceQuality = Number(meta.evidenceQuality || 0);
  const realSourceCount = Number(meta.realSourceCount || 0);
  const requiredSourceCount = Number(meta.requiredSourceCount || REAL_SOURCE_REQUIREMENTS.length);
  const sourceCoveragePercent = requiredSourceCount ? Math.round((realSourceCount / requiredSourceCount) * 100) : 0;

  const checks = [
    {
      label: "Active research answer",
      passed: packet.hasBrief,
      required: true,
      weight: 12,
      detail: packet.hasBrief ? "A current answer is loaded and can be reviewed." : "Run a desk question before this gate can certify anything."
    },
    {
      label: "Evidence depth",
      passed: packet.citations.length >= 3,
      required: true,
      weight: 12,
      detail: `${packet.citations.length} citation${packet.citations.length === 1 ? "" : "s"} retrieved. Target at least 3.`
    },
    {
      label: "Source spread",
      passed: sourceTypes.size >= 2,
      required: false,
      weight: 10,
      detail: `${sourceTypes.size} source type${sourceTypes.size === 1 ? "" : "s"} represented. Prefer annual report plus earnings call/results/disclosure.`
    },
    {
      label: "Evidence quality",
      passed: evidenceQuality >= 80,
      required: true,
      weight: 16,
      detail: evidenceQuality ? `${evidenceQuality}% evidence quality. Investment review target is 80% or better.` : "Evidence quality appears after analysis."
    },
    {
      label: "Confidence discipline",
      passed: confidence >= 75,
      required: false,
      weight: 10,
      detail: confidence ? `${confidence}% model confidence. Treat lower confidence as analyst-review only.` : "Confidence appears after analysis."
    },
    {
      label: "No off-ticker drift",
      passed: Number(meta.mismatchCount || 0) === 0,
      required: true,
      weight: 12,
      detail: meta.mismatchCount ? `${meta.mismatchCount} off-ticker citation issue${meta.mismatchCount === 1 ? "" : "s"} detected.` : "Single-company guard found no off-ticker citation drift."
    },
    {
      label: "REAL citation mix",
      passed: realCitationCount > 0 && syntheticCount === 0,
      required: true,
      weight: 16,
      detail: syntheticCount
        ? `${syntheticCount} SYN citation${syntheticCount === 1 ? "" : "s"} must be replaced before investor use.`
        : `${realCitationCount} REAL and ${importedCount} imported citation${packet.citations.length === 1 ? "" : "s"} in the answer.`
    },
    {
      label: "Company source coverage",
      passed: realSourceCount >= requiredSourceCount,
      required: true,
      weight: 16,
      detail: `${realSourceCount}/${requiredSourceCount} required source types are REAL (${sourceCoveragePercent}%).`
    },
    {
      label: "Human memo review",
      passed: Boolean(latestReview && ["pilot-ready", "committee-ready"].includes(latestReview.decision)),
      required: false,
      weight: 6,
      detail: latestReview
        ? `${getMemoReviewDecisionLabel(latestReview.decision)} saved by ${latestReview.owner}.`
        : "Save a review-room decision before treating the memo as committee-ready."
    }
  ].map((check) => ({
    ...check,
    severity: check.passed ? "is-pass" : check.required ? "is-blocker" : "is-review"
  }));

  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0) || 1;
  const score = Math.round((checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0) / maxScore) * 100);
  const requiredBlockers = checks.filter((check) => check.required && !check.passed);
  const nextGap = packet.nextGap || (packet.gaps || [])[0] || null;
  const hasBrief = packet.hasBrief;
  const statusLabel = !hasBrief
    ? "Run a question first"
    : requiredBlockers.length
      ? "Research review only"
      : score >= 88
        ? "Committee-ready candidate"
        : "Pilot review candidate";
  const statusClass = !hasBrief || requiredBlockers.length ? "is-blocked" : score >= 88 ? "is-ready" : "is-review";
  const exportLabel = !hasBrief
    ? "No export posture"
    : requiredBlockers.length
      ? "PDF/MD marked review-only"
      : score >= 88
        ? "Export posture: committee draft"
        : "Export posture: pilot draft";
  const summary = !hasBrief
    ? "The gate will score the current answer once a desk question has run."
    : requiredBlockers.length
      ? `Do not treat this as investment-use research yet. First blocker: ${requiredBlockers[0].label}.`
      : score >= 88
        ? "The answer has passed the required source, guard, and quality checks. Human judgement is still required."
        : "Required blockers are clear, but at least one review item remains before committee circulation.";

  return {
    hasBrief,
    packet,
    checks,
    requiredBlockers,
    nextGap,
    score,
    statusLabel,
    statusClass,
    exportLabel,
    summary,
    confidenceLabel: confidence >= 75 ? "meets review target" : "review carefully",
    evidenceLabel: evidenceQuality >= 80 ? "strong enough for review" : "needs evidence work",
    coverageLabel: realSourceCount >= requiredSourceCount ? "complete" : "incomplete",
    meta: {
      ticker: meta.ticker || state.selectedTicker || "Desk",
      company: meta.company || getCompany(meta.ticker)?.name || "Research desk",
      confidence,
      evidenceQuality,
      realSourceCount,
      requiredSourceCount,
      question: meta.question || "",
      syntheticCount,
      realCitationCount
    }
  };
}

function getLatestMemoReviewForTicker(ticker) {
  const normalized = normalizeTicker(ticker || "");
  return (state.memoReviews || []).find((review) => normalizeTicker(review.ticker) === normalized) || null;
}

function openInvestmentGateGap() {
  const audit = makeInvestmentGateAudit();
  if (!audit.nextGap) {
    flashInvestmentGateResult("No evidence gap is open for this memo.", "success");
    return;
  }
  loadSourceTaskIntoBuilder(audit.meta.ticker, audit.nextGap.key);
  flashInvestmentGateResult(`${audit.meta.ticker} ${audit.nextGap.label} opened in Source Studio.`, "success");
}

async function copyInvestmentGateNote() {
  const audit = makeInvestmentGateAudit();
  if (!audit.hasBrief) {
    flashInvestmentGateResult("Run a desk question before copying a readiness note.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makeInvestmentGateMarkdown(audit));
  flashInvestmentGateResult(copied ? "Readiness note copied." : "Clipboard blocked. Use the MD export as fallback.", copied ? "success" : "error");
}

function makeInvestmentGateMarkdown(audit) {
  const checks = audit.checks.map((check) => `- ${check.passed ? "PASS" : check.required ? "BLOCKER" : "REVIEW"} | ${check.label}: ${check.detail}`).join("\n");
  return [
    "# MajlisAlpha Investment Readiness Gate",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Focus: ${audit.meta.ticker} - ${audit.meta.company}`,
    `Gate status: ${audit.statusLabel}`,
    `Gate score: ${audit.score}%`,
    `Export posture: ${audit.exportLabel}`,
    "",
    "## Summary",
    "",
    audit.summary,
    "",
    "## Checks",
    "",
    checks,
    "",
    "_This gate is a product control, not investment advice. Human source review remains required._"
  ].join("\n");
}

function flashInvestmentGateResult(message, tone = "neutral") {
  if (!els.investmentGateResult) return;
  els.investmentGateResult.className = `builder-result is-${tone}`;
  els.investmentGateResult.textContent = message;
}

function renderBriefWorkbench() {
  if (!els.briefWorkbenchSummary || !els.briefReadinessGrid || !els.briefSourceMap) return;
  const packet = makeBriefPacket();
  if (els.briefWorkbenchStatus) {
    els.briefWorkbenchStatus.textContent = packet.statusLabel;
  }
  if (els.copyBriefPacket) els.copyBriefPacket.disabled = !packet.hasBrief;
  if (els.exportBriefPacketJson) els.exportBriefPacketJson.disabled = !packet.hasBrief;
  if (els.openBriefNextGap) els.openBriefNextGap.disabled = !packet.nextGap;

  if (!packet.hasBrief) {
    els.briefWorkbenchSummary.innerHTML = `
      <div class="brief-workbench-empty">
        <strong>Run a desk question to assemble a memo packet.</strong>
        <p>The workbench will convert the current answer into a committee-ready checklist with evidence quality, source gaps, and export actions.</p>
      </div>
    `;
  } else {
    els.briefWorkbenchSummary.innerHTML = `
      <div class="brief-workbench-hero ${escapeAttr(packet.statusClass)}">
        <div>
          <span>${escapeHtml(packet.statusLabel)}</span>
          <strong>${escapeHtml(packet.meta.ticker)} - ${escapeHtml(packet.meta.intentLabel || "Research memo")}</strong>
          <p>${escapeHtml(packet.headline)}</p>
        </div>
        <div class="brief-score">
          <span>Memo score</span>
          <strong>${escapeHtml(packet.score)}%</strong>
        </div>
      </div>
    `;
  }

  els.briefReadinessGrid.innerHTML = packet.checks.map((check) => `
    <article class="brief-check-card ${check.passed ? "is-pass" : "is-open"}">
      <span>${check.passed ? "Ready" : "Open"}</span>
      <strong>${escapeHtml(check.label)}</strong>
      <p>${escapeHtml(check.detail)}</p>
    </article>
  `).join("");

  const sourceRows = packet.citations.length
    ? packet.citations.slice(0, 6).map((citation) => `
        <div class="brief-source-row">
          <span>${escapeHtml(citation.citationId || "C")}</span>
          <strong>${escapeHtml(citation.ticker)} ${escapeHtml(citation.type)}</strong>
          <em>${escapeHtml(shortSourceStatus(citation))} | ${escapeHtml(citation.section || "Evidence")}</em>
        </div>
      `).join("")
    : `<div class="empty-list">No evidence stack yet. Run analysis first.</div>`;

  const gapRows = packet.gaps.length
    ? packet.gaps.slice(0, 4).map((gap) => `
        <div class="brief-gap-row ${escapeAttr(gap.className)}">
          <strong>${escapeHtml(gap.label)}</strong>
          <span>${escapeHtml(gap.status)}</span>
        </div>
      `).join("")
    : `<div class="brief-gap-row is-real"><strong>Required source gaps</strong><span>All REAL</span></div>`;

  els.briefSourceMap.innerHTML = `
    <div class="brief-source-column">
      <div class="brief-source-heading">
        <span>Evidence used</span>
        <strong>${escapeHtml(packet.citations.length)} citations</strong>
      </div>
      ${sourceRows}
    </div>
    <div class="brief-source-column">
      <div class="brief-source-heading">
        <span>Open source gaps</span>
        <strong>${escapeHtml(packet.gaps.length)} remaining</strong>
      </div>
      ${gapRows}
    </div>
  `;
}

function makeBriefPacket() {
  const hasBrief = Boolean(state.lastBrief && (state.lastAnswerMeta || state.currentCitations.length));
  const fallbackTicker = state.selectedTicker || getDefaultWatchlistTickers()[0] || "DESK";
  const inferred = hasBrief ? (state.lastAnswerMeta || inferBriefMetaFromText(state.lastBrief)) : {};
  const ticker = normalizeTicker(inferred.ticker || fallbackTicker);
  const company = getCompany(ticker);
  const readiness = makeStarterPackCompany(company ? company.ticker : fallbackTicker);
  const citations = state.currentCitations || [];
  const sourceTypes = new Set(citations.map((citation) => citation.type));
  const syntheticCount = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "synthetic").length;
  const realCount = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
  const gaps = readiness ? readiness.checklist.filter((item) => item.statusKey !== "real") : [];
  const nextGap = readiness && readiness.next && readiness.next.statusKey !== "real" ? readiness.next : null;
  const evidenceQuality = Number(inferred.evidenceQuality || 0);
  const mismatchCount = Number(inferred.mismatchCount || 0);
  const checks = [
    {
      label: "Question and answer",
      passed: hasBrief,
      weight: 15,
      detail: hasBrief ? "A current research answer is loaded in the desk." : "Run a question before creating a memo packet."
    },
    {
      label: "Evidence stack",
      passed: citations.length >= 3,
      weight: 20,
      detail: `${citations.length} cited passage${citations.length === 1 ? "" : "s"} retrieved. Target at least 3.`
    },
    {
      label: "Source spread",
      passed: sourceTypes.size >= 2,
      weight: 15,
      detail: `${sourceTypes.size} source type${sourceTypes.size === 1 ? "" : "s"} represented in the answer.`
    },
    {
      label: "Evidence guard",
      passed: evidenceQuality >= 75 && mismatchCount === 0,
      weight: 20,
      detail: evidenceQuality ? `${evidenceQuality}% evidence quality with ${mismatchCount} off-ticker issue${mismatchCount === 1 ? "" : "s"}.` : "Evidence quality appears after analysis."
    },
    {
      label: "REAL citation mix",
      passed: realCount > 0 && syntheticCount === 0,
      weight: 15,
      detail: syntheticCount ? `${syntheticCount} SYN citation${syntheticCount === 1 ? "" : "s"} still need replacement.` : `${realCount} REAL citation${realCount === 1 ? "" : "s"} in the answer.`
    },
    {
      label: "Company source coverage",
      passed: Boolean(readiness && readiness.investmentReady),
      weight: 15,
      detail: readiness ? `${readiness.realCount}/${readiness.checklist.length} required source types are REAL.` : "Select a covered company to assess source readiness."
    }
  ];
  const maxScore = checks.reduce((sum, check) => sum + check.weight, 0) || 1;
  const score = Math.round((checks.reduce((sum, check) => sum + (check.passed ? check.weight : 0), 0) / maxScore) * 100);
  const statusLabel = !hasBrief
    ? "No brief yet"
    : score >= 85 && syntheticCount === 0
      ? "Committee review ready"
      : score >= 65
        ? "Pilot memo ready"
        : "Evidence work needed";
  const statusClass = score >= 85 && syntheticCount === 0 ? "is-ready" : score >= 65 ? "is-review" : "is-blocked";
  const meta = {
    ticker: company ? company.ticker : ticker,
    company: company ? company.name : inferred.company || ticker,
    intentLabel: inferred.intentLabel || "Research",
    confidence: Number(inferred.confidence || 0),
    evidenceQuality,
    investmentReadinessLabel: readiness ? readiness.label : "Unknown readiness",
    realSourceCount: readiness ? readiness.realCount : 0,
    requiredSourceCount: readiness ? readiness.checklist.length : REAL_SOURCE_REQUIREMENTS.length,
    question: inferred.question || els.queryInput?.value || ""
  };
  return {
    hasBrief,
    meta,
    readiness,
    citations,
    gaps,
    nextGap,
    checks,
    score,
    statusLabel,
    statusClass,
    headline: hasBrief ? makeBriefPacketHeadline(state.lastBrief, meta) : "No current answer loaded."
  };
}

function makeBriefPacketHeadline(body, meta) {
  const candidate = String(body || "")
    .split(/\n/)
    .map((line) => line.trim())
    .find((line) => line && !/^(Evidence quality|Management tone|Ticker focus|Investment readiness):/i.test(line));
  return candidate || `${meta.ticker} research memo`;
}

async function copyBriefPacket() {
  const packet = makeBriefPacket();
  if (!packet.hasBrief) {
    flashBriefWorkbenchResult("Run a desk question before copying a memo packet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makeBriefPacketMarkdown(packet));
  flashBriefWorkbenchResult(copied ? "Memo packet copied." : "Clipboard blocked. Use MD export from the top bar as a fallback.", copied ? "success" : "error");
}

function exportBriefPacketJson() {
  const packet = makeBriefPacket();
  if (!packet.hasBrief) {
    flashBriefWorkbenchResult("Run a desk question before exporting a packet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const filename = `majlisalpha-${String(packet.meta.ticker || "desk").toLowerCase()}-memo-packet-${date}.json`;
  downloadTextFile(filename, JSON.stringify(makeBriefPacketJson(packet), null, 2), "application/json;charset=utf-8");
  flashBriefWorkbenchResult("Memo packet JSON exported.", "success");
}

function openBriefNextGap() {
  const packet = makeBriefPacket();
  if (!packet.nextGap) {
    flashBriefWorkbenchResult("No source gap is open for this company.", "success");
    return;
  }
  loadSourceTaskIntoBuilder(packet.meta.ticker, packet.nextGap.key);
  flashBriefWorkbenchResult(`${packet.meta.ticker} ${packet.nextGap.label} opened in Source Studio.`, "success");
}

function makeBriefPacketMarkdown(packet) {
  const citationText = packet.citations.length
    ? packet.citations.map((citation) => `- ${citation.citationId || "C"} | ${citation.ticker} | ${citation.type} | ${citation.section}: ${snippet(citation.text, 280)}`).join("\n")
    : "- No citations captured.";
  const checksText = packet.checks.map((check) => `- ${check.passed ? "READY" : "OPEN"} | ${check.label}: ${check.detail}`).join("\n");
  const gapsText = packet.gaps.length
    ? packet.gaps.map((gap) => `- ${gap.label}: ${gap.status}`).join("\n")
    : "- No required source gaps.";
  return [
    "# MajlisAlpha Memo Packet",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Focus: ${packet.meta.ticker} - ${packet.meta.company}`,
    `Status: ${packet.statusLabel} (${packet.score}%)`,
    `Confidence: ${packet.meta.confidence}%`,
    `Evidence quality: ${packet.meta.evidenceQuality}%`,
    `Real-source coverage: ${packet.meta.realSourceCount}/${packet.meta.requiredSourceCount}`,
    "",
    "## Question",
    "",
    packet.meta.question || "No question captured.",
    "",
    "## Brief",
    "",
    state.lastBrief || "No brief available.",
    "",
    "## Memo Readiness",
    "",
    checksText,
    "",
    "## Evidence Used",
    "",
    citationText,
    "",
    "## Open Source Gaps",
    "",
    gapsText,
    "",
    "_MajlisAlpha is research software, not investment advice. Verify real sources before relying on any memo._"
  ].join("\n");
}

function makeBriefPacketJson(packet) {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    status: packet.statusLabel,
    score: packet.score,
    meta: packet.meta,
    checks: packet.checks.map(({ label, passed, detail }) => ({ label, passed, detail })),
    openGaps: packet.gaps.map((gap) => ({
      key: gap.key,
      label: gap.label,
      status: gap.status
    })),
    citations: packet.citations.map((citation) => ({
      citationId: citation.citationId,
      ticker: citation.ticker,
      company: citation.company,
      type: citation.type,
      period: citation.period,
      section: citation.section,
      sourceStatus: normalizeSourceStatus(citation.sourceStatus),
      sourceUrl: citation.sourceUrl || "",
      text: snippet(citation.text, 600)
    })),
    brief: state.lastBrief
  };
}

function flashBriefWorkbenchResult(message, tone = "neutral") {
  if (!els.briefWorkbenchResult) return;
  els.briefWorkbenchResult.className = `builder-result is-${tone}`;
  els.briefWorkbenchResult.textContent = message;
}

function renderMemoReviewRoom() {
  if (!els.memoReviewContext || !els.memoReviewList) return;
  const packet = makeBriefPacket();
  if (els.saveMemoReview) els.saveMemoReview.disabled = !packet.hasBrief;
  if (els.exportMemoReviews) els.exportMemoReviews.disabled = !state.memoReviews.length;
  if (els.copyMemoReviews) els.copyMemoReviews.disabled = !state.memoReviews.length;
  if (els.clearMemoReviews) els.clearMemoReviews.disabled = !state.memoReviews.length;
  if (els.memoReviewCount) {
    els.memoReviewCount.textContent = `${state.memoReviews.length} review${state.memoReviews.length === 1 ? "" : "s"}`;
  }

  els.memoReviewContext.innerHTML = packet.hasBrief
    ? `
      <div class="memo-review-context-card ${escapeAttr(packet.statusClass)}">
        <div>
          <span>Current memo</span>
          <strong>${escapeHtml(packet.meta.ticker)} - ${escapeHtml(packet.statusLabel)}</strong>
          <p>${escapeHtml(packet.headline)}</p>
        </div>
        <div>
          <span>Score</span>
          <strong>${escapeHtml(packet.score)}%</strong>
          <p>${escapeHtml(packet.meta.realSourceCount)}/${escapeHtml(packet.meta.requiredSourceCount)} REAL source types</p>
        </div>
      </div>
    `
    : `
      <div class="memo-review-context-card is-blocked">
        <div>
          <span>No active memo</span>
          <strong>Run a question before saving a review.</strong>
          <p>The review room records human judgement after the desk creates a memo packet.</p>
        </div>
      </div>
    `;

  if (!state.memoReviews.length) {
    els.memoReviewList.innerHTML = `<div class="empty-list">Saved review decisions will appear here with decision, conviction, owner, and open risks.</div>`;
    return;
  }

  els.memoReviewList.innerHTML = state.memoReviews.map((review) => `
    <article class="memo-review-card ${escapeAttr(review.decision)}">
      <div class="memo-review-card-head">
        <div>
          <span>${escapeHtml(review.ticker)} - ${escapeHtml(review.company)}</span>
          <strong>${escapeHtml(getMemoReviewDecisionLabel(review.decision))}</strong>
        </div>
        <em>${escapeHtml(review.createdLabel)}</em>
      </div>
      <div class="memo-review-card-grid">
        <div><span>Memo score</span><strong>${escapeHtml(review.score)}%</strong></div>
        <div><span>Conviction</span><strong>${escapeHtml(review.conviction)}</strong></div>
        <div><span>Owner</span><strong>${escapeHtml(review.owner)}</strong></div>
      </div>
      <p>${escapeHtml(review.note || "No review note added.")}</p>
      <p class="memo-review-risk">${escapeHtml(review.openRisk || "No open risk recorded.")}</p>
      <div class="note-actions">
        <button type="button" data-review-delete="${escapeAttr(review.id)}">Delete</button>
      </div>
    </article>
  `).join("");

  els.memoReviewList.querySelectorAll("button[data-review-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteMemoReview(button.dataset.reviewDelete));
  });
}

function saveMemoReview() {
  const packet = makeBriefPacket();
  if (!packet.hasBrief) {
    flashMemoReviewResult("Run a desk question before saving a memo review.", "error");
    return;
  }
  const review = normalizeMemoReview({
    id: `review-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    decision: els.memoReviewDecision?.value || "needs-source-work",
    conviction: els.memoReviewConviction?.value || "Medium",
    owner: (els.memoReviewOwner?.value || "Research desk").trim().slice(0, 60),
    note: (els.memoReviewNote?.value || "").trim().slice(0, 1200),
    openRisk: (els.memoReviewRisk?.value || "").trim().slice(0, 900),
    ticker: packet.meta.ticker,
    company: packet.meta.company,
    status: packet.statusLabel,
    score: packet.score,
    confidence: packet.meta.confidence,
    evidenceQuality: packet.meta.evidenceQuality,
    realSourceCount: packet.meta.realSourceCount,
    requiredSourceCount: packet.meta.requiredSourceCount,
    question: packet.meta.question,
    headline: packet.headline,
    checks: packet.checks.map(({ label, passed, detail }) => ({ label, passed, detail })),
    openGaps: packet.gaps.map((gap) => ({ key: gap.key, label: gap.label, status: gap.status })),
    citations: packet.citations.map((citation) => ({
      citationId: citation.citationId,
      ticker: citation.ticker,
      type: citation.type,
      period: citation.period,
      section: citation.section,
      sourceStatus: normalizeSourceStatus(citation.sourceStatus)
    }))
  });
  state.memoReviews = [review, ...state.memoReviews].slice(0, 30);
  saveJson(STORAGE_KEYS.memoReviews, state.memoReviews);
  if (els.memoReviewNote) els.memoReviewNote.value = "";
  if (els.memoReviewRisk) els.memoReviewRisk.value = "";
  renderMemoReviewRoom();
  renderInvestmentGate();
  renderLaunchControlRoom();
  renderPagesDeploymentDoctor();
  flashMemoReviewResult(`${getMemoReviewDecisionLabel(review.decision)} saved for ${review.ticker}.`, "success");
}

function normalizeMemoReview(review) {
  const decision = ["needs-source-work", "pilot-ready", "committee-ready", "watchlist-only", "reject-thesis"].includes(review.decision)
    ? review.decision
    : "needs-source-work";
  return {
    id: String(review.id || `review-${Date.now()}`),
    createdAt: review.createdAt || new Date().toISOString(),
    createdLabel: review.createdLabel || (review.createdAt ? new Date(review.createdAt).toLocaleString() : new Date().toLocaleString()),
    decision,
    conviction: ["Low", "Medium", "High"].includes(review.conviction) ? review.conviction : "Medium",
    owner: String(review.owner || "Research desk").slice(0, 60),
    note: String(review.note || "").slice(0, 1200),
    openRisk: String(review.openRisk || "").slice(0, 900),
    ticker: normalizeTicker(review.ticker || "DESK"),
    company: String(review.company || review.ticker || "Research desk").slice(0, 120),
    status: String(review.status || "Review saved").slice(0, 80),
    score: Number(review.score || 0),
    confidence: Number(review.confidence || 0),
    evidenceQuality: Number(review.evidenceQuality || 0),
    realSourceCount: Number(review.realSourceCount || 0),
    requiredSourceCount: Number(review.requiredSourceCount || REAL_SOURCE_REQUIREMENTS.length),
    question: String(review.question || "").slice(0, 500),
    headline: String(review.headline || "").slice(0, 500),
    checks: Array.isArray(review.checks) ? review.checks : [],
    openGaps: Array.isArray(review.openGaps) ? review.openGaps : [],
    citations: Array.isArray(review.citations) ? review.citations : []
  };
}

function getMemoReviewDecisionLabel(decision) {
  const labels = {
    "needs-source-work": "Needs source work",
    "pilot-ready": "Pilot memo ready",
    "committee-ready": "Committee review ready",
    "watchlist-only": "Watchlist only",
    "reject-thesis": "Reject thesis"
  };
  return labels[decision] || labels["needs-source-work"];
}

function exportMemoReviewLog() {
  if (!state.memoReviews.length) {
    flashMemoReviewResult("No review log to export yet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  const filename = `majlisalpha-memo-review-log-${date}.json`;
  downloadTextFile(filename, JSON.stringify(makeMemoReviewLogJson(), null, 2), "application/json;charset=utf-8");
  flashMemoReviewResult("Review log JSON exported.", "success");
}

async function copyMemoReviewLog() {
  if (!state.memoReviews.length) {
    flashMemoReviewResult("No review log to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makeMemoReviewLogMarkdown());
  flashMemoReviewResult(copied ? "Review log copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function clearMemoReviews() {
  state.memoReviews = [];
  saveJson(STORAGE_KEYS.memoReviews, state.memoReviews);
  renderMemoReviewRoom();
  renderInvestmentGate();
  renderLaunchControlRoom();
  renderPagesDeploymentDoctor();
  flashMemoReviewResult("Review log cleared.", "neutral");
}

function deleteMemoReview(reviewId) {
  state.memoReviews = state.memoReviews.filter((review) => review.id !== reviewId);
  saveJson(STORAGE_KEYS.memoReviews, state.memoReviews);
  renderMemoReviewRoom();
  renderInvestmentGate();
  renderLaunchControlRoom();
  renderPagesDeploymentDoctor();
}

function makeMemoReviewLogJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    reviewCount: state.memoReviews.length,
    reviews: state.memoReviews
  };
}

function makeMemoReviewLogMarkdown() {
  const reviews = state.memoReviews.map((review, index) => {
    const gaps = review.openGaps.length
      ? review.openGaps.map((gap) => `${gap.label}: ${gap.status}`).join("; ")
      : "No open source gaps recorded.";
    return [
      `## ${index + 1}. ${review.ticker} - ${getMemoReviewDecisionLabel(review.decision)}`,
      "",
      `Created: ${review.createdLabel}`,
      `Company: ${review.company}`,
      `Status: ${review.status} (${review.score}%)`,
      `Confidence: ${review.confidence}% | Evidence quality: ${review.evidenceQuality}%`,
      `Conviction: ${review.conviction} | Owner: ${review.owner}`,
      "",
      `Question: ${review.question || "No question captured."}`,
      `Headline: ${review.headline || "No headline captured."}`,
      "",
      `Review note: ${review.note || "No note."}`,
      `Open risk: ${review.openRisk || "No open risk."}`,
      `Source gaps: ${gaps}`
    ].join("\n");
  }).join("\n\n");
  return [
    "# MajlisAlpha Memo Review Log",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Reviews: ${state.memoReviews.length}`,
    "",
    reviews,
    "",
    "_Review decisions are human workflow notes. They are not investment advice._"
  ].join("\n");
}

function flashMemoReviewResult(message, tone = "neutral") {
  if (!els.memoReviewResult) return;
  els.memoReviewResult.className = `builder-result is-${tone}`;
  els.memoReviewResult.textContent = message;
}

function renderDecisionJournal() {
  if (!els.decisionJournalContext || !els.decisionJournalList) return;
  const packet = makeBriefPacket();
  if (els.decisionJournalCount) {
    els.decisionJournalCount.textContent = `${state.decisionJournal.length} decision${state.decisionJournal.length === 1 ? "" : "s"}`;
  }
  if (els.decisionJournalDate && !els.decisionJournalDate.value) {
    els.decisionJournalDate.value = new Date().toISOString().slice(0, 10);
  }
  if (els.exportDecisionJournal) els.exportDecisionJournal.disabled = !state.decisionJournal.length;
  if (els.copyDecisionJournal) els.copyDecisionJournal.disabled = !state.decisionJournal.length;
  if (els.clearDecisionJournal) els.clearDecisionJournal.disabled = !state.decisionJournal.length;

  els.decisionJournalContext.innerHTML = packet.hasBrief
    ? `
      <div class="decision-journal-context-card is-ready">
        <span>Current memo context</span>
        <strong>${escapeHtml(packet.meta.ticker)} - ${escapeHtml(packet.statusLabel)} (${escapeHtml(packet.score)}%)</strong>
        <p>${escapeHtml(packet.headline || packet.meta.question || "Decision context is ready.")}</p>
      </div>
    `
    : `
      <div class="decision-journal-context-card is-blocked">
        <span>No active memo</span>
        <strong>Save a desk decision after running a question.</strong>
        <p>The journal can still capture manual source-work decisions, but a live memo gives it ticker, score, evidence, and citation context.</p>
      </div>
    `;

  els.decisionJournalList.innerHTML = state.decisionJournal.length
    ? state.decisionJournal.map((entry) => `
      <article class="decision-journal-card ${escapeAttr(entry.decision)}">
        <div class="decision-journal-card-head">
          <div>
            <span>${escapeHtml(entry.createdLabel)}</span>
            <strong>${escapeHtml(entry.ticker)} - ${escapeHtml(getDecisionJournalLabel(entry.decision))}</strong>
          </div>
          <button class="text-button danger" type="button" data-decision-delete="${escapeAttr(entry.id)}">Delete</button>
        </div>
        <div class="decision-journal-card-grid">
          <div><span>Strength</span><strong>${escapeHtml(entry.strength)}</strong></div>
          <div><span>Horizon</span><strong>${escapeHtml(entry.horizon)}</strong></div>
          <div><span>Next review</span><strong>${escapeHtml(entry.nextReviewDate || "Not set")}</strong></div>
          <div><span>Owner</span><strong>${escapeHtml(entry.owner)}</strong></div>
        </div>
        <p>${escapeHtml(entry.note || entry.headline || "No decision note recorded.")}</p>
        <p class="decision-journal-risk"><strong>Trigger:</strong> ${escapeHtml(entry.trigger || "No trigger recorded.")}</p>
        <p class="decision-journal-risk"><strong>Evidence task:</strong> ${escapeHtml(entry.evidenceTask || "No next evidence task recorded.")}</p>
      </article>
    `).join("")
    : `<div class="empty-list">Decision journal entries will appear here after you run a memo, record a decision, and assign the next evidence task.</div>`;

  els.decisionJournalList.querySelectorAll("button[data-decision-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteDecisionJournalEntry(button.dataset.decisionDelete));
  });
}

function saveDecisionJournalEntry() {
  const packet = makeBriefPacket();
  const fallbackCompany = getCompany(state.selectedTicker);
  const entry = normalizeDecisionEntry({
    id: `decision-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    decision: els.decisionJournalDecision?.value || "needs-source-work",
    strength: els.decisionJournalStrength?.value || "Medium",
    horizon: els.decisionJournalHorizon?.value || "Quarterly review",
    nextReviewDate: els.decisionJournalDate?.value || "",
    owner: (els.decisionJournalOwner?.value || "Research desk").trim(),
    note: (els.decisionJournalNote?.value || "").trim(),
    trigger: (els.decisionJournalTrigger?.value || "").trim(),
    evidenceTask: (els.decisionJournalEvidenceTask?.value || "").trim(),
    ticker: packet.hasBrief ? packet.meta.ticker : fallbackCompany?.ticker || state.selectedTicker || "DESK",
    company: packet.hasBrief ? packet.meta.company : fallbackCompany?.name || "Research desk",
    status: packet.hasBrief ? packet.statusLabel : "Manual decision",
    score: packet.hasBrief ? packet.score : 0,
    question: packet.hasBrief ? packet.meta.question : els.queryInput?.value || "",
    headline: packet.hasBrief ? packet.headline : "",
    citations: packet.hasBrief ? packet.citations.map((citation) => ({
      citationId: citation.citationId,
      ticker: citation.ticker,
      type: citation.type,
      sourceStatus: normalizeSourceStatus(citation.sourceStatus)
    })) : []
  });
  state.decisionJournal = [entry, ...state.decisionJournal].slice(0, 60);
  saveJson(STORAGE_KEYS.decisionJournal, state.decisionJournal);
  if (els.decisionJournalNote) els.decisionJournalNote.value = "";
  if (els.decisionJournalTrigger) els.decisionJournalTrigger.value = "";
  if (els.decisionJournalEvidenceTask) els.decisionJournalEvidenceTask.value = "";
  renderDecisionJournal();
  renderPagesDeploymentDoctor();
  flashDecisionJournalResult(`${getDecisionJournalLabel(entry.decision)} saved for ${entry.ticker}.`, "success");
}

function normalizeDecisionEntry(entry) {
  const allowedDecisions = ["needs-source-work", "watchlist-candidate", "committee-candidate", "monitor-only", "reject-thesis"];
  const decision = allowedDecisions.includes(entry.decision) ? entry.decision : "needs-source-work";
  const strength = ["Low", "Medium", "High"].includes(entry.strength) ? entry.strength : "Medium";
  const horizon = ["Next disclosure", "Quarterly review", "30 days", "Event-driven", "Archive"].includes(entry.horizon)
    ? entry.horizon
    : "Quarterly review";
  return {
    id: String(entry.id || `decision-${Date.now()}`),
    createdAt: entry.createdAt || new Date().toISOString(),
    createdLabel: entry.createdLabel || (entry.createdAt ? new Date(entry.createdAt).toLocaleString() : new Date().toLocaleString()),
    decision,
    strength,
    horizon,
    nextReviewDate: String(entry.nextReviewDate || "").slice(0, 20),
    owner: String(entry.owner || "Research desk").slice(0, 60),
    note: String(entry.note || "").slice(0, 1400),
    trigger: String(entry.trigger || "").slice(0, 900),
    evidenceTask: String(entry.evidenceTask || "").slice(0, 900),
    ticker: normalizeTicker(entry.ticker || "DESK"),
    company: String(entry.company || entry.ticker || "Research desk").slice(0, 120),
    status: String(entry.status || "Decision saved").slice(0, 80),
    score: Number(entry.score || 0),
    question: String(entry.question || "").slice(0, 500),
    headline: String(entry.headline || "").slice(0, 500),
    citations: Array.isArray(entry.citations) ? entry.citations : []
  };
}

function getDecisionJournalLabel(decision) {
  const labels = {
    "needs-source-work": "Needs source work",
    "watchlist-candidate": "Watchlist candidate",
    "committee-candidate": "Committee candidate",
    "monitor-only": "Monitor only",
    "reject-thesis": "Reject thesis"
  };
  return labels[decision] || labels["needs-source-work"];
}

function exportDecisionJournalLog() {
  if (!state.decisionJournal.length) {
    flashDecisionJournalResult("No decision journal to export yet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`majlisalpha-decision-journal-${date}.json`, JSON.stringify(makeDecisionJournalJson(), null, 2), "application/json;charset=utf-8");
  flashDecisionJournalResult("Decision journal JSON exported.", "success");
}

async function copyDecisionJournalLog() {
  if (!state.decisionJournal.length) {
    flashDecisionJournalResult("No decision journal to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makeDecisionJournalMarkdown());
  flashDecisionJournalResult(copied ? "Decision journal copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function clearDecisionJournal() {
  state.decisionJournal = [];
  saveJson(STORAGE_KEYS.decisionJournal, state.decisionJournal);
  renderDecisionJournal();
  renderPagesDeploymentDoctor();
  flashDecisionJournalResult("Decision journal cleared.", "neutral");
}

function deleteDecisionJournalEntry(entryId) {
  state.decisionJournal = state.decisionJournal.filter((entry) => entry.id !== entryId);
  saveJson(STORAGE_KEYS.decisionJournal, state.decisionJournal);
  renderDecisionJournal();
  renderPagesDeploymentDoctor();
}

function makeDecisionJournalJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    decisionCount: state.decisionJournal.length,
    decisions: state.decisionJournal
  };
}

function makeDecisionJournalMarkdown() {
  const decisions = state.decisionJournal.map((entry, index) => [
    `## ${index + 1}. ${entry.ticker} - ${getDecisionJournalLabel(entry.decision)}`,
    "",
    `Created: ${entry.createdLabel}`,
    `Company: ${entry.company}`,
    `Status: ${entry.status} (${entry.score}%)`,
    `Strength: ${entry.strength} | Horizon: ${entry.horizon} | Next review: ${entry.nextReviewDate || "Not set"}`,
    `Owner: ${entry.owner}`,
    "",
    `Question: ${entry.question || "No question captured."}`,
    `Headline: ${entry.headline || "No headline captured."}`,
    "",
    `Decision note: ${entry.note || "No note."}`,
    `Trigger or kill criteria: ${entry.trigger || "No trigger recorded."}`,
    `Next evidence task: ${entry.evidenceTask || "No evidence task recorded."}`
  ].join("\n")).join("\n\n");
  return [
    "# MajlisAlpha Decision Journal",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Decisions: ${state.decisionJournal.length}`,
    "",
    decisions,
    "",
    "_Decision journal entries are workflow notes. They are not investment advice._"
  ].join("\n");
}

function flashDecisionJournalResult(message, tone = "neutral") {
  if (!els.decisionJournalResult) return;
  els.decisionJournalResult.className = `builder-result is-${tone}`;
  els.decisionJournalResult.textContent = message;
}

function renderPilotSessionCommandCenter() {
  if (!els.pilotSessionSummary || !els.pilotSessionList) return;
  const report = makePilotSessionReport();
  if (els.pilotSessionCount) {
    els.pilotSessionCount.textContent = `${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"}`;
  }
  if (els.exportPilotSessions) els.exportPilotSessions.disabled = !state.pilotSessions.length;
  if (els.copyPilotSessions) els.copyPilotSessions.disabled = !state.pilotSessions.length;
  if (els.clearPilotSessions) els.clearPilotSessions.disabled = !state.pilotSessions.length;

  els.pilotSessionSummary.innerHTML = report.stats.map((stat) => `
    <article class="pilot-session-stat ${escapeAttr(stat.className)}">
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
      <em>${escapeHtml(stat.detail)}</em>
    </article>
  `).join("");

  els.pilotSessionList.innerHTML = state.pilotSessions.length
    ? state.pilotSessions.map((session) => `
      <article class="pilot-session-card is-${escapeAttr(session.outcome)}">
        <div class="pilot-session-card-head">
          <div>
            <span>${escapeHtml(session.createdLabel)}</span>
            <strong>${escapeHtml(session.user)} - ${escapeHtml(getPilotOutcomeLabel(session.outcome))}</strong>
          </div>
          <button class="text-button danger" type="button" data-pilot-delete="${escapeAttr(session.id)}">Delete</button>
        </div>
        <div class="pilot-session-card-grid">
          <div><span>Segment</span><strong>${escapeHtml(session.segment)}</strong></div>
          <div><span>Paid intent</span><strong>${escapeHtml(getPaidIntentLabel(session.paidIntent))}</strong></div>
          <div><span>Sources</span><strong>${escapeHtml(getPilotSourceLabel(session.sourceStatus))}</strong></div>
          <div><span>Tickers</span><strong>${escapeHtml(session.tickers || "Not set")}</strong></div>
        </div>
        <p><strong>Question:</strong> ${escapeHtml(session.question || "No question captured.")}</p>
        <p class="pilot-session-note"><strong>Blocker:</strong> ${escapeHtml(session.objection || "No blocker recorded.")}</p>
        <p class="pilot-session-note"><strong>Next step:</strong> ${escapeHtml(session.nextStep || "No next step recorded.")}</p>
      </article>
    `).join("")
    : `<div class="empty-list">Pilot sessions will appear here after a demo user brings a real UAE market question, source need, objection, or paid-intent signal.</div>`;

  els.pilotSessionList.querySelectorAll("button[data-pilot-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePilotSession(button.dataset.pilotDelete));
  });
}

function savePilotSession() {
  const session = normalizePilotSession({
    id: `pilot-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    user: (els.pilotSessionUser?.value || "").trim(),
    segment: els.pilotSessionSegment?.value || "Investor",
    outcome: els.pilotSessionOutcome?.value || "activated",
    paidIntent: els.pilotSessionPaidIntent?.value || "unknown",
    question: (els.pilotSessionQuestion?.value || "").trim(),
    tickers: (els.pilotSessionTickers?.value || "").trim(),
    sourceStatus: els.pilotSessionSourceStatus?.value || "starter",
    objection: (els.pilotSessionObjection?.value || "").trim(),
    nextStep: (els.pilotSessionNextStep?.value || "").trim()
  });
  if (!session.user && !session.question) {
    if (els.pilotSessionQuestion) els.pilotSessionQuestion.focus();
    flashPilotSessionResult("Add at least a user/account or a real UAE question.", "error");
    return;
  }
  state.pilotSessions = [session, ...state.pilotSessions].slice(0, 100);
  saveJson(STORAGE_KEYS.pilotSessions, state.pilotSessions);
  if (els.pilotSessionUser) els.pilotSessionUser.value = "";
  if (els.pilotSessionQuestion) els.pilotSessionQuestion.value = "";
  if (els.pilotSessionTickers) els.pilotSessionTickers.value = "";
  if (els.pilotSessionObjection) els.pilotSessionObjection.value = "";
  if (els.pilotSessionNextStep) els.pilotSessionNextStep.value = "";
  renderPilotSessionCommandCenter();
  renderPagesDeploymentDoctor();
  flashPilotSessionResult(`Pilot session saved for ${session.user || session.tickers || "new user"}.`, "success");
}

function normalizePilotSession(session) {
  const allowedOutcomes = ["activated", "second-question", "source-blocked", "trust-blocked", "not-fit"];
  const allowedPaidIntent = ["unknown", "none", "aed-199", "aed-399", "team"];
  const allowedSourceStatus = ["starter", "imported", "real", "missing"];
  return {
    id: String(session.id || `pilot-${Date.now()}`),
    createdAt: session.createdAt || new Date().toISOString(),
    createdLabel: session.createdLabel || (session.createdAt ? new Date(session.createdAt).toLocaleString() : new Date().toLocaleString()),
    user: String(session.user || "Pilot user").slice(0, 90),
    segment: String(session.segment || "Investor").slice(0, 40),
    outcome: allowedOutcomes.includes(session.outcome) ? session.outcome : "activated",
    paidIntent: allowedPaidIntent.includes(session.paidIntent) ? session.paidIntent : "unknown",
    question: String(session.question || "").slice(0, 600),
    tickers: String(session.tickers || "").slice(0, 120),
    sourceStatus: allowedSourceStatus.includes(session.sourceStatus) ? session.sourceStatus : "starter",
    objection: String(session.objection || "").slice(0, 600),
    nextStep: String(session.nextStep || "").slice(0, 240)
  };
}

function prefillPilotSessionFromDesk() {
  if (els.pilotSessionQuestion && els.queryInput) {
    els.pilotSessionQuestion.value = els.queryInput.value.trim() || state.lastAnswerMeta?.question || "";
  }
  if (els.pilotSessionTickers) {
    const focusTicker = state.tickerFocus?.ticker || state.selectedTicker || "";
    const citedTickers = Array.from(new Set((state.currentCitations || []).map((citation) => citation.ticker))).filter(Boolean);
    els.pilotSessionTickers.value = citedTickers.length ? citedTickers.join(", ") : focusTicker;
  }
  if (els.pilotSessionSourceStatus) {
    const realCount = (state.currentCitations || []).filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
    const importedCount = (state.currentCitations || []).filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "imported").length;
    els.pilotSessionSourceStatus.value = realCount ? "real" : importedCount ? "imported" : "starter";
  }
  if (els.pilotSessionNextStep && !els.pilotSessionNextStep.value.trim()) {
    els.pilotSessionNextStep.value = state.lastBrief ? "Send brief, ask for second real question, and test paid intent." : "Run a desk question, then capture source and trust feedback.";
  }
  flashPilotSessionResult("Current desk context loaded into the pilot session form.", "neutral");
}

function makePilotSessionReport() {
  const total = state.pilotSessions.length;
  const activated = state.pilotSessions.filter((session) => ["activated", "second-question"].includes(session.outcome)).length;
  const secondQuestions = state.pilotSessions.filter((session) => session.outcome === "second-question").length;
  const paidIntent = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const sourceBlocked = state.pilotSessions.filter((session) => ["source-blocked", "missing"].includes(session.outcome) || session.sourceStatus === "missing").length;
  const realSourceSessions = state.pilotSessions.filter((session) => session.sourceStatus === "real").length;
  const activationRate = total ? Math.round((activated / total) * 100) : 0;
  return {
    total,
    stats: [
      { label: "Pilot users", value: String(total), detail: "Logged user tests in this browser.", className: total >= 10 ? "is-good" : total >= 3 ? "is-warning" : "is-error" },
      { label: "Activation", value: `${activationRate}%`, detail: `${activated} users activated or asked a second question.`, className: activationRate >= 70 ? "is-good" : activationRate >= 40 ? "is-warning" : "is-error" },
      { label: "Second questions", value: String(secondQuestions), detail: "Repeat behavior is the strongest usage signal.", className: secondQuestions >= 5 ? "is-good" : secondQuestions >= 2 ? "is-warning" : "is-error" },
      { label: "Paid intent", value: String(paidIntent), detail: "AED pilot, desk, team, or invoice conversation captured.", className: paidIntent >= 3 ? "is-good" : paidIntent >= 1 ? "is-warning" : "is-error" },
      { label: "Source blockers", value: String(sourceBlocked), detail: `${realSourceSessions} sessions had REAL source support.`, className: sourceBlocked ? "is-warning" : total ? "is-good" : "is-error" }
    ]
  };
}

function getPilotOutcomeLabel(outcome) {
  const labels = {
    activated: "Activated",
    "second-question": "Asked second question",
    "source-blocked": "Source blocked",
    "trust-blocked": "Trust blocked",
    "not-fit": "Not fit"
  };
  return labels[outcome] || labels.activated;
}

function getPaidIntentLabel(intent) {
  const labels = {
    unknown: "Unknown",
    none: "None",
    "aed-199": "AED 199 pilot",
    "aed-399": "AED 399 desk",
    team: "Team / invoice"
  };
  return labels[intent] || labels.unknown;
}

function getPilotSourceLabel(status) {
  const labels = {
    starter: "Starter",
    imported: "Imported",
    real: "REAL",
    missing: "Missing"
  };
  return labels[status] || labels.starter;
}

function exportPilotSessions() {
  if (!state.pilotSessions.length) {
    flashPilotSessionResult("No pilot sessions to export yet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`majlisalpha-pilot-sessions-${date}.json`, JSON.stringify(makePilotSessionsJson(), null, 2), "application/json;charset=utf-8");
  flashPilotSessionResult("Pilot sessions JSON exported.", "success");
}

async function copyPilotSessions() {
  if (!state.pilotSessions.length) {
    flashPilotSessionResult("No pilot sessions to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makePilotSessionsMarkdown());
  flashPilotSessionResult(copied ? "Pilot report copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function clearPilotSessions() {
  state.pilotSessions = [];
  saveJson(STORAGE_KEYS.pilotSessions, state.pilotSessions);
  renderPilotSessionCommandCenter();
  renderPagesDeploymentDoctor();
  flashPilotSessionResult("Pilot sessions cleared.", "neutral");
}

function deletePilotSession(sessionId) {
  state.pilotSessions = state.pilotSessions.filter((session) => session.id !== sessionId);
  saveJson(STORAGE_KEYS.pilotSessions, state.pilotSessions);
  renderPilotSessionCommandCenter();
  renderPagesDeploymentDoctor();
}

function makePilotSessionsJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    report: makePilotSessionReport(),
    sessions: state.pilotSessions
  };
}

function makePilotSessionsMarkdown() {
  const report = makePilotSessionReport();
  const sessions = state.pilotSessions.map((session, index) => [
    `## ${index + 1}. ${session.user} - ${getPilotOutcomeLabel(session.outcome)}`,
    "",
    `Created: ${session.createdLabel}`,
    `Segment: ${session.segment}`,
    `Paid intent: ${getPaidIntentLabel(session.paidIntent)}`,
    `Source status: ${getPilotSourceLabel(session.sourceStatus)}`,
    `Tickers: ${session.tickers || "Not provided"}`,
    "",
    `Question: ${session.question || "No question captured."}`,
    `Objection: ${session.objection || "No objection recorded."}`,
    `Next step: ${session.nextStep || "No next step recorded."}`
  ].join("\n")).join("\n\n");
  return [
    "# MajlisAlpha Pilot Session Report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Version: ${DATA_VERSION}`,
    "",
    "## Summary",
    ...report.stats.map((stat) => `- ${stat.label}: ${stat.value} - ${stat.detail}`),
    "",
    sessions,
    "",
    "_Pilot sessions are product-learning notes. They are not investment advice._"
  ].join("\n");
}

function flashPilotSessionResult(message, tone = "neutral") {
  if (!els.pilotSessionResult) return;
  els.pilotSessionResult.className = `builder-result is-${tone}`;
  els.pilotSessionResult.textContent = message;
}

function renderPilotFollowupBoard() {
  if (!els.pilotFollowupSummary || !els.pilotFollowupList) return;
  const report = makePilotFollowupReport();
  if (els.pilotFollowupCount) {
    els.pilotFollowupCount.textContent = `${state.pilotFollowups.length} follow-up${state.pilotFollowups.length === 1 ? "" : "s"}`;
  }
  if (els.exportPilotFollowups) els.exportPilotFollowups.disabled = !state.pilotFollowups.length;
  if (els.copyPilotFollowups) els.copyPilotFollowups.disabled = !state.pilotFollowups.length;
  if (els.clearPilotFollowups) els.clearPilotFollowups.disabled = !state.pilotFollowups.length;

  els.pilotFollowupSummary.innerHTML = report.stats.map((stat) => `
    <article class="pilot-followup-stat ${escapeAttr(stat.className)}">
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
      <em>${escapeHtml(stat.detail)}</em>
    </article>
  `).join("");

  els.pilotFollowupList.innerHTML = state.pilotFollowups.length
    ? state.pilotFollowups.map((item) => {
      const dueClass = getFollowupDueClass(item.nextDate);
      return `
      <article class="pilot-followup-card ${escapeAttr(dueClass)} ${escapeAttr(getFollowupPriorityClass(item.priority))}">
        <div class="pilot-followup-card-head">
          <div>
            <span>${escapeHtml(item.createdLabel)}</span>
            <strong>${escapeHtml(item.account)} - ${escapeHtml(getFollowupStageLabel(item.stage))}</strong>
          </div>
          <button class="text-button danger" type="button" data-pilot-followup-delete="${escapeAttr(item.id)}">Delete</button>
        </div>
        <div class="pilot-followup-card-grid">
          <div><span>Due</span><strong>${escapeHtml(getFollowupDueLabel(item.nextDate))}</strong></div>
          <div><span>Priority</span><strong>${escapeHtml(item.priority)}</strong></div>
          <div><span>Offer</span><strong>${escapeHtml(getFollowupOfferLabel(item.offer))}</strong></div>
          <div><span>Stage</span><strong>${escapeHtml(getFollowupStageLabel(item.stage))}</strong></div>
        </div>
        <p><strong>Next action:</strong> ${escapeHtml(item.nextAction || "No next action captured.")}</p>
        <p class="pilot-followup-note"><strong>Blocker:</strong> ${escapeHtml(item.blocker || "No blocker recorded.")}</p>
        <p class="pilot-followup-note"><strong>Session note:</strong> ${escapeHtml(item.sessionNote || "No session note attached.")}</p>
      </article>`;
    }).join("")
    : `<div class="empty-list">Follow-ups will appear here after a pilot call creates a next action, blocker, or conversion step.</div>`;

  els.pilotFollowupList.querySelectorAll("button[data-pilot-followup-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePilotFollowup(button.dataset.pilotFollowupDelete));
  });
}

function savePilotFollowup() {
  const followup = normalizePilotFollowup({
    id: `followup-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    account: (els.pilotFollowupAccount?.value || "").trim(),
    stage: els.pilotFollowupStage?.value || "new-lead",
    priority: els.pilotFollowupPriority?.value || "Medium",
    nextDate: els.pilotFollowupNextDate?.value || "",
    offer: els.pilotFollowupOffer?.value || "need-discovery",
    blocker: (els.pilotFollowupBlocker?.value || "").trim(),
    nextAction: (els.pilotFollowupNextAction?.value || "").trim(),
    sessionNote: (els.pilotFollowupSessionNote?.value || "").trim()
  });
  if (!followup.account && !followup.nextAction) {
    if (els.pilotFollowupNextAction) els.pilotFollowupNextAction.focus();
    flashPilotFollowupResult("Add an account/user or a concrete next action.", "error");
    return;
  }
  state.pilotFollowups = [followup, ...state.pilotFollowups].slice(0, 150);
  saveJson(STORAGE_KEYS.pilotFollowups, state.pilotFollowups);
  if (els.pilotFollowupAccount) els.pilotFollowupAccount.value = "";
  if (els.pilotFollowupBlocker) els.pilotFollowupBlocker.value = "";
  if (els.pilotFollowupNextAction) els.pilotFollowupNextAction.value = "";
  if (els.pilotFollowupSessionNote) els.pilotFollowupSessionNote.value = "";
  renderPilotFollowupBoard();
  renderPagesDeploymentDoctor();
  flashPilotFollowupResult(`Follow-up saved for ${followup.account || "pilot account"}.`, "success");
}

function normalizePilotFollowup(item) {
  const allowedStages = ["new-lead", "demo-done", "source-needed", "proposal-sent", "paid-pilot", "closed-lost"];
  const allowedPriorities = ["High", "Medium", "Low"];
  const allowedOffers = ["need-discovery", "aed-199", "aed-399", "team-invoice"];
  return {
    id: String(item.id || `followup-${Date.now()}`),
    createdAt: item.createdAt || new Date().toISOString(),
    createdLabel: item.createdLabel || (item.createdAt ? new Date(item.createdAt).toLocaleString() : new Date().toLocaleString()),
    account: String(item.account || "Pilot account").slice(0, 90),
    stage: allowedStages.includes(item.stage) ? item.stage : "new-lead",
    priority: allowedPriorities.includes(item.priority) ? item.priority : "Medium",
    nextDate: /^\d{4}-\d{2}-\d{2}$/.test(item.nextDate || "") ? item.nextDate : "",
    offer: allowedOffers.includes(item.offer) ? item.offer : "need-discovery",
    blocker: String(item.blocker || "").slice(0, 500),
    nextAction: String(item.nextAction || "").slice(0, 300),
    sessionNote: String(item.sessionNote || "").slice(0, 500)
  };
}

function prefillPilotFollowupFromLatestSession() {
  const latest = state.pilotSessions[0];
  if (!latest) {
    flashPilotFollowupResult("No pilot session yet. Save one session first, then prefill the follow-up.", "error");
    return;
  }
  if (els.pilotFollowupAccount) els.pilotFollowupAccount.value = latest.user || "";
  if (els.pilotFollowupPriority) {
    els.pilotFollowupPriority.value = ["source-blocked", "trust-blocked"].includes(latest.outcome) ? "High" : "Medium";
  }
  if (els.pilotFollowupStage) {
    els.pilotFollowupStage.value = latest.outcome === "source-blocked" ? "source-needed" : latest.outcome === "not-fit" ? "closed-lost" : "demo-done";
  }
  if (els.pilotFollowupOffer) {
    const offerMap = { "aed-199": "aed-199", "aed-399": "aed-399", team: "team-invoice" };
    els.pilotFollowupOffer.value = offerMap[latest.paidIntent] || "need-discovery";
  }
  if (els.pilotFollowupNextDate && !els.pilotFollowupNextDate.value) {
    els.pilotFollowupNextDate.value = makeLocalDateOffset(1);
  }
  if (els.pilotFollowupBlocker) els.pilotFollowupBlocker.value = latest.objection || "";
  if (els.pilotFollowupNextAction) {
    els.pilotFollowupNextAction.value = latest.nextStep || "Send a cited UAE brief, ask for the next live question, and test paid intent.";
  }
  if (els.pilotFollowupSessionNote) {
    els.pilotFollowupSessionNote.value = [
      latest.question ? `Question: ${latest.question}` : "",
      latest.tickers ? `Tickers: ${latest.tickers}` : "",
      `Outcome: ${getPilotOutcomeLabel(latest.outcome)}`
    ].filter(Boolean).join(" | ");
  }
  flashPilotFollowupResult("Latest pilot session loaded into the follow-up form.", "neutral");
}

function makePilotFollowupReport() {
  const total = state.pilotFollowups.length;
  const today = makeLocalDateOffset(0);
  const open = state.pilotFollowups.filter((item) => item.stage !== "closed-lost").length;
  const dueNow = state.pilotFollowups.filter((item) => item.stage !== "closed-lost" && item.nextDate && item.nextDate <= today).length;
  const highPriority = state.pilotFollowups.filter((item) => item.priority === "High" && item.stage !== "closed-lost").length;
  const conversion = state.pilotFollowups.filter((item) => ["proposal-sent", "paid-pilot"].includes(item.stage)).length;
  const sourceNeeded = state.pilotFollowups.filter((item) => item.stage === "source-needed").length;
  return {
    total,
    stats: [
      { label: "Open follow-ups", value: String(open), detail: "Accounts still needing action.", className: open ? "is-warning" : total ? "is-good" : "is-error" },
      { label: "Due now", value: String(dueNow), detail: "Overdue or due today.", className: dueNow ? "is-error" : open ? "is-good" : "is-warning" },
      { label: "High priority", value: String(highPriority), detail: "Trust, source, or conversion-sensitive next steps.", className: highPriority ? "is-warning" : open ? "is-good" : "is-error" },
      { label: "Conversion lane", value: String(conversion), detail: "Proposal sent or paid pilot stage.", className: conversion ? "is-good" : open ? "is-warning" : "is-error" },
      { label: "Source needed", value: String(sourceNeeded), detail: "Follow-ups blocked by official UAE evidence.", className: sourceNeeded ? "is-warning" : total ? "is-good" : "is-error" }
    ]
  };
}

function getFollowupStageLabel(stage) {
  const labels = {
    "new-lead": "New lead",
    "demo-done": "Demo done",
    "source-needed": "Source needed",
    "proposal-sent": "Proposal sent",
    "paid-pilot": "Paid pilot",
    "closed-lost": "Closed lost"
  };
  return labels[stage] || labels["new-lead"];
}

function getFollowupOfferLabel(offer) {
  const labels = {
    "need-discovery": "Need discovery",
    "aed-199": "AED 199 pilot",
    "aed-399": "AED 399 desk",
    "team-invoice": "Team / invoice"
  };
  return labels[offer] || labels["need-discovery"];
}

function getFollowupPriorityClass(priority) {
  return priority === "High" ? "is-high" : priority === "Low" ? "is-low" : "is-medium";
}

function getFollowupDueClass(date) {
  if (!date) return "is-unscheduled";
  const today = makeLocalDateOffset(0);
  if (date < today) return "is-overdue";
  if (date === today) return "is-due";
  return "is-scheduled";
}

function getFollowupDueLabel(date) {
  if (!date) return "Not scheduled";
  const today = makeLocalDateOffset(0);
  if (date < today) return `${date} overdue`;
  if (date === today) return "Today";
  return date;
}

function makeLocalDateOffset(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function exportPilotFollowups() {
  if (!state.pilotFollowups.length) {
    flashPilotFollowupResult("No follow-ups to export yet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`majlisalpha-pilot-followups-${date}.json`, JSON.stringify(makePilotFollowupsJson(), null, 2), "application/json;charset=utf-8");
  flashPilotFollowupResult("Pilot follow-ups JSON exported.", "success");
}

async function copyPilotFollowups() {
  if (!state.pilotFollowups.length) {
    flashPilotFollowupResult("No follow-ups to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makePilotFollowupsMarkdown());
  flashPilotFollowupResult(copied ? "Follow-up report copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function clearPilotFollowups() {
  state.pilotFollowups = [];
  saveJson(STORAGE_KEYS.pilotFollowups, state.pilotFollowups);
  renderPilotFollowupBoard();
  renderPagesDeploymentDoctor();
  flashPilotFollowupResult("Pilot follow-ups cleared.", "neutral");
}

function deletePilotFollowup(followupId) {
  state.pilotFollowups = state.pilotFollowups.filter((item) => item.id !== followupId);
  saveJson(STORAGE_KEYS.pilotFollowups, state.pilotFollowups);
  renderPilotFollowupBoard();
  renderPagesDeploymentDoctor();
}

function makePilotFollowupsJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    report: makePilotFollowupReport(),
    followups: state.pilotFollowups
  };
}

function makePilotFollowupsMarkdown() {
  const report = makePilotFollowupReport();
  const followups = state.pilotFollowups.map((item, index) => [
    `## ${index + 1}. ${item.account} - ${getFollowupStageLabel(item.stage)}`,
    "",
    `Created: ${item.createdLabel}`,
    `Due: ${getFollowupDueLabel(item.nextDate)}`,
    `Priority: ${item.priority}`,
    `Offer: ${getFollowupOfferLabel(item.offer)}`,
    "",
    `Next action: ${item.nextAction || "No next action captured."}`,
    `Blocker: ${item.blocker || "No blocker recorded."}`,
    `Session note: ${item.sessionNote || "No session note attached."}`
  ].join("\n")).join("\n\n");
  return [
    "# MajlisAlpha Pilot Follow-Up Report",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Version: ${DATA_VERSION}`,
    "",
    "## Summary",
    ...report.stats.map((stat) => `- ${stat.label}: ${stat.value} - ${stat.detail}`),
    "",
    followups,
    "",
    "_Pilot follow-ups are product and sales workflow notes. They are not investment advice._"
  ].join("\n");
}

function flashPilotFollowupResult(message, tone = "neutral") {
  if (!els.pilotFollowupResult) return;
  els.pilotFollowupResult.className = `builder-result is-${tone}`;
  els.pilotFollowupResult.textContent = message;
}

function renderPilotOutreachComposer() {
  if (!els.pilotOutreachSummary || !els.pilotOutreachPreview || !els.pilotOutreachList) return;
  const report = makePilotOutreachReport();
  const latest = state.pilotOutreachDrafts[0];
  if (els.pilotOutreachCount) {
    els.pilotOutreachCount.textContent = `${state.pilotOutreachDrafts.length} draft${state.pilotOutreachDrafts.length === 1 ? "" : "s"}`;
  }
  if (els.copyPilotOutreach) els.copyPilotOutreach.disabled = !latest;
  if (els.exportPilotOutreach) els.exportPilotOutreach.disabled = !state.pilotOutreachDrafts.length;
  if (els.clearPilotOutreach) els.clearPilotOutreach.disabled = !state.pilotOutreachDrafts.length;

  els.pilotOutreachSummary.innerHTML = report.stats.map((stat) => `
    <article class="pilot-outreach-stat ${escapeAttr(stat.className)}">
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
      <em>${escapeHtml(stat.detail)}</em>
    </article>
  `).join("");

  els.pilotOutreachPreview.innerHTML = latest
    ? `
      <div class="pilot-outreach-preview-head">
        <div>
          <span>${escapeHtml(getOutreachChannelLabel(latest.channel))}</span>
          <strong>${escapeHtml(latest.account)} outreach draft</strong>
        </div>
        <em>${escapeHtml(getOutreachOfferLabel(latest.offer))}</em>
      </div>
      <pre>${escapeHtml(latest.message)}</pre>
    `
    : `<div class="empty-list">Generate a draft to preview a WhatsApp, email, LinkedIn, or call follow-up here.</div>`;

  els.pilotOutreachList.innerHTML = state.pilotOutreachDrafts.length
    ? state.pilotOutreachDrafts.map((draft) => `
      <article class="pilot-outreach-card is-${escapeAttr(draft.channel)}">
        <div class="pilot-outreach-card-head">
          <div>
            <span>${escapeHtml(draft.createdLabel)}</span>
            <strong>${escapeHtml(draft.account)} - ${escapeHtml(getOutreachChannelLabel(draft.channel))}</strong>
          </div>
          <button class="text-button danger" type="button" data-pilot-outreach-delete="${escapeAttr(draft.id)}">Delete</button>
        </div>
        <div class="pilot-outreach-card-grid">
          <div><span>Tone</span><strong>${escapeHtml(getOutreachToneLabel(draft.tone))}</strong></div>
          <div><span>Offer</span><strong>${escapeHtml(getOutreachOfferLabel(draft.offer))}</strong></div>
          <div><span>Ask</span><strong>${escapeHtml(getOutreachCtaLabel(draft.cta))}</strong></div>
          <div><span>Channel</span><strong>${escapeHtml(getOutreachChannelLabel(draft.channel))}</strong></div>
        </div>
        <p><strong>Hook:</strong> ${escapeHtml(draft.evidenceHook || "No evidence hook set.")}</p>
        <p class="pilot-outreach-note"><strong>Next action:</strong> ${escapeHtml(draft.nextAction || "No next action captured.")}</p>
      </article>
    `).join("")
    : `<div class="empty-list">Outreach drafts will appear here once a follow-up is converted into a message.</div>`;

  els.pilotOutreachList.querySelectorAll("button[data-pilot-outreach-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePilotOutreachDraft(button.dataset.pilotOutreachDelete));
  });
}

function generatePilotOutreachDraft() {
  const draft = normalizePilotOutreachDraft({
    id: `outreach-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    account: (els.pilotOutreachAccount?.value || "").trim(),
    channel: els.pilotOutreachChannel?.value || "whatsapp",
    tone: els.pilotOutreachTone?.value || "warm",
    offer: els.pilotOutreachOffer?.value || "need-discovery",
    evidenceHook: (els.pilotOutreachEvidenceHook?.value || "").trim(),
    blocker: (els.pilotOutreachBlocker?.value || "").trim(),
    nextAction: (els.pilotOutreachNextAction?.value || "").trim(),
    cta: els.pilotOutreachCta?.value || "second-question"
  });
  if (!draft.account && !draft.nextAction && !draft.evidenceHook) {
    if (els.pilotOutreachAccount) els.pilotOutreachAccount.focus();
    flashPilotOutreachResult("Add an account, evidence hook, or next action before generating outreach.", "error");
    return;
  }
  draft.message = makePilotOutreachMessage(draft);
  state.pilotOutreachDrafts = [draft, ...state.pilotOutreachDrafts].slice(0, 150);
  saveJson(STORAGE_KEYS.pilotOutreachDrafts, state.pilotOutreachDrafts);
  renderPilotOutreachComposer();
  renderPagesDeploymentDoctor();
  flashPilotOutreachResult(`${getOutreachChannelLabel(draft.channel)} outreach generated for ${draft.account}.`, "success");
}

function normalizePilotOutreachDraft(item) {
  const allowedChannels = ["whatsapp", "email", "linkedin", "call"];
  const allowedTones = ["warm", "concise", "direct", "committee"];
  const allowedOffers = ["need-discovery", "aed-199", "aed-399", "team-invoice"];
  const allowedCtas = ["second-question", "source-review", "paid-pilot", "team-demo"];
  const draft = {
    id: String(item.id || `outreach-${Date.now()}`),
    createdAt: item.createdAt || new Date().toISOString(),
    createdLabel: item.createdLabel || (item.createdAt ? new Date(item.createdAt).toLocaleString() : new Date().toLocaleString()),
    account: String(item.account || "Pilot account").slice(0, 90),
    channel: allowedChannels.includes(item.channel) ? item.channel : "whatsapp",
    tone: allowedTones.includes(item.tone) ? item.tone : "warm",
    offer: allowedOffers.includes(item.offer) ? item.offer : "need-discovery",
    evidenceHook: String(item.evidenceHook || "").slice(0, 360),
    blocker: String(item.blocker || "").slice(0, 360),
    nextAction: String(item.nextAction || "").slice(0, 360),
    cta: allowedCtas.includes(item.cta) ? item.cta : "second-question",
    message: String(item.message || "").slice(0, 2500)
  };
  if (!draft.message) draft.message = makePilotOutreachMessage(draft);
  return draft;
}

function prefillPilotOutreachFromFollowup() {
  const followup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0];
  if (!followup) {
    flashPilotOutreachResult("No follow-up yet. Save a follow-up first, then compose outreach.", "error");
    return;
  }
  if (els.pilotOutreachAccount) els.pilotOutreachAccount.value = followup.account || "";
  if (els.pilotOutreachOffer) els.pilotOutreachOffer.value = followup.offer || "need-discovery";
  if (els.pilotOutreachBlocker) els.pilotOutreachBlocker.value = followup.blocker || "";
  if (els.pilotOutreachNextAction) els.pilotOutreachNextAction.value = followup.nextAction || "";
  if (els.pilotOutreachEvidenceHook) {
    els.pilotOutreachEvidenceHook.value = followup.sessionNote || "I can send a short source-backed UAE brief using the official evidence trail.";
  }
  if (els.pilotOutreachCta) {
    els.pilotOutreachCta.value = followup.stage === "source-needed" ? "source-review" : followup.stage === "proposal-sent" ? "paid-pilot" : "second-question";
  }
  flashPilotOutreachResult("Top open follow-up loaded into the outreach composer.", "neutral");
}

function makePilotOutreachReport() {
  const total = state.pilotOutreachDrafts.length;
  const channels = new Set(state.pilotOutreachDrafts.map((draft) => draft.channel)).size;
  const conversionAsks = state.pilotOutreachDrafts.filter((draft) => ["aed-199", "aed-399", "team-invoice"].includes(draft.offer) || ["paid-pilot", "team-demo"].includes(draft.cta)).length;
  const sourceHooks = state.pilotOutreachDrafts.filter((draft) => draft.evidenceHook || draft.cta === "source-review").length;
  const latest = state.pilotOutreachDrafts[0];
  return {
    total,
    stats: [
      { label: "Drafts", value: String(total), detail: "Stored outreach messages in this browser.", className: total ? "is-good" : "is-error" },
      { label: "Channels", value: String(channels), detail: "WhatsApp, email, LinkedIn, or call scripts used.", className: channels >= 2 ? "is-good" : total ? "is-warning" : "is-error" },
      { label: "Conversion asks", value: String(conversionAsks), detail: "Paid pilot, desk, or team-demo asks.", className: conversionAsks ? "is-good" : total ? "is-warning" : "is-error" },
      { label: "Source hooks", value: String(sourceHooks), detail: "Messages anchored to UAE evidence or source review.", className: sourceHooks ? "is-good" : total ? "is-warning" : "is-error" },
      { label: "Latest", value: latest ? getOutreachChannelLabel(latest.channel) : "None", detail: latest ? latest.account : "Generate the first draft.", className: latest ? "is-good" : "is-error" }
    ]
  };
}

function makePilotOutreachMessage(draft) {
  const account = draft.account || "there";
  const evidence = draft.evidenceHook || "I can send a short MajlisAlpha brief with UAE source citations, evidence labels, and the next research gap.";
  const blocker = draft.blocker ? `I noted the blocker: ${draft.blocker}.` : "I want to keep the next step focused and source-backed.";
  const nextAction = draft.nextAction || "I can send one concise source-backed answer and use it to test the next UAE market question.";
  const ask = getOutreachCtaSentence(draft.cta, draft.offer);

  if (draft.channel === "email") {
    return [
      `Subject: MajlisAlpha follow-up - ${getOutreachCtaLabel(draft.cta)}`,
      "",
      `Hi ${account},`,
      "",
      `Thank you again for testing MajlisAlpha. ${evidence}`,
      "",
      blocker,
      "",
      `Suggested next step: ${nextAction}`,
      "",
      ask,
      "",
      "Best,",
      "Dhiraj"
    ].join("\n");
  }

  if (draft.channel === "linkedin") {
    return [
      `Hi ${account}, thanks again for looking at MajlisAlpha.`,
      evidence,
      blocker,
      `${nextAction} ${ask}`
    ].join(" ");
  }

  if (draft.channel === "call") {
    return [
      `Call script for ${account}`,
      "",
      "1. Open with the exact pilot question they cared about.",
      `2. Evidence hook: ${evidence}`,
      `3. Blocker to resolve: ${blocker}`,
      `4. Next action: ${nextAction}`,
      `5. Close: ${ask}`,
      "",
      "Keep the call anchored to source-backed research software, not investment advice."
    ].join("\n");
  }

  const greeting = draft.tone === "direct" ? `Hi ${account} -` : `Hi ${account},`;
  return [
    greeting,
    `${evidence}`,
    `${blocker}`,
    `${nextAction}`,
    `${ask}`
  ].join("\n");
}

function getOutreachCtaSentence(cta, offer) {
  const offerLabel = getOutreachOfferLabel(offer);
  const labels = {
    "second-question": "Can you send me one more real UAE market question so I can test the workflow against something practical?",
    "source-review": "If you share the source you trust most, I will map the answer to that evidence trail first.",
    "paid-pilot": `Would you be open to trying the ${offerLabel} lane if this answers the next question cleanly?`,
    "team-demo": "Should we set up a short team walkthrough and test the same workflow with your actual watchlist?"
  };
  return labels[cta] || labels["second-question"];
}

function getOutreachChannelLabel(channel) {
  const labels = {
    whatsapp: "WhatsApp",
    email: "Email",
    linkedin: "LinkedIn",
    call: "Call script"
  };
  return labels[channel] || labels.whatsapp;
}

function getOutreachToneLabel(tone) {
  const labels = {
    warm: "Warm",
    concise: "Concise",
    direct: "Direct",
    committee: "Committee-ready"
  };
  return labels[tone] || labels.warm;
}

function getOutreachOfferLabel(offer) {
  return getFollowupOfferLabel(offer);
}

function getOutreachCtaLabel(cta) {
  const labels = {
    "second-question": "Second question",
    "source-review": "Source review",
    "paid-pilot": "Paid pilot",
    "team-demo": "Team demo"
  };
  return labels[cta] || labels["second-question"];
}

function exportPilotOutreachDrafts() {
  if (!state.pilotOutreachDrafts.length) {
    flashPilotOutreachResult("No outreach drafts to export yet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`majlisalpha-pilot-outreach-${date}.json`, JSON.stringify(makePilotOutreachJson(), null, 2), "application/json;charset=utf-8");
  flashPilotOutreachResult("Pilot outreach JSON exported.", "success");
}

async function copyLatestPilotOutreach() {
  const latest = state.pilotOutreachDrafts[0];
  if (!latest) {
    flashPilotOutreachResult("No outreach draft to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(latest.message);
  flashPilotOutreachResult(copied ? "Latest outreach copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function clearPilotOutreachDrafts() {
  state.pilotOutreachDrafts = [];
  saveJson(STORAGE_KEYS.pilotOutreachDrafts, state.pilotOutreachDrafts);
  renderPilotOutreachComposer();
  renderPagesDeploymentDoctor();
  flashPilotOutreachResult("Pilot outreach drafts cleared.", "neutral");
}

function deletePilotOutreachDraft(draftId) {
  state.pilotOutreachDrafts = state.pilotOutreachDrafts.filter((draft) => draft.id !== draftId);
  saveJson(STORAGE_KEYS.pilotOutreachDrafts, state.pilotOutreachDrafts);
  renderPilotOutreachComposer();
  renderPagesDeploymentDoctor();
}

function makePilotOutreachJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    report: makePilotOutreachReport(),
    drafts: state.pilotOutreachDrafts
  };
}

function makePilotOutreachMarkdown() {
  const report = makePilotOutreachReport();
  const drafts = state.pilotOutreachDrafts.map((draft, index) => [
    `## ${index + 1}. ${draft.account} - ${getOutreachChannelLabel(draft.channel)}`,
    "",
    `Created: ${draft.createdLabel}`,
    `Tone: ${getOutreachToneLabel(draft.tone)}`,
    `Offer: ${getOutreachOfferLabel(draft.offer)}`,
    `CTA: ${getOutreachCtaLabel(draft.cta)}`,
    "",
    draft.message
  ].join("\n")).join("\n\n");
  return [
    "# MajlisAlpha Pilot Outreach Drafts",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Version: ${DATA_VERSION}`,
    "",
    "## Summary",
    ...report.stats.map((stat) => `- ${stat.label}: ${stat.value} - ${stat.detail}`),
    "",
    drafts,
    "",
    "_Pilot outreach drafts are product and sales workflow notes. They are not investment advice._"
  ].join("\n");
}

function flashPilotOutreachResult(message, tone = "neutral") {
  if (!els.pilotOutreachResult) return;
  els.pilotOutreachResult.className = `builder-result is-${tone}`;
  els.pilotOutreachResult.textContent = message;
}

function renderPilotConversionPipeline() {
  if (!els.pilotConversionSummary || !els.pilotConversionList) return;
  const report = makePilotConversionReport();
  if (els.pilotConversionCount) {
    els.pilotConversionCount.textContent = `${state.pilotConversions.length} deal${state.pilotConversions.length === 1 ? "" : "s"}`;
  }
  if (els.exportPilotConversions) els.exportPilotConversions.disabled = !state.pilotConversions.length;
  if (els.copyPilotConversions) els.copyPilotConversions.disabled = !state.pilotConversions.length;
  if (els.clearPilotConversions) els.clearPilotConversions.disabled = !state.pilotConversions.length;

  els.pilotConversionSummary.innerHTML = report.stats.map((stat) => `
    <article class="pilot-conversion-stat ${escapeAttr(stat.className)}">
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
      <em>${escapeHtml(stat.detail)}</em>
    </article>
  `).join("");

  els.pilotConversionList.innerHTML = state.pilotConversions.length
    ? state.pilotConversions.map((deal) => `
      <article class="pilot-conversion-card ${escapeAttr(getConversionStageClass(deal.stage))}">
        <div class="pilot-conversion-card-head">
          <div>
            <span>${escapeHtml(deal.createdLabel)}</span>
            <strong>${escapeHtml(deal.account)} - ${escapeHtml(getConversionStageLabel(deal.stage))}</strong>
          </div>
          <button class="text-button danger" type="button" data-pilot-conversion-delete="${escapeAttr(deal.id)}">Delete</button>
        </div>
        <div class="pilot-conversion-card-grid">
          <div><span>Plan</span><strong>${escapeHtml(getConversionPlanLabel(deal.plan))}</strong></div>
          <div><span>MRR</span><strong>AED ${escapeHtml(formatInteger(deal.mrr))}</strong></div>
          <div><span>Weighted</span><strong>AED ${escapeHtml(formatInteger(getWeightedConversionValue(deal)))}</strong></div>
          <div><span>Close odds</span><strong>${escapeHtml(deal.probability)}%</strong></div>
        </div>
        <div class="pilot-conversion-card-grid">
          <div><span>Reply</span><strong>${escapeHtml(getConversionReplyLabel(deal.reply))}</strong></div>
          <div><span>Next date</span><strong>${escapeHtml(deal.nextDate || "Not set")}</strong></div>
          <div><span>Stage</span><strong>${escapeHtml(getConversionStageLabel(deal.stage))}</strong></div>
          <div><span>Status</span><strong>${escapeHtml(isConversionOpen(deal) ? "Open" : "Closed")}</strong></div>
        </div>
        <p><strong>Close action:</strong> ${escapeHtml(deal.closeAction || "No close action recorded.")}</p>
        <p class="pilot-conversion-note"><strong>Blocker:</strong> ${escapeHtml(deal.blocker || "No blocker recorded.")}</p>
        <p class="pilot-conversion-note"><strong>Note:</strong> ${escapeHtml(deal.note || "No note attached.")}</p>
      </article>
    `).join("")
    : `<div class="empty-list">Conversion records will appear here after outreach produces a reply, pricing signal, source-review step, or paid-pilot decision.</div>`;

  els.pilotConversionList.querySelectorAll("button[data-pilot-conversion-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePilotConversion(button.dataset.pilotConversionDelete));
  });
}

function savePilotConversion() {
  const conversion = normalizePilotConversion({
    id: `conversion-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    account: (els.pilotConversionAccount?.value || "").trim(),
    stage: els.pilotConversionStage?.value || "new-reply",
    plan: els.pilotConversionPlan?.value || "discovery",
    probability: Number(els.pilotConversionProbability?.value || 40),
    mrr: Number(els.pilotConversionMrr?.value || 0),
    nextDate: els.pilotConversionNextDate?.value || "",
    reply: els.pilotConversionReply?.value || "no-reply",
    blocker: (els.pilotConversionBlocker?.value || "").trim(),
    closeAction: (els.pilotConversionCloseAction?.value || "").trim(),
    note: (els.pilotConversionNote?.value || "").trim()
  });
  if (!conversion.account && !conversion.closeAction) {
    if (els.pilotConversionAccount) els.pilotConversionAccount.focus();
    flashPilotConversionResult("Add an account or close action before saving a conversion record.", "error");
    return;
  }
  if (!conversion.mrr) {
    conversion.mrr = getDefaultConversionMrr(conversion.plan);
  }
  state.pilotConversions = [conversion, ...state.pilotConversions].slice(0, 150);
  saveJson(STORAGE_KEYS.pilotConversions, state.pilotConversions);
  if (els.pilotConversionAccount) els.pilotConversionAccount.value = "";
  if (els.pilotConversionBlocker) els.pilotConversionBlocker.value = "";
  if (els.pilotConversionCloseAction) els.pilotConversionCloseAction.value = "";
  if (els.pilotConversionNote) els.pilotConversionNote.value = "";
  renderPilotConversionPipeline();
  renderPagesDeploymentDoctor();
  flashPilotConversionResult(`Conversion record saved for ${conversion.account}.`, "success");
}

function normalizePilotConversion(item) {
  const allowedStages = ["new-reply", "interested", "source-review", "proposal", "paid-pilot", "won", "lost"];
  const allowedPlans = ["discovery", "aed-199", "aed-399", "team-invoice"];
  const allowedReplies = ["no-reply", "positive", "pricing", "source", "team", "not-now"];
  return {
    id: String(item.id || `conversion-${Date.now()}`),
    createdAt: item.createdAt || new Date().toISOString(),
    createdLabel: item.createdLabel || (item.createdAt ? new Date(item.createdAt).toLocaleString() : new Date().toLocaleString()),
    account: String(item.account || "Pilot account").slice(0, 90),
    stage: allowedStages.includes(item.stage) ? item.stage : "new-reply",
    plan: allowedPlans.includes(item.plan) ? item.plan : "discovery",
    probability: Math.max(0, Math.min(100, Number.isFinite(Number(item.probability)) ? Math.round(Number(item.probability)) : 40)),
    mrr: Math.max(0, Math.round(Number.isFinite(Number(item.mrr)) ? Number(item.mrr) : 0)),
    nextDate: /^\d{4}-\d{2}-\d{2}$/.test(item.nextDate || "") ? item.nextDate : "",
    reply: allowedReplies.includes(item.reply) ? item.reply : "no-reply",
    blocker: String(item.blocker || "").slice(0, 500),
    closeAction: String(item.closeAction || "").slice(0, 500),
    note: String(item.note || "").slice(0, 500)
  };
}

function prefillPilotConversionFromPipeline() {
  const outreach = state.pilotOutreachDrafts[0];
  const followup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0];
  const source = outreach || followup;
  if (!source) {
    flashPilotConversionResult("No outreach or follow-up yet. Create one first, then prefill the conversion pipeline.", "error");
    return;
  }
  const offer = source.offer || "need-discovery";
  const mappedPlan = offer === "need-discovery" ? "discovery" : offer;
  if (els.pilotConversionAccount) els.pilotConversionAccount.value = source.account || "";
  if (els.pilotConversionPlan) els.pilotConversionPlan.value = mappedPlan === "team-invoice" ? "team-invoice" : mappedPlan;
  if (els.pilotConversionMrr) els.pilotConversionMrr.value = String(getDefaultConversionMrr(mappedPlan));
  if (els.pilotConversionProbability) els.pilotConversionProbability.value = outreach ? "55" : "40";
  if (els.pilotConversionStage) els.pilotConversionStage.value = mappedPlan === "discovery" ? "interested" : "proposal";
  if (els.pilotConversionReply) els.pilotConversionReply.value = outreach ? "positive" : "no-reply";
  if (els.pilotConversionNextDate && !els.pilotConversionNextDate.value) els.pilotConversionNextDate.value = makeLocalDateOffset(1);
  if (els.pilotConversionBlocker) els.pilotConversionBlocker.value = source.blocker || "";
  if (els.pilotConversionCloseAction) {
    els.pilotConversionCloseAction.value = outreach ? "Send outreach, capture reply, and confirm whether the next step is source review or paid pilot." : source.nextAction || "";
  }
  if (els.pilotConversionNote) {
    els.pilotConversionNote.value = outreach ? `Latest outreach: ${getOutreachChannelLabel(outreach.channel)} - ${getOutreachCtaLabel(outreach.cta)}` : source.sessionNote || "";
  }
  flashPilotConversionResult("Latest outreach or follow-up loaded into the conversion form.", "neutral");
}

function makePilotConversionReport() {
  const total = state.pilotConversions.length;
  const openDeals = state.pilotConversions.filter(isConversionOpen);
  const weighted = openDeals.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const grossMrr = openDeals.reduce((sum, deal) => sum + deal.mrr, 0);
  const warmReplies = state.pilotConversions.filter((deal) => deal.reply !== "no-reply" && deal.reply !== "not-now").length;
  const paidOrWon = state.pilotConversions.filter((deal) => ["paid-pilot", "won"].includes(deal.stage)).length;
  const blockers = openDeals.filter((deal) => deal.blocker || deal.stage === "source-review" || deal.reply === "source").length;
  return {
    total,
    stats: [
      { label: "Open deals", value: String(openDeals.length), detail: "Active pilot conversion records.", className: openDeals.length ? "is-warning" : total ? "is-good" : "is-error" },
      { label: "Weighted MRR", value: `AED ${formatInteger(weighted)}`, detail: `Gross open MRR is AED ${formatInteger(grossMrr)}.`, className: weighted ? "is-good" : openDeals.length ? "is-warning" : "is-error" },
      { label: "Warm replies", value: String(warmReplies), detail: "Positive, pricing, source, or team replies.", className: warmReplies ? "is-good" : total ? "is-warning" : "is-error" },
      { label: "Paid or won", value: String(paidOrWon), detail: "Paid pilot or converted account.", className: paidOrWon ? "is-good" : total ? "is-warning" : "is-error" },
      { label: "Blockers", value: String(blockers), detail: "Source, trust, pricing, or timing blockers still open.", className: blockers ? "is-warning" : total ? "is-good" : "is-error" }
    ]
  };
}

function isConversionOpen(deal) {
  return !["won", "lost"].includes(deal.stage);
}

function getWeightedConversionValue(deal) {
  return Math.round((deal.mrr || 0) * (deal.probability || 0) / 100);
}

function getDefaultConversionMrr(plan) {
  const values = {
    discovery: 0,
    "aed-199": 199,
    "aed-399": 399,
    "team-invoice": 1200
  };
  return values[plan] || 0;
}

function getConversionStageLabel(stage) {
  const labels = {
    "new-reply": "New reply",
    interested: "Interested",
    "source-review": "Source review",
    proposal: "Proposal",
    "paid-pilot": "Paid pilot",
    won: "Won",
    lost: "Lost"
  };
  return labels[stage] || labels["new-reply"];
}

function getConversionPlanLabel(plan) {
  const labels = {
    discovery: "Discovery",
    "aed-199": "AED 199 pilot",
    "aed-399": "AED 399 desk",
    "team-invoice": "Team / invoice"
  };
  return labels[plan] || labels.discovery;
}

function getConversionReplyLabel(reply) {
  const labels = {
    "no-reply": "No reply",
    positive: "Positive",
    pricing: "Pricing",
    source: "Source trust",
    team: "Team interest",
    "not-now": "Not now"
  };
  return labels[reply] || labels["no-reply"];
}

function getConversionStageClass(stage) {
  if (["paid-pilot", "won"].includes(stage)) return "is-won";
  if (stage === "lost") return "is-lost";
  if (["source-review", "proposal"].includes(stage)) return "is-review";
  return "is-open";
}

function exportPilotConversions() {
  if (!state.pilotConversions.length) {
    flashPilotConversionResult("No conversion records to export yet.", "error");
    return;
  }
  const date = new Date().toISOString().slice(0, 10);
  downloadTextFile(`majlisalpha-pilot-conversions-${date}.json`, JSON.stringify(makePilotConversionsJson(), null, 2), "application/json;charset=utf-8");
  flashPilotConversionResult("Pilot conversion JSON exported.", "success");
}

async function copyPilotConversions() {
  if (!state.pilotConversions.length) {
    flashPilotConversionResult("No conversion records to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makePilotConversionsMarkdown());
  flashPilotConversionResult(copied ? "Conversion pipeline report copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function clearPilotConversions() {
  state.pilotConversions = [];
  saveJson(STORAGE_KEYS.pilotConversions, state.pilotConversions);
  renderPilotConversionPipeline();
  renderPagesDeploymentDoctor();
  flashPilotConversionResult("Pilot conversion records cleared.", "neutral");
}

function deletePilotConversion(conversionId) {
  state.pilotConversions = state.pilotConversions.filter((deal) => deal.id !== conversionId);
  saveJson(STORAGE_KEYS.pilotConversions, state.pilotConversions);
  renderPilotConversionPipeline();
  renderPagesDeploymentDoctor();
}

function makePilotConversionsJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    report: makePilotConversionReport(),
    conversions: state.pilotConversions
  };
}

function makePilotConversionsMarkdown() {
  const report = makePilotConversionReport();
  const deals = state.pilotConversions.map((deal, index) => [
    `## ${index + 1}. ${deal.account} - ${getConversionStageLabel(deal.stage)}`,
    "",
    `Created: ${deal.createdLabel}`,
    `Plan: ${getConversionPlanLabel(deal.plan)}`,
    `MRR: AED ${formatInteger(deal.mrr)}`,
    `Weighted MRR: AED ${formatInteger(getWeightedConversionValue(deal))}`,
    `Close odds: ${deal.probability}%`,
    `Reply: ${getConversionReplyLabel(deal.reply)}`,
    `Next date: ${deal.nextDate || "Not set"}`,
    "",
    `Close action: ${deal.closeAction || "No close action recorded."}`,
    `Blocker: ${deal.blocker || "No blocker recorded."}`,
    `Note: ${deal.note || "No note attached."}`
  ].join("\n")).join("\n\n");
  return [
    "# MajlisAlpha Pilot Conversion Pipeline",
    "",
    `Generated: ${new Date().toLocaleString()}`,
    `Version: ${DATA_VERSION}`,
    "",
    "## Summary",
    ...report.stats.map((stat) => `- ${stat.label}: ${stat.value} - ${stat.detail}`),
    "",
    deals,
    "",
    "_Pilot conversion records are product and sales workflow notes. They are not investment advice._"
  ].join("\n");
}

function renderSessionSnapshotBoard() {
  if (!els.sessionSnapshotSummary || !els.sessionSnapshotGrid) return;
  const snapshot = makeSessionSnapshot();
  window.MajlisAlphaSessionSnapshot = snapshot;
  if (els.openSessionSnapshotNext) {
    els.openSessionSnapshotNext.textContent = snapshot.nextAction.buttonLabel;
  }
  els.sessionSnapshotSummary.innerHTML = `
    <div class="session-snapshot-hero ${escapeAttr(snapshot.statusClass)}">
      <div>
        <span>${escapeHtml(snapshot.statusLabel)}</span>
        <strong>${escapeHtml(snapshot.headline)}</strong>
        <p>${escapeHtml(snapshot.summary)}</p>
      </div>
      <div class="session-snapshot-score">
        <span>Session score</span>
        <strong>${escapeHtml(snapshot.score)}%</strong>
      </div>
    </div>
  `;
  els.sessionSnapshotGrid.innerHTML = snapshot.cards.map((card) => `
    <article class="session-snapshot-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
}

function makeSessionSnapshot() {
  const pagesAudit = makePagesDeploymentAudit();
  const citations = state.currentCitations || [];
  const realCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
  const importedCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "imported").length;
  const syntheticCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "synthetic").length;
  const realSourcePackCount = state.sourcePackDocs.filter((doc) => normalizeSourceStatus(doc.sourceStatus) === "real").length;
  const importedSourceCount = state.uploadedDocs.length;
  const answerQuality = Number(state.lastAnswerMeta?.evidenceQuality || 0);
  const activePilotItems = state.pilotSessions.length + state.pilotFollowups.length + state.pilotOutreachDrafts.length + state.pilotConversions.length;
  const openDeals = state.pilotConversions.filter(isConversionOpen);
  const wonDeals = state.pilotConversions.filter((deal) => deal.stage === "won");
  const weightedMrr = state.pilotConversions.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const reviewTrailCount = state.memoReviews.length + state.decisionJournal.length;
  const checks = [
    Boolean(state.lastBrief),
    citations.length > 0,
    syntheticCitations === 0 || realCitations > 0 || importedCitations > 0,
    realSourcePackCount > 0 || importedSourceCount > 0,
    reviewTrailCount > 0,
    activePilotItems > 0,
    pagesAudit.score >= 90
  ];
  const score = Math.round((checks.filter(Boolean).length / checks.length) * 100);
  const statusClass = score >= 80 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 80 ? "Ready to brief" : score >= 50 ? "Needs one move" : "Start session";
  const nextAction = makeSessionSnapshotNextAction({ citations, syntheticCitations, realSourcePackCount, importedSourceCount, reviewTrailCount, activePilotItems });
  const headline = state.lastBrief
    ? "Current UAE desk session is captured."
    : "No active answer yet. Start with one real question.";
  const summary = [
    `${DATA_VERSION} snapshot.`,
    state.lastAnswerMeta?.question ? `Last question: ${snippet(state.lastAnswerMeta.question, 110)}` : "No latest question stored yet.",
    `${citations.length} citations, ${reviewTrailCount} review notes, ${activePilotItems} pilot records, and ${pagesAudit.score}% deploy health.`
  ].join(" ");
  const cards = [
    {
      label: "Current answer",
      value: state.lastBrief ? `${answerQuality || "No"}% evidence` : "Not run",
      detail: state.lastAnswerMeta?.question ? snippet(state.lastAnswerMeta.question, 150) : "Run one UAE market question to create an answer trail.",
      status: state.lastBrief ? "active" : "empty",
      className: state.lastBrief ? "is-good" : "is-warning"
    },
    {
      label: "Evidence mix",
      value: `${citations.length} citations`,
      detail: `${realCitations} REAL / ${importedCitations} IMP / ${syntheticCitations} SYN in the active answer.`,
      status: syntheticCitations ? "replace SYN" : citations.length ? "clean" : "none",
      className: syntheticCitations ? "is-warning" : citations.length ? "is-good" : "is-error"
    },
    {
      label: "Source pack",
      value: `${realSourcePackCount} REAL`,
      detail: `${state.sourcePackDocs.length} builder records and ${importedSourceCount} uploaded review documents are in this browser session.`,
      status: realSourcePackCount ? "expanded" : importedSourceCount ? "imported" : "starter",
      className: realSourcePackCount ? "is-good" : importedSourceCount ? "is-warning" : "is-error"
    },
    {
      label: "Review trail",
      value: `${state.memoReviews.length} / ${state.decisionJournal.length}`,
      detail: "Memo reviews and decision journal entries create the human approval trail.",
      status: reviewTrailCount ? "logged" : "missing",
      className: reviewTrailCount ? "is-good" : "is-warning"
    },
    {
      label: "Pilot motion",
      value: `${activePilotItems} records`,
      detail: `${state.pilotSessions.length} sessions, ${state.pilotFollowups.length} follow-ups, ${state.pilotOutreachDrafts.length} outreach drafts, ${state.pilotConversions.length} conversion records.`,
      status: activePilotItems ? "moving" : "quiet",
      className: activePilotItems ? "is-good" : "is-warning"
    },
    {
      label: "Revenue signal",
      value: `AED ${formatInteger(weightedMrr)}/mo`,
      detail: `${openDeals.length} open deal${openDeals.length === 1 ? "" : "s"} and ${wonDeals.length} won account${wonDeals.length === 1 ? "" : "s"} in the pilot pipeline.`,
      status: weightedMrr ? "weighted" : "unpriced",
      className: weightedMrr ? "is-good" : state.pilotConversions.length ? "is-warning" : "is-error"
    },
    {
      label: "Deploy health",
      value: `${pagesAudit.score}%`,
      detail: `${pagesAudit.statusLabel}: ${pagesAudit.headline}`,
      status: pagesAudit.statusLabel.toLowerCase(),
      className: pagesAudit.score >= 90 ? "is-good" : pagesAudit.score >= 70 ? "is-warning" : "is-error"
    },
    {
      label: "Next work",
      value: nextAction.label,
      detail: nextAction.detail,
      status: "open",
      className: "is-next"
    }
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    nextAction,
    cards
  };
}

function makeSessionSnapshotNextAction(metrics) {
  if (!state.lastBrief) {
    return { label: "Run answer", buttonLabel: "Open answer desk", target: "#desk", detail: "Ask one UAE market question so the snapshot has evidence to summarize." };
  }
  if (metrics.syntheticCitations > 0 || (!metrics.realSourcePackCount && !metrics.importedSourceCount)) {
    return { label: "Replace SYN", buttonLabel: "Open source studio", target: "#source-builder", detail: "Add or import at least one official UAE source before treating the answer as investor-ready." };
  }
  if (!state.memoReviews.length) {
    return { label: "Review memo", buttonLabel: "Open review room", target: "#memo-review-room", detail: "Save a review decision so the answer has a human judgement trail." };
  }
  if (!state.decisionJournal.length) {
    return { label: "Log decision", buttonLabel: "Open decision journal", target: "#decision-journal", detail: "Capture whether the answer advances, waits, rejects, or needs more source work." };
  }
  if (!state.pilotSessions.length) {
    return { label: "Log pilot", buttonLabel: "Open pilot sessions", target: "#pilot-session-command", detail: "Record how a real user reacted to the answer, source trail, and pricing ask." };
  }
  if (!state.pilotFollowups.length) {
    return { label: "Plan follow-up", buttonLabel: "Open follow-up board", target: "#pilot-followup-board", detail: "Turn the pilot session into a next action with owner, blocker, and date." };
  }
  if (!state.pilotOutreachDrafts.length) {
    return { label: "Draft outreach", buttonLabel: "Open outreach composer", target: "#pilot-outreach-composer", detail: "Convert the follow-up into a message that asks for the next question or paid pilot." };
  }
  if (!state.pilotConversions.length) {
    return { label: "Track revenue", buttonLabel: "Open conversion pipeline", target: "#pilot-conversion-pipeline", detail: "Capture pricing signal, close odds, MRR, and blocker." };
  }
  return { label: "Check deploy", buttonLabel: "Open Pages Doctor", target: "#pages-deployment-doctor", detail: "Confirm the uploaded build is healthy before sharing the live link again." };
}

function openSessionSnapshotNextAction() {
  const snapshot = makeSessionSnapshot();
  document.querySelector(snapshot.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashSessionSnapshotResult(`Opened: ${snapshot.nextAction.label}.`, "neutral");
}

async function copySessionSnapshot() {
  const snapshot = makeSessionSnapshot();
  const copied = await copyTextToClipboard(makeSessionSnapshotMarkdown(snapshot));
  flashSessionSnapshotResult(copied ? "Session snapshot copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportSessionSnapshot() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-session-snapshot-${date}.json`, JSON.stringify(makeSessionSnapshotJson(makeSessionSnapshot()), null, 2), "application/json;charset=utf-8");
  flashSessionSnapshotResult("Session snapshot JSON exported.", "success");
}

function makeSessionSnapshotJson(snapshot) {
  return {
    ...snapshot,
    latestQuestion: state.lastAnswerMeta?.question || "",
    activeTicker: state.selectedTicker,
    sourcePackRecords: state.sourcePackDocs.length,
    uploadedDocuments: state.uploadedDocs.length,
    memoReviews: state.memoReviews.length,
    decisions: state.decisionJournal.length,
    pilotSessions: state.pilotSessions.length,
    pilotFollowups: state.pilotFollowups.length,
    pilotOutreachDrafts: state.pilotOutreachDrafts.length,
    pilotConversions: state.pilotConversions.length
  };
}

function makeSessionSnapshotMarkdown(snapshot) {
  return [
    "# MajlisAlpha Session Snapshot",
    "",
    `Version: ${DATA_VERSION}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Score: ${snapshot.score}% (${snapshot.statusLabel})`,
    "",
    snapshot.summary,
    "",
    "## Snapshot Cards",
    ...snapshot.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Next Action",
    `${snapshot.nextAction.label}: ${snapshot.nextAction.detail}`,
    "",
    "_This snapshot is an operating note for the UAE research desk. It is not investment advice._"
  ].join("\n");
}

function flashSessionSnapshotResult(message, tone = "neutral") {
  if (!els.sessionSnapshotResult) return;
  els.sessionSnapshotResult.className = `builder-result is-${tone}`;
  els.sessionSnapshotResult.textContent = message;
}

function renderReleaseHandoffCenter() {
  if (!els.releaseHandoffSummary || !els.releaseHandoffGrid) return;
  const handoff = makeReleaseHandoff();
  window.MajlisAlphaReleaseHandoff = handoff;
  els.releaseHandoffSummary.innerHTML = `
    <div class="release-handoff-hero ${escapeAttr(handoff.statusClass)}">
      <div>
        <span>${escapeHtml(handoff.statusLabel)}</span>
        <strong>${escapeHtml(handoff.headline)}</strong>
        <p>${escapeHtml(handoff.summary)}</p>
      </div>
      <div class="release-handoff-url">
        <span>Live URL</span>
        <strong>${escapeHtml(handoff.livePath)}</strong>
      </div>
    </div>
  `;
  els.releaseHandoffGrid.innerHTML = handoff.cards.map((card) => `
    <article class="release-handoff-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
}

function makeReleaseHandoff() {
  const pagesAudit = makePagesDeploymentAudit();
  const releaseLabel = "v61 Board Pack War Room";
  const cacheKey = "20260510-uae-61-board-pack-war-room";
  const uploadPackage = "majlisalpha-uae-research-desk.zip";
  const uploadRule = "Extract ZIP, upload contents to repo root";
  const postUploadChecks = [
    "index.html, app.js, styles.css, launch.css, assets/, data/, docs/, and .nojekyll are visible at the repository root.",
    "GitHub Actions pages build and deployment workflow is green.",
    `Open ${LIVE_PAGES_URL} and hard refresh with Ctrl+Shift+R.`,
    "Open Pages Doctor and confirm the health score is Ready - 100%.",
    "Open Board Pack War Room, Funding Round Command Center, Investor Decision Room, Investor IC Memo Room, Investor Terms & Follow-Up Room, Investor Close Plan Room, Investor Commitment Tracker, Investor Objection Desk, Investor Update Composer, Investor Momentum Ledger, Investor Follow-Through Board, Investor Meeting Prep Room, Investor Reply Pipeline, Investor Intro Room, Investor Data Room, Founder Diligence Room, Founder Board Pack Center, Founder Revenue Forecast Center, Account Health Command Center, Renewal & Expansion Board, Paid Pilot Delivery Board, Pilot Close Room, Pilot Proof Packet Builder, Pilot Evidence Ledger, Pilot Value Proof Center, Pilot Success Plan Center, Pilot Onboarding Room, Founder Weekly Review Center, Pilot Learning Loop Center, Pilot Demo Script Center, Live Smoke Test Center, Release Handoff Center, and Session Snapshot Board before sharing the link."
  ];
  const statusClass = pagesAudit.score >= 90 ? "is-good" : pagesAudit.score >= 70 ? "is-warning" : "is-error";
  const statusLabel = pagesAudit.score >= 90 ? "Ready handoff" : pagesAudit.score >= 70 ? "Review handoff" : "Blocked handoff";
  const headline = pagesAudit.score >= 90
    ? "Share the build with a clean upload note."
    : "Check deployment health before sharing the link.";
  const summary = `${releaseLabel} is running as ${DATA_VERSION}. Use ${uploadPackage} or upload the prepared folder contents directly to the GitHub repository root.`;
  const cards = [
    {
      label: "Release",
      value: DATA_VERSION,
      detail: `${releaseLabel}. Cache key: ${cacheKey}.`,
      status: DATA_VERSION === "20260510-uae-61" ? "current" : "stale",
      className: DATA_VERSION === "20260510-uae-61" ? "is-good" : "is-warning"
    },
    {
      label: "Live link",
      value: "GitHub Pages",
      detail: LIVE_PAGES_URL,
      status: "case-correct",
      className: "is-good"
    },
    {
      label: "Upload package",
      value: uploadPackage,
      detail: uploadRule,
      status: "root only",
      className: "is-warning"
    },
    {
      label: "Deploy doctor",
      value: `${pagesAudit.score}%`,
      detail: pagesAudit.headline,
      status: pagesAudit.statusLabel.toLowerCase(),
      className: pagesAudit.score >= 90 ? "is-good" : pagesAudit.score >= 70 ? "is-warning" : "is-error"
    },
    {
      label: "Post-upload",
      value: "5 checks",
      detail: postUploadChecks[0],
      status: "required",
      className: "is-next"
    },
    {
      label: "Share note",
      value: "Copy ready",
      detail: "Copy a short handoff note with version, live link, upload rule, and test checklist.",
      status: "available",
      className: "is-good"
    }
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    releaseLabel,
    cacheKey,
    liveUrl: LIVE_PAGES_URL,
    livePath: EXPECTED_PAGES_PATH,
    uploadPackage,
    uploadRule,
    generatedAt: new Date().toISOString(),
    statusClass,
    statusLabel,
    headline,
    summary,
    postUploadChecks,
    cards
  };
}

async function copyReleaseHandoff() {
  const copied = await copyTextToClipboard(makeReleaseHandoffMarkdown(makeReleaseHandoff()));
  flashReleaseHandoffResult(copied ? "Release handoff copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportReleaseHandoff() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-release-handoff-${date}.json`, JSON.stringify(makeReleaseHandoff(), null, 2), "application/json;charset=utf-8");
  flashReleaseHandoffResult("Release handoff JSON exported.", "success");
}

function makeReleaseHandoffMarkdown(handoff) {
  return [
    "# MajlisAlpha Release Handoff",
    "",
    `Release: ${handoff.releaseLabel}`,
    `Version: ${handoff.version}`,
    `Live URL: ${handoff.liveUrl}`,
    `Upload package: ${handoff.uploadPackage}`,
    `Upload rule: ${handoff.uploadRule}`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Post-Upload Checks",
    ...handoff.postUploadChecks.map((item, index) => `${index + 1}. ${item}`),
    "",
    "## Handoff Cards",
    ...handoff.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "_MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashReleaseHandoffResult(message, tone = "neutral") {
  if (!els.releaseHandoffResult) return;
  els.releaseHandoffResult.className = `builder-result is-${tone}`;
  els.releaseHandoffResult.textContent = message;
}

function renderLiveSmokeTestCenter() {
  if (!els.smokeTestSummary || !els.smokeTestGrid || !els.smokeTestChecklist) return;
  const audit = makeLiveSmokeTestAudit();
  window.MajlisAlphaSmokeTest = audit;
  if (els.openSmokeTestNext) {
    els.openSmokeTestNext.textContent = audit.nextAction.buttonLabel;
  }
  els.smokeTestSummary.innerHTML = `
    <div class="smoke-test-hero ${escapeAttr(audit.statusClass)}">
      <div>
        <span>${escapeHtml(audit.statusLabel)}</span>
        <strong>${escapeHtml(audit.headline)}</strong>
        <p>${escapeHtml(audit.summary)}</p>
      </div>
      <div class="smoke-test-score">
        <span>Smoke score</span>
        <strong>${escapeHtml(audit.score)}%</strong>
      </div>
    </div>
  `;
  els.smokeTestGrid.innerHTML = audit.checks.map((check) => `
    <article class="smoke-test-card ${escapeAttr(check.className)}">
      <span>${escapeHtml(check.label)}</span>
      <strong>${escapeHtml(check.value)}</strong>
      <p>${escapeHtml(check.detail)}</p>
      <em>${escapeHtml(check.status)}</em>
    </article>
  `).join("");
  els.smokeTestChecklist.innerHTML = audit.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
}

function makeLiveSmokeTestAudit() {
  const pagesAudit = makePagesDeploymentAudit();
  const fallbackText = document.querySelector("#full-styles-fallback")?.textContent || "";
  const requiredNodes = [
    "#desk",
    "#queryInput",
    "#runAnalysisButton",
    "#brief-workbench",
    "#investment-gate",
    "#memo-review-room",
    "#decision-journal",
    "#pilot-session-command",
    "#pilot-followup-board",
    "#pilot-outreach-composer",
    "#pilot-conversion-pipeline",
    "#session-snapshot-board",
    "#release-handoff-center",
    "#live-smoke-test",
    "#pilot-demo-script",
    "#pilot-learning-loop",
    "#founder-weekly-review",
    "#pilot-onboarding-room",
    "#pilot-success-plan",
    "#pilot-value-proof",
    "#pilot-evidence-ledger",
    "#pilot-proof-packet",
    "#pilot-close-room",
    "#paid-pilot-delivery",
    "#renewal-expansion-board",
    "#account-health-command",
    "#founder-revenue-forecast",
    "#founder-board-pack",
    "#founder-diligence-room",
    "#investor-data-room",
    "#investor-intro-room",
    "#investor-reply-pipeline",
    "#investor-meeting-prep",
    "#investor-follow-through",
    "#investor-momentum-ledger",
    "#investor-update-composer",
    "#investor-objection-desk",
    "#investor-commitment-tracker",
    "#investor-close-plan",
    "#investor-terms-followup",
    "#investor-ic-memo",
    "#investor-decision-room",
    "#funding-round-command",
    "#board-pack-war-room",
    "#pages-deployment-doctor",
    "#scrollTopButton"
  ];
  const missingNodes = requiredNodes.filter((selector) => !document.querySelector(selector));
  const checks = [
    makeSmokeCheck({
      label: "Version",
      passed: DATA_VERSION === "20260510-uae-61",
      value: DATA_VERSION,
      detail: "The app, JSON fetches, and release note use the same v61 cache key.",
      target: "#release-handoff-center"
    }),
    makeSmokeCheck({
      label: "Data packs",
      passed: SAMPLE_COMPANIES.length >= 10 && SAMPLE_DOCS.length >= 20 && QUESTION_TEMPLATES.length >= 7,
      value: `${SAMPLE_COMPANIES.length} / ${SAMPLE_DOCS.length} / ${QUESTION_TEMPLATES.length}`,
      detail: "Companies, starter documents, and question templates are loaded.",
      target: "#desk"
    }),
    makeSmokeCheck({
      label: "Runtime nodes",
      passed: missingNodes.length === 0,
      value: missingNodes.length ? `${missingNodes.length} missing` : "All present",
      detail: missingNodes.length ? `Missing: ${missingNodes.slice(0, 4).join(", ")}` : "Desk, workflow panels, handoff, smoke test, demo script, learning loop, founder review, onboarding room, success plan, value proof, evidence ledger, proof packet, close room, paid delivery, renewal board, account health, founder revenue forecast, founder board pack, founder diligence, investor data room, investor intro room, investor reply pipeline, investor meeting prep room, investor follow-through board, investor momentum ledger, investor update composer, investor objection desk, investor commitment tracker, investor close plan, investor terms follow-up, investor IC memo, investor decision room, funding round command, board pack war room, doctor, and top button exist.",
      target: missingNodes[0] || "#desk"
    }),
    makeSmokeCheck({
      label: "Style fallback",
      passed: fallbackText.includes(".smoke-test-grid") && fallbackText.includes(".release-handoff-grid") && fallbackText.includes(".session-snapshot-grid") && fallbackText.includes(".demo-script-grid") && fallbackText.includes(".learning-loop-grid") && fallbackText.includes(".founder-review-grid") && fallbackText.includes(".pilot-onboarding-grid") && fallbackText.includes(".pilot-success-grid") && fallbackText.includes(".pilot-value-grid") && fallbackText.includes(".pilot-evidence-grid") && fallbackText.includes(".pilot-proof-grid") && fallbackText.includes(".pilot-close-grid") && fallbackText.includes(".paid-delivery-grid") && fallbackText.includes(".renewal-expansion-grid") && fallbackText.includes(".account-health-grid") && fallbackText.includes(".founder-revenue-grid") && fallbackText.includes(".founder-board-grid") && fallbackText.includes(".founder-diligence-grid") && fallbackText.includes(".investor-data-grid") && fallbackText.includes(".investor-intro-grid") && fallbackText.includes(".investor-reply-grid") && fallbackText.includes(".investor-meeting-grid") && fallbackText.includes(".investor-follow-grid") && fallbackText.includes(".investor-momentum-grid") && fallbackText.includes(".investor-update-grid") && fallbackText.includes(".investor-objection-grid") && fallbackText.includes(".investor-commitment-grid") && fallbackText.includes(".investor-close-grid") && fallbackText.includes(".investor-terms-grid") && fallbackText.includes(".investor-ic-grid") && fallbackText.includes(".investor-decision-grid") && fallbackText.includes(".funding-round-grid") && fallbackText.includes(".board-pack-war-grid") && fallbackText.includes(".scroll-top-button"),
      value: "Embedded CSS",
      detail: "Full fallback CSS includes smoke test, release handoff, session snapshot, demo script, learning loop, founder review, onboarding room, success plan, value proof, evidence ledger, proof packet, close room, paid delivery, renewal, account health, founder revenue, founder board, founder diligence, investor data room, investor intro room, investor reply pipeline, investor meeting prep, investor follow-through, investor momentum, investor update, investor objection, investor commitment, investor close plan, investor terms follow-up, investor IC memo, investor decision room, funding round command, board pack war room, and top button styles.",
      target: "#live-smoke-test"
    }),
    makeSmokeCheck({
      label: "Pages Doctor",
      passed: pagesAudit.score >= 90,
      value: `${pagesAudit.score}%`,
      detail: pagesAudit.headline,
      target: "#pages-deployment-doctor"
    }),
    makeSmokeCheck({
      label: "Storage",
      passed: canUseBrowserStorage(),
      value: canUseBrowserStorage() ? "Available" : "Blocked",
      detail: "Local browser storage is needed for saved briefs, pilot notes, decisions, and valuation cases.",
      target: "#session-snapshot-board"
    }),
    makeSmokeCheck({
      label: "Exports",
      passed: Boolean(document.querySelector("#copyBrief") && document.querySelector("#exportBrief") && document.querySelector("#exportPdfBrief") && document.querySelector("#copyReleaseHandoff")),
      value: "Ready",
      detail: "Copy, Markdown, PDF, handoff note, and JSON export surfaces are visible.",
      target: "#release-handoff-center"
    }),
    makeSmokeCheck({
      label: "Live path",
      passed: window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" || window.location.pathname.startsWith(EXPECTED_PAGES_PATH),
      value: window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost" ? "Local preview" : window.location.pathname,
      detail: `Expected live path is ${EXPECTED_PAGES_PATH}.`,
      target: "#release-handoff-center"
    })
  ];
  const score = Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);
  const statusClass = score >= 90 ? "is-good" : score >= 70 ? "is-warning" : "is-error";
  const statusLabel = score >= 90 ? "Smoke ready" : score >= 70 ? "Needs review" : "Blocked";
  const failed = checks.find((check) => !check.passed);
  const nextAction = failed
    ? { label: failed.label, buttonLabel: `Open ${failed.label}`, target: failed.target, detail: failed.detail }
    : { label: "Pages Doctor", buttonLabel: "Open Pages Doctor", target: "#pages-deployment-doctor", detail: "All smoke checks are green. Confirm the deployment doctor before sharing." };
  const headline = score >= 90
    ? "The current build passes the live smoke path."
    : "One smoke check needs attention before sharing.";
  const summary = [
    `Running ${DATA_VERSION}.`,
    `${checks.filter((check) => check.passed).length}/${checks.length} smoke checks passed.`,
    `Next: ${nextAction.label}.`
  ].join(" ");
  const steps = [
    `Open ${LIVE_PAGES_URL} after upload and hard refresh with Ctrl+Shift+R.`,
    "Confirm the top status strip shows Diligence room v1, Investor room v1, Intro room v1, Reply pipeline v1, Meeting prep v1, Follow-through v1, Momentum ledger v1, Investor update v1, Objection desk v1, Commitment tracker v1, Close plan v1, Terms follow-up v1, IC memo v1, Decision room v1, Round command v1, Board war room v1, Smoke test v1, and Release handoff v1.",
    "Open Live Smoke Test Center and verify the smoke score is green.",
    "Open Pages Doctor and confirm Ready - 100%.",
    "Run one sample question, then confirm Brief Workbench, Pilot Demo Script, Pilot Learning Loop, Founder Weekly Review, Pilot Onboarding Room, Pilot Success Plan, Pilot Value Proof, Pilot Evidence Ledger, Pilot Proof Packet, Pilot Close Room, Paid Pilot Delivery Board, Renewal & Expansion Board, Account Health Command Center, Founder Revenue Forecast Center, Founder Board Pack Center, Founder Diligence Room, Investor Data Room, Investor Intro Room, Investor Reply Pipeline, Investor Meeting Prep Room, Investor Terms & Follow-Up Room, Investor IC Memo Room, Investor Decision Room, Funding Round Command Center, Board Pack War Room, Investor Close Plan Room, Investor Commitment Tracker, Investor Objection Desk, Investor Update Composer, Investor Momentum Ledger, Investor Follow-Through Board, Session Snapshot, and Release Handoff update.",
    "Click the bottom-right Back to Top button from a deep section."
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    nextAction,
    checks,
    steps
  };
}

function makeSmokeCheck({ label, passed, value, detail, target }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    target,
    status: passed ? "pass" : "check",
    className: passed ? "is-good" : "is-warning"
  };
}

function openSmokeTestNextAction() {
  const audit = makeLiveSmokeTestAudit();
  document.querySelector(audit.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashSmokeTestResult(`Opened: ${audit.nextAction.label}.`, "neutral");
}

async function copySmokeTestReport() {
  const copied = await copyTextToClipboard(makeSmokeTestMarkdown(makeLiveSmokeTestAudit()));
  flashSmokeTestResult(copied ? "Smoke test report copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportSmokeTestReport() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-live-smoke-test-${date}.json`, JSON.stringify(makeLiveSmokeTestAudit(), null, 2), "application/json;charset=utf-8");
  flashSmokeTestResult("Smoke test JSON exported.", "success");
}

function makeSmokeTestMarkdown(audit) {
  return [
    "# MajlisAlpha Live Smoke Test",
    "",
    `Version: ${audit.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Smoke score: ${audit.score}% (${audit.statusLabel})`,
    "",
    audit.summary,
    "",
    "## Checks",
    ...audit.checks.map((check) => `- ${check.label}: ${check.value} (${check.status}) - ${check.detail}`),
    "",
    "## Manual Steps",
    ...audit.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "_This smoke test confirms app deployment health only. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashSmokeTestResult(message, tone = "neutral") {
  if (!els.smokeTestResult) return;
  els.smokeTestResult.className = `builder-result is-${tone}`;
  els.smokeTestResult.textContent = message;
}

function renderPilotDemoScriptCenter() {
  if (!els.demoScriptSummary || !els.demoScriptGrid || !els.demoScriptChecklist) return;
  const script = makePilotDemoScript();
  window.MajlisAlphaDemoScript = script;
  if (els.openDemoScriptNext) {
    els.openDemoScriptNext.textContent = script.nextStep.buttonLabel;
  }
  els.demoScriptSummary.innerHTML = `
    <div class="demo-script-hero ${escapeAttr(script.statusClass)}">
      <div>
        <span>${escapeHtml(script.statusLabel)}</span>
        <strong>${escapeHtml(script.headline)}</strong>
        <p>${escapeHtml(script.summary)}</p>
      </div>
      <div class="demo-script-score">
        <span>Demo score</span>
        <strong>${escapeHtml(script.score)}%</strong>
      </div>
    </div>
  `;
  els.demoScriptGrid.innerHTML = script.cards.map((card) => `
    <article class="demo-script-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.demoScriptChecklist.innerHTML = script.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("");
}

function makePilotDemoScript() {
  const smokeAudit = makeLiveSmokeTestAudit();
  const citations = state.currentCitations || [];
  const realCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
  const importedCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "imported").length;
  const syntheticCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "synthetic").length;
  const hasBrief = Boolean(state.lastBrief && state.lastAnswerMeta);
  const reviewTrail = state.memoReviews.length + state.decisionJournal.length;
  const pilotRecords = state.pilotSessions.length + state.pilotFollowups.length + state.pilotOutreachDrafts.length + state.pilotConversions.length;
  const question = state.lastAnswerMeta?.question
    || els.queryInput?.value?.trim()
    || "Compare FAB and ENBD if deposit costs stay high and rate pressure stays elevated.";
  const exportReady = Boolean(
    document.querySelector("#copyBrief")
    && document.querySelector("#exportBrief")
    && document.querySelector("#exportPdfBrief")
    && document.querySelector("#copyDemoScript")
  );
  const objectionCaptured = state.pilotSessions.some((session) => session.objection)
    || state.memoReviews.some((review) => review.risk)
    || state.decisionJournal.some((entry) => entry.evidenceTask);
  const nextStep = makeDemoScriptNextStep({
    smokeAudit,
    hasBrief,
    citations,
    syntheticCitations,
    reviewTrail,
    pilotRecords
  });
  const cards = [
    makeDemoScriptCard({
      label: "Setup",
      passed: smokeAudit.score >= 90,
      value: `${smokeAudit.score}% smoke`,
      detail: "Open the live link, hard refresh, then confirm the smoke path is green before a user sees the desk.",
      target: "#live-smoke-test"
    }),
    makeDemoScriptCard({
      label: "Question",
      passed: hasBrief,
      value: hasBrief ? "Answered" : "Run live question",
      detail: hasBrief ? `Latest question: ${question}` : "Start the demo by asking a real UAE disclosure question in the desk.",
      target: "#desk"
    }),
    makeDemoScriptCard({
      label: "Evidence",
      passed: citations.length > 0 && syntheticCitations === 0,
      value: `${citations.length} citations`,
      detail: citations.length ? `${realCitations} real, ${importedCitations} imported, ${syntheticCitations} starter citations in the current answer.` : "Show citation cards and add real/imported source text if the answer is still starter-only.",
      target: citations.length ? "#brief-workbench" : "#source-builder"
    }),
    makeDemoScriptCard({
      label: "Export",
      passed: exportReady,
      value: exportReady ? "Buttons ready" : "Check exports",
      detail: "Copy, Markdown, PDF, JSON, and demo-script export controls should be visible before asking for feedback.",
      target: "#brief-workbench"
    }),
    makeDemoScriptCard({
      label: "Trust",
      passed: Boolean(reviewTrail || objectionCaptured),
      value: reviewTrail ? `${reviewTrail} notes` : "Ask objection",
      detail: "Ask what would stop the user from sharing the brief, then record the objection in Review Room or Pilot Session.",
      target: reviewTrail ? "#decision-journal" : "#memo-review-room"
    }),
    makeDemoScriptCard({
      label: "Close",
      passed: pilotRecords > 0,
      value: pilotRecords ? `${pilotRecords} records` : "Capture signal",
      detail: "End the demo by logging next step, follow-up lane, outreach draft, and paid-intent signal.",
      target: "#pilot-session-command"
    })
  ];
  const score = Math.round((cards.filter((card) => card.passed).length / cards.length) * 100);
  const statusClass = score >= 80 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 80 ? "Demo ready" : score >= 50 ? "Demo path" : "Needs run";
  const headline = score >= 80
    ? "The pilot demo has a repeatable proof path."
    : "Run the next demo step and keep the proof trail tight.";
  const summary = [
    `${cards.filter((card) => card.passed).length}/${cards.length} demo checks are ready.`,
    `Current next step: ${nextStep.label}.`,
    `Use the script question: ${question}`
  ].join(" ");
  const steps = [
    "Open Pages Doctor, Live Smoke Test, and Release Handoff before the call starts.",
    `Ask: ${question}`,
    "Show the answer, then open citation cards and the Brief Workbench so the user sees source traceability.",
    "Use Copy, Markdown, or PDF export to prove the brief can leave the browser cleanly.",
    "Ask: What would stop you from trusting or using this in a real UAE market decision?",
    "Open Pilot Session Command Center and record the user, segment, question, source status, objection, and next step.",
    "Move the account into Follow-Up Board, Outreach Composer, or Conversion Pipeline before the demo memory fades."
  ];
  const interviewQuestions = [
    "Which UAE issuer or sector would you test next if this worked?",
    "Which source did you expect to see but did not see?",
    "Would you pay AED 199 for a limited pilot or AED 399 for a desk workflow?",
    "What export format would make this easier to share with your team?"
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    question,
    nextStep,
    cards,
    steps,
    interviewQuestions,
    metrics: {
      smokeScore: smokeAudit.score,
      citations: citations.length,
      realCitations,
      importedCitations,
      syntheticCitations,
      reviewTrail,
      pilotRecords
    }
  };
}

function makeDemoScriptCard({ label, passed, value, detail, target }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    target,
    status: passed ? "ready" : "next",
    className: passed ? "is-good" : "is-warning"
  };
}

function makeDemoScriptNextStep({ smokeAudit, hasBrief, citations, syntheticCitations, reviewTrail, pilotRecords }) {
  if (smokeAudit.score < 90) {
    return { label: "Smoke test", buttonLabel: "Open smoke test", target: "#live-smoke-test", detail: "Confirm deployment health before the demo." };
  }
  if (!hasBrief) {
    return { label: "Ask live question", buttonLabel: "Open desk", target: "#desk", detail: "Run a real UAE market question to create the demo brief." };
  }
  if (!citations.length || syntheticCitations) {
    return { label: "Evidence upgrade", buttonLabel: "Open source studio", target: "#source-builder", detail: "Add real or imported source text so the demo is source-first." };
  }
  if (!reviewTrail) {
    return { label: "Trust objection", buttonLabel: "Open review room", target: "#memo-review-room", detail: "Capture what would block user trust." };
  }
  if (!state.pilotSessions.length) {
    return { label: "Log pilot session", buttonLabel: "Open pilot session", target: "#pilot-session-command", detail: "Record who tested and what happened." };
  }
  if (!state.pilotFollowups.length) {
    return { label: "Create follow-up", buttonLabel: "Open follow-up board", target: "#pilot-followup-board", detail: "Convert the session into a follow-up action." };
  }
  if (!state.pilotOutreachDrafts.length) {
    return { label: "Draft outreach", buttonLabel: "Open outreach composer", target: "#pilot-outreach-composer", detail: "Turn the follow-up into a message." };
  }
  if (!state.pilotConversions.length) {
    return { label: "Track conversion", buttonLabel: "Open conversion pipeline", target: "#pilot-conversion-pipeline", detail: "Capture pricing signal and close probability." };
  }
  if (!pilotRecords) {
    return { label: "Capture pilot signal", buttonLabel: "Open pilot session", target: "#pilot-session-command", detail: "Record at least one pilot signal." };
  }
  return { label: "Review handoff", buttonLabel: "Open release handoff", target: "#release-handoff-center", detail: "Package the demo proof before sharing the link again." };
}

function openDemoScriptNextStep() {
  const script = makePilotDemoScript();
  document.querySelector(script.nextStep.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashDemoScriptResult(`Opened: ${script.nextStep.label}.`, "neutral");
}

function prefillPilotSessionFromDemoScript() {
  const script = makePilotDemoScript();
  if (els.queryInput && !els.queryInput.value.trim()) {
    els.queryInput.value = script.question;
    syncTickerFocus(script.question);
  }
  prefillPilotSessionFromDesk();
  if (els.pilotSessionUser && !els.pilotSessionUser.value.trim()) {
    els.pilotSessionUser.value = "Pilot demo user";
  }
  if (els.pilotSessionSegment) {
    els.pilotSessionSegment.value = "Investor";
  }
  if (els.pilotSessionOutcome) {
    els.pilotSessionOutcome.value = script.metrics.citations ? "activated" : "source-blocked";
  }
  if (els.pilotSessionPaidIntent) {
    els.pilotSessionPaidIntent.value = "unknown";
  }
  if (els.pilotSessionObjection && !els.pilotSessionObjection.value.trim()) {
    els.pilotSessionObjection.value = "Needs official UAE source trace and export confidence before using the brief.";
  }
  if (els.pilotSessionNextStep) {
    els.pilotSessionNextStep.value = script.metrics.citations
      ? "Send exported brief, ask for a second real UAE question, and test AED 199 pilot intent."
      : "Run the demo question with sources, then capture trust objection and paid-intent signal.";
  }
  document.querySelector("#pilot-session-command")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashDemoScriptResult("Pilot session form prepared from the demo script.", "success");
  flashPilotSessionResult("Pilot session form prepared from the demo script.", "neutral");
}

async function copyDemoScript() {
  const copied = await copyTextToClipboard(makeDemoScriptMarkdown(makePilotDemoScript()));
  flashDemoScriptResult(copied ? "Pilot demo script copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportDemoScript() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-demo-script-${date}.json`, JSON.stringify(makePilotDemoScript(), null, 2), "application/json;charset=utf-8");
  flashDemoScriptResult("Pilot demo script JSON exported.", "success");
}

function makeDemoScriptMarkdown(script) {
  return [
    "# MajlisAlpha Pilot Demo Script",
    "",
    `Version: ${script.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Demo score: ${script.score}% (${script.statusLabel})`,
    `Question: ${script.question}`,
    "",
    script.summary,
    "",
    "## Demo Checks",
    ...script.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Script",
    ...script.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Interview Questions",
    ...script.interviewQuestions.map((question) => `- ${question}`),
    "",
    "_This demo script validates workflow interest. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashDemoScriptResult(message, tone = "neutral") {
  if (!els.demoScriptResult) return;
  els.demoScriptResult.className = `builder-result is-${tone}`;
  els.demoScriptResult.textContent = message;
}

function renderPilotLearningLoopCenter() {
  if (!els.learningLoopSummary || !els.learningLoopGrid || !els.learningLoopQueue) return;
  const loop = makePilotLearningLoop();
  window.MajlisAlphaLearningLoop = loop;
  if (els.openLearningLoopNext) {
    els.openLearningLoopNext.textContent = loop.nextAction.buttonLabel;
  }
  els.learningLoopSummary.innerHTML = `
    <div class="learning-loop-hero ${escapeAttr(loop.statusClass)}">
      <div>
        <span>${escapeHtml(loop.statusLabel)}</span>
        <strong>${escapeHtml(loop.headline)}</strong>
        <p>${escapeHtml(loop.summary)}</p>
      </div>
      <div class="learning-loop-score">
        <span>Learning score</span>
        <strong>${escapeHtml(loop.score)}%</strong>
      </div>
    </div>
  `;
  els.learningLoopGrid.innerHTML = loop.cards.map((card) => `
    <article class="learning-loop-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.learningLoopQueue.innerHTML = loop.actions.map((action) => `
    <article class="learning-loop-action ${escapeAttr(action.className)}">
      <span>${escapeHtml(action.lane)}</span>
      <strong>${escapeHtml(action.title)}</strong>
      <p>${escapeHtml(action.detail)}</p>
      <em>${escapeHtml(action.targetLabel)}</em>
    </article>
  `).join("");
}

function makePilotLearningLoop() {
  const demoScript = makePilotDemoScript();
  const sessions = state.pilotSessions || [];
  const followups = state.pilotFollowups || [];
  const outreachDrafts = state.pilotOutreachDrafts || [];
  const conversions = state.pilotConversions || [];
  const totalSessions = sessions.length;
  const activatedSessions = sessions.filter((session) => ["activated", "second-question"].includes(session.outcome)).length;
  const secondQuestionSessions = sessions.filter((session) => session.outcome === "second-question").length;
  const sourceBlockedSessions = sessions.filter((session) => session.outcome === "source-blocked" || session.sourceStatus === "missing").length;
  const trustBlockedSessions = sessions.filter((session) => session.outcome === "trust-blocked" || (session.objection || "").trim()).length;
  const paidIntentSessions = sessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const realSourceSessions = sessions.filter((session) => session.sourceStatus === "real").length;
  const sourceRecords = state.sourcePackDocs.length + state.uploadedDocs.length;
  const reviewTrail = state.memoReviews.length + state.decisionJournal.length;
  const pipelineRecords = followups.length + outreachDrafts.length + conversions.length;
  const conversionMrr = conversions.reduce((sum, item) => sum + (Number(item.expectedMrr) || Number(item.mrr) || 0), 0);
  const themes = makeLearningLoopThemes({
    totalSessions,
    activatedSessions,
    secondQuestionSessions,
    sourceBlockedSessions,
    trustBlockedSessions,
    paidIntentSessions,
    realSourceSessions,
    sourceRecords,
    reviewTrail,
    pipelineRecords,
    conversionMrr,
    demoScore: demoScript.score
  });
  const actions = makeLearningLoopActions({
    totalSessions,
    sourceBlockedSessions,
    trustBlockedSessions,
    paidIntentSessions,
    secondQuestionSessions,
    followups,
    outreachDrafts,
    conversions,
    reviewTrail,
    sourceRecords,
    demoScript
  });
  const nextAction = actions[0] || { title: "Review release handoff", buttonLabel: "Open release handoff", target: "#release-handoff-center", detail: "All learning-loop items are clear.", targetLabel: "Release" };
  const cards = [
    makeLearningLoopCard({
      label: "Demo evidence",
      passed: totalSessions > 0,
      value: `${totalSessions} sessions`,
      detail: totalSessions ? `${activatedSessions} activated and ${secondQuestionSessions} asked a second question.` : "Run the Demo Script Center and save the first real pilot session.",
      status: totalSessions ? "logged" : "empty"
    }),
    makeLearningLoopCard({
      label: "Trust blockers",
      passed: trustBlockedSessions === 0 && totalSessions > 0,
      value: `${trustBlockedSessions} blockers`,
      detail: trustBlockedSessions ? "Objections were captured. Turn them into review notes, source tasks, or export improvements." : "No trust blocker recorded yet. Ask the trust question in the next demo.",
      status: trustBlockedSessions ? "triage" : totalSessions ? "clear" : "ask"
    }),
    makeLearningLoopCard({
      label: "Source gaps",
      passed: sourceBlockedSessions === 0 && sourceRecords > 0,
      value: `${sourceBlockedSessions} blocked`,
      detail: sourceBlockedSessions ? "One or more sessions hit missing-source friction." : `${sourceRecords} real/imported source records are available for learning.`,
      status: sourceBlockedSessions ? "source" : sourceRecords ? "ready" : "starter"
    }),
    makeLearningLoopCard({
      label: "Paid signal",
      passed: paidIntentSessions > 0 || conversionMrr > 0,
      value: paidIntentSessions ? `${paidIntentSessions} intent` : `AED ${formatInteger(conversionMrr)}`,
      detail: paidIntentSessions || conversionMrr ? "Commercial signal exists. Move it through follow-up, outreach, and conversion." : "No pricing signal yet. Ask AED 199/AED 399 after proof, not before proof.",
      status: paidIntentSessions || conversionMrr ? "monetize" : "test"
    }),
    makeLearningLoopCard({
      label: "Follow-up motion",
      passed: pipelineRecords > 0,
      value: `${pipelineRecords} records`,
      detail: pipelineRecords ? `${followups.length} follow-ups, ${outreachDrafts.length} outreach drafts, ${conversions.length} conversion records.` : "Convert session notes into a follow-up lane before the call memory fades.",
      status: pipelineRecords ? "moving" : "next"
    }),
    makeLearningLoopCard({
      label: "Next build",
      passed: themes[0]?.priority !== "High" || totalSessions > 0,
      value: themes[0]?.label || "Run demos",
      detail: themes[0]?.detail || "The product needs demo evidence before it can learn.",
      status: themes[0]?.priority || "Start"
    })
  ];
  const score = Math.round((cards.filter((card) => card.passed).length / cards.length) * 100);
  const statusClass = score >= 75 ? "is-good" : score >= 45 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Learning loop active" : score >= 45 ? "Learning loop forming" : "Need demo evidence";
  const headline = score >= 75
    ? "Pilot signals are turning into next actions."
    : "Run demos and convert every objection into a work item.";
  const summary = [
    `${cards.filter((card) => card.passed).length}/${cards.length} learning signals are healthy.`,
    `${themes[0]?.label || "First demo"} is the current top theme.`,
    `Next: ${nextAction.title}.`
  ].join(" ");
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    nextAction,
    cards,
    themes,
    actions,
    metrics: {
      totalSessions,
      activatedSessions,
      secondQuestionSessions,
      sourceBlockedSessions,
      trustBlockedSessions,
      paidIntentSessions,
      realSourceSessions,
      sourceRecords,
      reviewTrail,
      pipelineRecords,
      conversionMrr,
      demoScore: demoScript.score
    }
  };
}

function makeLearningLoopCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "triage" || status === "source" ? "is-error" : "is-warning"
  };
}

function makeLearningLoopThemes(metrics) {
  const themes = [
    {
      label: "Demo evidence",
      priority: metrics.totalSessions ? "Medium" : "High",
      score: metrics.totalSessions ? 35 : 100,
      detail: metrics.totalSessions ? "Pilot sessions are being captured." : "No pilot sessions are logged yet."
    },
    {
      label: "Source trust",
      priority: metrics.sourceBlockedSessions || !metrics.sourceRecords ? "High" : "Low",
      score: metrics.sourceBlockedSessions * 28 + (metrics.sourceRecords ? 0 : 35),
      detail: metrics.sourceBlockedSessions ? "Missing source evidence is blocking demos." : `${metrics.sourceRecords} real/imported source records are available.`
    },
    {
      label: "Trust objection",
      priority: metrics.trustBlockedSessions ? "High" : "Medium",
      score: metrics.trustBlockedSessions * 24 + (metrics.reviewTrail ? 0 : 18),
      detail: metrics.trustBlockedSessions ? "Captured objections should become review or evidence tasks." : "Keep asking why a user would not trust the output."
    },
    {
      label: "Pricing proof",
      priority: metrics.paidIntentSessions || metrics.conversionMrr ? "Medium" : "High",
      score: metrics.paidIntentSessions || metrics.conversionMrr ? 34 : 62,
      detail: metrics.paidIntentSessions || metrics.conversionMrr ? "Paid intent exists and should move through the pipeline." : "No paid-intent signal is captured yet."
    },
    {
      label: "Retention",
      priority: metrics.secondQuestionSessions ? "Low" : "Medium",
      score: metrics.secondQuestionSessions ? 12 : 42,
      detail: metrics.secondQuestionSessions ? "At least one user asked a second question." : "Second-question behavior is not proven yet."
    }
  ];
  return themes.sort((a, b) => b.score - a.score).slice(0, 4);
}

function makeLearningLoopActions({ totalSessions, sourceBlockedSessions, trustBlockedSessions, paidIntentSessions, secondQuestionSessions, followups, outreachDrafts, conversions, reviewTrail, sourceRecords, demoScript }) {
  const actions = [];
  if (!totalSessions) {
    actions.push({
      lane: "Demo",
      title: "Run and log the first pilot demo",
      detail: "Use the Demo Script Center, then prefill and save a Pilot Session record.",
      target: "#pilot-demo-script",
      buttonLabel: "Open demo script",
      targetLabel: "Demo Script",
      className: "is-warning"
    });
  }
  if (sourceBlockedSessions || !sourceRecords || demoScript.metrics.syntheticCitations) {
    actions.push({
      lane: "Source",
      title: "Turn source friction into official evidence",
      detail: "Open Source Studio and replace the blocker with an annual report, disclosure, earnings note, or ownership source.",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      targetLabel: "Source Studio",
      className: sourceBlockedSessions ? "is-error" : "is-warning"
    });
  }
  if (trustBlockedSessions || !reviewTrail) {
    actions.push({
      lane: "Trust",
      title: "Convert objections into review notes",
      detail: "Record the blocker in Memo Review Room or Decision Journal so the next build can address it.",
      target: "#memo-review-room",
      buttonLabel: "Open review room",
      targetLabel: "Review Room",
      className: trustBlockedSessions ? "is-error" : "is-warning"
    });
  }
  if (totalSessions && !secondQuestionSessions) {
    actions.push({
      lane: "Retention",
      title: "Ask for the second real question",
      detail: "The fastest retention test is whether the same user asks another UAE market question after seeing citations.",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up board",
      targetLabel: "Follow-Up",
      className: "is-warning"
    });
  }
  if (totalSessions && !followups.length) {
    actions.push({
      lane: "Follow-up",
      title: "Create the next account action",
      detail: "Move the session into a dated follow-up with offer lane, blocker, and next action.",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up board",
      targetLabel: "Follow-Up",
      className: "is-warning"
    });
  }
  if ((paidIntentSessions || followups.length) && !outreachDrafts.length) {
    actions.push({
      lane: "Outreach",
      title: "Draft the pilot follow-up message",
      detail: "Use the outreach composer while the user's exact source objection and pricing signal are still fresh.",
      target: "#pilot-outreach-composer",
      buttonLabel: "Open outreach composer",
      targetLabel: "Outreach",
      className: "is-good"
    });
  }
  if ((paidIntentSessions || outreachDrafts.length) && !conversions.length) {
    actions.push({
      lane: "Revenue",
      title: "Capture pricing and close probability",
      detail: "Create a conversion record with plan, expected AED MRR, blocker, and close action.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion pipeline",
      targetLabel: "Conversion",
      className: "is-good"
    });
  }
  return actions.slice(0, 6);
}

function openLearningLoopNextAction() {
  const loop = makePilotLearningLoop();
  document.querySelector(loop.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashLearningLoopResult(`Opened: ${loop.nextAction.title}.`, "neutral");
}

async function copyPilotLearningLoop() {
  const copied = await copyTextToClipboard(makeLearningLoopMarkdown(makePilotLearningLoop()));
  flashLearningLoopResult(copied ? "Pilot learning loop copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPilotLearningLoop() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-learning-loop-${date}.json`, JSON.stringify(makePilotLearningLoop(), null, 2), "application/json;charset=utf-8");
  flashLearningLoopResult("Pilot learning loop JSON exported.", "success");
}

function makeLearningLoopMarkdown(loop) {
  return [
    "# MajlisAlpha Pilot Learning Loop",
    "",
    `Version: ${loop.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Learning score: ${loop.score}% (${loop.statusLabel})`,
    "",
    loop.summary,
    "",
    "## Signal Cards",
    ...loop.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Top Themes",
    ...loop.themes.map((theme) => `- ${theme.priority}: ${theme.label} - ${theme.detail}`),
    "",
    "## Next Actions",
    ...loop.actions.map((action, index) => `${index + 1}. ${action.title} (${action.targetLabel}) - ${action.detail}`),
    "",
    "_This learning loop is for pilot operations and product discovery. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashLearningLoopResult(message, tone = "neutral") {
  if (!els.learningLoopResult) return;
  els.learningLoopResult.className = `builder-result is-${tone}`;
  els.learningLoopResult.textContent = message;
}

function renderFounderWeeklyReviewCenter() {
  if (!els.founderReviewSummary || !els.founderReviewGrid || !els.founderReviewDecisions) return;
  const review = makeFounderWeeklyReview();
  window.MajlisAlphaFounderReview = review;
  if (els.openFounderReviewNext) {
    els.openFounderReviewNext.textContent = review.nextDecision.buttonLabel;
  }
  els.founderReviewSummary.innerHTML = `
    <div class="founder-review-hero ${escapeAttr(review.statusClass)}">
      <div>
        <span>${escapeHtml(review.statusLabel)}</span>
        <strong>${escapeHtml(review.headline)}</strong>
        <p>${escapeHtml(review.summary)}</p>
      </div>
      <div class="founder-review-score">
        <span>Weekly score</span>
        <strong>${escapeHtml(review.score)}%</strong>
      </div>
    </div>
  `;
  els.founderReviewGrid.innerHTML = review.cards.map((card) => `
    <article class="founder-review-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.founderReviewDecisions.innerHTML = review.decisions.map((decision) => `
    <article class="founder-review-decision ${escapeAttr(decision.className)}">
      <span>${escapeHtml(decision.lane)}</span>
      <strong>${escapeHtml(decision.title)}</strong>
      <p>${escapeHtml(decision.detail)}</p>
      <em>${escapeHtml(decision.owner)}</em>
    </article>
  `).join("");
}

function makeFounderWeeklyReview() {
  const pagesAudit = makePagesDeploymentAudit();
  const demoScript = makePilotDemoScript();
  const learningLoop = makePilotLearningLoop();
  const totalSessions = state.pilotSessions.length;
  const followups = state.pilotFollowups.length;
  const outreachDrafts = state.pilotOutreachDrafts.length;
  const conversions = state.pilotConversions.length;
  const reviewTrail = state.memoReviews.length + state.decisionJournal.length;
  const sourceRecords = state.sourcePackDocs.length + state.uploadedDocs.length;
  const activePipeline = followups + outreachDrafts + conversions;
  const paidIntent = learningLoop.metrics.paidIntentSessions;
  const conversionMrr = learningLoop.metrics.conversionMrr;
  const sourceGap = learningLoop.metrics.sourceBlockedSessions || !sourceRecords || demoScript.metrics.syntheticCitations;
  const trustGap = learningLoop.metrics.trustBlockedSessions || !reviewTrail;
  const sourceScore = sourceRecords ? Math.min(100, sourceRecords * 18) : 0;
  const pipelineScore = activePipeline ? Math.min(100, activePipeline * 26 + paidIntent * 12) : 0;
  const score = Math.round(
    pagesAudit.score * 0.2
    + demoScript.score * 0.18
    + learningLoop.score * 0.34
    + sourceScore * 0.12
    + pipelineScore * 0.16
  );
  const decisions = makeFounderWeeklyDecisions({ pagesAudit, demoScript, learningLoop, totalSessions, activePipeline, sourceGap, trustGap, paidIntent, conversionMrr, sourceRecords });
  const nextDecision = decisions[0] || { title: "Share weekly memo", buttonLabel: "Open release handoff", target: "#release-handoff-center", detail: "The weekly founder review is ready to share.", owner: "Founder" };
  const cards = [
    makeFounderReviewCard({
      label: "Deploy health",
      passed: pagesAudit.score >= 90,
      value: `${pagesAudit.score}%`,
      detail: pagesAudit.headline,
      status: pagesAudit.statusLabel
    }),
    makeFounderReviewCard({
      label: "Demo proof",
      passed: totalSessions > 0,
      value: `${totalSessions} sessions`,
      detail: totalSessions ? `${demoScript.score}% demo script score with recorded pilot activity.` : "No logged pilot demo yet. Run the demo script and save a session.",
      status: totalSessions ? "evidence" : "missing"
    }),
    makeFounderReviewCard({
      label: "Learning theme",
      passed: learningLoop.score >= 45,
      value: learningLoop.themes[0]?.label || "No theme",
      detail: learningLoop.themes[0]?.detail || "The desk needs pilot evidence before learning can rank themes.",
      status: learningLoop.statusLabel
    }),
    makeFounderReviewCard({
      label: "Source readiness",
      passed: Boolean(sourceRecords && !sourceGap),
      value: `${sourceRecords} records`,
      detail: sourceGap ? "Source trust still needs official evidence or synthetic citation replacement." : "Real/imported source records are available for pilot learning.",
      status: sourceGap ? "source gap" : "ready"
    }),
    makeFounderReviewCard({
      label: "Commercial signal",
      passed: Boolean(paidIntent || conversionMrr),
      value: paidIntent ? `${paidIntent} paid intent` : `AED ${formatInteger(conversionMrr)}`,
      detail: paidIntent || conversionMrr ? "Pricing signal is present. Move it through outreach and conversion." : "Ask pricing only after the user sees evidence and export proof.",
      status: paidIntent || conversionMrr ? "monetize" : "test"
    }),
    makeFounderReviewCard({
      label: "Operating motion",
      passed: activePipeline > 0,
      value: `${activePipeline} actions`,
      detail: activePipeline ? `${followups} follow-ups, ${outreachDrafts} outreach drafts, ${conversions} conversion records.` : "Convert the latest demo into a dated follow-up action.",
      status: activePipeline ? "moving" : "idle"
    })
  ];
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Weekly review ready" : score >= 50 ? "Weekly review forming" : "Need founder evidence";
  const headline = score >= 75
    ? "This week has enough signal for a founder decision."
    : "This week needs tighter demo evidence before scaling.";
  const summary = [
    `${cards.filter((card) => card.passed).length}/${cards.length} founder review cards are healthy.`,
    `Top decision: ${nextDecision.title}.`,
    `Release ${DATA_VERSION} is ${pagesAudit.statusLabel.toLowerCase()} at ${pagesAudit.score}%.`
  ].join(" ");
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    nextDecision,
    cards,
    decisions,
    metrics: {
      deployScore: pagesAudit.score,
      demoScore: demoScript.score,
      learningScore: learningLoop.score,
      totalSessions,
      sourceRecords,
      reviewTrail,
      activePipeline,
      paidIntent,
      conversionMrr
    }
  };
}

function makeFounderReviewCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "source gap" || status === "missing" ? "is-error" : "is-warning"
  };
}

function makeFounderWeeklyDecisions({ pagesAudit, demoScript, learningLoop, totalSessions, activePipeline, sourceGap, trustGap, paidIntent, conversionMrr, sourceRecords }) {
  const decisions = [];
  if (pagesAudit.score < 90) {
    decisions.push({
      lane: "Deploy",
      title: "Fix deployment before sharing",
      detail: pagesAudit.headline,
      target: "#pages-deployment-doctor",
      buttonLabel: "Open Pages Doctor",
      owner: "Operator",
      className: "is-error"
    });
  }
  if (!totalSessions) {
    decisions.push({
      lane: "Demo",
      title: "Run the first weekly pilot demo",
      detail: "Use the repeatable demo script, then save one Pilot Session record with the trust blocker and paid-intent signal.",
      target: "#pilot-demo-script",
      buttonLabel: "Open demo script",
      owner: "Founder",
      className: "is-warning"
    });
  }
  if (sourceGap) {
    decisions.push({
      lane: "Source",
      title: "Replace the top source gap",
      detail: sourceRecords ? "A source blocker or synthetic citation is still shaping the demo. Replace it with official UAE evidence." : "No real/imported source records exist yet. Add the first official source before stronger pilot positioning.",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      owner: "Research",
      className: "is-error"
    });
  }
  if (trustGap) {
    decisions.push({
      lane: "Trust",
      title: "Turn the objection into a review task",
      detail: "Capture the trust blocker in Memo Review Room or Decision Journal so the next build addresses a real concern.",
      target: "#memo-review-room",
      buttonLabel: "Open review room",
      owner: "Analyst",
      className: "is-warning"
    });
  }
  if (totalSessions && !activePipeline) {
    decisions.push({
      lane: "Follow-up",
      title: "Create the next dated account action",
      detail: "Move the latest pilot session into the Follow-Up Board before the conversation gets cold.",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up board",
      owner: "Founder",
      className: "is-warning"
    });
  }
  if (paidIntent || conversionMrr) {
    decisions.push({
      lane: "Revenue",
      title: "Advance the paid pilot conversation",
      detail: "Create or update the conversion record with plan, AED MRR, close probability, blocker, and next close action.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion pipeline",
      owner: "Founder",
      className: "is-good"
    });
  } else if (demoScript.score >= 50 || learningLoop.score >= 45) {
    decisions.push({
      lane: "Pricing",
      title: "Ask the next pricing question",
      detail: "After proof and export, ask whether AED 199 pilot or AED 399 desk access would be worth testing.",
      target: "#pilot-session-command",
      buttonLabel: "Open pilot session",
      owner: "Founder",
      className: "is-warning"
    });
  }
  decisions.push({
    lane: "Memo",
    title: "Export the weekly founder memo",
    detail: "Copy or export this review after the top action is handled so the weekly decision stays visible.",
    target: "#founder-weekly-review",
    buttonLabel: "Review memo",
    owner: "Founder",
    className: "is-good"
  });
  return decisions.slice(0, 6);
}

function openFounderReviewNextDecision() {
  const review = makeFounderWeeklyReview();
  document.querySelector(review.nextDecision.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderReviewResult(`Opened: ${review.nextDecision.title}.`, "neutral");
}

async function copyFounderWeeklyReview() {
  const copied = await copyTextToClipboard(makeFounderWeeklyReviewMarkdown(makeFounderWeeklyReview()));
  flashFounderReviewResult(copied ? "Founder weekly review copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportFounderWeeklyReview() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-founder-weekly-review-${date}.json`, JSON.stringify(makeFounderWeeklyReview(), null, 2), "application/json;charset=utf-8");
  flashFounderReviewResult("Founder weekly review JSON exported.", "success");
}

function makeFounderWeeklyReviewMarkdown(review) {
  return [
    "# MajlisAlpha Founder Weekly Review",
    "",
    `Version: ${review.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Weekly score: ${review.score}% (${review.statusLabel})`,
    "",
    review.summary,
    "",
    "## Review Cards",
    ...review.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Decisions",
    ...review.decisions.map((decision, index) => `${index + 1}. ${decision.title} [${decision.lane}] - ${decision.detail}`),
    "",
    "## Metrics",
    ...Object.entries(review.metrics).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "_This founder review is for operating decisions and pilot learning. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashFounderReviewResult(message, tone = "neutral") {
  if (!els.founderReviewResult) return;
  els.founderReviewResult.className = `builder-result is-${tone}`;
  els.founderReviewResult.textContent = message;
}

function renderPilotOnboardingRoom() {
  if (!els.pilotOnboardingSummary || !els.pilotOnboardingGrid || !els.pilotOnboardingChecklist) return;
  const plan = makePilotOnboardingPlan();
  window.MajlisAlphaPilotOnboarding = plan;
  if (els.openPilotOnboardingNext) {
    els.openPilotOnboardingNext.textContent = plan.nextAction.buttonLabel;
  }
  els.pilotOnboardingSummary.innerHTML = `
    <div class="pilot-onboarding-hero ${escapeAttr(plan.statusClass)}">
      <div>
        <span>${escapeHtml(plan.statusLabel)}</span>
        <strong>${escapeHtml(plan.headline)}</strong>
        <p>${escapeHtml(plan.summary)}</p>
      </div>
      <div class="pilot-onboarding-score">
        <span>Activation score</span>
        <strong>${escapeHtml(plan.score)}%</strong>
      </div>
    </div>
  `;
  els.pilotOnboardingGrid.innerHTML = plan.cards.map((card) => `
    <article class="pilot-onboarding-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.pilotOnboardingChecklist.innerHTML = plan.steps.map((step) => `
    <article class="pilot-onboarding-step ${escapeAttr(step.className)}">
      <span>${escapeHtml(step.lane)}</span>
      <strong>${escapeHtml(step.title)}</strong>
      <p>${escapeHtml(step.detail)}</p>
      <em>${escapeHtml(step.owner)}</em>
    </article>
  `).join("");
}

function makePilotOnboardingPlan() {
  const pagesAudit = makePagesDeploymentAudit();
  const founderReview = makeFounderWeeklyReview();
  const demoScript = makePilotDemoScript();
  const learningLoop = makePilotLearningLoop();
  const packet = makeBriefPacket();
  const latestSession = state.pilotSessions[0] || null;
  const latestFollowup = state.pilotFollowups[0] || null;
  const latestOutreach = state.pilotOutreachDrafts[0] || null;
  const latestConversion = state.pilotConversions[0] || null;
  const sourceRecords = state.sourcePackDocs.length + state.uploadedDocs.length;
  const reviewTrail = state.memoReviews.length + state.decisionJournal.length;
  const account = latestFollowup?.account
    || latestConversion?.account
    || latestOutreach?.account
    || latestSession?.user
    || "Next UAE pilot account";
  const firstQuestion = latestSession?.question
    || state.lastAnswerMeta?.question
    || els.queryInput?.value?.trim()
    || "Compare $FAB and $EMAAR on source-backed cash durability and UAE macro sensitivity.";
  const tickers = latestSession?.tickers
    || packet.meta?.ticker
    || state.selectedTicker
    || STARTER_PACK_TICKERS.join(", ");
  const sourceStatus = latestSession?.sourceStatus
    || (packet.meta?.realSourceCount ? "real" : sourceRecords ? "imported" : "starter");
  const paidIntent = latestSession && ["aed-199", "aed-399", "team"].includes(latestSession.paidIntent);
  const conversionMrr = state.pilotConversions.reduce((sum, deal) => sum + Number(deal.mrr || 0), 0);
  const followupReady = Boolean(latestFollowup);
  const outreachReady = Boolean(latestOutreach);
  const conversionReady = Boolean(latestConversion || paidIntent || conversionMrr);
  const sourceReady = sourceStatus === "real" || sourceRecords > 0;
  const cards = [
    makePilotOnboardingCard({
      label: "Account",
      passed: Boolean(latestSession || latestFollowup || latestOutreach || latestConversion),
      value: account,
      detail: latestSession ? `${latestSession.segment} session captured as ${getPilotOutcomeLabel(latestSession.outcome)}.` : "Pick the next real UAE investor, operator, or finance user to onboard.",
      status: latestSession ? "identified" : "choose"
    }),
    makePilotOnboardingCard({
      label: "First question",
      passed: Boolean(state.lastBrief || latestSession?.question),
      value: snippet(firstQuestion, 64),
      detail: "The first onboarding moment should be a real UAE-market question, not a tour.",
      status: state.lastBrief || latestSession?.question ? "ready" : "ask"
    }),
    makePilotOnboardingCard({
      label: "Source pack",
      passed: sourceReady,
      value: sourceReady ? getPilotSourceLabel(sourceStatus) : "Starter only",
      detail: sourceReady ? `${sourceRecords} real/imported source records are available for trust-building.` : "Add one official source before positioning the pilot as source-backed.",
      status: sourceReady ? "usable" : "gap"
    }),
    makePilotOnboardingCard({
      label: "Trust checkpoint",
      passed: Boolean(reviewTrail || latestSession?.objection),
      value: reviewTrail ? `${reviewTrail} notes` : latestSession?.objection ? "Objection" : "Not captured",
      detail: latestSession?.objection || "Record what would stop the user from relying on the brief.",
      status: reviewTrail || latestSession?.objection ? "captured" : "ask"
    }),
    makePilotOnboardingCard({
      label: "Follow-up",
      passed: followupReady,
      value: followupReady ? getFollowupStageLabel(latestFollowup.stage) : "No action",
      detail: followupReady ? `${latestFollowup.nextAction || "Follow-up action exists."}` : "Every activated demo needs a dated next action before the call memory fades.",
      status: followupReady ? "scheduled" : "next"
    }),
    makePilotOnboardingCard({
      label: "Commercial lane",
      passed: conversionReady,
      value: latestConversion ? getConversionStageLabel(latestConversion.stage) : paidIntent ? getPaidIntentLabel(latestSession.paidIntent) : `AED ${formatInteger(conversionMrr)}`,
      detail: conversionReady ? "Pricing or close probability is ready to track." : "Ask AED 199/AED 399 only after evidence, export, and trust have landed.",
      status: conversionReady ? "track" : "test"
    })
  ];
  const steps = makePilotOnboardingSteps({ pagesAudit, latestSession, latestFollowup, latestOutreach, latestConversion, sourceReady, reviewTrail, paidIntent, demoScript, learningLoop });
  const nextAction = steps[0] || {
    title: "Review founder weekly memo",
    buttonLabel: "Open founder review",
    target: "#founder-weekly-review",
    detail: "Onboarding is in motion. Review the weekly operating memo.",
    owner: "Founder",
    className: "is-good"
  };
  const score = Math.round((cards.filter((card) => card.passed).length / cards.length) * 100);
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Pilot onboarding ready" : score >= 50 ? "Pilot onboarding forming" : "Need onboarding path";
  const headline = score >= 75
    ? "A demo can now become an activated pilot account."
    : "Turn the next demo into a named account with a next action.";
  const summary = [
    `${cards.filter((card) => card.passed).length}/${cards.length} onboarding checks are ready for ${account}.`,
    `Next: ${nextAction.title}.`,
    `Founder review score is ${founderReview.score}%.`
  ].join(" ");
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    account,
    firstQuestion,
    tickers,
    sourceStatus,
    nextAction,
    cards,
    steps,
    metrics: {
      deployScore: pagesAudit.score,
      founderScore: founderReview.score,
      demoScore: demoScript.score,
      learningScore: learningLoop.score,
      sourceRecords,
      reviewTrail,
      sessions: state.pilotSessions.length,
      followups: state.pilotFollowups.length,
      outreachDrafts: state.pilotOutreachDrafts.length,
      conversions: state.pilotConversions.length,
      conversionMrr
    }
  };
}

function makePilotOnboardingCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "gap" || status === "ask" ? "is-error" : "is-warning"
  };
}

function makePilotOnboardingSteps({ pagesAudit, latestSession, latestFollowup, latestOutreach, latestConversion, sourceReady, reviewTrail, paidIntent, demoScript, learningLoop }) {
  const steps = [];
  if (pagesAudit.score < 90) {
    steps.push({
      lane: "Deploy",
      title: "Confirm live site before onboarding",
      detail: "Pages Doctor should stay green before a pilot user gets the link.",
      target: "#pages-deployment-doctor",
      buttonLabel: "Open Pages Doctor",
      owner: "Operator",
      className: "is-error"
    });
  }
  if (!latestSession) {
    steps.push({
      lane: "Demo",
      title: "Log the first onboarding session",
      detail: "Run the demo script, capture the first real question, trust blocker, source status, and paid-intent signal.",
      target: "#pilot-demo-script",
      buttonLabel: "Open demo script",
      owner: "Founder",
      className: "is-warning"
    });
  }
  if (!sourceReady || demoScript.metrics.syntheticCitations || learningLoop.metrics.sourceBlockedSessions) {
    steps.push({
      lane: "Sources",
      title: "Attach one official UAE source",
      detail: "Add annual report, exchange disclosure, earnings note, or ownership evidence so onboarding begins with source trust.",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      owner: "Research",
      className: "is-error"
    });
  }
  if (!reviewTrail && !latestSession?.objection) {
    steps.push({
      lane: "Trust",
      title: "Capture the onboarding trust objection",
      detail: "Ask what would stop the user from relying on the answer, then record it in Review Room or the session note.",
      target: "#memo-review-room",
      buttonLabel: "Open review room",
      owner: "Analyst",
      className: "is-warning"
    });
  }
  if (latestSession && !latestFollowup) {
    steps.push({
      lane: "Follow-up",
      title: "Create the dated next action",
      detail: "Move the activated session into the Follow-Up Board with due date, offer lane, blocker, and action.",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up board",
      owner: "Founder",
      className: "is-warning"
    });
  }
  if ((latestFollowup || paidIntent) && !latestOutreach) {
    steps.push({
      lane: "Message",
      title: "Draft the onboarding follow-up",
      detail: "Send the exported brief, ask the second real question, and invite the AED pilot test.",
      target: "#pilot-outreach-composer",
      buttonLabel: "Open outreach composer",
      owner: "Founder",
      className: "is-good"
    });
  }
  if ((paidIntent || latestOutreach) && !latestConversion) {
    steps.push({
      lane: "Revenue",
      title: "Track the pilot conversion",
      detail: "Capture plan, expected AED MRR, close probability, blocker, and next close action.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion pipeline",
      owner: "Founder",
      className: "is-good"
    });
  }
  steps.push({
    lane: "Review",
    title: "Roll onboarding into the weekly memo",
    detail: "Use Founder Weekly Review after the next account action is created.",
    target: "#founder-weekly-review",
    buttonLabel: "Open founder review",
    owner: "Founder",
    className: "is-good"
  });
  return steps.slice(0, 6);
}

function openPilotOnboardingNextAction() {
  const plan = makePilotOnboardingPlan();
  document.querySelector(plan.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotOnboardingResult(`Opened: ${plan.nextAction.title}.`, "neutral");
}

function prefillPilotOnboardingFollowup() {
  const plan = makePilotOnboardingPlan();
  const latest = state.pilotSessions[0] || null;
  if (latest) {
    prefillPilotFollowupFromLatestSession();
  } else {
    if (els.pilotFollowupAccount) els.pilotFollowupAccount.value = plan.account;
    if (els.pilotFollowupStage) els.pilotFollowupStage.value = "new-lead";
    if (els.pilotFollowupPriority) els.pilotFollowupPriority.value = "High";
    if (els.pilotFollowupNextDate && !els.pilotFollowupNextDate.value) els.pilotFollowupNextDate.value = makeLocalDateOffset(1);
    if (els.pilotFollowupOffer) els.pilotFollowupOffer.value = "need-discovery";
    if (els.pilotFollowupBlocker) els.pilotFollowupBlocker.value = "Needs first source-backed UAE question and trust objection captured.";
    if (els.pilotFollowupNextAction) els.pilotFollowupNextAction.value = "Run first MajlisAlpha demo, send exported brief, ask for second real question, and test paid-intent lane.";
    if (els.pilotFollowupSessionNote) els.pilotFollowupSessionNote.value = `Starter question: ${plan.firstQuestion} | Tickers: ${plan.tickers}`;
  }
  document.querySelector("#pilot-followup-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotOnboardingResult("Pilot follow-up form prepared from the onboarding plan.", "success");
  flashPilotFollowupResult("Pilot follow-up form prepared from onboarding.", "neutral");
}

async function copyPilotOnboardingPlan() {
  const copied = await copyTextToClipboard(makePilotOnboardingMarkdown(makePilotOnboardingPlan()));
  flashPilotOnboardingResult(copied ? "Pilot onboarding plan copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPilotOnboardingPlan() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-onboarding-${date}.json`, JSON.stringify(makePilotOnboardingPlan(), null, 2), "application/json;charset=utf-8");
  flashPilotOnboardingResult("Pilot onboarding JSON exported.", "success");
}

function makePilotOnboardingMarkdown(plan) {
  return [
    "# MajlisAlpha Pilot Onboarding Plan",
    "",
    `Version: ${plan.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${plan.account}`,
    `Activation score: ${plan.score}% (${plan.statusLabel})`,
    "",
    "## First Question",
    plan.firstQuestion,
    "",
    "## Onboarding Cards",
    ...plan.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Steps",
    ...plan.steps.map((step, index) => `${index + 1}. ${step.title} [${step.lane}] - ${step.detail}`),
    "",
    "## Metrics",
    ...Object.entries(plan.metrics).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "_Pilot onboarding notes are product-operation notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPilotOnboardingResult(message, tone = "neutral") {
  if (!els.pilotOnboardingResult) return;
  els.pilotOnboardingResult.className = `builder-result is-${tone}`;
  els.pilotOnboardingResult.textContent = message;
}

function renderPilotSuccessPlanCenter() {
  if (!els.pilotSuccessSummary || !els.pilotSuccessGrid || !els.pilotSuccessTimeline) return;
  const plan = makePilotSuccessPlan();
  window.MajlisAlphaPilotSuccessPlan = plan;
  if (els.openPilotSuccessNext) {
    els.openPilotSuccessNext.textContent = plan.nextMilestone.buttonLabel;
  }
  els.pilotSuccessSummary.innerHTML = `
    <div class="pilot-success-hero ${escapeAttr(plan.statusClass)}">
      <div>
        <span>${escapeHtml(plan.statusLabel)}</span>
        <strong>${escapeHtml(plan.headline)}</strong>
        <p>${escapeHtml(plan.summary)}</p>
      </div>
      <div class="pilot-success-score">
        <span>Success score</span>
        <strong>${escapeHtml(plan.score)}%</strong>
      </div>
    </div>
  `;
  els.pilotSuccessGrid.innerHTML = plan.cards.map((card) => `
    <article class="pilot-success-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.pilotSuccessTimeline.innerHTML = plan.milestones.map((milestone) => `
    <article class="pilot-success-step ${escapeAttr(milestone.className)}">
      <span>${escapeHtml(milestone.day)}</span>
      <strong>${escapeHtml(milestone.title)}</strong>
      <p>${escapeHtml(milestone.detail)}</p>
      <em>${escapeHtml(milestone.owner)}</em>
    </article>
  `).join("");
}

function makePilotSuccessPlan() {
  const onboarding = makePilotOnboardingPlan();
  const learningLoop = makePilotLearningLoop();
  const latestSession = state.pilotSessions[0] || null;
  const latestFollowup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0] || null;
  const latestOutreach = state.pilotOutreachDrafts[0] || null;
  const latestConversion = state.pilotConversions.find(isConversionOpen) || state.pilotConversions[0] || null;
  const sourceRecords = state.sourcePackDocs.length + state.uploadedDocs.length;
  const reviewTrail = state.memoReviews.length + state.decisionJournal.length;
  const secondQuestionSessions = state.pilotSessions.filter((session) => session.outcome === "second-question").length;
  const activatedSessions = state.pilotSessions.filter((session) => ["activated", "second-question"].includes(session.outcome)).length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const conversionMrr = state.pilotConversions.reduce((sum, deal) => sum + Number(deal.mrr || 0), 0);
  const account = latestConversion?.account || latestOutreach?.account || latestFollowup?.account || latestSession?.user || onboarding.account;
  const firstQuestion = latestSession?.question || onboarding.firstQuestion;
  const proofNote = latestOutreach?.evidenceHook || latestFollowup?.sessionNote || (state.lastBrief ? snippet(state.lastBrief, 140) : "No source-backed proof note yet.");
  const cards = [
    makePilotSuccessCard({
      label: "Kickoff",
      passed: Boolean(latestSession || latestFollowup),
      value: account,
      detail: latestSession ? `${latestSession.segment} session captured with ${getPilotOutcomeLabel(latestSession.outcome)} outcome.` : "Name the pilot account and record the first session.",
      status: latestSession || latestFollowup ? "live" : "open"
    }),
    makePilotSuccessCard({
      label: "First answer",
      passed: Boolean(state.lastBrief || latestSession?.question),
      value: snippet(firstQuestion, 64),
      detail: "The pilot succeeds only if the first question is real enough to expose source and trust gaps.",
      status: state.lastBrief || latestSession?.question ? "answered" : "ask"
    }),
    makePilotSuccessCard({
      label: "Evidence proof",
      passed: Boolean(sourceRecords || learningLoop.metrics.realSourceSessions),
      value: `${sourceRecords} records`,
      detail: sourceRecords ? "Real/imported evidence exists for the pilot success path." : "Add one official UAE source or imported filing to make the proof credible.",
      status: sourceRecords ? "sourced" : "gap"
    }),
    makePilotSuccessCard({
      label: "Second question",
      passed: secondQuestionSessions > 0,
      value: `${secondQuestionSessions} repeat`,
      detail: secondQuestionSessions ? "At least one user asked a second question." : "Ask for the next real UAE question after sending the first export.",
      status: secondQuestionSessions ? "retained" : "test"
    }),
    makePilotSuccessCard({
      label: "Follow-up proof",
      passed: Boolean(latestFollowup || latestOutreach),
      value: latestOutreach ? getOutreachChannelLabel(latestOutreach.channel) : latestFollowup ? getFollowupStageLabel(latestFollowup.stage) : "None",
      detail: latestOutreach ? latestOutreach.nextAction || latestOutreach.evidenceHook : latestFollowup ? latestFollowup.nextAction || "Follow-up action exists." : "Create a dated follow-up and outbound message.",
      status: latestOutreach ? "sent" : latestFollowup ? "scheduled" : "open"
    }),
    makePilotSuccessCard({
      label: "Paid pilot",
      passed: Boolean(paidIntentSessions || conversionMrr || latestConversion),
      value: latestConversion ? getConversionStageLabel(latestConversion.stage) : paidIntentSessions ? `${paidIntentSessions} intent` : `AED ${formatInteger(conversionMrr)}`,
      detail: latestConversion ? latestConversion.closeAction || "Conversion record is active." : "Track AED 199, AED 399, or team access only after value proof is visible.",
      status: latestConversion || paidIntentSessions || conversionMrr ? "track" : "ask"
    })
  ];
  const milestones = makePilotSuccessMilestones({ latestSession, latestFollowup, latestOutreach, latestConversion, sourceRecords, reviewTrail, secondQuestionSessions, paidIntentSessions, conversionMrr, account, firstQuestion, proofNote });
  const nextMilestone = milestones.find((milestone) => !milestone.passed) || milestones[milestones.length - 1];
  const score = Math.round((cards.filter((card) => card.passed).length / cards.length) * 100);
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Pilot success path active" : score >= 50 ? "Pilot success forming" : "Need success proof";
  const headline = score >= 75
    ? "The pilot has a visible day-7 success path."
    : "Make the next seven days prove repeat use, trust, and paid intent.";
  const summary = [
    `${cards.filter((card) => card.passed).length}/${cards.length} success checkpoints are complete for ${account}.`,
    `Next: ${nextMilestone.title}.`,
    `Onboarding score is ${onboarding.score}%.`
  ].join(" ");
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    account,
    firstQuestion,
    proofNote,
    nextMilestone,
    cards,
    milestones,
    metrics: {
      onboardingScore: onboarding.score,
      learningScore: learningLoop.score,
      activatedSessions,
      secondQuestionSessions,
      sourceRecords,
      reviewTrail,
      followups: state.pilotFollowups.length,
      outreachDrafts: state.pilotOutreachDrafts.length,
      conversions: state.pilotConversions.length,
      paidIntentSessions,
      conversionMrr
    }
  };
}

function makePilotSuccessCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "gap" || status === "ask" ? "is-error" : "is-warning"
  };
}

function makePilotSuccessMilestones({ latestSession, latestFollowup, latestOutreach, latestConversion, sourceRecords, reviewTrail, secondQuestionSessions, paidIntentSessions, conversionMrr, account, firstQuestion, proofNote }) {
  return [
    {
      day: "Day 0",
      title: "Kick off the pilot account",
      detail: latestSession ? `${account} has a logged pilot session.` : "Run the demo and save a Pilot Session with account, question, source status, objection, and next step.",
      target: "#pilot-session-command",
      buttonLabel: "Open pilot session",
      owner: "Founder",
      passed: Boolean(latestSession),
      className: latestSession ? "is-good" : "is-warning"
    },
    {
      day: "Day 1",
      title: "Answer one real UAE question",
      detail: firstQuestion,
      target: "#desk",
      buttonLabel: "Open desk",
      owner: "Analyst",
      passed: Boolean(state.lastBrief || latestSession?.question),
      className: state.lastBrief || latestSession?.question ? "is-good" : "is-warning"
    },
    {
      day: "Day 2",
      title: "Add official source proof",
      detail: sourceRecords ? `${sourceRecords} real/imported sources are available.` : "Attach one annual report, exchange disclosure, earnings note, or ownership extract.",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      owner: "Research",
      passed: Boolean(sourceRecords),
      className: sourceRecords ? "is-good" : "is-error"
    },
    {
      day: "Day 3",
      title: "Capture trust and ask for question two",
      detail: reviewTrail || secondQuestionSessions ? "Trust or repeat-use evidence is captured." : "Record the trust blocker, then ask for the next real UAE market question.",
      target: reviewTrail ? "#pilot-followup-board" : "#memo-review-room",
      buttonLabel: reviewTrail ? "Open follow-up" : "Open review room",
      owner: "Founder",
      passed: Boolean(reviewTrail || secondQuestionSessions),
      className: reviewTrail || secondQuestionSessions ? "is-good" : "is-warning"
    },
    {
      day: "Day 5",
      title: "Send the value proof follow-up",
      detail: latestOutreach ? proofNote : latestFollowup ? "Follow-up is scheduled. Convert it into outreach." : "Create the follow-up and draft the outbound message while the demo is fresh.",
      target: latestFollowup ? "#pilot-outreach-composer" : "#pilot-followup-board",
      buttonLabel: latestFollowup ? "Open outreach composer" : "Open follow-up board",
      owner: "Founder",
      passed: Boolean(latestOutreach),
      className: latestOutreach ? "is-good" : "is-warning"
    },
    {
      day: "Day 7",
      title: "Decide paid pilot or source blocker",
      detail: latestConversion ? latestConversion.closeAction || "Conversion record is active." : paidIntentSessions || conversionMrr ? "Paid intent exists. Capture plan and close probability." : "Decide whether the account needs pricing, source review, or a second demo.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion pipeline",
      owner: "Founder",
      passed: Boolean(latestConversion || paidIntentSessions || conversionMrr),
      className: latestConversion || paidIntentSessions || conversionMrr ? "is-good" : "is-warning"
    }
  ];
}

function openPilotSuccessNextMilestone() {
  const plan = makePilotSuccessPlan();
  document.querySelector(plan.nextMilestone.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotSuccessResult(`Opened: ${plan.nextMilestone.title}.`, "neutral");
}

function prefillPilotSuccessOutreach() {
  const plan = makePilotSuccessPlan();
  if (state.pilotFollowups.length) {
    prefillPilotOutreachFromFollowup();
  } else {
    if (els.pilotOutreachAccount) els.pilotOutreachAccount.value = plan.account;
    if (els.pilotOutreachChannel) els.pilotOutreachChannel.value = "whatsapp";
    if (els.pilotOutreachTone) els.pilotOutreachTone.value = "warm";
    if (els.pilotOutreachOffer) els.pilotOutreachOffer.value = "need-discovery";
    if (els.pilotOutreachEvidenceHook) els.pilotOutreachEvidenceHook.value = plan.proofNote;
    if (els.pilotOutreachBlocker) els.pilotOutreachBlocker.value = "Need to confirm the next source-backed UAE question and trust blocker.";
    if (els.pilotOutreachNextAction) els.pilotOutreachNextAction.value = "Send the first value proof, ask for the second real question, and decide whether this moves to paid pilot.";
    if (els.pilotOutreachCta) els.pilotOutreachCta.value = "second-question";
    flashPilotOutreachResult("Success-plan outreach loaded into the composer.", "neutral");
  }
  document.querySelector("#pilot-outreach-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotSuccessResult("Outreach composer prepared from the 7-day success plan.", "success");
}

async function copyPilotSuccessPlan() {
  const copied = await copyTextToClipboard(makePilotSuccessMarkdown(makePilotSuccessPlan()));
  flashPilotSuccessResult(copied ? "Pilot success plan copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPilotSuccessPlan() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-success-plan-${date}.json`, JSON.stringify(makePilotSuccessPlan(), null, 2), "application/json;charset=utf-8");
  flashPilotSuccessResult("Pilot success plan JSON exported.", "success");
}

function makePilotSuccessMarkdown(plan) {
  return [
    "# MajlisAlpha Pilot Success Plan",
    "",
    `Version: ${plan.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${plan.account}`,
    `Success score: ${plan.score}% (${plan.statusLabel})`,
    "",
    plan.summary,
    "",
    "## Checkpoints",
    ...plan.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Seven-Day Milestones",
    ...plan.milestones.map((milestone) => `- ${milestone.day}: ${milestone.title} - ${milestone.detail}`),
    "",
    "## Metrics",
    ...Object.entries(plan.metrics).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "_Pilot success notes are operating notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPilotSuccessResult(message, tone = "neutral") {
  if (!els.pilotSuccessResult) return;
  els.pilotSuccessResult.className = `builder-result is-${tone}`;
  els.pilotSuccessResult.textContent = message;
}

function renderPilotEvidenceLedger() {
  if (!els.pilotEvidenceSummary || !els.pilotEvidenceGrid) return;
  const report = makePilotEvidenceReport();
  if (els.pilotEvidenceCount) {
    els.pilotEvidenceCount.textContent = `${state.pilotEvidenceLedger.length} evidence entr${state.pilotEvidenceLedger.length === 1 ? "y" : "ies"}`;
  }
  if (els.copyPilotEvidence) els.copyPilotEvidence.disabled = !state.pilotEvidenceLedger.length;
  if (els.exportPilotEvidence) els.exportPilotEvidence.disabled = !state.pilotEvidenceLedger.length;
  if (els.clearPilotEvidence) els.clearPilotEvidence.disabled = !state.pilotEvidenceLedger.length;
  if (els.pilotEvidenceDate && !els.pilotEvidenceDate.value) {
    els.pilotEvidenceDate.value = makeLocalDateOffset(0);
  }

  els.pilotEvidenceSummary.innerHTML = report.stats.map((stat) => `
    <article class="pilot-evidence-stat ${escapeAttr(stat.className)}">
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
      <em>${escapeHtml(stat.detail)}</em>
    </article>
  `).join("");

  els.pilotEvidenceGrid.innerHTML = state.pilotEvidenceLedger.length
    ? state.pilotEvidenceLedger.map((entry) => `
      <article class="pilot-evidence-card ${escapeAttr(getPilotEvidenceStatusClass(entry.status))}">
        <div class="pilot-evidence-card-head">
          <div>
            <span>${escapeHtml(entry.date || entry.createdLabel)}</span>
            <strong>${escapeHtml(entry.account)} - ${escapeHtml(getPilotEvidenceTypeLabel(entry.type))}</strong>
          </div>
          <button class="text-button danger" type="button" data-pilot-evidence-delete="${escapeAttr(entry.id)}">Delete</button>
        </div>
        <div class="pilot-evidence-card-grid">
          <div><span>Status</span><strong>${escapeHtml(getPilotEvidenceStatusLabel(entry.status))}</strong></div>
          <div><span>Impact</span><strong>${escapeHtml(entry.impact)}%</strong></div>
          <div><span>Type</span><strong>${escapeHtml(getPilotEvidenceTypeLabel(entry.type))}</strong></div>
          <div><span>Date</span><strong>${escapeHtml(entry.date || "Today")}</strong></div>
        </div>
        <p><strong>${escapeHtml(entry.title)}</strong></p>
        <p class="pilot-evidence-note">${escapeHtml(entry.note || "No note attached.")}</p>
      </article>
    `).join("")
    : `<div class="empty-list">Evidence entries will appear here after you capture a real use case, official-source proof, repeat question, output artifact, workflow motion, or revenue signal.</div>`;

  els.pilotEvidenceGrid.querySelectorAll("button[data-pilot-evidence-delete]").forEach((button) => {
    button.addEventListener("click", () => deletePilotEvidenceEntry(button.dataset.pilotEvidenceDelete));
  });
}

function savePilotEvidenceEntry() {
  const entry = normalizePilotEvidenceEntry({
    id: `evidence-${Date.now()}`,
    createdAt: new Date().toISOString(),
    createdLabel: new Date().toLocaleString(),
    account: (els.pilotEvidenceAccount?.value || "").trim(),
    type: els.pilotEvidenceType?.value || "use-case",
    status: els.pilotEvidenceStatus?.value || "captured",
    impact: Number(els.pilotEvidenceImpact?.value || 60),
    date: els.pilotEvidenceDate?.value || makeLocalDateOffset(0),
    title: (els.pilotEvidenceTitle?.value || "").trim(),
    note: (els.pilotEvidenceNote?.value || "").trim()
  });
  if (!entry.title && !entry.note) {
    if (els.pilotEvidenceTitle) els.pilotEvidenceTitle.focus();
    flashPilotEvidenceResult("Add a title or note before saving evidence.", "error");
    return;
  }
  state.pilotEvidenceLedger = [entry, ...state.pilotEvidenceLedger].slice(0, 180);
  saveJson(STORAGE_KEYS.pilotEvidenceLedger, state.pilotEvidenceLedger);
  if (els.pilotEvidenceTitle) els.pilotEvidenceTitle.value = "";
  if (els.pilotEvidenceNote) els.pilotEvidenceNote.value = "";
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderPagesDeploymentDoctor();
  flashPilotEvidenceResult(`Evidence saved: ${getPilotEvidenceTypeLabel(entry.type)}.`, "success");
}

function normalizePilotEvidenceEntry(entry) {
  const allowedTypes = ["use-case", "source-proof", "repeat-proof", "output-proof", "workflow-proof", "revenue-proof"];
  const allowedStatuses = ["captured", "verified", "needs-proof"];
  const date = /^\d{4}-\d{2}-\d{2}$/.test(entry.date || "") ? entry.date : makeLocalDateOffset(0);
  return {
    id: String(entry.id || `evidence-${Date.now()}`),
    createdAt: entry.createdAt || new Date().toISOString(),
    createdLabel: entry.createdLabel || (entry.createdAt ? new Date(entry.createdAt).toLocaleString() : new Date().toLocaleString()),
    account: String(entry.account || "Next UAE pilot account").slice(0, 90),
    type: allowedTypes.includes(entry.type) ? entry.type : "use-case",
    status: allowedStatuses.includes(entry.status) ? entry.status : "captured",
    impact: Math.max(0, Math.min(100, Number.isFinite(Number(entry.impact)) ? Math.round(Number(entry.impact)) : 60)),
    date,
    title: String(entry.title || "Pilot evidence").slice(0, 140),
    note: String(entry.note || "").slice(0, 900)
  };
}

function prefillPilotEvidenceFromDesk() {
  const account = state.pilotConversions.find(isConversionOpen)?.account
    || state.pilotOutreachDrafts[0]?.account
    || state.pilotFollowups[0]?.account
    || state.pilotSessions[0]?.user
    || "Next UAE pilot account";
  const realOrImported = state.currentCitations.filter((citation) => ["real", "imported"].includes(normalizeSourceStatus(citation.sourceStatus))).length;
  const type = realOrImported ? "source-proof" : state.lastBrief ? "output-proof" : "use-case";
  if (els.pilotEvidenceAccount) els.pilotEvidenceAccount.value = account;
  if (els.pilotEvidenceType) els.pilotEvidenceType.value = type;
  if (els.pilotEvidenceStatus) els.pilotEvidenceStatus.value = realOrImported ? "verified" : "captured";
  if (els.pilotEvidenceImpact) els.pilotEvidenceImpact.value = realOrImported ? "75" : state.lastBrief ? "65" : "50";
  if (els.pilotEvidenceDate) els.pilotEvidenceDate.value = makeLocalDateOffset(0);
  if (els.pilotEvidenceTitle) {
    els.pilotEvidenceTitle.value = state.lastAnswerMeta?.question || els.queryInput?.value.trim() || "Captured UAE market pilot evidence";
  }
  if (els.pilotEvidenceNote) {
    const tickers = Array.from(new Set((state.currentCitations || []).map((citation) => citation.ticker))).filter(Boolean).join(", ");
    els.pilotEvidenceNote.value = state.lastBrief
      ? `Current desk answer has ${state.currentCitations.length} citation${state.currentCitations.length === 1 ? "" : "s"}${tickers ? ` across ${tickers}` : ""}. Use this as pilot evidence only after the source trail is reviewed.`
      : "Capture the user's real UAE question, source concern, or paid-pilot signal here.";
  }
  document.querySelector("#pilot-evidence-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotEvidenceResult("Current desk context loaded into the evidence ledger form.", "neutral");
}

function makePilotEvidenceReport() {
  const total = state.pilotEvidenceLedger.length;
  const verified = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const needsProof = state.pilotEvidenceLedger.filter((entry) => entry.status === "needs-proof").length;
  const counts = countPilotEvidenceTypes(state.pilotEvidenceLedger);
  const coveredTypes = Object.values(counts).filter(Boolean).length;
  const averageImpact = total
    ? Math.round(state.pilotEvidenceLedger.reduce((sum, entry) => sum + entry.impact, 0) / total)
    : 0;
  return {
    total,
    counts,
    stats: [
      { label: "Evidence entries", value: String(total), detail: "Saved proof items in this browser.", className: total >= 6 ? "is-good" : total >= 2 ? "is-warning" : "is-error" },
      { label: "Verified proof", value: String(verified), detail: "Entries marked verified after source or customer review.", className: verified >= 3 ? "is-good" : verified ? "is-warning" : "is-error" },
      { label: "Proof coverage", value: `${coveredTypes}/6`, detail: "Use case, source, repeat, output, workflow, and revenue lanes.", className: coveredTypes >= 5 ? "is-good" : coveredTypes >= 3 ? "is-warning" : "is-error" },
      { label: "Avg impact", value: `${averageImpact}%`, detail: "Average strength of the saved proof items.", className: averageImpact >= 75 ? "is-good" : averageImpact >= 50 ? "is-warning" : "is-error" },
      { label: "Needs proof", value: String(needsProof), detail: "Items still requiring confirmation.", className: needsProof ? "is-warning" : total ? "is-good" : "is-error" }
    ]
  };
}

function countPilotEvidenceTypes(entries = []) {
  return entries.reduce((counts, entry) => {
    counts[entry.type] = (counts[entry.type] || 0) + 1;
    return counts;
  }, {
    "use-case": 0,
    "source-proof": 0,
    "repeat-proof": 0,
    "output-proof": 0,
    "workflow-proof": 0,
    "revenue-proof": 0
  });
}

function getPilotEvidenceTypeLabel(type) {
  const labels = {
    "use-case": "Use case",
    "source-proof": "Source proof",
    "repeat-proof": "Repeat proof",
    "output-proof": "Output proof",
    "workflow-proof": "Workflow proof",
    "revenue-proof": "Revenue proof"
  };
  return labels[type] || labels["use-case"];
}

function getPilotEvidenceStatusLabel(status) {
  const labels = {
    captured: "Captured",
    verified: "Verified",
    "needs-proof": "Needs proof"
  };
  return labels[status] || labels.captured;
}

function getPilotEvidenceStatusClass(status) {
  if (status === "verified") return "is-good";
  if (status === "needs-proof") return "is-error";
  return "is-warning";
}

function deletePilotEvidenceEntry(entryId) {
  state.pilotEvidenceLedger = state.pilotEvidenceLedger.filter((entry) => entry.id !== entryId);
  saveJson(STORAGE_KEYS.pilotEvidenceLedger, state.pilotEvidenceLedger);
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderPagesDeploymentDoctor();
}

function clearPilotEvidenceLedger() {
  state.pilotEvidenceLedger = [];
  saveJson(STORAGE_KEYS.pilotEvidenceLedger, state.pilotEvidenceLedger);
  renderPilotEvidenceLedger();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderPagesDeploymentDoctor();
  flashPilotEvidenceResult("Pilot evidence ledger cleared.", "neutral");
}

function exportPilotEvidenceLedger() {
  if (!state.pilotEvidenceLedger.length) {
    flashPilotEvidenceResult("No pilot evidence entries to export yet.", "error");
    return;
  }
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-evidence-ledger-${date}.json`, JSON.stringify(makePilotEvidenceLedgerJson(), null, 2), "application/json;charset=utf-8");
  flashPilotEvidenceResult("Pilot evidence ledger JSON exported.", "success");
}

async function copyPilotEvidenceLedger() {
  if (!state.pilotEvidenceLedger.length) {
    flashPilotEvidenceResult("No pilot evidence entries to copy yet.", "error");
    return;
  }
  const copied = await copyTextToClipboard(makePilotEvidenceLedgerMarkdown());
  flashPilotEvidenceResult(copied ? "Pilot evidence ledger copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function makePilotEvidenceLedgerJson() {
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    report: makePilotEvidenceReport(),
    entries: state.pilotEvidenceLedger
  };
}

function makePilotEvidenceLedgerMarkdown() {
  const report = makePilotEvidenceReport();
  return [
    "# MajlisAlpha Pilot Evidence Ledger",
    "",
    `Version: ${DATA_VERSION}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Entries: ${report.total}`,
    "",
    "## Summary",
    ...report.stats.map((stat) => `- ${stat.label}: ${stat.value} - ${stat.detail}`),
    "",
    "## Evidence",
    ...state.pilotEvidenceLedger.map((entry, index) => `${index + 1}. ${getPilotEvidenceTypeLabel(entry.type)} - ${entry.account} - ${entry.title} (${getPilotEvidenceStatusLabel(entry.status)}, ${entry.impact}%)\n   ${entry.note || "No note attached."}`),
    "",
    "_Pilot evidence entries are product and commercial proof notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPilotEvidenceResult(message, tone = "neutral") {
  if (!els.pilotEvidenceResult) return;
  els.pilotEvidenceResult.className = `builder-result is-${tone}`;
  els.pilotEvidenceResult.textContent = message;
}

function renderPilotValueProofCenter() {
  if (!els.pilotValueSummary || !els.pilotValueGrid || !els.pilotValueEvidence) return;
  const proof = makePilotValueProof();
  window.MajlisAlphaPilotValueProof = proof;
  if (els.openPilotValueNext) {
    els.openPilotValueNext.textContent = proof.nextProof.buttonLabel;
  }
  els.pilotValueSummary.innerHTML = `
    <div class="pilot-value-hero ${escapeAttr(proof.statusClass)}">
      <div>
        <span>${escapeHtml(proof.statusLabel)}</span>
        <strong>${escapeHtml(proof.headline)}</strong>
        <p>${escapeHtml(proof.summary)}</p>
      </div>
      <div class="pilot-value-score">
        <span>Value proof</span>
        <strong>${escapeHtml(proof.score)}%</strong>
      </div>
    </div>
  `;
  els.pilotValueGrid.innerHTML = proof.cards.map((card) => `
    <article class="pilot-value-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.pilotValueEvidence.innerHTML = proof.proofPoints.map((point) => `
    <article class="pilot-value-proof ${escapeAttr(point.className)}">
      <span>${escapeHtml(point.lane)}</span>
      <strong>${escapeHtml(point.title)}</strong>
      <p>${escapeHtml(point.detail)}</p>
      <em>${escapeHtml(point.owner)}</em>
    </article>
  `).join("");
}

function makePilotValueProof() {
  const successPlan = makePilotSuccessPlan();
  const onboarding = makePilotOnboardingPlan();
  const packet = makeBriefPacket();
  const latestSession = state.pilotSessions[0] || null;
  const latestFollowup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0] || null;
  const latestOutreach = state.pilotOutreachDrafts[0] || null;
  const latestConversion = state.pilotConversions.find(isConversionOpen) || state.pilotConversions[0] || null;
  const evidenceCounts = countPilotEvidenceTypes(state.pilotEvidenceLedger);
  const latestEvidence = state.pilotEvidenceLedger[0] || null;
  const sourceRecords = state.sourcePackDocs.length + state.uploadedDocs.length;
  const reviewTrail = state.memoReviews.length + state.decisionJournal.length;
  const savedOutputs = state.notes.length + (state.lastBrief ? 1 : 0);
  const citationCount = state.currentCitations.length;
  const realCitations = state.currentCitations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
  const importedCitations = state.currentCitations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "imported").length;
  const secondQuestionSessions = state.pilotSessions.filter((session) => session.outcome === "second-question").length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const conversionMrr = state.pilotConversions.reduce((sum, deal) => sum + Number(deal.mrr || 0), 0);
  const weightedMrr = state.pilotConversions.filter(isConversionOpen).reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const account = latestConversion?.account || latestOutreach?.account || latestFollowup?.account || latestSession?.user || latestEvidence?.account || successPlan.account || onboarding.account;
  const useCaseEvidence = evidenceCounts["use-case"];
  const sourceEvidence = evidenceCounts["source-proof"];
  const repeatEvidence = evidenceCounts["repeat-proof"];
  const outputEvidence = evidenceCounts["output-proof"];
  const workflowEvidence = evidenceCounts["workflow-proof"];
  const revenueEvidence = evidenceCounts["revenue-proof"];
  const cards = [
    makePilotValueCard({
      label: "Use case",
      passed: Boolean(latestSession || state.lastAnswerMeta?.question || useCaseEvidence),
      value: account,
      detail: latestSession?.question || state.lastAnswerMeta?.question || (useCaseEvidence ? `${useCaseEvidence} use-case evidence entr${useCaseEvidence === 1 ? "y" : "ies"} saved.` : "No real user question has been captured yet."),
      status: latestSession || useCaseEvidence ? "user proof" : "capture"
    }),
    makePilotValueCard({
      label: "Source proof",
      passed: Boolean(sourceRecords || realCitations || importedCitations || sourceEvidence),
      value: sourceRecords ? `${sourceRecords} records` : sourceEvidence ? `${sourceEvidence} ledger` : `${realCitations + importedCitations} cited`,
      detail: sourceRecords || realCitations || importedCitations || sourceEvidence ? "The value story can point to real/imported UAE evidence or a saved source-proof ledger entry." : "Add official evidence so the proof story is not starter-only.",
      status: sourceRecords || realCitations || importedCitations || sourceEvidence ? "evidence" : "gap"
    }),
    makePilotValueCard({
      label: "Repeat proof",
      passed: secondQuestionSessions > 0 || repeatEvidence > 0,
      value: `${secondQuestionSessions || repeatEvidence} repeat`,
      detail: secondQuestionSessions || repeatEvidence ? "A user asked again or repeat behavior has been captured in the ledger." : "Ask the pilot account for the next real UAE market question.",
      status: secondQuestionSessions || repeatEvidence ? "retention" : "ask"
    }),
    makePilotValueCard({
      label: "Output proof",
      passed: Boolean(savedOutputs || citationCount || outputEvidence),
      value: savedOutputs ? `${savedOutputs} outputs` : outputEvidence ? `${outputEvidence} ledger` : `${citationCount} citations`,
      detail: savedOutputs || outputEvidence ? "A saved/current brief or output-proof ledger entry exists for copy, MD, PDF, or memo packet workflows." : "Run a question and create an exportable value artifact.",
      status: savedOutputs || outputEvidence ? "shareable" : "create"
    }),
    makePilotValueCard({
      label: "Workflow proof",
      passed: Boolean(latestFollowup || latestOutreach || reviewTrail || workflowEvidence),
      value: latestOutreach ? getOutreachChannelLabel(latestOutreach.channel) : latestFollowup ? getFollowupStageLabel(latestFollowup.stage) : workflowEvidence ? `${workflowEvidence} ledger` : `${reviewTrail} reviews`,
      detail: latestOutreach?.nextAction || latestFollowup?.nextAction || (workflowEvidence ? "A workflow-proof ledger entry exists." : "The workflow needs a dated next action, review note, or outbound message."),
      status: latestOutreach ? "sent" : latestFollowup || workflowEvidence ? "scheduled" : "prove"
    }),
    makePilotValueCard({
      label: "Revenue proof",
      passed: Boolean(paidIntentSessions || latestConversion || conversionMrr || revenueEvidence),
      value: latestConversion ? getConversionStageLabel(latestConversion.stage) : paidIntentSessions ? `${paidIntentSessions} intent` : revenueEvidence ? `${revenueEvidence} ledger` : `AED ${formatInteger(weightedMrr)}`,
      detail: latestConversion?.closeAction || (revenueEvidence ? "A revenue-proof ledger entry exists." : "Capture AED 199, AED 399, team access, invoice, or close-probability signal."),
      status: latestConversion || paidIntentSessions || conversionMrr || revenueEvidence ? "monetize" : "test"
    })
  ];
  const proofPoints = makePilotValueProofPoints({ latestSession, latestFollowup, latestOutreach, latestConversion, sourceRecords, savedOutputs, secondQuestionSessions, paidIntentSessions, conversionMrr, account, packet, successPlan, evidenceCounts });
  const nextProof = proofPoints.find((point) => !point.passed) || proofPoints[proofPoints.length - 1];
  const score = Math.round((cards.filter((card) => card.passed).length / cards.length) * 100);
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Value proof ready" : score >= 50 ? "Value proof forming" : "Need value evidence";
  const headline = score >= 75
    ? "This pilot has a credible value story."
    : "Collect the missing proof before asking for a paid pilot.";
  const summary = [
    `${cards.filter((card) => card.passed).length}/${cards.length} value-proof checks are ready for ${account}.`,
    `Next: ${nextProof.title}.`,
    `Success-plan score is ${successPlan.score}%.`
  ].join(" ");
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    account,
    nextProof,
    cards,
    proofPoints,
    metrics: {
      successScore: successPlan.score,
      onboardingScore: onboarding.score,
      evidenceEntries: state.pilotEvidenceLedger.length,
      sourceRecords,
      citationCount,
      realCitations,
      importedCitations,
      savedOutputs,
      secondQuestionSessions,
      followups: state.pilotFollowups.length,
      outreachDrafts: state.pilotOutreachDrafts.length,
      conversions: state.pilotConversions.length,
      paidIntentSessions,
      conversionMrr,
      weightedMrr
    }
  };
}

function makePilotValueCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "gap" || status === "ask" ? "is-error" : "is-warning"
  };
}

function makePilotValueProofPoints({ latestSession, latestFollowup, latestOutreach, latestConversion, sourceRecords, savedOutputs, secondQuestionSessions, paidIntentSessions, conversionMrr, account, packet, successPlan, evidenceCounts }) {
  const useCaseEvidence = evidenceCounts["use-case"];
  const sourceEvidence = evidenceCounts["source-proof"];
  const repeatEvidence = evidenceCounts["repeat-proof"];
  const outputEvidence = evidenceCounts["output-proof"];
  const workflowEvidence = evidenceCounts["workflow-proof"];
  const revenueEvidence = evidenceCounts["revenue-proof"];
  return [
    {
      lane: "Use case",
      title: "Name the painful UAE question",
      detail: latestSession?.question || packet.meta?.question || (useCaseEvidence ? `${useCaseEvidence} use-case evidence entr${useCaseEvidence === 1 ? "y" : "ies"} saved.` : successPlan.firstQuestion) || "Capture the first real UAE market question that made the product useful.",
      target: "#pilot-session-command",
      buttonLabel: "Open pilot session",
      owner: "Founder",
      passed: Boolean(latestSession || packet.hasBrief || useCaseEvidence),
      className: latestSession || packet.hasBrief || useCaseEvidence ? "is-good" : "is-warning"
    },
    {
      lane: "Evidence",
      title: "Show official-source proof",
      detail: sourceRecords ? `${sourceRecords} real/imported source records can support the value story.` : sourceEvidence ? `${sourceEvidence} source-proof ledger entr${sourceEvidence === 1 ? "y" : "ies"} saved.` : "Add one official UAE source so the value proof is not demo-only.",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      owner: "Research",
      passed: Boolean(sourceRecords || sourceEvidence),
      className: sourceRecords || sourceEvidence ? "is-good" : "is-error"
    },
    {
      lane: "Artifact",
      title: "Create the shareable brief artifact",
      detail: savedOutputs ? `${savedOutputs} saved/current output artifacts exist.` : outputEvidence ? `${outputEvidence} output-proof ledger entr${outputEvidence === 1 ? "y" : "ies"} saved.` : "Run a question, save/copy/export the answer, and use it as value proof.",
      target: "#brief-workbench",
      buttonLabel: "Open brief workbench",
      owner: "Analyst",
      passed: Boolean(savedOutputs || outputEvidence),
      className: savedOutputs || outputEvidence ? "is-good" : "is-warning"
    },
    {
      lane: "Retention",
      title: "Ask for the second real question",
      detail: secondQuestionSessions ? "Repeat-use proof exists." : repeatEvidence ? `${repeatEvidence} repeat-proof ledger entr${repeatEvidence === 1 ? "y" : "ies"} saved.` : "A second question is the cleanest signal that the account sees value.",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up board",
      owner: "Founder",
      passed: Boolean(secondQuestionSessions || repeatEvidence),
      className: secondQuestionSessions || repeatEvidence ? "is-good" : "is-warning"
    },
    {
      lane: "Message",
      title: "Send value proof follow-up",
      detail: latestOutreach ? latestOutreach.message.slice(0, 220) : latestFollowup ? "Follow-up exists. Convert it into a message with the evidence hook." : workflowEvidence ? `${workflowEvidence} workflow-proof ledger entr${workflowEvidence === 1 ? "y" : "ies"} saved.` : "Create a follow-up and send the value proof while the pilot memory is fresh.",
      target: latestFollowup ? "#pilot-outreach-composer" : "#pilot-followup-board",
      buttonLabel: latestFollowup ? "Open outreach composer" : "Open follow-up board",
      owner: "Founder",
      passed: Boolean(latestOutreach || workflowEvidence),
      className: latestOutreach || workflowEvidence ? "is-good" : "is-warning"
    },
    {
      lane: "Revenue",
      title: "Move value proof into pricing",
      detail: latestConversion ? latestConversion.closeAction || "Conversion record is active." : paidIntentSessions || conversionMrr ? "Paid intent exists. Capture plan, AED MRR, and close probability." : revenueEvidence ? `${revenueEvidence} revenue-proof ledger entr${revenueEvidence === 1 ? "y" : "ies"} saved.` : `Ask ${account} whether AED 199 pilot or AED 399 desk access is worth testing.`,
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion pipeline",
      owner: "Founder",
      passed: Boolean(latestConversion || paidIntentSessions || conversionMrr || revenueEvidence),
      className: latestConversion || paidIntentSessions || conversionMrr || revenueEvidence ? "is-good" : "is-warning"
    }
  ];
}

function openPilotValueNextProof() {
  const proof = makePilotValueProof();
  document.querySelector(proof.nextProof.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotValueResult(`Opened: ${proof.nextProof.title}.`, "neutral");
}

function prefillPilotValueConversion() {
  const proof = makePilotValueProof();
  if (state.pilotOutreachDrafts.length || state.pilotFollowups.length) {
    prefillPilotConversionFromPipeline();
  } else {
    if (els.pilotConversionAccount) els.pilotConversionAccount.value = proof.account;
    if (els.pilotConversionStage) els.pilotConversionStage.value = proof.score >= 65 ? "proposal" : "interested";
    if (els.pilotConversionPlan) els.pilotConversionPlan.value = proof.score >= 75 ? "aed-399" : "aed-199";
    if (els.pilotConversionProbability) els.pilotConversionProbability.value = proof.score >= 75 ? "60" : "40";
    if (els.pilotConversionMrr) els.pilotConversionMrr.value = proof.score >= 75 ? "399" : "199";
    if (els.pilotConversionNextDate && !els.pilotConversionNextDate.value) els.pilotConversionNextDate.value = makeLocalDateOffset(1);
    if (els.pilotConversionReply) els.pilotConversionReply.value = "pricing";
    if (els.pilotConversionBlocker) els.pilotConversionBlocker.value = "Needs value proof, second question, or official source confidence before paid pilot.";
    if (els.pilotConversionCloseAction) els.pilotConversionCloseAction.value = "Send value proof note, ask for paid pilot fit, and capture close probability.";
    if (els.pilotConversionNote) els.pilotConversionNote.value = proof.summary;
    flashPilotConversionResult("Value proof loaded into the conversion form.", "neutral");
  }
  document.querySelector("#pilot-conversion-pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotValueResult("Conversion form prepared from value proof.", "success");
}

async function copyPilotValueProof() {
  const copied = await copyTextToClipboard(makePilotValueProofMarkdown(makePilotValueProof()));
  flashPilotValueResult(copied ? "Pilot value proof copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPilotValueProof() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-value-proof-${date}.json`, JSON.stringify(makePilotValueProof(), null, 2), "application/json;charset=utf-8");
  flashPilotValueResult("Pilot value proof JSON exported.", "success");
}

function makePilotValueProofMarkdown(proof) {
  return [
    "# MajlisAlpha Pilot Value Proof",
    "",
    `Version: ${proof.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${proof.account}`,
    `Value proof score: ${proof.score}% (${proof.statusLabel})`,
    "",
    proof.summary,
    "",
    "## Value Cards",
    ...proof.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Proof Points",
    ...proof.proofPoints.map((point) => `- ${point.lane}: ${point.title} - ${point.detail}`),
    "",
    "## Metrics",
    ...Object.entries(proof.metrics).map(([key, value]) => `- ${key}: ${value}`),
    "",
    "_Pilot value proof is an operating summary for product and commercial decisions. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPilotValueResult(message, tone = "neutral") {
  if (!els.pilotValueResult) return;
  els.pilotValueResult.className = `builder-result is-${tone}`;
  els.pilotValueResult.textContent = message;
}

function renderPilotProofPacketBuilder() {
  if (!els.pilotProofPacketSummary || !els.pilotProofPacketGrid || !els.pilotProofPacketSections) return;
  const packet = makePilotProofPacket();
  window.MajlisAlphaPilotProofPacket = packet;
  if (els.openPilotProofPacketNext) {
    els.openPilotProofPacketNext.textContent = packet.nextAction.buttonLabel;
  }
  els.pilotProofPacketSummary.innerHTML = `
    <div class="pilot-proof-hero ${escapeAttr(packet.statusClass)}">
      <div>
        <span>${escapeHtml(packet.statusLabel)}</span>
        <strong>${escapeHtml(packet.headline)}</strong>
        <p>${escapeHtml(packet.summary)}</p>
      </div>
      <div class="pilot-proof-score">
        <span>Packet score</span>
        <strong>${escapeHtml(packet.score)}%</strong>
      </div>
    </div>
  `;
  els.pilotProofPacketGrid.innerHTML = packet.cards.map((card) => `
    <article class="pilot-proof-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.pilotProofPacketSections.innerHTML = packet.sections.map((section) => `
    <article class="pilot-proof-section-card ${escapeAttr(section.className)}">
      <span>${escapeHtml(section.lane)}</span>
      <strong>${escapeHtml(section.title)}</strong>
      <p>${escapeHtml(section.detail)}</p>
      <em>${escapeHtml(section.owner)}</em>
    </article>
  `).join("");
}

function makePilotProofPacket() {
  const proof = makePilotValueProof();
  const report = makePilotEvidenceReport();
  const entries = [...state.pilotEvidenceLedger];
  const counts = countPilotEvidenceTypes(entries);
  const requiredTypes = ["use-case", "source-proof", "repeat-proof", "output-proof", "workflow-proof", "revenue-proof"];
  const coveredTypes = requiredTypes.filter((type) => counts[type] > 0);
  const missingTypes = requiredTypes.filter((type) => !counts[type]);
  const verifiedEntries = entries.filter((entry) => entry.status === "verified");
  const strongest = entries.slice().sort((a, b) => b.impact - a.impact || (a.status === "verified" ? -1 : 1))[0] || null;
  const latestConversion = state.pilotConversions.find(isConversionOpen) || state.pilotConversions[0] || null;
  const latestOutreach = state.pilotOutreachDrafts[0] || null;
  const averageImpact = entries.length
    ? Math.round(entries.reduce((sum, entry) => sum + entry.impact, 0) / entries.length)
    : 0;
  const coverageScore = Math.round((coveredTypes.length / requiredTypes.length) * 100);
  const verifiedScore = Math.min(100, verifiedEntries.length * 25);
  const score = Math.round(proof.score * 0.45 + coverageScore * 0.3 + averageImpact * 0.15 + verifiedScore * 0.1);
  const account = proof.account || strongest?.account || latestConversion?.account || "Next UAE pilot account";
  const ready = score >= 75 && coveredTypes.length >= 4;
  const statusClass = ready ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = ready ? "Proof packet ready" : score >= 50 ? "Packet forming" : "Packet needs proof";
  const headline = ready
    ? "This proof packet can support a paid-pilot ask."
    : "Package more proof before making the commercial ask.";
  const ask = ready
    ? `Ask ${account} to choose AED 199 pilot, AED 399 desk access, or team review.`
    : missingTypes.length
      ? `Collect ${getPilotEvidenceTypeLabel(missingTypes[0]).toLowerCase()} before asking for payment.`
      : `Send the packet to ${account} and ask for the next commercial step.`;
  const cards = [
    makePilotProofPacketCard({
      label: "Account",
      passed: Boolean(account),
      value: account,
      detail: strongest?.title || proof.summary,
      status: strongest ? "evidence-linked" : "inferred"
    }),
    makePilotProofPacketCard({
      label: "Value proof",
      passed: proof.score >= 50,
      value: `${proof.score}%`,
      detail: proof.headline,
      status: proof.statusLabel
    }),
    makePilotProofPacketCard({
      label: "Ledger coverage",
      passed: coveredTypes.length >= 4,
      value: `${coveredTypes.length}/6`,
      detail: missingTypes.length ? `Missing: ${missingTypes.map(getPilotEvidenceTypeLabel).join(", ")}.` : "All proof lanes have ledger evidence.",
      status: missingTypes.length ? "gaps open" : "complete"
    }),
    makePilotProofPacketCard({
      label: "Strongest proof",
      passed: Boolean(strongest),
      value: strongest ? `${strongest.impact}%` : "None",
      detail: strongest ? strongest.title : "Save at least one ledger entry to anchor the packet.",
      status: strongest ? getPilotEvidenceStatusLabel(strongest.status) : "capture"
    }),
    makePilotProofPacketCard({
      label: "Verified proof",
      passed: verifiedEntries.length > 0,
      value: String(verifiedEntries.length),
      detail: verifiedEntries.length ? "At least one proof item has been marked verified." : "Mark source/customer-confirmed evidence as verified before stronger claims.",
      status: verifiedEntries.length ? "verified" : "review"
    }),
    makePilotProofPacketCard({
      label: "Commercial path",
      passed: Boolean(latestConversion || latestOutreach || ready),
      value: latestConversion ? getConversionStageLabel(latestConversion.stage) : latestOutreach ? getOutreachCtaLabel(latestOutreach.cta) : "Next ask",
      detail: latestConversion?.closeAction || latestOutreach?.nextAction || ask,
      status: latestConversion ? "pipeline" : latestOutreach ? "message" : "draft"
    })
  ];
  const sections = makePilotProofPacketSections({ proof, report, account, strongest, missingTypes, verifiedEntries, latestConversion, latestOutreach, ask, ready });
  const nextAction = sections.find((section) => !section.passed) || sections[sections.length - 1];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    account,
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `${entries.length} evidence entries, ${coveredTypes.length}/6 proof lanes, ${verifiedEntries.length} verified items, and ${proof.score}% value proof for ${account}.`,
    ask,
    nextAction,
    cards,
    sections,
    metrics: {
      valueProofScore: proof.score,
      packetScore: score,
      evidenceEntries: entries.length,
      coveredTypes: coveredTypes.length,
      verifiedEntries: verifiedEntries.length,
      averageImpact,
      missingTypes: missingTypes.map(getPilotEvidenceTypeLabel)
    },
    evidence: entries.slice(0, 12),
    valueProof: proof
  };
}

function makePilotProofPacketCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "capture" || status === "review" ? "is-error" : "is-warning"
  };
}

function makePilotProofPacketSections({ proof, report, account, strongest, missingTypes, verifiedEntries, latestConversion, latestOutreach, ask, ready }) {
  const missingText = missingTypes.length ? missingTypes.map(getPilotEvidenceTypeLabel).join(", ") : "No missing proof lane.";
  return [
    {
      lane: "Opening",
      title: "Lead with the user problem",
      detail: proof.cards.find((card) => card.label === "Use case")?.detail || `Frame the packet around ${account}'s real UAE market workflow.`,
      target: "#pilot-evidence-ledger",
      buttonLabel: "Open evidence ledger",
      owner: "Founder",
      passed: proof.cards.some((card) => card.label === "Use case" && card.passed),
      className: proof.cards.some((card) => card.label === "Use case" && card.passed) ? "is-good" : "is-warning"
    },
    {
      lane: "Proof",
      title: "Show the strongest evidence",
      detail: strongest ? `${strongest.title} (${getPilotEvidenceTypeLabel(strongest.type)}, ${strongest.impact}%).` : "Save one proof item so the packet has an anchor.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Add strongest proof",
      owner: "Research",
      passed: Boolean(strongest),
      className: strongest ? "is-good" : "is-error"
    },
    {
      lane: "Gaps",
      title: "Name what still needs proof",
      detail: missingTypes.length ? `Open proof lanes: ${missingText}.` : "All six proof lanes have at least one saved evidence item.",
      target: "#pilot-evidence-ledger",
      buttonLabel: missingTypes.length ? "Close proof gap" : "Review ledger",
      owner: "Founder",
      passed: missingTypes.length <= 2,
      className: missingTypes.length <= 2 ? "is-good" : "is-warning"
    },
    {
      lane: "Review",
      title: "Avoid overclaiming",
      detail: verifiedEntries.length ? `${verifiedEntries.length} item${verifiedEntries.length === 1 ? "" : "s"} verified. Keep unverified items framed as pilot signals.` : "Mark at least one source/customer-confirmed proof item as verified.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Verify proof",
      owner: "Research",
      passed: verifiedEntries.length > 0,
      className: verifiedEntries.length ? "is-good" : "is-error"
    },
    {
      lane: "Ask",
      title: "Make the next commercial ask",
      detail: ask,
      target: latestConversion ? "#pilot-conversion-pipeline" : "#pilot-outreach-composer",
      buttonLabel: latestConversion ? "Open conversion" : "Prefill outreach",
      owner: "Founder",
      passed: ready || Boolean(latestConversion || latestOutreach),
      className: ready || latestConversion || latestOutreach ? "is-good" : "is-warning"
    },
    {
      lane: "Packet",
      title: "Copy or export the packet",
      detail: `Packet score is ${Math.round(proof.score * 0.45 + (report.total ? 35 : 0))}%. Use copy for notes and export for a JSON trail.`,
      target: "#pilot-proof-packet",
      buttonLabel: "Copy proof packet",
      owner: "Operator",
      passed: proof.score >= 50 || report.total > 0,
      className: proof.score >= 50 || report.total > 0 ? "is-good" : "is-warning"
    }
  ];
}

function openPilotProofPacketNext() {
  const packet = makePilotProofPacket();
  document.querySelector(packet.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotProofPacketResult(`Opened: ${packet.nextAction.title}.`, "neutral");
}

function prefillProofPacketOutreach() {
  const packet = makePilotProofPacket();
  if (els.pilotOutreachAccount) els.pilotOutreachAccount.value = packet.account;
  if (els.pilotOutreachChannel) els.pilotOutreachChannel.value = "whatsapp";
  if (els.pilotOutreachTone) els.pilotOutreachTone.value = "warm";
  if (els.pilotOutreachOffer) els.pilotOutreachOffer.value = packet.score >= 75 ? "aed-399" : "aed-199";
  if (els.pilotOutreachEvidenceHook) {
    const strongest = packet.evidence[0];
    els.pilotOutreachEvidenceHook.value = strongest
      ? `${strongest.title}: ${strongest.note || getPilotEvidenceTypeLabel(strongest.type)}`
      : packet.summary;
  }
  if (els.pilotOutreachBlocker) {
    els.pilotOutreachBlocker.value = packet.metrics.missingTypes.length ? `Missing proof lanes: ${packet.metrics.missingTypes.join(", ")}.` : "Confirm pricing and rollout owner.";
  }
  if (els.pilotOutreachNextAction) els.pilotOutreachNextAction.value = packet.ask;
  if (els.pilotOutreachCta) els.pilotOutreachCta.value = packet.score >= 75 ? "paid-pilot" : "second-question";
  document.querySelector("#pilot-outreach-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotProofPacketResult("Proof packet loaded into the outreach composer.", "success");
}

async function copyPilotProofPacket() {
  const copied = await copyTextToClipboard(makePilotProofPacketMarkdown(makePilotProofPacket()));
  flashPilotProofPacketResult(copied ? "Pilot proof packet copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPilotProofPacket() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-proof-packet-${date}.json`, JSON.stringify(makePilotProofPacket(), null, 2), "application/json;charset=utf-8");
  flashPilotProofPacketResult("Pilot proof packet JSON exported.", "success");
}

function makePilotProofPacketMarkdown(packet) {
  return [
    "# MajlisAlpha Pilot Proof Packet",
    "",
    `Version: ${packet.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${packet.account}`,
    `Packet score: ${packet.score}% (${packet.statusLabel})`,
    "",
    packet.summary,
    "",
    "## Cards",
    ...packet.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Packet Sections",
    ...packet.sections.map((section) => `- ${section.lane}: ${section.title} - ${section.detail}`),
    "",
    "## Next Ask",
    packet.ask,
    "",
    "_Pilot proof packets are product and commercial operating notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPilotProofPacketResult(message, tone = "neutral") {
  if (!els.pilotProofPacketResult) return;
  els.pilotProofPacketResult.className = `builder-result is-${tone}`;
  els.pilotProofPacketResult.textContent = message;
}

function renderPilotCloseRoom() {
  if (!els.pilotCloseSummary || !els.pilotCloseGrid || !els.pilotCloseScripts) return;
  const closeRoom = makePilotCloseRoom();
  window.MajlisAlphaPilotCloseRoom = closeRoom;
  if (els.openPilotCloseNext) {
    els.openPilotCloseNext.textContent = closeRoom.nextAction.buttonLabel;
  }
  els.pilotCloseSummary.innerHTML = `
    <div class="pilot-close-hero ${escapeAttr(closeRoom.statusClass)}">
      <div>
        <span>${escapeHtml(closeRoom.statusLabel)}</span>
        <strong>${escapeHtml(closeRoom.headline)}</strong>
        <p>${escapeHtml(closeRoom.summary)}</p>
      </div>
      <div class="pilot-close-score">
        <span>Close odds</span>
        <strong>${escapeHtml(closeRoom.closeProbability)}%</strong>
      </div>
    </div>
  `;
  els.pilotCloseGrid.innerHTML = closeRoom.cards.map((card) => `
    <article class="pilot-close-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.pilotCloseScripts.innerHTML = closeRoom.scripts.map((script) => `
    <article class="pilot-close-script ${escapeAttr(script.className)}">
      <span>${escapeHtml(script.lane)}</span>
      <strong>${escapeHtml(script.title)}</strong>
      <p>${escapeHtml(script.detail)}</p>
      <em>${escapeHtml(script.owner)}</em>
    </article>
  `).join("");
}

function makePilotCloseRoom() {
  const packet = makePilotProofPacket();
  const proof = packet.valueProof || makePilotValueProof();
  const latestConversion = state.pilotConversions.find(isConversionOpen) || state.pilotConversions[0] || null;
  const latestOutreach = state.pilotOutreachDrafts[0] || null;
  const latestFollowup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0] || null;
  const verifiedEntries = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified");
  const evidenceEntries = state.pilotEvidenceLedger.length;
  const missingTypes = packet.metrics.missingTypes || [];
  const sourceConfidence = verifiedEntries.length ? "Verified evidence" : evidenceEntries ? "Captured evidence" : "Starter narrative";
  const account = packet.account || latestConversion?.account || latestOutreach?.account || latestFollowup?.account || "Next UAE pilot account";
  const plan = latestConversion?.plan && latestConversion.plan !== "discovery"
    ? latestConversion.plan
    : packet.score >= 78
      ? "aed-399"
      : packet.score >= 55
        ? "aed-199"
        : "discovery";
  const planLabel = getConversionPlanLabel(plan);
  const targetMrr = latestConversion?.mrr || getDefaultConversionMrr(plan);
  const objection = getPilotClosePrimaryObjection({ packet, latestConversion, latestOutreach, missingTypes, verifiedEntries });
  const proofLift = Math.min(12, verifiedEntries.length * 4 + Math.max(0, 3 - missingTypes.length) * 2);
  const motionLift = (latestOutreach ? 7 : 0) + (latestFollowup ? 5 : 0);
  const conversionLift = latestConversion ? Math.round(latestConversion.probability * 0.35) : 0;
  const closeProbability = Math.max(0, Math.min(95, Math.round(packet.score * 0.48 + proof.score * 0.18 + proofLift + motionLift + conversionLift)));
  const weightedMrr = Math.round(targetMrr * closeProbability / 100);
  const statusClass = closeProbability >= 70 ? "is-good" : closeProbability >= 45 ? "is-warning" : "is-error";
  const statusLabel = closeProbability >= 70 ? "Close motion ready" : closeProbability >= 45 ? "Close motion forming" : "Close motion needs proof";
  const headline = closeProbability >= 70
    ? "The paid-pilot ask is ready to make."
    : "Name the objection before asking for money.";
  const ask = closeProbability >= 70
    ? `Ask ${account} to confirm ${planLabel} and choose the first paid workflow.`
    : objection.key === "proof"
      ? `Collect ${missingTypes[0] || "one more proof lane"} before asking ${account} for ${planLabel}.`
      : `Resolve the ${objection.label.toLowerCase()} objection, then ask for ${planLabel}.`;
  const closeDate = latestConversion?.nextDate || makeLocalDateOffset(closeProbability >= 70 ? 1 : 2);
  const cards = [
    makePilotCloseCard({
      label: "Account",
      passed: Boolean(account),
      value: account,
      detail: packet.summary,
      status: latestConversion ? "pipeline" : latestOutreach ? "outreach" : "packet"
    }),
    makePilotCloseCard({
      label: "Paid ask",
      passed: plan !== "discovery",
      value: planLabel,
      detail: `Target weighted value is AED ${formatInteger(weightedMrr)} from AED ${formatInteger(targetMrr)} MRR.`,
      status: plan === "discovery" ? "discover" : "price"
    }),
    makePilotCloseCard({
      label: "Primary objection",
      passed: objection.key === "commercial" || objection.key === "pricing",
      value: objection.label,
      detail: objection.response,
      status: objection.key
    }),
    makePilotCloseCard({
      label: "Proof confidence",
      passed: verifiedEntries.length > 0 && missingTypes.length <= 2,
      value: sourceConfidence,
      detail: `${verifiedEntries.length} verified item${verifiedEntries.length === 1 ? "" : "s"} and ${missingTypes.length} open proof lane${missingTypes.length === 1 ? "" : "s"}.`,
      status: verifiedEntries.length ? "verified" : "review"
    }),
    makePilotCloseCard({
      label: "Next date",
      passed: Boolean(closeDate),
      value: closeDate,
      detail: latestConversion?.closeAction || latestOutreach?.nextAction || ask,
      status: latestConversion ? getConversionStageLabel(latestConversion.stage) : "scheduled"
    }),
    makePilotCloseCard({
      label: "Close memo",
      passed: closeProbability >= 45,
      value: `${closeProbability}%`,
      detail: closeProbability >= 70 ? "Use the close memo for the next paid-pilot conversation." : "Use the memo to close evidence, trust, and timing gaps first.",
      status: closeProbability >= 70 ? "send" : "tighten"
    })
  ];
  const scripts = makePilotCloseScripts({ packet, proof, account, planLabel, targetMrr, closeProbability, closeDate, objection, latestConversion, latestOutreach, verifiedEntries, missingTypes, ask });
  const nextAction = scripts.find((script) => !script.passed) || scripts[scripts.length - 1];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    account,
    plan,
    planLabel,
    closeProbability,
    targetMrr,
    weightedMrr,
    statusClass,
    statusLabel,
    headline,
    summary: `${account} has a ${closeProbability}% close signal for ${planLabel}. Objection: ${objection.label}. Next date: ${closeDate}.`,
    ask,
    objection,
    nextAction,
    cards,
    scripts,
    packet,
    proof
  };
}

function makePilotCloseCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "review" || status === "tighten" || status === "discover" ? "is-warning" : "is-error"
  };
}

function getPilotClosePrimaryObjection({ packet, latestConversion, latestOutreach, missingTypes, verifiedEntries }) {
  if (missingTypes.length > 2) {
    return {
      key: "proof",
      label: "Proof gap",
      response: `The packet still needs ${missingTypes.slice(0, 2).join(" and ")} before the paid ask is strong.`
    };
  }
  if (!verifiedEntries.length) {
    return {
      key: "trust",
      label: "Trust proof",
      response: "Mark at least one official-source or customer-confirmed proof item as verified."
    };
  }
  if (latestConversion?.reply === "source" || latestConversion?.stage === "source-review") {
    return {
      key: "source",
      label: "Source confidence",
      response: "Send the cited source trail first, then ask whether that resolves the trust blocker."
    };
  }
  if (latestConversion?.reply === "team") {
    return {
      key: "stakeholder",
      label: "Team buyer",
      response: "Move from single-user excitement to the team workflow, invoice owner, and review cadence."
    };
  }
  if (latestConversion?.reply === "pricing" || latestConversion?.stage === "proposal" || latestConversion?.stage === "paid-pilot") {
    return {
      key: "pricing",
      label: "Price confirmation",
      response: "Keep the ask small, specific, and tied to the next paid workflow."
    };
  }
  if (!latestOutreach && !latestConversion) {
    return {
      key: "followup",
      label: "No close message",
      response: "Send the packet with a clear paid-pilot or second-question ask before judging demand."
    };
  }
  if (packet.score < 60) {
    return {
      key: "value",
      label: "Value clarity",
      response: "Tighten the use case and strongest proof before moving from interest to price."
    };
  }
  return {
    key: "commercial",
    label: "Commercial next step",
    response: "The objection is manageable. Ask for the paid lane, decision owner, and first workflow."
  };
}

function makePilotCloseScripts({ packet, proof, account, planLabel, targetMrr, closeProbability, closeDate, objection, latestConversion, latestOutreach, verifiedEntries, missingTypes, ask }) {
  return [
    {
      lane: "Close frame",
      title: "Open with the value already proven",
      detail: `${proof.headline} Use the exact packet score (${packet.score}%) before discussing ${planLabel}.`,
      target: "#pilot-proof-packet",
      buttonLabel: "Open proof packet",
      owner: "Founder",
      passed: packet.score >= 55,
      className: packet.score >= 55 ? "is-good" : "is-warning"
    },
    {
      lane: "Objection",
      title: `Handle ${objection.label.toLowerCase()}`,
      detail: objection.response,
      target: objection.key === "proof" || objection.key === "trust" || objection.key === "source" ? "#pilot-evidence-ledger" : "#pilot-outreach-composer",
      buttonLabel: objection.key === "proof" || objection.key === "trust" || objection.key === "source" ? "Open evidence" : "Open outreach",
      owner: "Founder",
      passed: ["pricing", "commercial"].includes(objection.key),
      className: ["pricing", "commercial"].includes(objection.key) ? "is-good" : "is-warning"
    },
    {
      lane: "Evidence",
      title: "Attach one source-backed proof line",
      detail: verifiedEntries.length ? `${verifiedEntries[0].title}: ${verifiedEntries[0].note || getPilotEvidenceTypeLabel(verifiedEntries[0].type)}` : "Do not overclaim. Attach verified proof before sending stronger commercial language.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Verify proof",
      owner: "Research",
      passed: verifiedEntries.length > 0,
      className: verifiedEntries.length ? "is-good" : "is-error"
    },
    {
      lane: "Offer",
      title: "Make the paid step small and named",
      detail: targetMrr ? `${planLabel} at AED ${formatInteger(targetMrr)} MRR. Tie it to one workflow and one review date.` : "Keep this in discovery until the next use case and proof line are captured.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Prefill conversion",
      owner: "Founder",
      passed: targetMrr > 0 && closeProbability >= 45,
      className: targetMrr > 0 && closeProbability >= 45 ? "is-good" : "is-warning"
    },
    {
      lane: "Decision path",
      title: "Name the buyer and next date",
      detail: latestConversion?.closeAction || latestOutreach?.nextAction || `Ask ${account} who signs off and whether ${closeDate} works for the paid-pilot decision.`,
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion",
      owner: "Founder",
      passed: Boolean(latestConversion?.nextDate || latestOutreach),
      className: latestConversion?.nextDate || latestOutreach ? "is-good" : "is-warning"
    },
    {
      lane: "Close memo",
      title: "Copy the next commercial ask",
      detail: missingTypes.length > 2 ? `Do not push hard yet. Missing proof lanes: ${missingTypes.join(", ")}.` : ask,
      target: "#pilot-close-room",
      buttonLabel: "Copy close memo",
      owner: "Operator",
      passed: closeProbability >= 45,
      className: closeProbability >= 45 ? "is-good" : "is-warning"
    }
  ];
}

function openPilotCloseNext() {
  const closeRoom = makePilotCloseRoom();
  document.querySelector(closeRoom.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotCloseResult(`Opened: ${closeRoom.nextAction.title}.`, "neutral");
}

function prefillPilotCloseConversion() {
  const closeRoom = makePilotCloseRoom();
  if (els.pilotConversionAccount) els.pilotConversionAccount.value = closeRoom.account;
  if (els.pilotConversionStage) els.pilotConversionStage.value = closeRoom.closeProbability >= 70 ? "proposal" : "interested";
  if (els.pilotConversionPlan) els.pilotConversionPlan.value = closeRoom.plan;
  if (els.pilotConversionProbability) els.pilotConversionProbability.value = String(closeRoom.closeProbability);
  if (els.pilotConversionMrr) els.pilotConversionMrr.value = String(closeRoom.targetMrr || getDefaultConversionMrr(closeRoom.plan));
  if (els.pilotConversionNextDate && !els.pilotConversionNextDate.value) els.pilotConversionNextDate.value = makeLocalDateOffset(closeRoom.closeProbability >= 70 ? 1 : 2);
  if (els.pilotConversionReply) els.pilotConversionReply.value = closeRoom.objection.key === "source" ? "source" : closeRoom.objection.key === "pricing" ? "pricing" : "positive";
  if (els.pilotConversionBlocker) els.pilotConversionBlocker.value = `${closeRoom.objection.label}: ${closeRoom.objection.response}`;
  if (els.pilotConversionCloseAction) els.pilotConversionCloseAction.value = closeRoom.ask;
  if (els.pilotConversionNote) els.pilotConversionNote.value = closeRoom.summary;
  document.querySelector("#pilot-conversion-pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPilotCloseResult("Close room loaded into the conversion pipeline.", "success");
}

async function copyPilotCloseRoom() {
  const copied = await copyTextToClipboard(makePilotCloseRoomMarkdown(makePilotCloseRoom()));
  flashPilotCloseResult(copied ? "Pilot close memo copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPilotCloseRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-pilot-close-room-${date}.json`, JSON.stringify(makePilotCloseRoom(), null, 2), "application/json;charset=utf-8");
  flashPilotCloseResult("Pilot close room JSON exported.", "success");
}

function makePilotCloseRoomMarkdown(closeRoom) {
  return [
    "# MajlisAlpha Pilot Close Room",
    "",
    `Version: ${closeRoom.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${closeRoom.account}`,
    `Close odds: ${closeRoom.closeProbability}% (${closeRoom.statusLabel})`,
    `Paid ask: ${closeRoom.planLabel}`,
    "",
    closeRoom.summary,
    "",
    "## Cards",
    ...closeRoom.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Close Scripts",
    ...closeRoom.scripts.map((script) => `- ${script.lane}: ${script.title} - ${script.detail}`),
    "",
    "## Next Ask",
    closeRoom.ask,
    "",
    "_Pilot close notes are product and commercial operating notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPilotCloseResult(message, tone = "neutral") {
  if (!els.pilotCloseResult) return;
  els.pilotCloseResult.className = `builder-result is-${tone}`;
  els.pilotCloseResult.textContent = message;
}

function renderPaidPilotDeliveryBoard() {
  if (!els.paidDeliverySummary || !els.paidDeliveryGrid || !els.paidDeliveryTimeline) return;
  const board = makePaidPilotDeliveryBoard();
  window.MajlisAlphaPaidPilotDelivery = board;
  if (els.openPaidDeliveryNext) {
    els.openPaidDeliveryNext.textContent = board.nextAction.buttonLabel;
  }
  els.paidDeliverySummary.innerHTML = `
    <div class="paid-delivery-hero ${escapeAttr(board.statusClass)}">
      <div>
        <span>${escapeHtml(board.statusLabel)}</span>
        <strong>${escapeHtml(board.headline)}</strong>
        <p>${escapeHtml(board.summary)}</p>
      </div>
      <div class="paid-delivery-score">
        <span>Delivery score</span>
        <strong>${escapeHtml(board.score)}%</strong>
      </div>
    </div>
  `;
  els.paidDeliveryGrid.innerHTML = board.cards.map((card) => `
    <article class="paid-delivery-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.paidDeliveryTimeline.innerHTML = board.timeline.map((item) => `
    <article class="paid-delivery-step ${escapeAttr(item.className)}">
      <span>${escapeHtml(item.day)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.detail)}</p>
      <em>${escapeHtml(item.owner)}</em>
    </article>
  `).join("");
}

function makePaidPilotDeliveryBoard() {
  const closeRoom = makePilotCloseRoom();
  const latestConversion = state.pilotConversions.find(isConversionOpen) || state.pilotConversions[0] || null;
  const paidConversion = state.pilotConversions.find((deal) => ["paid-pilot", "won"].includes(deal.stage)) || null;
  const latestFollowup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0] || null;
  const verifiedEntries = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified");
  const sourceRecords = state.sourcePackDocs.length + state.uploadedDocs.length;
  const firstPaidBrief = Boolean(state.lastBrief && state.currentCitations.length);
  const account = closeRoom.account || latestConversion?.account || "Next UAE pilot account";
  const plan = closeRoom.plan || latestConversion?.plan || "discovery";
  const planLabel = closeRoom.planLabel || getConversionPlanLabel(plan);
  const targetMrr = closeRoom.targetMrr || latestConversion?.mrr || getDefaultConversionMrr(plan);
  const paidSignal = Boolean(paidConversion || latestConversion?.stage === "paid-pilot" || latestFollowup?.stage === "paid-pilot");
  const scopeReady = closeRoom.closeProbability >= 60 || Boolean(latestConversion?.closeAction);
  const invoiceReady = paidSignal || targetMrr > 0 && closeRoom.closeProbability >= 70;
  const kickoffReady = Boolean(latestFollowup || state.pilotSessions.length);
  const sourceReady = sourceRecords > 0 || verifiedEntries.length > 0;
  const reviewReady = Boolean(latestFollowup?.nextDate || latestConversion?.nextDate);
  const renewalReady = Boolean(paidSignal && (state.pilotEvidenceLedger.some((entry) => entry.type === "revenue-proof") || latestConversion?.stage === "won"));
  const score = Math.min(100, Math.round(
    closeRoom.closeProbability * 0.28
    + (paidSignal ? 18 : 0)
    + (scopeReady ? 12 : 0)
    + (invoiceReady ? 12 : 0)
    + (kickoffReady ? 10 : 0)
    + (sourceReady ? 10 : 0)
    + (firstPaidBrief ? 10 : 0)
    + (reviewReady ? 8 : 0)
    + (renewalReady ? 8 : 0)
  ));
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Delivery motion ready" : score >= 50 ? "Delivery motion forming" : "Delivery motion needs setup";
  const headline = score >= 75
    ? "The paid pilot has a delivery path."
    : "Close the delivery gaps before the paid pilot starts.";
  const summary = `${account} delivery is ${score}% ready for ${planLabel}. Scope ${scopeReady ? "exists" : "needs definition"}, invoice ${invoiceReady ? "has a lane" : "needs a paid step"}, and first paid brief ${firstPaidBrief ? "is available" : "still needs a run"}.`;
  const cards = [
    makePaidDeliveryCard({
      label: "Account",
      passed: Boolean(account),
      value: account,
      detail: closeRoom.summary,
      status: paidSignal ? "paid" : "prepaid"
    }),
    makePaidDeliveryCard({
      label: "Paid lane",
      passed: invoiceReady,
      value: planLabel,
      detail: targetMrr ? `Target MRR is AED ${formatInteger(targetMrr)}.` : "Keep discovery until price and scope are named.",
      status: invoiceReady ? "invoice lane" : "price gap"
    }),
    makePaidDeliveryCard({
      label: "Scope",
      passed: scopeReady,
      value: scopeReady ? "Named" : "Open",
      detail: latestConversion?.closeAction || closeRoom.ask,
      status: scopeReady ? "defined" : "scope gap"
    }),
    makePaidDeliveryCard({
      label: "Sources",
      passed: sourceReady,
      value: `${sourceRecords} packs / ${verifiedEntries.length} verified`,
      detail: sourceReady ? "Delivery can cite saved source or verified evidence." : "Attach one official source or verified proof item before delivery.",
      status: sourceReady ? "source-ready" : "source gap"
    }),
    makePaidDeliveryCard({
      label: "First paid brief",
      passed: firstPaidBrief,
      value: firstPaidBrief ? "Ready" : "Not run",
      detail: firstPaidBrief ? "Current answer and citations can be used as the first delivery artifact." : "Run one paid-pilot question and export the brief.",
      status: firstPaidBrief ? "artifact" : "brief gap"
    }),
    makePaidDeliveryCard({
      label: "Renewal path",
      passed: renewalReady || reviewReady,
      value: renewalReady ? "Expansion" : reviewReady ? "Review set" : "Unset",
      detail: renewalReady ? "Revenue proof or won stage exists." : reviewReady ? "A review date exists; use it to test renewal or expansion." : "Schedule the first review before the delivery starts.",
      status: renewalReady ? "expand" : reviewReady ? "review" : "renewal gap"
    })
  ];
  const timeline = makePaidDeliveryTimeline({ account, planLabel, targetMrr, closeRoom, latestConversion, latestFollowup, paidSignal, scopeReady, invoiceReady, kickoffReady, sourceReady, firstPaidBrief, reviewReady, renewalReady });
  const nextAction = timeline.find((item) => !item.passed) || timeline[timeline.length - 1];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    account,
    plan,
    planLabel,
    targetMrr,
    score,
    statusClass,
    statusLabel,
    headline,
    summary,
    nextAction,
    cards,
    timeline,
    closeRoom,
    metrics: {
      paidSignal,
      scopeReady,
      invoiceReady,
      kickoffReady,
      sourceReady,
      firstPaidBrief,
      reviewReady,
      renewalReady,
      sourceRecords,
      verifiedEntries: verifiedEntries.length
    }
  };
}

function makePaidDeliveryCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status.includes("gap") ? "is-error" : "is-warning"
  };
}

function makePaidDeliveryTimeline({ account, planLabel, targetMrr, closeRoom, latestConversion, latestFollowup, paidSignal, scopeReady, invoiceReady, kickoffReady, sourceReady, firstPaidBrief, reviewReady, renewalReady }) {
  return [
    {
      day: "Day 0",
      title: "Confirm paid scope",
      detail: scopeReady ? latestConversion?.closeAction || closeRoom.ask : `Define the first paid workflow for ${account} before delivery starts.`,
      target: "#pilot-close-room",
      buttonLabel: "Open close room",
      owner: "Founder",
      passed: scopeReady,
      className: scopeReady ? "is-good" : "is-warning"
    },
    {
      day: "Day 0",
      title: "Set invoice or paid lane",
      detail: invoiceReady ? `${planLabel}${targetMrr ? ` at AED ${formatInteger(targetMrr)} MRR` : ""}.` : "Confirm AED 199, AED 399, or team invoice before calling this paid.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Prefill conversion",
      owner: "Founder",
      passed: invoiceReady,
      className: invoiceReady ? "is-good" : "is-error"
    },
    {
      day: "Day 1",
      title: "Run kickoff question",
      detail: kickoffReady ? latestFollowup?.nextAction || "Kickoff motion exists." : "Schedule the first paid-pilot question and owner.",
      target: "#pilot-followup-board",
      buttonLabel: "Prefill follow-up",
      owner: "Operator",
      passed: kickoffReady,
      className: kickoffReady ? "is-good" : "is-warning"
    },
    {
      day: "Day 1-2",
      title: "Attach source spine",
      detail: sourceReady ? "Source or verified evidence exists for delivery." : "Add one official source, customer-approved document, or verified evidence entry.",
      target: "#source-workspace",
      buttonLabel: "Open workspace",
      owner: "Research",
      passed: sourceReady,
      className: sourceReady ? "is-good" : "is-error"
    },
    {
      day: "Day 2",
      title: "Deliver first paid brief",
      detail: firstPaidBrief ? "A current answer can be copied or exported as the first paid artifact." : "Run the first paid question, then export PDF or Markdown.",
      target: "#desk",
      buttonLabel: "Open desk",
      owner: "Research",
      passed: firstPaidBrief,
      className: firstPaidBrief ? "is-good" : "is-warning"
    },
    {
      day: "Day 7",
      title: "Schedule renewal review",
      detail: renewalReady ? "Expansion proof exists; prepare renewal or team-access ask." : reviewReady ? "Review date exists; use it for renewal proof." : "Set a review date and define the renewal signal.",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up",
      owner: "Founder",
      passed: renewalReady || reviewReady,
      className: renewalReady ? "is-good" : reviewReady ? "is-warning" : "is-error"
    }
  ];
}

function openPaidDeliveryNext() {
  const board = makePaidPilotDeliveryBoard();
  document.querySelector(board.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPaidDeliveryResult(`Opened: ${board.nextAction.title}.`, "neutral");
}

function prefillPaidDeliveryFollowup() {
  const board = makePaidPilotDeliveryBoard();
  if (els.pilotFollowupAccount) els.pilotFollowupAccount.value = board.account;
  if (els.pilotFollowupStage) els.pilotFollowupStage.value = board.metrics.paidSignal ? "paid-pilot" : board.score >= 65 ? "proposal-sent" : "demo-done";
  if (els.pilotFollowupPriority) els.pilotFollowupPriority.value = board.score >= 70 ? "Medium" : "High";
  if (els.pilotFollowupNextDate && !els.pilotFollowupNextDate.value) els.pilotFollowupNextDate.value = makeLocalDateOffset(1);
  if (els.pilotFollowupOffer) els.pilotFollowupOffer.value = board.plan === "discovery" ? "need-discovery" : board.plan;
  if (els.pilotFollowupBlocker) els.pilotFollowupBlocker.value = board.nextAction.passed ? "No delivery blocker open. Prepare first paid review." : board.nextAction.detail;
  if (els.pilotFollowupNextAction) els.pilotFollowupNextAction.value = `Paid pilot delivery next step: ${board.nextAction.title}. ${board.nextAction.detail}`;
  if (els.pilotFollowupSessionNote) els.pilotFollowupSessionNote.value = board.summary;
  document.querySelector("#pilot-followup-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashPaidDeliveryResult("Delivery plan loaded into the follow-up board.", "success");
}

async function copyPaidDeliveryBoard() {
  const copied = await copyTextToClipboard(makePaidDeliveryMarkdown(makePaidPilotDeliveryBoard()));
  flashPaidDeliveryResult(copied ? "Paid pilot delivery plan copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportPaidDeliveryBoard() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-paid-pilot-delivery-${date}.json`, JSON.stringify(makePaidPilotDeliveryBoard(), null, 2), "application/json;charset=utf-8");
  flashPaidDeliveryResult("Paid pilot delivery JSON exported.", "success");
}

function makePaidDeliveryMarkdown(board) {
  return [
    "# MajlisAlpha Paid Pilot Delivery Board",
    "",
    `Version: ${board.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${board.account}`,
    `Delivery score: ${board.score}% (${board.statusLabel})`,
    `Paid lane: ${board.planLabel}`,
    "",
    board.summary,
    "",
    "## Cards",
    ...board.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Delivery Timeline",
    ...board.timeline.map((item) => `- ${item.day}: ${item.title} - ${item.detail}`),
    "",
    "## Next Action",
    `${board.nextAction.title}: ${board.nextAction.detail}`,
    "",
    "_Paid pilot delivery notes are product and commercial operating notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashPaidDeliveryResult(message, tone = "neutral") {
  if (!els.paidDeliveryResult) return;
  els.paidDeliveryResult.className = `builder-result is-${tone}`;
  els.paidDeliveryResult.textContent = message;
}

function renderRenewalExpansionBoard() {
  if (!els.renewalExpansionSummary || !els.renewalExpansionGrid || !els.renewalExpansionPlays) return;
  const board = makeRenewalExpansionBoard();
  window.MajlisAlphaRenewalExpansion = board;
  if (els.openRenewalExpansionNext) {
    els.openRenewalExpansionNext.textContent = board.nextAction.buttonLabel;
  }
  els.renewalExpansionSummary.innerHTML = `
    <div class="renewal-expansion-hero ${escapeAttr(board.statusClass)}">
      <div>
        <span>${escapeHtml(board.statusLabel)}</span>
        <strong>${escapeHtml(board.headline)}</strong>
        <p>${escapeHtml(board.summary)}</p>
      </div>
      <div class="renewal-expansion-score">
        <span>Renewal score</span>
        <strong>${escapeHtml(board.score)}%</strong>
      </div>
    </div>
  `;
  els.renewalExpansionGrid.innerHTML = board.cards.map((card) => `
    <article class="renewal-expansion-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.renewalExpansionPlays.innerHTML = board.plays.map((play) => `
    <article class="renewal-expansion-play ${escapeAttr(play.className)}">
      <span>${escapeHtml(play.lane)}</span>
      <strong>${escapeHtml(play.title)}</strong>
      <p>${escapeHtml(play.detail)}</p>
      <em>${escapeHtml(play.owner)}</em>
    </article>
  `).join("");
}

function makeRenewalExpansionBoard() {
  const delivery = makePaidPilotDeliveryBoard();
  const closeRoom = delivery.closeRoom || makePilotCloseRoom();
  const latestConversion = state.pilotConversions.find(isConversionOpen) || state.pilotConversions[0] || null;
  const latestFollowup = state.pilotFollowups.find((item) => item.stage !== "closed-lost") || state.pilotFollowups[0] || null;
  const revenueEvidence = state.pilotEvidenceLedger.filter((entry) => entry.type === "revenue-proof").length;
  const repeatEvidence = state.pilotEvidenceLedger.filter((entry) => entry.type === "repeat-proof").length;
  const outputEvidence = state.pilotEvidenceLedger.filter((entry) => entry.type === "output-proof").length;
  const verifiedEntries = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const teamSignal = Boolean(latestConversion?.plan === "team-invoice" || latestConversion?.reply === "team" || state.pilotOutreachDrafts.some((draft) => draft.cta === "team-demo"));
  const paidSignal = delivery.metrics.paidSignal || latestConversion?.stage === "paid-pilot" || latestConversion?.stage === "won";
  const churnRisk = getRenewalChurnRisk({ delivery, closeRoom, latestConversion, latestFollowup, verifiedEntries, repeatEvidence, outputEvidence });
  const expansionMrr = latestConversion?.plan === "team-invoice"
    ? Math.max(latestConversion.mrr || 0, 1200)
    : latestConversion?.plan === "aed-399"
      ? Math.max(latestConversion.mrr || 0, 399)
      : Math.max(delivery.targetMrr || 0, 199);
  const account = delivery.account || closeRoom.account || "Next UAE pilot account";
  const renewalSignal = paidSignal || delivery.score >= 72 || (repeatEvidence && outputEvidence);
  const expansionSignal = teamSignal || delivery.score >= 82 || revenueEvidence > 0;
  const score = Math.max(0, Math.min(100, Math.round(
    delivery.score * 0.36
    + closeRoom.closeProbability * 0.18
    + (paidSignal ? 14 : 0)
    + (repeatEvidence ? 10 : 0)
    + (outputEvidence ? 8 : 0)
    + (verifiedEntries ? 8 : 0)
    + (revenueEvidence ? 8 : 0)
    + (teamSignal ? 8 : 0)
    - churnRisk.penalty
  )));
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Renewal motion ready" : score >= 50 ? "Expansion proof forming" : "Renewal needs rescue";
  const headline = score >= 75
    ? "The paid pilot can move toward renewal or expansion."
    : "Use the next proof cycle to protect the account.";
  const nextAsk = expansionSignal
    ? `Ask ${account} whether the next step is team access at AED ${formatInteger(expansionMrr)} or a renewal review.`
    : renewalSignal
      ? `Ask ${account} to renew the current paid lane after one more source-backed brief.`
      : `Rescue ${account} with one clear source-backed workflow before discussing renewal.`;
  const cards = [
    makeRenewalExpansionCard({
      label: "Account",
      passed: Boolean(account),
      value: account,
      detail: delivery.summary,
      status: paidSignal ? "paid" : "pilot"
    }),
    makeRenewalExpansionCard({
      label: "Renewal signal",
      passed: renewalSignal,
      value: renewalSignal ? "Active" : "Weak",
      detail: renewalSignal ? "Paid signal, delivery score, or repeat proof supports renewal." : "Capture repeat usage or a second paid deliverable before renewal.",
      status: renewalSignal ? "renew" : "rescue"
    }),
    makeRenewalExpansionCard({
      label: "Expansion path",
      passed: expansionSignal,
      value: expansionSignal ? "Team / higher lane" : "Current lane",
      detail: expansionSignal ? `Expansion target can be AED ${formatInteger(expansionMrr)}.` : "Stay with current paid lane until team or revenue proof appears.",
      status: expansionSignal ? "expand" : "hold"
    }),
    makeRenewalExpansionCard({
      label: "Usage proof",
      passed: repeatEvidence > 0 || outputEvidence > 0,
      value: `${repeatEvidence} repeat / ${outputEvidence} output`,
      detail: repeatEvidence || outputEvidence ? "Usage proof exists in the evidence ledger." : "Save repeat behavior or output proof before asking for renewal.",
      status: repeatEvidence || outputEvidence ? "proof" : "usage gap"
    }),
    makeRenewalExpansionCard({
      label: "Trust spine",
      passed: verifiedEntries > 0 || delivery.metrics.sourceReady,
      value: `${verifiedEntries} verified`,
      detail: verifiedEntries ? "Verified evidence exists for renewal conversations." : "Attach one verified source or evidence item before expansion.",
      status: verifiedEntries ? "trusted" : "trust gap"
    }),
    makeRenewalExpansionCard({
      label: "Churn risk",
      passed: churnRisk.level !== "High",
      value: churnRisk.level,
      detail: churnRisk.detail,
      status: churnRisk.level === "Low" ? "stable" : churnRisk.level === "Medium" ? "watch" : "rescue"
    })
  ];
  const plays = makeRenewalExpansionPlays({ account, delivery, closeRoom, churnRisk, renewalSignal, expansionSignal, expansionMrr, repeatEvidence, outputEvidence, verifiedEntries, revenueEvidence, nextAsk });
  const nextAction = plays.find((play) => !play.passed) || plays[plays.length - 1];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    account,
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `${account} renewal score is ${score}%. Churn risk is ${churnRisk.level}. ${nextAsk}`,
    nextAsk,
    churnRisk,
    expansionMrr,
    nextAction,
    cards,
    plays,
    delivery,
    closeRoom,
    metrics: {
      renewalSignal,
      expansionSignal,
      paidSignal,
      repeatEvidence,
      outputEvidence,
      revenueEvidence,
      verifiedEntries,
      teamSignal
    }
  };
}

function makeRenewalExpansionCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status.includes("gap") || status === "rescue" ? "is-error" : "is-warning"
  };
}

function getRenewalChurnRisk({ delivery, closeRoom, latestConversion, latestFollowup, verifiedEntries, repeatEvidence, outputEvidence }) {
  const hasSchedule = Boolean(latestConversion?.nextDate || latestFollowup?.nextDate);
  const hasProof = verifiedEntries > 0 || outputEvidence > 0;
  const hasUsage = repeatEvidence > 0 || delivery.metrics.firstPaidBrief;
  if (delivery.score < 45 || closeRoom.closeProbability < 35) {
    return { level: "High", penalty: 16, detail: "Delivery and close signals are both weak. Rescue the account before renewal talk." };
  }
  if (!hasProof || !hasSchedule) {
    return { level: "Medium", penalty: 8, detail: "The account needs a verified proof line and a dated review." };
  }
  if (!hasUsage) {
    return { level: "Medium", penalty: 6, detail: "Proof exists, but repeat usage or first paid artifact is still light." };
  }
  return { level: "Low", penalty: 0, detail: "Usage, proof, and review motion are in place." };
}

function makeRenewalExpansionPlays({ account, delivery, closeRoom, churnRisk, renewalSignal, expansionSignal, expansionMrr, repeatEvidence, outputEvidence, verifiedEntries, revenueEvidence, nextAsk }) {
  return [
    {
      lane: "Renew",
      title: "Ask for renewal only after proof",
      detail: renewalSignal ? nextAsk : "Deliver one more source-backed paid brief before renewal language.",
      target: renewalSignal ? "#pilot-followup-board" : "#paid-pilot-delivery",
      buttonLabel: renewalSignal ? "Prefill follow-up" : "Open delivery",
      owner: "Founder",
      passed: renewalSignal,
      className: renewalSignal ? "is-good" : "is-warning"
    },
    {
      lane: "Expand",
      title: "Name the team-access path",
      detail: expansionSignal ? `Expansion ask can test AED ${formatInteger(expansionMrr)} or team invoice.` : "Do not expand yet. Capture team buyer, second user, or revenue proof first.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion",
      owner: "Founder",
      passed: expansionSignal,
      className: expansionSignal ? "is-good" : "is-warning"
    },
    {
      lane: "Usage",
      title: "Show repeat behavior",
      detail: repeatEvidence ? `${repeatEvidence} repeat-proof ledger item${repeatEvidence === 1 ? "" : "s"} saved.` : "Ask for the next real UAE market question and save repeat proof.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Open ledger",
      owner: "Operator",
      passed: repeatEvidence > 0,
      className: repeatEvidence ? "is-good" : "is-error"
    },
    {
      lane: "Artifact",
      title: "Attach a renewal artifact",
      detail: outputEvidence || delivery.metrics.firstPaidBrief ? "A shareable output can anchor the renewal conversation." : "Run one paid-pilot answer and export the brief.",
      target: "#desk",
      buttonLabel: "Open desk",
      owner: "Research",
      passed: outputEvidence > 0 || delivery.metrics.firstPaidBrief,
      className: outputEvidence || delivery.metrics.firstPaidBrief ? "is-good" : "is-warning"
    },
    {
      lane: "Trust",
      title: "Keep source confidence visible",
      detail: verifiedEntries ? `${verifiedEntries} verified proof item${verifiedEntries === 1 ? "" : "s"} support renewal.` : "Verify one evidence item before asking for expansion.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Verify proof",
      owner: "Research",
      passed: verifiedEntries > 0,
      className: verifiedEntries ? "is-good" : "is-error"
    },
    {
      lane: "Rescue",
      title: "Handle churn risk before expansion",
      detail: churnRisk.level === "High" ? churnRisk.detail : revenueEvidence ? "Revenue proof exists; prepare expansion or renewal." : "Schedule the next review and ask what would make the account renew.",
      target: churnRisk.level === "High" ? "#paid-pilot-delivery" : "#pilot-followup-board",
      buttonLabel: churnRisk.level === "High" ? "Open delivery" : "Prefill follow-up",
      owner: "Founder",
      passed: churnRisk.level !== "High",
      className: churnRisk.level === "High" ? "is-error" : churnRisk.level === "Medium" ? "is-warning" : "is-good"
    }
  ];
}

function openRenewalExpansionNext() {
  const board = makeRenewalExpansionBoard();
  document.querySelector(board.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashRenewalExpansionResult(`Opened: ${board.nextAction.title}.`, "neutral");
}

function prefillRenewalExpansionFollowup() {
  const board = makeRenewalExpansionBoard();
  if (els.pilotFollowupAccount) els.pilotFollowupAccount.value = board.account;
  if (els.pilotFollowupStage) els.pilotFollowupStage.value = board.metrics.expansionSignal ? "proposal-sent" : board.metrics.renewalSignal ? "paid-pilot" : "demo-done";
  if (els.pilotFollowupPriority) els.pilotFollowupPriority.value = board.churnRisk.level === "High" ? "High" : "Medium";
  if (els.pilotFollowupNextDate && !els.pilotFollowupNextDate.value) els.pilotFollowupNextDate.value = makeLocalDateOffset(board.churnRisk.level === "High" ? 1 : 3);
  if (els.pilotFollowupOffer) els.pilotFollowupOffer.value = board.metrics.expansionSignal ? "team-invoice" : board.delivery.plan === "discovery" ? "need-discovery" : board.delivery.plan;
  if (els.pilotFollowupBlocker) els.pilotFollowupBlocker.value = `${board.churnRisk.level} churn risk: ${board.churnRisk.detail}`;
  if (els.pilotFollowupNextAction) els.pilotFollowupNextAction.value = board.nextAsk;
  if (els.pilotFollowupSessionNote) els.pilotFollowupSessionNote.value = board.summary;
  document.querySelector("#pilot-followup-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashRenewalExpansionResult("Renewal plan loaded into the follow-up board.", "success");
}

async function copyRenewalExpansionBoard() {
  const copied = await copyTextToClipboard(makeRenewalExpansionMarkdown(makeRenewalExpansionBoard()));
  flashRenewalExpansionResult(copied ? "Renewal and expansion plan copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportRenewalExpansionBoard() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-renewal-expansion-${date}.json`, JSON.stringify(makeRenewalExpansionBoard(), null, 2), "application/json;charset=utf-8");
  flashRenewalExpansionResult("Renewal and expansion JSON exported.", "success");
}

function makeRenewalExpansionMarkdown(board) {
  return [
    "# MajlisAlpha Renewal & Expansion Board",
    "",
    `Version: ${board.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Account: ${board.account}`,
    `Renewal score: ${board.score}% (${board.statusLabel})`,
    `Churn risk: ${board.churnRisk.level}`,
    "",
    board.summary,
    "",
    "## Cards",
    ...board.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Plays",
    ...board.plays.map((play) => `- ${play.lane}: ${play.title} - ${play.detail}`),
    "",
    "## Next Ask",
    board.nextAsk,
    "",
    "_Renewal and expansion notes are product and commercial operating notes. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashRenewalExpansionResult(message, tone = "neutral") {
  if (!els.renewalExpansionResult) return;
  els.renewalExpansionResult.className = `builder-result is-${tone}`;
  els.renewalExpansionResult.textContent = message;
}

function renderAccountHealthCommandCenter() {
  if (!els.accountHealthSummary || !els.accountHealthGrid || !els.accountHealthRows) return;
  const command = makeAccountHealthCommandCenter();
  window.MajlisAlphaAccountHealth = command;
  if (els.openAccountHealthNext) {
    els.openAccountHealthNext.textContent = command.nextAction.buttonLabel;
  }
  els.accountHealthSummary.innerHTML = `
    <div class="account-health-hero ${escapeAttr(command.statusClass)}">
      <div>
        <span>${escapeHtml(command.statusLabel)}</span>
        <strong>${escapeHtml(command.headline)}</strong>
        <p>${escapeHtml(command.summary)}</p>
      </div>
      <div class="account-health-score">
        <span>Account health</span>
        <strong>${escapeHtml(command.score)}%</strong>
      </div>
    </div>
  `;
  els.accountHealthGrid.innerHTML = command.cards.map((card) => `
    <article class="account-health-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.accountHealthRows.innerHTML = command.rows.map((row) => `
    <article class="account-health-row ${escapeAttr(row.className)}">
      <div class="account-health-row-head">
        <div>
          <span>${escapeHtml(row.statusLabel)}</span>
          <strong>${escapeHtml(row.account)}</strong>
        </div>
        <em>${escapeHtml(row.score)}%</em>
      </div>
      <p>${escapeHtml(row.summary)}</p>
      <div class="account-health-metrics">
        <div><span>Activation</span><strong>${escapeHtml(row.scores.activation)}%</strong></div>
        <div><span>Trust</span><strong>${escapeHtml(row.scores.trust)}%</strong></div>
        <div><span>Retention</span><strong>${escapeHtml(row.scores.retention)}%</strong></div>
        <div><span>Revenue</span><strong>${escapeHtml(row.scores.revenue)}%</strong></div>
      </div>
      <div class="account-health-next">
        <span>${escapeHtml(row.nextAction.lane)}</span>
        <strong>${escapeHtml(row.nextAction.title)}</strong>
        <p>${escapeHtml(row.nextAction.detail)}</p>
      </div>
    </article>
  `).join("");
}

function makeAccountHealthCommandCenter() {
  const renewal = makeRenewalExpansionBoard();
  const accounts = makeAccountHealthAccounts(renewal);
  const rows = accounts.map(makeAccountHealthRow).sort((a, b) => a.score - b.score || b.weightedMrr - a.weightedMrr);
  const score = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length) : 0;
  const rescueRows = rows.filter((row) => row.statusKey === "rescue");
  const watchRows = rows.filter((row) => row.statusKey === "watch");
  const healthyRows = rows.filter((row) => row.statusKey === "healthy");
  const expansionRows = rows.filter((row) => row.expansionReady);
  const dueRows = rows.filter((row) => row.dueNow);
  const weightedMrr = rows.reduce((sum, row) => sum + row.weightedMrr, 0);
  const evidenceCount = rows.reduce((sum, row) => sum + row.counts.evidence, 0);
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Account base healthy" : score >= 50 ? "Account base watch" : "Account base needs rescue";
  const headline = score >= 75
    ? "Pilot accounts have enough proof to manage toward renewal."
    : "Use the weakest account signal to decide the next operating move.";
  const nextRow = rescueRows[0] || dueRows[0] || watchRows[0] || expansionRows[0] || rows[0] || makeEmptyAccountHealthRow(renewal.account);
  const cards = [
    makeAccountHealthCard({
      label: "Accounts",
      passed: rows.length > 0,
      value: String(rows.length),
      detail: rows.length ? "Accounts found across sessions, follow-ups, evidence, conversions, and renewal motion." : "No named account has been captured yet.",
      status: rows.length ? "mapped" : "capture"
    }),
    makeAccountHealthCard({
      label: "Average health",
      passed: score >= 50,
      value: `${score}%`,
      detail: `${healthyRows.length} healthy, ${watchRows.length} watch, ${rescueRows.length} rescue.`,
      status: score >= 75 ? "healthy" : score >= 50 ? "watch" : "rescue"
    }),
    makeAccountHealthCard({
      label: "Expansion ready",
      passed: expansionRows.length > 0,
      value: String(expansionRows.length),
      detail: expansionRows.length ? "At least one account has renewal, trust, and revenue enough to test expansion." : "No account is expansion-ready yet.",
      status: expansionRows.length ? "expand" : "build"
    }),
    makeAccountHealthCard({
      label: "Due follow-ups",
      passed: dueRows.length === 0 && rows.length > 0,
      value: String(dueRows.length),
      detail: dueRows.length ? `${dueRows[0].account} needs follow-up now.` : "No account has an overdue follow-up date.",
      status: dueRows.length ? "due" : "clear"
    }),
    makeAccountHealthCard({
      label: "Evidence depth",
      passed: evidenceCount > 0,
      value: String(evidenceCount),
      detail: "Proof entries attached to accounts in the evidence ledger.",
      status: evidenceCount ? "proof" : "empty"
    }),
    makeAccountHealthCard({
      label: "Weighted MRR",
      passed: weightedMrr > 0,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: "Open conversion probability multiplied by expected AED MRR.",
      status: weightedMrr ? "pipeline" : "none"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `${rows.length} account${rows.length === 1 ? "" : "s"} mapped. ${rescueRows.length} rescue, ${watchRows.length} watch, ${healthyRows.length} healthy, ${expansionRows.length} expansion-ready. Next: ${nextRow.nextAction.title}.`,
    nextAccount: nextRow,
    nextAction: nextRow.nextAction,
    cards,
    rows,
    metrics: {
      accounts: rows.length,
      rescue: rescueRows.length,
      watch: watchRows.length,
      healthy: healthyRows.length,
      expansionReady: expansionRows.length,
      dueFollowups: dueRows.length,
      weightedMrr,
      evidenceCount
    }
  };
}

function makeAccountHealthAccounts(renewal) {
  const accountMap = new Map();
  const ensureAccount = (name) => {
    const clean = String(name || "").trim() || "Next UAE pilot account";
    const key = clean.toLowerCase();
    if (!accountMap.has(key)) {
      accountMap.set(key, {
        account: clean,
        sessions: [],
        followups: [],
        outreach: [],
        conversions: [],
        evidence: [],
        renewal: null
      });
    }
    return accountMap.get(key);
  };
  state.pilotSessions.forEach((session) => ensureAccount(session.user).sessions.push(session));
  state.pilotFollowups.forEach((followup) => ensureAccount(followup.account).followups.push(followup));
  state.pilotOutreachDrafts.forEach((draft) => ensureAccount(draft.account).outreach.push(draft));
  state.pilotConversions.forEach((conversion) => ensureAccount(conversion.account).conversions.push(conversion));
  state.pilotEvidenceLedger.forEach((entry) => ensureAccount(entry.account).evidence.push(entry));
  const renewalAccount = ensureAccount(renewal.account || "Next UAE pilot account");
  renewalAccount.renewal = renewal;
  return Array.from(accountMap.values());
}

function makeAccountHealthRow(accountRecord) {
  const today = makeLocalDateOffset(0);
  const sessions = accountRecord.sessions;
  const followups = accountRecord.followups;
  const outreach = accountRecord.outreach;
  const conversions = accountRecord.conversions;
  const evidence = accountRecord.evidence;
  const latestFollowup = followups.find((item) => item.stage !== "closed-lost") || followups[0] || null;
  const latestConversion = conversions.find(isConversionOpen) || conversions[0] || null;
  const latestOutreach = outreach[0] || null;
  const openConversions = conversions.filter(isConversionOpen);
  const weightedMrr = openConversions.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const activated = sessions.filter((session) => ["activated", "second-question"].includes(session.outcome)).length;
  const secondQuestions = sessions.filter((session) => session.outcome === "second-question").length;
  const paidIntent = sessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const realSourceSessions = sessions.filter((session) => session.sourceStatus === "real").length;
  const sourceBlocked = sessions.filter((session) => session.outcome === "source-blocked" || session.sourceStatus === "missing").length;
  const trustBlocked = sessions.filter((session) => session.outcome === "trust-blocked").length;
  const verifiedEvidence = evidence.filter((entry) => entry.status === "verified").length;
  const sourceEvidence = evidence.filter((entry) => entry.type === "source-proof").length;
  const repeatEvidence = evidence.filter((entry) => entry.type === "repeat-proof").length;
  const outputEvidence = evidence.filter((entry) => entry.type === "output-proof").length;
  const revenueEvidence = evidence.filter((entry) => entry.type === "revenue-proof").length;
  const activeFollowup = latestFollowup && latestFollowup.stage !== "closed-lost";
  const dueNow = Boolean(activeFollowup && latestFollowup.nextDate && latestFollowup.nextDate <= today);
  const activationScore = clampScore(activated * 38 + secondQuestions * 24 + (sessions.length >= 2 ? 12 : 0) - (sourceBlocked + trustBlocked) * 12);
  const trustScore = clampScore(verifiedEvidence * 32 + sourceEvidence * 22 + realSourceSessions * 24 + outputEvidence * 10 - (sourceBlocked + trustBlocked) * 10);
  const retentionScore = clampScore(secondQuestions * 38 + repeatEvidence * 30 + (activeFollowup ? 18 : 0) + (latestOutreach ? 10 : 0));
  const revenueScore = clampScore((weightedMrr >= 399 ? 45 : weightedMrr ? 30 : 0) + paidIntent * 16 + revenueEvidence * 24 + (latestConversion?.stage === "won" ? 20 : latestConversion?.stage === "paid-pilot" ? 14 : 0));
  const motionScore = clampScore((activeFollowup ? 34 : 0) + (dueNow ? 8 : 22) + (latestOutreach ? 18 : 0) + (latestConversion ? 18 : 0) + (evidence.length ? 8 : 0));
  const score = clampScore(Math.round(activationScore * 0.22 + trustScore * 0.22 + retentionScore * 0.18 + revenueScore * 0.2 + motionScore * 0.18));
  const expansionReady = score >= 72 && trustScore >= 55 && revenueScore >= 50;
  const statusKey = score >= 75 ? "healthy" : score >= 50 ? "watch" : "rescue";
  const statusLabel = statusKey === "healthy" ? "Healthy" : statusKey === "watch" ? "Watch" : "Rescue";
  const className = statusKey === "healthy" ? "is-good" : statusKey === "watch" ? "is-warning" : "is-error";
  const nextAction = makeAccountHealthNextAction({
    account: accountRecord.account,
    activationScore,
    trustScore,
    retentionScore,
    revenueScore,
    motionScore,
    dueNow,
    latestFollowup,
    latestConversion,
    expansionReady
  });
  return {
    account: accountRecord.account,
    score,
    statusKey,
    statusLabel,
    className,
    expansionReady,
    dueNow,
    weightedMrr,
    nextAction,
    summary: `${sessions.length} session${sessions.length === 1 ? "" : "s"}, ${followups.length} follow-up${followups.length === 1 ? "" : "s"}, ${evidence.length} proof item${evidence.length === 1 ? "" : "s"}, AED ${formatInteger(weightedMrr)} weighted MRR. ${sourceBlocked + trustBlocked ? `${sourceBlocked + trustBlocked} trust/source blocker${sourceBlocked + trustBlocked === 1 ? "" : "s"} open.` : "No trust/source blocker recorded."}`,
    scores: {
      activation: activationScore,
      trust: trustScore,
      retention: retentionScore,
      revenue: revenueScore,
      motion: motionScore
    },
    counts: {
      sessions: sessions.length,
      followups: followups.length,
      outreach: outreach.length,
      conversions: conversions.length,
      evidence: evidence.length,
      verifiedEvidence,
      repeatEvidence,
      outputEvidence,
      revenueEvidence,
      paidIntent
    },
    latestFollowup,
    latestConversion,
    latestOutreach
  };
}

function makeEmptyAccountHealthRow(account) {
  return {
    account: account || "Next UAE pilot account",
    score: 0,
    statusKey: "rescue",
    statusLabel: "Rescue",
    className: "is-error",
    expansionReady: false,
    dueNow: false,
    weightedMrr: 0,
    summary: "No account signal has been captured yet.",
    scores: { activation: 0, trust: 0, retention: 0, revenue: 0, motion: 0 },
    counts: { sessions: 0, followups: 0, outreach: 0, conversions: 0, evidence: 0 },
    nextAction: {
      lane: "Capture",
      title: "Log the first account signal",
      detail: "Save a pilot session, follow-up, evidence item, or conversion record so account health can become real.",
      target: "#pilot-session-command",
      buttonLabel: "Open pilot session"
    }
  };
}

function makeAccountHealthNextAction({ account, activationScore, trustScore, retentionScore, revenueScore, motionScore, dueNow, latestFollowup, latestConversion, expansionReady }) {
  if (activationScore < 35) {
    return {
      lane: "Activation",
      title: "Capture a live account session",
      detail: `Log ${account}'s real UAE market question, outcome, source status, and next step.`,
      target: "#pilot-session-command",
      buttonLabel: "Open pilot session"
    };
  }
  if (trustScore < 45) {
    return {
      lane: "Trust",
      title: "Attach verified source proof",
      detail: `Add or verify one source/evidence item before ${account} is treated as renewal-ready.`,
      target: "#pilot-evidence-ledger",
      buttonLabel: "Open evidence ledger"
    };
  }
  if (retentionScore < 45) {
    return {
      lane: "Retention",
      title: "Ask for the second real question",
      detail: `Use a dated follow-up to get repeat behavior from ${account}.`,
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up"
    };
  }
  if (revenueScore < 45) {
    return {
      lane: "Revenue",
      title: "Name the paid next step",
      detail: latestConversion?.closeAction || `Move ${account} into AED 199, AED 399, or team-invoice conversion tracking.`,
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion"
    };
  }
  if (dueNow || motionScore < 55) {
    return {
      lane: "Motion",
      title: "Lock the next dated action",
      detail: latestFollowup?.nextAction || `Schedule the next account review for ${account}.`,
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-up"
    };
  }
  if (expansionReady) {
    return {
      lane: "Expand",
      title: "Prepare renewal or team-access ask",
      detail: `${account} has enough health to test renewal, team access, or a larger AED lane.`,
      target: "#renewal-expansion-board",
      buttonLabel: "Open renewal"
    };
  }
  return {
    lane: "Maintain",
    title: "Keep account proof current",
    detail: `Keep ${account}'s source proof, output artifact, follow-up date, and paid lane fresh.`,
    target: "#pilot-success-plan",
    buttonLabel: "Open success plan"
  };
}

function makeAccountHealthCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "due" || status === "rescue" || status === "capture" ? "is-error" : "is-warning"
  };
}

function clampScore(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function openAccountHealthNext() {
  const command = makeAccountHealthCommandCenter();
  document.querySelector(command.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashAccountHealthResult(`Opened: ${command.nextAction.title}.`, "neutral");
}

function prefillAccountHealthFollowup() {
  const command = makeAccountHealthCommandCenter();
  const row = command.nextAccount || makeEmptyAccountHealthRow("Next UAE pilot account");
  if (els.pilotFollowupAccount) els.pilotFollowupAccount.value = row.account;
  if (els.pilotFollowupPriority) els.pilotFollowupPriority.value = row.statusKey === "rescue" || row.dueNow ? "High" : row.statusKey === "watch" ? "Medium" : "Low";
  if (els.pilotFollowupStage) {
    els.pilotFollowupStage.value = row.expansionReady ? "paid-pilot" : row.nextAction.lane === "Trust" ? "source-needed" : row.scores.revenue >= 45 ? "proposal-sent" : "demo-done";
  }
  if (els.pilotFollowupOffer) {
    els.pilotFollowupOffer.value = row.latestConversion?.plan || (row.expansionReady ? "team-invoice" : row.scores.revenue >= 45 ? "aed-399" : "need-discovery");
  }
  if (els.pilotFollowupNextDate && !els.pilotFollowupNextDate.value) els.pilotFollowupNextDate.value = makeLocalDateOffset(row.statusKey === "rescue" ? 1 : 3);
  if (els.pilotFollowupBlocker) els.pilotFollowupBlocker.value = `${row.statusLabel} account health: ${row.nextAction.lane} is the next gap.`;
  if (els.pilotFollowupNextAction) els.pilotFollowupNextAction.value = row.nextAction.detail;
  if (els.pilotFollowupSessionNote) els.pilotFollowupSessionNote.value = row.summary;
  document.querySelector("#pilot-followup-board")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashAccountHealthResult(`${row.account} loaded into the follow-up board.`, "success");
}

async function copyAccountHealthCommandCenter() {
  const copied = await copyTextToClipboard(makeAccountHealthMarkdown(makeAccountHealthCommandCenter()));
  flashAccountHealthResult(copied ? "Account health memo copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportAccountHealthCommandCenter() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-account-health-${date}.json`, JSON.stringify(makeAccountHealthCommandCenter(), null, 2), "application/json;charset=utf-8");
  flashAccountHealthResult("Account health JSON exported.", "success");
}

function makeAccountHealthMarkdown(command) {
  return [
    "# MajlisAlpha Account Health Command Center",
    "",
    `Version: ${command.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Health score: ${command.score}% (${command.statusLabel})`,
    "",
    command.summary,
    "",
    "## Dashboard Cards",
    ...command.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Account Rows",
    ...command.rows.map((row) => `- ${row.account}: ${row.score}% (${row.statusLabel}) - ${row.nextAction.title}: ${row.nextAction.detail}`),
    "",
    "## Next Action",
    `${command.nextAccount.account}: ${command.nextAction.title} - ${command.nextAction.detail}`,
    "",
    "_Account health is an operating workflow for customer development and product revenue. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashAccountHealthResult(message, tone = "neutral") {
  if (!els.accountHealthResult) return;
  els.accountHealthResult.className = `builder-result is-${tone}`;
  els.accountHealthResult.textContent = message;
}

function renderFounderRevenueForecastCenter() {
  if (!els.founderRevenueSummary || !els.founderRevenueGrid || !els.founderRevenueScenarios) return;
  const forecast = makeFounderRevenueForecastCenter();
  window.MajlisAlphaFounderRevenue = forecast;
  if (els.openFounderRevenueNext) {
    els.openFounderRevenueNext.textContent = forecast.nextAction.buttonLabel;
  }
  els.founderRevenueSummary.innerHTML = `
    <div class="founder-revenue-hero ${escapeAttr(forecast.statusClass)}">
      <div>
        <span>${escapeHtml(forecast.statusLabel)}</span>
        <strong>${escapeHtml(forecast.headline)}</strong>
        <p>${escapeHtml(forecast.summary)}</p>
      </div>
      <div class="founder-revenue-score">
        <span>Forecast score</span>
        <strong>${escapeHtml(forecast.score)}%</strong>
      </div>
    </div>
  `;
  els.founderRevenueGrid.innerHTML = forecast.cards.map((card) => `
    <article class="founder-revenue-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.founderRevenueScenarios.innerHTML = forecast.scenarios.map((scenario) => `
    <article class="founder-revenue-scenario ${escapeAttr(scenario.className)}">
      <span>${escapeHtml(scenario.lane)}</span>
      <strong>${escapeHtml(scenario.title)}</strong>
      <p>${escapeHtml(scenario.detail)}</p>
      <em>${escapeHtml(scenario.owner)}</em>
    </article>
  `).join("");
}

function makeFounderRevenueForecastCenter() {
  const accountHealth = makeAccountHealthCommandCenter();
  const renewal = makeRenewalExpansionBoard();
  const openDeals = state.pilotConversions.filter((deal) => isConversionOpen(deal) && deal.stage !== "paid-pilot");
  const wonDeals = state.pilotConversions.filter((deal) => ["paid-pilot", "won"].includes(deal.stage));
  const committedMrr = wonDeals.reduce((sum, deal) => sum + (deal.mrr || getDefaultConversionMrr(deal.plan)), 0);
  const grossOpenMrr = openDeals.reduce((sum, deal) => sum + (deal.mrr || getDefaultConversionMrr(deal.plan)), 0);
  const weightedMrr = openDeals.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const expansionRows = accountHealth.rows.filter((row) => row.expansionReady);
  const rescueRows = accountHealth.rows.filter((row) => row.statusKey === "rescue");
  const expansionUpside = expansionRows.reduce((sum, row) => sum + Math.max(row.weightedMrr, row.latestConversion?.mrr || 399), 0);
  const atRiskMrr = rescueRows.reduce((sum, row) => sum + row.weightedMrr, 0);
  const forecastMrr = committedMrr + weightedMrr + Math.round(expansionUpside * 0.5);
  const runRateArr = forecastMrr * 12;
  const evidenceRevenue = state.pilotEvidenceLedger.filter((entry) => entry.type === "revenue-proof").length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const revenueScore = clampScore(
    committedMrr * 0.08
    + weightedMrr * 0.05
    + accountHealth.score * 0.36
    + renewal.score * 0.18
    + evidenceRevenue * 10
    + paidIntentSessions * 8
    + expansionRows.length * 8
    - rescueRows.length * 8
  );
  const statusClass = revenueScore >= 75 ? "is-good" : revenueScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = revenueScore >= 75 ? "Revenue motion ready" : revenueScore >= 50 ? "Revenue forming" : "Revenue needs proof";
  const headline = revenueScore >= 75
    ? "The founder has enough signal to push revenue this week."
    : "Convert proof into a named AED action before calling revenue real.";
  const cards = [
    makeFounderRevenueCard({
      label: "Committed MRR",
      passed: committedMrr > 0,
      value: `AED ${formatInteger(committedMrr)}`,
      detail: `${wonDeals.length} paid-pilot or won record${wonDeals.length === 1 ? "" : "s"} currently counted.`,
      status: committedMrr ? "booked" : "none"
    }),
    makeFounderRevenueCard({
      label: "Weighted pipeline",
      passed: weightedMrr > 0,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `Gross open pipeline is AED ${formatInteger(grossOpenMrr)} across ${openDeals.length} open deal${openDeals.length === 1 ? "" : "s"}.`,
      status: weightedMrr ? "pipeline" : "empty"
    }),
    makeFounderRevenueCard({
      label: "Expansion upside",
      passed: expansionUpside > 0,
      value: `AED ${formatInteger(expansionUpside)}`,
      detail: `${expansionRows.length} account${expansionRows.length === 1 ? "" : "s"} are expansion-ready from account health.`,
      status: expansionUpside ? "expand" : "prove"
    }),
    makeFounderRevenueCard({
      label: "ARR run-rate",
      passed: runRateArr > 0,
      value: `AED ${formatInteger(runRateArr)}`,
      detail: "Committed plus weighted pipeline plus half of expansion upside, annualized.",
      status: runRateArr ? "forecast" : "zero"
    }),
    makeFounderRevenueCard({
      label: "Revenue proof",
      passed: evidenceRevenue > 0 || paidIntentSessions > 0,
      value: `${evidenceRevenue} proof / ${paidIntentSessions} intent`,
      detail: "Revenue-proof ledger entries and paid-intent sessions supporting the forecast.",
      status: evidenceRevenue || paidIntentSessions ? "supported" : "capture"
    }),
    makeFounderRevenueCard({
      label: "MRR at risk",
      passed: atRiskMrr === 0,
      value: `AED ${formatInteger(atRiskMrr)}`,
      detail: `${rescueRows.length} rescue account${rescueRows.length === 1 ? "" : "s"} can weaken the forecast.`,
      status: atRiskMrr ? "protect" : "clear"
    })
  ];
  const scenarios = makeFounderRevenueScenarios({
    committedMrr,
    weightedMrr,
    grossOpenMrr,
    expansionUpside,
    runRateArr,
    atRiskMrr,
    accountHealth,
    renewal,
    evidenceRevenue,
    paidIntentSessions
  });
  const nextAction = scenarios.find((scenario) => !scenario.passed) || scenarios[scenarios.length - 1];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: revenueScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Forecast MRR is AED ${formatInteger(forecastMrr)} and forecast ARR is AED ${formatInteger(runRateArr)}. ${accountHealth.metrics.accounts} account${accountHealth.metrics.accounts === 1 ? "" : "s"} mapped, ${openDeals.length} open deal${openDeals.length === 1 ? "" : "s"}, ${expansionRows.length} expansion-ready, and AED ${formatInteger(atRiskMrr)} MRR at risk. Next: ${nextAction.title}.`,
    nextAction,
    cards,
    scenarios,
    metrics: {
      committedMrr,
      grossOpenMrr,
      weightedMrr,
      expansionUpside,
      forecastMrr,
      runRateArr,
      atRiskMrr,
      openDeals: openDeals.length,
      wonDeals: wonDeals.length,
      expansionReady: expansionRows.length,
      rescueAccounts: rescueRows.length,
      evidenceRevenue,
      paidIntentSessions
    },
    accountHealth,
    renewal
  };
}

function makeFounderRevenueCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "protect" || status === "zero" || status === "capture" ? "is-error" : "is-warning"
  };
}

function makeFounderRevenueScenarios({ committedMrr, weightedMrr, grossOpenMrr, expansionUpside, runRateArr, atRiskMrr, accountHealth, renewal, evidenceRevenue, paidIntentSessions }) {
  const nextAccount = accountHealth.nextAccount || makeEmptyAccountHealthRow("Next UAE pilot account");
  const bestExpansion = accountHealth.rows.find((row) => row.expansionReady) || nextAccount;
  const bestPipeline = state.pilotConversions.find(isConversionOpen) || null;
  return [
    {
      lane: "Protect",
      title: "Protect weak MRR first",
      detail: atRiskMrr ? `Rescue ${nextAccount.account} before forecast MRR gets weaker.` : "No weighted MRR is sitting inside rescue accounts.",
      target: atRiskMrr ? "#account-health-command" : "#pilot-followup-board",
      buttonLabel: atRiskMrr ? "Open account health" : "Open follow-up",
      owner: "Founder",
      passed: atRiskMrr === 0,
      className: atRiskMrr ? "is-error" : "is-good"
    },
    {
      lane: "Convert",
      title: "Move pipeline into paid stage",
      detail: weightedMrr ? `${bestPipeline?.account || "Open pipeline"} carries AED ${formatInteger(weightedMrr)} weighted MRR. Push the next close action.` : "Create one priced conversion record with plan, probability, MRR, and close action.",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion",
      owner: "Founder",
      passed: weightedMrr > 0,
      className: weightedMrr ? "is-good" : "is-warning"
    },
    {
      lane: "Expand",
      title: "Test team or higher-lane expansion",
      detail: expansionUpside ? `${bestExpansion.account} can test a larger lane worth AED ${formatInteger(expansionUpside)} in upside.` : "Build account health until one account is expansion-ready.",
      target: expansionUpside ? "#renewal-expansion-board" : "#account-health-command",
      buttonLabel: expansionUpside ? "Open renewal" : "Open account health",
      owner: "Founder",
      passed: expansionUpside > 0,
      className: expansionUpside ? "is-good" : "is-warning"
    },
    {
      lane: "Proof",
      title: "Attach revenue proof to the forecast",
      detail: evidenceRevenue || paidIntentSessions ? `${evidenceRevenue} revenue-proof ledger item${evidenceRevenue === 1 ? "" : "s"} and ${paidIntentSessions} paid-intent session${paidIntentSessions === 1 ? "" : "s"} support the forecast.` : "Save a revenue-proof evidence item or paid-intent session before treating the forecast as founder-ready.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Open evidence ledger",
      owner: "Operator",
      passed: evidenceRevenue > 0 || paidIntentSessions > 0,
      className: evidenceRevenue || paidIntentSessions ? "is-good" : "is-error"
    },
    {
      lane: "Run-rate",
      title: "Name the ARR story",
      detail: runRateArr ? `Current forecast annualizes to AED ${formatInteger(runRateArr)} ARR.` : "No ARR story yet. Start with one AED 199, AED 399, or team-invoice conversion lane.",
      target: "#release-handoff-center",
      buttonLabel: "Open handoff",
      owner: "Founder",
      passed: runRateArr > 0,
      className: runRateArr ? "is-good" : "is-warning"
    },
    {
      lane: "Discipline",
      title: "Keep the forecast source-backed",
      detail: renewal.score >= 50 && accountHealth.score >= 50 ? "Revenue forecast is linked to renewal and account-health operating signals." : "Improve account health and renewal proof before presenting forecast numbers strongly.",
      target: renewal.score < accountHealth.score ? "#renewal-expansion-board" : "#account-health-command",
      buttonLabel: renewal.score < accountHealth.score ? "Open renewal" : "Open account health",
      owner: "Founder",
      passed: renewal.score >= 50 && accountHealth.score >= 50,
      className: renewal.score >= 50 && accountHealth.score >= 50 ? "is-good" : "is-warning"
    }
  ];
}

function openFounderRevenueNext() {
  const forecast = makeFounderRevenueForecastCenter();
  document.querySelector(forecast.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderRevenueResult(`Opened: ${forecast.nextAction.title}.`, "neutral");
}

function prefillFounderRevenueConversion() {
  const forecast = makeFounderRevenueForecastCenter();
  const account = forecast.accountHealth.nextAccount?.account || forecast.renewal.account || "Next UAE pilot account";
  const targetMrr = forecast.metrics.expansionUpside ? Math.max(399, Math.round(forecast.metrics.expansionUpside / Math.max(1, forecast.metrics.expansionReady))) : forecast.metrics.weightedMrr ? Math.max(199, forecast.metrics.weightedMrr) : 199;
  if (els.pilotConversionAccount) els.pilotConversionAccount.value = account;
  if (els.pilotConversionStage) els.pilotConversionStage.value = forecast.metrics.weightedMrr ? "proposal" : "interested";
  if (els.pilotConversionPlan) els.pilotConversionPlan.value = targetMrr >= 1200 ? "team-invoice" : targetMrr >= 399 ? "aed-399" : "aed-199";
  if (els.pilotConversionProbability) els.pilotConversionProbability.value = forecast.score >= 70 ? "65" : forecast.score >= 45 ? "45" : "30";
  if (els.pilotConversionMrr) els.pilotConversionMrr.value = String(targetMrr);
  if (els.pilotConversionNextDate && !els.pilotConversionNextDate.value) els.pilotConversionNextDate.value = makeLocalDateOffset(forecast.score >= 50 ? 2 : 1);
  if (els.pilotConversionReply) els.pilotConversionReply.value = forecast.metrics.expansionUpside ? "team" : "pricing";
  if (els.pilotConversionBlocker) els.pilotConversionBlocker.value = forecast.metrics.atRiskMrr ? "Revenue forecast has at-risk MRR. Protect weak account before expansion." : "Needs priced close action and source-backed value proof.";
  if (els.pilotConversionCloseAction) els.pilotConversionCloseAction.value = forecast.nextAction.detail;
  if (els.pilotConversionNote) els.pilotConversionNote.value = forecast.summary;
  document.querySelector("#pilot-conversion-pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderRevenueResult(`${account} loaded into the conversion pipeline.`, "success");
}

async function copyFounderRevenueForecast() {
  const copied = await copyTextToClipboard(makeFounderRevenueMarkdown(makeFounderRevenueForecastCenter()));
  flashFounderRevenueResult(copied ? "Founder revenue forecast copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportFounderRevenueForecast() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-founder-revenue-forecast-${date}.json`, JSON.stringify(makeFounderRevenueForecastCenter(), null, 2), "application/json;charset=utf-8");
  flashFounderRevenueResult("Founder revenue forecast JSON exported.", "success");
}

function makeFounderRevenueMarkdown(forecast) {
  return [
    "# MajlisAlpha Founder Revenue Forecast Center",
    "",
    `Version: ${forecast.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Forecast score: ${forecast.score}% (${forecast.statusLabel})`,
    `Forecast MRR: AED ${formatInteger(forecast.metrics.forecastMrr)}`,
    `Forecast ARR: AED ${formatInteger(forecast.metrics.runRateArr)}`,
    "",
    forecast.summary,
    "",
    "## Forecast Cards",
    ...forecast.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Revenue Scenarios",
    ...forecast.scenarios.map((scenario) => `- ${scenario.lane}: ${scenario.title} - ${scenario.detail}`),
    "",
    "## Next Action",
    `${forecast.nextAction.title}: ${forecast.nextAction.detail}`,
    "",
    "_Founder revenue forecasting is an operating workflow for product commercialization. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashFounderRevenueResult(message, tone = "neutral") {
  if (!els.founderRevenueResult) return;
  els.founderRevenueResult.className = `builder-result is-${tone}`;
  els.founderRevenueResult.textContent = message;
}

function renderFounderBoardPackCenter() {
  if (!els.founderBoardSummary || !els.founderBoardGrid || !els.founderBoardSections) return;
  const board = makeFounderBoardPackCenter();
  window.MajlisAlphaFounderBoardPack = board;
  if (els.openFounderBoardNext) {
    els.openFounderBoardNext.textContent = board.nextAction.buttonLabel;
  }
  els.founderBoardSummary.innerHTML = `
    <div class="founder-board-hero ${escapeAttr(board.statusClass)}">
      <div>
        <span>${escapeHtml(board.statusLabel)}</span>
        <strong>${escapeHtml(board.headline)}</strong>
        <p>${escapeHtml(board.summary)}</p>
      </div>
      <div class="founder-board-score">
        <span>Board score</span>
        <strong>${escapeHtml(board.score)}%</strong>
      </div>
    </div>
  `;
  els.founderBoardGrid.innerHTML = board.cards.map((card) => `
    <article class="founder-board-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.founderBoardSections.innerHTML = board.sections.map((section) => `
    <article class="founder-board-section-card ${escapeAttr(section.className)}">
      <span>${escapeHtml(section.lane)}</span>
      <strong>${escapeHtml(section.title)}</strong>
      <p>${escapeHtml(section.detail)}</p>
      <em>${escapeHtml(section.owner)}</em>
    </article>
  `).join("");
}

function makeFounderBoardPackCenter() {
  const revenue = makeFounderRevenueForecastCenter();
  const accountHealth = revenue.accountHealth || makeAccountHealthCommandCenter();
  const renewal = revenue.renewal || makeRenewalExpansionBoard();
  const proofPacket = makePilotProofPacket();
  const closeRoom = renewal.closeRoom || makePilotCloseRoom();
  const pagesAudit = makePagesDeploymentAudit();
  const smokeAudit = makeLiveSmokeTestAudit();
  const latestConversion = state.pilotConversions[0] || null;
  const latestFollowup = state.pilotFollowups[0] || null;
  const evidenceCount = state.pilotEvidenceLedger.length;
  const verifiedEvidence = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const deploymentScore = Math.min(pagesAudit.score, smokeAudit.score);
  const operatingScore = clampScore(
    revenue.score * 0.28
    + accountHealth.score * 0.2
    + proofPacket.score * 0.18
    + deploymentScore * 0.14
    + Math.min(10, evidenceCount * 2)
    + Math.min(8, state.pilotConversions.length * 3)
    + Math.min(6, state.memoReviews.length * 3)
    + Math.min(6, state.decisionJournal.length * 2)
  );
  const statusClass = operatingScore >= 75 ? "is-good" : operatingScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = operatingScore >= 75 ? "Board pack ready" : operatingScore >= 50 ? "Board pack forming" : "Board pack needs proof";
  const headline = operatingScore >= 75
    ? "The founder update can be shared with a clear revenue story."
    : "Keep the founder update honest: lead with proof gaps and the next paid action.";
  const sections = makeFounderBoardSections({
    revenue,
    accountHealth,
    renewal,
    proofPacket,
    closeRoom,
    pagesAudit,
    smokeAudit,
    deploymentScore,
    latestConversion,
    latestFollowup,
    evidenceCount,
    verifiedEvidence,
    paidIntentSessions
  });
  const nextAction = sections.find((section) => !section.passed) || sections[sections.length - 1];
  const cards = [
    makeFounderBoardCard({
      label: "Board readiness",
      passed: operatingScore >= 60,
      value: `${operatingScore}%`,
      detail: "Weighted view of revenue, account health, value proof, deployment health, reviews, and evidence.",
      status: operatingScore >= 75 ? "share" : operatingScore >= 50 ? "tighten" : "prove"
    }),
    makeFounderBoardCard({
      label: "Revenue story",
      passed: revenue.metrics.forecastMrr > 0 || revenue.metrics.weightedMrr > 0,
      value: `AED ${formatInteger(revenue.metrics.forecastMrr)} MRR`,
      detail: `Annualized forecast is AED ${formatInteger(revenue.metrics.runRateArr)} ARR with AED ${formatInteger(revenue.metrics.weightedMrr)} weighted pipeline.`,
      status: revenue.metrics.forecastMrr ? "forecast" : "pipeline gap"
    }),
    makeFounderBoardCard({
      label: "Account health",
      passed: accountHealth.score >= 50,
      value: `${accountHealth.score}%`,
      detail: `${accountHealth.metrics.accounts} account${accountHealth.metrics.accounts === 1 ? "" : "s"} mapped. Next account: ${accountHealth.nextAccount.account}.`,
      status: accountHealth.statusLabel.toLowerCase()
    }),
    makeFounderBoardCard({
      label: "Proof packet",
      passed: proofPacket.score >= 50 || evidenceCount > 0,
      value: `${proofPacket.score}%`,
      detail: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, and ${proofPacket.metrics.missingTypes.length} missing proof lane${proofPacket.metrics.missingTypes.length === 1 ? "" : "s"}.`,
      status: proofPacket.statusLabel.toLowerCase()
    }),
    makeFounderBoardCard({
      label: "Deployment health",
      passed: deploymentScore >= 90,
      value: `${deploymentScore}%`,
      detail: `Pages Doctor is ${pagesAudit.score}% and Live Smoke Test is ${smokeAudit.score}%.`,
      status: deploymentScore >= 90 ? "green" : "check"
    }),
    makeFounderBoardCard({
      label: "Next founder ask",
      passed: Boolean(nextAction),
      value: nextAction.lane,
      detail: `${nextAction.title}: ${nextAction.detail}`,
      status: "next"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: operatingScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Board pack score is ${operatingScore}%. Forecast MRR is AED ${formatInteger(revenue.metrics.forecastMrr)}, account health is ${accountHealth.score}%, proof packet is ${proofPacket.score}%, and deployment health is ${deploymentScore}%. Next: ${nextAction.title}.`,
    nextAction,
    cards,
    sections,
    metrics: {
      forecastMrr: revenue.metrics.forecastMrr,
      runRateArr: revenue.metrics.runRateArr,
      weightedMrr: revenue.metrics.weightedMrr,
      accountHealth: accountHealth.score,
      proofScore: proofPacket.score,
      deploymentScore,
      evidenceCount,
      verifiedEvidence,
      paidIntentSessions,
      conversions: state.pilotConversions.length,
      reviews: state.memoReviews.length,
      decisions: state.decisionJournal.length
    },
    revenue,
    accountHealth,
    renewal,
    proofPacket,
    closeRoom,
    pagesAudit,
    smokeAudit
  };
}

function makeFounderBoardCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status.includes("gap") || status === "prove" || status === "check" ? "is-error" : "is-warning"
  };
}

function makeFounderBoardSections({ revenue, accountHealth, renewal, proofPacket, closeRoom, pagesAudit, smokeAudit, deploymentScore, latestConversion, latestFollowup, evidenceCount, verifiedEvidence, paidIntentSessions }) {
  return [
    {
      lane: "Headline",
      title: "Lead with the operating truth",
      detail: revenue.metrics.forecastMrr || revenue.metrics.weightedMrr
        ? `The update can lead with AED ${formatInteger(revenue.metrics.forecastMrr)} forecast MRR and AED ${formatInteger(revenue.metrics.runRateArr)} forecast ARR.`
        : "Do not overclaim revenue yet. Lead with the next priced conversion action and proof gap.",
      target: "#founder-revenue-forecast",
      buttonLabel: "Open revenue forecast",
      owner: "Founder",
      passed: revenue.metrics.forecastMrr > 0 || revenue.metrics.weightedMrr > 0,
      className: revenue.metrics.forecastMrr || revenue.metrics.weightedMrr ? "is-good" : "is-error"
    },
    {
      lane: "Customer Proof",
      title: "Show why the account should pay",
      detail: proofPacket.score >= 50 || evidenceCount
        ? `${proofPacket.account} has ${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"} and a ${proofPacket.score}% proof packet.`
        : "Capture one value-proof item before treating the update as customer-backed.",
      target: "#pilot-proof-packet",
      buttonLabel: "Open proof packet",
      owner: "Operator",
      passed: proofPacket.score >= 50 || evidenceCount > 0,
      className: proofPacket.score >= 50 || evidenceCount ? "is-good" : "is-error"
    },
    {
      lane: "Account Health",
      title: "Name the account that needs attention",
      detail: `${accountHealth.nextAccount.account} is the next account. ${accountHealth.nextAction.title}: ${accountHealth.nextAction.detail}`,
      target: "#account-health-command",
      buttonLabel: "Open account health",
      owner: "Founder",
      passed: accountHealth.score >= 50,
      className: accountHealth.score >= 50 ? "is-good" : "is-warning"
    },
    {
      lane: "Close Motion",
      title: "Turn the update into a paid action",
      detail: latestConversion
        ? `${latestConversion.account} is in ${getConversionStageLabel(latestConversion.stage)} with AED ${formatInteger(latestConversion.mrr || getDefaultConversionMrr(latestConversion.plan))} MRR tracked.`
        : `Close room odds are ${closeRoom.closeProbability}%. Create a priced conversion record from the next customer ask.`,
      target: latestConversion ? "#pilot-conversion-pipeline" : "#pilot-close-room",
      buttonLabel: latestConversion ? "Open conversion" : "Open close room",
      owner: "Founder",
      passed: Boolean(latestConversion) || closeRoom.closeProbability >= 45,
      className: latestConversion || closeRoom.closeProbability >= 45 ? "is-good" : "is-warning"
    },
    {
      lane: "Retention",
      title: "Protect renewal and repeat behavior",
      detail: renewal.score >= 50
        ? `Renewal score is ${renewal.score}%. ${renewal.nextAsk}`
        : latestFollowup
          ? `Follow-up exists for ${latestFollowup.account}; tighten renewal proof before expansion.`
          : "Schedule the next follow-up so the board update has retention motion.",
      target: "#renewal-expansion-board",
      buttonLabel: "Open renewal board",
      owner: "Operator",
      passed: renewal.score >= 50 || Boolean(latestFollowup),
      className: renewal.score >= 50 || latestFollowup ? "is-good" : "is-warning"
    },
    {
      lane: "Deploy Confidence",
      title: "Only share after the live path is green",
      detail: deploymentScore >= 90
        ? `Deployment is green: Pages Doctor ${pagesAudit.score}% and Smoke Test ${smokeAudit.score}%.`
        : `Deployment needs review: Pages Doctor ${pagesAudit.score}% and Smoke Test ${smokeAudit.score}%.`,
      target: deploymentScore >= 90 ? "#release-handoff-center" : "#pages-deployment-doctor",
      buttonLabel: deploymentScore >= 90 ? "Open handoff" : "Open Pages Doctor",
      owner: "Operator",
      passed: deploymentScore >= 90,
      className: deploymentScore >= 90 ? "is-good" : "is-error"
    },
    {
      lane: "Founder Ask",
      title: "State the one thing needed this week",
      detail: paidIntentSessions || verifiedEvidence
        ? "Use the update to ask for a priced pilot decision, one expansion conversation, or one official-source proof gap closure."
        : "Ask for one real pilot question, one verified source proof, and one priced follow-up before the next founder review.",
      target: paidIntentSessions || verifiedEvidence ? "#founder-revenue-forecast" : "#pilot-evidence-ledger",
      buttonLabel: paidIntentSessions || verifiedEvidence ? "Open revenue forecast" : "Open evidence ledger",
      owner: "Founder",
      passed: paidIntentSessions > 0 || verifiedEvidence > 0,
      className: paidIntentSessions || verifiedEvidence ? "is-good" : "is-warning"
    }
  ];
}

function openFounderBoardNext() {
  const board = makeFounderBoardPackCenter();
  document.querySelector(board.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderBoardResult(`Opened: ${board.nextAction.title}.`, "neutral");
}

function openFounderBoardRevenue() {
  document.querySelector("#founder-revenue-forecast")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderBoardResult("Founder Revenue Forecast Center opened.", "neutral");
}

async function copyFounderBoardPack() {
  const copied = await copyTextToClipboard(makeFounderBoardMarkdown(makeFounderBoardPackCenter()));
  flashFounderBoardResult(copied ? "Founder board pack copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportFounderBoardPack() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-founder-board-pack-${date}.json`, JSON.stringify(makeFounderBoardPackCenter(), null, 2), "application/json;charset=utf-8");
  flashFounderBoardResult("Founder board pack JSON exported.", "success");
}

function makeFounderBoardMarkdown(board) {
  return [
    "# MajlisAlpha Founder Board Pack Center",
    "",
    `Version: ${board.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Board score: ${board.score}% (${board.statusLabel})`,
    `Forecast MRR: AED ${formatInteger(board.metrics.forecastMrr)}`,
    `Forecast ARR: AED ${formatInteger(board.metrics.runRateArr)}`,
    "",
    board.summary,
    "",
    "## Board Cards",
    ...board.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Founder Update Sections",
    ...board.sections.map((section) => `- ${section.lane}: ${section.title} - ${section.detail}`),
    "",
    "## Next Action",
    `${board.nextAction.title}: ${board.nextAction.detail}`,
    "",
    "_Founder board packs are operating updates for product commercialization. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashFounderBoardResult(message, tone = "neutral") {
  if (!els.founderBoardResult) return;
  els.founderBoardResult.className = `builder-result is-${tone}`;
  els.founderBoardResult.textContent = message;
}

function renderFounderDiligenceRoom() {
  if (!els.founderDiligenceSummary || !els.founderDiligenceGrid || !els.founderDiligenceQuestions) return;
  const diligence = makeFounderDiligenceRoom();
  window.MajlisAlphaFounderDiligence = diligence;
  if (els.openFounderDiligenceNext) {
    els.openFounderDiligenceNext.textContent = diligence.nextQuestion.buttonLabel;
  }
  els.founderDiligenceSummary.innerHTML = `
    <div class="founder-diligence-hero ${escapeAttr(diligence.statusClass)}">
      <div>
        <span>${escapeHtml(diligence.statusLabel)}</span>
        <strong>${escapeHtml(diligence.headline)}</strong>
        <p>${escapeHtml(diligence.summary)}</p>
      </div>
      <div class="founder-diligence-score">
        <span>Diligence score</span>
        <strong>${escapeHtml(diligence.score)}%</strong>
      </div>
    </div>
  `;
  els.founderDiligenceGrid.innerHTML = diligence.cards.map((card) => `
    <article class="founder-diligence-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.founderDiligenceQuestions.innerHTML = diligence.questions.map((question) => `
    <article class="founder-diligence-question ${escapeAttr(question.className)}">
      <span>${escapeHtml(question.lane)}</span>
      <strong>${escapeHtml(question.question)}</strong>
      <p>${escapeHtml(question.answer)}</p>
      <em>${escapeHtml(question.owner)}</em>
    </article>
  `).join("");
}

function makeFounderDiligenceRoom() {
  const board = makeFounderBoardPackCenter();
  const revenue = board.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = board.accountHealth || makeAccountHealthCommandCenter();
  const proofPacket = board.proofPacket || makePilotProofPacket();
  const pagesAudit = board.pagesAudit || makePagesDeploymentAudit();
  const smokeAudit = board.smokeAudit || makeLiveSmokeTestAudit();
  const deploymentScore = Math.min(pagesAudit.score, smokeAudit.score);
  const realSourceRows = SAMPLE_DOCS.filter((doc) => normalizeSourceStatus(doc.sourceStatus) === "real").length + state.sourcePackDocs.length;
  const reviewCount = state.memoReviews.length;
  const decisionCount = state.decisionJournal.length;
  const evidenceCount = state.pilotEvidenceLedger.length;
  const verifiedEvidence = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const revenueProof = state.pilotEvidenceLedger.filter((entry) => entry.type === "revenue-proof").length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const sourceProofScore = clampScore(realSourceRows * 12 + verifiedEvidence * 8 + reviewCount * 5);
  const commercialScore = clampScore(revenue.score * 0.58 + board.score * 0.2 + revenueProof * 10 + paidIntentSessions * 8);
  const governanceScore = clampScore(deploymentScore * 0.45 + reviewCount * 12 + decisionCount * 8 + verifiedEvidence * 4);
  const diligenceScore = clampScore(
    board.score * 0.22
    + revenue.score * 0.18
    + proofPacket.score * 0.18
    + accountHealth.score * 0.14
    + sourceProofScore * 0.12
    + governanceScore * 0.1
    + commercialScore * 0.06
  );
  const statusClass = diligenceScore >= 75 ? "is-good" : diligenceScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = diligenceScore >= 75 ? "Diligence ready" : diligenceScore >= 50 ? "Diligence forming" : "Diligence needs proof";
  const headline = diligenceScore >= 75
    ? "The hard questions have a source-backed answer."
    : "Treat diligence as a proof checklist before any serious pitch.";
  const questions = makeFounderDiligenceQuestions({
    board,
    revenue,
    accountHealth,
    proofPacket,
    deploymentScore,
    sourceProofScore,
    commercialScore,
    governanceScore,
    realSourceRows,
    reviewCount,
    decisionCount,
    evidenceCount,
    verifiedEvidence,
    revenueProof,
    paidIntentSessions
  });
  const nextQuestion = questions.find((question) => !question.passed) || questions[questions.length - 1];
  const cards = [
    makeFounderDiligenceCard({
      label: "Diligence readiness",
      passed: diligenceScore >= 60,
      value: `${diligenceScore}%`,
      detail: "Weighted view of board pack, revenue, proof, account health, source proof, governance, and commercial evidence.",
      status: diligenceScore >= 75 ? "ready" : diligenceScore >= 50 ? "forming" : "prove"
    }),
    makeFounderDiligenceCard({
      label: "Commercial proof",
      passed: commercialScore >= 45,
      value: `${commercialScore}%`,
      detail: `Forecast MRR is AED ${formatInteger(revenue.metrics.forecastMrr)} with ${revenueProof} revenue proof item${revenueProof === 1 ? "" : "s"} and ${paidIntentSessions} paid-intent session${paidIntentSessions === 1 ? "" : "s"}.`,
      status: commercialScore >= 55 ? "defend" : "gap"
    }),
    makeFounderDiligenceCard({
      label: "Customer proof",
      passed: proofPacket.score >= 50 || evidenceCount > 0,
      value: `${proofPacket.score}%`,
      detail: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"} captured and ${verifiedEvidence} verified.`,
      status: proofPacket.score >= 50 ? "credible" : "thin"
    }),
    makeFounderDiligenceCard({
      label: "Source moat",
      passed: sourceProofScore >= 45,
      value: `${sourceProofScore}%`,
      detail: `${realSourceRows} real/source-pack record${realSourceRows === 1 ? "" : "s"}, ${reviewCount} review${reviewCount === 1 ? "" : "s"}, and ${verifiedEvidence} verified proof item${verifiedEvidence === 1 ? "" : "s"}.`,
      status: sourceProofScore >= 55 ? "source-backed" : "starter"
    }),
    makeFounderDiligenceCard({
      label: "Risk controls",
      passed: governanceScore >= 55,
      value: `${governanceScore}%`,
      detail: `Deployment is ${deploymentScore}%, with ${reviewCount} review${reviewCount === 1 ? "" : "s"} and ${decisionCount} decision${decisionCount === 1 ? "" : "s"} logged.`,
      status: governanceScore >= 60 ? "controlled" : "tighten"
    }),
    makeFounderDiligenceCard({
      label: "Next hard question",
      passed: Boolean(nextQuestion),
      value: nextQuestion.lane,
      detail: `${nextQuestion.question} ${nextQuestion.answer}`,
      status: "next"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: diligenceScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Diligence score is ${diligenceScore}%. Commercial proof is ${commercialScore}%, source proof is ${sourceProofScore}%, governance is ${governanceScore}%, and board pack is ${board.score}%. Next: ${nextQuestion.question}`,
    nextQuestion,
    cards,
    questions,
    metrics: {
      commercialScore,
      sourceProofScore,
      governanceScore,
      boardScore: board.score,
      forecastMrr: revenue.metrics.forecastMrr,
      runRateArr: revenue.metrics.runRateArr,
      evidenceCount,
      verifiedEvidence,
      realSourceRows,
      reviewCount,
      decisionCount,
      deploymentScore
    },
    board,
    revenue,
    accountHealth,
    proofPacket,
    pagesAudit,
    smokeAudit
  };
}

function makeFounderDiligenceCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "gap" || status === "prove" || status === "thin" ? "is-error" : "is-warning"
  };
}

function makeFounderDiligenceQuestions({ board, revenue, accountHealth, proofPacket, deploymentScore, sourceProofScore, commercialScore, governanceScore, realSourceRows, reviewCount, decisionCount, evidenceCount, verifiedEvidence, revenueProof, paidIntentSessions }) {
  return [
    {
      lane: "Market Wedge",
      question: "Why start with UAE listed equities?",
      answer: "ADX, DFM, Nasdaq Dubai, AED scenarios, ownership signals, and local disclosure workflows create a focused source-first wedge before expanding coverage.",
      target: "#source-playbook",
      buttonLabel: "Open source playbook",
      owner: "Founder",
      passed: SAMPLE_COMPANIES.length >= 10 && SAMPLE_DOCS.length >= 20,
      className: SAMPLE_COMPANIES.length >= 10 && SAMPLE_DOCS.length >= 20 ? "is-good" : "is-warning"
    },
    {
      lane: "Customer",
      question: "Who is showing real demand?",
      answer: accountHealth.metrics.accounts
        ? `${accountHealth.metrics.accounts} account${accountHealth.metrics.accounts === 1 ? "" : "s"} mapped. Next account is ${accountHealth.nextAccount.account}.`
        : "No named account is strong yet. Capture one pilot account and one real UAE market question.",
      target: "#account-health-command",
      buttonLabel: "Open account health",
      owner: "Founder",
      passed: accountHealth.score >= 35,
      className: accountHealth.score >= 50 ? "is-good" : "is-warning"
    },
    {
      lane: "Revenue",
      question: "What revenue is real versus projected?",
      answer: `Forecast MRR is AED ${formatInteger(revenue.metrics.forecastMrr)} and weighted pipeline is AED ${formatInteger(revenue.metrics.weightedMrr)}. ${revenueProof} revenue-proof item${revenueProof === 1 ? "" : "s"} support it.`,
      target: "#founder-revenue-forecast",
      buttonLabel: "Open revenue forecast",
      owner: "Founder",
      passed: commercialScore >= 45,
      className: commercialScore >= 55 ? "is-good" : "is-error"
    },
    {
      lane: "Proof",
      question: "What evidence would convince a skeptical pilot buyer?",
      answer: evidenceCount
        ? `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"} captured, ${verifiedEvidence} verified, and proof packet score is ${proofPacket.score}%.`
        : "Save one use-case, source-proof, output-proof, or revenue-proof entry before stronger claims.",
      target: "#pilot-evidence-ledger",
      buttonLabel: "Open evidence ledger",
      owner: "Operator",
      passed: proofPacket.score >= 50 || evidenceCount > 0,
      className: proofPacket.score >= 50 || evidenceCount ? "is-good" : "is-error"
    },
    {
      lane: "Defensibility",
      question: "What makes this hard to copy?",
      answer: sourceProofScore >= 45
        ? `The source workflow is improving: ${realSourceRows} real/source-pack record${realSourceRows === 1 ? "" : "s"}, ${reviewCount} review${reviewCount === 1 ? "" : "s"}, and ${verifiedEvidence} verified proof item${verifiedEvidence === 1 ? "" : "s"}.`
        : "The moat is still workflow depth plus UAE source discipline. Add REAL source records and review trail to defend it.",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      owner: "Operator",
      passed: sourceProofScore >= 45,
      className: sourceProofScore >= 55 ? "is-good" : "is-warning"
    },
    {
      lane: "Controls",
      question: "What could go wrong and how is it controlled?",
      answer: governanceScore >= 55
        ? `Controls are visible: deployment ${deploymentScore}%, ${reviewCount} review${reviewCount === 1 ? "" : "s"}, and ${decisionCount} decision${decisionCount === 1 ? "" : "s"}.`
        : "The risk answer needs stronger review logs, decision trail, and deployment checks before external diligence.",
      target: governanceScore >= 55 ? "#compliance-audit" : "#memo-review-room",
      buttonLabel: governanceScore >= 55 ? "Open compliance" : "Open review room",
      owner: "Founder",
      passed: governanceScore >= 55,
      className: governanceScore >= 60 ? "is-good" : "is-warning"
    },
    {
      lane: "This Week",
      question: "What must happen next?",
      answer: board.nextAction
        ? `${board.nextAction.title}: ${board.nextAction.detail}`
        : "Create one board-pack next action before the next founder update.",
      target: board.nextAction?.target || "#founder-board-pack",
      buttonLabel: board.nextAction?.buttonLabel || "Open board pack",
      owner: "Founder",
      passed: paidIntentSessions > 0 || verifiedEvidence > 0 || board.score >= 50,
      className: paidIntentSessions || verifiedEvidence || board.score >= 50 ? "is-good" : "is-warning"
    }
  ];
}

function openFounderDiligenceNext() {
  const diligence = makeFounderDiligenceRoom();
  document.querySelector(diligence.nextQuestion.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderDiligenceResult(`Opened: ${diligence.nextQuestion.question}`, "neutral");
}

function openFounderDiligenceBoard() {
  document.querySelector("#founder-board-pack")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFounderDiligenceResult("Founder Board Pack Center opened.", "neutral");
}

async function copyFounderDiligenceMemo() {
  const copied = await copyTextToClipboard(makeFounderDiligenceMarkdown(makeFounderDiligenceRoom()));
  flashFounderDiligenceResult(copied ? "Founder diligence memo copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportFounderDiligenceRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-founder-diligence-room-${date}.json`, JSON.stringify(makeFounderDiligenceRoom(), null, 2), "application/json;charset=utf-8");
  flashFounderDiligenceResult("Founder diligence JSON exported.", "success");
}

function makeFounderDiligenceMarkdown(diligence) {
  return [
    "# MajlisAlpha Founder Diligence Room",
    "",
    `Version: ${diligence.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Diligence score: ${diligence.score}% (${diligence.statusLabel})`,
    `Forecast MRR: AED ${formatInteger(diligence.metrics.forecastMrr)}`,
    `Forecast ARR: AED ${formatInteger(diligence.metrics.runRateArr)}`,
    "",
    diligence.summary,
    "",
    "## Diligence Cards",
    ...diligence.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Hard Questions",
    ...diligence.questions.map((question) => `- ${question.lane}: ${question.question} ${question.answer}`),
    "",
    "## Next Question",
    `${diligence.nextQuestion.question} ${diligence.nextQuestion.answer}`,
    "",
    "_Founder diligence is an operating workflow for product, customer, and commercialization proof. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashFounderDiligenceResult(message, tone = "neutral") {
  if (!els.founderDiligenceResult) return;
  els.founderDiligenceResult.className = `builder-result is-${tone}`;
  els.founderDiligenceResult.textContent = message;
}

function renderInvestorDataRoom() {
  if (!els.investorDataSummary || !els.investorDataGrid || !els.investorDataPackage) return;
  const room = makeInvestorDataRoom();
  window.MajlisAlphaInvestorDataRoom = room;
  if (els.openInvestorDataNext) {
    els.openInvestorDataNext.textContent = room.nextItem.buttonLabel;
  }
  els.investorDataSummary.innerHTML = `
    <div class="investor-data-hero ${escapeAttr(room.statusClass)}">
      <div>
        <span>${escapeHtml(room.statusLabel)}</span>
        <strong>${escapeHtml(room.headline)}</strong>
        <p>${escapeHtml(room.summary)}</p>
      </div>
      <div class="investor-data-score">
        <span>Data room</span>
        <strong>${escapeHtml(room.score)}%</strong>
      </div>
    </div>
  `;
  els.investorDataGrid.innerHTML = room.cards.map((card) => `
    <article class="investor-data-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorDataPackage.innerHTML = room.packageItems.map((item) => `
    <article class="investor-data-item ${escapeAttr(item.className)}">
      <span>${escapeHtml(item.lane)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.detail)}</p>
      <em>${escapeHtml(item.status)}</em>
    </article>
  `).join("");
}

function makeInvestorDataRoom() {
  const diligence = makeFounderDiligenceRoom();
  const board = diligence.board || makeFounderBoardPackCenter();
  const revenue = diligence.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = diligence.accountHealth || makeAccountHealthCommandCenter();
  const proofPacket = diligence.proofPacket || makePilotProofPacket();
  const pagesAudit = diligence.pagesAudit || makePagesDeploymentAudit();
  const smokeAudit = diligence.smokeAudit || makeLiveSmokeTestAudit();
  const deploymentScore = Math.min(pagesAudit.score, smokeAudit.score);
  const evidenceCount = state.pilotEvidenceLedger.length;
  const verifiedEvidence = state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const revenueProof = state.pilotEvidenceLedger.filter((entry) => entry.type === "revenue-proof").length;
  const sourceRows = diligence.metrics.realSourceRows;
  const reviewCount = state.memoReviews.length;
  const decisionCount = state.decisionJournal.length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const storyScore = clampScore(board.score * 0.45 + diligence.score * 0.35 + accountHealth.score * 0.2);
  const evidenceScore = clampScore(verifiedEvidence * 16 + evidenceCount * 8 + sourceRows * 6 + reviewCount * 10 + decisionCount * 8);
  const commercialScore = clampScore(revenue.score * 0.62 + revenueProof * 14 + paidIntentSessions * 10 + Math.min(revenue.metrics.weightedMrr, 1000) / 20);
  const roomScore = clampScore(
    diligence.score * 0.28
    + board.score * 0.2
    + revenue.score * 0.16
    + deploymentScore * 0.12
    + storyScore * 0.1
    + evidenceScore * 0.08
    + commercialScore * 0.06
  );
  const statusClass = roomScore >= 75 ? "is-good" : roomScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = roomScore >= 75 ? "Investor room ready" : roomScore >= 50 ? "Investor room forming" : "Investor room needs proof";
  const headline = roomScore >= 75
    ? "The founder story is packaged for external review."
    : "Use the data room as a share checklist before sending the link.";
  const packageItems = makeInvestorDataRoomItems({
    diligence,
    board,
    revenue,
    accountHealth,
    proofPacket,
    deploymentScore,
    evidenceCount,
    verifiedEvidence,
    revenueProof,
    sourceRows,
    reviewCount,
    decisionCount,
    commercialScore
  });
  const nextItem = packageItems.find((item) => !item.passed) || packageItems[packageItems.length - 1];
  const cards = [
    makeInvestorDataCard({
      label: "Room readiness",
      passed: roomScore >= 60,
      value: `${roomScore}%`,
      detail: "Weighted view of diligence, board story, revenue, deployment, evidence, and commercial signal.",
      status: roomScore >= 75 ? "share" : roomScore >= 50 ? "tighten" : "prove"
    }),
    makeInvestorDataCard({
      label: "Narrative spine",
      passed: storyScore >= 55,
      value: `${storyScore}%`,
      detail: `Board pack is ${board.score}%, diligence is ${diligence.score}%, and account health is ${accountHealth.score}%.`,
      status: storyScore >= 65 ? "clear" : "draft"
    }),
    makeInvestorDataCard({
      label: "Commercial folder",
      passed: commercialScore >= 45,
      value: `AED ${formatInteger(revenue.metrics.forecastMrr)} MRR`,
      detail: `Weighted pipeline is AED ${formatInteger(revenue.metrics.weightedMrr)} with ${revenueProof} revenue proof item${revenueProof === 1 ? "" : "s"}.`,
      status: commercialScore >= 55 ? "defensible" : "thin"
    }),
    makeInvestorDataCard({
      label: "Customer evidence",
      passed: evidenceCount > 0 || proofPacket.score >= 50,
      value: `${evidenceCount} item${evidenceCount === 1 ? "" : "s"}`,
      detail: `${verifiedEvidence} verified proof item${verifiedEvidence === 1 ? "" : "s"} and proof packet score is ${proofPacket.score}%.`,
      status: evidenceCount || proofPacket.score >= 50 ? "captured" : "missing"
    }),
    makeInvestorDataCard({
      label: "Source and controls",
      passed: sourceRows > 0 && deploymentScore >= 90,
      value: `${sourceRows} source row${sourceRows === 1 ? "" : "s"}`,
      detail: `Deployment is ${deploymentScore}% with ${reviewCount} review${reviewCount === 1 ? "" : "s"} and ${decisionCount} decision${decisionCount === 1 ? "" : "s"}.`,
      status: sourceRows && deploymentScore >= 90 ? "credible" : "tighten"
    }),
    makeInvestorDataCard({
      label: "Next share gap",
      passed: Boolean(nextItem),
      value: nextItem.lane,
      detail: `${nextItem.title}: ${nextItem.detail}`,
      status: "next"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: roomScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Investor data room score is ${roomScore}%. Narrative is ${storyScore}%, evidence is ${evidenceScore}%, commercial proof is ${commercialScore}%, and deployment is ${deploymentScore}%. Next: ${nextItem.title}.`,
    nextItem,
    cards,
    packageItems,
    metrics: {
      storyScore,
      evidenceScore,
      commercialScore,
      deploymentScore,
      forecastMrr: revenue.metrics.forecastMrr,
      weightedMrr: revenue.metrics.weightedMrr,
      runRateArr: revenue.metrics.runRateArr,
      evidenceCount,
      verifiedEvidence,
      sourceRows,
      reviewCount,
      decisionCount
    },
    diligence,
    board,
    revenue,
    accountHealth,
    proofPacket,
    pagesAudit,
    smokeAudit
  };
}

function makeInvestorDataCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "missing" || status === "thin" || status === "prove" ? "is-error" : "is-warning"
  };
}

function makeInvestorDataRoomItems({ diligence, board, revenue, accountHealth, proofPacket, deploymentScore, evidenceCount, verifiedEvidence, revenueProof, sourceRows, reviewCount, decisionCount, commercialScore }) {
  return [
    {
      lane: "Narrative",
      title: "One-page founder story",
      detail: board.score >= 50
        ? `Board pack score is ${board.score}% with a current founder ask: ${board.nextAction.title}.`
        : "Tighten the board pack before sending an external founder story.",
      status: board.score >= 60 ? "ready" : "draft",
      target: "#founder-board-pack",
      buttonLabel: "Open board pack",
      passed: board.score >= 50
    },
    {
      lane: "Diligence",
      title: "Hard-question answer set",
      detail: diligence.score >= 50
        ? `Diligence score is ${diligence.score}% and next question is: ${diligence.nextQuestion.question}`
        : "Answer the key diligence gaps before any serious advisor or investor share.",
      status: diligence.score >= 65 ? "ready" : "forming",
      target: "#founder-diligence-room",
      buttonLabel: "Open diligence room",
      passed: diligence.score >= 50
    },
    {
      lane: "Revenue",
      title: "Commercial proof folder",
      detail: `Forecast MRR is AED ${formatInteger(revenue.metrics.forecastMrr)}, weighted MRR is AED ${formatInteger(revenue.metrics.weightedMrr)}, and revenue proof items total ${revenueProof}.`,
      status: commercialScore >= 55 ? "defensible" : "thin",
      target: "#founder-revenue-forecast",
      buttonLabel: "Open revenue forecast",
      passed: commercialScore >= 45
    },
    {
      lane: "Customer Proof",
      title: "Use-case and output evidence",
      detail: evidenceCount
        ? `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"} captured, ${verifiedEvidence} verified, and proof packet score is ${proofPacket.score}%.`
        : "Capture at least one use-case, source, output, workflow, or revenue proof entry.",
      status: evidenceCount || proofPacket.score >= 50 ? "captured" : "missing",
      target: evidenceCount ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: evidenceCount ? "Open proof packet" : "Open evidence ledger",
      passed: evidenceCount > 0 || proofPacket.score >= 50
    },
    {
      lane: "Source Spine",
      title: "Source and data provenance pack",
      detail: sourceRows
        ? `${sourceRows} real/source-pack record${sourceRows === 1 ? "" : "s"} support the UAE source workflow.`
        : "Add one REAL source or source-pack record before positioning the source workflow as defensible.",
      status: sourceRows ? "source-backed" : "starter",
      target: "#source-builder",
      buttonLabel: "Open source studio",
      passed: sourceRows > 0
    },
    {
      lane: "Controls",
      title: "Deployment and review evidence",
      detail: `Deployment is ${deploymentScore}%, with ${reviewCount} review${reviewCount === 1 ? "" : "s"} and ${decisionCount} decision${decisionCount === 1 ? "" : "s"} logged.`,
      status: deploymentScore >= 90 && (reviewCount || decisionCount) ? "controlled" : "needs trail",
      target: deploymentScore >= 90 ? "#memo-review-room" : "#pages-deployment-doctor",
      buttonLabel: deploymentScore >= 90 ? "Open review room" : "Open Pages Doctor",
      passed: deploymentScore >= 90 && (reviewCount > 0 || decisionCount > 0)
    },
    {
      lane: "Ask",
      title: "Next milestone and use of help",
      detail: board.nextAction ? `${board.nextAction.title}: ${board.nextAction.detail}` : "Name the next external ask before sharing the data room.",
      status: board.score >= 60 && diligence.score >= 60 ? "clear" : "tighten",
      target: board.nextAction?.target || "#founder-board-pack",
      buttonLabel: board.nextAction?.buttonLabel || "Open next ask",
      passed: board.score >= 60 && diligence.score >= 60
    }
  ].map((item) => ({
    ...item,
    className: item.passed ? "is-good" : item.status === "missing" || item.status === "thin" ? "is-error" : "is-warning"
  }));
}

function openInvestorDataNext() {
  const room = makeInvestorDataRoom();
  document.querySelector(room.nextItem.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorDataRoomResult(`Opened: ${room.nextItem.title}.`, "neutral");
}

function openInvestorDataDiligence() {
  document.querySelector("#founder-diligence-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorDataRoomResult("Founder Diligence Room opened.", "neutral");
}

async function copyInvestorDataRoomMemo() {
  const copied = await copyTextToClipboard(makeInvestorDataRoomMarkdown(makeInvestorDataRoom()));
  flashInvestorDataRoomResult(copied ? "Investor data room memo copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorDataRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-data-room-${date}.json`, JSON.stringify(makeInvestorDataRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorDataRoomResult("Investor data room JSON exported.", "success");
}

function makeInvestorDataRoomMarkdown(room) {
  return [
    "# MajlisAlpha Investor Data Room",
    "",
    `Version: ${room.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Data room score: ${room.score}% (${room.statusLabel})`,
    `Forecast MRR: AED ${formatInteger(room.metrics.forecastMrr)}`,
    `Weighted MRR: AED ${formatInteger(room.metrics.weightedMrr)}`,
    `Forecast ARR: AED ${formatInteger(room.metrics.runRateArr)}`,
    "",
    room.summary,
    "",
    "## Data Room Cards",
    ...room.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Share Package",
    ...room.packageItems.map((item) => `- ${item.lane}: ${item.title} (${item.status}) - ${item.detail}`),
    "",
    "## Next Share Gap",
    `${room.nextItem.title}: ${room.nextItem.detail}`,
    "",
    "_Investor data room output is an operating summary for product and commercial review. MajlisAlpha is research software, not investment advice._"
  ].join("\n");
}

function flashInvestorDataRoomResult(message, tone = "neutral") {
  if (!els.investorDataResult) return;
  els.investorDataResult.className = `builder-result is-${tone}`;
  els.investorDataResult.textContent = message;
}

function renderInvestorIntroRoom() {
  if (!els.investorIntroSummary || !els.investorIntroGrid || !els.investorIntroDrafts) return;
  const room = makeInvestorIntroRoom();
  window.MajlisAlphaInvestorIntroRoom = room;
  if (els.openInvestorIntroNext) {
    els.openInvestorIntroNext.textContent = room.nextMove.buttonLabel;
  }
  els.investorIntroSummary.innerHTML = `
    <div class="investor-intro-hero ${escapeAttr(room.statusClass)}">
      <div>
        <span>${escapeHtml(room.statusLabel)}</span>
        <strong>${escapeHtml(room.headline)}</strong>
        <p>${escapeHtml(room.summary)}</p>
      </div>
      <div class="investor-intro-score">
        <span>Intro room</span>
        <strong>${escapeHtml(room.score)}%</strong>
      </div>
    </div>
  `;
  els.investorIntroGrid.innerHTML = room.cards.map((card) => `
    <article class="investor-intro-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorIntroDrafts.innerHTML = room.drafts.map((draft) => `
    <article class="investor-intro-draft ${escapeAttr(draft.className)}">
      <span>${escapeHtml(draft.lane)}</span>
      <strong>${escapeHtml(draft.title)}</strong>
      <p>${escapeHtml(draft.preview)}</p>
      <em>${escapeHtml(draft.status)}</em>
    </article>
  `).join("");
}

function makeInvestorIntroRoom() {
  const dataRoom = makeInvestorDataRoom();
  const diligence = dataRoom.diligence || makeFounderDiligenceRoom();
  const board = dataRoom.board || makeFounderBoardPackCenter();
  const revenue = dataRoom.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = dataRoom.accountHealth || makeAccountHealthCommandCenter();
  const proofPacket = dataRoom.proofPacket || makePilotProofPacket();
  const outreachReport = makePilotOutreachReport();
  const latestDraft = state.pilotOutreachDrafts[0] || null;
  const proofCount = dataRoom.metrics.evidenceCount;
  const verifiedEvidence = dataRoom.metrics.verifiedEvidence;
  const sourceRows = dataRoom.metrics.sourceRows;
  const reviewCount = dataRoom.metrics.reviewCount;
  const decisionCount = dataRoom.metrics.decisionCount;
  const forecastMrr = revenue.metrics.forecastMrr;
  const weightedMrr = revenue.metrics.weightedMrr;
  const dataRoomScore = dataRoom.score;
  const proofSignal = clampScore(proofCount * 12 + verifiedEvidence * 14 + sourceRows * 8);
  const messageSignal = clampScore(dataRoomScore * 0.44 + board.score * 0.24 + diligence.score * 0.22 + proofPacket.score * 0.1);
  const askSignal = clampScore(revenue.score * 0.42 + dataRoom.metrics.commercialScore * 0.34 + (forecastMrr > 0 ? 18 : 0) + (weightedMrr > 0 ? 10 : 0));
  const conversionAskCount = Number(outreachReport.stats[2]?.value || 0);
  const followupSignal = clampScore(outreachReport.total * 12 + conversionAskCount * 3 + reviewCount * 8 + decisionCount * 6);
  const introScore = clampScore(
    dataRoomScore * 0.34
    + messageSignal * 0.22
    + askSignal * 0.18
    + proofSignal * 0.14
    + followupSignal * 0.12
  );
  const statusClass = introScore >= 75 ? "is-good" : introScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = introScore >= 75 ? "Intro ready" : introScore >= 50 ? "Intro forming" : "Intro needs proof";
  const headline = introScore >= 75
    ? "The proof is ready to become targeted introductions."
    : "Turn the data room into sharper outreach before asking for help.";
  const drafts = makeInvestorIntroDrafts({
    dataRoom,
    diligence,
    board,
    revenue,
    accountHealth,
    proofPacket,
    latestDraft,
    proofSignal,
    messageSignal,
    askSignal,
    followupSignal
  });
  const nextMove = drafts.find((draft) => !draft.passed) || drafts[0];
  const cards = [
    makeInvestorIntroCard({
      label: "Intro readiness",
      passed: introScore >= 60,
      value: `${introScore}%`,
      detail: "Weighted view of data-room readiness, message clarity, proof, ask quality, and follow-up discipline.",
      status: introScore >= 75 ? "send" : introScore >= 50 ? "tighten" : "prove"
    }),
    makeInvestorIntroCard({
      label: "Message proof",
      passed: messageSignal >= 55,
      value: `${messageSignal}%`,
      detail: `Data room is ${dataRoomScore}%, board pack is ${board.score}%, and diligence is ${diligence.score}%.`,
      status: messageSignal >= 65 ? "clear" : "draft"
    }),
    makeInvestorIntroCard({
      label: "Ask quality",
      passed: askSignal >= 45,
      value: `${askSignal}%`,
      detail: `Forecast MRR is AED ${formatInteger(forecastMrr)} and weighted pipeline is AED ${formatInteger(weightedMrr)}.`,
      status: askSignal >= 55 ? "specific" : "soft"
    }),
    makeInvestorIntroCard({
      label: "Evidence hook",
      passed: proofSignal >= 40,
      value: `${proofSignal}%`,
      detail: `${proofCount} proof item${proofCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, and ${sourceRows} source row${sourceRows === 1 ? "" : "s"}.`,
      status: proofSignal >= 55 ? "anchored" : "thin"
    }),
    makeInvestorIntroCard({
      label: "Follow-up motion",
      passed: followupSignal >= 35,
      value: `${outreachReport.total} draft${outreachReport.total === 1 ? "" : "s"}`,
      detail: latestDraft ? `Latest draft is for ${latestDraft.account} via ${getOutreachChannelLabel(latestDraft.channel)}.` : "No outbound draft has been saved yet.",
      status: followupSignal >= 50 ? "active" : "start"
    }),
    makeInvestorIntroCard({
      label: "Next intro move",
      passed: Boolean(nextMove),
      value: nextMove.lane,
      detail: `${nextMove.title}: ${nextMove.ask}`,
      status: "next"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: introScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Investor intro score is ${introScore}%. Message proof is ${messageSignal}%, ask quality is ${askSignal}%, proof hook is ${proofSignal}%, and follow-up motion is ${followupSignal}%. Next: ${nextMove.title}.`,
    nextMove,
    cards,
    drafts,
    metrics: {
      dataRoomScore,
      messageSignal,
      askSignal,
      proofSignal,
      followupSignal,
      forecastMrr,
      weightedMrr,
      proofCount,
      verifiedEvidence,
      sourceRows,
      outreachDrafts: outreachReport.total
    },
    dataRoom,
    diligence,
    board,
    revenue,
    accountHealth,
    proofPacket
  };
}

function makeInvestorIntroCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "prove" || status === "thin" || status === "start" ? "is-error" : "is-warning"
  };
}

function makeInvestorIntroDrafts({ dataRoom, diligence, board, revenue, accountHealth, proofPacket, latestDraft, proofSignal, messageSignal, askSignal, followupSignal }) {
  const liveLink = `${LIVE_PAGES_URL}?fresh=v61#investor-data-room`;
  const proofLine = dataRoom.metrics.evidenceCount
    ? `${dataRoom.metrics.evidenceCount} proof item${dataRoom.metrics.evidenceCount === 1 ? "" : "s"}, ${dataRoom.metrics.verifiedEvidence} verified, and a ${proofPacket.score}% proof-packet score`
    : `a ${dataRoom.score}% data-room score and a ${diligence.score}% diligence score`;
  const revenueLine = `AED ${formatInteger(revenue.metrics.forecastMrr)} forecast MRR, AED ${formatInteger(revenue.metrics.weightedMrr)} weighted pipeline, and AED ${formatInteger(revenue.metrics.runRateArr)} run-rate ARR`;
  return [
    makeInvestorIntroDraft({
      lane: "Advisor",
      title: "Ask for one sharp product critique",
      target: "#investor-data-room",
      buttonLabel: "Open data room",
      passed: messageSignal >= 55,
      status: messageSignal >= 65 ? "ready" : "tighten",
      ask: "Can you review the data room and tell me the one proof gap that would stop a serious UAE pilot buyer?",
      message: `Hi [Name], I am building MajlisAlpha, a UAE source-first research desk for ADX/DFM disclosures. The current data room shows ${proofLine}. I would value one sharp product critique: what proof gap would stop a serious UAE pilot buyer? ${liveLink}`
    }),
    makeInvestorIntroDraft({
      lane: "Investor",
      title: "Ask for commercial-readiness feedback",
      target: askSignal >= 45 ? "#founder-revenue-forecast" : "#pilot-evidence-ledger",
      buttonLabel: askSignal >= 45 ? "Open revenue forecast" : "Open evidence ledger",
      passed: askSignal >= 45,
      status: askSignal >= 55 ? "specific" : "soft",
      ask: "Can I send the data room and get your view on whether the commercial proof is specific enough?",
      message: `Hi [Name], quick founder update: MajlisAlpha now has an investor data room tying the UAE wedge to ${revenueLine}. I am not fundraising from this note; I want a commercial-readiness read. Is the proof specific enough to justify the next paid-pilot ask? ${liveLink}`
    }),
    makeInvestorIntroDraft({
      lane: "Partner",
      title: "Ask for a UAE market pilot introduction",
      target: "#account-health-command",
      buttonLabel: "Open account health",
      passed: accountHealth.score >= 35 && proofSignal >= 35,
      status: accountHealth.score >= 50 && proofSignal >= 45 ? "targeted" : "needs proof",
      ask: "Do you know one UAE market operator who would test a source-backed research workflow with a real question?",
      message: `Hi [Name], MajlisAlpha is focused on UAE listed-company research with source citations, AED valuation scenarios, and official-disclosure discipline. I am looking for one practical pilot intro: someone who asks real UAE market questions and cares about source traceability. The data room is here: ${liveLink}`
    }),
    makeInvestorIntroDraft({
      lane: "Follow-up",
      title: "Turn the latest draft into a dated next action",
      target: latestDraft ? "#pilot-outreach-composer" : "#investor-data-room",
      buttonLabel: latestDraft ? "Open outreach composer" : "Open data room",
      passed: followupSignal >= 35,
      status: latestDraft ? "active" : "start",
      ask: latestDraft ? `Send or refine the latest ${getOutreachChannelLabel(latestDraft.channel)} draft for ${latestDraft.account}.` : "Create one outbound draft from the data room before calling the intro motion active.",
      message: latestDraft
        ? latestDraft.message
        : `Hi [Name], I have a short MajlisAlpha data room ready. It explains the UAE wedge, current proof, revenue story, controls, and next pilot ask. Could I send it for one honest read this week? ${liveLink}`
    })
  ];
}

function makeInvestorIntroDraft({ lane, title, target, buttonLabel, passed, status, ask, message }) {
  return {
    lane,
    title,
    target,
    buttonLabel,
    passed: Boolean(passed),
    status,
    ask,
    message,
    preview: `${ask} ${snippet(message, 220)}`,
    className: passed ? "is-good" : status === "needs proof" || status === "soft" || status === "start" ? "is-error" : "is-warning"
  };
}

function openInvestorIntroNext() {
  const room = makeInvestorIntroRoom();
  document.querySelector(room.nextMove.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorIntroRoomResult(`Opened: ${room.nextMove.title}.`, "neutral");
}

function openInvestorIntroData() {
  document.querySelector("#investor-data-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorIntroRoomResult("Investor Data Room opened.", "neutral");
}

async function copyInvestorIntroRoomMemo() {
  const copied = await copyTextToClipboard(makeInvestorIntroRoomMarkdown(makeInvestorIntroRoom()));
  flashInvestorIntroRoomResult(copied ? "Investor intro pack copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorIntroRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-intro-room-${date}.json`, JSON.stringify(makeInvestorIntroRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorIntroRoomResult("Investor intro JSON exported.", "success");
}

function makeInvestorIntroRoomMarkdown(room) {
  return [
    "# MajlisAlpha Investor Intro Room",
    "",
    `Version: ${room.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Intro score: ${room.score}% (${room.statusLabel})`,
    `Forecast MRR: AED ${formatInteger(room.metrics.forecastMrr)}`,
    `Weighted MRR: AED ${formatInteger(room.metrics.weightedMrr)}`,
    "",
    room.summary,
    "",
    "## Intro Cards",
    ...room.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Drafts",
    ...room.drafts.map((draft) => [`### ${draft.lane}: ${draft.title}`, `Ask: ${draft.ask}`, "", draft.message].join("\n")),
    "",
    "## Next Move",
    `${room.nextMove.title}: ${room.nextMove.ask}`,
    "",
    "_Investor intro drafts are founder operating messages, not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorIntroRoomResult(message, tone = "neutral") {
  if (!els.investorIntroResult) return;
  els.investorIntroResult.className = `builder-result is-${tone}`;
  els.investorIntroResult.textContent = message;
}

function renderInvestorReplyPipeline() {
  if (!els.investorReplySummary || !els.investorReplyGrid || !els.investorReplyRows) return;
  const pipeline = makeInvestorReplyPipeline();
  window.MajlisAlphaInvestorReplyPipeline = pipeline;
  if (els.openInvestorReplyNext) {
    els.openInvestorReplyNext.textContent = pipeline.nextMove.buttonLabel;
  }
  els.investorReplySummary.innerHTML = `
    <div class="investor-reply-hero ${escapeAttr(pipeline.statusClass)}">
      <div>
        <span>${escapeHtml(pipeline.statusLabel)}</span>
        <strong>${escapeHtml(pipeline.headline)}</strong>
        <p>${escapeHtml(pipeline.summary)}</p>
      </div>
      <div class="investor-reply-score">
        <span>Reply pipeline</span>
        <strong>${escapeHtml(pipeline.score)}%</strong>
      </div>
    </div>
  `;
  els.investorReplyGrid.innerHTML = pipeline.cards.map((card) => `
    <article class="investor-reply-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorReplyRows.innerHTML = pipeline.rows.map((row) => `
    <article class="investor-reply-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
      </div>
      <div class="investor-reply-row-meta">
        <span>${escapeHtml(row.signalLabel)}</span>
        <strong>${escapeHtml(row.signalValue)}</strong>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorReplyPipeline() {
  const intro = makeInvestorIntroRoom();
  const outreach = makePilotOutreachReport();
  const conversion = makePilotConversionReport();
  const followup = makePilotFollowupReport();
  const latestDraft = state.pilotOutreachDrafts[0] || null;
  const today = makeLocalDateOffset(0);
  const openFollowups = state.pilotFollowups.filter((item) => item.stage !== "closed-lost");
  const dueFollowups = openFollowups.filter((item) => item.nextDate && item.nextDate <= today);
  const openDeals = state.pilotConversions.filter(isConversionOpen);
  const warmReplies = state.pilotConversions.filter((deal) => deal.reply && deal.reply !== "no-reply" && deal.reply !== "not-now").length;
  const weightedMrr = openDeals.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const relationshipScore = clampScore(
    intro.score * 0.3
    + Math.min(outreach.total, 4) * 10
    + Math.min(openFollowups.length, 4) * 7
    + Math.min(warmReplies, 4) * 11
    + Math.min(openDeals.length, 4) * 8
    + (weightedMrr > 0 ? 12 : 0)
    + (dueFollowups.length ? -Math.min(dueFollowups.length * 5, 15) : openFollowups.length ? 8 : 0)
  );
  const rows = makeInvestorReplyRows({ intro, latestDraft, openFollowups, dueFollowups, openDeals, warmReplies, weightedMrr });
  const nextMove = rows.find((row) => !row.passed) || rows.find((row) => row.priority === "High") || rows[0];
  const statusClass = relationshipScore >= 75 ? "is-good" : relationshipScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = relationshipScore >= 75 ? "Reply motion ready" : relationshipScore >= 50 ? "Reply motion forming" : "Reply motion needs action";
  const headline = relationshipScore >= 75
    ? "The intro room has become an operating reply queue."
    : "Move the best intro from draft to reply, proof, and next action.";
  const cards = [
    makeInvestorReplyCard({
      label: "Pipeline readiness",
      passed: relationshipScore >= 60,
      value: `${relationshipScore}%`,
      detail: "Weighted view of intro readiness, outbound drafts, open follow-ups, warm replies, and conversion value.",
      status: relationshipScore >= 75 ? "operating" : relationshipScore >= 50 ? "forming" : "start"
    }),
    makeInvestorReplyCard({
      label: "Intro assets",
      passed: intro.score >= 40,
      value: `${intro.drafts.length} drafts`,
      detail: `Intro score is ${intro.score}% with next move: ${intro.nextMove.title}.`,
      status: intro.score >= 60 ? "usable" : "tighten"
    }),
    makeInvestorReplyCard({
      label: "Warm replies",
      passed: warmReplies > 0 || Boolean(latestDraft),
      value: String(warmReplies),
      detail: latestDraft ? `Latest saved draft is for ${latestDraft.account}.` : "No saved outbound draft is available yet.",
      status: warmReplies ? "reply" : latestDraft ? "sent-ready" : "none"
    }),
    makeInvestorReplyCard({
      label: "Open relationships",
      passed: openFollowups.length > 0 || openDeals.length > 0,
      value: `${openFollowups.length + openDeals.length}`,
      detail: `${openFollowups.length} follow-up${openFollowups.length === 1 ? "" : "s"} and ${openDeals.length} conversion record${openDeals.length === 1 ? "" : "s"} are open.`,
      status: openFollowups.length || openDeals.length ? "active" : "empty"
    }),
    makeInvestorReplyCard({
      label: "Due follow-ups",
      passed: openFollowups.length > 0 && dueFollowups.length === 0,
      value: String(dueFollowups.length),
      detail: dueFollowups.length ? "One or more follow-ups are due today or overdue." : "No due follow-up is blocking the current queue.",
      status: dueFollowups.length ? "due" : openFollowups.length ? "clear" : "schedule"
    }),
    makeInvestorReplyCard({
      label: "Next reply move",
      passed: Boolean(nextMove),
      value: nextMove.lane,
      detail: `${nextMove.title}: ${nextMove.detail}`,
      status: "next"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: relationshipScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Reply pipeline score is ${relationshipScore}%. ${outreach.total} draft${outreach.total === 1 ? "" : "s"}, ${openFollowups.length} open follow-up${openFollowups.length === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and AED ${formatInteger(weightedMrr)} weighted MRR are tracked. Next: ${nextMove.title}.`,
    nextMove,
    cards,
    rows,
    metrics: {
      introScore: intro.score,
      outreachDrafts: outreach.total,
      openFollowups: openFollowups.length,
      dueFollowups: dueFollowups.length,
      openDeals: openDeals.length,
      warmReplies,
      weightedMrr,
      followupStats: followup.stats,
      conversionStats: conversion.stats
    },
    intro
  };
}

function makeInvestorReplyRows({ intro, latestDraft, openFollowups, dueFollowups, openDeals, warmReplies, weightedMrr }) {
  const advisorDraft = intro.drafts.find((draft) => draft.lane === "Advisor") || intro.drafts[0];
  const investorDraft = intro.drafts.find((draft) => draft.lane === "Investor") || intro.drafts[1] || advisorDraft;
  const partnerDraft = intro.drafts.find((draft) => draft.lane === "Partner") || intro.drafts[2] || advisorDraft;
  const followupDraft = intro.drafts.find((draft) => draft.lane === "Follow-up") || intro.drafts[3] || advisorDraft;
  const dueAccount = dueFollowups[0]?.account || openFollowups[0]?.account || latestDraft?.account || "Next UAE contact";
  return [
    makeInvestorReplyRow({
      lane: "Advisor",
      title: "Get the product critique reply",
      detail: advisorDraft.passed
        ? "Send the advisor note and ask for the one proof gap that would stop a serious UAE pilot buyer."
        : advisorDraft.ask,
      signalLabel: "Message proof",
      signalValue: `${intro.metrics.messageSignal}%`,
      status: latestDraft ? "draft saved" : advisorDraft.passed ? "send draft" : "tighten",
      target: latestDraft ? "#pilot-outreach-composer" : advisorDraft.target,
      buttonLabel: latestDraft ? "Open outreach draft" : advisorDraft.buttonLabel,
      passed: advisorDraft.passed && Boolean(latestDraft),
      priority: latestDraft ? "Medium" : "High"
    }),
    makeInvestorReplyRow({
      lane: "Investor",
      title: "Route the commercial-readiness reply",
      detail: warmReplies
        ? "A warm reply exists. Move it into conversion, source review, or paid-pilot next step."
        : investorDraft.ask,
      signalLabel: "Weighted MRR",
      signalValue: `AED ${formatInteger(weightedMrr)}`,
      status: warmReplies ? "warm reply" : openDeals.length ? "deal open" : "no reply",
      target: openDeals.length || warmReplies ? "#pilot-conversion-pipeline" : investorDraft.target,
      buttonLabel: openDeals.length || warmReplies ? "Open conversion" : investorDraft.buttonLabel,
      passed: investorDraft.passed && (warmReplies > 0 || openDeals.length > 0),
      priority: warmReplies ? "High" : "Medium"
    }),
    makeInvestorReplyRow({
      lane: "Partner",
      title: "Ask for one UAE pilot introduction",
      detail: partnerDraft.passed
        ? "Use the partner draft to ask for one operator with a real UAE market question and source-traceability concern."
        : partnerDraft.ask,
      signalLabel: "Proof hook",
      signalValue: `${intro.metrics.proofSignal}%`,
      status: partnerDraft.passed ? "targeted" : "needs proof",
      target: partnerDraft.target,
      buttonLabel: partnerDraft.buttonLabel,
      passed: partnerDraft.passed && openFollowups.length > 0,
      priority: partnerDraft.passed ? "Medium" : "High"
    }),
    makeInvestorReplyRow({
      lane: "Follow-up",
      title: `Close the loop with ${dueAccount}`,
      detail: dueFollowups.length
        ? `${dueFollowups.length} follow-up${dueFollowups.length === 1 ? "" : "s"} are due now. Clear the dated next action before starting more outreach.`
        : followupDraft.ask,
      signalLabel: "Due now",
      signalValue: String(dueFollowups.length),
      status: dueFollowups.length ? "due" : latestDraft ? "active" : "create",
      target: dueFollowups.length || openFollowups.length ? "#pilot-followup-board" : followupDraft.target,
      buttonLabel: dueFollowups.length || openFollowups.length ? "Open follow-ups" : followupDraft.buttonLabel,
      passed: Boolean(latestDraft) && dueFollowups.length === 0,
      priority: dueFollowups.length ? "High" : "Medium"
    })
  ];
}

function makeInvestorReplyCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "start" || status === "empty" || status === "none" ? "is-error" : "is-warning"
  };
}

function makeInvestorReplyRow({ lane, title, detail, signalLabel, signalValue, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    signalLabel,
    signalValue,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" || status === "due" || status === "needs proof" ? "is-error" : "is-warning"
  };
}

function openInvestorReplyNext() {
  const pipeline = makeInvestorReplyPipeline();
  document.querySelector(pipeline.nextMove.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorReplyResult(`Opened: ${pipeline.nextMove.title}.`, "neutral");
}

function openInvestorReplyIntro() {
  document.querySelector("#investor-intro-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorReplyResult("Investor Intro Room opened.", "neutral");
}

async function copyInvestorReplyPipeline() {
  const copied = await copyTextToClipboard(makeInvestorReplyPipelineMarkdown(makeInvestorReplyPipeline()));
  flashInvestorReplyResult(copied ? "Investor reply pipeline copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorReplyPipeline() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-reply-pipeline-${date}.json`, JSON.stringify(makeInvestorReplyPipeline(), null, 2), "application/json;charset=utf-8");
  flashInvestorReplyResult("Investor reply pipeline JSON exported.", "success");
}

function makeInvestorReplyPipelineMarkdown(pipeline) {
  return [
    "# MajlisAlpha Investor Reply Pipeline",
    "",
    `Version: ${pipeline.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Reply pipeline score: ${pipeline.score}% (${pipeline.statusLabel})`,
    `Open follow-ups: ${pipeline.metrics.openFollowups}`,
    `Warm replies: ${pipeline.metrics.warmReplies}`,
    `Weighted MRR: AED ${formatInteger(pipeline.metrics.weightedMrr)}`,
    "",
    pipeline.summary,
    "",
    "## Pipeline Cards",
    ...pipeline.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Reply Rows",
    ...pipeline.rows.map((row) => `- ${row.lane}: ${row.title} (${row.status}) - ${row.detail}`),
    "",
    "## Next Move",
    `${pipeline.nextMove.title}: ${pipeline.nextMove.detail}`,
    "",
    "_Investor reply pipeline notes are founder operating workflow. They are not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorReplyResult(message, tone = "neutral") {
  if (!els.investorReplyResult) return;
  els.investorReplyResult.className = `builder-result is-${tone}`;
  els.investorReplyResult.textContent = message;
}

function renderInvestorMeetingPrepRoom() {
  if (!els.investorMeetingSummary || !els.investorMeetingGrid || !els.investorMeetingAgenda) return;
  const room = makeInvestorMeetingPrepRoom();
  window.MajlisAlphaInvestorMeetingPrep = room;
  if (els.openInvestorMeetingNext) {
    els.openInvestorMeetingNext.textContent = room.nextAgenda.buttonLabel;
  }
  els.investorMeetingSummary.innerHTML = `
    <div class="investor-meeting-hero ${escapeAttr(room.statusClass)}">
      <div>
        <span>${escapeHtml(room.statusLabel)}</span>
        <strong>${escapeHtml(room.headline)}</strong>
        <p>${escapeHtml(room.summary)}</p>
      </div>
      <div class="investor-meeting-score">
        <span>Meeting prep</span>
        <strong>${escapeHtml(room.score)}%</strong>
      </div>
    </div>
  `;
  els.investorMeetingGrid.innerHTML = room.cards.map((card) => `
    <article class="investor-meeting-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorMeetingAgenda.innerHTML = room.agenda.map((item) => `
    <article class="investor-meeting-item ${escapeAttr(item.className)}">
      <div>
        <span>${escapeHtml(item.lane)}</span>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.detail)}</p>
      </div>
      <div class="investor-meeting-item-meta">
        <span>${escapeHtml(item.signalLabel)}</span>
        <strong>${escapeHtml(item.signalValue)}</strong>
        <em>${escapeHtml(item.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorMeetingPrepRoom() {
  const reply = makeInvestorReplyPipeline();
  const intro = reply.intro || makeInvestorIntroRoom();
  const dataRoom = intro.dataRoom || makeInvestorDataRoom();
  const proofPacket = intro.proofPacket || dataRoom.proofPacket || makePilotProofPacket();
  const diligence = intro.diligence || dataRoom.diligence || makeFounderDiligenceRoom();
  const conversion = makePilotConversionReport();
  const followup = makePilotFollowupReport();
  const latestDraft = state.pilotOutreachDrafts[0] || null;
  const today = makeLocalDateOffset(0);
  const openFollowups = state.pilotFollowups.filter((item) => item.stage !== "closed-lost");
  const dueFollowups = openFollowups.filter((item) => item.nextDate && item.nextDate <= today);
  const openDeals = state.pilotConversions.filter(isConversionOpen);
  const warmReplies = state.pilotConversions.filter((deal) => deal.reply && deal.reply !== "no-reply" && deal.reply !== "not-now").length;
  const sourceRows = dataRoom.metrics.sourceRows || 0;
  const relationshipSignal = clampScore(
    reply.score * 0.45
    + Math.min(warmReplies, 3) * 15
    + Math.min(openDeals.length, 3) * 10
    + Math.min(openFollowups.length, 3) * 7
    - Math.min(dueFollowups.length * 4, 12)
  );
  const proofStack = clampScore(
    dataRoom.score * 0.35
    + proofPacket.score * 0.25
    + intro.metrics.proofSignal * 0.25
    + Math.min(sourceRows, 5) * 5
    + (state.currentCitations.length ? 10 : 0)
  );
  const agendaSignal = clampScore(
    intro.score * 0.3
    + reply.score * 0.25
    + (latestDraft ? 18 : 0)
    + (openFollowups.length ? 12 : 0)
    + (openDeals.length ? 15 : 0)
  );
  const objectionSignal = clampScore(
    diligence.score * 0.35
    + sourceRows * 8
    + state.memoReviews.length * 7
    + state.decisionJournal.length * 6
    + (dueFollowups.length ? 5 : 0)
  );
  const exactAskSignal = clampScore(
    intro.metrics.askSignal * 0.45
    + (reply.metrics.weightedMrr > 0 ? 24 : 0)
    + Math.min(openDeals.length, 3) * 11
    + Math.min(warmReplies, 3) * 9
  );
  const meetingScore = clampScore(
    relationshipSignal * 0.24
    + proofStack * 0.24
    + agendaSignal * 0.2
    + objectionSignal * 0.16
    + exactAskSignal * 0.16
  );
  const agenda = makeInvestorMeetingAgenda({
    reply,
    intro,
    dataRoom,
    proofPacket,
    diligence,
    latestDraft,
    openFollowups,
    dueFollowups,
    openDeals,
    warmReplies,
    relationshipSignal,
    proofStack,
    agendaSignal,
    objectionSignal,
    exactAskSignal
  });
  const nextAgenda = agenda.find((item) => !item.passed) || agenda[0];
  const statusClass = meetingScore >= 75 ? "is-good" : meetingScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = meetingScore >= 75 ? "Meeting ready" : meetingScore >= 50 ? "Meeting forming" : "Meeting needs proof";
  const headline = meetingScore >= 75
    ? "The investor conversation has an agenda, proof order, and close ask."
    : "Use the meeting room to tighten proof, agenda, and ask before the call.";
  const cards = [
    makeInvestorMeetingCard({
      label: "Meeting readiness",
      passed: meetingScore >= 60,
      value: `${meetingScore}%`,
      detail: "Weighted view of relationship signal, proof stack, agenda clarity, objection prep, and exact ask.",
      status: meetingScore >= 75 ? "walk in" : meetingScore >= 50 ? "tighten" : "prepare"
    }),
    makeInvestorMeetingCard({
      label: "Relationship signal",
      passed: relationshipSignal >= 50,
      value: `${relationshipSignal}%`,
      detail: `${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, ${openDeals.length} open deal${openDeals.length === 1 ? "" : "s"}, and ${openFollowups.length} follow-up${openFollowups.length === 1 ? "" : "s"} are visible.`,
      status: relationshipSignal >= 65 ? "warm" : "thin"
    }),
    makeInvestorMeetingCard({
      label: "Proof stack",
      passed: proofStack >= 50,
      value: `${proofStack}%`,
      detail: `Data room is ${dataRoom.score}%, proof packet is ${proofPacket.score}%, and ${sourceRows} source row${sourceRows === 1 ? "" : "s"} are available.`,
      status: proofStack >= 65 ? "ordered" : "gap"
    }),
    makeInvestorMeetingCard({
      label: "Agenda clarity",
      passed: agendaSignal >= 50,
      value: `${agendaSignal}%`,
      detail: latestDraft ? `Latest outreach draft is for ${latestDraft.account}.` : "No saved investor-facing draft is available yet.",
      status: agendaSignal >= 65 ? "clear" : "draft"
    }),
    makeInvestorMeetingCard({
      label: "Objection prep",
      passed: objectionSignal >= 45,
      value: `${objectionSignal}%`,
      detail: `Diligence is ${diligence.score}% with ${state.memoReviews.length} review${state.memoReviews.length === 1 ? "" : "s"} and ${state.decisionJournal.length} decision${state.decisionJournal.length === 1 ? "" : "s"}.`,
      status: objectionSignal >= 60 ? "ready" : "write"
    }),
    makeInvestorMeetingCard({
      label: "Exact ask",
      passed: exactAskSignal >= 45,
      value: `${exactAskSignal}%`,
      detail: `Weighted MRR is AED ${formatInteger(reply.metrics.weightedMrr)} and intro ask quality is ${intro.metrics.askSignal}%.`,
      status: exactAskSignal >= 60 ? "specific" : "soft"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: meetingScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Meeting prep score is ${meetingScore}%. Relationship is ${relationshipSignal}%, proof stack is ${proofStack}%, agenda is ${agendaSignal}%, objections are ${objectionSignal}%, and exact ask is ${exactAskSignal}%. Next: ${nextAgenda.title}.`,
    nextAgenda,
    cards,
    agenda,
    metrics: {
      relationshipSignal,
      proofStack,
      agendaSignal,
      objectionSignal,
      exactAskSignal,
      warmReplies,
      openDeals: openDeals.length,
      openFollowups: openFollowups.length,
      dueFollowups: dueFollowups.length,
      weightedMrr: reply.metrics.weightedMrr,
      conversionStats: conversion.stats,
      followupStats: followup.stats
    },
    reply,
    intro,
    dataRoom,
    proofPacket,
    diligence
  };
}

function makeInvestorMeetingAgenda({ reply, intro, dataRoom, proofPacket, latestDraft, openFollowups, dueFollowups, openDeals, warmReplies, relationshipSignal, proofStack, agendaSignal, objectionSignal, exactAskSignal }) {
  const account = openDeals[0]?.account || openFollowups[0]?.account || latestDraft?.account || "Next UAE investor";
  return [
    makeInvestorMeetingAgendaItem({
      lane: "Opening context",
      title: "Name why the meeting exists",
      detail: warmReplies
        ? `Start with the specific reply signal from ${account} and the UAE question it points toward.`
        : "Use the reply pipeline to define the warmest relationship signal before the meeting.",
      signalLabel: "Relationship",
      signalValue: `${relationshipSignal}%`,
      status: warmReplies || latestDraft ? "anchored" : "missing",
      target: "#investor-reply-pipeline",
      buttonLabel: "Open reply signal",
      passed: relationshipSignal >= 45 && (warmReplies > 0 || Boolean(latestDraft)),
      priority: "High"
    }),
    makeInvestorMeetingAgendaItem({
      lane: "Demo route",
      title: "Show the proof path in five minutes",
      detail: intro.score >= 45
        ? "Walk from data room to intro room, then show how the desk answers one UAE source-backed question."
        : "Tighten intro assets before asking the meeting to believe the workflow.",
      signalLabel: "Agenda",
      signalValue: `${agendaSignal}%`,
      status: intro.score >= 55 ? "sequenced" : "draft",
      target: intro.score >= 45 ? "#investor-intro-room" : "#desk",
      buttonLabel: intro.score >= 45 ? "Open intro route" : "Open desk",
      passed: agendaSignal >= 50 && intro.score >= 45,
      priority: "Medium"
    }),
    makeInvestorMeetingAgendaItem({
      lane: "Evidence proof",
      title: "Bring the strongest source-backed packet",
      detail: proofStack >= 50
        ? `Use ${proofPacket.nextSection?.title || "the proof packet"} and the data-room package as the evidence spine.`
        : "Add official-source proof before making a serious external ask.",
      signalLabel: "Proof",
      signalValue: `${proofStack}%`,
      status: proofStack >= 65 ? "strong" : "gap",
      target: proofStack >= 50 ? "#pilot-proof-packet" : "#investor-data-room",
      buttonLabel: proofStack >= 50 ? "Open proof packet" : "Open data room",
      passed: proofStack >= 50,
      priority: "High"
    }),
    makeInvestorMeetingAgendaItem({
      lane: "Objections and close",
      title: "End with the exact next ask",
      detail: exactAskSignal >= 45
        ? `Ask for the next concrete step with AED ${formatInteger(reply.metrics.weightedMrr)} weighted MRR context, not vague feedback.`
        : "Define the meeting close: investor intro, buyer intro, pilot account, source review, or paid-pilot conversation.",
      signalLabel: "Ask",
      signalValue: `${exactAskSignal}%`,
      status: objectionSignal >= 45 && exactAskSignal >= 45 ? "ask ready" : "soft",
      target: exactAskSignal >= 45 ? "#pilot-conversion-pipeline" : "#founder-diligence-room",
      buttonLabel: exactAskSignal >= 45 ? "Open conversion" : "Open diligence",
      passed: objectionSignal >= 45 && exactAskSignal >= 45,
      priority: "High"
    })
  ];
}

function makeInvestorMeetingCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "prepare" || status === "gap" || status === "missing" || status === "soft" ? "is-error" : "is-warning"
  };
}

function makeInvestorMeetingAgendaItem({ lane, title, detail, signalLabel, signalValue, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    signalLabel,
    signalValue,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorMeetingNext() {
  const room = makeInvestorMeetingPrepRoom();
  document.querySelector(room.nextAgenda.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorMeetingResult(`Opened: ${room.nextAgenda.title}.`, "neutral");
}

function openInvestorMeetingReply() {
  document.querySelector("#investor-reply-pipeline")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorMeetingResult("Investor Reply Pipeline opened.", "neutral");
}

async function copyInvestorMeetingPrep() {
  const copied = await copyTextToClipboard(makeInvestorMeetingPrepMarkdown(makeInvestorMeetingPrepRoom()));
  flashInvestorMeetingResult(copied ? "Investor meeting brief copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorMeetingPrep() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-meeting-prep-${date}.json`, JSON.stringify(makeInvestorMeetingPrepRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorMeetingResult("Investor meeting prep JSON exported.", "success");
}

function makeInvestorMeetingPrepMarkdown(room) {
  return [
    "# MajlisAlpha Investor Meeting Prep Room",
    "",
    `Version: ${room.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Meeting prep score: ${room.score}% (${room.statusLabel})`,
    `Warm replies: ${room.metrics.warmReplies}`,
    `Open deals: ${room.metrics.openDeals}`,
    `Weighted MRR: AED ${formatInteger(room.metrics.weightedMrr)}`,
    "",
    room.summary,
    "",
    "## Prep Cards",
    ...room.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Meeting Agenda",
    ...room.agenda.map((item) => `- ${item.lane}: ${item.title} (${item.status}) - ${item.detail}`),
    "",
    "## Next Agenda Gap",
    `${room.nextAgenda.title}: ${room.nextAgenda.detail}`,
    "",
    "_Investor meeting prep is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorMeetingResult(message, tone = "neutral") {
  if (!els.investorMeetingResult) return;
  els.investorMeetingResult.className = `builder-result is-${tone}`;
  els.investorMeetingResult.textContent = message;
}

function renderInvestorFollowThroughBoard() {
  if (!els.investorFollowSummary || !els.investorFollowGrid || !els.investorFollowRows) return;
  const board = makeInvestorFollowThroughBoard();
  window.MajlisAlphaInvestorFollowThrough = board;
  if (els.openInvestorFollowNext) {
    els.openInvestorFollowNext.textContent = board.nextMove.buttonLabel;
  }
  els.investorFollowSummary.innerHTML = `
    <div class="investor-follow-hero ${escapeAttr(board.statusClass)}">
      <div>
        <span>${escapeHtml(board.statusLabel)}</span>
        <strong>${escapeHtml(board.headline)}</strong>
        <p>${escapeHtml(board.summary)}</p>
      </div>
      <div class="investor-follow-score">
        <span>Follow-through</span>
        <strong>${escapeHtml(board.score)}%</strong>
      </div>
    </div>
  `;
  els.investorFollowGrid.innerHTML = board.cards.map((card) => `
    <article class="investor-follow-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorFollowRows.innerHTML = board.rows.map((row) => `
    <article class="investor-follow-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
      </div>
      <div class="investor-follow-row-meta">
        <span>${escapeHtml(row.signalLabel)}</span>
        <strong>${escapeHtml(row.signalValue)}</strong>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorFollowThroughBoard() {
  const meeting = makeInvestorMeetingPrepRoom();
  const reply = meeting.reply || makeInvestorReplyPipeline();
  const intro = meeting.intro || reply.intro || makeInvestorIntroRoom();
  const dataRoom = meeting.dataRoom || intro.dataRoom || makeInvestorDataRoom();
  const proofPacket = meeting.proofPacket || intro.proofPacket || dataRoom.proofPacket || makePilotProofPacket();
  const conversion = makePilotConversionReport();
  const followup = makePilotFollowupReport();
  const today = makeLocalDateOffset(0);
  const latestDraft = state.pilotOutreachDrafts[0] || null;
  const openFollowups = state.pilotFollowups.filter((item) => item.stage !== "closed-lost");
  const dueFollowups = openFollowups.filter((item) => item.nextDate && item.nextDate <= today);
  const openDeals = state.pilotConversions.filter(isConversionOpen);
  const warmReplies = state.pilotConversions.filter((deal) => deal.reply && deal.reply !== "no-reply" && deal.reply !== "not-now").length;
  const weightedMrr = openDeals.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const sourceRows = dataRoom.metrics.sourceRows || 0;
  const verifiedEvidence = dataRoom.metrics.verifiedEvidence || 0;
  const nextDateCount = openFollowups.filter((item) => item.nextDate).length + openDeals.filter((deal) => deal.nextDate).length;
  const recapSignal = clampScore(
    meeting.score * 0.32
    + (latestDraft ? 18 : 0)
    + Math.min(openFollowups.length, 3) * 10
    + (dueFollowups.length ? -Math.min(dueFollowups.length * 8, 18) : openFollowups.length ? 8 : 0)
  );
  const proofDeliverySignal = clampScore(
    meeting.metrics.proofStack * 0.38
    + proofPacket.score * 0.24
    + verifiedEvidence * 10
    + sourceRows * 6
    + (state.currentCitations.length ? 8 : 0)
  );
  const introAskSignal = clampScore(
    meeting.metrics.relationshipSignal * 0.35
    + intro.metrics.askSignal * 0.25
    + Math.min(warmReplies, 3) * 12
    + Math.min(openDeals.length, 3) * 10
    + (weightedMrr > 0 ? 16 : 0)
  );
  const decisionPathSignal = clampScore(
    meeting.metrics.exactAskSignal * 0.35
    + Math.min(openDeals.length, 4) * 14
    + Math.min(warmReplies, 4) * 9
    + (conversion.total ? 8 : 0)
    + (weightedMrr > 0 ? 18 : 0)
  );
  const nextDateSignal = clampScore(
    nextDateCount * 22
    + (openFollowups.length || openDeals.length ? 18 : 0)
    + (dueFollowups.length ? -Math.min(dueFollowups.length * 12, 30) : 18)
  );
  const followScore = clampScore(
    recapSignal * 0.22
    + proofDeliverySignal * 0.24
    + introAskSignal * 0.2
    + decisionPathSignal * 0.2
    + nextDateSignal * 0.14
  );
  const rows = makeInvestorFollowThroughRows({
    meeting,
    dataRoom,
    proofPacket,
    latestDraft,
    openFollowups,
    dueFollowups,
    openDeals,
    warmReplies,
    weightedMrr,
    recapSignal,
    proofDeliverySignal,
    introAskSignal,
    decisionPathSignal,
    nextDateSignal
  });
  const nextMove = rows.find((row) => !row.passed) || rows[0];
  const statusClass = followScore >= 75 ? "is-good" : followScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = followScore >= 75 ? "Follow-through ready" : followScore >= 50 ? "Follow-through forming" : "Follow-through needs action";
  const headline = followScore >= 75
    ? "The meeting has a recap, proof path, and next decision motion."
    : "Turn the meeting into dated proof, intros, and a concrete next step.";
  const cards = [
    makeInvestorFollowCard({
      label: "Follow-through score",
      passed: followScore >= 60,
      value: `${followScore}%`,
      detail: "Weighted view of recap discipline, proof delivery, intro asks, decision path, and next-date hygiene.",
      status: followScore >= 75 ? "moving" : followScore >= 50 ? "forming" : "act"
    }),
    makeInvestorFollowCard({
      label: "Meeting recap",
      passed: recapSignal >= 50,
      value: `${recapSignal}%`,
      detail: latestDraft ? `Latest saved outreach is for ${latestDraft.account}.` : "No saved recap or outbound note exists yet.",
      status: recapSignal >= 65 ? "clear" : "write"
    }),
    makeInvestorFollowCard({
      label: "Proof delivery",
      passed: proofDeliverySignal >= 50,
      value: `${proofDeliverySignal}%`,
      detail: `${verifiedEvidence} verified proof item${verifiedEvidence === 1 ? "" : "s"}, ${sourceRows} source row${sourceRows === 1 ? "" : "s"}, and proof packet score is ${proofPacket.score}%.`,
      status: proofDeliverySignal >= 65 ? "sent-ready" : "gap"
    }),
    makeInvestorFollowCard({
      label: "Intro asks",
      passed: introAskSignal >= 45,
      value: `${warmReplies} warm`,
      detail: `${openDeals.length} open deal${openDeals.length === 1 ? "" : "s"} and AED ${formatInteger(weightedMrr)} weighted MRR are visible.`,
      status: introAskSignal >= 60 ? "specific" : "soft"
    }),
    makeInvestorFollowCard({
      label: "Decision path",
      passed: decisionPathSignal >= 45,
      value: `${decisionPathSignal}%`,
      detail: `${conversion.total} conversion record${conversion.total === 1 ? "" : "s"} and ${openDeals.length} open path${openDeals.length === 1 ? "" : "s"} are tracked.`,
      status: decisionPathSignal >= 60 ? "routed" : "unclear"
    }),
    makeInvestorFollowCard({
      label: "Next date",
      passed: nextDateSignal >= 50 && dueFollowups.length === 0,
      value: dueFollowups.length ? `${dueFollowups.length} due` : `${nextDateCount} dated`,
      detail: dueFollowups.length ? "One or more follow-through items are due now or overdue." : "No due follow-through item is blocking the current board.",
      status: dueFollowups.length ? "due" : nextDateCount ? "scheduled" : "set date"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: followScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Follow-through score is ${followScore}%. Recap is ${recapSignal}%, proof delivery is ${proofDeliverySignal}%, intro asks are ${introAskSignal}%, decision path is ${decisionPathSignal}%, and next-date hygiene is ${nextDateSignal}%. Next: ${nextMove.title}.`,
    nextMove,
    cards,
    rows,
    metrics: {
      recapSignal,
      proofDeliverySignal,
      introAskSignal,
      decisionPathSignal,
      nextDateSignal,
      warmReplies,
      openDeals: openDeals.length,
      openFollowups: openFollowups.length,
      dueFollowups: dueFollowups.length,
      weightedMrr,
      followupStats: followup.stats,
      conversionStats: conversion.stats
    },
    meeting,
    reply,
    intro,
    dataRoom,
    proofPacket
  };
}

function makeInvestorFollowThroughRows({ meeting, proofPacket, latestDraft, openFollowups, dueFollowups, openDeals, warmReplies, weightedMrr, recapSignal, proofDeliverySignal, introAskSignal, decisionPathSignal, nextDateSignal }) {
  const account = openDeals[0]?.account || openFollowups[0]?.account || latestDraft?.account || "Next UAE relationship";
  const datedTarget = dueFollowups[0] || openFollowups.find((item) => item.nextDate) || openDeals.find((deal) => deal.nextDate) || null;
  return [
    makeInvestorFollowRow({
      lane: "Recap",
      title: "Send the meeting recap while context is fresh",
      detail: latestDraft
        ? `Turn the saved note for ${latestDraft.account} into a recap with decision, proof requested, and next owner.`
        : "Create a short post-meeting note with what was discussed, what was promised, and what happens next.",
      signalLabel: "Recap",
      signalValue: `${recapSignal}%`,
      status: latestDraft ? "draft exists" : "write now",
      target: latestDraft ? "#pilot-outreach-composer" : "#investor-meeting-prep",
      buttonLabel: latestDraft ? "Open outreach note" : "Open meeting prep",
      passed: recapSignal >= 50 && Boolean(latestDraft || openFollowups.length),
      priority: "High"
    }),
    makeInvestorFollowRow({
      lane: "Proof",
      title: "Deliver the strongest proof packet",
      detail: proofDeliverySignal >= 50
        ? `Use ${proofPacket.nextSection?.title || "the proof packet"} as the follow-up proof spine.`
        : "Attach official-source proof, pilot evidence, or data-room material before asking for another intro.",
      signalLabel: "Proof",
      signalValue: `${proofDeliverySignal}%`,
      status: proofDeliverySignal >= 65 ? "ready" : "gap",
      target: proofDeliverySignal >= 50 ? "#pilot-proof-packet" : "#investor-data-room",
      buttonLabel: proofDeliverySignal >= 50 ? "Open proof packet" : "Open data room",
      passed: proofDeliverySignal >= 50,
      priority: "High"
    }),
    makeInvestorFollowRow({
      lane: "Intro ask",
      title: "Ask for one named operator or sponsor",
      detail: warmReplies || openDeals.length
        ? `Use the warm signal from ${account} to ask for one named UAE operator, buyer, advisor, or sponsor.`
        : "The ask is still too generic. Route it through the reply pipeline before pushing for an intro.",
      signalLabel: "Warm signal",
      signalValue: String(warmReplies),
      status: introAskSignal >= 60 ? "specific" : "soft",
      target: introAskSignal >= 45 ? "#investor-reply-pipeline" : "#investor-intro-room",
      buttonLabel: introAskSignal >= 45 ? "Open reply pipeline" : "Open intro room",
      passed: introAskSignal >= 45 && (warmReplies > 0 || openDeals.length > 0),
      priority: "Medium"
    }),
    makeInvestorFollowRow({
      lane: "Decision path",
      title: "Convert interest into a tracked next step",
      detail: openDeals.length
        ? `${openDeals.length} open conversion path${openDeals.length === 1 ? "" : "s"} are active with AED ${formatInteger(weightedMrr)} weighted MRR.`
        : "Create a conversion or follow-up record so the relationship does not stay as a nice conversation.",
      signalLabel: "Weighted MRR",
      signalValue: `AED ${formatInteger(weightedMrr)}`,
      status: openDeals.length ? "tracked" : "untracked",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion",
      passed: decisionPathSignal >= 45 && openDeals.length > 0,
      priority: "High"
    }),
    makeInvestorFollowRow({
      lane: "Next date",
      title: datedTarget ? `Keep ${account} on a dated next action` : "Set the next date before the thread goes cold",
      detail: dueFollowups.length
        ? `${dueFollowups.length} follow-through item${dueFollowups.length === 1 ? "" : "s"} are due now. Clear them before starting more outreach.`
        : datedTarget?.nextDate ? `Next action is dated ${datedTarget.nextDate}.` : "No dated next action exists yet for this relationship.",
      signalLabel: "Date hygiene",
      signalValue: `${nextDateSignal}%`,
      status: dueFollowups.length ? "due" : datedTarget ? "scheduled" : "missing",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-ups",
      passed: nextDateSignal >= 50 && dueFollowups.length === 0 && Boolean(datedTarget),
      priority: dueFollowups.length || !datedTarget ? "High" : "Medium"
    })
  ];
}

function makeInvestorFollowCard({ label, passed, value, detail, status }) {
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : status === "act" || status === "gap" || status === "unclear" || status === "due" || status === "set date" ? "is-error" : "is-warning"
  };
}

function makeInvestorFollowRow({ lane, title, detail, signalLabel, signalValue, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    signalLabel,
    signalValue,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorFollowNext() {
  const board = makeInvestorFollowThroughBoard();
  document.querySelector(board.nextMove.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorFollowResult(`Opened: ${board.nextMove.title}.`, "neutral");
}

function openInvestorFollowMeeting() {
  document.querySelector("#investor-meeting-prep")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorFollowResult("Investor Meeting Prep Room opened.", "neutral");
}

async function copyInvestorFollowThrough() {
  const copied = await copyTextToClipboard(makeInvestorFollowThroughMarkdown(makeInvestorFollowThroughBoard()));
  flashInvestorFollowResult(copied ? "Investor follow-through note copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorFollowThrough() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-follow-through-${date}.json`, JSON.stringify(makeInvestorFollowThroughBoard(), null, 2), "application/json;charset=utf-8");
  flashInvestorFollowResult("Investor follow-through JSON exported.", "success");
}

function makeInvestorFollowThroughMarkdown(board) {
  return [
    "# MajlisAlpha Investor Follow-Through Board",
    "",
    `Version: ${board.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Follow-through score: ${board.score}% (${board.statusLabel})`,
    `Open follow-ups: ${board.metrics.openFollowups}`,
    `Open deals: ${board.metrics.openDeals}`,
    `Weighted MRR: AED ${formatInteger(board.metrics.weightedMrr)}`,
    "",
    board.summary,
    "",
    "## Follow-Through Cards",
    ...board.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Relationship Rows",
    ...board.rows.map((row) => `- ${row.lane}: ${row.title} (${row.status}) - ${row.detail}`),
    "",
    "## Next Move",
    `${board.nextMove.title}: ${board.nextMove.detail}`,
    "",
    "_Investor follow-through is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorFollowResult(message, tone = "neutral") {
  if (!els.investorFollowResult) return;
  els.investorFollowResult.className = `builder-result is-${tone}`;
  els.investorFollowResult.textContent = message;
}

function renderInvestorMomentumLedger() {
  if (!els.investorMomentumSummary || !els.investorMomentumGrid || !els.investorMomentumRows) return;
  const ledger = makeInvestorMomentumLedger();
  window.MajlisAlphaInvestorMomentumLedger = ledger;
  if (els.openInvestorMomentumNext) {
    els.openInvestorMomentumNext.textContent = ledger.nextMove.buttonLabel;
  }
  els.investorMomentumSummary.innerHTML = `
    <div class="investor-momentum-hero ${escapeAttr(ledger.statusClass)}">
      <div>
        <span>${escapeHtml(ledger.statusLabel)}</span>
        <strong>${escapeHtml(ledger.headline)}</strong>
        <p>${escapeHtml(ledger.summary)}</p>
      </div>
      <div class="investor-momentum-score">
        <span>Momentum</span>
        <strong>${escapeHtml(ledger.score)}%</strong>
      </div>
    </div>
  `;
  els.investorMomentumGrid.innerHTML = ledger.cards.map((card) => `
    <article class="investor-momentum-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorMomentumRows.innerHTML = ledger.rows.map((row) => `
    <article class="investor-momentum-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
      </div>
      <div class="investor-momentum-row-meta">
        <span>${escapeHtml(row.signalLabel)}</span>
        <strong>${escapeHtml(row.signalValue)}</strong>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorMomentumLedger() {
  const follow = makeInvestorFollowThroughBoard();
  const meeting = follow.meeting || makeInvestorMeetingPrepRoom();
  const reply = follow.reply || meeting.reply || makeInvestorReplyPipeline();
  const intro = follow.intro || meeting.intro || reply.intro || makeInvestorIntroRoom();
  const dataRoom = follow.dataRoom || meeting.dataRoom || intro.dataRoom || makeInvestorDataRoom();
  const proofPacket = follow.proofPacket || meeting.proofPacket || intro.proofPacket || dataRoom.proofPacket || makePilotProofPacket();
  const today = makeLocalDateOffset(0);
  const latestDraft = state.pilotOutreachDrafts[0] || null;
  const openFollowups = state.pilotFollowups.filter((item) => item.stage !== "closed-lost");
  const dueFollowups = openFollowups.filter((item) => item.nextDate && item.nextDate <= today);
  const openDeals = state.pilotConversions.filter(isConversionOpen);
  const warmReplies = state.pilotConversions.filter((deal) => deal.reply && deal.reply !== "no-reply" && deal.reply !== "not-now").length;
  const sourceNeeded = openFollowups.filter((item) => item.stage === "source-needed").length
    + openDeals.filter((deal) => deal.stage === "source-review" || deal.reply === "source").length;
  const weightedMrr = openDeals.reduce((sum, deal) => sum + getWeightedConversionValue(deal), 0);
  const relationshipCount = new Set([
    ...openFollowups.map((item) => item.account),
    ...openDeals.map((deal) => deal.account),
    latestDraft?.account
  ].filter(Boolean)).size;
  const topAccount = openDeals[0]?.account || openFollowups[0]?.account || latestDraft?.account || "Next UAE relationship";
  const prioritySignal = clampScore(
    follow.score * 0.32
    + Math.min(relationshipCount, 5) * 8
    + Math.min(warmReplies, 4) * 10
    + Math.min(openDeals.length, 4) * 9
  );
  const proofRequestSignal = clampScore(
    follow.metrics.proofDeliverySignal * 0.38
    + proofPacket.score * 0.22
    + sourceNeeded * 12
    + (dataRoom.metrics.sourceRows || 0) * 5
    + (state.currentCitations.length ? 8 : 0)
  );
  const introSignal = clampScore(
    follow.metrics.introAskSignal * 0.45
    + intro.metrics.askSignal * 0.25
    + Math.min(warmReplies, 4) * 10
    + (latestDraft ? 10 : 0)
  );
  const commercialSignal = clampScore(
    follow.metrics.decisionPathSignal * 0.35
    + Math.min(weightedMrr, 1500) / 15
    + Math.min(openDeals.length, 4) * 10
  );
  const urgencySignal = clampScore(
    dueFollowups.length
      ? 70 + Math.min(dueFollowups.length * 10, 25)
      : openFollowups.length || openDeals.length
        ? 45 + Math.min((openFollowups.length + openDeals.length) * 8, 35)
        : 20
  );
  const momentumScore = clampScore(
    prioritySignal * 0.24
    + proofRequestSignal * 0.2
    + introSignal * 0.2
    + commercialSignal * 0.22
    + urgencySignal * 0.14
  );
  const rows = makeInvestorMomentumRows({
    follow,
    proofPacket,
    latestDraft,
    openFollowups,
    dueFollowups,
    openDeals,
    warmReplies,
    sourceNeeded,
    weightedMrr,
    relationshipCount,
    topAccount,
    prioritySignal,
    proofRequestSignal,
    introSignal,
    commercialSignal,
    urgencySignal
  });
  const nextMove = rows.find((row) => !row.passed) || rows[0];
  const statusClass = momentumScore >= 75 ? "is-good" : momentumScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = momentumScore >= 75 ? "Momentum compounding" : momentumScore >= 50 ? "Momentum forming" : "Momentum needs focus";
  const headline = momentumScore >= 75
    ? "One founder hour has a clear relationship target."
    : "Rank the next relationship move before the pipeline spreads thin.";
  const cards = [
    makeInvestorMomentumCard({
      label: "Momentum score",
      passed: momentumScore >= 60,
      value: `${momentumScore}%`,
      detail: "Weighted view of relationship priority, proof requests, warm intros, conversion value, and next-48-hour urgency.",
      status: momentumScore >= 75 ? "compounding" : momentumScore >= 50 ? "forming" : "focus"
    }),
    makeInvestorMomentumCard({
      label: "Priority relationships",
      passed: relationshipCount > 0 && prioritySignal >= 50,
      value: relationshipCount ? String(relationshipCount) : "0",
      detail: relationshipCount ? `${topAccount} is currently the first relationship to inspect.` : "No saved relationship is visible yet.",
      status: relationshipCount ? "ranked" : "empty"
    }),
    makeInvestorMomentumCard({
      label: "Proof requests",
      passed: proofRequestSignal >= 50,
      value: sourceNeeded ? `${sourceNeeded} open` : `${proofRequestSignal}%`,
      detail: sourceNeeded ? "One or more relationships need official-source proof before the next ask." : "No urgent source-request blocker is visible.",
      status: sourceNeeded ? "serve proof" : proofRequestSignal >= 65 ? "ready" : "thin"
    }),
    makeInvestorMomentumCard({
      label: "Warm intros",
      passed: introSignal >= 50 && warmReplies > 0,
      value: `${warmReplies} warm`,
      detail: warmReplies ? "Warm reply signal can be turned into one named intro ask." : "Warm reply signal is still missing.",
      status: warmReplies ? "ask" : "build"
    }),
    makeInvestorMomentumCard({
      label: "Conversion value",
      passed: commercialSignal >= 50 && (weightedMrr > 0 || openDeals.length > 0),
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `${openDeals.length} open conversion path${openDeals.length === 1 ? "" : "s"} are visible in the ledger.`,
      status: weightedMrr ? "priced" : openDeals.length ? "scoped" : "unpriced"
    }),
    makeInvestorMomentumCard({
      label: "Next 48 hours",
      passed: urgencySignal >= 50 && dueFollowups.length === 0 && (openFollowups.length || openDeals.length),
      value: dueFollowups.length ? `${dueFollowups.length} due` : `${urgencySignal}%`,
      detail: dueFollowups.length ? "Clear due follow-ups before starting another relationship thread." : "No due relationship item is blocking the next 48 hours.",
      status: dueFollowups.length ? "due now" : openFollowups.length || openDeals.length ? "scheduled" : "quiet"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: momentumScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Momentum score is ${momentumScore}%. Priority is ${prioritySignal}%, proof demand is ${proofRequestSignal}%, intro warmth is ${introSignal}%, commercial value is ${commercialSignal}%, and next-48-hour urgency is ${urgencySignal}%. Next: ${nextMove.title}.`,
    nextMove,
    cards,
    rows,
    metrics: {
      prioritySignal,
      proofRequestSignal,
      introSignal,
      commercialSignal,
      urgencySignal,
      relationshipCount,
      warmReplies,
      openDeals: openDeals.length,
      openFollowups: openFollowups.length,
      dueFollowups: dueFollowups.length,
      sourceNeeded,
      weightedMrr
    },
    follow,
    meeting,
    reply,
    intro,
    dataRoom,
    proofPacket
  };
}

function makeInvestorMomentumRows({ follow, proofPacket, latestDraft, openFollowups, dueFollowups, openDeals, warmReplies, sourceNeeded, weightedMrr, relationshipCount, topAccount, prioritySignal, proofRequestSignal, introSignal, commercialSignal, urgencySignal }) {
  const datedTarget = dueFollowups[0] || openFollowups.find((item) => item.nextDate) || openDeals.find((deal) => deal.nextDate) || null;
  return [
    makeInvestorMomentumRow({
      lane: "Relationship priority",
      title: relationshipCount ? `Rank ${topAccount} before opening a new thread` : "Capture the first investor relationship",
      detail: relationshipCount
        ? `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"} have activity across follow-ups, conversion records, or outreach drafts.`
        : "The ledger needs one saved follow-up, outreach note, or conversion path before it can rank momentum.",
      signalLabel: "Priority",
      signalValue: `${prioritySignal}%`,
      status: relationshipCount ? "ranked" : "empty",
      target: relationshipCount ? "#investor-follow-through" : "#pilot-outreach-composer",
      buttonLabel: relationshipCount ? "Open follow-through" : "Open outreach",
      passed: relationshipCount > 0 && prioritySignal >= 50,
      priority: "High"
    }),
    makeInvestorMomentumRow({
      lane: "Proof request",
      title: sourceNeeded ? "Serve the requested source proof" : "Keep proof ready before the next ask",
      detail: sourceNeeded
        ? `${sourceNeeded} relationship motion${sourceNeeded === 1 ? "" : "s"} are waiting on source or proof review.`
        : `Proof packet score is ${proofPacket.score}%, and follow-through proof signal is ${follow.metrics.proofDeliverySignal}%.`,
      signalLabel: "Proof",
      signalValue: sourceNeeded ? `${sourceNeeded} open` : `${proofRequestSignal}%`,
      status: sourceNeeded ? "serve" : proofRequestSignal >= 65 ? "ready" : "thin",
      target: sourceNeeded ? "#investor-data-room" : "#pilot-proof-packet",
      buttonLabel: sourceNeeded ? "Open data room" : "Open proof packet",
      passed: proofRequestSignal >= 50 && sourceNeeded === 0,
      priority: sourceNeeded ? "High" : "Medium"
    }),
    makeInvestorMomentumRow({
      lane: "Intro ask",
      title: warmReplies ? "Turn warmth into one named intro" : "Create a warmer relationship ask",
      detail: warmReplies
        ? `${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"} can support a named UAE operator, buyer, sponsor, or advisor ask.`
        : "Ask for one specific role through the reply pipeline before requesting broader introductions.",
      signalLabel: "Warmth",
      signalValue: `${introSignal}%`,
      status: warmReplies ? "ask ready" : "build",
      target: warmReplies ? "#investor-reply-pipeline" : "#investor-intro-room",
      buttonLabel: warmReplies ? "Open reply pipeline" : "Open intro room",
      passed: introSignal >= 50 && warmReplies > 0,
      priority: warmReplies ? "Medium" : "High"
    }),
    makeInvestorMomentumRow({
      lane: "Commercial path",
      title: openDeals.length ? "Push the priced conversion lane" : "Attach a commercial lane to the relationship",
      detail: openDeals.length
        ? `${openDeals.length} open conversion path${openDeals.length === 1 ? "" : "s"} carry AED ${formatInteger(weightedMrr)} weighted MRR.`
        : "Create a conversion path so investor, advisor, or customer interest has a measurable paid-pilot route.",
      signalLabel: "Weighted MRR",
      signalValue: `AED ${formatInteger(weightedMrr)}`,
      status: weightedMrr ? "priced" : openDeals.length ? "scoped" : "missing",
      target: "#pilot-conversion-pipeline",
      buttonLabel: "Open conversion",
      passed: commercialSignal >= 50 && (weightedMrr > 0 || openDeals.length > 0),
      priority: "High"
    }),
    makeInvestorMomentumRow({
      lane: "Next 48 hours",
      title: datedTarget ? `Protect the next action for ${topAccount}` : "Set a dated next relationship move",
      detail: dueFollowups.length
        ? `${dueFollowups.length} follow-up${dueFollowups.length === 1 ? "" : "s"} are due now. Clear those first.`
        : datedTarget?.nextDate ? `Next action is dated ${datedTarget.nextDate}.` : "No dated next action is visible for the current relationship queue.",
      signalLabel: "Urgency",
      signalValue: `${urgencySignal}%`,
      status: dueFollowups.length ? "due" : datedTarget ? "scheduled" : "missing",
      target: "#pilot-followup-board",
      buttonLabel: "Open follow-ups",
      passed: urgencySignal >= 50 && dueFollowups.length === 0 && Boolean(datedTarget),
      priority: dueFollowups.length || !datedTarget ? "High" : "Medium"
    })
  ];
}

function makeInvestorMomentumCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["forming", "thin", "build", "scoped", "quiet", "scheduled"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorMomentumRow({ lane, title, detail, signalLabel, signalValue, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    signalLabel,
    signalValue,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorMomentumNext() {
  const ledger = makeInvestorMomentumLedger();
  document.querySelector(ledger.nextMove.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorMomentumResult(`Opened: ${ledger.nextMove.title}.`, "neutral");
}

function openInvestorMomentumFollow() {
  document.querySelector("#investor-follow-through")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorMomentumResult("Investor Follow-Through Board opened.", "neutral");
}

async function copyInvestorMomentumLedger() {
  const copied = await copyTextToClipboard(makeInvestorMomentumLedgerMarkdown(makeInvestorMomentumLedger()));
  flashInvestorMomentumResult(copied ? "Investor momentum ledger copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorMomentumLedger() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-momentum-ledger-${date}.json`, JSON.stringify(makeInvestorMomentumLedger(), null, 2), "application/json;charset=utf-8");
  flashInvestorMomentumResult("Investor momentum ledger JSON exported.", "success");
}

function makeInvestorMomentumLedgerMarkdown(ledger) {
  return [
    "# MajlisAlpha Investor Momentum Ledger",
    "",
    `Version: ${ledger.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Momentum score: ${ledger.score}% (${ledger.statusLabel})`,
    `Relationships: ${ledger.metrics.relationshipCount}`,
    `Warm replies: ${ledger.metrics.warmReplies}`,
    `Open deals: ${ledger.metrics.openDeals}`,
    `Weighted MRR: AED ${formatInteger(ledger.metrics.weightedMrr)}`,
    "",
    ledger.summary,
    "",
    "## Momentum Cards",
    ...ledger.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Ledger Rows",
    ...ledger.rows.map((row) => `- ${row.lane}: ${row.title} (${row.status}) - ${row.detail}`),
    "",
    "## Next Move",
    `${ledger.nextMove.title}: ${ledger.nextMove.detail}`,
    "",
    "_Investor momentum ledger is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorMomentumResult(message, tone = "neutral") {
  if (!els.investorMomentumResult) return;
  els.investorMomentumResult.className = `builder-result is-${tone}`;
  els.investorMomentumResult.textContent = message;
}

function renderInvestorUpdateComposer() {
  if (!els.investorUpdateSummary || !els.investorUpdateGrid || !els.investorUpdateDrafts) return;
  const composer = makeInvestorUpdateComposer();
  window.MajlisAlphaInvestorUpdateComposer = composer;
  if (els.openInvestorUpdateNext) {
    els.openInvestorUpdateNext.textContent = composer.nextDraft.buttonLabel;
  }
  els.investorUpdateSummary.innerHTML = `
    <div class="investor-update-hero ${escapeAttr(composer.statusClass)}">
      <div>
        <span>${escapeHtml(composer.statusLabel)}</span>
        <strong>${escapeHtml(composer.headline)}</strong>
        <p>${escapeHtml(composer.summary)}</p>
      </div>
      <div class="investor-update-score">
        <span>Update</span>
        <strong>${escapeHtml(composer.score)}%</strong>
      </div>
    </div>
  `;
  els.investorUpdateGrid.innerHTML = composer.cards.map((card) => `
    <article class="investor-update-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorUpdateDrafts.innerHTML = composer.drafts.map((draft) => `
    <article class="investor-update-draft ${escapeAttr(draft.className)}">
      <div>
        <span>${escapeHtml(draft.lane)}</span>
        <strong>${escapeHtml(draft.title)}</strong>
        <p>${escapeHtml(draft.body)}</p>
      </div>
      <div class="investor-update-draft-meta">
        <span>${escapeHtml(draft.owner)}</span>
        <strong>${escapeHtml(draft.signal)}</strong>
        <em>${escapeHtml(draft.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorUpdateComposer() {
  const momentum = makeInvestorMomentumLedger();
  const dataRoom = momentum.dataRoom || makeInvestorDataRoom();
  const diligence = dataRoom.diligence || makeFounderDiligenceRoom();
  const board = dataRoom.board || diligence.board || makeFounderBoardPackCenter();
  const revenue = dataRoom.revenue || board.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = dataRoom.accountHealth || board.accountHealth || makeAccountHealthCommandCenter();
  const proofPacket = dataRoom.proofPacket || board.proofPacket || makePilotProofPacket();
  const latestConversion = state.pilotConversions[0] || null;
  const latestFollowup = state.pilotFollowups[0] || null;
  const latestDraft = state.pilotOutreachDrafts[0] || null;
  const account = latestConversion?.account || latestFollowup?.account || latestDraft?.account || "Next UAE relationship";
  const evidenceCount = dataRoom.metrics.evidenceCount || state.pilotEvidenceLedger.length;
  const verifiedEvidence = dataRoom.metrics.verifiedEvidence || state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const revenueProof = state.pilotEvidenceLedger.filter((entry) => entry.type === "revenue-proof").length;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const sourceRows = dataRoom.metrics.sourceRows || 0;
  const reviewCount = dataRoom.metrics.reviewCount || state.memoReviews.length;
  const decisionCount = dataRoom.metrics.decisionCount || state.decisionJournal.length;
  const deploymentScore = dataRoom.metrics.deploymentScore || Math.min(makePagesDeploymentAudit().score, makeLiveSmokeTestAudit().score);
  const proofSpineScore = clampScore(
    proofPacket.score * 0.34
    + verifiedEvidence * 14
    + evidenceCount * 7
    + sourceRows * 5
    + (state.currentCitations.length ? 8 : 0)
  );
  const revenueSignal = clampScore(
    revenue.score * 0.42
    + Math.min(revenue.metrics.weightedMrr || 0, 1500) / 20
    + Math.min(revenue.metrics.forecastMrr || 0, 1500) / 25
    + revenueProof * 14
    + paidIntentSessions * 9
  );
  const customerSignal = clampScore(
    accountHealth.score * 0.3
    + proofPacket.score * 0.25
    + evidenceCount * 8
    + Math.min(momentum.metrics.relationshipCount, 5) * 8
    + Math.min(momentum.metrics.warmReplies, 4) * 7
  );
  const sourceMoatSignal = clampScore(
    sourceRows * 9
    + reviewCount * 10
    + decisionCount * 8
    + deploymentScore * 0.2
    + diligence.score * 0.16
  );
  const askClarity = clampScore(
    momentum.metrics.prioritySignal * 0.25
    + momentum.metrics.introSignal * 0.22
    + momentum.metrics.commercialSignal * 0.28
    + (board.nextAction ? 15 : 0)
    + (momentum.nextMove ? 10 : 0)
  );
  const updateScore = clampScore(
    dataRoom.score * 0.22
    + momentum.score * 0.2
    + proofSpineScore * 0.18
    + revenueSignal * 0.16
    + customerSignal * 0.12
    + sourceMoatSignal * 0.07
    + askClarity * 0.05
  );
  const drafts = makeInvestorUpdateDrafts({
    account,
    momentum,
    dataRoom,
    diligence,
    board,
    revenue,
    accountHealth,
    proofPacket,
    latestConversion,
    latestFollowup,
    proofSpineScore,
    revenueSignal,
    customerSignal,
    sourceMoatSignal,
    askClarity,
    evidenceCount,
    verifiedEvidence,
    revenueProof,
    paidIntentSessions,
    sourceRows,
    deploymentScore
  });
  const nextDraft = drafts.find((draft) => !draft.passed) || drafts[drafts.length - 1];
  const statusClass = updateScore >= 75 ? "is-good" : updateScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = updateScore >= 75 ? "Update ready" : updateScore >= 50 ? "Update forming" : "Update needs proof";
  const headline = updateScore >= 75
    ? "The founder update has proof, traction, and one clear ask."
    : "Draft the update, but keep the proof gaps visible.";
  const cards = [
    makeInvestorUpdateCard({
      label: "Update readiness",
      passed: updateScore >= 60,
      value: `${updateScore}%`,
      detail: "Weighted view of data-room strength, relationship momentum, proof spine, revenue signal, customer signal, source moat, and ask clarity.",
      status: updateScore >= 75 ? "send" : updateScore >= 50 ? "draft" : "prove"
    }),
    makeInvestorUpdateCard({
      label: "Proof spine",
      passed: proofSpineScore >= 50,
      value: `${proofSpineScore}%`,
      detail: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, ${sourceRows} source row${sourceRows === 1 ? "" : "s"}, and proof packet score ${proofPacket.score}%.`,
      status: proofSpineScore >= 65 ? "solid" : proofSpineScore >= 45 ? "thin" : "gap"
    }),
    makeInvestorUpdateCard({
      label: "Revenue signal",
      passed: revenueSignal >= 45,
      value: `AED ${formatInteger(revenue.metrics.weightedMrr || 0)}`,
      detail: `Forecast MRR is AED ${formatInteger(revenue.metrics.forecastMrr || 0)}, revenue proof items ${revenueProof}, and paid-intent sessions ${paidIntentSessions}.`,
      status: revenueSignal >= 60 ? "credible" : revenueSignal >= 40 ? "forming" : "missing"
    }),
    makeInvestorUpdateCard({
      label: "Customer signal",
      passed: customerSignal >= 50,
      value: `${customerSignal}%`,
      detail: `${accountHealth.metrics.accounts} account${accountHealth.metrics.accounts === 1 ? "" : "s"} mapped, ${momentum.metrics.relationshipCount} relationship${momentum.metrics.relationshipCount === 1 ? "" : "s"} moving, and ${momentum.metrics.warmReplies} warm repl${momentum.metrics.warmReplies === 1 ? "y" : "ies"}.`,
      status: customerSignal >= 60 ? "clear" : "soft"
    }),
    makeInvestorUpdateCard({
      label: "Source moat",
      passed: sourceMoatSignal >= 50,
      value: `${sourceRows} source`,
      detail: `${reviewCount} review${reviewCount === 1 ? "" : "s"}, ${decisionCount} decision${decisionCount === 1 ? "" : "s"}, deployment ${deploymentScore}%, and diligence ${diligence.score}%.`,
      status: sourceMoatSignal >= 65 ? "defensible" : "tighten"
    }),
    makeInvestorUpdateCard({
      label: "Next ask",
      passed: askClarity >= 50,
      value: `${askClarity}%`,
      detail: `${nextDraft.title}: ${nextDraft.body}`,
      status: askClarity >= 65 ? "specific" : "sharpen"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: updateScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Investor update score is ${updateScore}%. Proof spine is ${proofSpineScore}%, revenue signal is ${revenueSignal}%, customer signal is ${customerSignal}%, source moat is ${sourceMoatSignal}%, and ask clarity is ${askClarity}%. Next: ${nextDraft.title}.`,
    nextDraft,
    cards,
    drafts,
    metrics: {
      proofSpineScore,
      revenueSignal,
      customerSignal,
      sourceMoatSignal,
      askClarity,
      evidenceCount,
      verifiedEvidence,
      revenueProof,
      paidIntentSessions,
      sourceRows,
      deploymentScore,
      weightedMrr: revenue.metrics.weightedMrr || 0,
      forecastMrr: revenue.metrics.forecastMrr || 0,
      runRateArr: revenue.metrics.runRateArr || 0
    },
    momentum,
    dataRoom,
    diligence,
    board,
    revenue,
    accountHealth,
    proofPacket
  };
}

function makeInvestorUpdateDrafts({ account, momentum, dataRoom, board, revenue, proofPacket, latestConversion, latestFollowup, proofSpineScore, revenueSignal, customerSignal, sourceMoatSignal, askClarity, evidenceCount, verifiedEvidence, revenueProof, paidIntentSessions, sourceRows, deploymentScore }) {
  const revenueLine = revenue.metrics.forecastMrr || revenue.metrics.weightedMrr
    ? `AED ${formatInteger(revenue.metrics.forecastMrr || 0)} forecast MRR, AED ${formatInteger(revenue.metrics.weightedMrr || 0)} weighted pipeline, and AED ${formatInteger(revenue.metrics.runRateArr || 0)} run-rate ARR.`
    : "Revenue is still in proof mode, so the update should lead with the paid-pilot question and the next commercial action.";
  const proofLine = evidenceCount || sourceRows
    ? `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, ${sourceRows} source row${sourceRows === 1 ? "" : "s"}, and a ${proofPacket.score}% proof packet.`
    : "The current proof spine is starter-only; add one source or value proof before sending a stronger update.";
  const relationshipLine = momentum.metrics.relationshipCount
    ? `${momentum.metrics.relationshipCount} relationship${momentum.metrics.relationshipCount === 1 ? "" : "s"} are visible, with ${momentum.metrics.warmReplies} warm repl${momentum.metrics.warmReplies === 1 ? "y" : "ies"} and ${momentum.metrics.openFollowups} open follow-up${momentum.metrics.openFollowups === 1 ? "" : "s"}.`
    : "No active relationship queue is visible yet; use the update to ask for one practical UAE market conversation.";
  const askLine = latestConversion
    ? `The next ask is to move ${latestConversion.account} from ${getConversionStageLabel(latestConversion.stage)} into the next paid-pilot decision.`
    : latestFollowup
      ? `The next ask is to clear the follow-up with ${latestFollowup.account} and get one dated next step.`
      : "The next ask is one real UAE market question, one official-source proof gap, or one named operator intro.";
  return [
    makeInvestorUpdateDraft({
      lane: "Subject",
      title: "Use a clear, non-hype subject line",
      body: `MajlisAlpha update: UAE source-first desk, ${account}, and the next proof milestone`,
      owner: "Founder",
      signal: `${askClarity}% ask`,
      status: askClarity >= 50 ? "usable" : "sharpen",
      target: "#investor-momentum-ledger",
      buttonLabel: "Open momentum",
      passed: askClarity >= 45,
      priority: "Medium"
    }),
    makeInvestorUpdateDraft({
      lane: "Opening",
      title: "Lead with the operating truth",
      body: `MajlisAlpha is turning UAE filings, exchange disclosures, earnings-call notes, ownership updates, and AED scenarios into cited research briefs. Current update: ${revenueLine}`,
      owner: "Founder",
      signal: `${revenueSignal}% revenue`,
      status: revenueSignal >= 45 ? "credible" : "thin",
      target: "#founder-revenue-forecast",
      buttonLabel: "Open revenue forecast",
      passed: revenueSignal >= 45,
      priority: "High"
    }),
    makeInvestorUpdateDraft({
      lane: "Proof",
      title: "Name the proof spine",
      body: `The proof base is ${proofLine} Source controls and deployment health are at ${deploymentScore}%, and the data-room score is ${dataRoom.score}%.`,
      owner: "Operator",
      signal: `${proofSpineScore}% proof`,
      status: proofSpineScore >= 50 ? "sendable" : "gap",
      target: proofSpineScore >= 50 ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: proofSpineScore >= 50 ? "Open proof packet" : "Open evidence ledger",
      passed: proofSpineScore >= 50,
      priority: "High"
    }),
    makeInvestorUpdateDraft({
      lane: "Market pull",
      title: "Show relationship motion without overstating it",
      body: `${relationshipLine} The strongest current relationship move is: ${momentum.nextMove.title}.`,
      owner: "Founder",
      signal: `${customerSignal}% customer`,
      status: customerSignal >= 50 ? "visible" : "soft",
      target: "#investor-momentum-ledger",
      buttonLabel: "Open momentum ledger",
      passed: customerSignal >= 50,
      priority: "Medium"
    }),
    makeInvestorUpdateDraft({
      lane: "Moat",
      title: "Explain why UAE source discipline matters",
      body: `The wedge is not generic AI output. It is a UAE-specific disclosure workflow with ADX/DFM source routes, answer quality checks, review trail, and ${sourceRows} source-backed row${sourceRows === 1 ? "" : "s"} in the current data room.`,
      owner: "Founder",
      signal: `${sourceMoatSignal}% source`,
      status: sourceMoatSignal >= 50 ? "defensible" : "tighten",
      target: "#investor-data-room",
      buttonLabel: "Open data room",
      passed: sourceMoatSignal >= 50,
      priority: "Medium"
    }),
    makeInvestorUpdateDraft({
      lane: "Ask",
      title: "Close with one specific next action",
      body: `${askLine} Useful help this week: one UAE issuer question, one official-source dataset, or one introduction to a Dubai/Abu Dhabi operator who needs source-backed research.`,
      owner: "Founder",
      signal: `${askClarity}% ask`,
      status: askClarity >= 50 ? "specific" : "too broad",
      target: board.nextAction?.target || "#investor-momentum-ledger",
      buttonLabel: board.nextAction?.buttonLabel || "Open next ask",
      passed: askClarity >= 50 || paidIntentSessions > 0 || revenueProof > 0,
      priority: "High"
    })
  ];
}

function makeInvestorUpdateCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["draft", "thin", "forming", "soft", "tighten", "sharpen"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorUpdateDraft({ lane, title, body, owner, signal, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    body,
    owner,
    signal,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorUpdateNext() {
  const composer = makeInvestorUpdateComposer();
  document.querySelector(composer.nextDraft.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorUpdateResult(`Opened: ${composer.nextDraft.title}.`, "neutral");
}

function openInvestorUpdateMomentum() {
  document.querySelector("#investor-momentum-ledger")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorUpdateResult("Investor Momentum Ledger opened.", "neutral");
}

async function copyInvestorUpdateComposer() {
  const copied = await copyTextToClipboard(makeInvestorUpdateComposerMarkdown(makeInvestorUpdateComposer()));
  flashInvestorUpdateResult(copied ? "Investor update copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorUpdateComposer() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-update-composer-${date}.json`, JSON.stringify(makeInvestorUpdateComposer(), null, 2), "application/json;charset=utf-8");
  flashInvestorUpdateResult("Investor update JSON exported.", "success");
}

function makeInvestorUpdateComposerMarkdown(composer) {
  return [
    "# MajlisAlpha Investor Update Composer",
    "",
    `Version: ${composer.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Update score: ${composer.score}% (${composer.statusLabel})`,
    `Weighted MRR: AED ${formatInteger(composer.metrics.weightedMrr)}`,
    `Forecast MRR: AED ${formatInteger(composer.metrics.forecastMrr)}`,
    `Proof spine: ${composer.metrics.proofSpineScore}%`,
    "",
    composer.summary,
    "",
    "## Composer Cards",
    ...composer.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Draft Update",
    ...composer.drafts.map((draft) => `### ${draft.lane}: ${draft.title}\n${draft.body}\nStatus: ${draft.status}`),
    "",
    "## Next Draft Gap",
    `${composer.nextDraft.title}: ${composer.nextDraft.body}`,
    "",
    "_Investor update composer is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorUpdateResult(message, tone = "neutral") {
  if (!els.investorUpdateResult) return;
  els.investorUpdateResult.className = `builder-result is-${tone}`;
  els.investorUpdateResult.textContent = message;
}

function renderInvestorObjectionDesk() {
  if (!els.investorObjectionSummary || !els.investorObjectionGrid || !els.investorObjectionRows) return;
  const desk = makeInvestorObjectionDesk();
  window.MajlisAlphaInvestorObjectionDesk = desk;
  if (els.openInvestorObjectionNext) {
    els.openInvestorObjectionNext.textContent = desk.nextObjection.buttonLabel;
  }
  els.investorObjectionSummary.innerHTML = `
    <div class="investor-objection-hero ${escapeAttr(desk.statusClass)}">
      <div>
        <span>${escapeHtml(desk.statusLabel)}</span>
        <strong>${escapeHtml(desk.headline)}</strong>
        <p>${escapeHtml(desk.summary)}</p>
      </div>
      <div class="investor-objection-score">
        <span>Objection</span>
        <strong>${escapeHtml(desk.score)}%</strong>
      </div>
    </div>
  `;
  els.investorObjectionGrid.innerHTML = desk.cards.map((card) => `
    <article class="investor-objection-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorObjectionRows.innerHTML = desk.objections.map((row) => `
    <article class="investor-objection-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.objection)}</strong>
        <p>${escapeHtml(row.reply)}</p>
        <em>${escapeHtml(row.proof)}</em>
      </div>
      <div class="investor-objection-row-meta">
        <span>${escapeHtml(row.owner)}</span>
        <strong>${escapeHtml(row.signal)}</strong>
        <p>${escapeHtml(row.gap)}</p>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorObjectionDesk() {
  const update = makeInvestorUpdateComposer();
  const momentum = update.momentum || makeInvestorMomentumLedger();
  const dataRoom = update.dataRoom || makeInvestorDataRoom();
  const diligence = update.diligence || dataRoom.diligence || makeFounderDiligenceRoom();
  const revenue = update.revenue || dataRoom.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = update.accountHealth || dataRoom.accountHealth || makeAccountHealthCommandCenter();
  const metrics = update.metrics || {};
  const evidenceCount = metrics.evidenceCount || state.pilotEvidenceLedger.length;
  const verifiedEvidence = metrics.verifiedEvidence || state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const sourceRows = metrics.sourceRows || dataRoom.metrics?.sourceRows || 0;
  const relationshipCount = momentum.metrics?.relationshipCount || 0;
  const warmReplies = momentum.metrics?.warmReplies || 0;
  const weightedMrr = metrics.weightedMrr || revenue.metrics?.weightedMrr || 0;
  const forecastMrr = metrics.forecastMrr || revenue.metrics?.forecastMrr || 0;
  const proofScore = metrics.proofSpineScore || 0;
  const revenueScore = metrics.revenueSignal || 0;
  const demandScore = metrics.customerSignal || 0;
  const moatScore = metrics.sourceMoatSignal || 0;
  const askScore = metrics.askClarity || 0;
  const deploymentScore = metrics.deploymentScore || makePagesDeploymentAudit().score;
  const controlScore = clampScore(
    deploymentScore * 0.45
    + diligence.score * 0.22
    + dataRoom.score * 0.16
    + Math.min(sourceRows, 6) * 5
    + (document.querySelector("#compliance-audit") ? 7 : 0)
  );
  const objectionScore = clampScore(
    update.score * 0.22
    + proofScore * 0.18
    + revenueScore * 0.16
    + demandScore * 0.14
    + moatScore * 0.13
    + controlScore * 0.1
    + askScore * 0.07
  );
  const objections = makeInvestorObjectionRows({
    update,
    momentum,
    dataRoom,
    diligence,
    accountHealth,
    evidenceCount,
    verifiedEvidence,
    sourceRows,
    relationshipCount,
    warmReplies,
    weightedMrr,
    forecastMrr,
    proofScore,
    revenueScore,
    demandScore,
    moatScore,
    askScore,
    controlScore,
    deploymentScore
  });
  const nextObjection = objections.find((row) => !row.passed) || objections[objections.length - 1];
  const statusClass = objectionScore >= 75 ? "is-good" : objectionScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = objectionScore >= 75 ? "Objection ready" : objectionScore >= 50 ? "Objection forming" : "Objection gaps";
  const headline = objectionScore >= 75
    ? "Investor doubts have proof-backed answers."
    : "Keep the skeptical questions visible before the next conversation.";
  const cards = [
    makeInvestorObjectionCard({
      label: "Objection readiness",
      passed: objectionScore >= 60,
      value: `${objectionScore}%`,
      detail: "Weighted view of update quality, proof spine, revenue signal, customer demand, source moat, controls, and ask clarity.",
      status: objectionScore >= 75 ? "ready" : objectionScore >= 50 ? "draft" : "prove"
    }),
    makeInvestorObjectionCard({
      label: "Proof answer",
      passed: proofScore >= 50,
      value: `${proofScore}%`,
      detail: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, and ${sourceRows} source row${sourceRows === 1 ? "" : "s"} support investor answers.`,
      status: proofScore >= 65 ? "defensible" : proofScore >= 45 ? "thin" : "gap"
    }),
    makeInvestorObjectionCard({
      label: "Revenue answer",
      passed: revenueScore >= 45,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `Forecast MRR is AED ${formatInteger(forecastMrr)}. Use this carefully as pipeline proof, not a guarantee.`,
      status: revenueScore >= 60 ? "credible" : revenueScore >= 40 ? "forming" : "soft"
    }),
    makeInvestorObjectionCard({
      label: "Demand answer",
      passed: demandScore >= 50,
      value: `${relationshipCount} rel.`,
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and account health ${accountHealth.score}% shape the demand response.`,
      status: demandScore >= 60 ? "visible" : "needs use"
    }),
    makeInvestorObjectionCard({
      label: "Moat answer",
      passed: moatScore >= 50,
      value: `${sourceRows} source`,
      detail: `UAE source workflow, review trail, source rows, and ${diligence.score}% diligence strength support the non-generic answer.`,
      status: moatScore >= 65 ? "specific" : "tighten"
    }),
    makeInvestorObjectionCard({
      label: "Control answer",
      passed: controlScore >= 70,
      value: `${controlScore}%`,
      detail: `Deployment health is ${deploymentScore}%, diligence is ${diligence.score}%, and compliance surfaces remain visible.`,
      status: controlScore >= 80 ? "controlled" : "explain"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: objectionScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Objection readiness is ${objectionScore}%. Proof ${proofScore}%, revenue ${revenueScore}%, demand ${demandScore}%, moat ${moatScore}%, controls ${controlScore}%, and ask clarity ${askScore}%. Next: ${nextObjection.objection}.`,
    nextObjection,
    cards,
    objections,
    metrics: {
      proofScore,
      revenueScore,
      demandScore,
      moatScore,
      controlScore,
      askScore,
      evidenceCount,
      verifiedEvidence,
      sourceRows,
      relationshipCount,
      warmReplies,
      weightedMrr,
      forecastMrr,
      deploymentScore
    },
    update,
    momentum,
    dataRoom,
    diligence,
    revenue,
    accountHealth
  };
}

function makeInvestorObjectionRows({ update, momentum, dataRoom, evidenceCount, verifiedEvidence, sourceRows, relationshipCount, warmReplies, weightedMrr, forecastMrr, proofScore, revenueScore, demandScore, moatScore, askScore, controlScore, deploymentScore }) {
  const proofLine = evidenceCount || sourceRows
    ? `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, ${sourceRows} source row${sourceRows === 1 ? "" : "s"}, and data-room score ${dataRoom.score}%.`
    : "The proof spine is still starter-only; add one real source, review note, or value-proof entry before making this answer stronger.";
  const demandLine = relationshipCount
    ? `${relationshipCount} investor relationship${relationshipCount === 1 ? "" : "s"} are visible, with ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}.`
    : "Relationship demand is not yet visible; the next operating move is one real UAE market question or one named introduction.";
  const revenueLine = weightedMrr || forecastMrr
    ? `Weighted pipeline is AED ${formatInteger(weightedMrr)} and forecast MRR is AED ${formatInteger(forecastMrr)}.`
    : "Revenue is still in proof mode, so the reply should ask for a paid-pilot decision path instead of implying certainty.";
  return [
    makeInvestorObjectionRow({
      lane: "Category",
      objection: "Is this just a generic AI research wrapper?",
      reply: "No. The product is built around UAE issuer workflows: ADX/DFM source routes, annual reports, earnings-call tone, ownership updates, AED valuation scenarios, claim trace, quality checks, and export discipline.",
      proof: `${sourceRows} source row${sourceRows === 1 ? "" : "s"} and ${moatScore}% source-moat signal are visible.`,
      gap: sourceRows ? "Turn the source workflow into one crisp demo sequence." : "Add a REAL UAE source row before leaning hard on moat.",
      owner: "Founder",
      signal: `${moatScore}% moat`,
      status: moatScore >= 50 ? "answered" : "needs proof",
      target: sourceRows ? "#investor-data-room" : "#source-builder",
      buttonLabel: sourceRows ? "Open data room" : "Open source studio",
      passed: moatScore >= 50,
      priority: "High"
    }),
    makeInvestorObjectionRow({
      lane: "Demand",
      objection: "Where is real customer or investor pull?",
      reply: `Show the operating trail, not vanity language. ${demandLine} The next momentum move is: ${momentum.nextMove.title}.`,
      proof: `Customer signal is ${demandScore}% and update score is ${update.score}%.`,
      gap: demandScore >= 50 ? "Name the next dated follow-up." : "Capture one real question, reply, or repeat-use signal.",
      owner: "Founder",
      signal: `${demandScore}% demand`,
      status: demandScore >= 50 ? "visible" : "soft",
      target: demandScore >= 50 ? "#investor-momentum-ledger" : "#pilot-evidence-ledger",
      buttonLabel: demandScore >= 50 ? "Open momentum" : "Open evidence ledger",
      passed: demandScore >= 50,
      priority: "High"
    }),
    makeInvestorObjectionRow({
      lane: "Revenue",
      objection: "Can this become paid revenue, or is it only a demo?",
      reply: `${revenueLine} Keep the answer sober: the next proof is a paid pilot, team-access ask, invoice signal, or renewal/expansion motion.`,
      proof: `Revenue signal is ${revenueScore}% with AED ${formatInteger(weightedMrr)} weighted MRR.`,
      gap: revenueScore >= 45 ? "Convert the signal into one dated commercial ask." : "Ask for one paid-pilot decision path before overstating revenue.",
      owner: "Founder",
      signal: `${revenueScore}% revenue`,
      status: revenueScore >= 45 ? "credible" : "early",
      target: "#founder-revenue-forecast",
      buttonLabel: "Open revenue forecast",
      passed: revenueScore >= 45,
      priority: "High"
    }),
    makeInvestorObjectionRow({
      lane: "Controls",
      objection: "How do you avoid investment-advice and trust risk?",
      reply: "MajlisAlpha is research workflow software. It separates cited evidence, analyst judgment, valuation scenarios, review status, and user decisions, while keeping source provenance and non-advisory boundaries visible.",
      proof: `Control readiness is ${controlScore}% and deployment health is ${deploymentScore}%.`,
      gap: controlScore >= 70 ? "Keep the compliance story in the demo route." : "Open Compliance Audit and Pages Doctor before sharing.",
      owner: "Operator",
      signal: `${controlScore}% control`,
      status: controlScore >= 70 ? "controlled" : "explain",
      target: controlScore >= 70 ? "#compliance-audit" : "#pages-deployment-doctor",
      buttonLabel: controlScore >= 70 ? "Open compliance" : "Open doctor",
      passed: controlScore >= 70,
      priority: "Medium"
    }),
    makeInvestorObjectionRow({
      lane: "Proof gap",
      objection: "What proof is missing before I should take this seriously?",
      reply: `Be direct. ${proofLine} The next update gap is: ${update.nextDraft.title}.`,
      proof: `Proof spine is ${proofScore}% and update readiness is ${update.score}%.`,
      gap: update.nextDraft.body,
      owner: "Founder",
      signal: `${proofScore}% proof`,
      status: proofScore >= 55 ? "clear" : "gap",
      target: update.nextDraft.target || "#investor-update-composer",
      buttonLabel: update.nextDraft.buttonLabel || "Open update gap",
      passed: proofScore >= 55 && update.score >= 50,
      priority: "Medium"
    }),
    makeInvestorObjectionRow({
      lane: "Ask",
      objection: "What exactly do you want from me now?",
      reply: "Ask for one specific action: a UAE issuer question, a source dataset, a warm operator intro, or a paid-pilot decision conversation. Avoid broad help-me language.",
      proof: `Ask clarity is ${askScore}% and the current momentum move is ${momentum.nextMove.title}.`,
      gap: askScore >= 50 ? "Use the investor update ask as written." : "Sharpen the ask inside Investor Update Composer.",
      owner: "Founder",
      signal: `${askScore}% ask`,
      status: askScore >= 50 ? "specific" : "broad",
      target: "#investor-update-composer",
      buttonLabel: "Open investor update",
      passed: askScore >= 50,
      priority: "High"
    })
  ];
}

function makeInvestorObjectionCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["draft", "thin", "forming", "soft", "needs use", "tighten", "explain"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorObjectionRow({ lane, objection, reply, proof, gap, owner, signal, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    objection,
    reply,
    proof,
    gap,
    owner,
    signal,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorObjectionNext() {
  const desk = makeInvestorObjectionDesk();
  document.querySelector(desk.nextObjection.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorObjectionResult(`Opened: ${desk.nextObjection.objection}.`, "neutral");
}

function openInvestorObjectionUpdate() {
  document.querySelector("#investor-update-composer")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorObjectionResult("Investor Update Composer opened.", "neutral");
}

async function copyInvestorObjectionDesk() {
  const copied = await copyTextToClipboard(makeInvestorObjectionDeskMarkdown(makeInvestorObjectionDesk()));
  flashInvestorObjectionResult(copied ? "Investor objection desk copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorObjectionDesk() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-objection-desk-${date}.json`, JSON.stringify(makeInvestorObjectionDesk(), null, 2), "application/json;charset=utf-8");
  flashInvestorObjectionResult("Investor objection desk JSON exported.", "success");
}

function makeInvestorObjectionDeskMarkdown(desk) {
  return [
    "# MajlisAlpha Investor Objection Desk",
    "",
    `Version: ${desk.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Objection readiness: ${desk.score}% (${desk.statusLabel})`,
    `Proof score: ${desk.metrics.proofScore}%`,
    `Revenue signal: ${desk.metrics.revenueScore}%`,
    `Demand signal: ${desk.metrics.demandScore}%`,
    `Control signal: ${desk.metrics.controlScore}%`,
    "",
    desk.summary,
    "",
    "## Objection Cards",
    ...desk.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Objection Replies",
    ...desk.objections.map((row) => `### ${row.lane}: ${row.objection}\n${row.reply}\nProof: ${row.proof}\nGap: ${row.gap}\nStatus: ${row.status}`),
    "",
    "## Next Objection Gap",
    `${desk.nextObjection.objection}: ${desk.nextObjection.gap}`,
    "",
    "_Investor objection desk is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorObjectionResult(message, tone = "neutral") {
  if (!els.investorObjectionResult) return;
  els.investorObjectionResult.className = `builder-result is-${tone}`;
  els.investorObjectionResult.textContent = message;
}

function renderInvestorCommitmentTracker() {
  if (!els.investorCommitmentSummary || !els.investorCommitmentGrid || !els.investorCommitmentRows) return;
  const tracker = makeInvestorCommitmentTracker();
  window.MajlisAlphaInvestorCommitmentTracker = tracker;
  if (els.openInvestorCommitmentNext) {
    els.openInvestorCommitmentNext.textContent = tracker.nextPath.buttonLabel;
  }
  els.investorCommitmentSummary.innerHTML = `
    <div class="investor-commitment-hero ${escapeAttr(tracker.statusClass)}">
      <div>
        <span>${escapeHtml(tracker.statusLabel)}</span>
        <strong>${escapeHtml(tracker.headline)}</strong>
        <p>${escapeHtml(tracker.summary)}</p>
      </div>
      <div class="investor-commitment-score">
        <span>Commitment</span>
        <strong>${escapeHtml(tracker.score)}%</strong>
      </div>
    </div>
  `;
  els.investorCommitmentGrid.innerHTML = tracker.cards.map((card) => `
    <article class="investor-commitment-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorCommitmentRows.innerHTML = tracker.paths.map((row) => `
    <article class="investor-commitment-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
        <em>${escapeHtml(row.ask)}</em>
      </div>
      <div class="investor-commitment-row-meta">
        <span>${escapeHtml(row.owner)}</span>
        <strong>${escapeHtml(row.signal)}</strong>
        <p>${escapeHtml(row.gap)}</p>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorCommitmentTracker() {
  const objectionDesk = makeInvestorObjectionDesk();
  const update = objectionDesk.update || makeInvestorUpdateComposer();
  const momentum = objectionDesk.momentum || update.momentum || makeInvestorMomentumLedger();
  const dataRoom = objectionDesk.dataRoom || update.dataRoom || makeInvestorDataRoom();
  const revenue = objectionDesk.revenue || update.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = objectionDesk.accountHealth || update.accountHealth || makeAccountHealthCommandCenter();
  const metrics = objectionDesk.metrics || {};
  const relationshipCount = metrics.relationshipCount || momentum.metrics?.relationshipCount || 0;
  const warmReplies = metrics.warmReplies || momentum.metrics?.warmReplies || 0;
  const openFollowups = momentum.metrics?.openFollowups || state.pilotFollowups.length;
  const evidenceCount = metrics.evidenceCount || state.pilotEvidenceLedger.length;
  const verifiedEvidence = metrics.verifiedEvidence || state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const sourceRows = metrics.sourceRows || dataRoom.metrics?.sourceRows || 0;
  const weightedMrr = metrics.weightedMrr || revenue.metrics?.weightedMrr || 0;
  const forecastMrr = metrics.forecastMrr || revenue.metrics?.forecastMrr || 0;
  const conversionCount = state.pilotConversions.length;
  const advancedConversions = state.pilotConversions.filter((conversion) => /proposal|paid|invoice|team|closed|won|aed/i.test(String(conversion.stage || conversion.intent || ""))).length;
  const objectionPassed = objectionDesk.objections.filter((row) => row.passed).length;
  const warmSignal = clampScore(
    momentum.score * 0.28
    + relationshipCount * 10
    + warmReplies * 13
    + openFollowups * 8
    + objectionDesk.score * 0.12
  );
  const proofRequestSignal = clampScore(
    metrics.proofScore * 0.42
    + evidenceCount * 7
    + verifiedEvidence * 13
    + sourceRows * 6
    + dataRoom.score * 0.16
  );
  const commercialSignal = clampScore(
    metrics.revenueScore * 0.42
    + Math.min(weightedMrr, 1500) / 20
    + Math.min(forecastMrr, 1500) / 25
    + conversionCount * 8
    + advancedConversions * 14
  );
  const introSignal = clampScore(
    (momentum.metrics?.introSignal || 0) * 0.45
    + relationshipCount * 8
    + warmReplies * 10
    + state.pilotOutreachDrafts.length * 5
    + (momentum.nextMove?.title ? 10 : 0)
  );
  const dateDiscipline = clampScore(
    state.pilotFollowups.length * 10
    + state.pilotSessions.length * 4
    + openFollowups * 10
    + momentum.score * 0.12
    + (objectionDesk.nextObjection ? 8 : 0)
  );
  const objectionClearance = clampScore(
    objectionDesk.score * 0.44
    + objectionPassed * 9
    + (metrics.controlScore || 0) * 0.18
    + (metrics.askScore || 0) * 0.16
  );
  const commitmentScore = clampScore(
    warmSignal * 0.18
    + proofRequestSignal * 0.18
    + commercialSignal * 0.18
    + introSignal * 0.14
    + dateDiscipline * 0.14
    + objectionClearance * 0.18
  );
  const paths = makeInvestorCommitmentRows({
    objectionDesk,
    update,
    momentum,
    dataRoom,
    relationshipCount,
    warmReplies,
    openFollowups,
    evidenceCount,
    verifiedEvidence,
    sourceRows,
    weightedMrr,
    forecastMrr,
    conversionCount,
    advancedConversions,
    warmSignal,
    proofRequestSignal,
    commercialSignal,
    introSignal,
    dateDiscipline,
    objectionClearance
  });
  const nextPath = paths.find((row) => !row.passed) || paths[paths.length - 1];
  const statusClass = commitmentScore >= 75 ? "is-good" : commitmentScore >= 50 ? "is-warning" : "is-error";
  const statusLabel = commitmentScore >= 75 ? "Commitment ready" : commitmentScore >= 50 ? "Commitment forming" : "Commitment gaps";
  const headline = commitmentScore >= 75
    ? "Investor interest has a clear next commitment path."
    : "Track the missing proof before asking for a stronger commitment.";
  const cards = [
    makeInvestorCommitmentCard({
      label: "Commitment readiness",
      passed: commitmentScore >= 60,
      value: `${commitmentScore}%`,
      detail: "Weighted view of warmth, proof requests, commercial signal, intro leverage, date discipline, and objection clearance.",
      status: commitmentScore >= 75 ? "ask now" : commitmentScore >= 50 ? "nurture" : "prove"
    }),
    makeInvestorCommitmentCard({
      label: "Warm path",
      passed: warmSignal >= 50,
      value: `${relationshipCount} rel.`,
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}.`,
      status: warmSignal >= 65 ? "active" : warmSignal >= 45 ? "forming" : "quiet"
    }),
    makeInvestorCommitmentCard({
      label: "Proof request",
      passed: proofRequestSignal >= 50,
      value: `${proofRequestSignal}%`,
      detail: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, and ${sourceRows} source row${sourceRows === 1 ? "" : "s"} can answer diligence requests.`,
      status: proofRequestSignal >= 65 ? "sendable" : proofRequestSignal >= 45 ? "thin" : "gap"
    }),
    makeInvestorCommitmentCard({
      label: "Commercial path",
      passed: commercialSignal >= 45,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"}, and AED ${formatInteger(forecastMrr)} forecast MRR.`,
      status: commercialSignal >= 60 ? "credible" : commercialSignal >= 40 ? "early" : "missing"
    }),
    makeInvestorCommitmentCard({
      label: "Intro leverage",
      passed: introSignal >= 50,
      value: `${introSignal}%`,
      detail: "Measures whether the relationship can become a named operator intro, source partner, advisor call, or investor review.",
      status: introSignal >= 65 ? "specific" : "sharpen"
    }),
    makeInvestorCommitmentCard({
      label: "Next date",
      passed: dateDiscipline >= 50,
      value: `${dateDiscipline}%`,
      detail: `${nextPath.title}: ${nextPath.gap}`,
      status: dateDiscipline >= 65 ? "dated" : "undated"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: commitmentScore,
    statusClass,
    statusLabel,
    headline,
    summary: `Commitment readiness is ${commitmentScore}%. Warm path ${warmSignal}%, proof request ${proofRequestSignal}%, commercial path ${commercialSignal}%, intro leverage ${introSignal}%, next date ${dateDiscipline}%, and objection clearance ${objectionClearance}%. Next: ${nextPath.title}.`,
    nextPath,
    cards,
    paths,
    metrics: {
      warmSignal,
      proofRequestSignal,
      commercialSignal,
      introSignal,
      dateDiscipline,
      objectionClearance,
      relationshipCount,
      warmReplies,
      openFollowups,
      evidenceCount,
      verifiedEvidence,
      sourceRows,
      weightedMrr,
      forecastMrr,
      conversionCount,
      advancedConversions
    },
    objectionDesk,
    update,
    momentum,
    dataRoom,
    revenue,
    accountHealth
  };
}

function makeInvestorCommitmentRows({ objectionDesk, update, momentum, dataRoom, relationshipCount, warmReplies, openFollowups, evidenceCount, verifiedEvidence, sourceRows, weightedMrr, forecastMrr, conversionCount, advancedConversions, warmSignal, proofRequestSignal, commercialSignal, introSignal, dateDiscipline, objectionClearance }) {
  const account = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE relationship";
  const proofAsk = evidenceCount || sourceRows
    ? `Send the data-room proof spine: ${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, and ${sourceRows} source row${sourceRows === 1 ? "" : "s"}.`
    : "Commit to one proof add: a REAL source row, a value-proof entry, or a review note before the next investor send.";
  const revenueAsk = weightedMrr || forecastMrr
    ? `Use AED ${formatInteger(weightedMrr)} weighted MRR and AED ${formatInteger(forecastMrr)} forecast MRR as pipeline context, not certainty.`
    : "Ask for a paid-pilot decision conversation before implying revenue traction.";
  return [
    makeInvestorCommitmentRow({
      lane: "Data-room review",
      title: "Ask for a real review, not passive interest",
      detail: `Move ${account} toward one concrete review of the Investor Data Room and the current founder update.`,
      ask: "Will you review the data room and send the one missing proof you would need?",
      owner: "Founder",
      signal: `${objectionClearance}% clear`,
      gap: objectionDesk.nextObjection.gap,
      status: objectionClearance >= 50 ? "review ask" : "clear doubts",
      target: objectionClearance >= 50 ? "#investor-data-room" : "#investor-objection-desk",
      buttonLabel: objectionClearance >= 50 ? "Open data room" : "Open objection desk",
      passed: objectionClearance >= 50,
      priority: "High"
    }),
    makeInvestorCommitmentRow({
      lane: "Proof request",
      title: "Turn diligence into a sendable proof packet",
      detail: proofAsk,
      ask: "Which proof item would change this from interesting to worth a follow-up?",
      owner: "Operator",
      signal: `${proofRequestSignal}% proof`,
      gap: proofRequestSignal >= 50 ? "Package the proof request into the next update." : "Add one verified source or value-proof entry.",
      status: proofRequestSignal >= 50 ? "sendable" : "proof gap",
      target: proofRequestSignal >= 50 ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: proofRequestSignal >= 50 ? "Open proof packet" : "Open evidence ledger",
      passed: proofRequestSignal >= 50,
      priority: "High"
    }),
    makeInvestorCommitmentRow({
      lane: "Warm intro",
      title: "Convert support into a named operator intro",
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"} and ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"} are available for intro leverage.`,
      ask: "Who is one Dubai or Abu Dhabi operator who should test this on a real UAE market question?",
      owner: "Founder",
      signal: `${introSignal}% intro`,
      gap: introSignal >= 50 ? "Make the ask specific and dated." : "Use the objection reply to earn one named intro.",
      status: introSignal >= 50 ? "ask ready" : "too broad",
      target: "#investor-momentum-ledger",
      buttonLabel: "Open momentum",
      passed: introSignal >= 50,
      priority: "Medium"
    }),
    makeInvestorCommitmentRow({
      lane: "Commercial",
      title: "Separate revenue signal from commitment",
      detail: `${revenueAsk} ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"} and ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"} are visible.`,
      ask: "Can we put one paid-pilot decision date or invoice path on the calendar?",
      owner: "Founder",
      signal: `${commercialSignal}% commercial`,
      gap: commercialSignal >= 45 ? "Name the next commercial date." : "Capture one paid-intent or team-access signal.",
      status: commercialSignal >= 45 ? "credible" : "early",
      target: "#founder-revenue-forecast",
      buttonLabel: "Open revenue forecast",
      passed: commercialSignal >= 45,
      priority: "High"
    }),
    makeInvestorCommitmentRow({
      lane: "Follow-up",
      title: "Do not let the warm thread go undated",
      detail: `${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"} and ${state.pilotFollowups.length} saved follow-up${state.pilotFollowups.length === 1 ? "" : "s"} are in the relationship trail.`,
      ask: "What is the next dated touch: review, intro, source send, pilot call, or no for now?",
      owner: "Founder",
      signal: `${dateDiscipline}% date`,
      gap: dateDiscipline >= 50 ? "Use the follow-through queue to date the next step." : "Create one follow-up with a date and owner.",
      status: dateDiscipline >= 50 ? "dated" : "undated",
      target: "#investor-follow-through",
      buttonLabel: "Open follow-through",
      passed: dateDiscipline >= 50,
      priority: "Medium"
    }),
    makeInvestorCommitmentRow({
      lane: "Update loop",
      title: "Feed the commitment back into the next founder update",
      detail: `The current update score is ${update.score}% and the strongest momentum move is: ${momentum.nextMove.title}.`,
      ask: "Should the next update ask for review, intro, proof feedback, or paid-pilot decision?",
      owner: "Founder",
      signal: `${warmSignal}% warm`,
      gap: update.nextDraft.body,
      status: warmSignal >= 50 ? "ready" : "nurture",
      target: "#investor-update-composer",
      buttonLabel: "Open investor update",
      passed: warmSignal >= 50 && update.score >= 45,
      priority: "Medium"
    })
  ];
}

function makeInvestorCommitmentCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["nurture", "forming", "thin", "early", "sharpen", "undated"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorCommitmentRow({ lane, title, detail, ask, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    ask,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorCommitmentNext() {
  const tracker = makeInvestorCommitmentTracker();
  document.querySelector(tracker.nextPath.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorCommitmentResult(`Opened: ${tracker.nextPath.title}.`, "neutral");
}

function openInvestorCommitmentObjection() {
  document.querySelector("#investor-objection-desk")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorCommitmentResult("Investor Objection Desk opened.", "neutral");
}

async function copyInvestorCommitmentTracker() {
  const copied = await copyTextToClipboard(makeInvestorCommitmentTrackerMarkdown(makeInvestorCommitmentTracker()));
  flashInvestorCommitmentResult(copied ? "Investor commitment tracker copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorCommitmentTracker() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-commitment-tracker-${date}.json`, JSON.stringify(makeInvestorCommitmentTracker(), null, 2), "application/json;charset=utf-8");
  flashInvestorCommitmentResult("Investor commitment tracker JSON exported.", "success");
}

function makeInvestorCommitmentTrackerMarkdown(tracker) {
  return [
    "# MajlisAlpha Investor Commitment Tracker",
    "",
    `Version: ${tracker.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Commitment readiness: ${tracker.score}% (${tracker.statusLabel})`,
    `Warm path: ${tracker.metrics.warmSignal}%`,
    `Proof request: ${tracker.metrics.proofRequestSignal}%`,
    `Commercial path: ${tracker.metrics.commercialSignal}%`,
    `Next date: ${tracker.metrics.dateDiscipline}%`,
    "",
    tracker.summary,
    "",
    "## Commitment Cards",
    ...tracker.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Commitment Paths",
    ...tracker.paths.map((row) => `### ${row.lane}: ${row.title}\n${row.detail}\nAsk: ${row.ask}\nGap: ${row.gap}\nStatus: ${row.status}`),
    "",
    "## Next Commitment Gap",
    `${tracker.nextPath.title}: ${tracker.nextPath.gap}`,
    "",
    "_Investor commitment tracker is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorCommitmentResult(message, tone = "neutral") {
  if (!els.investorCommitmentResult) return;
  els.investorCommitmentResult.className = `builder-result is-${tone}`;
  els.investorCommitmentResult.textContent = message;
}

function renderInvestorClosePlanRoom() {
  if (!els.investorCloseSummary || !els.investorCloseGrid || !els.investorCloseRows) return;
  const plan = makeInvestorClosePlanRoom();
  window.MajlisAlphaInvestorClosePlan = plan;
  if (els.openInvestorCloseNext) {
    els.openInvestorCloseNext.textContent = plan.nextAction.buttonLabel;
  }
  els.investorCloseSummary.innerHTML = `
    <div class="investor-close-hero ${escapeAttr(plan.statusClass)}">
      <div>
        <span>${escapeHtml(plan.statusLabel)}</span>
        <strong>${escapeHtml(plan.headline)}</strong>
        <p>${escapeHtml(plan.summary)}</p>
      </div>
      <div class="investor-close-score">
        <span>Close Plan</span>
        <strong>${escapeHtml(plan.score)}%</strong>
      </div>
    </div>
  `;
  els.investorCloseGrid.innerHTML = plan.cards.map((card) => `
    <article class="investor-close-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorCloseRows.innerHTML = plan.actions.map((row) => `
    <article class="investor-close-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
        <em>${escapeHtml(row.ask)}</em>
      </div>
      <div class="investor-close-row-meta">
        <span>${escapeHtml(row.owner)}</span>
        <strong>${escapeHtml(row.signal)}</strong>
        <p>${escapeHtml(row.gap)}</p>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorClosePlanRoom() {
  const commitment = makeInvestorCommitmentTracker();
  const objectionDesk = commitment.objectionDesk || makeInvestorObjectionDesk();
  const update = commitment.update || makeInvestorUpdateComposer();
  const momentum = commitment.momentum || makeInvestorMomentumLedger();
  const dataRoom = commitment.dataRoom || makeInvestorDataRoom();
  const revenue = commitment.revenue || makeFounderRevenueForecastCenter();
  const deployment = makePagesDeploymentAudit();
  const metrics = commitment.metrics || {};
  const relationshipCount = metrics.relationshipCount || 0;
  const warmReplies = metrics.warmReplies || 0;
  const openFollowups = metrics.openFollowups || 0;
  const evidenceCount = metrics.evidenceCount || 0;
  const verifiedEvidence = metrics.verifiedEvidence || 0;
  const sourceRows = metrics.sourceRows || 0;
  const weightedMrr = metrics.weightedMrr || 0;
  const forecastMrr = metrics.forecastMrr || 0;
  const conversionCount = metrics.conversionCount || state.pilotConversions.length;
  const advancedConversions = metrics.advancedConversions || 0;
  const decisionSignal = clampScore(
    commitment.score * 0.28
    + metrics.warmSignal * 0.18
    + metrics.dateDiscipline * 0.22
    + metrics.objectionClearance * 0.18
    + openFollowups * 6
    + (commitment.nextPath ? 8 : 0)
  );
  const proofPackageSignal = clampScore(
    metrics.proofRequestSignal * 0.4
    + evidenceCount * 7
    + verifiedEvidence * 12
    + sourceRows * 5
    + dataRoom.score * 0.18
  );
  const commercialAskSignal = clampScore(
    metrics.commercialSignal * 0.46
    + Math.min(weightedMrr, 2000) / 24
    + Math.min(forecastMrr, 2000) / 30
    + conversionCount * 7
    + advancedConversions * 13
  );
  const introCloseSignal = clampScore(
    metrics.introSignal * 0.44
    + relationshipCount * 8
    + warmReplies * 10
    + state.pilotOutreachDrafts.length * 5
    + (momentum.nextMove?.title ? 8 : 0)
  );
  const calendarLockSignal = clampScore(
    metrics.dateDiscipline * 0.48
    + state.pilotFollowups.length * 10
    + state.pilotSessions.length * 4
    + openFollowups * 8
  );
  const riskControlSignal = clampScore(
    (objectionDesk.metrics?.controlScore || 0) * 0.34
    + objectionDesk.score * 0.22
    + deployment.score * 0.18
    + update.score * 0.14
    + (document.querySelector("#compliance-audit") ? 8 : 0)
  );
  const score = clampScore(
    commitment.score * 0.2
    + decisionSignal * 0.16
    + proofPackageSignal * 0.16
    + commercialAskSignal * 0.16
    + introCloseSignal * 0.12
    + calendarLockSignal * 0.1
    + riskControlSignal * 0.1
  );
  const actions = makeInvestorClosePlanRows({
    commitment,
    objectionDesk,
    update,
    momentum,
    dataRoom,
    deployment,
    relationshipCount,
    warmReplies,
    openFollowups,
    evidenceCount,
    verifiedEvidence,
    sourceRows,
    weightedMrr,
    forecastMrr,
    conversionCount,
    advancedConversions,
    decisionSignal,
    proofPackageSignal,
    commercialAskSignal,
    introCloseSignal,
    calendarLockSignal,
    riskControlSignal
  });
  const nextAction = actions.find((row) => !row.passed) || actions[actions.length - 1];
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Close plan ready" : score >= 50 ? "Close plan forming" : "Close plan gaps";
  const headline = score >= 75
    ? "The investor path has a signed next-action plan."
    : "Close the missing proof before asking for the next signed step.";
  const cards = [
    makeInvestorCloseCard({
      label: "Close readiness",
      passed: score >= 60,
      value: `${score}%`,
      detail: "Weighted close view across decision owner, proof package, commercial ask, intro path, calendar lock, and risk controls.",
      status: score >= 75 ? "ask now" : score >= 50 ? "tighten" : "prove"
    }),
    makeInvestorCloseCard({
      label: "Decision owner",
      passed: decisionSignal >= 55,
      value: `${decisionSignal}%`,
      detail: `Commitment readiness is ${commitment.score}% and next path is ${commitment.nextPath.title}.`,
      status: decisionSignal >= 70 ? "named" : decisionSignal >= 50 ? "forming" : "unnamed"
    }),
    makeInvestorCloseCard({
      label: "Proof package",
      passed: proofPackageSignal >= 55,
      value: `${verifiedEvidence}/${evidenceCount}`,
      detail: `${sourceRows} source row${sourceRows === 1 ? "" : "s"} and data-room readiness of ${dataRoom.score}% support the proof send.`,
      status: proofPackageSignal >= 70 ? "sendable" : proofPackageSignal >= 45 ? "thin" : "gap"
    }),
    makeInvestorCloseCard({
      label: "Commercial ask",
      passed: commercialAskSignal >= 45,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `${conversionCount} conversion record${conversionCount === 1 ? "" : "s"} and ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"} are available.`,
      status: commercialAskSignal >= 65 ? "priced" : commercialAskSignal >= 45 ? "early" : "missing"
    }),
    makeInvestorCloseCard({
      label: "Intro close",
      passed: introCloseSignal >= 50,
      value: `${relationshipCount} rel.`,
      detail: `${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"} and ${state.pilotOutreachDrafts.length} outreach draft${state.pilotOutreachDrafts.length === 1 ? "" : "s"} can become a named intro path.`,
      status: introCloseSignal >= 65 ? "specific" : "sharpen"
    }),
    makeInvestorCloseCard({
      label: "Risk controls",
      passed: riskControlSignal >= 60,
      value: `${riskControlSignal}%`,
      detail: `Deployment health is ${deployment.score}% and objection readiness is ${objectionDesk.score}%.`,
      status: riskControlSignal >= 75 ? "controlled" : "explain"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `Close readiness is ${score}%. Decision owner ${decisionSignal}%, proof package ${proofPackageSignal}%, commercial ask ${commercialAskSignal}%, intro close ${introCloseSignal}%, calendar lock ${calendarLockSignal}%, and risk controls ${riskControlSignal}%. Next: ${nextAction.title}.`,
    nextAction,
    cards,
    actions,
    metrics: {
      decisionSignal,
      proofPackageSignal,
      commercialAskSignal,
      introCloseSignal,
      calendarLockSignal,
      riskControlSignal,
      relationshipCount,
      warmReplies,
      openFollowups,
      evidenceCount,
      verifiedEvidence,
      sourceRows,
      weightedMrr,
      forecastMrr,
      conversionCount,
      advancedConversions
    },
    commitment,
    objectionDesk,
    update,
    momentum,
    dataRoom,
    revenue,
    deployment
  };
}

function makeInvestorClosePlanRows({ commitment, objectionDesk, update, momentum, dataRoom, deployment, relationshipCount, warmReplies, openFollowups, evidenceCount, verifiedEvidence, sourceRows, weightedMrr, forecastMrr, conversionCount, advancedConversions, decisionSignal, proofPackageSignal, commercialAskSignal, introCloseSignal, calendarLockSignal, riskControlSignal }) {
  const account = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE investor account";
  const proofDetail = evidenceCount || sourceRows
    ? `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, ${sourceRows} source row${sourceRows === 1 ? "" : "s"}, and data-room score ${dataRoom.score}%.`
    : "The close packet needs at least one verified evidence item or official UAE source row before a serious ask.";
  const commercialDetail = weightedMrr || forecastMrr
    ? `Weighted MRR is AED ${formatInteger(weightedMrr)} and forecast MRR is AED ${formatInteger(forecastMrr)}.`
    : "No priced signal is visible yet, so keep the ask to a review, intro, or paid-pilot decision conversation.";
  return [
    makeInvestorCloseRow({
      lane: "Decision owner",
      title: "Name the next signed action",
      detail: `Move ${account} from interest to one signed next action: data-room review, operator intro, paid-pilot date, source partnership, or funding conversation.`,
      ask: "Which exact action should be signed off next?",
      owner: "Founder",
      signal: `${decisionSignal}% decision`,
      gap: decisionSignal >= 55 ? "Write the action in the next investor update." : commitment.nextPath.gap,
      status: decisionSignal >= 55 ? "named" : "unnamed",
      target: decisionSignal >= 55 ? "#investor-update-composer" : "#investor-commitment-tracker",
      buttonLabel: decisionSignal >= 55 ? "Open update" : "Open commitment tracker",
      passed: decisionSignal >= 55,
      priority: "High"
    }),
    makeInvestorCloseRow({
      lane: "Proof package",
      title: "Send the proof bundle that earns action",
      detail: proofDetail,
      ask: "What proof would make this worth a calendar slot?",
      owner: "Operator",
      signal: `${proofPackageSignal}% proof`,
      gap: proofPackageSignal >= 55 ? "Attach the proof packet to the close note." : "Add one verified source or value-proof entry.",
      status: proofPackageSignal >= 55 ? "sendable" : "proof gap",
      target: proofPackageSignal >= 55 ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: proofPackageSignal >= 55 ? "Open proof packet" : "Open evidence ledger",
      passed: proofPackageSignal >= 55,
      priority: "High"
    }),
    makeInvestorCloseRow({
      lane: "Commercial ask",
      title: "Turn interest into a commercial decision path",
      detail: `${commercialDetail} ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"} and ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"} are logged.`,
      ask: "Can we agree the next paid-pilot or team-access decision date?",
      owner: "Founder",
      signal: `${commercialAskSignal}% commercial`,
      gap: commercialAskSignal >= 45 ? "Put a date beside the commercial ask." : "Capture a priced pilot, invoice, or team-access signal first.",
      status: commercialAskSignal >= 45 ? "credible" : "early",
      target: commercialAskSignal >= 45 ? "#pilot-close-room" : "#founder-revenue-forecast",
      buttonLabel: commercialAskSignal >= 45 ? "Open close room" : "Open revenue forecast",
      passed: commercialAskSignal >= 45,
      priority: "High"
    }),
    makeInvestorCloseRow({
      lane: "Intro path",
      title: "Ask for one named operator intro",
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and the next momentum move is ${momentum.nextMove.title}.`,
      ask: "Who should see this next because they actually feel the UAE research pain?",
      owner: "Founder",
      signal: `${introCloseSignal}% intro`,
      gap: introCloseSignal >= 50 ? "Make the intro ask specific and dated." : "Use the momentum ledger to sharpen the relationship path.",
      status: introCloseSignal >= 50 ? "ask ready" : "too broad",
      target: "#investor-momentum-ledger",
      buttonLabel: "Open momentum",
      passed: introCloseSignal >= 50,
      priority: "Medium"
    }),
    makeInvestorCloseRow({
      lane: "Calendar lock",
      title: "Attach date, owner, and follow-up route",
      detail: `${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}, ${state.pilotFollowups.length} saved follow-up${state.pilotFollowups.length === 1 ? "" : "s"}, and ${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"} are in the trail.`,
      ask: "What is the date, owner, and outcome for the next close touch?",
      owner: "Founder",
      signal: `${calendarLockSignal}% calendar`,
      gap: calendarLockSignal >= 50 ? "Use the follow-through board to keep the next action alive." : "Add one dated follow-up before sending the close note.",
      status: calendarLockSignal >= 50 ? "dated" : "undated",
      target: "#investor-follow-through",
      buttonLabel: "Open follow-through",
      passed: calendarLockSignal >= 50,
      priority: "Medium"
    }),
    makeInvestorCloseRow({
      lane: "Risk control",
      title: "Keep the close ask clean and non-advisory",
      detail: `Deployment health is ${deployment.score}%, objection desk is ${objectionDesk.score}%, and update readiness is ${update.score}%.`,
      ask: "Does the close note separate research software, source proof, user decision, and commercial ask?",
      owner: "Operator",
      signal: `${riskControlSignal}% control`,
      gap: riskControlSignal >= 60 ? "Use the current control language in the close note." : "Open objection desk, compliance audit, and Pages Doctor before sharing.",
      status: riskControlSignal >= 60 ? "controlled" : "explain",
      target: riskControlSignal >= 60 ? "#investor-objection-desk" : "#pages-deployment-doctor",
      buttonLabel: riskControlSignal >= 60 ? "Open objection desk" : "Open doctor",
      passed: riskControlSignal >= 60,
      priority: "Medium"
    })
  ];
}

function makeInvestorCloseCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["tighten", "forming", "thin", "early", "sharpen", "explain"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorCloseRow({ lane, title, detail, ask, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    ask,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorCloseNext() {
  const plan = makeInvestorClosePlanRoom();
  document.querySelector(plan.nextAction.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorCloseResult(`Opened: ${plan.nextAction.title}.`, "neutral");
}

function openInvestorCloseCommitment() {
  document.querySelector("#investor-commitment-tracker")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorCloseResult("Investor Commitment Tracker opened.", "neutral");
}

async function copyInvestorClosePlan() {
  const copied = await copyTextToClipboard(makeInvestorClosePlanMarkdown(makeInvestorClosePlanRoom()));
  flashInvestorCloseResult(copied ? "Investor close plan copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorClosePlan() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-close-plan-${date}.json`, JSON.stringify(makeInvestorClosePlanRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorCloseResult("Investor close plan JSON exported.", "success");
}

function makeInvestorClosePlanMarkdown(plan) {
  return [
    "# MajlisAlpha Investor Close Plan Room",
    "",
    `Version: ${plan.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Close readiness: ${plan.score}% (${plan.statusLabel})`,
    `Decision owner: ${plan.metrics.decisionSignal}%`,
    `Proof package: ${plan.metrics.proofPackageSignal}%`,
    `Commercial ask: ${plan.metrics.commercialAskSignal}%`,
    `Calendar lock: ${plan.metrics.calendarLockSignal}%`,
    "",
    plan.summary,
    "",
    "## Close Cards",
    ...plan.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Close Actions",
    ...plan.actions.map((row) => `### ${row.lane}: ${row.title}\n${row.detail}\nAsk: ${row.ask}\nGap: ${row.gap}\nStatus: ${row.status}`),
    "",
    "## Next Close Gap",
    `${plan.nextAction.title}: ${plan.nextAction.gap}`,
    "",
    "_Investor close plan is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorCloseResult(message, tone = "neutral") {
  if (!els.investorCloseResult) return;
  els.investorCloseResult.className = `builder-result is-${tone}`;
  els.investorCloseResult.textContent = message;
}

function renderInvestorTermsFollowupRoom() {
  if (!els.investorTermsSummary || !els.investorTermsGrid || !els.investorTermsRows) return;
  const room = makeInvestorTermsFollowupRoom();
  window.MajlisAlphaInvestorTermsFollowup = room;
  if (els.openInvestorTermsNext) {
    els.openInvestorTermsNext.textContent = room.nextStep.buttonLabel;
  }
  els.investorTermsSummary.innerHTML = `
    <div class="investor-terms-hero ${escapeAttr(room.statusClass)}">
      <div>
        <span>${escapeHtml(room.statusLabel)}</span>
        <strong>${escapeHtml(room.headline)}</strong>
        <p>${escapeHtml(room.summary)}</p>
      </div>
      <div class="investor-terms-score">
        <span>Terms Path</span>
        <strong>${escapeHtml(room.score)}%</strong>
      </div>
    </div>
  `;
  els.investorTermsGrid.innerHTML = room.cards.map((card) => `
    <article class="investor-terms-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorTermsRows.innerHTML = room.steps.map((row) => `
    <article class="investor-terms-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.lane)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
        <em>${escapeHtml(row.ask)}</em>
      </div>
      <div class="investor-terms-row-meta">
        <span>${escapeHtml(row.owner)}</span>
        <strong>${escapeHtml(row.signal)}</strong>
        <p>${escapeHtml(row.gap)}</p>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorTermsFollowupRoom() {
  const closePlan = makeInvestorClosePlanRoom();
  const commitment = closePlan.commitment || makeInvestorCommitmentTracker();
  const momentum = closePlan.momentum || commitment.momentum || makeInvestorMomentumLedger();
  const update = closePlan.update || commitment.update || makeInvestorUpdateComposer();
  const revenue = closePlan.revenue || commitment.revenue || makeFounderRevenueForecastCenter();
  const accountHealth = commitment.accountHealth || makeAccountHealthCommandCenter();
  const metrics = closePlan.metrics || {};
  const relationshipCount = metrics.relationshipCount || 0;
  const warmReplies = metrics.warmReplies || 0;
  const openFollowups = metrics.openFollowups || 0;
  const weightedMrr = metrics.weightedMrr || 0;
  const forecastMrr = metrics.forecastMrr || 0;
  const conversionCount = metrics.conversionCount || state.pilotConversions.length;
  const advancedConversions = metrics.advancedConversions || 0;
  const recentFollowups = state.pilotFollowups.filter((followup) => followup.status !== "done").length;
  const ownerClarity = clampScore(
    metrics.decisionSignal * 0.32
    + closePlan.score * 0.22
    + relationshipCount * 8
    + warmReplies * 9
    + (closePlan.nextAction?.title ? 8 : 0)
  );
  const termsClarity = clampScore(
    metrics.commercialAskSignal * 0.34
    + Math.min(weightedMrr, 2500) / 28
    + Math.min(forecastMrr, 2500) / 34
    + conversionCount * 7
    + advancedConversions * 13
    + revenue.score * 0.08
  );
  const proofLock = clampScore(
    metrics.proofPackageSignal * 0.38
    + metrics.riskControlSignal * 0.18
    + update.score * 0.14
    + state.pilotEvidenceLedger.length * 6
    + (state.currentCitations || []).length * 2
  );
  const followupDiscipline = clampScore(
    metrics.calendarLockSignal * 0.36
    + state.pilotFollowups.length * 9
    + recentFollowups * 8
    + state.pilotSessions.length * 4
    + momentum.score * 0.1
  );
  const stakeholderMap = clampScore(
    metrics.introCloseSignal * 0.35
    + relationshipCount * 8
    + warmReplies * 10
    + state.pilotOutreachDrafts.length * 5
    + accountHealth.score * 0.08
  );
  const boundaryControl = clampScore(
    metrics.riskControlSignal * 0.42
    + closePlan.deployment.score * 0.18
    + closePlan.objectionDesk.score * 0.18
    + (document.querySelector("#compliance-audit") ? 8 : 0)
  );
  const score = clampScore(
    closePlan.score * 0.2
    + ownerClarity * 0.15
    + termsClarity * 0.17
    + proofLock * 0.16
    + followupDiscipline * 0.14
    + stakeholderMap * 0.08
    + boundaryControl * 0.1
  );
  const steps = makeInvestorTermsRows({
    closePlan,
    commitment,
    momentum,
    update,
    accountHealth,
    relationshipCount,
    warmReplies,
    openFollowups,
    weightedMrr,
    forecastMrr,
    conversionCount,
    advancedConversions,
    recentFollowups,
    ownerClarity,
    termsClarity,
    proofLock,
    followupDiscipline,
    stakeholderMap,
    boundaryControl
  });
  const nextStep = steps.find((row) => !row.passed) || steps[steps.length - 1];
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Terms path ready" : score >= 50 ? "Terms path forming" : "Terms path gaps";
  const headline = score >= 75
    ? "The investor next action has an owned follow-up path."
    : "Turn the close ask into terms, owners, dates, and proof before it drifts.";
  const cards = [
    makeInvestorTermsCard({
      label: "Terms readiness",
      passed: score >= 60,
      value: `${score}%`,
      detail: "Weighted path across owner clarity, commercial terms, proof lock, follow-up discipline, stakeholders, and controls.",
      status: score >= 75 ? "ready" : score >= 50 ? "forming" : "open"
    }),
    makeInvestorTermsCard({
      label: "Owner clarity",
      passed: ownerClarity >= 55,
      value: `${ownerClarity}%`,
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"} and ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"} support a named owner path.`,
      status: ownerClarity >= 70 ? "named" : ownerClarity >= 50 ? "forming" : "missing"
    }),
    makeInvestorTermsCard({
      label: "Commercial terms",
      passed: termsClarity >= 45,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"}, and AED ${formatInteger(forecastMrr)} forecast MRR.`,
      status: termsClarity >= 65 ? "priced" : termsClarity >= 45 ? "early" : "unpriced"
    }),
    makeInvestorTermsCard({
      label: "Proof lock",
      passed: proofLock >= 55,
      value: `${proofLock}%`,
      detail: `${state.pilotEvidenceLedger.length} evidence item${state.pilotEvidenceLedger.length === 1 ? "" : "s"} and ${(state.currentCitations || []).length} current citation${(state.currentCitations || []).length === 1 ? "" : "s"} support the follow-up note.`,
      status: proofLock >= 70 ? "locked" : proofLock >= 50 ? "thin" : "gap"
    }),
    makeInvestorTermsCard({
      label: "Follow-up date",
      passed: followupDiscipline >= 50,
      value: `${recentFollowups} open`,
      detail: `${state.pilotFollowups.length} saved follow-up${state.pilotFollowups.length === 1 ? "" : "s"} and ${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"} are in the operating trail.`,
      status: followupDiscipline >= 65 ? "dated" : "undated"
    }),
    makeInvestorTermsCard({
      label: "Boundary control",
      passed: boundaryControl >= 60,
      value: `${boundaryControl}%`,
      detail: `Close controls are ${metrics.riskControlSignal}% and deployment health is ${closePlan.deployment.score}%.`,
      status: boundaryControl >= 75 ? "controlled" : "explain"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `Terms readiness is ${score}%. Owner clarity ${ownerClarity}%, commercial terms ${termsClarity}%, proof lock ${proofLock}%, follow-up discipline ${followupDiscipline}%, stakeholder map ${stakeholderMap}%, and boundary control ${boundaryControl}%. Next: ${nextStep.title}.`,
    nextStep,
    cards,
    steps,
    metrics: {
      ownerClarity,
      termsClarity,
      proofLock,
      followupDiscipline,
      stakeholderMap,
      boundaryControl,
      relationshipCount,
      warmReplies,
      openFollowups,
      weightedMrr,
      forecastMrr,
      conversionCount,
      advancedConversions,
      recentFollowups
    },
    closePlan,
    commitment,
    momentum,
    update,
    revenue,
    accountHealth
  };
}

function makeInvestorTermsRows({ closePlan, commitment, momentum, update, accountHealth, relationshipCount, warmReplies, openFollowups, weightedMrr, forecastMrr, conversionCount, advancedConversions, recentFollowups, ownerClarity, termsClarity, proofLock, followupDiscipline, stakeholderMap, boundaryControl }) {
  const account = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE investor account";
  const pricedContext = weightedMrr || forecastMrr
    ? `Use AED ${formatInteger(weightedMrr)} weighted MRR and AED ${formatInteger(forecastMrr)} forecast MRR as context, not a promise.`
    : "Keep terms framed as next-step options until a priced pilot, source partnership, or team-access signal is captured.";
  return [
    makeInvestorTermsRow({
      lane: "Action type",
      title: "Choose the next investor lane",
      detail: `Move ${account} into one lane: data-room review, operator intro, paid-pilot decision, source partnership, or funding conversation.`,
      ask: "Which lane is the next signed action?",
      owner: "Founder",
      signal: `${ownerClarity}% owner`,
      gap: ownerClarity >= 55 ? "Name the lane in the follow-up note." : closePlan.nextAction.gap,
      status: ownerClarity >= 55 ? "selected" : "choose lane",
      target: ownerClarity >= 55 ? "#investor-update-composer" : "#investor-close-plan",
      buttonLabel: ownerClarity >= 55 ? "Open update" : "Open close plan",
      passed: ownerClarity >= 55,
      priority: "High"
    }),
    makeInvestorTermsRow({
      lane: "Terms",
      title: "Write terms as options, not pressure",
      detail: `${pricedContext} ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"} and ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"} are visible.`,
      ask: "Is the ask review, pilot date, paid pilot, source access, or intro?",
      owner: "Founder",
      signal: `${termsClarity}% terms`,
      gap: termsClarity >= 45 ? "Attach a sober next-step option to the close note." : "Open revenue forecast and close room before stating terms.",
      status: termsClarity >= 45 ? "framed" : "unpriced",
      target: termsClarity >= 45 ? "#pilot-close-room" : "#founder-revenue-forecast",
      buttonLabel: termsClarity >= 45 ? "Open close room" : "Open revenue forecast",
      passed: termsClarity >= 45,
      priority: "High"
    }),
    makeInvestorTermsRow({
      lane: "Proof bundle",
      title: "Attach the evidence that earns the follow-up",
      detail: `Proof lock is ${proofLock}%, update readiness is ${update.score}%, and close plan proof package is ${closePlan.metrics.proofPackageSignal}%.`,
      ask: "Which proof item goes in the next message?",
      owner: "Operator",
      signal: `${proofLock}% proof`,
      gap: proofLock >= 55 ? "Use the proof packet in the follow-up." : "Add one verified evidence item or current source citation.",
      status: proofLock >= 55 ? "attached" : "proof gap",
      target: proofLock >= 55 ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: proofLock >= 55 ? "Open proof packet" : "Open evidence ledger",
      passed: proofLock >= 55,
      priority: "High"
    }),
    makeInvestorTermsRow({
      lane: "Follow-up date",
      title: "Lock date, owner, and outcome",
      detail: `${recentFollowups} open follow-up${recentFollowups === 1 ? "" : "s"}, ${openFollowups} close-plan follow-up${openFollowups === 1 ? "" : "s"}, and ${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"} are in the trail.`,
      ask: "What date decides whether this continues, converts, or closes?",
      owner: "Founder",
      signal: `${followupDiscipline}% date`,
      gap: followupDiscipline >= 50 ? "Keep the dated next step visible." : "Create one follow-up with owner, date, and expected outcome.",
      status: followupDiscipline >= 50 ? "dated" : "undated",
      target: "#investor-follow-through",
      buttonLabel: "Open follow-through",
      passed: followupDiscipline >= 50,
      priority: "Medium"
    }),
    makeInvestorTermsRow({
      lane: "Stakeholder map",
      title: "Know who can say yes or unlock the next door",
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and account health score ${accountHealth.score}% point to the next stakeholder.`,
      ask: "Who owns review, intro, budget, source access, or investment discussion?",
      owner: "Founder",
      signal: `${stakeholderMap}% map`,
      gap: stakeholderMap >= 50 ? "Route the ask through the best stakeholder." : "Use momentum ledger to identify the next owner.",
      status: stakeholderMap >= 50 ? "mapped" : "unknown",
      target: "#investor-momentum-ledger",
      buttonLabel: "Open momentum",
      passed: stakeholderMap >= 50,
      priority: "Medium"
    }),
    makeInvestorTermsRow({
      lane: "Guardrails",
      title: "Keep the follow-up clean, bounded, and auditable",
      detail: `Boundary control is ${boundaryControl}% and objection desk readiness is ${closePlan.objectionDesk.score}%.`,
      ask: "Does the follow-up avoid investment advice and keep evidence provenance visible?",
      owner: "Operator",
      signal: `${boundaryControl}% control`,
      gap: boundaryControl >= 60 ? "Use the current non-advisory control language." : "Open compliance, objection desk, and Pages Doctor before sharing.",
      status: boundaryControl >= 60 ? "controlled" : "explain",
      target: boundaryControl >= 60 ? "#investor-objection-desk" : "#compliance-audit",
      buttonLabel: boundaryControl >= 60 ? "Open objection desk" : "Open compliance",
      passed: boundaryControl >= 60,
      priority: "Medium"
    })
  ];
}

function makeInvestorTermsCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["forming", "early", "thin", "undated", "explain"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorTermsRow({ lane, title, detail, ask, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    ask,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorTermsNext() {
  const room = makeInvestorTermsFollowupRoom();
  document.querySelector(room.nextStep.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorTermsResult(`Opened: ${room.nextStep.title}.`, "neutral");
}

function openInvestorTermsClosePlan() {
  document.querySelector("#investor-close-plan")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorTermsResult("Investor Close Plan Room opened.", "neutral");
}

async function copyInvestorTermsRoom() {
  const copied = await copyTextToClipboard(makeInvestorTermsMarkdown(makeInvestorTermsFollowupRoom()));
  flashInvestorTermsResult(copied ? "Investor terms follow-up copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorTermsRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-terms-followup-${date}.json`, JSON.stringify(makeInvestorTermsFollowupRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorTermsResult("Investor terms follow-up JSON exported.", "success");
}

function makeInvestorTermsMarkdown(room) {
  return [
    "# MajlisAlpha Investor Terms & Follow-Up Room",
    "",
    `Version: ${room.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Terms readiness: ${room.score}% (${room.statusLabel})`,
    `Owner clarity: ${room.metrics.ownerClarity}%`,
    `Commercial terms: ${room.metrics.termsClarity}%`,
    `Proof lock: ${room.metrics.proofLock}%`,
    `Follow-up discipline: ${room.metrics.followupDiscipline}%`,
    "",
    room.summary,
    "",
    "## Terms Cards",
    ...room.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Follow-Up Steps",
    ...room.steps.map((row) => `### ${row.lane}: ${row.title}\n${row.detail}\nAsk: ${row.ask}\nGap: ${row.gap}\nStatus: ${row.status}`),
    "",
    "## Next Terms Gap",
    `${room.nextStep.title}: ${room.nextStep.gap}`,
    "",
    "_Investor terms follow-up is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorTermsResult(message, tone = "neutral") {
  if (!els.investorTermsResult) return;
  els.investorTermsResult.className = `builder-result is-${tone}`;
  els.investorTermsResult.textContent = message;
}

function renderInvestorIcMemoRoom() {
  if (!els.investorIcSummary || !els.investorIcGrid || !els.investorIcRows) return;
  const memo = makeInvestorIcMemoRoom();
  window.MajlisAlphaInvestorIcMemo = memo;
  if (els.openInvestorIcNext) {
    els.openInvestorIcNext.textContent = memo.nextItem.buttonLabel;
  }
  els.investorIcSummary.innerHTML = `
    <div class="investor-ic-hero ${escapeAttr(memo.statusClass)}">
      <div>
        <span>${escapeHtml(memo.statusLabel)}</span>
        <strong>${escapeHtml(memo.headline)}</strong>
        <p>${escapeHtml(memo.summary)}</p>
      </div>
      <div class="investor-ic-score">
        <span>IC Memo</span>
        <strong>${escapeHtml(memo.score)}%</strong>
      </div>
    </div>
  `;
  els.investorIcGrid.innerHTML = memo.cards.map((card) => `
    <article class="investor-ic-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorIcRows.innerHTML = memo.sections.map((row) => `
    <article class="investor-ic-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.section)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
        <em>${escapeHtml(row.memoLine)}</em>
      </div>
      <div class="investor-ic-row-meta">
        <span>${escapeHtml(row.owner)}</span>
        <strong>${escapeHtml(row.signal)}</strong>
        <p>${escapeHtml(row.gap)}</p>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorIcMemoRoom() {
  const terms = makeInvestorTermsFollowupRoom();
  const closePlan = terms.closePlan || makeInvestorClosePlanRoom();
  const commitment = terms.commitment || closePlan.commitment || makeInvestorCommitmentTracker();
  const dataRoom = closePlan.dataRoom || makeInvestorDataRoom();
  const diligence = makeFounderDiligenceRoom();
  const boardPack = makeFounderBoardPackCenter();
  const revenue = terms.revenue || makeFounderRevenueForecastCenter();
  const objectionDesk = closePlan.objectionDesk || makeInvestorObjectionDesk();
  const pagesAudit = makePagesDeploymentAudit();
  const citations = state.currentCitations || [];
  const realCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "real").length;
  const importedCitations = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "imported").length;
  const sourceCount = state.sourcePackDocs.length + state.uploadedDocs.length;
  const evidenceCount = state.pilotEvidenceLedger.length + citations.length;
  const relationshipCount = terms.metrics.relationshipCount || 0;
  const warmReplies = terms.metrics.warmReplies || 0;
  const weightedMrr = terms.metrics.weightedMrr || 0;
  const forecastMrr = terms.metrics.forecastMrr || 0;
  const conversionCount = terms.metrics.conversionCount || 0;
  const advancedConversions = terms.metrics.advancedConversions || 0;
  const narrativeScore = clampScore(
    terms.score * 0.18
    + dataRoom.score * 0.18
    + diligence.score * 0.16
    + boardPack.score * 0.14
    + (state.lastBrief ? 10 : 0)
    + state.memoReviews.length * 5
    + state.decisionJournal.length * 4
  );
  const sourceProofScore = clampScore(
    terms.metrics.proofLock * 0.22
    + dataRoom.score * 0.18
    + Math.min(evidenceCount, 12) * 6
    + realCitations * 8
    + importedCitations * 5
    + sourceCount * 3
  );
  const commercialScore = clampScore(
    terms.metrics.termsClarity * 0.25
    + closePlan.metrics.commercialAskSignal * 0.2
    + revenue.score * 0.13
    + Math.min(weightedMrr, 3000) / 28
    + Math.min(forecastMrr, 3000) / 35
    + conversionCount * 6
    + advancedConversions * 10
  );
  const riskScore = clampScore(
    terms.metrics.boundaryControl * 0.24
    + closePlan.metrics.riskControlSignal * 0.2
    + objectionDesk.score * 0.16
    + diligence.score * 0.12
    + pagesAudit.score * 0.1
    + (document.querySelector("#compliance-audit") ? 8 : 0)
  );
  const decisionScore = clampScore(
    terms.metrics.ownerClarity * 0.2
    + closePlan.metrics.decisionSignal * 0.22
    + terms.metrics.followupDiscipline * 0.18
    + relationshipCount * 7
    + warmReplies * 9
    + state.decisionJournal.length * 5
  );
  const followupScore = clampScore(
    terms.score * 0.2
    + commitment.score * 0.18
    + terms.metrics.followupDiscipline * 0.18
    + state.pilotFollowups.length * 7
    + state.pilotSessions.length * 4
    + state.pilotOutreachDrafts.length * 4
  );
  const score = clampScore(
    narrativeScore * 0.17
    + sourceProofScore * 0.2
    + commercialScore * 0.17
    + riskScore * 0.17
    + decisionScore * 0.16
    + followupScore * 0.13
  );
  const sections = makeInvestorIcMemoRows({
    terms,
    closePlan,
    dataRoom,
    diligence,
    boardPack,
    revenue,
    objectionDesk,
    pagesAudit,
    narrativeScore,
    sourceProofScore,
    commercialScore,
    riskScore,
    decisionScore,
    followupScore,
    evidenceCount,
    sourceCount,
    realCitations,
    importedCitations,
    relationshipCount,
    warmReplies,
    weightedMrr,
    forecastMrr,
    conversionCount,
    advancedConversions
  });
  const nextItem = sections.find((row) => !row.passed) || sections[sections.length - 1];
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "IC memo ready" : score >= 50 ? "IC memo forming" : "IC memo gaps";
  const headline = score >= 75
    ? "The investor path can be packaged into a committee-ready memo."
    : "Build the investor committee memo before asking for a bigger yes.";
  const cards = [
    makeInvestorIcCard({
      label: "Memo readiness",
      passed: score >= 65,
      value: `${score}%`,
      detail: "Weighted readiness across narrative, source proof, commercial ask, risks, decision path, and follow-up motion.",
      status: score >= 75 ? "ready" : score >= 50 ? "forming" : "open"
    }),
    makeInvestorIcCard({
      label: "Investment question",
      passed: narrativeScore >= 55,
      value: `${narrativeScore}%`,
      detail: `Diligence room ${diligence.score}%, board pack ${boardPack.score}%, and terms readiness ${terms.score}% shape the memo spine.`,
      status: narrativeScore >= 70 ? "clear" : narrativeScore >= 50 ? "draft" : "missing"
    }),
    makeInvestorIcCard({
      label: "Proof pack",
      passed: sourceProofScore >= 55,
      value: `${evidenceCount} items`,
      detail: `${realCitations} REAL citations, ${importedCitations} imported citations, ${state.pilotEvidenceLedger.length} evidence ledger item${state.pilotEvidenceLedger.length === 1 ? "" : "s"}, and ${sourceCount} local source record${sourceCount === 1 ? "" : "s"}.`,
      status: sourceProofScore >= 70 ? "attached" : sourceProofScore >= 50 ? "thin" : "gap"
    }),
    makeInvestorIcCard({
      label: "Commercial ask",
      passed: commercialScore >= 50,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"}, and AED ${formatInteger(forecastMrr)} forecast MRR support the ask.`,
      status: commercialScore >= 70 ? "priced" : commercialScore >= 50 ? "framed" : "unpriced"
    }),
    makeInvestorIcCard({
      label: "Risk controls",
      passed: riskScore >= 60,
      value: `${riskScore}%`,
      detail: `Boundary control ${terms.metrics.boundaryControl}%, objection desk ${objectionDesk.score}%, and deploy health ${pagesAudit.score}%.`,
      status: riskScore >= 75 ? "controlled" : riskScore >= 55 ? "explain" : "gap"
    }),
    makeInvestorIcCard({
      label: "Decision path",
      passed: decisionScore >= 55,
      value: `${relationshipCount} rel.`,
      detail: `${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, ${state.decisionJournal.length} decision note${state.decisionJournal.length === 1 ? "" : "s"}, and ${state.pilotFollowups.length} follow-up${state.pilotFollowups.length === 1 ? "" : "s"} are in the path.`,
      status: decisionScore >= 70 ? "owned" : decisionScore >= 50 ? "forming" : "unclear"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `IC memo readiness is ${score}%. Narrative ${narrativeScore}%, source proof ${sourceProofScore}%, commercial ask ${commercialScore}%, risk controls ${riskScore}%, decision path ${decisionScore}%, and follow-up motion ${followupScore}%. Next: ${nextItem.title}.`,
    nextItem,
    cards,
    sections,
    metrics: {
      narrativeScore,
      sourceProofScore,
      commercialScore,
      riskScore,
      decisionScore,
      followupScore,
      evidenceCount,
      sourceCount,
      realCitations,
      importedCitations,
      relationshipCount,
      warmReplies,
      weightedMrr,
      forecastMrr,
      conversionCount,
      advancedConversions
    },
    terms,
    closePlan,
    dataRoom,
    diligence,
    boardPack,
    revenue,
    objectionDesk,
    pagesAudit
  };
}

function makeInvestorIcMemoRows({ terms, closePlan, dataRoom, diligence, boardPack, revenue, objectionDesk, pagesAudit, narrativeScore, sourceProofScore, commercialScore, riskScore, decisionScore, followupScore, evidenceCount, sourceCount, realCitations, importedCitations, relationshipCount, warmReplies, weightedMrr, forecastMrr, conversionCount, advancedConversions }) {
  const account = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE investor account";
  return [
    makeInvestorIcMemoRow({
      section: "Thesis",
      title: "State the investor decision in one sentence",
      detail: `Frame whether ${account} should review the data room, open a commercial pilot, introduce an operator, or continue funding diligence.`,
      memoLine: "Decision question: what should the investor committee approve, decline, or request next?",
      owner: "Founder",
      signal: `${narrativeScore}% narrative`,
      gap: narrativeScore >= 55 ? "Use the board pack and terms room as the memo spine." : "Open diligence and board pack before writing the memo thesis.",
      status: narrativeScore >= 55 ? "usable" : "draft gap",
      target: narrativeScore >= 55 ? "#investor-terms-followup" : "#founder-diligence-room",
      buttonLabel: narrativeScore >= 55 ? "Open terms" : "Open diligence",
      passed: narrativeScore >= 55,
      priority: "High"
    }),
    makeInvestorIcMemoRow({
      section: "Source proof",
      title: "Attach the evidence bundle behind the claim",
      detail: `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${realCitations} REAL citation${realCitations === 1 ? "" : "s"}, ${importedCitations} imported citation${importedCitations === 1 ? "" : "s"}, and ${sourceCount} local source record${sourceCount === 1 ? "" : "s"} are visible.`,
      memoLine: "Evidence line: show the official source, the answer artifact, and the proof packet.",
      owner: "Operator",
      signal: `${sourceProofScore}% proof`,
      gap: sourceProofScore >= 55 ? "Attach proof packet and source trail to the memo." : "Add one official source or evidence ledger item before sharing.",
      status: sourceProofScore >= 55 ? "attached" : "source gap",
      target: sourceProofScore >= 55 ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: sourceProofScore >= 55 ? "Open proof packet" : "Open evidence ledger",
      passed: sourceProofScore >= 55,
      priority: "High"
    }),
    makeInvestorIcMemoRow({
      section: "Commercial case",
      title: "Make the ask specific without overpromising",
      detail: `Weighted MRR is AED ${formatInteger(weightedMrr)}, forecast MRR is AED ${formatInteger(forecastMrr)}, with ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"} and ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"}.`,
      memoLine: "Ask line: review, pilot, source access, team seat, operator intro, or funding diligence.",
      owner: "Founder",
      signal: `${commercialScore}% ask`,
      gap: commercialScore >= 50 ? "Keep terms framed as next-step options." : "Open revenue forecast and close plan before stating the ask.",
      status: commercialScore >= 50 ? "framed" : "unpriced",
      target: commercialScore >= 50 ? "#investor-close-plan" : "#founder-revenue-forecast",
      buttonLabel: commercialScore >= 50 ? "Open close plan" : "Open forecast",
      passed: commercialScore >= 50,
      priority: "High"
    }),
    makeInvestorIcMemoRow({
      section: "Risks",
      title: "List the reasons an investor should wait",
      detail: `Risk controls are ${riskScore}%, objection desk readiness is ${objectionDesk.score}%, and Pages Doctor health is ${pagesAudit.score}%.`,
      memoLine: "Risk line: evidence gaps, sales cycle, source rights, regulatory boundary, and product execution.",
      owner: "Operator",
      signal: `${riskScore}% control`,
      gap: riskScore >= 60 ? "Use the objection desk and compliance language." : "Open objection desk and compliance audit before memo export.",
      status: riskScore >= 60 ? "controlled" : "explain",
      target: riskScore >= 60 ? "#investor-objection-desk" : "#compliance-audit",
      buttonLabel: riskScore >= 60 ? "Open objection desk" : "Open compliance",
      passed: riskScore >= 60,
      priority: "Medium"
    }),
    makeInvestorIcMemoRow({
      section: "Decision owner",
      title: "Name who says yes and what unlocks the next step",
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and decision-path score ${decisionScore}% point to the owner.`,
      memoLine: "Owner line: who approves review, pilot, intro, budget, source access, or funding conversation?",
      owner: "Founder",
      signal: `${decisionScore}% owner`,
      gap: decisionScore >= 55 ? "Keep the owner and decision date in the memo." : "Open commitment tracker and terms room to name the owner.",
      status: decisionScore >= 55 ? "owned" : "unclear",
      target: decisionScore >= 55 ? "#investor-commitment-tracker" : "#investor-terms-followup",
      buttonLabel: decisionScore >= 55 ? "Open commitment" : "Open terms",
      passed: decisionScore >= 55,
      priority: "Medium"
    }),
    makeInvestorIcMemoRow({
      section: "Next action",
      title: "End with one dated follow-up motion",
      detail: `Follow-up motion is ${followupScore}%, terms readiness is ${terms.score}%, and commitment readiness is ${terms.commitment?.score || closePlan.commitment?.score || 0}%.`,
      memoLine: "Next line: date, owner, channel, expected answer, and fallback if the investor stalls.",
      owner: "Founder",
      signal: `${followupScore}% motion`,
      gap: followupScore >= 55 ? "Use the terms room to keep the next action moving." : "Create one follow-up before sending the memo.",
      status: followupScore >= 55 ? "dated" : "undated",
      target: "#investor-terms-followup",
      buttonLabel: "Open terms",
      passed: followupScore >= 55,
      priority: "Medium"
    })
  ];
}

function makeInvestorIcCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["forming", "draft", "thin", "framed", "explain"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorIcMemoRow({ section, title, detail, memoLine, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    section,
    title,
    detail,
    memoLine,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorIcNext() {
  const memo = makeInvestorIcMemoRoom();
  document.querySelector(memo.nextItem.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorIcResult(`Opened: ${memo.nextItem.title}.`, "neutral");
}

function openInvestorIcTerms() {
  document.querySelector("#investor-terms-followup")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorIcResult("Investor Terms & Follow-Up Room opened.", "neutral");
}

async function copyInvestorIcMemo() {
  const copied = await copyTextToClipboard(makeInvestorIcMemoMarkdown(makeInvestorIcMemoRoom()));
  flashInvestorIcResult(copied ? "Investor IC memo copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorIcMemo() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-ic-memo-${date}.json`, JSON.stringify(makeInvestorIcMemoRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorIcResult("Investor IC memo JSON exported.", "success");
}

function makeInvestorIcMemoMarkdown(memo) {
  return [
    "# MajlisAlpha Investor IC Memo Room",
    "",
    `Version: ${memo.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `IC memo readiness: ${memo.score}% (${memo.statusLabel})`,
    `Narrative: ${memo.metrics.narrativeScore}%`,
    `Source proof: ${memo.metrics.sourceProofScore}%`,
    `Commercial ask: ${memo.metrics.commercialScore}%`,
    `Risk controls: ${memo.metrics.riskScore}%`,
    `Decision path: ${memo.metrics.decisionScore}%`,
    "",
    memo.summary,
    "",
    "## Memo Cards",
    ...memo.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## IC Memo Sections",
    ...memo.sections.map((row) => `### ${row.section}: ${row.title}\n${row.detail}\n${row.memoLine}\nGap: ${row.gap}\nStatus: ${row.status}`),
    "",
    "## Next Memo Gap",
    `${memo.nextItem.title}: ${memo.nextItem.gap}`,
    "",
    "_Investor IC memo is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorIcResult(message, tone = "neutral") {
  if (!els.investorIcResult) return;
  els.investorIcResult.className = `builder-result is-${tone}`;
  els.investorIcResult.textContent = message;
}

function renderInvestorDecisionRoom() {
  if (!els.investorDecisionSummary || !els.investorDecisionGrid || !els.investorDecisionRows) return;
  const room = makeInvestorDecisionRoom();
  window.MajlisAlphaInvestorDecisionRoom = room;
  if (els.openInvestorDecisionNext) {
    els.openInvestorDecisionNext.textContent = room.nextOutcome.buttonLabel;
  }
  els.investorDecisionSummary.innerHTML = `
    <div class="investor-decision-hero ${escapeAttr(room.statusClass)}">
      <div>
        <span>${escapeHtml(room.statusLabel)}</span>
        <strong>${escapeHtml(room.headline)}</strong>
        <p>${escapeHtml(room.summary)}</p>
      </div>
      <div class="investor-decision-score">
        <span>Decision</span>
        <strong>${escapeHtml(room.score)}%</strong>
      </div>
    </div>
  `;
  els.investorDecisionGrid.innerHTML = room.cards.map((card) => `
    <article class="investor-decision-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.investorDecisionRows.innerHTML = room.outcomes.map((row) => `
    <article class="investor-decision-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.outcome)}</span>
        <strong>${escapeHtml(row.title)}</strong>
        <p>${escapeHtml(row.detail)}</p>
        <em>${escapeHtml(row.decisionLine)}</em>
      </div>
      <div class="investor-decision-row-meta">
        <span>${escapeHtml(row.owner)}</span>
        <strong>${escapeHtml(row.signal)}</strong>
        <p>${escapeHtml(row.gap)}</p>
        <em>${escapeHtml(row.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeInvestorDecisionRoom() {
  const icMemo = makeInvestorIcMemoRoom();
  const terms = icMemo.terms || makeInvestorTermsFollowupRoom();
  const closePlan = icMemo.closePlan || terms.closePlan || makeInvestorClosePlanRoom();
  const dataRoom = icMemo.dataRoom || closePlan.dataRoom || makeInvestorDataRoom();
  const revenue = icMemo.revenue || makeFounderRevenueForecastCenter();
  const objectionDesk = icMemo.objectionDesk || makeInvestorObjectionDesk();
  const pagesAudit = icMemo.pagesAudit || makePagesDeploymentAudit();
  const termsMetrics = terms.metrics || {};
  const closeMetrics = closePlan.metrics || {};
  const icMetrics = icMemo.metrics || {};
  const relationshipCount = icMetrics.relationshipCount || termsMetrics.relationshipCount || 0;
  const warmReplies = icMetrics.warmReplies || termsMetrics.warmReplies || 0;
  const weightedMrr = icMetrics.weightedMrr || termsMetrics.weightedMrr || 0;
  const forecastMrr = icMetrics.forecastMrr || termsMetrics.forecastMrr || 0;
  const conversionCount = icMetrics.conversionCount || termsMetrics.conversionCount || 0;
  const advancedConversions = icMetrics.advancedConversions || termsMetrics.advancedConversions || 0;
  const evidenceCount = icMetrics.evidenceCount || 0;
  const sourceCount = icMetrics.sourceCount || 0;
  const realCitations = icMetrics.realCitations || 0;
  const importedCitations = icMetrics.importedCitations || 0;
  const openFollowups = state.pilotFollowups.filter((followup) => {
    const status = String(followup.status || "").toLowerCase();
    return status !== "done" && status !== "closed";
  }).length;
  const decisionNotes = state.decisionJournal.length;
  const reviewNotes = state.memoReviews.length;
  const decisionReadiness = clampScore(
    icMemo.score * 0.22
    + (icMetrics.decisionScore || 0) * 0.22
    + (termsMetrics.ownerClarity || 0) * 0.16
    + decisionNotes * 6
    + reviewNotes * 4
    + warmReplies * 8
  );
  const proofRequestReadiness = clampScore(
    (icMetrics.sourceProofScore || 0) * 0.28
    + dataRoom.score * 0.16
    + Math.min(evidenceCount, 14) * 5
    + sourceCount * 3
    + realCitations * 8
    + importedCitations * 4
  );
  const commercialDecision = clampScore(
    (icMetrics.commercialScore || 0) * 0.24
    + (closeMetrics.commercialAskSignal || 0) * 0.18
    + revenue.score * 0.12
    + Math.min(weightedMrr, 3000) / 30
    + Math.min(forecastMrr, 3000) / 40
    + conversionCount * 6
    + advancedConversions * 10
  );
  const riskGate = clampScore(
    (icMetrics.riskScore || 0) * 0.28
    + (termsMetrics.boundaryControl || 0) * 0.18
    + (closeMetrics.riskControlSignal || 0) * 0.18
    + objectionDesk.score * 0.12
    + pagesAudit.score * 0.12
  );
  const stakeholderCommitment = clampScore(
    (termsMetrics.stakeholderMap || 0) * 0.22
    + relationshipCount * 7
    + warmReplies * 10
    + state.pilotOutreachDrafts.length * 4
    + state.pilotSessions.length * 3
    + decisionNotes * 4
  );
  const followupClock = clampScore(
    (icMetrics.followupScore || 0) * 0.24
    + (termsMetrics.followupDiscipline || 0) * 0.22
    + state.pilotFollowups.length * 7
    + openFollowups * 6
    + state.pilotSessions.length * 3
    + decisionNotes * 4
  );
  const score = clampScore(
    decisionReadiness * 0.18
    + proofRequestReadiness * 0.18
    + commercialDecision * 0.17
    + riskGate * 0.17
    + stakeholderCommitment * 0.15
    + followupClock * 0.15
  );
  const outcomes = makeInvestorDecisionRows({
    icMemo,
    terms,
    closePlan,
    decisionReadiness,
    proofRequestReadiness,
    commercialDecision,
    riskGate,
    stakeholderCommitment,
    followupClock,
    evidenceCount,
    sourceCount,
    realCitations,
    importedCitations,
    relationshipCount,
    warmReplies,
    weightedMrr,
    forecastMrr,
    conversionCount,
    advancedConversions,
    openFollowups,
    decisionNotes,
    reviewNotes
  });
  const nextOutcome = outcomes.find((row) => !row.passed) || outcomes[0];
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Decision ready" : score >= 50 ? "Decision forming" : "Decision gaps";
  const headline = score >= 75
    ? "The investor committee feedback can become a clear next decision."
    : "Turn the memo into an approve, wait, proof, intro, pilot, or diligence path.";
  const cards = [
    makeInvestorDecisionCard({
      label: "Decision readiness",
      passed: decisionReadiness >= 60,
      value: `${decisionReadiness}%`,
      detail: `${decisionNotes} decision note${decisionNotes === 1 ? "" : "s"}, ${reviewNotes} review note${reviewNotes === 1 ? "" : "s"}, and ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"} support the next answer.`,
      status: decisionReadiness >= 75 ? "ready" : decisionReadiness >= 50 ? "forming" : "open"
    }),
    makeInvestorDecisionCard({
      label: "Proof requests",
      passed: proofRequestReadiness >= 60,
      value: `${evidenceCount} items`,
      detail: `${realCitations} REAL citations, ${importedCitations} imported citations, and ${sourceCount} source record${sourceCount === 1 ? "" : "s"} are available for diligence follow-up.`,
      status: proofRequestReadiness >= 75 ? "answered" : proofRequestReadiness >= 50 ? "thin" : "missing"
    }),
    makeInvestorDecisionCard({
      label: "Commercial decision",
      passed: commercialDecision >= 55,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"}, and AED ${formatInteger(forecastMrr)} forecast MRR frame the commercial path.`,
      status: commercialDecision >= 75 ? "priced" : commercialDecision >= 50 ? "framed" : "unpriced"
    }),
    makeInvestorDecisionCard({
      label: "Risk gate",
      passed: riskGate >= 60,
      value: `${riskGate}%`,
      detail: `Risk controls combine IC risk score ${icMetrics.riskScore || 0}%, objection desk ${objectionDesk.score}%, and deployment health ${pagesAudit.score}%.`,
      status: riskGate >= 75 ? "cleared" : riskGate >= 55 ? "watch" : "blocker"
    }),
    makeInvestorDecisionCard({
      label: "Stakeholder signal",
      passed: stakeholderCommitment >= 55,
      value: `${relationshipCount} rel.`,
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and ${state.pilotOutreachDrafts.length} outreach draft${state.pilotOutreachDrafts.length === 1 ? "" : "s"} shape the owner map.`,
      status: stakeholderCommitment >= 70 ? "owned" : stakeholderCommitment >= 50 ? "forming" : "unknown"
    }),
    makeInvestorDecisionCard({
      label: "Follow-up clock",
      passed: followupClock >= 55,
      value: `${openFollowups} open`,
      detail: `${state.pilotFollowups.length} follow-up${state.pilotFollowups.length === 1 ? "" : "s"} and ${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"} keep the decision from drifting.`,
      status: followupClock >= 70 ? "dated" : followupClock >= 50 ? "queued" : "undated"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `Investor decision readiness is ${score}%. Decision ${decisionReadiness}%, proof ${proofRequestReadiness}%, commercial ${commercialDecision}%, risk ${riskGate}%, stakeholder ${stakeholderCommitment}%, and follow-up clock ${followupClock}%. Next: ${nextOutcome.title}.`,
    nextOutcome,
    cards,
    outcomes,
    metrics: {
      decisionReadiness,
      proofRequestReadiness,
      commercialDecision,
      riskGate,
      stakeholderCommitment,
      followupClock,
      evidenceCount,
      sourceCount,
      realCitations,
      importedCitations,
      relationshipCount,
      warmReplies,
      weightedMrr,
      forecastMrr,
      conversionCount,
      advancedConversions,
      openFollowups,
      decisionNotes,
      reviewNotes
    },
    icMemo,
    terms,
    closePlan,
    dataRoom,
    revenue,
    objectionDesk,
    pagesAudit
  };
}

function makeInvestorDecisionRows({ icMemo, terms, closePlan, decisionReadiness, proofRequestReadiness, commercialDecision, riskGate, stakeholderCommitment, followupClock, evidenceCount, sourceCount, realCitations, importedCitations, relationshipCount, warmReplies, weightedMrr, forecastMrr, conversionCount, advancedConversions, openFollowups, decisionNotes, reviewNotes }) {
  const account = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE investor account";
  const proofLine = `${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${realCitations} REAL citation${realCitations === 1 ? "" : "s"}, ${importedCitations} imported citation${importedCitations === 1 ? "" : "s"}, and ${sourceCount} source record${sourceCount === 1 ? "" : "s"}.`;
  return [
    makeInvestorDecisionRow({
      outcome: "Approve pilot",
      title: "Move the account to a paid-pilot decision",
      detail: `Commercial decision is ${commercialDecision}% with AED ${formatInteger(weightedMrr)} weighted MRR, AED ${formatInteger(forecastMrr)} forecast MRR, ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, and ${advancedConversions} advanced signal${advancedConversions === 1 ? "" : "s"}.`,
      decisionLine: "Decision line: approve only the next operating step, not an investment recommendation.",
      owner: "Founder",
      signal: `${commercialDecision}% commercial`,
      gap: commercialDecision >= 60 && proofRequestReadiness >= 55 && riskGate >= 60 ? "Use the close room to write the pilot terms." : "Tighten proof, risk, or commercial ask before calling this approved.",
      status: commercialDecision >= 60 && proofRequestReadiness >= 55 && riskGate >= 60 ? "pilot candidate" : "not yet",
      target: commercialDecision >= 60 && proofRequestReadiness >= 55 && riskGate >= 60 ? "#pilot-close-room" : "#investor-close-plan",
      buttonLabel: commercialDecision >= 60 && proofRequestReadiness >= 55 && riskGate >= 60 ? "Open pilot close" : "Open close plan",
      passed: commercialDecision >= 60 && proofRequestReadiness >= 55 && riskGate >= 60,
      priority: "High"
    }),
    makeInvestorDecisionRow({
      outcome: "Request proof",
      title: "Answer the next diligence proof request",
      detail: `Proof readiness is ${proofRequestReadiness}%. ${proofLine}`,
      decisionLine: "Decision line: the next response should cite the exact source and the answer artifact.",
      owner: "Operator",
      signal: `${proofRequestReadiness}% proof`,
      gap: proofRequestReadiness >= 65 ? "Use proof packet and source trail in the reply." : "Add one verified evidence item or official source before the next investor ask.",
      status: proofRequestReadiness >= 65 ? "answered" : "proof gap",
      target: proofRequestReadiness >= 65 ? "#pilot-proof-packet" : "#pilot-evidence-ledger",
      buttonLabel: proofRequestReadiness >= 65 ? "Open proof packet" : "Open evidence ledger",
      passed: proofRequestReadiness >= 65,
      priority: "High"
    }),
    makeInvestorDecisionRow({
      outcome: "Ask for intro",
      title: "Route the next ask through the right stakeholder",
      detail: `${account} has ${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and stakeholder commitment score ${stakeholderCommitment}%.`,
      decisionLine: "Decision line: name who can unlock review, operator access, source access, budget, or diligence.",
      owner: "Founder",
      signal: `${stakeholderCommitment}% stakeholder`,
      gap: stakeholderCommitment >= 55 ? "Use the intro room or momentum ledger to route the next ask." : "Map the stakeholder before asking for a bigger decision.",
      status: stakeholderCommitment >= 55 ? "routable" : "unknown",
      target: stakeholderCommitment >= 55 ? "#investor-intro-room" : "#investor-momentum-ledger",
      buttonLabel: stakeholderCommitment >= 55 ? "Open intro room" : "Open momentum",
      passed: stakeholderCommitment >= 55,
      priority: "Medium"
    }),
    makeInvestorDecisionRow({
      outcome: "Continue diligence",
      title: "Keep the committee path open without forcing a yes",
      detail: `IC memo score is ${icMemo.score}%, terms readiness is ${terms.score}%, and decision readiness is ${decisionReadiness}%.`,
      decisionLine: "Decision line: continue diligence when the investment question is useful but the proof or terms are not complete.",
      owner: "Founder",
      signal: `${decisionReadiness}% decision`,
      gap: decisionReadiness >= 60 ? "Use the IC memo as the diligence spine." : "Open the memo and diligence room to clarify the decision question.",
      status: decisionReadiness >= 60 ? "diligence path" : "needs memo",
      target: decisionReadiness >= 60 ? "#investor-ic-memo" : "#founder-diligence-room",
      buttonLabel: decisionReadiness >= 60 ? "Open IC memo" : "Open diligence",
      passed: decisionReadiness >= 60,
      priority: "Medium"
    }),
    makeInvestorDecisionRow({
      outcome: "Wait or no-go",
      title: "Make the wait decision explicit and controlled",
      detail: `Risk gate is ${riskGate}%, close-plan risk control is ${closePlan.metrics?.riskControlSignal || 0}%, and review trail has ${reviewNotes} memo review${reviewNotes === 1 ? "" : "s"}.`,
      decisionLine: "Decision line: if risk is the answer, say what evidence or event changes the decision.",
      owner: "Operator",
      signal: `${riskGate}% risk`,
      gap: riskGate >= 60 ? "Use the objection desk language to state wait/no-go conditions." : "Clear the objection and compliance path before sharing.",
      status: riskGate >= 60 ? "bounded" : "blocker",
      target: riskGate >= 60 ? "#investor-objection-desk" : "#compliance-audit",
      buttonLabel: riskGate >= 60 ? "Open objection desk" : "Open compliance",
      passed: riskGate >= 60,
      priority: "High"
    }),
    makeInvestorDecisionRow({
      outcome: "Set next review",
      title: "Prevent investor interest from going stale",
      detail: `${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}, ${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"}, and ${decisionNotes} decision note${decisionNotes === 1 ? "" : "s"} keep the clock visible.`,
      decisionLine: "Decision line: end with date, owner, channel, expected answer, and fallback path.",
      owner: "Founder",
      signal: `${followupClock}% clock`,
      gap: followupClock >= 55 ? "Keep the dated next review in the follow-up room." : "Create one dated follow-up with expected outcome.",
      status: followupClock >= 55 ? "dated" : "undated",
      target: "#investor-terms-followup",
      buttonLabel: "Open terms",
      passed: followupClock >= 55,
      priority: "Medium"
    })
  ];
}

function makeInvestorDecisionCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["forming", "thin", "framed", "watch", "queued"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeInvestorDecisionRow({ outcome, title, detail, decisionLine, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    outcome,
    title,
    detail,
    decisionLine,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openInvestorDecisionNext() {
  const room = makeInvestorDecisionRoom();
  document.querySelector(room.nextOutcome.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorDecisionResult(`Opened: ${room.nextOutcome.title}.`, "neutral");
}

function openInvestorDecisionIc() {
  document.querySelector("#investor-ic-memo")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashInvestorDecisionResult("Investor IC Memo Room opened.", "neutral");
}

async function copyInvestorDecisionRoom() {
  const copied = await copyTextToClipboard(makeInvestorDecisionMarkdown(makeInvestorDecisionRoom()));
  flashInvestorDecisionResult(copied ? "Investor decision room copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportInvestorDecisionRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-investor-decision-room-${date}.json`, JSON.stringify(makeInvestorDecisionRoom(), null, 2), "application/json;charset=utf-8");
  flashInvestorDecisionResult("Investor decision room JSON exported.", "success");
}

function makeInvestorDecisionMarkdown(room) {
  return [
    "# MajlisAlpha Investor Decision Room",
    "",
    `Version: ${room.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Decision readiness: ${room.score}% (${room.statusLabel})`,
    `Decision path: ${room.metrics.decisionReadiness}%`,
    `Proof: ${room.metrics.proofRequestReadiness}%`,
    `Commercial: ${room.metrics.commercialDecision}%`,
    `Risk: ${room.metrics.riskGate}%`,
    `Stakeholder: ${room.metrics.stakeholderCommitment}%`,
    `Follow-up clock: ${room.metrics.followupClock}%`,
    "",
    room.summary,
    "",
    "## Decision Cards",
    ...room.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Decision Outcomes",
    ...room.outcomes.map((row) => `### ${row.outcome}: ${row.title}\n${row.detail}\n${row.decisionLine}\nGap: ${row.gap}\nStatus: ${row.status}`),
    "",
    "## Next Decision Gap",
    `${room.nextOutcome.title}: ${room.nextOutcome.gap}`,
    "",
    "_Investor Decision Room is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashInvestorDecisionResult(message, tone = "neutral") {
  if (!els.investorDecisionResult) return;
  els.investorDecisionResult.className = `builder-result is-${tone}`;
  els.investorDecisionResult.textContent = message;
}

function renderFundingRoundCommandCenter() {
  if (!els.fundingRoundSummary || !els.fundingRoundGrid || !els.fundingRoundRows) return;
  const command = makeFundingRoundCommandCenter();
  window.MajlisAlphaFundingRoundCommand = command;
  if (els.openFundingRoundNext) {
    els.openFundingRoundNext.textContent = command.nextLane.buttonLabel;
  }
  els.fundingRoundSummary.innerHTML = `
    <div class="funding-round-hero ${escapeAttr(command.statusClass)}">
      <div>
        <span>${escapeHtml(command.statusLabel)}</span>
        <strong>${escapeHtml(command.headline)}</strong>
        <p>${escapeHtml(command.summary)}</p>
      </div>
      <div class="funding-round-score">
        <span>Round</span>
        <strong>${escapeHtml(command.score)}%</strong>
      </div>
    </div>
  `;
  els.fundingRoundGrid.innerHTML = command.cards.map((card) => `
    <article class="funding-round-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.fundingRoundRows.innerHTML = command.lanes.map((lane) => `
    <article class="funding-round-row ${escapeAttr(lane.className)}">
      <div>
        <span>${escapeHtml(lane.lane)}</span>
        <strong>${escapeHtml(lane.title)}</strong>
        <p>${escapeHtml(lane.detail)}</p>
        <em>${escapeHtml(lane.commandLine)}</em>
      </div>
      <div class="funding-round-row-meta">
        <span>${escapeHtml(lane.owner)}</span>
        <strong>${escapeHtml(lane.signal)}</strong>
        <p>${escapeHtml(lane.gap)}</p>
        <em>${escapeHtml(lane.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeFundingRoundCommandCenter() {
  const decisionRoom = makeInvestorDecisionRoom();
  const icMemo = decisionRoom.icMemo || makeInvestorIcMemoRoom();
  const terms = decisionRoom.terms || icMemo.terms || makeInvestorTermsFollowupRoom();
  const closePlan = decisionRoom.closePlan || icMemo.closePlan || makeInvestorClosePlanRoom();
  const dataRoom = decisionRoom.dataRoom || icMemo.dataRoom || makeInvestorDataRoom();
  const revenue = decisionRoom.revenue || icMemo.revenue || makeFounderRevenueForecastCenter();
  const objectionDesk = decisionRoom.objectionDesk || icMemo.objectionDesk || makeInvestorObjectionDesk();
  const pagesAudit = decisionRoom.pagesAudit || icMemo.pagesAudit || makePagesDeploymentAudit();
  const decisionMetrics = decisionRoom.metrics || {};
  const termsMetrics = terms.metrics || {};
  const closeMetrics = closePlan.metrics || {};
  const revenueMetrics = revenue.metrics || {};
  const relationshipCount = decisionMetrics.relationshipCount || 0;
  const warmReplies = decisionMetrics.warmReplies || 0;
  const weightedMrr = decisionMetrics.weightedMrr || revenueMetrics.weightedMrr || 0;
  const forecastMrr = decisionMetrics.forecastMrr || revenueMetrics.forecastMrr || 0;
  const runRateArr = revenueMetrics.runRateArr || 0;
  const conversionCount = decisionMetrics.conversionCount || 0;
  const advancedConversions = decisionMetrics.advancedConversions || 0;
  const evidenceCount = decisionMetrics.evidenceCount || 0;
  const realCitations = decisionMetrics.realCitations || 0;
  const importedCitations = decisionMetrics.importedCitations || 0;
  const openFollowups = decisionMetrics.openFollowups || 0;
  const decisionNotes = decisionMetrics.decisionNotes || 0;
  const reviewNotes = decisionMetrics.reviewNotes || 0;
  const investorPipeline = clampScore(
    relationshipCount * 8
    + warmReplies * 12
    + state.pilotOutreachDrafts.length * 5
    + state.pilotFollowups.length * 7
    + openFollowups * 5
    + conversionCount * 8
  );
  const diligenceProof = clampScore(
    (decisionMetrics.proofRequestReadiness || 0) * 0.32
    + dataRoom.score * 0.18
    + icMemo.score * 0.14
    + Math.min(evidenceCount, 14) * 5
    + realCitations * 7
    + importedCitations * 4
  );
  const commercialCase = clampScore(
    (decisionMetrics.commercialDecision || 0) * 0.28
    + revenue.score * 0.2
    + (closeMetrics.commercialAskSignal || 0) * 0.15
    + Math.min(weightedMrr, 4000) / 35
    + Math.min(forecastMrr, 5000) / 55
    + Math.min(runRateArr, 60000) / 900
    + advancedConversions * 8
  );
  const roundRiskControl = clampScore(
    (decisionMetrics.riskGate || 0) * 0.32
    + pagesAudit.score * 0.16
    + objectionDesk.score * 0.14
    + (termsMetrics.boundaryControl || 0) * 0.12
    + (closeMetrics.riskControlSignal || 0) * 0.12
    + reviewNotes * 5
  );
  const closingMotion = clampScore(
    (decisionMetrics.followupClock || 0) * 0.25
    + (decisionMetrics.stakeholderCommitment || 0) * 0.2
    + openFollowups * 8
    + decisionNotes * 6
    + warmReplies * 8
    + state.pilotSessions.length * 4
  );
  const roundReadiness = clampScore(
    decisionRoom.score * 0.2
    + (decisionMetrics.decisionReadiness || 0) * 0.16
    + diligenceProof * 0.17
    + commercialCase * 0.17
    + roundRiskControl * 0.15
    + investorPipeline * 0.08
    + closingMotion * 0.07
  );
  const score = roundReadiness;
  const lanes = makeFundingRoundRows({
    decisionRoom,
    icMemo,
    terms,
    closePlan,
    dataRoom,
    revenue,
    objectionDesk,
    pagesAudit,
    roundReadiness,
    investorPipeline,
    diligenceProof,
    commercialCase,
    roundRiskControl,
    closingMotion,
    relationshipCount,
    warmReplies,
    weightedMrr,
    forecastMrr,
    runRateArr,
    conversionCount,
    advancedConversions,
    evidenceCount,
    realCitations,
    importedCitations,
    openFollowups,
    decisionNotes,
    reviewNotes
  });
  const nextLane = lanes.find((lane) => !lane.passed) || lanes[0];
  const statusClass = score >= 75 ? "is-good" : score >= 50 ? "is-warning" : "is-error";
  const statusLabel = score >= 75 ? "Round command ready" : score >= 50 ? "Round command forming" : "Round command gaps";
  const headline = score >= 75
    ? "The investor motion can be managed as a disciplined round command center."
    : "Turn investor decisions into a tracked capital, pilot, or strategic-partner operating plan.";
  const cards = [
    makeFundingRoundCard({
      label: "Round readiness",
      passed: roundReadiness >= 60,
      value: `${roundReadiness}%`,
      detail: `Decision room ${decisionRoom.score}%, diligence proof ${diligenceProof}%, commercial case ${commercialCase}%, and risk controls ${roundRiskControl}% define the round posture.`,
      status: roundReadiness >= 75 ? "ready" : roundReadiness >= 50 ? "forming" : "open"
    }),
    makeFundingRoundCard({
      label: "Investor pipeline",
      passed: investorPipeline >= 50,
      value: `${relationshipCount} rel.`,
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, ${state.pilotOutreachDrafts.length} outreach draft${state.pilotOutreachDrafts.length === 1 ? "" : "s"}, and ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}.`,
      status: investorPipeline >= 70 ? "active" : investorPipeline >= 45 ? "thin" : "empty"
    }),
    makeFundingRoundCard({
      label: "Diligence proof",
      passed: diligenceProof >= 60,
      value: `${evidenceCount} items`,
      detail: `${realCitations} REAL citations, ${importedCitations} imported citations, data room ${dataRoom.score}%, and IC memo ${icMemo.score}% support investor review.`,
      status: diligenceProof >= 75 ? "packet" : diligenceProof >= 50 ? "thin" : "gap"
    }),
    makeFundingRoundCard({
      label: "Commercial case",
      passed: commercialCase >= 55,
      value: `AED ${formatInteger(weightedMrr)}`,
      detail: `AED ${formatInteger(forecastMrr)} forecast MRR, AED ${formatInteger(runRateArr)} run-rate ARR, and ${advancedConversions} advanced conversion signal${advancedConversions === 1 ? "" : "s"}.`,
      status: commercialCase >= 75 ? "priced" : commercialCase >= 50 ? "framed" : "unpriced"
    }),
    makeFundingRoundCard({
      label: "Risk controls",
      passed: roundRiskControl >= 60,
      value: `${roundRiskControl}%`,
      detail: `Risk gate ${decisionMetrics.riskGate || 0}%, objection desk ${objectionDesk.score}%, deploy health ${pagesAudit.score}%, and ${reviewNotes} review note${reviewNotes === 1 ? "" : "s"}.`,
      status: roundRiskControl >= 75 ? "controlled" : roundRiskControl >= 55 ? "watch" : "blocker"
    }),
    makeFundingRoundCard({
      label: "Closing motion",
      passed: closingMotion >= 55,
      value: `${openFollowups} open`,
      detail: `${decisionNotes} decision note${decisionNotes === 1 ? "" : "s"}, ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}, and ${state.pilotSessions.length} pilot session${state.pilotSessions.length === 1 ? "" : "s"} keep the round moving.`,
      status: closingMotion >= 70 ? "dated" : closingMotion >= 50 ? "queued" : "idle"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score,
    statusClass,
    statusLabel,
    headline,
    summary: `Funding round command score is ${score}%. Pipeline ${investorPipeline}%, diligence proof ${diligenceProof}%, commercial case ${commercialCase}%, risk controls ${roundRiskControl}%, and closing motion ${closingMotion}%. Next: ${nextLane.title}.`,
    nextLane,
    cards,
    lanes,
    metrics: {
      roundReadiness,
      investorPipeline,
      diligenceProof,
      commercialCase,
      roundRiskControl,
      closingMotion,
      relationshipCount,
      warmReplies,
      weightedMrr,
      forecastMrr,
      runRateArr,
      conversionCount,
      advancedConversions,
      evidenceCount,
      realCitations,
      importedCitations,
      openFollowups,
      decisionNotes,
      reviewNotes
    },
    decisionRoom,
    icMemo,
    terms,
    closePlan,
    dataRoom,
    revenue,
    objectionDesk,
    pagesAudit
  };
}

function makeFundingRoundRows({ decisionRoom, icMemo, terms, closePlan, dataRoom, revenue, roundReadiness, investorPipeline, diligenceProof, commercialCase, roundRiskControl, closingMotion, relationshipCount, warmReplies, weightedMrr, forecastMrr, runRateArr, conversionCount, advancedConversions, evidenceCount, realCitations, importedCitations, openFollowups, decisionNotes, reviewNotes }) {
  const leadAccount = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE investor account";
  return [
    makeFundingRoundRow({
      lane: "Round thesis",
      title: "Name the exact round decision you want",
      detail: `Round readiness is ${roundReadiness}% with IC memo ${icMemo.score}% and decision room ${decisionRoom.score}%. The ask should be review, strategic pilot, source partnership, operator intro, or funding diligence.`,
      commandLine: "Command line: one decision, one audience, one next proof requirement.",
      owner: "Founder",
      signal: `${roundReadiness}% round`,
      gap: roundReadiness >= 60 ? "Use the IC memo and decision room as the round spine." : "Clarify the decision question before outreach widens.",
      status: roundReadiness >= 60 ? "defined" : "unclear",
      target: roundReadiness >= 60 ? "#investor-ic-memo" : "#investor-decision-room",
      buttonLabel: roundReadiness >= 60 ? "Open IC memo" : "Open decision room",
      passed: roundReadiness >= 60,
      priority: "High"
    }),
    makeFundingRoundRow({
      lane: "Investor list",
      title: "Rank who deserves the next founder hour",
      detail: `${leadAccount} is the lead account. Pipeline score is ${investorPipeline}% from ${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}.`,
      commandLine: "Command line: top five names, current status, next ask, and expected answer date.",
      owner: "Founder",
      signal: `${investorPipeline}% pipeline`,
      gap: investorPipeline >= 50 ? "Use momentum ledger to rank the next five relationships." : "Create outreach, intro, or follow-up records before calling this a pipeline.",
      status: investorPipeline >= 50 ? "rankable" : "thin",
      target: investorPipeline >= 50 ? "#investor-momentum-ledger" : "#investor-intro-room",
      buttonLabel: investorPipeline >= 50 ? "Open momentum" : "Open intro room",
      passed: investorPipeline >= 50,
      priority: "High"
    }),
    makeFundingRoundRow({
      lane: "Diligence packet",
      title: "Make the proof room investor-ready",
      detail: `Diligence proof is ${diligenceProof}%. Evidence has ${evidenceCount} item${evidenceCount === 1 ? "" : "s"}, ${realCitations} REAL citation${realCitations === 1 ? "" : "s"}, and ${importedCitations} imported citation${importedCitations === 1 ? "" : "s"}.`,
      commandLine: "Command line: official source, answer artifact, pilot proof, and known proof gap.",
      owner: "Operator",
      signal: `${diligenceProof}% proof`,
      gap: diligenceProof >= 60 ? "Use the data room and proof packet in investor replies." : "Add official source proof or verified pilot evidence.",
      status: diligenceProof >= 60 ? "packet" : "gap",
      target: diligenceProof >= 60 ? "#investor-data-room" : "#pilot-evidence-ledger",
      buttonLabel: diligenceProof >= 60 ? "Open data room" : "Open evidence",
      passed: diligenceProof >= 60,
      priority: "High"
    }),
    makeFundingRoundRow({
      lane: "Commercial ask",
      title: "Tie the round story to revenue proof",
      detail: `Commercial case is ${commercialCase}% with AED ${formatInteger(weightedMrr)} weighted MRR, AED ${formatInteger(forecastMrr)} forecast MRR, AED ${formatInteger(runRateArr)} run-rate ARR, and ${advancedConversions} advanced conversion signal${advancedConversions === 1 ? "" : "s"}.`,
      commandLine: "Command line: say what funding or strategic help unlocks, using current revenue signal as context only.",
      owner: "Founder",
      signal: `${commercialCase}% commercial`,
      gap: commercialCase >= 55 ? "Use revenue forecast and close plan to frame the ask." : "Capture more paid-pilot or conversion evidence before pricing the story.",
      status: commercialCase >= 55 ? "framed" : "unpriced",
      target: commercialCase >= 55 ? "#founder-revenue-forecast" : "#pilot-conversion-pipeline",
      buttonLabel: commercialCase >= 55 ? "Open forecast" : "Open conversion",
      passed: commercialCase >= 55,
      priority: "High"
    }),
    makeFundingRoundRow({
      lane: "Risk terms",
      title: "State what would make the round wait",
      detail: `Risk controls are ${roundRiskControl}%, terms readiness is ${terms.score}%, close-plan score is ${closePlan.score}%, and the review trail has ${reviewNotes} note${reviewNotes === 1 ? "" : "s"}.`,
      commandLine: "Command line: source rights, regulatory boundary, sales cycle, data freshness, and evidence gaps stay visible.",
      owner: "Operator",
      signal: `${roundRiskControl}% control`,
      gap: roundRiskControl >= 60 ? "Use objection desk language in round follow-ups." : "Open compliance and objection desk before widening investor sharing.",
      status: roundRiskControl >= 60 ? "controlled" : "blocker",
      target: roundRiskControl >= 60 ? "#investor-objection-desk" : "#compliance-audit",
      buttonLabel: roundRiskControl >= 60 ? "Open objection desk" : "Open compliance",
      passed: roundRiskControl >= 60,
      priority: "Medium"
    }),
    makeFundingRoundRow({
      lane: "Next close date",
      title: "Keep the round from becoming vague interest",
      detail: `Closing motion is ${closingMotion}% with ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}, ${decisionNotes} decision note${decisionNotes === 1 ? "" : "s"}, ${state.pilotSessions.length} session${state.pilotSessions.length === 1 ? "" : "s"}, and ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}.`,
      commandLine: "Command line: every investor has next date, next owner, next artifact, and fallback path.",
      owner: "Founder",
      signal: `${closingMotion}% motion`,
      gap: closingMotion >= 55 ? "Use terms follow-up to keep dates and owners visible." : "Create one dated follow-up before broadening the list.",
      status: closingMotion >= 55 ? "dated" : "undated",
      target: "#investor-terms-followup",
      buttonLabel: "Open terms",
      passed: closingMotion >= 55,
      priority: "Medium"
    })
  ];
}

function makeFundingRoundCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["forming", "thin", "framed", "watch", "queued"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeFundingRoundRow({ lane, title, detail, commandLine, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    commandLine,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openFundingRoundNext() {
  const command = makeFundingRoundCommandCenter();
  document.querySelector(command.nextLane.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFundingRoundResult(`Opened: ${command.nextLane.title}.`, "neutral");
}

function openFundingRoundDecision() {
  document.querySelector("#investor-decision-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashFundingRoundResult("Investor Decision Room opened.", "neutral");
}

async function copyFundingRoundCommand() {
  const copied = await copyTextToClipboard(makeFundingRoundMarkdown(makeFundingRoundCommandCenter()));
  flashFundingRoundResult(copied ? "Funding round command copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportFundingRoundCommand() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-funding-round-command-${date}.json`, JSON.stringify(makeFundingRoundCommandCenter(), null, 2), "application/json;charset=utf-8");
  flashFundingRoundResult("Funding round command JSON exported.", "success");
}

function makeFundingRoundMarkdown(command) {
  return [
    "# MajlisAlpha Funding Round Command Center",
    "",
    `Version: ${command.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Round command score: ${command.score}% (${command.statusLabel})`,
    `Investor pipeline: ${command.metrics.investorPipeline}%`,
    `Diligence proof: ${command.metrics.diligenceProof}%`,
    `Commercial case: ${command.metrics.commercialCase}%`,
    `Risk controls: ${command.metrics.roundRiskControl}%`,
    `Closing motion: ${command.metrics.closingMotion}%`,
    "",
    command.summary,
    "",
    "## Round Cards",
    ...command.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Command Lanes",
    ...command.lanes.map((lane) => `### ${lane.lane}: ${lane.title}\n${lane.detail}\n${lane.commandLine}\nGap: ${lane.gap}\nStatus: ${lane.status}`),
    "",
    "## Next Round Gap",
    `${command.nextLane.title}: ${command.nextLane.gap}`,
    "",
    "_Funding Round Command Center is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashFundingRoundResult(message, tone = "neutral") {
  if (!els.fundingRoundResult) return;
  els.fundingRoundResult.className = `builder-result is-${tone}`;
  els.fundingRoundResult.textContent = message;
}

function renderBoardPackWarRoom() {
  if (!els.boardPackWarSummary || !els.boardPackWarGrid || !els.boardPackWarRows) return;
  const room = makeBoardPackWarRoom();
  window.MajlisAlphaBoardPackWarRoom = room;
  if (els.openBoardPackWarNext) {
    els.openBoardPackWarNext.textContent = room.nextMove.buttonLabel;
  }
  els.boardPackWarSummary.innerHTML = `
    <div class="board-pack-war-hero ${escapeAttr(room.statusClass)}">
      <div>
        <span>${escapeHtml(room.statusLabel)}</span>
        <strong>${escapeHtml(room.headline)}</strong>
        <p>${escapeHtml(room.summary)}</p>
      </div>
      <div class="board-pack-war-score">
        <span>Pack score</span>
        <strong>${escapeHtml(room.score)}%</strong>
      </div>
    </div>
  `;
  els.boardPackWarGrid.innerHTML = room.cards.map((card) => `
    <article class="board-pack-war-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.boardPackWarRows.innerHTML = room.moves.map((move) => `
    <article class="board-pack-war-row ${escapeAttr(move.className)}">
      <div>
        <span>${escapeHtml(move.lane)}</span>
        <strong>${escapeHtml(move.title)}</strong>
        <p>${escapeHtml(move.detail)}</p>
        <em>${escapeHtml(move.boardLine)}</em>
      </div>
      <div class="board-pack-war-row-meta">
        <span>${escapeHtml(move.owner)}</span>
        <strong>${escapeHtml(move.signal)}</strong>
        <p>${escapeHtml(move.gap)}</p>
        <em>${escapeHtml(move.status)}</em>
      </div>
    </article>
  `).join("");
}

function makeBoardPackWarRoom() {
  const round = makeFundingRoundCommandCenter();
  const founderBoard = makeFounderBoardPackCenter();
  const diligence = makeFounderDiligenceRoom();
  const icMemo = round.icMemo || makeInvestorIcMemoRoom();
  const dataRoom = round.dataRoom || makeInvestorDataRoom();
  const revenue = round.revenue || founderBoard.revenue || makeFounderRevenueForecastCenter();
  const pagesAudit = round.pagesAudit || makePagesDeploymentAudit();
  const smokeAudit = makeLiveSmokeTestAudit();
  const roundMetrics = round.metrics || {};
  const boardMetrics = founderBoard.metrics || {};
  const diligenceMetrics = diligence.metrics || {};
  const deploymentScore = Math.min(pagesAudit.score, smokeAudit.score);
  const evidenceCount = roundMetrics.evidenceCount || boardMetrics.evidenceCount || diligenceMetrics.evidenceCount || state.pilotEvidenceLedger.length;
  const verifiedEvidence = boardMetrics.verifiedEvidence || diligenceMetrics.verifiedEvidence || state.pilotEvidenceLedger.filter((entry) => entry.status === "verified").length;
  const realCitations = roundMetrics.realCitations || 0;
  const importedCitations = roundMetrics.importedCitations || 0;
  const weightedMrr = roundMetrics.weightedMrr || revenue.metrics?.weightedMrr || boardMetrics.weightedMrr || 0;
  const forecastMrr = roundMetrics.forecastMrr || revenue.metrics?.forecastMrr || boardMetrics.forecastMrr || 0;
  const runRateArr = roundMetrics.runRateArr || revenue.metrics?.runRateArr || boardMetrics.runRateArr || 0;
  const relationshipCount = roundMetrics.relationshipCount || 0;
  const warmReplies = roundMetrics.warmReplies || 0;
  const openFollowups = roundMetrics.openFollowups || state.pilotFollowups.length;
  const conversionCount = roundMetrics.conversionCount || state.pilotConversions.length;
  const advancedConversions = roundMetrics.advancedConversions || 0;
  const paidIntentSessions = state.pilotSessions.filter((session) => ["aed-199", "aed-399", "team"].includes(session.paidIntent)).length;
  const reviewNotes = roundMetrics.reviewNotes || state.memoReviews.length;
  const decisionNotes = roundMetrics.decisionNotes || state.decisionJournal.length;
  const executiveNarrative = clampScore(
    round.score * 0.24
    + founderBoard.score * 0.2
    + (roundMetrics.roundReadiness || 0) * 0.18
    + icMemo.score * 0.14
    + decisionNotes * 6
    + reviewNotes * 5
  );
  const evidenceAppendix = clampScore(
    (roundMetrics.diligenceProof || 0) * 0.28
    + diligence.score * 0.18
    + dataRoom.score * 0.14
    + Math.min(evidenceCount, 14) * 5
    + realCitations * 7
    + importedCitations * 4
    + verifiedEvidence * 5
  );
  const financeBridge = clampScore(
    (roundMetrics.commercialCase || 0) * 0.28
    + revenue.score * 0.22
    + Math.min(forecastMrr, 5000) / 55
    + Math.min(weightedMrr, 4000) / 40
    + Math.min(runRateArr, 60000) / 900
    + conversionCount * 7
    + advancedConversions * 8
    + paidIntentSessions * 7
  );
  const decisionAgenda = clampScore(
    (roundMetrics.closingMotion || 0) * 0.24
    + (roundMetrics.investorPipeline || 0) * 0.18
    + round.score * 0.16
    + openFollowups * 8
    + decisionNotes * 6
    + relationshipCount * 5
    + warmReplies * 7
  );
  const controlReadiness = clampScore(
    (roundMetrics.roundRiskControl || 0) * 0.28
    + (diligenceMetrics.governanceScore || 0) * 0.18
    + deploymentScore * 0.18
    + pagesAudit.score * 0.12
    + reviewNotes * 6
    + decisionNotes * 4
  );
  const packReadiness = clampScore(
    executiveNarrative * 0.2
    + evidenceAppendix * 0.18
    + financeBridge * 0.17
    + decisionAgenda * 0.17
    + controlReadiness * 0.16
    + round.score * 0.12
  );
  const moves = makeBoardPackWarMoves({
    round,
    founderBoard,
    diligence,
    icMemo,
    dataRoom,
    revenue,
    pagesAudit,
    smokeAudit,
    executiveNarrative,
    evidenceAppendix,
    financeBridge,
    decisionAgenda,
    controlReadiness,
    packReadiness,
    evidenceCount,
    verifiedEvidence,
    realCitations,
    importedCitations,
    weightedMrr,
    forecastMrr,
    runRateArr,
    relationshipCount,
    warmReplies,
    openFollowups,
    conversionCount,
    paidIntentSessions,
    reviewNotes,
    decisionNotes
  });
  const nextMove = moves.find((move) => !move.passed) || moves[0];
  const statusClass = packReadiness >= 75 ? "is-good" : packReadiness >= 50 ? "is-warning" : "is-error";
  const statusLabel = packReadiness >= 75 ? "Board pack ready" : packReadiness >= 50 ? "Board pack forming" : "Board pack gaps";
  const headline = packReadiness >= 75
    ? "The board pack can walk from thesis to proof to decision cleanly."
    : "Turn the round story into a board-ready pack before widening serious asks.";
  const cards = [
    makeBoardPackWarCard({
      label: "Pack readiness",
      passed: packReadiness >= 60,
      value: `${packReadiness}%`,
      detail: `Narrative ${executiveNarrative}%, evidence ${evidenceAppendix}%, finance ${financeBridge}%, decision agenda ${decisionAgenda}%, and controls ${controlReadiness}%.`,
      status: packReadiness >= 75 ? "ready" : packReadiness >= 50 ? "forming" : "open"
    }),
    makeBoardPackWarCard({
      label: "Executive narrative",
      passed: executiveNarrative >= 60,
      value: `${executiveNarrative}%`,
      detail: `Round command ${round.score}%, founder board pack ${founderBoard.score}%, IC memo ${icMemo.score}%, ${decisionNotes} decision note${decisionNotes === 1 ? "" : "s"}, and ${reviewNotes} review note${reviewNotes === 1 ? "" : "s"}.`,
      status: executiveNarrative >= 75 ? "board clear" : executiveNarrative >= 50 ? "draft" : "unclear"
    }),
    makeBoardPackWarCard({
      label: "Evidence appendix",
      passed: evidenceAppendix >= 60,
      value: `${evidenceCount} items`,
      detail: `${verifiedEvidence} verified evidence item${verifiedEvidence === 1 ? "" : "s"}, ${realCitations} REAL citation${realCitations === 1 ? "" : "s"}, and data room ${dataRoom.score}%.`,
      status: evidenceAppendix >= 75 ? "appendix" : evidenceAppendix >= 50 ? "thin" : "gap"
    }),
    makeBoardPackWarCard({
      label: "Finance bridge",
      passed: financeBridge >= 55,
      value: `AED ${formatInteger(forecastMrr)}`,
      detail: `AED ${formatInteger(weightedMrr)} weighted MRR, AED ${formatInteger(runRateArr)} run-rate ARR, ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, and ${paidIntentSessions} paid-intent session${paidIntentSessions === 1 ? "" : "s"}.`,
      status: financeBridge >= 75 ? "bridged" : financeBridge >= 50 ? "framed" : "unpriced"
    }),
    makeBoardPackWarCard({
      label: "Decision agenda",
      passed: decisionAgenda >= 55,
      value: `${openFollowups} open`,
      detail: `${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"} keep board discussion action-oriented.`,
      status: decisionAgenda >= 70 ? "dated" : decisionAgenda >= 50 ? "queued" : "vague"
    }),
    makeBoardPackWarCard({
      label: "Control readiness",
      passed: controlReadiness >= 60,
      value: `${controlReadiness}%`,
      detail: `Risk control ${roundMetrics.roundRiskControl || 0}%, governance ${diligenceMetrics.governanceScore || 0}%, Pages Doctor ${pagesAudit.score}%, and Smoke Test ${smokeAudit.score}%.`,
      status: controlReadiness >= 75 ? "controlled" : controlReadiness >= 55 ? "watch" : "blocker"
    })
  ];
  return {
    product: "MajlisAlpha",
    version: DATA_VERSION,
    generatedAt: new Date().toISOString(),
    score: packReadiness,
    statusClass,
    statusLabel,
    headline,
    summary: `Board pack war-room score is ${packReadiness}%. Narrative ${executiveNarrative}%, evidence appendix ${evidenceAppendix}%, finance bridge ${financeBridge}%, decision agenda ${decisionAgenda}%, and controls ${controlReadiness}%. Next: ${nextMove.title}.`,
    nextMove,
    cards,
    moves,
    metrics: {
      packReadiness,
      executiveNarrative,
      evidenceAppendix,
      financeBridge,
      decisionAgenda,
      controlReadiness,
      evidenceCount,
      verifiedEvidence,
      realCitations,
      importedCitations,
      weightedMrr,
      forecastMrr,
      runRateArr,
      relationshipCount,
      warmReplies,
      openFollowups,
      conversionCount,
      paidIntentSessions,
      reviewNotes,
      decisionNotes,
      deploymentScore
    },
    round,
    founderBoard,
    diligence,
    icMemo,
    dataRoom,
    revenue,
    pagesAudit,
    smokeAudit
  };
}

function makeBoardPackWarMoves({ round, founderBoard, diligence, dataRoom, revenue, pagesAudit, smokeAudit, executiveNarrative, evidenceAppendix, financeBridge, decisionAgenda, controlReadiness, packReadiness, evidenceCount, verifiedEvidence, realCitations, importedCitations, weightedMrr, forecastMrr, runRateArr, relationshipCount, warmReplies, openFollowups, conversionCount, paidIntentSessions, reviewNotes, decisionNotes }) {
  const leadAccount = state.pilotConversions[0]?.account || state.pilotFollowups[0]?.account || state.pilotOutreachDrafts[0]?.account || "Next UAE board account";
  return [
    makeBoardPackWarMove({
      lane: "Board thesis",
      title: "Name the decision before writing slides",
      detail: `Pack readiness is ${packReadiness}% and round command is ${round.score}%. The pack should ask for one board decision: paid pilot, strategic partner, operator intro, source access, or funding diligence.`,
      boardLine: "Board line: one decision, one sponsor, one next artifact.",
      owner: "Founder",
      signal: `${packReadiness}% pack`,
      gap: packReadiness >= 60 ? "Use the round command as the pack spine." : "Clarify the decision question before building the pack.",
      status: packReadiness >= 60 ? "defined" : "unclear",
      target: packReadiness >= 60 ? "#funding-round-command" : "#investor-decision-room",
      buttonLabel: packReadiness >= 60 ? "Open round command" : "Open decision room",
      passed: packReadiness >= 60,
      priority: "High"
    }),
    makeBoardPackWarMove({
      lane: "Executive narrative",
      title: "Write the five-minute board story",
      detail: `Narrative score is ${executiveNarrative}%. Founder board pack ${founderBoard.score}%, diligence room ${diligence.score}%, ${reviewNotes} review note${reviewNotes === 1 ? "" : "s"}, and ${decisionNotes} decision note${decisionNotes === 1 ? "" : "s"} support the storyline.`,
      boardLine: "Board line: problem, wedge, proof, commercial motion, control, and ask.",
      owner: "Founder",
      signal: `${executiveNarrative}% narrative`,
      gap: executiveNarrative >= 60 ? "Use Founder Board Pack Center to draft the update." : "Add review or decision notes before presenting the story.",
      status: executiveNarrative >= 60 ? "draftable" : "thin",
      target: executiveNarrative >= 60 ? "#founder-board-pack" : "#memo-review-room",
      buttonLabel: executiveNarrative >= 60 ? "Open board pack" : "Open review room",
      passed: executiveNarrative >= 60,
      priority: "High"
    }),
    makeBoardPackWarMove({
      lane: "Evidence appendix",
      title: "Attach the proof that answers hard questions",
      detail: `Evidence appendix is ${evidenceAppendix}%. It has ${evidenceCount} evidence item${evidenceCount === 1 ? "" : "s"}, ${verifiedEvidence} verified, ${realCitations} REAL citation${realCitations === 1 ? "" : "s"}, and ${importedCitations} imported citation${importedCitations === 1 ? "" : "s"}.`,
      boardLine: "Board line: every claim has source, artifact, owner, and unresolved proof gap.",
      owner: "Operator",
      signal: `${evidenceAppendix}% proof`,
      gap: evidenceAppendix >= 60 ? "Use investor data room as the appendix source." : "Add verified evidence or official-source proof before sharing.",
      status: evidenceAppendix >= 60 ? "appendix" : "gap",
      target: evidenceAppendix >= 60 ? "#investor-data-room" : "#pilot-evidence-ledger",
      buttonLabel: evidenceAppendix >= 60 ? "Open data room" : "Open evidence",
      passed: evidenceAppendix >= 60,
      priority: "High"
    }),
    makeBoardPackWarMove({
      lane: "Finance bridge",
      title: "Connect the ask to revenue signal",
      detail: `Finance bridge is ${financeBridge}% with AED ${formatInteger(forecastMrr)} forecast MRR, AED ${formatInteger(weightedMrr)} weighted MRR, AED ${formatInteger(runRateArr)} run-rate ARR, ${conversionCount} conversion record${conversionCount === 1 ? "" : "s"}, and ${paidIntentSessions} paid-intent session${paidIntentSessions === 1 ? "" : "s"}.`,
      boardLine: "Board line: show what capital, intro, or source access unlocks next, using current revenue proof carefully.",
      owner: "Founder",
      signal: `${financeBridge}% finance`,
      gap: financeBridge >= 55 ? "Use Founder Revenue Forecast Center for the finance slide." : "Capture more conversion evidence before leaning on revenue.",
      status: financeBridge >= 55 ? "bridged" : "unpriced",
      target: financeBridge >= 55 ? "#founder-revenue-forecast" : "#pilot-conversion-pipeline",
      buttonLabel: financeBridge >= 55 ? "Open forecast" : "Open conversion",
      passed: financeBridge >= 55,
      priority: "High"
    }),
    makeBoardPackWarMove({
      lane: "Risk register",
      title: "Surface the reasons to wait",
      detail: `Control readiness is ${controlReadiness}%. Pages Doctor is ${pagesAudit.score}%, Smoke Test is ${smokeAudit.score}%, data room is ${dataRoom.score}%, and revenue forecast is ${revenue.score}%.`,
      boardLine: "Board line: source rights, regulatory boundary, evidence freshness, sales-cycle risk, and demo limits stay visible.",
      owner: "Operator",
      signal: `${controlReadiness}% control`,
      gap: controlReadiness >= 60 ? "Use objection desk language in the risk slide." : "Open compliance and objection desk before circulating.",
      status: controlReadiness >= 60 ? "controlled" : "blocker",
      target: controlReadiness >= 60 ? "#investor-objection-desk" : "#compliance-audit",
      buttonLabel: controlReadiness >= 60 ? "Open objection desk" : "Open compliance",
      passed: controlReadiness >= 60,
      priority: "Medium"
    }),
    makeBoardPackWarMove({
      lane: "Decision agenda",
      title: "End with an owner and a date",
      detail: `${leadAccount} is the lead board-account context. Agenda score is ${decisionAgenda}% from ${relationshipCount} relationship${relationshipCount === 1 ? "" : "s"}, ${warmReplies} warm repl${warmReplies === 1 ? "y" : "ies"}, and ${openFollowups} open follow-up${openFollowups === 1 ? "" : "s"}.`,
      boardLine: "Board line: decision owner, next date, next artifact, and fallback path.",
      owner: "Founder",
      signal: `${decisionAgenda}% agenda`,
      gap: decisionAgenda >= 55 ? "Use terms follow-up to lock the next board action." : "Create one dated follow-up before asking for a board slot.",
      status: decisionAgenda >= 55 ? "dated" : "undated",
      target: "#investor-terms-followup",
      buttonLabel: "Open terms",
      passed: decisionAgenda >= 55,
      priority: "Medium"
    })
  ];
}

function makeBoardPackWarCard({ label, passed, value, detail, status }) {
  const warningStatuses = new Set(["forming", "draft", "thin", "framed", "queued", "watch"]);
  return {
    label,
    passed: Boolean(passed),
    value,
    detail,
    status,
    className: passed ? "is-good" : warningStatuses.has(status) ? "is-warning" : "is-error"
  };
}

function makeBoardPackWarMove({ lane, title, detail, boardLine, owner, signal, gap, status, target, buttonLabel, passed, priority }) {
  return {
    lane,
    title,
    detail,
    boardLine,
    owner,
    signal,
    gap,
    status,
    target,
    buttonLabel,
    passed: Boolean(passed),
    priority,
    className: passed ? "is-good" : priority === "High" ? "is-error" : "is-warning"
  };
}

function openBoardPackWarNext() {
  const room = makeBoardPackWarRoom();
  document.querySelector(room.nextMove.target)?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashBoardPackWarResult(`Opened: ${room.nextMove.title}.`, "neutral");
}

function openBoardPackWarRound() {
  document.querySelector("#funding-round-command")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashBoardPackWarResult("Funding Round Command Center opened.", "neutral");
}

async function copyBoardPackWarRoom() {
  const copied = await copyTextToClipboard(makeBoardPackWarMarkdown(makeBoardPackWarRoom()));
  flashBoardPackWarResult(copied ? "Board pack war-room memo copied." : "Clipboard blocked. Use export instead.", copied ? "success" : "error");
}

function exportBoardPackWarRoom() {
  const date = makeLocalDateOffset(0);
  downloadTextFile(`majlisalpha-board-pack-war-room-${date}.json`, JSON.stringify(makeBoardPackWarRoom(), null, 2), "application/json;charset=utf-8");
  flashBoardPackWarResult("Board pack war-room JSON exported.", "success");
}

function makeBoardPackWarMarkdown(room) {
  return [
    "# MajlisAlpha Board Pack War Room",
    "",
    `Version: ${room.version}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Board pack score: ${room.score}% (${room.statusLabel})`,
    `Executive narrative: ${room.metrics.executiveNarrative}%`,
    `Evidence appendix: ${room.metrics.evidenceAppendix}%`,
    `Finance bridge: ${room.metrics.financeBridge}%`,
    `Decision agenda: ${room.metrics.decisionAgenda}%`,
    `Control readiness: ${room.metrics.controlReadiness}%`,
    "",
    room.summary,
    "",
    "## Board Cards",
    ...room.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## War-Room Moves",
    ...room.moves.map((move) => `### ${move.lane}: ${move.title}\n${move.detail}\n${move.boardLine}\nGap: ${move.gap}\nStatus: ${move.status}`),
    "",
    "## Next Board Gap",
    `${room.nextMove.title}: ${room.nextMove.gap}`,
    "",
    "_Board Pack War Room is founder operating workflow. It is not securities solicitation or investment advice._"
  ].join("\n");
}

function flashBoardPackWarResult(message, tone = "neutral") {
  if (!els.boardPackWarResult) return;
  els.boardPackWarResult.className = `builder-result is-${tone}`;
  els.boardPackWarResult.textContent = message;
}

function formatInteger(value) {
  return Math.round(Number(value) || 0).toLocaleString("en-US");
}

function flashPilotConversionResult(message, tone = "neutral") {
  if (!els.pilotConversionResult) return;
  els.pilotConversionResult.className = `builder-result is-${tone}`;
  els.pilotConversionResult.textContent = message;
}

function renderPagesDeploymentDoctor() {
  if (!els.pagesDoctorSummary || !els.pagesDoctorGrid || !els.pagesDoctorChecklist) return;
  const audit = makePagesDeploymentAudit();
  window.MajlisAlphaPagesDoctor = audit;
  if (els.pagesDoctorStatus) {
    els.pagesDoctorStatus.textContent = `${audit.statusLabel} - ${audit.score}%`;
  }
  els.pagesDoctorSummary.innerHTML = `
    <div class="pages-doctor-hero ${escapeAttr(audit.statusClass)}">
      <span>${escapeHtml(audit.statusLabel)}</span>
      <strong>${escapeHtml(audit.headline)}</strong>
      <p>${escapeHtml(audit.summary)}</p>
    </div>
    <div class="pages-doctor-score">
      <span>Deploy health</span>
      <strong>${escapeHtml(audit.score)}%</strong>
    </div>
  `;
  els.pagesDoctorGrid.innerHTML = audit.cards.map((card) => `
    <article class="pages-doctor-card ${escapeAttr(card.className)}">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <p>${escapeHtml(card.detail)}</p>
      <em>${escapeHtml(card.status)}</em>
    </article>
  `).join("");
  els.pagesDoctorChecklist.innerHTML = audit.checklist.map((item) => `<li>${escapeHtml(item)}</li>`).join("");
  renderSessionSnapshotBoard();
  renderReleaseHandoffCenter();
  renderLiveSmokeTestCenter();
  renderPilotDemoScriptCenter();
  renderPilotLearningLoopCenter();
  renderFounderWeeklyReviewCenter();
  renderPilotOnboardingRoom();
  renderPilotSuccessPlanCenter();
  renderPilotValueProofCenter();
  renderPilotProofPacketBuilder();
  renderPilotCloseRoom();
  renderPaidPilotDeliveryBoard();
  renderRenewalExpansionBoard();
  renderAccountHealthCommandCenter();
  renderFounderRevenueForecastCenter();
  renderFounderBoardPackCenter();
  renderFounderDiligenceRoom();
  renderInvestorDataRoom();
  renderInvestorIntroRoom();
  renderInvestorReplyPipeline();
  renderInvestorMeetingPrepRoom();
  renderInvestorFollowThroughBoard();
  renderInvestorMomentumLedger();
  renderInvestorUpdateComposer();
  renderInvestorObjectionDesk();
  renderInvestorCommitmentTracker();
  renderInvestorClosePlanRoom();
  renderInvestorTermsFollowupRoom();
  renderInvestorIcMemoRoom();
  renderInvestorDecisionRoom();
  renderFundingRoundCommandCenter();
  renderBoardPackWarRoom();
}

function makePagesDeploymentAudit() {
  const host = window.location.hostname.toLowerCase();
  const path = window.location.pathname;
  const isLocal = host === "127.0.0.1" || host === "localhost" || window.location.protocol === "file:";
  const isLivePages = host === "dhirajnyse.github.io";
  const pathOk = isLocal || path.startsWith(EXPECTED_PAGES_PATH);
  const fallbackStyle = document.querySelector("#full-styles-fallback");
  const fallbackText = fallbackStyle ? fallbackStyle.textContent || "" : "";
  const styleOk = fallbackText.includes(".terminal-layout")
    && fallbackText.includes(".pages-doctor-grid")
    && fallbackText.includes(".pilot-session-summary")
    && fallbackText.includes(".pilot-followup-summary")
    && fallbackText.includes(".pilot-outreach-summary")
    && fallbackText.includes(".pilot-conversion-summary")
    && fallbackText.includes(".session-snapshot-grid")
    && fallbackText.includes(".release-handoff-grid")
    && fallbackText.includes(".smoke-test-grid")
    && fallbackText.includes(".demo-script-grid")
    && fallbackText.includes(".learning-loop-grid")
    && fallbackText.includes(".founder-review-grid")
    && fallbackText.includes(".pilot-onboarding-grid")
    && fallbackText.includes(".pilot-success-grid")
    && fallbackText.includes(".pilot-value-grid")
    && fallbackText.includes(".pilot-evidence-grid")
    && fallbackText.includes(".pilot-proof-grid")
    && fallbackText.includes(".pilot-close-grid")
    && fallbackText.includes(".paid-delivery-grid")
    && fallbackText.includes(".renewal-expansion-grid")
    && fallbackText.includes(".account-health-grid")
    && fallbackText.includes(".founder-revenue-grid")
    && fallbackText.includes(".founder-board-grid")
    && fallbackText.includes(".founder-diligence-grid")
    && fallbackText.includes(".investor-data-grid")
    && fallbackText.includes(".investor-intro-grid")
    && fallbackText.includes(".investor-reply-grid")
    && fallbackText.includes(".investor-meeting-grid")
    && fallbackText.includes(".investor-follow-grid")
    && fallbackText.includes(".investor-momentum-grid")
    && fallbackText.includes(".investor-update-grid")
    && fallbackText.includes(".investor-objection-grid")
    && fallbackText.includes(".investor-commitment-grid")
    && fallbackText.includes(".investor-close-grid")
    && fallbackText.includes(".investor-terms-grid")
    && fallbackText.includes(".investor-ic-grid")
    && fallbackText.includes(".investor-decision-grid")
    && fallbackText.includes(".funding-round-grid")
    && fallbackText.includes(".board-pack-war-grid")
    && fallbackText.includes(".scroll-top-button");
  const dataOk = SAMPLE_COMPANIES.length > 0 && SAMPLE_DOCS.length > 0 && QUESTION_TEMPLATES.length > 0 && WATCHLIST_CONFIG.watchlists.length > 0;
  const storageOk = canUseBrowserStorage();
  const runtimeOk = typeof normalizeDecisionEntry === "function"
    && typeof renderDecisionJournal === "function"
    && typeof renderPilotSessionCommandCenter === "function"
    && typeof renderPilotFollowupBoard === "function"
    && typeof renderPilotOutreachComposer === "function"
    && typeof renderPilotConversionPipeline === "function"
    && typeof renderSessionSnapshotBoard === "function"
    && typeof renderReleaseHandoffCenter === "function"
    && typeof renderLiveSmokeTestCenter === "function"
    && typeof renderPilotDemoScriptCenter === "function"
    && typeof renderPilotLearningLoopCenter === "function"
    && typeof renderFounderWeeklyReviewCenter === "function"
    && typeof renderPilotOnboardingRoom === "function"
    && typeof renderPilotSuccessPlanCenter === "function"
    && typeof renderPilotValueProofCenter === "function"
    && typeof renderPilotEvidenceLedger === "function"
    && typeof renderPilotProofPacketBuilder === "function"
    && typeof renderPilotCloseRoom === "function"
    && typeof renderPaidPilotDeliveryBoard === "function"
    && typeof renderRenewalExpansionBoard === "function"
    && typeof renderAccountHealthCommandCenter === "function"
    && typeof renderFounderRevenueForecastCenter === "function"
    && typeof renderFounderBoardPackCenter === "function"
    && typeof renderFounderDiligenceRoom === "function"
    && typeof renderInvestorDataRoom === "function"
    && typeof renderInvestorIntroRoom === "function"
    && typeof renderInvestorReplyPipeline === "function"
    && typeof renderInvestorMeetingPrepRoom === "function"
    && typeof renderInvestorFollowThroughBoard === "function"
    && typeof renderInvestorMomentumLedger === "function"
    && typeof renderInvestorUpdateComposer === "function"
    && typeof renderInvestorObjectionDesk === "function"
    && typeof renderInvestorCommitmentTracker === "function"
    && typeof renderInvestorClosePlanRoom === "function"
    && typeof renderInvestorTermsFollowupRoom === "function"
    && typeof renderInvestorIcMemoRoom === "function"
    && typeof renderInvestorDecisionRoom === "function"
    && typeof renderFundingRoundCommandCenter === "function"
    && typeof renderBoardPackWarRoom === "function"
    && Boolean(document.querySelector("#decision-journal"))
    && Boolean(document.querySelector("#pilot-session-command"))
    && Boolean(document.querySelector("#pilot-followup-board"))
    && Boolean(document.querySelector("#pilot-outreach-composer"))
    && Boolean(document.querySelector("#pilot-conversion-pipeline"))
    && Boolean(document.querySelector("#session-snapshot-board"))
    && Boolean(document.querySelector("#release-handoff-center"))
    && Boolean(document.querySelector("#live-smoke-test"))
    && Boolean(document.querySelector("#pilot-demo-script"))
    && Boolean(document.querySelector("#pilot-learning-loop"))
    && Boolean(document.querySelector("#founder-weekly-review"))
    && Boolean(document.querySelector("#pilot-onboarding-room"))
    && Boolean(document.querySelector("#pilot-success-plan"))
    && Boolean(document.querySelector("#pilot-value-proof"))
    && Boolean(document.querySelector("#pilot-evidence-ledger"))
    && Boolean(document.querySelector("#pilot-proof-packet"))
    && Boolean(document.querySelector("#pilot-close-room"))
    && Boolean(document.querySelector("#paid-pilot-delivery"))
    && Boolean(document.querySelector("#renewal-expansion-board"))
    && Boolean(document.querySelector("#account-health-command"))
    && Boolean(document.querySelector("#founder-revenue-forecast"))
    && Boolean(document.querySelector("#founder-board-pack"))
    && Boolean(document.querySelector("#founder-diligence-room"))
    && Boolean(document.querySelector("#investor-data-room"))
    && Boolean(document.querySelector("#investor-intro-room"))
    && Boolean(document.querySelector("#investor-reply-pipeline"))
    && Boolean(document.querySelector("#investor-meeting-prep"))
    && Boolean(document.querySelector("#investor-follow-through"))
    && Boolean(document.querySelector("#investor-momentum-ledger"))
    && Boolean(document.querySelector("#investor-update-composer"))
    && Boolean(document.querySelector("#investor-objection-desk"))
    && Boolean(document.querySelector("#investor-commitment-tracker"))
    && Boolean(document.querySelector("#investor-close-plan"))
    && Boolean(document.querySelector("#investor-terms-followup"))
    && Boolean(document.querySelector("#investor-ic-memo"))
    && Boolean(document.querySelector("#investor-decision-room"))
    && Boolean(document.querySelector("#funding-round-command"))
    && Boolean(document.querySelector("#board-pack-war-room"))
    && Boolean(document.querySelector("#scrollTopButton"));
  const liveUrlOk = isLocal || (isLivePages && pathOk);
  const checks = [
    { ok: DATA_VERSION === "20260510-uae-61" },
    { ok: dataOk },
    { ok: styleOk },
    { ok: runtimeOk },
    { ok: liveUrlOk },
    { ok: storageOk }
  ];
  const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);
  const statusClass = score >= 90 ? "is-good" : score >= 70 ? "is-warning" : "is-error";
  const statusLabel = score >= 90 ? "Ready" : score >= 70 ? "Review" : "Blocked";
  const headline = score >= 90
    ? "GitHub Pages deployment checks are green."
    : "Deployment needs one more check before pilot use.";
  const summary = [
    `Running ${DATA_VERSION} on ${isLocal ? "local preview" : host || "browser"}.`,
    dataOk ? `${SAMPLE_COMPANIES.length} companies, ${SAMPLE_DOCS.length} starter docs, and ${QUESTION_TEMPLATES.length} question templates loaded.` : "One or more JSON data packs are missing.",
    styleOk ? "Embedded CSS fallback is present, so the page can survive stale external CSS." : "Embedded CSS fallback is missing or stale."
  ].join(" ");
  const cards = [
    {
      label: "Version",
      value: DATA_VERSION,
      detail: "The visible app and JSON fetches use this cache key.",
      status: DATA_VERSION === "20260510-uae-61" ? "current" : "stale",
      className: DATA_VERSION === "20260510-uae-61" ? "is-good" : "is-warning"
    },
    {
      label: "Data packs",
      value: `${SAMPLE_COMPANIES.length} / ${SAMPLE_DOCS.length} / ${QUESTION_TEMPLATES.length}`,
      detail: "Companies, starter documents, and question templates loaded from the data folder.",
      status: dataOk ? "loaded" : "missing",
      className: dataOk ? "is-good" : "is-error"
    },
    {
      label: "Style fallback",
      value: styleOk ? "Embedded" : "Missing",
      detail: "Full CSS is embedded in index.html as a GitHub Pages recovery layer.",
      status: styleOk ? "safe" : "check html",
      className: styleOk ? "is-good" : "is-error"
    },
    {
      label: "Live path",
      value: isLocal ? "Local preview" : path,
      detail: `Expected live URL: ${LIVE_PAGES_URL}`,
      status: pathOk ? "case-correct" : "wrong path",
      className: pathOk ? "is-good" : "is-error"
    },
    {
      label: "Runtime",
      value: runtimeOk ? "Booted" : "Error",
      detail: "Decision Journal, Pilot Sessions, Pilot Follow-Ups, Pilot Outreach, Pilot Conversion, Session Snapshot, Release Handoff, Live Smoke Test, Pilot Demo Script, Pilot Learning Loop, Founder Weekly Review, Pilot Onboarding Room, Pilot Success Plan, Pilot Value Proof, Pilot Evidence Ledger, Pilot Proof Packet, Pilot Close Room, Paid Pilot Delivery Board, Renewal & Expansion Board, Account Health Command Center, Founder Revenue Forecast Center, Founder Board Pack Center, Founder Diligence Room, Investor Data Room, Investor Intro Room, Investor Reply Pipeline, Investor Meeting Prep Room, Investor Terms & Follow-Up Room, Investor IC Memo Room, Investor Decision Room, Funding Round Command Center, Board Pack War Room, Investor Close Plan Room, Investor Commitment Tracker, Investor Objection Desk, Investor Update Composer, Investor Momentum Ledger, Investor Follow-Through Board, top navigation, Launch Control, and the core desk functions are available.",
      status: runtimeOk ? "healthy" : "blocked",
      className: runtimeOk ? "is-good" : "is-error"
    },
    {
      label: "Browser storage",
      value: storageOk ? "Available" : "Blocked",
      detail: "Saved briefs, source progress, reviews, decisions, and valuation cases use local browser storage.",
      status: storageOk ? "ready" : "private mode",
      className: storageOk ? "is-good" : "is-warning"
    },
    {
      label: "Source coverage",
      value: `${state.sourcePackDocs.length} real / ${state.uploadedDocs.length} import`,
      detail: "Locally added source-pack and uploaded documents available in this browser session.",
      status: state.sourcePackDocs.length || state.uploadedDocs.length ? "expanded" : "starter",
      className: state.sourcePackDocs.length || state.uploadedDocs.length ? "is-good" : "is-warning"
    },
    {
      label: "Pilot surface",
      value: `${state.pilotSessions.length} sessions / ${state.pilotFollowups.length} follow-ups / ${state.pilotOutreachDrafts.length} drafts / ${state.pilotConversions.length} deals / ${state.pilotEvidenceLedger.length} evidence`,
      detail: `${state.memoReviews.length} reviews and ${state.decisionJournal.length} decisions are stored for the pilot trail.`,
      status: state.pilotSessions.length || state.pilotFollowups.length || state.pilotOutreachDrafts.length || state.pilotConversions.length || state.pilotEvidenceLedger.length || state.memoReviews.length || state.decisionJournal.length ? "active" : "empty",
      className: state.pilotSessions.length || state.pilotFollowups.length || state.pilotOutreachDrafts.length || state.pilotConversions.length || state.pilotEvidenceLedger.length || state.memoReviews.length || state.decisionJournal.length ? "is-good" : "is-warning"
    }
  ];
  const checklist = [
    "Extract the v61 ZIP and upload the contents to the GitHub repo root, not the wrapper folder.",
    "Confirm index.html, app.js, styles.css, launch.css, assets/, data/, docs/, and .nojekyll are visible at the repository root.",
    "Wait for the GitHub Pages build action to show a green check.",
    `Open ${LIVE_PAGES_URL} and hard refresh with Ctrl+Shift+R.`,
    "Open Pages Doctor and confirm version 20260510-uae-61, data packs loaded, style fallback embedded, and runtime booted.",
    "Run one sample question, then open Brief Workbench, Readiness Gate, Decision Journal, Pilot Sessions, Pilot Follow-Up Board, Pilot Outreach Composer, Pilot Conversion Pipeline, Session Snapshot, Release Handoff, Live Smoke Test, Pilot Demo Script, Pilot Learning Loop, Founder Weekly Review, Pilot Onboarding Room, Pilot Success Plan, Pilot Value Proof, Pilot Evidence Ledger, Pilot Proof Packet, Pilot Close Room, Paid Pilot Delivery Board, Renewal & Expansion Board, Account Health Command Center, Founder Revenue Forecast Center, Founder Board Pack Center, Founder Diligence Room, Investor Data Room, Investor Intro Room, Investor Reply Pipeline, Investor Meeting Prep Room, Investor Terms & Follow-Up Room, Investor IC Memo Room, Investor Decision Room, Funding Round Command Center, Board Pack War Room, Investor Close Plan Room, Investor Commitment Tracker, Investor Objection Desk, Investor Update Composer, Investor Momentum Ledger, Investor Follow-Through Board, and Launch Control."
  ];
  return { score, statusClass, statusLabel, headline, summary, cards, checklist };
}

function canUseBrowserStorage() {
  try {
    const key = "majlisalpha-pages-doctor-test";
    localStorage.setItem(key, "1");
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    return false;
  }
}

async function copyPagesDoctorChecklist() {
  const audit = makePagesDeploymentAudit();
  const copied = await copyTextToClipboard(makePagesDoctorMarkdown(audit));
  flashPagesDoctorResult(copied ? "Deployment checklist copied." : "Clipboard blocked. Use the visible checklist.", copied ? "success" : "error");
}

function makePagesDoctorMarkdown(audit) {
  return [
    "# MajlisAlpha Pages Deployment Doctor",
    "",
    `Version: ${DATA_VERSION}`,
    `Live URL: ${LIVE_PAGES_URL}`,
    `Generated: ${new Date().toLocaleString()}`,
    `Health: ${audit.statusLabel} (${audit.score}%)`,
    "",
    "## Checks",
    ...audit.cards.map((card) => `- ${card.label}: ${card.value} (${card.status}) - ${card.detail}`),
    "",
    "## Upload Checklist",
    ...audit.checklist.map((item, index) => `${index + 1}. ${item}`)
  ].join("\n");
}

function flashPagesDoctorResult(message, tone = "neutral") {
  if (!els.pagesDoctorResult) return;
  els.pagesDoctorResult.className = `builder-result is-${tone}`;
  els.pagesDoctorResult.textContent = message;
}

function renderLaunchControlRoom() {
  if (!els.launchControlSummary || !els.launchControlStats || !els.launchBlockerList || !els.launchCompanyList) return;
  const audit = makeLaunchAudit();
  if (els.launchControlStatus) els.launchControlStatus.textContent = audit.statusLabel;
  if (els.launchBlockerCount) {
    els.launchBlockerCount.textContent = `${audit.blockers.length} open`;
  }
  if (els.openLaunchBlocker) els.openLaunchBlocker.disabled = !audit.nextBlocker;

  els.launchControlSummary.innerHTML = `
    <div class="launch-control-hero ${escapeAttr(audit.statusClass)}">
      <div>
        <span>${escapeHtml(audit.statusLabel)}</span>
        <strong>MajlisAlpha ${escapeHtml(audit.releaseLabel)}</strong>
        <p>${escapeHtml(audit.summary)}</p>
      </div>
      <div class="launch-score">
        <span>Launch score</span>
        <strong>${escapeHtml(audit.score)}%</strong>
      </div>
    </div>
  `;

  els.launchControlStats.innerHTML = audit.stats.map((stat) => `
    <article>
      <span>${escapeHtml(stat.label)}</span>
      <strong>${escapeHtml(stat.value)}</strong>
      <em>${escapeHtml(stat.detail)}</em>
    </article>
  `).join("");

  els.launchBlockerList.innerHTML = audit.blockers.length
    ? audit.blockers.map((blocker) => `
      <article class="launch-blocker ${escapeAttr(blocker.className)}">
        <span>${escapeHtml(blocker.severity)}</span>
        <strong>${escapeHtml(blocker.title)}</strong>
        <p>${escapeHtml(blocker.detail)}</p>
      </article>
    `).join("")
    : `<article class="launch-blocker is-clear"><span>Clear</span><strong>No launch blockers detected.</strong><p>Run the final upload checklist and keep evidence provenance attached.</p></article>`;

  els.launchCompanyList.innerHTML = audit.companyRows.slice(0, 5).map((row) => `
    <article class="launch-company-row ${escapeAttr(row.className)}">
      <div>
        <span>${escapeHtml(row.company.ticker)}</span>
        <strong>${escapeHtml(row.company.name)}</strong>
      </div>
      <em>${escapeHtml(row.realCount)}/${escapeHtml(row.total)} REAL</em>
      <p>${escapeHtml(row.nextText)}</p>
    </article>
  `).join("");

  if (els.launchTestPlan) {
    els.launchTestPlan.innerHTML = `
      <div class="launch-control-card-head">
        <span>Post-upload test plan</span>
        <strong>${escapeHtml(audit.tests.length)} checks</strong>
      </div>
      <ol>
        ${audit.tests.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ol>
    `;
  }
}

function makeLaunchAudit() {
  const companies = getCompanies();
  const companyRows = companies.map(makeLaunchCompanyRow).filter(Boolean);
  const totalSlots = companyRows.reduce((sum, row) => sum + row.total, 0) || 1;
  const realSlots = companyRows.reduce((sum, row) => sum + row.realCount, 0);
  const importedSlots = companyRows.reduce((sum, row) => sum + row.importedCount, 0);
  const syntheticSlots = companyRows.reduce((sum, row) => sum + row.syntheticCount, 0);
  const missingSlots = companyRows.reduce((sum, row) => sum + row.missingCount, 0);
  const realCoverage = Math.round((realSlots / totalSlots) * 100);
  const starterRows = STARTER_PACK_TICKERS.map(makeStarterPackCompany).filter(Boolean);
  const starterReady = starterRows.filter((row) => row.investmentReady).length;
  const packet = makeBriefPacket();
  const blockers = makeLaunchBlockers({ companyRows, starterRows, packet, realCoverage, realSlots, totalSlots });
  const highBlockers = blockers.filter((item) => item.severity === "High").length;
  const reviewScore = Math.min(100, state.memoReviews.length * 34);
  const starterScore = starterRows.length ? Math.round((starterReady / starterRows.length) * 100) : 0;
  const score = Math.round(
    realCoverage * 0.3
    + starterScore * 0.22
    + reviewScore * 0.18
    + (packet.hasBrief ? packet.score : 0) * 0.2
    + Math.max(0, 100 - blockers.length * 12) * 0.1
  );
  const statusLabel = highBlockers
    ? "Launch blocked"
    : score >= 75
      ? "Pilot publish ready"
      : "Prototype publish ready";
  const statusClass = highBlockers ? "is-blocked" : score >= 75 ? "is-ready" : "is-review";
  const summary = highBlockers
    ? `${highBlockers} high-priority blocker${highBlockers === 1 ? "" : "s"} should be resolved before positioning this as launch-ready.`
    : "No high-priority blockers detected. Publish as a prototype and run the upload checklist.";
  return {
    releaseLabel: "v61 Board Pack War Room",
    generatedAt: new Date().toISOString(),
    statusLabel,
    statusClass,
    score,
    summary,
    realCoverage,
    realSlots,
    importedSlots,
    syntheticSlots,
    missingSlots,
    totalSlots,
    starterReady,
    starterTotal: starterRows.length,
    reviewCount: state.memoReviews.length,
    packet,
    blockers,
    nextBlocker: blockers[0] || null,
    companyRows: companyRows.sort((a, b) => b.realCount - a.realCount || a.missingCount - b.missingCount),
    stats: [
      { label: "REAL coverage", value: `${realCoverage}%`, detail: `${realSlots}/${totalSlots} required source slots` },
      { label: "Starter companies", value: `${starterReady}/${starterRows.length}`, detail: "FAB, EMAAR, ADNOCGAS ready count" },
      { label: "Review log", value: state.memoReviews.length, detail: "Saved human review decisions" },
      { label: "Current memo", value: packet.hasBrief ? `${packet.score}%` : "None", detail: packet.statusLabel }
    ],
    tests: makeLaunchTestPlan()
  };
}

function makeLaunchCompanyRow(company) {
  const docs = getCompanyDocs(company.ticker);
  const checklist = makeRealDataChecklist(docs);
  const realCount = checklist.filter((item) => item.statusKey === "real").length;
  const importedCount = checklist.filter((item) => item.statusKey === "imported").length;
  const syntheticCount = checklist.filter((item) => item.statusKey === "synthetic").length;
  const missingCount = checklist.filter((item) => item.statusKey === "missing").length;
  const next = checklist.find((item) => item.statusKey === "missing")
    || checklist.find((item) => item.statusKey === "synthetic")
    || checklist.find((item) => item.statusKey === "imported")
    || null;
  const className = realCount === checklist.length ? "is-ready" : realCount >= 3 ? "is-review" : "is-blocked";
  return {
    company,
    checklist,
    realCount,
    importedCount,
    syntheticCount,
    missingCount,
    total: checklist.length,
    next,
    className,
    nextText: next ? `Next: replace ${next.label} (${next.status}).` : "All required source types are REAL."
  };
}

function makeLaunchBlockers({ companyRows, starterRows, packet, realCoverage, realSlots }) {
  const blockers = [];
  if (!packet.hasBrief) {
    blockers.push({
      severity: "High",
      className: "is-high",
      action: "run-question",
      title: "No current memo packet",
      detail: "Run a desk question, then review the Brief Workbench before calling the site launch-ready."
    });
  }
  if (!state.memoReviews.length) {
    blockers.push({
      severity: "High",
      className: "is-high",
      action: "review",
      title: "No human review decision",
      detail: "Save at least one Memo Review Room decision so the launch has a human judgement trail."
    });
  }
  if (!realSlots) {
    const firstStarter = starterRows[0]?.next;
    blockers.push({
      severity: "High",
      className: "is-high",
      action: "source",
      ticker: starterRows[0]?.company.ticker || STARTER_PACK_TICKERS[0],
      requirementKey: firstStarter?.key || "annual-report",
      title: "No REAL source record yet",
      detail: "The public corpus is still SYN/IMP only. Replace at least one official source before stronger launch positioning."
    });
  }
  const starterGap = starterRows.find((row) => !row.investmentReady);
  if (starterGap && starterGap.next) {
    blockers.push({
      severity: "High",
      className: "is-high",
      action: "source",
      ticker: starterGap.company.ticker,
      requirementKey: starterGap.next.key,
      title: `${starterGap.company.ticker} is not source-complete`,
      detail: `Next required source: ${starterGap.next.label} (${starterGap.next.status}).`
    });
  }
  const syntheticCitations = packet.citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "synthetic").length;
  if (packet.hasBrief && syntheticCitations) {
    blockers.push({
      severity: "Medium",
      className: "is-medium",
      action: packet.nextGap ? "source" : "brief",
      ticker: packet.meta.ticker,
      requirementKey: packet.nextGap?.key || "annual-report",
      title: "Current memo cites SYN evidence",
      detail: `${syntheticCitations} citation${syntheticCitations === 1 ? "" : "s"} in the current memo are demo-only.`
    });
  }
  if (realCoverage < 20) {
    const nextCompany = companyRows.find((row) => row.next);
    blockers.push({
      severity: "Medium",
      className: "is-medium",
      action: nextCompany ? "source" : "coverage",
      ticker: nextCompany?.company.ticker,
      requirementKey: nextCompany?.next?.key,
      title: "REAL source coverage is below pilot threshold",
      detail: `${realCoverage}% of required company-source slots are REAL. Target 20% for a credible pilot.`
    });
  }
  return blockers;
}

function makeLaunchTestPlan() {
  return [
    "After uploading the ZIP contents to GitHub, confirm the top status pill says Board war room v1.",
    "Run a question and confirm the Investment Readiness Gate shows demo, review, or committee export posture.",
    "Run one FAB risk question and confirm the Brief Workbench updates.",
    "Open Pilot Onboarding Room and confirm it shows activation cards plus a next onboarding action.",
    "Open Pilot Success Plan Center and confirm it shows seven-day milestones plus a next success action.",
    "Open Pilot Value Proof Center and confirm it shows six proof cards plus next value action.",
    "Open Pilot Evidence Ledger and confirm it can save one proof entry and update the Value Proof score.",
    "Open Pilot Proof Packet Builder and confirm it shows packet score, proof cards, packet sections, and outreach prefill.",
    "Open Pilot Close Room and confirm it shows close odds, objection handling, paid ask, and conversion prefill.",
    "Open Paid Pilot Delivery Board and confirm it shows delivery score, invoice/scope status, first paid brief, and follow-up prefill.",
    "Open Renewal & Expansion Board and confirm it shows renewal score, churn risk, expansion MRR, renewal plays, and follow-up prefill.",
    "Open Account Health Command Center and confirm it shows account health score, account cards, account rows, and follow-up prefill.",
    "Open Founder Revenue Forecast Center and confirm it shows forecast MRR, ARR run-rate, expansion upside, at-risk MRR, and conversion prefill.",
    "Open Founder Board Pack Center and confirm it shows board readiness, revenue story, account health, proof packet, deployment health, founder ask, and board memo export.",
    "Open Founder Diligence Room and confirm it shows diligence readiness, commercial proof, customer proof, source moat, risk controls, hard questions, and diligence memo export.",
    "Open Investor Data Room and confirm it shows room readiness, narrative spine, commercial folder, customer evidence, source controls, share package, and data-room export.",
    "Open Investor Intro Room and confirm it shows intro readiness, message proof, ask quality, evidence hook, follow-up motion, targeted drafts, and intro export.",
    "Open Investor Reply Pipeline and confirm it shows pipeline readiness, warm replies, open relationships, due follow-ups, reply rows, and reply export.",
    "Open Investor Meeting Prep Room and confirm it shows meeting readiness, relationship signal, proof stack, agenda clarity, objection prep, exact ask, agenda rows, and meeting export.",
    "Open Investor Follow-Through Board and confirm it shows follow-through score, recap discipline, proof delivery, intro asks, decision path, next date, relationship rows, and follow-through export.",
    "Open Investor Momentum Ledger and confirm it shows momentum score, priority relationships, proof requests, warm intros, conversion value, next 48 hours, ledger rows, and momentum export.",
    "Open Investor Update Composer and confirm it shows update readiness, proof spine, revenue signal, customer signal, source moat, next ask, draft blocks, and update export.",
    "Open Investor Objection Desk and confirm it shows objection readiness, proof answer, revenue answer, demand answer, moat answer, control answer, reply rows, and objection export.",
    "Open Investor Commitment Tracker and confirm it shows commitment readiness, warm path, proof request, commercial path, intro leverage, next date, commitment rows, and commitment export.",
    "Open Investor Close Plan Room and confirm it shows close readiness, decision owner, proof package, commercial ask, intro close, calendar lock, risk controls, close rows, and close export.",
    "Open Investor Terms & Follow-Up Room and confirm it shows terms readiness, owner clarity, commercial terms, proof lock, follow-up date, boundary control, terms rows, and terms export.",
    "Open Investor IC Memo Room and confirm it shows memo readiness, investment question, proof pack, commercial ask, risk controls, decision path, memo sections, and memo export.",
    "Open Investor Decision Room and confirm it shows decision readiness, proof requests, commercial decision, risk gate, stakeholder signal, follow-up clock, decision outcomes, and decision export.",
    "Open Funding Round Command Center and confirm it shows round readiness, investor pipeline, diligence proof, commercial case, risk controls, closing motion, command lanes, and round export.",
    "Open Board Pack War Room and confirm it shows pack readiness, executive narrative, evidence appendix, finance bridge, decision agenda, control readiness, board moves, and board export.",
    "Save one Memo Review Room decision and confirm the Launch Control review count changes.",
    "Open Launch Control and use Open next blocker to confirm it jumps to the correct workflow.",
    "Click PDF and MD after a generated answer to verify exports still download.",
    "Use Source Studio with a sample filing and confirm REAL records still require the three confidence checks."
  ];
}

function openLaunchBlocker() {
  const audit = makeLaunchAudit();
  const blocker = audit.nextBlocker;
  if (!blocker) {
    flashLaunchControlResult("No launch blocker is open.", "success");
    return;
  }
  if (blocker.action === "source" && blocker.ticker && blocker.requirementKey) {
    loadSourceTaskIntoBuilder(blocker.ticker, blocker.requirementKey);
    flashLaunchControlResult(`${blocker.ticker} source blocker opened in Source Studio.`, "success");
    return;
  }
  if (blocker.action === "review") {
    document.querySelector("#memo-review-room")?.scrollIntoView({ behavior: "smooth", block: "start" });
    flashLaunchControlResult("Memo Review Room opened. Save a review after running a memo.", "neutral");
    return;
  }
  if (blocker.action === "run-question") {
    const ticker = state.selectedTicker || STARTER_PACK_TICKERS[0];
    els.queryInput.value = `What are the risks for $${ticker}?`;
    document.querySelector("#desk")?.scrollIntoView({ behavior: "smooth", block: "start" });
    flashLaunchControlResult("A starter launch-test question is loaded in the desk.", "neutral");
    return;
  }
  document.querySelector("#brief-workbench")?.scrollIntoView({ behavior: "smooth", block: "start" });
  flashLaunchControlResult("Brief Workbench opened for the current memo.", "neutral");
}

function exportLaunchAuditPack() {
  const audit = makeLaunchAudit();
  const date = new Date().toISOString().slice(0, 10);
  const filename = `majlisalpha-launch-audit-v61-${date}.json`;
  downloadTextFile(filename, JSON.stringify(makeLaunchAuditJson(audit), null, 2), "application/json;charset=utf-8");
  flashLaunchControlResult("Launch audit pack exported.", "success");
}

async function copyLaunchUploadChecklist() {
  const copied = await copyTextToClipboard(makeLaunchUploadChecklistMarkdown(makeLaunchAudit()));
  flashLaunchControlResult(copied ? "Upload checklist copied." : "Clipboard blocked. Use export audit pack instead.", copied ? "success" : "error");
}

function makeLaunchAuditJson(audit) {
  return {
    product: "MajlisAlpha",
    release: audit.releaseLabel,
    dataVersion: DATA_VERSION,
    generatedAt: audit.generatedAt,
    status: audit.statusLabel,
    score: audit.score,
    summary: audit.summary,
    stats: audit.stats,
    blockers: audit.blockers.map(({ severity, title, detail, action, ticker, requirementKey }) => ({
      severity,
      title,
      detail,
      action,
      ticker: ticker || "",
      requirementKey: requirementKey || ""
    })),
    companyReadiness: audit.companyRows.map((row) => ({
      ticker: row.company.ticker,
      company: row.company.name,
      realCount: row.realCount,
      requiredCount: row.total,
      missingCount: row.missingCount,
      syntheticCount: row.syntheticCount,
      importedCount: row.importedCount,
      next: row.next ? { key: row.next.key, label: row.next.label, status: row.next.status } : null
    })),
    memoPacket: audit.packet.hasBrief ? makeBriefPacketJson(audit.packet) : null,
    reviewLog: makeMemoReviewLogJson(),
    postUploadTests: audit.tests
  };
}

function makeLaunchUploadChecklistMarkdown(audit) {
  const blockers = audit.blockers.length
    ? audit.blockers.map((blocker) => `- ${blocker.severity}: ${blocker.title} - ${blocker.detail}`).join("\n")
    : "- No blockers detected.";
  const tests = audit.tests.map((test, index) => `${index + 1}. ${test}`).join("\n");
  return [
    "# MajlisAlpha v61 Upload Checklist",
    "",
    `Status: ${audit.statusLabel} (${audit.score}%)`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Before Upload",
    "",
    "- Upload the contents of the v61 ZIP to the GitHub repository root.",
    "- Confirm `index.html`, `app.js`, `styles.css`, `data/`, `docs/`, and `.nojekyll` are at the root.",
    "- Commit through GitHub's upload screen.",
    "",
    "## Current Blockers",
    "",
    blockers,
    "",
    "## Post-Upload Tests",
    "",
    tests,
    "",
    "_Launch Control is a readiness workflow. It does not replace human source verification._"
  ].join("\n");
}

function flashLaunchControlResult(message, tone = "neutral") {
  if (!els.launchControlResult) return;
  els.launchControlResult.className = `builder-result is-${tone}`;
  els.launchControlResult.textContent = message;
}

function buildChunks(docs) {
  const chunks = [];
  for (const doc of docs) {
    for (const section of doc.sections) {
      const parts = splitIntoChunks(section.text, 520);
      parts.forEach((text, index) => {
        const tokens = tokenize(`${doc.ticker} ${doc.company} ${doc.type} ${section.title} ${text}`);
        const tokenCounts = tokens.reduce((counts, token) => {
          counts[token] = (counts[token] || 0) + 1;
          return counts;
        }, {});
        chunks.push({
          id: `${doc.id}-${section.title}-${index}`,
          docId: doc.id,
          ticker: doc.ticker,
          company: doc.company,
          type: doc.type,
          period: doc.period,
          date: doc.date,
          sourceStatus: doc.sourceStatus,
          sourceLabel: doc.sourceLabel,
          sourceUrl: doc.sourceUrl,
          section: section.title,
          text,
          tokens,
          tokenCounts
        });
      });
    }
  }
  return chunks;
}

function getGuardedDocs(docs, tickerFocus, explicitCompare) {
  if (!state.onlySelectedTicker || explicitCompare) return docs;
  const focusTicker = tickerFocus ? tickerFocus.ticker : state.selectedTicker;
  if (!focusTicker) return docs;
  const focusedDocs = docs.filter((doc) => doc.ticker === focusTicker);
  return focusedDocs.length ? focusedDocs : docs;
}

function rankChunks(question, chunks, options = {}) {
  const queryTokens = expandTokens(question);
  const intent = detectIntent(question);
  const lowerQuestion = question.toLowerCase();
  const focusTicker = options.tickerFocus ? options.tickerFocus.ticker : "";
  const strictFocus = state.onlySelectedTicker && focusTicker && !options.explicitCompare;
  const tickersInQuestion = Array.from(getMentionedTickers(question));

  return chunks
    .map((chunk) => {
      let score = 0;
      for (const token of queryTokens) {
        if (chunk.tokenCounts[token]) {
          score += 2.2 + Math.log(1 + chunk.tokenCounts[token]);
        }
      }
      for (const term of intent.terms) {
        if (chunk.tokenCounts[normalizeToken(term)]) {
          score += 1.6;
        }
      }
      if (tickersInQuestion.includes(chunk.ticker)) score += 6;
      if (strictFocus && chunk.ticker === focusTicker) score += 8;
      if (strictFocus && chunk.ticker !== focusTicker) score -= 14;
      if (/call|earnings call|tone|management|confidence|guidance/.test(lowerQuestion) && /call|earnings call/i.test(chunk.type)) score += 3.5;
      if (/filing|annual|report|risk factor|mda|md&a|announcement|ownership/.test(lowerQuestion) && /annual|filing|announcement|ownership/i.test(chunk.type)) score += 3.5;
      if (/valuation|model|multiple|discount/.test(lowerQuestion) && /model/i.test(chunk.type)) score += 5;
      if (/risk|headwind|pressure/.test(lowerQuestion) && /risk/i.test(chunk.section)) score += 2.5;
      score += toneRelevance(question, chunk.text) * 0.55;
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 2)
    .sort((a, b) => b.score - a.score);
}

function makeEvidenceGuardMeta(question, citations, tickerFocus, explicitCompare) {
  const compareMode = explicitCompare;
  const focusTicker = tickerFocus ? tickerFocus.ticker : state.selectedTicker;
  const focusCitations = focusTicker ? citations.filter((citation) => citation.ticker === focusTicker) : citations;
  const mismatches = focusTicker && !compareMode
    ? citations.filter((citation) => citation.ticker !== focusTicker)
    : [];
  const syntheticCount = citations.filter((citation) => normalizeSourceStatus(citation.sourceStatus) === "synthetic").length;
  const docs = new Set(citations.map((citation) => citation.docId)).size;
  const types = new Set(citations.map((citation) => citation.type)).size;
  const sourceQuality = citations.reduce((sum, citation) => {
    const status = normalizeSourceStatus(citation.sourceStatus);
    if (status === "real") return sum + 12;
    if (status === "imported") return sum + 8;
    return sum + 4;
  }, 0);
  const focusRatio = citations.length ? focusCitations.length / citations.length : 1;
  let score = 45 + docs * 5 + types * 6 + sourceQuality / Math.max(citations.length, 1) + Math.round(focusRatio * 24) - mismatches.length * 18;
  if (state.onlySelectedTicker && focusTicker && !compareMode && mismatches.length === 0) score += 8;
  if (compareMode) score += Math.min(new Set(citations.map((citation) => citation.ticker)).size * 4, 12);
  score = Math.max(18, Math.min(98, Math.round(score)));
  const qualityClass = mismatches.length ? "is-warning" : syntheticCount ? "is-mixed" : score >= 78 ? "is-strong" : "is-mixed";
  const label = mismatches.length ? "Check citations" : syntheticCount ? "SYN review needed" : score >= 78 ? "Strong guard" : "Adequate guard";
  const message = compareMode
    ? "The question is explicitly comparative, so multiple tickers are allowed in the evidence stack."
    : state.onlySelectedTicker && focusTicker
      ? `Single-company guard is active for ${focusTicker}.`
      : "Single-company guard is relaxed, so the answer can draw from the enabled coverage universe.";
  return {
    compareMode,
    focusTicker,
    mismatches,
    syntheticCount,
    score,
    label,
    qualityClass,
    message
  };
}

function expandTokens(text) {
  const base = tokenize(text);
  const expanded = new Set(base);
  for (const token of base) {
    if (SYNONYMS[token]) {
      SYNONYMS[token].forEach((item) => expanded.add(item));
    }
  }
  for (const company of getCompanies()) {
    const lower = text.toLowerCase();
    if (lower.includes(company.ticker.toLowerCase()) || lower.includes(company.name.toLowerCase())) {
      expanded.add(company.ticker.toLowerCase());
      tokenize(company.name).forEach((token) => expanded.add(token));
    }
  }
  return Array.from(expanded);
}

function tokenize(text) {
  return (text.toLowerCase().match(/[a-z0-9]+(?:\.[0-9]+)?/g) || [])
    .map(normalizeToken)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function normalizeToken(token) {
  return String(token).toLowerCase().replace(/[^a-z0-9.]/g, "");
}

function detectIntent(question) {
  const lowerQuestion = String(question || "").toLowerCase();
  if (/\b(risk|risks|risk factor|risk factors|headwind|headwinds|pressure points?)\b/.test(lowerQuestion)) {
    return INTENTS.find((intent) => intent.id === "risk");
  }
  if (/\b(rate|rates|repo|deposit|interest|financing|refinancing|discount rate|leverage)\b/.test(lowerQuestion)) {
    return INTENTS.find((intent) => intent.id === "rates");
  }
  const tokens = new Set(expandTokens(question));
  const scored = INTENTS.map((intent) => {
    const score = intent.terms.reduce((sum, term) => sum + (tokens.has(normalizeToken(term)) ? 1 : 0), 0);
    return { ...intent, score };
  }).sort((a, b) => b.score - a.score);
  return scored[0].score ? scored[0] : INTENTS[1];
}

function groupCitationsByTicker(citations) {
  return citations.reduce((groups, citation) => {
    if (!groups[citation.ticker]) groups[citation.ticker] = [];
    groups[citation.ticker].push(citation);
    return groups;
  }, {});
}

function rankCompaniesForQuestion(question, grouped, intent) {
  const companies = getCompanies().filter((company) => grouped[company.ticker]);
  return companies.map((company) => {
    const group = grouped[company.ticker] || [];
    const relevance = group.reduce((sum, citation) => sum + citation.score, 0);
    const tone = group.reduce((sum, citation) => sum + toneScore(citation.text), 0) / Math.max(group.length, 1);
    let quality = company.growth * 0.2 + company.opMargin * 0.28 + company.fcfMargin * 0.25 + company.sentiment * 0.2 - company.risk * 0.18;
    if (intent.id === "margin") quality = company.grossMargin * 0.4 + company.opMargin * 0.38 + company.fcfMargin * 0.22 - company.risk * 0.16;
    if (intent.id === "rates") quality = company.fcfMargin * 0.32 + Math.max(-company.netDebt, 0) * 2.6 - Math.max(company.netDebt, 0) * 1.8 - company.risk * 0.22;
    if (intent.id === "cash") quality = company.fcfMargin * 0.45 - Math.max(company.netDebt, 0) * 1.6 - company.risk * 0.15;
    if (intent.id === "growth") quality = company.growth * 0.55 + company.sentiment * 0.2 - company.risk * 0.12;
    if (intent.id === "risk") quality = 100 - company.risk + company.fcfMargin * 0.2 + tone * 0.3;
    const score = relevance + quality + tone;
    return {
      ...company,
      citations: group,
      relevance,
      tone,
      score
    };
  }).sort((a, b) => b.score - a.score);
}

function computeConfidence(citations, rankedCompanies) {
  const docs = new Set(citations.map((citation) => citation.docId)).size;
  const types = new Set(citations.map((citation) => citation.type)).size;
  const companies = rankedCompanies.length;
  const topScore = citations[0] ? citations[0].score : 0;
  const confidence = 34 + docs * 6 + types * 7 + companies * 5 + Math.min(topScore * 1.5, 18);
  return Math.max(42, Math.min(94, Math.round(confidence)));
}

function makeHeadline(question, compareMode, rankedCompanies, intent) {
  if (!rankedCompanies.length) return escapeHtml(question);
  const leader = rankedCompanies[0];
  if (intent.id === "risk") {
    return `${escapeHtml(leader.ticker)} has three source-backed risk factors to underwrite.`;
  }
  if (compareMode && rankedCompanies.length > 1) {
    return `${escapeHtml(leader.ticker)} screens best on ${escapeHtml(intent.label.toLowerCase())}, but the answer is source-dependent.`;
  }
  return `${escapeHtml(leader.ticker)} has a ${toneLabel(leader.tone).toLowerCase()} setup for ${escapeHtml(intent.label.toLowerCase())}.`;
}

function makeThesis(compareMode, rankedCompanies, citations, intent) {
  if (!rankedCompanies.length) {
    return "The enabled corpus does not have enough source material to support a ranked answer.";
  }
  const leader = rankedCompanies[0];
  const runnerUp = rankedCompanies[1];
  const topCitation = citations[0];
  const leaderMetrics = `${leader.growth}% revenue growth, ${leader.opMargin}% operating margin, and ${leader.fcfMargin}% FCF margin`;
  if (intent.id === "risk") {
    return `The retrieved source stack points to underwritable risks, not a single fatal flaw. ${escapeHtml(leader.ticker)} still shows ${escapeHtml(leaderMetrics)}, but the risk work should focus on disclosures tied to demand cadence, anchor shareholder alignment, cash conversion, financing, and execution timing. The highest-weighted passage is from ${escapeHtml(topCitation.company)} ${escapeHtml(topCitation.type)}. ${citationLink(0)}`;
  }
  if (compareMode && runnerUp) {
    return `${escapeHtml(leader.ticker)} leads because the retrieved sources combine stronger fundamentals (${escapeHtml(leaderMetrics)}) with more direct support on ${escapeHtml(intent.label.toLowerCase())}. ${escapeHtml(runnerUp.ticker)} has a credible counter-case, but its source stack carries more visible pressure points. The highest-weighted passage is from ${escapeHtml(topCitation.company)} ${escapeHtml(topCitation.type)}, which anchors the answer rather than relying on a broad sector narrative. ${citationLink(0)}`;
  }
  return `The source stack is ${toneLabel(leader.tone).toLowerCase()} rather than cleanly bullish. ${escapeHtml(leader.ticker)} shows ${escapeHtml(leaderMetrics)}, but the same documents also surface risks that should be tested in the valuation model. The best anchor is ${escapeHtml(topCitation.type)} coverage of ${escapeHtml(topCitation.section.toLowerCase())}. ${citationLink(0)}`;
}

function makeRiskFactorSection(citations, rankedCompanies) {
  const factors = buildRiskFactors(citations, rankedCompanies[0]);
  const items = factors.map((factor) => `
    <li>
      <div class="risk-factor-top">
        <span class="risk-severity ${escapeAttr(factor.severityClass)}">${escapeHtml(factor.severity)}</span>
        <strong>${escapeHtml(factor.title)}</strong>
      </div>
      <p>${escapeHtml(factor.body)} ${citationLink(factor.citationIndex)}</p>
    </li>
  `).join("");

  return `
    <section class="answer-section risk-factor-section">
      <h3>3 cited risk factors</h3>
      <ol class="risk-factor-list">${items}</ol>
    </section>
  `;
}

function makeRiskFactorPlainText(citations, rankedCompanies) {
  return buildRiskFactors(citations, rankedCompanies[0]).map((factor, index) => {
    const citation = citations[factor.citationIndex];
    const citationText = citation ? ` [${citation.citationId} ${citation.type} - ${citation.section}]` : "";
    return `${index + 1}. ${factor.title} (${factor.severity}): ${factor.body}${citationText}`;
  }).join("\n");
}

function buildRiskFactors(citations, company) {
  const fallbackCompany = company || getCompanies()[0];
  const blueprint = RISK_FACTOR_LIBRARY[fallbackCompany.ticker] || makeGenericRiskBlueprint(fallbackCompany);
  const factors = blueprint.slice(0, 3).map((factor, index) => {
    const citationIndex = findRiskCitationIndex(citations, factor.terms, index);
    return {
      ...factor,
      citationIndex,
      severityClass: factor.severity.toLowerCase()
    };
  });

  while (factors.length < 3) {
    const index = factors.length;
    factors.push({
      title: "Source coverage gap",
      severity: "Medium",
      severityClass: "medium",
      terms: [],
      body: "Import more annual reports, exchange disclosures, ownership updates, or earnings-call notes to pressure-test this risk with a broader evidence base.",
      citationIndex: Math.min(index, Math.max(citations.length - 1, 0))
    });
  }

  return factors;
}

function makeGenericRiskBlueprint(company) {
  return [
    {
      title: "Demand and revenue durability",
      severity: "High",
      terms: ["demand", "revenue", "customer", "growth"],
      body: `${company.ticker} should be tested for demand volatility, anchor shareholder alignment, regulatory pressure, and the durability of its revenue growth.`
    },
    {
      title: "Margin and cash conversion",
      severity: "Medium",
      terms: ["margin", "cash", "working capital", "inventory", "capex"],
      body: `${company.ticker} risk work should connect margin pressure to working capital, capex, credit cost, and free cash flow conversion.`
    },
    {
      title: "Balance sheet and execution timing",
      severity: "Medium",
      terms: ["debt", "financing", "delay", "execution", "rates"],
      body: `${company.ticker} needs a timing, leverage, and disclosure-quality check so execution delays do not hide in the base valuation case.`
    }
  ];
}

function findRiskCitationIndex(citations, terms, fallbackIndex) {
  if (!citations.length) return 0;
  const lowerTerms = terms.map((term) => term.toLowerCase());
  const scored = citations.map((citation, index) => {
    const haystack = `${citation.type} ${citation.section} ${citation.text}`.toLowerCase();
    const score = lowerTerms.reduce((sum, term) => sum + (haystack.includes(term) ? 1 : 0), 0)
      + (/risk|liquidity|q&a|management discussion/i.test(`${citation.section} ${citation.type}`) ? 0.5 : 0);
    return { index, score };
  }).sort((a, b) => b.score - a.score || a.index - b.index);
  if (scored[0].score > 0) return scored[0].index;
  return Math.min(fallbackIndex, citations.length - 1);
}

function makeEvidenceSentence(citation, intent) {
  const metrics = extractMetrics(citation.text);
  const metricPhrase = metrics.length ? ` Key extracted figures: ${escapeHtml(metrics.slice(0, 4).join(", "))}.` : "";
  const status = normalizeSourceStatus(citation.sourceStatus);
  const statusText = status === "synthetic"
    ? "SYN demo evidence"
    : status === "imported"
      ? "Imported evidence"
      : "REAL evidence";
  return `${escapeHtml(statusText)} from ${escapeHtml(citation.company)} ${escapeHtml(citation.type)} links ${escapeHtml(intent.label.toLowerCase())} to ${escapeHtml(snippet(citation.text, 170))}.${metricPhrase}`;
}

function makeWatchItems(citations, rankedCompanies, intent) {
  const negative = citations
    .map((citation) => ({ citation, score: negativeTermCount(citation.text) }))
    .sort((a, b) => b.score - a.score)
    .filter((item) => item.score > 0)
    .slice(0, 2);
  const leader = rankedCompanies[0];
  const items = negative.length
    ? negative.map((item, index) => `${escapeHtml(snippet(item.citation.text, 155))} ${citationLink(citations.indexOf(item.citation))}`)
    : [`Watch whether the next disclosure confirms the ${escapeHtml(intent.label.toLowerCase())} indicators that drove this retrieval result.`];
  if (leader) {
    items.push(`For ${escapeHtml(leader.ticker)}, the model answer would weaken if revenue growth decelerates without a matching improvement in FCF margin.`);
  }
  return items.join(" ");
}

function makeValuationRead(company, intent) {
  if (!company) return "Run the valuation lens against the company with the strongest retrieved evidence.";
  const onePointFcf = terminalFcfSensitivity(company, 1);
  const rateText = intent.id === "rates"
    ? "Because the question centers on rates, discount rate and net debt deserve the first sensitivity pass."
    : "Flex FCF margin before terminal multiple so the valuation stays tied to operating evidence.";
  return `${escapeHtml(company.ticker)} should be modeled from the evidence, not from a static multiple. At current base revenue of ${formatMoney(company.revenue)} and ${company.fcfMargin}% FCF margin, a one-point terminal FCF margin swing is worth roughly ${formatMoney(onePointFcf)} of annual terminal FCF before discounting. ${rateText}`;
}

function makeDebate(citations, rankedCompanies) {
  const callEvidence = citations.find((citation) => /call|earnings call/i.test(citation.type));
  const filingEvidence = citations.find((citation) => /annual|filing|announcement|ownership/i.test(citation.type));
  const leader = rankedCompanies[0];
  const debateParts = [];
  if (filingEvidence) {
    debateParts.push(`The disclosure is the discipline check: ${escapeHtml(snippet(filingEvidence.text, 170))} ${citationLink(citations.indexOf(filingEvidence))}`);
  }
  if (callEvidence) {
    debateParts.push(`The earnings call tests tone: ${escapeHtml(snippet(callEvidence.text, 170))} ${citationLink(citations.indexOf(callEvidence))}`);
  }
  if (leader) {
    debateParts.push(`The committee question is whether ${escapeHtml(leader.ticker)}'s evidence quality deserves a higher multiple or simply lowers downside risk.`);
  }
  return debateParts.join(" ");
}

function makeCompanyTable(rankedCompanies) {
  if (!rankedCompanies.length) return `<p>No company ranking was available.</p>`;
  const rows = rankedCompanies.map((company, index) => {
    const tone = toneClass(company.tone);
    return `
      <tr>
        <td>${index + 1}</td>
        <td><strong>${escapeHtml(company.ticker)}</strong><br>${escapeHtml(company.name)}</td>
        <td>${company.growth}%</td>
        <td>${company.opMargin}%</td>
        <td>${company.fcfMargin}%</td>
        <td><span class="tone-chip ${tone}">${escapeHtml(toneLabel(company.tone))}</span></td>
      </tr>
    `;
  }).join("");
  return `
    <table class="rank-table">
      <thead>
        <tr>
          <th>Rank</th>
          <th>Company</th>
          <th>Growth</th>
          <th>Op margin</th>
          <th>FCF</th>
          <th>Tone</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function citationLink(index) {
  const citation = state.currentCitations[index];
  if (!citation) return "";
  return `<a class="citation-link" href="#evidence-${escapeAttr(citation.citationId)}">${escapeHtml(citation.citationId)}</a>`;
}

function isExplicitCompareQuestion(question) {
  const lower = question.toLowerCase();
  const mentionedTickers = getMentionedTickers(question);
  return mentionedTickers.size > 1 || /compare|versus|\bvs\b|which company|which bank|better|best|rank|peer/i.test(lower);
}

function getMentionedTickers(question) {
  const text = String(question || "");
  const lower = text.toLowerCase();
  const mentioned = new Set(getCompanies()
    .filter((company) => lower.includes(company.ticker.toLowerCase()) || lower.includes(company.name.toLowerCase()))
    .map((company) => company.ticker));
  const cashTags = text.match(/\$([A-Z][A-Z0-9.]{0,11})\b/gi) || [];
  cashTags.forEach((tag) => {
    const rawTicker = normalizeTicker(tag.slice(1));
    const company = getCompany(rawTicker) || getCompany(PUBLIC_TICKER_ALIASES[rawTicker]?.ticker);
    if (company) mentioned.add(company.ticker);
  });
  return mentioned;
}

function getEnabledDocs() {
  return state.documents.filter((doc) => state.enabledDocIds.has(doc.id) && state.activeTickers.has(doc.ticker));
}

function rebuildDocumentCorpus() {
  state.documents = [...SAMPLE_DOCS, ...state.sourcePackDocs, ...state.uploadedDocs];
  state.enabledDocIds = new Set(state.documents.map((doc) => doc.id));
  if (!getCompanies().some((company) => company.ticker === state.selectedTicker)) {
    state.selectedTicker = getCompanies()[0]?.ticker || "";
  }
  renderCoverage();
  renderLibrary();
  renderImportTickerOptions();
  renderSourceBuilderTickerOptions();
  renderSourceMatrixOptions();
  renderSourceMatrix();
  renderRealSourceStarterPack();
  renderSourceQueueOptions();
  renderSourceQueue();
  renderSourceHubOptions();
  renderSourceHub();
  renderSourceWorkspace();
  renderContextBand();
  renderValuationOptions();
  renderCompanyDossier();
  updateValuationFromCompany();
  updateValuation();
  drawSignalMap();
}

function getCompanyDocs(ticker) {
  return state.documents.filter((doc) => doc.ticker === ticker);
}

function sourceMixForDocs(docs) {
  if (!docs.length) return "";
  const counts = docs.reduce((groups, doc) => {
    const label = shortDocType(doc.type);
    groups[label] = (groups[label] || 0) + 1;
    return groups;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => `${label} ${count}`)
    .join(" | ");
}

function sourceStatusSummary(docs) {
  if (!docs.length) return "";
  const counts = docs.reduce((groups, doc) => {
    const label = shortSourceStatus(doc);
    groups[label] = (groups[label] || 0) + 1;
    return groups;
  }, {});
  return Object.entries(counts)
    .map(([label, count]) => `${label} ${count}`)
    .join(" | ");
}

function makeRealDataChecklist(docs) {
  return REAL_SOURCE_REQUIREMENTS.map((requirement) => {
    const status = getRequirementStatus(docs, requirement);
    return { ...requirement, status: status.statusLabel, statusKey: status.statusKey, className: status.className, doc: status.doc };
  });
}

function makeRealSourceCompleteness(checklist) {
  const total = checklist.length || 1;
  const realCount = checklist.filter((item) => item.statusKey === "real").length;
  const reviewCount = checklist.filter((item) => item.statusKey === "imported").length;
  const starterCount = checklist.filter((item) => item.statusKey === "synthetic").length;
  const missingCount = checklist.filter((item) => item.statusKey === "missing").length;
  const percent = Math.round((realCount / total) * 100);
  const next = checklist.find((item) => item.statusKey === "missing")
    || checklist.find((item) => item.statusKey === "synthetic")
    || checklist.find((item) => item.statusKey === "imported")
    || checklist[0];
  const summary = [
    `${realCount}/${total} REAL`,
    reviewCount ? `${reviewCount} imported review` : "",
    starterCount ? `${starterCount} SYN starter` : "",
    missingCount ? `${missingCount} missing` : ""
  ].filter(Boolean).join(" | ");
  return {
    percent,
    nextKey: next ? next.key : "annual-report",
    summary: summary || "All required source types are marked REAL."
  };
}

function normalizeSourceStatus(value) {
  const status = String(value || "").toLowerCase();
  if (status === "real" || status === "verified") return "real";
  if (status === "imported" || status === "user") return "imported";
  return "synthetic";
}

function sourceStatusClass(doc) {
  return `source-${normalizeSourceStatus(doc && doc.sourceStatus)}`;
}

function shortSourceStatus(doc) {
  const status = normalizeSourceStatus(doc && doc.sourceStatus);
  if (status === "real") return "REAL";
  if (status === "imported") return "IMP";
  return "SYN";
}

function sourceStatusLabel(doc) {
  const status = normalizeSourceStatus(doc && doc.sourceStatus);
  if (status === "real") return doc.sourceLabel || "Real source";
  if (status === "imported") return doc.sourceLabel || "Imported source";
  return doc.sourceLabel || "Synthetic starter evidence";
}

function defaultSourceLabel(status) {
  const normalized = normalizeSourceStatus(status);
  if (normalized === "real") return "Real source";
  if (normalized === "imported") return "Imported source";
  return "Synthetic starter evidence";
}

function getCompanies() {
  const byTicker = new Map(SAMPLE_COMPANIES.map((company) => [company.ticker, { ...company }]));
  for (const doc of [...state.sourcePackDocs, ...state.uploadedDocs]) {
    if (!byTicker.has(doc.ticker)) {
      byTicker.set(doc.ticker, {
        ticker: doc.ticker,
        name: doc.company || `${doc.ticker} imported corpus`,
        sector: "Imported sources",
        revenue: estimateRevenue(doc),
        growth: 8,
        grossMargin: 38,
        opMargin: 14,
        fcfMargin: 8,
        netDebt: 0,
        shares: 10,
        multiple: 12,
        risk: 55,
        sentiment: 52,
        thesis: "User-imported source set awaiting normalized fundamentals."
      });
    }
  }
  return Array.from(byTicker.values());
}

function getCompany(ticker) {
  return getCompanies().find((company) => company.ticker === ticker) || getCompanies()[0];
}

function updateValuationFromCompany() {
  const company = getCompany(state.selectedTicker);
  if (!company) return;
  els.growthSlider.value = String(Math.round(company.growth));
  els.marginSlider.value = String(Math.round(company.fcfMargin));
  els.multipleSlider.value = String(Math.round(company.multiple));
}

function updateValuation() {
  const company = getCompany(state.selectedTicker);
  if (!company) return;
  const revenueGrowth = Number(els.growthSlider.value) / 100;
  const fcfMargin = Number(els.marginSlider.value) / 100;
  const terminalMultiple = Number(els.multipleSlider.value);
  const discountRate = Number(els.discountSlider.value) / 100;
  const years = 5;
  let presentValueFcf = 0;
  let revenue = company.revenue;
  for (let year = 1; year <= years; year += 1) {
    revenue *= 1 + revenueGrowth;
    const fcf = revenue * fcfMargin;
    presentValueFcf += fcf / Math.pow(1 + discountRate, year);
  }
  const terminalRevenue = revenue;
  const terminalFcf = terminalRevenue * fcfMargin;
  const terminalValue = terminalFcf * terminalMultiple;
  const discountedTerminal = terminalValue / Math.pow(1 + discountRate, years);
  const enterpriseValue = presentValueFcf + discountedTerminal;
  const equityValue = enterpriseValue - company.netDebt;
  const perShare = equityValue / Math.max(company.shares, 0.01);

  els.growthValue.textContent = `${Math.round(revenueGrowth * 100)}%`;
  els.marginValue.textContent = `${Math.round(fcfMargin * 100)}%`;
  els.multipleValue.textContent = `${terminalMultiple}x`;
  els.discountValue.textContent = `${Math.round(discountRate * 100)}%`;
  els.valuePerShare.textContent = `AED ${Math.max(perShare, 0).toFixed(0)}`;
  els.equityValue.textContent = `${formatMoney(Math.max(equityValue, 0))}`;
  els.valuationFootnote.textContent = `${company.ticker} base model: ${formatMoney(company.revenue)} revenue, ${company.fcfMargin}% FCF margin, ${company.netDebt < 0 ? "net cash" : "net debt"} of ${formatMoney(Math.abs(company.netDebt))}. This is a scenario lens, not a price target.`;
  return {
    ticker: company.ticker,
    company: company.name,
    revenueGrowth: Math.round(revenueGrowth * 100),
    fcfMargin: Math.round(fcfMargin * 100),
    terminalMultiple,
    discountRate: Math.round(discountRate * 100),
    equityValue: Math.max(equityValue, 0),
    perShare: Math.max(perShare, 0)
  };
}

function saveValuationCase() {
  const snapshot = updateValuation();
  if (!snapshot) return;
  const valuationCase = {
    id: `case-${Date.now()}`,
    ...snapshot,
    date: new Date().toLocaleString()
  };
  state.valuationCases = [valuationCase, ...state.valuationCases].slice(0, 8);
  saveJson(STORAGE_KEYS.valuationCases, state.valuationCases);
  renderValuationCases();
  flashButtonLabel(els.saveValuationCase, "Saved");
}

function renderValuationCases() {
  if (!els.valuationCaseList) return;
  if (!state.valuationCases.length) {
    els.valuationCaseList.innerHTML = `<div class="empty-list">Saved valuation cases will appear here.</div>`;
    return;
  }
  els.valuationCaseList.innerHTML = state.valuationCases.map((valuationCase) => `
    <button class="case-card" type="button" data-case-id="${escapeAttr(valuationCase.id)}">
      <span>${escapeHtml(valuationCase.ticker)} case</span>
      <strong>AED ${escapeHtml(valuationCase.perShare.toFixed(0))}</strong>
      <em>${escapeHtml(valuationCase.revenueGrowth)}% growth, ${escapeHtml(valuationCase.fcfMargin)}% FCF, ${escapeHtml(valuationCase.terminalMultiple)}x</em>
    </button>
  `).join("");

  els.valuationCaseList.querySelectorAll(".case-card").forEach((button) => {
    button.addEventListener("click", () => {
      const valuationCase = state.valuationCases.find((item) => item.id === button.dataset.caseId);
      if (!valuationCase) return;
      state.selectedTicker = valuationCase.ticker;
      renderValuationOptions();
      els.growthSlider.value = String(valuationCase.revenueGrowth);
      els.marginSlider.value = String(valuationCase.fcfMargin);
      els.multipleSlider.value = String(valuationCase.terminalMultiple);
      els.discountSlider.value = String(valuationCase.discountRate);
      updateValuation();
      renderCompanyDossier();
      drawSignalMap();
    });
  });
}

function drawSignalMap(citations = state.currentCitations) {
  const canvas = els.signalCanvas;
  const context = canvas.getContext("2d");
  const width = canvas.width;
  const height = canvas.height;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#0f1716";
  context.fillRect(0, 0, width, height);

  context.strokeStyle = "rgba(255,255,255,0.07)";
  context.lineWidth = 1;
  for (let x = 0; x < width; x += 40) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let y = 0; y < height; y += 40) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  const activeCompanies = getCompanies().filter((company) => state.activeTickers.has(company.ticker));
  const selectedCompany = activeCompanies.find((company) => company.ticker === state.selectedTicker);
  const companies = activeCompanies.slice(0, 6);
  if (selectedCompany && !companies.some((company) => company.ticker === selectedCompany.ticker)) {
    companies.splice(Math.max(companies.length - 1, 0), 1, selectedCompany);
  }
  const activeCitationTickers = new Set(citations.map((citation) => citation.ticker));
  const rowHeight = Math.floor((height - 56) / Math.max(companies.length, 1));
  context.font = "700 15px Inter, system-ui, sans-serif";
  context.textBaseline = "middle";

  companies.forEach((company, index) => {
    const y = 36 + index * rowHeight;
    context.fillStyle = activeCitationTickers.has(company.ticker) || company.ticker === state.selectedTicker ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.045)";
    context.fillRect(14, y - 16, width - 28, rowHeight - 8);
    context.fillStyle = "#f7fbfa";
    context.fillText(company.ticker, 28, y + 2);
    drawBar(context, 116, y - 9, 150, 12, company.growth, 35, "#3fa05a");
    drawBar(context, 284, y - 9, 150, 12, company.opMargin, 40, "#5c8ed8");
    drawBar(context, 452, y - 9, 130, 12, company.risk, 100, "#dc5d55");
    context.fillStyle = "rgba(255,255,255,0.66)";
    context.font = "700 11px Inter, system-ui, sans-serif";
    context.fillText(`${company.growth}%`, 116, y + 18);
    context.fillText(`${company.opMargin}%`, 284, y + 18);
    context.fillText(`${company.risk} risk`, 452, y + 18);
    context.font = "700 15px Inter, system-ui, sans-serif";
  });

  context.fillStyle = "rgba(255,255,255,0.68)";
  context.font = "700 12px Inter, system-ui, sans-serif";
  context.fillText("Growth", 116, 18);
  context.fillText("Margin", 284, 18);
  context.fillText("Risk", 452, 18);
  els.signalStamp.textContent = citations.length ? `${citations.length} hits` : "Baseline";
}

function drawBar(context, x, y, width, height, value, max, color) {
  context.fillStyle = "rgba(255,255,255,0.13)";
  context.fillRect(x, y, width, height);
  context.fillStyle = color;
  context.fillRect(x, y, Math.max(4, Math.min(width, (value / max) * width)), height);
}

function renderNotebook() {
  if (!state.notes.length) {
    els.notebookList.innerHTML = `<div class="empty-list">Saved answers stay in this browser for quick review.</div>`;
    return;
  }
  els.notebookList.innerHTML = state.notes.map((note) => {
    const meta = noteMeta(note);
    return `
    <article class="note-card ${meta.mismatchCount ? "is-warning" : ""}">
      <span><b>${escapeHtml(meta.ticker)}</b><b>${escapeHtml(meta.date)}</b></span>
      <strong>${escapeHtml(note.title)}</strong>
      <div class="note-quality-row">
        <em>${escapeHtml(meta.intentLabel)}</em>
        <em>${escapeHtml(meta.confidenceText)}</em>
        <em>${escapeHtml(meta.qualityText)}</em>
        ${meta.guarded ? `<em>Guarded</em>` : ""}
      </div>
      <p>${escapeHtml(snippet(note.body, 220))}</p>
      <div class="note-actions">
        <button type="button" data-note-open="${escapeAttr(note.id)}">Open</button>
        <button type="button" data-note-pdf="${escapeAttr(note.id)}">PDF</button>
        <button type="button" data-note-delete="${escapeAttr(note.id)}">Delete</button>
      </div>
    </article>
  `;
  }).join("");

  els.notebookList.querySelectorAll("button[data-note-open]").forEach((button) => {
    button.addEventListener("click", () => openSavedBrief(button.dataset.noteOpen));
  });
  els.notebookList.querySelectorAll("button[data-note-pdf]").forEach((button) => {
    button.addEventListener("click", () => exportSavedBriefPdf(button.dataset.notePdf));
  });
  els.notebookList.querySelectorAll("button[data-note-delete]").forEach((button) => {
    button.addEventListener("click", () => deleteSavedBrief(button.dataset.noteDelete));
  });
}

function copyCurrentBrief() {
  if (!state.lastBrief) return;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(state.lastBrief).catch(() => fallbackCopy(state.lastBrief));
  } else {
    fallbackCopy(state.lastBrief);
  }
}

function fallbackCopy(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  return copied;
}

async function copyTextToClipboard(text) {
  if (navigator.clipboard && navigator.clipboard.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      return fallbackCopy(text);
    }
  }
  return fallbackCopy(text);
}

function saveCurrentBrief() {
  if (!state.lastBrief) return;
  if (!state.lastAnswerMeta && !state.currentCitations.length) {
    flashButtonLabel(els.saveBrief, "No brief");
    return;
  }
  const meta = state.lastAnswerMeta || inferBriefMetaFromText(state.lastBrief);
  if (meta.guarded && meta.mismatchCount > 0) {
    flashButtonLabel(els.saveBrief, "Guard blocked");
    return;
  }
  const title = `${meta.ticker} ${meta.intentLabel || "Research brief"} | ${meta.confidence || "NA"}% confidence`;
  const note = {
    id: `note-${Date.now()}`,
    title: stripHtml(title).slice(0, 120),
    body: state.lastBrief,
    intent: meta.ticker,
    ticker: meta.ticker,
    company: meta.company,
    confidence: meta.confidence || 0,
    evidenceQuality: meta.evidenceQuality || 0,
    qualityLabel: meta.qualityLabel || "",
    guarded: Boolean(meta.guarded),
    compareMode: Boolean(meta.compareMode),
    mismatchCount: meta.mismatchCount || 0,
    investmentReady: Boolean(meta.investmentReady),
    investmentReadinessLabel: meta.investmentReadinessLabel || "Unknown readiness",
    realSourceCount: meta.realSourceCount || 0,
    requiredSourceCount: meta.requiredSourceCount || REAL_SOURCE_REQUIREMENTS.length,
    nextRealSource: meta.nextRealSource || "Annual report",
    intentLabel: meta.intentLabel || "Research",
    citationCount: meta.citationCount || state.currentCitations.length,
    citations: meta.citations || [],
    date: new Date().toLocaleDateString(),
    createdAt: new Date().toISOString()
  };
  state.notes = [note, ...state.notes].slice(0, 10);
  saveJson(STORAGE_KEYS.notes, state.notes);
  renderNotebook();
  flashButtonLabel(els.saveBrief, "Saved");
}

function noteMeta(note) {
  const inferred = inferBriefMetaFromText(note.body || "");
  const ticker = note.ticker || inferred.ticker || note.intent || "Desk";
  const confidence = Number(note.confidence || inferred.confidence || 0);
  const evidenceQuality = Number(note.evidenceQuality || inferred.evidenceQuality || 0);
  return {
    ticker,
    company: note.company || inferred.company || ticker,
    date: note.date || (note.createdAt ? new Date(note.createdAt).toLocaleDateString() : ""),
    intentLabel: note.intentLabel || inferred.intentLabel || "Research",
    confidence,
    evidenceQuality,
    confidenceText: confidence ? `${confidence}% conf` : "No conf",
    qualityText: evidenceQuality ? `${evidenceQuality}% evidence` : "No quality",
    guarded: Boolean(note.guarded || inferred.guarded),
    mismatchCount: Number(note.mismatchCount || inferred.mismatchCount || 0),
    investmentReady: Boolean(note.investmentReady),
    investmentReadinessLabel: note.investmentReadinessLabel || "Unknown readiness",
    realSourceCount: Number(note.realSourceCount || 0),
    requiredSourceCount: Number(note.requiredSourceCount || REAL_SOURCE_REQUIREMENTS.length),
    nextRealSource: note.nextRealSource || "Annual report"
  };
}

function inferBriefMetaFromText(text) {
  const clean = String(text || "");
  const tickerLine = clean.match(/Ticker focus:\s*([A-Z][A-Z0-9.]*)/i);
  const qualityLine = clean.match(/Evidence quality:\s*(\d+)%\s*\(([^)]+)\)/i);
  const confidenceLine = clean.match(/\|\s*(\d+)%\s*confidence/i);
  const firstLine = clean.split("\n").find(Boolean) || "Research";
  const intentLabel = firstLine.split("|")[0]?.trim() || "Research";
  const ticker = tickerLine ? normalizeTicker(tickerLine[1]) : state.selectedTicker || "Desk";
  const company = getCompany(ticker);
  return {
    ticker,
    company: company ? company.name : ticker,
    intentLabel,
    confidence: confidenceLine ? Number(confidenceLine[1]) : 0,
    evidenceQuality: qualityLine ? Number(qualityLine[1]) : 0,
    qualityLabel: qualityLine ? qualityLine[2] : "",
    guarded: clean.includes("Single-company guard is active") || clean.includes("Evidence quality"),
    compareMode: clean.includes("explicitly comparative"),
    mismatchCount: clean.match(/off-ticker citation/) ? 1 : 0,
    citationCount: state.currentCitations.length
  };
}

function openSavedBrief(noteId) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  const meta = noteMeta(note);
  state.lastBrief = note.body;
  state.lastAnswerMeta = {
    ...meta,
    question: note.title,
    ticker: meta.ticker,
    company: meta.company,
    qualityLabel: note.qualityLabel || "",
    qualityClass: meta.mismatchCount ? "is-warning" : "is-strong",
    citationCount: note.citationCount || 0,
    citations: note.citations || []
  };
  state.currentCitations = hydrateSavedBriefCitations(note);
  els.answerPanel.innerHTML = `
    <div class="answer-header saved-brief-header">
      <div>
        <div class="answer-kicker">Saved brief</div>
        <h2>${escapeHtml(note.title)}</h2>
      </div>
      <div class="confidence-box">
        <span>Confidence</span>
        <strong>${meta.confidence || 0}%</strong>
      </div>
      <div class="confidence-box evidence-quality-box ${meta.mismatchCount ? "is-warning" : "is-strong"}">
        <span>Evidence quality</span>
        <strong>${meta.evidenceQuality || 0}%</strong>
      </div>
    </div>
    <div class="answer-body">
      <section class="ticker-focus-card">
        <span>${meta.guarded ? "Guarded saved note" : "Saved note"}</span>
        <strong>${escapeHtml(meta.ticker)} - ${escapeHtml(meta.company)}</strong>
        <p>${escapeHtml(meta.mismatchCount ? "This saved brief was flagged for a citation mismatch." : "This saved brief is stored locally in this browser.")}</p>
      </section>
      <section class="answer-section saved-brief-detail">
        <h3>Brief text</h3>
        <pre>${escapeHtml(note.body)}</pre>
      </section>
    </div>
  `;
  renderEvidence(state.currentCitations);
  renderBriefWorkbench();
  renderInvestmentGate();
  renderMemoReviewRoom();
  renderLaunchControlRoom();
  renderSessionSnapshotBoard();
  els.answerPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deleteSavedBrief(noteId) {
  state.notes = state.notes.filter((note) => note.id !== noteId);
  saveJson(STORAGE_KEYS.notes, state.notes);
  renderNotebook();
}

function hydrateSavedBriefCitations(note) {
  const saved = Array.isArray(note.citations) ? note.citations : [];
  return saved.map((citation, index) => ({
    citationId: citation.citationId || `C${index + 1}`,
    ticker: normalizeTicker(citation.ticker || note.ticker || note.intent || "DESK"),
    company: citation.company || note.company || note.ticker || "Saved brief",
    type: citation.type || "Saved source",
    period: citation.period || "",
    section: citation.section || "Saved evidence",
    text: citation.text || snippet(note.body || "", 260),
    sourceStatus: citation.sourceStatus || "imported",
    score: Number(citation.score || 0)
  }));
}

function exportSavedBriefPdf(noteId) {
  const note = state.notes.find((item) => item.id === noteId);
  if (!note) return;
  const meta = noteMeta(note);
  const citations = hydrateSavedBriefCitations(note);
  const date = new Date().toISOString().slice(0, 10);
  const filename = `majlisalpha-${String(meta.ticker || "desk").toLowerCase()}-saved-brief-${date}.pdf`;
  const pdfBytes = buildNiveshPdfBrief({
    body: note.body,
    meta: {
      ...meta,
      question: note.title,
      ticker: meta.ticker,
      company: meta.company,
      qualityLabel: note.qualityLabel || "",
      citationCount: note.citationCount || citations.length
    },
    citations,
    title: note.title,
    saved: true
  });
  downloadBinaryFile(filename, pdfBytes, "application/pdf");
}

function exportCurrentBrief() {
  if (!state.lastBrief) return;
  const meta = state.lastAnswerMeta || inferBriefMetaFromText(state.lastBrief);
  const gate = makeInvestmentGateAudit();
  const ticker = meta.ticker || state.selectedTicker;
  const date = new Date().toISOString().slice(0, 10);
  const filename = `majlisalpha-${String(ticker || "desk").toLowerCase()}-brief-${date}.md`;
  const evidence = state.currentCitations.length
    ? state.currentCitations.map((citation) => {
        return `### ${citation.citationId} - ${citation.company} ${citation.type} (${citation.period})\n\nSource quality: ${sourceStatusLabel(citation)}\n\n${citation.section}: ${citation.text}`;
      }).join("\n\n")
    : "No evidence stack available. Run an analysis first.";
  const content = [
    "# MajlisAlpha Research Brief",
    "",
    state.lastBrief,
    "",
    "## Investment Readiness Gate",
    "",
    makeInvestmentGateMarkdown(gate),
    "",
    "## Evidence Stack",
    "",
    evidence,
    "",
    "_Synthetic demo corpus for product prototyping. Import source documents before using the workflow for live investment research._"
  ].join("\n");

  downloadTextFile(filename, content, "text/markdown;charset=utf-8");
  flashButtonLabel(els.exportBrief, "Saved");
}

function exportPdfBrief() {
  if (!state.lastBrief) {
    flashButtonLabel(els.exportPdfBrief, "Run first");
    return;
  }
  const meta = state.lastAnswerMeta || inferBriefMetaFromText(state.lastBrief);
  const gate = makeInvestmentGateAudit();
  const ticker = meta.ticker || state.selectedTicker || "desk";
  const date = new Date().toISOString().slice(0, 10);
  const filename = `majlisalpha-${String(ticker || "desk").toLowerCase()}-brief-${date}.pdf`;
  const pdfBytes = buildNiveshPdfBrief({
    body: state.lastBrief,
    meta: {
      ...meta,
      investmentGateStatus: gate.statusLabel,
      investmentGateScore: gate.score,
      exportPosture: gate.exportLabel,
      readinessBlocker: gate.requiredBlockers[0]?.label || ""
    },
    citations: state.currentCitations,
    title: makePdfReportTitle(meta, state.lastBrief)
  });
  downloadBinaryFile(filename, pdfBytes, "application/pdf");
  flashButtonLabel(els.exportPdfBrief, "Saved");
}

function downloadTextFile(filename, content, type = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function downloadBinaryFile(filename, bytes, type = "application/octet-stream") {
  const blob = new Blob([bytes], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function buildNiveshPdfBrief({ body, meta, citations, title, saved = false }) {
  return createNiveshPdf(buildNiveshPdfBlocks({ body, meta, citations, title, saved }));
}

function buildNiveshPdfBlocks({ body, meta, citations, title, saved }) {
  const safeMeta = meta || inferBriefMetaFromText(body);
  const sourceRows = (citations || []).slice(0, 6).map((citation) => ({
    id: citation.citationId || "C",
    source: `${sourceStatusLabel(citation)} | ${citation.company || citation.ticker || "Source"} | ${citation.type || "Evidence"} ${citation.period ? `| ${citation.period}` : ""}`,
    section: citation.section || "Evidence",
    score: Number(citation.score || 0).toFixed(1),
    text: citation.text || ""
  }));
  const blocks = [
    {
      type: "cover",
      eyebrow: saved ? "MajlisAlpha saved memo" : "MajlisAlpha research memo",
      title: title || makePdfReportTitle(safeMeta, body),
      subtitle: "Evidence-backed UAE market research across disclosures, earnings calls, exchange filings, and valuation read-through.",
      generatedAt: new Date().toLocaleString()
    },
    {
      type: "snapshot",
      items: [
        { label: "Focus", value: `${safeMeta.ticker || "Desk"} - ${safeMeta.company || "Research desk"}` },
        { label: "Confidence", value: `${safeMeta.confidence || 0}%` },
        { label: "Evidence", value: `${safeMeta.evidenceQuality || 0}% ${safeMeta.qualityLabel || "quality"}` },
        { label: "Sources", value: `${safeMeta.citationCount || sourceRows.length || 0} citations | ${safeMeta.investmentReadinessLabel || "Prototype evidence only"}` },
        { label: "Gate", value: `${safeMeta.investmentGateStatus || "Not checked"}${safeMeta.investmentGateScore ? ` | ${safeMeta.investmentGateScore}%` : ""}` }
      ]
    },
    { type: "audit", text: makeNiveshPdfAuditLine(safeMeta) },
    { type: "heading", text: "Research brief" }
  ];

  splitPdfBriefBody(body).forEach((paragraph, index) => {
    blocks.push({
      type: index === 0 ? "callout" : "paragraph",
      text: paragraph
    });
  });

  if (sourceRows.length) {
    blocks.push({ type: "heading", text: "Evidence pack" });
    blocks.push({ type: "sourceTable", rows: sourceRows });
  }

  blocks.push({
    type: "footnote",
    text: "MajlisAlpha is research software, not investment advice. Starter SYN sources are demo evidence until replaced with verified company, exchange, or investor-relations documents."
  });
  return blocks;
}

function makePdfReportTitle(meta, body) {
  const firstBriefLine = String(body || "")
    .split(/\n/)
    .map((line) => line.trim())
    .find((line) => line && !/^(Evidence quality|Management tone|Ticker focus):/i.test(line));
  if (meta && meta.question) return meta.question;
  if (meta && meta.ticker && meta.intentLabel) return `${meta.ticker} ${meta.intentLabel}`;
  return firstBriefLine || "MajlisAlpha research brief";
}

function makeNiveshPdfAuditLine(meta) {
  const pieces = [
    `${meta.evidenceQuality || 0}/100 evidence quality`,
    `${meta.confidence || 0}% confidence`,
    meta.guarded ? "single-company guard active" : "multi-company or saved mode",
    meta.investmentReady ? "investment-use ready" : `${meta.realSourceCount || 0}/${meta.requiredSourceCount || REAL_SOURCE_REQUIREMENTS.length} REAL source types`,
    meta.investmentGateStatus ? `gate ${meta.investmentGateStatus}${meta.readinessBlocker ? `, blocker ${meta.readinessBlocker}` : ""}` : "",
    meta.syntheticCount ? `${meta.syntheticCount} SYN citations` : "",
    meta.mismatchCount ? `${meta.mismatchCount} off-ticker citation warning` : ""
  ].filter(Boolean);
  return `Source guard: ${pieces.join(" | ")}.`;
}

function splitPdfBriefBody(body) {
  const text = String(body || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  if (!text) return ["No report text is available. Run an analysis before exporting a PDF."];
  const paragraphs = text.split(/\n{2,}/)
    .map((part) => part.replace(/\n/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .slice(0, 14);
  return paragraphs.length ? paragraphs : [text];
}

function createNiveshPdf(blocks) {
  const pageWidth = 612;
  const pageHeight = 792;
  const margin = 54;
  const bottom = 54;
  const maxWidth = pageWidth - margin * 2;
  const pages = [[]];
  let y = pageHeight - margin;

  const currentPage = () => pages[pages.length - 1];
  const newPage = () => {
    pages.push([]);
    y = pageHeight - margin;
  };
  const ensureSpace = (height) => {
    if (y - height < bottom) newPage();
  };
  const addFillRect = (x, rectY, width, height, color = "0.98 0.99 0.98") => {
    currentPage().push(`q ${color} rg ${x} ${rectY} ${width} ${height} re f Q`);
  };
  const addStrokeRect = (x, rectY, width, height, color = "0.83 0.87 0.84", lineWidth = 0.6) => {
    currentPage().push(`q ${color} RG ${lineWidth} w ${x} ${rectY} ${width} ${height} re S Q`);
  };
  const addTextLine = (text, x, textY, options = {}) => {
    const size = options.size || 10;
    const font = options.font || "F1";
    const color = options.color || "0.06 0.09 0.08";
    currentPage().push(`q ${color} rg BT /${font} ${size} Tf 0 Tw ${x} ${textY} Td (${pdfEscape(text)}) Tj ET Q`);
  };
  const addWrappedAt = (text, x, startY, width, options = {}) => {
    const size = options.size || 10;
    const font = options.font || "F1";
    const leading = options.leading || Math.ceil(size * 1.35);
    const color = options.color || "0.16 0.21 0.19";
    const chars = Math.max(18, Math.floor(width / (size * 0.52)));
    const lines = wrapPdfText(text, chars).slice(0, options.maxLines || 30);
    let localY = startY;
    lines.forEach((line, index) => {
      const justify = Boolean(options.justify && index < lines.length - 1 && line.split(" ").length > 4);
      const wordSpacing = justify ? computePdfWordSpacing(line, size, width) : 0;
      currentPage().push(`q ${color} rg BT /${font} ${size} Tf ${wordSpacing.toFixed(3)} Tw ${x} ${localY} Td (${pdfEscape(line)}) Tj ET Q`);
      localY -= leading;
    });
    return localY;
  };
  const addText = (text, options = {}) => {
    const size = options.size || 10.5;
    const font = options.font || "F1";
    const leading = options.leading || Math.ceil(size * 1.35);
    const indent = options.indent || 0;
    const gapBefore = options.gapBefore || 0;
    const gapAfter = options.gapAfter || 0;
    const chars = Math.max(24, Math.floor((maxWidth - indent) / (size * 0.52)));
    const lines = wrapPdfText(text, chars);
    ensureSpace(gapBefore + lines.length * leading + gapAfter + 4);
    y -= gapBefore;
    lines.forEach((line, lineIndex) => {
      const justify = Boolean(options.justify && lineIndex < lines.length - 1 && line.split(" ").length > 4);
      const wordSpacing = justify ? computePdfWordSpacing(line, size, maxWidth - indent) : 0;
      currentPage().push(`BT /${font} ${size} Tf ${wordSpacing.toFixed(3)} Tw ${margin + indent} ${y} Td (${pdfEscape(line)}) Tj ET`);
      y -= leading;
    });
    y -= gapAfter;
  };
  const addCover = (block) => {
    ensureSpace(112);
    addFillRect(margin, y - 84, maxWidth, 88, "0.91 0.97 0.95");
    addStrokeRect(margin, y - 84, maxWidth, 88, "0.32 0.63 0.55", 0.8);
    addFillRect(margin + 16, y - 50, 34, 34, "0.06 0.09 0.08");
    addTextLine("NS", margin + 23, y - 37, { size: 11, font: "F2", color: "0.95 0.62 0.24" });
    addTextLine(block.eyebrow, margin + 62, y - 18, { size: 9, font: "F2", color: "0.03 0.39 0.34" });
    const afterTitle = addWrappedAt(block.title, margin + 62, y - 36, maxWidth - 84, { size: 18, font: "F2", leading: 21, color: "0.06 0.09 0.08", maxLines: 2 });
    addWrappedAt(block.subtitle, margin + 62, afterTitle - 3, maxWidth - 84, { size: 9.5, leading: 12, color: "0.39 0.45 0.42", maxLines: 2 });
    addTextLine(`Generated ${block.generatedAt}`, pageWidth - margin - 154, y - 70, { size: 8, color: "0.39 0.45 0.42" });
    y -= 104;
  };
  const addSnapshot = (block) => {
    ensureSpace(76);
    const gap = 8;
    const cardWidth = (maxWidth - gap * 3) / 4;
    const cardHeight = 56;
    block.items.forEach((item, index) => {
      const x = margin + index * (cardWidth + gap);
      addFillRect(x, y - cardHeight, cardWidth, cardHeight, "0.98 0.99 0.98");
      addStrokeRect(x, y - cardHeight, cardWidth, cardHeight, "0.83 0.87 0.84", 0.6);
      addTextLine(item.label, x + 9, y - 16, { size: 7.5, font: "F2", color: "0.39 0.45 0.42" });
      addWrappedAt(item.value, x + 9, y - 31, cardWidth - 18, { size: 10.5, font: "F2", leading: 12, maxLines: 2, color: "0.06 0.09 0.08" });
    });
    y -= cardHeight + 12;
  };
  const addAuditBand = (text) => {
    ensureSpace(38);
    addFillRect(margin, y - 28, maxWidth, 30, "0.89 0.96 0.94");
    addStrokeRect(margin, y - 28, maxWidth, 30, "0.49 0.74 0.67", 0.6);
    addTextLine("SOURCE GUARD", margin + 10, y - 11, { size: 7.5, font: "F2", color: "0.03 0.39 0.34" });
    addWrappedAt(text.replace(/^Source guard:\s*/i, ""), margin + 92, y - 11, maxWidth - 104, { size: 9, font: "F2", leading: 11, maxLines: 2, color: "0.06 0.09 0.08" });
    y -= 42;
  };
  const addCallout = (text) => {
    const size = 10.25;
    const chars = Math.max(24, Math.floor((maxWidth - 24) / (size * 0.52)));
    const lines = wrapPdfText(text, chars);
    const height = Math.max(48, 22 + lines.length * 14);
    ensureSpace(height + 4);
    addFillRect(margin, y - height, maxWidth, height, "0.98 0.99 0.98");
    addStrokeRect(margin, y - height, maxWidth, height, "0.83 0.87 0.84", 0.6);
    addWrappedAt(text, margin + 12, y - 18, maxWidth - 24, { size, leading: 14, justify: true, maxLines: 16 });
    y -= height + 6;
  };
  const addSourceTable = (block) => {
    if (!block.rows.length) return;
    const rows = block.rows.slice(0, 6);
    const gap = 8;
    const cardWidth = (maxWidth - gap) / 2;
    const cardHeight = 62;
    const rowCount = Math.ceil(rows.length / 2);
    ensureSpace(30 + rowCount * cardHeight + Math.max(0, rowCount - 1) * gap + 8);
    addFillRect(margin, y - 22, maxWidth, 22, "0.06 0.09 0.08");
    addTextLine("SOURCE STACK", margin + 9, y - 14, { size: 7.5, font: "F2", color: "1 1 1" });
    addTextLine(`${rows.length} passages`, pageWidth - margin - 82, y - 14, { size: 7.2, font: "F2", color: "1 1 1" });
    y -= 30;
    rows.forEach((row, index) => {
      const column = index % 2;
      const rowIndex = Math.floor(index / 2);
      const x = margin + column * (cardWidth + gap);
      const top = y - rowIndex * (cardHeight + gap);
      addFillRect(x, top - cardHeight, cardWidth, cardHeight, "1 1 1");
      addStrokeRect(x, top - cardHeight, cardWidth, cardHeight, "0.83 0.87 0.84", 0.45);
      addFillRect(x + 8, top - 22, 26, 15, "0.89 0.96 0.94");
      addTextLine(row.id, x + 14, top - 17, { size: 7.5, font: "F2", color: "0.03 0.39 0.34" });
      addWrappedAt(`${row.score} | ${snippet(row.source, 38)}`, x + 42, top - 14, cardWidth - 52, { size: 7.4, font: "F2", leading: 9, maxLines: 1 });
      addWrappedAt(snippet(row.section, 58), x + 9, top - 34, cardWidth - 18, { size: 7.8, leading: 9, maxLines: 1, color: "0.16 0.21 0.19" });
      addWrappedAt(snippet(row.text, 112), x + 9, top - 48, cardWidth - 18, { size: 7.1, leading: 8.3, maxLines: 1, color: "0.39 0.45 0.42" });
    });
    y -= rowCount * cardHeight + Math.max(0, rowCount - 1) * gap + 8;
  };

  blocks.forEach((block, index) => {
    if (block.type === "cover") addCover(block);
    else if (block.type === "snapshot") addSnapshot(block);
    else if (block.type === "audit") addAuditBand(block.text);
    else if (block.type === "callout") addCallout(block.text);
    else if (block.type === "sourceTable") addSourceTable(block);
    else if (block.type === "heading") {
      addText(block.text, { size: 13, font: "F2", leading: 16, gapBefore: index ? 9 : 0, gapAfter: 2 });
      currentPage().push(`0.83 0.87 0.84 RG 0.5 w ${margin} ${y + 4} m ${pageWidth - margin} ${y + 4} l S`);
    } else if (block.type === "footnote") addText(block.text, { size: 8.1, font: "F1", leading: 10, gapBefore: 6, justify: true });
    else addText(block.text, { size: 10.25, font: "F1", leading: 14, gapAfter: 4, justify: true });
  });

  decorateNiveshPdfPages(pages, pageWidth, pageHeight, margin);
  return encodePdf(pages, pageWidth, pageHeight);
}

function decorateNiveshPdfPages(pages, pageWidth, pageHeight, margin) {
  pages.forEach((commands, index) => {
    commands.unshift(
      `0.03 0.39 0.34 RG 0.8 w ${margin} ${pageHeight - 36} m ${pageWidth - margin} ${pageHeight - 36} l S`,
      `BT /F2 8 Tf 0 Tw ${margin} ${pageHeight - 27} Td (MajlisAlpha Research Memo) Tj ET`
    );
    commands.push(
      `0.83 0.87 0.84 RG 0.5 w ${margin} 36 m ${pageWidth - margin} 36 l S`,
      `BT /F1 8 Tf 0 Tw ${margin} 24 Td (Research software - not investment advice) Tj ET`,
      `BT /F1 8 Tf 0 Tw ${pageWidth - margin - 42} 24 Td (Page ${index + 1}/${pages.length}) Tj ET`
    );
  });
}

function encodePdf(pages, pageWidth, pageHeight) {
  const objects = [];
  const pageObjectNumbers = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  pages.forEach((commands) => {
    const pageNumber = objects.length + 1;
    const contentNumber = pageNumber + 1;
    pageObjectNumbers.push(pageNumber);
    const content = commands.join("\n");
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentNumber} 0 R >>`);
    objects.push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
  });

  objects[1] = `<< /Type /Pages /Kids [${pageObjectNumbers.map((number) => `${number} 0 R`).join(" ")}] /Count ${pageObjectNumbers.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let index = 0; index < pdf.length; index += 1) {
    bytes[index] = pdf.charCodeAt(index);
  }
  return bytes;
}

function wrapPdfText(text, maxChars) {
  const words = pdfPlainText(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    if (word.length > maxChars) {
      if (line) {
        lines.push(line);
        line = "";
      }
      for (let index = 0; index < word.length; index += maxChars) {
        lines.push(word.slice(index, index + maxChars));
      }
      return;
    }
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function computePdfWordSpacing(line, size, width) {
  const spaces = (line.match(/ /g) || []).length;
  if (!spaces) return 0;
  const estimatedWidth = estimatePdfTextWidth(line, size);
  const extra = width - estimatedWidth;
  if (extra <= 0 || extra > 48) return 0;
  return Math.min(5.5, extra / spaces);
}

function estimatePdfTextWidth(text, size) {
  return pdfPlainText(text).split("").reduce((sum, char) => {
    if (char === " ") return sum + size * 0.27;
    if (/[il.,:;|'`]/.test(char)) return sum + size * 0.23;
    if (/[mwMW]/.test(char)) return sum + size * 0.78;
    if (/[A-Z]/.test(char)) return sum + size * 0.58;
    if (/[0-9$%]/.test(char)) return sum + size * 0.52;
    return sum + size * 0.48;
  }, 0);
}

function pdfPlainText(value) {
  return String(value || "")
    .replace(/[\u2010-\u2015]/g, "-")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pdfEscape(value) {
  return pdfPlainText(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function flashButtonLabel(button, label) {
  if (!button) return;
  const original = button.textContent;
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = original;
  }, 1200);
}

async function submitWaitlistLead() {
  const email = els.waitlistEmail.value.trim();
  if (!email) {
    els.waitlistEmail.focus();
    return;
  }
  const lead = {
    id: `lead-${Date.now()}`,
    email,
    profile: els.waitlistProfile.value,
    plan: els.waitlistPlan.value,
    need: els.waitlistNeed.value,
    tickers: els.waitlistTickers.value.trim(),
    question: els.waitlistQuestion.value.trim(),
    date: new Date().toISOString()
  };
  state.waitlistLeads = [lead, ...state.waitlistLeads].slice(0, 50);
  saveJson(STORAGE_KEYS.waitlist, state.waitlistLeads);

  const summary = [
    "MajlisAlpha waitlist lead",
    `Email: ${lead.email}`,
    `Profile: ${lead.profile}`,
    `Plan: ${lead.plan}`,
    `Need: ${lead.need}`,
    `Tickers: ${lead.tickers || "Not provided"}`,
    `Question: ${lead.question || "Not provided"}`,
    `Date: ${new Date(lead.date).toLocaleString()}`
  ].join("\n");

  els.waitlistResult.classList.remove("is-success");
  els.waitlistResult.textContent = "Joining the pilot list...";

  try {
    const payload = {
      name: "MajlisAlpha waitlist",
      email: lead.email,
      _replyto: lead.email,
      profile: lead.profile,
      plan: lead.plan,
      need: lead.need,
      tickers: lead.tickers || "Not provided",
      question: lead.question || "Not provided",
      source: window.location.href,
      _subject: "New MajlisAlpha waitlist lead",
      _template: "table",
      _captcha: "false"
    };
    const response = await fetch(WAITLIST_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      throw new Error(`Waitlist endpoint returned ${response.status}`);
    }
    els.waitlistResult.classList.add("is-success");
    els.waitlistResult.textContent = "You are on the MajlisAlpha pilot list. Check your inbox if this is the first activation email.";
    els.waitlistEmail.value = "";
    els.waitlistTickers.value = "";
    els.waitlistQuestion.value = "";
  } catch (error) {
    copyLeadSummary(summary);
    els.waitlistResult.textContent = `Saved locally and copied for follow-up. If this is the first live submission, confirm the FormSubmit activation email and submit once more.`;
  }
}

function copyLeadSummary(summary) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(summary).catch(() => fallbackCopy(summary));
  } else {
    fallbackCopy(summary);
  }
}

async function processFiles(files) {
  if (!files.length) return;
  const fallbackTicker = normalizeTicker(els.pasteTicker.value || els.importTickerSelect.value || state.selectedTicker);
  const fallbackType = els.pasteType.value || "Research note";
  const fileList = Array.from(files);
  const totalBytes = fileList.reduce((sum, file) => sum + Number(file.size || 0), 0);
  if (totalBytes > MAX_IMPORT_TOTAL_BYTES) {
    state.importReport = makeImportReport([], [{
      name: "Upload batch",
      reason: `Total upload size exceeds ${formatBytes(MAX_IMPORT_TOTAL_BYTES)}`
    }]);
    renderImportSummary();
    return;
  }
  const oversized = fileList
    .filter((file) => Number(file.size || 0) > MAX_IMPORT_FILE_BYTES)
    .map((file) => ({
      name: file.name,
      reason: `File exceeds ${formatBytes(MAX_IMPORT_FILE_BYTES)} limit`
    }));
  const eligibleFiles = fileList.filter((file) => Number(file.size || 0) <= MAX_IMPORT_FILE_BYTES);
  const results = await Promise.all(eligibleFiles.map((file) => readUploadedFile(file, fallbackTicker, fallbackType)));
  const docs = results.filter((result) => result.doc).map((result) => result.doc);
  const skipped = [
    ...oversized,
    ...results.filter((result) => result.error).map((result) => result.error)
  ];
  const added = addUploadedDocs(docs);
  state.importReport = makeImportReport(added, skipped);
  renderImportSummary();
}

function readUploadedFile(file, fallbackTicker = "CUSTOM", fallbackType = "Research note") {
  if (Number(file.size || 0) > MAX_IMPORT_FILE_BYTES) {
    return Promise.resolve({
      error: { name: file.name, reason: `File exceeds ${formatBytes(MAX_IMPORT_FILE_BYTES)} limit` }
    });
  }
  if (!isSupportedImport(file.name)) {
    return Promise.resolve({
      error: { name: file.name, reason: "Unsupported file type" }
    });
  }
  return /\.pdf$/i.test(file.name) ? readPdfFile(file, fallbackTicker, fallbackType) : readTextFile(file, fallbackTicker, fallbackType);
}

function readTextFile(file, fallbackTicker, fallbackType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || "").slice(0, MAX_SOURCE_TEXT_CHARS);
      if (text.replace(/\s+/g, "").length < 80) {
        resolve({ error: { name: file.name, reason: "No readable text found" } });
        return;
      }
      resolve({
        doc: makeUploadedDoc({
          ticker: inferTickerFromName(file.name) || fallbackTicker || "CUSTOM",
          title: file.name.replace(/\.[^.]+$/, ""),
          type: inferTypeFromName(file.name) || fallbackType,
          text
        })
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function readPdfFile(file, fallbackTicker, fallbackType) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = extractPdfText(reader.result).slice(0, MAX_SOURCE_TEXT_CHARS);
      if (text.replace(/\s+/g, "").length < 120) {
        resolve({
          error: {
            name: file.name,
            reason: "PDF text could not be extracted in-browser"
          }
        });
        return;
      }
      resolve({
        doc: makeUploadedDoc({
          ticker: inferTickerFromName(file.name) || fallbackTicker || "CUSTOM",
          title: file.name.replace(/\.[^.]+$/, ""),
          type: inferTypeFromName(file.name) || fallbackType,
          text
        })
      });
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
}

function isSupportedImport(name) {
  return /\.(txt|md|csv|html|json|pdf)$/i.test(name);
}

function formatBytes(bytes) {
  const value = Number(bytes || 0);
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1).replace(/\.0$/, "")} MB`;
  if (value >= 1024) return `${(value / 1024).toFixed(1).replace(/\.0$/, "")} KB`;
  return `${value} bytes`;
}

function makeUploadedDoc({ ticker, title, type, text }) {
  const safeTicker = normalizeTicker(ticker);
  const cleanTitle = String(title || "Imported document").trim().slice(0, 90);
  const cleanText = String(text || "")
    .slice(0, MAX_SOURCE_TEXT_CHARS)
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return {
    id: `upload-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ticker: safeTicker,
    company: inferCompanyName(safeTicker, cleanTitle, cleanText),
    type: String(type || "Research note"),
    period: cleanTitle,
    date: new Date().toISOString().slice(0, 10),
    sourceStatus: "imported",
    sourceLabel: "Imported by user",
    sourceUrl: "",
    sections: splitImportedText(cleanText)
  };
}

function addUploadedDocs(docs) {
  const filtered = docs.filter((doc) => doc.sections.some((section) => section.text.length > 30));
  if (!filtered.length) return [];
  state.uploadedDocs = [...filtered, ...state.uploadedDocs].slice(0, 18);
  rebuildDocumentCorpus();
  filtered.forEach((doc) => {
    state.enabledDocIds.add(doc.id);
    state.activeTickers.add(doc.ticker);
    updateProgressFromSourceDoc(doc);
  });
  if (!state.selectedTicker || state.selectedTicker === "FAB" && filtered[0].ticker !== "FAB") {
    state.selectedTicker = filtered[0].ticker;
  }
  saveJson(STORAGE_KEYS.uploads, state.uploadedDocs);
  renderCoverage();
  renderLibrary();
  renderImportTickerOptions();
  renderRealSourceStarterPack();
  renderContextBand();
  renderValuationOptions();
  renderCompanyDossier();
  updateValuationFromCompany();
  updateValuation();
  drawSignalMap();
  return filtered;
}

function splitImportedText(text) {
  if (!text) return [];
  const headingSections = sectionizeImportedText(text);
  if (headingSections.length > 1) {
    return headingSections.flatMap((section, sectionIndex) => {
      return splitIntoChunks(section.text, 950).map((chunk, chunkIndex) => ({
        title: chunkIndex ? `${section.title} ${chunkIndex + 1}` : section.title,
        text: chunk
      }));
    });
  }
  const normalized = text.replace(/\n+/g, " ");
  const sentences = normalized.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [normalized];
  const sections = [];
  let buffer = [];
  let index = 1;
  for (const sentence of sentences) {
    buffer.push(sentence.trim());
    if (buffer.join(" ").length > 850) {
      sections.push({ title: `Imported section ${index}`, text: buffer.join(" ") });
      buffer = [];
      index += 1;
    }
  }
  if (buffer.length) sections.push({ title: `Imported section ${index}`, text: buffer.join(" ") });
  return sections;
}

function sectionizeImportedText(text) {
  const lines = String(text || "")
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length < 8) return [];

  const sections = [];
  let current = { title: "Imported overview", text: "" };
  const headingPattern = /^(business overview|management discussion|management discussion and analysis|financial results|results review|risk factors?|liquidity|capital resources|ownership|anchor shareholder|ownership change|outlook|prepared remarks|analyst q&a|questions? and answers?|segment|valuation|cash flow|debt|notes to accounts)\b/i;

  for (const line of lines) {
    const isShortHeading = line.length <= 72 && (
      headingPattern.test(line) ||
      (/^[A-Z0-9 &/,-]{8,72}$/.test(line) && !/\d{4,}/.test(line))
    );
    if (isShortHeading && current.text.length > 180) {
      sections.push({ title: current.title, text: current.text.trim() });
      current = { title: titleCase(line), text: "" };
    } else if (isShortHeading && current.title === "Imported overview" && current.text.length < 40) {
      current.title = titleCase(line);
    } else {
      current.text = `${current.text} ${line}`.trim();
    }
  }
  if (current.text.length > 80) sections.push({ title: current.title, text: current.text.trim() });
  return sections;
}

function makeImportReport(addedDocs = [], skipped = []) {
  const sections = addedDocs.reduce((sum, doc) => sum + doc.sections.length, 0);
  const metrics = addedDocs.reduce((sum, doc) => {
    return sum + extractMetrics(doc.sections.map((section) => section.text).join(" ")).length;
  }, 0);
  const tickers = Array.from(new Set(addedDocs.map((doc) => doc.ticker)));
  return {
    added: addedDocs,
    skipped,
    sections: String(sections),
    metrics: String(metrics),
    tickers
  };
}

function extractPdfText(buffer) {
  const bytes = new Uint8Array(buffer || []);
  if (!bytes.length) return "";
  const decoder = new TextDecoder("latin1");
  const raw = decoder.decode(bytes);
  const literalMatches = raw.match(/\((?:\\.|[^\\)]){3,}\)/g) || [];
  const literalText = literalMatches
    .map((item) => decodePdfLiteral(item.slice(1, -1)))
    .join(" ");
  const fallbackText = raw
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, " ")
    .replace(/\b(obj|endobj|stream|endstream|xref|trailer|startxref|Length|Filter|FlateDecode)\b/g, " ");
  const best = literalText.replace(/\s+/g, " ").trim().length > 200 ? literalText : fallbackText;
  return best
    .replace(/\\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodePdfLiteral(value) {
  return String(value || "")
    .replace(/\\n/g, " ")
    .replace(/\\r/g, " ")
    .replace(/\\t/g, " ")
    .replace(/\\\(/g, "(")
    .replace(/\\\)/g, ")")
    .replace(/\\\\/g, "\\");
}

function splitIntoChunks(text, targetLength) {
  if (text.length <= targetLength) return [text];
  const sentences = text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text];
  const chunks = [];
  let buffer = "";
  for (const sentence of sentences) {
    if ((buffer + " " + sentence).trim().length > targetLength && buffer) {
      chunks.push(buffer.trim());
      buffer = sentence;
    } else {
      buffer = `${buffer} ${sentence}`.trim();
    }
  }
  if (buffer) chunks.push(buffer.trim());
  return chunks;
}

function inferTickerFromName(name) {
  const upperName = String(name || "").toUpperCase();
  const knownMatch = getCompanies().find((company) => {
    const nameParts = company.name.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().split(/\s+/).filter((part) => part.length > 2);
    const nameScore = nameParts.filter((part) => upperName.includes(part)).length;
    return upperName.includes(company.ticker) || nameScore >= Math.min(2, nameParts.length);
  });
  if (knownMatch) return knownMatch.ticker;

  const ignored = new Set([
    "ANNUAL",
    "REPORT",
    "RESULTS",
    "QUARTERLY",
    "EARNINGS",
    "TRANSCRIPT",
    "INVESTOR",
    "PRESENTATION",
    "OWNERSHIP",
    "PATTERN",
    "EXCHANGE",
    "DISCLOSURE",
    "LIMITED",
    "UAE"
  ]);
  const tokens = String(name).toUpperCase().match(/\b[A-Z][A-Z0-9.]{1,11}\b/g) || [];
  return tokens.find((token) => !ignored.has(token) && !/^FY\d/i.test(token) && !/^Q[1-4]$/i.test(token)) || "";
}

function inferCompanyName(ticker, title, text) {
  const known = SAMPLE_COMPANIES.find((company) => company.ticker === ticker);
  if (known) return known.name;
  const firstLine = String(text || "").split(/\n/).map((line) => line.trim()).find((line) => line.length > 8 && line.length < 90);
  const fromTitle = String(title || "")
    .replace(/\.[^.]+$/, "")
    .replace(new RegExp(`\\b${ticker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i"), "")
    .replace(/\b(annual|report|earnings call|transcript|quarterly|results|ownership|pattern|exchange|announcement|fy\d{2,4}|q[1-4])\b/gi, "")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const label = fromTitle || firstLine || "imported corpus";
  return `${ticker} ${label}`.trim().slice(0, 72);
}

function inferTypeFromName(name) {
  const lower = String(name).toLowerCase();
  if (lower.includes("annual") || lower.includes("ar-") || lower.includes("10-k") || lower.includes("10k")) return "Annual report";
  if (lower.includes("quarter") || lower.includes("results") || lower.includes("10-q") || lower.includes("10q")) return "Quarterly results";
  if (lower.includes("earnings call") || lower.includes("call") || lower.includes("transcript")) return "Earnings call transcript";
  if (lower.includes("ownership") || lower.includes("ownership change") || lower.includes("anchor shareholder")) return "Ownership disclosure";
  if (lower.includes("exchange") || lower.includes("announcement")) return "Exchange disclosure";
  if (lower.includes("model")) return "Valuation model";
  return "";
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
    .replace(/\bQ&a\b/g, "Q&A")
    .replace(/\bMd&a\b/g, "MD&A");
}

function normalizeTicker(value) {
  const ticker = String(value || "CUSTOM").toUpperCase().replace(/[^A-Z0-9.]/g, "").slice(0, 12);
  return ticker || "CUSTOM";
}

function estimateRevenue(doc) {
  const text = doc.sections.map((section) => section.text).join(" ");
  const millionMatch = text.match(/rs\.?\s*([\d,.]+)\s*(lakh\s*million|million|m)\b/i);
  if (millionMatch) {
    const amount = Number(millionMatch[1].replace(/,/g, ""));
    return /lakh/i.test(millionMatch[2]) ? amount * 100000 : amount;
  }
  const billionMatch = text.match(/\$?(\d+(?:\.\d+)?)\s*(billion|bn|b)\b/i);
  return billionMatch ? Number(billionMatch[1]) * 8300 : 20000;
}

function extractMetrics(text) {
  const matches = text.match(/(?:rs\.?\s*)?\d[\d,.]*(?:\.\d+)?\s?(?:lakh million|million|m|billion|million|bn|m|x|%|bps|basis points)|\d+(?:\.\d+)?\s?basis points/gi) || [];
  return Array.from(new Set(matches.map((item) => item.replace(/\s+/g, " ").trim()))).slice(0, 8);
}

function toneScore(text) {
  const lower = text.toLowerCase();
  const positive = POSITIVE_TERMS.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
  const negative = NEGATIVE_TERMS.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
  return positive - negative;
}

function toneRelevance(question, text) {
  const lowerQuestion = question.toLowerCase();
  const score = toneScore(text);
  if (/risk|pressure|headwind|weaken|negative|concern/.test(lowerQuestion)) return Math.max(-score, score * 0.3);
  if (/confidence|tone|management/.test(lowerQuestion)) return Math.abs(score);
  return score;
}

function negativeTermCount(text) {
  const lower = text.toLowerCase();
  return NEGATIVE_TERMS.reduce((sum, term) => sum + (lower.includes(term) ? 1 : 0), 0);
}

function toneClass(score) {
  if (score >= 1.1) return "positive";
  if (score <= -1.1) return "negative";
  return "mixed";
}

function toneLabel(score) {
  const cls = toneClass(score);
  if (cls === "positive") return "Positive";
  if (cls === "negative") return "Cautious";
  return "Mixed";
}

function shortDocType(type) {
  if (/annual|10-k/i.test(type)) return "AR";
  if (/quarter|10-q/i.test(type)) return "QR";
  if (/earnings call|call/i.test(type)) return "Earnings call";
  if (/exchange|announcement/i.test(type)) return "ADX/DFM";
  if (/ownership|ownership change/i.test(type)) return "SHP";
  if (/model/i.test(type)) return "Model";
  return "Note";
}

function terminalFcfSensitivity(company, marginPoints) {
  const revenue = company.revenue * Math.pow(1 + company.growth / 100, 5);
  return revenue * (marginPoints / 100);
}

function formatMoney(value) {
  const absolute = Math.abs(Number(value) || 0);
  return `AED ${new Intl.NumberFormat("en-AE", { maximumFractionDigits: 0 }).format(absolute)} m`;
}

function snippet(text, maxLength) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= maxLength) return clean;
  return `${clean.slice(0, maxLength - 1).trim()}...`;
}

function stripHtml(html) {
  const div = document.createElement("div");
  div.innerHTML = html;
  return div.textContent || div.innerText || "";
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/`/g, "&#096;");
}

function csvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

function loadJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    return fallback;
  }
}

function saveJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    // Local storage can be blocked under some browser privacy settings.
  }
}






