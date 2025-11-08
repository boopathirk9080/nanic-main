"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  user: any
}

export default function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">Medical Billing</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavLink href="/dashboard" label="Dashboard" />
          <NavLink href="/dashboard/patients" label="Patients" />
          <NavLink href="/dashboard/claims" label="Claims" />
          <NavLink href="/dashboard/payments" label="Payments" />
          <NavLink href="/dashboard/reports" label="Reports" />
        </nav>
        <div className="p-4 border-t border-slate-700">
          <Button onClick={handleLogout} variant="outline" className="w-full justify-start bg-transparent" size="sm">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-md">
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium capitalize">
              {user?.role?.replace("_", " ")}
            </span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} className="block px-4 py-2 rounded-md hover:bg-slate-800 transition-colors text-sm">
      {label}
    </a>
  )
}
