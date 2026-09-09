import * as React from "react";

import { PageHeader } from "@/components/layout/page-header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Motion, type MotionPreset } from "@/components/ui/motion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Reveal } from "@/components/ui/reveal";
import { Select } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Stagger } from "@/components/ui/stagger";
import { Stat, StatGroup } from "@/components/ui/stat";
import { GaugeIcon, RestoreIcon, SparklesIcon, TimerIcon, TrendingUpIcon, WalletIcon } from "@/icons";

/**
 * Laboratorio de movimiento: los cuatro mecanismos del sistema —`Stagger`,
 * `Motion`, `AnimatedNumber` y `Reveal`— sobre una página de ejemplo real,
 * con los controles dentro del lienzo y el fragmento de código que reproduce
 * lo elegido (#110).
 *
 * Existe porque cada mecanismo tenía su story aislada pero no había forma de
 * ver una página entera entrando con un `gap` de 40 ms frente a uno de 120,
 * ni de decidir si una cifra cuenta en 600 ms o en 1200, sin editar código.
 * Quien decide qué animación conviene a su aplicación lo ve aquí.
 *
 * Sin estado global ni persistencia: cada sección arranca con los valores por
 * defecto del sistema, que son los que hay que cuestionar.
 */
export function MotionLab() {
  const reduced = usePrefersReducedMotion();

  return (
    <div className="min-h-screen bg-ground p-ui-lg text-foreground">
      <div className="mx-auto flex max-w-6xl flex-col gap-ui-2xl">
        <header className="flex flex-col gap-ui-sm">
          <p className="text-ui-caption font-semibold uppercase tracking-wide text-primary">Sistema de movimiento</p>
          <h1 className="font-heading text-ui-title font-semibold tracking-tight">Laboratorio de movimiento</h1>
          <p className="max-w-2xl text-ui-body-sm text-muted-foreground">
            Cuatro mecanismos, cada uno con sus controles y el código que los reproduce. Cambia un valor, pulsa
            «Repetir» y decide qué le conviene a tu aplicación viéndolo, no leyéndolo.
          </p>
          {reduced ? (
            <Alert icon={<GaugeIcon className="size-4" />} className="max-w-2xl">
              <AlertTitle>Tu sistema pide menos movimiento</AlertTitle>
              <AlertDescription>
                Los controles siguen aquí, pero nada se anima: es exactamente lo que ve una persona con esa
                preferencia activa. Todos los mecanismos la respetan sin configuración.
              </AlertDescription>
            </Alert>
          ) : null}
        </header>

        <EntradaDePagina />
        <Enfasis />
        <Cifras />
        <AparicionAlDesplazar />
      </div>
    </div>
  );
}

/* ── 1. Entrada de página ──────────────────────────────────────────────── */

function EntradaDePagina() {
  const [gap, setGap] = React.useState(60);
  const [replay, setReplay] = React.useState(0);

  return (
    <Seccion
      titulo="Entrada de página"
      descripcion="`PageContainer` escalona la entrada de sus bloques de primer nivel con `Stagger`. El retraso entre uno y el siguiente es lo único que hay que elegir."
      codigo={`<PageContainer staggerGap={${gap}}>\n  <PageHeader … />\n  <StatGroup>…</StatGroup>\n  <Card>…</Card>\n</PageContainer>`}
      controles={
        <>
          <Control etiqueta="Retraso entre bloques" valor={`${gap} ms`}>
            <Slider aria-label={["Retraso entre bloques"]} min={0} max={200} step={10} value={[gap]} onChange={([v]) => setGap(v)} />
          </Control>
          <Repetir onClick={() => setReplay((k) => k + 1)} />
        </>
      }
    >
      <Stagger key={replay} gap={gap} className="space-y-stack">
        <PageHeader
          as="h3"
          title="Movimientos de caja"
          description="Septiembre de 2026 · cuenta corriente 4218."
          actions={<Button size="sm">Registrar movimiento</Button>}
        />
        <StatGroup label="Resumen del periodo" columns={3}>
          <Stat label="Entradas" value="$ 48.250.000" description="31 movimientos" icon={<WalletIcon />} />
          <Stat label="Salidas" value="$ 21.980.000" description="12 pagos" icon={<TrendingUpIcon />} />
          <Stat label="Saldo" value="$ 26.270.000" description="Antes de conciliar" trend={{ value: "+8,2 %", direction: "up" }} />
        </StatGroup>
        <Card>
          <CardHeader>
            <CardTitle className="text-ui-body">Últimos movimientos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-border text-ui-body-sm">
              {MOVIMIENTOS.map((m) => (
                <li key={m.concepto} className="flex items-center justify-between py-ui-xs">
                  <span>{m.concepto}</span>
                  <span className="tabular-nums text-muted-foreground">{m.valor}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </Stagger>
    </Seccion>
  );
}

const MOVIMIENTOS = [
  { concepto: "Recaudo arriendos", valor: "$ 12.400.000" },
  { concepto: "Pago nómina", valor: "−$ 8.900.000" },
  { concepto: "Servicios públicos", valor: "−$ 1.240.000" },
  { concepto: "Consignación cliente", valor: "$ 3.150.000" },
];

/* ── 2. Énfasis ────────────────────────────────────────────────────────── */

type Duracion = "default" | "fast" | "normal" | "slow";
type Repeticion = "0" | "1" | "2" | "infinite";
type Objetivo = "icono" | "cifra" | "tarjeta";

const PRESETS: Array<{ id: MotionPreset; label: string; description: string }> = [
  { id: "enter", label: "Entrar", description: "Revela contenido nuevo." },
  { id: "float", label: "Flotar", description: "Movimiento ambiental continuo." },
  { id: "point", label: "Señalar", description: "Orienta hacia una acción." },
  { id: "celebrate", label: "Celebrar", description: "Confirma un logro importante." },
  { id: "warn", label: "Advertir", description: "Pide atención sin alarmar." },
];

function Enfasis() {
  const [preset, setPreset] = React.useState<MotionPreset>("celebrate");
  const [duracion, setDuracion] = React.useState<Duracion>("default");
  const [repeticion, setRepeticion] = React.useState<Repeticion>("0");
  const [objetivo, setObjetivo] = React.useState<Objetivo>("icono");
  const [replay, setReplay] = React.useState(0);

  const props = [
    `preset="${preset}"`,
    duracion !== "default" ? `duration="${duracion}"` : null,
    repeticion !== "0" ? `repeat=${repeticion === "infinite" ? '"infinite"' : `{${repeticion}}`}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Seccion
      titulo="Énfasis"
      descripcion="`Motion` aplica uno de cinco verbos a lo que envuelve. La duración y las repeticiones tienen un valor por defecto por preset; aquí se cuestionan."
      codigo={`<Motion ${props}>\n  …\n</Motion>`}
      controles={
        <>
          <Control etiqueta="Preset">
            <RadioGroup value={preset} onChange={(v) => setPreset(v as MotionPreset)}>
              {PRESETS.map((p) => (
                <RadioGroupItem key={p.id} value={p.id} label={p.label} description={p.description} size="sm" />
              ))}
            </RadioGroup>
          </Control>
          <Control etiqueta="Duración">
            <Select
              aria-label="Duración"
              size="sm"
              value={duracion}
              onChange={(v) => setDuracion((v as Duracion) ?? "default")}
              options={[
                { value: "default", label: "Por defecto del preset" },
                { value: "fast", label: "Rápida · 320 ms" },
                { value: "normal", label: "Normal · 600 ms" },
                { value: "slow", label: "Lenta · 1200 ms" },
              ]}
            />
          </Control>
          <Control etiqueta="Repeticiones">
            <Select
              aria-label="Repeticiones"
              size="sm"
              value={repeticion}
              onChange={(v) => setRepeticion((v as Repeticion) ?? "0")}
              options={[
                { value: "0", label: "Una vez" },
                { value: "1", label: "Dos veces" },
                { value: "2", label: "Tres veces" },
                { value: "infinite", label: "Sin parar" },
              ]}
            />
          </Control>
          <Control etiqueta="Sobre qué">
            <RadioGroup value={objetivo} onChange={(v) => setObjetivo(v as Objetivo)} className="grid-cols-3">
              <RadioGroupItem value="icono" label="Icono" size="sm" />
              <RadioGroupItem value="cifra" label="Cifra" size="sm" />
              <RadioGroupItem value="tarjeta" label="Tarjeta" size="sm" />
            </RadioGroup>
          </Control>
          <Repetir onClick={() => setReplay((k) => k + 1)} />
        </>
      }
    >
      <div className="grid min-h-64 place-items-center">
        <Motion
          key={`${replay}-${preset}-${duracion}-${repeticion}-${objetivo}`}
          preset={preset}
          duration={duracion === "default" ? undefined : duracion}
          repeat={repeticion === "infinite" ? "infinite" : Number(repeticion)}
        >
          {objetivo === "icono" ? (
            <span className="grid size-20 place-items-center rounded-full bg-subtle text-primary">
              <SparklesIcon aria-hidden="true" className="size-9" strokeWidth={1.8} />
            </span>
          ) : objetivo === "cifra" ? (
            <span className="text-ui-display font-semibold tabular-nums tracking-tight">$ 3.042.040</span>
          ) : (
            <Card className="w-64">
              <CardHeader>
                <CardTitle className="text-ui-body">Cierre de caja</CardTitle>
                <CardDescription>Listo para conciliar.</CardDescription>
              </CardHeader>
            </Card>
          )}
        </Motion>
      </div>
    </Seccion>
  );
}

/* ── 3. Cifras ─────────────────────────────────────────────────────────── */

const pesos = (v: number) => `$ ${Math.round(v).toLocaleString("es-CO")}`;

function Cifras() {
  const [duracion, setDuracion] = React.useState(600);
  const [valor, setValor] = React.useState(3_042_040);

  return (
    <Seccion
      titulo="Cifras"
      descripcion="`AnimatedNumber` cuenta hasta su valor al montar y en cada cambio. Un tablero de seis cifras contando a la vez pide una duración corta; una sola cifra protagonista, una más larga."
      codigo={`<AnimatedNumber\n  value={${valor}}\n  duration={${duracion}}\n  format={pesos}\n/>`}
      controles={
        <>
          <Control etiqueta="Duración del conteo" valor={`${duracion} ms`}>
            <Slider aria-label={["Duración del conteo"]} min={0} max={2000} step={100} value={[duracion]} onChange={([v]) => setDuracion(v)} />
          </Control>
          <Button variant="outline" size="sm" onClick={() => setValor(nuevoValor(valor))}>
            <RestoreIcon aria-hidden="true" />
            Nuevo valor
          </Button>
        </>
      }
    >
      <StatGroup label="Cifras animadas" columns={2}>
        <Stat label="Saldo del periodo" value={<AnimatedNumber value={valor} duration={duracion} format={pesos} />} description="Cuenta desde el valor anterior" icon={<TimerIcon />} />
        <Stat
          label="Cartera vencida"
          tone="warning"
          value={<AnimatedNumber value={Math.round(valor * 0.18)} duration={duracion} format={pesos} />}
          description="Vence esta semana"
        />
      </StatGroup>
    </Seccion>
  );
}

/** Un valor distinto cada vez, del mismo orden de magnitud, para que se vea contar. */
function nuevoValor(actual: number) {
  const salto = 400_000 + Math.floor(Math.random() * 2_600_000);
  return actual > 4_000_000 ? actual - salto : actual + salto;
}

/* ── 4. Aparición al desplazar ─────────────────────────────────────────── */

function AparicionAlDesplazar() {
  const [once, setOnce] = React.useState<"true" | "false">("true");
  const [replay, setReplay] = React.useState(0);

  return (
    <Seccion
      titulo="Aparición al desplazar"
      descripcion="`Reveal` muestra su contenido cuando entra en el viewport, para secciones bajas de páginas largas, en vez de animar todo al montar. Desplaza el panel."
      codigo={`<Reveal${once === "false" ? " once={false}" : ""}>\n  <Card>…</Card>\n</Reveal>`}
      controles={
        <>
          <Control etiqueta="Cuántas veces">
            <RadioGroup value={once} onChange={(v) => setOnce(v as "true" | "false")}>
              <RadioGroupItem value="true" label="Solo la primera vez" description="Lo normal en una página." size="sm" />
              <RadioGroupItem value="false" label="Cada vez que entra" description="Para comparar el efecto." size="sm" />
            </RadioGroup>
          </Control>
          <Repetir onClick={() => setReplay((k) => k + 1)} />
        </>
      }
    >
      <div key={replay} className="h-80 overflow-y-auto rounded-lg border border-surface-border bg-ground p-ui-md [scrollbar-width:thin]">
        <p className="mb-ui-md text-ui-body-sm text-muted-foreground">Desplázate hacia abajo: cada sección aparece al entrar en el panel.</p>
        {SECCIONES.map((titulo, i) => (
          <div key={titulo}>
            {i > 0 ? <div className="h-56" aria-hidden="true" /> : null}
            <Reveal once={once === "true"}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-ui-body">{titulo}</CardTitle>
                  <CardDescription>
                    Sección {i + 1} de {SECCIONES.length}.
                  </CardDescription>
                </CardHeader>
              </Card>
            </Reveal>
          </div>
        ))}
      </div>
    </Seccion>
  );
}

const SECCIONES = ["Resumen", "Detalle por cuenta", "Actividad reciente", "Notas"];

/* ── Piezas del laboratorio ────────────────────────────────────────────── */

interface SeccionProps {
  titulo: string;
  descripcion: string;
  controles: React.ReactNode;
  codigo: string;
  children: React.ReactNode;
}

function Seccion({ titulo, descripcion, controles, codigo, children }: SeccionProps) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="grid gap-ui-lg lg:grid-cols-[20rem_minmax(0,1fr)]">
      <div className="flex flex-col gap-ui-md">
        <div>
          <h2 id={id} className="font-heading text-ui-title-sm font-semibold">
            {titulo}
          </h2>
          <p className="mt-ui-2xs text-ui-body-sm text-muted-foreground">{descripcion}</p>
        </div>
        <Card>
          <CardContent className="flex flex-col gap-ui-md pt-inset">{controles}</CardContent>
        </Card>
        <pre className="overflow-x-auto rounded-lg border border-surface-border bg-surface p-ui-sm text-ui-caption leading-relaxed text-foreground">
          <code>{codigo}</code>
        </pre>
      </div>
      <div className="min-w-0 rounded-lg border border-surface-border bg-surface p-inset shadow-surface">{children}</div>
    </section>
  );
}

function Control({ etiqueta, valor, children }: { etiqueta: string; valor?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-field">
      <div className="flex items-baseline justify-between">
        <span className="text-ui-body-sm font-medium">{etiqueta}</span>
        {valor ? <span className="text-ui-caption tabular-nums text-muted-foreground">{valor}</span> : null}
      </div>
      {children}
    </div>
  );
}

function Repetir({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="outline" size="sm" onClick={onClick}>
      <RestoreIcon aria-hidden="true" />
      Repetir
    </Button>
  );
}

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

function usePrefersReducedMotion() {
  // Se lee al montar y no en un efecto: así el aviso está desde el primer
  // pintado, sin un render intermedio sin él.
  const [reduced, setReduced] = React.useState(
    () => typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia(REDUCED_MOTION).matches,
  );
  React.useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
    const query = window.matchMedia(REDUCED_MOTION);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}
