"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import PurchaseForm from "@/components/purchases/purchase-form"
import PurchaseTable from "@/components/purchases/purchase-table"
import { Plus, Search } from "lucide-react"

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

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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
          local_companies (
            company_name,
            company_code
          ),
          purchase_items(
            id,
            product_id,
            quantity,
            unit_price,
            subtotal,
            products(name)
          ),
          import_purchase_items(
            id,
            import_product_id,
            quantity_packs,
            unit_price,
            subtotal,
            import_products(product_name)
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
    await fetchPurchases()
    setShowForm(false)
  }

  const handleViewBill = async (purchase: Purchase) => {
    // Implement bill preview modal here
    console.log("View bill for:", purchase)
  }

  const handleEditPurchase = (purchase: Purchase) => {
    // Implement edit modal here
    console.log("Edit purchase:", purchase)
  }

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!confirm("Are you sure you want to delete this purchase?")) return

    try {
      const { error } = await supabase.from("purchases").delete().eq("id", purchaseId)

      if (error) throw error
      await fetchPurchases()
    } catch (error) {
      console.error("Error deleting purchase:", error)
      alert("Failed to delete purchase")
    }
  }

  const handleMultiDelete = async (purchaseIds: string[]) => {
    if (!confirm(`Delete ${purchaseIds.length} purchase(s)? This action cannot be undone.`)) return

    try {
      const { error } = await supabase.from("purchases").delete().in("id", purchaseIds)

      if (error) throw error
      await fetchPurchases()
    } catch (error) {
      console.error("Error deleting purchases:", error)
      alert("Failed to delete purchases")
    }
  }

  const filteredPurchases = purchases.filter((purchase) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      purchase.customer_name.toLowerCase().includes(searchLower) ||
      purchase.customer_email?.toLowerCase().includes(searchLower) ||
      purchase.customer_phone?.includes(searchTerm)
    )
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
            <CardDescription>Add a new purchase transaction</CardDescription>
          </CardHeader>
          <CardContent>
            <PurchaseForm onSuccess={handleAddPurchase} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
     
      )}
      {/* {showForm && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] flex items-center scroll-auto justify-center">
    <Card className="relative z-[100] shadow-xl w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create New Purchase</CardTitle>
        <CardDescription>Add a new purchase transaction</CardDescription>
      </CardHeader>
      <CardContent>
        <PurchaseForm
          onSuccess={handleAddPurchase}
          onCancel={() => setShowForm(false)}
        />
      </CardContent>
    </Card>
  </div>
)} */}


      <Card>
        <CardHeader>
          <CardTitle>Purchase History</CardTitle>
          <CardDescription>
            Total purchases: {filteredPurchases.length}
            {searchTerm && ` (filtered from ${purchases.length})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 flex-wrap items-end">
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search by customer name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">Loading purchases...</p>
            </div>
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
    </div>
  )
}
