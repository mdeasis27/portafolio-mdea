// scripts/test-ai-kit.ts
// Smoke test for ai-kit v2 multi-provider router.
// Run: npx tsx scripts/test-ai-kit.ts

import { config } from "dotenv";
config({ path: ".env.keys" });
config({ path: ".env.local" });

import { chat } from "../ai-kit/router";
import type { ChatOptions } from "../ai-kit/types";

const PROMPT: ChatOptions["messages"] = [
  { role: "system", content: "Responde siempre en español, máximo 2 oraciones." },
  { role: "user", content: "¿Cuál es la capital de Francia?" },
];

async function testProvider(name: string, opts: ChatOptions) {
  try {
    const res = await chat(opts);
    console.log(`✅ [${name}] provider=${res.provider} model=${res.model} latency=${res.latency_ms}ms`);
    console.log(`   text: ${res.text.slice(0, 120)}`);
    return true;
  } catch (err) {
    console.error(`❌ [${name}] ${err instanceof Error ? err.message : err}`);
    return false;
  }
}

async function main() {
  console.log("=== ai-kit v2 smoke test ===\n");

  // 1. Default router (Gemini → Groq → OpenRouter)
  await testProvider("default-router", { messages: PROMPT });

  // 2. Force Groq only (by temporarily removing Gemini key from env)
  const savedGemini = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  await testProvider("groq-only", { messages: PROMPT });
  process.env.GEMINI_API_KEY = savedGemini;

  // 3. Force OpenRouter only
  const savedGroq = process.env.GROQ_API_KEY;
  delete process.env.GROQ_API_KEY;
  delete process.env.GEMINI_API_KEY;
  await testProvider("openrouter-only", { messages: PROMPT });
  process.env.GROQ_API_KEY = savedGroq;
  process.env.GEMINI_API_KEY = savedGemini;

  // 4. AbortSignal test (10ms timeout — should fail gracefully)
  const ac = new AbortController();
  setTimeout(() => ac.abort(), 10);
  try {
    await chat({ messages: PROMPT, signal: ac.signal });
    console.log("⚠️  [abort-test] Expected abort but succeeded");
  } catch {
    console.log("✅ [abort-test] AbortSignal propagated correctly");
  }

  console.log("\n=== done ===");
}

main().catch(console.error);
