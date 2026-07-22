import type { Meta, StoryObj } from "@storybook/react-vite";
import { GlobalErrorBoundary } from "./GlobalErrorBoundary";

const BombaDeTiempo = (): never => {
  throw new Error("Error simulado para documentación — falló la carga de datos del dashboard.");
};

const meta = {
  title: "Layout/GlobalErrorBoundary",
  component: GlobalErrorBoundary,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Error boundary genérico para envolver el árbol completo de la app (o una sección) y evitar pantallas en blanco ante errores no controlados. Título, mensaje y acción son configurables — sin dependencias de negocio.",
      },
    },
  },
} satisfies Meta<typeof GlobalErrorBoundary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FuncionandoNormal: Story = {
  name: "Funcionando normal (sin error)",
  args: {
    children: <p className="p-8 text-center text-sm text-muted-foreground">Contenido normal de la app — sin errores.</p>,
  },
};

export const ErrorCapturado: Story = {
  name: "Error capturado (fallback)",
  args: {
    children: <BombaDeTiempo />,
  },
};

export const MensajePersonalizado: Story = {
  name: "Con título/mensaje/acción personalizados",
  args: {
    title: "Este dashboard no está disponible",
    description: "Estamos trabajando para restaurar el servicio. Vuelve a intentar en unos minutos.",
    actionLabel: "Reintentar",
    children: <BombaDeTiempo />,
  },
};
