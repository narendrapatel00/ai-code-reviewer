'use client'

import { DiffEditor } from '@monaco-editor/react'
import { useTheme } from 'next-themes'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface CodeDiffViewerProps {
  original: string;
  modified: string;
  language: string;
}

export function CodeDiffViewer({ original, modified, language }: CodeDiffViewerProps) {
  const { theme } = useTheme()

  return (
    <Card className="border-border/50 overflow-hidden flex flex-col h-[500px]">
      <CardHeader className="py-3 bg-muted/20 border-b border-border/50">
        <CardTitle className="text-sm font-semibold">Code Version Comparison (Original vs Improved)</CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex-1 relative">
        <DiffEditor
          height="100%"
          language={language}
          theme={theme === 'dark' ? 'vs-dark' : 'light'}
          original={original}
          modified={modified}
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
  )
}
