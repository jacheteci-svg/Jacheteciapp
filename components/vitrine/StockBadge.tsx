import { cn } from '@/lib/utils/cn'

export default function StockBadge({ quantity, className }: { quantity: number, className?: string }) {
  if (quantity <= 0) {
    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-red-500/20 text-red-100 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/5 bg-red-500/10", className)}>
        <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
        Rupture
      </div>
    )
  }

  if (quantity <= 5) {
    return (
      <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-orange-500/20 text-orange-100 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/5 bg-orange-500/10 animate-pulse", className)}>
        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
        Plus que {quantity}
      </div>
    )
  }

  return (
    <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass border-green-500/20 text-green-100 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/5 bg-green-500/10", className)}>
      <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
      En stock
    </div>
  )
}
