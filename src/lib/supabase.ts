import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import "server-only";

/**
 * Cliente de Supabase para uso EXCLUSIVO en el servidor (Server Actions,
 * Server Components, route handlers). Usa la service_role key, que ignora RLS.
 * NUNCA se importa desde un componente cliente.
 *
 * Toda la autorización (quién puede leer/escribir qué) se hace en NUESTRO
 * código a partir de la sesión, no en RLS.
 */
let cached: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
