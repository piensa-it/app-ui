import type { Meta, StoryObj } from "@storybook/react-vite";
import { FormGrid } from "./form-grid";
import { Field } from "./field";
import { Input } from "./input";
import { Select } from "./select";
import { Textarea } from "./textarea";
import { Button } from "./button";
import { Toolbar, ToolbarSeparator } from "@/components/layout/toolbar";

const meta = {
  title: "UI/FormGrid",
  component: FormGrid,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Rejilla de campos con el espaciado del sistema. Un campo ancho se declara con `span=\"full\"` en el `Field`, sin escribir clases de rejilla.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof FormGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const centros = [
  { value: "comercial", label: "Comercial" },
  { value: "operaciones", label: "Operaciones" },
];

/** Dos columnas en pantalla mediana, una en el teléfono. */
export const Default: Story = {
  name: "Formulario a dos columnas",
  render: () => (
    <form className="space-y-stack" onSubmit={(event) => event.preventDefault()}>
      <FormGrid>
        <Field label="Nombre" required>
          <Input placeholder="Distribuidora El Poblado" />
        </Field>
        <Field label="Documento" description="NIT sin dígito de verificación.">
          <Input placeholder="900123456" />
        </Field>
        <Field label="Centro de costo">
          <Select options={centros} />
        </Field>
        <Field label="Correo" optionalLabel="Opcional">
          <Input type="email" placeholder="contacto@empresa.com" />
        </Field>
        <Field label="Notas" span="full" description="Contexto para quien revise el registro.">
          <Textarea rows={3} />
        </Field>
      </FormGrid>
      <Toolbar>
        <ToolbarSeparator />
        <Button variant="outline" type="button">
          Cancelar
        </Button>
        <Button type="submit">Guardar</Button>
      </Toolbar>
    </form>
  ),
};

/** Una columna para formularios cortos o paneles estrechos. */
export const UnaColumna: Story = {
  name: "Una columna",
  render: () => (
    <FormGrid columns={1}>
      <Field label="Concepto">
        <Input />
      </Field>
      <Field label="Valor">
        <Input inputMode="numeric" />
      </Field>
    </FormGrid>
  ),
};

/**
 * `Toolbar` alinea controles con el espaciado del sistema, y
 * `ToolbarSeparator` empuja a la derecha lo que venga después. `width="auto"`
 * evita que un `Select` ocupe toda la fila.
 */
export const BarraDeHerramientas: Story = {
  name: "Barra de herramientas",
  render: () => (
    <Toolbar>
      <Select width="auto" aria-label="Periodo" options={[{ value: "2026-09", label: "Septiembre 2026" }]} />
      <ToolbarSeparator />
      <Button variant="outline" size="sm">
        Exportar
      </Button>
      <Button size="sm">Nuevo</Button>
    </Toolbar>
  ),
};
