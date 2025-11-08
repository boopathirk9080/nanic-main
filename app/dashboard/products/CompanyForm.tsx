"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Company {
  id?: string;
  company_name: string;
  company_code: string;
  contact_person?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
}

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: Omit<Company, "id">) => Promise<void>;
  onCancel: () => void;
}

export default function CompanyForm({
  company,
  onSubmit,
  onCancel,
}: CompanyFormProps) {
  const [formData, setFormData] = useState<Omit<Company, "id">>({
    company_name: company?.company_name || "",
    company_code: company?.company_code || "",
    contact_person: company?.contact_person || "",
    contact_email: company?.contact_email || "",
    contact_phone: company?.contact_phone || "",
    address: company?.address || "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_name">
            Company Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company_name"
            name="company_name"
            value={formData.company_name}
            onChange={handleChange}
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company_code">
            Company Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="company_code"
            name="company_code"
            value={formData.company_code}
            onChange={handleChange}
            placeholder="e.g., PHARMA001"
            required
            disabled={!!company} // Disable if editing
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_person">Contact Person</Label>
          <Input
            id="contact_person"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleChange}
            placeholder="Contact person name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_phone">Contact Phone</Label>
          <Input
            id="contact_phone"
            name="contact_phone"
            type="tel"
            value={formData.contact_phone}
            onChange={handleChange}
            placeholder="+91 1234567890"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            name="contact_email"
            type="email"
            value={formData.contact_email}
            onChange={handleChange}
            placeholder="contact@company.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          placeholder="Full company address"
          rows={3}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : company
            ? "Update Company"
            : "Add Company"}
        </Button>
      </div>
    </form>
  );
}
