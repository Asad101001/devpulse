import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Analyzes commit sentiment via Groq
 */
export async function analyzeCommitSentiment(commitMessage) {
  const systemPrompt = `
    You are the Pulse IO Advanced Sentiment Engine.
    Analyze the following commit message and provide a professional yet industrial JSON response.
    Fields:
    - score: (0-100) where 100 is extremely positive/productive and 0 is extremely frustrated.
    - burnout: (0-100) likelihood of burnout based on tone and complexity.
    - vibe: (string) one word category (e.g., Focused, Exhausted, Agile, Efficient, Chaotic).
    - briefing: (string) 5-word max concise summary.
    - recommendation: (string) 15-word max actionable engineering advice.
    Return ONLY JSON.
  `;

  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
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
    return { 
      score: 50, 
      burnout: 0, 
      vibe: 'Static', 
      briefing: 'SIGNAL_DEGRADED', 
      recommendation: 'Verify system connection and retry ingestion.' 
    };
  }
}

/**
 * Utility to split array into chunks
 */
export function chunkCommits(arr, size) {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

/**
 * Utility for sleep
 */
export function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
