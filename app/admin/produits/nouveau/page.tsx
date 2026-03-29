import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/Produits/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

export default async function NouveauProduitPage() {
  const supabase = await createClient()
  
  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="space-y-4">
        <Link href="/admin/produits" className="text-slate-500 hover:text-orange-500 flex items-center gap-1 text-sm font-bold transition-colors">
          <ChevronLeft size={16} />
          Retour à la liste
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Nouveau Produit</h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Remplissez les détails pour publier</p>
        </div>
      </header>

      <ProductForm categories={categories || []} />
    </div>
  )
}
