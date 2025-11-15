"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"
import { generateBillPDF } from "@/lib/pdf-generator"

interface BillItem {
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface BillPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  bill: {
    bill_number: string
    bill_date: string
    customer_name: string
    customer_email?: string
    customer_phone?: string
    items: BillItem[]
    total_amount: number
    notes?: string
    shop_name?: string
  } | null
}

export default function BillPreviewModal({ isOpen, onClose, bill }: BillPreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false)

  if (!bill) return null

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      generateBillPDF(bill)
    } catch (error) {
      console.error("Error downloading bill:", error)
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 to-slate-50">
        <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
          <DialogTitle className="text-2xl font-bold text-blue-900">Bill Preview</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </DialogHeader>

        {/* Scrollable Bill Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="bg-white rounded-lg p-8 shadow-sm border border-blue-100">
            {/* Header */}
            <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
              <h1 className="text-3xl font-bold text-blue-900 mb-2">{bill.shop_name || "Medical Shop"}</h1>
              <p className="text-gray-600 text-sm">BILL / INVOICE</p>
            </div>

            {/* Bill Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-sm text-gray-600 mb-1">Bill Number</p>
                <p className="text-lg font-semibold text-blue-900">{bill.bill_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">Bill Date</p>
                <p className="text-lg font-semibold text-blue-900">{new Date(bill.bill_date).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
              <h3 className="font-bold text-blue-900 mb-3">Customer Details</h3>
              <div className="space-y-2 text-sm">
                <p>
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold text-gray-900 ml-2">{bill.customer_name}</span>
                </p>
                {bill.customer_email && (
                  <p>
                    <span className="text-gray-600">Email:</span>
                    <span className="font-semibold text-gray-900 ml-2">{bill.customer_email}</span>
                  </p>
                )}
                {bill.customer_phone && (
                  <p>
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-semibold text-gray-900 ml-2">{bill.customer_phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="mb-8">
              <h3 className="font-bold text-blue-900 mb-4">Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-blue-100 border-b-2 border-blue-300">
                      <th className="text-left px-4 py-3 font-semibold text-blue-900">Product</th>
                      <th className="text-center px-4 py-3 font-semibold text-blue-900">Quantity</th>
                      <th className="text-right px-4 py-3 font-semibold text-blue-900">Unit Price</th>
                      <th className="text-right px-4 py-3 font-semibold text-blue-900">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bill.items.map((item, index) => (
                      <tr key={index} className="border-b border-blue-100 hover:bg-blue-50">
                        <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
                        <td className="text-center px-4 py-3 text-gray-900">{item.quantity}</td>
                        <td className="text-right px-4 py-3 text-gray-900">${item.unit_price.toFixed(2)}</td>
                        <td className="text-right px-4 py-3 font-semibold text-blue-900">
                          ${item.subtotal.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-900 text-white rounded-lg p-4 mb-6 flex justify-between items-center">
              <span className="text-lg font-semibold">Total Amount</span>
              <span className="text-2xl font-bold">${bill.total_amount.toFixed(2)}</span>
            </div>

            {/* Notes */}
            {bill.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-600 mb-1">Notes</p>
                <p className="text-gray-900">{bill.notes}</p>
              </div>
            )}

            {/* Footer */}
            <div className="text-center pt-6 border-t border-blue-200">
              <p className="text-sm text-gray-600">Thank you for your business!</p>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="border-t bg-white px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            {isDownloading ? "Downloading..." : "Download PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}




// "use client"

// import { useState } from "react"
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { Button } from "@/components/ui/button"
// import { Badge } from "@/components/ui/badge"
// import { Download, X } from "lucide-react"
// import { generateBillPDF } from "@/lib/pdf-generator"

// interface BillItem {
//   product_name: string
//   quantity: number
//   unit_price: number
//   subtotal: number
// }

// interface BillPreviewModalProps {
//   isOpen: boolean
//   onClose: () => void
//   bill: {
//     bill_number: string
//     bill_date: string
//     customer_name: string
//     customer_email?: string
//     customer_phone?: string
//     items: BillItem[]
//     total_amount: number
//     notes?: string
//     shop_name?: string
//     purchase_type?: 'local' | 'import'
//     company_name?: string
//     company_code?: string
//   } | null
// }

// export default function BillPreviewModal({ isOpen, onClose, bill }: BillPreviewModalProps) {
//   const [isDownloading, setIsDownloading] = useState(false)

//   if (!bill) return null

//   const handleDownload = async () => {
//     setIsDownloading(true)
//     try {
//       generateBillPDF(bill)
//     } catch (error) {
//       console.error("Error downloading bill:", error)
//     } finally {
//       setIsDownloading(false)
//     }
//   }

//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col bg-gradient-to-br from-blue-50 to-slate-50">
//         <DialogHeader className="flex flex-row items-center justify-between border-b pb-4">
//           <div className="flex items-center gap-3">
//             <DialogTitle className="text-2xl font-bold text-blue-900">Bill Preview</DialogTitle>
//             <Badge variant={bill.purchase_type === 'local' ? 'default' : 'secondary'}>
//               {bill.purchase_type === 'local' ? 'Local' : 'Import'}
//             </Badge>
//           </div>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <X className="h-5 w-5" />
//           </Button>
//         </DialogHeader>

//         {/* Scrollable Bill Content */}
//         <div className="flex-1 overflow-y-auto px-6 py-6">
//           <div className="bg-white rounded-lg p-8 shadow-sm border border-blue-100">
//             {/* Header */}
//             <div className="text-center mb-8 pb-6 border-b-2 border-blue-200">
//               <h1 className="text-3xl font-bold text-blue-900 mb-2">{bill.shop_name || "Medical Shop"}</h1>
//               <p className="text-gray-600 text-sm">BILL / INVOICE</p>
//               {bill.purchase_type === 'import' && bill.company_name && (
//                 <div className="mt-3 pt-3 border-t border-blue-100">
//                   <p className="text-sm text-gray-600">Company:</p>
//                   <p className="text-lg font-semibold text-blue-800">
//                     {bill.company_name} {bill.company_code && `(${bill.company_code})`}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Bill Details */}
//             <div className="grid grid-cols-2 gap-6 mb-8">
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Bill Number</p>
//                 <p className="text-lg font-semibold text-blue-900">{bill.bill_number}</p>
//               </div>
//               <div>
//                 <p className="text-sm text-gray-600 mb-1">Bill Date</p>
//                 <p className="text-lg font-semibold text-blue-900">{new Date(bill.bill_date).toLocaleDateString()}</p>
//               </div>
//             </div>

//             {/* Customer Details */}
//             <div className="bg-blue-50 rounded-lg p-4 mb-8 border border-blue-200">
//               <h3 className="font-bold text-blue-900 mb-3">Customer Details</h3>
//               <div className="space-y-2 text-sm">
//                 <p>
//                   <span className="text-gray-600">Name:</span>
//                   <span className="font-semibold text-gray-900 ml-2">{bill.customer_name}</span>
//                 </p>
//                 {bill.customer_email && (
//                   <p>
//                     <span className="text-gray-600">Email:</span>
//                     <span className="font-semibold text-gray-900 ml-2">{bill.customer_email}</span>
//                   </p>
//                 )}
//                 {bill.customer_phone && (
//                   <p>
//                     <span className="text-gray-600">Phone:</span>
//                     <span className="font-semibold text-gray-900 ml-2">{bill.customer_phone}</span>
//                   </p>
//                 )}
//               </div>
//             </div>

//             {/* Items Table */}
//             <div className="mb-8">
//               <h3 className="font-bold text-blue-900 mb-4">Items</h3>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-blue-100 border-b-2 border-blue-300">
//                       <th className="text-left px-4 py-3 font-semibold text-blue-900">Product</th>
//                       <th className="text-center px-4 py-3 font-semibold text-blue-900">
//                         Quantity {bill.purchase_type === 'import' && '(Packs)'}
//                       </th>
//                       <th className="text-right px-4 py-3 font-semibold text-blue-900">Unit Price</th>
//                       <th className="text-right px-4 py-3 font-semibold text-blue-900">Subtotal</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {bill.items.map((item, index) => (
//                       <tr key={index} className="border-b border-blue-100 hover:bg-blue-50">
//                         <td className="px-4 py-3 text-gray-900">{item.product_name}</td>
//                         <td className="text-center px-4 py-3 text-gray-900">{item.quantity}</td>
//                         <td className="text-right px-4 py-3 text-gray-900">${item.unit_price.toFixed(2)}</td>
//                         <td className="text-right px-4 py-3 font-semibold text-blue-900">
//                           ${item.subtotal.toFixed(2)}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>

//             {/* Total */}
//             <div className="bg-blue-900 text-white rounded-lg p-4 mb-6 flex justify-between items-center">
//               <span className="text-lg font-semibold">Total Amount</span>
//               <span className="text-2xl font-bold">${bill.total_amount.toFixed(2)}</span>
//             </div>

//             {/* Notes */}
//             {bill.notes && (
//               <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
//                 <p className="text-sm text-gray-600 mb-1">Notes</p>
//                 <p className="text-gray-900">{bill.notes}</p>
//               </div>
//             )}

//             {/* Footer */}
//             <div className="text-center pt-6 border-t border-blue-200">
//               <p className="text-sm text-gray-600">Thank you for your business!</p>
//             </div>
//           </div>
//         </div>

//         {/* Download Button */}
//         <div className="border-t bg-white px-6 py-4 flex justify-end gap-3">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//           <Button
//             onClick={handleDownload}
//             disabled={isDownloading}
//             className="bg-blue-600 hover:bg-blue-700 text-white"
//           >
//             <Download className="h-4 w-4 mr-2" />
//             {isDownloading ? "Downloading..." : "Download PDF"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   )
// }