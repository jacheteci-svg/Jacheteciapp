import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { formatPrix } from '@/lib/utils/formatPrix'
import OrderForm from '@/components/vitrine/OrderForm'
import SocialProof from '@/components/vitrine/SocialProof'
import ProductCarousel from '@/components/vitrine/ProductCarousel'
import StockBadge from '@/components/vitrine/StockBadge'
import Header from '@/components/vitrine/Header'
import WhatsAppButton from '@/components/vitrine/WhatsAppButton'

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = createClient()
  
  const { data: produit, error } = await supabase
    .from('produits')
    .select('*, produit_photos(*), categories(*)')
    .eq('slug', slug)
    .eq('actif', true)
    .single()

  if (error || !produit) {
    notFound()
  }

  const photos = produit.produit_photos?.sort((a: any, b: any) => a.ordre - b.ordre) || []

  return (
    <div className="bg-white min-h-screen text-slate-900 pb-20 font-sans">
      <Header />

      <main className="max-w-xl mx-auto">
        {/* Bloc 1 — Carousel */}
        <section className="relative aspect-square">
          <ProductCarousel photos={photos} />
        </section>

        {/* Bloc 2 — Infos Produit */}
        <section className="p-4 space-y-4">
          <div className="space-y-1">
            <p className="text-orange-600 text-sm font-semibold uppercase tracking-wide">
              {produit.categories?.nom}
            </p>
            <h1 className="text-3xl font-extrabold leading-tight">
              {produit.nom}
            </h1>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-4xl font-black text-orange-600">
              {formatPrix(produit.prix)}
            </span>
            {produit.prix_barre && (
              <span className="text-xl text-slate-400 line-through font-medium">
                {formatPrix(produit.prix_barre)}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 mt-2 py-4">
            <StockBadge quantity={produit.quantite} />
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ring-1 ring-green-100">
              🚚 Livraison disponible à Abidjan
            </span>
          </div>
        </section>

        {/* Bloc 3 — Preuve Sociale */}
        <SocialProof />

        {/* Bloc 4 — Formulaire de commande */}
        <section id="order-form" className="p-4 bg-orange-50/50">
          <OrderForm produit={produit} />
        </section>

        {/* Bloc 5 — Rassurance Finale */}
        <section className="p-4 space-y-6">
          <div className="space-y-3">
            <h2 className="text-xl font-bold border-b pb-2">Description du produit</h2>
            <div className="text-slate-600 leading-relaxed whitespace-pre-wrap text-base">
              {produit.description}
            </div>
          </div>

          <div className="space-y-4 pt-4">
            <h2 className="text-xl font-bold border-b pb-2">Questions fréquentes</h2>
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold mb-1 text-slate-800">Combien de temps pour la livraison ?</h3>
                <p className="text-sm text-slate-600">Nous livrons sous 24h à 48h partout à Abidjan.</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl">
                <h3 className="font-bold mb-1 text-slate-800">Puis-je payer à la livraison ?</h3>
                <p className="text-sm text-slate-600">Oui, vous payez cash seulement après avoir reçu et vérifié votre produit.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* CTA WhatsApp Flottant */}
      <WhatsAppButton />
    </div>
  )
}
