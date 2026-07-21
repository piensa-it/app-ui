import { z } from "zod";

const envSchema = z.object({
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL debe ser una URL válida"),
  VITE_SUPABASE_ANON_KEY: z.string().min(1, "VITE_SUPABASE_ANON_KEY es obligatoria"),
});

const _env = envSchema.safeParse(import.meta.env);

if (!_env.success) {
  console.error(
    "❌ Variables de entorno inválidas:",
    _env.error.format()
  );
  throw new Error("Variables de entorno inválidas. Revisa la consola.");
}

export const env = _env.data;
