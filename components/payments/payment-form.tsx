"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PaymentFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function PaymentForm({ initialData, onSubmit, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      claimId: "",
      patientName: "",
      amount: "",
      paymentDate: "",
      paymentMethod: "ACH Transfer",
      status: "completed",
      insuranceProvider: "",
      reference: "",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev: any) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Claim ID</label>
          <Input name="claimId" value={formData.claimId} onChange={handleChange} placeholder="CLM001" required />
        </div>
        <div>
          <label className="text-sm font-medium">Patient Name</label>
          <Input
            name="patientName"
            value={formData.patientName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Payment Amount</label>
          <Input
            name="amount"
            type="number"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            placeholder="1350.00"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Payment Date</label>
          <Input name="paymentDate" type="date" value={formData.paymentDate} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Payment Method</label>
          <select
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="ACH Transfer">ACH Transfer</option>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="Check">Check</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Insurance Provider</label>
          <Input
            name="insuranceProvider"
            value={formData.insuranceProvider}
            onChange={handleChange}
            placeholder="Blue Cross"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Reference Number</label>
          <Input
            name="reference"
            value={formData.reference}
            onChange={handleChange}
            placeholder="REF-2024-001"
            required
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Payment</Button>
      </div>
    </form>
  )
}
