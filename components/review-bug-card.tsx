import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, Info } from 'lucide-react'

interface BugItem {
  severity: string;
  title: string;
  description: string;
  line_number?: number;
  how_to_fix: string;
}

export function ReviewBugCard({ item }: { item: BugItem, type?: 'bug' | 'security' | 'performance' }) {
  const isCritical = item.severity?.toLowerCase() === 'critical'
  const isHigh = item.severity?.toLowerCase() === 'high'
  const isMedium = item.severity?.toLowerCase() === 'medium'

  let badgeColor = 'bg-blue-500'
  let Icon = Info
  if (isCritical) {
    badgeColor = 'bg-red-600'
    Icon = AlertTriangle
  } else if (isHigh) {
    badgeColor = 'bg-red-500'
    Icon = AlertCircle
  } else if (isMedium) {
    badgeColor = 'bg-yellow-500'
  }

  return (
    <Card className="border-border/50 hover:bg-muted/10 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg flex items-center gap-2">
            <Icon className={`h-5 w-5 text-${isCritical || isHigh ? 'red-500' : 'yellow-500'}`} />
            {item.title}
          </CardTitle>
          <Badge className={`${badgeColor} text-white`}>
            {item.severity || 'Notice'}
          </Badge>
        </div>
        {item.line_number && (
          <CardDescription>Line {item.line_number}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">{item.description}</p>
        </div>
        <div className="bg-muted p-3 rounded-md border border-border">
          <p className="text-xs font-semibold text-primary mb-1">How to fix:</p>
          <p className="text-sm font-mono text-muted-foreground break-words">{item.how_to_fix}</p>
        </div>
      </CardContent>
    </Card>
  )
}
