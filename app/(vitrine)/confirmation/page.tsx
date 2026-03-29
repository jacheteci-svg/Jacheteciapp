import { createClient } from '@/lib/supabase/server'
import { formatPrix } from '@/lib/utils/formatPrix'
import Link from 'next/link'
import Header from '@/components/vitrine/Header'
import { CheckCircle2, ShoppingBag, Truck, Phone, ChevronRight, Home } from 'lucide-react'

export default async function ConfirmationPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id: string }> 
}) {
  const { id } = await searchParams
  const supabase = await createClient()
  
  const { data: order } = await supabase
    .from('commandes')
    .select('*, produits(*)')
    .eq('id', id)
    .single()

  return (
    <div className="bg-[#030712] min-h-screen text-slate-300 selection:bg-brand-primary/30 selection:text-brand-primary relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-mesh opacity-20 pointer-events-none" />
      <div className="fixed top-0 left-0 w-full h-[500px] bg-gradient-to-b from-brand-primary/10 via-transparent to-transparent pointer-events-none" />
      
      <Header />
      
      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-20 pb-40 space-y-16">
        
        {/* SUCCESS ICON & TITLE */}
        <div className="text-center space-y-8">
           <div className="relative inline-block">
              <div className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
              <div className="relative w-24 h-24 bg-brand-primary/10 text-brand-primary rounded-[2.5rem] flex items-center justify-center mx-auto border border-brand-primary/30">
                 <CheckCircle2 size={56} strokeWidth={2} />
              </div>
           </div>
           
           <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter">COMMANDE REÇUE !</h1>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-secondary/10 text-brand-secondary rounded-full border border-brand-secondary/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
                 <Phone size={12} fill="currentColor" /> APPEL DE CONFIRMATION DANS 30 MIN
              </div>
              <p className="text-slate-400 font-medium text-lg md:text-xl max-w-md mx-auto leading-relaxed italic">
                 Merci pour votre confiance. <br />
                 Votre colis est en cours de préparation pour une livraison express.
              </p>
           </div>
        </div>

        {/* ORDER DETAILS CARD */}
        {order && (
          <section className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-brand-primary/20 to-accent-blue/20 rounded-[3rem] blur-xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000" />
            <div className="relative glass rounded-[3rem] border-white/5 overflow-hidden">
               <div className="p-8 md:p-12 space-y-10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-6">
                     <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">RÉSUMÉ DE VOTRE COMMANDE</h2>
                     <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">ID: {id?.slice(0, 8)}</span>
                  </div>

                  <div className="space-y-8">
                     <div className="flex justify-between items-center group/item">
                        <span className="text-slate-500 font-medium">Produit souhaité</span>
                        <div className="flex items-center gap-3">
                           <ShoppingBag size={16} className="text-brand-primary" />
                           <span className="font-black text-white italic tracking-tight">{order.produits?.nom}</span>
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-center group/item">
                        <span className="text-slate-500 font-medium">Quantité</span>
                        <span className="font-black text-white px-3 py-1 bg-white/5 rounded-lg border border-white/5">x{order.quantite}</span>
                     </div>

                     <div className="flex justify-between items-center group/item">
                        <span className="text-slate-500 font-medium">Mode de paiement</span>
                        <span className="font-black text-white bg-white/5 px-4 py-1.5 rounded-full border border-white/5 uppercase text-[10px] tracking-widest">
                           {order.paiement_mode.replace('_', ' ')}
                        </span>
                     </div>

                     <div className="pt-8 border-t border-white/10 flex justify-between items-end">
                        <div className="space-y-1">
                           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">MONTANT TOTAL</span>
                           <p className="text-3xl font-black text-white italic tracking-tighter">À PAYER À LA LIVRAISON</p>
                        </div>
                        <span className="font-black text-brand-primary text-4xl tracking-tighter italic animate-pulse-slow">
                           {formatPrix(order.montant_total)}
                        </span>
                     </div>
                  </div>
               </div>

               {/* TRUCK DECORATION */}
               <div className="bg-brand-primary/5 p-6 flex items-center gap-4 border-t border-white/5">
                  <Truck size={20} className="text-brand-primary" />
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Livraison gratuite dès 2 articles partout à Abidjan</p>
               </div>
            </div>
          </section>
        )}

        {/* ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-10">
           <Link 
             href="/"
             className="flex items-center justify-center gap-3 py-6 glass rounded-[2rem] border-white/5 text-white font-black text-sm uppercase tracking-widest hover:border-brand-primary/20 hover:bg-brand-primary/5 transition-all group lg:order-2"
           >
             CONTINUER MON SHOPPING <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
           </Link>
           
           <Link 
             href="/"
             className="flex items-center justify-center gap-3 py-6 bg-white text-black rounded-[2rem] font-black text-sm uppercase tracking-widest hover:shadow-[0_0_30px_rgba(255,255,255,0.1)] transition-all lg:order-1 active:scale-95"
           >
             <Home size={18} /> RETOUR À L'ACCUEIL
           </Link>
        </div>

        <div className="text-center">
           <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">
             Besoin d'aide ? WhatsApp : {process.env.NEXT_PUBLIC_WHATSAPP_BOUTIQUE}
           </p>
        </div>
      </main>
    </div>
  )
}
