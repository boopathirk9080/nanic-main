"use client"

import { useState } from "react"
import { Search, Plus } from "lucide-react"

export default function PatientsPage() {
  const [searchTerm, setSearchTerm] = useState("")

  const patients = [
    { id: 1, name: "John Doe", mrn: "MRN-001", dob: "1985-03-15", insurance: "Blue Cross" },
    { id: 2, name: "Jane Smith", mrn: "MRN-002", dob: "1990-07-22", insurance: "Aetna" },
    { id: 3, name: "Robert Johnson", mrn: "MRN-003", dob: "1978-11-08", insurance: "United" },
    { id: 4, name: "Sarah Williams", mrn: "MRN-004", dob: "1992-05-30", insurance: "Cigna" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Patients</h1>
          <p className="text-muted mt-1">Manage patient records and information</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors">
          <Plus className="w-5 h-5" />
          Add Patient
        </button>
      </div>

      <div className="bg-white rounded-lg border border-border p-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-muted" />
            <input
              type="text"
              placeholder="Search by name, MRN, or insurance..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">MRN</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Date of Birth</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Insurance</th>
                <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="border-b border-border hover:bg-secondary-light transition-colors">
                  <td className="py-3 px-4 text-foreground">{patient.name}</td>
                  <td className="py-3 px-4 text-muted">{patient.mrn}</td>
                  <td className="py-3 px-4 text-muted">{patient.dob}</td>
                  <td className="py-3 px-4 text-foreground">{patient.insurance}</td>
                  <td className="py-3 px-4">
                    <button className="text-primary hover:text-primary-dark font-medium text-sm">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
