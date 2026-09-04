/**
 * Construcción de una paleta de marca.
 *
 * La librería trae seis paletas listas (`data-ui-palette`), pero una marca
 * puede no ser ninguna de las seis. Esto es lo que hace falta para declarar la
 * propia sin equivocarse.
 *
 * Y equivocarse es fácil, porque los tokens de color no son todos de la misma
 * clase: `--primary` es identidad y `--accent` es el gris de interacción —el
 * fondo de los `hover`—. Se leen igual y no lo son. Una aplicación del grupo
 * escribió su selector de color moviendo `--accent`, y con el tema verde todos
 * los hover salían en verde saturado con el texto gris de dentro ilegible;
 * `--ring`, en cambio, no lo movía, así que el anillo de foco se quedaba en el
 * azul de fábrica. Ver #76.
 *
 * Por eso esta firma solo admite los tokens que un tema puede mover: los que no
 * se tocan no están, y no hay forma de pasarlos por error.
 */

/**
 * Color en el formato de los tokens: `H S% L%`, sin `hsl()`.
 *
 * Los tokens guardan los tres canales sueltos para que una utilidad pueda
 * componer `hsl(var(--primary) / 0.1)` sin repetir el color.
 *
 * @example "243 75% 59%"
 */
export type TokenColor = string;

export interface BrandColors {
  /** Color de marca. Es el único obligatorio: el resto se deriva de él. */
  primary: TokenColor;
  /** Texto y iconos sobre `primary`. Por defecto, blanco o el propio tono muy oscuro, el que contraste. */
  primaryForeground?: TokenColor;
  /**
   * Anillo de foco. Por defecto, `primary`.
   *
   * Olvidarlo deja el foco en el color de fábrica, y es el único sitio de la
   * pantalla que no se entera del cambio de tema.
   */
  ring?: TokenColor;
  /** Fondo de las superficies teñidas de marca (`Badge` suave, fila seleccionada). Derivado de `primary`. */
  subtle?: TokenColor;
  /** El mismo, al pasar el ratón. Derivado de `primary`. */
  subtleHover?: TokenColor;
  /** Texto sobre `subtle`. Derivado de `primary`. */
  subtleForeground?: TokenColor;
  /** Primera serie de las gráficas, que es la de marca. Por defecto, `primary`. */
  chart?: TokenColor;
}

/** Los siete tokens que un tema puede mover. Cualquier otro no es tematizable. */
export const THEMABLE_TOKENS = [
  "--primary",
  "--primary-foreground",
  "--ring",
  "--subtle",
  "--subtle-hover",
  "--subtle-foreground",
  "--chart-1",
] as const;

const HSL = /^\s*(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%\s*$/;

interface Hsl {
  h: number;
  s: number;
  l: number;
}

function parse(color: TokenColor): Hsl {
  const match = HSL.exec(color);
  if (!match) {
    throw new Error(
      `Color de token inválido: ${JSON.stringify(color)}. Se espera "H S% L%", por ejemplo "243 75% 59%".`,
    );
  }
  return { h: Number(match[1]), s: Number(match[2]), l: Number(match[3]) };
}

const format = ({ h, s, l }: Hsl): TokenColor =>
  `${round(h)} ${round(s)}% ${round(l)}%`;

const round = (value: number) => Math.round(value * 10) / 10;

/**
 * Deriva los tonos que acompañan al de marca.
 *
 * Los factores de saturación salen de las seis paletas incluidas: comparando
 * `--subtle` con su `--primary` en cada una, la saturación baja alrededor de un
 * 8%, un 14% y un 27% para el fondo, su `hover` y el texto. Derivarlos así
 * mantiene una paleta propia en la misma familia visual que las de fábrica.
 */
function derive(primary: Hsl, dark: boolean) {
  return dark
    ? {
        subtle: { h: primary.h, s: primary.s * 0.46, l: 18 },
        subtleHover: { h: primary.h, s: primary.s * 0.46, l: 23 },
        subtleForeground: { h: primary.h, s: primary.s * 0.95, l: 82 },
        primaryForeground: { h: primary.h, s: 45, l: 12 },
      }
    : {
        subtle: { h: primary.h, s: primary.s * 0.92, l: 96 },
        subtleHover: { h: primary.h, s: primary.s * 0.86, l: 92 },
        subtleForeground: { h: primary.h, s: primary.s * 0.73, l: 34 },
        // Blanco encima mientras el color sea suficientemente oscuro; a partir
        // de ahí el blanco deja de contrastar y se usa el propio tono muy
        // oscuro, que es lo que hacen las paletas claras de la librería.
        primaryForeground: primary.l <= 62 ? { h: 0, s: 0, l: 100 } : { h: primary.h, s: 45, l: 12 },
      };
}

export interface CreatePaletteOptions {
  /**
   * Deriva los tonos para fondo oscuro en vez de claro. @default false
   *
   * El tema oscuro no es el claro con otros valores sueltos: el color de marca
   * sube de luminosidad y los tonos que lo acompañan se invierten. Pasá los
   * colores del tema oscuro con esta opción activada.
   */
  dark?: boolean;
}

/**
 * Devuelve los tokens de una paleta de marca, listos para un `style` o para
 * componer una regla CSS.
 *
 * Solo emite tokens tematizables. Los de significado universal
 * (`--destructive`, `--success`, `--warning`), los de interacción (`--accent`,
 * `--muted`) y los de estructura (`--border`, `--input`, superficies) no están
 * en la firma, así que no se pueden mover desde aquí: no son de la marca.
 *
 * @example Un color de marca, aplicado a una parte del árbol
 * ```tsx
 * <div style={createPalette({ primary: "158 64% 32%" })}>
 *   <UiProvider>{children}</UiProvider>
 * </div>
 * ```
 *
 * @example Los dos temas, como hoja de estilos
 * ```ts
 * const claro = createPalette({ primary: "158 64% 32%" });
 * const oscuro = createPalette({ primary: "158 60% 55%" }, { dark: true });
 * const css = `
 *   [data-ui-palette="marca"] { ${declaraciones(claro)} }
 *   .dark [data-ui-palette="marca"] { ${declaraciones(oscuro)} }
 * `;
 * ```
 */
export function createPalette(
  colors: BrandColors,
  { dark = false }: CreatePaletteOptions = {},
): Record<(typeof THEMABLE_TOKENS)[number], TokenColor> {
  const primary = parse(colors.primary);
  const derived = derive(primary, dark);

  return {
    "--primary": format(primary),
    "--primary-foreground": colors.primaryForeground ?? format(derived.primaryForeground),
    "--ring": colors.ring ?? format(primary),
    "--subtle": colors.subtle ?? format(derived.subtle),
    "--subtle-hover": colors.subtleHover ?? format(derived.subtleHover),
    "--subtle-foreground": colors.subtleForeground ?? format(derived.subtleForeground),
    "--chart-1": colors.chart ?? format(primary),
  };
}

/**
 * Escribe una paleta como declaraciones CSS, para inyectarla en una hoja.
 *
 * Hace falta cuando la marca se elige en tiempo de ejecución y hay tema oscuro:
 * un `style` en línea no puede reaccionar a `.dark`, así que la paleta tiene
 * que vivir en una regla.
 *
 * @example
 * ```ts
 * const css = `
 *   :root { ${paletteDeclarations(createPalette({ primary: marca }))} }
 *   .dark { ${paletteDeclarations(createPalette({ primary: marcaOscura }, { dark: true }))} }
 * `;
 * ```
 */
export function paletteDeclarations(palette: Record<string, TokenColor>): string {
  return Object.entries(palette)
    .map(([token, value]) => `${token}: ${value};`)
    .join(" ");
}
