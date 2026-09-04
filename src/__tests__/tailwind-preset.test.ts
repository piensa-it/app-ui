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
    ["gap-ui-sm", /\.gap-ui-sm\s*\{[^}]*var\(--space-sm\)/],
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

describe("tailwind-preset · la escala propia no le quita nombres a Tailwind", () => {
  /**
   * En Tailwind 4 el espacio de nombres del espaciado le gana SIEMPRE al de
   * contenedores, así que una clave de espaciado llamada `md` se lleva por
   * delante `max-w-md`, `w-md`, `min-w-md` y `basis-md`. No lo arregla ningún
   * override: ni `theme.maxWidth`, ni `@theme { --container-* }`, ni
   * `@utility`, ni un plugin —Tailwind fusiona las declaraciones y deja la del
   * espaciado la última—. Por eso los pasos van prefijados.
   *
   * A CoreLink le costó 35 pruebas de extremo a extremo: `max-w-2xl` valía
   * 3 rem en vez de 42 y los diálogos salían en una tira de 48 px, sin ningún
   * error de compilación que apuntara a la causa (#71).
   */
  const anchos = ["xs", "sm", "md", "lg", "xl", "2xl"];

  it.each(anchos)("`max-w-%s` lee la escala de contenedores, no la de espaciado", async (talla) => {
    const css = await compilarTailwind({ clases: [`max-w-${talla}`] });
    expect(css).toMatch(new RegExp(`\\.max-w-${talla}\\s*\\{[^}]*var\\(--container-${talla}\\)`));
    expect(css).not.toMatch(new RegExp(`\\.max-w-${talla}\\s*\\{[^}]*var\\(--space-`));
  });

  it.each(["w", "min-w", "basis"])("`%s-lg` tampoco lo secuestra el espaciado", async (prefijo) => {
    const css = await compilarTailwind({ clases: [`${prefijo}-lg`] });
    expect(css).not.toMatch(new RegExp(`\\.${prefijo}-lg\\s*\\{[^}]*var\\(--space-`));
  });

  it("los pasos del espaciado siguen existiendo con su prefijo", async () => {
    const css = await compilarTailwind({ clases: ["p-ui-md", "gap-ui-2xl"] });
    expect(css).toMatch(/\.p-ui-md\s*\{[^}]*var\(--space-md\)/);
    expect(css).toMatch(/\.gap-ui-2xl\s*\{[^}]*var\(--space-2xl\)/);
  });

  it("los nombres por rol van sin prefijo, porque no chocan con nada", async () => {
    const css = await compilarTailwind({ clases: ["p-inset", "gap-field"] });
    expect(css).toMatch(/\.p-inset\s*\{[^}]*var\(--space-inset\)/);
    expect(css).toMatch(/\.gap-field\s*\{[^}]*var\(--space-field\)/);
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
