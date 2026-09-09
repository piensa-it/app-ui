import { describe, expect, it } from "vitest";
import { initialsFrom } from "../lib/initials";

describe("initialsFrom", () => {
  it("nombre y apellido: primera letra de cada palabra", () => {
    expect(initialsFrom("Ada Lovelace")).toBe("AL");
  });

  it("una sola palabra: las dos primeras letras", () => {
    expect(initialsFrom("Acme")).toBe("AC");
  });

  it("ignora formas societarias al elegir las palabras (Acme S.A. → AC, no AS)", () => {
    expect(initialsFrom("Acme S.A.")).toBe("AC");
  });

  it("más de dos palabras: solo toma las dos primeras relevantes", () => {
    expect(initialsFrom("Piensa IT Colombia SAS")).toBe("PI");
  });
});
