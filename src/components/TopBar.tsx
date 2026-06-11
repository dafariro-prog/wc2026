import { logoutAction } from "@/app/actions/auth";

export function TopBar({ name, subtitle }: { name: string; subtitle?: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-emerald-400">
            WC 2026! ⚽
          </p>
          <p className="text-sm font-semibold leading-tight">{subtitle ?? `Hola, ${name}`}</p>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:bg-white/5"
          >
            Salir
          </button>
        </form>
      </div>
    </header>
  );
}
