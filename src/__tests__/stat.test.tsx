import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { Stat, StatGroup } from "../components/ui/stat";

describe("Stat", () => {
  it("relaciona el rótulo con su cifra", () => {
    render(<Stat label="Entradas" value="$ 60.938.100" />);
    const term = screen.getByText("Entradas");
    expect(term.tagName).toBe("DT");
    expect(screen.getByText("$ 60.938.100").tagName).toBe("DD");
  });

  it("no usa un encabezado para la cifra", () => {
    // Un encabezado cuyo texto es "$ 60.938.100" ensucia el esquema de la
    // página: quien navega por encabezados se encuentra números sueltos.
    const { container } = render(<Stat label="Entradas" value="$ 60.938.100" />);
    expect(container.querySelector("h1, h2, h3, h4, h5, h6")).toBeNull();
  });

  it("muestra una nota al pie de la cifra", () => {
    render(<Stat label="Entradas" value="$ 60.938.100" description="6 movimientos recaudados" />);
    expect(screen.getByText("6 movimientos recaudados")).toBeInTheDocument();
  });

  it("la variación dice su sentido, no solo su color", () => {
    render(<Stat label="Ventas" value="120" trend={{ value: "+12%", direction: "up" }} />);
    // El color no basta: quien no lo distingue necesita leerlo.
    expect(screen.getByText(/\+12%/)).toHaveAccessibleName(/sube/i);
  });

  it("admite variación a la baja y neutra", () => {
    const { rerender } = render(<Stat label="Ventas" value="120" trend={{ value: "-4%", direction: "down" }} />);
    expect(screen.getByText(/-4%/)).toHaveAccessibleName(/baja/i);
    rerender(<Stat label="Ventas" value="120" trend={{ value: "0%", direction: "flat" }} />);
    expect(screen.getByText(/0%/)).toHaveAccessibleName(/sin cambio/i);
  });

  it("en carga no anuncia una cifra que todavía no existe", () => {
    render(<Stat label="Entradas" value="—" loading />);
    expect(screen.getByRole("group", { name: "Entradas" })).toHaveAttribute("aria-busy", "true");
  });
});

describe("StatGroup", () => {
  it("agrupa las métricas en una fila", () => {
    render(
      <StatGroup>
        <Stat label="Entradas" value="10" />
        <Stat label="Salidas" value="4" />
        <Stat label="Saldo" value="6" />
      </StatGroup>,
    );
    const group = screen.getByRole("group", { name: "Indicadores" });
    expect(within(group).getAllByRole("group")).toHaveLength(3);
  });

  it("acepta un nombre propio cuando hay varios grupos en la pantalla", () => {
    render(
      <StatGroup label="Caja del turno">
        <Stat label="Entradas" value="10" />
      </StatGroup>,
    );
    expect(screen.getByRole("group", { name: "Caja del turno" })).toBeInTheDocument();
  });
});
