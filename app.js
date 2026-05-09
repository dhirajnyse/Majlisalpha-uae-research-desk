"use strict";

const STORAGE_KEYS = {
  uploads: "majlisalpha-uae-uploads-v1",
  notes: "majlisalpha-uae-notes-v1",
  waitlist: "majlisalpha-uae-waitlist-v1",
  valuationCases: "majlisalpha-uae-valuation-cases-v1",
  sourcePack: "majlisalpha-uae-source-pack-v1",
  sourceProgress: "majlisalpha-uae-source-progress-v1",
  memoReviews: "majlisalpha-uae-memo-reviews-v1",
  decisionJournal: "majlisalpha-uae-decision-journal-v1"
};

const WAITLIST_ENDPOINT = "https://formsubmit.co/ajax/dhirajnyse@gmail.com";
const DATA_VERSION = "20260509-uae-03";
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
    ? "MajlisAlpha v5 loads its data from JSON files. Open it through GitHub Pages or a local web server so the browser can fetch the data folder."
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
  flashMemoReviewResult("Review log cleared.", "neutral");
}

function deleteMemoReview(reviewId) {
  state.memoReviews = state.memoReviews.filter((review) => review.id !== reviewId);
  saveJson(STORAGE_KEYS.memoReviews, state.memoReviews);
  renderMemoReviewRoom();
  renderInvestmentGate();
  renderLaunchControlRoom();
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
    releaseLabel: "v28 Launch Control Room",
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
    "After uploading the ZIP contents to GitHub, confirm the top status pill says UAE readiness gate v1.",
    "Run a question and confirm the Investment Readiness Gate shows demo, review, or committee export posture.",
    "Run one FAB risk question and confirm the Brief Workbench updates.",
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
  const filename = `majlisalpha-launch-audit-v28-${date}.json`;
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
    "# MajlisAlpha v28 Upload Checklist",
    "",
    `Status: ${audit.statusLabel} (${audit.score}%)`,
    `Generated: ${new Date().toLocaleString()}`,
    "",
    "## Before Upload",
    "",
    "- Upload the contents of the v28 ZIP to the GitHub repository root.",
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
