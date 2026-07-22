import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup, RadioGroupItem } from "./radio-group";

const meta = {
  title: "UI/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Grupo de opciones excluyentes sobre PrimeReact RadioButton." } },
  },
  args: { name: "demo" },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<string | number>("mensual");
      return (
        <RadioGroup name="plan" value={value} onValueChange={setValue}>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="mensual" id="mensual" /> Mensual
          </label>
          <label className="flex items-center gap-2 text-sm">
            <RadioGroupItem value="anual" id="anual" /> Anual
          </label>
        </RadioGroup>
      );
    };
    return <Demo />;
  },
};
