import { addons } from "storybook/manager-api";
import { STORY_CHANGED } from "storybook/internal/core-events";
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

/**
 * Auto-oculta el panel inferior de addons (Controls/Actions/Interactions/
 * A11y) al navegar a una story que desactivó los 4 — páginas de referencia
 * estática como Tokens, Versions o Introducción (ver esos archivos, que
 * setean `parameters.controls.disable`, etc.). Sin esto, el panel se queda
 * abierto (si el usuario lo abrió en cualquier story anterior) mostrando el
 * placeholder genérico "Storybook add-ons / Explore integrations catalog" en
 * vez de simplemente desaparecer — quita visibilidad sin aportar nada, que
 * es justo lo que se buscaba evitar al desactivar esas 4 pestañas.
 *
 * Solo CIERRA el panel al entrar a una de estas stories; nunca lo abre por
 * su cuenta, así que no pelea con el usuario si lo prefiere cerrado siempre
 * o si lo vuelve a abrir manualmente en una story que sí tiene contenido.
 */
addons.register("piensa-it/auto-hide-empty-panel", (api) => {
  api.on(STORY_CHANGED, () => {
    // STORY_CHANGED no trae el storyId como argumento del callback (a
    // diferencia de STORY_PREPARED) — hay que leer la story activa desde el
    // propio store con getCurrentParameter, no con getParameters(storyId).
    const panelKeys = ["controls", "actions", "interactions", "a11y"] as const;
    const hasNoPanels = panelKeys.every(
      (key) => api.getCurrentParameter<{ disable?: boolean } | undefined>(key)?.disable === true,
    );

    if (hasNoPanels && api.getIsPanelShown()) {
      api.togglePanel(false);
    }
  });
});
