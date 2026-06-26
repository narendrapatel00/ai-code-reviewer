'use client'

import { useState, useRef, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { UploadCloud, Play, Code2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const SUPPORTED_LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'sql', label: 'SQL' },
  { value: 'bash', label: 'Bash' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'swift', label: 'Swift' },
]

export function CodeEditor() {
  const { theme } = useTheme()
  const [code, setCode] = useState<string>('// Paste your code here\n')
  const [language, setLanguage] = useState<string>('typescript')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [prompts, setPrompts] = useState<any[]>([])
  const [selectedPromptId, setSelectedPromptId] = useState<string>('default')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function loadPrompts() {
      try {
        const supabase = createClient()
        const { data } = await supabase.from('prompts').select('*')
        if (data) {
          setPrompts(data)
        }
      } catch (e) {
        console.error('Error loading library prompts:', e)
      }
    }
    loadPrompts()
  }, [])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result
      if (typeof result === 'string') {
        setCode(result)
        // Simple auto-detect extension
        const ext = file.name.split('.').pop()
        if (ext) {
          const matchedLang = SUPPORTED_LANGUAGES.find(l => l.value === ext || (ext === 'py' && l.value === 'python') || (ext === 'js' && l.value === 'javascript') || (ext === 'ts' && l.value === 'typescript') || (ext === 'rs' && l.value === 'rust') || (ext === 'sh' && l.value === 'bash') || (ext === 'kt' && l.value === 'kotlin'));
          if (matchedLang) setLanguage(matchedLang.value);
        }
        toast.success(`Loaded ${file.name}`)
      }
    }
    reader.readAsText(file)
  }

  const handleAnalyze = async () => {
    if (!code.trim() || code === '// Paste your code here\n') {
      toast.error('Please enter some code to review')
      return
    }

    setIsAnalyzing(true)
    const toastId = toast.loading('Analyzing your code using AI...')
    
    try {
      const activePrompt = prompts.find(p => p.id === selectedPromptId)
      const promptContent = activePrompt ? activePrompt.content : undefined

      const response = await fetch('/api/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, language, promptContent }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze code')
      }

      const data = await response.json()
      
      toast.dismiss(toastId)
      toast.success('Analysis complete!')
      
      if (data.reviewId) {
        router.push(`/dashboard/history/${data.reviewId}`)
      } else {
        toast.error('Review completed but not saved. Redirecting to home.')
        router.push('/dashboard')
      }
    } catch (error) {
      toast.dismiss(toastId)
      toast.error('Analysis failed. Please try again later.')
      console.error(error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <Card className="h-[calc(100vh-10rem)] flex flex-col overflow-hidden border-border/50 bg-card">
      <CardHeader className="py-4 border-b border-border/50 bg-muted/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <CardTitle className="text-lg flex items-center gap-2 font-semibold">
            <Code2 className="h-5 w-5 text-primary" />
            Code Editor
          </CardTitle>
          <CardDescription>Paste code or upload a file for review.</CardDescription>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Select value={selectedPromptId} onValueChange={(val) => setSelectedPromptId(val || 'default')}>
            <SelectTrigger className="w-[180px] bg-background">
              <Sparkles className="h-3.5 w-3.5 text-primary mr-1" />
              <SelectValue placeholder="Standard Review" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Standard Review</SelectItem>
              {prompts.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={(v) => setLanguage(v || 'typescript')}>
            <SelectTrigger className="w-[150px] bg-background">
              <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileUpload}
            accept=".js,.ts,.jsx,.tsx,.py,.java,.c,.cpp,.go,.rs,.php,.html,.css,.sql,.sh,.kt,.swift,.txt"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="bg-background">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload File
          </Button>

          <Button onClick={handleAnalyze} disabled={isAnalyzing} className="rounded-full shadow-lg shadow-primary/20">
            {isAnalyzing ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isAnalyzing ? 'Analyzing...' : 'Analyze Code'}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 relative">
        <Editor
          height="100%"
          language={language}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          value={code}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'var(--font-geist-mono)',
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            roundedSelection: false,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </CardContent>
    </Card>
  )
}
