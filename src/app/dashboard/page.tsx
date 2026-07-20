import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*, orgs(*)")
    .eq("id", user.id)
    .single();

  const org = profile?.orgs;

  const { count: vehicleCount } = await supabase
    .from("vehicles")
    .select("*", { count: "exact", head: true })
    .eq("org_id", org?.id);

  const { count: driverCount } = await supabase
    .from("drivers")
    .select("*", { count: "exact", head: true })
    .eq("org_id", org?.id);

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <h1 className="text-lg font-bold">HOP</h1>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <Link href="/account/billing" className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100">
            {(org as Record<string, string | null> | null)?.plan === "free" ? "Free" : String((org as Record<string, string | null> | null)?.plan ?? "Free")}
          </Link>
          <span>{org?.name}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-blue-600 hover:underline">Sign out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Vehicles</p>
            <p className="mt-1 text-3xl font-bold">{vehicleCount ?? 0}</p>
            <Link href="/vehicles" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Manage vehicles</Link>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Drivers</p>
            <p className="mt-1 text-3xl font-bold">{driverCount ?? 0}</p>
            <Link href="/drivers" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Manage drivers</Link>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Compliance</p>
            <p className="mt-1 text-3xl font-bold">—</p>
            <Link href="/compliance" className="mt-3 inline-block text-sm text-blue-600 hover:underline">View dashboard</Link>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">DVIR Reports</p>
            <p className="mt-1 text-3xl font-bold">0</p>
            <Link href="/dvir" className="mt-3 inline-block text-sm text-blue-600 hover:underline">New DVIR</Link>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">IFTA Fuel Tax</p>
            <p className="mt-1 text-3xl font-bold">—</p>
            <Link href="/ifta" className="mt-3 inline-block text-sm text-blue-600 hover:underline">Calculate</Link>
          </div>
        </div>
        <div className="mt-6 text-center">
          <Link href="/account/billing" className="text-sm text-blue-600 hover:underline">
            Billing & Plan Settings →
          </Link>
        </div>
      </main>
    </div>
  );
}
