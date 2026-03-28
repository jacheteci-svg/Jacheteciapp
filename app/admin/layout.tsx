import Sidebar from '@/components/admin/Sidebar'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  
  const { data, error } = await supabase.auth.getUser()
  const user = data?.user

  if (!user || error) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#0f172a] text-slate-100">
      <Sidebar />
      <main className="flex-1 p-4 md:p-8 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {children}
        </div>
      </main>
    </div>
  )
}
