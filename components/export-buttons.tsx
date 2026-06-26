'use client'

import { Download, FileJson, FileText, Printer } from 'lucide-react'
import { toast } from 'sonner'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Finding {
  category: string
  severity?: string
  title: string
  description: string
  how_to_fix?: string
  line_number?: number
}

interface ExportButtonsProps {
  review: {
    title: string
    score: number
    language: string
    summary: string
    overall_feedback?: string
    original_code: string
    improved_code?: string
    created_at: string
  }
  findings: Finding[]
}

export function ExportButtons({ review, findings }: ExportButtonsProps) {
  
  const handleExportJSON = () => {
    try {
      const payload = {
        review,
        findings
      }
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2))
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `${review.title.replace(/\s+/g, '_')}_report.json`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success('JSON report downloaded')
    } catch {
      toast.error('Failed to export JSON')
    }
  }

  const handleExportMarkdown = () => {
    try {
      let md = `# AI Code Review Report: ${review.title}\n\n`
      md += `**Score**: ${review.score}/100\n`
      md += `**Language**: ${review.language.toUpperCase()}\n`
      md += `**Date**: ${new Date(review.created_at).toLocaleDateString()}\n\n`
      
      md += `## Executive Summary\n${review.summary}\n\n`
      if (review.overall_feedback) {
        md += `## Key Recommendation\n${review.overall_feedback}\n\n`
      }

      md += `## Findings (${findings.length})\n\n`
      findings.forEach((finding, idx) => {
        md += `### ${idx + 1}. [${finding.category.toUpperCase()}] ${finding.title}\n`
        if (finding.severity) {
          md += `* **Severity**: ${finding.severity}\n`
        }
        if (finding.line_number) {
          md += `* **Line Number**: ${finding.line_number}\n`
        }
        md += `\n**Description**:\n${finding.description}\n`
        if (finding.how_to_fix) {
          md += `\n**How to fix**:\n\`\`\`\n${finding.how_to_fix}\n\`\`\`\n`
        }
        md += `\n---\n\n`
      })

      md += `## Code Implementation\n\n`
      md += `### Original Code\n\`\`\`${review.language}\n${review.original_code}\n\`\`\`\n\n`
      if (review.improved_code) {
        md += `### Improved Code Suggestions\n\`\`\`${review.language}\n${review.improved_code}\n\`\`\`\n`
      }

      const dataStr = 'data:text/markdown;charset=utf-8,' + encodeURIComponent(md)
      const downloadAnchor = document.createElement('a')
      downloadAnchor.setAttribute('href', dataStr)
      downloadAnchor.setAttribute('download', `${review.title.replace(/\s+/g, '_')}_report.md`)
      document.body.appendChild(downloadAnchor)
      downloadAnchor.click()
      downloadAnchor.remove()
      toast.success('Markdown report downloaded')
    } catch {
      toast.error('Failed to export Markdown')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-full border border-border/50 bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 gap-2 cursor-pointer">
        <Download className="h-4 w-4" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={handleExportMarkdown} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4 text-primary" />
          Markdown (.md)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportJSON} className="cursor-pointer">
          <FileJson className="mr-2 h-4 w-4 text-yellow-500" />
          JSON Payload
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint} className="cursor-pointer">
          <Printer className="mr-2 h-4 w-4 text-green-500" />
          Print / PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
