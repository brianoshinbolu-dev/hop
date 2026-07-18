"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import jsPDF from "jspdf";

interface DvirItem {
  id: string;
  item_key: string;
  label: string;
  status: "ok" | "defect" | "na";
  defect_description: string | null;
  defect_image_url: string | null;
  repaired: boolean | null;
}

interface DvirReport {
  id: string;
  vehicle_id: string;
  report_type: "pre_trip" | "post_trip";
  odometer: number | null;
  notes: string | null;
  submitted_at: string;
  status: string;
  signature_data: string | null;
  defect_count: number;
  repair_count: number;
  vehicles: { unit_number: string } | null;
}

export default function DvirDetailPage() {
  const router = useRouter();
  const params = useParams();
  const reportRef = useRef<HTMLDivElement>(null);
  const [report, setReport] = useState<DvirReport | null>(null);
  const [items, setItems] = useState<DvirItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [repairing, setRepairing] = useState<string | null>(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: r } = await supabase
        .from("dvir_reports")
        .select("*, vehicles(unit_number)")
        .eq("id", params.id)
        .single();

      if (!r) { router.push("/dvir"); return; }
      setReport(r as DvirReport);

      const { data: i } = await supabase
        .from("dvir_items")
        .select("*")
        .eq("dvir_report_id", params.id)
        .order("item_key");
      setItems(i ?? []);
      setLoading(false);
    })();
  }, [params.id, router]);

  async function toggleRepair(itemId: string, current: boolean | null) {
    setRepairing(itemId);
    const supabase = createClient();
    const newVal = !current;

    const { error } = await supabase
      .from("dvir_items")
      .update({ repaired: newVal })
      .eq("id", itemId);

    if (!error) {
      setItems(items.map((it) => it.id === itemId ? { ...it, repaired: newVal } : it));
      const newRepairCount = items.filter((it) =>
        it.id === itemId ? newVal : it.repaired
      ).filter(Boolean).length;
      setReport((prev) => prev ? { ...prev, repair_count: newRepairCount } : prev);
      await supabase.from("dvir_reports").update({ repair_count: newRepairCount }).eq("id", params.id);
    }
    setRepairing(null);
  }

  function generatePdf() {
    setPdfGenerating(true);
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = 210;
    let y = 20;

    doc.setFontSize(16);
    doc.text("DVIR Report", pageWidth / 2, y, { align: "center" });
    y += 10;

    doc.setFontSize(10);
    doc.text(`Report Type: ${report?.report_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"}`, 14, y);
    y += 6;
    doc.text(`Vehicle: Unit ${report?.vehicles?.unit_number ?? "—"}`, 14, y);
    y += 6;
    doc.text(`Date: ${new Date(report?.submitted_at ?? "").toLocaleDateString()}`, 14, y);
    y += 6;
    if (report?.odometer) {
      doc.text(`Odometer: ${report.odometer}`, 14, y);
      y += 6;
    }
    if (report?.notes) {
      doc.text(`Notes: ${report.notes}`, 14, y);
      y += 6;
    }

    y += 4;
    doc.setFontSize(12);
    doc.text("Inspection Results", 14, y);
    y += 7;
    doc.setFontSize(10);

    const defects = items.filter((it) => it.status === "defect");

    items.forEach((item) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const statusLabel = item.status === "ok" ? "OK" : item.status === "defect" ? "DEFECT" : "N/A";
      doc.text(`${item.label}: ${statusLabel}`, 14, y);
      y += 5;
      if (item.status === "defect" && item.defect_description) {
        doc.text(`  Description: ${item.defect_description}`, 18, y);
        y += 5;
      }
      if (item.repaired) {
        doc.text(`  Repaired: Yes`, 18, y);
        y += 5;
      }
    });

    y += 6;
    doc.text(`Total Defects: ${defects.length}`, 14, y);
    y += 5;
    doc.text(`Repaired: ${report?.repair_count ?? 0} / ${defects.length}`, 14, y);

    if (report?.signature_data) {
      y += 10;
      doc.setFontSize(12);
      doc.text("Driver Signature:", 14, y);
      y += 6;
      const imgData = report.signature_data;
      try {
        doc.addImage(imgData, "PNG", 14, y, 60, 20);
      } catch {
        // skip image if corrupt
      }
    }

    doc.save(`dvir-${report?.vehicles?.unit_number ?? "report"}-${new Date(report?.submitted_at ?? "").toISOString().split("T")[0]}.pdf`);
    setPdfGenerating(false);
  }

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <p className="text-gray-500">Loading...</p>
    </div>
  );

  if (!report) return null;

  const defectItems = items.filter((it) => it.status === "defect");

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <div className="flex items-center gap-3">
          <Link href="/dvir" className="text-sm text-gray-500 hover:text-gray-700">DVIR</Link>
          <span className="text-sm text-gray-500">Report</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-8" ref={reportRef}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">DVIR Report</h2>
            <p className="mt-1 text-sm text-gray-500">
              {report.report_type === "pre_trip" ? "Pre-Trip" : "Post-Trip"} — Unit {report.vehicles?.unit_number ?? "—"}
            </p>
          </div>
          <button onClick={generatePdf} disabled={pdfGenerating}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50">
            {pdfGenerating ? "Generating..." : "Download PDF"}
          </button>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Date</p>
            <p className="mt-1 text-sm font-medium">{new Date(report.submitted_at).toLocaleDateString()}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Odometer</p>
            <p className="mt-1 text-sm font-medium">{report.odometer ?? "—"}</p>
          </div>
          <div className="rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Status</p>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              report.status === "submitted" ? "bg-blue-100 text-blue-700" :
              report.status === "flagged" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
            }`}>{report.status}</span>
          </div>
        </div>

        {report.notes && (
          <div className="mt-4 rounded-lg bg-white p-4 shadow-sm">
            <p className="text-xs text-gray-500">Notes</p>
            <p className="mt-1 text-sm">{report.notes}</p>
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900">Inspection Items</h3>
          <div className="mt-3 space-y-2">
            {items.map((item) => (
              <div key={item.id} className={`rounded-lg border p-4 ${
                item.status === "defect" ? "border-red-200 bg-red-50" :
                item.status === "ok" ? "border-green-200 bg-green-50" :
                "border-gray-200 bg-gray-50"
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.label}</span>
                    <span className={`rounded px-2 py-0.5 text-xs font-medium ${
                      item.status === "ok" ? "bg-green-200 text-green-800" :
                      item.status === "defect" ? "bg-red-200 text-red-800" :
                      "bg-gray-200 text-gray-600"
                    }`}>
                      {item.status === "ok" ? "OK" : item.status === "defect" ? "Defect" : "N/A"}
                    </span>
                  </div>
                  {item.status === "defect" && (
                    <button onClick={() => toggleRepair(item.id, item.repaired)} disabled={repairing === item.id}
                      className={`rounded px-3 py-1 text-xs font-medium ${
                        item.repaired
                          ? "bg-green-100 text-green-700 ring-1 ring-green-300"
                          : "bg-yellow-100 text-yellow-700 ring-1 ring-yellow-300"
                      }`}>
                      {repairing === item.id ? "..." : item.repaired ? "Repaired" : "Mark Repaired"}
                    </button>
                  )}
                </div>
                {item.defect_description && (
                  <p className="mt-1 text-sm text-red-700">{item.defect_description}</p>
                )}
                {item.defect_image_url && (
                  <img src={item.defect_image_url} alt="Defect"
                    className="mt-2 max-h-32 rounded-lg object-cover shadow-sm" />
                )}
              </div>
            ))}
          </div>
        </div>

        {defectItems.length > 0 && (
          <div className="mt-6 rounded-lg bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-900">Defect Summary</h3>
            <p className="mt-1 text-sm">
              <span className="font-medium text-red-600">{defectItems.length} defects</span>
              {" — "}
              <span className="font-medium text-green-600">{report.repair_count} repaired</span>
              {" — "}
              <span className="font-medium text-yellow-600">{defectItems.length - report.repair_count} outstanding</span>
            </p>
          </div>
        )}

        {report.signature_data && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-900">Driver Signature</h3>
            <img src={report.signature_data} alt="Signature"
              className="mt-2 h-20 rounded-lg border bg-white object-contain" />
          </div>
        )}
      </main>
    </div>
  );
}
