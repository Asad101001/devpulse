# DevPulse — SKILLS.md
# AI assistant reference file — paste into any new conversation
# Last updated: March 2026

## Project identity
- Name: DevPulse
- Stack: MERN (MongoDB + Express + React + Node.js)
- Node version: v25.2.1 (user's installed version — compatible with everything below)
- React build tool: Vite 6 (NOT Create React App — that is deprecated)
- Styling: Tailwind CSS v3 + shadcn/ui
- Package manager: npm (not yarn, not pnpm)
- Module system: ES Modules (`"type": "module"` in package.json, use `import`/`export`)

---

## Exact package versions — 2026 verified

### server/package.json dependencies
```json
{
  "name": "devpulse-server",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
  },
  "dependencies": {
    "express": "^5.0.1",
    "mongoose": "^8.0.3",
    "passport": "^0.7.0",
    "passport-github2": "^0.1.12",
    "jsonwebtoken": "^9.0.3",
    "express-session": "^1.18.1",
    "connect-mongo": "^5.1.0",
    "octokit": "^5.0.5",
    "groq-sdk": "^0.37.0",
    "@anthropic-ai/sdk": "^0.24.3",
    "node-cron": "^3.0.3",
    "zod": "^3.22.4",
    "helmet": "^8.0.0",
    "cors": "^2.8.5",
    "express-rate-limit": "^7.1.5",
    "dotenv": "^16.3.1",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

### client/package.json dependencies
```json
{
  "name": "devpulse-client",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "axios": "^1.6.2",
    "recharts": "^3.8.0",
    "react-day-picker": "^8.10.0",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^6.0.0",
    "tailwindcss": "^3.3.6",
    "postcss": "^8.4.32",
    "autoprefixer": "^10.4.16"
  }
}
```

### Important: No react-calendar-heatmap
The old `react-calendar-heatmap` package requires manual CSS import and is
stale. Instead use **shadcn-calendar-heatmap** — it's a copy-paste component
that fits perfectly with shadcn/ui. Claude will provide the component code
when building the heatmap feature.

---

## Absolute rules — never violate these

### 1. AI provider order — Groq first, Claude fallback
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
    return { text: res.choices[0].message.content, model: 'groq' };
  } catch (err) {
    console.warn('[AI] Groq failed, falling back to Claude:', err.message);
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    });
    return { text: res.content[0].text, model: 'claude' };
  }
}
```

### 2. Batch AI calls — never one commit at a time
```js
// CORRECT — 40 commits per API call
function chunk(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}
const batches = chunk(commits, 40);
for (const batch of batches) {
  await analyzeBatch(batch);
  await new Promise(r => setTimeout(r, 1500)); // 1.5s pause between batches
}

// WRONG — one API call per commit
for (const commit of commits) {
  await analyzeCommit(commit); // hits rate limits, very slow
}
```

### 3. JWT stored in React memory only — never localStorage
```js
// CORRECT — AuthContext.jsx
const [token, setToken] = useState(null); // lives in React state only

// WRONG
localStorage.setItem('jwt', token);   // XSS risk
sessionStorage.setItem('jwt', token); // also wrong
document.cookie = `token=${token}`;   // needs extra CSRF protection
```

### 4. catchAsync wraps every async controller
```js
// utils/catchAsync.js
export const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// Every controller:
export const getRepos = catchAsync(async (req, res) => {
  const repos = await Repo.find({ userId: req.user.id });
  res.json({ success: true, data: repos });
});
```

### 5. Consistent API response shape
```js
// Success
res.status(200).json({ success: true, data: result });
res.status(201).json({ success: true, data: newRecord });

// Error — throw this, the global handler catches it
throw new AppError('Repo not found', 404);
```

### 6. Zod validation on all incoming request bodies
```js
import { z } from 'zod';
const syncSchema = z.object({
  repoIds: z.array(z.string()).optional(),
});
const body = syncSchema.parse(req.body); // throws ZodError if invalid
```

### 7. Environment variables — never hardcode secrets
```js
// CORRECT
const groqKey = process.env.GROQ_API_KEY;

// WRONG — never do this
const groqKey = 'gsk_abc123...';
```

---

## Code style conventions

### File naming
- React components: `PascalCase.jsx` (e.g. `BurnoutCard.jsx`)
- All backend files: `camelCase.js` (e.g. `githubService.js`)
- Routes: `name.routes.js`
- Controllers: `name.controller.js`
- Models: `Name.model.js`

### Import order (backend — ES Modules)
```js
// 1. Node built-ins
import crypto from 'crypto';
import path from 'path';

// 2. Third-party packages
import express from 'express';
import mongoose from 'mongoose';

// 3. Local files (relative paths)
import { catchAsync } from '../utils/catchAsync.js'; // .js extension REQUIRED in ESM
import User from '../models/User.model.js';
```

> ESM rule: always include `.js` extension in local imports.
> Forgetting this is the #1 cause of "Cannot find module" errors in Node ESM.

### Mongoose model pattern
```js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const CommitSchema = new Schema({
  userId:    { type: Schema.Types.ObjectId, ref: 'User', required: true },
  sha:       { type: String, required: true, unique: true },
  message:   { type: String, required: true },
  timestamp: { type: Date, required: true },
}, { timestamps: true }); // adds createdAt, updatedAt automatically

// Index fields you query often — critical for performance
CommitSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model('Commit', CommitSchema);
```

---

## Core utility files — copy these exactly

### server/utils/catchAsync.js
```js
export const catchAsync = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);
```

### server/utils/AppError.js
```js
export class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
```

### server/middleware/errorHandler.js
```js
export const globalErrorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : 'Something went wrong';
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
```

### client/src/services/api.js
```js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL + '/api/v1',
});

// Attach JWT to every request automatically
let _token = null;
export const setToken = (t) => { _token = t; };

api.interceptors.request.use((config) => {
  if (_token) config.headers.Authorization = `Bearer ${_token}`;
  return config;
});

export default api;
```

### server/middleware/auth.middleware.js
```js
import jwt from 'jsonwebtoken';
import { catchAsync } from '../utils/catchAsync.js';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.model.js';

export const protect = catchAsync(async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer '))
    throw new AppError('Not authenticated. Please log in.', 401);

  const token = auth.split(' ')[1];
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findById(decoded.id).select('-githubAccessToken');
  if (!user) throw new AppError('User no longer exists', 401);

  req.user = user;
  next();
});
```

---

## Known gotchas and fixes

### ESM + .js extension in imports
Node ESM requires explicit `.js` on relative imports.
```js
// WRONG
import User from '../models/User.model';
// CORRECT
import User from '../models/User.model.js';
```

### Express 5 — async errors auto-propagate
Express 5 catches async errors automatically, so `catchAsync` is technically
optional — but keep using it anyway for consistency and Express 4 compatibility.

### Octokit v5 — use `octokit.rest.*` not `octokit.*`
```js
// CORRECT (v5)
const { data } = await octokit.rest.repos.listForAuthenticatedUser();

// WRONG (old API style)
const { data } = await octokit.repos.list();
```

### Octokit v5 — always paginate commits
```js
const commits = await octokit.paginate(
  octokit.rest.repos.listCommits,
  { owner, repo, per_page: 100, since: ninetyDaysAgo.toISOString() }
);
```

### passport-github2 scope for private repos
```js
new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email', 'repo'], // 'repo' = access to private repos
}, callback)
```

### Render free tier cold start
Render free tier sleeps after 15 mins of inactivity.
Add a keep-alive ping in scheduler.js:
```js
import cron from 'node-cron';
import axios from 'axios';

cron.schedule('*/14 * * * *', async () => {
  try {
    await axios.get(`${process.env.SERVER_URL}/api/v1/health`);
  } catch (_) {}
});
```
And add the health route:
```js
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));
```

### Vite proxy — avoid CORS in development
In `client/vite.config.js`:
```js
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});
```
With this, the frontend calls `/api/v1/...` (no full URL needed in dev),
and Vite forwards it to Express. No CORS errors.

### MongoDB Atlas — URL-encode special characters in password
If your password has `@`, `#`, `!`, `%`, etc., encode them:
`@` → `%40`, `#` → `%23`, `!` → `%21`
Or just use a password with only letters and numbers to avoid this.

### Groq rate limit — add sleep between batches
```js
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const batch of batches) {
  await analyzeBatch(batch);
  await sleep(2000); // 2s pause — safe for free tier
}
```

### shadcn/ui setup command (2026)
```bash
npx shadcn@latest init
npx shadcn@latest add button card badge separator
```
Use `shadcn@latest` — older `shadcn-ui` package is deprecated.

---

## How to ask Claude for help on this project

When you hit an error, always share:
1. The exact error message (full text, including the line number)
2. Which file it's in
3. What you were trying to do

Example: "I get `SyntaxError: Cannot use import statement in module` in server/index.js
when I run `node index.js`. Here's the file: ..."

When asking for a new feature, say:
1. Which phase it's in
2. Which file to add it to
3. What similar existing code it should follow

Example: "I need the burnout score endpoint from Phase 3.
It should live in analytics.routes.js and follow the same pattern as the
activity endpoint we already built."
