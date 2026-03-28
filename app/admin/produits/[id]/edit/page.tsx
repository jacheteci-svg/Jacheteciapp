import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/Produits/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProduitPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = createClient()
  const { id } = await params

  // Simple test fetch
  const { data: product } = await supabase
    .from('produits')
    .select('*, categories(*), produit_photos(*), produit_variantes(*)')
    .eq('id', id)
    .single()

  if (!product) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white">Produit non trouvé</h1>
        <p className="text-slate-400 mt-2">ID: {id}</p>
        <Link href="/admin/produits" className="text-orange-500 mt-4 block">Retour</Link>
      </div>
    )
  }

  const { data: categories } = await supabase
    .from('categories')
    .select('*')

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="space-y-4">
        <Link href="/admin/produits" className="text-slate-500 hover:text-orange-500 flex items-center gap-1 text-sm font-bold transition-colors">
          <ChevronLeft size={16} />
          Retour à la liste
        </Link>
        <div>
          <h1 className="text-4xl font-black text-white">Modifier le Produit</h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Édition de : {product.name}</p>
        </div>
      </header>

      <ProductForm 
        categories={categories || []} 
        initialData={product} 
      />
    </div>
  )
}
