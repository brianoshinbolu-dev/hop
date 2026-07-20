import { NextResponse } from "next/server"
import {
  calculateDeploymentFrequency,
  calculateLeadTime,
  calculateChangeFailureRate,
  classifyDeploymentFrequency,
  classifyLeadTime,
  classifyChangeFailureRate,
  classifyTimeToRestore,
  type DeploymentRecord,
} from "@/lib/dora"

const VERCEL_API = "https://api.vercel.com"
const TEAM_ID = "team_OhPY9kdT8U6iJHuCBB8MhUQs"
const PROJECT_ID = "prj_FvnY6fGDxdycogr2hBl7qu8fiuBB"

async function fetchVercelDeployments(since: number): Promise<DeploymentRecord[]> {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) return []

  const url = `${VERCEL_API}/v1/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&since=${since}&limit=100`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return []

  const data = await res.json()
  return (data.deployments || []).map((d: Record<string, unknown>) => ({
    id: d.uid as string,
    createdAt: d.createdAt as string,
    readyState: d.readyState as string,
    buildingAt: d.buildingAt as string | null,
    ready: d.ready as string | null,
    meta: (d.meta as Record<string, string>) || {},
  }))
}

async function fetchFailedDeployments(since: number): Promise<string[]> {
  const token = process.env.VERCEL_API_TOKEN
  if (!token) return []

  const url = `${VERCEL_API}/v1/deployments?projectId=${PROJECT_ID}&teamId=${TEAM_ID}&since=${since}&limit=100&state=ERROR`
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } })
  if (!res.ok) return []

  const data = await res.json()
  return (data.deployments || []).map((d: Record<string, unknown>) => d.uid as string)
}

export async function GET() {
  const days = 14
  const since = Date.now() - days * 24 * 60 * 60 * 1000

  const [deployments, failedIds] = await Promise.all([
    fetchVercelDeployments(since),
    fetchFailedDeployments(since),
  ])

  const freq = calculateDeploymentFrequency(deployments, days)
  const leadTime = calculateLeadTime(deployments)
  const failureRate = calculateChangeFailureRate(deployments, failedIds)

  const metrics = {
    deploymentFrequency: classifyDeploymentFrequency(freq),
    leadTimeForChanges: classifyLeadTime(leadTime),
    changeFailureRate: classifyChangeFailureRate(failureRate),
    timeToRestoreService: classifyTimeToRestore(2),
    period: { days },
    totalDeployments: deployments.length,
    successfulDeployments: deployments.filter(d => d.readyState === "READY").length,
    failedDeployments: failedIds.length,
    generatedAt: new Date().toISOString(),
  }

  return NextResponse.json(metrics)
}
