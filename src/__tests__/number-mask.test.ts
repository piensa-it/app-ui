import { describe, expect, it } from "vitest";
import { createNumberMask } from "../lib/number-mask";

// Intl separa el símbolo de moneda con un espacio duro (U+00A0); se normaliza para leer los casos.
const plain = (text: string) => text.replace(/[\u00a0\u202f]/g, " ");

describe("createNumberMask", () => {
  const cop = createNumberMask("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 2 })!;
  const usd = createNumberMask("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 })!;
  const entero = createNumberMask("es-CO", { maximumFractionDigits: 0 })!;

  it("agrupa miles con el separador de la locale mientras se escribe", () => {
    expect(plain(cop.format("1234567"))).toBe("$ 1.234.567");
    expect(usd.format("1234567")).toBe("$1,234,567");
    expect(entero.format("1234567")).toBe("1.234.567");
  });

  it("conserva el decimal a medio escribir, sin rellenar ceros", () => {
    expect(plain(cop.format("1234,"))).toBe("$ 1.234,");
    expect(plain(cop.format("1234,5"))).toBe("$ 1.234,5");
    expect(usd.format("1234.50")).toBe("$1,234.50");
  });

  it("recorta los decimales al máximo del formato", () => {
    expect(plain(cop.format("1,999"))).toBe("$ 1,99");
    expect(entero.format("12,5")).toBe("125");
  });

  it("reagrupa texto que ya traía separadores o símbolo (pegado, reescritura)", () => {
    expect(plain(cop.format("$1.234.567,89"))).toBe("$ 1.234.567,89");
    expect(plain(cop.format("$ 1.2345"))).toBe("$ 12.345");
  });

  it("deja vacío lo que quedó sin dígitos, y el signo solo si se escribió", () => {
    expect(cop.format("")).toBe("");
    expect(cop.format("$ ")).toBe("");
    expect(entero.format("-")).toBe("-");
    expect(entero.format("-1234")).toBe("-1.234");
  });

  it("antepone el cero cuando se empieza por el decimal", () => {
    expect(plain(cop.format(","))).toBe("$ 0,");
  });

  it("convierte el texto enmascarado al número que representa", () => {
    expect(cop.toNumber("$ 1.234.567,89")).toBe(1234567.89);
    expect(usd.toNumber("$1,234.5")).toBe(1234.5);
    expect(entero.toNumber("-1.234")).toBe(-1234);
    expect(cop.toNumber("$ ")).toBeUndefined();
  });

  it("en porcentaje, lo escrito son puntos porcentuales", () => {
    const pct = createNumberMask("es-CO", { style: "percent", maximumFractionDigits: 1 })!;
    expect(pct.format("15,5")).toBe(new Intl.NumberFormat("es-CO", { style: "percent", maximumFractionDigits: 1 }).format(0.155));
    expect(pct.toNumber("15,5 %")).toBeCloseTo(0.155);
  });

  it("ubica el cursor tras el mismo número de dígitos, saltando separadores", () => {
    // "1234|" → "1.234|"
    expect(entero.caretAfter("1.234", entero.significantBefore("1234", 4))).toBe(5);
    // "1.23|4" tras teclear un 9 en medio → "12.39|4"
    const raw = "1.2394";
    expect(entero.caretAfter(entero.format(raw), entero.significantBefore(raw, 5))).toBe(5);
  });

  it("no enmascara notaciones que cambiarían lo que se lee (compacta)", () => {
    expect(createNumberMask("es-CO", { notation: "compact" })).toBeNull();
  });
  it("el cursor sin dígitos por delante queda tras el prefijo, y más allá del final se recorta", () => {
    expect(cop.caretAfter("$ 12", 0)).toBe(2);
    expect(cop.caretAfter("", 0)).toBe(0);
    expect(cop.caretAfter("$ 12", 9)).toBe(4);
  });

  it("distingue el adorno (separador, símbolo) de lo que se escribe", () => {
    expect(cop.isDecoration(".")).toBe(true);
    expect(cop.isDecoration("$")).toBe(true);
    expect(cop.isDecoration("5")).toBe(false);
    expect(cop.isDecoration(",")).toBe(false);
  });

  it("no enmascara locales con otro sistema de numeración", () => {
    expect(createNumberMask("ar-EG", { maximumFractionDigits: 0 })).toBeNull();
  });
});
