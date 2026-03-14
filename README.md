# DevPulse — Operational Developer Analytics

![DevPulse Brutalist Banner](https://via.placeholder.com/1200x400/000000/FF6B00?text=DEVPULSE+_+INTENSITY+ENGINEERING)

> **"Code Brutalist. Live Well."**

DevPulse is a high-intensity, AI-powered wellness and productivity platform for engineers. It integrates directly with your GitHub ecosystem to monitor burnout risks, emotional sentiment, and flow-state harmonics using Groq LLM analysis.

## ⚡ CORE CAPABILITIES

- **Vibe Sensing**: Real-time LLM analysis of commit narratives to detect developer fatigue.
- **Burnout Mitigation**: Hard-hitting metrics identifying late-night patterns and high-friction repos.
- **Operational Dashboard**: A brutalist terminal for tracking your cognitive pulse.
- **Wrapped Summaries**: Weekly and Monthly "DevWrapped" style health & productivity briefings.

## 🛠 TECH STACK

- **Frontend**: React 18, Vite, Tailwind CSS (Brutalist System), Lucide Icons, Recharts.
- **Backend**: Node.js, Express, Passport.js (GitHub OAuth).
- **Database**: MongoDB + Mongoose.
- **AI Engine**: Groq SDK (Llama 3.3 70B Versatile).
- **Communication**: Octokit (GitHub REST API).

## 🚀 GETTING STARTED

### Prerequisites
- Node.js v18+
- MongoDB Atlas (Free Tier)
- GitHub OAuth App Credentials
- Groq API Key (Free Tier)

### Environment Setup
Create a `.env` in the `server` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
GITHUB_CLIENT_ID=your_id
GITHUB_CLIENT_SECRET=your_secret
GITHUB_CALLBACK_URL=http://localhost:5000/api/v1/auth/github/callback
CLIENT_URL=http://localhost:5173
GROQ_API_KEY=your_groq_key
```

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   # Server
   cd server && npm install
   # Client
   cd ../client && npm install
   ```
3. Run Development:
   ```bash
   # Terminal 1 (Server)
   cd server && npm run dev
   # Terminal 2 (Client)
   cd client && npm run dev
   ```

## 📐 DESIGN PHILOSOPHY
DevPulse follows a **Brutalist Design System**:
- High-contrast (Orange, Yellow, Black).
- Thick 8px borders.
- Hard-edged shadows (no blurs).
- Industrial typography (Outfit Black).

---
© 2026 DEVPULSE PLATFORM. NO TRACKERS. NO FLUFF.
