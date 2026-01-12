'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User, Bell, Key, Shield, CreditCard } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name: string
  email: string
  avatar: string | null
  plan: string
  emailVerified: boolean
  twoFactorEnabled: boolean
}

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('profile')
  const [formData, setFormData] = useState({ name: '' })

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const res = await fetch(`${apiUrl}/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
        setFormData({ name: data.data.name })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    setSaving(true)
    try {
      const res = await fetch(`${apiUrl}/v1/users/me`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (data.success) {
        setUser(data.data)
        toast.success('Settings saved')
      }
    } catch (err) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'api-keys', label: 'API Keys', icon: Key },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className="w-48 space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                activeTab === tab.id
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted text-muted-foreground'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Profile Settings</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full px-4 py-3 border rounded-lg bg-muted/50 text-muted-foreground"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Contact support to change your email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Plan</label>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-lg font-medium">
                    {user?.plan || 'FREE'}
                  </span>
                  <button className="text-sm text-primary hover:underline">
                    Upgrade Plan
                  </button>
                </div>
              </div>

              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-primary-foreground px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Changes
              </button>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              
              {[
                { id: 'email_submissions', label: 'New submission notifications', description: 'Get notified when you receive new form submissions' },
                { id: 'email_weekly', label: 'Weekly digest', description: 'Receive a weekly summary of your form activity' },
                { id: 'email_marketing', label: 'Product updates', description: 'Learn about new features and improvements' }
              ].map((item) => (
                <div key={item.id} className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'api-keys' && (
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">API Keys</h2>
                <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                  Generate New Key
                </button>
              </div>
              
              <p className="text-muted-foreground">
                API keys allow you to access the InputHaven API programmatically.
                Keep your keys secure and never share them publicly.
              </p>

              <div className="border rounded-lg p-8 text-center text-muted-foreground">
                <Key className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No API keys created yet</p>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Security Settings</h2>
              
              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
                  {user?.twoFactorEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Change Password</p>
                  <p className="text-sm text-muted-foreground">
                    Update your password regularly for better security
                  </p>
                </div>
                <button className="px-4 py-2 border rounded-lg hover:bg-muted transition-colors text-sm">
                  Change
                </button>
              </div>

              <div className="flex items-start justify-between p-4 border rounded-lg border-destructive/50">
                <div>
                  <p className="font-medium text-destructive">Delete Account</p>
                  <p className="text-sm text-muted-foreground">
                    Permanently delete your account and all data
                  </p>
                </div>
                <button className="px-4 py-2 border border-destructive text-destructive rounded-lg hover:bg-destructive/10 transition-colors text-sm">
                  Delete
                </button>
              </div>
            </div>
          )}

          {activeTab === 'billing' && (
            <div className="bg-white rounded-xl border p-6 space-y-6">
              <h2 className="text-lg font-semibold">Billing & Plan</h2>
              
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-medium">Current Plan: {user?.plan || 'FREE'}</p>
                    <p className="text-sm text-muted-foreground">
                      250 submissions/month • 1 form
                    </p>
                  </div>
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors text-sm">
                    Upgrade Plan
                  </button>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  37 of 250 submissions used this month
                </p>
              </div>

              <div>
                <h3 className="font-medium mb-4">Payment Method</h3>
                <div className="border rounded-lg p-8 text-center text-muted-foreground">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No payment method on file</p>
                  <button className="mt-4 text-primary hover:underline text-sm">
                    Add payment method
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
