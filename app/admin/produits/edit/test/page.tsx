import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function TestPage() {
  return (
    <div className="p-8">
      <Link href="/admin/produits" className="text-orange-500 flex items-center gap-2 mb-4">
        <ChevronLeft size={20} />
        Back
      </Link>
      <h1 className="text-2xl font-bold text-white">Route Test: OK</h1>
    </div>
  )
}
