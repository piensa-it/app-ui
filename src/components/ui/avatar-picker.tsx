import * as React from "react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";
import { initialsFrom } from "@/lib/initials";
import type { TokenColor } from "@/lib/palette";
import { DEFAULT_AVATAR_COLORS } from "@/lib/avatar-colors";
import { Avatar } from "./avatar";
import { Button } from "./button";
import { CameraIcon, CheckIcon, CloseIcon } from "@/icons";

export interface AvatarPickerValue {
  /** URL de la foto guardada, si la hay. */
  src?: string;
  /** Color de las iniciales, en `H S% L%`. */
  color?: TokenColor;
}

export interface AvatarPickerChange {
  /** La foto recién elegida, o `null` si se quitó. Subirla y guardarla es de la aplicación. */
  file: File | null;
  color: TokenColor;
  /** Vista previa local de `file` (`blob:`), para no esperar a la subida. */
  src?: string;
}

export interface AvatarPickerLabels {
  /** @default "Subir foto" */
  upload?: string;
  /** @default "Quitar foto" */
  remove?: string;
  /** @default "Color de las iniciales" */
  colors?: string;
  /** @default "Solo se admiten imágenes." */
  notAnImage?: string;
  /** @default "La imagen no puede pasar de {max} MB." */
  tooLarge?: string;
  /** @default "Imagen, hasta {max} MB." */
  hint?: string;
}

export interface AvatarPickerProps {
  /** Nombre de la persona; de él salen las iniciales. */
  name: string;
  value?: AvatarPickerValue;
  onChange: (next: AvatarPickerChange) => void;
  /**
   * Colores ofrecidos para las iniciales. Por defecto, ocho tonos con la
   * saturación y luminosidad de las paletas incluidas, todos con contraste AA
   * para texto blanco.
   */
  colors?: TokenColor[];
  /** @default 2 */
  maxSizeMb?: number;
  labels?: AvatarPickerLabels;
  className?: string;
}

const DEFAULT_LABELS: Required<AvatarPickerLabels> = {
  upload: "Subir foto",
  remove: "Quitar foto",
  colors: "Color de las iniciales",
  notAnImage: "Solo se admiten imágenes.",
  tooLarge: "La imagen no puede pasar de {max} MB.",
  hint: "Imagen, hasta {max} MB.",
};

/**
 * Elección del avatar para la pantalla de perfil: foto, o iniciales sobre un
 * color. Es lo que cada aplicación escribía a mano —MiDivisa tenía un selector
 * de ocho colores propio y no permitía subir foto— y lo único del perfil que
 * de verdad se repite: nombre, correo y contraseña son datos de la aplicación
 * y se construyen con `Field`, `Input` y `FormGrid` (#99).
 *
 * Dos formas, una elección: subir una foto oculta los colores; quitarla los
 * devuelve. La vista previa es el mismo `Avatar` que pinta `UserMenu`, para que
 * lo que se ve al elegir sea lo que se ve arriba a la derecha.
 *
 * Controlado y sin red: la foto se entrega como `File` en `onChange`; subirla,
 * recortarla y guardarla es de la aplicación.
 *
 * @example
 * ```tsx
 * <AvatarPicker
 *   name={usuario.nombre}
 *   value={{ src: usuario.fotoUrl, color: usuario.colorAvatar }}
 *   onChange={({ file, color }) => guardar(file, color)}
 * />
 * ```
 */
export const AvatarPicker = React.forwardRef<HTMLDivElement, AvatarPickerProps>(
  ({ name, value, onChange, colors = DEFAULT_AVATAR_COLORS, maxSizeMb = 2, labels, className }, ref) => {
    const text = { ...DEFAULT_LABELS, ...labels };
    const max = String(maxSizeMb);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const inputId = React.useId();
    const errorId = React.useId();
    const [error, setError] = React.useState<string | null>(null);
    const [preview, setPreview] = React.useState<string | null>(null);

    // La URL de la vista previa se libera al cambiar de foto y al desmontar:
    // cada `createObjectURL` retiene el archivo en memoria hasta que se revoca.
    React.useEffect(() => () => {
      if (preview) URL.revokeObjectURL(preview);
    }, [preview]);

    const color = value?.color ?? colors[0] ?? DEFAULT_AVATAR_COLORS[0];
    const src = preview ?? value?.src;

    const choose = (file: File | undefined) => {
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setError(text.notAnImage);
        return;
      }
      if (file.size > maxSizeMb * 1024 * 1024) {
        setError(text.tooLarge.replace("{max}", max));
        return;
      }
      setError(null);
      const url = URL.createObjectURL(file);
      setPreview(url);
      onChange({ file, color, src: url });
    };

    const remove = () => {
      setError(null);
      setPreview(null);
      onChange({ file: null, color, src: undefined });
    };

    return (
      <div ref={ref} className={cn("flex flex-col gap-ui-md", className)}>
        <div className="flex items-center gap-ui-md">
          <Avatar
            size="xl"
            src={src}
            alt=""
            label={initialsFrom(name)}
            className={cn(!src && "text-white")}
            style={!src ? { backgroundColor: `hsl(${color})` } : undefined}
          />
          <div className="flex flex-col gap-ui-2xs">
            <div className="flex flex-wrap gap-ui-2xs">
              <Button type="button" size="sm" variant="outline" onClick={() => inputRef.current?.click()}>
                <CameraIcon aria-hidden="true" />
                {text.upload}
              </Button>
              {src ? (
                <Button type="button" size="sm" variant="plain" onClick={remove}>
                  <CloseIcon aria-hidden="true" />
                  {text.remove}
                </Button>
              ) : null}
            </div>
            <p id={errorId} className={cn("text-ui-caption", error ? "text-destructive" : "text-muted-foreground")} aria-live="polite">
              {error ?? text.hint.replace("{max}", max)}
            </p>
            <input
              ref={inputRef}
              id={inputId}
              type="file"
              accept="image/*"
              aria-label={text.upload}
              aria-describedby={errorId}
              className="sr-only"
              onChange={(event) => {
                choose(event.target.files?.[0]);
                // El mismo archivo dos veces seguidas también tiene que contar.
                event.target.value = "";
              }}
            />
          </div>
        </div>

        {/* Con foto no hay color que elegir: es o una cosa o la otra. */}
        {src ? null : (
          <div role="radiogroup" aria-label={text.colors} className="flex flex-wrap gap-ui-xs">
            {colors.map((option) => {
              const selected = option === color;
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={option}
                  onClick={() => onChange({ file: null, color: option, src: value?.src })}
                  style={{ backgroundColor: `hsl(${option})` }}
                  className={cn(
                    "relative grid size-10 place-items-center rounded-lg text-ui-caption font-semibold text-white transition-transform duration-fast",
                    focusRingOutside,
                    !selected && "hover:scale-105",
                  )}
                >
                  {initialsFrom(name)}
                  {selected ? (
                    // La elegida se marca con un visto, no con otro color: el color ya es el
                    // dato (mismo criterio que `AppearanceSettings` y `AppSwitcher`, #125).
                    // No con borde: a diferencia de esos dos, aquí el color cubre toda la
                    // casilla —no hay superficie neutra detrás— y uno de los ocho por defecto
                    // ("243 70% 52%") comparte matiz con `--primary`, así que un borde de ese
                    // color se perdería contra él. El disco blanco sí se distingue de los ocho:
                    // es la misma garantía de contraste que ya prueba el texto de las iniciales.
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-1 -right-1 grid size-4 place-items-center rounded-full bg-white text-primary shadow-sm"
                    >
                      <CheckIcon className="size-2.5" strokeWidth={3} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  },
);
AvatarPicker.displayName = "AvatarPicker";
