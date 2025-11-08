"use client"

import { Button } from "@/components/ui/button"
import { Download, Trash2 } from "lucide-react"

interface ReportListProps {
  reports: any[]
  onSelect: (report: any) => void
  onDownload: (id: string) => void
  onDelete: (id: string) => void
  selectedId?: string
}

export default function ReportList({ reports, onSelect, onDownload, onDelete, selectedId }: ReportListProps) {
  if (reports.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reports generated yet. Create a new report to get started.
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {reports.map((report) => (
        <div
          key={report.id}
          className={`p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors ${
            selectedId === report.id ? "bg-blue-50 border-blue-300" : ""
          }`}
          onClick={() => onSelect(report)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="font-medium text-sm">{report.name}</p>
              <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                <span>{report.generatedDate}</span>
                <span>{report.format}</span>
                <span>{report.size}</span>
              </div>
            </div>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" variant="ghost" onClick={() => onDownload(report.id)} className="h-8 w-8 p-0">
                <Download className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onDelete(report.id)}
                className="h-8 w-8 p-0 text-destructive hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
