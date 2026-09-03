import { describe, expect, it } from "vitest";
import { cn } from "../lib/utils";

/**
 * `cn` resuelve conflictos con `tailwind-merge`, que de fábrica solo conoce la
 * escala nativa de Tailwind. Cada escala propia de la librería —tipografía,
 * espaciado, alturas de control, duraciones— hay que declararla, o pasa una de
 * dos cosas, las dos malas:
 *
 *   1. Dos clases de grupos distintos se toman por rivales y una desaparece:
 *      `text-ui-body-sm` seguido de `text-sidebar-muted` perdía el tamaño, y el
 *      menú lateral se veía un tercio más grande de lo diseñado.
 *   2. Dos clases del mismo grupo no se reconocen como rivales y sobreviven las
 *      dos: `gap-sm` + `gap-md` dejaba ganar a la hoja de estilos, así que
 *      `className` no podía anular el espaciado de un componente.
 */
describe("cn · escala tipográfica propia", () => {
  it("un tamaño y un color conviven: son cosas distintas", () => {
    expect(cn("text-ui-body-sm", "text-sidebar-muted")).toBe("text-ui-body-sm text-sidebar-muted");
  });

  it.each([
    ["text-warning-foreground"],
    ["text-current"],
    ["text-muted-foreground"],
    ["text-destructive"],
  ])("el tamaño sobrevive junto a %s", (color) => {
    expect(cn("text-ui-caption", color).split(" ")).toContain("text-ui-caption");
  });

  it("entre dos tamaños gana el último, que es de lo que va `cn`", () => {
    expect(cn("text-ui-body-sm", "text-ui-title")).toBe("text-ui-title");
    expect(cn("text-ui-display", "text-sm")).toBe("text-sm");
  });

  it("entre dos colores sigue ganando el último", () => {
    expect(cn("text-muted-foreground", "text-destructive")).toBe("text-destructive");
  });
});

describe("cn · escala de espaciado propia", () => {
  it.each([
    ["gap-sm", "gap-md"],
    ["gap-x-xs", "gap-x-lg"],
    ["p-inset", "p-inset-compact"],
    ["px-md", "px-lg"],
    ["py-2xs", "py-xl"],
    ["space-y-stack", "space-y-md"],
    ["m-sm", "m-2xl"],
    ["mt-field", "mt-xs"],
  ])("`%s` la anula `%s`", (before, after) => {
    expect(cn(before, after)).toBe(after);
  });

  it("la escala propia y la nativa de Tailwind se reconocen entre sí", () => {
    expect(cn("p-inset", "p-4")).toBe("p-4");
    expect(cn("gap-4", "gap-sm")).toBe("gap-sm");
  });
});

describe("cn · alturas de control y duraciones", () => {
  it("una altura de control anula a otra", () => {
    expect(cn("h-control-default", "h-control-compact")).toBe("h-control-compact");
    expect(cn("min-h-control-default", "min-h-control-comfortable")).toBe("min-h-control-comfortable");
  });

  it("una duración anula a otra", () => {
    expect(cn("duration-fast", "duration-normal")).toBe("duration-normal");
  });

  it("una sombra de nivel anula a otra", () => {
    expect(cn("shadow-raised", "shadow-surface")).toBe("shadow-surface");
  });
});

describe("cn · lo que ya funcionaba sigue funcionando", () => {
  it("resuelve la escala nativa", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("bg-ground", "bg-raised")).toBe("bg-raised");
  });

  it("acepta condicionales y listas, como clsx", () => {
    const oculto = false;
    expect(cn("a", oculto && "b", ["c", null], { d: true, e: false })).toBe("a c d");
  });
});
