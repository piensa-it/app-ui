import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const seoHead = () => `
  <title>Piensa IT UI Library | Componentes React accesibles</title>
  <meta name="description" content="Piensa IT UI Library: componentes React accesibles, responsive y personalizables con TypeScript, Ark UI y Tailwind CSS." />
  <meta name="application-name" content="Piensa IT UI Library" />
  <meta name="theme-color" content="#0f172a" />
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Piensa IT" />
  <meta property="og:title" content="Piensa IT UI Library | Componentes React accesibles" />
  <meta property="og:description" content="Una librería white-label de componentes React accesibles, responsive y personalizables para productos web profesionales." />
  <meta property="og:image" content="/favicon.png" />
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:title" content="Piensa IT UI Library | Componentes React accesibles" />
  <meta name="twitter:description" content="Componentes React accesibles, responsive y personalizables para productos web profesionales." />
  <meta name="twitter:image" content="/favicon.png" />
`;

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
  ],
  core: {
    // El aviso "What's new" (release notes de Storybook, no de esta
    // librería) no aporta nada en un sitio de documentación de cara a
    // otros equipos/clientes — lo apagamos para que el sidebar solo
    // muestre contenido nuestro.
    disableWhatsNewNotifications: true,
  },
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  managerHead: seoHead,
  previewHead: seoHead,
  viteFinal: async (viteConfig) => {
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "../src"),
    };

    // @storybook/builder-vite fusiona automáticamente el vite.config.ts de
    // la raíz (para heredar el alias "@", Tailwind, etc.), pero eso también
    // arrastra vite-plugin-dts — que solo tiene sentido para el build del
    // paquete npm (genera .d.ts), no para el sitio de docs, y le agrega
    // trabajo innecesario al build de Storybook. Lo filtramos acá.
    if (viteConfig.plugins) {
      viteConfig.plugins = viteConfig.plugins.filter((plugin) => {
        const name = plugin && typeof plugin === "object" && "name" in plugin ? (plugin as { name?: string }).name : undefined;
        return name !== "vite:dts";
      });
    }

    return viteConfig;
  },
};

export default config;
