import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { type PlanId } from "@/lib/pricing"
import BillingClient from "./BillingClient"

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("users")
    .select("*, orgs(*)")
    .eq("id", user.id)
    .single()

  if (!profile?.orgs) redirect("/onboarding")

  const org = profile.orgs as Record<string, string | null>
  const currentPlan = (org.plan || "free") as PlanId
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("org_id", org.id)
    .order("paid_at", { ascending: false })
    .limit(10)

  return (
    <div className="min-h-screen bg-zinc-50">
      <header className="flex items-center justify-between border-b bg-white px-6 py-4">
        <a href="/dashboard" className="text-lg font-bold hover:underline">HOP</a>
        <span className="text-sm text-gray-500">Billing</span>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900">Billing & Plan</h2>

        <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
          <p className="text-sm text-gray-500">Current Plan</p>
          <p className="mt-1 text-2xl font-bold capitalize text-gray-900">{currentPlan}</p>
          {currentPlan !== "free" && (
            <p className="mt-1 text-sm text-green-600">Subscription active</p>
          )}
        </div>

        {invoices && invoices.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900">Billing History</h3>
            <div className="mt-3 overflow-hidden rounded-xl bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-zinc-50 text-left text-gray-500">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Plan</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv: Record<string, string | number>) => (
                    <tr key={String(inv.id)} className="border-b last:border-0">
                      <td className="px-4 py-3 text-gray-900">
                        {new Date(String(inv.paid_at)).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 capitalize">{String(inv.plan)}</td>
                      <td className="px-4 py-3">${(Number(inv.amount) / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium capitalize text-green-700">
                          {String(inv.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <BillingClient currentPlan={currentPlan} />
      </main>
    </div>
  )
}
