import { describe, expect, it } from "vitest";
import { iconConfig } from "../lib/iconConfig";

describe("iconConfig", () => {
  it("cada tamaño mapea a una clase h-*/w-* distinta", () => {
    expect(iconConfig.sizes.sm).toBe("h-4 w-4");
    expect(iconConfig.sizes.xl).toBe("h-8 w-8");
    expect(iconConfig.sizes.sm).not.toBe(iconConfig.sizes.xl);
  });

  it("cada color semántico mapea a un token de texto (text-*)", () => {
    for (const clase of Object.values(iconConfig.colors)) {
      expect(clase).toMatch(/^text-/);
    }
  });

  it("containerShapes cubre square, rounded y circle con clases de radio distintas", () => {
    expect(iconConfig.containerShapes.square).toBe("rounded-md");
    expect(iconConfig.containerShapes.rounded).toBe("rounded-xl");
    expect(iconConfig.containerShapes.circle).toBe("rounded-full");
  });
});
