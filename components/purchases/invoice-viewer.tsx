"use client"

import { X, Download, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"
import { generateBillPDF } from "@/lib/pdf-generator"

interface InvoiceViewerProps {
  purchase: any
  onClose: () => void
}

export default function InvoiceViewer({ purchase, onClose }: InvoiceViewerProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
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

  const handleDownload = () => {
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

  const handlePrint = () => {
    window.print()
  }

  const items = purchase.purchase_type === 'local' 
    ? purchase.purchase_items 
    : purchase.import_purchase_items

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center z-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Invoice</h2>
            <p className="text-sm text-gray-500">
              Bill Number: BILL-{purchase.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleDownload}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
              size="sm"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </Button>
            <Button
              onClick={handlePrint}
              variant="outline"
              className="gap-2"
              size="sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Invoice Content */}
        <div className="p-8" id="invoice-content">
          {/* Shop Info & Bill Details */}
          <div className="flex justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-blue-600 mb-2">Medical Shop</h1>
              <p className="text-gray-600">123 Healthcare Street</p>
              <p className="text-gray-600">Salem, Tamil Nadu, India</p>
              <p className="text-gray-600">Phone: +91 1234567890</p>
            </div>
            <div className="text-right">
              <div className="bg-blue-50 px-6 py-4 rounded-lg">
                <p className="text-sm text-gray-600">Invoice Date</p>
                <p className="font-semibold text-lg">{formatDate(purchase.purchase_date)}</p>
                <p className="text-sm text-gray-600 mt-2">Status</p>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  purchase.status === 'completed' ? 'bg-green-100 text-green-800' :
                  purchase.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {purchase.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Company Info */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700 mb-2">Bill To:</h3>
              <p className="font-semibold text-lg">{purchase.customer_name}</p>
              {purchase.customer_email && (
                <p className="text-gray-600 text-sm">{purchase.customer_email}</p>
              )}
              {purchase.customer_phone && (
                <p className="text-gray-600 text-sm">{purchase.customer_phone}</p>
              )}
            </div>

            {purchase.purchase_type === 'import' && purchase.local_companies && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Company:</h3>
                <p className="font-semibold text-lg">{purchase.local_companies.company_name}</p>
                <p className="text-gray-600 text-sm">Code: {purchase.local_companies.company_code}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                  IMPORT
                </span>
              </div>
            )}
            {purchase.purchase_type === 'local' && (
              <div className="bg-green-50 p-4 rounded-lg flex items-center justify-center">
                <span className="inline-block px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-full">
                  LOCAL PURCHASE
                </span>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="font-semibold text-lg mb-4 text-gray-800">Items</h3>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Product</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700">Quantity</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {items?.map((item: any, index: number) => {
                    const productName = purchase.purchase_type === 'local' 
                      ? item.products?.name 
                      : item.import_products?.product_name
                    const quantity = purchase.purchase_type === 'local' 
                      ? item.quantity 
                      : item.quantity_packs

                    return (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="py-3 px-4">
                          <p className="font-medium">{productName || "Product"}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="font-semibold">{quantity}</span> strips
                        </td>
                        <td className="py-3 px-4 text-right text-gray-700">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-blue-600">
                          {formatCurrency(item.subtotal)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Section */}
          <div className="flex justify-end mb-8">
            <div className="w-72">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex justify-between mb-4 pb-4 border-b border-blue-200">
                  <span className="text-gray-700 font-medium">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(purchase.total_amount)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-800">Total Amount:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(purchase.total_amount)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {purchase.notes && (
            <div className="bg-yellow-50 p-4 rounded-lg mb-8">
              <h3 className="font-semibold text-gray-700 mb-2">Notes:</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{purchase.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6 mt-8">
            <div className="text-center text-gray-500 text-sm">
              <p className="mb-2">Thank you for your business!</p>
              <p>For any queries, please contact us at support@medicalshop.com</p>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-content, #invoice-content * {
            visibility: visible;
          }
          #invoice-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}