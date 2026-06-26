import { createClient } from '@/lib/supabase/server'
import { PromptsList } from '@/components/prompts-list'

export default async function PromptsPage() {
  const supabase = await createClient()
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-7xl mx-auto">
      <PromptsList initialPrompts={prompts || []} />
    </div>
  )
}
