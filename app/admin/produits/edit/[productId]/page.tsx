
import { createClient } from '@/lib/supabase/server'
import ProductForm from '@/components/admin/Produits/ProductForm'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

export default async function EditProduitPage({
  params
}: {
  params: Promise<{ productId: string }>
}) {
  const supabase = createClient()
  const { productId: id } = await params

  // Fetch product with related categories, photos, and variants
  const { data: product, error } = await supabase
    .from('produits')
    .select(`
      *,
      categories(*),
      produit_photos(*),
      product_variants(*)
    `)
    .eq('id', id)
    .single()

  if (error || !product) {
    return notFound()
  }

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
          <h1 className="text-4xl font-black text-white">Modifier Produit</h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Édition de : {product.nom}</p>
        </div>
      </header>

      <ProductForm categories={categories || []} initialData={product} />
    </div>
  )
}
