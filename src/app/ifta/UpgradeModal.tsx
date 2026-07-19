"use client";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">Upgrade to Starter</h3>
        <p className="mt-2 text-sm text-gray-600">
          Save and export IFTA reports with the Starter plan — just <strong>$15/month</strong>.
        </p>
        <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            Unlimited IFTA reports
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            PDF export
          </span>
        </div>
        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Maybe later
          </button>
          <button
            onClick={() => { window.location.href = "/account/billing"; }}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Upgrade now
          </button>
        </div>
      </div>
    </div>
  );
}
