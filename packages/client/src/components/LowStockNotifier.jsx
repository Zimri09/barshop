import React, { useState } from 'react'
import { AlertTriangle, ChevronDown } from 'lucide-react'
import { useLowStockAlerts } from '../hooks/useLowStockAlerts'

export default function LowStockNotifier() {
  const { lowStock, loading } = useLowStockAlerts(true)
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
          lowStock.length > 0
            ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
            : 'bg-slate-800/60 text-slate-400 border-slate-700'
        }`}
        aria-label="Low stock alerts"
      >
        <AlertTriangle className="w-4 h-4" />
        <span>Low Stock</span>
        {!loading && lowStock.length > 0 && (
          <span className="bg-amber-500 text-slate-900 text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
            {lowStock.length}
          </span>
        )}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-72 max-h-80 overflow-y-auto rounded-xl border border-slate-700 bg-slate-900 shadow-xl z-50">
          {lowStock.length === 0 ? (
            <p className="p-4 text-sm text-slate-400">All products are above reorder threshold.</p>
          ) : (
            <ul className="divide-y divide-slate-800">
              {lowStock.map((p) => (
                <li key={p.id} className="p-3 text-sm">
                  <p className="font-semibold text-white line-clamp-1">{p.name}</p>
                  <p className="text-amber-300 mt-0.5">
                    {p.stock_quantity} in stock · reorder at {p.reorder_threshold}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : null}
    </div>
  )
}
