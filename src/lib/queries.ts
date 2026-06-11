import "server-only";
import { getServiceClient } from "./supabase";
import type { Match, Prediction, Standing, User } from "./types";

/** Todos los partidos ordenados por fecha/hora. */
export async function getMatches(): Promise<Match[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("matches")
    .select("*")
    .order("kickoff_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Match[];
}

/** Un partido por id. */
export async function getMatch(id: string): Promise<Match | null> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("matches").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data as Match) ?? null;
}

/** Predicciones de un usuario, indexadas por match_id. */
export async function getUserPredictionsMap(
  userId: string
): Promise<Map<string, Prediction>> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("predictions")
    .select("*")
    .eq("user_id", userId);
  if (error) throw error;
  const map = new Map<string, Prediction>();
  for (const p of (data ?? []) as Prediction[]) map.set(p.match_id, p);
  return map;
}

/** Todas las predicciones de un partido (con nombre de usuario). */
export async function getMatchPredictions(
  matchId: string
): Promise<(Prediction & { user_name: string })[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("predictions")
    .select("*, users(name)")
    .eq("match_id", matchId);
  if (error) throw error;
  return ((data ?? []) as (Prediction & { users: { name: string } | null })[]).map((p) => ({
    ...p,
    user_name: p.users?.name ?? "—",
  }));
}

/**
 * Partidos finalizados (con puntos calculados), del más reciente al más
 * antiguo, junto con las predicciones de todos los participantes por partido.
 */
export async function getFinishedMatchesWithPredictions(): Promise<{
  matches: Match[];
  predsByMatch: Map<string, (Prediction & { user_name: string })[]>;
}> {
  const sb = getServiceClient();
  const { data: matchData, error: matchErr } = await sb
    .from("matches")
    .select("*")
    .eq("points_calculated", true)
    .order("kickoff_at", { ascending: false });
  if (matchErr) throw matchErr;

  const matches = (matchData ?? []) as Match[];
  const predsByMatch = new Map<string, (Prediction & { user_name: string })[]>();
  if (matches.length === 0) return { matches, predsByMatch };

  const ids = matches.map((m) => m.id);
  const { data: predData, error: predErr } = await sb
    .from("predictions")
    .select("*, users(name)")
    .in("match_id", ids);
  if (predErr) throw predErr;

  for (const p of (predData ?? []) as (Prediction & {
    users: { name: string } | null;
  })[]) {
    const row = { ...p, user_name: p.users?.name ?? "—" };
    const arr = predsByMatch.get(p.match_id);
    if (arr) arr.push(row);
    else predsByMatch.set(p.match_id, [row]);
  }
  return { matches, predsByMatch };
}

/** Tabla de posiciones (vista standings). */
export async function getStandings(): Promise<Standing[]> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("standings").select("*");
  if (error) throw error;
  return (data ?? []) as Standing[];
}

/** Posición de un usuario (1-indexed) y su fila de standings. */
export async function getUserStanding(
  userId: string
): Promise<{ position: number; standing: Standing | null; total: number }> {
  const standings = await getStandings();
  const idx = standings.findIndex((s) => s.user_id === userId);
  return {
    position: idx === -1 ? standings.length : idx + 1,
    standing: idx === -1 ? null : standings[idx],
    total: standings.length,
  };
}

/** Lista de jugadores (para el login). */
export async function getUsers(): Promise<User[]> {
  const sb = getServiceClient();
  const { data, error } = await sb
    .from("users")
    .select("id, name, role")
    .order("role", { ascending: true })
    .order("name", { ascending: true });
  if (error) throw error;
  return (data ?? []) as User[];
}
