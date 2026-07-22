import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Grupo de opciones excluyentes sobre Ark UI RadioGroup." } },
  },
  args: { name: "demo" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("mensual");
      return (
        <RadioGroup name="plan" value={value} onValueChange={setValue}>
          <RadioGroupItem value="mensual" label="Mensual" />
          <RadioGroupItem value="anual" label="Anual" />
        </RadioGroup>
      );
    };
    return <Demo />;
  },
};
