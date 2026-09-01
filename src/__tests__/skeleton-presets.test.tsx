import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkeletonCard, SkeletonKpi, SkeletonTable } from "@/components/ui/skeleton";

describe("Presets de Skeleton", () => {
  it("SkeletonCard expone un único role=status con sus líneas como decoración", () => {
    render(<SkeletonCard lines={4} label="Cargando contrato" />);
    const status = screen.getByRole("status", { name: "Cargando contrato" });
    // 1 título + 4 líneas, todos huesos aria-hidden — ningún status anidado.
    expect(status.querySelectorAll("[aria-hidden]")).toHaveLength(5);
    expect(status.querySelectorAll("[role='status']")).toHaveLength(0);
  });

  it("SkeletonTable simula encabezado y filas según props", () => {
    render(<SkeletonTable rows={3} columns={5} />);
    const status = screen.getByRole("status", { name: "Cargando tabla" });
    // encabezado (5) + 3 filas × 5 celdas
    expect(status.querySelectorAll("[aria-hidden]")).toHaveLength(20);
  });

  it("SkeletonKpi renderiza rótulo y cifra", () => {
    render(<SkeletonKpi />);
    const status = screen.getByRole("status", { name: "Cargando indicador" });
    expect(status.querySelectorAll("[aria-hidden]")).toHaveLength(2);
  });
});
