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
import { ShieldCheck, Truck, RefreshCcw, Star, ChevronLeft } from 'lucide-react'
import Link from 'next/link'

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
    <div className="bg-[#030712] min-h-screen text-white pb-32 font-sans overflow-x-hidden bg-mesh selection:bg-brand-primary/30">
      <SEO 
        title={produit.nom}
        description={produit.description?.substring(0, 160)}
        image={photos[0]?.url}
        type="product"
        price={produit.prix}
      />
      <Header />

      <main className="max-w-6xl mx-auto pt-24 md:pt-40 px-4 md:px-8">
        {/* Breadcrumb & Navigation */}
        <div className="mb-10 flex items-center gap-4">
           <Link href="/#catalogue" className="glass p-3 rounded-2xl border-white/5 text-slate-400 hover:text-white hover:border-white/20 transition-all flex items-center justify-center shrink-0">
              <ChevronLeft size={20} strokeWidth={3} />
           </Link>
           <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
              <Link href="/" className="hover:text-brand-primary transition-colors">ACCUEIL</Link>
              <span className="opacity-20">/</span>
              <span className="text-brand-primary">{produit.categories?.name || 'BOUTIQUE'}</span>
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12 lg:gap-20 items-start">
          
          {/* LEFT: Product Visuals */}
          <section className="w-full lg:w-[55%] relative space-y-8 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="glass rounded-[3.5rem] overflow-hidden border-white/5 shadow-2xl shadow-black/50 group">
              <ProductCarousel photos={photos} />
            </div>
            
            {/* Desktop Features Badges */}
            <div className="hidden lg:grid grid-cols-3 gap-6">
               {[
                 { icon: Truck, title: "LIVRAISON 48H", desc: "Abidjan & Intérieur", color: "text-brand-primary", bg: "bg-brand-primary/10" },
                 { icon: ShieldCheck, title: "Paiement Sûr", desc: "Payez à la réception", color: "text-accent-blue", bg: "bg-accent-blue/10" },
                 { icon: RefreshCcw, title: "Qualité Pro", desc: "Vérifié avant envoi", color: "text-brand-secondary", bg: "bg-brand-secondary/10" }
               ].map((f, i) => (
                 <div key={i} className="glass p-6 rounded-[2rem] border-white/5 space-y-3">
                    <div className={`${f.bg} ${f.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                       <f.icon size={20} strokeWidth={2.5} />
                    </div>
                    <div className="space-y-1">
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-white">{f.title}</h3>
                       <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{f.desc}</p>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* RIGHT: Product Information */}
          <section className="w-full lg:w-[45%] sticky top-32 space-y-10 animate-in fade-in slide-in-from-right-8 duration-1000">
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                 <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.3em] bg-brand-primary/10 border border-brand-primary/20 px-4 py-2 rounded-full">
                   {produit.categories?.name || 'EXCLUSIVITÉ'}
                 </span>
                 <StockBadge quantity={produit.quantite} />
              </div>
              <h1 className="text-4xl md:text-6xl font-black leading-[0.95] tracking-tighter italic">
                {produit.nom}
              </h1>
              
              <div className="flex items-center gap-3">
                 <div className="flex text-brand-primary gap-0.5">
                    {[1, 2, 3, 4, 5].map(i => <Star key={i} size={14} fill="currentColor" strokeWidth={0} />)}
                 </div>
                 <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">(128 avis vérifiés)</span>
              </div>
            </div>

            <div className="flex items-end gap-6 py-4 border-y border-white/5">
              <div className="flex flex-col">
                 <span className="text-6xl md:text-7xl font-black text-white tracking-tighter italic drop-shadow-xl">
                   {formatPrix(produit.prix)}
                 </span>
                 {produit.prix_barre && (
                   <span className="text-2xl text-slate-600 line-through font-bold -mt-2">
                     {formatPrix(produit.prix_barre)}
                   </span>
                 )}
              </div>
              {produit.prix_barre && (
                 <div className="mb-4 bg-brand-secondary px-3 py-1 rounded-lg text-[10px] font-black uppercase shadow-lg shadow-brand-secondary/20">
                    - {Math.round(((produit.prix_barre - produit.prix) / produit.prix_barre) * 100)} %
                 </div>
              )}
            </div>

            {/* CTAs & Options */}
            <div className="glass p-8 md:p-10 rounded-[3rem] border-white/5 shadow-2xl shadow-black/40">
               <ProductActions produit={produit} />
            </div>

            {/* Mobile Features Badges (Compact) */}
            <div className="lg:hidden flex flex-wrap gap-4">
               {[
                 { icon: Truck, title: "LIVRAISON 48H", color: "text-brand-primary" },
                 { icon: ShieldCheck, title: "Paiement Sûr", color: "text-accent-blue" },
                 { icon: RefreshCcw, title: "Vérifier à réception", color: "text-brand-secondary" }
               ].map((f, i) => (
                 <div key={i} className="flex items-center gap-2 glass px-4 py-2 rounded-full border-white/5">
                    <f.icon size={12} className={f.color} />
                    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{f.title}</span>
                 </div>
               ))}
            </div>
          </section>
        </div>

        {/* DETAILS SECTION */}
        <div className="mt-32 space-y-20 lg:space-y-40">
           {/* Description Container */}
           <section className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 via-transparent to-accent-blue/20 rounded-[4rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
              <div className="relative glass p-10 md:p-24 rounded-[4rem] border-white/5 space-y-12 overflow-hidden">
                 <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-primary/5 rounded-full blur-[100px] -mr-40 -mt-40 pointer-events-none" />
                 
                 <div className="space-y-6 relative z-10">
                    <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter flex items-center gap-6">
                       <span className="w-12 h-1 bg-brand-primary rounded-full hidden md:block" />
                       DESCRIPTION DÉTAILLÉE
                    </h2>
                    <div className="text-slate-400 leading-relaxed whitespace-pre-wrap text-lg md:text-xl font-medium tracking-tight max-w-4xl">
                       {produit.description}
                    </div>
                 </div>
              </div>
           </section>

           {/* Social Proof & Reviews (Abstracted) */}
           <section className="glass-card p-10 md:p-24 rounded-[4rem] border-white/5 bg-brand-primary/[0.02] relative overflow-hidden">
              <div className="absolute inset-0 bg-mesh opacity-30" />
              <SocialProof />
           </section>

           {/* FAQ / Support */}
           <section className="space-y-12 pb-20">
              <div className="text-center space-y-4">
                 <h2 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">QUESTIONS FRÉQUENTES</h2>
                 <p className="text-slate-500 font-bold uppercase tracking-[0.3em] text-[10px]">Besoin de plus d'infos ? Contactez-nous</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                 {[
                   { q: "Combien de temps pour la livraison ?", a: "Nous livrons sous 24h à 48h partout à Abidjan. Pour l'intérieur, comptez 72h maximum." },
                   { q: "Puis-je payer à la livraison ?", a: "Affirmatif. C'est le standard J'achète.ci : vérifiez, testez et payez seulement si vous êtes 100% satisfait." },
                   { q: "Politique de retour ?", a: "Si le produit ne correspond pas à vos attentes lors de la livraison, vous pouvez le refuser sans frais." },
                   { q: "Discutez en direct ?", a: "Notre équipe est disponible 24/7 sur WhatsApp pour toutes vos questions spécifiques." }
                 ].map((faq, i) => (
                    <div key={i} className="glass p-10 rounded-[3rem] border-white/5 space-y-4 hover:border-brand-primary/20 transition-all duration-500">
                       <h3 className="font-black text-xl italic tracking-tight text-white">{faq.q}</h3>
                       <p className="text-slate-400 font-medium leading-relaxed">{faq.a}</p>
                    </div>
                 ))}
              </div>
           </section>
        </div>
      </main>

      <WhatsAppButton />
    </div>
  )
}
