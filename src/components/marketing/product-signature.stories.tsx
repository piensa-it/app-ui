import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProductSignature } from "./product-signature";

const meta = {
  title: "Marketing/ProductSignature",
  component: ProductSignature,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Firma de producto «by Piensa IT»: el nombre del producto manda y el isotipo lo firma a tamaño pequeño. La usan `PublicHeader` y `PublicFooter` con `signature`; se exporta suelta para otros lugares (portal del desarrollador, correos).",
      },
    },
  },
} satisfies Meta<typeof ProductSignature>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <span className="flex items-baseline gap-2">
      <span className="font-heading text-lg font-semibold">Deliver</span> <ProductSignature {...args} className="self-center" />
    </span>
  ),
};

export const TextoPropio: Story = { name: "Texto propio", args: { label: "por Piensa IT" } };
