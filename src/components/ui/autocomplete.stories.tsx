import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AutoComplete } from "./autocomplete";

const meta = {
  title: "UI/AutoComplete · Lista con búsqueda",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Lista desplegable con búsqueda (combobox). Filtra opciones mientras la persona escribe y también permite cargar sugerencias desde una API.",
      },
    },
  },
  args: { value: "", onChange: () => {}, suggestions: [], onQueryChange: () => {} },
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const CIUDADES = [
  "Armenia",
  "Barranquilla",
  "Bogotá",
  "Bucaramanga",
  "Cali",
  "Cartagena",
  "Cúcuta",
  "Ibagué",
  "Manizales",
  "Medellín",
  "Montería",
  "Neiva",
  "Pasto",
  "Pereira",
  "Popayán",
  "Santa Marta",
  "Sincelejo",
  "Tunja",
  "Valledupar",
  "Villavicencio",
];

export const Showcase: Story = {
  name: "Buscar y seleccionar",
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("");
      const [suggestions, setSuggestions] = useState<string[]>(CIUDADES);
      return (
        <div className="grid max-w-lg gap-3">
          <div>
            <h3 className="text-ui-title font-semibold">Selecciona una ciudad</h3>
            <p className="mt-1 text-ui-body-sm text-muted-foreground">
              Escribe algunas letras o abre el desplegable para explorar todas las opciones.
            </p>
          </div>
          <AutoComplete
            value={value}
            suggestions={suggestions}
            onQueryChange={(query) => {
              const normalized = query.trim().toLocaleLowerCase();
              setSuggestions(
                normalized
                  ? CIUDADES.filter((city) => city.toLocaleLowerCase().includes(normalized))
                  : CIUDADES,
              );
            }}
            onChange={setValue}
            placeholder="Ej. Medellín"
            aria-label="Buscar ciudad"
            variant="surface"
            size="lg"
          />
          <p className="min-h-5 text-ui-body-sm text-muted-foreground">
            {value ? <>Valor actual: <strong className="text-foreground">{value}</strong></> : "Aún no has seleccionado una ciudad."}
          </p>
          <p className="text-xs text-muted-foreground">{suggestions.length} ciudades disponibles con el filtro actual.</p>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("");
      const [suggestions, setSuggestions] = useState<string[]>(CIUDADES);
      return (
        <AutoComplete
          value={value}
          suggestions={suggestions}
          onQueryChange={(query) =>
            setSuggestions(CIUDADES.filter((city) => city.toLowerCase().includes(query.toLowerCase())))
          }
          onChange={setValue}
          placeholder="Busca una ciudad"
        />
      );
    };
    return <Demo />;
  },
};
