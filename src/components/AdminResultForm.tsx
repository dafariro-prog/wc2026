"use client";

import { useActionState } from "react";
import {
  saveResultAction,
  recalcResultAction,
  clearResultAction,
  type AdminState,
} from "@/app/actions/admin";
import { teamFlag } from "@/lib/teams";
import type { Match } from "@/lib/types";

const initial: AdminState = { error: null, ok: false };

export function AdminResultForm({ match }: { match: Match }) {
  const [state, action, pending] = useActionState(saveResultAction, initial);
  const [recalcState, recalcAction, recalcPending] = useActionState(
    recalcResultAction,
    initial
  );
  const [clearState, clearAction, clearPending] = useActionState(
    clearResultAction,
    initial
  );

  return (
    <article className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <div className="mb-2 flex items-center justify-between text-xs text-slate-400">
        <span className="font-medium">
          {match.group_name} · #{match.match_number}
        </span>
        {match.points_calculated ? (
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-500/30">
            ✓ Calculado
          </span>
        ) : (
          <span className="rounded-full bg-amber-500/15 px-2 py-0.5 font-semibold text-amber-300 ring-1 ring-inset ring-amber-500/30">
            Sin resultado
          </span>
        )}
      </div>

      <div className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold">
        <span className="flex items-center gap-1.5">
          {teamFlag(match.home_team)} {match.home_team}
        </span>
        <span className="text-slate-500">vs</span>
        <span className="flex items-center gap-1.5">
          {match.away_team} {teamFlag(match.away_team)}
        </span>
      </div>

      <form action={action} className="flex items-center justify-center gap-2">
        <input type="hidden" name="matchId" value={match.id} />
        <input
          name="home"
          type="number"
          min={0}
          max={99}
          inputMode="numeric"
          defaultValue={match.home_score ?? ""}
          placeholder="-"
          className="h-12 w-12 rounded-lg border border-white/15 bg-white/5 text-center text-xl font-bold outline-none focus:border-emerald-400"
        />
        <span className="font-bold text-slate-500">:</span>
        <input
          name="away"
          type="number"
          min={0}
          max={99}
          inputMode="numeric"
          defaultValue={match.away_score ?? ""}
          placeholder="-"
          className="h-12 w-12 rounded-lg border border-white/15 bg-white/5 text-center text-xl font-bold outline-none focus:border-emerald-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="ml-2 flex-1 rounded-lg bg-emerald-500 px-3 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? "Guardando…" : match.points_calculated ? "Corregir y recalcular" : "Guardar y calcular"}
        </button>
      </form>

      {match.points_calculated && (
        <div className="mt-2 grid grid-cols-2 gap-2">
          <form action={recalcAction}>
            <input type="hidden" name="matchId" value={match.id} />
            <button
              type="submit"
              disabled={recalcPending}
              className="w-full rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5 disabled:opacity-50"
            >
              {recalcPending ? "Recalculando…" : "Recalcular puntos"}
            </button>
          </form>
          <form
            action={clearAction}
            onSubmit={(e) => {
              if (
                !confirm(
                  `¿Borrar el resultado de ${match.home_team} vs ${match.away_team}? El partido quedará abierto de nuevo y se reiniciarán sus puntos.`
                )
              ) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="matchId" value={match.id} />
            <button
              type="submit"
              disabled={clearPending}
              className="w-full rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs font-medium text-red-300 transition-colors hover:bg-red-500/20 disabled:opacity-50"
            >
              {clearPending ? "Borrando…" : "🗑️ Borrar resultado"}
            </button>
          </form>
        </div>
      )}

      {(state.error || recalcState.error || clearState.error) && (
        <p className="mt-2 text-center text-xs text-red-300">
          {state.error ?? recalcState.error ?? clearState.error}
        </p>
      )}
      {(state.message || recalcState.message || clearState.message) &&
        !state.error &&
        !recalcState.error &&
        !clearState.error && (
          <p className="mt-2 text-center text-xs font-medium text-emerald-300">
            {state.message ?? recalcState.message ?? clearState.message}
          </p>
        )}
    </article>
  );
}
