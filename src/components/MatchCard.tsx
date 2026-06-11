import Link from "next/link";
import { teamFlag } from "@/lib/teams";
import {
  effectiveState,
  formatKickoffDate,
  formatKickoffTime,
} from "@/lib/format";
import { StatusBadge } from "./StatusBadge";
import { PredictionForm } from "./PredictionForm";
import type { Match, Prediction } from "@/lib/types";

function reasonStyle(reason: string | null): string {
  switch (reason) {
    case "Marcador exacto":
      return "text-emerald-300";
    case "Resultado acertado":
      return "text-sky-300";
    case "Marcador parcial":
      return "text-amber-300";
    default:
      return "text-slate-400";
  }
}

export function MatchCard({
  match,
  prediction,
}: {
  match: Match;
  prediction: Prediction | undefined;
}) {
  const state = effectiveState(match);
  const finished = state === "finished";
  const badgeState =
    finished && !match.points_calculated ? "pending" : state;

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">
          {match.group_name} · #{match.match_number}
        </span>
        <StatusBadge state={badgeState} />
      </div>

      {/* Equipos + marcador real (si finalizado) */}
      <Link href={`/partido/${match.id}`} className="block">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-1 items-center gap-2">
            <span className="text-2xl">{teamFlag(match.home_team)}</span>
            <span className="truncate text-sm font-semibold">{match.home_team}</span>
          </div>
          <div className="px-2 text-center">
            {finished ? (
              <span className="text-xl font-black tabular-nums">
                {match.home_score} <span className="text-slate-600">-</span> {match.away_score}
              </span>
            ) : (
              <span className="text-xs text-slate-500">vs</span>
            )}
          </div>
          <div className="flex flex-1 items-center justify-end gap-2">
            <span className="truncate text-right text-sm font-semibold">{match.away_team}</span>
            <span className="text-2xl">{teamFlag(match.away_team)}</span>
          </div>
        </div>
      </Link>

      <p className="mt-2 text-center text-[11px] text-slate-500">
        {formatKickoffDate(match.kickoff_at)} · {formatKickoffTime(match.kickoff_at)}
        {match.venue ? ` · ${match.venue}` : ""}
      </p>

      {/* Estado abierto: formulario */}
      {state === "open" && (
        <PredictionForm
          matchId={match.id}
          homeTeam={match.home_team}
          awayTeam={match.away_team}
          initialHome={prediction?.predicted_home_score ?? null}
          initialAway={prediction?.predicted_away_score ?? null}
        />
      )}

      {/* Bloqueado o finalizado: mostrar predicción del usuario */}
      {state !== "open" && (
        <div className="mt-3 border-t border-white/10 pt-3 text-center text-sm">
          {prediction ? (
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-400">Tu pronóstico:</span>
              <span className="font-bold tabular-nums">
                {prediction.predicted_home_score} - {prediction.predicted_away_score}
              </span>
              {finished && match.points_calculated && (
                <span className={`font-bold ${reasonStyle(prediction.points_reason)}`}>
                  · +{prediction.points_awarded} pt
                </span>
              )}
            </div>
          ) : (
            <span className="text-slate-500">No pronosticaste este partido.</span>
          )}
        </div>
      )}
    </article>
  );
}
