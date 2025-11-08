"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search } from "lucide-react"
import ClaimForm from "./claim-form"
import ClaimTable from "./claim-table"
import ClaimDetails from "./claim-details"

export default function ClaimsManagement() {
  const [claims, setClaims] = useState<any[]>([
    {
      id: "CLM001",
      patientId: "P001",
      patientName: "John Doe",
      serviceDate: "2024-10-15",
      claimAmount: 1500.0,
      status: "submitted",
      submissionDate: "2024-10-16",
      insuranceProvider: "Blue Cross",
      description: "Emergency room visit",
    },
    {
      id: "CLM002",
      patientId: "P002",
      patientName: "Jane Smith",
      serviceDate: "2024-10-10",
      claimAmount: 2500.0,
      status: "approved",
      submissionDate: "2024-10-11",
      insuranceProvider: "Aetna",
      description: "Surgery procedure",
    },
    {
      id: "CLM003",
      patientId: "P001",
      patientName: "John Doe",
      serviceDate: "2024-10-05",
      claimAmount: 800.0,
      status: "denied",
      submissionDate: "2024-10-06",
      insuranceProvider: "Blue Cross",
      description: "Routine checkup",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedClaim, setSelectedClaim] = useState<any>(null)
  const [editingClaim, setEditingClaim] = useState<any>(null)

  const filteredClaims = claims.filter((claim) => {
    const matchesSearch =
      claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.insuranceProvider.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || claim.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddClaim = (claimData: any) => {
    if (editingClaim) {
      setClaims(claims.map((c) => (c.id === editingClaim.id ? { ...claimData, id: c.id } : c)))
      setEditingClaim(null)
    } else {
      const newClaim = {
        ...claimData,
        id: `CLM${String(claims.length + 1).padStart(3, "0")}`,
        submissionDate: new Date().toISOString().split("T")[0],
      }
      setClaims([...claims, newClaim])
    }
    setShowForm(false)
  }

  const handleDeleteClaim = (id: string) => {
    setClaims(claims.filter((c) => c.id !== id))
    setSelectedClaim(null)
  }

  const handleEditClaim = (claim: any) => {
    setEditingClaim(claim)
    setShowForm(true)
  }

  const handleStatusChange = (claimId: string, newStatus: string) => {
    setClaims(claims.map((c) => (c.id === claimId ? { ...c, status: newStatus } : c)))
    if (selectedClaim?.id === claimId) {
      setSelectedClaim({ ...selectedClaim, status: newStatus })
    }
  }

  const getStatusStats = () => {
    return {
      total: claims.length,
      submitted: claims.filter((c) => c.status === "submitted").length,
      approved: claims.filter((c) => c.status === "approved").length,
      denied: claims.filter((c) => c.status === "denied").length,
      pending: claims.filter((c) => c.status === "pending").length,
    }
  }

  const stats = getStatusStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Claims Management</h1>
          <p className="text-muted-foreground mt-1">Submit and track insurance claims</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Claim
        </Button>
      </div>

      {/* Status Stats */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard label="Total Claims" value={stats.total} color="bg-blue-100 text-blue-700" />
        <StatCard label="Submitted" value={stats.submitted} color="bg-yellow-100 text-yellow-700" />
        <StatCard label="Approved" value={stats.approved} color="bg-green-100 text-green-700" />
        <StatCard label="Denied" value={stats.denied} color="bg-red-100 text-red-700" />
        <StatCard label="Pending" value={stats.pending} color="bg-purple-100 text-purple-700" />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingClaim ? "Edit Claim" : "Submit New Claim"}</CardTitle>
            <CardDescription>{editingClaim ? "Update claim information" : "Enter claim details"}</CardDescription>
          </CardHeader>
          <CardContent>
            <ClaimForm
              initialData={editingClaim}
              onSubmit={handleAddClaim}
              onCancel={() => {
                setShowForm(false)
                setEditingClaim(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Claims List</CardTitle>
              <CardDescription>Total: {filteredClaims.length} claims</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by claim ID, patient, or provider..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <ClaimTable
                claims={filteredClaims}
                onSelect={setSelectedClaim}
                onEdit={handleEditClaim}
                onDelete={handleDeleteClaim}
                selectedId={selectedClaim?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Claim Details Sidebar */}
        <div>
          {selectedClaim ? (
            <ClaimDetails
              claim={selectedClaim}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedClaim(null)}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Select a claim to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`p-3 rounded-lg ${color} mb-2`}>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <p className="text-sm text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  )
}
