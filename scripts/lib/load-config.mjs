// scripts/lib/load-config.mjs
// Loads and validates portfolio.config.mjs from the hub root.
import path from "node:path";
import { existsSync } from "node:fs";
import { pathToFileURL } from "node:url";

const VALID_KITS = new Set(["brand", "ai"]);

export async function loadPortfolioConfig(hubDir) {
  const configPath = path.join(hubDir, "portfolio.config.mjs");
  if (!existsSync(configPath)) {
    throw new Error(`portfolio.config.mjs not found at ${configPath}`);
  }

  const mod = await import(pathToFileURL(configPath).href);
  const config = mod.default;

  if (!config || typeof config !== "object") {
    throw new Error(`portfolio.config.mjs must export default an object`);
  }
  if (!Array.isArray(config.siblings)) {
    throw new Error(`portfolio.config.mjs: siblings must be an array`);
  }

  // Pass 1: validate names and detect duplicates
  const seen = new Set();
  for (const s of config.siblings) {
    if (typeof s?.name !== "string" || !s.name) {
      throw new Error(`portfolio.config.mjs: each sibling must have a non-empty "name"`);
    }
    if (seen.has(s.name)) {
      throw new Error(`portfolio.config.mjs: duplicate sibling "${s.name}"`);
    }
    seen.add(s.name);
  }

  // Pass 2: validate kits and directory existence
  for (const s of config.siblings) {
    if (!Array.isArray(s.kits) || s.kits.length === 0) {
      throw new Error(`portfolio.config.mjs: sibling "${s.name}" must declare at least one kit`);
    }
    for (const k of s.kits) {
      if (!VALID_KITS.has(k)) {
        throw new Error(`portfolio.config.mjs: sibling "${s.name}" has unknown kit "${k}"`);
      }
    }

    const siblingDir = path.resolve(hubDir, "..", s.name);
    if (!existsSync(siblingDir)) {
      throw new Error(`portfolio.config.mjs: sibling "${s.name}" directory does not exist at ${siblingDir}`);
    }
  }

  return config;
}
