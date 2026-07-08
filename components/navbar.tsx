import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/mobile-nav'
import { CommandPalette } from '@/components/command-palette'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { createClient } from '@/lib/supabase/server'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  const email = user?.email || 'User'
  const initial = email.charAt(0).toUpperCase()

  return (
    <header className="flex h-16 items-center gap-4 border-b border-border/50 bg-background/50 px-6 backdrop-blur-md">
      <MobileNav />
      <div className="flex flex-1 items-center gap-4">
        <CommandPalette />
      </div>
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="rounded-full">
          <Bell className="h-4 w-4" />
          <span className="sr-only">Toggle notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full overflow-hidden outline-none">
            <Avatar className="h-8 w-8 hover:opacity-80 transition-opacity cursor-pointer">
              <AvatarFallback>{initial}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Toggle user menu</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
