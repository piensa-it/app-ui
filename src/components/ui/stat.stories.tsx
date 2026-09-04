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

/**
 * Los cuatro tonos, juntos, que es donde se entiende la escala.
 *
 * `tone` dice qué clase de noticia es la cifra; `trend`, cómo varió. Son cosas
 * distintas: una cartera puede estar plana y aun así vencida.
 *
 * La regla para elegir entre ámbar y rojo es el **plazo**, no la gravedad: lo
 * que vence esta semana todavía se paga a tiempo; lo vencido ya llegó tarde.
 * Cuando todo lo que pide atención sale en rojo, el rojo deja de significar
 * nada. Solo `negative` tiñe la cifra.
 */
export const Tonos: Story = {
  name: "Los cuatro tonos",
  render: () => (
    <StatGroup columns={4}>
      <Stat label="Facturado este mes" value={pesos(184200000)} description="Es un dato, no una noticia" icon={<BanknoteIcon />} />
      <Stat label="Recaudado" value={pesos(151900000)} tone="positive" description="Salió bien" icon={<WalletIcon />} />
      <Stat label="Vence esta semana" value={pesos(12400000)} tone="warning" description="Todavía se paga a tiempo" icon={<ReceiptIcon />} />
      <Stat label="Cartera vencida" value={pesos(3100000)} tone="negative" description="Ya llegó tarde" icon={<ReceiptIcon />} />
    </StatGroup>
  ),
};
