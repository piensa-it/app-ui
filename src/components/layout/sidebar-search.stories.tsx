import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppShell } from "./app-shell";
import { SidebarIdentity } from "./sidebar-identity";
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "./sidebar-nav";
import { SidebarSearch } from "./sidebar-search";
import { normalizeSearch } from "@/lib/search";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { Button } from "@/components/ui/button";
import { ReceiptIcon } from "@/icons";

const meta = {
  title: "Layout/SidebarSearch",
  component: SidebarSearch,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      story: { height: "460px", inline: false },
      description: {
        component:
          "Buscador de opciones del menú lateral: un campo arriba de la navegación con la lupa, limpiar y Escape. La librería no conoce los enlaces; la aplicación filtra los suyos con el texto (`normalizeSearch` ignora tildes y mayúsculas). Con el menú plegado no se pinta.",
      },
    },
  },
  args: { value: "", onChange: () => {} },
} satisfies Meta<typeof SidebarSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

const secciones = [
  { label: "Operación", enlaces: ["Movimientos", "Arqueo de caja", "Conciliación", "Cierres", "Traslados"] },
  { label: "Cartera", enlaces: ["Clientes", "Facturas", "Recaudos", "Notas crédito", "Cobranza"] },
  { label: "Tesorería", enlaces: ["Cuentas bancarias", "Pagos programados", "Extractos", "Flujo de caja"] },
  { label: "Administración", enlaces: ["Usuarios", "Permisos", "Sucursales", "Parámetros", "Auditoría"] },
];

function Demo({ inicial = "" }: { inicial?: string }) {
  const [busqueda, setBusqueda] = useState(inicial);
  const termino = normalizeSearch(busqueda);
  const visibles = secciones
    .map((s) => ({ ...s, enlaces: s.enlaces.filter((e) => !termino || normalizeSearch(e).includes(termino)) }))
    .filter((s) => s.enlaces.length > 0);
  return (
    <AppShell
      brand={<SidebarIdentity system={{ name: "Sistema" }} company={{ caption: "Compañía", value: "acme", label: "Acme S.A." }} />}
      sidebar={
        <>
          <SidebarSearch value={busqueda} onChange={setBusqueda} />
          <SidebarNav>
            {visibles.map((s) => (
              <SidebarNavGroup key={s.label} label={s.label} collapsible={!termino}>
                {s.enlaces.map((e, i) => (
                  <SidebarNavItem key={e} icon={<ReceiptIcon />} active={s.label === "Operación" && i === 0}>
                    {e}
                  </SidebarNavItem>
                ))}
              </SidebarNavGroup>
            ))}
          </SidebarNav>
        </>
      }
      topbar={<Button size="sm" variant="outline">Mi perfil</Button>}
    >
      <PageContainer>
        <PageHeader title="Movimientos" description="Escribe en el buscador del menú: con diecinueve enlaces en cuatro secciones, buscar es más rápido que desplazar." />
      </PageContainer>
    </AppShell>
  );
}

/** Diecinueve enlaces en cuatro secciones; el buscador filtra y las secciones sin resultados se ocultan. */
export const Filtrando: Story = { render: () => <Demo inicial="ca" /> };

/** Sin texto: el menú completo, con sus secciones plegables. */
export const SinTexto: Story = { name: "Sin texto", render: () => <Demo /> };
