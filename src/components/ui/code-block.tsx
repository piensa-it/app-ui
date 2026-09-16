import * as React from "react";
import { Tabs as ArkTabs } from "@ark-ui/react/tabs";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

export interface CodeSnippet {
  /** Texto de la pestaña: «curl», «Node». */
  label: string;
  /** Lenguaje, para el resaltado y `data-language`. */
  language?: string;
  code: string;
}

export interface CodeBlockLabels {
  copy: string;
  copied: string;
}

const defaultLabels: CodeBlockLabels = { copy: "Copiar código", copied: "Copiado" };

export interface CodeBlockProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Un solo bloque. Se ignora si hay `tabs`. */
  code?: string;
  language?: string;
  /** Varias versiones del mismo ejemplo, una por pestaña. */
  tabs?: CodeSnippet[];
  /** Título de la barra: «POST /v1/messages». */
  title?: React.ReactNode;
  /** Barra con los tres puntos de ventana (terminal del hero de Deliver). @default false */
  windowChrome?: boolean;
  /** @default true */
  copyable?: boolean;
  /** @default false */
  lineNumbers?: boolean;
  /**
   * Resaltado de sintaxis opcional: recibe el código y el lenguaje y devuelve
   * nodos (por ejemplo, el resultado de Shiki en el build). La librería no trae
   * un resaltador para no sumar peso a todas las apps.
   */
  highlight?: (code: string, language?: string) => React.ReactNode;
  labels?: Partial<CodeBlockLabels>;
}

function CopyButton({ code, labels }: { code: string; labels: CodeBlockLabels }) {
  const [copied, setCopied] = React.useState(false);
  React.useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  return (
    <>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
          } catch {
            // Sin permiso de portapapeles: no se anuncia un copiado que no ocurrió.
          }
        }}
        aria-label={labels.copy}
        title={labels.copy}
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-hover hover:text-foreground",
          focusRingOutside,
        )}
      >
        {copied ? <Check className="size-3.5 text-success" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
      </button>
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? labels.copied : ""}
      </span>
    </>
  );
}

function Code({
  code,
  language,
  lineNumbers,
  highlight,
}: Pick<CodeBlockProps, "language" | "lineNumbers" | "highlight"> & { code: string }) {
  const content = highlight ? highlight(code, language) : code;
  return (
    <pre data-language={language} className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground">
      {lineNumbers && !highlight ? (
        <code className="grid">
          {code.split("\n").map((line, index) => (
            <span key={index} className="grid grid-cols-[2.5ch_1fr] gap-4">
              <span aria-hidden="true" className="select-none text-end text-muted-foreground/60">
                {index + 1}
              </span>
              <span>{line || " "}</span>
            </span>
          ))}
        </code>
      ) : (
        <code>{content}</code>
      )}
    </pre>
  );
}

/**
 * Bloque de código con título, pestañas por lenguaje y botón de copiar. El
 * código completo está en el HTML (todas las pestañas), así que se lee sin
 * JavaScript; copiar y cambiar de pestaña son lo interactivo.
 */
const CodeBlock = React.forwardRef<HTMLDivElement, CodeBlockProps>(
  (
    { code = "", language, tabs, title, windowChrome = false, copyable = true, lineNumbers = false, highlight, labels: labelsProp, className, ...props },
    ref,
  ) => {
    const labels = { ...defaultLabels, ...labelsProp };
    const snippets = tabs && tabs.length > 0 ? tabs : null;
    const [active, setActive] = React.useState(snippets?.[0]?.label ?? "");
    const activeCode = snippets ? (snippets.find((snippet) => snippet.label === active) ?? snippets[0]).code : code;

    const bar = (tabList?: React.ReactNode) => (
      <div className="flex min-h-10 items-center gap-2 border-b border-border px-3">
        {windowChrome && (
          <span aria-hidden="true" className="flex gap-1.5 pe-1">
            <span className="size-2.5 rounded-full bg-destructive/60" />
            <span className="size-2.5 rounded-full bg-warning/60" />
            <span className="size-2.5 rounded-full bg-success/60" />
          </span>
        )}
        {title && <span className="truncate font-mono text-xs text-muted-foreground">{title}</span>}
        {tabList}
        {copyable && (
          <span className="ms-auto flex">
            <CopyButton code={activeCode} labels={labels} />
          </span>
        )}
      </div>
    );

    return (
      <div ref={ref} className={cn("overflow-hidden rounded-xl border border-border bg-card shadow-sm", className)} {...props}>
        {snippets ? (
          <ArkTabs.Root value={active} onValueChange={(details) => setActive(details.value)}>
            {bar(
              <ArkTabs.List className="flex items-center gap-1">
                {snippets.map((snippet) => (
                  <ArkTabs.Trigger
                    key={snippet.label}
                    value={snippet.label}
                    className={cn(
                      "rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground data-[selected]:bg-muted data-[selected]:text-foreground",
                      focusRingOutside,
                    )}
                  >
                    {snippet.label}
                  </ArkTabs.Trigger>
                ))}
              </ArkTabs.List>,
            )}
            {snippets.map((snippet) => (
              <ArkTabs.Content key={snippet.label} value={snippet.label} className="outline-hidden">
                <Code code={snippet.code} language={snippet.language} lineNumbers={lineNumbers} highlight={highlight} />
              </ArkTabs.Content>
            ))}
          </ArkTabs.Root>
        ) : (
          <>
            {(title || windowChrome || copyable) && bar()}
            <Code code={code} language={language} lineNumbers={lineNumbers} highlight={highlight} />
          </>
        )}
      </div>
    );
  },
);
CodeBlock.displayName = "CodeBlock";

export { CodeBlock };
