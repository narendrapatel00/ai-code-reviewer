import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient } from './demo-db-client'

export function createClient() {
  const isDemo = !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project-id');

  if (isDemo) {
    return createMockSupabaseClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
