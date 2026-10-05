# Mission pilot — scoped evidence / Piloto de misiones — evidencia acotada

## English

The approved pilot extends guided decisions to Agente Riesgo, Ensayo and Warmstart and refines Evidencia, Compuerta, Destilación and the hub. It remains unpublished. All seven repositories use `feat/decision-mission-pilot`; existing modified and untracked work was preserved.

### Implemented

- Editable inputs precede optional prediction and execution. Trace steps can be expanded while playback controls remain visible.
- Risk compares review thresholds 20/50 on identical evidence; observed coverage is a neutral signal rather than an invented pass/fail gate.
- Ensayo computes Welch statistics at alpha .01/.10 on identical samples, rejects undefined tests and explains that significance does not establish business value.
- Warmstart compares the selected lexical similarity threshold with .95 using identical labeled queries, order and initial cache. Custom inputs are bounded. Illustrative billing aggregates integer cents with one final upward rounding per batch.
- Evidencia describes lexical term coverage without implying semantic proof. Existing hub example captures are hidden behind an explicit outcome disclosure.
- Bilingual READMEs and case studies explain calculations, tradeoffs, production requirements and the age of screenshot evidence.

### Executable evidence

See [command results](mission-pilot-commands.json), [initial markup checks](mission-pilot-markup.json) and [acceptance manifest](mission-pilot-acceptance.json). Command logs remain in each repository's `docs/quality/mission-pilot-*.log`. Lint covers frontend/source/configuration and excludes unchanged backend caches. Builds use the installed Next environment loader with an empty generated directory so existing secret files are not loaded.

Final evidence: 141 TypeScript/Node tests, 28 successful test/lint/type/build commands, 14 initial bilingual markup checks and four additional Python billing tests. The Python checks used available Python 3.11; they do not certify the declared >=3.12 backend runtime. Generated preview JavaScript was syntax-checked and 24 generated documentation files remained unchanged on a second generation.

Static rendering verifies 14 initial locale/component combinations, input/prediction/run ordering, absent premature comparisons, bilingual controls and closed hub disclosures. A separate real visualization render verifies that risk coverage remains a neutral signal. These are markup checks, not browser checks.

Generated local review: `.component-labs/recruiter-journey/preview.html`. Its navigation opens all six missions with controlled locale handling. It is a component preview, not a complete Next homepage or HTTP application.

### Pending and blocked

Manuel manually reviewed the generated local preview in Chrome and reported “Ya lo revise se ve bien” on 2026-10-02. Visual presentation is accepted by the owner. This does not establish which languages, viewport sizes, keyboard paths or interaction cases were exercised; automated browser verification and fresh screenshots remain pending. See [manual review record](mission-pilot-owner-review.json).

- Fresh browser interactions, keyboard, reduced-motion, 390px layouts and screenshots remain unverified. Browser security rejected local file navigation; a Playwright cache directory was access-denied. No equivalent workaround was attempted. Previous-stage screenshots and reports remain intact and explicitly labeled.
- Full Next routes, integrated homepage, server image optimization and current public links remain unverified. Prior denials of cache deletion and background Next launch remain binding.
- Manuel approved Compuerta's integer-cent migration. Its TypeScript/Python simulators and API now use explicit cent fields, exact per-call rounding and reconciled breakdowns. See the [contract migration and integration limits](../../../compuerta/docs/quality/integer-cent-contract.md). This pilot does not certify monetary paths in the other 15 projects.
- No publish, deploy, push, merge or secret-store write occurred.

### Next review scope

Review the six missions manually in EN/ES, especially prediction invalidation after edits/reset, terminal-only comparisons, cancel/restart, the 40% risk coverage case, constant statistical samples, cache intent mismatch and the Destilación tie. Capture the current version only after this review. Then agree a project-specific batch for the remaining 15 projects; do not duplicate one generic comparison everywhere. Resolve HTTP verification through an explicitly permitted workflow before requesting approval for publication.

## Español

El piloto aprobado añade decisiones guiadas a Agente Riesgo, Ensayo y Warmstart y mejora Evidencia, Compuerta, Destilación y el hub. Sigue sin publicar. Los siete repositorios usan `feat/decision-mission-pilot` y conservan el trabajo modificado y sin seguimiento previo.

Manuel revisó manualmente la vista local en Chrome y confirmó «Ya lo revise se ve bien» el 2026-10-02. La presentación visual está aprobada por su propietario. Esa confirmación no especifica idiomas, tamaños de pantalla, navegación por teclado ni casos de interacción; no sustituye las comprobaciones automáticas o capturas pendientes.

Los controles preceden a la predicción opcional; las trazas se pueden desplegar. Riesgo compara políticas sobre la misma evidencia; Ensayo calcula estadística local y rechaza pruebas indefinidas; Warmstart compara similitud léxica con consultas etiquetadas y factura en centavos enteros. Evidencia explica cobertura léxica y el hub advierte antes de mostrar capturas que revelan resultados. La documentación es bilingüe y distingue cálculo, simulación e integración en vivo.

Los resultados ejecutables están en los informes enlazados arriba. Las 14 comprobaciones iniciales de componentes e idiomas verifican contenido y orden mediante renderizado estático; no certifican interacción ni diseño en navegador. La vista local generada es `.component-labs/recruiter-journey/preview.html`, con enlaces a las seis misiones.

Pasaron 141 pruebas TypeScript/Node, 28 comandos de pruebas/lint/tipos/build y cuatro pruebas monetarias adicionales de Python. Estas últimas usan Python 3.11 y no certifican el entorno backend declarado >=3.12. Se comprobó la sintaxis del JavaScript generado y la estabilidad de los 24 documentos al regenerarlos.

Siguen pendientes las interacciones en navegador, teclado, movimiento reducido, móvil a 390px y capturas nuevas. La política del navegador rechazó archivos locales y se denegó el acceso a un directorio de caché de Playwright; no se intentaron mecanismos equivalentes. Las capturas anteriores conservan su etiqueta de etapa previa. Tampoco están certificados las rutas HTTP completas, la portada integrada, las imágenes del servidor ni los enlaces públicos actuales.

Manuel aprobó la migración de Compuerta: sus motores TypeScript/Python y API usan campos explícitos de centavos, redondeo exacto por llamada y desgloses reconciliados. Consulta el contrato enlazado arriba. Este piloto no certifica los cálculos monetarios de los otros 15 proyectos. No se ha publicado, desplegado, hecho push o merge ni escrito en el almacén de secretos.

El siguiente alcance propuesto es revisar manualmente las seis misiones, obtener capturas actuales y acordar un lote concreto para los 15 proyectos restantes. La verificación HTTP debe resolverse con un mecanismo permitido antes de pedir autorización para publicar.
