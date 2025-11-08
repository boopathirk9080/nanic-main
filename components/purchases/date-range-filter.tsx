"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, X } from "lucide-react"

interface DateRangeFilterProps {
  dateRange: { startDate: string; endDate: string }
  onDateRangeChange: (range: { startDate: string; endDate: string }) => void
}

export default function DateRangeFilter({ dateRange, onDateRangeChange }: DateRangeFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      startDate: e.target.value,
    })
  }

  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onDateRangeChange({
      ...dateRange,
      endDate: e.target.value,
    })
  }

  const handleClear = () => {
    onDateRangeChange({
      startDate: "",
      endDate: "",
    })
  }

  const handleWeekFilter = (weeksAgo: number) => {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - weeksAgo * 7)

    onDateRangeChange({
      startDate: startDate.toISOString().split("T")[0],
      endDate: endDate.toISOString().split("T")[0],
    })
  }

  return (
    <div className="relative">
      <Button variant="outline" onClick={() => setIsOpen(!isOpen)} className="gap-2">
        <Calendar className="w-4 h-4" />
        Filter by Date
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <div className="space-y-4">
            {/* Quick filters */}
            <div>
              <Label className="text-sm font-semibold mb-2 block">Quick Filters</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="outline" onClick={() => handleWeekFilter(1)} className="text-xs">
                  This Week
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleWeekFilter(2)} className="text-xs">
                  Last 2 Weeks
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleWeekFilter(4)} className="text-xs">
                  Last Month
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleWeekFilter(12)} className="text-xs">
                  Last 3 Months
                </Button>
              </div>
            </div>

            {/* Custom date range */}
            <div className="border-t pt-4">
              <Label className="text-sm font-semibold mb-2 block">Custom Range</Label>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="startDate" className="text-xs">
                    Start Date
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={handleStartDateChange}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate" className="text-xs">
                    End Date
                  </Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={handleEndDateChange}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Clear button */}
            {(dateRange.startDate || dateRange.endDate) && (
              <Button size="sm" variant="outline" onClick={handleClear} className="w-full gap-2 text-xs bg-transparent">
                <X className="w-3 h-3" />
                Clear Filters
              </Button>
            )}

            <Button size="sm" onClick={() => setIsOpen(false)} className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
              Apply
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
