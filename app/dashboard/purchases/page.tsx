"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import PurchaseForm from "@/components/purchases/purchase-form"
import PurchaseTable from "@/components/purchases/purchase-table"
import DateRangeFilter from "@/components/purchases/date-range-filter"
import BillPreviewModal from "@/components/bills/bill-preview-modal"
import EditPurchaseModal from "@/components/purchases/edit-purchase-modal"
import { Plus } from "lucide-react"

interface Purchase {
  id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  purchase_date: string
  total_amount: number
  status: string
  notes: string
}

interface BillItem {
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [dateRange, setDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  })
  const [selectedBill, setSelectedBill] = useState<any>(null)
  const [showBillPreview, setShowBillPreview] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<any>(null)
  const [showEditModal, setShowEditModal] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchPurchases()
  }, [])

  const fetchPurchases = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from("purchases")
        .select(`
          *,
          purchase_items(
            id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            products(name)
          )
        `)
        .order("purchase_date", { ascending: false })

      if (error) throw error
      setPurchases(data || [])
    } catch (error) {
      console.error("Error fetching purchases:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddPurchase = async () => {
    fetchPurchases()
    setShowForm(false)
  }

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setShowEditModal(true)
  }

  const handleViewBill = async (purchase: any) => {
    try {
      const billItems: BillItem[] = purchase.purchase_items.map((item: any) => ({
        product_name: item.products?.name || "Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }))

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

      setSelectedBill(bill)
      setShowBillPreview(true)
    } catch (error) {
      console.error("Error preparing bill:", error)
    }
  }

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm("Are you sure you want to delete this purchase?")) return

    try {
      const { error } = await supabase.from("purchases").delete().eq("id", purchaseId)

      if (error) throw error
      fetchPurchases()
    } catch (error) {
      console.error("Error deleting purchase:", error)
    }
  }

  const handleMultiDelete = async (purchaseIds: string[]) => {
    if (!confirm(`Delete ${purchaseIds.length} purchase(s)? This action cannot be undone.`)) return

    try {
      const { error } = await supabase.from("purchases").delete().in("id", purchaseIds)

      if (error) throw error
      fetchPurchases()
    } catch (error) {
      console.error("Error deleting purchases:", error)
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const matchesSearch =
      purchase.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customer_email.toLowerCase().includes(searchTerm.toLowerCase())

    if (!matchesSearch) return false

    if (dateRange.startDate || dateRange.endDate) {
      const purchaseDate = new Date(purchase.purchase_date)
      const purchaseDateOnly = new Date(purchaseDate.getFullYear(), purchaseDate.getMonth(), purchaseDate.getDate())

      if (dateRange.startDate) {
        const startDate = new Date(dateRange.startDate)
        if (purchaseDateOnly < startDate) return false
      }

      if (dateRange.endDate) {
        const endDate = new Date(dateRange.endDate)
        endDate.setHours(23, 59, 59, 999)
        if (purchaseDateOnly > endDate) return false
      }
    }

    return true
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Purchases & Billing</h1>
          <p className="text-gray-600 mt-1">Create and manage customer purchases with dynamic inventory updates</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4" />
          New Purchase
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Purchase</CardTitle>
            <CardDescription>Add products and generate bill for customer</CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseForm onSuccess={handleAddPurchase} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>Total purchases: {filteredPurchases.length}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="flex-1 min-w-xs">
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <DateRangeFilter dateRange={dateRange} onDateRangeChange={setDateRange} />
          </div>

          {isLoading ? (
            <div className="text-center py-8">Loading purchases...</div>
          ) : (
            <PurchaseTable
              purchases={filteredPurchases}
              onRefresh={fetchPurchases}
              onViewBill={handleViewBill}
              onDeletePurchase={handleDeletePurchase}
              onMultiDelete={handleMultiDelete}
              onEdit={handleEditPurchase}
            />
          )}
        </CardContent>
      </Card>

      <BillPreviewModal isOpen={showBillPreview} onClose={() => setShowBillPreview(false)} bill={selectedBill} />

      <EditPurchaseModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        purchase={editingPurchase}
        onSuccess={fetchPurchases}
      />
    </div>
  )
}
