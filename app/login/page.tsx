'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { login, signup } from './actions'
import { continueInDemoMode } from './demo-login-action'
import { toast } from 'sonner'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoLoading, setIsDemoLoading] = useState(false)
  const [isLogin, setIsLogin] = useState(true)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(event.currentTarget)
    
    try {
      if (isLogin) {
        const result = await login(formData)
        if (result?.error) toast.error(result.error)
      } else {
        const result = await signup(formData)
        if (result?.error) toast.error(result.error)
        else toast.success('Check your email for the confirmation link.')
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleDemoMode() {
    setIsDemoLoading(true)
    try {
      await continueInDemoMode()
    } catch {
      toast.error('Failed to enter Demo Mode')
      setIsDemoLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background/50 relative overflow-hidden">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-secondary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-accent/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>

      <Card className="w-full max-w-md backdrop-blur-xl bg-background/60 border-white/10 shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Enter your email to sign in to your account'
              : 'Enter your email below to create your account'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form onSubmit={onSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isLoading || isDemoLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isLoading || isDemoLoading}
              />
            </div>
            <Button className="w-full" type="submit" disabled={isLoading || isDemoLoading}>
              {isLoading && (
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              )}
              {isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="relative my-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-dashed" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Developer Sandbox
              </span>
            </div>
          </div>

          <Button 
            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium shadow-md shadow-indigo-500/10" 
            variant="default"
            type="button"
            onClick={handleDemoMode}
            disabled={isLoading || isDemoLoading}
          >
            {isDemoLoading && (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            Continue in Demo Mode (No Setup Required)
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="text-sm text-muted-foreground hover:text-primary"
            onClick={() => setIsLogin(!isLogin)}
            disabled={isLoading || isDemoLoading}
          >
            {isLogin
              ? "Don't have an account? Sign Up"
              : 'Already have an account? Sign In'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
