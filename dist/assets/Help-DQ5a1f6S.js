import{r as l,j as e}from"./vendor-query-Dn4GYd0W.js";import{c as ne}from"./vendor-react-BtnfmFen.js";import{C as se,a as re}from"./card-CfG-k3yC.js";import{u as te,P as H,i as ie,j as ce,k as W,l as le,m as de,n as ue,o as D,C as me,U as pe,p as V,B as ge}from"./index-S3LUqkq-.js";import{R as fe,m as ve,C as he,n as $,L as be,P as xe,B as ye,S as je,o as Ce,p as Ae,F as qe,I as Ne,q as Pe,d as Ee,r as Ie,W as O,s as Re}from"./PageTransition-oDSaAVaL.js";import{C as Se,a as we,R as De,b as Te}from"./rocket-CzFMZHpn.js";import{C as _e,M as Le}from"./message-circle-C8TkJeDj.js";import{A as ke}from"./arrow-left-BiIM6Myl.js";import"./vendor-charts-spixuzLh.js";import"./user-C-xVahPs.js";import"./circle-check-DjSwRXSy.js";var ze=Object.defineProperty,m=(c,n)=>ze(c,"name",{value:n,configurable:!0}),g="Accordion",Me=["Home","End","ArrowDown","ArrowUp","ArrowLeft","ArrowRight"],[T,Ue,Ve]=ie(g),[j]=ce(g,[Ve,$]),_=$(),Oe=l.forwardRef(m(function(n,a){const{type:o,...r}=n,s=r,t=r;return e.jsx(T.Provider,{scope:n.__scopeAccordion,children:o==="multiple"?e.jsx(We,{...t,ref:a}):e.jsx(He,{...s,ref:a})})},"Accordion")),[G,Fe]=j(g),[Q,Be]=j(g,{collapsible:!1}),He=l.forwardRef(m(function(n,a){const{value:o,defaultValue:r,onValueChange:s=m(()=>{},"onValueChange"),collapsible:t=!1,...d}=n,[i,u]=W({prop:o,defaultProp:r??"",onChange:s,caller:g});return e.jsx(G,{scope:n.__scopeAccordion,value:l.useMemo(()=>i?[i]:[],[i]),onItemOpen:u,onItemClose:l.useCallback(()=>t&&u(""),[t,u]),children:e.jsx(Q,{scope:n.__scopeAccordion,collapsible:t,children:e.jsx(Y,{...d,ref:a})})})},"AccordionImplSingle")),We=l.forwardRef(m(function(n,a){const{value:o,defaultValue:r,onValueChange:s=m(()=>{},"onValueChange"),...t}=n,[d,i]=W({prop:o,defaultProp:r??[],onChange:s,caller:g}),u=l.useCallback(h=>i((v=[])=>[...v,h]),[i]),p=l.useCallback(h=>i((v=[])=>v.filter(A=>A!==h)),[i]);return e.jsx(G,{scope:n.__scopeAccordion,value:d,onItemOpen:u,onItemClose:p,children:e.jsx(Q,{scope:n.__scopeAccordion,collapsible:!0,children:e.jsx(Y,{...t,ref:a})})})},"AccordionImplMultiple")),[$e,C]=j(g),Y=l.forwardRef(m(function(n,a){const{__scopeAccordion:o,disabled:r,dir:s,orientation:t="vertical",...d}=n,i=l.useRef(null),u=le(i,a),p=Ue(o),v=de(s)==="ltr",A=ue(n.onKeyDown,x=>{var M;if(!Me.includes(x.key))return;const ae=x.target,q=p().filter(R=>{var U;return!((U=R.ref.current)!=null&&U.disabled)}),y=q.findIndex(R=>R.ref.current===ae),z=q.length;if(y===-1)return;x.preventDefault();let f=y;const N=0,P=z-1,E=m(()=>{f=y+1,f>P&&(f=N)},"moveNext"),I=m(()=>{f=y-1,f<N&&(f=P)},"movePrev");switch(x.key){case"Home":f=N;break;case"End":f=P;break;case"ArrowRight":t==="horizontal"&&(v?E():I());break;case"ArrowDown":t==="vertical"&&E();break;case"ArrowLeft":t==="horizontal"&&(v?I():E());break;case"ArrowUp":t==="vertical"&&I();break}const oe=f%z;(M=q[oe].ref.current)==null||M.focus()});return e.jsx($e,{scope:o,disabled:r,direction:s,orientation:t,children:e.jsx(T.Slot,{scope:o,children:e.jsx(H.div,{...d,"data-orientation":t,ref:u,onKeyDown:r?void 0:A})})})},"AccordionImpl")),w="AccordionItem",[Ge,L]=j(w),Qe=l.forwardRef(m(function(n,a){const{__scopeAccordion:o,value:r,...s}=n,t=C(w,o),d=Fe(w,o),i=_(o),u=te(),p=r&&d.value.includes(r)||!1,h=t.disabled||n.disabled;return e.jsx(Ge,{scope:o,open:p,disabled:h,triggerId:u,children:e.jsx(fe,{"data-orientation":t.orientation,"data-state":k(p),...i,...s,ref:a,disabled:h,open:p,onOpenChange:v=>{v?d.onItemOpen(r):d.onItemClose(r)}})})},"AccordionItem")),Ye="AccordionHeader",Ke=l.forwardRef(m(function(n,a){const{__scopeAccordion:o,...r}=n,s=C(g,o),t=L(Ye,o);return e.jsx(H.h3,{"data-orientation":s.orientation,"data-state":k(t.open),"data-disabled":t.disabled?"":void 0,...r,ref:a})},"AccordionHeader")),F="AccordionTrigger",Je=l.forwardRef(m(function(n,a){const{__scopeAccordion:o,...r}=n,s=C(g,o),t=L(F,o),d=Be(F,o),i=_(o);return e.jsx(T.ItemSlot,{scope:o,children:e.jsx(ve,{"aria-disabled":t.open&&!d.collapsible||void 0,"data-orientation":s.orientation,id:t.triggerId,...i,...r,ref:a})})},"AccordionTrigger")),Xe="AccordionContent",Ze=l.forwardRef(m(function(n,a){const{__scopeAccordion:o,...r}=n,s=C(g,o),t=L(Xe,o),d=_(o);return e.jsx(he,{role:"region","aria-labelledby":t.triggerId,"data-orientation":s.orientation,...d,...r,ref:a,style:{"--radix-accordion-content-height":"var(--radix-collapsible-content-height)","--radix-accordion-content-width":"var(--radix-collapsible-content-width)",...n.style}})},"AccordionContent"));function k(c){return c?"open":"closed"}m(k,"getState");var ea=Oe,aa=Qe,oa=Ke,K=Je,J=Ze;const na=ea,X=l.forwardRef(({className:c,...n},a)=>e.jsx(aa,{ref:a,className:D("border-b",c),...n}));X.displayName="AccordionItem";const Z=l.forwardRef(({className:c,children:n,...a},o)=>e.jsx(oa,{className:"flex",children:e.jsxs(K,{ref:o,className:D("flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-state=open]>svg]:rotate-180",c),...a,children:[n,e.jsx(me,{className:"h-4 w-4 shrink-0 transition-transform duration-200"})]})}));Z.displayName=K.displayName;const ee=l.forwardRef(({className:c,children:n,...a},o)=>e.jsx(J,{ref:o,className:"overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down",...a,children:e.jsx("div",{className:D("pb-4 pt-0",c),children:n})}));ee.displayName=J.displayName;const b=c=>c.split(/(\*\*[^*]+\*\*)/g).map((a,o)=>a.startsWith("**")&&a.endsWith("**")?e.jsx("strong",{children:a.slice(2,-2)},o):e.jsx(l.Fragment,{children:a},o)),sa=c=>{const n=[];let a=null;const o=()=>{a&&n.push(a),a=null};for(const r of c.split(`
`)){const s=r.trimEnd();if(!s.trim()){o();continue}s.startsWith("### ")?(o(),n.push({type:"h3",lines:[s.slice(4)]})):s.startsWith("## ")?(o(),n.push({type:"h2",lines:[s.slice(3)]})):s.startsWith("# ")?(o(),n.push({type:"h1",lines:[s.slice(2)]})):/^\s*- /.test(s)?((a==null?void 0:a.type)!=="ul"&&(o(),a={type:"ul",lines:[]}),a.lines.push(s.replace(/^\s*- /,""))):/^\s*\d+\. /.test(s)?((a==null?void 0:a.type)!=="ol"&&(o(),a={type:"ol",lines:[]}),a.lines.push(s.replace(/^\s*\d+\. /,""))):((a==null?void 0:a.type)!=="p"&&(o(),a={type:"p",lines:[]}),a.lines.push(s))}return o(),n};function ra({markdown:c}){const n=sa(c);return e.jsx("div",{className:"space-y-4",children:n.map((a,o)=>{switch(a.type){case"h1":return e.jsx("h1",{className:"text-2xl font-bold tracking-tight",children:b(a.lines[0])},o);case"h2":return e.jsx("h2",{className:"text-lg font-semibold mt-6",children:b(a.lines[0])},o);case"h3":return e.jsx("h3",{className:"text-base font-semibold mt-4",children:b(a.lines[0])},o);case"ul":return e.jsx("ul",{className:"list-disc pl-6 space-y-1.5 text-sm leading-relaxed",children:a.lines.map((r,s)=>e.jsx("li",{children:b(r)},s))},o);case"ol":return e.jsx("ol",{className:"list-decimal pl-6 space-y-1.5 text-sm leading-relaxed",children:a.lines.map((r,s)=>e.jsx("li",{children:b(r)},s))},o);default:return e.jsx("p",{className:"text-sm leading-relaxed text-muted-foreground",children:b(a.lines.join(" "))},o)}})})}const ta=`# Primeros pasos en Mis Finanzas

Bienvenido. Esta guía te lleva de cero a tener tus finanzas organizadas en pocos minutos.

## 1. Crea tu cuenta e inicia sesión

- Regístrate con tu correo y una contraseña segura.
- Si olvidas la contraseña, usa **¿Olvidaste tu contraseña?** en la pantalla de ingreso: te llegará un correo para restablecerla.
- Tu información es privada: solo tú puedes ver tus cuentas y movimientos.

## 2. Configura tus cuentas

Ve a **Datos Maestros → Medios de Pago** y crea las cuentas con las que manejas tu dinero: cuenta de ahorros, efectivo, billetera digital, tarjeta de crédito, etc.

Consejo: crea primero las 2 o 3 que más usas. Siempre podrás agregar más.

## 3. Registra tus primeros movimientos

Usa el botón **+** para registrar un ingreso o un gasto. Elige la categoría, el valor, la fecha y la cuenta con la que pagaste.

## 4. Explora tu dashboard

En **Dashboard** verás tu saldo total, tus ingresos y gastos, y en qué se está yendo tu dinero. Entre más movimientos registres, más útil se vuelve.

## 5. Automatiza

- **Recurrentes**: programa tu salario, arriendo o suscripciones para que se registren solos.
- **Correos y sugerencias**: reenvía las notificaciones de tu banco y la plataforma detectará los movimientos por ti (tú siempre confirmas antes de que se registren).
- **Presupuestos**: define cuánto quieres gastar por categoría y recibe alertas al acercarte al límite.

Cada una de estas funciones tiene su propio manual en este menú de Ayuda.
`,ia=`# Cuentas, medios de pago y tarjetas de crédito

En **Datos Maestros → Medios de Pago** administras las cuentas con las que manejas tu dinero.

## Tipos de cuenta

- **Dinero tuyo (activos)**: cuenta de ahorros, cuenta corriente, efectivo, tarjeta débito, billetera digital, cuenta de inversión.
- **Deuda (pasivos)**: tarjeta de crédito. El dinero de la tarjeta no es tuyo: es un cupo que el banco te presta.

Esta diferencia es clave para que tus números sean reales: la plataforma nunca mezcla tu dinero disponible con el cupo de tus tarjetas.

## Crear una cuenta

Pulsa **Agregar** y completa:

- **Nombre, tipo y moneda**.
- **Entidad financiera**: el banco o billetera (ej: Bancolombia, Nequi).
- **Saldo inicial** (cuentas de dinero propio): con cuánto empieza la cuenta; desde ahí el saldo se calcula solo con tus movimientos.
- **Cupo total, día de corte y día límite de pago** (tarjetas de crédito).
- **Últimos 4 dígitos**: si los registras, las notificaciones que reenvíes desde tu banco se asociarán automáticamente a esta cuenta.

## ¿Cómo funciona una tarjeta de crédito aquí?

1. **Cuando compras con la tarjeta**: se registra un gasto normal (cuenta en tus gastos del mes y en tus presupuestos), pero tu dinero disponible **no** baja. Lo que sube es la **deuda** de la tarjeta, y baja su **cupo disponible**.
2. **Cuando pagas la tarjeta**: usa el botón **Pagar tarjeta**. Sale dinero de tu banco y baja la deuda de la tarjeta. Esto **no** es un gasto (el gasto real ya ocurrió cuando compraste) — así evitamos que la misma compra se cuente dos veces.
3. **Intereses y cuota de manejo**: esos sí son gastos nuevos; regístralos como gasto en la categoría Deudas.

## Traslados entre cuentas

Usa **Trasladar** para mover dinero entre tus propias cuentas (por ejemplo, retirar de la cuenta al efectivo). Los traslados no cuentan como ingreso ni gasto: tu dinero solo cambió de lugar.

## Tus indicadores

- **Disponible**: la suma de tus cuentas de dinero real.
- **Deuda**: lo que debes en tus tarjetas.
- **Saldo total (patrimonio)**: disponible menos deuda — tu foto financiera honesta.
`,ca=`# Registrar ingresos, gastos y movimientos

En **Transacciones** vives el día a día de tus finanzas.

## Crear un movimiento

Pulsa el botón **+** (disponible en toda la app) y completa:

- **Tipo**: ingreso o gasto.
- **Valor y moneda**.
- **Fecha**: el día en que realmente ocurrió el movimiento.
- **Categoría** (y subcategoría si quieres más detalle).
- **Medio de pago / cuenta**: con qué pagaste o dónde recibiste el dinero.
- **Descripción** y, si aplica, el **comercio** donde compraste.
- Puedes adjuntar una foto del recibo o factura.

## Editar y eliminar

Toca cualquier movimiento de la lista para editarlo o eliminarlo. Los cambios se reflejan de inmediato en tu dashboard y reportes.

## Buscar y filtrar

Usa los filtros para encontrar movimientos por tipo, categoría, medio de pago, rango de fechas o texto de la descripción. El filtro de **medio de pago** muestra tus cuentas reales (las que creaste en "Medios de pago"); marca o desmarca las que quieras incluir. Las tarjetas de resumen (Ingresos, Gastos y Balance) y el botón **Exportar CSV** reflejan todo el conjunto que coincide con los filtros, no solo la página que estás viendo.

## Tipos de movimiento que verás

- **Ingreso / Gasto**: los únicos que cuentan en tu flujo de caja y presupuestos.
- **Transferencia**: dinero que se movió entre tus cuentas (traslados y pagos de tarjeta). No suma ni resta a tus ingresos/gastos.
- **Ajuste**: correcciones de saldo (por ejemplo, cuadrar el efectivo real).

## Consejos

- Registra los gastos el mismo día: dos minutos al día valen más que una hora a fin de mes.
- Asocia siempre la cuenta correcta: así tus saldos por cuenta serán exactos.
- Para gastos que se repiten cada mes, mejor usa **Recurrentes** (tiene su propio manual).
`,la=`# Presupuestos

En **Presupuestos** defines cuánto quieres gastar y la plataforma te avisa antes de pasarte.

## Crear un presupuesto

1. Pulsa **Nuevo presupuesto**.
2. Elige el alcance:
   - **Por categoría**: por ejemplo, $600.000 para Alimentación.
   - **Global**: un límite para todos tus gastos del mes.
3. Define el **monto mensual**.
4. Ajusta la **alerta**: el porcentaje al que quieres ser avisado (por defecto 80%).
5. Decide si aplica **solo este mes** o **todos los meses**.

## Cómo leer tu presupuesto

Cada tarjeta muestra:

- La barra de progreso de lo gastado en el mes.
- **Gastado / presupuestado** y el porcentaje consumido.
- Lo que te queda **disponible**, o en cuánto te **excediste**.
- Una insignia de alerta cuando cruzas tu umbral (**Cerca del límite**) o superas el 100% (**Excedido**).

## Detalles que ayudan

- Solo cuentan los **gastos** reales: las transferencias entre tus cuentas y los pagos de tarjeta no consumen presupuesto (la compra con tarjeta sí, en el momento en que la haces).
- Los presupuestos de "todos los meses" se reinician automáticamente cada mes.
- Puedes editar o eliminar un presupuesto cuando quieras; tus movimientos no se tocan.

## Sugerencia para empezar

Crea un presupuesto global realista el primer mes. Cuando conozcas tus números, agrega presupuestos por categoría para las 3 donde más se te va el dinero.
`,da=`# Movimientos recurrentes

En **Recurrentes** programas los ingresos y gastos que se repiten — salario, arriendo, servicios, suscripciones, cuotas — para que se registren solos.

## Programar un movimiento

1. Pulsa **Programar Movimiento**.
2. Completa: tipo (ingreso/gasto), nombre, valor, categoría y cuenta (opcionales), **fecha de inicio** y **periodicidad** (diario, semanal, quincenal, mensual o anual).
3. Si tiene fin conocido (por ejemplo, la cuota 12 de 12), define la **fecha de fin**. Si no, déjala vacía.

## Cómo se generan

- Al entrar a la pantalla, la plataforma registra automáticamente las ocurrencias vencidas de tus reglas activas.
- También puedes forzarlo con **Generar pendientes**.
- **Sin duplicados garantizado**: si la generación se ejecuta dos veces (o entras desde dos dispositivos), cada periodo se registra una sola vez.

## Qué verás en cada tarjeta

- El valor y tipo del movimiento.
- Su periodicidad y fecha de inicio.
- La **próxima fecha** en que se generará (o "Finalizado" si ya terminó).

## Editar, pausar o eliminar

- **Editar** cambia la regla hacia adelante; los movimientos ya generados no se modifican.
- Para pausar una regla sin borrarla, edítala y desactívala.
- **Eliminar** la regla no borra los movimientos que ya se registraron.

## Ejemplos típicos

- Salario: ingreso mensual el día de pago, asociado a tu cuenta bancaria.
- Arriendo: gasto mensual el día 5, categoría Vivienda.
- Suscripción: gasto mensual, asociado a la tarjeta con la que se cobra.
`,ua=`# Correos bancarios y sugerencias automáticas

La plataforma puede leer las notificaciones que te envía tu banco y convertirlas en sugerencias de movimientos. Tú siempre tienes la última palabra: **nada se registra sin tu confirmación**.

## Cómo activarlo

1. En tu **Perfil**, registra el correo desde el que vas a reenviar (debe ser tuyo).
2. Cuando te llegue una notificación del banco (compra, pago, transferencia recibida), **reenvíala a trx@misfin.co** desde ese correo.
3. En unos segundos aparecerá en **Correos y sugerencias**.

## Qué detecta

De cada notificación intentamos extraer: tipo (ingreso/gasto), valor, fecha, comercio, banco, últimos 4 dígitos de la tarjeta o cuenta, y la referencia de la transacción.

Hoy reconocemos con precisión notificaciones de **Bancolombia, Nequi, Davivienda y DaviPlata**; para otras entidades usamos una detección genérica que siempre te pedirá revisar los datos. Iremos agregando más bancos.

Cada sugerencia muestra su **nivel de confianza**. Si los datos no son claros, verás la marca **Revisar datos**: revísalos antes de confirmar.

**Tip**: si registras los **últimos 4 dígitos** de tus tarjetas en Medios de Pago, la sugerencia se asociará sola a la tarjeta correcta (verás "****1234 → Tu tarjeta").

## Tus tres opciones

- **Confirmar**: registra el movimiento tal como se detectó.
- **Corregir**: ajusta valor, fecha, descripción, categoría o cuenta antes de registrarlo.
- **Descartar**: no era un movimiento (o no quieres registrarlo). No se guarda nada.

## Estados que verás

- **Por confirmar**: esperando tu decisión.
- **Confirmado**: ya es un movimiento en tus transacciones.
- **Descartado**: lo rechazaste o no tenía contenido financiero.
- **Duplicado**: ese correo ya había sido procesado — reenviar dos veces no duplica nada.
- **Error**: algo falló; puedes usar **Reintentar**.

## Seguridad y privacidad

- Solo se procesan correos que llegan desde direcciones registradas en tu perfil.
- Tus correos y sugerencias son privados: ningún otro usuario puede verlos.
- El contenido del correo solo se usa para extraer el movimiento y que tú lo verifiques.
`,ma=`# Dashboard y reportes

## Dashboard

Tu **Dashboard** es la foto de tus finanzas:

- **Saldo total (patrimonio)**: tu dinero disponible menos la deuda de tus tarjetas.
- **Saldo por cuenta**: cuánto hay en cada cuenta. En las tarjetas de crédito verás la **deuda** y el **cupo disponible** en lugar de un saldo.
- **Ingresos y gastos**: cuánto ha entrado y salido. Las transferencias entre tus cuentas y los pagos de tarjeta no inflan estas cifras.
- **Distribución de gastos**: en qué categorías se va tu dinero.
- **Últimos movimientos**: acceso rápido para revisar o corregir.

## Reportes

En **Reportes** puedes analizar tu comportamiento por mes:

- Gastos por categoría del mes elegido.
- Comparación entre lo presupuestado y lo realmente gastado.
- Evolución de tus ingresos y gastos a lo largo del tiempo.

## Cómo leer tus números

- **Flujo neto positivo**: ese mes entró más de lo que salió — vas construyendo ahorro.
- **Flujo neto negativo**: salió más de lo que entró. Revisa la distribución por categoría para encontrar el porqué.
- **La deuda de la tarjeta subió**: compraste más de lo que pagaste de la tarjeta ese mes.

## Un truco honesto

Si tu "disponible" se ve bien pero tu **patrimonio** baja mes a mes, tus tarjetas están creciendo más rápido que tu ahorro. Esa es exactamente la señal que este modelo de tarjetas te ayuda a ver a tiempo.
`,pa=`# Categorías y subcategorías

Las categorías son la base para saber **en qué se va tu dinero**. Cada movimiento pertenece a una categoría (y opcionalmente a una subcategoría).

## Categorías predeterminadas

Al crear tu cuenta recibes un set inicial de categorías de gastos (Vivienda, Alimentación, Transporte, Salud, Educación, Entretenimiento, Servicios…) y de ingresos (Salario, Honorarios, Inversiones, Otros ingresos…).

## Crear y personalizar

En **Datos Maestros → Categorías** puedes:

- Crear categorías nuevas con nombre, icono y color propios.
- Editar o eliminar las existentes.
- Agregar **subcategorías** para más detalle (ej: Alimentación → Mercado, Restaurantes, Domicilios).

## Consejos

- Menos es más: entre 8 y 12 categorías de gasto son suficientes para ver patrones claros; demasiadas categorías dispersan la información.
- Usa subcategorías solo donde de verdad quieras el detalle.
- Las categorías alimentan directamente la **distribución de gastos** del dashboard, los **presupuestos** y los **reportes**: si un movimiento quedó mal clasificado, edítalo y las cifras se corrigen al instante.
`,ga=`# Recordatorios de pago

En **Recordatorios de pago** registras compromisos con fecha de vencimiento para que ninguno se te pase: facturas, cuotas, impuestos, renovaciones.

## Crear un recordatorio

Completa: título, monto (opcional), categoría, **fecha de vencimiento** y frecuencia (único o repetitivo).

## Cómo te ayudan

- Aparecen como **próximos pagos** para que planees tu mes.
- Al vencerse generan una notificación en la campana de la app.
- Puedes marcarlos, editarlos o eliminarlos cuando quieras.

## Recordatorio vs. movimiento recurrente

- **Recordatorio**: solo te avisa; no registra nada. Útil para montos variables (la factura de la luz cambia cada mes).
- **Recurrente**: registra el movimiento automáticamente. Útil para montos fijos (arriendo, suscripciones, salario).

Para muchos casos la combinación ideal es: recurrente para lo fijo, recordatorio para lo variable.
`,fa=`# Cuenta familiar

La **cuenta familiar** permite llevar finanzas compartidas (hogar, pareja, familia) sin mezclarlas con tus finanzas personales.

## Cómo funciona

1. En **Cuenta familiar**, crea una familia (tú quedas como propietario).
2. Invita a los miembros; cada uno entra con su propio usuario.
3. Los movimientos, categorías y recordatorios **familiares** son visibles para todos los miembros; tus movimientos **personales** siguen siendo solo tuyos.

## Roles

- **Propietario**: administra la familia, agrega o retira miembros y puede eliminarla.
- **Miembro**: registra y consulta los movimientos familiares; puede salir de la familia cuando quiera.

## Privacidad

La separación es estricta: pertenecer a una familia nunca expone tus cuentas, saldos ni movimientos personales. Solo se comparte lo que se registra explícitamente como familiar.

## Ejemplo de uso

Gastos del hogar (mercado, servicios, arriendo) se registran en la familia; tu salario y tus gastos personales quedan en tu espacio personal. Así cada quien ve lo común sin perder su privacidad.
`,va=`# Logros y rachas

Registrar finanzas es un hábito, y los hábitos se construyen mejor con motivación. La sección **Logros** convierte tu constancia en progreso visible.

## Qué encontrarás

- **Logros**: insignias que desbloqueas al usar la plataforma (primer movimiento registrado, primera semana completa, metas de registro, etc.). Cada logro otorga puntos.
- **Nivel**: sube a medida que acumulas puntos.
- **Racha**: cuenta los días seguidos registrando tus movimientos. Mantenerla es la mejor señal de que tienes el control de tus finanzas.

## Dónde verlo

- En el **Dashboard** hay una tarjeta con tu nivel y racha actual.
- En **Logros** ves todas las insignias, las desbloqueadas y las que faltan.
- Cuando desbloqueas un logro recibes una notificación al instante.

## Un consejo

No registres por los puntos: los puntos existen para que registrar se vuelva costumbre. Con dos minutos al día, el resto de la plataforma (presupuestos, reportes, flujo de caja) trabaja para ti.
`,ha=`# Perfil, correos y configuración

## Tu perfil

Desde el menú de usuario (arriba a la derecha) puedes editar tu nombre y tus correos, cambiar la contraseña, abrir la **Ayuda**, contactar soporte por WhatsApp y cerrar sesión.

## Varios correos, una sola cuenta

Puedes asociar **más de un correo** a tu cuenta:

- Sirven para **iniciar sesión** con cualquiera de ellos.
- Son los remitentes autorizados para la función de **correos bancarios**: solo los correos registrados y verificados pueden alimentar tus sugerencias de movimientos.

Para agregar uno: menú de usuario → Perfil → **Mis correos** → agregar y verificar con el código que te llega.

## Configuración

En **Configuración** ajustas:

- **Moneda principal**: en la que se muestran tus totales (los movimientos en otra moneda se convierten).
- **Formato de cifras**: completo ($1.234.567) o abreviado ($1,2M).
- **Tema**: modo claro/oscuro y color de acento.
- **Idioma** de la interfaz.

## Recuperar contraseña

En la pantalla de ingreso usa **¿Olvidaste tu contraseña?**; te llegará un enlace seguro para crear una nueva. El enlace expira por seguridad — si no lo usas a tiempo, solicita otro.

## Tu privacidad

Tus datos financieros son solo tuyos: la separación por usuario se aplica en la base de datos (no solo en la pantalla), y ningún otro usuario puede ver tus cuentas, movimientos o correos.
`,ba=`# Establecimientos

Los **Establecimientos** son los comercios, empresas, proveedores y contactos de negocio con los que te mueves. Tenerlos guardados te ayuda a reconocer de un vistazo con quién fue cada movimiento y a llevar sus datos de contacto en un solo lugar.

## Qué puedes guardar

Cada establecimiento tiene:

- **Nombre** (obligatorio): cómo lo identificas (ej. "Supermercado El Ahorro").
- **Etiquetas**: clasificaciones libres que tú creas (ej. "Proveedor", "Cliente VIP", "Alimentos"). Un establecimiento puede tener varias.
- **Persona de contacto, teléfono, email y dirección**: sus datos para ubicarlo.
- **Notas**: cualquier detalle útil (acuerdos, descuentos, condiciones de pago).
- **Activo / inactivo**: desactiva los que ya no uses sin perder su historial.

## Cómo se usa

Desde la página de **Establecimientos** puedes agregar, editar y eliminar. Usa el buscador para filtrar por nombre o por etiqueta. Las tarjetas de arriba te muestran cuántos establecimientos tienes y cuántas etiquetas distintas manejas.

Toda esta información queda guardada en tu cuenta: no se pierde al recargar ni al cambiar de dispositivo, y solo tú puedes verla.
`,S=[{id:"primeros-pasos",titulo:"Primeros pasos",descripcion:"De cero a tus finanzas organizadas en minutos",icono:"Rocket",contenido:ta},{id:"cuentas-y-tarjetas",titulo:"Cuentas y tarjetas de crédito",descripcion:"Activos, deudas, cupo disponible y pago de tarjetas sin doble conteo",icono:"CreditCard",contenido:ia},{id:"transacciones",titulo:"Ingresos, gastos y movimientos",descripcion:"Registrar, editar, filtrar y entender los tipos de movimiento",icono:"Receipt",contenido:ca},{id:"presupuestos",titulo:"Presupuestos",descripcion:"Límites por categoría o globales, con alertas antes de pasarte",icono:"PiggyBank",contenido:la},{id:"recurrentes",titulo:"Movimientos recurrentes",descripcion:"Salario, arriendo y suscripciones que se registran solos",icono:"Repeat",contenido:da},{id:"correos-y-sugerencias",titulo:"Correos bancarios y sugerencias",descripcion:"Reenvía tus notificaciones y confirma los movimientos detectados",icono:"Inbox",contenido:ua},{id:"dashboard-y-reportes",titulo:"Dashboard y reportes",descripcion:"Cómo leer tu saldo, tu deuda y tu flujo de caja",icono:"BarChart3",contenido:ma},{id:"categorias",titulo:"Categorías y subcategorías",descripcion:"Organiza en qué se va tu dinero, con categorías propias",icono:"FolderTree",contenido:pa},{id:"recordatorios",titulo:"Recordatorios de pago",descripcion:"Vencimientos y compromisos que no se te pueden pasar",icono:"Bell",contenido:ga},{id:"cuenta-familiar",titulo:"Cuenta familiar",descripcion:"Finanzas compartidas del hogar sin perder tu privacidad",icono:"Users",contenido:fa},{id:"logros",titulo:"Logros y rachas",descripcion:"Convierte el registro diario en un hábito",icono:"Trophy",contenido:va},{id:"perfil-y-correos",titulo:"Perfil, correos y configuración",descripcion:"Varios correos, moneda, tema y recuperación de contraseña",icono:"UserCircle",contenido:ha},{id:"establecimientos",titulo:"Establecimientos",descripcion:"Comercios, proveedores y contactos de negocio con sus datos y etiquetas",icono:"Store",contenido:ba}],xa={Rocket:De,CreditCard:_e,Receipt:Ie,PiggyBank:Ee,Repeat:Pe,Inbox:Ne,BarChart3:we,FolderTree:qe,Bell:Ae,Users:pe,Trophy:Ce,UserCircle:Se,Store:je},B="preguntas-frecuentes",ya="primeros-pasos";function Da(){const[c,n]=ne(),a=c.get("manual")??ya,o=a===B,r=o?null:S.find(i=>i.id===a)??S[0],s=c.has("manual");l.useEffect(()=>{window.scrollTo({top:0})},[a]);const t=i=>n({manual:i}),d=()=>n({});return e.jsx(be,{children:e.jsx(xe,{children:e.jsx("main",{className:"p-4 sm:p-6",children:e.jsxs("div",{className:"max-w-5xl mx-auto space-y-6",children:[e.jsxs("div",{children:[e.jsxs("h1",{className:"text-2xl sm:text-3xl font-bold flex items-center gap-2",children:[e.jsx(ye,{className:"h-7 w-7 text-primary","aria-hidden":!0}),"Centro de ayuda"]}),e.jsx("p",{className:"text-muted-foreground mt-1",children:"Manuales, preguntas frecuentes y nuestra línea de atención"})]}),e.jsxs("div",{className:"grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6",children:[e.jsx("nav",{"aria-label":"Contenido de ayuda",className:s?"hidden lg:block":"block",children:e.jsxs("div",{className:"space-y-2",children:[S.map(i=>{const u=xa[i.icono],p=!o&&(r==null?void 0:r.id)===i.id;return e.jsx("button",{onClick:()=>t(i.id),"aria-current":p?"page":void 0,className:`w-full text-left rounded-lg border p-3 transition-colors touch-manipulation ${p?"border-primary bg-primary/5":"border-border hover:bg-muted/60"}`,children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(u,{className:"h-5 w-5 text-primary mt-0.5 flex-shrink-0","aria-hidden":!0}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"font-medium text-sm",children:i.titulo}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5 line-clamp-2",children:i.descripcion})]}),e.jsx(V,{className:"h-4 w-4 text-muted-foreground mt-1 flex-shrink-0","aria-hidden":!0})]})},i.id)}),e.jsx("button",{onClick:()=>t(B),"aria-current":o?"page":void 0,className:`w-full text-left rounded-lg border p-3 transition-colors touch-manipulation ${o?"border-primary bg-primary/5":"border-border hover:bg-muted/60"}`,children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(Te,{className:"h-5 w-5 text-primary mt-0.5 flex-shrink-0","aria-hidden":!0}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"font-medium text-sm",children:"Preguntas frecuentes"}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Planes, seguridad, suscripción y más"})]}),e.jsx(V,{className:"h-4 w-4 text-muted-foreground mt-1 flex-shrink-0","aria-hidden":!0})]})}),e.jsx("a",{href:O,target:"_blank",rel:"noopener noreferrer",className:"block rounded-lg border border-[#25D366]/40 bg-[#25D366]/10 p-3 transition-colors hover:bg-[#25D366]/20 touch-manipulation",children:e.jsxs("div",{className:"flex items-start gap-3",children:[e.jsx(Le,{className:"h-5 w-5 text-[#1DA851] mt-0.5 flex-shrink-0","aria-hidden":!0}),e.jsxs("div",{className:"min-w-0 flex-1",children:[e.jsx("p",{className:"font-medium text-sm",children:"Escríbenos por WhatsApp"}),e.jsx("p",{className:"text-xs text-muted-foreground mt-0.5",children:"Línea de atención al cliente"})]})]})})]})}),e.jsx("div",{className:s?"block":"hidden lg:block",children:e.jsx(se,{children:e.jsxs(re,{className:"p-5 sm:p-8",children:[s&&e.jsxs(ge,{variant:"ghost",size:"sm",onClick:d,className:"mb-4 -ml-2 lg:hidden",children:[e.jsx(ke,{className:"h-4 w-4 mr-1","aria-hidden":!0}),"Todo el contenido de ayuda"]}),o?e.jsxs("div",{children:[e.jsx("h2",{className:"text-2xl font-bold tracking-tight mb-4",children:"Preguntas frecuentes"}),e.jsx(na,{type:"single",collapsible:!0,className:"w-full",children:Re.map((i,u)=>e.jsxs(X,{value:`faq-${u}`,children:[e.jsx(Z,{className:"text-left text-sm font-medium",children:i.question}),e.jsx(ee,{className:"text-sm text-muted-foreground leading-relaxed",children:i.answer})]},u))}),e.jsxs("div",{className:"mt-6 pt-4 border-t text-sm text-muted-foreground",children:["¿No encontraste tu respuesta?"," ",e.jsx("a",{href:O,target:"_blank",rel:"noopener noreferrer",className:"text-primary font-medium hover:underline",children:"Escríbenos por WhatsApp"}),"."]})]}):r&&e.jsx("article",{"aria-label":r.titulo,children:e.jsx(ra,{markdown:r.contenido})})]})})})]})]})})})})}export{Da as default};
