import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./date-picker";

const meta = {
  title: "UI/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Selector de fecha sobre Ark UI, localizado en español y preparado para teclado." } },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState<Date | null>(null);
      return <DatePicker value={value} onChange={setValue} />;
    };
    return <Demo />;
  },
};
