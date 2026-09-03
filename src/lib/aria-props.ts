/**
 * Separa los atributos de accesibilidad que un contenedor como `Field` inyecta
 * en su hijo, del resto de props que gobiernan la máquina de estado.
 *
 * Hace falta porque los componentes sobre Ark UI reparten sus props entre el
 * hook de la máquina y el nodo que de verdad recibe el foco. Sin separarlos,
 * `aria-describedby` y `aria-invalid` acaban en el hook —que no los conoce— o
 * en un `div` sin rol, y el control queda sin marcar aunque el mensaje de error
 * se pinte en pantalla.
 */
export interface ForwardedAriaProps {
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
  "aria-labelledby"?: string;
  "aria-required"?: boolean | "true" | "false";
}

export function splitAriaProps<T extends Record<string, unknown>>(
  props: T,
): [ForwardedAriaProps, Omit<T, keyof ForwardedAriaProps>] {
  const {
    "aria-describedby": describedBy,
    "aria-invalid": invalid,
    "aria-labelledby": labelledBy,
    "aria-required": required,
    ...rest
  } = props as T & ForwardedAriaProps;

  const aria: ForwardedAriaProps = {};
  if (describedBy !== undefined) aria["aria-describedby"] = describedBy;
  if (invalid !== undefined) aria["aria-invalid"] = invalid;
  if (labelledBy !== undefined) aria["aria-labelledby"] = labelledBy;
  if (required !== undefined) aria["aria-required"] = required;

  return [aria, rest as Omit<T, keyof ForwardedAriaProps>];
}
