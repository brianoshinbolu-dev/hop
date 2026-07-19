"use client"

import { useState } from "react"
import MilesInput from "./MilesInput"
import FuelPurchases from "./FuelPurchases"
import IFTAReport from "./IFTAReport"
import type { StateMiles, FuelPurchase } from "./calculator"

interface Props {
  canSave: boolean
}

export default function IFTAForm({ canSave }: Props) {
  const [stateMiles, setStateMiles] = useState<StateMiles[]>([])
  const [fuelPurchases, setFuelPurchases] = useState<FuelPurchase[]>([])

  return (
    <div className="mt-6 space-y-6">
      <MilesInput entries={stateMiles} onChange={setStateMiles} />
      <FuelPurchases purchases={fuelPurchases} onChange={setFuelPurchases} />
      <IFTAReport
        stateMiles={stateMiles}
        fuelPurchases={fuelPurchases}
        canSave={canSave}
      />
    </div>
  )
}
