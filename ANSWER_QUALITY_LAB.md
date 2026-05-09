{
  "version": "20260509-uae-20",
  "name": "MajlisAlpha UAE Source Refresh Scheduler",
  "purpose": "Keep official UAE source evidence fresh by assigning cadence, owner, freshness window, escalation route, and completion criteria for each source route.",
  "freshnessPolicy": "No answer should claim current evidence when the underlying source is stale, unreviewed, or past its refresh window.",
  "sourceCadences": [
    {
      "route": "ADX disclosures",
      "cadence": "daily",
      "freshnessWindowHours": 24,
      "owner": "source analyst",
      "watchFor": ["results", "board decisions", "dividends", "trading status", "corporate actions"],
      "escalateTo": ["Disclosure Alert Watchtower", "Analyst Mission Control"]
    },
    {
      "route": "DFM disclosures",
      "cadence": "daily",
      "freshnessWindowHours": 24,
      "owner": "source analyst",
      "watchFor": ["financial results", "shareholder meetings", "cash dividends", "material disclosures", "suspensions"],
      "escalateTo": ["Disclosure Alert Watchtower", "Analyst Mission Control"]
    },
    {
      "route": "Nasdaq Dubai CANDI",
      "cadence": "daily",
      "freshnessWindowHours": 24,
      "owner": "source analyst",
      "watchFor": ["issuer announcements", "sukuk and bond updates", "equity notices", "corporate action notices"],
      "escalateTo": ["Disclosure Alert Watchtower", "Compliance Audit Center"]
    },
    {
      "route": "SCA public notices",
      "cadence": "weekly",
      "freshnessWindowHours": 168,
      "owner": "compliance reviewer",
      "watchFor": ["regulatory notices", "market guidance", "public warnings", "issuer obligations"],
      "escalateTo": ["Compliance Audit Center", "Analyst Mission Control"]
    },
    {
      "route": "issuer investor relations",
      "cadence": "weekly",
      "freshnessWindowHours": 168,
      "owner": "coverage owner",
      "watchFor": ["annual reports", "quarterly presentations", "earnings calls", "ownership updates", "sustainability reports"],
      "escalateTo": ["Source Intake Doctor", "Answer Quality Lab"]
    },
    {
      "route": "priority source packs",
      "cadence": "monthly",
      "freshnessWindowHours": 720,
      "owner": "desk operator",
      "watchFor": ["missing official URLs", "stale citation snippets", "synthetic records awaiting REAL replacement", "pilot-demanded tickers"],
      "escalateTo": ["Analyst Mission Control", "Pilot KPI Board"]
    }
  ],
  "refreshStatuses": ["due", "fresh", "stale", "blocked", "escalated", "reviewed"],
  "requiredRefreshFields": [
    "sourceRoute",
    "officialUrl",
    "issuer",
    "ticker",
    "documentType",
    "lastCheckedAt",
    "freshnessStatus",
    "owner",
    "reviewerStatus",
    "affectedAnswers",
    "nextAction"
  ],
  "escalationRules": [
    {
      "condition": "daily route is older than 24 hours",
      "action": "mark stale, create Disclosure Alert Watchtower item, and block current-event wording until refreshed"
    },
    {
      "condition": "issuer IR route is older than 7 days for a pilot ticker",
      "action": "assign coverage owner and flag affected answers in Answer Quality Lab"
    },
    {
      "condition": "official URL is missing or unreachable",
      "action": "route to Source Intake Doctor and keep sourceStatus synthetic or needs-review"
    },
    {
      "condition": "source refresh changes a material claim",
      "action": "open Claim Trace Inspector review before export"
    },
    {
      "condition": "stale source blocks customer-facing export",
      "action": "escalate to Compliance Audit Center and mark export not share-ready"
    }
  ],
  "launchGate": {
    "readyRule": "Source Refresh Scheduler is pilot-ready when priority routes have owners, freshness windows, last-checked timestamps, official URLs, and escalation paths.",
    "blockedRule": "If a route is stale, blocked, or unreviewed, MajlisAlpha should not present the affected claim as current evidence."
  }
}
