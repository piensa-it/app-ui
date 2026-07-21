// Helper para obtener símbolo de moneda (fallback cuando no hay datos de DB)
export const getSymbolFallback = (currency: string): string => {
  switch(currency) {
    case "USD": return "$";
    case "EUR": return "€";
    case "COP": 
    default: return "$";
  }
};

export const formatCurrency = (value: number, currency: string, format: "completo" | "miles" = "miles", symbol?: string) => {
  const currencySymbol = symbol || getSymbolFallback(currency);
  
  if (format === "miles") {
    // Formato en miles con 2 decimales para millones, sin decimales para miles
    if (value >= 1000000) {
      const millions = value / 1000000;
      return `${currencySymbol}${millions.toFixed(2).replace('.', ',')}M`;
    } else if (value >= 1000) {
      return `${currencySymbol}${Math.round(value / 1000)}K`;
    }
    return `${currencySymbol}${Math.round(value)}`;
  }
  
  // Formato completo
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(value);
};

export const formatCurrencyInput = (value: string) => {
  const numericValue = value.replace(/\D/g, "");
  if (!numericValue) return "";
  return new Intl.NumberFormat('es-CO').format(parseInt(numericValue));
};
