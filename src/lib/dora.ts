export interface DoraMetrics {
  deploymentFrequency: { value: number; unit: "per_day" | "per_week" | "per_month"; trend: "elite" | "high" | "medium" | "low" }
  leadTimeForChanges: { value: number; unit: "hours" | "days"; trend: "elite" | "high" | "medium" | "low" }
  changeFailureRate: { value: number; unit: "percent"; trend: "elite" | "high" | "medium" | "low" }
  timeToRestoreService: { value: number; unit: "hours" | "minutes"; trend: "elite" | "high" | "medium" | "low" }
}

export interface DeploymentRecord {
  id: string
  createdAt: string
  readyState: string
  buildingAt: string | null
  ready: string | null
  meta: Record<string, string>
}

export function classifyDeploymentFrequency(deploymentsPerDay: number): DoraMetrics["deploymentFrequency"] {
  if (deploymentsPerDay >= 1) return { value: deploymentsPerDay, unit: "per_day", trend: "elite" }
  if (deploymentsPerDay >= 0.14) return { value: Math.round(deploymentsPerDay * 7 * 10) / 10, unit: "per_week", trend: "high" }
  if (deploymentsPerDay >= 0.03) return { value: Math.round(deploymentsPerDay * 30 * 10) / 10, unit: "per_month", trend: "medium" }
  return { value: Math.round(deploymentsPerDay * 30 * 10) / 10, unit: "per_month", trend: "low" }
}

export function classifyLeadTime(hours: number): DoraMetrics["leadTimeForChanges"] {
  if (hours <= 1) return { value: Math.round(hours * 100) / 100, unit: "hours", trend: "elite" }
  if (hours <= 24) return { value: Math.round(hours * 100) / 100, unit: "hours", trend: "high" }
  if (hours <= 168) return { value: Math.round(hours / 24 * 10) / 10, unit: "days", trend: "medium" }
  return { value: Math.round(hours / 24 * 10) / 10, unit: "days", trend: "low" }
}

export function classifyChangeFailureRate(percent: number): DoraMetrics["changeFailureRate"] {
  if (percent <= 5) return { value: percent, unit: "percent", trend: "elite" }
  if (percent <= 10) return { value: percent, unit: "percent", trend: "high" }
  if (percent <= 15) return { value: percent, unit: "percent", trend: "medium" }
  return { value: percent, unit: "percent", trend: "low" }
}

export function classifyTimeToRestore(hours: number): DoraMetrics["timeToRestoreService"] {
  if (hours <= 1) return { value: Math.round(hours * 100) / 100, unit: "hours", trend: "elite" }
  if (hours <= 24) return { value: Math.round(hours * 100) / 100, unit: "hours", trend: "high" }
  if (hours <= 168) return { value: Math.round(hours / 24 * 10) / 10, unit: "days", trend: "medium" }
  return { value: Math.round(hours / 24 * 10) / 10, unit: "days", trend: "low" }
}

export function calculateDeploymentFrequency(deployments: DeploymentRecord[], days: number): number {
  const successful = deployments.filter(d => d.readyState === "READY").length
  return successful / days
}

export function calculateLeadTime(deployments: DeploymentRecord[]): number {
  const withTiming = deployments.filter(d => d.buildingAt && d.createdAt)
  if (withTiming.length === 0) return 0
  const totalHours = withTiming.reduce((sum, d) => {
    const created = new Date(d.createdAt).getTime()
    const ready = d.ready ? new Date(d.ready).getTime() : Date.now()
    return sum + (ready - created) / (1000 * 60 * 60)
  }, 0)
  return totalHours / withTiming.length
}

export function calculateChangeFailureRate(
  deployments: DeploymentRecord[],
  failedDeploymentIds: string[]
): number {
  const total = deployments.filter(d => d.readyState === "READY").length
  if (total === 0) return 0
  const failures = deployments.filter(d => failedDeploymentIds.includes(d.id)).length
  return (failures / total) * 100
}
