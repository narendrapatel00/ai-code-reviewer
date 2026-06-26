'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { FileCode2, Calendar, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface ReviewItem {
  id: string
  title: string
  language: string
  score: number
  created_at: string
}

export function HistoryList({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [search, setSearch] = useState('')

  const filteredReviews = initialReviews.filter(review => {
    const term = search.toLowerCase()
    return (
      review.title.toLowerCase().includes(term) ||
      review.language.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Review History</h2>
          <p className="text-muted-foreground">Access your past code reviews and analysis reports.</p>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews or languages..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-background shadow-none appearance-none pl-8 rounded-full border-border/50 focus-visible:ring-primary/20"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReviews.map((review) => (
          <Link href={`/dashboard/history/${review.id}`} key={review.id}>
            <Card className="hover:bg-muted/30 transition-colors border-border/50 cursor-pointer bg-card">
              <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <FileCode2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{review.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <Badge variant="outline" className="capitalize text-xs">
                    {review.language}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden sm:inline">Score:</span>
                    <Badge className={review.score >= 80 ? 'bg-green-500 text-white' : review.score >= 50 ? 'bg-yellow-500 text-black' : 'bg-red-500 text-white'}>
                      {review.score}/100
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm" className="hidden sm:flex rounded-full">
                    View Details
                    <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}

        {filteredReviews.length === 0 && (
          <div className="text-center py-16 border rounded-xl border-dashed bg-muted/10 flex flex-col items-center justify-center gap-2">
            <FileCode2 className="h-10 w-10 text-muted-foreground animate-pulse" />
            <p className="font-semibold text-lg">No reviews found</p>
            <p className="text-muted-foreground text-sm max-w-xs">
              Try adjusting your search terms or submit a new file for analysis.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
