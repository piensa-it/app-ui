import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchSelect, type SearchSelectOption } from "./search-select";
import { Field } from "./field";

const meta = {
  title: "UI/SearchSelect",
  component: SearchSelect,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Selector con búsqueda para listas grandes —clientes, ítems, proveedores—. Se escribe para encontrar el registro, pero solo se puede **elegir** uno existente y `onChange` entrega su identificador (y la opción completa). Filtra en local sin distinguir tildes, o delega la búsqueda al servidor con `onSearch`. Nunca pinta más de `maxResults` opciones. Si lo que buscas es texto libre con sugerencias, usa `AutoComplete`; para filtrar una tabla, `SearchInput`.",
      },
    },
  },
  args: { options: [] },
} satisfies Meta<typeof SearchSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

const NOMBRES = ["Juan", "María", "Carlos", "Ana", "Luis", "Paula", "Andrés", "Sofía", "Jorge", "Valentina"];
const APELLIDOS = ["Pérez", "Gómez", "Rodríguez", "Martínez", "López", "Díaz", "Ramírez", "Torres", "Muñoz", "Rojas"];
const CIUDADES = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Bucaramanga", "Pereira", "Manizales"];

/** 10.000 clientes de mentira, con nombres repetidos a propósito: la descripción es lo que los distingue. */
const CLIENTES: SearchSelectOption[] = Array.from({ length: 10_000 }, (_, i) => ({
  value: i + 1,
  label: `${NOMBRES[i % 10]} ${APELLIDOS[Math.floor(i / 10) % 10]}`,
  description: `NIT ${900_000_000 + i * 37} · ${CIUDADES[i % CIUDADES.length]}`,
}));

const ITEMS: SearchSelectOption[] = Array.from({ length: 10_000 }, (_, i) => ({
  value: `SKU-${String(i + 1).padStart(5, "0")}`,
  label: `${["Tornillo", "Tuerca", "Arandela", "Perno", "Clavo"][i % 5]} ${["acero", "galvanizado", "inoxidable"][i % 3]} ${(i % 40) + 1} mm`,
  description: `SKU-${String(i + 1).padStart(5, "0")} · ${(((i * 7919) % 90_000) + 500).toLocaleString("es-CO")} COP`,
}));

export const Default: Story = {
  name: "10.000 clientes, filtro local",
  render: () => {
    const Demo = () => {
      const [cliente, setCliente] = useState<string | number | null>(null);
      return (
        <div className="max-w-md">
          <Field label="Cliente" description={`Valor que recibe la aplicación: ${cliente ?? "ninguno"}`}>
            <SearchSelect
              options={CLIENTES}
              value={cliente}
              onChange={(value) => setCliente(value)}
              placeholder="Buscar por nombre o NIT"
            />
          </Field>
        </div>
      );
    };
    return <Demo />;
  },
};

/** Simula una API: la aplicación hace el fetch, el componente solo avisa el texto. */
function useBusquedaSimulada(registros: SearchSelectOption[]) {
  const [options, setOptions] = useState<SearchSelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  const buscar = (query: string) => {
    setLoading(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const q = query.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();
      setOptions(
        registros
          .filter((r) => `${r.label} ${r.description}`.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().includes(q))
          .slice(0, 20),
      );
      setLoading(false);
    }, 600);
  };
  return { options, loading, buscar };
}

export const BusquedaEnServidor: Story = {
  name: "Búsqueda en el servidor",
  parameters: {
    docs: {
      description: {
        story:
          "Con `onSearch` el componente no filtra: avisa el texto (tras `searchDelay`, 300 ms) y muestra las `options` que devuelva tu API, con `loading` mientras llegan. Aquí la API se simula con 600 ms de latencia y 20 resultados por consulta.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [item, setItem] = useState<SearchSelectOption | null>(null);
      const { options, loading, buscar } = useBusquedaSimulada(ITEMS);
      return (
        <div className="grid max-w-md gap-3">
          <Field label="Ítem">
            <SearchSelect
              options={options}
              loading={loading}
              onSearch={buscar}
              value={item?.value ?? null}
              selectedOption={item}
              onChange={(_value, option) => setItem(option)}
              placeholder="Buscar por nombre o SKU"
            />
          </Field>
          <p className="text-ui-body-sm text-muted-foreground">
            {item ? <>Precio leído de la opción: <strong className="text-foreground">{item.description}</strong></> : "Sin ítem."}
          </p>
        </div>
      );
    };
    return <Demo />;
  },
};

export const EditarFactura: Story = {
  name: "Editar un documento guardado",
  parameters: {
    docs: {
      description: {
        story:
          "Al abrir una factura existente, el cliente guardado no está entre los resultados de ninguna búsqueda todavía. `selectedOption` le dice al campo qué nombre mostrar.",
      },
    },
  },
  render: () => {
    const Demo = () => {
      const [cliente, setCliente] = useState<SearchSelectOption | null>(CLIENTES[4_321]);
      const { options, loading, buscar } = useBusquedaSimulada(CLIENTES);
      return (
        <div className="max-w-md">
          <Field label="Cliente">
            <SearchSelect
              options={options}
              loading={loading}
              onSearch={buscar}
              value={cliente?.value ?? null}
              selectedOption={cliente}
              onChange={(_value, option) => setCliente(option)}
            />
          </Field>
        </div>
      );
    };
    return <Demo />;
  },
};

export const Estados: Story = {
  render: () => (
    <div className="grid max-w-md gap-5">
      <Field label="Deshabilitado">
        <SearchSelect options={CLIENTES} value={1} disabled />
      </Field>
      <Field label="Con error" error="Selecciona un cliente">
        <SearchSelect options={CLIENTES} value={null} />
      </Field>
      <Field label="Sin botón de limpiar">
        <SearchSelect options={CLIENTES} value={2} clearable={false} />
      </Field>
    </div>
  ),
};

export const VariantesYTamanos: Story = {
  name: "Variantes y tamaños",
  render: () => (
    <div className="grid max-w-md gap-4">
      {(["surface", "outline", "subtle"] as const).map((variant) => (
        <SearchSelect key={variant} aria-label={variant} options={CLIENTES} variant={variant} placeholder={`variant="${variant}"`} />
      ))}
      {(["sm", "md", "lg"] as const).map((size) => (
        <SearchSelect key={size} aria-label={size} options={CLIENTES} size={size} placeholder={`size="${size}"`} />
      ))}
    </div>
  ),
};
