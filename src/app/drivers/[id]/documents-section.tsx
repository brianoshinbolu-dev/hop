"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

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

const DOCUMENT_TYPES = [
  { value: "cdl", label: "CDL" },
  { value: "medical_card", label: "Medical Card" },
  { value: "mvr", label: "MVR" },
  { value: "drug_test", label: "Drug Test" },
  { value: "insurance", label: "Insurance" },
  { value: "dot_annual_review", label: "DOT Annual Review" },
  { value: "other", label: "Other" },
];

function DocTypeLabel(type: string) {
  return DOCUMENT_TYPES.find((t) => t.value === type)?.label ?? type;
}

function StatusBadge({ status, expiryDate }: { status: string; expiryDate: string | null }) {
  if (expiryDate) {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysUntilExpiry < 0) {
      return <span className="inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">Expired</span>;
    }
    if (daysUntilExpiry <= 30) {
      return <span className="inline-block rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">Expiring soon</span>;
    }
  }
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
      status === "active" ? "bg-green-100 text-green-700" :
      status === "archived" ? "bg-gray-100 text-gray-600" :
      "bg-gray-100 text-gray-600"
    }`}>{status}</span>
  );
}

export default function DocumentsSection({
  driverId,
  initialDocs,
}: {
  driverId: string;
  initialDocs: Document[];
}) {
  const router = useRouter();
  const [docs, setDocs] = useState<Document[]>(initialDocs);
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    document_type: "cdl",
    title: "",
    expiry_date: "",
    notes: "",
  });

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    const fileInput = (e.target as HTMLFormElement).querySelector(
      'input[type="file"]'
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];
    if (!file || !uploadForm.title) return;

    setUploading(true);
    setProgress(0);
    setMessage(null);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("document_type", uploadForm.document_type);
    fd.append("title", uploadForm.title);
    if (uploadForm.expiry_date) fd.append("expiry_date", uploadForm.expiry_date);
    if (uploadForm.notes) fd.append("notes", uploadForm.notes);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `/api/drivers/${driverId}/documents`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        setProgress(Math.round((event.loaded * 100) / event.total));
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const doc = JSON.parse(xhr.responseText);
        setDocs([doc, ...docs]);
        setShowUpload(false);
        setUploadForm({ document_type: "cdl", title: "", expiry_date: "", notes: "" });
        setMessage({ type: "success", text: "Document uploaded successfully." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: "Failed to upload document." });
      }
      setUploading(false);
      setProgress(0);
    };

    xhr.onerror = () => {
      setMessage({ type: "error", text: "An error occurred during upload." });
      setUploading(false);
      setProgress(0);
    };

    xhr.send(fd);
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Delete "${doc.title}"?`)) return;
    setDeleting(doc.id);
    const res = await fetch(`/api/drivers/${driverId}/documents/${doc.id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setDocs(docs.filter((d) => d.id !== doc.id));
      router.refresh();
    }
    setDeleting(null);
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {showUpload ? "Cancel" : "Upload Document"}
        </button>
      </div>

      {message && (
        <div className={`mt-4 rounded-lg p-4 text-sm ${message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
          {message.text}
        </div>
      )}

      {showUpload && (
        <form onSubmit={handleUpload} className="mt-4 rounded-xl border bg-white p-6 shadow-sm">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">File *</label>
              <input
                type="file"
                accept="image/*,.pdf"
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm file:mr-2 file:rounded file:border-0 file:bg-blue-50 file:px-2 file:py-1 file:text-xs file:font-medium file:text-blue-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Document Type *</label>
              <select
                value={uploadForm.document_type}
                onChange={(e) => setUploadForm({ ...uploadForm, document_type: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                value={uploadForm.title}
                onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                required
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Expiry Date</label>
              <input
                type="date"
                value={uploadForm.expiry_date}
                onChange={(e) => setUploadForm({ ...uploadForm, expiry_date: e.target.value })}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700">Notes</label>
              <textarea
                value={uploadForm.notes}
                onChange={(e) => setUploadForm({ ...uploadForm, notes: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          
          {uploading && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Uploading...</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div className="h-2 rounded-full bg-blue-600 transition-all duration-300" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={uploading}
            className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </form>
      )}

      {docs.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No documents uploaded yet.</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Expiry Date</th>
                <th className="px-4 py-3 font-medium">Uploaded</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {docs.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 text-gray-600">{DocTypeLabel(doc.document_type)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={doc.status} expiryDate={doc.expiry_date} />
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {doc.expiry_date ? new Date(doc.expiry_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Download
                      </a>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deleting === doc.id}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deleting === doc.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
