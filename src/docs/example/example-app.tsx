import * as React from "react";
import {
  ArrowLeftRight,
  BarChart3,
  Building2,
  Download,
  FilePlus2,
  HelpCircle,
  Landmark,
  LogOut,
  Settings,
} from "lucide-react";

import { AppShell, type SidebarVariant } from "@/components/layout/app-shell";
import { AppVersion } from "@/components/layout/app-version";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SidebarBrand } from "@/components/layout/sidebar-brand";
import { SidebarNav, SidebarNavItem } from "@/components/layout/sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Column, DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { MenuItem } from "@/components/ui/menu";
import { Select } from "@/components/ui/select";
import {
  centrosDeCosto,
  empresas,
  entornos,
  formatoFecha,
  formatoPesos,
  metodosDePago,
  movimientos,
  type Movimiento,
} from "./data";

/* -------------------------------------------------------------------------- */
/* Navegación                                                                  */
/* -------------------------------------------------------------------------- */

type VistaId = "movimientos" | "nuevo" | "conciliacion" | "reportes" | "cuentas";

interface EnlaceNav {
  id: VistaId;
  label: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
}

const ENLACES: EnlaceNav[] = [
  { id: "movimientos", label: "Movimientos", icon: ArrowLeftRight },
  { id: "nuevo", label: "Nuevo movimiento", icon: FilePlus2 },
  { id: "conciliacion", label: "Conciliación", icon: Landmark },
  { id: "reportes", label: "Reportes", icon: BarChart3 },
  { id: "cuentas", label: "Cuentas bancarias", icon: Building2 },
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

/**
 * Una cifra del encabezado: rótulo arriba, valor grande abajo.
 *
 * Hecha a mano a propósito: la librería todavía no tiene una primitiva de
 * cifra, y toda aplicación con un tablero acaba escribiendo esta misma
 * composición. El valor NO va en un `CardTitle`: un encabezado cuyo texto es
 * un número ensucia el esquema de la página en un lector de pantalla.
 */
function Cifra({ rotulo, valor, detalle }: { rotulo: string; valor: string; detalle: string }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{rotulo}</CardDescription>
        <p className="font-heading text-ui-title font-semibold tabular-nums text-foreground">{valor}</p>
      </CardHeader>
      <CardContent>
        <p className="text-ui-caption text-muted-foreground">{detalle}</p>
      </CardContent>
    </Card>
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

      <div className="grid gap-md sm:grid-cols-3">
        <Cifra
          rotulo="Entradas"
          valor={formatoPesos(total(entradas))}
          detalle={`${entradas.length} movimientos recaudados`}
        />
        <Cifra
          rotulo="Salidas"
          valor={formatoPesos(total(salidas))}
          detalle={`${salidas.length} pagos ejecutados`}
        />
        <Cifra rotulo="Saldo del periodo" valor={formatoPesos(saldo)} detalle="Antes de conciliación bancaria" />
      </div>

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
        <Column<Movimiento> field="id" header="Consecutivo" sortable className="font-medium tabular-nums" />
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
          // Las cifras se alinean a la derecha y con cifras de ancho fijo: es
          // lo único que permite comparar magnitudes de un vistazo.
          className="text-right tabular-nums"
          body={(fila) => (
            <span className={fila.valor < 0 ? "text-destructive" : "text-foreground"}>
              {formatoPesos(fila.valor)}
            </span>
          )}
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
            <div className="grid gap-md sm:grid-cols-2">
              <Field
                label="Concepto"
                required
                error={errorConcepto}
                description="Cómo aparecerá en el extracto y en el arqueo."
                className="sm:col-span-2"
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

              <Field label="Observaciones" optionalLabel="Opcional" className="sm:col-span-2">
                <Input placeholder="Número de orden, remisión o autorización" />
              </Field>
            </div>

            <div className="flex flex-wrap items-center gap-xs">
              <Button type="submit">Guardar movimiento</Button>
              <Button type="button" variant="ghost" onClick={onCancelar}>
                Cancelar
              </Button>
              {enviado && !errorConcepto && !errorValor ? (
                <span className="text-ui-body-sm text-muted-foreground">
                  Listo: {formatoPesos(Number(valor))} quedaría pendiente de conciliar.
                </span>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </PageContainer>
  );
}

function VistaPendiente({ titulo, descripcion }: { titulo: string; descripcion: string }) {
  return (
    <PageContainer>
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
}

/**
 * Aplicación mínima pero completa montada solo con piezas de la librería:
 * `AppShell` + `SidebarBrand` + `AppVersion` para el armazón, `PageContainer`
 * y `PageHeader` para cada pantalla, y `DataTable` / `Field` para el
 * contenido. La navegación, el enrutamiento y los datos los pone la
 * aplicación, que es exactamente el reparto que propone la librería.
 */
export function ExampleApp({
  variant = "graphite",
  vistaInicial = "movimientos",
  defaultCollapsed = false,
}: ExampleAppProps) {
  const [vista, setVista] = React.useState<VistaId>(vistaInicial);
  const [empresa, setEmpresa] = React.useState(empresas[0].value);
  const [entorno, setEntorno] = React.useState(entornos[1].value);
  const [periodo, setPeriodo] = React.useState<string | number | null>("2026-09");

  const nombreEmpresa = empresas.find((opcion) => opcion.value === empresa)?.label ?? "";

  const contenido =
    vista === "movimientos" ? (
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

  return (
    <AppShell
      variant={variant}
      storageKey="ejemplo-tesoreria"
      defaultCollapsed={defaultCollapsed}
      brand={
        <SidebarBrand
          name={nombreEmpresa}
          groups={[
            {
              id: "empresa",
              label: "Empresa",
              value: empresa,
              options: empresas,
              onChange: setEmpresa,
            },
            {
              id: "entorno",
              label: "Entorno",
              value: entorno,
              options: entornos,
              onChange: setEntorno,
            },
          ]}
          footer={
            <>
              <MenuItem value="preferencias" icon={<Settings aria-hidden="true" />}>
                Preferencias
              </MenuItem>
              <MenuItem value="salir" icon={<LogOut aria-hidden="true" />}>
                Cerrar sesión
              </MenuItem>
            </>
          }
        />
      }
      sidebar={
        <SidebarNav>
          {ENLACES.map((enlace) => (
            <NavLink key={enlace.id} enlace={enlace} activo={vista === enlace.id} onSelect={setVista} />
          ))}
        </SidebarNav>
      }
      sidebarFooter={<AppVersion version="4.2.0" buildDate="2026-09-03" />}
      topbarStart={
        <span className="hidden text-ui-body-sm text-muted-foreground sm:inline">
          Tesorería · {nombreEmpresa}
        </span>
      }
      topbar={
        <>
          <div className="w-44">
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
            />
          </div>
          <Button size="sm" variant="outline" onClick={() => setVista("nuevo")}>
            <FilePlus2 aria-hidden="true" />
            Nuevo
          </Button>
        </>
      }
    >
      {contenido}
    </AppShell>
  );
}
