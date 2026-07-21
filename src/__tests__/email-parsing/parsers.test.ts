import { describe, it, expect } from "vitest";
import {
  parseEmail,
  computeDedupHash,
  parseAmount,
  parseSpanishDate,
  parseLast4,
  bancolombiaParser,
  nequiParser,
  daviviendaParser,
  genericParser,
  CONFIDENCE_THRESHOLD,
  type EmailInput,
} from "../../../supabase/functions/_shared/email-parsing/index.ts";

const email = (p: Partial<EmailInput>): EmailInput => ({
  from: "alertasynotificaciones@bancolombia.com.co",
  subject: "Notificación",
  text: "",
  receivedAt: "2026-07-17T10:00:00Z",
  ...p,
});

describe("parseAmount (formatos regionales)", () => {
  it("interpreta $1.234.567,89 (coma decimal)", () => {
    expect(parseAmount("$1.234.567,89")).toBeCloseTo(1234567.89);
  });
  it("interpreta $1,234,567.89 (punto decimal)", () => {
    expect(parseAmount("$1,234,567.89")).toBeCloseTo(1234567.89);
  });
  it("interpreta 150.000 como miles", () => {
    expect(parseAmount("150.000")).toBe(150000);
  });
  it("rechaza valores no numéricos", () => {
    expect(parseAmount("sin monto")).toBeNull();
  });
});

describe("parseSpanishDate", () => {
  it("dd/mm/yyyy", () => expect(parseSpanishDate("el 17/07/2026 a las 14:32")).toBe("2026-07-17"));
  it("iso", () => expect(parseSpanishDate("2026-07-17")).toBe("2026-07-17"));
  it("texto en español", () =>
    expect(parseSpanishDate("17 de julio de 2026")).toBe("2026-07-17"));
});

describe("parseLast4", () => {
  it("detecta *1234", () => expect(parseLast4("con tarjeta *1234 el")).toBe("1234"));
  it("detecta 'terminada en'", () => expect(parseLast4("tarjeta terminada en 9876.")).toBe("9876"));
});

describe("bancolombiaParser", () => {
  const compra = email({
    text: "Bancolombia le informa Compra por $150.000,00 en EXITO CALLE 80 con tarjeta *1234 el 17/07/2026 a las 14:32. Referencia: ABC123",
  });

  it("extrae una compra completa con confianza alta", () => {
    const r = bancolombiaParser.parse(compra);
    expect(r.matched).toBe(true);
    expect(r.confidence).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
    expect(r.transaction).toMatchObject({
      tipo: "gasto",
      valor: 150000,
      fecha: "2026-07-17",
      establecimiento: "EXITO CALLE 80",
      entidad: "Bancolombia",
      productoUlt4: "1234",
      referencia: "ABC123",
    });
  });

  it("extrae un abono como ingreso", () => {
    const r = bancolombiaParser.parse(
      email({ text: "Bancolombia: Transferencia recibida por $2.500.000 en su cuenta *5678." })
    );
    expect(r.matched).toBe(true);
    expect(r.transaction?.tipo).toBe("ingreso");
    expect(r.transaction?.valor).toBe(2500000);
  });

  it("no inventa movimientos en correos sin patrón", () => {
    const r = bancolombiaParser.parse(email({ text: "Actualiza tu app Bancolombia hoy mismo" }));
    expect(r.matched).toBe(false);
  });
});

describe("nequiParser", () => {
  it("extrae un envío como gasto con contraparte", () => {
    const r = nequiParser.parse(
      email({
        from: "notificaciones@nequi.com.co",
        text: "Nequi: Enviaste $50.000 a Juan Perez. Referencia M1234567.",
      })
    );
    expect(r.matched).toBe(true);
    expect(r.transaction).toMatchObject({
      tipo: "gasto",
      valor: 50000,
      entidad: "Nequi",
      referencia: "M1234567",
    });
  });

  it("extrae dinero recibido como ingreso", () => {
    const r = nequiParser.parse(
      email({ from: "notificaciones@nequi.com.co", text: "Recibiste $120.000 de Maria Gomez en tu Nequi." })
    );
    expect(r.matched).toBe(true);
    expect(r.transaction?.tipo).toBe("ingreso");
    expect(r.transaction?.valor).toBe(120000);
  });

  it("un pago en comercio conserva el establecimiento", () => {
    const r = nequiParser.parse(
      email({ from: "notificaciones@nequi.com.co", text: "Pagaste $25.000 en RAPPI con tu Nequi el 10/07/2026." })
    );
    expect(r.transaction).toMatchObject({
      tipo: "gasto",
      establecimiento: "RAPPI",
      fecha: "2026-07-10",
    });
  });
});

describe("daviviendaParser", () => {
  it("extrae una compra con tarjeta y últimos 4", () => {
    const r = daviviendaParser.parse(
      email({
        from: "alertas@davivienda.com",
        text: "Davivienda le informa que se realizó una Compra por $89.900 en HOMECENTER con su Tarjeta Crédito terminada en 4321 el 12/07/2026.",
      })
    );
    expect(r.matched).toBe(true);
    expect(r.transaction).toMatchObject({
      tipo: "gasto",
      valor: 89900,
      establecimiento: "HOMECENTER",
      entidad: "Davivienda",
      productoUlt4: "4321",
      fecha: "2026-07-12",
    });
  });

  it("identifica DaviPlata como entidad", () => {
    const r = daviviendaParser.parse(
      email({ from: "daviplata@daviplata.com", text: "DaviPlata: Recibiste una transferencia por $75.000." })
    );
    expect(r.matched).toBe(true);
    expect(r.transaction).toMatchObject({ tipo: "ingreso", valor: 75000, entidad: "DaviPlata" });
  });
});

describe("genericParser (fallback)", () => {
  it("extrae con confianza moderada — siempre requiere revisión", () => {
    const r = genericParser.parse(
      email({
        from: "notificaciones@nequi.com.co",
        subject: "Pago realizado",
        text: "Realizaste un pago por $25.000 el 10/07/2026",
      })
    );
    expect(r.matched).toBe(true);
    expect(r.confidence).toBeLessThan(CONFIDENCE_THRESHOLD);
    expect(r.transaction?.valor).toBe(25000);
  });

  it("ignora correos sin indicios financieros", () => {
    const r = genericParser.parse(email({ from: "news@blog.com", subject: "Novedades", text: "Hola, mira nuestro blog" }));
    expect(r.matched).toBe(false);
  });
});

describe("parseEmail (registro de parsers)", () => {
  it("prefiere el parser específico sobre el genérico", () => {
    const r = parseEmail(
      email({ text: "Bancolombia le informa Compra por $99.000 en TIENDA con tarjeta *0001 el 01/07/2026" })
    );
    expect(r.parserId).toBe("bancolombia-v1");
  });

  it("enruta Nequi y Davivienda a sus parsers específicos", () => {
    const nequi = parseEmail(
      email({ from: "notificaciones@nequi.com.co", text: "Enviaste $10.000 a Ana" })
    );
    expect(nequi.parserId).toBe("nequi-v1");

    const davivienda = parseEmail(
      email({ from: "alertas@davivienda.com", text: "Se realizó una Compra por $10.000 en TIENDA" })
    );
    expect(davivienda.parserId).toBe("davivienda-v1");
  });

  it("cae al genérico para entidades sin parser propio", () => {
    const r = parseEmail(
      email({ from: "alertas@bbva.com.co", subject: "Compra aprobada", text: "Compra por $10.000 aprobada" })
    );
    expect(r.parserId).toBe("generic-v1");
  });
});

describe("computeDedupHash (idempotencia)", () => {
  const tx = { valor: 150000, fecha: "2026-07-17", establecimiento: "EXITO", referencia: "ABC123" };

  it("mismo correo → mismo hash (reprocesar no duplica)", () => {
    const a = computeDedupHash(email({}), tx);
    const b = computeDedupHash(email({}), tx);
    expect(a).toBe(b);
  });

  it("prioriza el Message-ID externo cuando existe", () => {
    const a = computeDedupHash(email({ externalMessageId: "msg-1" }), tx);
    const b = computeDedupHash(email({ externalMessageId: "msg-1" }), { ...tx, valor: 999 });
    expect(a).toBe(b); // mismo mensaje aunque cambie la extracción
  });

  it("transacciones distintas → hashes distintos", () => {
    const a = computeDedupHash(email({}), tx);
    const b = computeDedupHash(email({}), { ...tx, referencia: "XYZ999" });
    expect(a).not.toBe(b);
  });

  it("mismo valor y fecha en comercios distintos no colisiona", () => {
    const sinRef = { valor: 50000, fecha: "2026-07-17", establecimiento: "TIENDA A" };
    const a = computeDedupHash(email({}), sinRef);
    const b = computeDedupHash(email({}), { ...sinRef, establecimiento: "TIENDA B" });
    expect(a).not.toBe(b);
  });
});
