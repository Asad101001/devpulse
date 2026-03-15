# ⚡ DEVPULSE — DEVELOPER WELLNESS ANALYTICS

### [ ANALYZE // EVOLVE // SURVIVE ]

**DevPulse** is a high-density developer analytics platform that turns your GitHub commit history into an operational health report. Powered by **Groq AI (Llama 3.3)**, it provides raw sentiment tracking, burnout detection, and "Spotify-Wrapped" style weekly summaries for the modern engineer.

---

## 🛠️ THE CORE STACK
- **CORE**: Node.js 25 // React 18 // Vite 6
- **VISUALS**: Tailwind CSS // Brutalist UI System // Recharts
- **INTELLIGENCE**: Groq Cloud (Llama 3.3) // Anthropic Claude (Fallback)
- **DATABASE**: MongoDB Atlas (Cloud)
- **SECURITY**: JWT // Passport.js (GitHub OAuth)

---

## 🚀 KEY FEATURES
- 🧠 **AI Intelligence Feed**: Real-time briefing for every commit message using LLMs.
- 🔥 **Burnout Radar**: Operational risk assessment based on after-hours activity and sentiment drift.
- 🎨 **Dev Wrapped**: Generative poster-style snapshots of your weekly developer vibe.
- ⚡ **Flow Sentiment**: Threshold-based color coding (Green/Red) to detect flow state versus system friction.
- 📡 **Live Operational Feed**: High-density dashboard showing real-time operational signals.

---

## 🕹️ LOCAL INITIALIZATION

### 1. CLONE AND INSTALL
```bash
git clone https://github.com/Asad101001/devpulse.git
cd devpulse
# Install Server
cd server && npm install
# Install Client
cd ../client && npm install
```

### 2. CONFIGURATION (.env)
Create a `.env` in the `server/` directory:
```bash
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
SESSION_SECRET=your_random_secret
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback
GROQ_API_KEY=your_groq_api_key
CLIENT_URL=http://localhost:5173
```

### 3. RUN OPERATIONS
```bash
# Terminal 1: Backend
cd server && npm run dev
# Terminal 2: Frontend
cd client && npm run dev
```

---

## ⚙️ DEPLOYMENT PROCESS

DevPulse is designed for the **Free Tier Ecosystem** ($0 cost deployment).

### PHASE A: BACKEND (Render.com)
1. **Repository**: Connect your GitHub repo to Render.
2. **Build Selection**: Root: `server` // Build: `npm install` // Start: `node index.js`.
3. **Environment**: Add all variables from your `.env` (Use Production URLs).
4. **Health Check**: Ensure `api/v1/health` returns `status: ok`.

### PHASE B: FRONTEND (Vercel)
1. **Repository**: Import the project as a Vercel project.
2. **Configuration**: Root: `client` // Framework: Vite // Build Command: `npm run build`.
3. **Production ENV**: `VITE_API_URL` should point to your Render app URL.
4. **Routing**: Handled by the included `vercel.json` rewrite rules.

---

## 📜 RECENT OPERATIONS
Check the [WORK_LOG.md](WORK_LOG.md) for detailed implementation history and the [docs/](docs/) directory for full technical specifications.

---

### [ SYSTEM STATUS: OPERATIONAL ]
Developed by **Asad101001** for the Google Deepmind Advanced Agentic Coding Challenge.
