# DevPulse — Troubleshooting Guide
# Real errors you will hit, and exactly how to fix them
# Last updated: March 2026 — covers ESM, Express 5, Octokit v5, Groq SDK v0.37

---

## The #1 rule when something breaks

Copy the **full error message** including the line number and stack trace,
then paste it here and ask Claude. Never try to guess from just the error name.

---

## Node / ESM Errors

### "SyntaxError: Cannot use import statement in a module"
**What it means**: Node doesn't know you're using ES Modules.
**Fix**: Make sure `"type": "module"` is in your `server/package.json`:
```json
{
  "name": "devpulse-server",
  "type": "module",
  ...
}
```

### "Error [ERR_MODULE_NOT_FOUND]: Cannot find module '...'"
**What it means**: Local import is missing the `.js` extension.
**Fix**: ES Modules require explicit `.js` on all relative imports:
```js
// WRONG
import User from '../models/User.model';
import { catchAsync } from '../utils/catchAsync';

// CORRECT
import User from '../models/User.model.js';
import { catchAsync } from '../utils/catchAsync.js';
```

### "ReferenceError: __dirname is not defined"
**What it means**: `__dirname` is a CommonJS variable, not available in ESM.
**Fix**:
```js
import { fileURLToPath } from 'url';
import { dirname } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### "Must use import to load ES Module" when importing a package
**What it means**: The package is ESM-only and you have a CommonJS file somewhere.
**Fix**: Make sure ALL your server files use `import`/`export`, not `require`/`module.exports`.
Check that `"type": "module"` is in `server/package.json`.

---

## GitHub OAuth Errors

### "redirect_uri_mismatch" from GitHub
**What it means**: Callback URL in code ≠ what's registered on GitHub.
**Fix**:
1. Go to https://github.com/settings/developers → your OAuth App
2. Check "Authorization callback URL" is exactly:
   `http://localhost:5000/api/v1/auth/github/callback`
3. Check `GITHUB_CALLBACK_URL` in your `.env` matches exactly
4. No trailing slash. Case-sensitive.

### "invalid_client" from GitHub
**What it means**: Wrong Client ID or Secret.
**Fix**: Re-copy both from https://github.com/settings/developers.
Make sure there are no spaces before/after the values in `.env`.

### "Failed to serialize user into session"
**What it means**: Passport can't store/retrieve the user.
**Fix**: Make sure these two functions exist in `server/config/passport.js`:
```js
passport.serializeUser((user, done) => done(null, user._id.toString()));

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
```

### "Cannot GET /api/v1/auth/github" — 404
**What it means**: Auth router isn't registered.
**Fix**: In `server/index.js`, check:
```js
import authRouter from './routes/auth.routes.js';
app.use('/api/v1/auth', authRouter);
```

---

## JWT Errors

### "JsonWebTokenError: invalid signature"
**What it means**: `JWT_SECRET` in `.env` changed since the token was issued,
or the wrong secret was used.
**Fix**: Log out and log back in to get a fresh token.
During development — clear your app's state and re-login.

### "JsonWebTokenError: jwt malformed"
**What it means**: The token string is corrupted or the `Authorization` header
is formatted wrong.
**Fix**: The header must be exactly `Authorization: Bearer <token>`.
Check in `client/src/services/api.js` that the interceptor builds this correctly:
```js
config.headers.Authorization = `Bearer ${token}`;
```

### "req.user is undefined" in a controller
**What it means**: The `protect` middleware didn't run, or the JWT is invalid.
**Fix**:
1. Check the route has `protect` before the controller:
   `router.get('/me', protect, getMe)`
2. Add a temporary log: `console.log(req.headers.authorization)` — check it's present
3. Make sure the frontend is sending the header

---

## MongoDB / Mongoose Errors

### "MongoServerError: bad auth : Authentication failed"
**What it means**: Wrong username or password in `MONGO_URI`.
**Fix**:
1. Go to MongoDB Atlas → Database Access → check the exact username
2. If password has special characters (`@`, `#`, `!`), URL-encode them:
   `@` → `%40`, `#` → `%23`, `!` → `%21`
3. Or reset the password to letters and numbers only and update `.env`

### "MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017"
**What it means**: Trying to connect to local MongoDB that isn't running.
**Fix**: You should be using MongoDB Atlas (cloud), not local.
Make sure `MONGO_URI` starts with `mongodb+srv://` not `mongodb://localhost`.

### "MongooseError: Operation `commits.find()` buffering timed out"
**What it means**: Mongoose connected but MongoDB Atlas hasn't responded.
**Fix**:
1. Check your Atlas Network Access — is `0.0.0.0/0` added?
2. Check your MONGO_URI has the right cluster address
3. Wait 30 seconds and try again (Atlas free tier can be slow to wake up)

### "E11000 duplicate key error collection: devpulse.commits index: sha_1"
**What it means**: Trying to insert a commit with a `sha` that already exists.
**Fix**: Use `upsert` instead of `create` when storing commits:
```js
await Commit.findOneAndUpdate(
  { sha: commit.sha },
  { $set: commitData },
  { upsert: true, new: true }
);
```

### "ValidationError: Path `userId` is required"
**What it means**: You're saving a document without a required field.
**Fix**: Check the model schema for `required: true` fields.
Log `req.user` to make sure the user object is attached before saving.

---

## Groq / AI Errors

### "Cannot find package 'groq-sdk'"
**Fix**: `cd server && npm install groq-sdk`

### "401 Unauthorized" from Groq
**Fix**: Check `GROQ_API_KEY` in `.env`. Get a new key from https://console.groq.com/keys.

### "429 Too Many Requests" from Groq
**What it means**: Hit the rate limit on the free tier.
**Fix**: The Claude fallback should catch this automatically via the try/catch in `aiService.js`.
If you're hitting it often, increase the sleep between batches:
```js
await sleep(3000); // increase from 2000 to 3000ms
```

### AI returns text instead of JSON (JSON.parse fails)
**What it means**: The model ignored the JSON-only instruction.
**Fix**: Make the system prompt more explicit:
```js
const systemPrompt = `You MUST respond with ONLY a valid JSON array.
Do NOT include any explanation, markdown, backticks, or prose.
Start your response with [ and end with ].
If you cannot classify a commit, use "neutral" with score 50.`;
```
Also add a JSON repair attempt before failing:
```js
let parsed;
try {
  parsed = JSON.parse(text);
} catch {
  // Try to extract JSON from the response
  const match = text.match(/\[[\s\S]*\]/);
  if (match) parsed = JSON.parse(match[0]);
  else throw new Error('AI did not return valid JSON');
}
```

---

## Octokit v5 Errors

### "octokit.repos is not a function" or "octokit.repos.list is not a function"
**What it means**: Using old Octokit API style with v5.
**Fix**: Octokit v5 uses `.rest.*`:
```js
// WRONG (old)
const { data } = await octokit.repos.listForAuthenticatedUser();

// CORRECT (v5)
const { data } = await octokit.rest.repos.listForAuthenticatedUser();
```

### Only getting 30 commits per repo
**What it means**: Forgot to paginate — GitHub defaults to 30 per page.
**Fix**:
```js
const commits = await octokit.paginate(
  octokit.rest.repos.listCommits,
  {
    owner,
    repo,
    per_page: 100,
    since: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString()
  }
);
```

### "HttpError: Not Found" (404) fetching a repo
**What it means**: Repo is private and the OAuth scope is wrong.
**Fix**: Make sure `scope: ['user:email', 'repo']` is in the Passport GitHub strategy.
`'repo'` gives access to private repos. Without it, only public repos are accessible.

### "HttpError: API rate limit exceeded"
**What it means**: Used up 5,000 GitHub API requests in one hour.
**Fix**: This shouldn't happen in normal use. If it does:
```js
const { data: rateData } = await octokit.rest.rateLimit.get();
if (rateData.rate.remaining < 200) {
  throw new AppError('GitHub rate limit nearly exhausted. Try again in an hour.', 429);
}
```

---

## Express / Node Server Errors

### "Cannot GET /api/v1/..." (404)
**Fix**:
1. Check the route file has the right path
2. Check `index.js` registers the router: `app.use('/api/v1/repos', reposRouter)`
3. Make sure the route file exports a router: `export default router`
4. Check there's no typo in the URL

### Port 5000 already in use
```bash
# Mac / Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
# Then: taskkill /PID <pid_number> /F
```

### "CORS error" in browser console
**Fix**: In `server/index.js`:
```js
import cors from 'cors';
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));
```
Also in `client/src/services/api.js`, make sure `withCredentials: true` if using cookies,
or that you're sending the `Authorization` header with JWT.

---

## React / Vite Frontend Errors

### "Failed to fetch" or "Network Error" from axios
**What it means**: Frontend can't reach the backend.
**Fix**:
1. Make sure the backend is running: `cd server && npm run dev`
2. Check `client/vite.config.js` has the proxy:
```js
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```
3. Make sure `VITE_API_URL=http://localhost:5000` is in `client/.env`

### "Matched leaf route at location '/' does not have an element"
**Fix**:
```jsx
// WRONG
<Route path="/dashboard" />

// CORRECT
<Route path="/dashboard" element={<Dashboard />} />
```

### Recharts renders blank / no chart visible
**What it means**: Container has no height.
**Fix**: Wrap in a div with explicit height:
```jsx
<div style={{ width: '100%', height: 300 }}>
  <ResponsiveContainer width="100%" height="100%">
    <LineChart data={data}>...
  </ResponsiveContainer>
</div>
```

### shadcn component "Cannot find module '@/components/ui/button'"
**What it means**: Path alias `@` isn't configured.
**Fix**: In `client/vite.config.js`:
```js
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
});
```
And in `client/jsconfig.json` (create this file):
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### "process is not defined" in React component
**What it means**: Used `process.env` instead of `import.meta.env`.
**Fix**: In Vite (React), always use:
```js
import.meta.env.VITE_API_URL   // CORRECT
process.env.VITE_API_URL       // WRONG — this is Node.js only
```

---

## Deployment Errors

### Render: build fails with "Cannot find module"
**Fix**: The package is missing from `server/package.json` `dependencies`.
Locally installed packages don't automatically appear in package.json.
Run: `npm install <package-name> --save` to add it properly.

### Render: app crashes on startup (check Logs tab)
Most common causes:
1. Missing environment variable — add it in Render → Environment tab
2. `MONGO_URI` not updated (still pointing to localhost)
3. Port binding issue — make sure your server uses `process.env.PORT`:
```js
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### Vercel: "Page not found" on browser refresh
**Fix**: Create `client/vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### GitHub OAuth fails in production ("redirect_uri_mismatch")
**Fix**:
1. Go to https://github.com/settings/developers → your OAuth App
2. Add production callback URL:
   `https://your-render-app.onrender.com/api/v1/auth/github/callback`
3. In Render environment variables, update:
   `GITHUB_CALLBACK_URL=https://your-render-app.onrender.com/api/v1/auth/github/callback`
4. Also update `CLIENT_URL` to your Vercel URL

### Render app is slow / times out
**What it means**: Free tier cold start — app sleeps after 15 mins of inactivity.
**Fix**: Add a keep-alive ping to `server/jobs/scheduler.js`:
```js
import cron from 'node-cron';
import axios from 'axios';

// Ping every 14 minutes to prevent sleep
cron.schedule('*/14 * * * *', async () => {
  try {
    await axios.get(process.env.SERVER_URL + '/api/v1/health');
  } catch (_) {}
});
```
And add this route in `server/index.js`:
```js
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok', time: new Date() }));
```
