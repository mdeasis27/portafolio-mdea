// portfolio.config.mjs
// Source of truth for portfolio siblings and which kits each consumes.
// Consumed by scripts/brand-propagate.mjs and scripts/ai-propagate.mjs.

/**
 * @typedef {Object} SiblingEntry
 * @property {string} name           - directory name, resolved relative to the hub as `../<name>`.
 * @property {Array<'brand'|'ai'>} kits - kits this sibling consumes.
 */

/** @type {{ siblings: SiblingEntry[] }} */
export default {
  siblings: [
    { name: 'identidad-360', kits: ['brand', 'ai'] },
    { name: 'agente-riesgo', kits: ['brand', 'ai'] },
    { name: 'radar-proveedores', kits: ['brand', 'ai'] },
    { name: 'kyc-antifraude', kits: ['brand', 'ai'] },
    { name: 'agente-cobranzas', kits: ['brand', 'ai'] },
    { name: 'veredicto', kits: ['brand', 'ai'] },
    { name: 'evidencia', kits: ['brand', 'ai'] },
    { name: 'doorman', kits: ['brand', 'ai'] },
    { name: 'warmstart', kits: ['brand', 'ai'] },
  ],
};
