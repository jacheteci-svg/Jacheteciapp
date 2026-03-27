export const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID

export const pageview = () => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.fbq) {
    // @ts-ignore
    window.fbq('track', 'PageView')
  }
}

export const event = (name: string, options = {}) => {
  // @ts-ignore
  if (typeof window !== 'undefined' && window.fbq) {
    // @ts-ignore
    window.fbq('track', name, options)
  }
}
