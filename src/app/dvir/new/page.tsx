"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import SignaturePad from "@/components/SignaturePad";

const INSPECTION_ITEMS = [
  { key: "brakes", label: "Brakes" },
  { key: "lights", label: "Head / Tail / Signal Lights" },
  { key: "tires", label: "Tires" },
  { key: "horn", label: "Horn" },
  { key: "mirrors", label: "Mirrors" },
  { key: "windshield", label: "Windshield / Wipers" },
  { key: "coupling", label: "Coupling Devices" },
  { key: "emergency", label: "Emergency Equipment" },
  { key: "fuel", label: "Fuel System" },
  { key: "exhaust", label: "Exhaust System" },
  { key: "steering", label: "Steering" },
  { key: "suspension", label: "Suspension" },
];

export default function NewDvirPage() {
  const router = useRouter();
  const [vehicles, setVehicles] = useState<{ id: string; unit_number: string }[]>([]);
  const [vehicleId, setVehicleId] = useState("");
  const [reportType, setReportType] = useState<"pre_trip" | "post_trip">("pre_trip");
  const [odometer, setOdometer] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<Record<string, "ok" | "defect" | "na">>({});
  const [defectDescs, setDefectDescs] = useState<Record<string, string>>({});
  const [defectPhotos, setDefectPhotos] = useState<Record<string, File | null>>({});
  const [signature, setSignature] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const photoInputs = useRef<Record<string, HTMLInputElement | null>>({});

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("users").select("org_id").eq("id", user.id).single();
      if (profile?.org_id) {
        const { data: v } = await supabase.from("vehicles").select("id, unit_number")
          .eq("org_id", profile.org_id).eq("status", "active");
        setVehicles(v ?? []);
      }
    })();
  }, []);

  async function uploadPhoto(file: File, reportId: string, itemKey: string) {
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${reportId}/${itemKey}.${ext}`;
    const { error: uploadErr } = await supabase.storage
      .from("dvir-photos")
      .upload(path, file, { upsert: true });
    if (uploadErr) throw uploadErr;
    const { data: urlData } = await supabase.storage
      .from("dvir-photos")
      .getPublicUrl(path);
    return urlData.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setUploading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const { data: profile } = await supabase.from("users").select("org_id").eq("id", user.id).single();
    if (!profile?.org_id) { router.push("/onboarding"); setUploading(false); return; }

    const hasDefects = INSPECTION_ITEMS.some((item) => (items[item.key] ?? "ok") === "defect");
    const defectCount = INSPECTION_ITEMS.filter((item) => (items[item.key] ?? "ok") === "defect").length;

    const { data: report, error: reportErr } = await supabase
      .from("dvir_reports")
      .insert({
        org_id: profile.org_id, vehicle_id: vehicleId, report_type: reportType,
        odometer: odometer ? parseInt(odometer) : null, notes: notes || null,
        submitted_by: user.id, signature_data: signature,
        status: hasDefects ? "flagged" : "submitted",
        defect_count: defectCount, repair_count: 0,
      })
      .select()
      .single();

    if (reportErr || !report) { setError(reportErr?.message ?? "Failed"); setUploading(false); return; }

    const itemInserts = await Promise.all(
      INSPECTION_ITEMS.map(async (item) => {
        const status = items[item.key] ?? "ok";
        let imageUrl: string | null = null;
        if (status === "defect" && defectPhotos[item.key]) {
          try {
            imageUrl = await uploadPhoto(defectPhotos[item.key]!, report.id, item.key);
          } catch {
            // photo upload failed, still proceed
          }
        }
        return {
          dvir_report_id: report.id, item_key: item.key, label: item.label,
          status, defect_description: defectDescs[item.key] || null,
          defect_image_url: imageUrl, repaired: false,
        };
      })
    );

    const { error: itemsErr } = await supabase.from("dvir_items").insert(itemInserts);

    if (itemsErr) { setError(itemsErr.message); setUploading(false); return; }
    setUploading(false);
    router.push("/dvir");
  }

  function setItemStatus(key: string, status: "ok" | "defect" | "na") {
    setItems({ ...items, [key]: status });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <span className="text-sm text-gray-500">New DVIR</span>
      </header>
      <main className="mx-auto max-w-2xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Daily Vehicle Inspection Report</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vehicle *</label>
              <select required value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="">Select vehicle</option>
                {vehicles.map((v) => (<option key={v.id} value={v.id}>Unit {v.unit_number}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Report Type</label>
              <select value={reportType} onChange={(e) => setReportType(e.target.value as "pre_trip" | "post_trip")}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500">
                <option value="pre_trip">Pre-Trip</option>
                <option value="post_trip">Post-Trip</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Odometer</label>
            <input type="number" value={odometer} onChange={(e) => setOdometer(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Inspection Items</label>
            <div className="mt-2 space-y-2">
              {INSPECTION_ITEMS.map((item) => (
                <div key={item.key} className="rounded-lg border bg-white p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.label}</span>
                    <div className="flex gap-2">
                      {(["ok", "defect", "na"] as const).map((s) => (
                        <button key={s} type="button" onClick={() => setItemStatus(item.key, s)}
                          className={`rounded px-3 py-1 text-xs font-medium ${
                            (items[item.key] ?? "ok") === s
                              ? s === "ok" ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                                : s === "defect" ? "bg-red-100 text-red-700 ring-1 ring-red-300"
                                : "bg-gray-100 text-gray-600 ring-1 ring-gray-300"
                              : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                          }`}>
                          {s === "ok" ? "OK" : s === "defect" ? "Defect" : "N/A"}
                        </button>
                      ))}
                    </div>
                  </div>
                  {(items[item.key] ?? "ok") === "defect" && (
                    <div className="mt-2 space-y-2">
                      <input placeholder="Describe the defect..." value={defectDescs[item.key] ?? ""}
                        onChange={(e) => setDefectDescs({ ...defectDescs, [item.key]: e.target.value })}
                        className="block w-full rounded-lg border border-gray-300 px-3 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
                      <div>
                        <input type="file" accept="image/*" capture="environment"
                          ref={(el) => { photoInputs.current[item.key] = el; }}
                          onChange={(e) => {
                            const file = e.target.files?.[0] ?? null;
                            setDefectPhotos({ ...defectPhotos, [item.key]: file });
                          }}
                          className="block w-full text-xs text-gray-500 file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-700 hover:file:bg-blue-100" />
                        {defectPhotos[item.key] && (
                          <p className="mt-1 text-xs text-green-600">Photo selected</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <SignaturePad onSave={setSignature} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={uploading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {uploading ? "Submitting..." : "Submit DVIR"}
          </button>
        </form>
      </main>
    </div>
  );
}
