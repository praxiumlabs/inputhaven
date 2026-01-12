'use client'

import { useEffect, useState } from 'react'
import { Users, Mail, MoreVertical, Crown, Shield, Eye, UserPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Member {
  id: string
  role: string
  joinedAt: string
  user: {
    id: string
    name: string
    email: string
    avatar: string | null
  }
}

interface Workspace {
  id: string
  name: string
  members: Member[]
}

export default function TeamPage() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('MEMBER')
  const [inviting, setInviting] = useState(false)
  const [showInvite, setShowInvite] = useState(false)

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

  useEffect(() => {
    fetchWorkspace()
  }, [])

  const fetchWorkspace = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const res = await fetch(`${apiUrl}/v1/workspaces`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      
      if (data.success && data.data.length > 0) {
        // Fetch first workspace details
        const wsRes = await fetch(`${apiUrl}/v1/workspaces/${data.data[0].id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const wsData = await wsRes.json()
        if (wsData.success) {
          setWorkspace(wsData.data)
        }
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!workspace) return

    const token = localStorage.getItem('token')
    if (!token) return

    setInviting(true)
    try {
      const res = await fetch(`${apiUrl}/v1/workspaces/${workspace.id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole })
      })
      const data = await res.json()
      
      if (data.success) {
        toast.success('Member invited successfully')
        setInviteEmail('')
        setShowInvite(false)
        fetchWorkspace()
      } else {
        toast.error(data.error?.message || 'Failed to invite member')
      }
    } catch (err) {
      toast.error('Failed to invite member')
    } finally {
      setInviting(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'OWNER': return <Crown className="w-4 h-4 text-yellow-500" />
      case 'ADMIN': return <Shield className="w-4 h-4 text-blue-500" />
      case 'VIEWER': return <Eye className="w-4 h-4 text-gray-500" />
      default: return <Users className="w-4 h-4 text-green-500" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Manage your workspace members and permissions
          </p>
        </div>
        <button 
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Invite modal */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="colleague@example.com"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                >
                  <option value="ADMIN">Admin - Full access</option>
                  <option value="MEMBER">Member - Can manage forms</option>
                  <option value="VIEWER">Viewer - Read-only access</option>
                </select>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowInvite(false)}
                  className="flex-1 px-4 py-2.5 border rounded-lg hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {inviting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Send Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="font-semibold">
            {workspace?.name || 'Workspace'} Members
          </h2>
          <p className="text-sm text-muted-foreground">
            {workspace?.members.length || 0} member{workspace?.members.length !== 1 ? 's' : ''}
          </p>
        </div>

        {!workspace || workspace.members.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-1">No team members yet</h3>
            <p className="text-sm text-muted-foreground">
              Invite colleagues to collaborate on forms
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {workspace.members.map((member) => (
              <div key={member.id} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-medium">
                    {member.user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{member.user.name}</p>
                  <p className="text-sm text-muted-foreground">{member.user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getRoleIcon(member.role)}
                  <span className="text-sm capitalize">{member.role.toLowerCase()}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Joined {new Date(member.joinedAt).toLocaleDateString()}
                </p>
                {member.role !== 'OWNER' && (
                  <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <MoreVertical className="w-5 h-5 text-muted-foreground" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Role descriptions */}
      <div className="bg-muted/50 rounded-xl p-6">
        <h3 className="font-semibold mb-4">Role Permissions</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { role: 'Admin', icon: Shield, color: 'text-blue-500', perms: 'Full access to all forms, settings, and team management' },
            { role: 'Member', icon: Users, color: 'text-green-500', perms: 'Can create and manage forms, view submissions' },
            { role: 'Viewer', icon: Eye, color: 'text-gray-500', perms: 'Read-only access to forms and submissions' }
          ].map((item) => (
            <div key={item.role} className="bg-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className={`w-5 h-5 ${item.color}`} />
                <span className="font-medium">{item.role}</span>
              </div>
              <p className="text-sm text-muted-foreground">{item.perms}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
