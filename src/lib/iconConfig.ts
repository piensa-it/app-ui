/**
 * Mapa de clases utilitarias para renderizar íconos de forma consistente
 * (tamaño, color semántico, contenedor) en toda la librería. Los colores
 * usan los tokens del design system (ver src/styles/globals.css), así que
 * respetan el theming por marca de cada consumidor.
 */
export const iconConfig = {
  sizes: {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
  },
  colors: {
    primary: "text-primary",
    muted: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  },
  containerSizes: {
    sm: "p-1.5 rounded-lg",
    md: "p-2 rounded-lg",
    lg: "p-3 rounded-lg",
  },
  containerColors: {
    primary: "bg-primary/10",
    muted: "bg-muted/50",
    success: "bg-success/10",
    warning: "bg-warning/10",
    destructive: "bg-destructive/10",
  },
};

export type IconSize = keyof typeof iconConfig.sizes;
export type IconColor = keyof typeof iconConfig.colors;
export type ContainerSize = keyof typeof iconConfig.containerSizes;
export type ContainerColor = keyof typeof iconConfig.containerColors;
