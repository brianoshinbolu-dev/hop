"use client"

import { useEffect, useState } from "react"
import type { DoraMetrics } from "@/lib/dora"

const TREND_COLORS: Record<string, string> = {
  elite: "text-green-600 bg-green-50 border-green-200",
  high: "text-blue-600 bg-blue-50 border-blue-200",
  medium: "text-yellow-600 bg-yellow-50 border-yellow-200",
  low: "text-red-600 bg-red-50 border-red-200",
}

const TREND_LABELS: Record<string, string> = {
  elite: "Elite",
  high: "High",
  medium: "Medium",
  low: "Low",
}

function MetricCard({
  title,
  metric,
  description,
}: {
  title: string
  metric: { value: number; unit: string; trend: string }
  description: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-2 text-sm font-medium text-gray-500">{title}</div>
      <div className="mb-1 flex items-baseline gap-1.5">
        <span className="text-3xl font-bold text-gray-900">{metric.value}</span>
        <span className="text-sm text-gray-500">{metric.unit.replace("_", " ")}</span>
      </div>
      <span
        className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-medium ${TREND_COLORS[metric.trend] || TREND_COLORS.medium}`}
      >
        {TREND_LABELS[metric.trend] || metric.trend}
      </span>
      <p className="mt-2 text-xs text-gray-400">{description}</p>
    </div>
  )
}

export default function DoraPage() {
  const [metrics, setMetrics] = useState<DoraMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/dora/metrics")
      .then(r => r.json())
      .then(d => {
        setMetrics(d)
        setLoading(false)
      })
      .catch(e => {
        setError(e.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading DORA metrics...</div>
      </div>
    )
  }

  if (error || !metrics) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-red-500">Failed to load metrics: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">DORA Metrics</h1>
          <p className="mt-1 text-sm text-gray-500">
            DevOps Research and Assessment — {metrics.period?.days || 14}-day rolling window
          </p>
        </div>

        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Deployment Frequency"
            metric={metrics.deploymentFrequency}
            description="How often code is deployed to production"
          />
          <MetricCard
            title="Lead Time for Changes"
            metric={metrics.leadTimeForChanges}
            description="Time from commit to production"
          />
          <MetricCard
            title="Change Failure Rate"
            metric={metrics.changeFailureRate}
            description="Percentage of deployments causing failures"
          />
          <MetricCard
            title="Time to Restore"
            metric={metrics.timeToRestoreService}
            description="Time to recover from a failure"
          />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Raw Data</h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total Deployments</span>
              <p className="text-xl font-semibold text-gray-900">{(metrics as any).totalDeployments ?? "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Successful</span>
              <p className="text-xl font-semibold text-green-600">{(metrics as any).successfulDeployments ?? "—"}</p>
            </div>
            <div>
              <span className="text-gray-500">Failed</span>
              <p className="text-xl font-semibold text-red-600">{(metrics as any).failedDeployments ?? "—"}</p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400">
            Last updated: {new Date((metrics as any).generatedAt).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  )
}
