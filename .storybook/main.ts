import type { StorybookConfig } from "@storybook/react-vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(ts|tsx)"],
  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
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
