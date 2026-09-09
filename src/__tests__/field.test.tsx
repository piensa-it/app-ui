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

  /**
   * `orientation="horizontal"` (#132): la descripción cambia de columna —de
   * junto al control a bajo el rótulo— pero la asociación accesible
   * (`aria-describedby`) no puede depender de dónde vive el nodo en el DOM.
   * Estas pruebas comprueban las dos cosas por separado a propósito: que el
   * texto esté en el sitio correcto, y que siga citado desde el control sin
   * importar en qué columna quedó.
   */
  describe("orientación horizontal", () => {
    it("pinta la descripción bajo el rótulo, no junto al control", () => {
      render(
        <Field orientation="horizontal" label="Nombre de la empresa" description="Como aparece en el registro.">
          <Input />
        </Field>,
      );
      const rotulo = screen.getByText("Nombre de la empresa");
      const descripcion = screen.getByText("Como aparece en el registro.");
      const control = screen.getByLabelText("Nombre de la empresa");

      // Misma columna que el rótulo: la fila del rótulo vive dentro de la
      // columna izquierda (un nivel más arriba), que es un ancestro común que
      // no contiene al control. Si la descripción se quedara junto al
      // control (el bug que corrige esta HU), el ancestro común más cercano
      // sería el contenedor raíz de `Field`, que sí contiene al control.
      const columnaIzquierda = rotulo.closest("div")?.parentElement;
      expect(columnaIzquierda).toContainElement(descripcion);
      expect(columnaIzquierda).not.toContainElement(control);
    });

    it("sigue asociando la descripción al control por aria-describedby aunque cambie de columna", () => {
      render(
        <Field orientation="horizontal" label="Nombre de la empresa" description="Como aparece en el registro.">
          <Input />
        </Field>,
      );
      expect(screen.getByLabelText("Nombre de la empresa")).toHaveAccessibleDescription(
        "Como aparece en el registro.",
      );
    });

    it("el error se queda junto al control, no en la columna del rótulo", () => {
      render(
        <Field orientation="horizontal" label="Correo de facturación" error="Dominio no autorizado.">
          <Input />
        </Field>,
      );
      const control = screen.getByLabelText("Correo de facturación");
      const alerta = screen.getByRole("alert");
      const rotulo = screen.getByText("Correo de facturación");

      const columnaIzquierda = rotulo.closest("div");
      expect(columnaIzquierda).not.toContainElement(alerta);
      expect(control.getAttribute("aria-describedby")).toContain(alerta.id);
    });

    it("con error, la columna del rótulo no pinta la descripción (se pierde igual que en vertical)", () => {
      render(
        <Field
          orientation="horizontal"
          label="Correo de facturación"
          description="Se usa para la factura electrónica."
          error="Dominio no autorizado."
        >
          <Input />
        </Field>,
      );
      expect(screen.queryByText("Se usa para la factura electrónica.")).not.toBeInTheDocument();
    });

    it("el control lleva la clase de tope de ancho; en vertical no la lleva", () => {
      const { rerender, container } = render(
        <Field orientation="horizontal" label="Teléfono">
          <Input />
        </Field>,
      );
      const columnaDeControlHorizontal = container.querySelector("input")?.parentElement;
      expect(columnaDeControlHorizontal?.className).toContain("max-w-md");

      rerender(
        <Field orientation="vertical" label="Teléfono">
          <Input />
        </Field>,
      );
      const columnaDeControlVertical = container.querySelector("input")?.parentElement;
      expect(columnaDeControlVertical?.className).not.toContain("max-w-md");
    });

    /**
     * La columna del rótulo también topa (#132, segunda ronda): con
     * `minmax(10rem, 0.4fr)` una sola palabra se estiraba a 418 px, medido
     * con la mutación real en `tests/browser` a 1920 px de ventana con
     * `PageContainer` `wide` (0,4 × ~1045 px de contenido, no de ventana).
     * `20rem` la mantiene junto al control en vez de separarlos por medio
     * contenedor de sobra. El valor exacto se comprueba aquí (contra un
     * cambio que lo borre o lo cambie sin darse cuenta); que a 1920 px eso de
     * verdad se traduzca en un bloque compacto se comprueba midiendo el DOM
     * en `tests/browser`.
     */
    it("la columna del rótulo topa en 20rem, no en una fracción del contenedor", () => {
      const { container } = render(
        <Field orientation="horizontal" label="Teléfono">
          <Input />
        </Field>,
      );
      const raiz = container.firstElementChild;
      expect(raiz?.className).toContain("minmax(10rem,20rem)");
      expect(raiz?.className).not.toContain("0.4fr");
    });
  });

  /**
   * `compositeControl` (#132, revisión): `AvatarPicker` no expone un único
   * elemento enfocable al que asociar el `id` que `Field` inyecta —y
   * `AvatarPickerProps` ni siquiera acepta `id`—, así que el `<label
   * htmlFor>` de siempre quedaba apuntando a un elemento que nunca existió.
   * `getByLabelText`/`toHaveAccessibleDescription` no lo habrían detectado
   * porque ninguno resuelve `htmlFor` contra el DOM real; por eso la prueba
   * de más abajo lo hace a mano.
   */
  describe("control compuesto (compositeControl)", () => {
    it("pinta el rótulo como <span>, no como <label>", () => {
      const { container } = render(
        <Field compositeControl label="Foto">
          <div>Contenido compuesto</div>
        </Field>,
      );
      expect(container.querySelector("label")).not.toBeInTheDocument();
      expect(screen.getByText("Foto").tagName).toBe("SPAN");
    });

    it("asocia el grupo por aria-labelledby, con role=group, en vez de por htmlFor", () => {
      render(
        <Field compositeControl label="Foto">
          <div>Contenido compuesto</div>
        </Field>,
      );
      expect(screen.getByRole("group", { name: "Foto" })).toBeInTheDocument();
    });

    it("el aria-labelledby del grupo resuelve a un elemento que de verdad existe", () => {
      const { container } = render(
        <Field compositeControl label="Foto">
          <div>Contenido compuesto</div>
        </Field>,
      );
      const grupo = screen.getByRole("group", { name: "Foto" });
      const labelledbyId = grupo.getAttribute("aria-labelledby");
      expect(labelledbyId).toBeTruthy();
      expect(container.querySelector(`[id="${labelledbyId}"]`)).not.toBeNull();
    });

    it("aria-describedby del grupo referencia la descripción, igual que en un control simple", () => {
      render(
        <Field compositeControl label="Foto" description="Ayuda del grupo.">
          <div>Contenido compuesto</div>
        </Field>,
      );
      expect(screen.getByRole("group", { name: "Foto" })).toHaveAccessibleDescription("Ayuda del grupo.");
    });

    /**
     * La prueba general que pidió la revisión: no basta con que `Field`
     * ofrezca `compositeControl`, hay que comprobar que quien lo usa no deja
     * un `label[for]` colgando —apuntando a un `id` que ningún elemento del
     * documento tiene—. Cubre tanto el caso simple (el `id` que `Field`
     * genera sí existe, en el control clonado) como el compuesto (no hay
     * ningún `label[for]` en absoluto).
     */
    it("ningún label[for] en el documento apunta a un id que no existe", () => {
      const { container } = render(
        <>
          <Field label="Simple">
            <Input />
          </Field>
          <Field compositeControl label="Compuesto">
            <div>Contenido compuesto</div>
          </Field>
        </>,
      );
      const labelsConFor = Array.from(container.querySelectorAll("label[for]"));
      // Sanity: el caso simple sí pinta un `label[for]` — si esto diera 0,
      // la prueba de abajo pasaría sin comprobar nada.
      expect(labelsConFor.length).toBeGreaterThan(0);
      for (const label of labelsConFor) {
        const forId = label.getAttribute("for")!;
        expect(container.querySelector(`[id="${forId}"]`)).not.toBeNull();
      }
    });
  });
});
