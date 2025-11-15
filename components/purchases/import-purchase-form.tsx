"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

interface Company {
  id: string
  company_name: string
  company_code: string
}

interface ImportProduct {
  id: string
  product_name: string
  brand_code: string
  stock_packs: number
  import_price: number
  company_id: string
}

interface PurchaseItem {
  import_product_id: string
  product_name: string
  brand_code: string
  quantity_packs: number
  unit_price: number
  subtotal: number
}

interface ImportPurchaseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function ImportPurchaseForm({ onSuccess, onCancel }: ImportPurchaseFormProps) {
  const [companies, setCompanies] = useState<Company[]>([])
  const [importProducts, setImportProducts] = useState<ImportProduct[]>([])
  const [filteredProducts, setFilteredProducts] = useState<ImportProduct[]>([])
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
  })
  const [selectedCompany, setSelectedCompany] = useState<string>("")
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [userId, setUserId] = useState<string>("")

  const supabase = createClient()

  useEffect(() => {
    const getCurrentUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
      }
    }
    getCurrentUser()
    fetchData()
  }, [])

  useEffect(() => {
    if (selectedCompany) {
      const filtered = importProducts.filter((p) => p.company_id === selectedCompany)
      setFilteredProducts(filtered)
      setSelectedProduct("")
    } else {
      setFilteredProducts([])
    }
  }, [selectedCompany, importProducts])

  const fetchData = async () => {
    try {
      setIsLoadingData(true)
      
      // Fetch companies
      const { data: companiesData, error: companiesError } = await supabase
        .from("companies")
        .select("*")
        .order("company_name")

      if (companiesError) throw companiesError

      // Fetch import products
      const { data: productsData, error: productsError } = await supabase
        .from("import_products")
        .select("*")
        .order("product_name")

      if (productsError) throw productsError

      setCompanies(companiesData || [])
      setImportProducts(productsData || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setIsLoadingData(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerData.customer_name) {
      alert("Please enter customer name")
      return
    }

    if (!selectedCompany) {
      alert("Please select a company")
      return
    }

    if (purchaseItems.length === 0) {
      alert("Please add at least one product")
      return
    }

    setIsLoading(true)

    try {
      const { data: purchaseData, error: purchaseError } = await supabase
        .from("purchases")
        .insert([
          {
            user_id: userId,
            purchase_type: 'import',
            company_id: selectedCompany,
            customer_name: customerData.customer_name,
            customer_email: customerData.customer_email,
            customer_phone: customerData.customer_phone,
            total_amount: totalAmount,
            notes: customerData.notes,
            status: "completed",
          },
        ])
        .select()

      if (purchaseError) throw purchaseError

      const purchaseId = purchaseData[0].id

      const itemsToInsert = purchaseItems.map((item) => ({
        purchase_id: purchaseId,
        import_product_id: item.import_product_id,
        quantity_packs: item.quantity_packs,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }))

      const { error: itemsError } = await supabase.from("import_purchase_items").insert(itemsToInsert)

      if (itemsError) throw itemsError

      alert("Import purchase created successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error creating import purchase:", error)
      alert("Error creating purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleAddItem = () => {
    if (!selectedProduct) return

    const product = importProducts.find((p) => p.id === selectedProduct)
    if (!product) return

    if (selectedQuantity > product.stock_packs) {
      alert(`Only ${product.stock_packs} packs available`)
      return
    }

    const existingItem = purchaseItems.find((item) => item.import_product_id === selectedProduct)

    if (existingItem) {
      const newQuantity = existingItem.quantity_packs + selectedQuantity
      if (newQuantity > product.stock_packs) {
        alert(`Only ${product.stock_packs} packs available`)
        return
      }
      setPurchaseItems(
        purchaseItems.map((item) =>
          item.import_product_id === selectedProduct
            ? {
                ...item,
                quantity_packs: newQuantity,
                subtotal: newQuantity * item.unit_price,
              }
            : item,
        ),
      )
    } else {
      setPurchaseItems([
        ...purchaseItems,
        {
          import_product_id: selectedProduct,
          product_name: product.product_name,
          brand_code: product.brand_code,
          quantity_packs: selectedQuantity,
          unit_price: product.import_price,
          subtotal: selectedQuantity * product.import_price,
        },
      ])
    }

    setSelectedProduct("")
    setSelectedQuantity(1)
  }

  const handleRemoveItem = (productId: string) => {
    setPurchaseItems(purchaseItems.filter((item) => item.import_product_id !== productId))
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = importProducts.find((p) => p.id === productId)
    if (!product) return

    if (newQuantity > product.stock_packs) {
      alert(`Only ${product.stock_packs} packs available`)
      return
    }

    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }

    setPurchaseItems(
      purchaseItems.map((item) =>
        item.import_product_id === productId
          ? {
              ...item,
              quantity_packs: newQuantity,
              subtotal: newQuantity * item.unit_price,
            }
          : item,
      ),
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Customer Information */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="customer_name">Customer Name *</Label>
          <Input
            id="customer_name"
            required
            value={customerData.customer_name}
            onChange={(e) => setCustomerData({ ...customerData, customer_name: e.target.value })}
            placeholder="John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_email">Email</Label>
          <Input
            id="customer_email"
            type="email"
            value={customerData.customer_email}
            onChange={(e) => setCustomerData({ ...customerData, customer_email: e.target.value })}
            placeholder="john@example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customer_phone">Phone</Label>
          <Input
            id="customer_phone"
            value={customerData.customer_phone}
            onChange={(e) => setCustomerData({ ...customerData, customer_phone: e.target.value })}
            placeholder="+1 (555) 000-0000"
          />
        </div>
      </div>

      {/* Company Selection */}
      <div className="space-y-2">
        <Label htmlFor="company">Company *</Label>
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          disabled={isLoadingData}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        >
          <option value="">Select a company</option>
          {companies.map((company) => (
            <option key={company.id} value={company.id}>
              {company.company_name} ({company.company_code})
            </option>
          ))}
        </select>
      </div>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Import Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={!selectedCompany || isLoadingData}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">
                  {selectedCompany ? "Select a product" : "Select company first"}
                </option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.product_name} - {product.brand_code} (Stock: {product.stock_packs} packs)
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity (Packs) *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(Number.parseInt(e.target.value) || 1)}
              />
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedProduct}
                className="w-full gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            </div>
          </div>

          {/* Purchase Items Table */}
          {purchaseItems.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Product</th>
                    <th className="text-left py-2">Brand Code</th>
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Quantity (Packs)</th>
                    <th className="text-right py-2">Subtotal</th>
                    <th className="text-center py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item) => (
                    <tr key={item.import_product_id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{item.product_name}</td>
                      <td className="py-2 text-sm text-gray-600">{item.brand_code}</td>
                      <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity_packs}
                          onChange={(e) =>
                            handleQuantityChange(item.import_product_id, Number.parseInt(e.target.value) || 1)
                          }
                          className="w-20 text-right"
                        />
                      </td>
                      <td className="text-right py-2 font-semibold">${item.subtotal.toFixed(2)}</td>
                      <td className="text-center py-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveItem(item.import_product_id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total */}
              <div className="mt-4 flex justify-end">
                <div className="text-right">
                  <p className="text-gray-600">Total Amount:</p>
                  <p className="text-3xl font-bold text-green-600">${totalAmount.toFixed(2)}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <textarea
          id="notes"
          value={customerData.notes}
          onChange={(e) => setCustomerData({ ...customerData, notes: e.target.value })}
          placeholder="Additional notes..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="bg-green-600 hover:bg-green-700">
          {isLoading ? "Creating Purchase..." : "Create Import Purchase"}
        </Button>
      </div>
    </form>
  )
}