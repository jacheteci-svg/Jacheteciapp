import { createClient } from '@/lib/supabase/server'
import { sendCAPIEvent } from '@/lib/pixel/capi'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()

  const {
    eventName,
    eventId,
    produitId,
    commandeId,
    montant,
    clientTel,
    clientEmail,
  } = body

  const userAgent = request.headers.get('user-agent') || ''
  const xForwardedFor = request.headers.get('x-forwarded-for')
  const clientIp = xForwardedFor ? xForwardedFor.split(',')[0] : '127.0.0.1'

  try {
    // 1. Envoyer à Facebook CAPI
    const capiResult = await sendCAPIEvent({
      eventName,
      eventId,
      userData: {
        clientTel,
        clientEmail,
        clientIp,
        userAgent,
      },
      customData: {
        value: montant,
        currency: 'XOF',
        content_ids: produitId ? [produitId] : [],
        content_type: 'product',
      },
    })

    // 2. Logger l'événement dans la DB
    await supabase.from('pixel_logs').insert({
      event_name: eventName,
      event_id: eventId,
      source: 'server',
      produit_id: produitId,
      commande_id: commandeId,
      montant: montant,
      statut: capiResult.success ? 'envoye' : 'erreur',
      erreur: capiResult.success ? null : JSON.stringify(capiResult.error),
    })

    return NextResponse.json({ success: capiResult.success })

  } catch (error: any) {
    console.error('Erreur API Pixel CAPI:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
