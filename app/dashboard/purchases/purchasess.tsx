"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import PurchaseForm from "@/components/purchases/purchase-form"
import PurchaseTable from "@/components/purchases/purchase-table"
import InvoiceViewer from "../../../components/purchases/invoice-viewer"
import { Plus, Search, X } from "lucide-react"

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
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null)

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
    setEditingPurchase(null)
  }

  const handleViewBill = async (purchase: Purchase) => {
    setViewingPurchase(purchase)
  }

  const handleEditPurchase = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setShowForm(true)
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
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{editingPurchase ? "Edit Purchase" : "Create New Purchase"}</CardTitle>
                <CardDescription>
                  {editingPurchase ? "Update purchase transaction" : "Add a new purchase transaction"}
                </CardDescription>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowForm(false)
                  setEditingPurchase(null)
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <PurchaseForm
              onSuccess={handleAddPurchase}
              onCancel={() => {
                setShowForm(false)
                setEditingPurchase(null)
              }}
              editData={editingPurchase}
            />
          </CardContent>
        </Card>
      )}

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

      {/* Invoice Viewer Modal */}
      {viewingPurchase && (
        <InvoiceViewer
          purchase={viewingPurchase}
          onClose={() => setViewingPurchase(null)}
        />
      )}
    </div>
  )
}




// "use client"

// import { useEffect, useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Plus, Search, X, Edit, Trash2, Building2, ShoppingCart } from "lucide-react"
// import { createClient } from "@/lib/supabase/client"
// import PurchaseForm from "@/components/purchases/purchase-form"
// import PurchaseTable from "@/components/purchases/purchase-table"
// import InvoiceViewer from "@/components/purchases/invoice-viewer"

// interface Purchase {
//   id: string
//   customer_name: string
//   customer_email: string
//   customer_phone: string
//   purchase_date: string
//   total_amount: number
//   status: string
//   notes: string
//   purchase_type: 'local' | 'import'
//   local_company_id?: string
//   local_companies?: {
//     company_name: string
//     company_code: string
//   }
//   purchase_items?: any[]
//   import_purchase_items?: any[]
// }

// interface LocalCompany {
//   id: string
//   company_name: string
//   company_code: string
//   contact_person?: string
//   contact_email?: string
//   contact_phone?: string
//   address?: string
//   city?: string
//   state?: string
//   postal_code?: string
//   gst_number?: string
//   created_at: string
//   updated_at: string
// }

// export default function PurchasesPage() {
//   const [activeView, setActiveView] = useState<'purchases' | 'local'>('purchases')
//   const [purchases, setPurchases] = useState<Purchase[]>([])
//   const [localCompanies, setLocalCompanies] = useState<LocalCompany[]>([])
//   const [isLoading, setIsLoading] = useState(true)
//   const [showForm, setShowForm] = useState(false)
//   const [showCompanyForm, setShowCompanyForm] = useState(false)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
//   const [editingCompany, setEditingCompany] = useState<LocalCompany | null>(null)
//   const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null)
//   const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set())

//   const supabase = createClient()

//   useEffect(() => {
//     if (activeView === 'purchases') {
//       fetchPurchases()
//     } else {
//       fetchLocalCompanies()
//     }
//   }, [activeView])

//   const fetchPurchases = async () => {
//     try {
//       setIsLoading(true)
//       const { data, error } = await supabase
//         .from("purchases")
//         .select(`
//           *,
//           local_companies (
//             company_name,
//             company_code
//           ),
//           purchase_items(
//             id,
//             product_id,
//             quantity,
//             unit_price,
//             subtotal,
//             products(name)
//           ),
//           import_purchase_items(
//             id,
//             import_product_id,
//             quantity_packs,
//             unit_price,
//             subtotal,
//             import_products(product_name)
//           )
//         `)
//         .order("purchase_date", { ascending: false })

//       if (error) throw error
//       setPurchases(data || [])
//     } catch (error) {
//       console.error("Error fetching purchases:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const fetchLocalCompanies = async () => {
//     try {
//       setIsLoading(true)
//       const { data, error } = await supabase
//         .from("local_companies")
//         .select("*")
//         .order("company_name", { ascending: true })

//       if (error) throw error
//       setLocalCompanies(data || [])
//     } catch (error) {
//       console.error("Error fetching local companies:", error)
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleAddPurchase = async () => {
//     await fetchPurchases()
//     setShowForm(false)
//     setEditingPurchase(null)
//   }

//   const handleViewBill = async (purchase: Purchase) => {
//     setViewingPurchase(purchase)
//   }

//   const handleEditPurchase = (purchase: Purchase) => {
//     setEditingPurchase(purchase)
//     setShowForm(true)
//   }

//   const handleDeletePurchase = async (purchaseId: string) => {
//     if (!confirm("Are you sure you want to delete this purchase?")) return

//     try {
//       const { error } = await supabase.from("purchases").delete().eq("id", purchaseId)
//       if (error) throw error
//       await fetchPurchases()
//     } catch (error) {
//       console.error("Error deleting purchase:", error)
//       alert("Failed to delete purchase")
//     }
//   }

//   const handleMultiDelete = async (purchaseIds: string[]) => {
//     if (!confirm(`Delete ${purchaseIds.length} purchase(s)? This action cannot be undone.`)) return

//     try {
//       const { error } = await supabase.from("purchases").delete().in("id", purchaseIds)
//       if (error) throw error
//       await fetchPurchases()
//     } catch (error) {
//       console.error("Error deleting purchases:", error)
//       alert("Failed to delete purchases")
//     }
//   }

//   const handleDeleteCompany = async (companyId: string) => {
//     if (!confirm("Are you sure you want to delete this company?")) return

//     try {
//       const { error } = await supabase.from("local_companies").delete().eq("id", companyId)
//       if (error) throw error
//       await fetchLocalCompanies()
//     } catch (error) {
//       console.error("Error deleting company:", error)
//       alert("Failed to delete company")
//     }
//   }

//   const handleMultiDeleteCompanies = async () => {
//     if (selectedCompanies.size === 0) return
//     if (!confirm(`Delete ${selectedCompanies.size} company(ies)? This action cannot be undone.`)) return

//     try {
//       const { error } = await supabase
//         .from("local_companies")
//         .delete()
//         .in("id", Array.from(selectedCompanies))

//       if (error) throw error
//       setSelectedCompanies(new Set())
//       await fetchLocalCompanies()
//     } catch (error) {
//       console.error("Error deleting companies:", error)
//       alert("Failed to delete companies")
//     }
//   }

//   const filteredPurchases = purchases.filter((purchase) => {
//     const searchLower = searchTerm.toLowerCase()
//     return (
//       purchase.customer_name.toLowerCase().includes(searchLower) ||
//       purchase.customer_email?.toLowerCase().includes(searchLower) ||
//       purchase.customer_phone?.includes(searchTerm)
//     )
//   })

//   const filteredCompanies = localCompanies.filter((company) => {
//     const searchLower = searchTerm.toLowerCase()
//     return (
//       company.company_name.toLowerCase().includes(searchLower) ||
//       company.company_code.toLowerCase().includes(searchLower) ||
//       company.contact_person?.toLowerCase().includes(searchLower) ||
//       company.contact_email?.toLowerCase().includes(searchLower)
//     )
//   })

//   const toggleCompanySelection = (id: string) => {
//     const newSelected = new Set(selectedCompanies)
//     if (newSelected.has(id)) {
//       newSelected.delete(id)
//     } else {
//       newSelected.add(id)
//     }
//     setSelectedCompanies(newSelected)
//   }

//   const toggleAllCompanies = () => {
//     if (selectedCompanies.size === filteredCompanies.length) {
//       setSelectedCompanies(new Set())
//     } else {
//       setSelectedCompanies(new Set(filteredCompanies.map(c => c.id)))
//     }
//   }

//   return (
//     <div className="p-6 space-y-6">
//       <div className="flex justify-between items-center">
//         <div>
//           <h1 className="text-3xl font-bold">Purchases & Local Companies</h1>
//           <p className="text-gray-600 mt-1">Manage customer purchases and local company database</p>
//         </div>
//         <div className="flex gap-2">
//           <Button
//             onClick={() => setActiveView('purchases')}
//             variant={activeView === 'purchases' ? 'default' : 'outline'}
//             className="gap-2"
//           >
//             <ShoppingCart className="w-4 h-4" />
//             Purchases
//           </Button>
//           <Button
//             onClick={() => setActiveView('local')}
//             variant={activeView === 'local' ? 'default' : 'outline'}
//             className="gap-2"
//           >
//             <Building2 className="w-4 h-4" />
//             Local
//           </Button>
//         </div>
//       </div>

//       {/* Purchases View */}
//       {activeView === 'purchases' && (
//         <>
//           <div className="flex justify-end">
//             <Button onClick={() => setShowForm(true)} className="gap-2 bg-blue-600 hover:bg-blue-700">
//               <Plus className="w-4 h-4" />
//               New Purchase
//             </Button>
//           </div>

//           {showForm && (
//             <Card>
//               <CardHeader>
//                 <div className="flex justify-between items-center">
//                   <div>
//                     <CardTitle>{editingPurchase ? "Edit Purchase" : "Create New Purchase"}</CardTitle>
//                     <CardDescription>
//                       {editingPurchase ? "Update purchase transaction" : "Add a new purchase transaction"}
//                     </CardDescription>
//                   </div>
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={() => {
//                       setShowForm(false)
//                       setEditingPurchase(null)
//                     }}
//                   >
//                     <X className="w-4 h-4" />
//                   </Button>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <PurchaseForm
//                   onSuccess={handleAddPurchase}
//                   onCancel={() => {
//                     setShowForm(false)
//                     setEditingPurchase(null)
//                   }}
//                   editData={editingPurchase}
//                 />
//               </CardContent>
//             </Card>
//           )}

//           <Card>
//             <CardHeader>
//               <CardTitle>Purchase History</CardTitle>
//               <CardDescription>
//                 Total purchases: {filteredPurchases.length}
//                 {searchTerm && ` (filtered from ${purchases.length})`}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   placeholder="Search by customer name or email..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>

//               {isLoading ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   <p className="mt-2 text-gray-600">Loading purchases...</p>
//                 </div>
//               ) : (
//                 <PurchaseTable
//                   purchases={filteredPurchases}
//                   onRefresh={fetchPurchases}
//                   onViewBill={handleViewBill}
//                   onDeletePurchase={handleDeletePurchase}
//                   onMultiDelete={handleMultiDelete}
//                   onEdit={handleEditPurchase}
//                 />
//               )}
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {/* Local Companies View */}
//       {activeView === 'local' && (
//         <>
//           <div className="flex justify-end gap-2">
//             {selectedCompanies.size > 0 && (
//               <Button
//                 onClick={handleMultiDeleteCompanies}
//                 variant="destructive"
//                 className="gap-2"
//               >
//                 <Trash2 className="w-4 h-4" />
//                 Delete ({selectedCompanies.size})
//               </Button>
//             )}
//             <Button
//               onClick={() => {
//                 setShowCompanyForm(true)
//                 setEditingCompany(null)
//               }}
//               className="gap-2 bg-blue-600 hover:bg-blue-700"
//             >
//               <Plus className="w-4 h-4" />
//               Add Company
//             </Button>
//           </div>

//           {showCompanyForm && (
//             <LocalCompanyForm
//               editData={editingCompany}
//               onSuccess={() => {
//                 fetchLocalCompanies()
//                 setShowCompanyForm(false)
//                 setEditingCompany(null)
//               }}
//               onCancel={() => {
//                 setShowCompanyForm(false)
//                 setEditingCompany(null)
//               }}
//             />
//           )}

//           <Card>
//             <CardHeader>
//               <CardTitle>Local Companies</CardTitle>
//               <CardDescription>
//                 Total companies: {filteredCompanies.length}
//                 {searchTerm && ` (filtered from ${localCompanies.length})`}
//               </CardDescription>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
//                 <Input
//                   placeholder="Search by company name, code, contact..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="pl-10"
//                 />
//               </div>

//               {isLoading ? (
//                 <div className="text-center py-8">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//                   <p className="mt-2 text-gray-600">Loading companies...</p>
//                 </div>
//               ) : filteredCompanies.length === 0 ? (
//                 <div className="text-center py-12">
//                   <Building2 className="w-12 h-12 mx-auto text-gray-400 mb-3" />
//                   <p className="text-gray-600">No companies found</p>
//                   <Button
//                     onClick={() => setShowCompanyForm(true)}
//                     className="mt-4 gap-2"
//                     variant="outline"
//                   >
//                     <Plus className="w-4 h-4" />
//                     Add Your First Company
//                   </Button>
//                 </div>
//               ) : (
//                 <LocalCompanyTable
//                   companies={filteredCompanies}
//                   selectedCompanies={selectedCompanies}
//                   onToggleSelection={toggleCompanySelection}
//                   onToggleAll={toggleAllCompanies}
//                   onEdit={(company) => {
//                     setEditingCompany(company)
//                     setShowCompanyForm(true)
//                   }}
//                   onDelete={handleDeleteCompany}
//                 />
//               )}
//             </CardContent>
//           </Card>
//         </>
//       )}

//       {viewingPurchase && (
//         <InvoiceViewer
//           purchase={viewingPurchase}
//           onClose={() => setViewingPurchase(null)}
//         />
//       )}
//     </div>
//   )
// }

// // Local Company Form Component
// function LocalCompanyForm({ editData, onSuccess, onCancel }: {
//   editData: LocalCompany | null
//   onSuccess: () => void
//   onCancel: () => void
// }) {
//   const [formData, setFormData] = useState({
//     company_name: editData?.company_name || '',
//     company_code: editData?.company_code || '',
//     contact_person: editData?.contact_person || '',
//     contact_email: editData?.contact_email || '',
//     contact_phone: editData?.contact_phone || '',
//     address: editData?.address || '',
//     city: editData?.city || '',
//     state: editData?.state || '',
//     postal_code: editData?.postal_code || '',
//     gst_number: editData?.gst_number || ''
//   })
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const supabase = createClient()

//   const handleSubmit = async () => {
//     if (!formData.company_name || !formData.company_code) {
//       alert('Company name and code are required')
//       return
//     }

//     setIsSubmitting(true)

//     try {
//       if (editData) {
//         const { error } = await supabase
//           .from('local_companies')
//           .update({ ...formData, updated_at: new Date().toISOString() })
//           .eq('id', editData.id)

//         if (error) throw error
//       } else {
//         const { error } = await supabase
//           .from('local_companies')
//           .insert([formData])

//         if (error) throw error
//       }

//       onSuccess()
//     } catch (error: any) {
//       console.error('Error saving company:', error)
//       alert(error.message || 'Failed to save company')
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <Card>
//       <CardHeader>
//         <div className="flex justify-between items-center">
//           <div>
//             <CardTitle>{editData ? 'Edit Company' : 'Add New Company'}</CardTitle>
//             <CardDescription>
//               {editData ? 'Update company information' : 'Enter company details'}
//             </CardDescription>
//           </div>
//           <Button variant="ghost" size="sm" onClick={onCancel}>
//             <X className="w-4 h-4" />
//           </Button>
//         </div>
//       </CardHeader>
//       <CardContent>
//         <div className="space-y-4">
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <Label htmlFor="company_name">Company Name *</Label>
//               <Input
//                 id="company_name"
//                 value={formData.company_name}
//                 onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
//                 placeholder="ABC Industries"
//               />
//             </div>
//             <div>
//               <Label htmlFor="company_code">Company Code *</Label>
//               <Input
//                 id="company_code"
//                 value={formData.company_code}
//                 onChange={(e) => setFormData({ ...formData, company_code: e.target.value.toUpperCase() })}
//                 placeholder="ABC001"
//                 disabled={!!editData}
//               />
//             </div>
//             <div>
//               <Label htmlFor="contact_person">Contact Person</Label>
//               <Input
//                 id="contact_person"
//                 value={formData.contact_person}
//                 onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
//                 placeholder="John Doe"
//               />
//             </div>
//             <div>
//               <Label htmlFor="contact_email">Contact Email</Label>
//               <Input
//                 id="contact_email"
//                 type="email"
//                 value={formData.contact_email}
//                 onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
//                 placeholder="contact@company.com"
//               />
//             </div>
//             <div>
//               <Label htmlFor="contact_phone">Contact Phone</Label>
//               <Input
//                 id="contact_phone"
//                 value={formData.contact_phone}
//                 onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
//                 placeholder="+91 98765 43210"
//               />
//             </div>
//             <div>
//               <Label htmlFor="gst_number">GST Number</Label>
//               <Input
//                 id="gst_number"
//                 value={formData.gst_number}
//                 onChange={(e) => setFormData({ ...formData, gst_number: e.target.value.toUpperCase() })}
//                 placeholder="29ABCDE1234F1Z5"
//               />
//             </div>
//           </div>

//           <div>
//             <Label htmlFor="address">Address</Label>
//             <Input
//               id="address"
//               value={formData.address}
//               onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//               placeholder="Street address"
//             />
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//             <div>
//               <Label htmlFor="city">City</Label>
//               <Input
//                 id="city"
//                 value={formData.city}
//                 onChange={(e) => setFormData({ ...formData, city: e.target.value })}
//                 placeholder="Bangalore"
//               />
//             </div>
//             <div>
//               <Label htmlFor="state">State</Label>
//               <Input
//                 id="state"
//                 value={formData.state}
//                 onChange={(e) => setFormData({ ...formData, state: e.target.value })}
//                 placeholder="Karnataka"
//               />
//             </div>
//             <div>
//               <Label htmlFor="postal_code">Postal Code</Label>
//               <Input
//                 id="postal_code"
//                 value={formData.postal_code}
//                 onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
//                 placeholder="560001"
//               />
//             </div>
//           </div>

//           <div className="flex gap-2 justify-end pt-4">
//             <Button type="button" variant="outline" onClick={onCancel}>
//               Cancel
//             </Button>
//             <Button onClick={handleSubmit} disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
//               {isSubmitting ? 'Saving...' : editData ? 'Update Company' : 'Add Company'}
//             </Button>
//           </div>
//         </div>
//       </CardContent>
//     </Card>
//   )
// }

// // Local Company Table Component
// function LocalCompanyTable({ companies, selectedCompanies, onToggleSelection, onToggleAll, onEdit, onDelete }: {
//   companies: LocalCompany[]
//   selectedCompanies: Set<string>
//   onToggleSelection: (id: string) => void
//   onToggleAll: () => void
//   onEdit: (company: LocalCompany) => void
//   onDelete: (id: string) => void
// }) {
//   return (
//     <div className="border rounded-lg overflow-hidden">
//       <div className="overflow-x-auto">
//         <table className="w-full">
//           <thead className="bg-gray-50 border-b">
//             <tr>
//               <th className="px-4 py-3 text-left">
//                 <input
//                   type="checkbox"
//                   checked={selectedCompanies.size === companies.length && companies.length > 0}
//                   onChange={onToggleAll}
//                   className="rounded"
//                 />
//               </th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Company Name</th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Code</th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Contact Person</th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">GST</th>
//               <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Location</th>
//               <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y">
//             {companies.map((company) => (
//               <tr key={company.id} className="hover:bg-gray-50">
//                 <td className="px-4 py-3">
//                   <input
//                     type="checkbox"
//                     checked={selectedCompanies.has(company.id)}
//                     onChange={() => onToggleSelection(company.id)}
//                     className="rounded"
//                   />
//                 </td>
//                 <td className="px-4 py-3 font-medium">{company.company_name}</td>
//                 <td className="px-4 py-3">
//                   <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-mono">
//                     {company.company_code}
//                   </span>
//                 </td>
//                 <td className="px-4 py-3 text-sm">{company.contact_person || '-'}</td>
//                 <td className="px-4 py-3 text-sm">{company.contact_email || '-'}</td>
//                 <td className="px-4 py-3 text-sm">{company.contact_phone || '-'}</td>
//                 <td className="px-4 py-3 text-sm font-mono">{company.gst_number || '-'}</td>
//                 <td className="px-4 py-3 text-sm">
//                   {company.city && company.state ? `${company.city}, ${company.state}` : '-'}
//                 </td>
//                 <td className="px-4 py-3">
//                   <div className="flex gap-2 justify-center">
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => onEdit(company)}
//                       className="h-8 w-8 p-0"
//                     >
//                       <Edit className="w-4 h-4 text-blue-600" />
//                     </Button>
//                     <Button
//                       variant="ghost"
//                       size="sm"
//                       onClick={() => onDelete(company.id)}
//                       className="h-8 w-8 p-0"
//                     >
//                       <Trash2 className="w-4 h-4 text-red-600" />
//                     </Button>
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   )
// }
