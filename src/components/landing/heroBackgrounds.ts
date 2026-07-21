import bg1 from "@/assets/hero-bg-1.png";
import bg2 from "@/assets/hero-bg-2.png";
import bg3 from "@/assets/hero-bg-3.png";

/**
 * Imágenes de fondo animadas compartidas entre Landing.tsx (Personas) y
 * LandingEmpresa.tsx (Empresas) — P4-29 fase 2. Antes solo Personas las
 * usaba; se centralizan aquí para que ambas landings compartan exactamente
 * las mismas fotos y no haya que mantener un set de assets aparte para
 * Empresas.
 */
export const heroBackgrounds = [bg1, bg2, bg3];
