import { describe, it, expect } from "vitest";
import { dueOccurrences, nextOccurrence, nextDueDate, type RecurringRule } from "@/services/recurring";

const rule = (p: Partial<RecurringRule>): RecurringRule => ({
  id: "r1",
  frecuencia: "monthly",
  fecha_inicio: "2026-01-15",
  fecha_fin: null,
  activo: true,
  ...p,
});

describe("nextOccurrence", () => {
  it("mensual conserva el día cuando existe", () => {
    const n = nextOccurrence(new Date(2026, 0, 15), "monthly");
    expect([n.getFullYear(), n.getMonth(), n.getDate()]).toEqual([2026, 1, 15]);
  });

  it("mensual ajusta fin de mes (31 ene → 28 feb)", () => {
    const n = nextOccurrence(new Date(2026, 0, 31), "monthly");
    expect([n.getMonth(), n.getDate()]).toEqual([1, 28]);
  });

  it("quincenal suma 14 días", () => {
    const n = nextOccurrence(new Date(2026, 0, 1), "biweekly");
    expect(n.getDate()).toBe(15);
  });
});

describe("dueOccurrences (generación idempotente)", () => {
  it("genera los periodos vencidos hasta hoy", () => {
    const periods = dueOccurrences(rule({}), new Date(2026, 3, 20)); // 20 abr 2026
    expect(periods).toEqual(["2026-01-15", "2026-02-15", "2026-03-15", "2026-04-15"]);
  });

  it("dos ejecuciones devuelven exactamente los mismos periodos (sin duplicar)", () => {
    const a = dueOccurrences(rule({}), new Date(2026, 6, 1));
    const b = dueOccurrences(rule({}), new Date(2026, 6, 1));
    expect(a).toEqual(b);
    expect(new Set(a).size).toBe(a.length); // sin repetidos
  });

  it("respeta la fecha de fin", () => {
    const periods = dueOccurrences(
      rule({ fecha_fin: "2026-02-28" }),
      new Date(2026, 6, 1)
    );
    expect(periods).toEqual(["2026-01-15", "2026-02-15"]);
  });

  it("regla inactiva no genera nada", () => {
    expect(dueOccurrences(rule({ activo: false }), new Date(2026, 6, 1))).toEqual([]);
  });

  it("no genera ocurrencias futuras", () => {
    const periods = dueOccurrences(rule({ fecha_inicio: "2026-12-01" }), new Date(2026, 6, 1));
    expect(periods).toEqual([]);
  });
});

describe("nextDueDate", () => {
  it("devuelve la próxima ocurrencia futura", () => {
    expect(nextDueDate(rule({}), new Date(2026, 3, 20))).toBe("2026-05-15");
  });

  it("devuelve null si la regla terminó", () => {
    expect(nextDueDate(rule({ fecha_fin: "2026-02-28" }), new Date(2026, 6, 1))).toBeNull();
  });
});
