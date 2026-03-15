# Pulse.IO — Deployment Blueprint
# [ OPERATIONAL_MANUAL // ZERO_COST_PHASE ]

This document outlines the exact procedure for syncing the Pulse.IO ecosystem to production environments using free-tier resources.

---

## 🏗️ 1. MONGODB_ATLAS (The Vault)
1. **Cluster**: Initialize an M0 Free Cluster.
2. **Access Control**: 
   - Add `0.0.0.0/0` to Network Access (Required for Render's dynamic IP range).
   - Create a database user with password (avoid special characters or URL-encode them).
3. **Database Name**: Ensure you append `/devpulse` (or your chosen name) to the end of your connection string.

---

## 📡 2. GITHUB_OAUTH (The Gateway)
1. **Identity**: Go to GitHub Developer Settings > OAuth Apps.
2. **Production Update**:
   - Change **Homepage URL** to your Vercel URL.
   - Add a second **Authorization callback URL**: `https://your-server-id.onrender.com/api/v1/auth/github/callback`.
3. **Secret**: Do not lose the Client Secret; it is only displayed once and is vital for your Render env vars.

---

## 🖥️ 3. RENDER_BACKEND (The Core)
1. **New Web Service**: Connect your GitHub repository.
2. **Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
   - **Instance Type**: Free
3. **Internal Variables**:
   - `NODE_ENV`: `production`
   - `CLIENT_URL`: `https://your-ui-id.vercel.app` (Your Vercel Link)
   - `GITHUB_CALLBACK_URL`: `https://your-server-id.onrender.com/api/v1/auth/github/callback`
   - *Add all other keys from local .env.*

---

## 🎨 4. VERCEL_FRONTEND (The UI)
1. **Import Project**: Select the repository.
2. **Settings Override**:
   - **Root Directory**: `client`
   - **Framework**: `Vite`
3. **Variables**:
   - `VITE_API_URL`: `https://your-server-id.onrender.com` (Your Render Link)
4. **Build**: Vercel will automatically run `npm run build` and serve from `dist`. The `vercel.json` in the root (or client subfolder) will handle routing.

---

## ⚠️ CRITICAL_NOTES
- **Cold Starts**: Render's free tier spins down after 15 minutes. The frontend has a pulsing "INITIALIZING_DASHBOARD..." state specifically to hide this delay.
- **Vercel Config**: If you encounter 404s on page refresh, verify that [client/vercel.json](../client/vercel.json) contains the `rewrites` block.
- **Git Sync**: Ensure your `.gitignore` is active so your local `.env` is never leaked to GitHub.

---
### [ STATUS: READY_FOR_UPLINK ]
