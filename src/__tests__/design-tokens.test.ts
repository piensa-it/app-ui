import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { contrastRatio, parseHsl } from "../lib/color";

/**
 * Los tokens se leen del CSS fuente, no de un objeto en TypeScript: es el CSS
 * el que se publica, y una prueba que leyera una copia en JS no detectaría que
 * ambos se separaron.
 */
const css = readFileSync(path.resolve(process.cwd(), "src/styles/globals.css"), "utf8");

function tokens(scope: "light" | "dark"): Record<string, string> {
  const block =
    scope === "light"
      ? css.slice(css.indexOf(":root {"), css.indexOf("/** Familias tipográficas"))
      : css.slice(css.indexOf(".dark {"), css.indexOf("@layer base {\n  *"));
  const found: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    found[name] = value.trim();
  }
  return found;
}

const light = tokens("light");
const dark = tokens("dark");
const lightnessOf = (token: string) => Number.parseFloat(token.split(/\s+/)[2]);

/**
 * Los estilos (`data-ui-look`, #109) solo redefinen parte de los tokens: lo
 * que se comprueba es el tema completo con el estilo encima, que es lo que
 * ve la página. `classic` no redefine nada y equivale al tema a secas.
 */
const looksCss = readFileSync(path.resolve(process.cwd(), "src/styles/looks.css"), "utf8");
const LOOKS = ["soft", "deep", "flat"] as const;

function lookTokens(look: (typeof LOOKS)[number], scope: "light" | "dark"): Record<string, string> {
  const selector = scope === "light" ? `[data-ui-look="${look}"] {` : `.dark [data-ui-look="${look}"]`;
  const start = looksCss.indexOf(selector);
  expect(start, `${look} en ${scope}`).toBeGreaterThan(-1);
  const block = looksCss.slice(start, looksCss.indexOf("}", start));
  const found: Record<string, string> = {};
  for (const [, name, value] of block.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    found[name] = value.trim();
  }
  return found;
}

/** Tema y estilo, uno encima del otro, para cada combinación. */
const themes: Array<[string, Record<string, string>]> = [
  ["claro", light],
  ["oscuro", dark],
  ...LOOKS.flatMap((look): Array<[string, Record<string, string>]> => [
    [`claro · ${look}`, { ...light, ...lookTokens(look, "light") }],
    [`oscuro · ${look}`, { ...dark, ...lookTokens(look, "dark") }],
  ]),
];

describe("escala de superficies", () => {
  it("define los tres niveles en ambos temas", () => {
    for (const level of ["--ground", "--surface", "--raised"]) {
      expect(light[level], `${level} en claro`).toBeDefined();
      expect(dark[level], `${level} en oscuro`).toBeDefined();
    }
  });

  it("en claro cada nivel es más claro que el anterior", () => {
    expect(lightnessOf(light["--ground"])).toBeLessThan(lightnessOf(light["--surface"]));
    expect(lightnessOf(light["--surface"])).toBeLessThan(lightnessOf(light["--raised"]));
  });

  it("en oscuro cada nivel es más claro que el anterior (misma dirección de elevación)", () => {
    expect(lightnessOf(dark["--ground"])).toBeLessThan(lightnessOf(dark["--surface"]));
    expect(lightnessOf(dark["--surface"])).toBeLessThan(lightnessOf(dark["--raised"]));
  });

  it("los niveles se distinguen a simple vista (al menos 1,5 puntos de luminosidad)", () => {
    for (const theme of [light, dark]) {
      expect(lightnessOf(theme["--surface"]) - lightnessOf(theme["--ground"])).toBeGreaterThanOrEqual(1.5);
      expect(lightnessOf(theme["--raised"]) - lightnessOf(theme["--surface"])).toBeGreaterThanOrEqual(1.5);
    }
  });

  it.each(themes)("con el estilo puesto la escala conserva dirección y separación (%s)", (_name, theme) => {
    expect(lightnessOf(theme["--ground"])).toBeLessThan(lightnessOf(theme["--surface"]));
    expect(lightnessOf(theme["--surface"])).toBeLessThan(lightnessOf(theme["--raised"]));
    expect(lightnessOf(theme["--surface"]) - lightnessOf(theme["--ground"])).toBeGreaterThanOrEqual(1.5);
    expect(lightnessOf(theme["--raised"]) - lightnessOf(theme["--surface"])).toBeGreaterThanOrEqual(1.5);
  });

  it("cada nivel trae su borde", () => {
    for (const theme of [light, dark]) {
      expect(theme["--surface-border"]).toBeDefined();
      expect(theme["--raised-border"]).toBeDefined();
    }
  });

  it("`--background` y `--card` siguen existiendo como alias de ground y raised", () => {
    for (const theme of [light, dark]) {
      expect(theme["--background"]).toBe("var(--ground)");
      expect(theme["--card"]).toBe("var(--raised)");
      expect(theme["--popover"]).toBe("var(--raised)");
    }
  });
});

describe("tokens que se leen sobre el nivel ground", () => {
  // Al bajar el fondo de la página, un token con la misma luminosidad que
  // `ground` desaparece. Estos cuatro se dibujan directamente sobre él.
  it.each(["--muted", "--secondary", "--border", "--input"])("%s se distingue de ground", (token) => {
    for (const [name, theme] of themes) {
      const ratio = contrastRatio(parseHsl(theme[token]), parseHsl(theme["--ground"]));
      expect(ratio, `${token} sobre ground en ${name} (${ratio.toFixed(2)}:1)`).toBeGreaterThan(1.08);
    }
  });
});

describe("contraste AA de los pares más usados", () => {
  const pairs: Array<[string, string]> = [
    ["--foreground", "--ground"],
    ["--foreground", "--surface"],
    ["--foreground", "--raised"],
    ["--muted-foreground", "--ground"],
    ["--muted-foreground", "--surface"],
    ["--muted-foreground", "--raised"],
    ["--primary-foreground", "--primary"],
    ["--destructive-foreground", "--destructive"],
    ["--success-foreground", "--success"],
    ["--warning-foreground", "--warning"],
    ["--secondary-foreground", "--secondary"],
    ["--accent-foreground", "--accent"],
    ["--subtle-foreground", "--subtle"],
  ];

  it.each(pairs)("%s sobre %s cumple AA (4.5:1) en ambos temas y con cada estilo", (fg, bg) => {
    for (const [name, theme] of themes) {
      const ratio = contrastRatio(parseHsl(theme[fg]), parseHsl(theme[bg]));
      expect(ratio, `${fg} sobre ${bg} en ${name}: ${ratio.toFixed(2)}:1`).toBeGreaterThanOrEqual(4.5);
    }
  });
});

describe("estilos visuales (data-ui-look)", () => {
  // La lista es cerrada: un estilo mueve neutros, forma, sombra y el activo
  // del menú. Si alguien mete identidad o primeros planos aquí, la paleta y
  // el estilo dejan de ser independientes.
  const allowed = new Set([
    "--ground", "--surface", "--surface-hover", "--surface-border",
    "--raised", "--raised-border", "--border", "--input",
    "--muted", "--secondary", "--accent",
    "--radius", "--shadow-sm", "--shadow-raised",
    "--sidebar-active", "--sidebar-active-foreground", "--sidebar-active-bar",
  ]);

  it("solo mueven los tokens de la lista cerrada", () => {
    for (const [, name] of looksCss.matchAll(/(--[a-z0-9-]+):\s*[^;]+;/g)) {
      expect(allowed.has(name), `${name} no es un token que un estilo pueda mover`).toBe(true);
    }
  });

  it("cada estilo define sus neutros en claro y en oscuro", () => {
    for (const look of LOOKS) {
      for (const scope of ["light", "dark"] as const) {
        const found = lookTokens(look, scope);
        for (const level of ["--ground", "--surface", "--raised", "--muted", "--border"]) {
          expect(found[level], `${level} de ${look} en ${scope}`).toBeDefined();
        }
      }
    }
  });
});
