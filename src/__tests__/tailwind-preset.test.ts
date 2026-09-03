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
