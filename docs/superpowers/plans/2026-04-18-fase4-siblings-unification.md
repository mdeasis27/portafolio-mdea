# Fase 4 — Siblings Unification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unificar los 5 siblings del portfolio con el hub: header compartido, dark mode por defecto, landing simple, botones con tokens.

**Architecture:** Piloto en agente-riesgo (Tasks 1–4) → validar → agentes paralelos para los 4 siblings restantes (Tasks 5–8) → merge de 6 PRs (Task 9). Cada sibling recibe ThemeProvider+Toggle, layout actualizado, nueva landing simple y su app existente movida a `/app`.

**Tech Stack:** Next.js 16, next-themes 0.4.6, lucide-react 1.8.0, @base-ui/react, Tailwind v4, buttonVariants pattern

---

## Mapa de archivos

| Sibling | Archivos que cambian |
|---------|----------------------|
| agente-riesgo | `package.json`, `components/theme-provider.tsx` (nuevo), `components/theme-toggle.tsx` (nuevo), `app/layout.tsx` |
| agente-riesgo | `app/page.tsx` (reescribir landing) |
| identidad-360 | ídem + mover `app/page.tsx` → `app/app/page.tsx` |
| radar-proveedores | ídem + mover `app/page.tsx` → `app/app/page.tsx` |
| kyc-antifraude | ídem + mover `app/page.tsx` → `app/app/page.tsx` |
| agente-cobranzas | ídem + mover `app/page.tsx` → `app/app/page.tsx` |

---

## Task 1: Instalar dependencias en agente-riesgo

**Repo:** `C:/Proyectos/proyectos-portafolio/agente-riesgo`  
**Branch:** `feat/design-v3-sync` (ya existe — hacer checkout)

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Checkout de la rama existente**

```bash
cd C:/Proyectos/proyectos-portafolio/agente-riesgo
git checkout feat/design-v3-sync
```

- [ ] **Step 2: Instalar next-themes y lucide-react**

```bash
pnpm add next-themes@^0.4.6 lucide-react@^1.8.0
```

- [ ] **Step 3: Verificar que aparecen en package.json**

```bash
grep -E "next-themes|lucide-react" package.json
```

Expected output:
```
"lucide-react": "^1.8.0",
"next-themes": "^0.4.6",
```

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore(deps): add next-themes and lucide-react"
```

---

## Task 2: Crear ThemeProvider y ThemeToggle en agente-riesgo

**Repo:** `C:/Proyectos/proyectos-portafolio/agente-riesgo`  
**Branch:** `feat/design-v3-sync`

**Files:**
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`

- [ ] **Step 1: Crear components/ si no existe**

```bash
mkdir -p C:/Proyectos/proyectos-portafolio/agente-riesgo/components
```

- [ ] **Step 2: Crear theme-provider.tsx**

Crear `components/theme-provider.tsx` con este contenido exacto:

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Crear theme-toggle.tsx**

Crear `components/theme-toggle.tsx` con este contenido exacto:

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/design-system/components/button";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/theme-provider.tsx components/theme-toggle.tsx
git commit -m "feat(theme): add ThemeProvider and ThemeToggle components"
```

---

## Task 3: Actualizar layout.tsx de agente-riesgo

**Repo:** `C:/Proyectos/proyectos-portafolio/agente-riesgo`  
**Branch:** `feat/design-v3-sync`

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Reemplazar el contenido de app/layout.tsx**

Reemplazar el archivo completo con:

```tsx
import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente de Riesgo",
  description: "Evalúa solicitudes de crédito, contratación y onboarding con IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/layout.tsx
git commit -m "feat(theme): wire ThemeProvider with dark default in layout"
```

---

## Task 4: Reescribir landing page de agente-riesgo

**Repo:** `C:/Proyectos/proyectos-portafolio/agente-riesgo`  
**Branch:** `feat/design-v3-sync`

**Files:**
- Modify: `app/page.tsx` (reescritura completa — la landing actual se reemplaza; el demo ya vive en `app/app/page.tsx` y no se toca)

- [ ] **Step 1: Reemplazar app/page.tsx con la nueva landing simplificada**

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/design-system/components/button";
import { cn } from "@/design-system/utils";

const STACK = [
  "Next.js 16",
  "LLM API",
  "Web search API",
  "Identity verification API",
  "TypeScript",
  "Tailwind v4",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link
            href="https://manueldeasis.com"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Manuel de Asis
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-24">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Agente de Riesgo
          </h1>
          <p className="text-lg text-muted-foreground">
            Motor de decisión autónomo que evalúa solicitudes de crédito,
            contratación y onboarding con IA.
          </p>
        </div>

        {/* Stack badges */}
        <div className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full shadow-[var(--shadow-border-light)] bg-[var(--gray-50)] px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap gap-3">
          <Link href="/app" className={cn(buttonVariants({ size: "default" }))}>
            Ver demo
          </Link>
          <a
            href="https://github.com/mdeasis27/agente-riesgo"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Verificar que el build pasa sin errores de TypeScript**

```bash
cd C:/Proyectos/proyectos-portafolio/agente-riesgo
pnpm build
```

Expected: build exitoso, sin errores de tipo ni de compilación.

Si hay error de tipo en `buttonVariants`, verificar que el import sea desde `@/design-system/components/button` (no `@/components/ui/button`).

- [ ] **Step 3: Commit y push**

```bash
git add app/page.tsx
git commit -m "feat(landing): simplify to hub-aligned layout with ThemeToggle"
git push origin feat/design-v3-sync
```

- [ ] **Step 4: Verificar deployment platform preview**

Abrir la URL del PR de agente-riesgo: https://github.com/mdeasis27/agente-riesgo/pull/1

Confirmar:
- [ ] La landing carga con dark mode activo
- [ ] ThemeToggle arriba a la derecha alterna light/dark
- [ ] "← Manuel de Asis" aparece arriba a la izquierda
- [ ] Stack badges y botones "Ver demo" / "GitHub" visibles
- [ ] `/app` carga el demo sin errores al hacer clic en "Ver demo"

Si todo pasa → continuar con Tasks 5–8. Si hay error → revisar el build log del PR en deployment platform antes de continuar.

---

## Task 5: Aplicar patrón a identidad-360

**Repo:** `C:/Proyectos/proyectos-portafolio/identidad-360`  
**Branch:** `feat/design-v3-sync`

**Files:**
- Modify: `package.json`
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx`
- Rename: `app/page.tsx` → `app/app/page.tsx` (la app actual pasa a vivir en `/app`)
- Create: `app/page.tsx` (nueva landing)

- [ ] **Step 1: Checkout y añadir deps**

```bash
cd C:/Proyectos/proyectos-portafolio/identidad-360
git checkout feat/design-v3-sync
pnpm add next-themes@^0.4.6 lucide-react@^1.8.0
```

- [ ] **Step 2: Crear components/theme-provider.tsx**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Crear components/theme-toggle.tsx**

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/design-system/components/button";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
```

- [ ] **Step 4: Actualizar app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Identidad 360° — Perfiles de Riesgo Crediticio",
  description:
    "Inteligencia de identidad para equipos de riesgo. Combina verificación documental (Identity verification API), señales web (Web search API) y síntesis por IA para un perfil 360° de crédito.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Mover la app actual a /app**

```bash
mkdir -p app/app
# En Git Bash (Windows): mover manualmente o usar git mv
git mv app/page.tsx app/app/page.tsx
```

- [ ] **Step 6: Crear la nueva landing app/page.tsx**

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/design-system/components/button";
import { cn } from "@/design-system/utils";

const STACK = [
  "Next.js 16",
  "Identity verification API",
  "Web search API",
  "TypeScript",
  "Tailwind v4",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link
            href="https://manueldeasis.com"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Manuel de Asis
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-24">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Identidad 360°
          </h1>
          <p className="text-lg text-muted-foreground">
            Perfiles de riesgo crediticio que combinan verificación documental,
            señales web y síntesis por IA.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full shadow-[var(--shadow-border-light)] bg-[var(--gray-50)] px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/app" className={cn(buttonVariants({ size: "default" }))}>
            Ver demo
          </Link>
          <a
            href="https://github.com/mdeasis27/identidad-360"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Build verify + commit + push**

```bash
pnpm build
git add .
git commit -m "feat: hub-aligned landing, ThemeProvider dark default, move app to /app"
git push origin feat/design-v3-sync
```

---

## Task 6: Aplicar patrón a radar-proveedores

**Repo:** `C:/Proyectos/proyectos-portafolio/radar-proveedores`  
**Branch:** `feat/design-v3-sync`

**Nota:** radar-proveedores tiene rutas adicionales `/history` y `/supplier/[name]` que pertenecen a la app. Al mover `page.tsx` a `/app`, estas rutas se quedan en su lugar (siguen siendo accesibles desde `/history`, `/supplier/...`). Los links internos dentro de la app actual que apunten a `/history` o `/supplier/...` no necesitan cambiar.

**Files:**
- Modify: `package.json`
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx`
- Rename: `app/page.tsx` → `app/app/page.tsx`
- Create: `app/page.tsx` (nueva landing)

- [ ] **Step 1: Checkout y deps**

```bash
cd C:/Proyectos/proyectos-portafolio/radar-proveedores
git checkout feat/design-v3-sync
pnpm add next-themes@^0.4.6 lucide-react@^1.8.0
```

- [ ] **Step 2: Crear components/theme-provider.tsx**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Crear components/theme-toggle.tsx**

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/design-system/components/button";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
```

- [ ] **Step 4: Actualizar app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Radar de Proveedores — Due Diligence con IA",
  description: "Due diligence automatizado de proveedores con inteligencia artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Mover app/page.tsx a app/app/page.tsx**

```bash
mkdir -p app/app
git mv app/page.tsx app/app/page.tsx
```

- [ ] **Step 6: Crear nueva landing app/page.tsx**

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/design-system/components/button";
import { cn } from "@/design-system/utils";

const STACK = [
  "Next.js 16",
  "AI SDK",
  "TypeScript",
  "Tailwind v4",
  "Zod",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link
            href="https://manueldeasis.com"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Manuel de Asis
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-24">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Radar de Proveedores
          </h1>
          <p className="text-lg text-muted-foreground">
            Due diligence automatizado: analiza proveedores con IA y genera
            reportes de riesgo en segundos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full shadow-[var(--shadow-border-light)] bg-[var(--gray-50)] px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/app" className={cn(buttonVariants({ size: "default" }))}>
            Ver demo
          </Link>
          <a
            href="https://github.com/mdeasis27/radar-proveedores"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Build verify + commit + push**

```bash
pnpm build
git add .
git commit -m "feat: hub-aligned landing, ThemeProvider dark default, move app to /app"
git push origin feat/design-v3-sync
```

---

## Task 7: Aplicar patrón a kyc-antifraude

**Repo:** `C:/Proyectos/proyectos-portafolio/kyc-antifraude`  
**Branch:** `feat/design-v3-sync`

**Nota:** kyc-antifraude tiene una ruta `/admin`. Al igual que en radar-proveedores, `/admin` permanece en su lugar y no se mueve. La nueva landing queda en `/`, la app principal en `/app`.

**Files:**
- Modify: `package.json`
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx`
- Rename: `app/page.tsx` → `app/app/page.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Checkout y deps**

```bash
cd C:/Proyectos/proyectos-portafolio/kyc-antifraude
git checkout feat/design-v3-sync
pnpm add next-themes@^0.4.6 lucide-react@^1.8.0
```

- [ ] **Step 2: Crear components/theme-provider.tsx**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Crear components/theme-toggle.tsx**

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/design-system/components/button";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
```

- [ ] **Step 4: Actualizar app/layout.tsx**

```tsx
import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "KYC Anti-Fraude · Verificación de Identidad",
  description: "Plataforma de onboarding KYC con decisión por IA — demo de portafolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Mover app/page.tsx a app/app/page.tsx**

```bash
mkdir -p app/app
git mv app/page.tsx app/app/page.tsx
```

- [ ] **Step 6: Crear nueva landing app/page.tsx**

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/design-system/components/button";
import { cn } from "@/design-system/utils";

const STACK = [
  "Next.js 16",
  "AI SDK",
  "TypeScript",
  "Tailwind v4",
  "Zod",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link
            href="https://manueldeasis.com"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Manuel de Asis
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-24">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            KYC Anti-Fraude
          </h1>
          <p className="text-lg text-muted-foreground">
            Plataforma de onboarding con verificación de identidad KYC y
            decisión automatizada por IA.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full shadow-[var(--shadow-border-light)] bg-[var(--gray-50)] px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/app" className={cn(buttonVariants({ size: "default" }))}>
            Ver demo
          </Link>
          <a
            href="https://github.com/mdeasis27/kyc-antifraude"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Build verify + commit + push**

```bash
pnpm build
git add .
git commit -m "feat: hub-aligned landing, ThemeProvider dark default, move app to /app"
git push origin feat/design-v3-sync
```

---

## Task 8: Aplicar patrón a agente-cobranzas

**Repo:** `C:/Proyectos/proyectos-portafolio/agente-cobranzas`  
**Branch:** `feat/design-v3-sync`

**Files:**
- Modify: `package.json`
- Create: `components/theme-provider.tsx`
- Create: `components/theme-toggle.tsx`
- Modify: `app/layout.tsx`
- Rename: `app/page.tsx` → `app/app/page.tsx`
- Create: `app/page.tsx`

- [ ] **Step 1: Checkout y deps**

```bash
cd C:/Proyectos/proyectos-portafolio/agente-cobranzas
git checkout feat/design-v3-sync
pnpm add next-themes@^0.4.6 lucide-react@^1.8.0
```

- [ ] **Step 2: Crear components/theme-provider.tsx**

```tsx
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
```

- [ ] **Step 3: Crear components/theme-toggle.tsx**

```tsx
"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/design-system/components/button";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="size-9"
    >
      {mounted ? (
        isDark ? (
          <Sun className="size-4" />
        ) : (
          <Moon className="size-4" />
        )
      ) : (
        <span className="size-4" />
      )}
    </Button>
  );
}
```

- [ ] **Step 4: Actualizar app/layout.tsx**

Leer el layout.tsx actual para preservar el título/descripción correcto, luego reemplazar con:

```tsx
import type { Metadata } from "next";
import { fontVariables } from "@/design-system/fonts";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agente de Cobranzas con IA",
  description: "Automatización de cobranzas con IA — demo de portafolio",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider defaultTheme="dark" enableSystem={false} attribute="class">
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 5: Mover app/page.tsx a app/app/page.tsx**

```bash
mkdir -p app/app
git mv app/page.tsx app/app/page.tsx
```

- [ ] **Step 6: Crear nueva landing app/page.tsx**

```tsx
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { buttonVariants } from "@/design-system/components/button";
import { cn } from "@/design-system/utils";

const STACK = [
  "Next.js 16",
  "Provider A",
  "PostgreSQL",
  "Drizzle ORM",
  "TypeScript",
  "Tailwind v4",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 w-full border-b border-[var(--border)] bg-background/70 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
          <Link
            href="https://manueldeasis.com"
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
            </svg>
            Manuel de Asis
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col items-start gap-8 px-6 py-24">
        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Agente de Cobranzas
          </h1>
          <p className="text-lg text-muted-foreground">
            Automatización de gestión de cobranzas con IA: priorización de
            casos, generación de mensajes y seguimiento persistente.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-full shadow-[var(--shadow-border-light)] bg-[var(--gray-50)] px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/app" className={cn(buttonVariants({ size: "default" }))}>
            Ver demo
          </Link>
          <a
            href="https://github.com/mdeasis27/agente-cobranzas"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "outline", size: "default" }))}
          >
            GitHub
          </a>
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 7: Build verify + commit + push**

```bash
pnpm build
git add .
git commit -m "feat: hub-aligned landing, ThemeProvider dark default, move app to /app"
git push origin feat/design-v3-sync
```

---

## Task 9: QA visual y merge de los 6 PRs

Antes de mergear, confirmar visualmente cada preview de deployment platform. Los PRs son:

| PR | Repo | URL |
|----|------|-----|
| #1 | portafolio-mdea | https://github.com/mdeasis27/portafolio-mdea/pull/1 |
| #1 | agente-riesgo | https://github.com/mdeasis27/agente-riesgo/pull/1 |
| #1 | identidad-360 | https://github.com/mdeasis27/identidad-360/pull/1 |
| #1 | radar-proveedores | https://github.com/mdeasis27/radar-proveedores/pull/1 |
| #1 | kyc-antifraude | https://github.com/mdeasis27/kyc-antifraude/pull/1 |
| #1 | agente-cobranzas | https://github.com/mdeasis27/agente-cobranzas/pull/1 |

- [ ] **Step 1: Checklist QA para cada sibling (repetir x5)**

Por cada sibling, abrir el preview URL del PR y verificar:
- [ ] Carga en dark mode por defecto
- [ ] ThemeToggle visible arriba a la derecha — alterna light/dark
- [ ] "← Manuel de Asis" visible y linkeable arriba a la izquierda
- [ ] Título, descripción y stack badges visibles
- [ ] Botón "Ver demo" navega a `/app` sin error 404
- [ ] Botón "GitHub" abre el repo correcto en nueva pestaña
- [ ] `/app` carga la app original sin errores visuales

- [ ] **Step 2: Verificar el hub (portafolio-mdea PR #1)**

El hub no tiene cambios estructurales en esta fase — solo verificar que el build sigue verde.

- [ ] **Step 3: Mergear los 6 PRs**

Mergear en este orden (hub primero, luego siblings):

```bash
gh pr merge 1 --repo mdeasis27/portafolio-mdea --squash --delete-branch
gh pr merge 1 --repo mdeasis27/agente-riesgo --squash --delete-branch
gh pr merge 1 --repo mdeasis27/identidad-360 --squash --delete-branch
gh pr merge 1 --repo mdeasis27/radar-proveedores --squash --delete-branch
gh pr merge 1 --repo mdeasis27/kyc-antifraude --squash --delete-branch
gh pr merge 1 --repo mdeasis27/agente-cobranzas --squash --delete-branch
```

- [ ] **Step 4: Verificar deploys de producción**

```bash
gh run list --repo mdeasis27/portafolio-mdea --limit 1
gh run list --repo mdeasis27/agente-riesgo --limit 1
# (repetir para cada repo)
```

Expected: todos en estado `completed` / `success`.
