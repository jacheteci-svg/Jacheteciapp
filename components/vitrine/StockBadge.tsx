export default function StockBadge({ quantity }: { quantity: number }) {
  if (quantity <= 0) {
    return (
      <span className="bg-red-50 text-red-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-red-100">
        🔴 Rupture de stock
      </span>
    )
  }

  if (quantity <= 5) {
    return (
      <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold animate-pulse ring-1 ring-orange-100">
        🟡 Plus que {quantity} disponibles !
      </span>
    )
  }

  return (
    <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold ring-1 ring-green-100">
      🟢 En stock
    </span>
  )
}
