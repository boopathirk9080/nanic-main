"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ClaimFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function ClaimForm({ initialData, onSubmit, onCancel }: ClaimFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      patientId: "",
      patientName: "",
      serviceDate: "",
      claimAmount: "",
      insuranceProvider: "",
      description: "",
      status: "submitted",
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
          <label className="text-sm font-medium">Patient ID</label>
          <Input name="patientId" value={formData.patientId} onChange={handleChange} placeholder="P001" required />
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
          <label className="text-sm font-medium">Service Date</label>
          <Input name="serviceDate" type="date" value={formData.serviceDate} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium">Claim Amount</label>
          <Input
            name="claimAmount"
            type="number"
            step="0.01"
            value={formData.claimAmount}
            onChange={handleChange}
            placeholder="1500.00"
            required
          />
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
          <label className="text-sm font-medium">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-border rounded-md text-sm"
          >
            <option value="submitted">Submitted</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Claim description..."
          className="w-full px-3 py-2 border border-border rounded-md text-sm"
          rows={3}
        />
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Claim</Button>
      </div>
    </form>
  )
}
