import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";
import { Button } from "../components/ui/button";
import { EmptyState } from "../components/ui/empty-state";
import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { InputGroup, InputGroupAddon } from "../components/ui/input-group";
import { Skeleton } from "../components/ui/skeleton";
import { Icon, IconTile } from "../components/ui/icon";
import { Surface } from "../components/ui/surface";
import { Bell } from "lucide-react";

describe("patrones UX", () => {
  it("Field conecta label, descripción y error con el control", () => {
    render(<Field label="Correo" description="Correo de trabajo" error="Correo inválido"><Input /></Field>);
    const input = screen.getByLabelText("Correo");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAccessibleDescription("Correo inválido");
  });

  it("Alert destructivo anuncia el error", () => {
    render(<Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>No se guardó.</AlertDescription></Alert>);
    expect(screen.getByRole("alert")).toHaveTextContent("No se guardó.");
  });

  it("Skeleton comunica el estado de carga", () => {
    render(<Skeleton label="Cargando movimientos" />);
    expect(screen.getByRole("status", { name: "Cargando movimientos" })).toBeInTheDocument();
  });

  it("EmptyState ofrece una acción", () => {
    render(<EmptyState title="Sin resultados" action={<Button>Limpiar filtros</Button>} />);
    expect(screen.getByRole("heading", { name: "Sin resultados" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Limpiar filtros" })).toBeInTheDocument();
  });

  it("InputGroup compone prefijos con un campo accesible", () => {
    render(<InputGroup><InputGroupAddon>$</InputGroupAddon><Input aria-label="Valor" /></InputGroup>);
    expect(screen.getByRole("textbox", { name: "Valor" })).toBeInTheDocument();
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("Icon distingue contenido decorativo y accesible", () => {
    render(<><Icon icon={Bell} /><IconTile icon={Bell} label="Notificaciones" /></>);
    expect(screen.getByRole("img", { name: "Notificaciones" })).toBeInTheDocument();
  });

  it("Surface aplica una superficie semántica configurable", () => {
    render(<Surface as="section" variant="subtle">Resumen</Surface>);
    expect(screen.getByText("Resumen")).toHaveClass("bg-subtle");
  });
});
