"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string; icon: string };

const ITEMS: Item[] = [
  { href: "/dashboard", label: "Inicio", icon: "🏠" },
  { href: "/predicciones", label: "Pronósticos", icon: "🎯" },
  { href: "/tabla", label: "Tabla", icon: "🏆" },
];

const ADMIN_ITEM: Item = { href: "/admin", label: "Admin", icon: "⚙️" };

export function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const items = isAdmin ? [...ITEMS, ADMIN_ITEM] : ITEMS;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80">
      <div className="mx-auto flex max-w-md items-stretch justify-around">
        {items.map((it) => {
          const active = pathname === it.href || pathname.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                active ? "text-emerald-400" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <span className="text-xl leading-none">{it.icon}</span>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
