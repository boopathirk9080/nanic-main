import jsPDF from "jspdf"

interface BillItem {
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

interface BillData {
  bill_number: string
  bill_date: string
  customer_name: string
  customer_email?: string
  customer_phone?: string
  items: BillItem[]
  total_amount: number
  notes?: string
  shop_name?: string
}

export const generateBillPDF = (billData: BillData): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header
  doc.setFontSize(20)
  doc.setTextColor(14, 165, 233) // Primary blue color
  doc.text(billData.shop_name || "Medical Shop", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 15
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("BILL / INVOICE", pageWidth / 2, yPosition, { align: "center" })

  // Bill details
  yPosition += 15
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.text(`Bill Number: ${billData.bill_number}`, 20, yPosition)
  yPosition += 7
  doc.text(`Bill Date: ${new Date(billData.bill_date).toLocaleDateString()}`, 20, yPosition)

  // Customer details
  yPosition += 15
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.text("CUSTOMER DETAILS", 20, yPosition)
  yPosition += 7
  doc.setFont(undefined, "normal")
  doc.setFontSize(9)
  doc.text(`Name: ${billData.customer_name}`, 20, yPosition)
  yPosition += 5
  if (billData.customer_email) {
    doc.text(`Email: ${billData.customer_email}`, 20, yPosition)
    yPosition += 5
  }
  if (billData.customer_phone) {
    doc.text(`Phone: ${billData.customer_phone}`, 20, yPosition)
    yPosition += 5
  }

  // Items table - Manual rendering
  yPosition += 10
  const colWidths = { product: 80, quantity: 25, price: 35, subtotal: 35 }
  const tableStartX = 20
  const tableStartY = yPosition
  const rowHeight = 8
  const headerHeight = 10

  // Table header
  doc.setFillColor(14, 165, 233)
  doc.setTextColor(255, 255, 255)
  doc.setFont(undefined, "bold")
  doc.setFontSize(9)

  doc.rect(tableStartX, tableStartY, colWidths.product, headerHeight, "F")
  doc.text("Product", tableStartX + 2, tableStartY + 6)

  doc.rect(tableStartX + colWidths.product, tableStartY, colWidths.quantity, headerHeight, "F")
  doc.text("Qty", tableStartX + colWidths.product + 2, tableStartY + 6)

  doc.rect(tableStartX + colWidths.product + colWidths.quantity, tableStartY, colWidths.price, headerHeight, "F")
  doc.text("Price", tableStartX + colWidths.product + colWidths.quantity + 2, tableStartY + 6)

  doc.rect(
    tableStartX + colWidths.product + colWidths.quantity + colWidths.price,
    tableStartY,
    colWidths.subtotal,
    headerHeight,
    "F",
  )
  doc.text("Subtotal", tableStartX + colWidths.product + colWidths.quantity + colWidths.price + 2, tableStartY + 6)

  // Table rows
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "normal")
  doc.setFontSize(8)

  billData.items.forEach((item, index) => {
    const rowY = tableStartY + headerHeight + index * rowHeight

    // Alternate row colors
    if (index % 2 === 0) {
      doc.setFillColor(240, 249, 255)
      doc.rect(
        tableStartX,
        rowY,
        colWidths.product + colWidths.quantity + colWidths.price + colWidths.subtotal,
        rowHeight,
        "F",
      )
    }

    // Draw borders
    doc.setDrawColor(200, 200, 200)
    doc.rect(tableStartX, rowY, colWidths.product, rowHeight)
    doc.rect(tableStartX + colWidths.product, rowY, colWidths.quantity, rowHeight)
    doc.rect(tableStartX + colWidths.product + colWidths.quantity, rowY, colWidths.price, rowHeight)
    doc.rect(
      tableStartX + colWidths.product + colWidths.quantity + colWidths.price,
      rowY,
      colWidths.subtotal,
      rowHeight,
    )

    // Text
    doc.setTextColor(0, 0, 0)
    doc.text(item.product_name.substring(0, 20), tableStartX + 2, rowY + 5)
    doc.text(item.quantity.toString(), tableStartX + colWidths.product + 2, rowY + 5)
    doc.text(`$${item.unit_price.toFixed(2)}`, tableStartX + colWidths.product + colWidths.quantity + 2, rowY + 5)
    doc.text(
      `$${item.subtotal.toFixed(2)}`,
      tableStartX + colWidths.product + colWidths.quantity + colWidths.price + 2,
      rowY + 5,
    )
  })

  // Total
  yPosition = tableStartY + headerHeight + billData.items.length * rowHeight + 15
  doc.setFont(undefined, "bold")
  doc.setFontSize(12)
  doc.setTextColor(14, 165, 233)
  doc.text(`Total Amount: $${billData.total_amount.toFixed(2)}`, pageWidth - 20, yPosition, {
    align: "right",
  })

  // Notes
  if (billData.notes) {
    yPosition += 15
    doc.setFont(undefined, "normal")
    doc.setFontSize(9)
    doc.setTextColor(0, 0, 0)
    doc.text("Notes:", 20, yPosition)
    yPosition += 5
    doc.text(billData.notes, 20, yPosition, { maxWidth: pageWidth - 40 })
  }

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150, 150, 150)
  doc.text("Thank you for your business!", pageWidth / 2, pageHeight - 10, { align: "center" })

  // Download
  doc.save(`Bill_${billData.bill_number}.pdf`)
}

export const generateMultipleBillsPDF = (bills: BillData[]): void => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()

  bills.forEach((bill, index) => {
    if (index > 0) {
      doc.addPage()
    }

    let yPosition = 20

    // Header
    doc.setFontSize(16)
    doc.setTextColor(14, 165, 233)
    doc.text(bill.shop_name || "Medical Shop", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 12
    doc.setFontSize(9)
    doc.setTextColor(100, 100, 100)
    doc.text("BILL / INVOICE", pageWidth / 2, yPosition, { align: "center" })

    yPosition += 12
    doc.setFontSize(8)
    doc.setTextColor(0, 0, 0)
    doc.text(`Bill #: ${bill.bill_number} | Date: ${new Date(bill.bill_date).toLocaleDateString()}`, 20, yPosition)

    yPosition += 8
    doc.setFont(undefined, "bold")
    doc.text(`Customer: ${bill.customer_name}`, 20, yPosition)

    // Items table - Manual rendering
    yPosition += 8
    const colWidths = { product: 70, quantity: 20, price: 30, subtotal: 30 }
    const tableStartX = 20
    const tableStartY = yPosition
    const rowHeight = 7
    const headerHeight = 8

    // Table header
    doc.setFillColor(14, 165, 233)
    doc.setTextColor(255, 255, 255)
    doc.setFont(undefined, "bold")
    doc.setFontSize(7)

    doc.rect(tableStartX, tableStartY, colWidths.product, headerHeight, "F")
    doc.text("Product", tableStartX + 1, tableStartY + 5)

    doc.rect(tableStartX + colWidths.product, tableStartY, colWidths.quantity, headerHeight, "F")
    doc.text("Qty", tableStartX + colWidths.product + 1, tableStartY + 5)

    doc.rect(tableStartX + colWidths.product + colWidths.quantity, tableStartY, colWidths.price, headerHeight, "F")
    doc.text("Price", tableStartX + colWidths.product + colWidths.quantity + 1, tableStartY + 5)

    doc.rect(
      tableStartX + colWidths.product + colWidths.quantity + colWidths.price,
      tableStartY,
      colWidths.subtotal,
      headerHeight,
      "F",
    )
    doc.text("Subtotal", tableStartX + colWidths.product + colWidths.quantity + colWidths.price + 1, tableStartY + 5)

    // Table rows
    doc.setTextColor(0, 0, 0)
    doc.setFont(undefined, "normal")
    doc.setFontSize(7)

    bill.items.forEach((item, itemIndex) => {
      const rowY = tableStartY + headerHeight + itemIndex * rowHeight

      if (itemIndex % 2 === 0) {
        doc.setFillColor(240, 249, 255)
        doc.rect(
          tableStartX,
          rowY,
          colWidths.product + colWidths.quantity + colWidths.price + colWidths.subtotal,
          rowHeight,
          "F",
        )
      }

      doc.setDrawColor(200, 200, 200)
      doc.rect(tableStartX, rowY, colWidths.product, rowHeight)
      doc.rect(tableStartX + colWidths.product, rowY, colWidths.quantity, rowHeight)
      doc.rect(tableStartX + colWidths.product + colWidths.quantity, rowY, colWidths.price, rowHeight)
      doc.rect(
        tableStartX + colWidths.product + colWidths.quantity + colWidths.price,
        rowY,
        colWidths.subtotal,
        rowHeight,
      )

      doc.setTextColor(0, 0, 0)
      doc.text(item.product_name.substring(0, 15), tableStartX + 1, rowY + 4)
      doc.text(item.quantity.toString(), tableStartX + colWidths.product + 1, rowY + 4)
      doc.text(`$${item.unit_price.toFixed(2)}`, tableStartX + colWidths.product + colWidths.quantity + 1, rowY + 4)
      doc.text(
        `$${item.subtotal.toFixed(2)}`,
        tableStartX + colWidths.product + colWidths.quantity + colWidths.price + 1,
        rowY + 4,
      )
    })

    yPosition = tableStartY + headerHeight + bill.items.length * rowHeight + 8
    doc.setFont(undefined, "bold")
    doc.setFontSize(9)
    doc.setTextColor(14, 165, 233)
    doc.text(`Total: $${bill.total_amount.toFixed(2)}`, pageWidth - 20, yPosition, { align: "right" })
  })

  doc.save(`Bills_Statement_${new Date().toISOString().split("T")[0]}.pdf`)
}
