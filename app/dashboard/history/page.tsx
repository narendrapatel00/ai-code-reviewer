import { createClient } from '@/lib/supabase/server'
import { HistoryList } from '@/components/history-list'

export default async function HistoryPage() {
  const supabase = await createClient()
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto">
      <HistoryList initialReviews={reviews || []} />
    </div>
  )
}
