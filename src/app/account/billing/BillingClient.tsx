"use client"

import { useState } from "react"
import { PLANS, type PlanId } from "@/lib/pricing"

interface Props {
  currentPlan: PlanId
}

export default function BillingClient({ currentPlan }: Props) {
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState("")

  async function upgrade(planId: PlanId) {
    setLoading(planId)
    setError("")
    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: planId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Failed to initialize payment")
        return
      }
      if (data.data?.authorization_url) {
        window.location.href = data.data.authorization_url
      } else {
        setError("No authorization URL returned")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  async function manageSubscription() {
    setLoading("manage")
    setError("")
    try {
      const res = await fetch("/api/paystack/manage", { method: "POST" })
      const data = await res.json()
      if (data.data?.url) {
        window.location.href = data.data.url
      } else {
        setError("Failed to open subscription manager")
      }
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  if (currentPlan !== "free") {
    return (
      <div className="mt-8">
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}
        <button
          onClick={manageSubscription}
          disabled={loading === "manage"}
          className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {loading === "manage" ? "Loading..." : "Manage Subscription"}
        </button>
      </div>
    )
  }

  const paidPlans: PlanId[] = ["starter", "pro"]

  return (
    <div className="mt-8">
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}
      <h3 className="text-lg font-semibold text-gray-900">Upgrade Your Plan</h3>
      <div className="mt-4 grid gap-6 md:grid-cols-2">
        {paidPlans.map((planId) => {
          const plan = PLANS[planId]
          return (
            <div key={plan.id} className="rounded-xl border bg-white p-6 shadow-sm">
              <h4 className="text-xl font-bold text-gray-900">{plan.name}</h4>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                ${(plan.price / 100).toFixed(0)}
                <span className="text-base font-normal text-gray-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-2">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-600">
                    <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => upgrade(planId)}
                disabled={loading === planId}
                className="mt-6 w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {loading === planId ? "Processing..." : `Upgrade to ${plan.name}`}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
