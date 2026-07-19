import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import DocumentsSection from "./documents-section";

interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  cdl_number: string | null;
  cdl_state: string | null;
  cdl_expiry: string | null;
  medical_card_expiry: string | null;
  status: string;
}

interface Document {
  id: string;
  title: string;
  document_type: string;
  file_url: string;
  file_type: string | null;
  expiry_date: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

function ExpiryBadge(dateStr: string | null) {
  if (!dateStr) return null;
  const now = new Date();
  const expiry = new Date(dateStr);
  const days = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days < 0) {
    return <span className="ml-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>;
  }
  if (days <= 30) {
    return <span className="ml-2 inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Expiring soon</span>;
  }
  return null;
}

export default async function DriverDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users").select("org_id").eq("id", user.id).single();
  if (!profile?.org_id) redirect("/onboarding");

  const { data: driver } = await supabase
    .from("drivers").select("*").eq("id", id).eq("org_id", profile.org_id).single();

  if (!driver) redirect("/drivers");

  const d = driver as unknown as Driver;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/api/drivers/${id}/documents`,
    { cache: "no-store" }
  );
  const docs: Document[] = res.ok ? await res.json() : [];

  const statusColors: Record<string, string> = {
    active: "bg-green-100 text-green-700",
    inactive: "bg-gray-100 text-gray-600",
    suspended: "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <div className="flex items-center gap-3">
          <Link href="/drivers" className="text-sm text-gray-500 hover:text-gray-700">Drivers</Link>
          <span className="text-sm text-gray-500">{d.first_name} {d.last_name}</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/drivers" className="hover:underline">&larr; Back to Drivers</Link>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{d.first_name} {d.last_name}</h2>
            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
              {d.email && <span>{d.email}</span>}
              {d.phone && <span>{d.phone}</span>}
              <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[d.status] ?? "bg-gray-100 text-gray-600"}`}>
                {d.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">License Information</h3>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <div>
              <p className="text-xs text-gray-500">CDL Number</p>
              <p className="mt-1 text-sm font-medium">{d.cdl_number || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CDL State</p>
              <p className="mt-1 text-sm font-medium">{d.cdl_state || "—"}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">CDL Expiry</p>
              <p className="mt-1 text-sm font-medium">
                {d.cdl_expiry ? new Date(d.cdl_expiry).toLocaleDateString() : "—"}
                {ExpiryBadge(d.cdl_expiry)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Medical Card Expiry</p>
              <p className="mt-1 text-sm font-medium">
                {d.medical_card_expiry ? new Date(d.medical_card_expiry).toLocaleDateString() : "—"}
                {ExpiryBadge(d.medical_card_expiry)}
              </p>
            </div>
          </div>
        </div>

        <DocumentsSection driverId={id} initialDocs={docs} />
      </main>
    </div>
  );
}
