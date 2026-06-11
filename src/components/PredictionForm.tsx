"use client";

import { useActionState, useEffect, useState } from "react";
import { savePredictionAction, type SavePredictionState } from "@/app/actions/predictions";

const initial: SavePredictionState = { error: null, ok: false };

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  initialHome,
  initialAway,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  initialHome: number | null;
  initialAway: number | null;
}) {
  const [state, action, pending] = useActionState(savePredictionAction, initial);
  const [home, setHome] = useState(initialHome?.toString() ?? "");
  const [away, setAway] = useState(initialAway?.toString() ?? "");
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    if (state.ok) {
      setJustSaved(true);
      const t = setTimeout(() => setJustSaved(false), 2500);
      return () => clearTimeout(t);
    }
  }, [state]);

  return (
    <form action={action} className="mt-3 border-t border-white/10 pt-3">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="flex items-center justify-center gap-3">
        <ScoreInput name="home" value={home} onChange={setHome} aria-label={`Goles ${homeTeam}`} />
        <span className="text-lg font-bold text-slate-500">:</span>
        <ScoreInput name="away" value={away} onChange={setAway} aria-label={`Goles ${awayTeam}`} />

        <button
          type="submit"
          disabled={pending || home === "" || away === ""}
          className="ml-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:opacity-50"
        >
          {pending ? "…" : "Guardar"}
        </button>
      </div>

      {state.error && <p className="mt-2 text-center text-xs text-red-300">{state.error}</p>}
      {justSaved && (
        <p className="mt-2 text-center text-xs font-medium text-emerald-300">
          ✓ Predicción guardada
        </p>
      )}
    </form>
  );
}

function ScoreInput({
  name,
  value,
  onChange,
  ...rest
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "name" | "value" | "onChange">) {
  return (
    <input
      {...rest}
      name={name}
      type="number"
      min={0}
      max={99}
      inputMode="numeric"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="-"
      className="h-14 w-14 rounded-xl border border-white/15 bg-white/5 text-center text-2xl font-bold text-white outline-none focus:border-emerald-400"
    />
  );
}
