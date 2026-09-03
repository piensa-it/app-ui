import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select } from "./select";

const paises = [
  { label: "Colombia", value: "co" },
  { label: "México", value: "mx" },
  { label: "España", value: "es" },
  { label: "Argentina", value: "ar" },
  { label: "Brasil", value: "br" },
  { label: "Chile", value: "cl" },
  { label: "Costa Rica", value: "cr" },
  { label: "Ecuador", value: "ec" },
  { label: "Estados Unidos", value: "us" },
  { label: "Guatemala", value: "gt" },
  { label: "Panamá", value: "pa" },
  { label: "Perú", value: "pe" },
  { label: "Portugal", value: "pt" },
  { label: "República Dominicana", value: "do" },
  { label: "Uruguay", value: "uy" },
  { label: "Venezuela", value: "ve", disabled: true },
];

const meta = {
  title: "UI/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Selector desplegable cerrado para listas cortas. Incluye navegación por teclado; si necesitas filtrar escribiendo, usa AutoComplete · Lista con búsqueda.",
      },
    },
  },
  args: { options: paises },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  name: "Explorar países",
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return (
        <div className="grid max-w-lg gap-3">
          <div>
            <h3 className="text-ui-title font-semibold">País de operación</h3>
            <p className="mt-1 text-ui-body-sm text-muted-foreground">
              Haz clic en el campo para desplegar {paises.length} opciones. También puedes usar Enter, Espacio y las flechas del teclado.
            </p>
          </div>
          <Select
            aria-label="Seleccionar país"
            options={paises}
            value={value}
            onChange={setValue}
            placeholder="Haz clic para seleccionar un país"
            size="lg"
            variant="surface"
          />
          <p className="min-h-5 text-ui-body-sm text-muted-foreground">
            {value
              ? <>Selección actual: <strong className="text-foreground">{paises.find((pais) => pais.value === value)?.label}</strong></>
              : "Ningún país seleccionado todavía."}
          </p>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>(null);
      return <Select options={paises} value={value} onChange={setValue} placeholder="Selecciona un país" />;
    };
    return <Demo />;
  },
};

// La variante con filtro de texto vive en el componente `AutoComplete`
// (combobox con búsqueda) — `Select` es un selector cerrado sin input.

/**
 * `name` es lo único que hace que se renderice el `<select>` nativo oculto
 * (para enviar el valor en un `<form>`). Sin `name` no existe, así ninguna
 * opción se duplica en el DOM y una prueba que busque "Colombia" encuentra solo
 * la opción visible.
 */
export const DentroDeFormulario: Story = {
  name: "Dentro de un formulario (name)",
  render: () => (
    <form className="w-72" onSubmit={(event) => event.preventDefault()}>
      <Select aria-label="País" name="pais" options={paises.slice(0, 5)} />
    </form>
  ),
};

/**
 * `label` admite un nodo (icono + texto). `textValue` aporta el texto plano
 * que usan el `<select>` nativo, la búsqueda por teclado y el trigger.
 */
export const ConIconos: Story = {
  name: "Opciones con icono (label ReactNode)",
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number | null>("co");
      const conBandera = [
        { label: <span className="inline-flex items-center gap-2"><span aria-hidden="true">🇨🇴</span> Colombia</span>, textValue: "Colombia", value: "co" },
        { label: <span className="inline-flex items-center gap-2"><span aria-hidden="true">🇲🇽</span> México</span>, textValue: "México", value: "mx" },
        { label: <span className="inline-flex items-center gap-2"><span aria-hidden="true">🇪🇸</span> España</span>, textValue: "España", value: "es" },
      ];
      return <div className="w-72"><Select aria-label="País" options={conBandera} value={value} onChange={setValue} /></div>;
    };
    return <Demo />;
  },
};
