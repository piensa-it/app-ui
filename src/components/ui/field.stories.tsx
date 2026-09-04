import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./button";
import { DatePicker } from "./date-picker";
import { Field } from "./field";
import { Input } from "./input";
import { MultiSelect } from "./multi-select";
import { Select } from "./select";
import { Textarea } from "./textarea";

const paises = [
  { label: "Colombia", value: "co" },
  { label: "México", value: "mx" },
  { label: "España", value: "es" },
  { label: "Chile", value: "cl" },
];

const mercados = [
  { label: "Retail", value: "retail" },
  { label: "Industrial", value: "industrial" },
  { label: "Servicios financieros", value: "financiero" },
  { label: "Sector público", value: "publico" },
];

const meta = {
  title: "UI/Field",
  component: Field,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Patrón accesible para componer label, ayuda, control y mensaje de error. Es el camino por defecto para poner cualquier control en un formulario: Field genera el `id`, lo asocia al `<label>` y conecta la descripción y el error por `aria-describedby`, de modo que ninguna aplicación tenga que repetir ese cableado ni inventar su propio espaciado.",
      },
    },
  },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Lo mínimo: label + control. Úsalo cuando la etiqueta ya explica todo lo que
 * hay que saber del campo y no hay nada que aclarar.
 */
export const Default: Story = {
  args: {
    label: "Correo electrónico",
    children: <Input type="email" placeholder="nombre@empresa.com" />,
  },
};

/**
 * Con descripción. Úsala para explicar el formato esperado o qué se hará con el
 * dato — todo lo que evite un error antes de que ocurra. Va debajo del control y
 * el lector de pantalla la anuncia al enfocarlo, así que no repitas ahí el label.
 */
export const ConDescripcion: Story = {
  args: {
    label: "Correo electrónico",
    description: "Lo usaremos para enviarte notificaciones importantes.",
    children: <Input type="email" placeholder="nombre@empresa.com" />,
  },
};

/**
 * Con error. Aparece tras validar y reemplaza a la descripción: el mensaje se
 * anuncia con `role="alert"` y el control queda `aria-invalid`. Escribe qué hay
 * que hacer para corregirlo, no solo que está mal.
 */
export const ConError: Story = {
  args: {
    label: "Correo electrónico",
    error: "Ingresa un correo electrónico válido.",
    required: true,
    children: <Input defaultValue="correo-invalido" />,
  },
};

/**
 * Campo opcional. Marcar lo opcional en vez de lo obligatorio funciona mejor
 * cuando casi todo el formulario es requerido; si es al revés, usa `required`.
 */
export const Opcional: Story = {
  args: {
    label: "Teléfono de contacto",
    optionalLabel: "Opcional",
    children: <Input type="tel" placeholder="+57 300 000 0000" />,
  },
};

/**
 * Orientación horizontal: el label queda a la izquierda del control en
 * pantallas medianas y arriba en móvil. Úsala en formularios largos de
 * configuración o de detalle, donde la lectura en dos columnas ayuda a recorrer
 * muchos campos; para formularios de captura cortos, mejor la vertical.
 */
export const Horizontal: Story = {
  args: {
    label: "Nombre de la empresa",
    children: <Input />,
  },
  render: () => (
    <div className="max-w-3xl space-y-stack">
      <Field
        orientation="horizontal"
        label="Nombre de la empresa"
        description="Como aparece en el registro mercantil."
      >
        <Input defaultValue="Piensa IT" />
      </Field>
      <Field orientation="horizontal" label="País" required>
        <Select options={paises} value="co" />
      </Field>
      <Field
        orientation="horizontal"
        label="Correo de facturación"
        error="Este dominio no está autorizado para facturación."
      >
        <Input defaultValue="pagos@dominio-externo.com" />
      </Field>
    </div>
  ),
};

/**
 * Densidad compacta: reduce el espacio entre label, control y mensaje. Resérvala
 * para paneles laterales, filtros y formularios embebidos donde el alto es
 * escaso; en un formulario de página completa, `comfortable` se lee mejor.
 */
export const Densidad: Story = {
  args: {
    label: "Campo",
    children: <Input />,
  },
  render: () => (
    <div className="grid max-w-lg gap-ui-lg">
      {(["comfortable", "compact"] as const).map((density) => (
        <Field
          key={density}
          density={density}
          label={`Densidad ${density}`}
          description="El espacio entre las partes sale de la escala de la librería."
        >
          <Input />
        </Field>
      ))}
    </div>
  ),
};

export const Superficies: Story = {
  args: {
    label: "Campo",
    children: <Input />,
  },
  render: () => (
    <div className="grid max-w-lg gap-ui-md">
      {(["plain", "outline", "surface", "subtle"] as const).map((variant) => (
        <Field
          key={variant}
          variant={variant}
          label={`Campo ${variant}`}
          description="La superficie se adapta al nivel de agrupación requerido."
        >
          <Input variant={variant === "plain" ? "surface" : variant === "outline" ? "outline" : variant} />
        </Field>
      ))}
    </div>
  ),
};

/**
 * Formulario completo con los cinco controles de captura principales —Input,
 * Select, DatePicker, MultiSelect y Textarea— cada uno dentro de un Field.
 *
 * Este es el patrón a copiar al armar un formulario en cualquier aplicación: no
 * hay ni un `id`, ni un `htmlFor`, ni un `aria-describedby` escrito a mano, y el
 * espaciado entre campos sale de `space-y-stack`, no de un número suelto. Envía
 * el formulario vacío para ver cómo se comportan los errores.
 */
export const FormularioCompleto: Story = {
  args: {
    label: "Formulario",
    children: <Input />,
  },
  render: () => {
    const Demo = () => {
      const [nombre, setNombre] = useState("");
      const [pais, setPais] = useState<string | number | null>(null);
      const [fecha, setFecha] = useState<Date | null>(null);
      const [seleccionados, setSeleccionados] = useState<Array<string | number>>([]);
      const [notas, setNotas] = useState("");
      const [enviado, setEnviado] = useState(false);

      const errores = {
        nombre: enviado && !nombre ? "Escribe el nombre de la empresa." : undefined,
        pais: enviado && !pais ? "Selecciona el país de operación." : undefined,
        fecha: enviado && !fecha ? "Indica la fecha de inicio del contrato." : undefined,
        mercados: enviado && seleccionados.length === 0 ? "Elige al menos un mercado." : undefined,
      };

      return (
        <form
          className="max-w-xl space-y-stack rounded-xl border border-surface-border bg-surface p-inset"
          onSubmit={(event) => {
            event.preventDefault();
            setEnviado(true);
          }}
        >
          <div className="space-y-ui-2xs">
            <h3 className="text-ui-title font-semibold">Alta de cliente</h3>
            <p className="text-ui-body-sm text-muted-foreground">
              Todos los campos usan Field: la etiqueta, la ayuda y el error se conectan solos.
            </p>
          </div>

          <Field
            label="Nombre de la empresa"
            description="Como aparece en el registro mercantil."
            required
            error={errores.nombre}
          >
            <Input value={nombre} onChange={(event) => setNombre(event.target.value)} placeholder="Piensa IT" />
          </Field>

          <Field label="País de operación" required error={errores.pais}>
            <Select options={paises} value={pais} onChange={setPais} placeholder="Selecciona un país" />
          </Field>

          <Field
            label="Inicio del contrato"
            description="Formato dd/mm/aaaa."
            required
            error={errores.fecha}
          >
            <DatePicker value={fecha} onChange={setFecha} />
          </Field>

          <Field
            label="Mercados atendidos"
            description="Puedes elegir varios."
            required
            error={errores.mercados}
          >
            <MultiSelect options={mercados} value={seleccionados} onChange={setSeleccionados} />
          </Field>

          <Field label="Notas internas" optionalLabel="Opcional">
            <Textarea
              value={notas}
              onChange={(event) => setNotas(event.target.value)}
              placeholder="Contexto que ayude al equipo comercial."
            />
          </Field>

          <div className="flex justify-end gap-ui-sm">
            <Button type="button" variant="surface" onClick={() => setEnviado(false)}>
              Limpiar validación
            </Button>
            <Button type="submit">Guardar cliente</Button>
          </div>
        </form>
      );
    };
    return <Demo />;
  },
};
