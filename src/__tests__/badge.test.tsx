import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge, badgeVariants } from "../components/ui/badge";

describe("Badge", () => {
  it("renderiza su contenido y la variante por defecto", () => {
    render(<Badge>Nuevo</Badge>);
    const badge = screen.getByText("Nuevo");
    expect(badge).toHaveClass("bg-primary");
  });

  it("aplica la variante e incorpora className del consumidor", () => {
    render(
      <Badge variant="destructive" size="lg" className="mi-clase">
        Vencido
      </Badge>,
    );
    const badge = screen.getByText("Vencido");
    expect(badge).toHaveClass("bg-destructive", "mi-clase");
  });
});

describe("badgeVariants", () => {
  it("es la función cva usada por Badge — mismas clases para la misma variante", () => {
    render(<Badge variant="success">Activo</Badge>);
    const badge = screen.getByText("Activo");
    for (const clase of badgeVariants({ variant: "success", size: "md" }).split(" ")) {
      expect(badge).toHaveClass(clase);
    }
  });

  it("distingue variantes: success y warning no comparten clase de fondo", () => {
    const success = badgeVariants({ variant: "success" });
    const warning = badgeVariants({ variant: "warning" });
    expect(success).toContain("bg-success");
    expect(warning).toContain("bg-warning");
    expect(success).not.toContain("bg-warning");
  });
});
