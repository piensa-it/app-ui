import type { Meta, StoryObj } from "@storybook/react-vite";

import { LanguageSwitcher } from "./language-switcher";

const languages = [
  { code: "en", label: "English", href: "#" },
  { code: "es", label: "Español", href: "#es" },
];

const meta = {
  title: "Marketing/LanguageSwitcher",
  component: LanguageSwitcher,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Selector de idioma de las webs públicas: inglés por defecto y español. Cada opción es un enlace con `hreflang` a la misma página en el otro idioma, así que funciona sin JavaScript. `onChange` avisa la elección para guardarla (cookie `lang`) y que la detección automática no la pise.",
      },
    },
  },
  args: { value: "en", languages },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Segmentado: Story = {};

export const Menu: Story = {
  name: "Menú (3 o más idiomas)",
  args: { variant: "menu", value: "es", label: "Idioma", languages: [...languages, { code: "pt", label: "Português", href: "#pt" }] },
};
