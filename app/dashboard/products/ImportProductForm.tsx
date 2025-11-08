"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ImportProduct {
  id?: string;
  company_id: string;
  brand_code: string;
  product_name: string;
  category: string;
  strip_count: number;
  per_strip_tablet_count: number;
  import_price: number;
}

interface Company {
  id: string;
  company_name: string;
  company_code: string;
}

interface ImportProductFormProps {
  companies: Company[];
  importProduct?: ImportProduct;
  onSubmit: (data: Omit<ImportProduct, "id">) => Promise<void>;
  onCancel: () => void;
}

export default function ImportProductForm({
  companies,
  importProduct,
  onSubmit,
  onCancel,
}: ImportProductFormProps) {
  const [formData, setFormData] = useState<Omit<ImportProduct, "id">>({
    company_id: importProduct?.company_id || "",
    brand_code: importProduct?.brand_code || "",
    product_name: importProduct?.product_name || "",
    category: importProduct?.category || "",
    strip_count: importProduct?.strip_count || 1,
    per_strip_tablet_count: importProduct?.per_strip_tablet_count || 10,
    import_price: importProduct?.import_price || 0,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="company_id">
            Company <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.company_id}
            onValueChange={(value) =>
              setFormData((prev) => ({ ...prev, company_id: value }))
            }
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((company) => (
                <SelectItem key={company.id} value={company.id}>
                  {company.company_name} ({company.company_code})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="brand_code">
            Brand Code <span className="text-red-500">*</span>
          </Label>
          <Input
            id="brand_code"
            name="brand_code"
            value={formData.brand_code}
            onChange={handleChange}
            placeholder="e.g., PARA500"
            required
            disabled={!!importProduct} // Disable if editing
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="product_name">
            Product Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="product_name"
            name="product_name"
            value={formData.product_name}
            onChange={handleChange}
            placeholder="e.g., Paracetamol 500mg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">
            Category <span className="text-red-500">*</span>
          </Label>
          <Input
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="e.g., Tablets, Syrup, Injection"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="strip_count">
            Strips per Pack <span className="text-red-500">*</span>
          </Label>
          <Input
            id="strip_count"
            name="strip_count"
            type="number"
            min="1"
            value={formData.strip_count}
            onChange={handleChange}
            placeholder="e.g., 10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="per_strip_tablet_count">
            Tablets per Strip <span className="text-red-500">*</span>
          </Label>
          <Input
            id="per_strip_tablet_count"
            name="per_strip_tablet_count"
            type="number"
            min="1"
            value={formData.per_strip_tablet_count}
            onChange={handleChange}
            placeholder="e.g., 10"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="import_price">
            Import Price (₹) <span className="text-red-500">*</span>
          </Label>
          <Input
            id="import_price"
            name="import_price"
            type="number"
            min="0"
            step="0.01"
            value={formData.import_price}
            onChange={handleChange}
            placeholder="e.g., 50.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-gray-600">
            Total Tablets per Pack
          </Label>
          <div className="px-3 py-2 bg-gray-100 rounded-md font-semibold">
            {formData.strip_count * formData.per_strip_tablet_count} tablets
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : importProduct
            ? "Update Product"
            : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
