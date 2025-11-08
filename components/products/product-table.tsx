"use client"

import { Button } from "@/components/ui/button"
import { Edit2, Trash2 } from "lucide-react"
import { useState } from "react"

interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  unit_price: number
  category: string
  description: string
}

interface ProductTableProps {
  products: Product[]
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const handleDeleteClick = (id: string) => {
    setDeleteConfirm(id)
  }

  const confirmDelete = (id: string) => {
    onDelete(id)
    setDeleteConfirm(null)
  }

  if (products.length === 0) {
    return <div className="text-center py-8 text-gray-500">No products found. Add your first product!</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-3 px-4 font-semibold">Product Name</th>
            <th className="text-left py-3 px-4 font-semibold">SKU</th>
            <th className="text-left py-3 px-4 font-semibold">Category</th>
            <th className="text-right py-3 px-4 font-semibold">Quantity</th>
            <th className="text-right py-3 px-4 font-semibold">Unit Price</th>
            <th className="text-right py-3 px-4 font-semibold">Total Value</th>
            <th className="text-center py-3 px-4 font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">{product.name}</td>
              <td className="py-3 px-4 text-sm text-gray-600">{product.sku}</td>
              <td className="py-3 px-4 text-sm">{product.category || "-"}</td>
              <td className="py-3 px-4 text-right">
                <span className={`font-semibold ${product.quantity < 10 ? "text-red-600" : "text-green-600"}`}>
                  {product.quantity}
                </span>
              </td>
              <td className="py-3 px-4 text-right">${product.unit_price.toFixed(2)}</td>
              <td className="py-3 px-4 text-right font-semibold">
                ${(product.quantity * product.unit_price).toFixed(2)}
              </td>
              <td className="py-3 px-4 text-center">
                <div className="flex gap-2 justify-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(product)}
                    className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300 transition-colors"
                    title="Edit product"
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  {deleteConfirm === product.id ? (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => confirmDelete(product.id)}
                        className="text-xs"
                      >
                        Confirm
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setDeleteConfirm(null)} className="text-xs">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(product.id)}
                      className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
