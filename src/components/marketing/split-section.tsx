import * as React from "react";

import { cn } from "@/lib/utils";

import { Section, SectionHeading, type SectionProps } from "./section";

export interface SplitSectionProps extends Omit<SectionProps, "title" | "content"> {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  /** Contenido bajo el texto: `Checklist`, botones. */
  content?: React.ReactNode;
  /** Maqueta real del producto al otro lado. */
  media: React.ReactNode;
  /** Pone la maqueta a la izquierda en escritorio. En móvil el texto va primero. */
  reverse?: boolean;
}

/** Texto a un lado y maqueta del producto al otro (Deliver «Plantillas»). */
const SplitSection = React.forwardRef<HTMLElement, SplitSectionProps>(
  ({ eyebrow, title, description, content, media, reverse = false, ...props }, ref) => (
    <Section ref={ref} {...props}>
      <div className="grid items-center gap-12 lg:grid-cols-2">
        <div className={cn("flex flex-col gap-8", reverse && "lg:order-2")}>
          <SectionHeading eyebrow={eyebrow} title={title} description={description} />
          {content}
        </div>
        <div className={cn("min-w-0", reverse && "lg:order-1")}>{media}</div>
      </div>
    </Section>
  ),
);
SplitSection.displayName = "SplitSection";

export { SplitSection };
