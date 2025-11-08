"use client"

import { Save } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Manage system configuration and preferences</p>
      </div>

      <div className="bg-white rounded-lg border border-border p-6 max-w-2xl">
        <h2 className="text-xl font-semibold text-foreground mb-6">Organization Settings</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Organization Name</label>
            <input
              type="text"
              defaultValue="Healthcare Provider Inc."
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tax ID</label>
            <input
              type="text"
              defaultValue="12-3456789"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Contact Email</label>
            <input
              type="email"
              defaultValue="billing@healthcare.com"
              className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <button className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors">
            <Save className="w-5 h-5" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}
