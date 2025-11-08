"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface PaymentDetailsProps {
  payment: any
  onStatusChange: (paymentId: string, newStatus: string) => void
  onClose: () => void
}

export default function PaymentDetails({ payment, onStatusChange, onClose }: PaymentDetailsProps) {
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>{payment.id}</CardDescription>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Claim ID</p>
          <p className="font-medium">{payment.claimId}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Patient</p>
          <p className="font-medium">{payment.patientName}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Amount</p>
          <p className="text-2xl font-bold text-green-600">${payment.amount.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize mt-1 ${getStatusColor(payment.status)}`}
          >
            {payment.status}
          </span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Method</p>
          <p className="font-medium">{payment.paymentMethod}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Insurance Provider</p>
          <p className="font-medium">{payment.insuranceProvider}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Payment Date</p>
          <p className="font-medium">{payment.paymentDate || "N/A"}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Reference Number</p>
          <p className="font-medium">{payment.reference}</p>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Update Status</p>
          <div className="space-y-2">
            {["completed", "pending", "denied"].map((status) => (
              <Button
                key={status}
                variant={payment.status === status ? "default" : "outline"}
                size="sm"
                className="w-full justify-start capitalize"
                onClick={() => onStatusChange(payment.id, status)}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
