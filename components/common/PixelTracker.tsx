'use client'

import { useEffect, Suspense } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Script from 'next/script'

function PixelInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    async function initPixel() {
      const { data: config } = await supabase
        .from('pixel_config')
        .select('*')
        .single()

      if (!config || !config.actif || !config.pixel_id) return

      // @ts-ignore
      if (typeof window !== 'undefined' && !window.fbq) {
        // @ts-ignore
        !(function (f: any, b: any, e: any, v: any, n?: any, t?: any, s?: any) {
          if (f.fbq) return
          n = f.fbq = function () {
            n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments)
          }
          if (!f._fbq) f._fbq = n
          n.push = n
          n.loaded = !0
          n.version = '2.0'
          n.queue = []
          t = b.createElement(e)
          t.async = !0
          t.src = v
          s = b.getElementsByTagName(e)[0]
          s?.parentNode?.insertBefore(t, s)
        })(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js')

        // @ts-ignore
        window.fbq('init', config.pixel_id)
        // Store for global access
        // @ts-ignore
        window.FB_PIXEL_ID = config.pixel_id
      }

      // Track PageView on every route change
      // @ts-ignore
      if (window.fbq) {
        // @ts-ignore
        window.fbq('track', 'PageView')
      }
    }

    initPixel()
  }, [pathname, searchParams, supabase])

  return null
}

export default function PixelTracker() {
  return (
    <Suspense fallback={null}>
      <PixelInner />
    </Suspense>
  )
}
