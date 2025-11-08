import type { LucideIcon } from "lucide-react"
import { TrendingUp, TrendingDown } from "lucide-react"

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  change: string
  trend: "up" | "down"
}

export default function MetricCard({ icon: Icon, label, value, change, trend }: MetricCardProps) {
  const isPositive = trend === "up"

  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? "text-success" : "text-error"}`}>
          {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <p className="text-muted text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold text-foreground">{value}</p>
    </div>
  )
}
