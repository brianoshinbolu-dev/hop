"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function NewDriverPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    first_name: "", last_name: "", email: "", phone: "",
    cdl_number: "", cdl_state: "", cdl_expiry: "", medical_card_expiry: "",
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

    const { error: err } = await supabase.from("drivers").insert({
      org_id: profile.org_id, first_name: form.first_name, last_name: form.last_name,
      email: form.email || null, phone: form.phone || null,
      cdl_number: form.cdl_number || null, cdl_state: form.cdl_state || null,
      cdl_expiry: form.cdl_expiry || null, medical_card_expiry: form.medical_card_expiry || null,
    });

    if (err) setError(err.message); else router.push("/drivers");
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <Link href="/dashboard" className="text-lg font-bold hover:underline">HOP</Link>
        <span className="text-sm text-gray-500">Add Driver</span>
      </header>
      <main className="mx-auto max-w-lg px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Add Driver</h2>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">First Name *</label>
              <input name="first_name" required value={form.first_name} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Last Name *</label>
              <input name="last_name" required value={form.last_name} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          <div><label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" value={form.email} onChange={h}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-gray-700">Phone</label>
            <input name="phone" value={form.phone} onChange={h}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">CDL Number</label>
              <input name="cdl_number" value={form.cdl_number} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700">CDL State</label>
              <input name="cdl_state" value={form.cdl_state} onChange={h} maxLength={2}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="CA" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-gray-700">CDL Expiry</label>
              <input name="cdl_expiry" type="date" value={form.cdl_expiry} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-gray-700">Medical Card Expiry</label>
              <input name="medical_card_expiry" type="date" value={form.medical_card_expiry} onChange={h}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500" /></div>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Add driver
          </button>
        </form>
      </main>
    </div>
  );
}
