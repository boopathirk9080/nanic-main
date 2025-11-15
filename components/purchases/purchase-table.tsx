

"use client"

import { Download, Trash2, FileText, Edit2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
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
  purchase_type: 'local' | 'import'
  local_company_id?: string
  local_companies?: {
    company_name: string
    company_code: string
  }
  purchase_items?: any[]
  import_purchase_items?: any[]
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
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No purchases found.</p>
        <p className="text-sm mt-2">Create your first purchase to get started!</p>
      </div>
    )
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  const handleDownload = (purchase: Purchase) => {
    let billItems = []
    let companyInfo = null

    if (purchase.purchase_type === 'local') {
      billItems = purchase.purchase_items?.map((item: any) => ({
        product_name: item.products?.name || "Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })) || []
    } else {
      billItems = purchase.import_purchase_items?.map((item: any) => ({
        product_name: item.import_products?.product_name || "Product",
        quantity: item.quantity_packs,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })) || []
      companyInfo = purchase.local_companies
    }

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
      purchase_type: purchase.purchase_type,
      company_name: companyInfo?.company_name,
      company_code: companyInfo?.company_code,
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
        let billItems = []
        let companyInfo = null

        if (purchase.purchase_type === 'local') {
          billItems = purchase.purchase_items?.map((item: any) => ({
            product_name: item.products?.name || "Product",
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })) || []
        } else {
          billItems = purchase.import_purchase_items?.map((item: any) => ({
            product_name: item.import_products?.product_name || "Product",
            quantity: item.quantity_packs,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          })) || []
          companyInfo = purchase.local_companies
        }

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
          purchase_type: purchase.purchase_type,
          company_name: companyInfo?.company_name,
          company_code: companyInfo?.company_code,
        }
      })

    if (selectedBills.length > 0) {
      generateMultipleBillsPDF(selectedBills)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-4">
      {selectedPurchases.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-sm font-medium text-blue-900">
            {selectedPurchases.size} purchase(s) selected
          </span>
          <div className="flex gap-2">
            <Button 
              onClick={handleBatchDownload} 
              className="bg-blue-600 hover:bg-blue-700 text-white gap-2" 
              size="sm"
            >
              <Download className="w-4 h-4" />
              Download Selected
            </Button>
            <Button
              onClick={() => {
                onMultiDelete(Array.from(selectedPurchases))
                setSelectedPurchases(new Set())
              }}
              className="bg-red-600 hover:bg-red-700 text-white gap-2"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </Button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="border-b">
              <th className="text-left py-3 px-4 font-semibold w-10">
                <Checkbox
                  checked={selectedPurchases.size === purchases.length && purchases.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </th>
              <th className="text-left py-3 px-4 font-semibold">Customer</th>
              <th className="text-left py-3 px-4 font-semibold">Contact</th>
              <th className="text-left py-3 px-4 font-semibold">Date</th>
              <th className="text-right py-3 px-4 font-semibold">Amount</th>
              <th className="text-center py-3 px-4 font-semibold">Type</th>
              <th className="text-center py-3 px-4 font-semibold">Status</th>
              <th className="text-center py-3 px-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {purchases.map((purchase) => (
              <tr key={purchase.id} className="border-b hover:bg-gray-50 transition-colors">
                <td className="py-3 px-4">
                  <Checkbox
                    checked={selectedPurchases.has(purchase.id)}
                    onCheckedChange={() => handleSelectPurchase(purchase.id)}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="font-medium">{purchase.customer_name}</div>
                  {purchase.local_companies && (
                    <div className="text-xs text-gray-500 mt-1">
                      {purchase.local_companies.company_name}
                    </div>
                  )}
                </td>
                <td className="py-3 px-4">
                  <div className="text-sm text-gray-600">
                    {purchase.customer_email || "-"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {purchase.customer_phone || "-"}
                  </div>
                </td>
                <td className="py-3 px-4 text-sm whitespace-nowrap">
                  {formatDate(purchase.purchase_date)}
                </td>
                <td className="py-3 px-4 text-right font-semibold text-blue-600">
                  {formatCurrency(purchase.total_amount)}
                </td>
                <td className="py-3 px-4 text-center">
                  <Badge variant={purchase.purchase_type === 'local' ? 'default' : 'secondary'}>
                    {purchase.purchase_type === 'local' ? 'Local' : 'Import'}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                    {purchase.status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <div className="flex gap-1 justify-center">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(purchase)}
                      title="Edit Purchase"
                      className="hover:bg-yellow-50 h-8 w-8 p-0"
                    >
                      <Edit2 className="w-4 h-4 text-yellow-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onViewBill(purchase)}
                      title="View Bill"
                      className="hover:bg-blue-50 h-8 w-8 p-0"
                    >
                      <FileText className="w-4 h-4 text-blue-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDownload(purchase)}
                      title="Download PDF"
                      className="hover:bg-green-50 h-8 w-8 p-0"
                    >
                      <Download className="w-4 h-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeletePurchase(purchase.id)}
                      title="Delete Purchase"
                      className="hover:bg-red-50 h-8 w-8 p-0"
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