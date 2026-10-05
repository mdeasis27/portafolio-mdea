"use client";
import {useLocale} from '@/design-system/i18n/context';

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

import { Button } from "@/components/ui/button";

function useIsMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function ThemeToggle() {
  const locale = useLocale();
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useIsMounted();

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={locale === "es" ? (isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro") : (isDark ? "Switch to light mode" : "Switch to dark mode")}
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
