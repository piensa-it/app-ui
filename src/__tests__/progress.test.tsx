import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "../components/ui/progress";

describe("Progress", () => {
  it("expone value/max en el role=progressbar", () => {
    render(<Progress value={40} max={100} aria-label="Carga" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "40");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("showValue pinta el porcentaje como texto", () => {
    render(<Progress value={25} showValue aria-label="Carga" />);
    expect(screen.getByText("25%")).toBeInTheDocument();
  });

  it("sin showValue no pinta texto de porcentaje", () => {
    render(<Progress value={25} aria-label="Carga" />);
    expect(screen.queryByText("25%")).not.toBeInTheDocument();
  });

  it("value=null (indeterminado) no rompe y sigue exponiendo el role sin aria-valuenow", () => {
    render(<Progress value={null} aria-label="Cargando" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });
});
