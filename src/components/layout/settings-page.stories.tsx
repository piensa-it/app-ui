import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SettingsPage } from "./settings-page";
import { PageContainer } from "./page-container";
import { UiProvider } from "@/components/providers/UiProvider";
import { AppearanceSettings, type AppearanceValue } from "@/components/ui/appearance-settings";
import { ProfileForm, type ProfileFormValue } from "@/components/ui/profile-form";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldIcon } from "@/icons";

const meta = {
  title: "Layout/SettingsPage",
  component: SettingsPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "El destino estándar de «Mi perfil» y «Configuración» (#124): cabecera, secciones en pestañas y el guardado de cada una siempre en el mismo sitio. `UserMenu` (#97) ya fijaba las entradas; esto fija lo que hay al otro lado. El `id` de una sección puede ser uno del catálogo conocido —`account`, `appearance`, `security`, `notifications`—, que trae rótulo e icono por su cuenta, o uno propio de la aplicación, que entonces necesita su `label`. Va dentro del `PageContainer` de la aplicación, como cualquier otra pantalla.",
      },
    },
  },
  decorators: [
    (Story) => (
      <UiProvider>
        <PageContainer>
          <Story />
        </PageContainer>
      </UiProvider>
    ),
  ],
  args: {
    title: "Mi perfil",
    sections: [{ id: "account", content: null }],
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

const PerfilDemo = () => {
  const [value, setValue] = React.useState<ProfileFormValue>({
    name: "Andrés Montoya",
    email: "andres@piensait.com",
    phone: "3001234567",
    jobTitle: "Cajera",
    avatar: { color: "350 75% 45%" },
  });
  const [guardado, setGuardado] = React.useState(value);
  const dirty = JSON.stringify(value) !== JSON.stringify(guardado);

  return (
    <SettingsPage
      title="Mi perfil"
      description="Tus datos y cómo te ven los demás."
      sections={[
        {
          // `account` es del catálogo conocido: rótulo «Cuenta» e icono ya
          // vienen puestos, sin pasar `label` ni `icon` aquí.
          id: "account",
          content: <ProfileForm value={value} onChange={setValue} />,
          dirty,
          onSave: () => setGuardado(value),
          onCancel: () => setValue(guardado),
        },
        {
          // `security` también es conocido, pero su contenido es negocio
          // puro: aquí solo se reserva el sitio con `EmptyState`.
          id: "security",
          content: (
            <EmptyState
              icon={<ShieldIcon />}
              title="Lo pone la aplicación"
              description="La política de contraseñas y las sesiones activas son negocio: la librería solo reserva el sitio, el rótulo y el icono."
            />
          ),
        },
      ]}
    />
  );
};

/**
 * «Mi perfil»: la sección de cuenta (`ProfileForm`, controlado por esta
 * story) trae pie de guardado propio porque declara `onSave`; seguridad no
 * lo trae, porque no lo declara — ese pie es opcional por sección, no de toda
 * la pantalla.
 */
export const Default: Story = {
  name: "Mi perfil",
  render: () => <PerfilDemo />,
};

const ConfiguracionDemo = () => {
  const [value, setValue] = React.useState<AppearanceValue>({
    theme: "system",
    palette: "indigo",
    font: "geist",
    density: "default",
  });
  return (
    <SettingsPage
      title="Configuración"
      description="Cómo se ve y cómo te avisa la aplicación."
      sections={[
        { id: "appearance", content: <AppearanceSettings value={value} onChange={setValue} /> },
        {
          id: "notifications",
          content: (
            <EmptyState
              title="Lo pone la aplicación"
              description="El catálogo de eventos que se pueden avisar es de cada aplicación."
            />
          ),
        },
      ]}
    />
  );
};

/**
 * «Configuración»: el mismo armazón, otro par de secciones del catálogo
 * conocido. Ninguna de las dos trae pie de guardado —`AppearanceSettings` se
 * aplica en vivo, sin guardar; notificaciones aún no tiene contenido propio.
 */
export const Configuracion: Story = {
  name: "Configuración",
  render: () => <ConfiguracionDemo />,
};

/**
 * Con `dirty` en la sección activa, salir de ella —clic en «Apariencia»—
 * pide confirmación antes de cambiar de pestaña (`guardUnsaved`, activo por
 * defecto). Reutiliza `confirmAlert`, por eso el decorador monta `UiProvider`.
 */
export const ConCambiosSinGuardar: Story = {
  name: "Con cambios sin guardar",
  render: () => (
    <SettingsPage
      title="Mi perfil"
      sections={[
        {
          id: "account",
          content: <p className="text-ui-body-sm">Cambia algo y prueba a irte a Apariencia.</p>,
          dirty: true,
          onSave: () => {},
          onCancel: () => {},
        },
        { id: "appearance", content: <p className="text-ui-body-sm">Tema, color, tipografía y densidad.</p> },
      ]}
    />
  ),
};
