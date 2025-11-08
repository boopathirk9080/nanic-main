"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"

interface PatientTableProps {
  patients: any[]
  onEdit: (patient: any) => void
  onDelete: (id: string) => void
}

export default function PatientTable({ patients, onEdit, onDelete }: PatientTableProps) {
  if (patients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">No patients found. Add a new patient to get started.</div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b bg-muted/50">
          <tr>
            <th className="text-left py-3 px-4 font-medium">Patient ID</th>
            <th className="text-left py-3 px-4 font-medium">Name</th>
            <th className="text-left py-3 px-4 font-medium">Email</th>
            <th className="text-left py-3 px-4 font-medium">Phone</th>
            <th className="text-left py-3 px-4 font-medium">Insurance ID</th>
            <th className="text-left py-3 px-4 font-medium">Status</th>
            <th className="text-left py-3 px-4 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient.id} className="border-b hover:bg-muted/50">
              <td className="py-3 px-4 font-medium">{patient.id}</td>
              <td className="py-3 px-4">
                {patient.firstName} {patient.lastName}
              </td>
              <td className="py-3 px-4">{patient.email}</td>
              <td className="py-3 px-4">{patient.phone}</td>
              <td className="py-3 px-4">{patient.insuranceId}</td>
              <td className="py-3 px-4">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium capitalize">
                  {patient.status}
                </span>
              </td>
              <td className="py-3 px-4">
                <div className="flex gap-2">
                  <Button size="sm" variant="ghost" onClick={() => onEdit(patient)} className="h-8 w-8 p-0">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(patient.id)}
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
