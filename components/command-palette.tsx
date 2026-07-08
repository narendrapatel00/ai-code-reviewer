'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { 
  CommandDialog, 
  CommandInput, 
  CommandList, 
  CommandEmpty, 
  CommandGroup, 
  CommandItem,
  CommandSeparator
} from '@/components/ui/command'
import { 
  LayoutDashboard, 
  FileCode2, 
  History, 
  Library, 
  Settings, 
  Moon, 
  Sun, 
  LogOut, 
  GitCompare,
  Terminal,
  Search
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function CommandPalette() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const supabase = createClient()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const runCommand = (command: () => void) => {
    setOpen(false)
    command()
  }

  const handleSignOut = async () => {
    document.cookie = 'sb-demo-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;'
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  return (
    <>
      <div 
        className="relative w-full max-w-xs md:max-w-sm cursor-pointer select-none"
        onClick={() => setOpen(true)}
      >
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <div className="w-full bg-background border border-border/50 hover:border-border/80 h-9 pl-9 pr-3 rounded-full flex items-center justify-between text-xs text-muted-foreground transition-all shadow-sm">
          <span>Search dashboard...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border bg-muted/60 px-1.5 font-mono text-[9px] font-medium text-muted-foreground opacity-100">
            Ctrl K
          </kbd>
        </div>
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} title="Command Menu" description="Type a navigation route or setting action to run.">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList className="p-2">
          <CommandEmpty>No results found.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard'))} className="cursor-pointer flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              <span>Go to Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/new-review'))} className="cursor-pointer flex items-center gap-2">
              <FileCode2 className="h-4 w-4 text-primary" />
              <span>Start New Review</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/compare'))} className="cursor-pointer flex items-center gap-2">
              <GitCompare className="h-4 w-4 text-primary" />
              <span>Compare Code Versions</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/history'))} className="cursor-pointer flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <span>View Review History</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/prompts'))} className="cursor-pointer flex items-center gap-2">
              <Library className="h-4 w-4 text-primary" />
              <span>Open Prompt Library</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => router.push('/dashboard/settings'))} className="cursor-pointer flex items-center gap-2">
              <Settings className="h-4 w-4 text-primary" />
              <span>Edit Account Settings</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator className="my-2" />

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => runCommand(() => setTheme(theme === 'dark' ? 'light' : 'dark'))} className="cursor-pointer flex items-center gap-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4 text-blue-500" />}
              <span>Toggle Light/Dark Theme</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(handleSignOut)} className="cursor-pointer flex items-center gap-2 text-red-500 hover:text-red-500">
              <LogOut className="h-4 w-4 text-red-500" />
              <span>Sign Out of Account</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  )
}
