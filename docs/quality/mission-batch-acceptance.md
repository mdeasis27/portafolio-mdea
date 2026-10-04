# Retrieval, agent budget and document policy — batch evidence

## English

Manuel approved this three-project implementation on 2026-10-02. Veredicto, Mesa, Doorman and the hub use `feat/evaluation-agent-policy-missions`. Prior modified and untracked work remains intact; no commit, push, merge, deploy, publication or secret-store write was performed.

### What changed

- **Veredicto:** optional prediction and simultaneous selected/BM25 ranking, precision, recall and local gate on the same committed query, corpus and top-3 limit. The gate requires relevant labels, recall >=0.5 and no regression. Questions without relevant labels are unscored. English labels translate all 24 benchmark questions for display while retrieval keeps their original Spanish text. Existing calibration remains reference data.
- **Mesa:** selected step cap versus 12 steps with identical task, token cap and review allowance. The one-step challenge keeps 10,000 modeled token units; existing presets remain available. Consumed work, draft availability, approval and budget stop are distinct. Pre-step checks can allow token overrun before the next check; that existing limitation is disclosed, not silently redesigned.
- **Doorman:** policy on/off on identical document text. Requested and simulated permitted operations, rules and policy blocks are inspectable. Classification appears at step 2; tool authorization waits for step 3. English and Spanish presets have equivalent business intent; lexical rule counts need not match between translated texts. No external action is performed.
- All three preserve inputs, presets, reset, cancellation, existing scenes, optional predictions, terminal-only comparisons, collapsible traces and bilingual implementation/production notes.

### Evidence

See [command results](mission-batch-commands.json), [initial React markup](mission-batch-markup.json), [acceptance manifest](mission-batch-acceptance.json) and [execution ledger](mission-batch-progress.md). Logs are `docs/quality/mission-batch-{test,lint,types,build}.log` in each repository. Lint covers frontend/source/configuration and excludes unchanged backend caches. The installed Next environment loader is primed from the empty generated verification directory; existing secret files are not loaded.

Final results: **109 tests, 16 successful commands, six initial bilingual component renders and two Doorman policy-sequence renders**. [Artifact checks](mission-batch-artifacts.json) also verify eight generated JavaScript scripts, local review links, shared kit copies and 12 documentation files unchanged on a second generation. These checks do not establish browser interaction or visual quality.

Regression tests were observed failing before implementation, then passing. Independent read-only review found an empty-retrieval approval, premature policy styling, untranslated presets and unsafe numeric inputs. Targeted failures were reproduced and corrected. Tests cover equal results, failed/scored boundaries, callback cancellation, invalid budgets and the Spanish email-request consequence. Six initial EN/ES component renders check ordering, absent early results, optional prediction and notes; additional Doorman renders check that classification does not borrow the final tool block.

Generated review entry: `.component-labs/recruiter-journey/preview.html`, whose review navigation includes the three new missions. Direct entries: `.component-labs/veredicto/preview.html`, `.component-labs/mesa/preview.html`, `.component-labs/doorman/preview.html`. Generate with `node scripts/build-mission-previews.mjs veredicto mesa doorman recruiter-journey`.

### Pending

2026-10-02 locale-navigation correction: the owner reported seeing only English in Veredicto. English remains the default; generated previews now expose full English/Español links, react to `#en`/`#es` changes and preserve the language across project links. A source-script regression test reproduced the missing hash-change handling and passed after correction. This verifies navigation logic in a JavaScript test context, not Chrome execution. Direct Spanish entry: `.component-labs/veredicto/preview.html#es`.

Fresh screenshots, browser interaction, keyboard, reduced motion, 390px mobile layout, full HTTP routes, integrated homepage and server image optimization remain unverified. The previous owner approval applies to the earlier six-mission pilot. Existing screenshots/reports retain previous-stage labels and are not new evidence. Prior denials remain binding; no alternate local-file browser mechanism or background server was attempted.

Review the new previews in both languages: change inputs after predicting, use all presets/reset, inspect the terminal comparison, cancel/restart, choose an unanswerable Veredicto question, limit Mesa tokens so both choices stop, and use Doorman's `send an email` case to distinguish no lexical detection from a tool block. Publication is a separate confirmation gate. Twelve projects remain for future agreed batches.

## Español

Se implementó el lote aprobado de **Veredicto, Mesa y Doorman**, conservando trabajo previo, controles y escenas. Los cuatro repositorios usan `feat/evaluation-agent-policy-missions`. No se hizo commit, push, merge, despliegue, publicación ni escritura de secretos.

Veredicto compara búsqueda elegida y BM25 sobre los mismos datos; exige etiquetas relevantes, recall mínimo de 0.5 y ausencia de regresión. Sin etiquetas no aprueba. Las 24 preguntas tienen etiquetas inglesas de presentación sin cambiar el conjunto original. Mesa compara máximos de pasos manteniendo tarea, tokens y revisión; muestra trabajo consumido y distingue borrador, aprobación y detención. Sus unidades son simuladas y se explica el posible exceso de tokens antes de la siguiente comprobación. Doorman compara ambas políticas sobre el mismo documento; muestra clasificación antes de autorización y no ejecuta acciones externas. Los ejemplos tienen versión española equivalente.

Los informes enlazados registran pruebas, lint, tipos, builds y renderizado estático bilingüe. La revisión independiente detectó errores reales, reproducidos con pruebas y corregidos. Estos resultados no certifican el funcionamiento en navegador ni HTTP.

Pasaron **109 pruebas, 16 comandos, seis renderizados iniciales bilingües y dos renderizados de la secuencia de Doorman**. También se verificaron ocho scripts generados, enlaces locales, copias del kit y estabilidad de los 12 documentos al regenerarlos. Estas comprobaciones no certifican interacción ni calidad visual.

Las vistas nuevas están enlazadas desde `.component-labs/recruiter-journey/preview.html`. Siguen pendientes tu revisión visual de este lote, capturas nuevas, teclado, movimiento reducido, móvil a 390px, rutas HTTP, portada integrada e imágenes del servidor. La aprobación visual anterior cubre el piloto de seis misiones. Se conservaron los informes anteriores y no se reintentaron acciones denegadas.

Tras el reporte de que Veredicto solo se mostraba en inglés, se hizo visible el selector «English / Español» y se corrigió la respuesta a `#en`/`#es` y la conservación del idioma al cambiar de demo. La prueba de lógica pasó; no certifica ejecución en Chrome. La entrada directa española es `.component-labs/veredicto/preview.html#es`.

Para revisar: cambiar datos tras predecir, probar escenarios/reinicio, revelar comparación final, cancelar/reiniciar, elegir preguntas sin evidencia en Veredicto, limitar tokens en Mesa y comparar clasificación/autorización en Doorman. Los 12 proyectos restantes y la publicación requieren alcances y confirmaciones posteriores.
