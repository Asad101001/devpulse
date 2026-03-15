# DevPulse — Troubleshooting Guide
# Last updated: March 2026

## 1. Auth Issues
- **"Requires Authentication"**: Check if `githubAccessToken` is correctly stored in DB and passed to service.
- **CORS Errors**: Verify `CLIENT_URL` in backend `.env` matches the frontend's Vite port (usually 5173).
- **JWT Malformed**: Ensure the `Authorization` header has the `Bearer ` prefix.

## 2. ESM & Node 25
- **ERR_MODULE_NOT_FOUND**: Check for missing `.js` extensions in imports.
- **SyntaxError (import)**: Ensure `"type": "module"` is in `package.json`.

## 3. GitHub Sync
- **401 Unauthorized**: Token is likely revoked or expired. Re-login via GitHub.
- **Empty Repos**: Verify the `repo` scope is requested in the Passport strategy.

## 4. AI Analysis
- **Rate Limits**: Groq free tier has minute-based limits. Ensure `sleep()` is present in batch loops.
- **Invalid JSON**: Llama sometimes adds prose. Use a regex to extract `[...]` if `JSON.parse` fails.

## 5. Deployment
- **Cold Start (Render)**: First request after 15 mins will be slow. Expected behavior on free tier.
- **Vercel 404 on Refresh**: Ensure `vercel.json` has rewrites to `index.html`.
