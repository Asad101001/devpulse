<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:FF6B00,100:FFD600&height=12&section=header" width="100%"/>

</div>

```
██████╗ ███████╗██╗   ██╗██████╗ ██╗   ██╗██╗     ███████╗███████╗
██╔══██╗██╔════╝██║   ██║██╔══██╗██║   ██║██║     ██╔════╝██╔════╝
██║  ██║█████╗  ██║   ██║██████╔╝██║   ██║██║     ███████╗█████╗
██║  ██║██╔══╝  ╚██╗ ██╔╝██╔═══╝ ██║   ██║██║     ╚════██║██╔══╝
██████╔╝███████╗ ╚████╔╝ ██║     ╚██████╔╝███████╗███████║███████╗
╚═════╝ ╚══════╝  ╚═══╝  ╚═╝      ╚═════╝ ╚══════╝╚══════╝╚══════╝
```

<div align="center">

<img src="https://img.shields.io/badge/STATUS-OPERATIONAL-FF6B00?style=for-the-badge&labelColor=000000"/>
<img src="https://img.shields.io/badge/GROQ-llama--3.1--8b-FFD600?style=for-the-badge&labelColor=000000"/>
<img src="https://img.shields.io/badge/SIGNAL-ACTIVE-FF6B00?style=for-the-badge&labelColor=000000"/>

<br/><br/>

> *AI-driven wellness and productivity analytics for engineers.*
> *Ingest your GitHub commits. Detect burnout before it detects you.*

<br/>

[![Live App](https://img.shields.io/badge/LAUNCH_DEVPULSE-devpulse--app.onrender.com-FF6B00?style=for-the-badge&logo=render&logoColor=white&labelColor=000)](https://devpulse-app.onrender.com)
&nbsp;
[![License](https://img.shields.io/badge/LICENSE-MIT-444444?style=for-the-badge&labelColor=000)](LICENSE)
&nbsp;
[![Node](https://img.shields.io/badge/NODE-20+-339933?style=for-the-badge&logo=node.js&logoColor=white&labelColor=000)](https://nodejs.org)

</div>

<div align="center">
<img src="https://capsule-render.vercel.app/api?type=rect&color=0:FF6B00,100:FFD600&height=6" width="100%"/>
</div>

---

## `// SYSTEM_BRIEFING`

**DevPulse** connects to your GitHub account and runs every commit message through a **Groq-powered AI sentiment engine** — analyzing tone, cognitive load, burnout risk, and emotional resonance across your entire commit history. The result is a brutalistically-designed dashboard that tells you, with cold industrial precision, exactly how cooked you are.

No vague wellness scores. No friendly suggestions. Just raw signal telemetry about your engineering output — presented like a terminal that has seen too much.

---

## `// SIGNAL_MATRIX`

<table>
<tr>
<td width="50%">

**📊 OPERATIONAL FEED**
- Flow Sentiment score (0–100%)
- Burnout Risk index (0–100%)
- Cognitive Load (additions + deletions normalized)
- Signal Stability (100 − sentimentStdDev)
- Linguistic Precision (avg words per commit)
- Top Mood tag across recent signals
- Executive Directive (AI-generated imperative)

</td>
<td width="50%">

**🏗️ REPOSITORY STATS**
- All synced repos with commit counts
- Language detection per repo
- Public / private signal classification
- Last activity timestamp
- Per-repo cognitive load estimation
- Link to GitHub source

</td>
</tr>
<tr>
<td width="50%">

**📡 SIGNAL INTENSITY MATRIX**
- Day-of-week sentiment bar chart
- Recharts radar (Intensity / Stability / Cognitive / Volume / Precision)
- Recent 5 commits with AI briefing + recommendation
- Operational Health Index progress bars

</td>
<td width="50%">

**🎨 WRAPPED SIGNAL**
- Shareable developer "wrapped" poster
- Brutalist 3:4 canvas design
- Export as PNG (html-to-image)
- Full Intelligence Report export (1200×auto)
- Signal-authenticated report encoding

</td>
</tr>
</table>

---

## `// TECH_STACK`

```
┌────────────────────────────────────────────────────────────────┐
│                   CLIENT  (React 18 + Vite 6)                   │
│                                                                  │
│  Recharts     ──►  BarChart + RadarChart visualizations         │
│  Lucide React ──►  Icon system                                   │
│  Axios        ──►  API client with JWT interceptor              │
│  html-to-image──►  PNG export for wrapped + report              │
│  Tailwind CSS ──►  Brutalist utility styling                     │
│  React Router ──►  SPA routing (Landing / Dashboard / Callback) │
│                                                                  │
└─────────────────────────┬──────────────────────────────────────┘
                          │ REST /api/v1
                          ▼
┌────────────────────────────────────────────────────────────────┐
│                   SERVER  (Express 5 + Node 20)                  │
│                                                                  │
│  Passport.js  ──►  GitHub OAuth2 strategy                        │
│  JWT          ──►  Stateless auth (7-day tokens)                 │
│  Mongoose     ──►  MongoDB ODM (User / Repo / Commit models)     │
│  Octokit      ──►  GitHub API (repos + commits pagination)       │
│  Groq SDK     ──►  llama-3.1-8b-instant (sentiment + directive)  │
│  Anthropic    ──►  Fallback LLM                                  │
│  Helmet       ──►  Security headers + CSP                        │
│  Rate Limiter ──►  100 req/15min per IP                          │
│  Connect-Mongo──►  Session persistence in MongoDB               │
│                                                                  │
└─────────────────────────┬──────────────────────────────────────┘
                          │
                          ▼
              MongoDB Atlas  +  Render.com
```

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + Vite 6 + Tailwind CSS |
| **Backend** | Express 5 + Node.js 20 (ESM) |
| **Database** | MongoDB Atlas + Mongoose 8 |
| **Auth** | GitHub OAuth2 via Passport.js + JWT |
| **AI — Primary** | Groq `llama-3.1-8b-instant` (sentiment + directive) |
| **AI — Fallback** | Anthropic Claude SDK |
| **GitHub API** | Octokit 5 (paginated commits, all repos) |
| **Charts** | Recharts (BarChart + RadarChart) |
| **Export** | `html-to-image` → PNG download / Web Share API |
| **Sessions** | `express-session` + `connect-mongo` |
| **Security** | Helmet 8, express-rate-limit, JWT, CORS whitelist |
| **Deployment** | Render.com (web service) |

---

## `// AI_PIPELINE`

For each commit ingested, DevPulse fires a **Groq inference call** with this system prompt contract:

```
INPUT:  Commit message string
OUTPUT: {
  score:          0–100  (sentiment / productivity tone)
  burnout:        0–100  (intensity vs recovery balance)
  vibe:           string (one word: Focused / Agile / Static / Frustrated...)
  briefing:       string (5-word max summary)
  recommendation: string (15-word max actionable advice)
}
```

A **rate-limit backoff** system retries up to 3× on Groq 429s with exponential delay. Repos are processed in chunks of 3 concurrently to respect GitHub secondary rate limits.

```
Dashboard metrics derived from last 100 signals:

  avgSentiment     = mean(sentimentScore)
  avgBurnout       = mean(burnoutIndex)
  cognitiveLoad    = min(((avgAdditions + avgDeletions) / 10 + filesChanged × 5), 100)
  signalStability  = max(100 − sentimentStdDev, 0)
  linguisticPrec   = totalWords / sampleSize  [words per commit]
  topMood          = mode(moodTag)
```

The **Executive Directive** is a separate LLM call — a ≤20-word industrial command generated from your aggregated stats. Think: HAL 9000 reviewing your sprint.

---

## `// QUICK_START`

### Prerequisites

- Node.js ≥ 20
- MongoDB Atlas URI (free tier works)
- GitHub OAuth App → [github.com/settings/developers](https://github.com/settings/developers)
- Groq API key → [console.groq.com](https://console.groq.com) (free)

### Setup

```bash
# Clone
git clone https://github.com/Asad101001/devpulse.git
cd devpulse

# Install all deps (root + client + server)
npm run install:all

# Configure server
cp .env.example server/.env
# Fill in: MONGO_URI, JWT_SECRET, SESSION_SECRET,
#          GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET,
#          GITHUB_CALLBACK_URL, GROQ_API_KEY, CLIENT_URL

# Configure client
echo "VITE_API_URL=http://localhost:5000" > client/.env

# Run both (concurrent)
npm run dev
```

| Service | URL |
|---------|-----|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:5000` |
| Health check | `http://localhost:5000/api/v1/health` |

---

## `// PROJECT_STRUCTURE`

```
devpulse/
├── client/                    # React 18 + Vite frontend
│   └── src/
│       ├── context/
│       │   └── AuthContext.jsx        # JWT auth + user state
│       ├── pages/
│       │   ├── Landing.jsx            # Brutalist marketing page
│       │   ├── Dashboard.jsx          # Main analytics UI
│       │   └── AuthCallback.jsx       # OAuth token handler
│       └── services/
│           └── api.js                 # Axios + JWT interceptor
│
└── server/                    # Express 5 + Node backend
    ├── config/
    │   └── passport.js                # GitHub OAuth strategy
    ├── middleware/
    │   ├── auth.middleware.js         # JWT protect
    │   └── errorHandler.js            # Global error handler
    ├── models/
    │   ├── User.model.js              # GitHub user + token
    │   ├── Repo.model.js              # Repository metadata
    │   └── Commit.model.js            # Commit + AI analysis
    ├── routes/
    │   ├── auth.routes.js             # /github, /callback, /me, /logout
    │   └── data.routes.js             # /sync, /stats, /reset
    ├── services/
    │   ├── githubService.js           # Octokit sync + pagination
    │   └── aiService.js               # Groq sentiment + directive
    └── utils/
        ├── AppError.js                # Operational error class
        └── catchAsync.js              # Async route wrapper
```

---

## `// DEPLOYMENT`

**Render.com** (one-service full-stack):

```yaml
# render.yaml
buildCommand: npm install && npm run build && npm install --prefix server
startCommand: node server/index.js
```

In production, Express serves the Vite `dist/` as static files. All `/*` routes (except `/api`) return `index.html` for SPA routing.

Required env vars on Render:

```
NODE_ENV=production
PORT=10000
MONGO_URI=
SESSION_SECRET=
JWT_SECRET=
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=https://your-app.onrender.com/api/v1/auth/github/callback
GROQ_API_KEY=
CLIENT_URL=https://your-app.onrender.com
VITE_API_URL=https://your-app.onrender.com
```

---

## `// SECURITY_MATRIX`

| Vector | Mitigation |
|--------|-----------|
| Auth | JWT (7d expiry) + Passport GitHub OAuth2 |
| Sessions | `express-session` + MongoDB store + HttpOnly cookies |
| Headers | Helmet 8 with custom CSP |
| Rate Limiting | 100 req / 15min per IP on all `/api` routes |
| CORS | Whitelist: `CLIENT_URL` + `localhost:5173/3000` only |
| Secrets | `.env` never committed — `.gitignore` enforced |
| Tokens | GitHub access tokens stored encrypted in MongoDB |

---

## `// DATA_MODELS`

```javascript
User     { githubId, username, avatarUrl, email, githubAccessToken, syncStatus, lastSyncedAt }
Repo     { userId, githubRepoId, name, fullName, language, isPrivate, lastCommitAt }
Commit   { userId, repoId, sha, message, timestamp, additions, deletions, filesChanged,
           isAfterHours, sentimentScore, burnoutIndex, moodTag, aiSummary, aiRecommendation }
```

The `/data/reset` endpoint wipes all `Commit` and `Repo` documents for the user and resets sync state — a factory purge, no cascade effects on other users.

---

<div align="center">

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:FF6B00,100:FFD600&height=6" width="100%"/>

<br/>

**ENGINEERED FOR INTENSITY. ZERO FLUFF.**

`© 2026 DevPulse // OPERATIONAL_SIGNAL_ENCODING: ACTIVE`

[![Render](https://img.shields.io/badge/DEPLOYED_ON-RENDER-46E3B7?style=flat-square&logo=render&logoColor=white&labelColor=000)](https://render.com)
&nbsp;
[![Groq](https://img.shields.io/badge/AI-GROQ_LLAMA_3.1-F55036?style=flat-square&labelColor=000)](https://groq.com)
&nbsp;
[![MongoDB](https://img.shields.io/badge/DB-MONGODB_ATLAS-47A248?style=flat-square&logo=mongodb&logoColor=white&labelColor=000)](https://mongodb.com)

<img src="https://capsule-render.vercel.app/api?type=rect&color=0:FFD600,100:FF6B00&height=12&section=footer" width="100%"/>

</div>
