import { describe, expect, it } from "vitest";
import path from "node:path";

import { compilarTailwind } from "../test/compilar-tailwind";

// El preset es un .js plano a propósito: se importa desde node_modules sin
// pasar por un paso de compilación, y Tailwind 4 lo sigue cargando con
// `@config`, así que las aplicaciones que lo extienden no cambian nada.
// @ts-expect-error -- módulo JavaScript sin declaraciones
import { content as presetContent } from "../../tailwind-preset.js";

const uiLibraryContent = presetContent as string[];

/**
 * Estas pruebas compilan Tailwind de verdad en vez de leer el objeto del
 * preset. Es la única forma de detectar el tipo de fallo que ya nos costó una
 * versión: una clave declarada a medias —`height` sí, `width` no— deja una
 * clase que se escribe en el componente y no existe en el CSS. Revisando el
 * código no se ve; compilando, sí.
 */
describe("tailwind-preset · la escala de controles se genera entera", () => {
  const tamanos = ["control-compact", "control-default", "control-comfortable"];

  it.each(tamanos)("`w-%s` se genera", async (tamano) => {
    expect(await compilarTailwind({ clases: [`w-${tamano}`] })).toContain(`.w-${tamano}`);
  });

  it.each(tamanos)("`h-%s` se genera", async (tamano) => {
    expect(await compilarTailwind({ clases: [`h-${tamano}`] })).toContain(`.h-${tamano}`);
  });

  it.each(tamanos)("`min-w-%s` y `min-h-%s` se generan", async (tamano) => {
    const css = await compilarTailwind({ clases: [`min-w-${tamano}`, `min-h-${tamano}`] });
    expect(css).toContain(`.min-w-${tamano}`);
    expect(css).toContain(`.min-h-${tamano}`);
  });

  it("una caja cuadrada de control queda cuadrada de verdad", async () => {
    const css = await compilarTailwind({ clases: ["h-control-default", "w-control-default"] });
    // Las dos leen el mismo token: si solo se genera una, el botón sale
    // rectangular sin que nadie lo note al revisar el código.
    expect(css).toMatch(/\.h-control-default\s*\{\s*height:\s*var\(--control-default\)/);
    expect(css).toMatch(/\.w-control-default\s*\{\s*width:\s*var\(--control-default\)/);
  });
});

describe("tailwind-preset · el resto de escalas propias", () => {
  it.each([
    ["bg-primary", /\.bg-primary[^{]*\{[^}]*hsl\(var\(--primary\)\)/],
    ["bg-raised", /\.bg-raised[^{]*\{[^}]*hsl\(var\(--raised\)\)/],
    ["gap-sm", /\.gap-sm\s*\{[^}]*var\(--space-sm\)/],
    ["p-inset", /\.p-inset\s*\{[^}]*var\(--space-inset\)/],
    ["text-ui-body-sm", /\.text-ui-body-sm\s*\{[^}]*var\(--font-size-body-sm\)/],
    ["shadow-raised", /\.shadow-raised\s*\{[^}]*var\(--shadow-raised\)/],
    ["duration-normal", /\.duration-normal\s*\{[^}]*var\(--duration-normal\)/],
  ])("`%s` se genera leyendo su token", async (clase, patron) => {
    expect(await compilarTailwind({ clases: [clase] })).toMatch(patron);
  });

  it("el color de marca se resuelve en cada elemento, no una sola vez", async () => {
    // Lo que permite que una aplicación redefina `--primary` en un contenedor
    // —o que `.dark` cambie el tema— es que la utilidad emita `hsl(var(...))`
    // y no un valor ya calculado. Si esto se rompiera, el theming por marca
    // dejaría de funcionar sin que ninguna otra prueba se enterase.
    const css = await compilarTailwind({ clases: ["bg-primary"] });
    expect(css).toContain("hsl(var(--primary))");
  });

  it("la variante oscura se genera como selector de clase", async () => {
    const css = await compilarTailwind({ clases: ["dark:bg-ground"] });
    expect(css).toMatch(/\.dark/);
  });
});

describe("tailwind-preset · el `content` publicado", () => {
  it("apunta a los módulos publicados, resuelto respecto al paquete", () => {
    expect(Array.isArray(uiLibraryContent)).toBe(true);
    expect(uiLibraryContent.length).toBeGreaterThan(0);
    for (const entrada of uiLibraryContent) {
      expect(path.isAbsolute(entrada)).toBe(true);
      expect(entrada.startsWith(path.resolve(process.cwd(), "dist"))).toBe(true);
    }
    expect(uiLibraryContent.some((entrada) => entrada.endsWith(".js"))).toBe(true);
  });
});
