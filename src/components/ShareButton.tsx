"use client";

import type { Standing } from "@/lib/types";

const MEDALS = ["🥇", "🥈", "🥉"];

export function ShareButton({ standings }: { standings: Standing[] }) {
  function share() {
    const lines = standings.map(
      (s, i) => `${MEDALS[i] ?? `${i + 1}.`} ${s.name} — ${s.total_points} pts`
    );
    const text = `🏆 WC 2026! — Tabla de posiciones\n\n${lines.join("\n")}\n\n¡Vamos por el Mundial! ⚽`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-lg bg-[#25D366] px-3 py-1.5 text-xs font-bold text-slate-950 transition-opacity hover:opacity-90"
    >
      Compartir 📲
    </button>
  );
}
