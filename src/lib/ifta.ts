export interface IFTACalculationInput {
  stateMiles: Record<string, number> | Array<{ state: string; miles: number }>
  fuelPurchases: Array<{
    state: string
    gallons: number
    taxPaid?: number
    pricePerGallon?: number
  }>
}

export interface IFTARate {
  stateCode: string
  ratePerGallon: number
}

export interface StateResult {
  stateCode: string
  state: string
  miles: number
  percentageOfTotal: number
  pctOfTotal: number
  gallonsConsumed: number
  gallonsPurchased: number
  taxableGallons: number
  taxRate: number
  taxDue: number
  taxPaid: number
  netDue: number
}

export interface IFTAResult {
  rows: StateResult[]
  totalMiles: number
  totalGallonsPurchased: number
  totalGallonsConsumed: number
  totalTaxDue: number
  totalTaxPaid: number
  netDue: number
  totalNetDue: number
  states?: StateResult[]
}

const IFTA_RATES_2026_Q2: Record<string, number> = {
  AL: 0.310,
  AK: 0.088,
  AZ: 0.260,
  AR: 0.285,
  CA: 0.971,
  CO: 0.325,
  CT: 0.489,
  DE: 0.220,
  DC: 0.235,
  FL: 0.410,
  GA: 0.373,
  HI: 0.160,
  ID: 0.320,
  IL: 0.738,
  IN: 0.630,
  IA: 0.325,
  KS: 0.260,
  KY: 0.325,
  LA: 0.200,
  ME: 0.312,
  MD: 0.468,
  MA: 0.240,
  MI: 0.524,
  MN: 0.326,
  MS: 0.210,
  MO: 0.295,
  MT: 0.298,
  NE: 0.318,
  NV: 0.270,
  NH: 0.222,
  NJ: 0.561,
  NM: 0.210,
  NY: 0.381,
  NC: 0.410,
  ND: 0.230,
  OH: 0.470,
  OK: 0.190,
  OR: 0.000,
  PA: 0.741,
  RI: 0.400,
  SC: 0.280,
  SD: 0.280,
  TN: 0.270,
  TX: 0.200,
  UT: 0.379,
  VT: 0.310,
  VA: 0.470,
  WA: 0.584,
  WV: 0.357,
  WI: 0.329,
  WY: 0.240,
}

function normalizeMiles(
  input: Record<string, number> | Array<{ state: string; miles: number }>
): Record<string, number> {
  if (Array.isArray(input)) {
    const result: Record<string, number> = {}
    for (const item of input) {
      result[item.state.toUpperCase()] = item.miles
    }
    return result
  }
  const result: Record<string, number> = {}
  for (const [k, v] of Object.entries(input)) {
    result[k.toUpperCase()] = v
  }
  return result
}

export function getIFTRates(): IFTARate[] {
  return Object.entries(IFTA_RATES_2026_Q2).map(([stateCode, ratePerGallon]) => ({
    stateCode,
    ratePerGallon,
  }))
}

export function getRateForState(stateCode: string): number {
  return IFTA_RATES_2026_Q2[stateCode.toUpperCase()] ?? 0
}

export function calculateIFTA(input: IFTACalculationInput): IFTAResult {
  const stateMiles = normalizeMiles(input.stateMiles)
  const { fuelPurchases } = input

  const stateCodes = Object.keys(stateMiles)
  const totalMiles = Object.values(stateMiles).reduce((sum, m) => sum + m, 0)

  const purchasesByState: Record<string, { gallons: number; taxPaid: number }> = {}
  for (const p of fuelPurchases) {
    const code = p.state.toUpperCase()
    if (!purchasesByState[code]) {
      purchasesByState[code] = { gallons: 0, taxPaid: 0 }
    }
    purchasesByState[code].gallons += p.gallons
    purchasesByState[code].taxPaid += p.taxPaid ?? 0
  }

  const totalGallonsPurchased = Object.values(purchasesByState).reduce(
    (sum, p) => sum + p.gallons,
    0
  )

  const rows: StateResult[] = stateCodes.map((code) => {
    const miles = stateMiles[code]
    const percentageOfTotal = totalMiles > 0 ? miles / totalMiles : 0
    const gallonsConsumed = totalGallonsPurchased * percentageOfTotal
    const gallonsPurchased = purchasesByState[code]?.gallons ?? 0
    const taxableGallons = Math.max(gallonsConsumed - gallonsPurchased, 0)
    const taxRate = getRateForState(code)
    const taxDue = taxableGallons * taxRate
    const taxPaid = purchasesByState[code]?.taxPaid ?? 0
    const netDue = taxDue - taxPaid
    const pct = Math.round(percentageOfTotal * 10000) / 100

    return {
      stateCode: code,
      state: code,
      miles,
      percentageOfTotal: pct,
      pctOfTotal: pct,
      gallonsConsumed: Math.round(gallonsConsumed * 1000) / 1000,
      gallonsPurchased: Math.round(gallonsPurchased * 1000) / 1000,
      taxableGallons: Math.round(taxableGallons * 1000) / 1000,
      taxRate,
      taxDue: Math.round(taxDue * 100) / 100,
      taxPaid: Math.round(taxPaid * 100) / 100,
      netDue: Math.round(netDue * 100) / 100,
    }
  })

  const totalTaxDue = Math.round(rows.reduce((s, r) => s + r.taxDue, 0) * 100) / 100
  const totalTaxPaid = Math.round(rows.reduce((s, r) => s + r.taxPaid, 0) * 100) / 100
  const totalNetDue = Math.round(rows.reduce((s, r) => s + r.netDue, 0) * 100) / 100

  return {
    rows,
    totalMiles,
    totalGallonsPurchased,
    totalGallonsConsumed: totalGallonsPurchased,
    totalTaxDue,
    totalTaxPaid,
    netDue: totalNetDue,
    totalNetDue,
  }
}
