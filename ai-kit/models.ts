// ai-kit/models.ts
// Source of truth for free OpenRouter models used across MDEA portfolio projects.
// When a model is deprecated, reorder or replace here and run ai:sync across projects.

export type ModelId = string;

export const FREE_MODELS_PRIORITY: readonly ModelId[] = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-chat-v3:free",
] as const;

export type ModelSelection = {
  model: ModelId;
  discoveredAt: number;
  fallbackIndex: number;
};
