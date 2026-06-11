"use client";

import { useActionState } from "react";
import { useState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { teamFlag } from "@/lib/teams";
import type { User } from "@/lib/types";

const initial: LoginState = { error: null };

export function LoginForm({ users }: { users: User[] }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  const [selected, setSelected] = useState<string>("");

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="userId" value={selected} />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-300">
          ¿Quién eres?
        </label>
        <div className="grid grid-cols-2 gap-2">
          {users.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => setSelected(u.id)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-semibold transition-colors ${
                selected === u.id
                  ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                  : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
              }`}
            >
              <span className="text-lg">{u.role === "admin" ? "👑" : "⚽"}</span>
              <span className="truncate">{u.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="pin" className="mb-2 block text-sm font-medium text-slate-300">
          Tu PIN
        </label>
        <input
          id="pin"
          name="pin"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          placeholder="••••"
          maxLength={12}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-center text-2xl tracking-[0.5em] text-white outline-none placeholder:tracking-normal focus:border-emerald-400"
        />
      </div>

      {state.error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center text-sm text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending || !selected}
        className="w-full rounded-xl bg-emerald-500 px-4 py-3.5 text-base font-bold text-slate-950 transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>

      {selected && (
        <p className="text-center text-xs text-slate-500">
          Entrando como {teamFlag("")} {users.find((u) => u.id === selected)?.name}
        </p>
      )}
    </form>
  );
}
