/**
 * Utilidades de color para verificar contraste. Viven en la librería (no solo
 * en las pruebas) porque una app que redefine tokens necesita comprobar sus
 * propios pares: `contrastRatio(parseHsl(...), parseHsl(...))`.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Convierte un token en formato Tailwind (`"0 0% 96%"`) a RGB. */
export function parseHsl(token: string): Rgb {
  const [h, s, l] = token
    .trim()
    .split(/\s+/)
    .map((part) => Number.parseFloat(part));
  const saturation = s / 100;
  const lightness = l / 100;
  const a = saturation * Math.min(lightness, 1 - lightness);
  const channel = (n: number) => {
    const k = (n + h / 30) % 12;
    return lightness - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
  };
  return { r: channel(0) * 255, g: channel(8) * 255, b: channel(4) * 255 };
}

/** Luminancia relativa (WCAG 2.1). */
export function relativeLuminance({ r, g, b }: Rgb): number {
  const linear = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * linear(r) + 0.7152 * linear(g) + 0.0722 * linear(b);
}

/** Relación de contraste entre dos colores, de 1 (igual) a 21 (negro/blanco). */
export function contrastRatio(a: Rgb, b: Rgb): number {
  const [light, dark] = [relativeLuminance(a), relativeLuminance(b)].sort((x, y) => y - x);
  return (light + 0.05) / (dark + 0.05);
}
