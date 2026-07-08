'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { 
  Network, 
  Cpu, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle,
  GitCommit,
  Workflow
} from 'lucide-react'

interface ComplexityAnalyzerProps {
  code: string
  language: string
}

export function ComplexityAnalyzer({ code, language }: ComplexityAnalyzerProps) {
  // 1. Calculate Cyclomatic Complexity (standard control flow nodes count + 1)
  const complexityMetrics = useMemo(() => {
    if (!code) return { cyclomatic: 1, cognitive: 0, index: 100, level: 'Low' }

    const controlFlowKeywords = /\b(if|for|while|forEach|map|filter|reduce|case|catch|&&|\|\||\?)\b/g
    const matches = code.match(controlFlowKeywords) || []
    const cyclomatic = matches.length + 1

    // Cognitive complexity estimation (nesting approximations)
    const indentLevels = code.split('\n').map(line => {
      const match = line.match(/^([ \t]+)/)
      return match ? match[1].length : 0
    })
    
    let cognitive = 0
    let lastIndent = 0
    indentLevels.forEach(indent => {
      if (indent > lastIndent) {
        cognitive += 1
      }
      lastIndent = indent
    })

    // Maintainability Index approximation
    // Standard formula approximation: 171 - 5.2 * ln(Halstead Volume) - 0.23 * Cyclomatic Complexity - 16.2 * ln(LOC)
    const linesOfCode = code.split('\n').filter(l => l.trim().length > 0).length || 1
    const rawIndex = Math.max(0, 100 - (cyclomatic * 2.5) - (linesOfCode * 0.15))
    const index = Math.round(rawIndex)

    let level: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low'
    if (cyclomatic > 15) level = 'Very High'
    else if (cyclomatic > 8) level = 'High'
    else if (cyclomatic > 4) level = 'Moderate'

    return { cyclomatic, cognitive, index, level }
  }, [code])

  // 2. Parse Import Dependencies (Regex matching imports/requires)
  const dependencies = useMemo(() => {
    if (!code) return []
    const lines = code.split('\n')
    
    // Support JS/TS ES6 imports, CommonJS require, Python imports, Go imports
    const depList: string[] = []
    
    lines.forEach(line => {
      const trimmed = line.trim()
      
      // JavaScript / TypeScript imports
      if (trimmed.startsWith('import ')) {
        const match = trimmed.match(/from\s+['"]([^'"]+)['"]/) || trimmed.match(/import\s+['"]([^'"]+)['"]/)
        if (match?.[1]) depList.push(match[1])
      }
      // CommonJS requires
      else if (trimmed.includes('require(')) {
        const match = trimmed.match(/require\(\s*['"]([^'"]+)['"]\s*\)/)
        if (match?.[1]) depList.push(match[1])
      }
      // Python imports
      else if (trimmed.startsWith('import ') || trimmed.startsWith('from ')) {
        const parts = trimmed.split(/\s+/)
        if (parts[1]) depList.push(parts[1].split('.')[0])
      }
    })

    // De-duplicate
    return Array.from(new Set(depList)).map(name => ({
      name,
      type: name.startsWith('.') || name.startsWith('@/') ? 'local' : 'package'
    }))
  }, [code])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cyclomatic Complexity Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Cyclomatic Complexity</CardDescription>
            <CardTitle className="text-3xl font-extrabold flex items-baseline gap-2">
              {complexityMetrics.cyclomatic}
              <span className="text-xs font-normal text-muted-foreground">points</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Rating: {complexityMetrics.level}</span>
                <span className="font-semibold text-primary">
                  {complexityMetrics.cyclomatic <= 4 ? 'Excellent' : complexityMetrics.cyclomatic <= 8 ? 'Good' : 'Needs Refactor'}
                </span>
              </div>
              <Progress 
                value={Math.min(100, (complexityMetrics.cyclomatic / 20) * 100)} 
                className={`h-2 ${
                  complexityMetrics.cyclomatic > 10 ? '[&>div]:bg-red-500' : complexityMetrics.cyclomatic > 5 ? '[&>div]:bg-amber-500' : '[&>div]:bg-green-500'
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {complexityMetrics.cyclomatic <= 4 
                ? 'Code structure is simple, easy to test, and highly maintainable.' 
                : complexityMetrics.cyclomatic <= 8 
                ? 'Moderate complexity. Consider extracting nested conditionals to keep code clean.' 
                : 'High complexity. The logic has too many decision paths. Refactoring is strongly recommended.'}
            </p>
          </CardContent>
        </Card>

        {/* Cognitive Complexity Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Cognitive Complexity</CardDescription>
            <CardTitle className="text-3xl font-extrabold flex items-baseline gap-2">
              {complexityMetrics.cognitive}
              <span className="text-xs font-normal text-muted-foreground">score</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-xs py-1">
              <Cpu className="h-4 w-4 text-primary shrink-0" />
              <span className="text-muted-foreground">
                Estimates how difficult it is for a developer to read and mentally trace the logic.
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Lower cognitive score prevents bugs because developers can easily hold the context in their head during code edits.
            </p>
          </CardContent>
        </Card>

        {/* Maintainability Index Card */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardDescription className="text-xs uppercase tracking-wider font-semibold">Maintainability Index</CardDescription>
            <CardTitle className="text-3xl font-extrabold flex items-baseline gap-2">
              {complexityMetrics.index}
              <span className="text-xs font-normal text-muted-foreground">/ 100</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Codebase Health</span>
                <span className="font-semibold text-primary">{complexityMetrics.index > 80 ? 'Healthy' : complexityMetrics.index > 50 ? 'Fair' : 'Critical'}</span>
              </div>
              <Progress value={complexityMetrics.index} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Combines lines of code, volume, and complexity metrics. Higher values denote easier refactoring, testing, and debugging.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Visual Dependency Graph / Network */}
      <Card className="border-border/50 bg-card overflow-hidden">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Network className="h-5 w-5 text-primary" />
            Dependency Visualization
          </CardTitle>
          <CardDescription>
            Graph of imports and dependencies detected in the reviewed code.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 bg-muted/15 flex flex-col items-center justify-center min-h-[300px]">
          {dependencies.length === 0 ? (
            <div className="text-center space-y-2 py-8">
              <Workflow className="h-12 w-12 text-muted-foreground/40 mx-auto animate-pulse" />
              <p className="text-sm font-semibold text-muted-foreground">No imports or dependencies detected</p>
              <p className="text-xs text-muted-foreground/80 max-w-sm">
                The file does not appear to import any external modules or local files, or the language parser is not fully matching.
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col md:flex-row items-center justify-center gap-10 py-6">
              {/* Root Node */}
              <div className="relative flex flex-col items-center p-4 bg-background border border-primary/40 rounded-xl shadow-lg z-10 w-44 hover:border-primary transition-all duration-300">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mb-1 text-primary">
                  <Workflow className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold truncate max-w-full">Reviewed Code</span>
                <span className="text-[10px] text-muted-foreground uppercase">{language}</span>
              </div>

              {/* Linking SVG lines */}
              <div className="hidden md:block absolute w-[250px] h-[2px] bg-gradient-to-r from-primary/30 to-muted/20 -z-0 pointer-events-none" />

              {/* Dependency Nodes */}
              <div className="flex flex-col gap-3">
                {dependencies.map((dep, i) => (
                  <div 
                    key={i} 
                    className={`flex items-center gap-3 p-2.5 bg-background border rounded-lg shadow-sm w-48 hover:translate-x-1.5 transition-all duration-300 ${
                      dep.type === 'local' ? 'border-purple-500/30' : 'border-blue-500/30'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs shrink-0 ${
                      dep.type === 'local' ? 'bg-purple-500/10 text-purple-500' : 'bg-blue-500/10 text-blue-500'
                    }`}>
                      {dep.type === 'local' ? <GitCommit className="h-3 w-3" /> : <Network className="h-3 w-3" />}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-medium truncate block">{dep.name}</span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground">
                        {dep.type === 'local' ? 'local file' : 'package dependency'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
