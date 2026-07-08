'use client'

import { useState, useRef } from 'react'
import Editor, { DiffEditor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { 
  GitCompare, 
  Sparkles, 
  Play, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Code,
  AlertCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

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

interface CompareResult {
  summary: string;
  improvements: string[];
  regressions: string[];
  bugs: string[];
  whatChanged: string[];
}

export default function ComparePage() {
  const { theme } = useTheme()
  const [language, setLanguage] = useState('typescript')
  const [oldCode, setOldCode] = useState<string>('// Version A (Old Code)\nfunction sum(a, b) {\n  return a + b;\n}')
  const [newCode, setNewCode] = useState<string>('// Version B (New Code)\nfunction sum(a: number, b: number): number {\n  return a + b;\n}')
  const [isComparing, setIsComparing] = useState(false)
  const [result, setResult] = useState<CompareResult | null>(null)
  const [activeTab, setActiveTab] = useState<'editor' | 'diff'>('editor')

  const handleCompare = async () => {
    if (!oldCode.trim() || !newCode.trim()) {
      toast.error('Please enter both old and new code versions.')
      return
    }

    setIsComparing(true)
    const toastId = toast.loading('AI is comparing code versions...')

    try {
      const response = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldCode, newCode, language })
      })

      if (!response.ok) {
        throw new Error('Comparison failed')
      }

      const data = await response.json()
      setResult(data)
      setActiveTab('diff')
      toast.dismiss(toastId)
      toast.success('AI Comparison complete!')
    } catch (e) {
      toast.dismiss(toastId)
      toast.error('Failed to compare code versions. Please try again.')
      console.error(e)
    } finally {
      setIsComparing(false)
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <GitCompare className="h-8 w-8 text-primary" />
            Compare Versions
          </h2>
          <p className="text-muted-foreground">
            Compare two versions of your code and let the AI find improvements, regressions, and bugs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Select value={language} onValueChange={(v) => setLanguage(v || 'typescript')}>
            <SelectTrigger className="w-[160px] bg-background">
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

          <Button onClick={handleCompare} disabled={isComparing} className="rounded-full shadow-lg shadow-primary/20">
            {isComparing ? (
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            {isComparing ? 'Comparing...' : 'Compare with AI'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as any)} className="w-full">
        <TabsList className="bg-muted/50 p-1 mb-4">
          <TabsTrigger value="editor">Edit Source Versions</TabsTrigger>
          <TabsTrigger value="diff" disabled={!result}>
            Side-by-Side Diff & Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Version A (Old) */}
            <Card className="border-border/50 bg-card overflow-hidden h-[500px] flex flex-col">
              <CardHeader className="py-3 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Version A (Old Code)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative">
                <Editor
                  height="100%"
                  language={language}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={oldCode}
                  onChange={(val) => setOldCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                  }}
                />
              </CardContent>
            </Card>

            {/* Version B (New) */}
            <Card className="border-border/50 bg-card overflow-hidden h-[500px] flex flex-col">
              <CardHeader className="py-3 border-b border-border/50 bg-muted/10">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  Version B (New Code)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 flex-1 relative">
                <Editor
                  height="100%"
                  language={language}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={newCode}
                  onChange={(val) => setNewCode(val || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 13,
                    lineNumbers: 'on',
                    scrollBeyondLastLine: false,
                    padding: { top: 12 },
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="diff" className="space-y-6">
          {result && (
            <>
              {/* Monaco Diff Viewer */}
              <Card className="border-border/50 overflow-hidden flex flex-col h-[450px]">
                <CardHeader className="py-3 bg-muted/20 border-b border-border/50">
                  <CardTitle className="text-sm font-semibold">Code Version Comparison (Original vs New)</CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex-1 relative">
                  <DiffEditor
                    height="100%"
                    language={language}
                    theme={theme === 'dark' ? 'vs-dark' : 'light'}
                    original={oldCode}
                    modified={newCode}
                    options={{
                      renderSideBySide: true,
                      minimap: { enabled: false },
                      fontSize: 13,
                      lineNumbers: 'on',
                      readOnly: true,
                      scrollBeyondLastLine: false,
                    }}
                  />
                </CardContent>
              </Card>

              {/* AI Report Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Side: Summary & What Changed */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg">AI Change Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{result.summary}</p>
                    </CardContent>
                  </Card>

                  <Card className="border-border/50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Code className="h-5 w-5 text-blue-500" />
                        What Changed
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.whatChanged.map((change, i) => (
                        <div key={i} className="flex items-start gap-2.5 text-sm py-1 border-b border-border/20 last:border-0">
                          <ArrowRight className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground">{change}</span>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Right Side: Improvements, Regressions, Bugs */}
                <div className="space-y-6">
                  {/* Improvements */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Improvements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.improvements.map((imp, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-green-500 mt-0.5">•</span>
                          <span>{imp}</span>
                        </div>
                      ))}
                      {result.improvements.length === 0 && (
                        <p className="text-xs text-muted-foreground italic">No specific improvements identified.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Regressions */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        Regressions
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.regressions.map((reg, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-amber-500 mt-0.5">•</span>
                          <span>{reg}</span>
                        </div>
                      ))}
                      {result.regressions.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-green-600 dark:text-green-400">No regressions detected.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Potential Bugs */}
                  <Card className="border-border/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        Potential Bugs Introduced
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {result.bugs.map((bug, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <span className="font-semibold text-red-500 mt-0.5">•</span>
                          <span>{bug}</span>
                        </div>
                      ))}
                      {result.bugs.length === 0 && (
                        <p className="text-xs text-muted-foreground italic text-green-600 dark:text-green-400">No new bugs introduced.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
