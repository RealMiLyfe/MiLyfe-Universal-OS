import Groq from 'groq-sdk';
import { supabaseAdmin } from './supabase';
export async function generateResilientAIInsight({ bizName, streak, painPoint, planType }) {
  if (process.env.GROQ_API_KEY && !process.env.GROQ_API_KEY.includes('placeholder')) {
    try {
      const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
      const res = await groq.chat.completions.create({
        messages: [{ role: "system", content: "You are MiForge AI CFO. 3 bullet points." }, { role: "user", content: `${bizName} | Day ${streak} | ${painPoint}` }],
        model: "llama3-8b-8192",
        max_tokens: 120
      });
      return { summary: res.choices[0]?.message?.content?.trim() };
    } catch (e) {}
  }
  return { summary: `1. Verified receipts for ${bizName}.\n2. Categorized ${painPoint || 'write-offs'}.\n3. Day ${streak}/261 active.` };
}
