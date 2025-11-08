"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { X } from "lucide-react"

interface ClaimDetailsProps {
  claim: any
  onStatusChange: (claimId: string, newStatus: string) => void
  onClose: () => void
}

export default function ClaimDetails({ claim, onStatusChange, onClose }: ClaimDetailsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700"
      case "denied":
        return "bg-red-100 text-red-700"
      case "submitted":
        return "bg-yellow-100 text-yellow-700"
      case "pending":
        return "bg-purple-100 text-purple-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Claim Details</CardTitle>
          <CardDescription>{claim.id}</CardDescription>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Patient</p>
          <p className="font-medium">{claim.patientName}</p>
          <p className="text-sm text-muted-foreground">{claim.patientId}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Claim Amount</p>
          <p className="text-2xl font-bold text-blue-600">${claim.claimAmount.toFixed(2)}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize mt-1 ${getStatusColor(claim.status)}`}
          >
            {claim.status}
          </span>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Insurance Provider</p>
          <p className="font-medium">{claim.insuranceProvider}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Service Date</p>
          <p className="font-medium">{claim.serviceDate}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Submission Date</p>
          <p className="font-medium">{claim.submissionDate}</p>
        </div>

        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Description</p>
          <p className="text-sm">{claim.description}</p>
        </div>

        <div className="pt-4 border-t space-y-2">
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Update Status</p>
          <div className="space-y-2">
            {["submitted", "pending", "approved", "denied"].map((status) => (
              <Button
                key={status}
                variant={claim.status === status ? "default" : "outline"}
                size="sm"
                className="w-full justify-start capitalize"
                onClick={() => onStatusChange(claim.id, status)}
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
