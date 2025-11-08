"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface PatientFormProps {
  initialData?: any
  onSubmit: (data: any) => void
  onCancel: () => void
}

export default function PatientForm({ initialData, onSubmit, onCancel }: PatientFormProps) {
  const [formData, setFormData] = useState(
    initialData || {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      email: "",
      phone: "",
      insuranceId: "",
      status: "active",
    },
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
          <label className="text-sm font-medium">First Name</label>
          <Input name="firstName" value={formData.firstName} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium">Last Name</label>
          <Input name="lastName" value={formData.lastName} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Date of Birth</label>
          <Input name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium">Insurance ID</label>
          <Input name="insuranceId" value={formData.insuranceId} onChange={handleChange} required />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} required />
        </div>
        <div>
          <label className="text-sm font-medium">Phone</label>
          <Input name="phone" value={formData.phone} onChange={handleChange} required />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save Patient</Button>
      </div>
    </form>
  )
}
