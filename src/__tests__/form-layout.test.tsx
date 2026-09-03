import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormGrid } from "../components/ui/form-grid";
import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { Toolbar, ToolbarSeparator } from "../components/layout/toolbar";

describe("FormGrid", () => {
  it("coloca los campos en dos columnas a partir de pantalla mediana", () => {
    const { container } = render(
      <FormGrid>
        <Field label="Nombre"><Input /></Field>
        <Field label="Correo"><Input /></Field>
      </FormGrid>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/grid/);
    expect(root.className).toMatch(/sm:grid-cols-2/);
  });

  it("una columna cuando se pide", () => {
    const { container } = render(
      <FormGrid columns={1}>
        <Field label="Nombre"><Input /></Field>
      </FormGrid>,
    );
    expect((container.firstElementChild as HTMLElement).className).not.toMatch(/sm:grid-cols-2/);
  });

  it("un campo puede ocupar la fila entera sin escribir clases de rejilla", () => {
    render(
      <FormGrid>
        <Field label="Nombre"><Input /></Field>
        <Field label="Notas" span="full"><Input /></Field>
      </FormGrid>,
    );
    const notas = screen.getByLabelText("Notas").closest("[class*='col-span']");
    expect(notas).not.toBeNull();
  });

  it("usa el espaciado del sistema, no números sueltos", () => {
    const { container } = render(
      <FormGrid>
        <Field label="Nombre"><Input /></Field>
      </FormGrid>,
    );
    expect((container.firstElementChild as HTMLElement).className).toMatch(/gap-(md|lg|sm)\b/);
  });
});

describe("Toolbar", () => {
  it("alinea sus elementos con el espaciado del sistema", () => {
    const { container } = render(
      <Toolbar>
        <button type="button">Exportar</button>
      </Toolbar>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.className).toMatch(/flex/);
    expect(root.className).toMatch(/gap-(xs|sm)\b/);
  });

  it("empuja a la derecha lo que va después del separador", () => {
    render(
      <Toolbar>
        <span>Izquierda</span>
        <ToolbarSeparator />
        <span>Derecha</span>
      </Toolbar>,
    );
    const separator = screen.getByRole("separator", { hidden: true });
    expect(separator.className).toMatch(/ml-auto|flex-1/);
  });
});
