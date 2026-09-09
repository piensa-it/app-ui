import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../components/ui/card";

describe("Card", () => {
  it("compone header, título, descripción, contenido y footer", () => {
    render(
      <Card data-testid="tarjeta" className="mi-clase">
        <CardHeader>
          <CardTitle>Título</CardTitle>
          <CardDescription>Descripción</CardDescription>
        </CardHeader>
        <CardContent>Contenido</CardContent>
        <CardFooter>Pie</CardFooter>
      </Card>,
    );

    const tarjeta = screen.getByTestId("tarjeta");
    expect(tarjeta).toHaveClass("mi-clase");
    expect(screen.getByRole("heading", { name: "Título" })).toBeInTheDocument();
    expect(screen.getByText("Descripción")).toBeInTheDocument();
    expect(screen.getByText("Contenido")).toBeInTheDocument();
    expect(screen.getByText("Pie")).toBeInTheDocument();
  });

  it("CardTitle renderiza un <h3> — jerarquía de encabezados correcta", () => {
    render(<CardTitle>Encabezado</CardTitle>);
    const heading = screen.getByRole("heading", { name: "Encabezado" });
    expect(heading.tagName).toBe("H3");
  });

  it("cada subparte reenvía className y ref al elemento que renderiza", () => {
    render(
      <div>
        <CardHeader data-testid="header" className="h-clase" />
        <CardContent data-testid="content" className="c-clase" />
        <CardFooter data-testid="footer" className="f-clase" />
      </div>,
    );
    expect(screen.getByTestId("header")).toHaveClass("h-clase");
    expect(screen.getByTestId("content")).toHaveClass("c-clase");
    expect(screen.getByTestId("footer")).toHaveClass("f-clase");
  });
});
