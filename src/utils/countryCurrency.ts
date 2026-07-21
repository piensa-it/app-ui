/**
 * Moneda por defecto sugerida según el país elegido en el signup (P7-2).
 *
 * La tabla `countries` no tiene una columna de moneda (son datos
 * independientes, ver docs/backlog.md P7-2), y el proyecto hoy solo soporta
 * 3 monedas (`currencies`: COP, USD, EUR — ver src/hooks/useCurrencies.ts),
 * así que un mapa simple en frontend es más que suficiente: no hace falta
 * una tabla nueva ni un join para esto.
 *
 * Es solo una sugerencia inicial — el usuario siempre puede cambiarla
 * manualmente en el `CurrencySelect` del formulario de signup, y luego
 * también desde Perfil.
 */

const EURO_ZONE_COUNTRIES = new Set([
  "ES", "FR", "DE", "IT", "PT", "IE", "NL", "BE", "AT", "LU",
  "FI", "GR", "CY", "MT", "SI", "SK",
]);

export type SupportedCurrency = "COP" | "USD" | "EUR";

/**
 * Devuelve la moneda sugerida para un código de país ISO 3166-1 alpha-2.
 * Colombia → COP, zona euro → EUR, todo lo demás → USD (moneda de
 * referencia por defecto para el resto de Latinoamérica y el mundo, hasta
 * que se agreguen monedas locales adicionales a `currencies`).
 */
export function getDefaultCurrencyForCountry(countryCode: string): SupportedCurrency {
  if (countryCode === "CO") return "COP";
  if (EURO_ZONE_COUNTRIES.has(countryCode)) return "EUR";
  return "USD";
}
