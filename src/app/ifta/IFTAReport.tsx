"use client"

import { useState } from "react"
import { calculateIFTA } from "./calculator"
import type { StateMiles, FuelPurchase } from "./calculator"
import type { IFTAResult } from "@/lib/ifta"
import UpgradeModal from "./UpgradeModal"

interface Props {
  stateMiles: StateMiles[]
  fuelPurchases: FuelPurchase[]
  canSave: boolean
}

export default function IFTAReport({ stateMiles, fuelPurchases, canSave }: Props) {
  const [result, setResult] = useState<IFTAResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [exportUpgradeOpen, setExportUpgradeOpen] = useState(false)

  const handleCalculate = async () => {
    setLoading(true)
    setError("")
    try {
      const data = await calculateIFTA(stateMiles, fuelPurchases)
      setResult(data)
    } catch (e: any) {
      setError(e.message || "Calculation failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = () => {
    if (!canSave) {
      setUpgradeOpen(true)
      return
    }
    // Stripe integration in Week 6
  }

  const handleExport = () => {
    if (!canSave) {
      setExportUpgradeOpen(true)
      return
    }
    // PDF export in Week 6
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">IFTA Report</h3>
        {result && (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="rounded-lg border border-blue-600 px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50"
            >
              Save Report
            </button>
            <button
              onClick={handleExport}
              className="rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Export PDF
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          onClick={handleCalculate}
          disabled={loading || stateMiles.length === 0}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Calculating..." : "Calculate"}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-600">{error}</p>
      )}

      {result && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b bg-gray-50 text-gray-600">
              <tr>
                <th className="px-3 py-2.5 font-medium">State</th>
                <th className="px-3 py-2.5 font-medium text-right">Miles</th>
                <th className="px-3 py-2.5 font-medium text-right">% of Total</th>
                <th className="px-3 py-2.5 font-medium text-right">Gal. Consumed</th>
                <th className="px-3 py-2.5 font-medium text-right">Gal. Purchased</th>
                <th className="px-3 py-2.5 font-medium text-right">Tax. Gal.</th>
                <th className="px-3 py-2.5 font-medium text-right">Tax Rate</th>
                <th className="px-3 py-2.5 font-medium text-right">Tax Due</th>
                <th className="px-3 py-2.5 font-medium text-right">Tax Paid</th>
                <th className="px-3 py-2.5 font-medium text-right">Net Due</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {result.rows.map((row) => (
                <tr key={row.state} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 font-medium">{row.state}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{row.miles.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{row.pctOfTotal}%</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{row.gallonsConsumed.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">{row.gallonsPurchased.toFixed(3)}</td>
                  <td className={`px-3 py-2.5 text-right font-medium ${
                    row.taxableGallons > 0 ? "text-red-600" : row.taxableGallons < 0 ? "text-green-600" : "text-gray-600"
                  }`}>
                    {row.taxableGallons > 0 ? "+" : ""}{row.taxableGallons.toFixed(3)}
                  </td>
                  <td className="px-3 py-2.5 text-right text-gray-600">${row.taxRate.toFixed(3)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">${row.taxDue.toFixed(2)}</td>
                  <td className="px-3 py-2.5 text-right text-gray-600">${row.taxPaid.toFixed(2)}</td>
                  <td className={`px-3 py-2.5 text-right font-bold ${
                    row.netDue > 0 ? "text-red-600" : row.netDue < 0 ? "text-green-600" : "text-gray-900"
                  }`}>
                    {row.netDue > 0 ? "+" : ""}${Math.abs(row.netDue).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-gray-300 bg-gray-50 font-semibold">
              <tr>
                <td className="px-3 py-3 text-gray-900">Totals</td>
                <td className="px-3 py-3 text-right text-gray-900">{result.totalMiles.toLocaleString()}</td>
                <td className="px-3 py-3 text-right text-gray-400">100%</td>
                <td className="px-3 py-3 text-right text-gray-900">{result.totalGallonsConsumed.toFixed(3)}</td>
                <td className="px-3 py-3 text-right text-gray-900">{result.totalGallonsPurchased.toFixed(3)}</td>
                <td className="px-3 py-3 text-right text-gray-400"></td>
                <td className="px-3 py-3 text-right text-gray-400"></td>
                <td className="px-3 py-3 text-right text-gray-900">${result.totalTaxDue.toFixed(2)}</td>
                <td className="px-3 py-3 text-right text-gray-900">${result.totalTaxPaid.toFixed(2)}</td>
                <td className={`px-3 py-3 text-right text-lg ${
                  result.totalNetDue > 0 ? "text-red-600" : result.totalNetDue < 0 ? "text-green-600" : "text-gray-900"
                }`}>
                  {result.totalNetDue > 0 ? "+" : ""}${Math.abs(result.totalNetDue).toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>

          <p className="mt-3 text-xs text-gray-400">
            Based on {result.rows.length} state{result.rows.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      <UpgradeModal open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
      <UpgradeModal open={exportUpgradeOpen} onClose={() => setExportUpgradeOpen(false)} />
    </div>
  )
}
