/**
 * Mapa de clases utilitarias para renderizar íconos de forma consistente
 * (tamaño, color semántico, contenedor) en toda la librería. Los colores
 * usan los tokens del design system (ver src/styles/globals.css), así que
 * respetan el theming por marca de cada consumidor.
 */
export const iconConfig = {
  sizes: {
    "2xs": "h-2.5 w-2.5",
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
    xl: "h-8 w-8",
    "2xl": "h-10 w-10",
    "3xl": "h-12 w-12",
  },
  colors: {
    primary: "text-primary",
    muted: "text-muted-foreground",
    success: "text-success",
    warning: "text-warning",
    destructive: "text-destructive",
  },
  containerSizes: {
    xs: "p-1",
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
    xl: "p-4",
  },
  containerColors: {
    primary: "bg-primary/10",
    muted: "bg-muted/50",
    success: "bg-success/10",
    warning: "bg-warning/10",
    destructive: "bg-destructive/10",
  },
  containerVariants: {
    soft: "",
    outline: "border border-border bg-card",
    elevated: "border border-border/80 bg-card shadow-sm",
    ghost: "bg-transparent",
  },
  containerShapes: {
    square: "rounded-md",
    rounded: "rounded-xl",
    circle: "rounded-full",
  },
};

export type IconSize = keyof typeof iconConfig.sizes;
export type IconColor = keyof typeof iconConfig.colors;
export type ContainerSize = keyof typeof iconConfig.containerSizes;
export type ContainerColor = keyof typeof iconConfig.containerColors;
export type ContainerVariant = keyof typeof iconConfig.containerVariants;
export type ContainerShape = keyof typeof iconConfig.containerShapes;
