"use server";

import { revalidatePath } from "next/cache";
import { getServiceClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";
import { calculatePoints } from "@/lib/scoring";
import type { Prediction } from "@/lib/types";

export type AdminState = { error: string | null; ok: boolean; message?: string };

async function recalculateMatch(matchId: string, home: number, away: number) {
  const sb = getServiceClient();
  const { data: preds, error } = await sb
    .from("predictions")
    .select("id, predicted_home_score, predicted_away_score")
    .eq("match_id", matchId);
  if (error) throw error;

  for (const p of (preds ?? []) as Pick<
    Prediction,
    "id" | "predicted_home_score" | "predicted_away_score"
  >[]) {
    const { points, reason } = calculatePoints(
      { home: p.predicted_home_score, away: p.predicted_away_score },
      { home, away }
    );
    const { error: upErr } = await sb
      .from("predictions")
      .update({ points_awarded: points, points_reason: reason })
      .eq("id", p.id);
    if (upErr) throw upErr;
  }
  return (preds ?? []).length;
}

/**
 * Guarda el resultado real de un partido y calcula los puntos de TODAS las
 * predicciones. Solo admin. Sirve también para CORREGIR un resultado (recalcula).
 */
export async function saveResultAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "No autorizado.", ok: false };
  }

  const matchId = String(formData.get("matchId") ?? "");
  const home = Number(formData.get("home"));
  const away = Number(formData.get("away"));

  if (!matchId) return { error: "Partido inválido.", ok: false };
  if (
    formData.get("home") === "" ||
    formData.get("away") === "" ||
    Number.isNaN(home) ||
    Number.isNaN(away)
  ) {
    return { error: "Ingresa ambos marcadores.", ok: false };
  }
  if (!Number.isInteger(home) || !Number.isInteger(away) || home < 0 || away < 0) {
    return { error: "Los marcadores deben ser enteros 0 o mayores.", ok: false };
  }

  const sb = getServiceClient();

  const { error: matchErr } = await sb
    .from("matches")
    .update({
      home_score: home,
      away_score: away,
      status: "finished",
      points_calculated: true,
    })
    .eq("id", matchId);
  if (matchErr) return { error: "No se pudo guardar el resultado.", ok: false };

  let n = 0;
  try {
    n = await recalculateMatch(matchId, home, away);
  } catch {
    return { error: "Resultado guardado, pero falló el cálculo de puntos.", ok: false };
  }

  revalidatePath("/admin");
  revalidatePath("/tabla");
  revalidatePath("/dashboard");
  revalidatePath(`/partido/${matchId}`);
  return {
    error: null,
    ok: true,
    message: `Resultado ${home}-${away} guardado. Puntos calculados para ${n} predicción(es).`,
  };
}

/** Recalcula los puntos de un partido ya finalizado (sin cambiar el marcador). */
export async function recalcResultAction(
  _prev: AdminState,
  formData: FormData
): Promise<AdminState> {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return { error: "No autorizado.", ok: false };
  }

  const matchId = String(formData.get("matchId") ?? "");
  const sb = getServiceClient();
  const { data: match, error } = await sb
    .from("matches")
    .select("home_score, away_score")
    .eq("id", matchId)
    .maybeSingle();

  if (error || !match || match.home_score === null || match.away_score === null) {
    return { error: "El partido no tiene resultado para recalcular.", ok: false };
  }

  let n = 0;
  try {
    n = await recalculateMatch(matchId, match.home_score, match.away_score);
  } catch {
    return { error: "Falló el recálculo.", ok: false };
  }

  revalidatePath("/admin");
  revalidatePath("/tabla");
  revalidatePath("/dashboard");
  revalidatePath(`/partido/${matchId}`);
  return { error: null, ok: true, message: `Puntos recalculados para ${n} predicción(es).` };
}
