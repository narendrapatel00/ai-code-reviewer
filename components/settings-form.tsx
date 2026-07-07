'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateProfile } from '@/app/dashboard/settings/actions'
import { toast } from 'sonner'

interface SettingsFormProps {
  email: string
  initialName: string
  hasApiKey: boolean
}

export function SettingsForm({ email, initialName, hasApiKey }: SettingsFormProps) {
  const [name, setName] = useState(initialName)
  const [apiKey, setApiKey] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await updateProfile(name)
    setIsLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Profile details updated')
    }
  }

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    const res = await updateProfile(name, apiKey)
    setIsLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('API key saved successfully')
      setApiKey('')
    }
  }

  return (
    <div className="grid gap-6">
      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>Profile Details</CardTitle>
          <CardDescription>Update your personal information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled className="opacity-60 bg-muted" />
            </div>
            <Button type="submit" disabled={isLoading}>Save Details</Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card">
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Bring your own API key to bypass rate limits or use custom models.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveApiKey} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="openai_key">Groq API Key</Label>
              <Input 
                id="openai_key" 
                type="password" 
                placeholder={hasApiKey ? '••••••••••••••••••••' : 'gsk-...'} 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                required 
              />
            </div>
            <Button type="submit" variant="secondary" disabled={isLoading}>
              {hasApiKey ? 'Overwrite API Key' : 'Save API Key'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
