/**
 * Consentimiento de cookies (Google Consent Mode v2).
 *
 * Estado por defecto (todo denegado) se fija en index.html ANTES de cargar
 * GTM, para que las etiquetas de Google respeten el estado desde el primer
 * disparo. Este módulo solo lee/escribe la decisión del usuario y la
 * propaga a gtag('consent', 'update', ...) — GTM/GA4/Ads la respetan
 * automáticamente sin configuración adicional en el contenedor.
 *
 * "Necesarias" no es una categoría de Consent Mode: son las cookies propias
 * de sesión de Supabase Auth, siempre activas, no dependen de este consentimiento.
 */

export interface ConsentChoices {
  analytics: boolean;
  advertising: boolean;
}

const STORAGE_KEY = "misfin_cookie_consent_v1";
const OPEN_EVENT = "misfin:open-cookie-prefs";

interface StoredConsent extends ConsentChoices {
  decidedAt: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function gtagPush(...args: unknown[]) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(args);
}

export function getStoredConsent(): StoredConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as StoredConsent;
  } catch {
    return null;
  }
}

export function saveConsent(choices: ConsentChoices): void {
  const stored: StoredConsent = { ...choices, decidedAt: new Date().toISOString() };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  applyConsent(choices);
}

/** Propaga la decisión a Consent Mode. GTM/GA4/Ads leen esto automáticamente. */
export function applyConsent(choices: ConsentChoices): void {
  gtagPush("consent", "update", {
    analytics_storage: choices.analytics ? "granted" : "denied",
    ad_storage: choices.advertising ? "granted" : "denied",
    ad_user_data: choices.advertising ? "granted" : "denied",
    ad_personalization: choices.advertising ? "granted" : "denied",
  });
  gtagPush({ event: "misfin_consent_update", ...choices });
}

/** Permite reabrir el banner desde cualquier parte (footer, política de datos). */
export function openCookiePreferences(): void {
  window.dispatchEvent(new Event(OPEN_EVENT));
}

export function onOpenCookiePreferences(handler: () => void): () => void {
  window.addEventListener(OPEN_EVENT, handler);
  return () => window.removeEventListener(OPEN_EVENT, handler);
}

export { OPEN_EVENT };
