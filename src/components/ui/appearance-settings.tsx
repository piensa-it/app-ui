import * as React from "react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { createPalette, type TokenColor } from "@/lib/palette";
import type { UiDensity } from "@/components/providers/ui-provider";
import { CheckIcon } from "@/icons";
import { BUNDLED_LOOKS, BUNDLED_PALETTES, FONT_PRESETS } from "@/lib/appearance-presets";

export type AppearanceTheme = "light" | "dark" | "system";

export interface AppearanceValue {
  theme: AppearanceTheme;
  /** Identificador de una paleta incluida (`indigo`, `ocean`…) o de una propia pasada en `palettes`. */
  palette: string;
  /** `geist`, `inter`, `dm-sans` o `system`. */
  font: string;
  density: UiDensity;
  /**
   * `classic`, `soft`, `deep` o `flat` (`data-ui-look`). Opcional: un panel
   * que no ofrece la sección `look` no tiene por qué saber de estilos.
   */
  look?: string;
}

/** Una paleta propia: la marca, cuando no es ninguna de las seis incluidas. */
export interface AppearancePalette {
  id: string;
  label: string;
  /** Color de marca en `H S% L%`. Los otros seis tokens se derivan con `createPalette`. */
  primary: TokenColor;
}

export type AppearanceSection = "theme" | "palette" | "font" | "density" | "look";

export interface AppearanceLabels {
  theme?: string;
  light?: string;
  dark?: string;
  system?: string;
  palette?: string;
  font?: string;
  density?: string;
  compact?: string;
  default?: string;
  comfortable?: string;
  look?: string;
  classic?: string;
  soft?: string;
  deep?: string;
  flat?: string;
}

export interface AppearanceSettingsProps {
  value: AppearanceValue;
  /** Recibe el objeto completo con el cambio aplicado. El panel no persiste ni toca el DOM. */
  onChange: (next: AppearanceValue) => void;
  /**
   * Paletas ofrecidas. Por defecto, las seis incluidas. Admite identificadores
   * de las incluidas y paletas propias (`{ id, label, primary }`).
   */
  palettes?: (string | AppearancePalette)[];
  /**
   * Qué secciones se ofrecen. `look` (el estilo visual, `data-ui-look`) no
   * entra por defecto: un panel ya desplegado no gana una sección nueva al
   * actualizar; se pide a propósito.
   * @default ["theme", "palette", "font", "density"]
   */
  sections?: AppearanceSection[];
  labels?: AppearanceLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<AppearanceLabels> = {
  theme: "Tema",
  light: "Claro",
  dark: "Oscuro",
  system: "Como el sistema",
  palette: "Color",
  font: "Tipografía",
  density: "Densidad",
  compact: "Compacta",
  default: "Normal",
  comfortable: "Cómoda",
  look: "Estilo",
  classic: "Clásico",
  soft: "Suave",
  deep: "Profundo",
  flat: "Plano",
};

const ALL_SECTIONS: AppearanceSection[] = ["theme", "palette", "font", "density"];

/**
 * El panel de apariencia estándar: tema, paleta, tipografía y densidad —y,
 * si se pide, el estilo visual—, cada opción con su vista previa.
 *
 * Lo que una aplicación puede elegir del sistema de diseño ya estaba definido
 * —`.dark`, `data-ui-palette`, `data-ui-font`, `<UiProvider density>`—, pero
 * el panel donde la persona lo elige lo construía cada aplicación a mano, y
 * cada una decidía por su cuenta qué ofrecer y cómo se ve (#98). La librería
 * es la dueña de esos conmutadores; le toca traer el panel.
 *
 * Controlado y sin persistencia: la aplicación guarda la elección donde quiera
 * y aplica los atributos en su raíz. Cada opción se ve como lo que es —el tema
 * con una miniatura, la paleta con su color, la tipografía escrita en ella, la
 * densidad con tres filas— porque elegir un color leyendo su nombre es lo que
 * no funciona. Solo se ofrece lo tematizable: no hay control para `--accent`
 * ni para nada fuera de los siete tokens de identidad (#76).
 *
 * @example
 * ```tsx
 * <AppearanceSettings
 *   value={preferencias}
 *   onChange={guardarPreferencias}
 *   palettes={["indigo", "ocean", { id: "marca", label: "Marca", primary: "158 64% 32%" }]}
 * />
 * ```
 */
export const AppearanceSettings = React.forwardRef<HTMLDivElement, AppearanceSettingsProps>(
  ({ value, onChange, palettes = BUNDLED_PALETTES.map((p) => p.id), sections = ALL_SECTIONS, labels, className }, ref) => {
    const text = { ...DEFAULT_LABELS, ...labels };
    const set = <K extends keyof AppearanceValue>(key: K, next: AppearanceValue[K]) => onChange({ ...value, [key]: next });

    const paletteOptions = palettes.map((p) =>
      typeof p === "string"
        ? { id: p, label: BUNDLED_PALETTES.find((b) => b.id === p)?.label ?? p, custom: null }
        : { id: p.id, label: p.label, custom: createPalette({ primary: p.primary }) },
    );

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-lg", className)}>
        {sections.includes("theme") ? (
          <Section title={text.theme}>
            {(["light", "dark", "system"] as const).map((theme) => (
              <Option key={theme} label={text[theme]} selected={value.theme === theme} onSelect={() => set("theme", theme)}>
                <ThemeThumbnail theme={theme} />
              </Option>
            ))}
          </Section>
        ) : null}

        {sections.includes("palette") ? (
          <Section title={text.palette}>
            {paletteOptions.map((p) => (
              <Option key={p.id} label={p.label} selected={value.palette === p.id} onSelect={() => set("palette", p.id)}>
                {/* La muestra lleva la paleta puesta: es el color real, no una copia. */}
                <span
                  data-ui-palette={p.custom ? undefined : p.id}
                  style={(p.custom ?? undefined) as React.CSSProperties | undefined}
                  className="flex h-10 w-full items-center gap-ui-2xs rounded-md bg-subtle p-ui-2xs"
                >
                  <span className="size-6 rounded-full bg-primary" />
                  <span className="h-2 flex-1 rounded-full bg-primary/40" />
                </span>
              </Option>
            ))}
          </Section>
        ) : null}

        {sections.includes("font") ? (
          <Section title={text.font}>
            {FONT_PRESETS.map((font) => (
              <Option key={font.id} label={font.label} selected={value.font === font.id} onSelect={() => set("font", font.id)}>
                {/* El nombre, escrito en la propia tipografía. */}
                <span data-ui-font={font.id} className="flex h-10 items-center font-sans text-ui-title-sm font-semibold text-foreground">
                  Aa
                </span>
              </Option>
            ))}
          </Section>
        ) : null}

        {sections.includes("density") ? (
          <Section title={text.density}>
            {(["compact", "default", "comfortable"] as const).map((density) => (
              <Option key={density} label={text[density]} selected={value.density === density} onSelect={() => set("density", density)}>
                <DensityThumbnail density={density} />
              </Option>
            ))}
          </Section>
        ) : null}

        {sections.includes("look") ? (
          <Section title={text.look}>
            {BUNDLED_LOOKS.map((look) => (
              <Option
                key={look.id}
                label={text[look.id as "classic" | "soft" | "deep" | "flat"] ?? look.label}
                selected={(value.look ?? "classic") === look.id}
                onSelect={() => set("look", look.id)}
              >
                <LookThumbnail look={look.id} />
              </Option>
            ))}
          </Section>
        ) : null}
      </div>
    );
  },
);
AppearanceSettings.displayName = "AppearanceSettings";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const id = React.useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-ui-xs">
      <h3 id={id} className="text-ui-body-sm font-medium text-foreground">
        {title}
      </h3>
      <div role="radiogroup" aria-labelledby={id} className="grid grid-cols-2 gap-ui-sm sm:grid-cols-3 lg:grid-cols-4">
        {children}
      </div>
    </section>
  );
}

interface OptionProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
  children: React.ReactNode;
}

function Option({ label, selected, onSelect, children }: OptionProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex flex-col gap-ui-2xs rounded-lg border p-ui-xs text-left transition-colors duration-fast",
        focusRingOutside,
        // La elegida se marca con borde y visto, no con color: el color puede
        // ser justamente lo que se está eligiendo.
        selected ? "border-primary bg-subtle" : "border-surface-border bg-surface hover:bg-surface-hover",
      )}
    >
      {children}
      <span className="flex items-center gap-ui-2xs text-ui-caption text-foreground">
        <span className="truncate">{label}</span>
        {selected ? <CheckIcon aria-hidden="true" className="size-3.5 shrink-0 text-primary" /> : null}
      </span>
    </button>
  );
}

/** Miniatura de una página: fondo, barra y una tarjeta, en el tema indicado. */
function ThemeThumbnail({ theme }: { theme: AppearanceTheme }) {
  const half = (dark: boolean) => (
    <span className={cn("flex h-full flex-1 flex-col gap-px bg-ground p-1", dark && "dark")}>
      <span className="h-1.5 w-full rounded-sm bg-surface" />
      <span className="mt-auto h-4 w-3/4 rounded-sm border border-raised-border bg-raised" />
    </span>
  );
  return (
    <span className="flex h-10 w-full overflow-hidden rounded-md border border-border">
      {theme === "light" ? half(false) : theme === "dark" ? half(true) : (
        <>
          {half(false)}
          {half(true)}
        </>
      )}
    </span>
  );
}

/**
 * Miniatura de una página con el estilo puesto: menú con su activo, página,
 * y una tarjeta con el borde, la sombra y el radio de ese estilo. Lleva
 * `data-ui-look`, así que es el estilo real, no una copia.
 */
function LookThumbnail({ look }: { look: string }) {
  return (
    <span
      data-ui-look={look === "classic" ? undefined : look}
      className="flex h-10 w-full overflow-hidden rounded-md border border-border bg-ground"
    >
      <span data-sidebar="graphite" className="flex w-1/4 flex-col gap-px bg-sidebar p-1">
        <span className="h-1.5 w-full rounded-sm bg-sidebar-active inset-shadow-[var(--sidebar-active-bar)_0_0_0_hsl(var(--sidebar-ring))]" />
        <span className="h-1.5 w-full rounded-sm bg-sidebar-hover" />
      </span>
      <span className="flex flex-1 flex-col justify-end p-1">
        <span className="h-5 w-3/4 rounded-[calc(var(--radius)/2)] border border-raised-border bg-raised shadow-sm" />
      </span>
    </span>
  );
}

/** Tres filas con la altura de control de cada densidad. */
function DensityThumbnail({ density }: { density: UiDensity }) {
  return (
    <span data-ui-density={density} className="flex h-10 w-full flex-col justify-center gap-px overflow-hidden rounded-md bg-surface px-1">
      {[0, 1, 2].map((i) => (
        <span key={i} className="block w-full rounded-sm bg-muted" style={{ height: "calc(var(--control-compact) / 3)" }} />
      ))}
    </span>
  );
}
