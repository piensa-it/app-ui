import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { createPalette, paletteDeclarations, THEMABLE_TOKENS } from "../lib/palette";

/**
 * Los tokens de color no son todos de la misma clase, y los que se parecen son
 * los que más caro salen: `--primary` es identidad y `--accent` es el gris de
 * interacción —el fondo de los `hover`—. Una aplicación del grupo escribió su
 * selector de color moviendo `--accent`, y con el tema verde todos los hover
 * salían verdes con el texto de dentro ilegible (#76).
 *
 * Estas pruebas fijan el contrato en los dos sitios donde se puede romper: el
 * constructor que damos a las aplicaciones y las paletas que traemos nosotros.
 */
describe("createPalette · solo mueve lo que es de la marca", () => {
  it("emite exactamente los siete tokens tematizables", () => {
    expect(Object.keys(createPalette({ primary: "158 64% 32%" })).sort()).toEqual(
      [...THEMABLE_TOKENS].sort(),
    );
  });

  it.each(["--accent", "--muted", "--border", "--input", "--destructive", "--success", "--warning"])(
    "nunca emite `%s`, que no es un color de marca",
    (token) => {
      const palette = createPalette({ primary: "158 64% 32%" });
      expect(Object.keys(palette)).not.toContain(token);
    },
  );

  it("el anillo de foco sigue a la marca sin tener que acordarse", () => {
    // Olvidarlo deja el foco en el color de fábrica: el único sitio de la
    // pantalla que no se entera del cambio de tema.
    const palette = createPalette({ primary: "158 64% 32%" });
    expect(palette["--ring"]).toBe(palette["--primary"]);
  });

  it("respeta lo que se le pasa explícitamente", () => {
    const palette = createPalette({ primary: "158 64% 32%", ring: "0 0% 0%", chart: "1 2% 3%" });
    expect(palette["--ring"]).toBe("0 0% 0%");
    expect(palette["--chart-1"]).toBe("1 2% 3%");
  });

  it("un color mal escrito falla al construir, no al pintar", () => {
    // `hsl(...)` o un hex son el error natural: los tokens guardan los tres
    // canales sueltos para poder componer `hsl(var(--primary) / 0.1)`.
    expect(() => createPalette({ primary: "#16a34a" })).toThrow(/H S% L%/);
    expect(() => createPalette({ primary: "hsl(158 64% 32%)" })).toThrow(/H S% L%/);
  });

  it("sobre un color oscuro el texto sale blanco, y sobre uno claro no", () => {
    expect(createPalette({ primary: "243 75% 59%" })["--primary-foreground"]).toBe("0 0% 100%");
    expect(createPalette({ primary: "48 96% 80%" })["--primary-foreground"]).not.toBe("0 0% 100%");
  });

  it("el tema oscuro invierte los tonos que acompañan, no los repite", () => {
    const claro = createPalette({ primary: "243 75% 59%" });
    const oscuro = createPalette({ primary: "243 82% 70%" }, { dark: true });
    // En claro el fondo teñido es casi blanco; en oscuro, casi negro.
    expect(Number(claro["--subtle"].split(" ")[2].replace("%", ""))).toBeGreaterThan(90);
    expect(Number(oscuro["--subtle"].split(" ")[2].replace("%", ""))).toBeLessThan(30);
  });

  it("se escribe como declaraciones CSS, para cuando hay tema oscuro", () => {
    // Un `style` en línea no puede reaccionar a `.dark`, así que la paleta
    // tiene que poder vivir en una regla.
    const css = paletteDeclarations(createPalette({ primary: "158 64% 32%" }));
    expect(css).toContain("--primary: 158 64% 32%;");
    expect(css).toContain("--ring: 158 64% 32%;");
  });
});

describe("palettes.css · las paletas incluidas respetan su propio contrato", () => {
  const fuente = fs.readFileSync(path.join(process.cwd(), "src/styles/palettes.css"), "utf8");

  it("ninguna paleta mueve un token que no sea de marca", () => {
    // Es el mismo fallo, cometido en casa: si una paleta de fábrica tocara
    // `--accent`, cada aplicación que la use hereda hover teñidos.
    const declarados = [...fuente.matchAll(/^\s*(--[a-z0-9-]+):/gm)].map((m) => m[1]);
    const fuera = [...new Set(declarados)].filter(
      (token) => !THEMABLE_TOKENS.includes(token as (typeof THEMABLE_TOKENS)[number]),
    );
    expect(fuera).toEqual([]);
  });

  it("todas mueven el anillo de foco", () => {
    const bloques = fuente.split("}").filter((bloque) => bloque.includes("--primary:"));
    expect(bloques.length).toBeGreaterThan(0);
    for (const bloque of bloques) {
      expect(bloque).toContain("--ring:");
    }
  });
});
