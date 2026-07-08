import { createClient } from '@/lib/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReviewScoreCard } from '@/components/review-score-card'
import { ReviewBugCard } from '@/components/review-bug-card'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { CodeDiffViewer } from '@/components/code-diff-viewer'
import { ExportButtons } from '@/components/export-buttons'
import { FavoriteButton } from '@/components/favorite-button'
import { AIChatPanel } from '@/components/ai-chat-panel'
import { ComplexityAnalyzer } from '@/components/complexity-analyzer'
import { ArrowLeft, FileCode, CheckCircle, Info } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default async function ReviewResultPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const supabase = await createClient()
  const { data: review } = await supabase.from('reviews').select('*').eq('id', id).single()

  if (!review) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
        <FileCode className="h-16 w-16 text-muted-foreground animate-pulse" />
        <h3 className="text-xl font-semibold">Review Not Found</h3>
        <p className="text-muted-foreground max-w-sm">
          We couldn&apos;t find a code review with ID &quot;{id}&quot;. It might have been deleted.
        </p>
        <Link href="/dashboard/history">
          <Button>Back to History</Button>
        </Link>
      </div>
    )
  }

  // Fetch actual findings from the database
  const { data: findings } = await supabase
    .from('review_findings')
    .select('*')
    .eq('review_id', review.id)

  const allFindings = findings || []
  const bugs = allFindings.filter((f: any) => f.category === 'bug')
  const security = allFindings.filter((f: any) => f.category === 'security')
  const performance = allFindings.filter((f: any) => f.category === 'performance')
  
  // Combine style, refactoring, and documentation for a unified Quality tab
  const quality = allFindings.filter((f: any) => ['style', 'refactoring', 'documentation'].includes(f.category))

  // Fetch favorite status
  const { data: favorite } = await supabase
    .from('favorites')
    .select('id')
    .eq('review_id', review.id)
    .single()

  const isFavorite = !!favorite

  const score = review.score ?? 0
  const summary = review.summary || 'No summary provided.'
  const originalCode = review.original_code || ''
  const improvedCode = review.improved_code || originalCode
  const language = review.language || 'typescript'

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/history">
            <Button variant="outline" size="icon" className="rounded-full">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Review Details</h2>
            <p className="text-muted-foreground">
              {review.title || 'Code Review'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FavoriteButton reviewId={review.id} initialIsFavorite={isFavorite} />
          <ExportButtons review={review} findings={allFindings} />
          <AIChatPanel code={improvedCode} language={language} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <ReviewScoreCard score={score} />
        </div>
        <div className="md:col-span-2">
          <Card className="h-full border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
              <CardDescription>Key findings and feedback from the AI review engine.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">{summary}</p>
              {review.overall_feedback && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <h4 className="font-semibold text-sm mb-1 text-primary">Recommendation:</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{review.overall_feedback}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs defaultValue="compare" className="w-full mt-8">
        <TabsList className="grid w-full grid-cols-6 bg-muted/50 p-1">
          <TabsTrigger value="compare">Compare Code</TabsTrigger>
          <TabsTrigger value="bugs">Bugs ({bugs.length})</TabsTrigger>
          <TabsTrigger value="security">Security ({security.length})</TabsTrigger>
          <TabsTrigger value="performance">Performance ({performance.length})</TabsTrigger>
          <TabsTrigger value="quality">Quality ({quality.length})</TabsTrigger>
          <TabsTrigger value="complexity">Complexity</TabsTrigger>
        </TabsList>

        <TabsContent value="compare" className="mt-6">
          <CodeDiffViewer original={originalCode} modified={improvedCode} language={language} />
        </TabsContent>

        <TabsContent value="complexity" className="mt-6">
          <ComplexityAnalyzer code={originalCode} language={language} />
        </TabsContent>

        <TabsContent value="bugs" className="mt-6 space-y-4">
          {bugs.map((bug: any, i: number) => (
            <ReviewBugCard key={i} item={bug} type="bug" />
          ))}
          {bugs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border rounded-xl border-dashed bg-muted/10">
              <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-muted-foreground font-medium">No logical bugs detected!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          {security.map((sec: any, i: number) => (
            <ReviewBugCard key={i} item={sec} type="security" />
          ))}
          {security.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border rounded-xl border-dashed bg-muted/10">
              <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-muted-foreground font-medium">No security issues detected!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="mt-6 space-y-4">
          {performance.map((perf: any, i: number) => (
            <ReviewBugCard key={i} item={{ ...perf, severity: 'Medium' }} type="performance" />
          ))}
          {performance.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border rounded-xl border-dashed bg-muted/10">
              <CheckCircle className="h-10 w-10 text-green-500 mb-2" />
              <p className="text-muted-foreground font-medium">No performance bottlenecks detected!</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="quality" className="mt-6 space-y-4">
          {quality.map((suggestion: any, i: number) => (
            <ReviewBugCard 
              key={i} 
              item={{
                severity: suggestion.severity || 'Low',
                title: suggestion.title,
                description: suggestion.description,
                how_to_fix: suggestion.how_to_fix || 'Follow standard naming and documentation practices.',
                line_number: suggestion.line_number
              }} 
              type="bug" 
            />
          ))}
          {quality.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 border rounded-xl border-dashed bg-muted/10">
              <Info className="h-10 w-10 text-blue-500 mb-2" />
              <p className="text-muted-foreground font-medium">No formatting or documentation improvements suggested.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
