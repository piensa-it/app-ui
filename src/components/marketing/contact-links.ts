/** Enlace `https://wa.me/` con el número solo en dígitos y el mensaje codificado. */
export function whatsappHref(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** Enlace `mailto:` con asunto opcional. */
export function mailtoHref(address: string, subject?: string) {
  return `mailto:${address}${subject ? `?subject=${encodeURIComponent(subject)}` : ""}`;
}
