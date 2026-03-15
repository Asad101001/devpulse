# DevPulse — Architecture
# Last Updated: March 2026

## 1. High-Level Flow (The Pulse)
1. **Sync**: User triggers sync on Dashboard.
2. **Fetch**: Node.js backend fetches GitHub commits via Octokit SDK.
3. **Analyze**: Commits are batched and sent to Groq AI (Llama 3.3).
4. **Sentiment**: Groq returns a JSON score: Sentiment (0-100), Burnout (0-100), and a "Mood Vibe".
5. **Persist**: Results are saved to MongoDB.
6. **Visualize**: React frontend aggregates results into charts and weekly reports.

## 2. Technical Stack
- **Frontend**: Vite + React 18, Tailwind CSS (Brutalist theme), Recharts (Analytics).
- **Backend**: Express 5 (latest Node features), Passport.js (GitHub OAuth).
- **Database**: MongoDB Atlas (M0 Free Tier).
- **AI Hardware**: Groq (Llama-3.3-70b-versatile) — chosen for inference speed and free tier throughput.
- **AI Soft Fallback**: Anthropic Claude Haiku 4.5.

## 3. Data Models
### User
- `githubId`, `username`, `accessToken`, `syncStatus`, `lastSyncedAt`.

### Repo
- `githubRepoId`, `name`, `language`, `userId`.

### Commit
- `sha`, `message`, `timestamp`, `sentimentScore`, `burnoutIndex`, `moodTag`, `aiSummary`.
- *BurnoutIndex high if commits are constant, late at night, or high-frustration.*

## 4. Security Patterns
- **JWT**: Stateless authentication for the API.
- **Sessions**: Stored in MongoStore (connect-mongo) to persist OAuth state during redirects.
- **CSRF**: Mitigated via CORS origin-locking to `CLIENT_URL`.
- **Octokit**: Uses the user's personal access token, never stored in plain-text logs.

## 5. Directory Mapping
| Directory | Purpose |
|-----------|---------|
| `server/routes` | API entry points |
| `server/services` | Logic (AI, GitHub, Aggregations) |
| `client/src/pages` | UI Views |
| `client/src/context` | Global State (Auth) |
