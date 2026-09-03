import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (file: string) => readFileSync(path.resolve(process.cwd(), file), "utf8");

/**
 * Qué nivel de la escala usa cada componente. Se comprueba sobre el fuente y
 * no sobre el DOM porque el nivel es una decisión de diseño: si alguien cambia
 * `bg-raised` por `bg-background` en un diálogo, el render sigue funcionando y
 * solo se nota al mirar las tres aplicaciones a la vez.
 */
describe("cada componente usa el nivel que le corresponde", () => {
  const raised: Array<[string, string]> = [
    ["Card", "src/components/ui/card.tsx"],
    ["Dialog", "src/components/ui/dialog.tsx"],
    ["AlertDialog", "src/components/ui/alert-dialog.tsx"],
    ["Popover", "src/components/ui/popover.tsx"],
    ["Sheet", "src/components/ui/sidebar.tsx"],
    ["Toast", "src/components/ui/toast.tsx"],
    ["paneles flotantes (Menu, Select, MultiSelect, AutoComplete, DatePicker)", "src/lib/recipes/field-control.ts"],
  ];

  it.each(raised)("%s se dibuja sobre `raised`", (_name, file) => {
    expect(read(file)).toMatch(/\bbg-raised\b/);
  });

  it.each(raised)("%s ya no usa `bg-background`, que ahora es el fondo de la página", (_name, file) => {
    expect(read(file)).not.toMatch(/\bbg-background\b/);
  });

  it("el body de la aplicación se dibuja sobre `ground`", () => {
    expect(read("src/styles/globals.css")).toMatch(/body\s*\{[^}]*bg-ground/);
  });

  it("ningún componente pinta un color de superficie fuera de la escala", () => {
    // Un hex o un gris de Tailwind en un componente rompe el tema de las tres
    // aplicaciones a la vez: los grises salen siempre de los tokens.
    const files = [
      "src/components/ui/card.tsx",
      "src/components/ui/dialog.tsx",
      "src/components/ui/sidebar.tsx",
      "src/components/ui/popover.tsx",
    ];
    for (const file of files) {
      expect(read(file), file).not.toMatch(/bg-(?:white|black|slate|gray|zinc|neutral|stone)-?\d*/);
      expect(read(file), file).not.toMatch(/bg-\[#[0-9a-fA-F]{3,8}\]/);
    }
  });
});
