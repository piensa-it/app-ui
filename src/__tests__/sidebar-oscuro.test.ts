import { describe, expect, it } from "vitest";

import { capaDe, compilarGlobals } from "../test/compilar-tailwind";

/**
 * El menú lateral es un plano distinto y conserva su carácter en los dos
 * temas, pero su luminosidad tiene que seguir a la escala de superficies del
 * tema activo. Con los tokens fijos, en oscuro quedaba un gris azulado al 13%
 * junto a una página neutra al 7%: más claro que la página y de otro tono.
 *
 * Se comprueba sobre el CSS compilado: que cada variante tenga su versión
 * `.dark`, que viva en la misma capa que el resto de tokens (o perdería contra
 * la aplicación por el motivo de #70), y que su luminosidad quede al nivel
 * `surface` y no por encima.
 */
describe("menú lateral · tema oscuro", () => {
  const luminosidad = (css: string, selector: string, token: string): number => {
    const bloque = new RegExp(`${selector}\\s*\\{[^}]*${token}:\\s*[\\d.]+\\s+[\\d.]+%\\s+([\\d.]+)%`).exec(css);
    if (!bloque) throw new Error(`no se encontró ${token} en ${selector}`);
    return Number(bloque[1]);
  };

  it.each(["graphite", "ink", "smoke"])("la variante %s tiene versión oscura en la capa base", async (variante) => {
    const css = await compilarGlobals();
    const patron = new RegExp(`\\.dark \\[data-sidebar="${variante}"\\]\\s*\\{[^}]*--sidebar:`);
    expect(capaDe(css, patron)).toBe("base");
  });

  it.each(["graphite", "ink", "smoke"])("en oscuro, %s no queda más claro que la superficie", async (variante) => {
    const css = await compilarGlobals();
    const menu = luminosidad(css, `\\.dark \\[data-sidebar="${variante}"\\]`, "--sidebar");
    const superficie = luminosidad(css, "\\.dark", "--surface");
    const pagina = luminosidad(css, "\\.dark", "--ground");
    // Entre la página y la superficie, inclusive: enmarca la página junto a la
    // barra superior en vez de flotar por encima de las dos.
    expect(menu).toBeGreaterThanOrEqual(pagina);
    expect(menu).toBeLessThanOrEqual(superficie);
  });

  it("en oscuro el grafito es neutro, como las superficies", async () => {
    const css = await compilarGlobals();
    const bloque = /\.dark \[data-sidebar="graphite"\]\s*\{[^}]*--sidebar:\s*(\d+)\s+(\d+)%/.exec(css);
    expect(bloque).not.toBeNull();
    // Saturación 0: el tinte azul solo contrasta bien contra una página clara.
    expect(Number(bloque![2])).toBe(0);
  });

  it("en claro el menú sigue siendo oscuro: la identidad no cambia", async () => {
    const css = await compilarGlobals();
    const claro = luminosidad(css, `\\[data-sidebar="graphite"\\]`, "--sidebar");
    expect(claro).toBeLessThan(20);
  });
});
