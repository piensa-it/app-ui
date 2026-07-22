import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AutoComplete } from "./autocomplete";

const meta = {
  title: "UI/AutoComplete",
  component: AutoComplete,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Campo de texto con sugerencias sobre Ark UI Combobox." } },
  },
  args: { value: "", onChange: () => {}, suggestions: [], onQueryChange: () => {} },
} satisfies Meta<typeof AutoComplete>;

export default meta;
type Story = StoryObj<typeof meta>;

const CIUDADES = ["Medellín", "Bogotá", "Cali", "Barranquilla", "Cartagena"];

export const Default: Story = {
  render: () => {
    const Demo = () => {
      const [value, setValue] = useState("");
      const [suggestions, setSuggestions] = useState<string[]>([]);
      return (
        <AutoComplete
          value={value}
          suggestions={suggestions}
          onQueryChange={(query) =>
            setSuggestions(CIUDADES.filter((c) => c.toLowerCase().includes(query.toLowerCase())))
          }
          onChange={setValue}
          placeholder="Busca una ciudad"
        />
      );
    };
    return <Demo />;
  },
};
