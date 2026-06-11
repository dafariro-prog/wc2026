import type { EffectiveState } from "@/lib/format";

const MAP: Record<EffectiveState | "pending", { label: string; cls: string }> = {
  open: { label: "Abierto", cls: "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30" },
  locked: { label: "Bloqueado", cls: "bg-amber-500/15 text-amber-300 ring-amber-500/30" },
  finished: { label: "Finalizado", cls: "bg-slate-500/15 text-slate-300 ring-slate-500/30" },
  pending: { label: "Pendiente de resultado", cls: "bg-sky-500/15 text-sky-300 ring-sky-500/30" },
};

export function StatusBadge({ state }: { state: EffectiveState | "pending" }) {
  const { label, cls } = MAP[state];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}
