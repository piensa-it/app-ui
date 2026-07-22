import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabPanel } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Navegación por pestañas sobre PrimeReact TabView." } },
  },
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs>
      <TabPanel header="Perfil">
        <p className="text-sm text-muted-foreground">Información del perfil del usuario.</p>
      </TabPanel>
      <TabPanel header="Seguridad">
        <p className="text-sm text-muted-foreground">Preferencias de contraseña y sesión.</p>
      </TabPanel>
      <TabPanel header="Notificaciones">
        <p className="text-sm text-muted-foreground">Preferencias de notificaciones.</p>
      </TabPanel>
    </Tabs>
  ),
};
