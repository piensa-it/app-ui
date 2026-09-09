import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";
import { UI_LIBRARY_RELEASES } from "../version";

/**
 * Las notas de migración de la 1.0.0 (#150) describen cuatro rupturas
 * concretas. Ya están publicadas, así que dejaron de ser un plan y pasaron a
 * ser una afirmación sobre el código: si alguien reintroduce un alias de
 * `Button` o vuelve a exportar `Layout`, las notas que leen las aplicaciones
 * al actualizar pasan a mentir, y nada más lo detectaría.
 *
 * Mientras la constante estaba fuera del array —antes del release— esta
 * prueba comprobaba además su posición. Ese riesgo desapareció al publicarla:
 * `version.test.ts` ya exige que la cabeza del array case con
 * `UI_LIBRARY_VERSION` y con `package.json`.
 */
describe("notas de migración de la 1.0.0 (#150)", () => {
  it("la cabeza del array es la 1.0.0 o posterior, nunca anterior", () => {
    const [actual] = UI_LIBRARY_RELEASES;
    const [mayor] = actual.version.split(".").map(Number);
    expect(
      mayor >= 1,
      `la entrada actual es ${actual.version}: publicada la 1.0.0, no se vuelve atrás`,
    ).toBe(true);
  });

  it("sigue siendo cierto que `buttonVariants` no acepta los alias retirados", () => {
    const fuente = readFileSync(
      path.resolve(process.cwd(), "src/lib/recipes/button.ts"),
      "utf8",
    );
    // Claves de variante retiradas: comprobación textual, no de tipos, para
    // que falle también si alguien las reintroduce sin tipar `variant` como
    // `any`. `\bdefault:\s*"` no matchea `defaultVariants:` (le sigue
    // "Variants", no ":").
    for (const alias of ["ghost:", "secondary:", /\bdefault:\s*"/]) {
      const patron = typeof alias === "string" ? new RegExp(`\\b${alias}`) : alias;
      expect(
        patron.test(fuente),
        `las notas de la 1.0.0 dicen que \`${alias}\` se retiró de button.ts, pero sigue ahí`,
      ).toBe(false);
    }
  });

  it("sigue siendo cierto que el barrel no exporta `Layout`", () => {
    const barril = readFileSync(path.resolve(process.cwd(), "src/index.ts"), "utf8");
    // Los comentarios de sección ("// --- Layout ---", la categoría de
    // exports) mencionan la palabra sin exportar el componente — se filtran
    // antes de buscar, para no confundir un encabezado con un export real.
    const sinComentarios = barril
      .split("\n")
      .filter((linea) => !linea.trim().startsWith("//"))
      .join("\n");
    expect(
      /\bLayout\b/.test(sinComentarios),
      "las notas de la 1.0.0 dicen que `Layout` salió del barrel, pero src/index.ts vuelve a exportarlo (o a referenciarlo fuera de un comentario)",
    ).toBe(false);
  });
});
