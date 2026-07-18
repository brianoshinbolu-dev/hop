import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function DvirPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("org_id").eq("id", user.id).single();

  if (!profile?.org_id) redirect("/onboarding");

  const { data: reports } = await supabase
    .from("dvir_reports")
    .select("*, vehicles(unit_number)")
    .eq("org_id", profile.org_id)
    .order("submitted_at", { ascending: false });

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <span className="text-sm text-gray-500">DVIR</span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">DVIR Reports</h2>
          <Link href="/dvir/new"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            New DVIR
          </Link>
        </div>
        {(!reports || reports.length === 0) ? (
          <div className="mt-12 text-center text-gray-500">
            <p>No DVIR reports yet.</p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Vehicle</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Defects</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {reports.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-4 py-3">
                      <Link href={`/dvir/${r.id}`} className="block text-blue-600 hover:underline">
                        {new Date(r.submitted_at).toLocaleDateString()}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/dvir/${r.id}`} className="block">
                        {r.vehicles?.unit_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      <Link href={`/dvir/${r.id}`} className="block">
                        {r.report_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dvir/${r.id}`} className="block">
                        {(r.defect_count ?? 0) > 0 ? (
                          <span className="text-red-600 font-medium">
                            {r.defect_count} defect{(r.defect_count ?? 0) !== 1 ? "s" : ""}
                            {(r.repair_count ?? 0) > 0 && (
                              <span className="text-green-600"> ({r.repair_count} repaired)</span>
                            )}
                          </span>
                        ) : (
                          <span className="text-gray-400">None</span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dvir/${r.id}`} className="block">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "submitted" ? "bg-blue-100 text-blue-700" :
                          r.status === "flagged" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                        }`}>{r.status}</span>
                      </Link>
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
