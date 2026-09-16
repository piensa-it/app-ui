# Third-party notices

Piensa IT UI Library is built on open-source software. Each dependency remains
the property of its respective copyright holder and is governed by its own
license. The root MIT license applies only to original Piensa IT code.

## Runtime foundations

| Project | Role | License |
| --- | --- | --- |
| [Ark UI](https://ark-ui.com/) and [Zag.js](https://zagjs.com/) | Accessible headless component behavior | MIT |
| [React](https://react.dev/) | Component runtime | MIT |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling | MIT |
| [TanStack Table](https://tanstack.com/table) | Headless data-table behavior | MIT |
| [Recharts](https://recharts.org/) | SVG data visualization | MIT |
| [Framer Motion](https://www.framer.com/motion/) | Motion utilities | MIT |
| [Radix Primitives](https://www.radix-ui.com/primitives) | Label, separator, and slot primitives | MIT |
| [React Aria internationalized date](https://react-spectrum.adobe.com/internationalized/date/) | Internationalized date handling | Apache-2.0 |
| [Class Variance Authority](https://cva.style/) | Component variant composition | Apache-2.0 |
| [Lucide](https://lucide.dev/) | Icons | ISC |
| [clsx](https://github.com/lukeed/clsx) | Conditional class composition | MIT |
| [tailwind-merge](https://github.com/dcastil/tailwind-merge) | Tailwind class conflict resolution | MIT |
| [tailwindcss-animate](https://github.com/jamiebuilds/tailwindcss-animate) | Animation utilities | MIT |

## Optional diagram dependencies

Used only by the `@piensa-it/ui-library/diagramas` entry point. They are
optional peer dependencies: the package does not install or bundle them, and
applications that never import `/diagramas` do not need them. Applications that
do install them and ship them in their own bundles take on their licenses.

| Project | Role | License |
| --- | --- | --- |
| [React Flow](https://reactflow.dev/) (`@xyflow/react`) | Interactive canvas: pan, zoom, custom nodes | MIT |
| [Eclipse Layout Kernel](https://eclipse.dev/elk/) via [elkjs](https://github.com/kieler/elkjs) | Layered layout and orthogonal edge routing | EPL-2.0 (elkjs is offered as `EPL-2.0 OR GPL-3.0-or-later`) |

EPL-2.0 is a weak, file-level copyleft: distributing the unmodified `elkjs`
build inside a proprietary application is permitted, provided the EPL-2.0
notice travels with it and the source of ELK remains available (it is, at
the upstream repositories above). Modifications to ELK's own files would have
to be released under EPL-2.0; Piensa IT code that merely calls ELK is not
affected. The library loads `elkjs` with a dynamic import, so it ends up in a
separate chunk of the consuming application's bundle.

Exact versions and the complete transitive dependency graph are recorded in
`package-lock.json`. License texts distributed by dependencies remain
available in their respective packages. This notice is informational and does
not replace those licenses.

