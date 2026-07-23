import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/styles/globals.css";
import { UiProvider } from "../src/components/providers/UiProvider";

/**
 * Resuelve el toggle "Tema" del toolbar (claro/oscuro/sistema) a un booleano
 * `isDark`. En "sistema" se suscribe a `prefers-color-scheme` y reacciona en
 * vivo si el usuario cambia el tema de su SO/navegador mientras el Storybook
 * sigue abierto — no requiere recargar la página.
 */
function useResolvedDark(themeSetting: string): boolean {
  const getSystemPreference = () =>
    typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;

  const [systemPrefersDark, setSystemPrefersDark] = React.useState(getSystemPreference);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => setSystemPrefersDark(event.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  if (themeSetting === "system") return systemPrefersDark;
  return themeSetting === "dark";
}

/**
 * Preview global de Storybook — este es el "sitio de documentación" de
 * @piensa-it/ui-library. Todas las historias se renderizan dentro de un
 * contenedor que aplica bg-background/text-foreground, así que cambiar el
 * toggle "Tema" del toolbar (arriba) alterna la clase `.dark` y demuestra
 * en vivo cómo se ven los componentes con los tokens claros/oscuros.
 */
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "padded",
    options: {
      storySort: {
        order: ["Introducción", "Tokens", "Guías", "UI", "Layout", "Marketing", "*"],
      },
    },
  },
  globalTypes: {
    theme: {
      description: "Tema global",
      toolbar: {
        title: "Tema",
        icon: "mirror",
        items: [
          { value: "light", title: "Claro" },
          { value: "dark", title: "Oscuro" },
          { value: "system", title: "Sistema" },
        ],
        dynamicTitle: true,
      },
    },
    palette: {
      description: "Paleta de identidad",
      toolbar: {
        title: "Paleta",
        icon: "paintbrush",
        items: [
          { value: "indigo", title: "Índigo" },
          { value: "ocean", title: "Océano" },
          { value: "violet", title: "Violeta" },
          { value: "emerald", title: "Esmeralda" },
          { value: "ruby", title: "Rubí" },
          { value: "amber", title: "Ámbar" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
    palette: "indigo",
  },
  decorators: [
    (Story, context) => {
      const themeSetting = context.globals.theme ?? "light";
      const palette = context.globals.palette ?? "indigo";
      const isDark = useResolvedDark(themeSetting);
      return (
        <div className={isDark ? "dark" : ""} data-ui-palette={palette}>
          {/* Superficie exterior (bg-muted) para que la "card" de la demo
              tenga contraste y se sienta agrupada/presentada, en vez de
              flotar directamente sobre el fondo de la página. Sin flex: se
              deja que cada historia controle su propio ancho (un Button
              suelto queda a la izquierda, un Accordion/DataTable ocupa el
              100% de la card) — igual que en cualquier layout normal. */}
          <div className="min-h-[160px] bg-muted p-6 font-sans text-foreground sm:p-10">
            <div className="min-h-[100px] w-full rounded-xl border border-border bg-card p-8 shadow-sm">
              <UiProvider>
                <Story />
              </UiProvider>
            </div>
          </div>
        </div>
      );
    },
  ],
};

export default preview;
