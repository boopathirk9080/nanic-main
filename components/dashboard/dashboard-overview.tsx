"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Package, ShoppingCart, DollarSign, TrendingUp, Calendar, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface DashboardStats {
  totalProducts: number
  lowStockProducts: number
  totalRevenue: number
  totalPurchases: number
  monthlyRevenue: Array<{ month: string; revenue: number; purchases: number }>
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  recentPurchases: Array<{
    id: string
    customer_name: string
    total_amount: number
    purchase_date: string
  }>
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
    totalPurchases: 0,
    monthlyRevenue: [],
    topProducts: [],
    recentPurchases: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [weekFilter, setWeekFilter] = useState<number | null>(null)
  const [customDateRange, setCustomDateRange] = useState<{ startDate: string; endDate: string }>({
    startDate: "",
    endDate: "",
  })
  const [showCustomRange, setShowCustomRange] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchDashboardStats()
  }, [weekFilter, customDateRange])

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true)

      // Get current authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError) {
        console.error("Error getting user:", userError)
        return
      }
      if (!user) {
        console.error("No authenticated user found")
        setIsLoading(false)
        return
      }

      let purchasesQuery = supabase
        .from("purchases")
        .select("*")
        .eq("user_id", user.id)

      if (customDateRange.startDate && customDateRange.endDate) {
        purchasesQuery = purchasesQuery
          .gte("purchase_date", new Date(customDateRange.startDate).toISOString())
          .lte("purchase_date", new Date(customDateRange.endDate).toISOString())
      } else if (weekFilter) {
        const endDate = new Date()
        const startDate = new Date()
        startDate.setDate(startDate.getDate() - weekFilter * 7)

        purchasesQuery = purchasesQuery
          .gte("purchase_date", startDate.toISOString())
          .lte("purchase_date", endDate.toISOString())
      }

      // Fetch products for current user
      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("user_id", user.id)

      if (productsError) {
        console.error("Error fetching products:", productsError)
      }

      // Fetch purchases with optional date filter for current user
      const { data: purchases, error: purchasesError } = await purchasesQuery

      if (purchasesError) {
        console.error("Error fetching purchases:", purchasesError)
      }

      // Fetch purchase items for revenue calculation (only for user's purchases)
      let purchaseItems: any[] = []
      if (purchases && purchases.length > 0) {
        const { data: items, error: purchaseItemsError } = await supabase
          .from("purchase_items")
          .select("*")
          .in("purchase_id", purchases.map(p => p.id))

        if (purchaseItemsError) {
          console.error("Error fetching purchase items:", purchaseItemsError)
        } else {
          purchaseItems = items || []
        }
      }



      const totalProducts = products?.length || 0
      const lowStockProducts = products?.filter((p) => p.quantity < 10).length || 0
      const totalRevenue = purchases?.reduce((sum, p) => sum + p.total_amount, 0) || 0
      const totalPurchases = purchases?.length || 0

      // Calculate monthly revenue
      const monthlyData: { [key: string]: { revenue: number; purchases: number } } = {}
      purchases?.forEach((purchase) => {
        const date = new Date(purchase.purchase_date)
        const monthKey = date.toLocaleDateString("en-US", { month: "short", year: "numeric" })

        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { revenue: 0, purchases: 0 }
        }
        monthlyData[monthKey].revenue += purchase.total_amount
        monthlyData[monthKey].purchases += 1
      })

      const monthlyRevenue = Object.entries(monthlyData)
        .map(([month, data]) => ({
          month,
          revenue: data.revenue,
          purchases: data.purchases,
        }))
        .slice(-6)

      // Calculate top products
      const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {}
      purchaseItems?.forEach((item) => {
        if (!productSales[item.product_id]) {
          const product = products?.find((p) => p.id === item.product_id)
          productSales[item.product_id] = {
            name: product?.name || "Unknown",
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[item.product_id].quantity += item.quantity
        productSales[item.product_id].revenue += item.subtotal
      })

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5)

      // Get recent purchases
      const recentPurchases = (purchases || [])
        .sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())
        .slice(0, 5)

      setStats({
        totalProducts,
        lowStockProducts,
        totalRevenue,
        totalPurchases,
        monthlyRevenue,
        topProducts,
        recentPurchases,
      })
    } catch (error) {
      console.error("Error fetching dashboard stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyCustomRange = () => {
    if (customDateRange.startDate && customDateRange.endDate) {
      setWeekFilter(null)
      setShowCustomRange(false)
    }
  }

  const handleClearFilters = () => {
    setWeekFilter(null)
    setCustomDateRange({ startDate: "", endDate: "" })
    setShowCustomRange(false)
  }

  const metricCards = [
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      icon: <Package className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-700",
    },
    {
      label: "Low Stock Items",
      value: stats.lowStockProducts.toString(),
      icon: <TrendingUp className="w-5 h-5" />,
      color: "bg-red-100 text-red-700",
    },
    {
      label: "Total Revenue",
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: <DollarSign className="w-5 h-5" />,
      color: "bg-green-100 text-green-700",
    },
    {
      label: "Total Purchases",
      value: stats.totalPurchases.toString(),
      icon: <ShoppingCart className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-700",
    },
  ]

  const isFilterActive = weekFilter !== null || (customDateRange.startDate && customDateRange.endDate)

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Medical Shop Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time inventory and sales analytics</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={weekFilter === null && !customDateRange.startDate ? "default" : "outline"}
            onClick={handleClearFilters}
            className="gap-2"
          >
            <Calendar className="w-4 h-4" />
            All Time
          </Button>
          <Button
            variant={weekFilter === 1 ? "default" : "outline"}
            onClick={() => {
              setWeekFilter(1)
              setCustomDateRange({ startDate: "", endDate: "" })
            }}
            className="gap-2"
          >
            This Week
          </Button>
          <Button
            variant={weekFilter === 2 ? "default" : "outline"}
            onClick={() => {
              setWeekFilter(2)
              setCustomDateRange({ startDate: "", endDate: "" })
            }}
            className="gap-2"
          >
            Last 2 Weeks
          </Button>
          <Button
            variant={weekFilter === 4 ? "default" : "outline"}
            onClick={() => {
              setWeekFilter(4)
              setCustomDateRange({ startDate: "", endDate: "" })
            }}
            className="gap-2"
          >
            Last Month
          </Button>
          <Button
            variant={weekFilter === 12 ? "default" : "outline"}
            onClick={() => {
              setWeekFilter(12)
              setCustomDateRange({ startDate: "", endDate: "" })
            }}
            className="gap-2"
          >
            Last 3 Months
          </Button>
          <Button
            variant={showCustomRange ? "default" : "outline"}
            onClick={() => setShowCustomRange(!showCustomRange)}
            className="gap-2"
          >
            Custom Range
          </Button>
        </div>
      </div>

      {showCustomRange && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-2">Start Date</label>
                <Input
                  type="date"
                  value={customDateRange.startDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, startDate: e.target.value })}
                />
              </div>
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-700 block mb-2">End Date</label>
                <Input
                  type="date"
                  value={customDateRange.endDate}
                  onChange={(e) => setCustomDateRange({ ...customDateRange, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleApplyCustomRange} className="bg-blue-600 hover:bg-blue-700">
                Apply
              </Button>
              <Button variant="outline" onClick={() => setShowCustomRange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isFilterActive && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex justify-between items-center">
          <span className="text-sm text-blue-900 font-medium">
            {customDateRange.startDate && customDateRange.endDate
              ? `Filtered: ${customDateRange.startDate} to ${customDateRange.endDate}`
              : `Filtered: Last ${weekFilter} week(s)`}
          </span>
          <Button variant="ghost" size="sm" onClick={handleClearFilters}>
            Clear Filter
          </Button>
        </div>
      )}

      <div className="grid grid-cols-4 gap-4">
        {metricCards.map((card, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-600">{card.label}</p>
                  <p className="text-2xl font-bold mt-1">{card.value}</p>
                </div>
                <div className={`p-2 rounded-lg ${card.color}`}>{card.icon}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Revenue & Purchases</CardTitle>
            <CardDescription>Revenue and purchase count trend</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  <Line yAxisId="right" type="monotone" dataKey="purchases" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 text-gray-500">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
            <CardDescription>By revenue</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.topProducts.length > 0 ? (
              <div className="space-y-4">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-600">{product.quantity} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-blue-600">${product.revenue.toFixed(2)}</p>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{
                            width: `${(product.revenue / (stats.topProducts[0]?.revenue || 1)) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No sales data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Purchases</CardTitle>
          <CardDescription>Latest customer transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.recentPurchases.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Customer</th>
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-right py-3 px-4 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{purchase.customer_name}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(purchase.purchase_date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-green-600">
                        ${purchase.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">No purchases yet</div>
          )}
        </CardContent>
      </Card>

      {stats.lowStockProducts > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-900">Low Stock Alert</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-800">
              {stats.lowStockProducts} product(s) have stock below 10 units. Please reorder soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
