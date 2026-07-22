// Punto de entrada público de @piensa-it/ui-library.
// Los consumidores deben importar SIEMPRE desde aquí (import { Button } from
// "@piensa-it/ui-library"), no desde rutas internas — eso es lo que nos
// permite reorganizar `src/` sin romper a los repos que instalan la
// librería.
//
// El CSS (tokens + Tailwind base) se importa aquí como side-effect para que
// Vite lo extraiga a dist/style.css durante el build de librería. Cada
// consumidor decide dónde inyectarlo en su propio pipeline:
//   import "@piensa-it/ui-library/styles.css";
import "./styles/globals.css";

// --- Primitivas (shadcn/ui) ---
export { Button, buttonVariants, type ButtonProps } from "./components/ui/button";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";
export { Badge, badgeVariants, type BadgeProps } from "./components/ui/badge";
export { Input, type InputProps } from "./components/ui/input";
export { Separator } from "./components/ui/separator";

// --- Layout ---
export { Layout, type LayoutProps } from "./components/layout/Layout";
export { GlobalErrorBoundary, type GlobalErrorBoundaryProps } from "./components/layout/GlobalErrorBoundary";

// --- Marketing / sitios públicos ---
export { PublicHeader, type PublicHeaderProps, type LinkComponent, type LinkComponentProps } from "./components/marketing/PublicHeader";
export { PublicFooter, type PublicFooterProps } from "./components/marketing/PublicFooter";
export { ImageCarouselBackdrop, type ImageCarouselBackdropProps } from "./components/marketing/ImageCarouselBackdrop";

// --- Utilidades ---
export { cn } from "./lib/utils";
export { iconConfig, type IconSize, type IconColor, type ContainerSize, type ContainerColor } from "./lib/iconConfig";
