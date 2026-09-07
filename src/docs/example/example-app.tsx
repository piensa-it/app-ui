import * as React from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Building2,
  Download,
  FilePlus2,
  HelpCircle,
  Landmark,
  Search,
  Wallet,
  Receipt,
  ShoppingCart,
  LayoutDashboard,
} from "lucide-react";

import { AppShell, type AppShellLayout, type SidebarTone, type SidebarVariant } from "@/components/layout/app-shell";
import { AppVersion } from "@/components/layout/app-version";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SidebarIdentity } from "@/components/layout/sidebar-identity";
import { SidebarNav, SidebarNavGroup, SidebarNavItem } from "@/components/layout/sidebar-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { Column, DataTable } from "@/components/ui/data-table";
import { FormGrid } from "@/components/ui/form-grid";
import { Stat, StatGroup } from "@/components/ui/stat";
import { ArrowDownLeftIcon, ArrowUpRightIcon, BankIcon, ClockIcon } from "@/icons";
import { Toolbar } from "@/components/layout/toolbar";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  centrosDeCosto,
  empresas,
  formatoFecha,
  formatoPesos,
  metodosDePago,
  movimientos,
  type Movimiento,
  flujoMensual,
  pendientes,
} from "./data";

/* -------------------------------------------------------------------------- */
/* Navegación                                                                  */
/* -------------------------------------------------------------------------- */

type VistaId = "tablero" | "movimientos" | "nuevo" | "conciliacion" | "reportes" | "cuentas";

interface EnlaceNav {
  id: VistaId;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

const MODULOS = [
  { id: "tesoreria", label: "Tesorería", icon: Wallet },
  { id: "cartera", label: "Cartera", icon: Receipt },
  { id: "compras", label: "Compras", icon: ShoppingCart },
  { id: "informes", label: "Informes", icon: BarChart3 },
] as const;

/**
 * Los enlaces van en secciones plegables: es lo que se ve cuando una
 * aplicación crece, y con el chevrón cada persona cierra lo que no usa. Las
 * secciones cerradas se recuerdan con `storageKey`, junto al plegado.
 */
const SECCIONES: { id: string; label: string; enlaces: EnlaceNav[] }[] = [
  {
    id: "operacion",
    label: "Operación",
    enlaces: [
      { id: "tablero", label: "Tablero", icon: LayoutDashboard },
      { id: "movimientos", label: "Movimientos", icon: ArrowLeftRight },
      { id: "nuevo", label: "Nuevo movimiento", icon: FilePlus2 },
    ],
  },
  {
    id: "control",
    label: "Control",
    enlaces: [
      { id: "conciliacion", label: "Conciliación", icon: Landmark },
      { id: "reportes", label: "Reportes", icon: BarChart3 },
    ],
  },
  {
    id: "maestros",
    label: "Maestros",
    enlaces: [{ id: "cuentas", label: "Cuentas bancarias", icon: Building2 }],
  },
];

/**
 * Un enlace del menú. La librería no conoce el router de la aplicación, así
 * que cada producto pone su propio elemento (`<a>`, `NavLink`, `<button>`); lo
 * que sí comparten todos son los tokens `--sidebar-*`, que garantizan que el
 * reposo, el hover y el activo se lean igual en las tres variantes de menú.
 */
function NavLink({
  enlace,
  activo,
  onSelect,
}: {
  enlace: EnlaceNav;
  activo: boolean;
  onSelect: (id: VistaId) => void;
}) {
  const Icono = enlace.icon;
  // `SidebarNavItem` ya resuelve el estado activo, el foco, el modo plegado
  // (que toma del contexto del menú) y el cierre del panel móvil al navegar.
  return (
    <SidebarNavItem
      href={`#${enlace.id}`}
      icon={<Icono />}
      active={activo}
      onClick={(event: React.MouseEvent) => {
        event.preventDefault();
        onSelect(enlace.id);
      }}
    >
      {enlace.label}
    </SidebarNavItem>
  );
}

/* -------------------------------------------------------------------------- */
/* Vistas                                                                      */
/* -------------------------------------------------------------------------- */

const TONO_ESTADO: Record<Movimiento["estado"], { variante: "success" | "warning" | "outline"; label: string }> = {
  conciliado: { variante: "success", label: "Conciliado" },
  pendiente: { variante: "warning", label: "Pendiente" },
  anulado: { variante: "outline", label: "Anulado" },
};

function VistaTablero({ onIr }: { onIr: (vista: VistaId) => void }) {
  const activos = movimientos.filter((m) => m.estado !== "anulado");
  const entradas = activos.filter((m) => m.valor > 0);
  const salidas = activos.filter((m) => m.valor < 0);
  const total = (lista: Movimiento[]) => lista.reduce((suma, m) => suma + m.valor, 0);
  const saldo = total(entradas) + total(salidas);
  const porConciliar = movimientos.filter((m) => m.estado === "pendiente");
  const recientes = [...movimientos].sort((a, b) => b.fecha.localeCompare(a.fecha)).slice(0, 5);

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Tablero de tesorería"
        description="Cómo va el mes, qué espera una acción y los últimos movimientos."
        actions={<Button onClick={() => onIr("nuevo")}>Registrar movimiento</Button>}
      />

      {/* Cada cifra con su icono y su tono: el icono dice de qué es la cifra
          de un vistazo; el tono, qué clase de noticia es. */}
      <StatGroup label="Resumen del mes" columns={4}>
        <Stat label="Entradas" icon={<ArrowDownLeftIcon />} tone="positive" value={formatoPesos(total(entradas))} description={`${entradas.length} movimientos recaudados`} />
        <Stat label="Salidas" icon={<ArrowUpRightIcon />} value={formatoPesos(total(salidas))} description={`${salidas.length} pagos ejecutados`} />
        <Stat
          label="Saldo del periodo"
          icon={<BankIcon />}
          tone={saldo < 0 ? "warning" : "default"}
          value={formatoPesos(saldo)}
          description="Antes de conciliación bancaria"
          trend={{ value: "-18,6% vs. agosto", direction: "down", goodWhenUp: true }}
        />
        <Stat
          label="Por conciliar"
          icon={<ClockIcon />}
          tone={porConciliar.length > 3 ? "negative" : "warning"}
          value={String(porConciliar.length)}
          description={`${formatoPesos(total(porConciliar))} en movimientos pendientes`}
        />
      </StatGroup>

      <Chart
        type="bar"
        title="Flujo de caja"
        description="Entradas y salidas de los últimos seis meses."
        data={flujoMensual}
        categoryKey="mes"
        series={[
          { key: "entradas", label: "Entradas" },
          { key: "salidas", label: "Salidas" },
        ]}
        height={260}
        valueFormatter={formatoPesos}
        axisFormatter={(v) => `${Math.round(v / 1_000_000)} M`}
      />

      <div className="grid gap-stack lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pendientes de tesorería</CardTitle>
            <CardDescription>Lo que espera una acción, por vencimiento.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {pendientes.map((p) => (
                <li key={p.id} className="flex items-start justify-between gap-ui-md py-ui-sm">
                  <span className="min-w-0">
                    <span className="block truncate text-ui-body-sm font-medium">{p.titulo}</span>
                    <span className="block truncate text-ui-caption text-muted-foreground">{p.detalle}</span>
                  </span>
                  <Badge variant={p.vence === "Hoy" ? "warning" : "secondary"} size="sm">
                    {p.vence}
                  </Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos movimientos</CardTitle>
            <CardDescription>Los cinco más recientes; el detalle completo está en Movimientos.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-ui-sm">
            <ul className="divide-y divide-border">
              {recientes.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-ui-md py-ui-sm">
                  <span className="min-w-0">
                    <span className="block truncate text-ui-body-sm font-medium">{m.concepto}</span>
                    <span className="block truncate text-ui-caption text-muted-foreground">{m.tercero}</span>
                  </span>
                  <span className={cn("shrink-0 text-ui-body-sm tabular-nums", m.valor < 0 && "text-destructive")}>{formatoPesos(m.valor)}</span>
                </li>
              ))}
            </ul>
            <Button variant="outline" size="sm" className="self-start" onClick={() => onIr("movimientos")}>
              Ver todos los movimientos
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}

function VistaMovimientos() {
  const entradas = movimientos.filter((m) => m.valor > 0 && m.estado !== "anulado");
  const salidas = movimientos.filter((m) => m.valor < 0 && m.estado !== "anulado");
  const total = (lista: Movimiento[]) => lista.reduce((suma, m) => suma + m.valor, 0);
  const saldo = total(entradas) + total(salidas);

  return (
    <PageContainer width="wide">
      <PageHeader
        title="Movimientos de caja"
        description="Septiembre de 2026 · cuenta corriente Banco de Bogotá 4218."
        above={<Badge variant="secondary">Periodo abierto</Badge>}
        actions={
          <>
            <Button variant="outline">
              <Download aria-hidden="true" />
              Exportar
            </Button>
            <Button>Registrar movimiento</Button>
          </>
        }
      />

      <StatGroup label="Resumen del periodo">
        <Stat
          label="Entradas"
          icon={<ArrowDownLeftIcon />}
          tone="positive"
          value={formatoPesos(total(entradas))}
          description={`${entradas.length} movimientos recaudados`}
        />
        <Stat
          label="Salidas"
          icon={<ArrowUpRightIcon />}
          value={formatoPesos(total(salidas))}
          description={`${salidas.length} pagos ejecutados`}
        />
        <Stat
          label="Saldo del periodo"
          icon={<BankIcon />}
          tone={saldo < 0 ? "warning" : "default"}
          value={formatoPesos(saldo)}
          description="Antes de conciliación bancaria"
          trend={{ value: "-18,6% vs. agosto", direction: "down", goodWhenUp: true }}
        />
      </StatGroup>

      <DataTable
        value={movimientos}
        rows={8}
        searchable
        striped
        configurableColumns
        preferencesKey="ejemplo-tesoreria-movimientos"
        title="Detalle de movimientos"
        description="Ordena por fecha o valor para revisar el arqueo del día."
        searchPlaceholder="Buscar por concepto o tercero…"
        aria-label="Movimientos de caja"
      >
        <Column<Movimiento> field="id" header="Consecutivo" sortable className="font-medium tabular-nums" footer={() => "Total del periodo"} />
        <Column<Movimiento>
          field="fecha"
          header="Fecha"
          sortable
          className="whitespace-nowrap"
          body={(fila) => formatoFecha(fila.fecha)}
        />
        <Column<Movimiento> field="concepto" header="Concepto" sortable />
        <Column<Movimiento>
          field="tercero"
          header="Tercero"
          body={(fila) => <span className="text-muted-foreground">{fila.tercero}</span>}
        />
        <Column<Movimiento> field="centro" header="Centro de costo" sortable />
        <Column<Movimiento>
          field="estado"
          header="Estado"
          sortable
          body={(fila) => (
            <Badge variant={TONO_ESTADO[fila.estado].variante} size="sm">
              {TONO_ESTADO[fila.estado].label}
            </Badge>
          )}
        />
        <Column<Movimiento>
          field="valor"
          header="Valor"
          sortable
          // `align="right"` ya trae las cifras de ancho fijo.
          align="right"
          body={(fila) => (
            <span className={fila.valor < 0 ? "text-destructive" : "text-foreground"}>
              {formatoPesos(fila.valor)}
            </span>
          )}
          // El total suma las filas filtradas, no la página visible. Los
          // anulados no suman, igual que en las cifras de arriba: si el pie y
          // el encabezado no cuadran, la pantalla deja de ser creíble.
          footer={(filas) =>
            formatoPesos(
              filas.filter((fila) => fila.estado !== "anulado").reduce((suma, fila) => suma + fila.valor, 0),
            )
          }
        />
      </DataTable>
    </PageContainer>
  );
}

function VistaNuevoMovimiento({ onCancelar }: { onCancelar: () => void }) {
  const [concepto, setConcepto] = React.useState("");
  const [tercero, setTercero] = React.useState("Ferretería La Ceiba S.A.S.");
  const [valor, setValor] = React.useState("");
  const [centro, setCentro] = React.useState<string | number | null>("operaciones");
  const [metodo, setMetodo] = React.useState<string | number | null>("transferencia");
  const [enviado, setEnviado] = React.useState(false);

  const errorConcepto = enviado && concepto.trim() === "" ? "Escribe el concepto del movimiento." : undefined;
  const errorValor = enviado && Number(valor) <= 0 ? "El valor debe ser mayor que cero." : undefined;

  return (
    <PageContainer>
      <PageHeader
        as="h1"
        title="Nuevo movimiento"
        description="Queda en estado pendiente hasta que tesorería lo concilie."
      />

      <Card>
        <CardHeader>
          <CardTitle>Datos del movimiento</CardTitle>
          <CardDescription>Los campos marcados con asterisco son obligatorios.</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setEnviado(true);
            }}
            className="space-y-stack"
          >
            <FormGrid>
              <Field
                label="Concepto"
                required
                error={errorConcepto}
                description="Cómo aparecerá en el extracto y en el arqueo."
                span="full"
              >
                <Input
                  value={concepto}
                  onChange={(event) => setConcepto(event.target.value)}
                  placeholder="Compra de insumos de bodega"
                />
              </Field>

              <Field label="Tercero" required>
                <Input value={tercero} onChange={(event) => setTercero(event.target.value)} />
              </Field>

              <Field label="Valor" required error={errorValor} description="En pesos colombianos, sin puntos.">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={valor}
                  onChange={(event) => setValor(event.target.value)}
                  placeholder="2985400"
                  className="text-right tabular-nums"
                />
              </Field>

              <Field label="Centro de costo" required>
                <Select options={centrosDeCosto} value={centro} onChange={setCentro} />
              </Field>

              <Field label="Método de pago" required>
                <Select
                  options={metodosDePago}
                  value={metodo}
                  onChange={setMetodo}
                  placeholder="Selecciona un método"
                />
              </Field>

              <Field label="Observaciones" optionalLabel="Opcional" span="full">
                <Input placeholder="Número de orden, remisión o autorización" />
              </Field>
            </FormGrid>

            <Toolbar>
              <Button type="submit">Guardar movimiento</Button>
              <Button type="button" variant="ghost" onClick={onCancelar}>
                Cancelar
              </Button>
              {enviado && !errorConcepto && !errorValor ? (
                <span className="text-ui-body-sm text-muted-foreground">
                  Listo: {formatoPesos(Number(valor))} quedaría pendiente de conciliar.
                </span>
              ) : null}
            </Toolbar>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function VistaPendiente({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    // `animateKey` porque estas tres vistas comparten componente: React lo
    // reutiliza al cambiar de una a otra y, sin volver a montarlo, la entrada
    // no se dispararía. Unas pantallas entrarían animadas y otras no.
    // Las otras dos vistas son componentes distintos y ya se montan solas.
    <PageContainer animateKey={titulo}>
      <PageHeader title={titulo} description={descripcion} />
      <EmptyState
        icon={<HelpCircle aria-hidden="true" className="size-5" />}
        title="Aún no hay nada que mostrar"
        description="Esta pantalla existe para comprobar que la navegación y el armazón se comportan igual en secciones todavía vacías."
        action={<Button variant="outline">Conocer el módulo</Button>}
      />
    </PageContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Aplicación                                                                  */
/* -------------------------------------------------------------------------- */

export interface ExampleAppProps {
  /** Carácter cromático del menú lateral. */
  variant?: SidebarVariant;
  /** Vista inicial. */
  vistaInicial?: VistaId;
  /** Menú plegado de entrada, para ver los enlaces en su forma corta. */
  defaultCollapsed?: boolean;
  /** Forma del armazón (#113). */
  layout?: AppShellLayout;
  /** Tono del menú (#113). */
  sidebarTone?: SidebarTone;
  /** El buscador centrado en la barra superior (`topbarCenter`), como en la plantilla 3. */
  buscadorCentrado?: boolean;
}

/**
 * Aplicación mínima pero completa montada solo con piezas de la librería:
 * `AppShell` + `SidebarIdentity` + `AppVersion` para el armazón, `PageContainer`
 * y `PageHeader` para cada pantalla, y `DataTable` / `Field` para el
 * contenido. La navegación, el enrutamiento y los datos los pone la
 * aplicación, que es exactamente el reparto que propone la librería.
 */
export function ExampleApp({
  variant = "graphite",
  vistaInicial = "tablero",
  defaultCollapsed = false,
  layout = "docked",
  // Sin valor: manda el de la librería (oscuro; claro en el panel de dos niveles).
  sidebarTone,
  buscadorCentrado = false,
}: ExampleAppProps) {
  const [vista, setVista] = React.useState<VistaId>(vistaInicial);
  const [empresa, setEmpresa] = React.useState(empresas[0].value);
  const [periodo, setPeriodo] = React.useState<string | number | null>("2026-09");


  const contenido =
    vista === "tablero" ? (
      <VistaTablero onIr={setVista} />
    ) : vista === "movimientos" ? (
      <VistaMovimientos />
    ) : vista === "nuevo" ? (
      <VistaNuevoMovimiento onCancelar={() => setVista("movimientos")} />
    ) : vista === "conciliacion" ? (
      <VistaPendiente
        titulo="Conciliación bancaria"
        descripcion="Cruce del extracto contra los movimientos registrados."
      />
    ) : vista === "reportes" ? (
      <VistaPendiente titulo="Reportes" descripcion="Flujo de caja, cartera y ejecución por centro de costo." />
    ) : (
      <VistaPendiente titulo="Cuentas bancarias" descripcion="Cuentas habilitadas para recaudo y pagos." />
    );

  // Los módulos del riel en dos niveles (#114). Tesorería es el activo: su
  // árbol es el menú de siempre. Los demás son de muestra.
  const modulos = (
    <SidebarNav>
      {MODULOS.map((modulo) => (
        <SidebarNavItem key={modulo.id} icon={<modulo.icon aria-hidden="true" />} active={modulo.id === "tesoreria"} onClick={(e) => e.preventDefault()}>
          {modulo.label}
        </SidebarNavItem>
      ))}
    </SidebarNav>
  );

  const persona = { name: "Andrés Montoya", email: "andres@piensait.com", role: "Cajera", avatarColor: "350 75% 45%" };

  // La identidad vive en la cabecera del menú: sistema, compañía y —salvo en
  // dos niveles, donde el módulo ya está en el riel— módulo. La compañía se
  // cambia aquí y en ningún otro sitio; su entorno se ve como distintivo.
  const marca = (
    <SidebarIdentity
      // El sistema es el mismo para todas las compañías: nombre genérico y la
      // marca de Piensa IT. El entorno va con la compañía, que es donde se
      // paraleliza.
      system={{ name: "Sistema", logo: <img src="/piensait.png" alt="" className="size-full object-cover" /> }}
      company={{ caption: "Compañía", value: empresa, options: empresas, onChange: setEmpresa }}
      module={
        layout === "rail-panel"
          ? undefined
          : { caption: "Módulo", value: "tesoreria", options: MODULOS.map((m) => ({ value: m.id, label: m.label })), onChange: () => {} }
      }
    />
  );

  return (
    <AppShell
      variant={variant}
      layout={layout}
      sidebarTone={sidebarTone}
      rail={layout === "rail-panel" ? modulos : undefined}
      panelTitle={layout === "rail-panel" ? "Tesorería" : undefined}
      storageKey="ejemplo-tesoreria"
      defaultCollapsed={defaultCollapsed}
      brand={marca}
      sidebar={
        <SidebarNav>
          {SECCIONES.map((seccion) => (
            <SidebarNavGroup key={seccion.id} label={seccion.label} collapsible groupId={seccion.id}>
              {seccion.enlaces.map((enlace) => (
                <NavLink key={enlace.id} enlace={enlace} activo={vista === enlace.id} onSelect={setVista} />
              ))}
            </SidebarNavGroup>
          ))}
        </SidebarNav>
      }
      sidebarFooter={<AppVersion version="4.2.0" buildDate="2026-09-03" />}
      topbarCenter={
        buscadorCentrado ? (
          <div className="relative w-full max-w-xl">
            <Search aria-hidden="true" className="pointer-events-none absolute left-ui-sm top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input aria-label="Buscar" placeholder="Buscar movimientos, terceros, cuentas…" className="pl-ui-xl" />
          </div>
        ) : undefined
      }
      topbar={
        <>
          <Toolbar>
            <Select
              aria-label="Periodo contable"
              size="sm"
              options={[
                { value: "2026-09", label: "Septiembre 2026" },
                { value: "2026-08", label: "Agosto 2026" },
                { value: "2026-07", label: "Julio 2026" },
              ]}
              value={periodo}
              onChange={setPeriodo}
              width="auto"
            />
          </Toolbar>
          <Button size="sm" variant="outline" onClick={() => setVista("nuevo")}>
            <FilePlus2 aria-hidden="true" />
            Nuevo
          </Button>
          {/* La persona, siempre en el mismo sitio y con el mismo orden dentro:
              perfil, configuración, lo propio de la aplicación, cerrar sesión. */}
          <UserMenu
            user={persona}
            onProfile={() => setVista("movimientos")}
            onSettings={() => setVista("movimientos")}
            onSignOut={() => setVista("movimientos")}
            confirmSignOut
          />
        </>
      }
    >
      {contenido}
    </AppShell>
  );
}
