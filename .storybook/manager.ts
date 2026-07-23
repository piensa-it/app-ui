import { addons } from "storybook/manager-api";
import { create } from "storybook/theming";

/**
 * Tema de marca del "chrome" de Storybook (sidebar, toolbar, barra superior
 * de docs) — separado del tema de los componentes en sí (`preview.tsx`).
 * El chrome es deliberadamente neutral: navegación oscura y superficies de
 * contenido claras. Las paletas de identidad pertenecen al preview de los
 * componentes y no deben teñir la navegación de la documentación.
 */
const uiLibraryTheme = create({
  base: "dark",

  brandTitle: "UI Library · Componentes",
  brandUrl: "https://piensait-ui.netlify.app",
  brandTarget: "_self",

  colorPrimary: "#FFFFFF",
  colorSecondary: "#A5B4FC",
  appBg: "#111111",
  appContentBg: "#FFFFFF",
  appPreviewBg: "#F5F5F5",
  appBorderColor: "#2A2A2A",
  appBorderRadius: 10,
  barBg: "#111111",
  barTextColor: "#A3A3A3",
  barSelectedColor: "#C7D2FE",
  inputBg: "#1C1C1C",
  inputBorder: "#343434",
  inputTextColor: "#F5F5F5",
});

addons.setConfig({
  theme: uiLibraryTheme,
});
