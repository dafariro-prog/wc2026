import type { Match } from "./types";

const TZ = "America/Bogota";

/** Estado efectivo de un partido de cara al usuario. */
export type EffectiveState = "open" | "locked" | "finished";

/** ¿El partido ya empezó? (bloqueo de predicciones). */
export function hasKickedOff(match: Pick<Match, "kickoff_at">, now: Date = new Date()): boolean {
  return now.getTime() >= new Date(match.kickoff_at).getTime();
}

/** Estado efectivo: finished si tiene resultado; locked si ya empezó; open si no. */
export function effectiveState(
  match: Pick<Match, "kickoff_at" | "status" | "home_score" | "away_score">,
  now: Date = new Date()
): EffectiveState {
  if (match.status === "finished" || (match.home_score !== null && match.away_score !== null)) {
    return "finished";
  }
  return hasKickedOff(match, now) ? "locked" : "open";
}

const DATE_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: TZ,
  weekday: "short",
  day: "2-digit",
  month: "short",
});

const TIME_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: TZ,
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

const DATETIME_FMT = new Intl.DateTimeFormat("es-CO", {
  timeZone: TZ,
  weekday: "long",
  day: "2-digit",
  month: "long",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function formatKickoffDate(iso: string): string {
  return DATE_FMT.format(new Date(iso));
}

export function formatKickoffTime(iso: string): string {
  return TIME_FMT.format(new Date(iso));
}

export function formatKickoffFull(iso: string): string {
  return DATETIME_FMT.format(new Date(iso));
}

/** Clave de día (YYYY-MM-DD en Bogotá) para agrupar partidos. */
export function dayKey(iso: string): string {
  // en-CA produce YYYY-MM-DD.
  return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(new Date(iso));
}

/** Etiqueta legible de día para encabezados de grupo. */
export function dayLabel(iso: string): string {
  const fmt = new Intl.DateTimeFormat("es-CO", {
    timeZone: TZ,
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
  const s = fmt.format(new Date(iso));
  return s.charAt(0).toUpperCase() + s.slice(1);
}
