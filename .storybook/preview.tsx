import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/styles/globals.css";

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
          <div className="min-h-[100px] bg-background p-4 font-sans text-foreground">
            <Story />
          </div>
        </div>
      );
    },
  ],
};

export default preview;
