import { createClient } from '@/lib/supabase/server'
import ProductList from '@/components/admin/Produits/ProductList'
import { Plus, Search } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProduitsPage() {
  const supabase = createClient()
  
  const { data: produits } = await supabase
    .from('produits')
    .select('*, categories(nom), produit_photos(url)')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black text-white">Produits</h1>
          <p className="text-slate-400 font-medium font-mono text-xs uppercase tracking-widest mt-1">Gérer votre catalogue et vos stocks</p>
        </div>
        <Link href="/admin/produits/nouveau" className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-orange-500/20 active:scale-95">
          <Plus size={18} />
          Ajouter un produit
        </Link>
      </header>

      <div className="bg-[#1e293b] border border-slate-800 rounded-3xl p-2 md:p-4">
         <div className="p-4 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                placeholder="Rechercher un produit..." 
                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-11 pr-4 py-2.5 text-white text-sm focus:border-orange-500 outline-none transition-all"
              />
            </div>
         </div>
         <ProductList produits={produits || []} />
      </div>
    </div>
  )
}
