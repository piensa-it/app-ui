import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Alert, AlertTitle, AlertDescription, alertVariants } from "../components/ui/alert";

describe("Alert", () => {
  it("compone título y descripción, con role=status por defecto", () => {
    render(
      <Alert>
        <AlertTitle>Guardado</AlertTitle>
        <AlertDescription>Los cambios se aplicaron.</AlertDescription>
      </Alert>,
    );
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("Guardado")).toBeInTheDocument();
    expect(screen.getByText("Los cambios se aplicaron.")).toBeInTheDocument();
  });

  it("variant=destructive cambia el role a alert — se anuncia de inmediato", () => {
    render(<Alert variant="destructive">Falló el guardado</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("reenvía className junto con las clases de la variante", () => {
    render(
      <Alert variant="success" className="mi-clase" data-testid="alerta">
        Listo
      </Alert>,
    );
    const alerta = screen.getByTestId("alerta");
    expect(alerta).toHaveClass("mi-clase");
    expect(alerta).toHaveClass("bg-success/10");
  });
});

describe("alertVariants", () => {
  it("distingue variantes: warning y destructive no comparten clase de fondo", () => {
    const warning = alertVariants({ variant: "warning" });
    const destructive = alertVariants({ variant: "destructive" });
    expect(warning).toContain("bg-warning/10");
    expect(destructive).not.toContain("bg-warning/10");
  });
});
