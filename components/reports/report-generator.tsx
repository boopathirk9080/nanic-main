"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ReportGeneratorProps {
  onGenerate: (data: any) => void
  onCancel: () => void
}

export default function ReportGenerator({ onGenerate, onCancel }: ReportGeneratorProps) {
  const [formData, setFormData] = useState({
    name: "",
    type: "claims_summary",
    period: "current_month",
    startDate: "",
    endDate: "",
    format: "PDF",
    includeCharts: true,
    includeSummary: true,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onGenerate(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Report Name</label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g., October Claims Report"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Report Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="claims_summary">Claims Summary</option>
            <option value="payment_reconciliation">Payment Reconciliation</option>
            <option value="provider_performance">Insurance Provider Performance</option>
            <option value="patient_aging">Patient Aging Report</option>
            <option value="financial_summary">Financial Summary</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Period</label>
          <select
            name="period"
            value={formData.period}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="current_month">Current Month</option>
            <option value="last_month">Last Month</option>
            <option value="current_quarter">Current Quarter</option>
            <option value="current_year">Current Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Export Format</label>
          <select
            name="format"
            value={formData.format}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="PDF">PDF</option>
            <option value="Excel">Excel</option>
            <option value="CSV">CSV</option>
            <option value="JSON">JSON</option>
          </select>
        </div>
      </div>

      {formData.period === "custom" && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium">Start Date</label>
            <Input name="startDate" type="date" value={formData.startDate} onChange={handleChange} required />
          </div>
          <div>
            <label className="text-sm font-medium">End Date</label>
            <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} required />
          </div>
        </div>
      )}

      <div className="space-y-2">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="includeCharts"
            checked={formData.includeCharts}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm">Include Charts & Visualizations</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            name="includeSummary"
            checked={formData.includeSummary}
            onChange={handleChange}
            className="rounded"
          />
          <span className="text-sm">Include Executive Summary</span>
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Generate Report</Button>
      </div>
    </form>
  )
}
