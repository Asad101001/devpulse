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

---

## MVP Feature Phases

### Phase 1 — Week 1 (Foundation)
- [x] GitHub OAuth login/logout via Passport.js
- [x] Fetch repos + last 90 days of commits via Octokit
- [x] Store everything in MongoDB (User, Repo, Commit models)
- [x] JWT-protected API routes
- [x] React frontend shell with React Router + auth context

### Phase 2 — Week 2 (Core AI + Visuals)
- [x] Commit sentiment analysis via Groq (40 commits per API call)
- [x] Activity dashboard: commit frequency line chart (Recharts)
- [x] Contribution heatmap (shadcn-calendar-heatmap)
- [x] Peak hours radar chart
- [x] Sentiment timeline feed

### Phase 3 — Week 3 (Burnout Engine + Reports)
- [x] Burnout score algorithm (5 signals, 0–100)
- [ ] Weekly AI health report (Groq narrative, 150 words)
- [x] Focus session detector from commit timestamps
- [ ] node-cron: daily sync + weekly report jobs

### Phase 4 — Week 4 (Polish + Deploy)
- [ ] PR quality analyser
- [ ] Loading / error / empty states
- [ ] README with screenshots
- [ ] Deploy: Render + Vercel
