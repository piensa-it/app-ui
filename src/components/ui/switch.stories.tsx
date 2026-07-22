import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./switch";

const meta = {
  title: "UI/Switch",
  component: Switch,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Interruptor on/off sobre PrimeReact InputSwitch." } },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [checked, setChecked] = useState(true);
      return <Switch checked={checked} onCheckedChange={setChecked} />;
    };
    return <Demo />;
  },
};
