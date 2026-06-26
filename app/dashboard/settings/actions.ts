'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(name: string, openaiApiKey?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const updateFields: any = { name }
  if (openaiApiKey !== undefined) {
    updateFields.openai_api_key = openaiApiKey
  }

  // Use upsert to handle cases where the user profile row doesn't exist yet
  const { error } = await supabase
    .from('users')
    .upsert({
      id: user.id,
      email: user.email!,
      ...updateFields
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/settings')
  return { success: true }
}
