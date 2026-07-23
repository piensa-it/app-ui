// Preset de Tailwind de @piensa-it/ui-library, publicado como
// "@piensa-it/ui-library/tailwind-preset" para que los repos consumidores
// puedan extenderlo (`presets: [require("@piensa-it/ui-library/tailwind-preset")]`)
// y así compartir los mismos tokens (colores semánticos, radios, fuentes)
// en SU PROPIO código, no solo en los componentes que trae la librería.
//
// Es un archivo .js plano (no .ts) a propósito: se importa directamente
// desde node_modules sin pasar por un paso de compilación.
import animate from "tailwindcss-animate";

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
        surface: {
          DEFAULT: "hsl(var(--surface))",
          hover: "hsl(var(--surface-hover))",
          border: "hsl(var(--surface-border))",
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
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
