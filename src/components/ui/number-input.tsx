import * as React from "react";
import { NumberInput as ArkNumberInput } from "@ark-ui/react/number-input";
import { useLocaleContext } from "@ark-ui/react/locale";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import { fieldControlVariants } from "@/lib/recipes/field-control";
import { focusRingOutside } from "@/lib/recipes/focus";
import { splitAriaProps } from "@/lib/aria-props";
import { createNumberMask } from "@/lib/number-mask";

export interface NumberInputProps
  extends Omit<ArkNumberInput.RootProps, "value" | "onValueChange" | "onChange" | "children" | "translations">,
    VariantProps<typeof fieldControlVariants> {
  /** Valor numérico controlado. `undefined` representa el campo vacío (no `0` ni `NaN`). */
  value?: number;
  onChange?: (value: number | undefined) => void;
  placeholder?: string;
  /**
   * Código de moneda ISO 4217 (`"COP"`, `"USD"`...). Atajo para el caso que
   * motivó este componente —entrada monetaria, repetida a mano en las tres
   * apps—: activa `Intl.NumberFormat` con `style: "currency"`, separador de
   * miles según `locale` y 2 decimales, salvo que `formatOptions` diga otra
   * cosa. Para un formato que no es dinero (porcentaje, sin decimales...)
   * usa `formatOptions` directamente y omite `currency`.
   *
   * **Pegado**: el texto pegado se lee con el símbolo decimal de `locale`,
   * así que pegar `"$1.234.567,89"` bajo `locale="es-CO"` da `1234567.89` —
   * pegar un formato de otra locale (p. ej. con coma de miles) puede leerse
   * mal, porque el separador decimal cambia de símbolo entre locales.
   */
  currency?: string;
  /**
   * Con `currency` o `formatOptions`, el campo se enmascara **mientras se
   * escribe**: los separadores de miles aparecen tecla a tecla y el cursor
   * se queda donde estaba. `false` vuelve al comportamiento de Ark UI, que
   * solo formatea al salir del campo. Sin `currency` ni `formatOptions` no
   * hay formato que aplicar y esta prop no tiene efecto — para una cantidad
   * entera con separadores usa `formatOptions={{ maximumFractionDigits: 0 }}`.
   * @default true
   */
  mask?: boolean;
  /** Oculta los botones de aumentar/disminuir — útil en montos, donde nadie sube de uno en uno. Las flechas del teclado siguen funcionando. */
  hideControls?: boolean;
  /** Nombre accesible cuando el campo no tiene un `<label>` asociado (vía `Field` o `htmlFor`). */
  "aria-label"?: string;
  className?: string;
}

const stepperClassName = cn(
  "inline-flex h-4 w-5 items-center justify-center rounded-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground",
  "disabled:pointer-events-none disabled:opacity-40",
  focusRingOutside,
);

/**
 * Entrada numérica sobre Ark UI `number-input` (headless), pensada primero
 * para dinero: separador de miles y decimales vienen de `Intl.NumberFormat`
 * (nunca a mano), y `currency` cubre el caso común sin pedir `formatOptions`.
 * `value`/`onChange` con `number | undefined` — igual que su hermano
 * `Slider`, que también traduce el `string` de Ark a un tipo nativo antes de
 * exponerlo.
 *
 * El texto visible lo lleva este envoltorio, no Ark: así se puede enmascarar
 * en vivo (ver `mask`) y el número que sube por `onChange` sale de ese mismo
 * texto, sin volver a parsear `String(value)` —que con `locale="es-CO"`
 * leería `"1234.5"` como `12345`, porque ahí el punto agrupa miles—.
 */
const NumberInput = React.forwardRef<HTMLDivElement, NumberInputProps>(
  (
    {
      className,
      value,
      onChange,
      placeholder,
      currency,
      formatOptions,
      mask = true,
      hideControls = false,
      variant,
      size,
      id,
      locale: localeProp,
      "aria-label": ariaLabel,
      ...props
    },
    ref,
  ) => {
    const [ariaProps, machineProps] = splitAriaProps(props);
    const { locale: contextLocale } = useLocaleContext();
    const locale = localeProp ?? contextLocale;
    const inputRef = React.useRef<HTMLInputElement>(null);

    const resolvedFormatOptions = React.useMemo<Intl.NumberFormatOptions | undefined>(() => {
      if (currency) {
        return { style: "currency", currency, maximumFractionDigits: 2, ...formatOptions };
      }
      return formatOptions;
    }, [currency, formatOptions]);

    const formatKey = JSON.stringify(resolvedFormatOptions ?? null);
    const liveMask = React.useMemo(
      () => (mask && resolvedFormatOptions ? createNumberMask(locale, resolvedFormatOptions) : null),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- `formatKey` compara las opciones por contenido, no por identidad
      [mask, locale, formatKey],
    );
    const formatter = React.useMemo(
      () => (resolvedFormatOptions ? new Intl.NumberFormat(locale, resolvedFormatOptions) : null),
      // eslint-disable-next-line react-hooks/exhaustive-deps -- ídem
      [locale, formatKey],
    );

    const formatValue = React.useCallback(
      (n: number | undefined) => (n === undefined || Number.isNaN(n) ? "" : formatter ? formatter.format(n) : String(n)),
      [formatter],
    );

    const [text, setText] = React.useState(() => formatValue(value));
    const textRef = React.useRef(text);
    textRef.current = text;
    // Número que representa el texto actual — el último que se avisó por `onChange`.
    const textNumber = React.useRef<number | undefined>(value);
    // Caracteres significativos antes del cursor, pendientes de reubicar tras enmascarar.
    const pendingCaret = React.useRef<number | null>(null);

    // Un `value` que no salió de lo que se escribió (reset de formulario, carga
    // de datos) reemplaza el texto; el eco del propio `onChange` no, para no
    // pisar un "1.234," a medio escribir con "1.234".
    React.useEffect(() => {
      const same = value === textNumber.current || (Number.isNaN(value) && textNumber.current === undefined);
      if (same) return;
      textNumber.current = value;
      setText(formatValue(value));
    }, [value, formatValue]);

    // Si cambia el formato (moneda, locale), se reescribe el valor vigente con el nuevo.
    const formatValueRef = React.useRef(formatValue);
    React.useEffect(() => {
      if (formatValueRef.current === formatValue) return;
      formatValueRef.current = formatValue;
      setText(formatValue(textNumber.current));
    }, [formatValue]);

    const placeCaret = React.useCallback(() => {
      const input = inputRef.current;
      const significant = pendingCaret.current;
      if (!input || significant === null || !liveMask || document.activeElement !== input) return;
      if (input.value !== textRef.current) input.value = textRef.current;
      const position = liveMask.caretAfter(textRef.current, significant);
      input.setSelectionRange(position, position);
    }, [liveMask]);

    React.useLayoutEffect(() => {
      if (pendingCaret.current === null) return;
      placeCaret();
      // Zag reescribe el campo y reubica el cursor con su propia heurística en
      // el siguiente frame; se corrige en el de después, y ahí se da por cerrado.
      const frame = requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          placeCaret();
          pendingCaret.current = null;
        }),
      );
      return () => cancelAnimationFrame(frame);
    }, [text, placeCaret]);

    const handleValueChange = (details: ArkNumberInput.ValueChangeDetails) => {
      let nextText = details.value;
      let nextNumber: number | undefined;

      if (liveMask) {
        const input = inputRef.current;
        if (input && document.activeElement === input && input.value === details.value) {
          // Viene de teclear o pegar: el cursor está en el DOM y hay que conservarlo.
          pendingCaret.current = liveMask.significantBefore(input.value, input.selectionStart ?? input.value.length);
        }
        nextText = liveMask.format(details.value);
        nextNumber = liveMask.toNumber(nextText);
      } else {
        nextNumber = Number.isNaN(details.valueAsNumber) ? undefined : details.valueAsNumber;
      }

      textNumber.current = nextNumber;
      setText(nextText);
      // Si la máscara deja el mismo texto (p. ej. se tecleó una letra), React no
      // vuelve a renderizar, pero el DOM ya muestra lo tecleado: se restaura aquí.
      if (nextText === textRef.current) placeCaret();
      if (nextNumber !== value) onChange?.(nextNumber);
    };

    // Va en fase de captura: Zag registra su `onKeyDown` antes que el nuestro y
    // se retira si el evento ya llega con `defaultPrevented`.
    const handleKeyDownCapture = (event: React.KeyboardEvent<HTMLInputElement>) => {
      // Una tecla nueva manda sobre la corrección de cursor que quedara pendiente de la anterior.
      pendingCaret.current = null;
      const input = event.currentTarget;
      const { selectionStart: start, selectionEnd: end, value: current } = input;
      if (start === null || end === null) return;

      // Home/End en un spinbutton saltan al mínimo/máximo (ARIA). Sin `min`/`max`
      // explícitos esos topes son ±`Number.MAX_SAFE_INTEGER` —End escribiría
      // 9.007.199.254.740.991 en un monto—, así que ahí mueven el cursor, como en
      // cualquier campo de texto.
      const bound = event.key === "Home" ? props.min : event.key === "End" ? props.max : null;
      if (bound === undefined) {
        event.preventDefault();
        const edge = event.key === "Home" ? 0 : current.length;
        if (event.shiftKey) {
          const anchor = event.key === "Home" ? end : start;
          input.setSelectionRange(Math.min(anchor, edge), Math.max(anchor, edge), event.key === "Home" ? "backward" : "forward");
        } else {
          input.setSelectionRange(edge, edge);
        }
        return;
      }

      if (!liveMask) return;

      // Borrar un separador de miles no tiene sentido (la máscara lo repondría
      // y el cursor quedaría atascado): se salta el adorno y se borra el dígito.
      if (start === end && (event.key === "Backspace" || event.key === "Delete")) {
        const back = event.key === "Backspace";
        let position = start;
        while (back ? position > 0 && liveMask.isDecoration(current[position - 1]) : position < current.length && liveMask.isDecoration(current[position])) {
          position += back ? -1 : 1;
        }
        if (position !== start) input.setSelectionRange(position, position);
        return;
      }

      // El punto del teclado numérico escribe el decimal de la locale (la coma en es-CO).
      if (event.code === "NumpadDecimal" && event.key !== liveMask.decimal && liveMask.maxFractionDigits > 0) {
        event.preventDefault();
        input.setRangeText(liveMask.decimal, start, end, "end");
        input.dispatchEvent(new Event("input", { bubbles: true }));
      }
    };

    return (
      <ArkNumberInput.Root
        ref={ref}
        className={cn("w-full", className)}
        value={text}
        onValueChange={handleValueChange}
        locale={locale}
        formatOptions={resolvedFormatOptions}
        // El `id` externo (el que inyecta `Field` para el `<label htmlFor>`) va al
        // input vía `ids`, no al `id` del Root — mismo motivo que en Select: Zag
        // localiza sus partes por id y sobreescribir el del Root no las mueve.
        ids={id ? { input: id } : undefined}
        {...machineProps}
      >
        <ArkNumberInput.Control
          className={cn(
            fieldControlVariants({ variant, size }),
            "flex items-center gap-1 focus-within:border-ring focus-within:ring-2 focus-within:ring-inset focus-within:ring-ring",
            !hideControls && "pr-1",
          )}
        >
          <ArkNumberInput.Input
            ref={inputRef}
            aria-label={ariaLabel}
            placeholder={placeholder}
            onKeyDownCapture={handleKeyDownCapture}
            onPointerDownCapture={() => {
              pendingCaret.current = null;
            }}
            {...ariaProps}
            className="min-w-0 flex-1 bg-transparent outline-hidden placeholder:text-muted-foreground"
          />
          {!hideControls && (
            <div className="flex shrink-0 flex-col">
              <ArkNumberInput.IncrementTrigger aria-label="Aumentar" className={stepperClassName}>
                <ChevronUp aria-hidden="true" className="size-3" />
              </ArkNumberInput.IncrementTrigger>
              <ArkNumberInput.DecrementTrigger aria-label="Disminuir" className={stepperClassName}>
                <ChevronDown aria-hidden="true" className="size-3" />
              </ArkNumberInput.DecrementTrigger>
            </div>
          )}
        </ArkNumberInput.Control>
      </ArkNumberInput.Root>
    );
  },
);
NumberInput.displayName = "NumberInput";

export { NumberInput };
