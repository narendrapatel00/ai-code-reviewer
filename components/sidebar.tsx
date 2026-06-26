'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileCode2, History, Library, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

const routes = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'New Review', path: '/dashboard/new-review', icon: FileCode2 },
  { name: 'History', path: '/dashboard/history', icon: History },
  { name: 'Saved Prompts', path: '/dashboard/prompts', icon: Library },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    // Clear demo mode cookie if set
    document.cookie = 'sb-demo-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex flex-col h-full w-64 bg-background border-r border-border/50">
      <div className="p-6">
        <Link className="flex items-center" href="/dashboard">
          <FileCode2 className="h-6 w-6 text-primary" />
          <span className="ml-2 font-bold text-lg tracking-tight">AI Reviewer</span>
        </Link>
      </div>
      <div className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {routes.map((route) => {
          const isActive = pathname === route.path
          return (
            <Link
              key={route.path}
              href={route.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              }`}
            >
              <route.icon className="h-4 w-4" />
              {route.name}
            </Link>
          )
        })}
      </div>
      <div className="p-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
