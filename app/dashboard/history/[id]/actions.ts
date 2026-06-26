'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleFavorite(reviewId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // Check if it already exists
  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('review_id', reviewId)
    .single()

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('id', existing.id)

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/dashboard/history/${reviewId}`)
    return { success: true, isFavorite: false }
  } else {
    // Add favorite
    const { error } = await supabase
      .from('favorites')
      .insert({
        user_id: user.id,
        review_id: reviewId
      })

    if (error) {
      return { error: error.message }
    }

    revalidatePath(`/dashboard/history/${reviewId}`)
    return { success: true, isFavorite: true }
  }
}
