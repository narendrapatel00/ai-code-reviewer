'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Library, Trash2, Edit } from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createPrompt, updatePrompt, deletePrompt } from '@/app/dashboard/prompts/actions'
import { toast } from 'sonner'

interface PromptItem {
  id: string
  title: string
  content: string
  created_at?: string
}

export function PromptsList({ initialPrompts }: { initialPrompts: PromptItem[] }) {
  const [prompts, setPrompts] = useState<PromptItem[]>(initialPrompts)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<PromptItem | null>(null)
  
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return

    setIsLoading(true)
    const res = await createPrompt(title, content)
    setIsLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Prompt created successfully')
      // Simulate state update
      setPrompts([{ id: Math.random().toString(), title, content }, ...prompts])
      setIsAddOpen(false)
      setTitle('')
      setContent('')
    }
  }

  const handleEditInit = (prompt: PromptItem) => {
    setEditingPrompt(prompt)
    setTitle(prompt.title)
    setContent(prompt.content)
    setIsEditOpen(true)
  }

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingPrompt || !title.trim() || !content.trim()) return

    setIsLoading(true)
    const res = await updatePrompt(editingPrompt.id, title, content)
    setIsLoading(false)

    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Prompt updated successfully')
      setPrompts(prompts.map(p => p.id === editingPrompt.id ? { ...p, title, content } : p))
      setIsEditOpen(false)
      setEditingPrompt(null)
      setTitle('')
      setContent('')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    const res = await deletePrompt(id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Prompt deleted successfully')
      setPrompts(prompts.filter(p => p.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prompt Library</h2>
          <p className="text-muted-foreground">Manage your custom AI reviewer personas and instructions.</p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger className="inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/90 px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2 cursor-pointer">
            <Plus className="h-4 w-4" />
            New Persona
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAdd}>
              <DialogHeader>
                <DialogTitle>New Review Persona</DialogTitle>
                <DialogDescription>Create a custom code review prompt instructions template.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Persona Name</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g. Review like Netflix Engineer" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="content">Instructions</Label>
                  <Textarea 
                    id="content" 
                    placeholder="Provide specific guidelines for the AI, e.g. 'Act as a Senior Architect...'" 
                    className="h-32"
                    value={content} 
                    onChange={e => setContent(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Creating...' : 'Create Persona'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <Card key={prompt.id} className="border-border/50 bg-card hover:bg-muted/10 transition-all duration-200 flex flex-col justify-between">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 font-semibold">
                <Library className="h-5 w-5 text-primary" />
                {prompt.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground line-clamp-4 min-h-[5rem] leading-relaxed">
                {prompt.content}
              </p>
              <div className="flex gap-2 pt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full rounded-full"
                  onClick={() => handleEditInit(prompt)}
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full rounded-full hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  onClick={() => handleDelete(prompt.id)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {prompts.length === 0 && (
          <div className="col-span-full py-16 text-center border rounded-xl border-dashed bg-muted/10 flex flex-col items-center justify-center gap-2">
            <Library className="h-10 w-10 text-muted-foreground animate-bounce" />
            <p className="font-semibold text-lg">No custom prompts yet</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              Add your first custom review persona to customize the AI analysis guidelines.
            </p>
          </div>
        )}
      </div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <form onSubmit={handleEdit}>
            <DialogHeader>
              <DialogTitle>Edit Review Persona</DialogTitle>
              <DialogDescription>Modify instructions for this code review persona.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Persona Name</Label>
                <Input 
                  id="edit-title" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)} 
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-content">Instructions</Label>
                <Textarea 
                  id="edit-content" 
                  value={content} 
                  className="h-32"
                  onChange={e => setContent(e.target.value)} 
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
