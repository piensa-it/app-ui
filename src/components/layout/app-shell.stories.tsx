import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { AppShell } from "./app-shell";
import { SidebarBrand } from "./sidebar-brand";
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "./sidebar-nav";
import { MemoryRouter, NavLink, Route, Routes, useLocation } from "react-router-dom";
import { AppVersion } from "./app-version";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardIcon, ReceiptIcon, SettingsIcon, UsersIcon } from "@/icons";

const meta = {
  title: "Layout/AppShell",
  component: AppShell,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      // En la página de documentación las historias se pintan una tras otra:
      // sin acotar la altura, un armazón a pantalla completa deja una página
      // interminable y el menú se pierde de vista. Con marco propio se ve como
      // lo que es, una aplicación, y con su propio desplazamiento.
      story: { height: "520px", inline: false },
      description: {
        component:
          "Armazón de aplicación: menú lateral, barra superior y contenido. Trae resuelto el plegado con la preferencia recordada por dispositivo, la animación de ancho, el panel móvil y el carácter cromático del menú.\n\nAquí se documenta el componente y sus estados por separado. Para ver cómo se compone con el resto —tabla, formulario, navegación real— está *Guías → Aplicación de ejemplo*.",
      },
    },
  },
  // `sidebar` y `children` son obligatorios: cada story los sustituye en su
  // `render`, pero el tipo del meta los exige.
  args: { sidebar: null, children: null },
} satisfies Meta<typeof AppShell>;

export default meta;
type Story = StoryObj<typeof meta>;

const ENLACES = [
  { id: "inicio", label: "Inicio", icon: DashboardIcon },
  { id: "movimientos", label: "Movimientos", icon: ReceiptIcon },
  { id: "clientes", label: "Clientes", icon: UsersIcon },
  { id: "ajustes", label: "Ajustes", icon: SettingsIcon },
];

function Navegacion() {
  const [activo, setActivo] = useState("inicio");
  return (
    <SidebarNav>
      {ENLACES.map(({ id, label, icon: Icon }) => (
        <SidebarNavItem
          key={id}
          icon={<Icon />}
          active={activo === id}
          onClick={(event) => {
            event.preventDefault();
            setActivo(id);
          }}
        >
          {label}
        </SidebarNavItem>
      ))}
    </SidebarNav>
  );
}

const grupos = [
  {
    id: "empresa",
    label: "Empresa",
    value: "acme",
    options: [
      { value: "acme", label: "Acme S.A." },
      { value: "globex", label: "Globex Ltda." },
    ],
  },
  {
    id: "entorno",
    label: "Entorno",
    value: "prd",
    options: [
      { value: "prd", label: "Producción", description: "Datos reales de la operación" },
      { value: "uat", label: "Pruebas (UAT)", description: "Datos de ensayo, sin efecto real", badge: { label: "UAT", tone: "warning" as const } },
    ],
  },
];

/** El armazón completo, tal como lo montaría una aplicación. */
export const Default: Story = {
  name: "Armazón completo",
  render: () => {
    const Demo = () => {
      return (
        <AppShell
          storageKey="demo"
          brand={<SidebarBrand name="Acme S.A." groups={grupos} />}
          sidebar={<Navegacion />}
          sidebarFooter={<AppVersion version="1.4.2" buildDate="2026-09-03" />}
          topbar={<Button size="sm" variant="outline">Mi perfil</Button>}
        >
          <PageContainer>
            <PageHeader
              title="Arqueo de caja"
              description="Cierre del turno de la mañana."
              actions={<Button>Cerrar turno</Button>}
            />
            <Card>
              <CardHeader>
                <CardTitle>Resumen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-ui-body-sm text-muted-foreground">
                  Una tarjeta se dibuja sobre `raised` y la página sobre `ground`: por eso se distingue del fondo
                  sin necesidad de un gris inventado.
                </p>
              </CardContent>
            </Card>
          </PageContainer>
        </AppShell>
      );
    };
    return <Demo />;
  },
};

/**
 * Las tres variantes de carácter del menú. El menú es oscuro en tema claro y en
 * oscuro: es un plano distinto de la interfaz, no una superficie más.
 */
export const Variantes: Story = {
  name: "Carácter del menú",
  render: () => (
    <div className="grid gap-ui-lg">
      {(["graphite", "ink", "smoke"] as const).map((variant) => (
        <div key={variant} className="overflow-hidden rounded-lg border border-border">
          <AppShell
            variant={variant}
            brand={<SidebarBrand name="Acme S.A." />}
            sidebar={<Navegacion />}
            sidebarFooter={<AppVersion version="1.4.2" />}
            className="min-h-[22rem]"
          >
            <PageContainer animate={false}>
              <PageHeader as="h2" title={variant} description="Cambia con `variant`; se afina con los tokens `--sidebar-*`." />
            </PageContainer>
          </AppShell>
        </div>
      ))}
    </div>
  ),
};

/** Plegado: el ancho se anima solo y la preferencia se recuerda por dispositivo. */
export const Plegado: Story = {
  name: "Menú plegado",
  render: () => (
    <AppShell
      defaultCollapsed
      brand={<SidebarBrand name="Distribuidora El Poblado S.A.S." groups={grupos} />}
      sidebarFooter={<AppVersion version="4.2.0" buildDate="2026-09-03" />}
      sidebar={<Navegacion />}
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="El menú recuerda si lo dejaste plegado." />
      </PageContainer>
    </AppShell>
  ),
};

/**
 * El estado activo lo decide la aplicación con `active`, porque la librería no
 * conoce el router. Con React Router se calcula desde `useLocation`.
 */
function NavegacionConRouter() {
  const { pathname } = useLocation();
  return (
    <SidebarNav>
      {ENLACES.map(({ id, label, icon: Icon }) => (
        <SidebarNavItem key={id} asChild icon={<Icon />} active={pathname === `/${id}`}>
          <NavLink to={`/${id}`}>
            <span>{label}</span>
          </NavLink>
        </SidebarNavItem>
      ))}
    </SidebarNav>
  );
}

/**
 * `asChild` con el router de la aplicación, que es para lo que existe: el
 * `NavLink` recibe el estilo del menú y conserva lo suyo.
 *
 * La etiqueta va dentro de un `<span>`. Es lo que permite ocultarla cuando el
 * menú se pliega, dejando solo el icono.
 */
export const ConRouter: Story = {
  name: "Con React Router (asChild)",
  render: () => (
    <MemoryRouter initialEntries={["/inicio"]}>
      <AppShell
        storageKey="demo-router"
        brand={<SidebarBrand name="Acme S.A." groups={grupos} />}
        sidebarFooter={<AppVersion version="1.4.2" buildDate="2026-09-03" />}
        sidebar={<NavegacionConRouter />}
      >
        <Routes>
          {ENLACES.map(({ id, label }) => (
            <Route
              key={id}
              path={`/${id}`}
              element={
                <PageContainer>
                  <PageHeader title={label} description="El menú marca el destino actual desde el propio router." />
                </PageContainer>
              }
            />
          ))}
        </Routes>
      </AppShell>
    </MemoryRouter>
  ),
};

/** Secciones plegables, para menús con muchas entradas. */
export const SeccionesPlegables: Story = {
  name: "Secciones plegables",
  render: () => (
    <AppShell
      storageKey="demo-grupos"
      brand={<SidebarBrand name="Acme S.A." />}
      sidebar={
        <SidebarNav>
          <SidebarNavGroup label="Operación" collapsible groupId="operacion">
            <SidebarNavItem icon={<ReceiptIcon />} active>
              Movimientos
            </SidebarNavItem>
            <SidebarNavItem icon={<UsersIcon />}>Clientes</SidebarNavItem>
          </SidebarNavGroup>
          <SidebarNavGroup label="Administración" collapsible groupId="administracion" defaultOpen={false}>
            <SidebarNavItem icon={<SettingsIcon />}>Usuarios</SidebarNavItem>
            <SidebarNavItem icon={<SettingsIcon />}>Permisos</SidebarNavItem>
          </SidebarNavGroup>
        </SidebarNav>
      }
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="Las secciones cerradas se recuerdan en este dispositivo." />
      </PageContainer>
    </AppShell>
  ),
};

/**
 * Seis secciones y cuarenta enlaces, que es donde se ve si el menú agrupa o no.
 *
 * Las otras historias caben en la ventana y por eso no lo enseñan: con dos
 * secciones cortas, cualquier separación parece suficiente. La distancia entre
 * secciones es cuatro veces la que hay entre dos enlaces de la misma sección;
 * si fueran iguales, esto se leería como una lista de cuarenta.
 */
export const MenuLargo: Story = {
  name: "Menú largo (seis secciones)",
  render: () => {
    const secciones = [
      { label: "Operación", enlaces: ["Movimientos", "Arqueo de caja", "Conciliación", "Cierres", "Traslados"] },
      { label: "Cartera", enlaces: ["Clientes", "Facturas", "Recaudos", "Notas crédito", "Cobranza"] },
      { label: "Compras", enlaces: ["Proveedores", "Órdenes", "Recepciones", "Cuentas por pagar"] },
      { label: "Tesorería", enlaces: ["Cuentas bancarias", "Pagos programados", "Extractos", "Flujo de caja"] },
      { label: "Informes", enlaces: ["Estado de resultados", "Balance", "Auxiliares", "Impuestos", "Exportaciones"] },
      { label: "Administración", enlaces: ["Usuarios", "Permisos", "Sucursales", "Parámetros", "Auditoría"] },
    ];
    return (
      <AppShell
        storageKey="demo-largo"
        brand={<SidebarBrand name="Acme S.A." groups={grupos} />}
        sidebarFooter={<AppVersion version="1.4.2" buildDate="2026-09-03" />}
        sidebar={
          <SidebarNav>
            {secciones.map((seccion, indice) => (
              <SidebarNavGroup key={seccion.label} label={seccion.label}>
                {seccion.enlaces.map((enlace, posicion) => (
                  <SidebarNavItem
                    key={enlace}
                    icon={<ReceiptIcon />}
                    active={indice === 0 && posicion === 0}
                  >
                    {enlace}
                  </SidebarNavItem>
                ))}
              </SidebarNavGroup>
            ))}
          </SidebarNav>
        }
      >
        <PageContainer>
          <PageHeader
            title="Movimientos"
            description="Con seis secciones, la separación entre ellas es lo que permite leer el menú."
          />
        </PageContainer>
      </AppShell>
    );
  },
};
