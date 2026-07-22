import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./slider";

const meta = {
  title: "UI/Slider",
  component: Slider,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Control deslizante sobre PrimeReact Slider." } },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState(40);
      return <Slider value={value} onValueChange={(v) => setValue(v as number)} />;
    };
    return <Demo />;
  },
};
