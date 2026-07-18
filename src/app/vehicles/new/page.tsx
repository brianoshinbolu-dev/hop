"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewVehiclePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    unit_number: "", vin: "", make: "", model: "", year: "", plate_number: "", plate_state: "",
  });
  const [error, setError] = useState("");

  function h(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: profile } = await supabase.from("users").select("org_id").eq("id", user.id).single();
    if (!profile?.org_id) { router.push("/onboarding"); return; }

    const { error: err } = await supabase.from("vehicles").insert({
      org_id: profile.org_id, unit_number: form.unit_number, vin: form.vin || null,
      make: form.make || null, model: form.model || null,
      year: form.year ? parseInt(form.year) : null,
      plate_number: form.plate_number || null, plate_state: form.plate_state || null,
    });

    if (err) setError(err.message); else router.push("/vehicles");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <span className="text-sm text-gray-500">Add Vehicle</span>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Add Vehicle</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit Number *</label>
            <input name="unit_number" required value={form.unit_number} onChange={h}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">VIN</label>
            <input name="vin" value={form.vin} onChange={h}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Make</label>
              <input name="make" value={form.make} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Model</label>
              <input name="model" value={form.model} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">Year</label>
              <input name="year" type="number" value={form.year} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Plate Number</label>
              <input name="plate_number" value={form.plate_number} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Plate State</label>
            <input name="plate_state" value={form.plate_state} onChange={h} maxLength={2}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="CA" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add vehicle
          </button>
        </form>
      </main>
    </div>
  );
}
