import { createBrowserClient } from '@supabase/ssr'
import { createMockSupabaseClient } from './demo-db-client'

export function createClient() {
  const hasDemoCookie = typeof window !== 'undefined' && document.cookie.includes('sb-demo-user=true');
  const isDemo = hasDemoCookie || !process.env.NEXT_PUBLIC_SUPABASE_URL || 
    process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project-id');

  if (isDemo) {
    return createMockSupabaseClient() as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
