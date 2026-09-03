import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { UI_LIBRARY_RELEASES, UI_LIBRARY_VERSION } from "../version";

describe("historial de versiones", () => {
  it("la versión compilada coincide con package.json", () => {
    const pkg = JSON.parse(readFileSync(path.resolve(process.cwd(), "package.json"), "utf8"));
    expect(UI_LIBRARY_VERSION).toBe(pkg.version);
  });

  it("la versión actual encabeza el historial", () => {
    expect(UI_LIBRARY_RELEASES[0].version).toBe(UI_LIBRARY_VERSION);
    expect(UI_LIBRARY_RELEASES[0].channel).toBe("current");
  });

  it("cada entrada dice qué hay que cambiar al subir, no solo qué cambió", () => {
    // Sin esto, "qué cambió" queda en el CHANGELOG y "qué tengo que hacer yo"
    // se descubre en la aplicación, después de subir.
    for (const release of UI_LIBRARY_RELEASES) {
      expect(Array.isArray(release.migration), `${release.version} sin migración`).toBe(true);
    }
  });

  it("la versión actual explica los cambios de comportamiento de esta línea", () => {
    const current = UI_LIBRARY_RELEASES[0];
    expect(current.migration.length).toBeGreaterThan(0);
    for (const step of current.migration) {
      expect(step.length, "cada paso debe ser una instrucción, no una etiqueta").toBeGreaterThan(20);
    }
  });
});
