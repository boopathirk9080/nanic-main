"use client"

import { useEffect, useState } from "react"
import { Save, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Profile {
  id: string
  email: string
  full_name: string | null
  shop_name: string | null
  tax_id: string | null
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    full_name: "",
    shop_name: "",
    tax_id: "",
    email: "",
  })

  const supabase = createClient()

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        console.error("No authenticated user")
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        // If no profile exists, create one
        if (error.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || null,
            }])
            .select()
            .single()

          if (createError) {
            console.error("Error creating profile:", createError)
            return
          }

          setProfile(newProfile)
          setFormData({
            full_name: newProfile.full_name || "",
            shop_name: newProfile.shop_name || "",
            tax_id: newProfile.tax_id || "",
            email: newProfile.email || "",
          })
        }
        return
      }

      setProfile(data)
      setFormData({
        full_name: data.full_name || "",
        shop_name: data.shop_name || "",
        tax_id: data.tax_id || "",
        email: data.email || "",
      })
    } catch (error) {
      console.error("Error in fetchProfile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!profile) return

    try {
      setIsSaving(true)
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: formData.full_name || null,
          shop_name: formData.shop_name || null,
          tax_id: formData.tax_id || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", profile.id)

      if (error) throw error

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        full_name: formData.full_name || null,
        shop_name: formData.shop_name || null,
        tax_id: formData.tax_id || null,
      } : null)

      alert("Settings saved successfully!")
    } catch (error: any) {
      console.error("Error saving profile:", error)
      alert(`Error: ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted mt-1">Manage system configuration and preferences</p>
        </div>
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted mt-1">Manage system configuration and preferences</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Organization Settings</CardTitle>
          <CardDescription>
            Update your organization information and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="shop_name">Organization Name</Label>
              <Input
                id="shop_name"
                type="text"
                value={formData.shop_name}
                onChange={(e) => handleInputChange("shop_name", e.target.value)}
                placeholder="Enter organization name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_id">Tax ID</Label>
              <Input
                id="tax_id"
                type="text"
                value={formData.tax_id}
                onChange={(e) => handleInputChange("tax_id", e.target.value)}
                placeholder="Enter tax ID"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled
                className="bg-gray-50"
              />
              <p className="text-sm text-muted-foreground">
                Email cannot be changed from here. Contact support if needed.
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
