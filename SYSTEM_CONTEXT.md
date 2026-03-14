# DevPulse System Rules & Context

## 🎨 DESIGN SYSTEM: BRUTALISM
- **Palette**: `Black` (#000000), `Orange` (#FF6B00), `Yellow` (#FFD600), `White` (#FFFFFF).
- **Borders**: All primary containers MUST have `border-[8px] border-black`.
- **Shadows**: Use hard-edged shadows only. `shadow-[10px_10px_0px_0px_#000000]`. No blurs allowed.
- **Typography**: Use `Outfit` (Black weight for headers). Italicized uppercase headers are preferred for an "Operational" feel.
- **Edges**: Sharp edges only. No `rounded` classes except for avatars or specific decorative elements.

## 🤖 AI ENGINE: GROQ SENTIMENT
- **Model**: `llama-3.3-70b-versatile` via Groq SDK.
- **Protocol**: Every commit message is analyzed for `score` (0-100), `burnout` (0-100), and `vibe`.
- **Constraint**: Must maintain a `500ms` sleep between API calls to respect free-tier rate limits.
- **Output**: JSON extraction is mandatory for dashboard consistency.

## 📊 DATA PIPELINE
- **Sync**: GitHub OAuth -> Octokit -> Mongoose Store -> Groq Analysis.
- **Wrapped Summaries**: Aggregated weekly/monthly using MongoDB `$aggregate` pipelines.
- **Metrics**: 
  - `Average Vibe`: Average sentiment over the last 90 days.
  - `Burnout level`: Weighted average of burnout risk indicators.

## 📁 PROJECT ARCHITECTURE
- `/server/services/githubService.js`: Core logic for fetching GitHub data.
- `/server/services/aiService.js`: Interface for LLM analysis.
- `/client/src/pages/Dashboard.jsx`: The primary operational terminal.
- `/client/src/context/AuthContext.jsx`: JWT-based session management.

---
*Follow these rules strictly to maintain the "Hard-Hitting" project identity.*
