import type { Meta, StoryObj } from "@storybook/react-vite";

import { DocsProse } from "./docs-prose";

const meta = {
  title: "Docs/DocsProse",
  component: DocsProse,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Estilos para el HTML que genera MDX en una guía: encabezados, listas, código, tablas y citas, solo con tokens." } },
  },
} satisfies Meta<typeof DocsProse>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Elementos: Story = {
  render: () => (
    <DocsProse>
      <h1>Authentication</h1>
      <p>
        Every request carries a key in the <code>Authorization</code> header. <a href="#">Create a key</a> in the admin portal.
      </p>
      <h2 id="keys">Keys per environment</h2>
      <ul>
        <li>Test keys start with <code>sk_test_</code>.</li>
        <li>Live keys start with <code>sk_live_</code>.</li>
      </ul>
      <pre>
        <code>Authorization: Bearer sk_test_…</code>
      </pre>
      <h3 id="rotation">Rotation</h3>
      <blockquote>Rotate keys without downtime: create the new one, deploy, then revoke the old one.</blockquote>
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Meaning</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><code>401</code></td>
            <td>Missing or invalid key.</td>
          </tr>
          <tr>
            <td><code>403</code></td>
            <td>The key cannot use this channel.</td>
          </tr>
        </tbody>
      </table>
    </DocsProse>
  ),
};
