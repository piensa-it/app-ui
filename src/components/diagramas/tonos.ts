import type { GrupoProceso, NodoProceso, TonoGrupo } from "./types";

/** Clases escritas enteras para que Tailwind las encuentre. */
export const CARRIL: Record<TonoGrupo, { caja: string; punto: string }> = {
  primary: { caja: "border-primary/25 bg-primary/[0.04]", punto: "bg-primary" },
  success: { caja: "border-success/30 bg-success/[0.05]", punto: "bg-success" },
  warning: { caja: "border-warning/40 bg-warning/[0.06]", punto: "bg-warning" },
  destructive: { caja: "border-destructive/30 bg-destructive/[0.04]", punto: "bg-destructive" },
  muted: { caja: "border-border bg-muted/30", punto: "bg-muted-foreground" },
};
export const ACENTO: Record<TonoGrupo, string> = {
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground/60",
};

export function tonoDeNodo(nodo: NodoProceso, grupos?: GrupoProceso[]): TonoGrupo {
  if (nodo.externo) return "muted";
  const grupo = grupos?.find((g) => g.id === nodo.grupo);
  if (grupo) return grupo.tono ?? "primary";
  return (nodo.capa ?? "flujo") === "flujo" ? "primary" : "muted";
}
