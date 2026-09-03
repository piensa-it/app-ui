import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stat, StatGroup } from "./stat";
import { BanknoteIcon, ReceiptIcon, WalletIcon } from "@/icons";

const meta = {
  title: "UI/Stat",
  component: Stat,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Una cifra con su rótulo. Usa `<dl>`/`<dt>`/`<dd>` y no un encabezado: un `<h3>` cuyo texto es una cantidad ensucia el esquema de la página.",
      },
    },
  },
  args: { label: "Entradas", value: "$ 60.938.100" },
} satisfies Meta<typeof Stat>;

export default meta;
type Story = StoryObj<typeof meta>;

const pesos = (valor: number) => `$ ${valor.toLocaleString("es-CO")}`;

export const Default: Story = {};

/** La fila de indicadores que encabeza casi cualquier pantalla de consulta. */
export const Grupo: Story = {
  name: "Fila de indicadores",
  render: () => (
    <StatGroup>
      <Stat label="Entradas" value={pesos(60938100)} description="6 movimientos recaudados" icon={<BanknoteIcon />} />
      <Stat label="Salidas" value={pesos(-79615800)} description="7 pagos ejecutados" icon={<ReceiptIcon />} />
      <Stat label="Saldo del periodo" value={pesos(-18677700)} description="Antes de conciliación" icon={<WalletIcon />} />
    </StatGroup>
  ),
};

/**
 * La variación dice su sentido además de pintarlo: quien no distingue el color
 * necesita leerlo. Cuando subir es malo —gastos, mora, incidencias—,
 * `goodWhenUp={false}` evita que el verde diga lo contrario de lo que pasa.
 */
export const Variacion: Story = {
  name: "Con variación",
  render: () => (
    <StatGroup columns={3}>
      <Stat label="Ventas" value="1.248" trend={{ value: "+12,4%", direction: "up" }} />
      <Stat label="Gastos" value={pesos(9820000)} trend={{ value: "+8,1%", direction: "up", goodWhenUp: false }} />
      <Stat label="Cartera vencida" value={pesos(3100000)} trend={{ value: "-4,2%", direction: "down", goodWhenUp: false }} />
    </StatGroup>
  ),
};

/** Mientras la cifra se calcula, el bloque se anuncia como ocupado. */
export const Cargando: Story = {
  name: "Cargando",
  render: () => (
    <StatGroup columns={2}>
      <Stat label="Entradas" value="—" loading />
      <Stat label="Salidas" value="—" loading />
    </StatGroup>
  ),
};
