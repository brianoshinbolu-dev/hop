"use client";

import { useState } from "react";
import type { FuelPurchase } from "./calculator";
import ReceiptScanner from "@/components/ReceiptScanner";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL",
  "GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI",
  "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface Props {
  purchases: FuelPurchase[];
  onChange: (purchases: FuelPurchase[]) => void;
}

export default function FuelPurchases({ purchases, onChange }: Props) {
  const [state, setState] = useState("");
  const [gallons, setGallons] = useState("");
  const [price, setPrice] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const addPurchase = () => {
    if (!state || !gallons || parseFloat(gallons) <= 0) return;
    onChange([
      ...purchases,
      {
        state,
        gallons: parseFloat(gallons),
        pricePerGallon: price ? parseFloat(price) : undefined,
      },
    ]);
    setGallons("");
    setPrice("");
  };

  const handleScanned = (data: {
    date?: string;
    vendor?: string;
    gallons?: number;
    price_per_gallon?: number;
    total_cost?: number;
    state?: string;
    receipt_url?: string;
  }) => {
    if (data.state && STATES.includes(data.state)) setState(data.state);
    if (data.gallons != null) setGallons(data.gallons.toFixed(2));
    if (data.price_per_gallon != null) setPrice(data.price_per_gallon.toFixed(2));
    setSuccessMsg("Receipt scanned — fields pre-filled");
    setTimeout(() => setSuccessMsg(""), 4000);
  };

  const removePurchase = (idx: number) => {
    onChange(purchases.filter((_, i) => i !== idx));
  };

  const totalGallons = purchases.reduce((s, p) => s + p.gallons, 0);
  const totalCost = purchases.reduce(
    (s, p) => s + (p.pricePerGallon ? p.gallons * p.pricePerGallon : 0),
    0
  );

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Fuel Purchases</h3>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">Gallons</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={gallons}
            onChange={(e) => setGallons(e.target.value)}
            placeholder="0.00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div className="flex-1 min-w-[100px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">Price/gal (opt)</label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="$0.00"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={addPurchase}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add purchase
        </button>
        <ReceiptScanner onScanned={handleScanned} />
        {successMsg && (
          <p className="w-full text-xs font-medium text-emerald-600">{successMsg}</p>
        )}
      </div>

      {purchases.length > 0 && (
        <div className="mt-4">
          <div className="divide-y rounded-lg border text-sm">
            {purchases.map((p, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-gray-900">{p.state}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{p.gallons.toFixed(2)} gal</span>
                  {p.pricePerGallon && (
                    <span className="text-gray-400">@ ${p.pricePerGallon.toFixed(2)}/gal</span>
                  )}
                  <button
                    onClick={() => removePurchase(i)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm font-semibold text-gray-900">
            <span>Total: {totalGallons.toFixed(2)} gal</span>
            {totalCost > 0 && <span>${totalCost.toFixed(2)}</span>}
          </div>
        </div>
      )}
    </div>
  );
}
