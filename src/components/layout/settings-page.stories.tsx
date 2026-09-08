import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { SettingsPage, type SettingsPageProps } from "./settings-page";
import { PageContainer } from "./page-container";
import { UiProvider } from "@/components/providers/UiProvider";
import { AppearanceSettings, type AppearanceValue } from "@/components/ui/appearance-settings";
import { ProfileForm, type ProfileFormValue } from "@/components/ui/profile-form";
import { EmptyState } from "@/components/ui/empty-state";
import { ShieldIcon, ReceiptIcon } from "@/icons";

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
    // `width` es un parámetro de story, no un arg: no es algo que la
    // aplicación consumidora elija en `SettingsPage` (que no acota su
    // ancho, ver su JSDoc), sino la story demostrando los dos anchos de
    // `PageContainer` que puede traer quien la usa.
    (Story, context) => (
      <UiProvider>
        <PageContainer width={(context.parameters.width as "default" | "wide") ?? "default"}>
          <Story />
        </PageContainer>
      </UiProvider>
    ),
  ],
  args: {
    title: "Mi perfil",
    description: "Tus datos y cómo te ven los demás.",
    sections: [{ id: "account", content: null }],
  },
} satisfies Meta<typeof SettingsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

type CabeceraArgs = Pick<SettingsPageProps, "title" | "description">;

type PerfilDemoProps = CabeceraArgs & Pick<React.ComponentProps<typeof ProfileForm>, "orientation" | "descriptions">;

const PerfilDemo = ({ title, description, orientation, descriptions }: PerfilDemoProps) => {
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
      title={title}
      description={description}
      sections={[
        {
          // `account` es del catálogo conocido: rótulo «Cuenta» e icono ya
          // vienen puestos, sin pasar `label` ni `icon` aquí.
          id: "account",
          content: (
            <ProfileForm value={value} onChange={setValue} orientation={orientation} descriptions={descriptions} />
          ),
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
 * la pantalla. `ProfileForm` va con su disposición de fábrica —vertical—.
 */
export const Default: Story = {
  name: "Mi perfil",
  render: (args) => <PerfilDemo title={args.title} description={args.description} />,
};

const ConSeccionPropiaDemo = ({ title, description }: CabeceraArgs) => (
  <SettingsPage
    title={title}
    description={description}
    sections={[
      {
        // Conocida: ni `label` ni `icon` — «Cuenta» y su icono salen del
        // catálogo (`account`, `appearance`, `security`, `notifications`).
        id: "account",
        content: <p className="text-ui-body-sm">Nombre, correo, teléfono y cargo.</p>,
      },
      {
        // Propia de la aplicación: el catálogo no sabe de «facturación», así
        // que hacen falta `label` (si no, la pestaña cae en el `id` crudo)
        // e, igual que con cualquier sección propia, `icon` si se quiere uno.
        id: "facturacion",
        label: "Facturación",
        icon: ReceiptIcon,
        content: <p className="text-ui-body-sm">Plan, método de pago e historial. Negocio puro: no vive en la librería.</p>,
      },
    ]}
  />
);

/**
 * El contraste que importa: una sección del catálogo (`account`, sin
 * `label` ni `icon`) junto a una propia (`facturacion`, con los dos) —el
 * mismo armazón sirve para ambas.
 */
export const ConSeccionPropia: Story = {
  name: "Con sección propia",
  render: (args) => <ConSeccionPropiaDemo title={args.title} description={args.description} />,
};

const GuardandoDemo = ({ title, description }: CabeceraArgs) => (
  <SettingsPage
    title={title}
    description={description}
    sections={[
      {
        id: "account",
        content: <p className="text-ui-body-sm">El pie de abajo está guardando —no cambia nada al hacer clic.</p>,
        dirty: true,
        saving: true,
        onSave: () => {},
        onCancel: () => {},
      },
    ]}
  />
);

/**
 * `saving`: el pie dice «Guardando…», `aria-busy` en el botón y los dos
 * botones dejan de reaccionar al clic —pero sin `disabled` nativo—. Con
 * `disabled` el navegador les quita el foco al pulsar: quien navega con
 * teclado pierde el punto de lectura, y el lector de pantalla no llega a
 * anunciar el cambio de nombre a «Guardando…». Por eso `SectionFooter` usa
 * `aria-disabled` (que no bloquea el clic por sí solo, así que el manejador
 * también lo comprueba) más una clase que solo imita visualmente lo
 * deshabilitado.
 */
export const Guardando: Story = {
  render: (args) => <GuardandoDemo title={args.title} description={args.description} />,
};

const ControladaDemo = ({ title }: CabeceraArgs) => {
  // El caso real de las tres aplicaciones: la sección abierta viaja en la
  // URL. Aquí no hay router —solo el mismo patrón, con `section` en el
  // estado del padre y `onSectionChange` como si fuera `navigate`—.
  const [section, setSection] = React.useState("account");
  return (
    <div className="flex flex-col gap-ui-sm">
      <p className="text-ui-caption text-muted-foreground">
        Sección actual (la llevaría la URL): <code>{section}</code>
      </p>
      <SettingsPage
        title={title}
        section={section}
        onSectionChange={setSection}
        sections={[
          { id: "account", content: <p className="text-ui-body-sm">Datos de la cuenta.</p> },
          { id: "appearance", content: <p className="text-ui-body-sm">Tema, color, tipografía y densidad.</p> },
        ]}
      />
    </div>
  );
};

/**
 * Con `section` + `onSectionChange`, la pestaña activa la lleva la
 * aplicación —típicamente atada a la ruta— en vez de `SettingsPage`. Sin
 * `section`, el armazón la lleva solo.
 */
export const Controlada: Story = {
  name: "Sección controlada",
  args: { title: "Configuración" },
  render: (args) => <ControladaDemo title={args.title} />,
};

const ConfiguracionDemo = ({ title, description }: CabeceraArgs) => {
  const [value, setValue] = React.useState<AppearanceValue>({
    theme: "system",
    palette: "indigo",
    font: "geist",
    density: "default",
  });
  return (
    <SettingsPage
      title={title}
      description={description}
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
  args: { title: "Configuración", description: "Cómo se ve y cómo te avisa la aplicación." },
  render: (args) => <ConfiguracionDemo title={args.title} description={args.description} />,
};

const ConCambiosSinGuardarDemo = ({ title }: CabeceraArgs) => (
  <SettingsPage
    title={title}
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
);

/**
 * Con `dirty` en la sección activa, salir de ella —clic en «Apariencia»—
 * pide confirmación antes de cambiar de pestaña (`guardUnsaved`, activo por
 * defecto). Reutiliza `confirmAlert`, por eso el decorador monta
 * `UiProvider`.
 *
 * Ojo con lo que este aviso **no** cubre: solo el cambio de pestaña dentro de
 * `SettingsPage`. Si la persona navega fuera de esta pantalla —otra ruta,
 * cerrar la pestaña del navegador— la librería no se entera y no hay aviso;
 * esa protección, si hace falta, es cosa de la aplicación (un `beforeunload`
 * o un guard de router). Confiar en que este diálogo cubre "cualquier
 * salida" es el error fácil de cometer.
 */
export const ConCambiosSinGuardar: Story = {
  name: "Con cambios sin guardar",
  render: (args) => <ConCambiosSinGuardarDemo title={args.title} />,
};

/**
 * `guardUnsaved={false}`: cambiar de pestaña con cambios sin guardar ya no
 * pregunta nada. Misma pantalla que la anterior, sin la prop activada.
 */
export const SinAvisoAlSalir: Story = {
  name: "Sin aviso al salir",
  render: (args) => (
    <SettingsPage
      title={args.title}
      guardUnsaved={false}
      sections={[
        {
          id: "account",
          content: <p className="text-ui-body-sm">Cambia algo y vete a Apariencia: aquí no se pregunta nada.</p>,
          dirty: true,
          onSave: () => {},
          onCancel: () => {},
        },
        { id: "appearance", content: <p className="text-ui-body-sm">Tema, color, tipografía y densidad.</p> },
      ]}
    />
  ),
};

/**
 * `PageContainer` con `width="wide"` (#132): la misma pantalla de «Mi
 * perfil», en un contenedor de 1.536 px en vez de los 959 px de `default`,
 * con `ProfileForm` en `orientation="horizontal"` y `descriptions` —la
 * combinación que de verdad vale la pena en horizontal (ver el JSDoc de la
 * prop)—. Antes de esta HU, ensanchar así solo estiraba cada control de
 * ~470 px a ~780 px —un cuadro de esas dimensiones para un teléfono se ve
 * peor, no mejor—. Ahora `Field`, en horizontal, topa el control en ~28 rem
 * y la columna de rótulo en ~20 rem sin importar cuánto ancho sobre, y ese
 * ancho sobrante queda como margen a la derecha, no estirando ni el input ni
 * la etiqueta. Es la prueba visual de que ensanchar `PageContainer` sin este
 * tope —lo que medía la incidencia— no arreglaba nada; el tope, sí.
 */
export const AnchoCompleto: Story = {
  name: "A lo ancho (PageContainer wide)",
  parameters: { width: "wide" },
  render: (args) => (
    <PerfilDemo
      title={args.title}
      description={args.description}
      orientation="horizontal"
      descriptions={{
        name: "Como aparece para el resto del equipo.",
        email: "Lo usamos para avisos de la cuenta, nunca para mercadeo.",
        phone: "Solo para contacto en caso de una alerta operativa.",
        jobTitle: "El mismo que se ve en el menú de usuario.",
      }}
    />
  ),
};
