import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs, TabPanel } from "./tabs";

const meta = {
  title: "UI/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    docs: { description: { component: "Navegación por pestañas sobre Ark UI para alternar vistas relacionadas." } },
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

/**
 * `defaultValue` elige la pestaña inicial en modo no controlado — no hace
 * falta llevar el estado desde el consumidor solo para abrir en otra pestaña.
 */
export const PestanaInicial: Story = {
  name: "Pestaña inicial (defaultValue)",
  render: () => (
    <Tabs defaultValue="seguridad">
      <TabPanel value="perfil" header="Perfil">
        <p className="text-sm text-muted-foreground">Información del perfil del usuario.</p>
      </TabPanel>
      <TabPanel value="seguridad" header="Seguridad">
        <p className="text-sm text-muted-foreground">Preferencias de contraseña y sesión.</p>
      </TabPanel>
      <TabPanel value="notificaciones" header="Notificaciones">
        <p className="text-sm text-muted-foreground">Preferencias de notificaciones.</p>
      </TabPanel>
    </Tabs>
  ),
};

/** `listClassName` estiliza la lista; `className` de cada `TabPanel` va a su pestaña y `contentClassName` a su panel. */
export const ClasesPersonalizadas: Story = {
  name: "Clases de lista y pestañas",
  render: () => (
    <Tabs listClassName="justify-center gap-2">
      <TabPanel header="Resumen" className="uppercase tracking-wide" contentClassName="pt-2">
        <p className="text-sm text-muted-foreground">Pestañas centradas, en mayúsculas y con menos espacio arriba.</p>
      </TabPanel>
      <TabPanel header="Detalle" className="uppercase tracking-wide" contentClassName="pt-2">
        <p className="text-sm text-muted-foreground">Detalle.</p>
      </TabPanel>
    </Tabs>
  ),
};
