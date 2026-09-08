import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { confirmAlert } from "@/components/ui/alert-dialog";
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
   * Guarda lo de esta sección. Con él, el armazón pinta el pie *fuera* de
   * `content`; sin él, la sección no tiene pie y la aplicación pone sus
   * botones donde quiera.
   *
   * Si la aplicación envuelve `content` en un `<form>`, este pie queda fuera
   * de ese formulario: pulsar Enter en un campo no llama a `onSave` — hace
   * falta que la aplicación cablee su propio `onSubmit`.
   *
   * El armazón no espera la promesa que puede devolver: no se mete a poner
   * `saving` por su cuenta ni a capturar el resultado. `saving` es cosa de
   * la aplicación (ver esa prop). Cualquier error que produzca —la promesa
   * que rechaza o una excepción síncrona antes de devolverla— se absorbe en
   * silencio, para no filtrar un `unhandledrejection` (o reventar el árbol
   * de React) sin contexto de qué sección falló; no se reintenta ni se
   * reporta.
   */
  onSave?: () => void | Promise<void>;
  /** Descarta los cambios. Sin él, no se pinta «Cancelar». */
  onCancel?: () => void;
  /** Hay cambios sin guardar. Sin él, «Guardar» nunca se habilita. */
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
  /** @default "Hay cambios sin guardar" */
  unsavedTitle?: string;
  /** @default "Si sales de esta sección se perderán." */
  unsavedDescription?: string;
  /** @default "Descartar" */
  unsavedConfirmLabel?: string;
  /** @default "Seguir aquí" */
  unsavedCancelLabel?: string;
}

const DEFAULT_LABELS: Required<SettingsPageLabels> = {
  save: "Guardar",
  cancel: "Cancelar",
  saving: "Guardando…",
  unsavedTitle: "Hay cambios sin guardar",
  unsavedDescription: "Si sales de esta sección se perderán.",
  unsavedConfirmLabel: "Descartar",
  unsavedCancelLabel: "Seguir aquí",
};

interface SectionFooterProps {
  onSave: () => void | Promise<void>;
  onCancel?: () => void;
  dirty?: boolean;
  saving?: boolean;
  text: Required<SettingsPageLabels>;
}

// `disabledStyles` (`src/lib/recipes/interactive.ts`) solo sabe de
// `disabled:`; con `aria-disabled` el botón se pintaría al 100% de opacidad
// y seguiría iluminándose al pasar el mouse. Este es el mismo tratamiento,
// escrito a mano y local al pie — la recipe compartida es de otra tarea,
// porque también la usa `app-switcher.tsx`.
const ARIA_DISABLED_LOOK = "aria-disabled:pointer-events-none aria-disabled:opacity-50 aria-disabled:cursor-default";

/**
 * El pie de guardado de una sección: «Guardar» siempre, «Cancelar» si la
 * sección trae `onCancel`. No se exporta — nada fuera de `SettingsPage` lo
 * necesita.
 *
 * Mientras `saving`, los dos botones siguen enfocables (`aria-disabled`, no
 * `disabled`): con `disabled` nativo, el navegador le quita el foco al
 * pulsarlo —quien navega con teclado pierde el punto de lectura, y el
 * lector de pantalla no anuncia el cambio de nombre a «Guardando…»—. El
 * clic en ese estado se descarta en el manejador, no en el atributo; el
 * atractivo visual de "deshabilitado" lo pone `ARIA_DISABLED_LOOK`, porque
 * `aria-disabled` no dispara `disabled:` por sí solo.
 */
function SectionFooter({ onSave, onCancel, dirty, saving, text }: SectionFooterProps) {
  const handleSave = () => {
    if (saving) return;
    try {
      // Cualquier error se absorbe a propósito (ver el JSDoc de `onSave` en
      // `SettingsSection`): sin esto, un `onSave` que rechaza llega como
      // `unhandledrejection` a la aplicación consumidora, sin contexto de
      // qué sección falló; y uno que lanza de forma síncrona (antes de
      // devolver la promesa) reventaría el manejador de clic de React.
      void Promise.resolve(onSave()).catch(() => {});
    } catch {
      // Ídem, para la excepción síncrona.
    }
  };

  const handleCancel = () => {
    if (saving) return;
    onCancel?.();
  };

  return (
    <div className="mt-ui-lg flex flex-col-reverse gap-ui-xs border-t border-border pt-ui-md sm:flex-row sm:justify-end">
      {onCancel ? (
        <Button
          type="button"
          variant="plain"
          onClick={handleCancel}
          disabled={!dirty && !saving}
          aria-disabled={saving || undefined}
          className={ARIA_DISABLED_LOOK}
        >
          {text.cancel}
        </Button>
      ) : null}
      <Button
        type="button"
        onClick={handleSave}
        disabled={!dirty && !saving}
        aria-disabled={saving || undefined}
        aria-busy={saving || undefined}
        className={ARIA_DISABLED_LOOK}
      >
        {saving ? text.saving : text.save}
      </Button>
    </div>
  );
}

export interface SettingsPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Acciones de la pantalla, a la derecha del título. */
  actions?: React.ReactNode;
  sections: SettingsSection[];
  /** Sección abierta. Sin ella, el armazón la lleva solo. */
  section?: string;
  onSectionChange?: (id: string) => void;
  /**
   * Pide confirmación al salir de una sección con cambios sin guardar.
   * Reutiliza `confirmAlert` —hace falta `UiProvider` montado— y no monta una
   * capa modal propia.
   *
   * Solo cubre el cambio de pestaña dentro de este armazón: si la persona
   * navega fuera de la pantalla (otra ruta, cerrar la pestaña del navegador),
   * la librería no se entera y no hay aviso. Esa protección, si hace falta,
   * es cosa de la aplicación (p. ej. un `beforeunload` o un guard de router).
   *
   * El aviso es una foto del momento del clic: si la sección deja de estar
   * `dirty` mientras el diálogo sigue abierto —un autoguardado que termina, o
   * la aplicación cambia `guardUnsaved` a `false`— el texto («se perderán»)
   * queda desactualizado, aunque confirmar sigue haciendo lo correcto
   * (cambiar de sección) porque no hay nada más que perder. `confirmAlert` es
   * imperativo y no admite cerrarse desde fuera una vez abierto.
   * @default true
   */
  guardUnsaved?: boolean;
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
  (
    { title, description, actions, sections, section, onSectionChange, guardUnsaved = true, labels, className, ...props },
    ref,
  ) => {
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

    // `onSectionChange` va por ref, no por dependencia directa del efecto de
    // abajo: la mayoría de las aplicaciones pasan un manejador en línea, cuya
    // identidad cambia en cada render. Si el efecto dependiera de la función
    // en sí, cada render dispararía el efecto de nuevo y, al llamar a
    // `onSectionChange`, el padre volvería a renderizar con otra identidad de
    // función — un bucle sin fin. La ref siempre apunta a la versión más
    // reciente sin forzar al efecto a re-ejecutarse por eso.
    //
    // La misma ref resuelve otro problema: entre abrir el aviso de cambios
    // sin guardar y que la persona confirme pasa tiempo real, así que
    // `apply` no puede capturar el `onSectionChange` del render del clic —
    // sería el de ese momento, no el más reciente si el padre volvió a
    // renderizar mientras tanto.
    const onSectionChangeRef = React.useRef(onSectionChange);
    React.useEffect(() => {
      onSectionChangeRef.current = onSectionChange;
    });

    const rootRef = React.useRef<HTMLDivElement>(null);
    const setRootRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        rootRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    const apply = (next: string) => {
      // Con `section`, la pestaña la lleva la aplicación: aquí solo se avisa.
      if (section === undefined) setInternal(next);
      onSectionChangeRef.current?.(next);
    };

    // La sección que se abandona es la que está activa *antes* del cambio:
    // solo su `dirty` importa. Que otra sección distinta también tenga
    // cambios sin guardar no la hace preguntar por ella —no es la que se
    // está dejando de ver— y es lo esperable: solo hay una sección visible
    // (e interactuable) a la vez.
    const change = (next: string) => {
      // Red de seguridad, no camino real: `Tabs` recibe `value={active ??
      // NONE}` y Ark no dispara `onValueChange` al clicar la pestaña ya
      // seleccionada, así que hoy `next` nunca llega valiendo `active`. Se
      // conserva por si `tabs.tsx` cambia ese comportamiento algún día —sin
      // esto, un clic en la pestaña activa abriría el aviso sin motivo.
      if (next === active) return;
      const leaving = sections.find((item) => item.id === active);
      // Una sección `dirty` sin `onSave` no pinta pie, pero de todos modos
      // avisa: `dirty` significa "hay cambios sin guardar" con independencia
      // de quién los guarde (la aplicación puede tener su propio botón de
      // guardado fuera del armazón), así que el aviso sigue teniendo sentido.
      if (!guardUnsaved || !leaving?.dirty) {
        apply(next);
        return;
      }
      confirmAlert({
        title: text.unsavedTitle,
        description: text.unsavedDescription,
        confirmLabel: text.unsavedConfirmLabel,
        cancelLabel: text.unsavedCancelLabel,
        variant: "destructive",
        onConfirm: () => apply(next),
        // Al cancelar, el foco vuelve a la pestaña que sigue activa. Sin
        // esto, se queda en la pestaña clicada —la que se decidió no
        // abrir—, con `aria-selected="false"`: un anillo de foco mintiendo
        // sobre cuál es la sección activa, y pulsar Enter ahí reabre el
        // aviso en un bucle para quien navega con teclado.
        onCancel: () => {
          // El foco tiene que esperar a que Ark termine de restaurarlo a la
          // pestaña que abrió el diálogo (`restoreFocus`, activado por
          // defecto en `Dialog`): si se llama de forma síncrona aquí, esa
          // restauración —posterior, al desactivar el focus trap— lo
          // pisa. Un macrotask corre después de esa restauración.
          setTimeout(() => {
            rootRef.current?.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
          }, 0);
        },
      });
    };

    // Cuando `active` se aleja de `candidate` (repliegue por una `sections`
    // que cambió por debajo), hay que reconciliar quien manda. En modo
    // propio, es ajustar estado a partir de una prop que cambió: se hace
    // durante el render, no en un efecto — es el patrón que documenta React
    // para esto, y ahorra un commit (React lo detecta y descarta el render a
    // medias antes de pintar, en vez de pintar y corregir después). Si no,
    // la pestaña reaparecida saltaría sola de vuelta a donde ya no puede
    // estar.
    if (section === undefined && active !== undefined && active !== candidate) {
      setInternal(active);
    }

    // En modo controlado no hay ningún estado propio que ajustar: es avisar
    // a la aplicación con `onSectionChange`, que sí es un efecto colateral
    // de verdad —llama al `setState` de otro componente— y por eso no puede
    // salir de aquí. Si no se avisara, la aplicación se quedaría creyendo
    // que sigue mostrando una `section` que el armazón ya abandonó en
    // silencio.
    React.useEffect(() => {
      if (active === undefined || active === candidate) return;
      if (section !== undefined) onSectionChangeRef.current?.(active);
    }, [active, candidate, section]);

    return (
      <div ref={setRootRef} className={cn("flex flex-col gap-ui-lg", className)} {...props}>
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
                  <SectionFooter
                    onSave={item.onSave}
                    onCancel={item.onCancel}
                    dirty={item.dirty}
                    saving={item.saving}
                    text={text}
                  />
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
