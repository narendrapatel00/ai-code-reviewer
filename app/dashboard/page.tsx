import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileCode2, Bug, Zap, ShieldAlert, ArrowRight, PlusCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LanguageChart, ScoreHistoryChart } from '@/components/dashboard-charts'
import { Badge } from '@/components/ui/badge'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Fetch reviews and findings
  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false })

  const { data: findings } = await supabase
    .from('review_findings')
    .select('category')

  const totalReviews = reviews?.length || 0
  
  // Calculate average score
  const avgScore = totalReviews > 0
    ? Math.round((reviews?.reduce((acc: number, r: any) => acc + (r.score || 0), 0) || 0) / totalReviews)
    : 0

  const totalBugs = findings?.filter((f: any) => f.category === 'bug').length || 0
  const totalSecurity = findings?.filter((f: any) => f.category === 'security').length || 0

  // Calculate languages distribution
  const langCounts: Record<string, number> = {}
  reviews?.forEach((r: any) => {
    const lang = r.language || 'unknown'
    langCounts[lang] = (langCounts[lang] || 0) + 1
  })
  
  const languageData = Object.entries(langCounts).map(([name, value]) => ({
    name,
    value
  }))

  // Get recent 5 reviews for list
  const recentReviews = reviews?.slice(0, 5) || []

  // Get last 7 reviews for score trend chart
  const scoreData = (reviews?.slice(0, 7) || [])
    .map((r: any, index: number) => ({
      name: r.language ? `${r.language.substring(0, 3)} #${index + 1}` : `#${index + 1}`,
      score: r.score || 0
    }))
    .reverse()

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back! Here&apos;s an overview of your code reviews.</p>
        </div>
        <Link href="/dashboard/new-review">
          <Button className="rounded-full shadow-lg shadow-primary/20">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Review
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <FileCode2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReviews}</div>
            <p className="text-xs text-muted-foreground">All time uploads</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Zap className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}/100</div>
            <p className="text-xs text-muted-foreground">Codebase quality rating</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bugs Found</CardTitle>
            <Bug className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBugs}</div>
            <p className="text-xs text-muted-foreground">Logical flaws identified</p>
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Issues</CardTitle>
            <ShieldAlert className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSecurity}</div>
            <p className="text-xs text-muted-foreground">Vulnerabilities detected</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 border-border/50 bg-card flex flex-col">
          <CardHeader>
            <CardTitle>Recent Reviews</CardTitle>
            <CardDescription>Your latest code submissions and analysis reports.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between">
            {recentReviews.length > 0 ? (
              <div className="space-y-4">
                {recentReviews.map((review: any) => (
                  <Link 
                    key={review.id} 
                    href={`/dashboard/history/${review.id}`}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-full bg-primary/10 text-primary">
                        <FileCode2 className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-semibold text-sm line-clamp-1">{review.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(review.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="capitalize text-xs">
                        {review.language}
                      </Badge>
                      <Badge className={review.score >= 80 ? 'bg-green-500 text-white' : review.score >= 50 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}>
                        {review.score}/100
                      </Badge>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground flex h-48 flex-col items-center justify-center border border-dashed rounded-xl p-4">
                No code reviews yet. Submit your first snippet to get started!
                <Link href="/dashboard/new-review" className="mt-3">
                  <Button size="sm">Create New Review</Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="col-span-3 grid gap-6">
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Languages Used</CardTitle>
              <CardDescription>Distribution of languages analyzed.</CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageChart data={languageData} />
            </CardContent>
          </Card>
          
          <Card className="border-border/50 bg-card">
            <CardHeader>
              <CardTitle>Score History</CardTitle>
              <CardDescription>Quality scores for recent code reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScoreHistoryChart data={scoreData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
