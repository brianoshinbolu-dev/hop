import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isFeatureAccessible } from "@/lib/subscription"
import IFTAForm from "./IFTAForm"

export default async function IFTAPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users").select("org_id").eq("id", user.id).single()

  if (!profile?.org_id) redirect("/onboarding")

  const canSave = isFeatureAccessible(profile.org_id, "ifta_save")

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <a href="/dashboard" className="text-lg font-bold hover:underline">HOP</a>
        <span className="text-sm text-gray-500">IFTA Fuel Tax Calculator</span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">IFTA Fuel Tax Calculator</h2>
        <p className="mt-1 text-sm text-gray-500">
          Enter miles per state and fuel purchases to compute your IFTA tax report.
        </p>
        <IFTAForm canSave={canSave} />
      </main>
    </div>
  )
}
