"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  unit_price: number
}

interface PurchaseItem {
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface PurchaseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

export default function PurchaseForm({ onSuccess, onCancel }: PurchaseFormProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const [customerData, setCustomerData] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
  })
  const [selectedProduct, setSelectedProduct] = useState<string>("")
  const [selectedQuantity, setSelectedQuantity] = useState<number>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
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
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setIsLoadingProducts(true)
      const { data, error } = await supabase.from("products").select("*").order("name")

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error("Error fetching products:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerData.customer_name) {
      alert("Please enter customer name")
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
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      }))

      const { error: itemsError } = await supabase.from("purchase_items").insert(itemsToInsert)

      if (itemsError) throw itemsError

      // Update product quantities dynamically
      for (const item of purchaseItems) {
        const product = products.find((p) => p.id === item.product_id)
        if (product) {
          const newQuantity = product.quantity - item.quantity
          const { error: updateError } = await supabase
            .from("products")
            .update({ quantity: newQuantity })
            .eq("id", item.product_id)

          if (updateError) throw updateError
        }
      }

      alert("Purchase created successfully!")
      onSuccess()
    } catch (error) {
      console.error("Error creating purchase:", error)
      alert("Error creating purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)

  const handleAddItem = () => {
    if (!selectedProduct) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    if (selectedQuantity > product.quantity) {
      alert(`Only ${product.quantity} units available`)
      return
    }

    const existingItem = purchaseItems.find((item) => item.product_id === selectedProduct)

    if (existingItem) {
      const newQuantity = existingItem.quantity + selectedQuantity
      if (newQuantity > product.quantity) {
        alert(`Only ${product.quantity} units available`)
        return
      }
      setPurchaseItems(
        purchaseItems.map((item) =>
          item.product_id === selectedProduct
            ? {
                ...item,
                quantity: newQuantity,
                subtotal: newQuantity * item.unit_price,
              }
            : item,
        ),
      )
    } else {
      setPurchaseItems([
        ...purchaseItems,
        {
          product_id: selectedProduct,
          product_name: product.name,
          quantity: selectedQuantity,
          unit_price: product.unit_price,
          subtotal: selectedQuantity * product.unit_price,
        },
      ])
    }

    setSelectedProduct("")
    setSelectedQuantity(1)
  }

  const handleRemoveItem = (productId: string) => {
    setPurchaseItems(purchaseItems.filter((item) => item.product_id !== productId))
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    const product = products.find((p) => p.id === productId)
    if (!product) return

    if (newQuantity > product.quantity) {
      alert(`Only ${product.quantity} units available`)
      return
    }

    if (newQuantity <= 0) {
      handleRemoveItem(productId)
      return
    }

    setPurchaseItems(
      purchaseItems.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: newQuantity,
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

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Products</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                disabled={isLoadingProducts}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a product</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} (Stock: {product.quantity})
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
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
                    <th className="text-right py-2">Unit Price</th>
                    <th className="text-right py-2">Quantity</th>
                    <th className="text-right py-2">Subtotal</th>
                    <th className="text-center py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {purchaseItems.map((item) => (
                    <tr key={item.product_id} className="border-b hover:bg-gray-50">
                      <td className="py-2">{item.product_name}</td>
                      <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                      <td className="text-right py-2">
                        <Input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleQuantityChange(item.product_id, Number.parseInt(e.target.value) || 1)}
                          className="w-20 text-right"
                        />
                      </td>
                      <td className="text-right py-2 font-semibold">${item.subtotal.toFixed(2)}</td>
                      <td className="text-center py-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveItem(item.product_id)}
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
                  <p className="text-3xl font-bold text-blue-600">${totalAmount.toFixed(2)}</p>
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
        <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
          {isLoading ? "Creating Purchase..." : "Create Purchase"}
        </Button>
      </div>
    </form>
  )
}
