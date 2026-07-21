# Correos bancarios y sugerencias automáticas

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
