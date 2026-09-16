import * as React from "react";
import { Mail, MessageCircle } from "lucide-react";

import { cn } from "@/lib/utils";
import { focusRingOutside } from "@/lib/recipes/focus";

import { mailtoHref, whatsappHref } from "./contact-links";

export type ContactChannel =
  | { type: "whatsapp"; phone: string; message?: string; label?: React.ReactNode; description?: React.ReactNode }
  | { type: "email"; address: string; subject?: string; label?: React.ReactNode; description?: React.ReactNode }
  | { type: "link"; href: string; label: React.ReactNode; description?: React.ReactNode; icon?: React.ReactNode };

export interface ContactSectionProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  channels: ContactChannel[];
  /**
   * - `cards`: una tarjeta por canal (AdapterDian).
   * - `centered`: botones centrados bajo el texto (CoreLink).
   * - `aside`: lista vertical para ir junto a un formulario (piensait.com).
   * @default "cards"
   */
  layout?: "cards" | "centered" | "aside";
  /** Nota bajo los canales (CoreLink: por qué no se publican precios). */
  note?: React.ReactNode;
}

function resolve(channel: ContactChannel) {
  switch (channel.type) {
    case "whatsapp":
      return {
        href: whatsappHref(channel.phone, channel.message),
        label: channel.label ?? "WhatsApp",
        description: channel.description ?? channel.phone,
        icon: <MessageCircle />,
        external: true,
      };
    case "email":
      return {
        href: mailtoHref(channel.address, channel.subject),
        label: channel.label ?? channel.address,
        description: channel.description,
        icon: <Mail />,
        external: false,
      };
    default:
      return { href: channel.href, label: channel.label, description: channel.description, icon: channel.icon, external: /^https?:/.test(channel.href) };
  }
}

/** Contacto por WhatsApp, correo u otros canales, con los enlaces armados a partir de los datos. */
const ContactSection = React.forwardRef<HTMLDivElement, ContactSectionProps>(
  ({ title, description, channels, layout = "cards", note, className, ...props }, ref) => {
    const items = channels.map(resolve);
    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-8", layout === "centered" && "items-center text-center", className)}
        {...props}
      >
        {(title || description) && (
          <div className={cn("flex max-w-2xl flex-col gap-3", layout === "centered" && "items-center")}>
            {title && <h2 className="font-heading text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{title}</h2>}
            {description && <p className="text-lg text-muted-foreground text-pretty">{description}</p>}
          </div>
        )}
        <ul
          className={cn(
            layout === "cards" && "grid gap-4 sm:grid-cols-2 lg:grid-cols-3",
            layout === "centered" && "flex flex-wrap justify-center gap-3",
            layout === "aside" && "flex flex-col divide-y divide-border",
          )}
        >
          {items.map((item, index) => (
            <li key={index} className={cn(layout === "aside" && "py-4 first:pt-0")}>
              <a
                href={item.href}
                {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className={cn(
                  "group flex items-center gap-3 no-underline",
                  layout === "cards" && "h-full rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40",
                  layout === "centered" &&
                    "rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40",
                  focusRingOutside,
                )}
              >
                {item.icon && (
                  <span aria-hidden="true" className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary [&_svg]:size-4">
                    {item.icon}
                  </span>
                )}
                <span className="flex min-w-0 flex-col text-start">
                  <span className="font-medium text-foreground">{item.label}</span>
                  {item.description && layout !== "centered" && (
                    <span className="truncate font-mono text-xs text-muted-foreground">{item.description}</span>
                  )}
                </span>
              </a>
            </li>
          ))}
        </ul>
        {note && <p className="max-w-xl text-sm text-muted-foreground">{note}</p>}
      </div>
    );
  },
);
ContactSection.displayName = "ContactSection";

export { ContactSection };
