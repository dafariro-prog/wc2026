import { getSession } from "@/lib/session";
import { getFinishedMatchesWithPredictions, getUsers } from "@/lib/queries";
import { ResultCard } from "@/components/ResultCard";

export const dynamic = "force-dynamic";

export default async function ResultadosPage() {
  const session = (await getSession())!;
  const [{ matches, predsByMatch }, players] = await Promise.all([
    getFinishedMatchesWithPredictions(),
    getUsers(),
  ]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Resultados 📋</h1>
        <p className="text-sm text-slate-400">
          Partidos jugados y lo que pronosticó cada quien.
        </p>
      </div>

      {matches.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/10 p-6 text-center text-sm text-slate-500">
          Aún no hay partidos finalizados. Aquí verás los resultados y los puntos de
          cada participante después de cada partido.
        </div>
      ) : (
        <div className="space-y-3">
          {matches.map((m) => (
            <ResultCard
              key={m.id}
              match={m}
              predictions={predsByMatch.get(m.id) ?? []}
              players={players}
              currentUserId={session.id}
            />
          ))}
        </div>
      )}

      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-400">
        🎯 +4 exacto · ✅ +3 resultado · ½ +1 parcial · — +0 sin puntos
      </div>
    </div>
  );
}
