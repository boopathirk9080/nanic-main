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
  editData?: any
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
  original_quantity: number // Track original quantity for inventory adjustment
  available_stock: number
  unit_price: number
  subtotal: number
}

export default function PurchaseForm({ onSuccess, onCancel, editData }: PurchaseFormProps) {
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
    if (editData) {
      // Populate form with edit data
      setIsImportPurchase(editData.purchase_type === 'import')
      setCustomerInfo({
        customer_name: editData.customer_name || "",
        customer_email: editData.customer_email || "",
        customer_phone: editData.customer_phone || "",
        notes: editData.notes || "",
      })
      setSelectedCompanyId(editData.local_company_id || "")

      // Populate purchase items with ORIGINAL QUANTITY tracking
      if (editData.purchase_type === 'local' && editData.purchase_items) {
        const items = editData.purchase_items.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          product_name: item.products?.name || "Product",
          quantity: item.quantity,
          original_quantity: item.quantity, // Store original for comparison
          available_stock: item.quantity, // Will be updated when products load
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }))
        setPurchaseItems(items)
      } else if (editData.purchase_type === 'import' && editData.import_purchase_items) {
        const items = editData.import_purchase_items.map((item: any) => ({
          id: item.id,
          product_id: item.import_product_id,
          product_name: item.import_products?.product_name || "Product",
          quantity: item.quantity_packs,
          original_quantity: item.quantity_packs, // Store original for comparison
          available_stock: item.quantity_packs,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
        }))
        setPurchaseItems(items)
      }
    }
  }, [editData])

  useEffect(() => {
    fetchData()
  }, [isImportPurchase])

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      if (isImportPurchase) {
        const { data: importProds, error: importError } = await supabase
          .from("import_products")
          .select(`
            *,
            companies (
              company_name
            )
          `)
          .eq("user_id", user.id)
          .order("product_name")

        if (importError) throw importError
        setImportProducts(importProds || [])

        // Update available stock for existing items in edit mode
        if (editData && editData.purchase_type === 'import') {
          setPurchaseItems(prevItems =>
            prevItems.map(item => {
              const product = importProds?.find((p: ImportProduct) => p.id === item.product_id)
              if (product) {
                // Available stock = current stock + original quantity from this purchase
                return {
                  ...item,
                  available_stock: product.strip_count + item.original_quantity
                }
              }
              return item
            })
          )
        }

        const { data: companies, error: compError } = await supabase
          .from("local_companies")
          .select("*")
          .eq("user_id", user.id)
          .order("company_name")

        if (compError) throw compError
        setLocalCompanies(companies || [])
      } else {
        const { data: localProds, error: localError } = await supabase
          .from("products")
          .select("*")
          .eq("user_id", user.id)
          .order("name")

        if (localError) throw localError
        setProducts(localProds || [])

        // Update available stock for existing items in edit mode
        if (editData && editData.purchase_type === 'local') {
          setPurchaseItems(prevItems =>
            prevItems.map(item => {
              const product = localProds?.find((p: Product) => p.id === item.product_id)
              if (product) {
                // Available stock = current stock + original quantity from this purchase
                return {
                  ...item,
                  available_stock: product.strip_count + item.original_quantity
                }
              }
              return item
            })
          )
        }
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
      original_quantity: 0, // New item, so original is 0
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

      if (editData) {
        // ============ UPDATE EXISTING PURCHASE ============
        const purchaseData = {
          customer_name: customerInfo.customer_name,
          customer_email: customerInfo.customer_email || null,
          customer_phone: customerInfo.customer_phone || null,
          total_amount: calculateTotal(),
          notes: customerInfo.notes || null,
          local_company_id: isImportPurchase ? selectedCompanyId : null,
          updated_at: new Date().toISOString()
        }

        const { error: updateError } = await supabase
          .from("purchases")
          .update(purchaseData)
          .eq("id", editData.id)

        if (updateError) throw updateError

        // Process inventory adjustments based on quantity changes
        if (isImportPurchase) {
          // Delete old import purchase items
          await supabase.from("import_purchase_items").delete().eq("purchase_id", editData.id)

          // Insert new/updated items
          const importItems = purchaseItems.map((item) => ({
            purchase_id: editData.id,
            import_product_id: item.product_id,
            quantity_packs: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          }))

          const { error: itemsError } = await supabase
            .from("import_purchase_items")
            .insert(importItems)

          if (itemsError) throw itemsError

          // Adjust inventory: Restore original quantities, then deduct new quantities
          for (const item of purchaseItems) {
            const { data: currentProduct, error: fetchError } = await supabase
              .from("import_products")
              .select("strip_count")
              .eq("id", item.product_id)
              .single()

            if (fetchError) throw fetchError

            // Calculate the difference: 
            // If quantity increased: deduct more from stock
            // If quantity decreased: add back to stock
            const quantityDifference = item.quantity - item.original_quantity
            const newStripCount = currentProduct.strip_count - quantityDifference

            if (newStripCount < 0) {
              throw new Error(`Insufficient stock for product ${item.product_name}`)
            }

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
          // Delete old local purchase items
          await supabase.from("purchase_items").delete().eq("purchase_id", editData.id)

          // Insert new/updated items
          const localItems = purchaseItems.map((item) => ({
            purchase_id: editData.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          }))

          const { error: itemsError } = await supabase
            .from("purchase_items")
            .insert(localItems)

          if (itemsError) throw itemsError

          // Adjust inventory: Restore original quantities, then deduct new quantities
          for (const item of purchaseItems) {
            const { data: currentProduct, error: fetchError } = await supabase
              .from("products")
              .select("strip_count")
              .eq("id", item.product_id)
              .single()

            if (fetchError) throw fetchError

            // Calculate the difference
            const quantityDifference = item.quantity - item.original_quantity
            const newStripCount = currentProduct.strip_count - quantityDifference

            if (newStripCount < 0) {
              throw new Error(`Insufficient stock for product ${item.product_name}`)
            }

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

        alert("Purchase updated successfully!")
      } else {
        // ============ CREATE NEW PURCHASE ============
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

        if (isImportPurchase) {
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

          // Deduct from inventory
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
          const localItems = purchaseItems.map((item) => ({
            purchase_id: purchase.id,
            product_id: item.product_id,
            quantity: item.quantity,
            unit_price: item.unit_price,
            subtotal: item.subtotal,
          }))

          const { error: itemsError } = await supabase
            .from("purchase_items")
            .insert(localItems)

          if (itemsError) throw itemsError

          // Deduct from inventory
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
      }

      onSuccess()
    } catch (error: any) {
      console.error("Error saving purchase:", error)
      alert(`Failed to save purchase: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProducts = isImportPurchase
    ? importProducts.filter((p) => {
        const searchLower = searchTerm.toLowerCase()
        // Show products with stock OR products already in the purchase (for editing)
        const isInPurchase = editData && purchaseItems.some(item => item.product_id === p.id)
        return (p.strip_count > 0 || isInPurchase) && 
               p.product_name.toLowerCase().includes(searchLower)
      })
    : products.filter((p) => {
        const searchLower = searchTerm.toLowerCase()
        const isInPurchase = editData && purchaseItems.some(item => item.product_id === p.id)
        return (p.strip_count > 0 || isInPurchase) &&
               (p.name.toLowerCase().includes(searchLower) ||
                p.sku.toLowerCase().includes(searchLower))
      })

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
      {!editData && (
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
      )}

      {editData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900">
            📝 Editing Mode: {isImportPurchase ? 'Import' : 'Local'} Purchase
          </p>
          <p className="text-xs text-blue-700 mt-1">
            You can add/remove products and adjust quantities. Inventory will be updated automatically.
          </p>
        </div>
      )}

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

      {/* Product Selection - Always show in edit mode too */}
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
                const isAlreadyAdded = purchaseItems.some(item => item.product_id === product.id)

                return (
                  <div
                    key={product.id}
                    className={`p-3 cursor-pointer border-b last:border-b-0 flex justify-between items-center transition-colors ${
                      selectedProduct?.id === product.id
                        ? "bg-blue-50 border-l-4 border-l-blue-600"
                        : isAlreadyAdded
                        ? "bg-gray-100 cursor-not-allowed"
                        : "hover:bg-gray-50"
                    }`}
                    onClick={() => !isAlreadyAdded && handleSelectProduct(product)}
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
                    {isAlreadyAdded && (
                      <div className="text-gray-500 text-sm">Already Added</div>
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
                          <p className="text-xs text-gray-500">
                            Available: {item.available_stock} strips
                            {editData && item.original_quantity > 0 && (
                              <span className="ml-2 text-blue-600">
                                (Original: {item.original_quantity})
                              </span>
                            )}
                          </p>
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

      <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 pb-2">
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
              {editData ? "Update Purchase" : "Create Purchase"}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}






// "use client"
// import { useState, useEffect } from "react"
// import { X, Plus, Trash2, ShoppingCart } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { createClient } from "@/lib/supabase/client"

// interface PurchaseFormProps {
//   onSuccess: () => void
//   onCancel: () => void
// }

// interface Product {
//   id: string
//   name: string
//   sku: string
//   strip_count: number
//   per_strip_tablet_count: number
//   selling_price: number
//   total_tablets: number
// }

// interface ImportProduct {
//   id: string
//   product_name: string
//   strip_count: number
//   per_strip_tablet_count: number
//   import_price: number
//   company_id: string
//   companies?: {
//     company_name: string
//   }
// }

// interface LocalCompany {
//   id: string
//   company_name: string
//   company_code: string
// }

// interface PurchaseItem {
//   id: string
//   product_id: string
//   product_name: string
//   quantity: number
//   available_stock: number
//   unit_price: number
//   subtotal: number
// }

// export default function PurchaseForm({ onSuccess, onCancel }: PurchaseFormProps) {
//   const [isImportPurchase, setIsImportPurchase] = useState(false)
//   const [products, setProducts] = useState<Product[]>([])
//   const [importProducts, setImportProducts] = useState<ImportProduct[]>([])
//   const [localCompanies, setLocalCompanies] = useState<LocalCompany[]>([])
//   const [selectedCompanyId, setSelectedCompanyId] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedProduct, setSelectedProduct] = useState<Product | ImportProduct | null>(null)
//   const [tempStripCount, setTempStripCount] = useState("")

//   const [customerInfo, setCustomerInfo] = useState({
//     customer_name: "",
//     customer_email: "",
//     customer_phone: "",
//     notes: "",
//   })

//   const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
//   const supabase = createClient()

//   useEffect(() => {
//     fetchData()
//   }, [isImportPurchase])

//   const fetchData = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) return

//       if (isImportPurchase) {
//         // Fetch import products with company info
//         const { data: importProds, error: importError } = await supabase
//           .from("import_products")
//           .select(`
//             *,
//             companies (
//               company_name
//             )
//           `)
//           .eq("user_id", user.id)
//           .gt("strip_count", 0)
//           .order("product_name")

//         if (importError) throw importError
//         setImportProducts(importProds || [])

//         // Fetch local companies
//         const { data: companies, error: compError } = await supabase
//           .from("local_companies")
//           .select("*")
//           .eq("user_id", user.id)
//           .order("company_name")

//         if (compError) throw compError
//         setLocalCompanies(companies || [])
//       } else {
//         // Fetch local products
//         const { data: localProds, error: localError } = await supabase
//           .from("products")
//           .select("*")
//           .eq("user_id", user.id)
//           .gt("strip_count", 0)
//           .order("name")

//         if (localError) throw localError
//         setProducts(localProds || [])
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       alert("Failed to load data")
//     }
//   }

//   const handleSelectProduct = (product: Product | ImportProduct) => {
//     setSelectedProduct(product)
//     setTempStripCount("1")
//   }

//   const handleAddSelectedProduct = () => {
//     if (!selectedProduct || !tempStripCount) return

//     const stripCount = parseInt(tempStripCount)
//     if (stripCount < 1) {
//       alert("Strip count must be at least 1")
//       return
//     }

//     if (stripCount > selectedProduct.strip_count) {
//       alert(`Only ${selectedProduct.strip_count} strips available in stock!`)
//       return
//     }

//     const existingItem = purchaseItems.find((item) => item.product_id === selectedProduct.id)
//     if (existingItem) {
//       alert("Product already added. Update quantity in the list below.")
//       return
//     }

//     const unitPrice = isImportPurchase 
//       ? (selectedProduct as ImportProduct).import_price 
//       : (selectedProduct as Product).selling_price

//     const newItem: PurchaseItem = {
//       id: Math.random().toString(36).substr(2, 9),
//       product_id: selectedProduct.id,
//       product_name: isImportPurchase 
//         ? (selectedProduct as ImportProduct).product_name 
//         : (selectedProduct as Product).name,
//       quantity: stripCount,
//       available_stock: selectedProduct.strip_count,
//       unit_price: unitPrice,
//       subtotal: stripCount * unitPrice,
//     }

//     setPurchaseItems([...purchaseItems, newItem])
//     setSearchTerm("")
//     setSelectedProduct(null)
//     setTempStripCount("")
//   }

//   const handleUpdateQuantity = (itemId: string, quantity: number) => {
//     if (quantity < 1) return

//     setPurchaseItems(
//       purchaseItems.map((item) => {
//         if (item.id === itemId) {
//           if (quantity > item.available_stock) {
//             alert(`Only ${item.available_stock} strips available in stock!`)
//             return item
//           }
//           return {
//             ...item,
//             quantity,
//             subtotal: quantity * item.unit_price,
//           }
//         }
//         return item
//       })
//     )
//   }

//   const handleUpdatePrice = (itemId: string, price: number) => {
//     if (price < 0) return

//     setPurchaseItems(
//       purchaseItems.map((item) => {
//         if (item.id === itemId) {
//           return {
//             ...item,
//             unit_price: price,
//             subtotal: item.quantity * price,
//           }
//         }
//         return item
//       })
//     )
//   }

//   const handleRemoveItem = (itemId: string) => {
//     setPurchaseItems(purchaseItems.filter((item) => item.id !== itemId))
//   }

//   const calculateTotal = () => {
//     return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)
//   }

//   const handleSubmit = async () => {
//     if (!customerInfo.customer_name.trim()) {
//       alert("Please enter customer name")
//       return
//     }

//     if (purchaseItems.length === 0) {
//       alert("Please add at least one product")
//       return
//     }

//     if (isImportPurchase && !selectedCompanyId) {
//       alert("Please select a local company for import purchase")
//       return
//     }

//     setIsLoading(true)

//     try {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) throw new Error("User not authenticated")

//       // Create purchase record
//       const purchaseData = {
//         user_id: user.id,
//         customer_name: customerInfo.customer_name,
//         customer_email: customerInfo.customer_email || null,
//         customer_phone: customerInfo.customer_phone || null,
//         purchase_date: new Date().toISOString(),
//         total_amount: calculateTotal(),
//         status: "completed",
//         notes: customerInfo.notes || null,
//         purchase_type: isImportPurchase ? "import" : "local",
//         local_company_id: isImportPurchase ? selectedCompanyId : null,
//       }

//       const { data: purchase, error: purchaseError } = await supabase
//         .from("purchases")
//         .insert([purchaseData])
//         .select()
//         .single()

//       if (purchaseError) throw purchaseError

//       // Insert purchase items and update inventory
//       if (isImportPurchase) {
//         // Handle import purchase items - INSERT INTO import_purchase_items TABLE
//         const importItems = purchaseItems.map((item) => ({
//           purchase_id: purchase.id,
//           import_product_id: item.product_id,
//           quantity_packs: item.quantity,
//           unit_price: item.unit_price,
//           subtotal: item.subtotal,
//         }))

//         const { error: itemsError } = await supabase
//           .from("import_purchase_items")
//           .insert(importItems)

//         if (itemsError) throw itemsError

//         // Update import_products strip_count (reduce inventory)
//         for (const item of purchaseItems) {
//           const { data: currentProduct, error: fetchError } = await supabase
//             .from("import_products")
//             .select("strip_count")
//             .eq("id", item.product_id)
//             .single()

//           if (fetchError) throw fetchError

//           const newStripCount = currentProduct.strip_count - item.quantity

//           const { error: updateError } = await supabase
//             .from("import_products")
//             .update({ 
//               strip_count: newStripCount,
//               updated_at: new Date().toISOString()
//             })
//             .eq("id", item.product_id)

//           if (updateError) throw updateError
//         }
//       } else {
//         // Handle local purchase items - INSERT INTO purchase_items TABLE (NOT purchases!)
//         const localItems = purchaseItems.map((item) => ({
//           purchase_id: purchase.id,
//           product_id: item.product_id,
//           quantity: item.quantity,
//           unit_price: item.unit_price,
//           subtotal: item.subtotal,
//         }))

//         const { error: itemsError } = await supabase
//           .from("purchase_items")  // FIXED: Changed from "purchases" to "purchase_items"
//           .insert(localItems)

//         if (itemsError) throw itemsError

//         // Update products strip_count (reduce inventory)
//         for (const item of purchaseItems) {
//           const { data: currentProduct, error: fetchError } = await supabase
//             .from("products")
//             .select("strip_count")
//             .eq("id", item.product_id)
//             .single()

//           if (fetchError) throw fetchError

//           const newStripCount = currentProduct.strip_count - item.quantity

//           const { error: updateError } = await supabase
//             .from("products")
//             .update({ 
//               strip_count: newStripCount,
//               updated_at: new Date().toISOString()
//             })
//             .eq("id", item.product_id)

//           if (updateError) throw updateError
//         }
//       }

//       alert("Purchase created successfully!")
//       onSuccess()
//     } catch (error: any) {
//       console.error("Error creating purchase:", error)
//       alert(`Failed to create purchase: ${error.message}`)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const filteredProducts = isImportPurchase
//     ? importProducts.filter((p) =>
//         p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : products.filter((p) =>
//         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.sku.toLowerCase().includes(searchTerm.toLowerCase())
//       )

//   return (
//     <div className="space-y-6  ">
//       {/* Toggle for Purchase Type */}
//       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
//         <div>
//           <h3 className="font-semibold text-lg">Purchase Type</h3>
//           <p className="text-sm text-gray-600">
//             {isImportPurchase ? "Import Products Billing" : "Local Products Billing"}
//           </p>
//         </div>
//         <button
//           type="button"
//           onClick={() => {
//             setIsImportPurchase(!isImportPurchase)
//             setPurchaseItems([])
//             setSelectedCompanyId("")
//           }}
//           className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
//             isImportPurchase ? "bg-blue-600" : "bg-gray-300"
//           }`}
//         >
//           <span
//             className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//               isImportPurchase ? "translate-x-9" : "translate-x-1"
//             }`}
//           />
//         </button>
//       </div>

//       {/* Customer Information */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Customer Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="customer_name">
//                 Customer Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="customer_name"
//                 value={customerInfo.customer_name}
//                 onChange={(e) =>
//                   setCustomerInfo({ ...customerInfo, customer_name: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label htmlFor="customer_email">Customer Email</Label>
//               <Input
//                 id="customer_email"
//                 type="email"
//                 value={customerInfo.customer_email}
//                 onChange={(e) =>
//                   setCustomerInfo({ ...customerInfo, customer_email: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label htmlFor="customer_phone">Customer Phone</Label>
//               <Input
//                 id="customer_phone"
//                 value={customerInfo.customer_phone}
//                 onChange={(e) =>
//                   setCustomerInfo({ ...customerInfo, customer_phone: e.target.value })
//                 }
//               />
//             </div>
//             {isImportPurchase && (
//               <div>
//                 <Label htmlFor="local_company">
//                   Local Company <span className="text-red-500">*</span>
//                 </Label>
//                 <select
//                   id="local_company"
//                   value={selectedCompanyId}
//                   onChange={(e) => setSelectedCompanyId(e.target.value)}
//                   className="w-full p-2 border rounded-md"
//                 >
//                   <option value="">Select Company</option>
//                   {localCompanies.map((company) => (
//                     <option key={company.id} value={company.id}>
//                       {company.company_name} ({company.company_code})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>
//           <div>
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea
//               id="notes"
//               value={customerInfo.notes}
//               onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
//               rows={3}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {/* Product Selection */}
//       <Card>
//         <CardHeader>
//           <CardTitle>Add Products</CardTitle>
//           <CardDescription>
//             Search and add {isImportPurchase ? "import" : "local"} products to the purchase
//           </CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex gap-3 items-end">
//             <div className="flex-1">
//               <Label htmlFor="product_search">Search Product</Label>
//               <Input
//                 id="product_search"
//                 placeholder={`Search ${isImportPurchase ? "import" : "local"} products...`}
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <div className="w-32">
//               <Label htmlFor="strip_count">Strip Count</Label>
//               <Input
//                 id="strip_count"
//                 type="number"
//                 min="1"
//                 placeholder="Strips"
//                 value={tempStripCount}
//                 onChange={(e) => setTempStripCount(e.target.value)}
//               />
//             </div>
//             <Button
//               type="button"
//               onClick={handleAddSelectedProduct}
//               disabled={!selectedProduct || !tempStripCount || parseInt(tempStripCount) < 1}
//               className="bg-blue-600 hover:bg-blue-700 gap-2"
//             >
//               <Plus className="w-4 h-4" />
//               Add Product
//             </Button>
//           </div>

//           {searchTerm && filteredProducts.length > 0 && (
//             <div className="border rounded-md max-h-60 overflow-y-auto">
//               {filteredProducts.map((product) => {
//                 const productPrice = isImportPurchase 
//                   ? (product as ImportProduct).import_price 
//                   : (product as Product).selling_price
//                 const productName = isImportPurchase
//                   ? (product as ImportProduct).product_name
//                   : (product as Product).name

//                 return (
//                   <div
//                     key={product.id}
//                     className={`p-3 cursor-pointer border-b last:border-b-0 flex justify-between items-center transition-colors ${
//                       selectedProduct?.id === product.id
//                         ? "bg-blue-50 border-l-4 border-l-blue-600"
//                         : "hover:bg-gray-50"
//                     }`}
//                     onClick={() => handleSelectProduct(product)}
//                   >
//                     <div>
//                       <p className="font-medium">{productName}</p>
//                       {!isImportPurchase && (
//                         <p className="text-sm text-gray-500">SKU: {(product as Product).sku}</p>
//                       )}
//                       {isImportPurchase && (product as ImportProduct).companies && (
//                         <p className="text-sm text-gray-500">
//                           Company: {(product as ImportProduct).companies?.company_name}
//                         </p>
//                       )}
//                       <p className="text-sm text-gray-600">
//                         Available Stock: {product.strip_count} strips | Price: $
//                         {productPrice.toFixed(2)}/strip
//                       </p>
//                     </div>
//                     {selectedProduct?.id === product.id && (
//                       <div className="text-blue-600 font-semibold">Selected</div>
//                     )}
//                   </div>
//                 )
//               })}
//             </div>
//           )}

//           {searchTerm && filteredProducts.length === 0 && (
//             <div className="text-center py-4 text-gray-500">
//               No products found. Try a different search term.
//             </div>
//           )}
//         </CardContent>
//       </Card>

//       {/* Purchase Items */}
//       {purchaseItems.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Bill Summary ({purchaseItems.length} items)</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="border rounded-lg overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="text-left p-3 font-semibold">Product Name</th>
//                       <th className="text-center p-3 font-semibold">Strip Count</th>
//                       <th className="text-right p-3 font-semibold">Price/Strip</th>
//                       <th className="text-right p-3 font-semibold">Amount</th>
//                       <th className="text-center p-3 font-semibold">Action</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {purchaseItems.map((item, index) => (
//                       <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                         <td className="p-3">
//                           <p className="font-medium">{item.product_name}</p>
//                           <p className="text-xs text-gray-500">Available: {item.available_stock} strips</p>
//                         </td>
//                         <td className="p-3">
//                           <Input
//                             type="number"
//                             min="1"
//                             max={item.available_stock}
//                             value={item.quantity}
//                             onChange={(e) =>
//                               handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
//                             }
//                             className="w-20 mx-auto text-center h-8"
//                           />
//                         </td>
//                         <td className="p-3 text-right">
//                           <Input
//                             type="number"
//                             step="0.01"
//                             min="0"
//                             value={item.unit_price}
//                             onChange={(e) =>
//                               handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)
//                             }
//                             className="w-24 ml-auto text-right h-8"
//                           />
//                         </td>
//                         <td className="p-3 text-right">
//                           <p className="font-semibold text-blue-600 text-lg">
//                             ${item.subtotal.toFixed(2)}
//                           </p>
//                         </td>
//                         <td className="p-3 text-center">
//                           <Button
//                             type="button"
//                             size="sm"
//                             variant="outline"
//                             onClick={() => handleRemoveItem(item.id)}
//                             className="hover:bg-red-50"
//                           >
//                             <Trash2 className="w-4 h-4 text-red-600" />
//                           </Button>
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-blue-50 border-t-2 border-blue-200">
//                     <tr>
//                       <td colSpan={3} className="p-4 text-right font-bold text-lg">
//                         Total Bill Amount:
//                       </td>
//                       <td className="p-4 text-right font-bold text-2xl text-blue-600">
//                         ${calculateTotal().toFixed(2)}
//                       </td>
//                       <td></td>
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       {/* Action Buttons */}
//       <div className="flex justify-end gap-3">
//         <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           disabled={isLoading || purchaseItems.length === 0}
//           className="bg-blue-600 hover:bg-blue-700 gap-2"
//         >
//           {isLoading ? (
//             "Processing..."
//           ) : (
//             <>
//               <ShoppingCart className="w-4 h-4" />
//               Create Purchase
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   )
// }







// "use client"
// import { useState, useEffect } from "react"
// import { X, Plus, Trash2, ShoppingCart } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { createClient } from "@/lib/supabase/client"

// interface PurchaseFormProps {
//   onSuccess: () => void
//   onCancel: () => void
//   editData?: any
// }

// interface Product {
//   id: string
//   name: string
//   sku: string
//   strip_count: number
//   per_strip_tablet_count: number
//   selling_price: number
//   total_tablets: number
// }

// interface ImportProduct {
//   id: string
//   product_name: string
//   strip_count: number
//   per_strip_tablet_count: number
//   import_price: number
//   company_id: string
//   companies?: {
//     company_name: string
//   }
// }

// interface LocalCompany {
//   id: string
//   company_name: string
//   company_code: string
// }

// interface PurchaseItem {
//   id: string
//   product_id: string
//   product_name: string
//   quantity: number
//   available_stock: number
//   unit_price: number
//   subtotal: number
// }

// export default function PurchaseForm({ onSuccess, onCancel, editData }: PurchaseFormProps) {
//   const [isImportPurchase, setIsImportPurchase] = useState(false)
//   const [products, setProducts] = useState<Product[]>([])
//   const [importProducts, setImportProducts] = useState<ImportProduct[]>([])
//   const [localCompanies, setLocalCompanies] = useState<LocalCompany[]>([])
//   const [selectedCompanyId, setSelectedCompanyId] = useState("")
//   const [isLoading, setIsLoading] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [selectedProduct, setSelectedProduct] = useState<Product | ImportProduct | null>(null)
//   const [tempStripCount, setTempStripCount] = useState("")

//   const [customerInfo, setCustomerInfo] = useState({
//     customer_name: "",
//     customer_email: "",
//     customer_phone: "",
//     notes: "",
//   })

//   const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([])
//   const supabase = createClient()

//   useEffect(() => {
//     if (editData) {
//       // Populate form with edit data
//       setIsImportPurchase(editData.purchase_type === 'import')
//       setCustomerInfo({
//         customer_name: editData.customer_name || "",
//         customer_email: editData.customer_email || "",
//         customer_phone: editData.customer_phone || "",
//         notes: editData.notes || "",
//       })
//       setSelectedCompanyId(editData.local_company_id || "")

//       // Populate purchase items
//       if (editData.purchase_type === 'local' && editData.purchase_items) {
//         const items = editData.purchase_items.map((item: any) => ({
//           id: item.id,
//           product_id: item.product_id,
//           product_name: item.products?.name || "Product",
//           quantity: item.quantity,
//           available_stock: item.quantity, // Will be updated when products load
//           unit_price: item.unit_price,
//           subtotal: item.subtotal,
//         }))
//         setPurchaseItems(items)
//       } else if (editData.purchase_type === 'import' && editData.import_purchase_items) {
//         const items = editData.import_purchase_items.map((item: any) => ({
//           id: item.id,
//           product_id: item.import_product_id,
//           product_name: item.import_products?.product_name || "Product",
//           quantity: item.quantity_packs,
//           available_stock: item.quantity_packs,
//           unit_price: item.unit_price,
//           subtotal: item.subtotal,
//         }))
//         setPurchaseItems(items)
//       }
//     }
//   }, [editData])

//   useEffect(() => {
//     fetchData()
//   }, [isImportPurchase])

//   const fetchData = async () => {
//     try {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) return

//       if (isImportPurchase) {
//         const { data: importProds, error: importError } = await supabase
//           .from("import_products")
//           .select(`
//             *,
//             companies (
//               company_name
//             )
//           `)
//           .eq("user_id", user.id)
//           .gt("strip_count", 0)
//           .order("product_name")

//         if (importError) throw importError
//         setImportProducts(importProds || [])

//         const { data: companies, error: compError } = await supabase
//           .from("local_companies")
//           .select("*")
//           .eq("user_id", user.id)
//           .order("company_name")

//         if (compError) throw compError
//         setLocalCompanies(companies || [])
//       } else {
//         const { data: localProds, error: localError } = await supabase
//           .from("products")
//           .select("*")
//           .eq("user_id", user.id)
//           .gt("strip_count", 0)
//           .order("name")

//         if (localError) throw localError
//         setProducts(localProds || [])
//       }
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       alert("Failed to load data")
//     }
//   }

//   const handleSelectProduct = (product: Product | ImportProduct) => {
//     setSelectedProduct(product)
//     setTempStripCount("1")
//   }

//   const handleAddSelectedProduct = () => {
//     if (!selectedProduct || !tempStripCount) return

//     const stripCount = parseInt(tempStripCount)
//     if (stripCount < 1) {
//       alert("Strip count must be at least 1")
//       return
//     }

//     if (stripCount > selectedProduct.strip_count) {
//       alert(`Only ${selectedProduct.strip_count} strips available in stock!`)
//       return
//     }

//     const existingItem = purchaseItems.find((item) => item.product_id === selectedProduct.id)
//     if (existingItem) {
//       alert("Product already added. Update quantity in the list below.")
//       return
//     }

//     const unitPrice = isImportPurchase 
//       ? (selectedProduct as ImportProduct).import_price 
//       : (selectedProduct as Product).selling_price

//     const newItem: PurchaseItem = {
//       id: Math.random().toString(36).substr(2, 9),
//       product_id: selectedProduct.id,
//       product_name: isImportPurchase 
//         ? (selectedProduct as ImportProduct).product_name 
//         : (selectedProduct as Product).name,
//       quantity: stripCount,
//       available_stock: selectedProduct.strip_count,
//       unit_price: unitPrice,
//       subtotal: stripCount * unitPrice,
//     }

//     setPurchaseItems([...purchaseItems, newItem])
//     setSearchTerm("")
//     setSelectedProduct(null)
//     setTempStripCount("")
//   }

//   const handleUpdateQuantity = (itemId: string, quantity: number) => {
//     if (quantity < 1) return

//     setPurchaseItems(
//       purchaseItems.map((item) => {
//         if (item.id === itemId) {
//           if (quantity > item.available_stock) {
//             alert(`Only ${item.available_stock} strips available in stock!`)
//             return item
//           }
//           return {
//             ...item,
//             quantity,
//             subtotal: quantity * item.unit_price,
//           }
//         }
//         return item
//       })
//     )
//   }

//   const handleUpdatePrice = (itemId: string, price: number) => {
//     if (price < 0) return

//     setPurchaseItems(
//       purchaseItems.map((item) => {
//         if (item.id === itemId) {
//           return {
//             ...item,
//             unit_price: price,
//             subtotal: item.quantity * price,
//           }
//         }
//         return item
//       })
//     )
//   }

//   const handleRemoveItem = (itemId: string) => {
//     setPurchaseItems(purchaseItems.filter((item) => item.id !== itemId))
//   }

//   const calculateTotal = () => {
//     return purchaseItems.reduce((sum, item) => sum + item.subtotal, 0)
//   }

//   const handleSubmit = async () => {
//     if (!customerInfo.customer_name.trim()) {
//       alert("Please enter customer name")
//       return
//     }

//     if (purchaseItems.length === 0) {
//       alert("Please add at least one product")
//       return
//     }

//     if (isImportPurchase && !selectedCompanyId) {
//       alert("Please select a local company for import purchase")
//       return
//     }

//     setIsLoading(true)

//     try {
//       const { data: { user } } = await supabase.auth.getUser()
//       if (!user) throw new Error("User not authenticated")

//       if (editData) {
//         // UPDATE EXISTING PURCHASE
//         const purchaseData = {
//           customer_name: customerInfo.customer_name,
//           customer_email: customerInfo.customer_email || null,
//           customer_phone: customerInfo.customer_phone || null,
//           total_amount: calculateTotal(),
//           notes: customerInfo.notes || null,
//           local_company_id: isImportPurchase ? selectedCompanyId : null,
//           updated_at: new Date().toISOString()
//         }

//         const { error: updateError } = await supabase
//           .from("purchases")
//           .update(purchaseData)
//           .eq("id", editData.id)

//         if (updateError) throw updateError

//         // Delete old items and insert new ones
//         if (isImportPurchase) {
//           await supabase.from("import_purchase_items").delete().eq("purchase_id", editData.id)

//           const importItems = purchaseItems.map((item) => ({
//             purchase_id: editData.id,
//             import_product_id: item.product_id,
//             quantity_packs: item.quantity,
//             unit_price: item.unit_price,
//             subtotal: item.subtotal,
//           }))

//           const { error: itemsError } = await supabase
//             .from("import_purchase_items")
//             .insert(importItems)

//           if (itemsError) throw itemsError
//         } else {
//           await supabase.from("purchase_items").delete().eq("purchase_id", editData.id)

//           const localItems = purchaseItems.map((item) => ({
//             purchase_id: editData.id,
//             product_id: item.product_id,
//             quantity: item.quantity,
//             unit_price: item.unit_price,
//             subtotal: item.subtotal,
//           }))

//           const { error: itemsError } = await supabase
//             .from("purchase_items")
//             .insert(localItems)

//           if (itemsError) throw itemsError
//         }

//         alert("Purchase updated successfully!")
//       } else {
//         // CREATE NEW PURCHASE
//         const purchaseData = {
//           user_id: user.id,
//           customer_name: customerInfo.customer_name,
//           customer_email: customerInfo.customer_email || null,
//           customer_phone: customerInfo.customer_phone || null,
//           purchase_date: new Date().toISOString(),
//           total_amount: calculateTotal(),
//           status: "completed",
//           notes: customerInfo.notes || null,
//           purchase_type: isImportPurchase ? "import" : "local",
//           local_company_id: isImportPurchase ? selectedCompanyId : null,
//         }

//         const { data: purchase, error: purchaseError } = await supabase
//           .from("purchases")
//           .insert([purchaseData])
//           .select()
//           .single()

//         if (purchaseError) throw purchaseError

//         if (isImportPurchase) {
//           const importItems = purchaseItems.map((item) => ({
//             purchase_id: purchase.id,
//             import_product_id: item.product_id,
//             quantity_packs: item.quantity,
//             unit_price: item.unit_price,
//             subtotal: item.subtotal,
//           }))

//           const { error: itemsError } = await supabase
//             .from("import_purchase_items")
//             .insert(importItems)

//           if (itemsError) throw itemsError

//           for (const item of purchaseItems) {
//             const { data: currentProduct, error: fetchError } = await supabase
//               .from("import_products")
//               .select("strip_count")
//               .eq("id", item.product_id)
//               .single()

//             if (fetchError) throw fetchError

//             const newStripCount = currentProduct.strip_count - item.quantity

//             const { error: updateError } = await supabase
//               .from("import_products")
//               .update({ 
//                 strip_count: newStripCount,
//                 updated_at: new Date().toISOString()
//               })
//               .eq("id", item.product_id)

//             if (updateError) throw updateError
//           }
//         } else {
//           const localItems = purchaseItems.map((item) => ({
//             purchase_id: purchase.id,
//             product_id: item.product_id,
//             quantity: item.quantity,
//             unit_price: item.unit_price,
//             subtotal: item.subtotal,
//           }))

//           const { error: itemsError } = await supabase
//             .from("purchase_items")
//             .insert(localItems)

//           if (itemsError) throw itemsError

//           for (const item of purchaseItems) {
//             const { data: currentProduct, error: fetchError } = await supabase
//               .from("products")
//               .select("strip_count")
//               .eq("id", item.product_id)
//               .single()

//             if (fetchError) throw fetchError

//             const newStripCount = currentProduct.strip_count - item.quantity

//             const { error: updateError } = await supabase
//               .from("products")
//               .update({ 
//                 strip_count: newStripCount,
//                 updated_at: new Date().toISOString()
//               })
//               .eq("id", item.product_id)

//             if (updateError) throw updateError
//           }
//         }

//         alert("Purchase created successfully!")
//       }

//       onSuccess()
//     } catch (error: any) {
//       console.error("Error saving purchase:", error)
//       alert(`Failed to save purchase: ${error.message}`)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const filteredProducts = isImportPurchase
//     ? importProducts.filter((p) =>
//         p.product_name.toLowerCase().includes(searchTerm.toLowerCase())
//       )
//     : products.filter((p) =>
//         p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         p.sku.toLowerCase().includes(searchTerm.toLowerCase())
//       )

//   return (
//     <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
//       {!editData && (
//         <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
//           <div>
//             <h3 className="font-semibold text-lg">Purchase Type</h3>
//             <p className="text-sm text-gray-600">
//               {isImportPurchase ? "Import Products Billing" : "Local Products Billing"}
//             </p>
//           </div>
//           <button
//             type="button"
//             onClick={() => {
//               setIsImportPurchase(!isImportPurchase)
//               setPurchaseItems([])
//               setSelectedCompanyId("")
//             }}
//             className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${
//               isImportPurchase ? "bg-blue-600" : "bg-gray-300"
//             }`}
//           >
//             <span
//               className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
//                 isImportPurchase ? "translate-x-9" : "translate-x-1"
//               }`}
//             />
//           </button>
//         </div>
//       )}

//       <Card>
//         <CardHeader>
//           <CardTitle>Customer Information</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="customer_name">
//                 Customer Name <span className="text-red-500">*</span>
//               </Label>
//               <Input
//                 id="customer_name"
//                 value={customerInfo.customer_name}
//                 onChange={(e) =>
//                   setCustomerInfo({ ...customerInfo, customer_name: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label htmlFor="customer_email">Customer Email</Label>
//               <Input
//                 id="customer_email"
//                 type="email"
//                 value={customerInfo.customer_email}
//                 onChange={(e) =>
//                   setCustomerInfo({ ...customerInfo, customer_email: e.target.value })
//                 }
//               />
//             </div>
//             <div>
//               <Label htmlFor="customer_phone">Customer Phone</Label>
//               <Input
//                 id="customer_phone"
//                 value={customerInfo.customer_phone}
//                 onChange={(e) =>
//                   setCustomerInfo({ ...customerInfo, customer_phone: e.target.value })
//                 }
//               />
//             </div>
//             {isImportPurchase && (
//               <div>
//                 <Label htmlFor="local_company">
//                   Local Company <span className="text-red-500">*</span>
//                 </Label>
//                 <select
//                   id="local_company"
//                   value={selectedCompanyId}
//                   onChange={(e) => setSelectedCompanyId(e.target.value)}
//                   className="w-full p-2 border rounded-md"
//                 >
//                   <option value="">Select Company</option>
//                   {localCompanies.map((company) => (
//                     <option key={company.id} value={company.id}>
//                       {company.company_name} ({company.company_code})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             )}
//           </div>
//           <div>
//             <Label htmlFor="notes">Notes</Label>
//             <Textarea
//               id="notes"
//               value={customerInfo.notes}
//               onChange={(e) => setCustomerInfo({ ...customerInfo, notes: e.target.value })}
//               rows={3}
//             />
//           </div>
//         </CardContent>
//       </Card>

//       {!editData && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Add Products</CardTitle>
//             <CardDescription>
//               Search and add {isImportPurchase ? "import" : "local"} products to the purchase
//             </CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="flex gap-3 items-end">
//               <div className="flex-1">
//                 <Label htmlFor="product_search">Search Product</Label>
//                 <Input
//                   id="product_search"
//                   placeholder={`Search ${isImportPurchase ? "import" : "local"} products...`}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <div className="w-32">
//                 <Label htmlFor="strip_count">Strip Count</Label>
//                 <Input
//                   id="strip_count"
//                   type="number"
//                   min="1"
//                   placeholder="Strips"
//                   value={tempStripCount}
//                   onChange={(e) => setTempStripCount(e.target.value)}
//                 />
//               </div>
//               <Button
//                 type="button"
//                 onClick={handleAddSelectedProduct}
//                 disabled={!selectedProduct || !tempStripCount || parseInt(tempStripCount) < 1}
//                 className="bg-blue-600 hover:bg-blue-700 gap-2"
//               >
//                 <Plus className="w-4 h-4" />
//                 Add Product
//               </Button>
//             </div>

//             {searchTerm && filteredProducts.length > 0 && (
//               <div className="border rounded-md max-h-60 overflow-y-auto">
//                 {filteredProducts.map((product) => {
//                   const productPrice = isImportPurchase 
//                     ? (product as ImportProduct).import_price 
//                     : (product as Product).selling_price
//                   const productName = isImportPurchase
//                     ? (product as ImportProduct).product_name
//                     : (product as Product).name

//                   return (
//                     <div
//                       key={product.id}
//                       className={`p-3 cursor-pointer border-b last:border-b-0 flex justify-between items-center transition-colors ${
//                         selectedProduct?.id === product.id
//                           ? "bg-blue-50 border-l-4 border-l-blue-600"
//                           : "hover:bg-gray-50"
//                       }`}
//                       onClick={() => handleSelectProduct(product)}
//                     >
//                       <div>
//                         <p className="font-medium">{productName}</p>
//                         {!isImportPurchase && (
//                           <p className="text-sm text-gray-500">SKU: {(product as Product).sku}</p>
//                         )}
//                         {isImportPurchase && (product as ImportProduct).companies && (
//                           <p className="text-sm text-gray-500">
//                             Company: {(product as ImportProduct).companies?.company_name}
//                           </p>
//                         )}
//                         <p className="text-sm text-gray-600">
//                           Available Stock: {product.strip_count} strips | Price: $
//                           {productPrice.toFixed(2)}/strip
//                         </p>
//                       </div>
//                       {selectedProduct?.id === product.id && (
//                         <div className="text-blue-600 font-semibold">Selected</div>
//                       )}
//                     </div>
//                   )
//                 })}
//               </div>
//             )}

//             {searchTerm && filteredProducts.length === 0 && (
//               <div className="text-center py-4 text-gray-500">
//                 No products found. Try a different search term.
//               </div>
//             )}
//           </CardContent>
//         </Card>
//       )}

//       {purchaseItems.length > 0 && (
//         <Card>
//           <CardHeader>
//             <CardTitle>Bill Summary ({purchaseItems.length} items)</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="space-y-4">
//               <div className="border rounded-lg overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-gray-100">
//                     <tr>
//                       <th className="text-left p-3 font-semibold">Product Name</th>
//                       <th className="text-center p-3 font-semibold">Strip Count</th>
//                       <th className="text-right p-3 font-semibold">Price/Strip</th>
//                       <th className="text-right p-3 font-semibold">Amount</th>
//                       {!editData && <th className="text-center p-3 font-semibold">Action</th>}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {purchaseItems.map((item, index) => (
//                       <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
//                         <td className="p-3">
//                           <p className="font-medium">{item.product_name}</p>
//                           <p className="text-xs text-gray-500">Available: {item.available_stock} strips</p>
//                         </td>
//                         <td className="p-3">
//                           <Input
//                             type="number"
//                             min="1"
//                             max={item.available_stock}
//                             value={item.quantity}
//                             onChange={(e) =>
//                               handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)
//                             }
//                             className="w-20 mx-auto text-center h-8"
//                             disabled={!!editData}
//                           />
//                         </td>
//                         <td className="p-3 text-right">
//                           <Input
//                             type="number"
//                             step="0.01"
//                             min="0"
//                             value={item.unit_price}
//                             onChange={(e) =>
//                               handleUpdatePrice(item.id, parseFloat(e.target.value) || 0)
//                             }
//                             className="w-24 ml-auto text-right h-8"
//                           />
//                         </td>
//                         <td className="p-3 text-right">
//                           <p className="font-semibold text-blue-600 text-lg">
//                             ${item.subtotal.toFixed(2)}
//                           </p>
//                         </td>
//                         {!editData && (
//                           <td className="p-3 text-center">
//                             <Button
//                               type="button"
//                               size="sm"
//                               variant="outline"
//                               onClick={() => handleRemoveItem(item.id)}
//                               className="hover:bg-red-50"
//                             >
//                               <Trash2 className="w-4 h-4 text-red-600" />
//                             </Button>
//                           </td>
//                         )}
//                       </tr>
//                     ))}
//                   </tbody>
//                   <tfoot className="bg-blue-50 border-t-2 border-blue-200">
//                     <tr>
//                       <td colSpan={3} className="p-4 text-right font-bold text-lg">
//                         Total Bill Amount:
//                       </td>
//                       <td className="p-4 text-right font-bold text-2xl text-blue-600">
//                         ${calculateTotal().toFixed(2)}
//                       </td>
//                       {!editData && <td></td>}
//                     </tr>
//                   </tfoot>
//                 </table>
//               </div>
//             </div>
//           </CardContent>
//         </Card>
//       )}

//       <div className="flex justify-end gap-3 sticky bottom-0 bg-white pt-4 pb-2">
//         <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
//           Cancel
//         </Button>
//         <Button
//           onClick={handleSubmit}
//           disabled={isLoading || purchaseItems.length === 0}
//           className="bg-blue-600 hover:bg-blue-700 gap-2"
//         >
//           {isLoading ? (
//             "Processing..."
//           ) : (
//             <>
//               <ShoppingCart className="w-4 h-4" />
//               {editData ? "Update Purchase" : "Create Purchase"}
//             </>
//           )}
//         </Button>
//       </div>
//     </div>
//   )
// }