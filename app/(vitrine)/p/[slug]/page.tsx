import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import { formatPrix } from '@/lib/utils/formatPrix'
import ProductActions from '@/components/vitrine/ProductActions'
import SocialProof from '@/components/vitrine/SocialProof'
import ProductCarousel from '@/components/vitrine/ProductCarousel'
import StockBadge from '@/components/vitrine/StockBadge'
import Header from '@/components/vitrine/Header'
import WhatsAppButton from '@/components/vitrine/WhatsAppButton'
import SEO from '@/components/common/SEO'
import { ShieldCheck, Truck, RefreshCcw } from 'lucide-react'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: produit, error } = await supabase
    .from('produits')
    .select('*, produit_photos(*), categories(*), product_variants(*)')
    .eq('slug', slug)
    .eq('actif', true)
    .single()

  if (error || !produit) {
    notFound()
  }

  const photos = produit.produit_photos?.sort((a: any, b: any) => a.ordre - b.ordre) || []

  return (
    <div className="bg-slate-50 min-h-screen text-slate-900 pb-32 font-sans overflow-x-hidden">
      <SEO 
        title={produit.nom}
        description={produit.description?.substring(0, 160)}
        image={photos[0]?.url}
        type="product"
        price={produit.prix}
      />
      <Header />

      <main className="max-w-4xl mx-auto md:py-12 px-0 md:px-4">
        <div className="bg-white md:rounded-[3rem] overflow-hidden md:shadow-2xl md:shadow-brand-primary/5 flex flex-col md:flex-row gap-0">
          
          {/* LEFT: Carousel */}
          <section className="w-full md:w-1/2 relative bg-white border-b md:border-b-0 md:border-r border-slate-100">
            <ProductCarousel photos={photos} />
          </section>

          {/* RIGHT: Product Infos */}
          <section className="w-full md:w-1/2 p-6 md:p-12 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                 <span className="text-brand-primary text-xs font-black uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full">
                   {produit.categories?.name || 'Produit'}
                 </span>
                 <StockBadge quantity={produit.quantite} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black leading-[1.1] tracking-tighter text-slate-900">
                {produit.nom}
              </h1>
            </div>

            <div className="flex items-end gap-3 py-2">
              <span className="text-5xl font-black text-brand-primary tracking-tighter">
                {formatPrix(produit.prix)}
              </span>
              {produit.prix_barre && (
                <span className="text-2xl text-slate-300 line-through font-bold mb-1">
                  {formatPrix(produit.prix_barre)}
                </span>
              )}
            </div>

            {/* Rassurance Grid */}
            <div className="grid grid-cols-1 gap-4 pt-4 border-t border-slate-50">
               <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-green-50 text-green-500 flex items-center justify-center shrink-0">
                     <Truck size={18} />
                  </div>
                  Livraison Partout à Abidjan sous 48h
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                     <ShieldCheck size={18} />
                  </div>
                  Paiement sécurisé à la livraison
               </div>
               <div className="flex items-center gap-3 text-sm font-bold text-slate-500">
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                     <RefreshCcw size={18} />
                  </div>
                  Vérifiez le produit avant de payer
               </div>
            </div>

            {/* CTAs */}
            <div className="pt-6">
               <ProductActions produit={produit} />
            </div>
          </section>
        </div>

        {/* BOTTOM CONTENT: Description & Social Proof */}
        <div className="mt-8 md:mt-12 space-y-12 px-4 md:px-0">
           <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <div className="space-y-4">
                 <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                    <div className="w-2 h-8 bg-brand-primary rounded-full" />
                    Description du produit
                 </h2>
                 <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg font-medium">
                    {produit.description}
                 </div>
              </div>
           </section>

           <section className="bg-brand-primary/5 p-8 md:p-12 rounded-[2.5rem] border border-brand-primary/10">
              <SocialProof />
           </section>

           <section className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-8">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Questions fréquentes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-slate-50 p-6 rounded-3xl">
                    <a 
                       href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOUTIQUE || '2250700000000'}?text=Bonjour, je souhaite avoir plus d'informations.`}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="block"
                    >
                       <h3 className="font-bold mb-2 text-slate-900">Combien de temps pour la livraison ?</h3>
                       <p className="text-slate-600 font-medium text-sm">Nous livrons sous 24h à 48h partout à Abidjan.</p>
                    </a>
                 </div>
                 <div className="bg-slate-50 p-6 rounded-3xl">
                    <h3 className="font-bold mb-2 text-slate-900">Puis-je payer à la livraison ?</h3>
                    <p className="text-slate-600 font-medium text-sm">Oui, vous payez cash seulement après avoir reçu et vérifié votre produit.</p>
                 </div>
              </div>
           </section>
        </div>
      </main>

      {/* Floating CTA WhatsApp */}
      <WhatsAppButton />
    </div>
  )
}
