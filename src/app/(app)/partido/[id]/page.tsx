import Link from "next/link";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/session";
import { getMatch, getMatchPredictions, getUserPredictionsMap } from "@/lib/queries";
import {
  effectiveState,
  formatKickoffFull,
  hasKickedOff,
} from "@/lib/format";
import { teamFlag } from "@/lib/teams";
import { StatusBadge } from "@/components/StatusBadge";
import { PredictionForm } from "@/components/PredictionForm";

export const dynamic = "force-dynamic";

function reasonStyle(reason: string | null): string {
  switch (reason) {
    case "Marcador exacto":
      return "text-emerald-300";
    case "Resultado acertado":
      return "text-sky-300";
    case "Marcador parcial":
      return "text-amber-300";
    default:
      return "text-slate-500";
  }
}

export default async function PartidoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = (await getSession())!;
  const match = await getMatch(id);
  if (!match) notFound();

  const [allPreds, myMap] = await Promise.all([
    getMatchPredictions(id),
    getUserPredictionsMap(session.id),
  ]);

  const state = effectiveState(match);
  const finished = state === "finished";
  const started = hasKickedOff(match);
  const myPrediction = myMap.get(id);
  const badgeState = finished && !match.points_calculated ? "pending" : state;

  return (
    <div className="space-y-5">
      <Link href="/predicciones" className="text-sm text-slate-400">
        ← Volver
      </Link>

      <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-5">
        <div className="mb-3 flex items-center justify-between text-xs text-slate-400">
          <span className="font-medium">
            {match.group_name} · Partido #{match.match_number}
          </span>
          <StatusBadge state={badgeState} />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="text-4xl">{teamFlag(match.home_team)}</span>
            <span className="text-sm font-bold">{match.home_team}</span>
          </div>
          <div className="text-center">
            {finished ? (
              <span className="text-3xl font-black tabular-nums">
                {match.home_score} <span className="text-slate-600">-</span> {match.away_score}
              </span>
            ) : (
              <span className="text-sm font-medium text-slate-500">VS</span>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <span className="text-4xl">{teamFlag(match.away_team)}</span>
            <span className="text-sm font-bold">{match.away_team}</span>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-500">
          {formatKickoffFull(match.kickoff_at)}
          {match.venue ? ` · ${match.venue}` : ""}
        </p>

        {state === "open" && (
          <PredictionForm
            matchId={match.id}
            homeTeam={match.home_team}
            awayTeam={match.away_team}
            initialHome={myPrediction?.predicted_home_score ?? null}
            initialAway={myPrediction?.predicted_away_score ?? null}
          />
        )}
      </article>

      {/* Predicciones de todos */}
      <section>
        <h2 className="mb-2 text-lg font-bold">Pronósticos</h2>
        {!started ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-5 text-center text-sm text-slate-500">
            🔒 Los pronósticos de los demás se revelan cuando empiece el partido.
            {myPrediction && (
              <p className="mt-2 text-slate-300">
                Tu pronóstico: <span className="font-bold">
                  {myPrediction.predicted_home_score} - {myPrediction.predicted_away_score}
                </span>
              </p>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/10">
            {allPreds.length === 0 && (
              <li className="p-4 text-center text-sm text-slate-500">
                Nadie pronosticó este partido.
              </li>
            )}
            {allPreds.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 p-3.5">
                <span className="text-sm font-semibold">
                  {p.user_name}
                  {p.user_id === session.id && (
                    <span className="ml-1 text-xs text-emerald-400">(tú)</span>
                  )}
                </span>
                <div className="flex items-center gap-3">
                  <span className="text-base font-bold tabular-nums">
                    {p.predicted_home_score} - {p.predicted_away_score}
                  </span>
                  {finished && match.points_calculated && (
                    <span
                      className={`min-w-[90px] text-right text-xs font-bold ${reasonStyle(
                        p.points_reason
                      )}`}
                    >
                      +{p.points_awarded} · {p.points_reason}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
