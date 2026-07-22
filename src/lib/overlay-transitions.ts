/**
 * Presets de animación de entrada/salida para los overlays de PrimeReact
 * (Dropdown, MultiSelect, AutoComplete, Calendar, Popover, Sidebar, Dialog,
 * Accordion...). PrimeReact anima cada overlay con `CSSTransition` de
 * react-transition-group vía la prop `transitionOptions`/`transition`, que
 * agrega y quita clases literales en cada fase (`enter`, `enterActive`,
 * `exit`, `exitActive`) — a diferencia de Radix, que expone atributos
 * `data-state` y deja que el CSS reaccione solo.
 *
 * Reusamos las utilidades de `tailwindcss-animate` (ya instalado como
 * dependencia y registrado en `tailwind-preset.js`) para no reinventar
 * keyframes: `animate-in`/`animate-out` + `fade-in-0`/`zoom-in-95`/
 * `slide-in-from-*`, el mismo lenguaje visual que usan shadcn/Radix.
 */
import type { CSSTransitionProps } from "primereact/csstransition";

/** Paneles flotantes que aparecen debajo/encima de su trigger (Dropdown, MultiSelect, AutoComplete, Calendar, Popover). */
export const overlayPanelTransition: CSSTransitionProps = {
  timeout: { enter: 150, exit: 100 },
  classNames: {
    enter: "opacity-0 scale-95 -translate-y-1",
    enterActive: "opacity-100 scale-100 translate-y-0 transition-all duration-150 ease-out",
    exit: "opacity-100 scale-100",
    exitActive: "opacity-0 scale-95 transition-all duration-100 ease-in",
  },
};

/** Modales centrados (Dialog, ConfirmDialog). */
export const dialogTransition: CSSTransitionProps = {
  timeout: { enter: 200, exit: 150 },
  classNames: {
    enter: "opacity-0 scale-95",
    enterActive: "opacity-100 scale-100 transition-all duration-200 ease-out",
    exit: "opacity-100 scale-100",
    exitActive: "opacity-0 scale-95 transition-all duration-150 ease-in",
  },
};

/**
 * Paneles laterales (Sidebar/Sheet) — entra deslizando desde el borde
 * correspondiente. Las clases están escritas como literales completos (no
 * interpoladas) a propósito: el escáner de contenido de Tailwind busca
 * substrings literales en el código fuente, y una clase armada con
 * template strings (`translate-${axis}-0`) nunca aparece completa en el
 * archivo, así que Tailwind no la generaría.
 */
const SIDEBAR_TRANSITIONS: Record<"left" | "right" | "top" | "bottom", CSSTransitionProps> = {
  left: {
    timeout: { enter: 300, exit: 200 },
    classNames: {
      enter: "-translate-x-full opacity-0",
      enterActive: "translate-x-0 opacity-100 transition-all duration-300 ease-out",
      exit: "opacity-100",
      exitActive: "-translate-x-full opacity-0 transition-all duration-200 ease-in",
    },
  },
  right: {
    timeout: { enter: 300, exit: 200 },
    classNames: {
      enter: "translate-x-full opacity-0",
      enterActive: "translate-x-0 opacity-100 transition-all duration-300 ease-out",
      exit: "opacity-100",
      exitActive: "translate-x-full opacity-0 transition-all duration-200 ease-in",
    },
  },
  top: {
    timeout: { enter: 300, exit: 200 },
    classNames: {
      enter: "-translate-y-full opacity-0",
      enterActive: "translate-y-0 opacity-100 transition-all duration-300 ease-out",
      exit: "opacity-100",
      exitActive: "-translate-y-full opacity-0 transition-all duration-200 ease-in",
    },
  },
  bottom: {
    timeout: { enter: 300, exit: 200 },
    classNames: {
      enter: "translate-y-full opacity-0",
      enterActive: "translate-y-0 opacity-100 transition-all duration-300 ease-out",
      exit: "opacity-100",
      exitActive: "translate-y-full opacity-0 transition-all duration-200 ease-in",
    },
  },
};

export function sidebarTransition(position: "left" | "right" | "top" | "bottom" = "right"): CSSTransitionProps {
  return SIDEBAR_TRANSITIONS[position];
}

/** Contenido colapsable (Accordion). */
export const collapseTransition: CSSTransitionProps = {
  timeout: { enter: 200, exit: 150 },
  classNames: {
    enter: "opacity-0",
    enterActive: "opacity-100 transition-opacity duration-200 ease-out",
    exit: "opacity-100",
    exitActive: "opacity-0 transition-opacity duration-150 ease-in",
  },
};
