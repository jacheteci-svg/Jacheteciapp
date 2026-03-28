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

  // Fetch product with simple select
  const { data: product } = await supabase
    .from('produits')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) {
    return (
      <div className="p-8 text-center text-white">
        <h1 className="text-2xl font-bold">Produit non trouvé</h1>
        <p className="text-slate-400 mt-2">ID: {id}</p>
        <Link href="/admin/produits" className="text-orange-500 mt-4 block underline">Retour à la liste</Link>
      </div>
    )
  }

  // Fetch photos separately
  const { data: photos } = await supabase
    .from('produit_photos')
    .select('*')
    .eq('produit_id', id)

  // Fetch variants separately
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', id)

  // Add relations to product object for the form
  const productWithRelations = {
    ...product,
    produit_photos: photos || [],
    product_variants: variants || []
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
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Édition de : {product.nom}</p>
        </div>
      </header>

      <ProductForm 
        categories={categories || []} 
        initialData={productWithRelations} 
      />
    </div>
  )
}
