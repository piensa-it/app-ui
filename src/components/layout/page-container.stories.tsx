import type { Meta, StoryObj } from "@storybook/react-vite";
import { PageContainer } from "./page-container";
import { PageHeader } from "./page-header";
import { AppVersion } from "./app-version";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta = {
  title: "Layout/PageContainer",
  component: PageContainer,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Contenedor de página: ancho de lectura, relleno y ritmo vertical de 24 px entre bloques, con la entrada escalonada ya resuelta. Cada hijo directo es un bloque de primer nivel.",
      },
    },
  },
  args: { children: null },
} satisfies Meta<typeof PageContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const bloques = ["Resumen del turno", "Movimientos recientes", "Alertas"];

/**
 * La entrada escalonada viene del contenedor, no de cada pantalla: si cada una
 * decidiera, solo unas pocas se animarían. Respeta `prefers-reduced-motion`.
 */
export const Default: Story = {
  name: "Página completa",
  render: () => (
    <PageContainer>
      <PageHeader
        title="Arqueo de caja"
        description="Cierre del turno de la mañana."
        actions={<Button>Cerrar turno</Button>}
      />
      {bloques.map((titulo) => (
        <Card key={titulo}>
          <CardHeader>
            <CardTitle>{titulo}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-ui-body-sm text-muted-foreground">
              Los bloques se separan con el ritmo vertical del sistema.
            </p>
          </CardContent>
        </Card>
      ))}
    </PageContainer>
  ),
};

/** `animate={false}` cuando la pantalla ya tiene su propia animación de entrada. */
export const SinAnimacion: Story = {
  name: "Sin entrada escalonada",
  render: () => (
    <PageContainer animate={false}>
      <PageHeader title="Movimientos" />
      <Card>
        <CardContent className="pt-inset">Contenido.</CardContent>
      </Card>
    </PageContainer>
  ),
};

/** `width="wide"` para tableros y tablas anchas. */
export const Ancho: Story = {
  name: "Ancho para tableros",
  render: () => (
    <PageContainer width="wide">
      <PageHeader title="Tablero" description="Más ancho que una pantalla de lectura." />
      <Card>
        <CardContent className="pt-inset">Contenido.</CardContent>
      </Card>
    </PageContainer>
  ),
};

/** La línea de versión: la de la aplicación en el menú, el detalle en la ayuda. */
export const Version: Story = {
  name: "AppVersion",
  render: () => (
    <div className="flex flex-col gap-ui-lg">
      <div className="space-y-ui-2xs">
        <p className="text-ui-caption font-medium">En el pie del menú</p>
        <p className="text-ui-caption text-muted-foreground">
          Solo la versión de la aplicación, que es lo que se consulta a diario.
        </p>
        <AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" />
      </div>
      <div className="space-y-ui-2xs">
        <p className="text-ui-caption font-medium">En una pantalla de ayuda</p>
        <p className="text-ui-caption text-muted-foreground">
          Con <code className="font-mono">details</code>: añade la versión de la librería y la fecha de
          compilación, que es lo que hace falta para saber contra qué compilado mira quien reporta algo.
        </p>
        <AppVersion version="1.4.2" buildDate="2026-09-03T10:15:00Z" details />
      </div>
    </div>
  ),
};

/**
 * Un bloque que no pinta nada no deja hueco.
 *
 * Aquí hay un modal cerrado entre la cabecera y la tarjeta. En un contenedor
 * de bloque normal no se notaría: los márgenes de `space-y` colapsan a través
 * de un elemento vacío de alto cero. Pero en cuanto la página es una columna
 * flex —para anclar una barra al pie, por ejemplo— o una cuadrícula, los
 * márgenes no colapsan y el envoltorio vacío cobraba un paso entero: cabecera
 * y tarjeta a 48 px en vez de 24 (#91). La hoja de `Stagger` oculta el
 * envoltorio vacío, y la distancia vuelve a ser un solo paso en los dos casos.
 */
export const BloqueVacio: Story = {
  name: "Bloque vacío, sin hueco",
  render: () => (
    <PageContainer className="flex min-h-[24rem] flex-col">
      <PageHeader title="Transacciones" description="El detalle se monta como modal cerrado justo debajo." />
      <Dialog open={false} onOpenChange={() => {}}>
        <DialogHeader>
          <DialogTitle>Detalle</DialogTitle>
        </DialogHeader>
      </Dialog>
      {null}
      <Card>
        <CardContent>
          <p className="text-ui-body-sm text-muted-foreground">
            Entre la cabecera y esta tarjeta hay un modal cerrado y un `null`: la distancia sigue siendo un solo paso
            de ritmo (24 px), no dos, aunque esta página sea una columna flex.
          </p>
        </CardContent>
      </Card>
      <p className="mt-auto text-ui-caption text-muted-foreground">Barra anclada al pie: por esto la página es flex.</p>
    </PageContainer>
  ),
};
