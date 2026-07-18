import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function VehiclesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("org_id")
    .eq("id", user.id)
    .single();

  if (!profile?.org_id) redirect("/onboarding");

  const { data: vehicles } = await supabase
    .from("vehicles")
    .select("*")
    .eq("org_id", profile.org_id)
    .order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <span className="text-sm text-gray-500">Vehicles</span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Vehicles</h2>
          <Link href="/vehicles/new" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add vehicle
          </Link>
        </div>
        {(!vehicles || vehicles.length === 0) ? (
          <div className="mt-12 text-center text-gray-500">
            <p>No vehicles yet.</p>
            <Link href="/vehicles/new" className="mt-2 inline-block text-blue-600 hover:underline">Add your first vehicle</Link>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Unit #</th>
                  <th className="px-4 py-3 font-medium">Make / Model</th>
                  <th className="px-4 py-3 font-medium">Year</th>
                  <th className="px-4 py-3 font-medium">Plate</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {vehicles.map((v) => (
                  <tr key={v.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{v.unit_number}</td>
                    <td className="px-4 py-3 text-gray-600">{v.make} {v.model}</td>
                    <td className="px-4 py-3 text-gray-600">{v.year}</td>
                    <td className="px-4 py-3 text-gray-600">{v.plate_number}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        v.status === "active" ? "bg-green-100 text-green-700" :
                        v.status === "maintenance" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-600"
                      }`}>{v.status}</span>
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
