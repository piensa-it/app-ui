import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabPanel } from "@/components/ui/tabs";
import { PageHeader } from "./page-header";
import { BellIcon, PaletteIcon, ShieldIcon, UserIcon } from "@/icons";

/**
 * El catálogo de secciones conocidas: lo que hace que «Cuenta» se llame igual,
 * lleve el mismo icono y esté en el mismo sitio en las tres aplicaciones. Fijar
 * estos cuatro identificadores es justo el objetivo de la HU. Una sección
 * propia trae su `label` y, si quiere, su `icon`.
 */
const KNOWN_SECTIONS = {
  account: { label: "Cuenta", icon: UserIcon },
  appearance: { label: "Apariencia", icon: PaletteIcon },
  security: { label: "Seguridad", icon: ShieldIcon },
  notifications: { label: "Notificaciones", icon: BellIcon },
} satisfies Record<string, { label: string; icon: React.ComponentType<{ className?: string }> }>;

type KnownSection = (typeof KNOWN_SECTIONS)[keyof typeof KNOWN_SECTIONS];

/** Sentinel que no coincide con ningún `id` real: fuerza a `Tabs` a quedarse
 * sin pestaña seleccionada en vez de caer en su propio modo no controlado
 * (que elegiría la primera pestaña de la lista, deshabilitada o no). */
const NONE = "__settings-page-none__";

/** Una sección de la pantalla: una pestaña y lo que hay debajo. */
export interface SettingsSection {
  /**
   * `account`, `appearance`, `security` o `notifications` —de ellos salen el
   * rótulo y el icono, con autocompletado— o uno propio, que entonces
   * necesita `label`.
   */
  id: keyof typeof KNOWN_SECTIONS | (string & {});
  label?: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  content: React.ReactNode;
  /**
   * Guarda lo de esta sección. Con él, el armazón pinta el pie; sin él, la
   * sección no tiene pie y la aplicación pone sus botones donde quiera.
   */
  onSave?: () => void | Promise<void>;
  /** Descarta los cambios. Sin él, no se pinta «Cancelar». */
  onCancel?: () => void;
  /** Hay cambios sin guardar: habilita «Guardar». */
  dirty?: boolean;
  /** Se está guardando: el pie lo dice y no admite otro clic. */
  saving?: boolean;
  disabled?: boolean;
}

export interface SettingsPageLabels {
  /** @default "Guardar" */
  save?: string;
  /** @default "Cancelar" */
  cancel?: string;
  /** @default "Guardando…" */
  saving?: string;
}

const DEFAULT_LABELS: Required<SettingsPageLabels> = {
  save: "Guardar",
  cancel: "Cancelar",
  saving: "Guardando…",
};

export interface SettingsPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Acciones de la pantalla, a la derecha del título. */
  actions?: React.ReactNode;
  sections: SettingsSection[];
  /** Sección abierta. Sin ella, el armazón la lleva solo. */
  section?: string;
  onSectionChange?: (id: string) => void;
  /** Textos, para otro idioma o para decirlo de otra forma. */
  labels?: SettingsPageLabels;
}

/**
 * El destino estándar de «Mi perfil» y «Configuración» (#124): cabecera,
 * secciones en pestañas y el guardado de cada una siempre en el mismo sitio.
 *
 * `UserMenu` (#97) ya fijaba las entradas; lo que había al otro lado lo
 * escribía cada aplicación a su manera. Este armazón fija el sitio y el orden,
 * no el contenido: la sección de apariencia es el `AppearanceSettings` que ya
 * existe, la de cuenta es `ProfileForm`, y seguridad o notificaciones las pone
 * la aplicación —su contenido es negocio puro—.
 *
 * Va dentro del `PageContainer` de la aplicación, como cualquier otra pantalla.
 *
 * @example
 * ```tsx
 * <PageContainer>
 *   <SettingsPage title="Mi perfil" sections={[
 *     { id: "account", content: <ProfileForm value={p} onChange={setP} /> },
 *     { id: "security", content: <CambioDeClave /> },
 *   ]} />
 * </PageContainer>
 * ```
 */
export const SettingsPage = React.forwardRef<HTMLDivElement, SettingsPageProps>(
  ({ title, description, actions, sections, section, onSectionChange, labels, className, ...props }, ref) => {
    const text = { ...DEFAULT_LABELS, ...labels };

    // La primera sección habilitada. Si no hay ninguna —todas deshabilitadas,
    // o la lista está vacía— no hay nada que abrir: no se cae en
    // `sections[0]` a costa de abrir una deshabilitada.
    const first = sections.find((item) => !item.disabled)?.id;
    const [internal, setInternal] = React.useState(first);
    const candidate = section ?? internal;
    // La sección candidata puede haber desaparecido de `sections` (carga
    // diferida, permisos) o haber quedado deshabilitada: en cualquiera de los
    // dos casos no puede seguir activa y se cae en la primera habilitada.
    const active = sections.some((item) => item.id === candidate && !item.disabled) ? candidate : first;

    const change = (next: string) => {
      // Con `section`, la pestaña la lleva la aplicación: aquí solo se avisa.
      if (section === undefined) setInternal(next);
      onSectionChange?.(next);
    };

    // `onSectionChange` va por ref, no por dependencia directa del efecto de
    // abajo: la mayoría de las aplicaciones pasan un manejador en línea, cuya
    // identidad cambia en cada render. Si el efecto dependiera de la función
    // en sí, cada render dispararía el efecto de nuevo y, al llamar a
    // `onSectionChange`, el padre volvería a renderizar con otra identidad de
    // función — un bucle sin fin. La ref siempre apunta a la versión más
    // reciente sin forzar al efecto a re-ejecutarse por eso.
    const onSectionChangeRef = React.useRef(onSectionChange);
    React.useEffect(() => {
      onSectionChangeRef.current = onSectionChange;
    });

    // Cuando `active` se aleja de `candidate` (repliegue por una `sections`
    // que cambió por debajo), hay que reconciliar quien manda: en modo
    // propio, el estado interno —si no, la pestaña reaparecida saltaría sola
    // de vuelta a donde ya no puede estar—; en modo controlado, avisar a la
    // aplicación con `onSectionChange`, porque si no, se queda creyendo que
    // sigue mostrando una `section` que el armazón ya abandonó en silencio.
    React.useEffect(() => {
      if (active === undefined || active === candidate) return;
      if (section === undefined) {
        setInternal(active);
      } else {
        onSectionChangeRef.current?.(active);
      }
    }, [active, candidate, section]);

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-lg", className)} {...props}>
        <PageHeader title={title} description={description} actions={actions} />
        <Tabs value={active ?? NONE} onValueChange={change}>
          {sections.map((item) => {
            const known: KnownSection | undefined = Object.prototype.hasOwnProperty.call(KNOWN_SECTIONS, item.id)
              ? KNOWN_SECTIONS[item.id as keyof typeof KNOWN_SECTIONS]
              : undefined;
            const Icon = item.icon ?? known?.icon;
            // Una sección propia sin rótulo cae en su identificador: es feo,
            // pero se ve, y es mejor que una pestaña en blanco.
            const label = item.label ?? known?.label ?? item.id;
            return (
              <TabPanel
                key={item.id}
                value={item.id}
                disabled={item.disabled}
                header={
                  <span className="flex items-center gap-ui-2xs">
                    {Icon ? <Icon className="size-4 shrink-0" /> : null}
                    {label}
                  </span>
                }
              >
                {item.content}
                {item.onSave ? (
                  <div className="mt-ui-lg flex justify-end gap-ui-xs border-t border-border pt-ui-md">
                    {item.onCancel ? (
                      <Button
                        type="button"
                        variant="plain"
                        onClick={item.onCancel}
                        disabled={!item.dirty || item.saving || item.disabled}
                      >
                        {text.cancel}
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      onClick={() => void item.onSave?.()}
                      disabled={!item.dirty || item.saving || item.disabled}
                    >
                      {item.saving ? text.saving : text.save}
                    </Button>
                  </div>
                ) : null}
              </TabPanel>
            );
          })}
        </Tabs>
      </div>
    );
  },
);
SettingsPage.displayName = "SettingsPage";
