import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { TopBar } from "@/components/TopBar";
import { BottomNav } from "@/components/BottomNav";

export default async function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <TopBar name={session.name} />
      <main className="flex-1 px-4 pb-24 pt-4">{children}</main>
      <BottomNav isAdmin={session.role === "admin"} />
    </div>
  );
}
