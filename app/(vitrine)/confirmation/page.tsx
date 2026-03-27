import { createClient } from '@/lib/supabase/server'
import { formatPrix } from '@/lib/utils/formatPrix'
import Link from 'next/link'
import Header from '@/components/vitrine/Header'

export default async function ConfirmationPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ id: string }> 
}) {
  const { id } = await searchParams
  const supabase = createClient()
  
  const { data: order } = await supabase
    .from('commandes')
    .select('*, produits(*)')
    .eq('id', id)
    .single()

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />
      
      <main className="max-w-md mx-auto p-6 text-center space-y-8 mt-10">
        <div className="space-y-4">
          <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-5xl animate-bounce">
            ✅
          </div>
          <h1 className="text-3xl font-black text-slate-800">Commande reçue !</h1>
          <p className="text-slate-600 font-medium text-lg">
            Merci pour votre confiance. <br />
            <span className="text-orange-600 font-bold">Nous vous appelons sous 30 minutes</span> pour confirmer la livraison.
          </p>
        </div>

        {order && (
          <div className="bg-slate-50 rounded-2xl p-6 text-left border border-slate-100 space-y-4 shadow-sm">
            <h2 className="font-bold text-slate-400 uppercase text-xs tracking-widest border-b pb-2">Détails de votre order</h2>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Produit</span>
              <span className="font-bold text-slate-800">{order.produits?.nom}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Quantité</span>
              <span className="font-bold text-slate-800">x{order.quantite}</span>
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-500">Mode de paiement</span>
              <span className="font-bold text-slate-800 capitalize">{order.paiement_mode.replace('_', ' ')}</span>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-200">
              <span className="font-bold text-slate-800">TOTAL À PAYER</span>
              <span className="font-black text-orange-600 text-xl">{formatPrix(order.montant_total)}</span>
            </div>
          </div>
        )}

        <div className="pt-6 space-y-4">
          <Link 
            href="/"
            className="block w-full py-4 bg-slate-900 text-white rounded-xl font-bold active:scale-95 transition-transform"
          >
            Retourner à l'accueil
          </Link>
          <p className="text-xs text-slate-400">
            Une question ? Contactez-nous au {process.env.NEXT_PUBLIC_WHATSAPP_BOUTIQUE}
          </p>
        </div>
      </main>
    </div>
  )
}
