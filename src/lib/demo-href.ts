import type { Locale } from "@/design-system/i18n/locale";

/** Sibling demos redirect a locale-less /app to /en/app, so always include the locale. */
export function demoHref(liveUrl: string, locale: Locale): string {
  return new URL(`/${locale}/app`, liveUrl).toString();
}
