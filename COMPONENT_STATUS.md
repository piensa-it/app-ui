# Estado y hoja de ruta de componentes

Este inventario registra la madurez del catálogo público. No sustituye los
issues: indica qué puede consumirse hoy y qué necesita trabajo antes de `1.0.0`.

## Estados

- **Estable**: contrato y estilos suficientemente consolidados.
- **Requiere migración**: funciona, pero debe adoptar las recetas, tokens o API
  objetivo.
- **Requiere auditoría**: necesita validación específica de interacción,
  accesibilidad o responsive.
- **Experimental**: su contrato puede cambiar de forma sustancial.
- **Deprecated**: se mantiene temporalmente con una ruta de reemplazo.

## Inventario

| Área | Componente | Estado | Trabajo principal |
| --- | --- | --- | --- |
| Provider | UiProvider | Requiere auditoría | Verificar montaje múltiple, SSR y documentación |
| Primitiva | Button | Requiere migración | Adoptar receta única, densidades y reduced motion |
| Primitiva | Badge | Requiere migración | Alinear variantes semánticas y contraste |
| Primitiva | Card | Requiere migración | Adoptar niveles de superficie y elevación |
| Formulario | Input | Requiere migración | Adoptar receta común, tamaños e invalid |
| Formulario | Textarea | Requiere migración | Adoptar receta común, tamaños e invalid |
| Formulario | Label | Requiere auditoría | Required, disabled y composición con Field |
| Primitiva | Separator | Estable | Completar test de humo |
| Formulario | Select | Requiere migración | Preservar tipo de value y compartir receta de trigger |
| Formulario | MultiSelect | Requiere auditoría | Teclado, anuncios y contenido largo |
| Formulario | AutoComplete | Requiere auditoría | Teclado, empty, loading y anuncios |
| Formulario | Checkbox | Requiere migración | Adoptar receta compartida y estados invalid |
| Formulario | RadioGroup | Requiere auditoría | Teclado, orientación y descripción accesible |
| Formulario | Switch | Requiere auditoría | Label, estado y target táctil |
| Formulario | Slider | Requiere auditoría | Teclado, valores y orientación |
| Overlay | Dialog | Requiere auditoría | Foco, nombres accesibles, mobile y reduced motion |
| Overlay | AlertDialog | Requiere auditoría | Foco, acción destructiva y API imperativa |
| Overlay | Sheet | Requiere migración | Renombrar archivo, responsive y reduced motion |
| Overlay | Popover | Requiere auditoría | Posicionamiento, foco y dismiss behavior |
| Overlay | Tooltip | Requiere auditoría | Teclado, touch y tiempos de apertura |
| Navegación | Tabs | Requiere auditoría | Teclado, orientación y overflow responsive |
| Navegación | Accordion | Requiere auditoría | Teclado, headings y reduced motion |
| Datos | Avatar | Requiere auditoría | Fallback, imagen rota y nombres accesibles |
| Datos | Progress | Requiere auditoría | Label, valores y modo indeterminado |
| Feedback | Toast | Requiere auditoría | Live regions, límites y acciones |
| Datos | DataTable | Experimental | Sorting accesible, estados, responsive y API |
| Formulario | DatePicker | Experimental | Teclado completo, locale, constraints y mobile |
| Datos | Chart | Experimental | Accesibilidad, responsive, leyenda y series |
| Formulario | FileUpload | Experimental | Errores, drag and drop y progreso accesible |
| Layout | Layout | Requiere migración | Container, slots responsive y uso de `cn` |
| Layout | GlobalErrorBoundary | Requiere auditoría | Recuperación, contenido y telemetría inyectable |
| Marketing | PublicHeader | Requiere auditoría | Navegación mobile, teclado y scroll behavior |
| Marketing | PublicFooter | Requiere auditoría | Responsive, landmarks y contenido largo |
| Marketing | ImageCarouselBackdrop | Experimental | Reduced motion, rendimiento y legibilidad |

## Patrones faltantes priorizados

No se incorporarán hasta consolidar las Fases 1 a 4.

1. Field y FormMessage.
2. Alert o Callout.
3. Skeleton.
4. EmptyState.
5. DropdownMenu.
6. Pagination.
7. SearchInput.
8. PageHeader y Toolbar.
9. TableToolbar.
10. NumberInput y entrada monetaria.
11. Metric o Stat.
12. Breadcrumb.

## Secuencia de trabajo

### Fase 0 — Decisiones y línea base

- [x] Definir propósito y principios.
- [x] Definir dirección visual y firma de marca.
- [x] Adoptar WCAG 2.2 AA.
- [x] Definir presupuestos y Definition of Done.
- [x] Registrar inventario y política pre-1.0.

### Fase 1 — Estabilización técnica

- [ ] Corregir externalización de dependencias y subpaths.
- [ ] Medir el contenido real con `npm pack`.
- [ ] Crear un smoke test de consumo del paquete.
- [ ] Consolidar recetas y eliminar duplicados.
- [ ] Migrar Button, Input y Textarea.
- [ ] Crear una receta compartida para triggers de campo.
- [ ] Corregir el contrato tipado de Select.
- [ ] Normalizar nombres de archivos y APIs públicas.

### Fase 2 — Fundamentos visuales

- [ ] Completar tokens semánticos.
- [ ] Implementar las tres densidades.
- [ ] Definir superficies, elevación y motion.
- [ ] Alinear la identidad cromática entre temas.
- [ ] Retirar la descarga automática de fuentes remotas.
- [ ] Ampliar la documentación visual de tokens.

### Fase 3 — Accesibilidad e interacción

- [ ] Auditar DataTable, overlays y controles de selección.
- [ ] Normalizar icon buttons y targets táctiles.
- [ ] Implementar reduced motion.
- [ ] Validar contraste y estados no dependientes del color.

### Fase 4 — Pruebas y control de calidad

- [ ] Agregar un smoke test por export.
- [ ] Agregar pruebas de teclado y estado.
- [ ] Integrar axe.
- [ ] Agregar contrato de paquete y presupuesto de bundle a CI.
- [ ] Incorporar regresión visual.

### Fase 5 — Patrones UX esenciales

- [ ] Construir los patrones faltantes en el orden priorizado.

### Fase 6 — Documentación y adopción

- [ ] Documentar foundations, guías y recetas de producto completas.
- [ ] Publicar notas de migración y niveles de madurez en Storybook.

## Criterio para avanzar de fase

Una fase se considera terminada cuando sus cambios pasan lint, typecheck, tests,
build y Storybook build, y no quedan decisiones estructurales abiertas que
obliguen a rehacer la fase siguiente.
