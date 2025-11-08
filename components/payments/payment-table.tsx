"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface PaymentTableProps {
  payments: any[]
  onSelect: (payment: any) => void
  onEdit: (payment: any) => void
  onDelete: (id: string) => void
  selectedId?: string
}

export default function PaymentTable({ payments, onSelect, onEdit, onDelete, selectedId }: PaymentTableProps) {
  if (payments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No payments found. Record a new payment to get started.
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700"
      case "denied":
        return "bg-red-100 text-red-700"
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left py-3 px-4 font-medium">Payment ID</th>
            <th className="text-left py-3 px-4 font-medium">Claim ID</th>
            <th className="text-left py-3 px-4 font-medium">Patient</th>
            <th className="text-left py-3 px-4 font-medium">Amount</th>
            <th className="text-left py-3 px-4 font-medium">Method</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className={`border-b hover:bg-muted/50 cursor-pointer ${selectedId === payment.id ? "bg-blue-50" : ""}`}
              onClick={() => onSelect(payment)}
            >
              <td className="py-3 px-4 font-medium">{payment.id}</td>
              <td className="py-3 px-4">{payment.claimId}</td>
              <td className="py-3 px-4">{payment.patientName}</td>
              <td className="py-3 px-4 font-medium">${payment.amount.toFixed(2)}</td>
              <td className="py-3 px-4 text-sm">{payment.paymentMethod}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(payment.status)}`}>
                  {payment.status}
                </span>
              </td>
              <td className="py-3 px-4">{payment.paymentDate || "N/A"}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(payment)} className="h-8 w-8 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(payment.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
