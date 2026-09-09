import { describe, expect, it } from "vitest";
import { relativeLuminance } from "../lib/color";

describe("relativeLuminance", () => {
  it("blanco puro tiene luminancia 1, negro puro tiene luminancia 0", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1, 5);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0, 5);
  });

  it("un gris intermedio queda estrictamente entre negro y blanco", () => {
    const luminancia = relativeLuminance({ r: 128, g: 128, b: 128 });
    expect(luminancia).toBeGreaterThan(0);
    expect(luminancia).toBeLessThan(1);
  });
});
