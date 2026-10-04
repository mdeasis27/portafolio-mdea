# Arquitectura LLM para Portafolio — Tier Gratis + BYOK

## Contexto del proyecto

Estoy construyendo un portafolio de proyectos con IA para mostrar a reclutadores. Necesito que las demos funcionen **sin costo base para mí**, pero que sean estables y demuestren buenas prácticas de ingeniería.

**Requisitos:**
- Cero costo fijo mensual en APIs
- Los reclutadores deben poder probar las demos sin fricción (no pedir registro ni API keys para empezar)
- Arquitectura limpia que demuestre habilidad técnica
- Manejo seguro de credenciales
- Fallback automático si un proveedor falla o se agota el cuota
- Código desacoplado: debería poder cambiar de proveedor sin reescribir la lógica de negocio

---

## Estrategia: Doble capa

### Capa 1 — Default gratis (experiencia inmediata)
Cuando el reclutador entra a la demo, funciona sin pedirle nada. Uso proveedores con tier gratuito generoso, con fallback en cadena.

### Capa 2 — BYOK opcional (Bring Your Own Key)
Un campo opcional donde el usuario puede pegar su propia API key (Provider A, Provider B, Provider C) para probar con modelos premium. La key **nunca** toca mi backend: se guarda solo en el cliente.

---

## Proveedores gratuitos a usar

Ordenados por prioridad (el #1 es el default, los demás son fallback):

### 1. Provider C API (AI Studio)
- **Modelos:** `gemini-2.5-flash`, `gemini-2.0-flash`
- **Tier gratis:** ~15 req/min, ~1M tokens/día
- **Por qué primero:** mejor calidad/límites del lote, muy estable
- **Endpoint:** `https://generativelanguage.googleapis.com/v1beta/`
- **Formato:** propio de Google (o compatible Provider A via endpoint específico)

### 2. LLM API
- **Modelos:** `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b`
- **Tier gratis:** ~30 req/min, ~14.400 req/día
- **Por qué:** velocidad de inferencia brutal, buen fallback
- **Endpoint:** `https://api.groq.com/openai/v1/`
- **Formato:** compatible Provider A

### 3. Cerebras
- **Modelos:** `llama-3.3-70b`, `qwen-3-*`
- **Tier gratis:** limitado pero usable como tercer fallback
- **Endpoint:** `https://api.cerebras.ai/v1/`
- **Formato:** compatible Provider A

### 4. LLM API (modelos `:free`)
- **Modelos:** `meta-llama/llama-3.3-70b-instruct:free`, `deepseek/deepseek-chat:free`, etc.
- **Tier gratis:** ~20 req/min, ~200 req/día por cuenta
- **Por qué último:** límites más restrictivos, pero sirve como red de seguridad
- **Endpoint:** `https://openrouter.ai/api/v1/`
- **Formato:** compatible Provider A

**Nota importante:** todos los proveedores arriba (excepto Provider C nativo) hablan formato Provider A. Eso simplifica muchísimo la implementación — una sola clase cliente sirve para todos cambiando solo `baseURL` y `apiKey`.

---

## Proveedores premium para BYOK

Si el usuario pega su propia key, detectar el proveedor por el prefijo:

| Prefijo de la key | Proveedor | SDK |
|-------------------|-----------|-----|
| `sk-ant-` | Provider B (Claude) | `@anthropic-ai/sdk` |
| `sk-proj-` o `sk-` | Provider A (GPT) | `openai` |
| `AIza` | Google (Provider C) | `@google/genai` |

---

## Arquitectura de código

### Estructura de carpetas sugerida

```
src/
├── lib/
│   └── llm/
│       ├── index.ts              # Entry point, exporta `chat()`
│       ├── types.ts              # Tipos compartidos (Message, ChatOptions, etc.)
│       ├── router.ts             # Decide qué provider usar, maneja fallbacks
│       ├── providers/
│       │   ├── base.ts           # Interfaz LLMProvider
│       │   ├── openai-compat.ts  # Cliente genérico para APIs Chat API-compatible
│       │   ├── gemini.ts         # Cliente específico de Provider C
│       │   └── anthropic.ts      # Cliente específico de Provider B (solo BYOK)
│       ├── config.ts             # Configuración de providers y prioridades
│       └── errors.ts             # Errores custom (RateLimitError, etc.)
├── app/
│   └── api/
│       └── chat/
│           └── route.ts          # Endpoint del backend que usa lib/llm
└── components/
    └── ApiKeyInput.tsx           # UI para BYOK
```

### Interfaz base

```typescript
// lib/llm/types.ts
export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ChatOptions = {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  userApiKey?: {            // BYOK opcional
    provider: 'openai' | 'anthropic' | 'gemini';
    key: string;
  };
};

export type ChatResponse = {
  content: string;
  provider: string;          // cuál terminó respondiendo (útil para debug/UI)
  model: string;
};
```

```typescript
// lib/llm/providers/base.ts
export interface LLMProvider {
  name: string;
  priority: number;              // menor = mayor prioridad
  chat(opts: ChatOptions): Promise<ChatResponse>;
  isAvailable(): boolean;        // verifica que haya key configurada
}
```

### Cliente Chat API-compatible (sirve para LLM API, Cerebras, LLM API, Provider A)

```typescript
// lib/llm/providers/openai-compat.ts
import Provider A from 'openai';
import type { LLMProvider } from './base';
import type { ChatOptions, ChatResponse } from '../types';

export class OpenAICompatProvider implements LLMProvider {
  private client: Provider A;

  constructor(
    public name: string,
    public priority: number,
    baseURL: string,
    apiKey: string | undefined,
    private defaultModel: string,
  ) {
    if (apiKey) {
      this.client = new Provider A({ baseURL, apiKey });
    }
  }

  isAvailable() {
    return !!this.client;
  }

  async chat(opts: ChatOptions): Promise<ChatResponse> {
    const res = await this.client.chat.completions.create({
      model: this.defaultModel,
      messages: opts.messages,
      temperature: opts.temperature ?? 0.7,
      max_tokens: opts.maxTokens ?? 1024,
    });

    return {
      content: res.choices[0].message.content ?? '',
      provider: this.name,
      model: this.defaultModel,
    };
  }
}
```

### Configuración de providers

```typescript
// lib/llm/config.ts
import { OpenAICompatProvider } from './providers/openai-compat';
import { GeminiProvider } from './providers/gemini';

export function getDefaultProviders() {
  return [
    new GeminiProvider(1, process.env.GEMINI_API_KEY, 'gemini-2.5-flash'),
    new OpenAICompatProvider(
      'groq', 2,
      'https://api.groq.com/openai/v1',
      process.env.GROQ_API_KEY,
      'llama-3.3-70b-versatile'
    ),
    new OpenAICompatProvider(
      'cerebras', 3,
      'https://api.cerebras.ai/v1',
      process.env.CEREBRAS_API_KEY,
      'llama-3.3-70b'
    ),
    new OpenAICompatProvider(
      'openrouter', 4,
      'https://openrouter.ai/api/v1',
      process.env.OPENROUTER_API_KEY,
      'meta-llama/llama-3.3-70b-instruct:free'
    ),
  ].filter(p => p.isAvailable())
   .sort((a, b) => a.priority - b.priority);
}
```

### Router con fallback

```typescript
// lib/llm/router.ts
import { getDefaultProviders } from './config';
import { RateLimitError, ProviderError } from './errors';
import type { ChatOptions, ChatResponse } from './types';

export async function chat(opts: ChatOptions): Promise<ChatResponse> {
  // Caso BYOK: usar la key del usuario directamente
  if (opts.userApiKey) {
    return chatWithUserKey(opts);
  }

  // Caso default: intentar providers en orden de prioridad
  const providers = getDefaultProviders();

  if (providers.length === 0) {
    throw new Error('No hay providers configurados. Revisa tus env vars.');
  }

  const errors: Array<{ provider: string; error: string }> = [];

  for (const provider of providers) {
    try {
      return await provider.chat(opts);
    } catch (err) {
      errors.push({ provider: provider.name, error: String(err) });

      // Si es rate limit o error transitorio, probar el siguiente
      if (isRetryableError(err)) continue;

      // Si es error de config (401, etc.), también probar el siguiente
      // pero loggear porque indica un problema
      console.warn(`Provider ${provider.name} falló:`, err);
    }
  }

  throw new ProviderError('Todos los providers fallaron', errors);
}

function isRetryableError(err: unknown): boolean {
  const msg = String(err).toLowerCase();
  return msg.includes('rate limit') ||
         msg.includes('429') ||
         msg.includes('503') ||
         msg.includes('timeout');
}
```

---

## Manejo de BYOK (Bring Your Own Key)

### Principios de seguridad

1. **La key del usuario NUNCA se guarda en el backend.** Solo vive en el navegador (`localStorage` o estado de React).
2. **La key se envía en cada request como header/body**, el backend la usa y la descarta inmediatamente.
3. **NO loggear la key**: ni en console, ni en analytics, ni en Sentry. Filtrar explícitamente.
4. **Validar formato** antes de enviar (evitar enviar basura).
5. **HTTPS obligatorio** en producción (Vercel/Netlify lo dan gratis).
6. **Rate limit en tu backend** igualmente, para evitar que alguien abuse del endpoint aunque traiga su propia key.

### Componente de UI

```typescript
// components/ApiKeyInput.tsx
'use client';
import { useState, useEffect } from 'react';

type Provider = 'openai' | 'anthropic' | 'gemini';

function detectProvider(key: string): Provider | null {
  if (key.startsWith('sk-ant-')) return 'anthropic';
  if (key.startsWith('sk-')) return 'openai';
  if (key.startsWith('AIza')) return 'gemini';
  return null;
}

export function ApiKeyInput({ onKeyChange }: { onKeyChange: (k: string | null) => void }) {
  const [key, setKey] = useState('');
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('user_api_key');
    if (saved) {
      setKey(saved);
      setProvider(detectProvider(saved));
      onKeyChange(saved);
    }
  }, []);

  const handleChange = (value: string) => {
    setKey(value);
    const p = detectProvider(value);
    setProvider(p);
    if (value && p) {
      localStorage.setItem('user_api_key', value);
      onKeyChange(value);
    } else if (!value) {
      localStorage.removeItem('user_api_key');
      onKeyChange(null);
    }
  };

  return (
    <div className="border rounded p-3 text-sm">
      <label className="block mb-1 font-medium">
        (Opcional) Tu API key para usar modelos premium
      </label>
      <input
        type="password"
        value={key}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="sk-..., sk-ant-..., o AIza..."
        className="w-full border rounded px-2 py-1"
      />
      {provider && (
        <p className="mt-1 text-xs text-green-600">
          Detectado: {provider}. Tu key se guarda solo en este navegador.
        </p>
      )}
      <p className="mt-1 text-xs text-gray-500">
        Si no pegas nada, la demo funciona con modelos gratuitos por defecto.
      </p>
    </div>
  );
}
```

### Envío desde el cliente

```typescript
// En el componente de chat
const userKey = localStorage.getItem('user_api_key');

const res = await fetch('/api/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    ...(userKey && { 'X-User-Api-Key': userKey }),
  },
  body: JSON.stringify({ messages }),
});
```

### Recepción en el backend

```typescript
// app/api/chat/route.ts
import { chat } from '@/lib/llm';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const userKey = req.headers.get('X-User-Api-Key');

  const userApiKey = userKey
    ? { provider: detectProvider(userKey), key: userKey }
    : undefined;

  try {
    const response = await chat({ messages, userApiKey });
    return Response.json(response);
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
```

---

## Variables de entorno (.env.local)

```
# Providers gratuitos (obtén las keys en sus respectivos dashboards)
GEMINI_API_KEY=AIza...
GROQ_API_KEY=gsk_...
CEREBRAS_API_KEY=csk-...
OPENROUTER_API_KEY=sk-or-...

# No es necesario configurar todas, el sistema usa las que estén presentes
```

**Dónde obtener cada key (todas gratis):**
- Provider C: https://aistudio.google.com/apikey
- LLM API: https://console.groq.com/keys
- Cerebras: https://cloud.cerebras.ai/
- LLM API: https://openrouter.ai/keys

---

## Rate limiting propio

Aunque los providers tienen sus propios límites, debo tener rate limit en mi endpoint para que nadie abuse. Usar algo simple en memoria o con Upstash Redis (tier gratis):

```typescript
// lib/rate-limit.ts (versión simple en memoria para empezar)
const requests = new Map<string, number[]>();

export function rateLimit(ip: string, max = 10, windowMs = 60_000): boolean {
  const now = Date.now();
  const timestamps = (requests.get(ip) ?? []).filter(t => now - t < windowMs);

  if (timestamps.length >= max) return false;

  timestamps.push(now);
  requests.set(ip, timestamps);
  return true;
}
```

Para producción seria, migrar a Upstash Redis (también tier gratuito generoso).

---

## Checklist de implementación

- [ ] Crear estructura de carpetas
- [ ] Implementar tipos e interfaz base
- [ ] Implementar `OpenAICompatProvider`
- [ ] Implementar `GeminiProvider` (usa SDK propio de Google)
- [ ] Implementar `AnthropicProvider` (solo para BYOK)
- [ ] Implementar router con fallback
- [ ] Implementar endpoint `/api/chat`
- [ ] Implementar componente `ApiKeyInput`
- [ ] Configurar env vars
- [ ] Agregar rate limiting básico
- [ ] Agregar indicador visual de qué provider respondió (útil para demo)
- [ ] Agregar manejo de errores en UI (mensajes claros si todos los providers fallan)
- [ ] Escribir README explicando la arquitectura (¡los reclutadores lo van a leer!)

---

## Puntos extra que impresionan a reclutadores

1. **Streaming de respuestas** con Server-Sent Events, no solo esperar a tener la respuesta completa.
2. **Telemetría visible**: mostrar en UI qué modelo respondió, cuánto tardó, tokens usados. Demuestra pensamiento de observabilidad.
3. **Test unitarios** del router con mocks de providers.
4. **README técnico** explicando por qué la arquitectura es así (decisiones de diseño, no solo qué hace).
5. **Diagrama de arquitectura** (puedes usar Mermaid en el README).
6. **Graceful degradation**: si todos los providers fallan, mostrar un mensaje útil, no un error crudo.

---

## Notas finales para Claude Code

- Usar TypeScript estricto (`strict: true` en tsconfig).
- Preferir SDKs oficiales (`openai`, `@anthropic-ai/sdk`, `@google/genai`) sobre fetch directo.
- No inventar modelos: usar los nombres exactos listados arriba (cambian con el tiempo, verificar en la doc del provider si no funciona).
- El stack asumido es Next.js 14+ con App Router, pero la lógica en `lib/llm/` es agnóstica del framework y se puede portar fácil.
- Si prefiero otro framework (Astro, SvelteKit, Hono), solo cambia la capa de endpoints, no la lógica core.
