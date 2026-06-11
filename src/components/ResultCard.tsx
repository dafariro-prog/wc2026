import { teamFlag } from "@/lib/teams";
import { formatKickoffDate } from "@/lib/format";
import type { Match, Prediction, User } from "@/lib/types";

function reasonBadge(reason: string | null): { icon: string; cls: string } {
  switch (reason) {
    case "Marcador exacto":
      return { icon: "🎯", cls: "text-emerald-300" };
    case "Resultado acertado":
      return { icon: "✅", cls: "text-sky-300" };
    case "Marcador parcial":
      return { icon: "½", cls: "text-amber-300" };
    default:
      return { icon: "—", cls: "text-slate-500" };
  }
}

export function ResultCard({
  match,
  predictions,
  players,
  currentUserId,
}: {
  match: Match;
  predictions: (Prediction & { user_name: string })[];
  players: User[];
  currentUserId: string;
}) {
  // Index predicciones por usuario.
  const byUser = new Map(predictions.map((p) => [p.user_id, p]));

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">
          {match.group_name} · #{match.match_number}
        </span>
        <span>{formatKickoffDate(match.kickoff_at)}</span>
      </div>

      {/* Marcador real */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="text-2xl">{teamFlag(match.home_team)}</span>
          <span className="truncate text-sm font-bold">{match.home_team}</span>
        </div>
        <span className="px-2 text-xl font-black tabular-nums">
          {match.home_score} <span className="text-slate-600">-</span> {match.away_score}
        </span>
        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="truncate text-right text-sm font-bold">{match.away_team}</span>
          <span className="text-2xl">{teamFlag(match.away_team)}</span>
        </div>
      </div>

      {/* Desglose por participante */}
      <ul className="mt-1 divide-y divide-white/5">
        {players.map((u) => {
          const p = byUser.get(u.id);
          const me = u.id === currentUserId;
          const badge = reasonBadge(p?.points_reason ?? null);
          return (
            <li key={u.id} className="flex items-center justify-between gap-2 py-2 text-sm">
              <span className="font-semibold">
                {u.name}
                {me && <span className="ml-1 text-xs text-emerald-400">(tú)</span>}
              </span>
              {p ? (
                <span className="flex items-center gap-3">
                  <span className="tabular-nums text-slate-200">
                    {p.predicted_home_score} - {p.predicted_away_score}
                  </span>
                  <span className={`min-w-[44px] text-right font-bold ${badge.cls}`}>
                    {badge.icon} +{p.points_awarded}
                  </span>
                </span>
              ) : (
                <span className="text-xs italic text-slate-600">no pronosticó</span>
              )}
            </li>
          );
        })}
      </ul>
    </article>
  );
}
