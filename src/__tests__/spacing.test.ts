import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (file: string) => readFileSync(path.resolve(process.cwd(), file), "utf8");
const css = read("src/styles/globals.css");
const preset = read("tailwind-preset.js");

const value = (name: string) => css.match(new RegExp(`${name}:\\s*([^;]+);`))?.[1]?.trim();

describe("escala de espaciado", () => {
  const scale = ["--space-2xs", "--space-xs", "--space-sm", "--space-md", "--space-lg", "--space-xl", "--space-2xl"];

  it.each(scale)("%s está definida", (token) => {
    expect(value(token)).toBeDefined();
  });

  it("la escala es estrictamente creciente", () => {
    const rems = scale.map((token) => Number.parseFloat(value(token)!));
    for (let i = 1; i < rems.length; i += 1) {
      expect(rems[i], `${scale[i]} debe superar a ${scale[i - 1]}`).toBeGreaterThan(rems[i - 1]);
    }
  });

  it("define los tres roles: relleno interior, ritmo vertical y separación etiqueta-control", () => {
    expect(value("--space-inset")).toBeDefined();
    expect(value("--space-inset-compact")).toBeDefined();
    expect(value("--space-stack")).toBeDefined();
    expect(value("--space-field")).toBeDefined();
  });

  it("el ritmo vertical entre bloques es de 24 px", () => {
    // 1.5rem = 24px, el ritmo que ya usan las aplicaciones.
    expect(value("--space-stack")).toBe("var(--space-lg)");
    expect(value("--space-lg")).toBe("1.5rem");
  });

  it("el preset publica la escala y los roles como utilidades de Tailwind", () => {
    for (const key of ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "inset", "inset-compact", "stack", "field"]) {
      expect(preset, `falta la clave de spacing "${key}"`).toMatch(
        new RegExp(`"?${key}"?:\\s*"var\\(--space-`),
      );
    }
  });
});

describe("los contenedores usan la escala, no números sueltos", () => {
  it.each([
    ["Card", "src/components/ui/card.tsx"],
    ["Dialog", "src/components/ui/dialog.tsx"],
    ["Field", "src/components/ui/field.tsx"],
    ["PageHeader", "src/components/layout/page-header.tsx"],
  ])("%s se espacia con la escala, no con números sueltos", (_name, file) => {
    const source = read(file);
    // Vale un paso de la escala (`gap-ui-sm`) o un nombre de rol (`p-inset`).
    expect(source).toMatch(/\b(p|px|py|gap|gap-x|gap-y|space-y)-(ui-(?:2xs|xs|sm|md|lg|xl|2xl)|inset|inset-compact|stack|field)\b/);
    // Y no un número suelto de la escala nativa de Tailwind. `0` sí vale:
    // significa "sin espacio", no un tamaño elegido a ojo.
    expect(source).not.toMatch(/\b(p|px|py|gap|space-y)-(?:[1-9]|1[0-9])(?:\.5)?\b/);
  });

  it("Card y Dialog comparten el mismo relleno interior", () => {
    expect(read("src/components/ui/card.tsx")).toMatch(/\bp-inset\b/);
    expect(read("src/components/ui/dialog.tsx")).toMatch(/\bp-inset\b/);
  });
});
