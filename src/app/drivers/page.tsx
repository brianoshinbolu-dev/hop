import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DriversPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("org_id").eq("id", user.id).single();

  if (!profile?.org_id) redirect("/onboarding");

  const { data: drivers } = await supabase
    .from("drivers").select("*").eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <span className="text-sm text-gray-500">Drivers</span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Drivers</h2>
          <Link href="/drivers/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add driver
          </Link>
        </div>
        {(!drivers || drivers.length === 0) ? (
          <div className="mt-12 text-center text-gray-500">
            <p>No drivers yet.</p>
            <Link href="/drivers/new" className="mt-2 inline-block text-blue-600 hover:underline">Add your first driver</Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">CDL Expiry</th>
                  <th className="px-4 py-3 font-medium">Medical Card</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{d.first_name} {d.last_name}</td>
                    <td className="px-4 py-3 text-gray-600">{d.email}</td>
                    <td className="px-4 py-3 text-gray-600">{d.cdl_expiry}</td>
                    <td className="px-4 py-3 text-gray-600">{d.medical_card_expiry}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        d.status === "active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                      }`}>{d.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
