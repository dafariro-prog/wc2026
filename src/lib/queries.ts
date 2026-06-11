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
