"use client"
import { useState, useEffect } from "react"
import { X, Plus, Trash2, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface PurchaseFormProps {
  onSuccess: () => void
  onCancel: () => void
}

interface Product {
  id: string
  name: string
  sku: string
  strip_count: number
  per_strip_tablet_count: number
  selling_price: number
  total_tablets: number
}

interface ImportProduct {
  id: string
  product_name: string
  strip_count: number
  per_strip_tablet_count: number
  import_price: number
  company_id: string
  companies?: {
    company_name: string
  }
}

interface LocalCompany {
  id: string
  company_name: string
  company_code: string
}

interface PurchaseItem {
  id: string
  product_id: string
  product_name: string
  quantity: number
  available_stock: number
  unit_price: number
  subtotal: number
}

export default function PurchaseForm({ onSuccess, onCancel }: PurchaseFormProps) {
  const [isImportPurchase, setIsImportPurchase] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [importProducts, setImportProducts] = useState<ImportProduct[]>([])
  const [localCompanies, setLocalCompanies] = useState<LocalCompany[]>([])
  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | ImportProduct | null>(null)
  const [tempStripCount, setTempStripCount] = useState("")

  const [customerInfo, setCustomerInfo] = useState({
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    notes: "",
  })

  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
  const supabase = createClient()

  useEffect(() => {
    fetchData()
  }, [isImportPurchase])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isImportPurchase) {
        // Fetch import products with company info
        const { data: importProds, error: importError } = await supabase
          .from("import_products")
          .select(`
            *,
            companies (
              company_name
            )
          `)
          .eq("user_id", user.id)
          .gt("strip_count", 0)
          .order("product_name")

        if (importError) throw importError
        setImportProducts(importProds || [])

        // Fetch local companies
        const { data: companies, error: compError } = await supabase
          .from("local_companies")
          .select("*")
          .eq("user_id", user.id)
          .order("company_name")

        if (compError) throw compError
        setLocalCompanies(companies || [])
      } else {
        // Fetch local products
        const { data: localProds, error: localError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .gt("strip_count", 0)
          .order("name")

        if (localError) throw localError
        setProducts(localProds || [])
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      alert("Failed to load data")
    }
  }

  const handleSelectProduct = (product: Product | ImportProduct) => {
    setSelectedProduct(product)
    setTempStripCount("1")
  }

  const handleAddSelectedProduct = () => {
    if (!selectedProduct || !tempStripCount) return

    const stripCount = parseInt(tempStripCount)
    if (stripCount < 1) {
      alert("Strip count must be at least 1")
      return
    }

    if (stripCount > selectedProduct.strip_count) {
      alert(`Only ${selectedProduct.strip_count} strips available in stock!`)
      return
    }

    const existingItem = purchaseItems.find((item) => item.product_id === selectedProduct.id)
    if (existingItem) {
      alert("Product already added. Update quantity in the list below.")
      return
    }

    const unitPrice = isImportPurchase 
      ? (selectedProduct as ImportProduct).import_price 
      : (selectedProduct as Product).selling_price

    const newItem: PurchaseItem = {
      id: Math.random().toString(36).substr(2, 9),
      product_id: selectedProduct.id,
      product_name: isImportPurchase 
        ? (selectedProduct as ImportProduct).product_name 
        : (selectedProduct as Product).name,
      quantity: stripCount,
      available_stock: selectedProduct.strip_count,
      unit_price: unitPrice,
      subtotal: stripCount * unitPrice,
    }

    setPurchaseItems([...purchaseItems, newItem])
    setSearchTerm("")
    setSelectedProduct(null)
    setTempStripCount("")
  }

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return

    setPurchaseItems(
      purchaseItems.map((item) => {
        if (item.id === itemId) {
          if (quantity > item.available_stock) {
            alert(`Only ${item.available_stock} strips available in stock!`)
            return item
          }
          return {
            ...item,
            quantity,
            subtotal: quantity * item.unit_price,
          }
        }
        return item
      })
    )
  }

  const handleUpdatePrice = (itemId: string, price: number) => {
    if (price < 0) return

    setPurchaseItems(
      purchaseItems.map((item) => {
        if (item.id === itemId) {
          return {
            ...item,
            unit_price: price,
            subtotal: item.quantity * price,
          }
        }
        return item
      })
    )
  }

  const handleRemoveItem = (itemId: string) => {
    setPurchaseItems(purchaseItems.filter((item) => item.id !== itemId))
  }

  const calculateTotal = () => {
    return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)
  }

  const handleSubmit = async () => {
    if (!customerInfo.customer_name.trim()) {
      alert("Please enter customer name")
      return
    }

    if (purchaseItems.length === 0) {
      alert("Please add at least one product")
      return
    }

    if (isImportPurchase && !selectedCompanyId) {
      alert("Please select a local company for import purchase")
      return
    }

    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      // Create purchase record
      const purchaseData = {
        user_id: user.id,
        customer_name: customerInfo.customer_name,
        customer_email: customerInfo.customer_email || null,
        customer_phone: customerInfo.customer_phone || null,
        purchase_date: new Date().toISOString(),
        total_amount: calculateTotal(),
        status: "completed",
        notes: customerInfo.notes || null,
        purchase_type: isImportPurchase ? "import" : "local",
        local_company_id: isImportPurchase ? selectedCompanyId : null,
      }

      const { data: purchase, error: purchaseError } = await supabase
        .from("purchases")
        .insert([purchaseData])
        .select()
        .single()

      if (purchaseError) throw purchaseError

      // Insert purchase items and update inventory
      if (isImportPurchase) {
        // Handle import purchase items - INSERT INTO import_purchase_items TABLE
        const importItems = purchaseItems.map((item) => ({
          purchase_id: purchase.id,
          import_product_id: item.product_id,
          quantity_packs: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }))

        const { error: itemsError } = await supabase
          .from("import_purchase_items")
          .insert(importItems)

        if (itemsError) throw itemsError

        // Update import_products strip_count (reduce inventory)
        for (const item of purchaseItems) {
          const { data: currentProduct, error: fetchError } = await supabase
            .from("import_products")
            .select("strip_count")
            .eq("id", item.product_id)
            .single()

          if (fetchError) throw fetchError

          const newStripCount = currentProduct.strip_count - item.quantity

          const { error: updateError } = await supabase
            .from("import_products")
            .update({ 
              strip_count: newStripCount,
              updated_at: new Date().toISOString()
            })
            .eq("id", item.product_id)

          if (updateError) throw updateError
        }
      } else {
        // Handle local purchase items - INSERT INTO purchase_items TABLE (NOT purchases!)
        const localItems = purchaseItems.map((item) => ({
          purchase_id: purchase.id,
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }))

        const { error: itemsError } = await supabase
          .from("purchase_items")  // FIXED: Changed from "purchases" to "purchase_items"
          .insert(localItems)

        if (itemsError) throw itemsError

        // Update products strip_count (reduce inventory)
        for (const item of purchaseItems) {
          const { data: currentProduct, error: fetchError } = await supabase
            .from("products")
            .select("strip_count")
            .eq("id", item.product_id)
            .single()

          if (fetchError) throw fetchError

          const newStripCount = currentProduct.strip_count - item.quantity

          const { error: updateError } = await supabase
            .from("products")
            .update({ 
              strip_count: newStripCount,
              updated_at: new Date().toISOString()
            })
            .eq("id", item.product_id)

          if (updateError) throw updateError
        }
      }

      alert("Purchase created successfully!")
      onSuccess()
    } catch (error: any) {
      console.error("Error creating purchase:", error)
      alert(`Failed to create purchase: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = isImportPurchase
    ? importProducts.filter((p) =>
        p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase())
      )

  return (
    <div className="space-y-6  ">
      {/* Toggle for Purchase Type */}
      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
        <div>
          <h3 className="font-semibold text-lg">Purchase Type</h3>
          <p className="text-sm text-gray-600">
            {isImportPurchase ? "Import Products Billing" : "Local Products Billing"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setIsImportPurchase(!isImportPurchase)
            setPurchaseItems([])
            setSelectedCompanyId("")
          }}
          className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
            isImportPurchase ? "bg-blue-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
              isImportPurchase ? "translate-x-9" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">
                Customer Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="customer_name"
                value={customerInfo.customer_name}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, customer_name: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="customer_email">Customer Email</Label>
              <Input
                id="customer_email"
                type="email"
                value={customerInfo.customer_email}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, customer_email: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="customer_phone">Customer Phone</Label>
              <Input
                id="customer_phone"
                value={customerInfo.customer_phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, customer_phone: e.target.value })
                }
              />
            </div>
            {isImportPurchase && (
              <div>
                <Label htmlFor="local_company">
                  Local Company <span className="text-red-500">*</span>
                </Label>
                <select
                  id="local_company"
                  value={selectedCompanyId}
                  onChange={(e) => setSelectedCompanyId(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select Company</option>
                  {localCompanies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.company_name} ({company.company_code})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={customerInfo.notes}
              onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Product Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Add Products</CardTitle>
          <CardDescription>
            Search and add {isImportPurchase ? "import" : "local"} products to the purchase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Label htmlFor="product_search">Search Product</Label>
              <Input
                id="product_search"
                placeholder={`Search ${isImportPurchase ? "import" : "local"} products...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-32">
              <Label htmlFor="strip_count">Strip Count</Label>
              <Input
                id="strip_count"
                type="number"
                min="1"
                placeholder="Strips"
                value={tempStripCount}
                onChange={(e) => setTempStripCount(e.target.value)}
              />
            </div>
            <Button
              type="button"
              onClick={handleAddSelectedProduct}
              disabled={!selectedProduct || !tempStripCount || parseInt(tempStripCount) < 1}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </div>

          {searchTerm && filteredProducts.length > 0 && (
            <div className="border rounded-md max-h-60 overflow-y-auto">
              {filteredProducts.map((product) => {
                const productPrice = isImportPurchase 
                  ? (product as ImportProduct).import_price 
                  : (product as Product).selling_price
                const productName = isImportPurchase
                  ? (product as ImportProduct).product_name
                  : (product as Product).name

                return (
                  <div
                    key={product.id}
                    className={`p-3 cursor-pointer border-b last:border-b-0 flex justify-between items-center transition-colors ${
                      selectedProduct?.id === product.id
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => handleSelectProduct(product)}
                  >
                    <div>
                      <p className="font-medium">{productName}</p>
                      {!isImportPurchase && (
                        <p className="text-sm text-gray-500">SKU: {(product as Product).sku}</p>
                      )}
                      {isImportPurchase && (product as ImportProduct).companies && (
                        <p className="text-sm text-gray-500">
                          Company: {(product as ImportProduct).companies?.company_name}
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        Available Stock: {product.strip_count} strips | Price: $
                        {productPrice.toFixed(2)}/strip
                      </p>
                    </div>
                    {selectedProduct?.id === product.id && (
                      <div className="text-blue-600 font-semibold">Selected</div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {searchTerm && filteredProducts.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              No products found. Try a different search term.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Purchase Items */}
      {purchaseItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Bill Summary ({purchaseItems.length} items)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="text-left p-3 font-semibold">Product Name</th>
                      <th className="text-center p-3 font-semibold">Strip Count</th>
                      <th className="text-right p-3 font-semibold">Price/Strip</th>
                      <th className="text-right p-3 font-semibold">Amount</th>
                      <th className="text-center p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {purchaseItems.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="p-3">
                          <p className="font-medium">{item.product_name}</p>
                          <p className="text-xs text-gray-500">Available: {item.available_stock} strips</p>
                        </td>
                        <td className="p-3">
                          <Input
                            type="number"
                            min="1"
                            max={item.available_stock}
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
                            }
                            className="w-20 mx-auto text-center h-8"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={item.unit_price}
                            onChange={(e) =>
                              handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)
                            }
                            className="w-24 ml-auto text-right h-8"
                          />
                        </td>
                        <td className="p-3 text-right">
                          <p className="font-semibold text-blue-600 text-lg">
                            ${item.subtotal.toFixed(2)}
                          </p>
                        </td>
                        <td className="p-3 text-center">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.id)}
                            className="hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-blue-50 border-t-2 border-blue-200">
                    <tr>
                      <td colSpan={3} className="p-4 text-right font-bold text-lg">
                        Total Bill Amount:
                      </td>
                      <td className="p-4 text-right font-bold text-2xl text-blue-600">
                        ${calculateTotal().toFixed(2)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={isLoading || purchaseItems.length === 0}
          className="bg-blue-600 hover:bg-blue-700 gap-2"
        >
          {isLoading ? (
            "Processing..."
          ) : (
            <>
              <ShoppingCart className="w-4 h-4" />
              Create Purchase
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

