import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AvatarPicker, type AvatarPickerValue } from "./avatar-picker";
import { DEFAULT_AVATAR_COLORS } from "@/lib/avatar-colors";

const meta = {
  title: "UI/AvatarPicker",
  component: AvatarPicker,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Elección del avatar para la pantalla de perfil: foto, o iniciales sobre un color. Controlado y sin red: la foto se entrega como `File`; subirla y guardarla es de la aplicación. La vista previa es el mismo `Avatar` que pinta `UserMenu`.",
      },
    },
  },
  args: { name: "Andrés Montoya", onChange: () => {} },
} satisfies Meta<typeof AvatarPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

const Demo = ({ inicial, name }: { inicial: AvatarPickerValue; name: string }) => {
  const [value, setValue] = useState<AvatarPickerValue>(inicial);
  const [ultimo, setUltimo] = useState<string>("—");
  return (
    <div className="flex max-w-lg flex-col gap-ui-md">
      <AvatarPicker
        name={name}
        value={value}
        onChange={({ file, color, src }) => {
          setValue({ src, color });
          setUltimo(file ? `archivo: ${file.name} (${Math.round(file.size / 1024)} KB), color ${color}` : `sin archivo, color ${color}`);
        }}
      />
      <p className="text-ui-caption text-muted-foreground">Último `onChange`: {ultimo}</p>
    </div>
  );
};

/** Iniciales sobre uno de los ocho colores por defecto, todos con contraste AA para texto blanco. */
export const Iniciales: Story = {
  name: "Con iniciales",
  render: (args) => <Demo name={args.name} inicial={{ color: DEFAULT_AVATAR_COLORS[0] }} />,
};

/** Con foto guardada: los colores desaparecen hasta que se quita. */
export const ConFoto: Story = {
  name: "Con foto",
  render: (args) => (
    <Demo
      name={args.name}
      inicial={{ src: "https://api.dicebear.com/9.x/thumbs/svg?seed=Andres&backgroundColor=b6e3f4", color: DEFAULT_AVATAR_COLORS[5] }}
    />
  ),
};

/** Una lista de colores propia, por ejemplo la de la marca. */
export const ColoresPropios: Story = {
  name: "Colores propios",
  args: { colors: ["243 70% 52%", "205 88% 40%", "158 64% 32%"] },
  render: (args) => (
    <AvatarPicker name={args.name} colors={args.colors} value={{ color: "205 88% 40%" }} onChange={() => {}} />
  ),
};
