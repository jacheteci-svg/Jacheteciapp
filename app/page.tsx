import { createClient } from '@/lib/supabase/server'
export const dynamic = 'force-dynamic'
import { formatPrix } from '@/lib/utils/formatPrix'
import Header from '@/components/vitrine/Header'
import WhatsAppButton from '@/components/vitrine/WhatsAppButton'
import StockBadge from '@/components/vitrine/StockBadge'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, ArrowRight, Truck, ShieldCheck, CreditCard } from 'lucide-react'

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
        {/* Landing Hero Section */}
        <section className="relative bg-white overflow-hidden border-b border-slate-100">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-brand-primary/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-brand-secondary/5 rounded-full blur-3xl" />
          
          <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24 flex flex-col items-center text-center relative z-10">
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-[10px] md:text-sm font-black text-brand-primary mb-6 uppercase tracking-[0.2em]">
               🔥 Boutique Officielle J'achète.ci
            </div>
            <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-slate-900 max-w-4xl leading-[1.1]">
              Le shopping <span className="text-brand-primary italic">premium</span> <br className="hidden md:block" />
              à portée de <span className="text-brand-secondary">clic</span>
            </h1>
            <p className="mt-8 text-base md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
               Commandez vos produits préférés en <span className="text-slate-900 font-bold">moins de 2 minutes</span>. 
               Qualité garantie, service client dédié et livraison ultra-rapide partout à Abidjan.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <a href="#catalogue" className="bg-brand-primary text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-brand-primary/25 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
                  Voir le catalogue <ArrowRight size={22} strokeWidth={3} />
               </a>
            </div>
          </div>
        </section>

        {/* Benefits / Rassurance Section */}
        <section className="py-12 bg-slate-50/50">
           <div className="container mx-auto max-w-6xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm">
                 <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 shrink-0">
                    <Truck size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Livraison Éclaire</h3>
                    <p className="text-sm text-slate-500 font-medium leading-normal">Livré chez vous à Abidjan sous 24h à 48h maximum.</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm">
                 <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                    <ShieldCheck size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Qualité Prime</h3>
                    <p className="text-sm text-slate-500 font-medium leading-normal">Chaque produit est vérifié avant d'être mis en vente.</p>
                 </div>
              </div>
              <div className="bg-white p-6 rounded-3xl border border-slate-100 flex items-start gap-4 shadow-sm">
                 <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                    <CreditCard size={24} />
                 </div>
                 <div>
                    <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-1">Paiement Sécurisé</h3>
                    <p className="text-sm text-slate-500 font-medium leading-normal">Payez seulement à la réception après vérification.</p>
                 </div>
              </div>
           </div>
        </section>

        {/* Product Grid Catalogue */}
        <section id="catalogue" className="container mx-auto max-w-6xl px-4 py-16">
          <div className="mb-12 space-y-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Le Catalogue</h2>
            <div className="w-16 h-1.5 bg-brand-primary rounded-full" />
          </div>

          {!produits || produits.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <ShoppingBag className="mx-auto text-slate-200 mb-6" size={64} />
              <p className="text-slate-400 font-bold text-xl uppercase tracking-widest">Le stock est en cours de réapprovisionnement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
              {produits.map((produit) => {
                const mainPhoto = produit.produit_photos?.find((p: any) => p.est_principale) || produit.produit_photos?.[0]
                const discount = produit.prix_barre ? Math.round(((produit.prix_barre - produit.prix) / produit.prix_barre) * 100) : 0
                
                return (
                  <Link 
                    key={produit.id} 
                    href={`/p/${produit.slug}`}
                    className="group bg-white rounded-[2rem] overflow-hidden border border-slate-50 hover:shadow-2xl hover:shadow-brand-primary/10 transition-all duration-700 flex flex-col relative"
                  >
                    {/* Discount Badge */}
                    {discount > 0 && (
                       <div className="absolute top-4 left-4 z-20 bg-brand-secondary text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-tighter">
                          -{discount}% OFF
                       </div>
                    )}

                    {/* Image Wrapper */}
                    <div className="relative aspect-[4/5] overflow-hidden bg-slate-50">
                      {mainPhoto ? (
                        <Image
                          src={mainPhoto.url}
                          alt={produit.nom}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-[1500ms]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-200">
                          <ShoppingBag size={64} />
                        </div>
                      )}
                      
                      {/* Price Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-6">
                         <span className="text-brand-primary text-xs font-black uppercase tracking-widest bg-brand-primary/5 px-3 py-1 rounded-full self-start mb-2">
                           {produit.categories?.name || 'Produit'}
                         </span>
                         <span className="text-white font-black text-2xl tracking-tighter">Commander maintenant</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 flex flex-col flex-1 space-y-6">
                      <div className="space-y-3">
                         <div className="flex items-center gap-2">
                            <StockBadge quantity={produit.quantite} />
                         </div>
                        <h2 className="text-2xl font-black group-hover:text-brand-primary transition-colors line-clamp-2 leading-[1.1] tracking-tight">
                          {produit.nom}
                        </h2>
                      </div>

                      <div className="pt-4 flex items-end justify-between border-t border-slate-50">
                         <div className="flex flex-col">
                            {produit.prix_barre && (
                               <span className="text-sm text-slate-400 line-through font-bold mb-1">
                                  {formatPrix(produit.prix_barre)}
                               </span>
                            )}
                            <span className="text-3xl font-black text-brand-primary tracking-tighter">
                               {formatPrix(produit.prix)}
                            </span>
                         </div>
                        <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white group-hover:bg-brand-primary group-hover:rotate-[360deg] transition-all duration-700 shadow-lg shadow-black/10 group-hover:shadow-brand-primary/30">
                          <ShoppingBag size={24} strokeWidth={2.5} />
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

      {/* Footer Support */}
      <footer className="bg-slate-900 py-20 px-4 text-center">
         <div className="container mx-auto max-w-4xl space-y-12">
            <div className="space-y-4">
               <h2 className="text-white text-3xl md:text-5xl font-black tracking-tight">Besoin d'aide ?</h2>
               <p className="text-slate-400 font-medium">Notre service client est disponible 7j/7 pour vous accompagner.</p>
            </div>
             <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                <a href="https://jachete.ci/shop/" className="bg-brand-primary text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 w-full md:w-auto hover:bg-brand-primary/90 transition-colors shadow-xl shadow-brand-primary/20">
                   Voir plus d'articles
                </a>
                <div className="flex flex-col gap-2">
                   <a href="tel:+2250172571352" className="bg-white/5 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors flex items-center gap-3">
                      <span className="w-2 h-2 bg-brand-primary rounded-full animate-pulse"></span>
                      +225 01 72 57 13 52
                   </a>
                   <a href="tel:+2250506844901" className="bg-white/5 text-white px-8 py-4 rounded-2xl font-bold text-sm hover:bg-white/10 transition-colors flex items-center gap-3">
                      <span className="w-2 h-2 bg-brand-secondary rounded-full animate-pulse"></span>
                      +225 05 06 84 49 01
                   </a>
                </div>
                <a href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_BOUTIQUE || '2250700000000'}`} className="bg-green-600 text-white px-10 py-5 rounded-2xl font-black text-lg flex items-center gap-3 w-full md:w-auto hover:bg-green-500 transition-colors shadow-xl shadow-green-600/20">
                   <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                      <path d="M12.031 6.172c-2.311 0-4.189 1.878-4.189 4.189 0 2.308 1.878 4.189 4.189 4.189 2.311 0 4.19-1.881 4.19-4.189S14.342 6.172 12.031 6.172zm0 7.378c-1.758 0-3.189-1.431-3.189-3.189s1.431-3.189 3.189-3.189 3.189 1.431 3.189 3.189-1.431 3.189-3.189 3.189zM12.031 2C6.49 2 2 6.49 2 12.03c0 1.731.438 3.356 1.206 4.778l-1.206 4.4 4.541-1.191a10.031 10.031 0 004.49 1.053c5.541 0 10.031-4.49 10.031-10.031C22.063 6.49 17.573 2 12.031 2zm0 18c-1.631 0-3.147-.469-4.416-1.275l-2.612.684.697-2.544c-.934-1.325-1.488-2.934-1.488-4.666 0-4.413 3.587-8 8-8s8 3.587 8 8-3.587 8-8 8z" />
                   </svg>
                   Contact WhatsApp
                </a>
             </div>
            <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-6">
               <div className="space-y-2">
                  <p className="text-slate-400 text-sm font-medium">Yopougon toit Rouge Non loin de la Grande Mosquée apres le stade bae</p>
                  <a href="https://jachete.ci/politique-de-confidentialite/" target="_blank" className="text-brand-primary text-xs font-bold hover:underline">Politique de confidentialité</a>
               </div>
               <div className="flex items-center gap-3 grayscale opacity-30">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 font-black text-xl shadow-lg">J</div>
                  <span className="text-white font-black text-xl tracking-tighter">J'achète<span className="text-brand-secondary">.ci</span></span>
               </div>
               <div className="flex flex-col items-center gap-4">
                  <p className="text-[10px] uppercase font-bold text-slate-500 tracking-[0.4em]">
                    © 2024 J'ACHÈTE.CI - Tout droits réservés
                    <Link href="/login" className="opacity-0 hover:opacity-10 transition-opacity ml-1">.</Link>
                  </p>
               </div>
            </div>
         </div>
      </footer>

      {/* Floating CTA */}
      <WhatsAppButton />
    </div>
  )
}
