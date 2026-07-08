'use client'

import { useState } from 'react'
import { Menu, FileCode2, LayoutDashboard, History, Library, Settings, LogOut, GitCompare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const routes = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'New Review', path: '/dashboard/new-review', icon: FileCode2 },
  { name: 'Compare Versions', path: '/dashboard/compare', icon: GitCompare },
  { name: 'History', path: '/dashboard/history', icon: History },
  { name: 'Saved Prompts', path: '/dashboard/prompts', icon: Library },
  { name: 'Settings', path: '/dashboard/settings', icon: Settings },
]

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    // Clear demo mode cookie if set
    document.cookie = 'sb-demo-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    
    await supabase.auth.signOut()
    setOpen(false)
    router.push('/login')
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="inline-flex items-center justify-center rounded-full hover:bg-muted/50 p-2 text-muted-foreground hover:text-foreground md:hidden cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle menu</span>
      </SheetTrigger>
      <SheetContent side="left" className="w-64 p-0 bg-background border-r border-border/50">
        <SheetHeader className="p-6 text-left border-b border-border/50">
          <SheetTitle className="flex items-center text-foreground">
            <FileCode2 className="h-6 w-6 text-primary mr-2" />
            <span className="font-bold text-lg tracking-tight">AI Reviewer</span>
          </SheetTitle>
        </SheetHeader>
        <div className="flex flex-col justify-between h-[calc(100vh-5rem)] py-4">
          <div className="px-4 space-y-2">
            {routes.map((route) => {
              const isActive = pathname === route.path
              return (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm ${
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
          <div className="px-4 border-t border-border/50 pt-4">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground text-sm"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
