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

/**
 * `Stat` sabía medir, pero no decir qué clase de noticia es la cifra. `trend`
 * habla de la variación respecto al periodo anterior, y eso es otra cosa: una
 * cartera puede estar plana y aun así estar vencida. Por eso CoreLink tenía su
 * propio `KpiCard`, 54 usos en 15 pantallas (#74).
 */
describe("Stat · tono", () => {
  it("sin tono, el icono va en el color de marca y no en gris", () => {
    // Un tablero de seis cifras en gris no dice «normal», dice «apagado».
    const { container } = render(<Stat label="Ventas" value="1.248" icon={<svg />} />);
    const icono = container.querySelector("dt > span[aria-hidden]") as HTMLElement;
    expect(icono.className).toMatch(/text-primary/);
    expect(icono.className).not.toMatch(/text-muted/);
  });

  it("cada tono colorea el icono y el borde", () => {
    const casos = [
      ["positive", /success/],
      ["warning", /warning/],
      ["negative", /destructive/],
    ] as const;
    for (const [tone, patron] of casos) {
      const { container, unmount } = render(<Stat label="x" value="1" tone={tone} icon={<svg />} />);
      const raiz = container.firstElementChild as HTMLElement;
      const icono = container.querySelector("dt > span[aria-hidden]") as HTMLElement;
      expect(raiz.className).toMatch(patron);
      expect(icono.className).toMatch(patron);
      unmount();
    }
  });

  it("la cifra solo se tiñe en negative", () => {
    // El borde y el icono ya lo señalan; cuatro cifras de colores distintos
    // se leen peor, no mejor.
    const cifra = (tone: "warning" | "negative") => {
      const { container, unmount } = render(<Stat label="x" value="1" tone={tone} />);
      const dd = container.querySelector("dd") as HTMLElement;
      const clases = dd.className;
      unmount();
      return clases;
    };
    expect(cifra("negative")).toMatch(/text-destructive/);
    expect(cifra("warning")).not.toMatch(/text-warning/);
  });

  it("anuncia el tono en texto, no solo en color", () => {
    // Con la marca en verde, `default` y `positive` salen del mismo color:
    // quien lee con lector de pantalla —o no distingue el color— lo necesita
    // dicho.
    render(<Stat label="Cartera vencida" value="$ 3.100.000" tone="negative" />);
    expect(screen.getByText(/requiere acción/)).toBeInTheDocument();
  });

  it("el tono por defecto no añade ningún anuncio", () => {
    render(<Stat label="Ventas" value="1.248" />);
    expect(screen.queryByText(/requiere|salió/)).not.toBeInTheDocument();
  });
});
