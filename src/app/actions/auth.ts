"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { getServiceClient } from "@/lib/supabase";
import { setSessionCookie, clearSessionCookie } from "@/lib/session";

export type LoginState = { error: string | null };

/** Inicia sesión validando nombre + PIN contra el hash bcrypt. */
export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const userId = String(formData.get("userId") ?? "").trim();
  const pin = String(formData.get("pin") ?? "").trim();

  if (!userId || !pin) {
    return { error: "Selecciona tu nombre e ingresa tu PIN." };
  }

  const sb = getServiceClient();
  const { data: user, error } = await sb
    .from("users")
    .select("id, name, role, pin_hash")
    .eq("id", userId)
    .maybeSingle();

  if (error || !user) {
    return { error: "Usuario no encontrado." };
  }

  const ok = bcrypt.compareSync(pin, user.pin_hash);
  if (!ok) {
    return { error: "PIN incorrecto." };
  }

  await setSessionCookie({ id: user.id, name: user.name, role: user.role });
  redirect("/dashboard");
}

/** Cierra la sesión. */
export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
