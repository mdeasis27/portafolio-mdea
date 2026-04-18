# Fase 4 — Siblings Unification

**Fecha:** 2026-04-18  
**Scope:** Los 5 siblings del portfolio (agente-riesgo, identidad-360, radar-proveedores, kyc-antifraude, agente-cobranzas)  
**Estado:** diseño aprobado, pendiente de implementación

---

## Problema

Los 5 siblings tienen inconsistencias respecto al hub:
- Sin ThemeProvider ni ThemeToggle (no soportan dark mode)
- Landing pages largas con hero sections, logos y CTAs hardcodeados en `bg-violet-600`
- Archivos `ai-kit` desactualizados — fixes aplicados al hub post-PR no propagados
- No están visualmente "ligados" al hub (sin back-link a portafolio-mdea)

## Objetivo

Unificar la estructura de los siblings con el hub: header compartido, layout simple, dark mode por defecto, botones con design tokens.

---

## Diseño

### Estructura target de cada sibling (landing page)

```
[← Manuel de Asis]                    [ThemeToggle]   ← header sticky
─────────────────────────────────────────────────────
  [Nombre del proyecto]
  [Descripción de una línea]

  [Stack badge 1]  [Stack badge 2]  [Stack badge N]

  [Ver demo]  [GitHub]
─────────────────────────────────────────────────────
```

- Sin hero sections, sin logos de proyecto, sin "Cómo funciona", sin secciones multi-bloque.
- El header usa el patrón del hub: sticky, `bg-background/70 backdrop-blur-md`, back-link "← Manuel de Asis" a la izquierda, ThemeToggle a la derecha.
- Los CTAs usan `<Button>` del design-system (token `--accent`, no colores hardcodeados).
- El demo vive en `/app` dentro del mismo sibling — la landing es solo la presentación.

### ThemeProvider

Cada sibling recibe:
- `components/theme-provider.tsx` — copia exacta del hub
- `components/theme-toggle.tsx` — copia exacta del hub
- `layout.tsx` actualizado:
  ```tsx
  <html lang="es" className={`${fontVariables} h-full antialiased`} suppressHydrationWarning>
    <body className="min-h-full flex flex-col">
      <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
        {children}
      </ThemeProvider>
    </body>
  </html>
  ```
- `next-themes` añadido a `package.json` si no está presente

### Corrección de ai-kit

Los archivos `ai-kit/` de los siblings pueden estar desactualizados. Los fixes del hub a propagar:
- `webpackIgnore` magic comments en dynamic imports de providers
- `try-catch` wrapping en dynamic imports para que `MODULE_NOT_FOUND` sea reintentable
- Remoción del archivo huérfano `rate-limit.tsx` (shadowed `rate-limit.ts`)

Proceso: diff de cada archivo `ai-kit/` del sibling vs hub → sobrescribir con versión del hub.

### Botones

- Eliminar clases `bg-violet-600 / hover:bg-violet-500` de CTAs principales
- Reemplazar con `<Button>` o `<Button asChild>` según si el CTA es `<Link>` o `<button>`
- Los badges semánticos (emerald/amber/red para decisiones de riesgo) no se tocan

---

## Fases de ejecución

| Fase | Descripción | Estrategia |
|------|-------------|------------|
| A | Fix errores funcionales (ai-kit sync) | Piloto en agente-riesgo |
| B | Header + ThemeProvider/Toggle | Piloto en agente-riesgo, luego x4 paralelo |
| C | Simplificar landing page | Piloto en agente-riesgo, luego x4 paralelo |
| D | Default dark mode | Incluido en Fase B (ThemeProvider config) |
| E | Uniformizar botones con `<Button>` | Incluido en Fase C (reescritura de landing) |
| F | Mergear 6 PRs | Tras QA visual de todos los previews |

**Estrategia:** sibling piloto (agente-riesgo) valida el patrón → agentes paralelos para los 4 restantes → merge.

---

## Archivos clave

| Ruta | Acción |
|------|--------|
| `{sibling}/components/theme-provider.tsx` | Crear (copiar hub) |
| `{sibling}/components/theme-toggle.tsx` | Crear (copiar hub) |
| `{sibling}/app/layout.tsx` | Modificar |
| `{sibling}/app/page.tsx` | Reescribir (landing simplificada) |
| `{sibling}/ai-kit/*.ts(x)` | Sync desde hub |
| `{sibling}/package.json` | Añadir `next-themes` si falta |

---

## Criterios de éxito

- [ ] Vercel preview de cada sibling carga sin errores
- [ ] Dark mode activo por defecto en todos
- [ ] ThemeToggle visible arriba a la derecha en todos
- [ ] Back-link "← Manuel de Asis" funcional en todos
- [ ] Botones usan token `--accent`, no `bg-violet-600`
- [ ] Demo (`/app`) sigue funcionando en cada sibling
- [ ] 6 PRs mergeados a main
