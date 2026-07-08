'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetTrigger
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Sparkles, 
  Terminal, 
  FileText, 
  Globe, 
  HelpCircle 
} from 'lucide-react'
import { toast } from 'sonner'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatPanelProps {
  code: string
  language: string
}

export function AIChatPanel({ code, language }: AIChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom of chat when messages change
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages])

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/review/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          language,
          message: text,
          history: messages
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const data = await response.json()
      if (data.error) {
        throw new Error(data.error)
      }

      const assistantMessage: Message = { role: 'assistant', content: data.response }
      setMessages(prev => [...prev, assistantMessage])
    } catch (e: any) {
      toast.error(e.message || 'Failed to chat with AI.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleQuickAction = (action: string) => {
    handleSendMessage(action)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="rounded-full shadow-lg shadow-primary/20 flex items-center gap-2 inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2 text-sm cursor-pointer select-none">
        <MessageSquare className="h-4 w-4" />
        Chat with AI
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg p-0 bg-background border-l border-border/50 flex flex-col h-full">
        <SheetHeader className="p-6 border-b border-border/50">
          <SheetTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Code Assistant
          </SheetTitle>
          <SheetDescription>
            Ask questions, generate unit tests, document, or refactor your reviewed code.
          </SheetDescription>
        </SheetHeader>

        {/* Messages */}
        <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 space-y-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-semibold text-sm">Welcome to Code Chat!</h4>
                  <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                    The assistant has access to the code under review. Ask any question or try one of the quick actions below.
                  </p>
                </div>
              </div>
            )}

            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground ml-auto rounded-tr-none'
                    : 'bg-muted/50 text-foreground mr-auto rounded-tl-none border border-border/30'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-sans prose dark:prose-invert max-w-none text-xs">
                  {msg.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 bg-muted/30 text-muted-foreground mr-auto rounded-2xl rounded-tl-none px-4 py-2.5 border border-border/20 text-xs">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                AI is thinking...
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Actions Panel */}
        <div className="px-6 py-3 bg-muted/20 border-t border-border/30 space-y-2">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">Quick Actions</span>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full bg-background"
              onClick={() => handleQuickAction('Explain this code and how it works')}
            >
              <HelpCircle className="h-3 w-3 mr-1 text-blue-500" />
              Explain Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full bg-background"
              onClick={() => handleQuickAction('Generate comprehensive unit tests for this code')}
            >
              <Terminal className="h-3 w-3 mr-1 text-green-500" />
              Generate Unit Tests
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full bg-background"
              onClick={() => handleQuickAction('Add clear documentation and comments to the code')}
            >
              <FileText className="h-3 w-3 mr-1 text-purple-500" />
              Document Code
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-7 rounded-full bg-background"
              onClick={() => handleQuickAction('Convert this code to Python')}
            >
              <Globe className="h-3 w-3 mr-1 text-amber-500" />
              Convert to Python
            </Button>
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/50 bg-background flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this code..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(input)}
            disabled={isLoading}
            className="flex-1 bg-muted/35 border-border/50 focus-visible:ring-1"
          />
          <Button
            size="icon"
            onClick={() => handleSendMessage(input)}
            disabled={isLoading || !input.trim()}
            className="rounded-full shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
