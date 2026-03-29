'use client'

import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'
import { formatPrix } from '@/lib/utils/formatPrix'
import Header from '@/components/vitrine/Header'
import WhatsAppButton from '@/components/vitrine/WhatsAppButton'
import StockBadge from '@/components/vitrine/StockBadge'
import Image from 'next/image'
import Link from 'next/link'
import SEO from '@/components/common/SEO'
import { ShoppingBag, ArrowRight, Truck, ShieldCheck, CreditCard, Sparkles, Star, Zap } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils/cn'

export default function Home() {
  const [produits, setProduits] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  
  useEffect(() => {
    const fetchProduits = async () => {
      const { data, error } = await supabase
        .from('produits')
        .select('*, produit_photos(*)')
        .eq('actif', true)
        .order('ordre', { ascending: true })
      
      if (!error && data) setProduits(data)
      setLoading(false)
    }
    fetchProduits()
  }, [])

  return (
    <div className="bg-[#030712] min-h-screen text-foreground font-sans pb-24 overflow-x-hidden bg-mesh selection:bg-brand-primary/30">
      <SEO />
      <Header />

      <main>
        {/* Immersive Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-56 md:pb-40 px-6 overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="container mx-auto max-w-7xl text-center relative z-10"
          >
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-3 glass px-6 py-2.5 rounded-full text-[10px] md:text-xs font-black text-brand-primary mb-10 uppercase tracking-[0.4em] shadow-teal border-white/5 active:scale-95 transition-transform cursor-default"
            >
               <div className="relative">
                  <Sparkles size={16} className="text-brand-primary" />
                  <div className="absolute inset-0 blur-sm scale-150 animate-pulse bg-brand-primary/30" />
               </div>
               L'EXCELLENCE J'ACHÈTE.CI • ABIDJAN
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-5xl md:text-[9rem] font-black tracking-tighter leading-[0.85] mb-12 italic"
            >
              L'ART DU <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-accent-blue to-brand-primary bg-[length:200%_auto] animate-gradient-x px-4">SHOPPING</span> <br className="hidden md:block" />
              <span className="text-white">PREMIUM</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
              className="mt-12 text-slate-500 text-lg md:text-2xl max-w-3xl mx-auto leading-relaxed font-medium tracking-tight"
            >
               Une curation d'objets d'exception. <br className="hidden md:block" />
               <span className="text-white/80">Commandez en 2 minutes, soyez livré en 24h.</span>
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="mt-16 flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
               <a href="#catalogue" className="group bg-white text-black px-12 py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-white/5 hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                  VOIR LE CATALOGUE <ArrowRight size={24} strokeWidth={3} className="group-hover:translate-x-2 transition-transform" />
               </a>
               <div className="flex items-center gap-4 px-8 py-4 glass rounded-2xl border-white/5">
                  <div className="flex -space-x-4">
                     {[1, 2, 3, 4].map(i => (
                       <div key={i} className="w-10 h-10 rounded-full border-2 border-[#030712] bg-slate-800 overflow-hidden">
                          <Image src={`https://i.pravatar.cc/100?u=${i}`} alt="User" width={40} height={40} />
                       </div>
                     ))}
                  </div>
                  <div className="text-left">
                     <div className="flex text-brand-primary gap-0.5">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} size={12} fill="currentColor" strokeWidth={0} />)}
                     </div>
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">10k+ Clients Satisfaits</p>
                  </div>
               </div>
            </motion.div>
          </motion.div>

          {/* Epic Background Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl aspect-square bg-brand-primary/5 rounded-full blur-[160px] pointer-events-none animate-pulse" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-accent-blue/5 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-secondary/5 rounded-full blur-[100px] pointer-events-none" />
        </section>

        {/* Dynamic Infinite Scroll / Badges Section */}
        <section className="py-12 border-y border-white/5 bg-white/[0.01] backdrop-blur-2xl">
           <div className="container mx-auto max-w-7xl px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
              {[
                { icon: Truck, title: "Livraison Flash", desc: "Abidjan • Partout • 24h-48h", color: "text-brand-primary", bg: "bg-brand-primary/10" },
                { icon: ShieldCheck, title: "Authenticité", desc: "Produits 100% Vérifiés", color: "text-accent-blue", bg: "bg-accent-blue/10" },
                { icon: CreditCard, title: "Cash On Delivery", desc: "Vérifiez avant de payer", color: "text-brand-secondary", bg: "bg-brand-secondary/10" }
              ].map((feature, i) => (
                <div key={i} className="group flex items-center gap-8 md:justify-center">
                  <div className={cn("w-16 h-16 rounded-[1.8rem] flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110 duration-500", feature.bg, feature.color)}>
                    <feature.icon size={32} strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h3 className="font-black text-white uppercase text-xs tracking-[0.2em]">{feature.title}</h3>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{feature.desc}</p>
                  </div>
                </div>
              ))}
           </div>
        </section>

        {/* Product Grid Catalogue */}
        <section id="catalogue" className="container mx-auto max-w-7xl px-6 py-32">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-10">
            <div className="space-y-6">
              <h2 className="text-5xl md:text-8xl font-black tracking-tighter italic">L'Exclusive <br/> <span className="text-brand-primary uppercase non-italic text-3xl md:text-5xl tracking-[0.2em]">SÉLECTION</span></h2>
              <div className="flex items-center gap-4">
                 <div className="w-24 h-1 bg-brand-primary rounded-full" />
                 <span className="text-slate-500 font-black uppercase tracking-[0.4em] text-[10px]">Mis à jour aujourd'hui</span>
              </div>
            </div>
            <div className="hidden lg:flex gap-4">
               {['Tout', 'Montres', 'Parfums', 'Luxe'].map((cat, i) => (
                 <button key={i} className={cn(
                   "px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all",
                   i === 0 ? "bg-white text-black border-white" : "glass text-slate-500 border-white/5 hover:border-white/20 hover:text-white"
                 )}>
                   {cat}
                 </button>
               ))}
            </div>
          </div>

          {loading ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12">
               {[1, 2, 3].map(i => (
                 <div key={i} className="glass aspect-[4/5] rounded-[3.5rem] animate-pulse border-white/5" />
               ))}
             </div>
          ) : !produits || produits.length === 0 ? (
            <div className="text-center py-40 glass rounded-[4rem] border-dashed border-2 border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <ShoppingBag className="mx-auto text-slate-900 mb-10 group-hover:scale-110 transition-transform duration-700" size={120} />
              <p className="text-slate-500 font-black text-2xl uppercase tracking-[0.3em]">Nouveautés Prochainement</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-10 md:gap-16">
              {produits.map((produit: any, i) => {
                const mainPhoto = produit.produit_photos?.find((p: any) => p.est_principale) || produit.produit_photos?.[0]
                const discount = produit.prix_barre ? Math.round(((produit.prix_barre - produit.prix) / produit.prix_barre) * 100) : 0
                
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1, duration: 0.8 }}
                    viewport={{ once: true, margin: "-100px" }}
                    key={produit.id}
                  >
                    <Link 
                      href={`/p/${produit.slug}`}
                      className="group flex flex-col h-full"
                    >
                      {/* Premium Card Image */}
                      <div className="relative aspect-[3.5/4.5] rounded-[3rem] overflow-hidden bg-[#0a0a0a] border border-white/5 transition-all duration-700 group-hover:border-brand-primary/40 group-hover:shadow-[0_0_100px_-20px_rgba(45,212,191,0.15)] group-hover:-translate-y-2">
                        {/* Status Badges */}
                        <div className="absolute top-8 left-8 z-20 flex flex-col gap-3">
                          <StockBadge quantity={produit.quantite} />
                          {discount > 0 && (
                             <div className="bg-brand-secondary text-white text-[10px] font-black px-5 py-2.5 rounded-2xl uppercase tracking-[0.1em] shadow-2xl shadow-brand-secondary/40 border border-brand-secondary/20">
                                -{discount}%
                             </div>
                          )}
                        </div>

                        <div className="absolute top-8 right-8 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                           <div className="glass p-3 rounded-2xl border-white/10 text-brand-primary">
                              <Zap size={20} fill="currentColor" />
                           </div>
                        </div>

                        {mainPhoto ? (
                          <Image
                            src={mainPhoto.url}
                            alt={produit.nom}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-[3000ms] ease-out opacity-90 group-hover:opacity-100"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-900">
                            <ShoppingBag size={100} />
                          </div>
                        )}
                        
                        {/* Overlay Content */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-700" />
                        
                        <div className="absolute bottom-10 left-10 right-10 flex justify-between items-end transform translate-y-4 group-hover:translate-y-0 transition-all duration-700">
                           <div className="flex flex-col gap-2">
                              {produit.prix_barre && (
                                 <span className="text-base text-slate-600 line-through font-bold opacity-60 tabular-nums">
                                    {formatPrix(produit.prix_barre)}
                                 </span>
                              )}
                              <span className="text-4xl md:text-5xl font-black text-white tracking-tighter tabular-nums drop-shadow-2xl">
                                 {formatPrix(produit.prix)}
                              </span>
                           </div>
                           <motion.div 
                             whileHover={{ scale: 1.1, rotate: -5 }}
                             whileTap={{ scale: 0.9 }}
                             className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-black shadow-2xl shadow-white/5 transition-all duration-500"
                           >
                             <ShoppingBag size={28} strokeWidth={3} />
                           </motion.div>
                        </div>
                      </div>

                      {/* Content Label */}
                      <div className="mt-10 px-6 flex flex-col gap-3">
                        <span className="text-brand-primary text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3">
                          <div className="w-4 h-0.5 bg-brand-primary" />
                          {produit.categories?.name || 'Exclusive Luxe'}
                        </span>
                        <h2 className="text-3xl font-black text-white line-clamp-2 leading-[1] tracking-tighter group-hover:text-brand-primary transition-colors duration-500">
                          {produit.nom}
                        </h2>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          )}
        </section>

        {/* Global Stats / Trust */}
        <section className="container mx-auto max-w-7xl px-6 py-24 mb-32">
           <div className="glass p-12 md:p-24 rounded-[4rem] border-white/5 relative overflow-hidden text-center space-y-12">
              <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-primary/10 via-transparent to-accent-blue/5 opacity-50" />
              
              <motion.div 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="relative z-10 space-y-6"
              >
                 <h2 className="text-4xl md:text-7xl font-black tracking-tighter italic">L'ENGAGEMENT <br/> J'ACHÈTE.CI</h2>
                 <p className="text-slate-400 text-lg md:text-2xl max-w-2xl mx-auto font-medium tracking-tight">
                    Nous ne vendons pas des produits, <br className="hidden md:block" /> 
                    nous sélectionnons des <span className="text-white">standards d'excellence</span>.
                 </p>
              </motion.div>

              <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-12 pt-12 border-t border-white/5">
                 {[
                   { val: "24h", label: "Livraison Moyenne" },
                   { val: "100%", label: "Satisfaction Client" },
                   { val: "500+", label: "Produits Premium" },
                   { val: "0.1%", label: "Taux de Retour" }
                 ].map((stat, i) => (
                   <div key={i} className="space-y-2">
                      <div className="text-4xl md:text-6xl font-black text-brand-primary tracking-tighter italic">{stat.val}</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{stat.label}</div>
                   </div>
                 ))}
              </div>
           </div>
        </section>
      </main>

      <footer className="bg-black/40 pt-40 pb-20 px-6 border-t border-white/5 relative overflow-hidden mt-40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent" />
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-primary/5 rounded-full blur-[120px]" />
        
        <div className="container mx-auto max-w-7xl relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 mb-32">
            <div className="space-y-12">
               <Link href="/" className="flex items-center gap-4 group">
                  <Image src="/logo.png" alt="Logo" width={60} height={60} className="object-contain group-hover:scale-110 transition-transform duration-500" />
                  <div className="flex flex-col -space-y-2">
                     <span className="text-4xl font-black text-white tracking-tighter italic">J'achète<span className="text-brand-primary">.ci</span></span>
                     <span className="text-xs font-black text-slate-500 uppercase tracking-[0.4em]">Elegance • Quality • Trust</span>
                  </div>
               </Link>
               <p className="text-xl text-slate-500 font-medium max-w-md leading-relaxed">
                  L'adresse incontournable des pépites premium à Abidjan. <br/>
                  <span className="text-white/40 italic text-base mt-4 block">"Parce que vous méritez le meilleur, au meilleur prix."</span>
               </p>
               <div className="flex gap-6">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-14 h-14 glass rounded-3xl flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/50 transition-all cursor-pointer group">
                      <Sparkles size={24} className="group-hover:rotate-45 transition-transform" />
                    </div>
                  ))}
               </div>
            </div>

            <div className="glass p-12 md:p-16 rounded-[4rem] space-y-12 relative overflow-hidden group border-white/5">
               <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/10 rounded-full blur-[100px] group-hover:bg-brand-primary/20 transition-all duration-1000" />
               <div className="relative z-10 space-y-4">
                  <span className="text-brand-primary text-[10px] font-black uppercase tracking-[0.5em]">Direct Support</span>
                  <h3 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">BESOIN D'AIDE ?</h3>
               </div>
               
               <div className="relative z-10 space-y-10">
                  <div className="flex flex-col gap-6">
                     <a href="tel:+2250172571352" className="group/link text-2xl md:text-3xl font-black text-white flex items-center gap-6 hover:text-brand-primary transition-all">
                        <div className="w-3 h-3 bg-brand-primary rounded-full group-hover/link:scale-150 transition-transform" />
                        +225 01 72 57 13 52
                     </a>
                     <a href="tel:+2250506844901" className="group/link text-2xl md:text-3xl font-black text-white flex items-center gap-6 hover:text-brand-primary transition-all">
                        <div className="w-3 h-3 bg-brand-secondary rounded-full group-hover/link:scale-150 transition-transform" />
                        +225 05 06 84 49 01
                     </a>
                  </div>
                  <a href="https://wa.me/2250506844901" className="bg-white text-black px-10 py-6 rounded-[2rem] font-black text-lg flex items-center justify-center gap-4 hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10 group">
                     <MessageCircle className="w-8 h-8 group-hover:rotate-12 transition-transform" /> 
                     CHAT WHATSAPP 24/7
                  </a>
               </div>
            </div>
          </div>

          <div className="pt-16 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-10">
             <div className="text-center md:text-left space-y-3">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">© 2024 J'ACHÈTE.CI • BOUTIQUE DE LUXE • POWERED BY PREMIUM STANDARDS</p>
                <p className="text-slate-700 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-2 justify-center md:justify-start">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"/> 
                   SHOWROOM: Yopougon toit Rouge, Abidjan, Côte d'Ivoire
                </p>
             </div>
             <div className="flex gap-12">
                <Link href="/login" className="text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] transition-colors">STAFF ONLY</Link>
                <a href="#" className="text-slate-600 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] transition-colors">CONFIDENTIALITÉ</a>
             </div>
          </div>
        </div>
      </footer>

      <WhatsAppButton />
    </div>
  )
}

function MessageCircle(props: any) {
  return (
    <svg 
      {...props}
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
    </svg>
  )
}

