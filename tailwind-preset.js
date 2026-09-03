// Preset de Tailwind de @piensa-it/ui-library, publicado como
// "@piensa-it/ui-library/tailwind-preset" para que los repos consumidores
// puedan extenderlo (`presets: [require("@piensa-it/ui-library/tailwind-preset")]`)
// y así compartir los mismos tokens (colores semánticos, radios, fuentes)
// en SU PROPIO código, no solo en los componentes que trae la librería.
//
// Es un archivo .js plano (no .ts) a propósito: se importa directamente
// desde node_modules sin pasar por un paso de compilación.
import animate from "tailwindcss-animate";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = path.dirname(fileURLToPath(import.meta.url));

/**
 * Rutas de los módulos publicados de la librería, para que Tailwind vea las
 * clases que usan sus componentes.
 *
 * Hace falta porque las utilidades de una app y las de la librería se generan
 * en dos pasadas distintas y el orden del CSS resultante decide quién gana:
 * una utilidad base de la app (`.text-center`) emitida DESPUÉS de una variante
 * de la librería (`sm:text-left` de DialogHeader) la pisa. Con estas rutas en
 * `content`, ambas salen de la misma pasada y el orden vuelve a ser el de
 * especificidad de Tailwind.
 *
 * Tailwind 3 NO hereda `content` de un preset (solo `theme` y `plugins`), así
 * que el consumidor tiene que concatenarlo:
 *
 * ```js
 * import preset, { content as uiLibraryContent } from "@piensa-it/ui-library/tailwind-preset";
 * export default { presets: [preset], content: [...uiLibraryContent, "./src/**\/*.{ts,tsx}"] };
 * ```
 */
export const content = [
  path.join(packageRoot, "dist/esm/**/*.js"),
];

/** @type {import('tailwindcss').Config} */
const preset = {
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        /* Escala de superficies: ground → surface → raised. Ver DESIGN.md. */
        ground: {
          DEFAULT: "hsl(var(--ground))",
          foreground: "hsl(var(--ground-foreground))",
        },
        surface: {
          DEFAULT: "hsl(var(--surface))",
          foreground: "hsl(var(--surface-foreground))",
          hover: "hsl(var(--surface-hover))",
          border: "hsl(var(--surface-border))",
        },
        /* Menú lateral del AppShell: su propio plano cromático, elegido con
           `data-sidebar` y estable entre tema claro y oscuro. */
        sidebar: {
          DEFAULT: "hsl(var(--sidebar) / var(--sidebar-alpha, 1))",
          foreground: "hsl(var(--sidebar-foreground))",
          muted: "hsl(var(--sidebar-muted-foreground))",
          border: "hsl(var(--sidebar-border))",
          hover: "hsl(var(--sidebar-hover))",
          active: "hsl(var(--sidebar-active))",
          "active-foreground": "hsl(var(--sidebar-active-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          ring: "hsl(var(--sidebar-ring))",
        },
        raised: {
          DEFAULT: "hsl(var(--raised))",
          foreground: "hsl(var(--raised-foreground))",
          border: "hsl(var(--raised-border))",
        },
        subtle: {
          DEFAULT: "hsl(var(--subtle))",
          hover: "hsl(var(--subtle-hover))",
          foreground: "hsl(var(--subtle-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        overlay: "hsl(var(--overlay))",
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
        },
      },
      // `xl`/`2xl` no son solo un "más grande" de Tailwind por defecto: se
      // derivan de `--radius` con un offset fijo (+2px / +6px), calculado
      // para que con el `--radius` por defecto (0.625rem) den exactamente
      // los mismos 12px/16px que ya se venían usando. Antes eran valores
      // fijos de Tailwind (0.75rem/1rem) sin relación con el token — una
      // app que sobreescribe `--radius` para su marca tenía a Card/Button
      // (rounded-lg) siguiendo el cambio, pero Field/AlertDialog/PivotTable
      // (rounded-xl/2xl) no.
      /* La escala de espaciado alimenta padding, margin, gap y space-y de una
         vez. Los nombres por rol (`p-inset`, `space-y-stack`) son los que
         deben usar los componentes; los pasos sueltos, para casos concretos. */
      spacing: {
        "2xs": "var(--space-2xs)",
        xs: "var(--space-xs)",
        sm: "var(--space-sm)",
        md: "var(--space-md)",
        lg: "var(--space-lg)",
        xl: "var(--space-xl)",
        "2xl": "var(--space-2xl)",
        inset: "var(--space-inset)",
        "inset-compact": "var(--space-inset-compact)",
        stack: "var(--space-stack)",
        field: "var(--space-field)",
      },
      borderRadius: {
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) + 2px)",
        "2xl": "calc(var(--radius) + 6px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        heading: ["var(--font-heading)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      fontSize: {
        "ui-caption": ["var(--font-size-caption)", { lineHeight: "var(--line-height-caption)" }],
        "ui-body-sm": ["var(--font-size-body-sm)", { lineHeight: "var(--line-height-body-sm)" }],
        "ui-body": ["var(--font-size-body)", { lineHeight: "var(--line-height-body)" }],
        "ui-title-sm": ["var(--font-size-title-sm)", { lineHeight: "var(--line-height-title-sm)" }],
        "ui-title": ["var(--font-size-title)", { lineHeight: "var(--line-height-title)" }],
        "ui-display": ["var(--font-size-display)", { lineHeight: "var(--line-height-display)" }],
      },
      height: {
        "control-compact": "var(--control-compact)",
        "control-default": "var(--control-default)",
        "control-comfortable": "var(--control-comfortable)",
      },
      minWidth: {
        "control-compact": "var(--control-compact)",
        "control-default": "var(--control-default)",
        "control-comfortable": "var(--control-comfortable)",
      },
      minHeight: {
        "control-compact": "var(--control-compact)",
        "control-default": "var(--control-default)",
        "control-comfortable": "var(--control-comfortable)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        normal: "var(--duration-normal)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        standard: "var(--ease-standard)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        /* Sombra que corresponde a cada nivel de la escala de superficies:
           `shadow-raised` en una tarjeta, `shadow-surface` en una barra. */
        surface: "var(--shadow-surface)",
        raised: "var(--shadow-raised)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [animate],
};

export default preset;
