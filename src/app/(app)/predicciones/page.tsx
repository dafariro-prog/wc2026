import Link from "next/link";
import { getSession } from "@/lib/session";
import { getMatches, getUserPredictionsMap } from "@/lib/queries";
import { effectiveState, dayKey, dayLabel } from "@/lib/format";
import { MatchCard } from "@/components/MatchCard";
import type { Match } from "@/lib/types";

export const dynamic = "force-dynamic";

type Filtro = "todos" | "proximos" | "pendientes" | "finalizados";

const FILTROS: { key: Filtro; label: string }[] = [
  { key: "todos", label: "Todos" },
  { key: "proximos", label: "Próximos" },
  { key: "pendientes", label: "Pendientes" },
  { key: "finalizados", label: "Finalizados" },
];

export default async function PrediccionesPage({
  searchParams,
}: {
  searchParams: Promise<{ filtro?: string }>;
}) {
  const session = (await getSession())!;
  const { filtro: rawFiltro } = await searchParams;
  const filtro = (FILTROS.find((f) => f.key === rawFiltro)?.key ?? "todos") as Filtro;

  const [matches, predictions] = await Promise.all([
    getMatches(),
    getUserPredictionsMap(session.id),
  ]);

  const filtered = matches.filter((m) => {
    const st = effectiveState(m);
    switch (filtro) {
      case "proximos":
        return st === "open";
      case "pendientes":
        return st === "open" && !predictions.has(m.id);
      case "finalizados":
        return st === "finished";
      default:
        return true;
    }
  });

  // Agrupar por día.
  const groups = new Map<string, Match[]>();
  for (const m of filtered) {
    const k = dayKey(m.kickoff_at);
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k)!.push(m);
  }

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-black">Pronósticos 🎯</h1>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTROS.map((f) => (
          <Link
            key={f.key}
            href={`/predicciones?filtro=${f.key}`}
            className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-semibold transition-colors ${
              filtro === f.key
                ? "bg-emerald-500 text-slate-950"
                : "border border-white/10 bg-white/5 text-slate-300"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
          No hay partidos en esta vista.
        </div>
      ) : (
        [...groups.entries()].map(([k, ms]) => (
          <section key={k} className="space-y-3">
            <h2 className="sticky top-[57px] z-[1] -mx-4 bg-slate-950/80 px-4 py-1 text-xs font-bold uppercase tracking-wide text-slate-400 backdrop-blur">
              {dayLabel(ms[0].kickoff_at)}
            </h2>
            {ms.map((m) => (
              <MatchCard key={m.id} match={m} prediction={predictions.get(m.id)} />
            ))}
          </section>
        ))
      )}
    </div>
  );
}
