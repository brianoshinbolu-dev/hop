"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [dotNumber, setDotNumber] = useState("");
  const [error, setError] = useState("");

  async function handleCreateOrg(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

    const { data: org, error: orgErr } = await supabase
      .from("orgs")
      .insert({ name, slug, dot_number: dotNumber || null })
      .select()
      .single();

    if (orgErr) {
      setError(orgErr.message);
      return;
    }

    const { error: userErr } = await supabase
      .from("users")
      .insert({
        id: user.id,
        email: user.email!,
        name: user.user_metadata?.name || user.email?.split("@")[0],
        org_id: org.id,
        role: "owner",
      });

    if (userErr) {
      setError(userErr.message);
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Set up your company</h1>
        <p className="mt-1 text-sm text-gray-500">Create your organization to get started.</p>
        <form onSubmit={handleCreateOrg} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Company Name</label>
            <input id="name" type="text" required value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. Brian's Trucking" />
          </div>
          <div>
            <label htmlFor="dot" className="block text-sm font-medium text-gray-700">
              DOT Number <span className="text-gray-400">(optional)</span>
            </label>
            <input id="dot" type="text" value={dotNumber}
              onChange={(e) => setDotNumber(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="1234567" />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit"
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            Create company
          </button>
        </form>
      </div>
    </div>
  );
}
