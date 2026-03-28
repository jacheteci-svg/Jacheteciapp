import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'

export const hashData = (data: string) => {
  if (!data) return ''
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex')
}

export const sendCAPIEvent = async ({
  eventName,
  eventId,
  userData,
  customData = {},
}: {
  eventName: string
  eventId: string
  userData: {
    clientTel?: string
    clientEmail?: string
    clientIp?: string
    userAgent?: string
  }
  customData?: any
}) => {
  const supabase = createClient()
  
  // Fetch config from DB
  const { data: config } = await supabase
    .from('pixel_config')
    .select('*')
    .single()

  const pixelId = config?.pixel_id || process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
  const accessToken = config?.capi_token || process.env.FACEBOOK_CAPI_TOKEN

  if (!pixelId || !accessToken || !config?.actif) {
    return { success: false, error: 'Pixel ID, CAPI Token missing or inactive' }
  }

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        event_id: eventId,
        action_source: 'website',
        user_data: {
          ph: userData.clientTel ? [hashData(userData.clientTel)] : [],
          em: userData.clientEmail ? [hashData(userData.clientEmail)] : [],
          client_ip_address: userData.clientIp,
          client_user_agent: userData.userAgent,
        },
        custom_data: customData,
        test_event_code: config.mode_test ? config.test_event_code : undefined
      },
    ],
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    )

    const result = await response.json()
    
    // Log to DB
    await supabase.from('pixel_logs').insert({
      event_name: eventName,
      event_id: eventId,
      source: 'CAPI',
      montant: customData.value || null,
      statut: result.error ? 'erreur' : 'envoye',
      erreur: result.error ? JSON.stringify(result.error) : null
    })

    return { success: true, result }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
