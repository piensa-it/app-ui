import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DatePicker } from "../components/ui/date-picker";
import { Field } from "../components/ui/field";
import { Input } from "../components/ui/input";
import { MultiSelect } from "../components/ui/multi-select";
import { Select } from "../components/ui/select";
import { Textarea } from "../components/ui/textarea";

const opciones = [
  { label: "Colombia", value: "co" },
  { label: "México", value: "mx" },
];

/**
 * Field es el camino por defecto para poner un control en un formulario: debe
 * conectar `<label>`, descripción y error con CUALQUIER control de la librería
 * sin que quien lo usa tenga que pasar ids ni `aria-*` a mano.
 *
 * Estas pruebas cubren, para los cinco controles de formulario principales:
 *   a) el label queda asociado al control,
 *   b) con `error` el control queda `aria-invalid` y el mensaje se anuncia
 *      (role="alert") y queda referenciado por `aria-describedby`,
 *   c) con `description` el texto queda referenciado por `aria-describedby`.
 *
 * Los cinco deben cumplirlo SIN ajustes en el sitio de uso. Si un control nuevo
 * no cumple estas tres cosas dentro de `Field`, no está terminado.
 */
describe("Field · integración con los controles de formulario", () => {
  describe("Input", () => {
    it("asocia el label con el control", () => {
      render(<Field label="Correo electrónico"><Input type="email" /></Field>);
      expect(screen.getByLabelText("Correo electrónico")).toBeInstanceOf(HTMLInputElement);
    });

    it("marca el control como inválido y referencia el error anunciado", () => {
      render(<Field label="Correo electrónico" error="Correo inválido"><Input /></Field>);
      const control = screen.getByLabelText("Correo electrónico");
      const alerta = screen.getByRole("alert");

      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(alerta).toHaveTextContent("Correo inválido");
      expect(control.getAttribute("aria-describedby")).toContain(alerta.id);
      expect(control).toHaveAccessibleDescription("Correo inválido");
    });

    it("referencia la descripción de ayuda", () => {
      render(<Field label="Correo electrónico" description="Lo usamos para avisarte."><Input /></Field>);
      expect(screen.getByLabelText("Correo electrónico")).toHaveAccessibleDescription("Lo usamos para avisarte.");
    });
  });

  describe("Textarea", () => {
    it("asocia el label con el control", () => {
      render(<Field label="Comentarios"><Textarea /></Field>);
      expect(screen.getByLabelText("Comentarios")).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("marca el control como inválido y referencia el error anunciado", () => {
      render(<Field label="Comentarios" error="Escribe al menos 20 caracteres."><Textarea /></Field>);
      const control = screen.getByLabelText("Comentarios");
      const alerta = screen.getByRole("alert");

      expect(control).toHaveAttribute("aria-invalid", "true");
      expect(alerta).toHaveTextContent("Escribe al menos 20 caracteres.");
      expect(control.getAttribute("aria-describedby")).toContain(alerta.id);
      expect(control).toHaveAccessibleDescription("Escribe al menos 20 caracteres.");
    });

    it("referencia la descripción de ayuda", () => {
      render(<Field label="Comentarios" description="Máximo 500 caracteres."><Textarea /></Field>);
      expect(screen.getByLabelText("Comentarios")).toHaveAccessibleDescription("Máximo 500 caracteres.");
    });
  });

  describe("Select", () => {
    // El trigger de Ark es un <button role="combobox">: `getByLabelText` lo
    // rechaza por no ser un elemento "labellable" en HTML, pero el nombre
    // accesible sí se calcula a partir del <label for>, que es lo que anuncia
    // el lector de pantalla. Por eso aquí se consulta por rol + nombre.
    it("asocia el label con el trigger", () => {
      render(<Field label="País"><Select options={opciones} /></Field>);
      expect(screen.getByRole("combobox", { name: "País" })).toBeInTheDocument();
    });

    it("anuncia el mensaje de error", () => {
      render(<Field label="País" error="Selecciona un país."><Select options={opciones} /></Field>);
      expect(screen.getByRole("alert")).toHaveTextContent("Selecciona un país.");
    });

    it("marca el trigger como inválido", () => {
      render(<Field label="País" error="Selecciona un país."><Select options={opciones} /></Field>);
      expect(screen.getByRole("combobox", { name: "País" })).toHaveAttribute("aria-invalid", "true");
    });

    it("referencia la descripción desde el trigger", () => {
      render(<Field label="País" description="Donde opera la empresa."><Select options={opciones} /></Field>);
      expect(screen.getByRole("combobox", { name: "País" })).toHaveAccessibleDescription("Donde opera la empresa.");
    });
  });

  describe("DatePicker", () => {
    it("asocia el label con el input de fecha", () => {
      render(<Field label="Fecha de inicio"><DatePicker /></Field>);
      expect(screen.getByLabelText("Fecha de inicio")).toBeInstanceOf(HTMLInputElement);
    });

    it("anuncia el mensaje de error", () => {
      render(<Field label="Fecha de inicio" error="Elige una fecha futura."><DatePicker /></Field>);
      expect(screen.getByRole("alert")).toHaveTextContent("Elige una fecha futura.");
    });

    it("marca el input como inválido", () => {
      render(<Field label="Fecha de inicio" error="Elige una fecha futura."><DatePicker /></Field>);
      expect(screen.getByLabelText("Fecha de inicio")).toHaveAttribute("aria-invalid", "true");
    });

    it("referencia la descripción desde el input", () => {
      render(<Field label="Fecha de inicio" description="Formato dd/mm/aaaa."><DatePicker /></Field>);
      expect(screen.getByLabelText("Fecha de inicio")).toHaveAccessibleDescription("Formato dd/mm/aaaa.");
    });
  });

  describe("MultiSelect", () => {
    it("toma el label del Field como nombre accesible", () => {
      render(<Field label="Mercados"><MultiSelect options={opciones} /></Field>);
      expect(screen.getByRole("combobox", { name: "Mercados" })).toBeInTheDocument();
    });

    it("sin etiqueta externa conserva un nombre propio", () => {
      render(<MultiSelect aria-label="Mercados" options={opciones} />);
      expect(screen.getByRole("combobox", { name: "Mercados" })).toBeInTheDocument();
    });

    it("anuncia el mensaje de error", () => {
      render(<Field label="Mercados" error="Elige al menos un mercado."><MultiSelect options={opciones} /></Field>);
      expect(screen.getByRole("alert")).toHaveTextContent("Elige al menos un mercado.");
    });

    it("marca el trigger como inválido", () => {
      render(<Field label="Mercados" error="Elige al menos un mercado."><MultiSelect options={opciones} /></Field>);
      expect(screen.getByRole("combobox", { name: "Mercados" })).toHaveAttribute("aria-invalid", "true");
    });

    it("referencia la descripción desde el trigger", () => {
      render(<Field label="Mercados" description="Puedes elegir varios."><MultiSelect options={opciones} /></Field>);
      expect(screen.getByRole("combobox", { name: "Mercados" })).toHaveAccessibleDescription("Puedes elegir varios.");
    });
  });

  describe("comportamiento común", () => {
    it("respeta el id que ya trae el control", () => {
      render(<Field label="Correo" description="Ayuda"><Input id="correo-personalizado" /></Field>);
      const control = screen.getByLabelText("Correo");
      expect(control).toHaveAttribute("id", "correo-personalizado");
      expect(control).toHaveAttribute("aria-describedby", "correo-personalizado-description");
    });

    it("marca el campo como requerido junto al label", () => {
      render(<Field label="Correo" required optionalLabel="Opcional"><Input /></Field>);
      expect(screen.getByText("*")).toHaveAttribute("aria-hidden", "true");
      expect(screen.queryByText("Opcional")).not.toBeInTheDocument();
    });

    it("muestra el texto de opcional cuando el campo no es requerido", () => {
      render(<Field label="Teléfono" optionalLabel="Opcional"><Input /></Field>);
      expect(screen.getByText("Opcional")).toBeInTheDocument();
    });

    it("da prioridad al error sobre la descripción", () => {
      render(<Field label="Correo" description="Correo de trabajo" error="Correo inválido"><Input /></Field>);
      expect(screen.queryByText("Correo de trabajo")).not.toBeInTheDocument();
      expect(screen.getByLabelText("Correo")).toHaveAccessibleDescription("Correo inválido");
    });
  });
});
