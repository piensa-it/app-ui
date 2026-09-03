import type { SelectOption } from "@/components/ui/select";

/** Texto plano de una opción, para `itemToString` de Ark y el `<select>` nativo. */
export function selectOptionToString(option: SelectOption): string {
  if (option.textValue !== undefined) return option.textValue;
  return typeof option.label === "string" || typeof option.label === "number" ? String(option.label) : String(option.value);
}
