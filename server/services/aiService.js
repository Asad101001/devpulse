import Groq from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Analyzes commit sentiment via Groq
 */
export async function analyzeCommitSentiment(commitMessage) {
  const systemPrompt = `
    You are the DevPulse Brutalist Sentiment Engine. 
    Analyze the following commit message and provide a JSON response.
    Fields:
    - score: (0-100) where 100 is extremely positive/productive and 0 is extremely frustrated/angry.
    - burnout: (0-100) likelihood of burnout based on tone.
    - vibe: (string) one word category (e.g., productive, tired, furious, efficient, chaotic).
    - briefing: (string) 10-word max intense brutalist summary.
    Return ONLY JSON.
  `;

  try {
    const res = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: commitMessage }
      ],
      response_format: { type: "json_object" },
      max_tokens: 150,
    });
    return JSON.parse(res.choices[0].message.content);
  } catch (err) {
    console.error('[AI] Groq Analysis failed:', err.message);
    return { score: 50, burnout: 0, vibe: 'unknown', briefing: 'SIGNAL_LOST' };
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
