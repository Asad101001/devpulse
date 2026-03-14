# DevPulse — System Architecture
# Last updated: March 2026

---

## High-Level Overview

```
Browser (React 18 + Vite)
        |
        | HTTPS / JWT Bearer token
        v
Express 5 API (Node.js v25)
        |
        ├── MongoDB Atlas ←── Mongoose 8 (models)
        |
        ├── Passport.js ──────── GitHub OAuth API
        |
        ├── Octokit v5 ───────── GitHub REST API
        |                        (repos, commits, PRs)
        |
        └── aiService.js
              ├── Groq API — groq-sdk (primary, free)
              │   Model: llama-3.3-70b-versatile
              └── Anthropic API (fallback)
                  Model: claude-haiku-4-5-20251001
```

---

## Complete Request Flows

### 1. GitHub OAuth Login Flow
```
User clicks "Login with GitHub"
  → GET /api/v1/auth/github
  → passport.authenticate('github') runs
  → Browser redirects to github.com/login/oauth/authorize
  → User clicks "Authorize DevPulse"
  → GitHub redirects to /api/v1/auth/github/callback?code=xxxx
  → Passport exchanges code for GitHub access_token
  → Passport strategy callback runs:
      - findOne or create User in MongoDB
      - Save githubAccessToken to User document
  → Server signs a JWT: jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' })
  → Server redirects to frontend: http://localhost:3000/auth/callback?token=xxxx
  → React reads token from URL, stores in AuthContext state (NOT localStorage)
  → All future API calls: Authorization: Bearer <token>
```

### 2. Commit Sync Flow
```
Trigger: user first login, OR daily cron job at 2am
  → POST /api/v1/repos/sync (authenticated)
  → githubService.syncUserRepos(user)
      → octokit.paginate(octokit.rest.repos.listForAuthenticatedUser, { per_page: 100 })
      → Upsert each repo in MongoDB (Repo model)
      → For each repo:
          → octokit.paginate(octokit.rest.repos.listCommits, {
              owner, repo, per_page: 100,
              since: 90 days ago ISO string
            })
          → For each commit: findOneAndUpdate({ sha }, data, { upsert: true })
          → Set isAfterHours: true if commit hour is 22–6
  → After all commits stored:
      → Queue AI analysis: aiService.batchSentiment(newCommits)
      → Update user.lastSyncedAt, user.syncStatus = 'idle'
```

### 3. AI Batch Sentiment Flow
```
aiService.batchSentiment(commits)
  → Split commits into chunks of 40
  → For each chunk:
      → Build prompt with array of { id, message } objects
      → try: groq.chat.completions.create({ model: 'llama-3.3-70b-versatile', ... })
      → catch: anthropic.messages.create({ model: 'claude-haiku-4-5-20251001', ... })
      → Parse JSON response: [{ id, sentiment, score, reason }]
      → Upsert SentimentScore for each commit
      → Sleep 2000ms between chunks (rate limit safety)
```

### 4. Burnout Score Calculation
```
burnoutService.calculateScore(userId, windowDays = 30)
  → Fetch commits for window from MongoDB
  → Signal 1 (weight 25%): commit frequency trend
      → Compare commits/week in first half vs second half of window
      → Decline = higher burnout signal
  → Signal 2 (weight 30%): average sentiment score trend
      → Compare avg sentiment first half vs second half
      → Decline = higher burnout signal
  → Signal 3 (weight 20%): after-hours commit ratio
      → (commits where isAfterHours = true) / total commits
      → Higher ratio = higher burnout signal
  → Signal 4 (weight 15%): PR abandonment rate
      → (PRs opened but not merged or closed by user) / total PRs
  → Signal 5 (weight 10%): average commit message length trend
      → Shorter messages = more rushed = higher burnout signal
  → Weighted sum → score 0–100 (100 = maximum burnout)
  → Compare to previous window's score → trend: improving / worsening / stable
  → Save BurnoutScore document
```

### 5. Weekly Report Generation
```
reportService.generateWeeklyReport(userId)
  → Gather last 7 days of data:
      - Total commits
      - Dominant sentiment (mode of sentiment values)
      - Burnout score
      - Peak hour (hour with most commits, 0–23)
      - Focus sessions detected (commit clusters with 2hr+ gaps around them)
      - After-hours commit count
      - Most active repo
  → Build Groq prompt with all data
  → callAI(userPrompt, systemPrompt) → narrative text
  → Save WeeklyReport document
  → Mark for user via lastReportAt timestamp
```

---

## Database Schemas (Mongoose)

### User
```js
{
  _id:              ObjectId,
  githubId:         String,    required, unique
  username:         String,    required
  displayName:      String,
  avatarUrl:        String,
  email:            String,
  githubAccessToken:String,    // store encrypted in production
  lastSyncedAt:     Date,
  syncStatus:       String,    enum: ['idle', 'syncing', 'error'], default: 'idle'
  lastReportAt:     Date,
  createdAt:        Date,      auto (timestamps: true)
  updatedAt:        Date,      auto
}
indexes: { githubId: 1 } unique
```

### Repo
```js
{
  _id:          ObjectId,
  userId:       ObjectId,  ref: 'User', required
  githubRepoId: Number,    required, unique
  name:         String,    required
  fullName:     String,    required  // "owner/repo-name"
  description:  String,
  language:     String,
  isPrivate:    Boolean,   default: false
  lastCommitAt: Date,
  createdAt:    Date,
  updatedAt:    Date,
}
indexes: { userId: 1 }, { githubRepoId: 1 } unique
```

### Commit
```js
{
  _id:          ObjectId,
  userId:       ObjectId,  ref: 'User', required
  repoId:       ObjectId,  ref: 'Repo', required
  sha:          String,    required, unique
  message:      String,    required
  timestamp:    Date,      required
  additions:    Number,    default: 0
  deletions:    Number,    default: 0
  filesChanged: Number,    default: 0
  isAfterHours: Boolean,   default: false  // computed: hour >= 22 || hour < 6
  createdAt:    Date,
}
indexes: { userId: 1, timestamp: -1 }, { sha: 1 } unique, { repoId: 1 }
```

### SentimentScore
```js
{
  _id:        ObjectId,
  commitId:   ObjectId,  ref: 'Commit', required, unique
  userId:     ObjectId,  ref: 'User', required
  sentiment:  String,    enum: ['focused','frustrated','rushed','creative','neutral']
  score:      Number,    min: 0, max: 100  // 100 = most positive
  confidence: Number,    min: 0, max: 1
  reason:     String,    // 1-sentence AI explanation
  aiModel:    String,    // 'groq' or 'claude'
  createdAt:  Date,
}
indexes: { userId: 1, createdAt: -1 }, { commitId: 1 } unique
```

### BurnoutScore
```js
{
  _id:         ObjectId,
  userId:      ObjectId,  ref: 'User', required
  windowStart: Date,      required
  windowEnd:   Date,      required
  score:       Number,    min: 0, max: 100  // 100 = maximum burnout
  trend:       String,    enum: ['improving','worsening','stable']
  signals: {
    commitFrequency:   Number,
    sentimentTrend:    Number,
    afterHoursRatio:   Number,
    prAbandonRate:     Number,
    messageLengthTrend:Number,
  },
  createdAt: Date,
}
indexes: { userId: 1, createdAt: -1 }
```

### WeeklyReport
```js
{
  _id:               ObjectId,
  userId:            ObjectId,  ref: 'User', required
  weekStarting:      Date,      required
  narrative:         String,    // AI-generated, ~150 words
  highlights:        [String],  // 3–5 bullet points
  burnoutScore:      Number,
  totalCommits:      Number,
  dominantSentiment: String,
  peakHour:          Number,    // 0–23
  topRepo:           String,
  focusSessions:     Number,
  afterHoursCommits: Number,
  aiModel:           String,    // 'groq' or 'claude'
  createdAt:         Date,
}
indexes: { userId: 1, weekStarting: -1 }
```

---

## All API Routes

### Auth routes (/api/v1/auth)
| Method | Path              | Auth? | Description |
|--------|-------------------|-------|-------------|
| GET    | /github           | No    | Start GitHub OAuth flow |
| GET    | /github/callback  | No    | GitHub OAuth callback, issues JWT |
| GET    | /me               | Yes   | Get current user profile |
| POST   | /logout           | Yes   | Invalidate session |

### Repo routes (/api/v1/repos)
| Method | Path         | Auth? | Description |
|--------|--------------|-------|-------------|
| GET    | /            | Yes   | List user's synced repos |
| POST   | /sync        | Yes   | Trigger manual GitHub sync |
| GET    | /:id/commits | Yes   | Get commits for one repo |

### Analytics routes (/api/v1/analytics)
| Method | Path         | Auth? | Description |
|--------|--------------|-------|-------------|
| GET    | /activity    | Yes   | Commit frequency by day (last 90d) |
| GET    | /sentiment   | Yes   | Sentiment timeline with scores |
| GET    | /heatmap     | Yes   | Calendar heatmap data (date + count) |
| GET    | /peakhours   | Yes   | Commit count grouped by hour (0–23) |
| GET    | /burnout     | Yes   | Current burnout score + trend |
| GET    | /focus       | Yes   | Detected focus sessions |

### Report routes (/api/v1/reports)
| Method | Path      | Auth? | Description |
|--------|-----------|-------|-------------|
| GET    | /         | Yes   | List all weekly reports |
| GET    | /latest   | Yes   | Most recent report |
| POST   | /generate | Yes   | Trigger report generation now |

---

## Scheduled Jobs (node-cron)

```js
// server/jobs/scheduler.js
import cron from 'node-cron';
import { syncAllUsers } from '../services/githubService.js';
import { generateReportsForAll } from '../services/reportService.js';
import axios from 'axios';

// Daily at 2am: sync commits for all users
cron.schedule('0 2 * * *', async () => {
  console.log('[CRON] Starting daily sync...');
  await syncAllUsers();
});

// Every Sunday at 9am: generate weekly reports
cron.schedule('0 9 * * 0', async () => {
  console.log('[CRON] Generating weekly reports...');
  await generateReportsForAll();
});

// Every 14 minutes: keep Render free tier awake
cron.schedule('*/14 * * * *', async () => {
  try {
    await axios.get(process.env.SERVER_URL + '/api/v1/health');
  } catch (_) {}
});
```

---

## Security Checklist

| Concern              | Solution |
|----------------------|----------|
| JWT storage          | React state (memory) only — never localStorage |
| GitHub token storage | Stored in MongoDB, consider encrypting with Node crypto |
| API secrets          | .env only, never committed to git |
| CORS                 | Restricted to CLIENT_URL in production |
| Request validation   | Zod schema on all incoming req.body |
| Security headers     | helmet() middleware on all routes |
| Rate limiting        | express-rate-limit: 100 req / 15min per IP |
| SQL injection        | N/A — MongoDB, but Mongoose sanitizes queries |
| XSS                  | JWT in memory (not DOM/cookies) |

---

## AI Prompt Templates

### Commit Sentiment (batch, 40 at a time)
```
SYSTEM:
You analyze developer commit messages to assess emotional state and work patterns.
Respond ONLY with a valid JSON array. No explanation. No markdown. No backticks.
Start with [ and end with ].

USER:
Classify each commit message. Return one JSON object per commit.

Valid sentiments: focused | frustrated | rushed | creative | neutral
Score: 0–100 (100 = most positive/healthy state)

Input:
[
  {"id":"abc123","message":"fix: resolve null pointer in auth middleware"},
  {"id":"def456","message":"GODDAMN WHY IS THIS STILL BROKEN"},
  {"id":"ghi789","message":"refactor: extract payment logic into service class"}
]

Output format:
[{"id":"abc123","sentiment":"focused","score":72,"reason":"Methodical bug fix"}]
```

### Weekly Health Report (narrative)
```
SYSTEM:
You are a warm, supportive engineering coach writing a weekly developer wellness report.
Be specific, actionable, and encouraging. Maximum 150 words.
Do not use bullet points. Write in paragraphs.

USER:
Write a weekly wellness report for this developer:

Week: [Mon date] – [Sun date]
Total commits: 23
Sentiment breakdown: frustrated 40%, focused 35%, neutral 25%
Burnout score: 67/100 (trending worse — was 58 last week)
Peak productive hours: 9am–11am, 3pm–5pm
Most active repo: my-saas-app
Focus sessions (2hr+ uninterrupted): 3 sessions, avg 2.3 hours
After-hours commits (10pm–6am): 8 commits (35% of total)

Highlight what went well, name the specific concern,
and suggest exactly one concrete action for next week.
```
