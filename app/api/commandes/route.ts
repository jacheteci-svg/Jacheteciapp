import { createClient } from '@/lib/supabase/server'
import { sendWhatsAppMessage } from '@/lib/whatsapp/greenapi'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const body = await request.json()

  const {
    produit_id,
    nom_produit,
    client_nom,
    client_tel,
    client_quartier,
    quantite,
    montant_total,
    paiement_mode,
  } = body

  try {
    // 1. Gérer le client (Upsert par téléphone)
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .upsert(
        { 
          nom: client_nom, 
          telephone: client_tel, 
          quartier: client_quartier,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'telephone' }
      )
      .select()
      .single()

    if (clientError) throw clientError

    // 2. Créer la commande
    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const { data: commande, error: commandeError } = await supabase
      .from('commandes')
      .insert({
        client_id: client.id,
        produit_id,
        client_nom,
        client_tel,
        client_quartier,
        quantite,
        montant_total,
        paiement_mode,
        statut: 'nouveau',
        event_id: eventId
      })
      .select()
      .single()

    if (commandeError) throw commandeError

    // 3. Notification WhatsApp au vendeur
    const vendeurTel = process.env.GREENAPI_VENDEUR_TEL
    if (vendeurTel) {
      const message = `🛒 *NOUVELLE COMMANDE - JACHETE.CI*\n\n📦 Produit : ${nom_produit}\n👤 Client : ${client_nom}\n📱 Téléphone : ${client_tel}\n📍 Zone : ${client_quartier}\n💰 Montant : ${montant_total} FCFA\n💳 Paiement : ${paiement_mode}\n🕐 Heure : ${new Date().toLocaleString('fr-FR')}\n\n👉 Traiter : ${process.env.NEXT_PUBLIC_APP_URL}/admin/commandes/${commande.id}`
      
      await sendWhatsAppMessage(vendeurTel, message)
    }

    // 4. Retourner succès
    return NextResponse.json({ 
      success: true, 
      commandeId: commande.id,
      eventId: eventId 
    })

  } catch (error: any) {
    console.error('Erreur API Commande:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
