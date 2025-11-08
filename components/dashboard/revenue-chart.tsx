"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const data = [
  { month: "Jan", revenue: 45000, claims: 120 },
  { month: "Feb", revenue: 52000, claims: 135 },
  { month: "Mar", revenue: 48000, claims: 128 },
  { month: "Apr", revenue: 61000, claims: 155 },
  { month: "May", revenue: 55000, claims: 142 },
  { month: "Jun", revenue: 67000, claims: 168 },
]

export default function RevenueChart() {
  return (
    <div className="bg-white rounded-lg border border-border p-6">
      <h3 className="font-semibold text-foreground mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" stroke="#94a3b8" />
          <YAxis stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0" }}
            labelStyle={{ color: "#0f172a" }}
          />
          <Legend />
          <Bar dataKey="revenue" fill="#0ea5e9" name="Revenue ($)" />
          <Bar dataKey="claims" fill="#10b981" name="Claims" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
