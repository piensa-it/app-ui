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

// --- Proveedor raíz ---
export { UiProvider, type UiProviderProps } from "./components/providers/UiProvider";

// --- Primitivas simples (Tailwind puro) ---
export { Button, buttonVariants, type ButtonProps } from "./components/ui/button";
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./components/ui/card";
export { Badge, badgeVariants, type BadgeProps } from "./components/ui/badge";
export { Input, type InputProps } from "./components/ui/input";
export { Textarea, type TextareaProps } from "./components/ui/textarea";
export { Label } from "./components/ui/label";
export { Separator } from "./components/ui/separator";

// --- Primitivas de interacción (Ark UI + tema Piensa IT) ---
export { Select, type SelectProps, type SelectOption } from "./components/ui/select";
export { MultiSelect, type MultiSelectFieldProps } from "./components/ui/multi-select";
export { AutoComplete, type AutoCompleteProps } from "./components/ui/autocomplete";
export { Checkbox, type CheckboxProps } from "./components/ui/checkbox";
export { RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioGroupItemProps } from "./components/ui/radio-group";
export { Switch, type SwitchProps } from "./components/ui/switch";
export { Slider, type SliderProps } from "./components/ui/slider";
export { Dialog, DialogHeader, DialogFooter, DialogTitle, DialogDescription, type DialogProps } from "./components/ui/dialog";
export { AlertDialogHost, confirmAlert, type ConfirmAlertOptions } from "./components/ui/alert-dialog";
export { Sheet, SheetHeader, SheetTitle, SheetDescription, SheetFooter, type SheetProps } from "./components/ui/sidebar";
export { Popover, PopoverTrigger, PopoverContent, type PopoverProps, type PopoverTriggerProps, type PopoverContentProps } from "./components/ui/popover";
export { Tooltip, type TooltipProps } from "./components/ui/tooltip";
export { Tabs, TabPanel, type TabsProps, type TabPanelProps } from "./components/ui/tabs";
export { Accordion, AccordionTab, type AccordionProps, type AccordionTabProps } from "./components/ui/accordion";
export { Avatar, type AvatarProps } from "./components/ui/avatar";
export { Progress, type ProgressProps } from "./components/ui/progress";
export { Toaster, toast, type ToastOptions } from "./components/ui/toast";

// --- Datos complejos (Ark UI / TanStack Table / Recharts + tema Piensa IT) ---
export { DataTable, Column, type DataTableProps, type ColumnProps, type DataTableValue } from "./components/ui/data-table";
export { DatePicker, type DatePickerProps } from "./components/ui/date-picker";
export { Chart, type ChartProps, type ChartSeries, type ChartDatum } from "./components/ui/chart";
export { FileUpload, type FileUploadProps } from "./components/ui/file-upload";

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
