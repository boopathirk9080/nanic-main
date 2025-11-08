"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { X, Trash2, Plus } from "lucide-react"

interface Product {
  id: string
  name: string
  sku: string
  quantity: number
  unit_price: number
}

interface PurchaseItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface EditPurchaseModalProps {
  isOpen: boolean
  onClose: () => void
  purchase: any
  onSuccess: () => void
}

export default function EditPurchaseModal({ isOpen, onClose, purchase, onSuccess }: EditPurchaseModalProps) {
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
  const [originalItems, setOriginalItems] = useState<PurchaseItem[]>([])

  const supabase = createClient()

  useEffect(() => {
    if (isOpen && purchase) {
      fetchProducts()
      initializeForm()
    }
  }, [isOpen, purchase])

  const initializeForm = () => {
    setCustomerData({
      customer_name: purchase.customer_name || "",
      customer_email: purchase.customer_email || "",
      customer_phone: purchase.customer_phone || "",
      notes: purchase.notes || "",
    })

    const items =
      purchase.purchase_items?.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        product_name: item.products?.name || "Product",
        quantity: item.quantity,
        unit_price: item.unit_price,
        subtotal: item.subtotal,
      })) || []

    setPurchaseItems(items)
    setOriginalItems(items)
  }

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

  const handleAddItem = () => {
    if (!selectedProduct) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const existingItem = purchaseItems.find((item) => item.product_id === selectedProduct)

    if (existingItem) {
      const newQuantity = existingItem.quantity + selectedQuantity
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
          id: `new-${Date.now()}`,
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

  const handleRemoveItem = (itemId: string) => {
    setPurchaseItems(purchaseItems.filter((item) => item.id !== itemId))
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId)
      return
    }

    setPurchaseItems(
      purchaseItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity: newQuantity,
              subtotal: newQuantity * item.unit_price,
            }
          : item,
      ),
    )
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
      const totalAmount = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)

      const { error: updateError } = await supabase
        .from("purchases")
        .update({
          customer_name: customerData.customer_name,
          customer_email: customerData.customer_email,
          customer_phone: customerData.customer_phone,
          notes: customerData.notes,
          total_amount: totalAmount,
        })
        .eq("id", purchase.id)

      if (updateError) throw updateError

      const itemsToDelete = originalItems.filter((orig) => !purchaseItems.find((curr) => curr.id === orig.id))

      for (const item of itemsToDelete) {
        await supabase.from("purchase_items").delete().eq("id", item.id)
      }

      for (const item of purchaseItems) {
        if (item.id.startsWith("new-")) {
          // New item - insert it
          await supabase.from("purchase_items").insert([
            {
              purchase_id: purchase.id,
              product_id: item.product_id,
              quantity: item.quantity,
              unit_price: item.unit_price,
              subtotal: item.subtotal,
            },
          ])
        } else {
          // Existing item - update it
          const originalItem = originalItems.find((o) => o.id === item.id)
          if (originalItem && originalItem.quantity !== item.quantity) {
            await supabase
              .from("purchase_items")
              .update({
                quantity: item.quantity,
                subtotal: item.subtotal,
              })
              .eq("id", item.id)
          }
        }
      }

      alert("Purchase updated successfully!")
      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating purchase:", error)
      alert("Error updating purchase. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const totalAmount = purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between sticky top-0 bg-white border-b">
          <CardTitle>Edit Purchase</CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6">
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
                <CardTitle className="text-lg">Edit Products</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="product">Product</Label>
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
                          {product.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity</Label>
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
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-2">{item.product_name}</td>
                            <td className="text-right py-2">${item.unit_price.toFixed(2)}</td>
                            <td className="text-right py-2">
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-20 text-right"
                              />
                            </td>
                            <td className="text-right py-2 font-semibold">${item.subtotal.toFixed(2)}</td>
                            <td className="text-center py-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => handleRemoveItem(item.id)}
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
            <div className="flex gap-2 justify-end border-t pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="bg-blue-600 hover:bg-blue-700">
                {isLoading ? "Updating Purchase..." : "Update Purchase"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
