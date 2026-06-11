import Link from "next/link";
import { getSession } from "@/lib/session";
import { getMatches, getUserPredictionsMap, getUserStanding } from "@/lib/queries";
import { effectiveState } from "@/lib/format";
import { MatchCard } from "@/components/MatchCard";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = (await getSession())!;
  const [matches, predictions, standing] = await Promise.all([
    getMatches(),
    getUserPredictionsMap(session.id),
    getUserStanding(session.id),
  ]);

  const open = matches.filter((m) => effectiveState(m) === "open");
  const recent = matches
    .filter((m) => effectiveState(m) === "finished")
    .slice(-3)
    .reverse();

  const pendingToPredict = open.filter((m) => !predictions.has(m.id)).length;
  const next = open.slice(0, 3);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-black">¡Hola, {session.name}! 👋</h1>
        <p className="text-sm text-slate-400">Esto es lo que tienes hoy.</p>
      </section>

      {/* Resumen */}
      <section className="grid grid-cols-2 gap-3">
        <StatCard
          label="Tus puntos"
          value={standing.standing?.total_points ?? 0}
          accent="text-emerald-400"
        />
        <StatCard
          label="Posición"
          value={`${standing.position}º`}
          sub={`de ${standing.total}`}
          accent="text-sky-400"
        />
      </section>

      {pendingToPredict > 0 && (
        <Link
          href="/predicciones?filtro=pendientes"
          className="block rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm font-semibold text-amber-200"
        >
          ⏰ Tienes {pendingToPredict} partido(s) abiertos sin pronosticar. ¡Toca aquí!
        </Link>
      )}

      {/* Próximos partidos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Próximos partidos</h2>
          <Link href="/predicciones" className="text-xs font-medium text-emerald-400">
            Ver todos →
          </Link>
        </div>
        {next.length === 0 ? (
          <EmptyState text="No hay partidos abiertos para pronosticar ahora mismo." />
        ) : (
          next.map((m) => (
            <MatchCard key={m.id} match={m} prediction={predictions.get(m.id)} />
          ))
        )}
      </section>

      {/* Recientes */}
      {recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-bold">Jugados recientemente</h2>
          {recent.map((m) => (
            <MatchCard key={m.id} match={m} prediction={predictions.get(m.id)} />
          ))}
        </section>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-3xl font-black ${accent}`}>
        {value}
        {sub && <span className="ml-1 text-sm font-medium text-slate-500">{sub}</span>}
      </p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
