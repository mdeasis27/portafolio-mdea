# Proyecto 1 — Veredicto (spec de implementación)

**Skill:** evaluación / calibración de LLM-as-judge · **Wave 1** · primera piedra.
Fuentes: `B4 Groundtruth`, `A4 LLM-as-Judge with Human Calibration`, `C1 Model Regression`,
`C13 Eval Dataset Generator`.

## Caso de uso

Un equipo fintech corre un asistente documental sobre solicitudes de crédito e identidad
(los mismos documentos de `identidad-360` / `kyc-antifraude`). Antes de mergear un cambio de
prompt, modelo o retrieval, debe **probar con datos que no regresó**. Hoy nadie puede decir
si la versión del mes pasado era mejor. Veredicto es el harness: golden set + métricas de
retrieval + judge calibrado contra humanos (kappa) + auditoría de sesgos + gate en CI.

## Tesis (el número)

> Un juez automático no vale por su score, vale por su **acuerdo con humanos**. Veredicto
> reporta el kappa juez-humano contra el techo humano-humano, tres sesgos medidos
> (posición, longitud, auto-preferencia) y gatea el release en CI.

## Arquitectura (híbrida)

```
veredicto/
  app/                 # Next.js: landing / y demo /app (Vercel, demo-mode sin keys)
  components/
  lib/eval/            # núcleo real y determinista (TS), usado por la demo
  lib/eval/golden/     # corpus, preguntas, etiquetas humanas (committed)
  backend/             # implementación real (Python), tests, no desplegada
  design-system/ ai-kit/   # sincronizados del hub
```

### Núcleo (TS + Python, misma matemática, mismos fixtures)

| Módulo | Funciones |
|---|---|
| `retrieval` | `recallAtK`, `precisionAtK`, `mrr`, `ndcgAtK`, `averagePrecision` |
| `agreement` | `cohenKappa`, `weightedKappa(linear\|quadratic)`, `spearman`, `mae`, `ece`, `brier` |
| `bias` | `positionBias` (flip rate con orden invertido), `lengthBias` (corr score↔longitud), `selfPreference` |
| `diff` | `compareRuns` → delta de pass-rate, regresiones/mejoras por caso, severidad (warn > 3 %, critical > 8 %) |
| `harness` | `runEval(config)` → `RunResult` reproducible |

**Tradeoff a defender:** la matemática está duplicada en TS (para la demo en el navegador,
Vercel no corre Python) y en Python (harness autoritativo). Se mitiga con **fixtures de
respuesta conocida compartidos** (`fixtures/agreement.json`) que ambos tests consumen; el
test de equivalencia falla si divergen.

### Demo mode (obligatorio, sin keys)

`demo-judge` determinista (solapamiento léxico + verificación de cita) sobre el golden set
committed ⇒ la demo calcula **métricas reales offline**. El judge determinista tiene sesgos
conocidos a propósito, para que la auditoría muestre números no triviales. Modo live: BYOK
vía `ai-kit`.

### Backend real (no desplegado)

FastAPI opcional + CLI `python -m veredicto run`. Judge abstracto (`Protocol`) con adaptador
LLM y `FakeJudge` determinista para tests sin red. `pytest` con los fixtures compartidos.

## Ship gate (criterios de "terminado")

- [ ] Golden set ≥ 40 preguntas, estratificado (single/multi-hop/agregación/fuera de alcance).
- [ ] Benchmark de retrieval: 3 configuraciones (dense / sparse / híbrido+rerank) con tabla.
- [ ] Calibración: kappa juez-humano **vs** humano-humano, por criterio.
- [ ] Tres sesgos medidos y publicados; position-swap consistency reportada con el kappa.
- [ ] Gate CI: un PR con cambio deliberadamente malo falla (demostrado).
- [ ] Equivalencia TS↔Python sobre `fixtures/agreement.json`.
- [ ] README result-first + caso de estudio 5-H2 en el hub.

## Riesgos / trampas (de los PDFs)

Escala 1–10 en vez de ordinal ⇒ ruido. Sin baseline humano ⇒ scores infalsables. Juzgar con
el mismo modelo que generó. Tuning de rúbrica sobre los mismos ejemplos que se reportan
(leakage). Eyeballing de 5 queries.
