/**
 * Máscara numérica en vivo para `NumberInput`: reescribe lo que la persona va
 * tecleando con los separadores de miles de la locale, sin esperar a que el
 * campo pierda el foco (que es cuando Ark UI aplica `Intl.NumberFormat`).
 *
 * Todo sale de `Intl.NumberFormat` —símbolo decimal, agrupación, prefijo o
 * sufijo de moneda y porcentaje—, nunca de un separador escrito a mano: así
 * `es-CO` agrupa con `.` y `en-US` con `,` sin que el componente lo sepa.
 */

export interface NumberMask {
  /** Símbolo decimal de la locale (`","` en `es-CO`, `"."` en `en-US`). */
  decimal: string;
  /** Máximo de decimales que admite el formato; `0` impide escribir el separador decimal. */
  maxFractionDigits: number;
  /** Reescribe el texto tecleado con separadores de miles, conservando los decimales tal cual se escribieron. */
  format: (raw: string) => string;
  /** Número que representa un texto ya enmascarado; `undefined` si no tiene dígitos. En porcentaje, `"15 %"` → `0.15`. */
  toNumber: (text: string) => number | undefined;
  /** Posición en `formatted` que deja atrás los mismos `significantCount` caracteres significativos (dígitos, decimal, signo). */
  caretAfter: (formatted: string, significantCount: number) => number;
  /** Cuántos caracteres significativos hay en `text` antes de `position`. */
  significantBefore: (text: string, position: number) => number;
  /** ¿`char` es un separador de miles o parte del adorno (símbolo de moneda, espacio, `%`)? */
  isDecoration: (char: string) => boolean;
}

// Solo dígitos latinos: locales con otro sistema de numeración (árabe, devanagari...) no enmascaran en vivo.
const DIGIT = /[0-9]/;

/**
 * Crea la máscara para una locale y un formato. Devuelve `null` cuando el
 * formato no se deja enmascarar en vivo sin mentir sobre el valor (notación
 * compacta, científica o de ingeniería): en esos casos el campo se comporta
 * como antes y formatea al salir.
 */
export function createNumberMask(locale: string | undefined, options: Intl.NumberFormatOptions | undefined): NumberMask | null {
  const notation = options?.notation ?? "standard";
  if (notation !== "standard") return null;

  const full = new Intl.NumberFormat(locale, options);
  const resolved = full.resolvedOptions();
  if (resolved.numberingSystem !== "latn") return null;
  const maxFractionDigits = resolved.maximumFractionDigits ?? 3;

  const decimal = new Intl.NumberFormat(locale).formatToParts(1.1).find((p) => p.type === "decimal")?.value ?? ".";
  const minusSign = new Intl.NumberFormat(locale).formatToParts(-1).find((p) => p.type === "minusSign")?.value ?? "-";

  // Plantilla: el mismo formato sin decimales mínimos. Solo interesa su
  // "cáscara" (moneda, porcentaje, espacios); los dígitos se reemplazan.
  const shell = new Intl.NumberFormat(locale, { ...options, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const grouping = new Intl.NumberFormat(locale, {
    useGrouping: options?.useGrouping ?? "auto",
    maximumFractionDigits: 0,
  } as Intl.NumberFormatOptions);
  const templateValue = resolved.style === "percent" ? 0.01 : 1;

  const decorations = new Set<string>();
  for (const part of shell.formatToParts(-1_234_567 * templateValue)) {
    if (part.type !== "integer" && part.type !== "minusSign") {
      for (const char of part.value) decorations.add(char);
    }
  }
  decorations.delete(decimal);

  const isSignificant = (char: string) => DIGIT.test(char) || char === decimal || char === minusSign || char === "-";

  const format = (raw: string): string => {
    const text = raw;
    if (text.trim() === "") return "";

    const negative = text.includes("-") || text.includes(minusSign);
    const decimalIndex = maxFractionDigits > 0 ? text.indexOf(decimal) : -1;
    const intSource = decimalIndex === -1 ? text : text.slice(0, decimalIndex);
    const fracSource = decimalIndex === -1 ? "" : text.slice(decimalIndex + decimal.length);

    const intDigits = intSource.replace(/\D/g, "").replace(/^0+(?=\d)/, "");
    const fracDigits = fracSource.replace(/\D/g, "").slice(0, maxFractionDigits);
    const hasDecimal = decimalIndex !== -1;

    if (intDigits === "" && !hasDecimal) {
      // Solo un signo, o solo adorno (p. ej. quedó el "$ " tras borrar todo).
      return negative ? minusSign : "";
    }

    const groupedInt = grouping.format(BigInt(intDigits === "" ? "0" : intDigits));
    const number = hasDecimal ? `${groupedInt}${decimal}${fracDigits}` : groupedInt;

    // El signo lo pone la plantilla, en el lugar que dicta la locale.
    const parts = shell.formatToParts(negative ? -templateValue : templateValue);
    let placed = false;
    return parts
      .map((part) => {
        if (part.type === "integer") {
          if (placed) return "";
          placed = true;
          return number;
        }
        if (part.type === "group" || part.type === "decimal" || part.type === "fraction") return "";
        if (part.type === "minusSign") return minusSign;
        return part.value;
      })
      .join("");
  };

  const toNumber = (text: string): number | undefined => {
    const negative = text.includes("-") || text.includes(minusSign);
    const decimalIndex = maxFractionDigits > 0 ? text.indexOf(decimal) : -1;
    const intDigits = (decimalIndex === -1 ? text : text.slice(0, decimalIndex)).replace(/\D/g, "");
    const fracDigits = decimalIndex === -1 ? "" : text.slice(decimalIndex + decimal.length).replace(/\D/g, "");
    if (intDigits === "" && fracDigits === "") return undefined;
    const n = Number(`${negative ? "-" : ""}${intDigits || "0"}.${fracDigits || "0"}`);
    // En porcentaje se escribe "15" para decir 0,15 — igual que lo formatea Intl.
    return resolved.style === "percent" ? n / 100 : n;
  };

  const significantBefore = (text: string, position: number) => {
    let count = 0;
    for (const char of text.slice(0, position)) if (isSignificant(char)) count++;
    return count;
  };

  const caretAfter = (formatted: string, significantCount: number) => {
    if (significantCount <= 0) {
      // Antes del primer dígito: justo después del prefijo (p. ej. "$ ").
      const first = [...formatted].findIndex((char) => DIGIT.test(char));
      return first === -1 ? formatted.length : first;
    }
    let seen = 0;
    for (let i = 0; i < formatted.length; i++) {
      if (isSignificant(formatted[i])) seen++;
      if (seen === significantCount) return i + 1;
    }
    return formatted.length;
  };

  return {
    decimal,
    maxFractionDigits,
    format,
    toNumber,
    caretAfter,
    significantBefore,
    isDecoration: (char) => decorations.has(char),
  };
}
