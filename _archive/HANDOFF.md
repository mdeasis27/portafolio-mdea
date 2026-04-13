# Portafolio Manuel De Asís — Handoff Document

**Fecha:** 2026-04-08
**Propósito:** Documento auto-contenido para arrancar el proyecto de portafolio separado de Job-Search. Un Claude nuevo en una sesión fresca debe poder leer este archivo y tener contexto completo para continuar el trabajo.

---

## 1. Quién es Manuel (perfil para el portafolio)

- **Ejecutivo senior** con MBA del IE Business School
- **Background funcional:** finanzas, operaciones, estrategia
- **Experiencia relevante:** ex-Rappi Card, ex-Grupo MAG
- **Diferenciador clave:** **"Executive who builds"** — finance/ops executive que también construye software en producción (full-stack con Supabase/Vercel, multi-agent systems con Claude Code, deploys reales)
- **Objetivo profesional actual:** roles senior (Head of / Chief of Staff / PM Fintech / Strategic Finance / Ops Lead) en startups fintech o SaaS, serie B-C, **100% remote global o LATAM**
- **Filtro duro:** solo remote. Descarta hybrid, on-site, y remote-US-only
- **LinkedIn:** linkedin.com/in/manuel-de-asis

**Por qué el framing "executive who builds" es el diferenciador:**
La mayoría de ejecutivos en finanzas/ops presentan decks. La mayoría de builders presentan CRUD apps. Manuel es raro porque hace las dos cosas: lleva un P&L y al mismo tiempo shippeó career-ops (el sistema multi-agente que está usando para su propia búsqueda). Esto es una señal que ningún recruiter puede ignorar, y es la tesis central del portafolio.

---

## 2. Inventario de proyectos (auditado 2026-04-08)

Manuel tiene **22 proyectos** bajo `C:\Proyectos\`. Clasificación por publishability:

### 🟢 Publishable confirmado (1)

- **AI_Vertical** — Vertical AI Opportunity Analyzer. Next.js 15, pnpm workspace. Input: tipo de negocio + geografía → 7 módulos de análisis estratégico (TAM/SAM/SOM, competidores, GTM, pricing, scale). **Único proyecto que Manuel autorizó publicar como case study público.** Fit perfecto para el framing "executive who builds".

### 🟡 Publishable con limpieza

- **scrapers/LeadHunter** — AI lead gen hospitality México beach destinations. Scrapea Google Maps/TripAdvisor/Facebook. Riesgo ToS. Publicar como case study sin código o con disclaimer educational.
- **agents/AI-First-Company** — Master prompt v3 para AI-First company (1 CEO + 14 agents, 6 departamentos). Publicable como artículo/thought leadership, no como repo. Diferenciador fuerte por framing ejecutivo.
- **automation/n8n-builder** — Harness Claude + n8n MCP + 7 skills. Template para builders.
- **apps/MisDineros** — Fintech personal. Necesita revisión de data privada antes de publicar.

### 🔴 NO publishable — contienen info sensible (confirmado por Manuel)

Inicialmente parecían candidatos fuertes pero Manuel confirmó que tienen data de clientes, credenciales, o IP de terceros:
- **Agentes_Resolveer** — inicialmente parecía el proyecto más sustantivo
- **agents/PropIA (InmoIA BCS)** — agente inmobiliario BCS
- **automation/yt-to-notebooklm** — personal intelligence tool
- **bots/MagpieBot** — Telegram bot personal

Pueden seguir siendo relevantes como experiencia interna (proof points en CV, historias en entrevista), **pero NO como case study con código/demos públicas**. No re-recomendar como portafolio público sin reclasificación explícita de Manuel.

### 🔴 NUNCA publicar

- **automation/Refacciones BMW** — data de operaciones Grupo MAG (ex-empleo). IP de empleador + data de clientes/precios/inventario
- **scrapers/MLS_Scraper** — viola ToS del listing service
- **tools/Obsidian_Brain** — second brain personal con notas privadas
- **docs/Fractional_CFO, docs/Descargas_SAT, docs/mi-workspace** — documentos personales, no proyectos de código

### ⚫ Skeletons / vacíos (ni publicar ni borrar)

Resolveer_LP, agents/Paperclip, apps/git-landing, apps/Resolveer_V2, apps/resolveer-brand (publicable solo como brand system de Resolveer, no como proyecto técnico), bots/AgendaBot, bots/SoporteBot, tools/GSD, scrapers/Web_Scraper, automation/n8n-flujos, automation/Security_Audit, automation/taskai, learning/Lab10_Builders.

---

## 3. Case study #1 — career-ops

**El primer case study del portafolio ya está escrito.** Vive en `01-career-ops.md` (en esta misma carpeta). Es un case study completo de ~9KB con:

- TL;DR con el framing "executive who builds"
- Problema (por qué el job search tradicional está roto para candidatos senior)
- Approach (arquitectura del pipeline de 13 modes)
- Diagrama ASCII del flujo
- Decisiones de diseño clave (filesystem as DB, Playwright for verification, archetype matching, ethical hard stop)
- Resultados reales de la primera semana (métricas concretas)
- Learnings (incluyendo insights sobre biases, "remote is a lie 70% of the time", por qué el CV generado fue mejor que el manual)
- Tradeoffs honestos
- Stack
- Meta-punto: por qué este proyecto *es* la prueba del framing

**Estado:** escrito, listo para publicar. Le falta:
- Link al repo público (cuando Manuel lo suba)
- Link al live demo (dashboard estático planeado en Vercel)
- Link al CV generado por el sistema
- Decisión sobre si abrir el código completo o solo el case study

**Importante:** career-ops es un fork customizado del proyecto original de santifer (github.com/santifer/career-ops). Manuel adaptó: arquetipos (fintech/ops en lugar de AI roles), filtros de remote, config personal. El case study da crédito explícito al trabajo original.

---

## 4. Ruta de publicación propuesta (30 días)

Esta es la cadencia sugerida. **Calidad sobre cadencia** — Manuel prefiere 1 case study/mes bien hecho a forzar publicaciones semanales.

| Semana | Entregable |
|---|---|
| 1 | Case study career-ops (ya escrito — solo falta hosting + links) |
| 2 | Case study AI_Vertical + decidir dominio del portafolio hub |
| 3 | Case study Agentes_Resolveer *(REVISAR — ahora está marcado como sensitive)* + publicar hub v1 |
| 4 | Case study PropIA *(REVISAR — sensitive)* + artículo "AI-First Company" como thought leadership |

**Nota importante sobre las semanas 3-4:** la lista original incluía Agentes_Resolveer y PropIA pero fueron reclasificados como NO publishable. **Sustitutos sugeridos:**
- Semana 3: case study de **LeadHunter** (con disclaimer ToS) o **n8n-builder**
- Semana 4: artículo thought leadership **"AI-First Company"** (sigue siendo válido como artículo, no como repo)

---

## 5. Cadencia de publicación — regla del usuario

**NO empujar "publica cada día" o "publica cada semana".** Manuel confirmó que el ritmo correcto para su perfil es:
- **1 case study/mes** bien hecho
- **1 proyecto nuevo cada 6-8 semanas**

Razón: como ejecutivo senior, la calidad y profundidad importan mucho más que la frecuencia. Publicar mediocre es peor que no publicar.

---

## 6. Decisiones pendientes para el proyecto de portafolio

1. **Stack del hub:** Next.js 15 + Vercel (default assumption) vs. algo más minimal (Astro, MDX puro)
2. **Dominio:** ¿mdea.dev? ¿manueldeasis.com? ¿algo más? *(pregunta abierta)*
3. **Código público vs. privado:** ¿abrir el repo de career-ops (con info sanitizada) o solo publicar el case study?
4. **Dashboard de career-ops:** el case study menciona "next iteration: static Next.js dashboard on Vercel" — esta es una feature prometida. Decidir si construirlo.
5. **CV público:** ¿subir el CV generado por career-ops al portafolio? Decisión pendiente sobre privacidad.
6. **CTA del portafolio:** ¿contact form? ¿Calendly? ¿LinkedIn directo?

---

## 7. Principios de marca / tono

Del case study existente se deduce el tono que Manuel prefiere:

- **Honesto sobre tradeoffs** — no vende humo, enumera lo que no funciona
- **Métricas concretas** — "1 in 30 filter-to-submit ratio", no "mejoró mi productividad"
- **Framing ejecutivo, no técnico** — habla de recruiter psychology, P&L, no de LangChain
- **Credit donde toca** — menciona que career-ops es fork de santifer, no se atribuye autoría original
- **Ético** — "ethical hard stop at submit" es feature, no bug
- **Anti-spam** — el portafolio debe mandar la misma señal que career-ops: "apuesto por calidad, no por volumen"

---

## 8. Qué NO incluir en el portafolio (lecciones aprendidas)

- ❌ No publicar los 4 proyectos marcados como sensitive (Agentes_Resolveer, PropIA, yt-to-notebooklm, MagpieBot)
- ❌ No incluir nada de Refacciones BMW, MLS_Scraper, Obsidian_Brain, docs/*
- ❌ No incluir CVs viejos ni info de ex-empleadores sin anonimizar
- ❌ No prometer el dashboard estático hasta que esté construido (no overpromise)
- ❌ No clonar la estética de santifer.io — el case study ya le da crédito, el look debe ser propio

---

## 9. Contexto de por qué este documento existe

Este portafolio **vivía originalmente dentro de `C:\Proyectos\Job-Search\portfolio\case-studies\`**. Se separó en 2026-04-08 porque:

1. Job-Search debe tener un único propósito: buscar + preparar + automatizar aplicaciones
2. El portafolio es un esfuerzo independiente con su propio stack, dominio, hosting y cadencia
3. Mezclarlos genera cruce de contextos (¿por qué estoy editando markdown de portafolio cuando debería estar procesando el pipeline?)

**El proyecto Job-Search queda con:** career-ops/ (el sistema), el CV .docx, y los datos de pipeline. Todo lo relacionado con publicar trabajos termina aquí en `C:\Proyectos\portafolio-mdea\`.

---

## 10. Archivos en esta carpeta

- `HANDOFF.md` — este documento
- `01-career-ops.md` — primer case study (career-ops system)

Cualquier case study futuro debe ir numerado: `02-ai-vertical.md`, `03-...`.

---

## 11. Siguientes pasos sugeridos (cuando arranques el proyecto de portafolio)

En orden de prioridad:

1. **Decidir stack + dominio** del hub (Next.js 15 + Vercel es el default razonable)
2. **Mover estos .md a una estructura de proyecto real** (ej: `src/content/case-studies/` o `content/`)
3. **Escribir el case study #2 — AI_Vertical** (único otro proyecto 🟢)
4. **Construir v1 del hub** con los 2 case studies + bio + CTA
5. **Deploy a Vercel**
6. **Compartir link en LinkedIn** con un post que enmarque la tesis "executive who builds"
7. **Iterar mensualmente** con nuevo case study o artículo

---

**Fin del handoff.** Este documento es suficiente para arrancar una sesión nueva de Claude con contexto completo del portafolio.
