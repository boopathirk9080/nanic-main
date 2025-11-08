"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface ClaimTableProps {
  claims: any[]
  onSelect: (claim: any) => void
  onEdit: (claim: any) => void
  onDelete: (id: string) => void
  selectedId?: string
}

export default function ClaimTable({ claims, onSelect, onEdit, onDelete, selectedId }: ClaimTableProps) {
  if (claims.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No claims found. Submit a new claim to get started.</div>
    )
  }

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
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left py-3 px-4 font-medium">Claim ID</th>
            <th className="text-left py-3 px-4 font-medium">Patient</th>
            <th className="text-left py-3 px-4 font-medium">Amount</th>
            <th className="text-left py-3 px-4 font-medium">Provider</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Date</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {claims.map((claim) => (
            <tr
              key={claim.id}
              className={`border-b hover:bg-muted/50 cursor-pointer ${selectedId === claim.id ? "bg-blue-50" : ""}`}
              onClick={() => onSelect(claim)}
            >
              <td className="py-3 px-4 font-medium">{claim.id}</td>
              <td className="py-3 px-4">{claim.patientName}</td>
              <td className="py-3 px-4 font-medium">${claim.claimAmount.toFixed(2)}</td>
              <td className="py-3 px-4">{claim.insuranceProvider}</td>
              <td className="py-3 px-4">
                <span className={`px-2 py-1 rounded text-xs font-medium capitalize ${getStatusColor(claim.status)}`}>
                  {claim.status}
                </span>
              </td>
              <td className="py-3 px-4">{claim.serviceDate}</td>
              <td className="py-3 px-4">
                <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                  <Button size="sm" variant="ghost" onClick={() => onEdit(claim)} className="h-8 w-8 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(claim.id)}
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
