import * as React from "react";
import { ChevronDown, Languages } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

export interface LanguageOption {
  /** Código BCP 47: `en`, `es`. */
  code: string;
  /** Nombre en su propio idioma: «English», «Español». */
  label: string;
  /** Abreviatura para la variante segmentada: «EN». */
  short?: string;
  /** URL de esta misma página en ese idioma. */
  href: string;
}

export interface LanguageSwitcherProps extends Omit<React.HTMLAttributes<HTMLElement>, "onChange"> {
  /** Código del idioma de la página actual. */
  value: string;
  languages: LanguageOption[];
  /**
   * Avisa qué idioma se eligió, antes de navegar. El sitio lo usa para guardar
   * la elección (cookie `lang`) y que la detección automática no la pise.
   */
  onChange?: (code: string) => void;
  /** `segmented` (EN | ES) o `menu` para 3 o más idiomas. @default "segmented" */
  variant?: "segmented" | "menu";
  /** Nombre accesible del selector. @default "Idioma" */
  label?: string;
}

/**
 * Selector de idioma de las webs públicas (#207). Cada opción es un enlace
 * real con `hreflang`: funciona sin JavaScript y los buscadores descubren la
 * otra versión. Sin banderas, porque un idioma no es un país.
 */
const LanguageSwitcher = React.forwardRef<HTMLElement, LanguageSwitcherProps>(
  ({ value, languages, onChange, variant = "segmented", label = "Idioma", className, ...props }, ref) => {
    const current = languages.find((language) => language.code === value);

    const link = (language: LanguageOption, classes: string, text: React.ReactNode) => {
      const active = language.code === value;
      return (
        <a
          key={language.code}
          href={language.href}
          hrefLang={language.code}
          lang={language.code}
          aria-current={active ? "true" : undefined}
          title={language.label}
          onClick={() => onChange?.(language.code)}
          className={cn(classes, focusRingOutside)}
        >
          {text}
        </a>
      );
    };

    if (variant === "menu") {
      // `<details>` nativo: abre y cierra sin JavaScript.
      return (
        <nav ref={ref} aria-label={label} className={cn("relative", className)} {...props}>
          <details className="group">
            <summary
              className={cn(
                "flex h-8 cursor-pointer list-none items-center gap-1.5 rounded-md px-2 text-sm text-muted-foreground hover:bg-accent hover:text-foreground [&::-webkit-details-marker]:hidden",
                focusRingOutside,
              )}
            >
              <Languages className="size-4" aria-hidden="true" />
              <span lang={current?.code}>{current?.label ?? value}</span>
              <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
            </summary>
            <ul className="absolute end-0 z-50 mt-1 min-w-40 rounded-lg border border-border bg-popover p-1 shadow-lg">
              {languages.map((language) => (
                <li key={language.code}>
                  {link(
                    language,
                    cn(
                      "flex rounded-md px-3 py-2 text-sm text-foreground hover:bg-accent",
                      language.code === value && "font-semibold text-primary",
                    ),
                    language.label,
                  )}
                </li>
              ))}
            </ul>
          </details>
        </nav>
      );
    }

    return (
      <nav
        ref={ref}
        aria-label={label}
        className={cn("inline-flex items-center gap-0.5 rounded-lg border border-border bg-surface p-0.5", className)}
        {...props}
      >
        {languages.map((language) =>
          link(
            language,
            cn(
              "inline-flex h-7 items-center rounded-md px-2 text-xs font-semibold text-muted-foreground no-underline transition-colors hover:text-foreground",
              language.code === value && "bg-background text-foreground shadow-sm",
            ),
            <>
              <span aria-hidden="true">{language.short ?? language.code.toUpperCase()}</span>
              <span className="sr-only">{language.label}</span>
            </>,
          ),
        )}
      </nav>
    );
  },
);
LanguageSwitcher.displayName = "LanguageSwitcher";

export { LanguageSwitcher };
