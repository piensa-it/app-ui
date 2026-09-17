import type { Meta, StoryObj } from "@storybook/react-vite";
import { Info, TriangleAlert } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { CodeBlock } from "../ui/code-block";
import { DocsLayout } from "./docs-layout";
import { DocsProse } from "./docs-prose";

const meta = {
  title: "Docs/DocsLayout",
  component: DocsLayout,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Estructura común del portal del desarrollador: menú lateral por grupos, guía, tabla de contenidos y anterior/siguiente. Cada aplicación escribe su prosa en MDX y la pinta dentro de `DocsProse`. El header y el footer los pone el sitio. En móvil, menú y tabla de contenidos se pliegan sin JavaScript.",
      },
    },
  },
  args: { nav: [] },
} satisfies Meta<typeof DocsLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

const nav = [
  {
    title: "Getting started",
    items: [
      { label: "Overview", href: "#" },
      { label: "Quickstart", href: "#", active: true },
      { label: "Authentication", href: "#" },
    ],
  },
  {
    title: "Guides",
    items: [
      { label: "Templates", href: "#" },
      { label: "Idempotency", href: "#" },
      { label: "Webhooks", href: "#", badge: "New" },
      { label: "Errors", href: "#" },
    ],
  },
  { title: "Reference", items: [{ label: "API reference", href: "#" }] },
];

export const Guia: Story = {
  name: "Guía con tabla de contenidos",
  args: {
    nav,
    toc: [
      { id: "before-you-start", label: "Before you start" },
      { id: "send-your-first-message", label: "Send your first message" },
      { id: "check-the-status", label: "Check the status", level: 3 },
      { id: "next-steps", label: "Next steps" },
    ],
    breadcrumbs: [{ label: "Developers", href: "#" }, { label: "Quickstart" }],
    prev: { label: "Overview", href: "#" },
    next: { label: "Authentication", href: "#" },
    labels: { nav: "Documentation", toc: "On this page", previous: "Previous", next: "Next", menu: "Documentation menu", breadcrumbs: "Breadcrumbs" },
    children: (
      <DocsProse>
        <h1>Quickstart</h1>
        <p>
          Send your first message in five minutes. You need an API key and a published template; the rest is a single <code>POST</code>.
        </p>
        <h2 id="before-you-start">Before you start</h2>
        <ul>
          <li>
            An API key for the <strong>test</strong> environment. See <a href="#">Authentication</a>.
          </li>
          <li>A template with the slug you will reference.</li>
        </ul>
        <Alert variant="info" role="note" icon={<Info className="size-4" />}>
          <AlertTitle>Test keys only reach allowed recipients</AlertTitle>
          <AlertDescription>Add your own phone or email to the allow list before trying.</AlertDescription>
        </Alert>
        <h2 id="send-your-first-message">Send your first message</h2>
        <p>Call the messages endpoint with the channel, the recipient, the template and its data.</p>
        <CodeBlock
          title="POST /v1/messages"
          tabs={[
            { label: "curl", language: "bash", code: 'curl -X POST https://api.example.com/v1/messages \\\n  -H "Authorization: Bearer $API_KEY" \\\n  -d \'{ "channel": "sms", "to": "+573001234567", "template": { "slug": "otp" } }\'' },
            { label: "Node", language: "ts", code: 'await fetch("https://api.example.com/v1/messages", {\n  method: "POST",\n  headers: { Authorization: `Bearer ${process.env.API_KEY}` },\n  body: JSON.stringify({ channel: "sms", to: "+573001234567", template: { slug: "otp" } }),\n});' },
          ]}
        />
        <h3 id="check-the-status">Check the status</h3>
        <p>The response includes the message id. Use it to follow the delivery:</p>
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>queued</code>
              </td>
              <td>Accepted and waiting to be sent.</td>
            </tr>
            <tr>
              <td>
                <code>sent</code>
              </td>
              <td>Handed to the channel provider.</td>
            </tr>
            <tr>
              <td>
                <code>failed</code>
              </td>
              <td>Could not be delivered after the retries.</td>
            </tr>
          </tbody>
        </table>
        <Alert variant="warning" role="note" icon={<TriangleAlert className="size-4" />}>
          <AlertTitle>Retry with the same idempotency key</AlertTitle>
          <AlertDescription>Otherwise a network retry can send the message twice.</AlertDescription>
        </Alert>
        <h2 id="next-steps">Next steps</h2>
        <blockquote>Templates let you change the wording without deploying your app.</blockquote>
        <ol>
          <li>Design a template with variables.</li>
          <li>Subscribe to delivery webhooks.</li>
        </ol>
      </DocsProse>
    ),
  },
};

export const SinTablaDeContenidos: Story = {
  name: "Portada sin tabla de contenidos",
  args: {
    nav: nav.map((group, index) => (index === 0 ? { ...group, items: group.items.map((item, i) => ({ ...item, active: i === 0 })) } : group)),
    next: { label: "Quickstart", href: "#" },
    children: (
      <DocsProse>
        <h1>Developers</h1>
        <p>Everything you need to integrate: guides, the API reference and the OpenAPI document.</p>
      </DocsProse>
    ),
  },
};
