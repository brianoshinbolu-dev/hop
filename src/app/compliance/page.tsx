import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  cdl: "CDL",
  medical_card: "Medical Card",
  mvr: "MVR",
  drug_test: "Drug Test",
  insurance: "Insurance",
  dot_annual_review: "DOT Annual Review",
  other: "Other",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function expiryLabel(dateStr: string | null): { label: string; className: string } {
  if (!dateStr) return { label: "N/A", className: "bg-gray-100 text-gray-600" };
  const days = daysUntil(dateStr);
  if (days < 0) return { label: "Expired", className: "bg-red-100 text-red-700" };
  if (days <= 30) return { label: "Expiring soon", className: "bg-yellow-100 text-yellow-700" };
  return { label: "Active", className: "bg-green-100 text-green-700" };
}

function isExpiringOrExpired(dateStr: string | null): boolean {
  if (!dateStr) return false;
  return daysUntil(dateStr) <= 30;
}

export default async function CompliancePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("*, orgs(*)")
    .eq("id", user.id)
    .single();

  const org = profile?.orgs;
  if (!org) redirect("/onboarding");

  const { data: drivers } = await supabase
    .from("drivers")
    .select("id, first_name, last_name, cdl_expiry, medical_card_expiry")
    .eq("org_id", org.id)
    .order("created_at", { ascending: false });

  const { data: docs } = await supabase
    .from("driver_documents")
    .select("id, driver_id, title, document_type, expiry_date")
    .eq("org_id", org.id)
    .order("expiry_date", { ascending: true });

  const totalDrivers = drivers?.length ?? 0;

  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const expiringDocs = (docs ?? []).filter(
    (d) => d.expiry_date && new Date(d.expiry_date) >= now && new Date(d.expiry_date) <= in30
  );

  const expiredDocs = (docs ?? []).filter(
    (d) => d.expiry_date && new Date(d.expiry_date) < now
  );

  const compliant = (drivers ?? []).filter((d) => {
    const cdlBad = d.cdl_expiry && new Date(d.cdl_expiry) < now;
    const medBad = d.medical_card_expiry && new Date(d.medical_card_expiry) < now;
    const hasExpiredDoc = (docs ?? []).some(
      (doc) => doc.driver_id === d.id && doc.expiry_date && new Date(doc.expiry_date) < now
    );
    return !cdlBad && !medBad && !hasExpiredDoc;
  });

  const driverMap = new Map((drivers ?? []).map((d) => [d.id, d]));

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>{org.name}</span>
          <form action="/auth/signout" method="post">
            <button type="submit" className="text-blue-600 hover:underline">Sign out</button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <Link href="/dashboard" className="text-sm text-gray-500 hover:underline">&larr; Back to Dashboard</Link>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">Compliance Dashboard</h2>

        <div className="mt-6 grid gap-6 sm:grid-cols-4">
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Total Drivers</p>
            <p className="mt-1 text-3xl font-bold">{totalDrivers}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Documents Expiring</p>
            <p className={`mt-1 text-3xl font-bold ${expiringDocs.length > 0 ? "text-red-600" : ""}`}>{expiringDocs.length}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Expired Documents</p>
            <p className={`mt-1 text-3xl font-bold ${expiredDocs.length > 0 ? "text-red-600" : ""}`}>{expiredDocs.length}</p>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm text-gray-500">Compliant Drivers</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{compliant.length}</p>
          </div>
        </div>

        <h3 className="mt-8 text-lg font-semibold text-gray-900">Expiring Licenses</h3>
        <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Driver Name</th>
                <th className="px-4 py-3 font-medium">CDL Expiry</th>
                <th className="px-4 py-3 font-medium">Medical Card Expiry</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(!drivers || drivers.length === 0) ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No drivers found.</td></tr>
              ) : (
                drivers.map((d) => {
                  const worst = [expiryLabel(d.cdl_expiry), expiryLabel(d.medical_card_expiry)]
                    .filter((s) => s.label !== "N/A")
                    .sort((a, b) => {
                      const order = ["Expired", "Expiring soon", "Active"];
                      return order.indexOf(a.label) - order.indexOf(b.label);
                    })[0] ?? { label: "Active", className: "bg-green-100 text-green-700" };
                  return (
                    <tr key={d.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        <Link href={`/drivers/${d.id}`} className="text-blue-600 hover:underline">{d.first_name} {d.last_name}</Link>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.cdl_expiry ? new Date(d.cdl_expiry).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {d.medical_card_expiry ? new Date(d.medical_card_expiry).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${worst.className}`}>{worst.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <h3 className="mt-8 text-lg font-semibold text-gray-900">Expiring Documents</h3>
        <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Driver Name</th>
                <th className="px-4 py-3 font-medium">Document Type</th>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Expiry Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {(!docs || docs.filter((d) => isExpiringOrExpired(d.expiry_date)).length === 0) ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No expiring or expired documents.</td></tr>
              ) : (
                docs.filter((d) => isExpiringOrExpired(d.expiry_date)).map((doc) => {
                  const driver = driverMap.get(doc.driver_id);
                  const s = expiryLabel(doc.expiry_date);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        {driver ? (
                          <Link href={`/drivers/${driver.id}`} className="text-blue-600 hover:underline">{driver.first_name} {driver.last_name}</Link>
                        ) : (
                          <span className="text-gray-400">Unknown</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{DOCUMENT_TYPE_LABELS[doc.document_type] ?? doc.document_type}</td>
                      <td className="px-4 py-3 text-gray-600">{doc.title}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.className}`}>{s.label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
