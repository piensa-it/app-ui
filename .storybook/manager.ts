import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

/**
 * Tema de marca del "chrome" de Storybook (sidebar, toolbar, barra superior
 * de docs) — separado del tema de los componentes en sí (`preview.tsx`).
 * Storybook 10 ya trae un tema oscuro prolijo por defecto; acá solo
 * re-tematizamos el acento (rosado/púrpura de Storybook → rojo Piensa IT)
 * y el branding, sin reinventar el layout.
 */
const piensaItTheme = create({
  base: "dark",

  brandTitle: "Piensa IT · UI Library",
  brandUrl: "https://piensait-ui.netlify.app",
  brandTarget: "_self",

  colorPrimary: "#C8102E",
  colorSecondary: "#C8102E",
});

addons.setConfig({
  theme: piensaItTheme,
});
