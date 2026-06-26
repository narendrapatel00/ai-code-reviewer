import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface ReviewScoreCardProps {
  score: number;
}

export function ReviewScoreCard({ score }: ReviewScoreCardProps) {
  let ringColor = 'stroke-red-500'
  let barColor = 'bg-red-500'
  if (score >= 80) { ringColor = 'stroke-green-500'; barColor = 'bg-green-500' }
  else if (score >= 50) { ringColor = 'stroke-yellow-500'; barColor = 'bg-yellow-500' }

  const radius = 60
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <Card className="flex flex-col h-full border-border/50">
      <CardHeader>
        <CardTitle className="text-xl">Overall Score</CardTitle>
        <CardDescription>Based on security, performance, and best practices.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center flex-1 gap-6">
        <svg width="160" height="160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted/30" />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="10"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className={ringColor}
          />
          <text x="80" y="85" textAnchor="middle" className="rotate-90 fill-foreground" style={{ fontSize: '1.75rem', fontWeight: 700 }}>
          </text>
        </svg>
        <div className="flex flex-col items-center -mt-6">
          <span className="text-5xl font-extrabold">{score}</span>
          <span className="text-sm text-muted-foreground mt-1">out of 100</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${barColor}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </CardContent>
    </Card>
  )
}
