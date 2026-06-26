'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function continueInDemoMode() {
  const cookieStore = await cookies()
  
  // Set demo cookie for 7 days
  cookieStore.set('sb-demo-user', 'true', {
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  })
  
  redirect('/dashboard')
}

export async function signOutDemoMode() {
  const cookieStore = await cookies()
  cookieStore.delete('sb-demo-user')
  redirect('/login')
}
