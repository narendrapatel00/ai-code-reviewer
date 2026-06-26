import { CodeEditor } from '@/components/code-editor'

export default function NewReviewPage() {
  return (
    <div className="space-y-6 h-full">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">New Review</h2>
        <p className="text-muted-foreground">
          Paste your code below or upload a file to get an AI-powered code review.
        </p>
      </div>
      
      <CodeEditor />
    </div>
  )
}
