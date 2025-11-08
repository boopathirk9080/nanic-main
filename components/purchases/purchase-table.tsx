"use client"

import { Download, Trash2, FileText, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { generateBillPDF, generateMultipleBillsPDF } from "@/lib/pdf-generator"
import { useState } from "react"

interface Purchase {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  purchase_date: string
  total_amount: number
  status: string
  notes: string
  purchase_items?: any[]
}

interface PurchaseTableProps {
  purchases: Purchase[]
  onRefresh: () => void
  onViewBill: (purchase: Purchase) => void
  onDeletePurchase: (purchaseId: string) => void
  onMultiDelete: (purchaseIds: string[]) => void
  onEdit: (purchase: Purchase) => void
}

export default function PurchaseTable({
  purchases,
  onViewBill,
  onDeletePurchase,
  onMultiDelete,
  onEdit,
}: PurchaseTableProps) {
  const [selectedPurchases, setSelectedPurchases] = useState<Set<string>>(new Set())

  if (purchases.length === 0) {
    return <div className="text-center py-8 text-gray-500">No purchases found. Create your first purchase!</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDownload = (purchase: Purchase) => {
    const billItems =
      purchase.purchase_items?.map((item: any) => ({
        product_name: item.products?.name || "Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })) || []

    const bill = {
      bill_number: `BILL-${purchase.id.slice(0, 8).toUpperCase()}`,
      bill_date: purchase.purchase_date,
      customer_name: purchase.customer_name,
      customer_email: purchase.customer_email,
      customer_phone: purchase.customer_phone,
      items: billItems,
      total_amount: purchase.total_amount,
      notes: purchase.notes,
      shop_name: "Medical Shop",
    }

    generateBillPDF(bill)
  }

  const handleSelectPurchase = (purchaseId: string) => {
    const newSelected = new Set(selectedPurchases)
    if (newSelected.has(purchaseId)) {
      newSelected.delete(purchaseId)
    } else {
      newSelected.add(purchaseId)
    }
    setSelectedPurchases(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedPurchases.size === purchases.length) {
      setSelectedPurchases(new Set())
    } else {
      setSelectedPurchases(new Set(purchases.map((p) => p.id)))
    }
  }

  const handleBatchDownload = () => {
    const selectedBills = purchases
      .filter((p) => selectedPurchases.has(p.id))
      .map((purchase) => {
        const billItems =
          purchase.purchase_items?.map((item: any) => ({
            product_name: item.products?.name || "Product",
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })) || []

        return {
          bill_number: `BILL-${purchase.id.slice(0, 8).toUpperCase()}`,
          bill_date: purchase.purchase_date,
          customer_name: purchase.customer_name,
          customer_email: purchase.customer_email,
          customer_phone: purchase.customer_phone,
          items: billItems,
          total_amount: purchase.total_amount,
          notes: purchase.notes,
          shop_name: "Medical Shop",
        }
      })

    if (selectedBills.length > 0) {
      generateMultipleBillsPDF(selectedBills)
    }
  }

  return (
    <div className="space-y-4">
      {selectedPurchases.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-blue-900">{selectedPurchases.size} purchase(s) selected</span>
          <div className="flex gap-2">
            <Button onClick={handleBatchDownload} className="bg-blue-600 hover:bg-blue-700 text-white gap-2" size="sm">
              <Download className="w-4 h-4" />
              Download Selected as PDF
            </Button>
            <Button
              onClick={() => onMultiDelete(Array.from(selectedPurchases))}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold w-10">
                <Checkbox
                  checked={selectedPurchases.size === purchases.length && purchases.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-4 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 font-semibold">Email</th>
              <th className="text-left py-3 px-4 font-semibold">Phone</th>
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-right py-3 px-4 font-semibold">Amount</th>
              <th className="text-center py-3 px-4 font-semibold">Status</th>
              <th className="text-center py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedPurchases.has(purchase.id)}
                    onCheckedChange={() => handleSelectPurchase(purchase.id)}
                  />
                </td>
                <td className="py-3 px-4 font-medium">{purchase.customer_name}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{purchase.customer_email || "-"}</td>
                <td className="py-3 px-4 text-sm text-gray-600">{purchase.customer_phone || "-"}</td>
                <td className="py-3 px-4 text-sm">{formatDate(purchase.purchase_date)}</td>
                <td className="py-3 px-4 text-right font-semibold text-blue-600">
                  ${purchase.total_amount.toFixed(2)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    {purchase.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="flex gap-2 justify-center">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEdit(purchase)}
                      title="Edit Purchase"
                      className="hover:bg-yellow-50"
                    >
                      <Edit2 className="w-4 h-4 text-yellow-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewBill(purchase)}
                      title="View Bill"
                      className="hover:bg-blue-50"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(purchase)}
                      title="Download PDF"
                      className="hover:bg-green-50"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDeletePurchase(purchase.id)}
                      title="Delete Purchase"
                      className="hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
