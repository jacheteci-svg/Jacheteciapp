import crypto from 'crypto'

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
  const pixelId = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID
  const accessToken = process.env.FACEBOOK_CAPI_TOKEN

  if (!pixelId || !accessToken) {
    console.warn('Facebook Pixel ID or CAPI Token missing')
    return { success: false, error: 'Config missing' }
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
    return { success: true, result }
  } catch (error) {
    console.error('Error sending CAPI event:', error)
    return { success: false, error }
  }
}
