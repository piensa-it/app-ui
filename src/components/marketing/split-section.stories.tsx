import type { Meta, StoryObj } from "@storybook/react-vite";

import { Card } from "../ui/card";
import { Checklist } from "./checklist";
import { SplitSection } from "./split-section";

const meta = {
  title: "Marketing/SplitSection",
  component: SplitSection,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen", docs: { description: { component: "Texto a un lado y maqueta real del producto al otro. En móvil el texto va primero." } } },
  args: { title: "", media: null },
} satisfies Meta<typeof SplitSection>;

export default meta;
type Story = StoryObj<typeof meta>;

const Maqueta = () => (
  <Card className="mx-auto max-w-sm p-5 shadow-lg">
    <p className="font-mono text-xs text-muted-foreground">recordatorio-pago · v3 · publicada</p>
    <div className="mt-4 rounded-lg bg-success/10 p-4 text-sm">
      Hola <strong>Ana</strong>, tu factura de <strong>$ 120.000</strong> vence el <strong>15 de octubre</strong>.
    </div>
  </Card>
);

export const Default: Story = {
  name: "Texto y maqueta (ej. Deliver plantillas)",
  args: {
    id: "plantillas",
    tone: "muted",
    eyebrow: "Plantillas",
    title: "Mensajes que se ven bien en cada canal",
    description: "Escribe una vez y publica versiones sin tocar el código.",
    content: <Checklist items={["Variables por destinatario", "Versiones publicadas", "Vista previa por canal"]} />,
    media: <Maqueta />,
  },
};

export const Invertida: Story = {
  args: { ...Default.args, reverse: true, tone: "default" },
};
