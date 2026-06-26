import { createClient } from '@/lib/supabase/server'
import { SettingsForm } from '@/components/settings-form'
import { redirect } from 'next/navigation'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch profile details
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences.</p>
      </div>

      <SettingsForm 
        email={user.email || ''} 
        initialName={profile?.name || ''} 
        hasApiKey={!!profile?.openai_api_key} 
      />
    </div>
  )
}
