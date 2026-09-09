import { describe, expect, it } from "vitest";
import { FONT_PRESETS, BUNDLED_LOOKS } from "../lib/appearance-presets";

describe("FONT_PRESETS", () => {
  it("trae los cuatro presets tipográficos de fábrica, cada uno con id y label", () => {
    expect(FONT_PRESETS).toHaveLength(4);
    for (const preset of FONT_PRESETS) {
      expect(preset.id).toBeTruthy();
      expect(preset.label).toBeTruthy();
    }
    expect(FONT_PRESETS.map((preset) => preset.id)).toEqual(["geist", "inter", "dm-sans", "system"]);
  });
});

describe("BUNDLED_LOOKS", () => {
  it("trae los cuatro estilos visuales de fábrica, incluido classic (el de fábrica)", () => {
    expect(BUNDLED_LOOKS).toHaveLength(4);
    expect(BUNDLED_LOOKS.map((look) => look.id)).toContain("classic");
    for (const look of BUNDLED_LOOKS) {
      expect(look.id).toBeTruthy();
      expect(look.label).toBeTruthy();
    }
  });
});
