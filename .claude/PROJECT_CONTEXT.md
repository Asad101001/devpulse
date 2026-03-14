# DevPulse — Project Context
# Last updated: March 2026

## What is DevPulse?
A developer wellness and productivity analytics platform. Connects to GitHub via OAuth,
ingests commit history, runs AI sentiment analysis on commit messages, calculates a burnout
score, detects focus sessions, and generates weekly AI-written health reports.
Think "Spotify Wrapped meets a developer therapist."

## Your Node.js version
You have Node v25.2.1 — newer than LTS, fully compatible with every package listed here.
No upgrade needed. npm version will be 10.x — also fine.

---

## Tech Stack — 2026 verified, all free

| Layer          | Technology                          | Version (2026) |
|----------------|-------------------------------------|----------------|
| Frontend       | React + Vite                        | React 18, Vite 6 |
| UI             | shadcn/ui + Tailwind CSS            | Tailwind v3    |
| Charts         | Recharts                            | v3.8+          |
| Heatmap        | shadcn-calendar-heatmap (copy-paste)| No version, copied component |
| Backend        | Node.js + Express                   | Express 5      |
| Database       | MongoDB Atlas M0 (free tier)        | Mongoose 8     |
| Auth           | Passport.js + passport-github2      | passport 0.7   |
| Sessions       | express-session + connect-mongo     | Latest         |
| JWT            | jsonwebtoken                        | v9.0.3         |
| GitHub SDK     | octokit                             | v5.0.5         |
| AI primary     | groq-sdk (Groq API)                 | v0.37+         |
| AI fallback    | @anthropic-ai/sdk                   | v0.24+         |
| Scheduling     | node-cron                           | v3.0.3         |
| Validation     | zod                                 | v3.22+         |
| Security       | helmet + express-rate-limit         | helmet v8, erl v7 |
| Dev tools      | nodemon + dotenv                    | Latest         |
| Deploy backend | Render (free tier)                  | —              |
| Deploy frontend| Vercel (free tier)                  | —              |

---

## AI Strategy — Groq First, Claude Fallback

### Primary: Groq API (groq-sdk)
- Free tier: ~14,400 requests/day
- Model: `llama-3.3-70b-versatile`
- Use for: commit sentiment batches, weekly reports, PR analysis

### Fallback: Anthropic Claude
- Model: `claude-haiku-4-5-20251001`
- Only triggered when Groq errors or rate-limits
- $5 free credit on signup = months of fallback-only use

### Pattern — always use this:
```js
// server/services/aiService.js
import Groq from 'groq-sdk';
import Anthropic from '@anthropic-ai/sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function callAI(userPrompt, systemPrompt) {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 1024,
    });
    return res.choices[0].message.content;
  } catch (err) {
    console.warn('[AI] Groq failed, using Claude fallback:', err.message);
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    return res.content[0].text;
  }
}
```

---

## MVP Feature Phases

### Phase 1 — Week 1 (Foundation — build this first)
- [ ] GitHub OAuth login/logout via Passport.js
- [ ] Fetch repos + last 90 days of commits via Octokit
- [ ] Store everything in MongoDB (User, Repo, Commit models)
- [ ] JWT-protected API routes
- [ ] React frontend shell with React Router + auth context

### Phase 2 — Week 2 (Core AI + Visuals)
- [ ] Commit sentiment analysis via Groq (40 commits per API call)
- [ ] Activity dashboard: commit frequency line chart (Recharts)
- [ ] Contribution heatmap (shadcn-calendar-heatmap)
- [ ] Peak hours radar chart
- [ ] Sentiment timeline feed

### Phase 3 — Week 3 (Burnout Engine + Reports)
- [ ] Burnout score algorithm (5 signals, 0–100)
- [ ] Weekly AI health report (Groq narrative, 150 words)
- [ ] Focus session detector from commit timestamps
- [ ] node-cron: daily sync + weekly report jobs

### Phase 4 — Week 4 (Polish + Deploy)
- [ ] PR quality analyser
- [ ] Loading / error / empty states
- [ ] README with screenshots
- [ ] Deploy: Render + Vercel

### Roadmap only (describe in README, don't build now)
- Team dashboard with aggregated wellness heatmap
- Slack / Discord integration
- GitLab OAuth
- "Dev Wrapped" annual animated report

---

## Complete Folder Structure

```
devpulse/
├── client/                        # React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                # shadcn/ui (auto-generated, never edit)
│   │   │   ├── charts/            # Recharts wrappers
│   │   │   └── layout/            # Header, Sidebar, PageWrapper
│   │   ├── pages/
│   │   │   ├── Landing.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Sentiment.jsx
│   │   │   ├── Burnout.jsx
│   │   │   └── Reports.jsx
│   │   ├── hooks/                 # useAuth, useCommits, useBurnout
│   │   ├── services/api.js        # Axios instance with JWT interceptor
│   │   ├── context/AuthContext.jsx
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js                  # MongoDB connect
│   │   └── passport.js            # GitHub OAuth strategy
│   ├── models/
│   │   ├── User.model.js
│   │   ├── Repo.model.js
│   │   ├── Commit.model.js
│   │   ├── SentimentScore.model.js
│   │   ├── BurnoutScore.model.js
│   │   └── WeeklyReport.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── repos.routes.js
│   │   ├── analytics.routes.js
│   │   └── reports.routes.js
│   ├── controllers/
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   └── errorHandler.js
│   ├── services/
│   │   ├── aiService.js
│   │   ├── githubService.js
│   │   ├── burnoutService.js
│   │   └── reportService.js
│   ├── jobs/scheduler.js
│   ├── utils/
│   │   ├── catchAsync.js
│   │   └── AppError.js
│   ├── index.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## All Environment Variables (.env.example)

```bash
# Server
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/devpulse

# Secrets — generate with:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SESSION_SECRET=64_char_random_string_here
JWT_SECRET=different_64_char_random_string_here
JWT_EXPIRES_IN=7d

# GitHub OAuth — from github.com/settings/developers
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback

# AI — Groq (primary, free) — from console.groq.com
GROQ_API_KEY=gsk_

# AI — Anthropic (fallback) — from console.anthropic.com
ANTHROPIC_API_KEY=sk-ant-

# CORS
CLIENT_URL=http://localhost:3000

# Vite frontend (must start with VITE_)
VITE_API_URL=http://localhost:5000
```
