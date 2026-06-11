import { getSession } from "@/lib/session";
import { getStandings } from "@/lib/queries";
import { ShareButton } from "@/components/ShareButton";

export const dynamic = "force-dynamic";

const MEDALS = ["🥇", "🥈", "🥉"];

export default async function TablaPage() {
  const session = (await getSession())!;
  const standings = await getStandings();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Tabla 🏆</h1>
        <ShareButton standings={standings} />
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-white/5 text-left text-[11px] uppercase tracking-wide text-slate-400">
              <th className="px-2 py-2.5 text-center">#</th>
              <th className="px-2 py-2.5">Jugador</th>
              <th className="px-2 py-2.5 text-center" title="Puntos totales">
                Pts
              </th>
              <th className="px-1 py-2.5 text-center" title="Marcadores exactos (4 pts)">
                🎯
              </th>
              <th className="px-1 py-2.5 text-center" title="Resultados acertados (3 pts)">
                ✅
              </th>
              <th className="px-1 py-2.5 text-center" title="Marcadores parciales (1 pt)">
                ½
              </th>
              <th className="px-1 py-2.5 text-center" title="Partidos pronosticados">
                PJ
              </th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => {
              const me = s.user_id === session.id;
              return (
                <tr
                  key={s.user_id}
                  className={`border-t border-white/5 ${
                    me ? "bg-emerald-500/10" : ""
                  }`}
                >
                  <td className="px-2 py-3 text-center font-bold">
                    {MEDALS[i] ?? i + 1}
                  </td>
                  <td className="px-2 py-3 font-semibold">
                    {s.name}
                    {me && <span className="ml-1 text-xs text-emerald-400">(tú)</span>}
                  </td>
                  <td className="px-2 py-3 text-center text-lg font-black text-emerald-400">
                    {s.total_points}
                  </td>
                  <td className="px-1 py-3 text-center tabular-nums text-slate-300">
                    {s.exact_count}
                  </td>
                  <td className="px-1 py-3 text-center tabular-nums text-slate-300">
                    {s.result_count}
                  </td>
                  <td className="px-1 py-3 text-center tabular-nums text-slate-300">
                    {s.partial_count}
                  </td>
                  <td className="px-1 py-3 text-center tabular-nums text-slate-400">
                    {s.predictions_count}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3 text-xs text-slate-400">
        <p className="font-semibold text-slate-300">Cómo se puntúa</p>
        <p className="mt-1">🎯 Marcador exacto = 4 pts · ✅ Resultado acertado = 3 pts · ½ Marcador parcial = 1 pt</p>
        <p className="mt-1 text-slate-500">
          Desempate: más exactos → más resultados → más partidos jugados → orden alfabético.
        </p>
      </div>
    </div>
  );
}
