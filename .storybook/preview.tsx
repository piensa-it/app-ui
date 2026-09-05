import type { Preview } from "@storybook/react-vite";
import React from "react";
import "../src/styles/fonts.css";
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


type UiGlobals = { theme?: string; palette?: string; fontFamily?: string };

/**
 * Hereda los `globals` del toolbar cuando esta historia vive en un iframe
 * anidado dentro de la página de docs.
 *
 * Las historias con `docs.story.inline: false` —la aplicación de ejemplo— se
 * renderizan en un iframe propio al que Storybook NO le pasa los `globals`:
 * su URL es `iframe.html?viewMode=story&id=…` a secas, así que caen a
 * `initialGlobals` hagas lo que hagas en el toolbar. Con «Sistema» no
 * cambiaban a oscuro, y arreglado eso, con «Claro» no volvían a claro.
 *
 * El documento de docs sí tiene los globals vigentes
 * (`__STORYBOOK_PREVIEW__.storyStore.userGlobals`) y avisa por el canal
 * cuando cambian. Somos del mismo origen, así que se leen del padre y se
 * escucha `globalsUpdated` para seguirlos en vivo.
 */
function useInheritedGlobals(own: UiGlobals): UiGlobals {
  const parentPreview = () => {
    try {
      if (typeof window === "undefined" || window.parent === window) return null;
      const parent = window.parent as Window & {
        __STORYBOOK_PREVIEW__?: { storyStore?: { userGlobals?: { get?: () => UiGlobals } } };
        __STORYBOOK_ADDONS_CHANNEL__?: { on: (e: string, h: (d: unknown) => void) => void; off: (e: string, h: (d: unknown) => void) => void };
      };
      const store = parent.__STORYBOOK_PREVIEW__?.storyStore?.userGlobals;
      if (!store?.get || !parent.__STORYBOOK_ADDONS_CHANNEL__) return null;
      return { store, channel: parent.__STORYBOOK_ADDONS_CHANNEL__ };
    } catch {
      // Otro origen o sin Storybook arriba: no hay nada que heredar.
      return null;
    }
  };

  const [inherited, setInherited] = React.useState<UiGlobals | null>(() => parentPreview()?.store.get?.() ?? null);

  React.useEffect(() => {
    const parent = parentPreview();
    if (!parent) return;
    // Se relee la tienda del padre en vez de usar el payload del evento: por
    // el canal del padre también pasan los `globalsUpdated` que emiten los
    // iframes hermanos al arrancar, con SU valor inicial, y el que montaba
    // después los tomaba por un cambio del toolbar. La tienda del padre solo
    // cambia cuando cambia el toolbar.
    const onUpdate = () => {
      const next = parent.store.get?.();
      if (next) setInherited({ theme: next.theme, palette: next.palette, fontFamily: next.fontFamily });
    };
    parent.channel.on("globalsUpdated", onUpdate);
    return () => parent.channel.off("globalsUpdated", onUpdate);
  }, []);

  return inherited ? { ...own, ...inherited } : own;
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
    fontFamily: {
      description: "Familia tipográfica",
      toolbar: {
        title: "Fuente",
        icon: "paragraph",
        items: [
          { value: "geist", title: "Geist" },
          { value: "inter", title: "Inter" },
          { value: "dm-sans", title: "DM Sans" },
          { value: "system", title: "Sistema" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    // "system" y no "light": la página de docs renderiza la aplicación de
    // ejemplo en iframes propios (`inline: false`) que no reciben los
    // `globals` del toolbar, así que caen a este valor. Con "light" el toggle
    // «Sistema» no cambiaba nada allí aunque el SO estuviera en oscuro.
    theme: "system",
    palette: "indigo",
    fontFamily: "geist",
  },
  decorators: [
    (Story, context) => {
      const globals = useInheritedGlobals(context.globals as UiGlobals);
      const themeSetting = globals.theme ?? "system";
      const palette = globals.palette ?? "indigo";
      const fontFamily = globals.fontFamily ?? "geist";
      const isDark = useResolvedDark(themeSetting);
      const story = (
        <UiProvider>
          <Story />
        </UiProvider>
      );

      if (context.parameters.layout === "fullscreen") {
        return (
          <div
            className={isDark ? "dark min-h-screen bg-background font-sans text-foreground" : "min-h-screen bg-background font-sans text-foreground"}
            data-ui-palette={palette}
            data-ui-font={fontFamily}
          >
            {story}
          </div>
        );
      }

      return (
        <div className={isDark ? "dark" : ""} data-ui-palette={palette} data-ui-font={fontFamily}>
          {/* Superficie exterior (bg-muted) para que la "card" de la demo
              tenga contraste y se sienta agrupada/presentada, en vez de
              flotar directamente sobre el fondo de la página. Sin flex: se
              deja que cada historia controle su propio ancho (un Button
              suelto queda a la izquierda, un Accordion/DataTable ocupa el
              100% de la card) — igual que en cualquier layout normal. */}
          <div className="min-h-[160px] bg-muted p-6 font-sans text-foreground sm:p-10">
            <div className="min-h-[100px] w-full rounded-xl border border-border bg-card p-8 shadow-sm">
              {story}
            </div>
          </div>
        </div>
      );
    },
  ],
};

export default preview;
