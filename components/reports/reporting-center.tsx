"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download } from "lucide-react"
import ReportGenerator from "./report-generator"
import ReportList from "./report-list"

export default function ReportingCenter() {
  const [reports, setReports] = useState<any[]>([
    {
      id: "RPT001",
      name: "Monthly Claims Summary - October 2024",
      type: "claims_summary",
      generatedDate: "2024-10-25",
      period: "October 2024",
      format: "PDF",
      size: "2.4 MB",
      status: "ready",
    },
    {
      id: "RPT002",
      name: "Payment Reconciliation Report",
      type: "payment_reconciliation",
      generatedDate: "2024-10-24",
      period: "October 2024",
      format: "Excel",
      size: "1.8 MB",
      status: "ready",
    },
    {
      id: "RPT003",
      name: "Insurance Provider Performance",
      type: "provider_performance",
      generatedDate: "2024-10-23",
      period: "Q4 2024",
      format: "PDF",
      size: "3.1 MB",
      status: "ready",
    },
  ])

  const [showGenerator, setShowGenerator] = useState(false)
  const [selectedReport, setSelectedReport] = useState<any>(null)

  const handleGenerateReport = (reportData: any) => {
    const newReport = {
      id: `RPT${String(reports.length + 1).padStart(3, "0")}`,
      ...reportData,
      generatedDate: new Date().toISOString().split("T")[0],
      status: "ready",
    }
    setReports([newReport, ...reports])
    setShowGenerator(false)
  }

  const handleDownloadReport = (reportId: string) => {
    const report = reports.find((r) => r.id === reportId)
    if (report) {
      // Simulate download
      const element = document.createElement("a")
      element.setAttribute("href", `data:text/plain;charset=utf-8,Report: ${report.name}`)
      element.setAttribute("download", `${report.name}.${report.format.toLowerCase()}`)
      element.style.display = "none"
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    }
  }

  const handleDeleteReport = (reportId: string) => {
    setReports(reports.filter((r) => r.id !== reportId))
    setSelectedReport(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports & Export</h1>
          <p className="text-muted-foreground mt-1">Generate and manage billing reports</p>
        </div>
        <Button onClick={() => setShowGenerator(true)} className="gap-2">
          <FileText className="w-4 h-4" />
          Generate Report
        </Button>
      </div>

      {showGenerator && (
        <Card>
          <CardHeader>
            <CardTitle>Generate New Report</CardTitle>
            <CardDescription>Create a custom report with your preferred settings</CardDescription>
          </CardHeader>
          <CardContent>
            <ReportGenerator onGenerate={handleGenerateReport} onCancel={() => setShowGenerator(false)} />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Generated Reports</CardTitle>
              <CardDescription>Total: {reports.length} reports</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportList
                reports={reports}
                onSelect={setSelectedReport}
                onDownload={handleDownloadReport}
                onDelete={handleDeleteReport}
                selectedId={selectedReport?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Report Details Sidebar */}
        <div>
          {selectedReport ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Report Name</p>
                  <p className="font-medium text-sm mt-1">{selectedReport.name}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Report Type</p>
                  <p className="font-medium text-sm mt-1 capitalize">{selectedReport.type.replace(/_/g, " ")}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Period</p>
                  <p className="font-medium text-sm mt-1">{selectedReport.period}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Generated Date</p>
                  <p className="font-medium text-sm mt-1">{selectedReport.generatedDate}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Format</p>
                  <p className="font-medium text-sm mt-1">{selectedReport.format}</p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">File Size</p>
                  <p className="font-medium text-sm mt-1">{selectedReport.size}</p>
                </div>

                <div className="pt-4 border-t space-y-2">
                  <Button onClick={() => handleDownloadReport(selectedReport.id)} className="w-full gap-2">
                    <Download className="w-4 h-4" />
                    Download Report
                  </Button>
                  <Button variant="outline" onClick={() => setSelectedReport(null)} className="w-full">
                    Close
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Select a report to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Export Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Export Templates</CardTitle>
          <CardDescription>Export data in common formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            {[
              { name: "Claims Data", format: "CSV", icon: "📊" },
              { name: "Payment Records", format: "Excel", icon: "💰" },
              { name: "Patient List", format: "PDF", icon: "👥" },
              { name: "Financial Summary", format: "Excel", icon: "📈" },
            ].map((template, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto flex flex-col items-center justify-center p-4 gap-2 bg-transparent"
              >
                <span className="text-2xl">{template.icon}</span>
                <span className="text-sm font-medium">{template.name}</span>
                <span className="text-xs text-muted-foreground">{template.format}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
