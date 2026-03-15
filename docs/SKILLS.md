# DevPulse — SKILLS.md
# AI assistant reference file
# Last updated: March 2026

## Project Identity
- Name: DevPulse
- Tech Stack: MERN (MongoDB, Express 5, React 18, Node 25)
- Bundle: Vite 6
- UI: Tailwind + shadcn/ui
- AI: Groq (Llama 3.3) + Claude Fallback

## Critical Workflow Rules
1. **AI Batching**: Always analyze commits in batches of 40 (save on rate limits).
2. **ESM Imports**: Always include `.js` extension in all local file imports.
3. **Stateless Auth**: JWT in memory only (client side).
4. **CatchAsync**: Wrap all async controllers to catch errors automatically.
5. **Brutalist CSS**: High contrast, heavy borders, sharp edges, bold utility colors.

## AI Service Pattern
```js
export async function callAI(userPrompt, systemPrompt) {
  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }]
    });
    return res.choices[0].message.content;
  } catch (err) {
    // Fallback to Anthropic...
  }
}
```

## Folder Conventions
- `server/services`: External API logic (GitHub, Groq).
- `server/models`: Mongoose schemas.
- `client/src/pages`: Main UI views.
- `client/src/context`: Auth and Global state.
