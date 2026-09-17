import type { Meta, StoryObj } from "@storybook/react-vite";

import { CodeBlock } from "./code-block";

const meta = {
  title: "UI/CodeBlock",
  component: CodeBlock,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Bloque de código con título, pestañas por lenguaje, copiar y números de línea. Todo el código queda en el HTML. El resaltado de sintaxis es opcional con `highlight` (p. ej. Shiki en el build): la librería no trae resaltador para no sumar peso.",
      },
    },
  },
  args: {},
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ventana: Story = {
  name: "Ventana con título (ej. hero de Deliver)",
  args: {
    windowChrome: true,
    title: "POST /v1/messages",
    language: "bash",
    code: `curl https://api.example.com/v1/messages \\
  -H "Authorization: Bearer $API_KEY" \\
  -d '{ "channel": "whatsapp", "to": "+57300…", "template": "recordatorio-pago" }'

→ 202 Accepted`,
  },
};

export const ConPestanas: Story = {
  name: "Pestañas por lenguaje",
  args: {
    title: "Enviar un mensaje",
    tabs: [
      { label: "curl", language: "bash", code: 'curl -X POST https://api.example.com/v1/messages -d \'{"to":"+57300…"}\'' },
      { label: "Node", language: "ts", code: 'await fetch("https://api.example.com/v1/messages", {\n  method: "POST",\n  body: JSON.stringify({ to: "+57300…" }),\n});' },
      { label: "Python", language: "python", code: 'requests.post("https://api.example.com/v1/messages", json={"to": "+57300…"})' },
    ],
  },
};

export const NumerosDeLinea: Story = {
  name: "Números de línea",
  args: { language: "json", lineNumbers: true, code: '{\n  "id": "msg_01",\n  "status": "queued"\n}' },
};
