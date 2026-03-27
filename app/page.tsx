import { createClient } from '@/lib/supabase/server'
import { formatPrix } from '@/lib/utils/formatPrix'
import Header from '@/components/vitrine/Header'
import WhatsAppButton from '@/components/vitrine/WhatsAppButton'
import StockBadge from '@/components/vitrine/StockBadge'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ArrowRight } from 'lucide-react'

export default async function Home() {
  const supabase = createClient()
  
  // Fetch active products with their main photos
  const { data: produits, error } = await supabase
    .from('produits')
    .select('*, produit_photos(*)')
    .eq('actif', true)
    .order('ordre', { ascending: true })

  if (error) {
    console.error('Error fetching products:', error)
  }

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-20">
      <Header />

      <main>
        {/* Hero Section */}
        <section className="bg-white border-b border-slate-100 py-16 px-4">
          <div className="container mx-auto max-w-6xl text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-slate-900">
              Découvrez nos <span className="text-brand-primary">pépites</span> du moment
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Une sélection premium de produits livrés rapidement partout à Abidjan. 
              Qualité garantie et paiement à la livraison.
            </p>
          </div>
        </section>

        {/* Product Grid */}
        <section className="container mx-auto max-w-6xl px-4 py-12">
          {!produits || produits.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium text-lg">Aucun produit disponible pour le moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {produits.map((produit) => {
                const mainPhoto = produit.produit_photos?.find((p: any) => p.est_principale) || produit.produit_photos?.[0]
                
                return (
                  <Link 
                    key={produit.id} 
                    href={`/p/${produit.slug}`}
                    className="group bg-white rounded-3xl overflow-hidden border border-slate-100 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-500 flex flex-col"
                  >
                    {/* Image Wrapper */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-100">
                      {mainPhoto ? (
                        <Image
                          src={mainPhoto.url}
                          alt={produit.nom}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <ShoppingBag size={48} />
                        </div>
                      )}
                      
                      {/* Price Badge over image */}
                      <div className="absolute bottom-4 left-4">
                        <div className="bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-2xl font-black text-lg">
                          {formatPrix(produit.prix)}
                        </div>
                      </div>

                      {/* Stock Badge */}
                      <div className="absolute top-4 right-4 animate-in fade-in zoom-in duration-500">
                        <StockBadge quantity={produit.quantite} />
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 flex flex-col flex-1 space-y-4">
                      <div className="flex-1 space-y-2">
                        <h2 className="text-xl font-extrabold group-hover:text-brand-primary transition-colors line-clamp-2 leading-tight">
                          {produit.nom}
                        </h2>
                        {produit.prix_barre && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-slate-400 line-through">
                              {formatPrix(produit.prix_barre)}
                            </span>
                            <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                              Promotion
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                        <span className="text-brand-primary font-black flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                          Détails <ArrowRight size={18} />
                        </span>
                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-brand-primary group-hover:text-white transition-all">
                          <ShoppingBag size={18} />
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* Floating CTA */}
      <WhatsAppButton />
    </div>
  )
}
