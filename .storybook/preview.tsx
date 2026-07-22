import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/styles/globals.css";
import { UiProvider } from "../src/components/providers/UiProvider";

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
        order: ["Introducción", "Tokens", "UI", "Layout", "Marketing", "*"],
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
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: "light",
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme ?? "light";
      return (
        <div className={theme === "dark" ? "dark" : ""}>
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
