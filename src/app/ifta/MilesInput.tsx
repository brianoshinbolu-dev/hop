"use client";

import { useState } from "react";
import type { StateMiles } from "./calculator";

const STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL",
  "GA","HI","ID","IL","IN","IA","KS","KY","LA","ME",
  "MD","MA","MI","MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI",
  "SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface Props {
  entries: StateMiles[];
  onChange: (entries: StateMiles[]) => void;
}

export default function MilesInput({ entries, onChange }: Props) {
  const [state, setState] = useState("");
  const [miles, setMiles] = useState("");

  const addEntry = () => {
    if (!state || !miles || parseFloat(miles) <= 0) return;
    const existing = entries.findIndex((e) => e.state === state);
    if (existing >= 0) {
      const next = [...entries];
      next[existing] = { state, miles: next[existing].miles + parseFloat(miles) };
      onChange(next);
    } else {
      onChange([...entries, { state, miles: parseFloat(miles) }]);
    }
    setMiles("");
  };

  const removeEntry = (idx: number) => {
    onChange(entries.filter((_, i) => i !== idx));
  };

  const totalMiles = entries.reduce((s, e) => s + e.miles, 0);

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900">Miles per State</h3>
      <div className="mt-4 flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-[140px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">State</label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            <option value="">Select state</option>
            {STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 min-w-[120px]">
          <label className="mb-1 block text-xs font-medium text-gray-500">Miles</label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={miles}
            onChange={(e) => setMiles(e.target.value)}
            placeholder="0.0"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <button
          onClick={addEntry}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          Add state
        </button>
      </div>

      {entries.length > 0 && (
        <div className="mt-4">
          <div className="divide-y rounded-lg border text-sm">
            {entries.map((entry, i) => (
              <div key={i} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium text-gray-900">{entry.state}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">{entry.miles.toLocaleString()} mi</span>
                  <button
                    onClick={() => removeEntry(i)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm font-semibold text-gray-900">
            <span>Total Miles</span>
            <span>{totalMiles.toLocaleString()} mi</span>
          </div>
        </div>
      )}
    </div>
  );
}
