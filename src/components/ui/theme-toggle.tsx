import * as React from "react";
import { Monitor, Moon, Sun } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

import type { AppearanceTheme } from "./appearance-settings";

export type ThemePreference = AppearanceTheme;

export interface ThemeToggleLabels {
  group: string;
  light: string;
  dark: string;
  system: string;
}

const defaultLabels: ThemeToggleLabels = {
  group: "Tema",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
};

export interface ThemeToggleProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** Controlado. Sin `value`, el componente guarda la preferencia y aplica el tema él mismo. */
  value?: ThemePreference;
  onChange?: (value: ThemePreference) => void;
  /** Clave de `localStorage` en modo no controlado. Debe coincidir con la de `ThemeScript`. @default "theme" */
  storageKey?: string;
  /** `icons`: solo íconos con nombre accesible; `labeled`: ícono y texto. @default "icons" */
  variant?: "icons" | "labeled";
  labels?: Partial<ThemeToggleLabels>;
}

const OPTIONS = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;

function readStored(key: string): ThemePreference | null {
  try {
    const stored = window.localStorage.getItem(key);
    return stored === "light" || stored === "dark" || stored === "system" ? stored : null;
  } catch {
    return null;
  }
}

const STORAGE_EVENT = "piensa-ui:theme";

function subscribeToStorage(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(STORAGE_EVENT, onChange);
  };
}

function notifyStorage() {
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

/** Aplica la preferencia a `<html>`: clase `dark` y `color-scheme`. */
function applyTheme(preference: ThemePreference) {
  const dark =
    preference === "dark" || (preference === "system" && window.matchMedia?.("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", Boolean(dark));
  document.documentElement.style.colorScheme = dark ? "dark" : "light";
}

/**
 * Selector de tema claro, oscuro o sistema. En modo no controlado guarda la
 * elección, aplica la clase `dark` en `<html>` y, en «Sistema», sigue los
 * cambios del sistema operativo en vivo. Combínalo con `ThemeScript` en el
 * `<head>` para que la página no parpadee al cargar.
 */
const ThemeToggle = React.forwardRef<HTMLDivElement, ThemeToggleProps>(
  ({ value, onChange, storageKey = "theme", variant = "icons", labels: labelsProp, className, ...props }, ref) => {
    const labels = { ...defaultLabels, ...labelsProp };
    const controlled = value !== undefined;
    // La preferencia guardada se lee como almacén externo: en el servidor es
    // «system», y en el navegador el valor real sin un render extra.
    const stored = React.useSyncExternalStore(
      subscribeToStorage,
      () => readStored(storageKey) ?? "system",
      () => "system" as const,
    );
    const current = controlled ? value : stored;

    React.useEffect(() => {
      if (controlled || current !== "system") return;
      const media = window.matchMedia?.("(prefers-color-scheme: dark)");
      if (!media) return;
      const onSystemChange = () => applyTheme("system");
      media.addEventListener("change", onSystemChange);
      return () => media.removeEventListener("change", onSystemChange);
    }, [controlled, current]);

    const select = (next: ThemePreference) => {
      if (!controlled) {
        try {
          window.localStorage.setItem(storageKey, next);
        } catch {
          // Sin almacenamiento (modo privado): el tema se aplica igual, solo no se recuerda.
        }
        applyTheme(next);
        notifyStorage();
      }
      onChange?.(next);
    };

    return (
      <div
        ref={ref}
        role="group"
        aria-label={labels.group}
        className={cn("inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5", className)}
        {...props}
      >
        {OPTIONS.map(({ value: option, icon: Icon }) => {
          const pressed = current === option;
          return (
            <button
              key={option}
              type="button"
              aria-pressed={pressed}
              aria-label={variant === "icons" ? labels[option] : undefined}
              title={variant === "icons" ? labels[option] : undefined}
              onClick={() => select(option)}
              className={cn(
                "inline-flex h-7 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground",
                pressed && "bg-background text-foreground shadow-sm",
                focusRingOutside,
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {variant === "labeled" && labels[option]}
            </button>
          );
        })}
      </div>
    );
  },
);
ThemeToggle.displayName = "ThemeToggle";

export interface ThemeScriptProps {
  /** @default "theme" */
  storageKey?: string;
  /** Preferencia cuando no hay nada guardado. @default "system" */
  defaultTheme?: ThemePreference;
  nonce?: string;
}

/**
 * `<script>` en línea para el `<head>`: aplica el tema guardado antes del
 * primer pintado, así la página no parpadea en el tema equivocado. En Astro va
 * en el layout; en Vite, su contenido en `index.html` (`themeScript()`).
 */
function ThemeScript({ storageKey = "theme", defaultTheme = "system", nonce }: ThemeScriptProps) {
  return <script nonce={nonce} dangerouslySetInnerHTML={{ __html: themeScript({ storageKey, defaultTheme }) }} />;
}

/** El código de `ThemeScript` como texto, para pegarlo en un `index.html`. */
function themeScript({ storageKey = "theme", defaultTheme = "system" }: Omit<ThemeScriptProps, "nonce"> = {}) {
  // `<` escapado: una clave con `</script>` no puede cerrar la etiqueta.
  const literal = (text: string) => JSON.stringify(text).replace(/</g, "\\u003c");
  return `(function(){try{var k=${literal(storageKey)},p=localStorage.getItem(k)||${literal(defaultTheme)};var d=p==="dark"||(p==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light"}catch(_){}})();`;
}

export { ThemeToggle, ThemeScript, themeScript };
