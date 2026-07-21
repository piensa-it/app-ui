import { describe, it, expect } from "vitest";
import {
  computePeriodSummary,
  computePosition,
  budgetExecution,
  monthlySeries,
  groupByCategory,
  percentChange,
  type CashflowTransaction,
  type AccountBalance,
} from "@/services/cashflow";

const tx = (partial: Partial<CashflowTransaction>): CashflowTransaction => ({
  tipo: "gasto",
  valor: 0,
  fecha: "2026-07-10T12:00:00Z",
  ...partial,
});

describe("computePeriodSummary", () => {
  it("suma ingresos y gastos y calcula flujo neto", () => {
    const s = computePeriodSummary([
      tx({ tipo: "ingreso", valor: 1000 }),
      tx({ tipo: "gasto", valor: 400 }),
      tx({ tipo: "gasto", valor: 100 }),
    ]);
    expect(s).toEqual({ ingresos: 1000, gastos: 500, flujoNeto: 500 });
  });

  it("excluye transferencias y ajustes (pago de tarjeta no es gasto)", () => {
    const s = computePeriodSummary([
      tx({ tipo: "ingreso", valor: 1000 }),
      tx({ tipo: "gasto", valor: 300 }),
      // pago de tarjeta: dos patas de transferencia
      tx({ tipo: "transferencia", valor: 300, transfer_direction: "out" }),
      tx({ tipo: "transferencia", valor: 300, transfer_direction: "in" }),
      tx({ tipo: "ajuste", valor: 50 }),
    ]);
    expect(s.ingresos).toBe(1000);
    expect(s.gastos).toBe(300);
    expect(s.flujoNeto).toBe(700);
  });
});

describe("computePosition (modelo tarjeta de crédito)", () => {
  const cuenta = (p: Partial<AccountBalance>): AccountBalance => ({
    id: "1",
    nombre: "Cuenta",
    tipo: "cuenta_ahorros",
    naturaleza: "activo",
    saldo_calculado: 0,
    activo: true,
    ...p,
  });

  it("separa disponible (activos) de deuda (pasivos)", () => {
    const pos = computePosition([
      cuenta({ id: "a", saldo_calculado: 2_000_000 }),
      cuenta({ id: "b", nombre: "Efectivo", tipo: "efectivo", saldo_calculado: 300_000 }),
      cuenta({ id: "c", nombre: "Visa", tipo: "tarjeta_credito", naturaleza: "pasivo", saldo_calculado: 800_000 }),
    ]);
    expect(pos.disponible).toBe(2_300_000);
    expect(pos.deuda).toBe(800_000);
    expect(pos.patrimonioNeto).toBe(1_500_000);
  });

  it("una compra con tarjeta no reduce el disponible", () => {
    // Antes de la compra
    const antes = computePosition([
      cuenta({ id: "a", saldo_calculado: 1_000_000 }),
      cuenta({ id: "c", tipo: "tarjeta_credito", naturaleza: "pasivo", saldo_calculado: 0 }),
    ]);
    // Después de comprar 200.000 con la tarjeta: sube la deuda, no baja el activo
    const despues = computePosition([
      cuenta({ id: "a", saldo_calculado: 1_000_000 }),
      cuenta({ id: "c", tipo: "tarjeta_credito", naturaleza: "pasivo", saldo_calculado: 200_000 }),
    ]);
    expect(despues.disponible).toBe(antes.disponible);
    expect(despues.patrimonioNeto).toBe(antes.patrimonioNeto - 200_000);
  });

  it("ignora cuentas inactivas", () => {
    const pos = computePosition([
      cuenta({ id: "a", saldo_calculado: 500 }),
      cuenta({ id: "b", saldo_calculado: 999, activo: false }),
    ]);
    expect(pos.disponible).toBe(500);
  });
});

describe("budgetExecution", () => {
  const txs = [
    tx({ tipo: "gasto", valor: 100, category_id: "cat1", fecha: "2026-07-05T12:00:00Z" }),
    tx({ tipo: "gasto", valor: 200, category_id: "cat1", fecha: "2026-07-20T12:00:00Z" }),
    tx({ tipo: "gasto", valor: 500, category_id: "cat2", fecha: "2026-07-08T12:00:00Z" }),
    tx({ tipo: "gasto", valor: 999, category_id: "cat1", fecha: "2026-06-08T12:00:00Z" }), // otro mes
    tx({ tipo: "transferencia", valor: 400, transfer_direction: "out", fecha: "2026-07-09T12:00:00Z" }),
  ];

  it("calcula ejecución por categoría solo del mes", () => {
    const e = budgetExecution(txs, 1000, "cat1", 2026, 6);
    expect(e.gastado).toBe(300);
    expect(e.porcentaje).toBe(30);
    expect(e.restante).toBe(700);
  });

  it("presupuesto global (category_id null) suma todos los gastos, sin transferencias", () => {
    const e = budgetExecution(txs, 1000, null, 2026, 6);
    expect(e.gastado).toBe(800);
    expect(e.porcentaje).toBe(80);
  });
});

describe("monthlySeries y comparativos", () => {
  it("genera n meses con el actual al final", () => {
    const txs = [
      tx({ tipo: "gasto", valor: 100, fecha: "2026-07-01T12:00:00Z" }),
      tx({ tipo: "ingreso", valor: 900, fecha: "2026-06-15T12:00:00Z" }),
    ];
    const serie = monthlySeries(txs, 3, new Date(2026, 6, 15));
    expect(serie).toHaveLength(3);
    expect(serie[2].gastos).toBe(100);
    expect(serie[1].ingresos).toBe(900);
    expect(serie[0]).toMatchObject({ ingresos: 0, gastos: 0 });
  });

  it("percentChange maneja base cero", () => {
    expect(percentChange(120, 100)).toBeCloseTo(20);
    expect(percentChange(80, 100)).toBeCloseTo(-20);
    expect(percentChange(50, 0)).toBeNull();
  });
});

describe("groupByCategory", () => {
  it("agrupa y ordena descendente", () => {
    const res = groupByCategory(
      [
        tx({ tipo: "gasto", valor: 10, categoria: "Comida" }),
        tx({ tipo: "gasto", valor: 40, categoria: "Vivienda" }),
        tx({ tipo: "gasto", valor: 15, categoria: "Comida" }),
        tx({ tipo: "ingreso", valor: 99, categoria: "Salario" }),
      ],
      "gasto"
    );
    expect(res).toEqual([
      { categoria: "Vivienda", total: 40 },
      { categoria: "Comida", total: 25 },
    ]);
  });
});
