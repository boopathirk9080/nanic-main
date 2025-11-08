"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, DollarSign, TrendingUp } from "lucide-react"
import PaymentForm from "./payment-form"
import PaymentTable from "./payment-table"
import PaymentDetails from "./payment-details"

export default function PaymentManagement() {
  const [payments, setPayments] = useState<any[]>([
    {
      id: "PAY001",
      claimId: "CLM001",
      patientName: "John Doe",
      amount: 1350.0,
      paymentDate: "2024-10-20",
      paymentMethod: "ACH Transfer",
      status: "completed",
      insuranceProvider: "Blue Cross",
      reference: "REF-2024-001",
    },
    {
      id: "PAY002",
      claimId: "CLM002",
      patientName: "Jane Smith",
      amount: 2250.0,
      paymentDate: "2024-10-18",
      paymentMethod: "Wire Transfer",
      status: "completed",
      insuranceProvider: "Aetna",
      reference: "REF-2024-002",
    },
    {
      id: "PAY003",
      claimId: "CLM003",
      patientName: "John Doe",
      amount: 0.0,
      paymentDate: null,
      paymentMethod: "N/A",
      status: "denied",
      insuranceProvider: "Blue Cross",
      reference: "REF-2024-003",
    },
  ])

  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [editingPayment, setEditingPayment] = useState<any>(null)

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.claimId.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleAddPayment = (paymentData: any) => {
    if (editingPayment) {
      setPayments(payments.map((p) => (p.id === editingPayment.id ? { ...paymentData, id: p.id } : p)))
      setEditingPayment(null)
    } else {
      const newPayment = {
        ...paymentData,
        id: `PAY${String(payments.length + 1).padStart(3, "0")}`,
      }
      setPayments([...payments, newPayment])
    }
    setShowForm(false)
  }

  const handleDeletePayment = (id: string) => {
    setPayments(payments.filter((p) => p.id !== id))
    setSelectedPayment(null)
  }

  const handleEditPayment = (payment: any) => {
    setEditingPayment(payment)
    setShowForm(true)
  }

  const handleStatusChange = (paymentId: string, newStatus: string) => {
    setPayments(payments.map((p) => (p.id === paymentId ? { ...p, status: newStatus } : p)))
    if (selectedPayment?.id === paymentId) {
      setSelectedPayment({ ...selectedPayment, status: newStatus })
    }
  }

  const getPaymentStats = () => {
    const completed = payments.filter((p) => p.status === "completed")
    const pending = payments.filter((p) => p.status === "pending")
    const denied = payments.filter((p) => p.status === "denied")

    return {
      totalPayments: payments.length,
      completedAmount: completed.reduce((sum, p) => sum + p.amount, 0),
      pendingAmount: pending.reduce((sum, p) => sum + p.amount, 0),
      deniedCount: denied.length,
      completedCount: completed.length,
    }
  }

  const stats = getPaymentStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Payment Processing</h1>
          <p className="text-muted-foreground mt-1">Track and manage claim payments</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Record Payment
        </Button>
      </div>

      {/* Payment Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Payments"
          value={stats.totalPayments}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-blue-100 text-blue-700"
        />
        <StatCard
          label="Completed"
          value={stats.completedCount}
          icon={<TrendingUp className="w-5 h-5" />}
          color="bg-green-100 text-green-700"
        />
        <StatCard
          label="Completed Amount"
          value={`$${stats.completedAmount.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-emerald-100 text-emerald-700"
        />
        <StatCard
          label="Pending Amount"
          value={`$${stats.pendingAmount.toFixed(2)}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="bg-yellow-100 text-yellow-700"
        />
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingPayment ? "Edit Payment" : "Record New Payment"}</CardTitle>
            <CardDescription>{editingPayment ? "Update payment information" : "Enter payment details"}</CardDescription>
          </CardHeader>
          <CardContent>
            <PaymentForm
              initialData={editingPayment}
              onSubmit={handleAddPayment}
              onCancel={() => {
                setShowForm(false)
                setEditingPayment(null)
              }}
            />
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Payments List</CardTitle>
              <CardDescription>Total: {filteredPayments.length} payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-2">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by payment ID, patient, or claim..."
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
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="denied">Denied</option>
                </select>
              </div>
              <PaymentTable
                payments={filteredPayments}
                onSelect={setSelectedPayment}
                onEdit={handleEditPayment}
                onDelete={handleDeletePayment}
                selectedId={selectedPayment?.id}
              />
            </CardContent>
          </Card>
        </div>

        {/* Payment Details Sidebar */}
        <div>
          {selectedPayment ? (
            <PaymentDetails
              payment={selectedPayment}
              onStatusChange={handleStatusChange}
              onClose={() => setSelectedPayment(null)}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">Select a payment to view details</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string
  value: string | number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}
