import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import * as icons from "../icons";

/**
 * El catálogo de iconos es el único set oficial: las aplicaciones retiraron
 * `lucide-react` y lo que no esté aquí lo sustituyen con un glifo parecido y un
 * `TODO(app-ui#N)`. Cada ampliación viene de una de esas listas (#90 fue la de
 * MiDivisa), y lo que se comprueba es que el catálogo y su documentación no se
 * desvíen: la tabla de equivalencias es lo que lee quien migra.
 */
describe("catálogo de iconos", () => {
  const catalogo = Object.keys(icons).filter((nombre) => nombre.endsWith("Icon"));

  it.each([
    "ArrowDownLeftIcon",
    "ArrowLeftRightIcon",
    "EuroIcon",
    "FlagIcon",
    "HotelIcon",
    "PlugIcon",
    "PoundSterlingIcon",
    "ScrollTextIcon",
    "ToggleLeftIcon",
    "ToggleRightIcon",
    "UserCogIcon",
  ])("`%s` está en el catálogo (#90)", (nombre) => {
    expect(icons).toHaveProperty(nombre);
  });

  it("la pareja de compra/venta está completa", () => {
    // `ArrowDownLeft` es la pareja de `ArrowUpRight`; una sin la otra obliga a
    // sustituir una de las dos con un glifo que no es su espejo.
    expect(catalogo).toContain("ArrowUpRightIcon");
    expect(catalogo).toContain("ArrowDownLeftIcon");
  });

  it("la documentación dice cuántos iconos hay, y acierta", () => {
    const doc = fs.readFileSync(path.join(process.cwd(), "docs/ICONS.md"), "utf8");
    const declarado = Number(/catálogo curado de (\d+) iconos/.exec(doc)?.[1]);
    expect(declarado).toBe(catalogo.length);
  });

  it("todos los añadidos de #90 tienen su fila en la tabla de equivalencias", () => {
    const doc = fs.readFileSync(path.join(process.cwd(), "docs/ICONS.md"), "utf8");
    for (const nombre of ["EuroIcon", "PoundSterlingIcon", "HotelIcon", "UserCogIcon", "ToggleRightIcon"]) {
      expect(doc).toContain(`| \`${nombre}\` |`);
    }
  });
});
