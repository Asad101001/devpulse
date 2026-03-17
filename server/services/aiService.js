import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzeCommitSentiment(commitMessage, retryCount = 0) {
  const systemPrompt = `
    You are the Pulse IO Advanced Sentiment Engine.
    Analyze the following commit message and provide a professional yet industrial JSON response.
    Fields:
    - score: (0-100) where 100 is extremely positive/productive and 0 is extremely frustrated.
    - burnout: (0-100) likelihood of burnout based on tone and complexity.
    - vibe: (string) one word category (e.g., Focused, Agile, Efficent).
    - briefing: (string) 5-word max concise summary.
    - recommendation: (string) 15-word max actionable engineering advice.
    Return ONLY JSON.
  `;

  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: commitMessage || 'EMPTY_SIGNAL' }
      ],
      response_format: { type: "json_object" },
      max_tokens: 250,
    });
    const parsed = JSON.parse(res.choices[0].message.content);
    return {
      score: parsed.score ?? 50,
      burnout: parsed.burnout ?? 0,
      vibe: parsed.vibe ?? 'Calibrated',
      briefing: parsed.briefing ?? 'Signal parsed.',
      recommendation: parsed.recommendation ?? 'Maintain operational tempo.'
    };
  } catch (err) {
    // 429 Rate Limit Handling with Backoff
    if (err.status === 429 && retryCount < 3) {
      const waitTime = (retryCount + 1) * 2000;
      console.log(`[AI] Rate limit hit. Retrying in ${waitTime}ms... (Attempt ${retryCount + 1}/3)`);
      await sleep(waitTime);
      return analyzeCommitSentiment(commitMessage, retryCount + 1);
    }
    
    console.error('[AI] Signal Processing FAILED:', err.message);
    return { 
      score: 50, 
      burnout: 0, 
      vibe: 'Static', 
      briefing: 'SIGNAL_DEGRADED', 
      recommendation: 'Verify system connection and retry ingestion.' 
    };
  }
}

export async function generateExecutiveDirective(statsSummary) {
  const systemPrompt = `
    You are the DevPulse Central Intelligence. 
    Analyze the provided engineering telemetry and output a single, powerful, and actionable directive.
    Tone: Industrial, Cold, High-Authority (e.g., HAL 9000 or a Terminal).
    Constraint: 20 words maximum.
    Stats: ${statsSummary}
  `;

  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [{ role: 'system', content: systemPrompt }],
      max_tokens: 100,
    });
    return res.choices[0].message.content.trim();
  } catch (err) {
    return "Maintain high-fidelity output. Monitor cognitive friction.";
  }
}

export function chunkCommits(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
