import { describe, expect, it } from "vitest";
import path from "node:path";
import resolveConfig from "tailwindcss/resolveConfig";
import type { Config } from "tailwindcss";
// El preset es un .js plano a propósito (se importa desde node_modules sin
// compilar), así que aquí se tipa a mano.
// @ts-expect-error -- módulo JavaScript sin declaraciones
import presetModule, { content as presetContent } from "../../tailwind-preset.js";

const preset = presetModule as Config;
const uiLibraryContent = presetContent as string[];

describe("tailwind-preset · la escala de controles se genera entera", () => {
  /** Compila el preset con las clases dadas y devuelve el CSS resultante. */
  async function compilar(clases: string[]): Promise<string> {
    const postcss = (await import("postcss")).default;
    const tailwindcss = (await import("tailwindcss")).default;
    const result = await postcss([
      tailwindcss({ presets: [preset], content: [{ raw: `<i class="${clases.join(" ")}"></i>` }] }),
    ]).process("@tailwind utilities;", { from: undefined });
    return result.css;
  }

  // Un fallo así es invisible en revisión: la clase se escribe en el
  // componente, existe en el preset a medias, y simplemente no se genera. El
  // botón de icono salía a la anchura de su contenido en vez de a sus 40 px.
  const tamanos = ["control-compact", "control-default", "control-comfortable"];

  it.each(tamanos)("`w-%s` se genera", async (tamano) => {
    expect(await compilar([`w-${tamano}`])).toContain(`.w-${tamano}`);
  });

  it.each(tamanos)("`h-%s` se genera", async (tamano) => {
    expect(await compilar([`h-${tamano}`])).toContain(`.h-${tamano}`);
  });

  it.each(tamanos)("`min-w-%s` y `min-h-%s` se generan", async (tamano) => {
    const css = await compilar([`min-w-${tamano}`, `min-h-${tamano}`]);
    expect(css).toContain(`.min-w-${tamano}`);
    expect(css).toContain(`.min-h-${tamano}`);
  });

  it("una caja cuadrada de control queda cuadrada de verdad", async () => {
    const css = await compilar(["h-control-default", "w-control-default"]);
    // Las dos leen el mismo token: si solo se genera una, el botón sale
    // rectangular sin que nadie lo note al revisar el código.
    expect(css).toMatch(/\.h-control-default\s*\{\s*height:\s*var\(--control-default\)/);
    expect(css).toMatch(/\.w-control-default\s*\{\s*width:\s*var\(--control-default\)/);
  });
});

describe("tailwind-preset", () => {
  it("exporta `content` con los módulos publicados, resuelto respecto al paquete", () => {
    expect(Array.isArray(uiLibraryContent)).toBe(true);
    expect(uiLibraryContent.length).toBeGreaterThan(0);
    for (const entry of uiLibraryContent as string[]) {
      expect(path.isAbsolute(entry)).toBe(true);
      expect(entry.startsWith(path.resolve(process.cwd(), "dist"))).toBe(true);
    }
    expect(uiLibraryContent.some((entry) => entry.endsWith(".js"))).toBe(true);
  });

  it("Tailwind 3 no hereda `content` de un preset: el consumidor lo concatena", () => {
    const resolved = resolveConfig({ presets: [preset], content: ["./src/**/*.tsx"] } as Config);
    expect(resolved.content.files).toEqual(["./src/**/*.tsx"]);
    const withLibrary = resolveConfig({
      presets: [preset],
      content: [...uiLibraryContent, "./src/**/*.tsx"],
    } as Config);
    expect(withLibrary.content.files).toEqual([...uiLibraryContent, "./src/**/*.tsx"]);
  });
});
