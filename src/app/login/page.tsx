import { getUsers } from "@/lib/queries";
import { LoginForm } from "@/components/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const users = await getUsers();

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-6 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black tracking-tight">
          WC <span className="text-emerald-400">2026!</span> ⚽
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          La polla del Mundial entre amigos 🇨🇴
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-5 shadow-xl">
        <LoginForm users={users} />
      </div>

      <p className="mt-6 text-center text-xs text-slate-600">
        Hecho para Daniel, Camilo, Luis H y Miguel.
      </p>
    </div>
  );
}
