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

  let userProfile = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single()
    userProfile = profile
  }

  if (!user || error) {
    redirect('/login')
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground bg-mesh">
      <Sidebar userName={userProfile?.full_name || user?.email} />
      <main className="flex-1 p-4 md:p-10 lg:p-16 pt-24 lg:pt-16 overflow-y-auto relative z-10 w-full">
        <div className="max-w-7xl mx-auto space-y-12">
          {children}
        </div>
      </main>
    </div>
  )
}

