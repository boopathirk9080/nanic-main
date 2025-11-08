"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import PatientForm from "./patient-form"
import PatientTable from "./patient-table"

export default function PatientManagement() {
  const [patients, setPatients] = useState<any[]>([
    {
      id: "P001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-03-15",
      email: "john.doe@example.com",
      phone: "555-0101",
      insuranceId: "INS-123456",
      status: "active",
    },
    {
      id: "P002",
      firstName: "Jane",
      lastName: "Smith",
      dateOfBirth: "1990-07-22",
      email: "jane.smith@example.com",
      phone: "555-0102",
      insuranceId: "INS-789012",
      status: "active",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [editingPatient, setEditingPatient] = useState<any>(null)

  const filteredPatients = patients.filter(
    (p) =>
      p.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddPatient = (patientData: any) => {
    if (editingPatient) {
      setPatients(patients.map((p) => (p.id === editingPatient.id ? { ...patientData, id: p.id } : p)))
      setEditingPatient(null)
    } else {
      const newPatient = {
        ...patientData,
        id: `P${String(patients.length + 1).padStart(3, "0")}`,
      }
      setPatients([...patients, newPatient])
    }
    setShowForm(false)
  }

  const handleDeletePatient = (id: string) => {
    setPatients(patients.filter((p) => p.id !== id))
  }

  const handleEditPatient = (patient: any) => {
    setEditingPatient(patient)
    setShowForm(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Patient Management</h1>
          <p className="text-muted-foreground mt-1">Manage and view patient records</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Patient
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPatient ? "Edit Patient" : "Add New Patient"}</CardTitle>
            <CardDescription>{editingPatient ? "Update patient information" : "Enter patient details"}</CardDescription>
          </CardHeader>
          <CardContent>
            <PatientForm
              initialData={editingPatient}
              onSubmit={handleAddPatient}
              onCancel={() => {
                setShowForm(false)
                setEditingPatient(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Patients</CardTitle>
          <CardDescription>Total patients: {patients.length}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or patient ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
          <PatientTable patients={filteredPatients} onEdit={handleEditPatient} onDelete={handleDeletePatient} />
        </CardContent>
      </Card>
    </div>
  )
}
