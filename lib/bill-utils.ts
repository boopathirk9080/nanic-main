import { createClient } from "@/lib/supabase/client"

export interface BillItem {
  product_name: string
  quantity: number
  unit_price: number
  subtotal: number
}

export const saveBill = async (
  purchaseId: string,
  billName: string,
  items: BillItem[],
  totalAmount: number,
  customerName: string,
  customerEmail?: string,
  customerPhone?: string,
  notes?: string,
) => {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  // Generate bill number
  const billNumber = `BILL-${Date.now()}`

  const { data, error } = await supabase.from("billings").insert([
    {
      user_id: user.id,
      purchase_id: purchaseId,
      bill_name: billName,
      bill_number: billNumber,
      customer_name: customerName,
      customer_email: customerEmail,
      customer_phone: customerPhone,
      items: items,
      total_amount: totalAmount,
      notes: notes,
    },
  ])

  if (error) throw error
  return data
}

export const getBills = async (userId: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("billings")
    .select("*")
    .eq("user_id", userId)
    .order("bill_date", { ascending: false })

  if (error) throw error
  return data
}

export const getBillsByDateRange = async (userId: string, startDate: string, endDate: string) => {
  const supabase = createClient()

  const { data, error } = await supabase
    .from("billings")
    .select("*")
    .eq("user_id", userId)
    .gte("bill_date", startDate)
    .lte("bill_date", endDate)
    .order("bill_date", { ascending: false })

  if (error) throw error
  return data
}
