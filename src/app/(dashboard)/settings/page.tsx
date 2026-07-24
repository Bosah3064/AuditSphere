"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { 
  User, Building2, Users, ShieldAlert, Camera, 
  Smartphone, Monitor, Globe, Clock, AlertTriangle, MoreHorizontal, Loader2, Save
} from "lucide-react"
import { toast } from "sonner"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { buttonVariants } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/shared/loading-skeleton"

interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl: string
  jobTitle: string
  phone: string
  bio: string
  role: string
  organizationId: string | null
  organizationName: string
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile")
  const [isLoading, setIsLoading] = React.useState(true)
  const [isSaving, setIsSaving] = React.useState(false)
  const [teamMembers, setTeamMembers] = React.useState<TeamMember[]>([])
  
  const [profile, setProfile] = React.useState<UserProfile>({
    id: "",
    email: "",
    fullName: "",
    avatarUrl: "",
    jobTitle: "",
    phone: "",
    bio: "",
    role: "",
    organizationId: null,
    organizationName: "",
  })

  // Form state (separate from profile so we can track changes)
  const [form, setForm] = React.useState({
    fullName: "",
    jobTitle: "",
    phone: "",
    bio: "",
    organizationName: "",
    industry: "",
    companySize: "",
    timezone: "",
  })

  const supabase = createClient()

  // Load user profile from Supabase Auth + users table
  React.useEffect(() => {
    async function loadProfile() {
      setIsLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Get basic profile from users table (only columns that exist)
        const { data: dbProfile } = await supabase
          .from('users')
          .select('id, full_name, role, organization_id, avatar_url, created_at')
          .eq('id', user.id)
          .single()

        // Try to get organization details separately
        let orgName = ""
        if (dbProfile?.organization_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('name')
            .eq('id', dbProfile.organization_id)
            .single()
          orgName = org?.name || ""
        }

        const fullName = dbProfile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || ""
        
        const loadedProfile: UserProfile = {
          id: user.id,
          email: user.email || "",
          fullName,
          avatarUrl: dbProfile?.avatar_url || user.user_metadata?.avatar_url || "",
          jobTitle: "",
          phone: "",
          bio: "",
          role: dbProfile?.role || "auditor",
          organizationId: dbProfile?.organization_id || null,
          organizationName: orgName,
        }

        setProfile(loadedProfile)
        setForm({
          fullName: loadedProfile.fullName,
          jobTitle: "",
          phone: "",
          bio: "",
          organizationName: orgName,
          industry: "",
          companySize: "",
          timezone: "",
        })

        // Load team members from the same organization
        if (dbProfile?.organization_id) {
          const { data: team } = await supabase
            .from('users')
            .select('id, full_name, role, email')
            .eq('organization_id', dbProfile.organization_id)
            .order('full_name', { ascending: true })

          if (team) {
            setTeamMembers(team.map(m => ({
              id: m.id,
              name: m.full_name || m.email?.split('@')[0] || "Unknown",
              email: m.email || "",
              role: m.role || "auditor",
              status: "Active",
              lastActive: "Active",
            })))
          }
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
        toast.error("Failed to load profile data")
      } finally {
        setIsLoading(false)
      }
    }

    loadProfile()
  }, [])

  // Save profile changes
  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          full_name: form.fullName,
        })
        .eq('id', profile.id)

      if (error) throw error

      // Also update Supabase Auth metadata
      await supabase.auth.updateUser({
        data: { full_name: form.fullName }
      })

      setProfile(prev => ({ ...prev, fullName: form.fullName }))
      toast.success("Profile updated successfully")
    } catch (error) {
      console.error("Failed to save profile:", error)
      toast.error("Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Save organization changes
  const handleSaveOrganization = async () => {
    if (!profile.organizationId) {
      toast.error("No organization linked to your account")
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase
        .from('organizations')
        .update({
          name: form.organizationName,
          industry: form.industry,
          company_size: form.companySize,
          timezone: form.timezone,
        })
        .eq('id', profile.organizationId)

      if (error) throw error
      toast.success("Organization updated")
    } catch (error) {
      console.error("Failed to save organization:", error)
      toast.error("Failed to save organization settings")
    } finally {
      setIsSaving(false)
    }
  }

  // Change password
  const [passwords, setPasswords] = React.useState({ current: "", newPw: "", confirm: "" })
  const handleChangePassword = async () => {
    if (passwords.newPw !== passwords.confirm) {
      toast.error("Passwords do not match")
      return
    }
    if (passwords.newPw.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    setIsSaving(true)
    try {
      const { error } = await supabase.auth.updateUser({ password: passwords.newPw })
      if (error) throw error
      toast.success("Password changed successfully")
      setPasswords({ current: "", newPw: "", confirm: "" })
    } catch (error) {
      console.error("Failed to change password:", error)
      toast.error("Failed to change password")
    } finally {
      setIsSaving(false)
    }
  }

  const getInitials = (name: string) => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase() || "?"
  }

  const getRoleBadge = (role: string) => {
    switch(role.toLowerCase()) {
      case "admin": return <Badge variant="default" className="bg-destructive hover:bg-destructive">Admin</Badge>
      case "reviewer": return <Badge variant="secondary" className="bg-primary/20 text-primary hover:bg-primary/30">Reviewer</Badge>
      case "auditor": return <Badge variant="outline" className="border-accent text-accent">Auditor</Badge>
      default: return <Badge variant="secondary">Viewer</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-6 w-96" />
        <Skeleton className="h-12 w-full max-w-lg" />
        <Skeleton className="h-[400px] w-full max-w-4xl" />
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-6">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings, team, and organization preferences.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="border-b overflow-x-auto pb-px">
          <TabsList className="w-full justify-start h-12 bg-transparent p-0 rounded-none border-b-0 space-x-6 min-w-max">
            <TabsTrigger 
              value="profile" 
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 h-full data-[state=active]:text-foreground text-muted-foreground"
            >
              <User className="w-4 h-4 mr-2" /> Profile
            </TabsTrigger>
            <TabsTrigger 
              value="organization"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 h-full data-[state=active]:text-foreground text-muted-foreground"
            >
              <Building2 className="w-4 h-4 mr-2" /> Organization
            </TabsTrigger>
            <TabsTrigger 
              value="team"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 h-full data-[state=active]:text-foreground text-muted-foreground"
            >
              <Users className="w-4 h-4 mr-2" /> Team
            </TabsTrigger>
            <TabsTrigger 
              value="security"
              className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-2 py-3 h-full data-[state=active]:text-foreground text-muted-foreground"
            >
              <ShieldAlert className="w-4 h-4 mr-2" /> Security
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="max-w-4xl">
          <AnimatePresence mode="wait">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Public Profile</CardTitle>
                    <CardDescription>
                      This is how others will see you on the platform.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                      <div className="relative group cursor-pointer">
                        <Avatar className="w-24 h-24 border-4 border-background shadow-sm">
                          <AvatarImage src={profile.avatarUrl} />
                          <AvatarFallback className="text-xl bg-primary/10 text-primary">
                            {getInitials(profile.fullName)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Camera className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-sm font-medium">Profile Picture</h4>
                        <p className="text-xs text-muted-foreground">JPG, GIF or PNG. 1MB max.</p>
                        <Button variant="outline" size="sm" className="mt-2">Upload New</Button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                          value={form.fullName} 
                          onChange={(e) => setForm(prev => ({ ...prev, fullName: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Email Address</Label>
                        <Input value={profile.email} disabled />
                        <p className="text-[10px] text-muted-foreground">Managed by your authentication provider.</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input 
                          value={form.jobTitle}
                          onChange={(e) => setForm(prev => ({ ...prev, jobTitle: e.target.value }))}
                          placeholder="e.g. Senior Auditor"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Phone Number</Label>
                        <Input 
                          value={form.phone}
                          onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                          type="tel" 
                          placeholder="+254 700 000 000"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Bio</Label>
                      <Textarea 
                        value={form.bio}
                        onChange={(e) => setForm(prev => ({ ...prev, bio: e.target.value }))}
                        className="resize-none min-h-[100px]"
                        placeholder="Tell us a bit about yourself and your expertise..."
                      />
                    </div>

                    <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                      <span className="font-medium">Account Role:</span>{" "}
                      {getRoleBadge(profile.role)}
                      <span className="text-muted-foreground ml-3">
                        Account ID: <code className="text-xs bg-muted px-1 py-0.5 rounded">{profile.id.slice(0, 8)}...</code>
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button onClick={handleSaveProfile} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Save Changes
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* ORGANIZATION TAB */}
            {activeTab === "organization" && (
              <motion.div
                key="org"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Organization Settings</CardTitle>
                    <CardDescription>
                      Manage your company details and platform configuration.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label>Organization Name</Label>
                      <Input 
                        value={form.organizationName}
                        onChange={(e) => setForm(prev => ({ ...prev, organizationName: e.target.value }))}
                        placeholder="Your company name"
                      />
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Industry</Label>
                        <Select value={form.industry} onValueChange={(v) => setForm(prev => ({ ...prev, industry: v || "" }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="financial">Financial Services</SelectItem>
                            <SelectItem value="healthcare">Healthcare</SelectItem>
                            <SelectItem value="tech">Technology</SelectItem>
                            <SelectItem value="manufacturing">Manufacturing</SelectItem>
                            <SelectItem value="gov">Government</SelectItem>
                            <SelectItem value="education">Education</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Company Size</Label>
                        <Select value={form.companySize} onValueChange={(v) => setForm(prev => ({ ...prev, companySize: v || "" }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select size" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="50">1-50 employees</SelectItem>
                            <SelectItem value="200">51-200 employees</SelectItem>
                            <SelectItem value="1000">201-1000 employees</SelectItem>
                            <SelectItem value="1001">1000+ employees</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Default Timezone</Label>
                      <Select value={form.timezone} onValueChange={(v) => setForm(prev => ({ ...prev, timezone: v || "" }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timezone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="eat">East Africa Time (EAT)</SelectItem>
                          <SelectItem value="est">Eastern Time (ET)</SelectItem>
                          <SelectItem value="cst">Central Time (CT)</SelectItem>
                          <SelectItem value="pst">Pacific Time (PT)</SelectItem>
                          <SelectItem value="gmt">Greenwich Mean Time (GMT)</SelectItem>
                          <SelectItem value="cet">Central European Time (CET)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Compliance Frameworks Section */}
                    <div className="pt-4 border-t">
                      <Label className="text-base font-semibold mb-4 block">Compliance Frameworks</Label>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base">ICPAK Audit Manual (Revised)</Label>
                            <p className="text-sm text-muted-foreground">
                              Enforce compliance with ICPAK standards for all audit engagements.
                            </p>
                          </div>
                          <Switch 
                            checked={true}
                            onCheckedChange={() => toast.success("Settings saved")}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <Label className="text-base">IFRS for SMEs</Label>
                            <p className="text-sm text-muted-foreground">
                              Enable specific procedures for SMEs under IFRS guidelines.
                            </p>
                          </div>
                          <Switch 
                            checked={true}
                            onCheckedChange={() => toast.success("Settings saved")}
                            className="data-[state=checked]:bg-primary"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="border-t bg-muted/20 px-6 py-4">
                    <Button onClick={handleSaveOrganization} disabled={isSaving}>
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Update Organization
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {/* TEAM TAB */}
            {activeTab === "team" && (
              <motion.div
                key="team"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle>Team Management</CardTitle>
                      <CardDescription>
                        Manage your team members and their roles.
                      </CardDescription>
                    </div>
                    <Button>
                      <Users className="w-4 h-4 mr-2" />
                      Invite Member
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader className="bg-muted/50">
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Active</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {teamMembers.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                No team members found. Invite your first team member!
                              </TableCell>
                            </TableRow>
                          ) : (
                            teamMembers.map((member) => (
                              <TableRow key={member.id}>
                                <TableCell>
                                  <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                        {getInitials(member.name)}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                      <span className="font-medium">{member.name}</span>
                                      <span className="text-xs text-muted-foreground">{member.email}</span>
                                    </div>
                                    {member.id === profile.id && (
                                      <Badge variant="secondary" className="text-[10px]">You</Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>{getRoleBadge(member.role)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center">
                                    <div className={`w-2 h-2 rounded-full mr-2 ${member.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                    {member.status}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">{member.lastActive}</TableCell>
                                <TableCell>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon", className: "h-8 w-8" })}>
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuGroup>
                                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                        <DropdownMenuItem>Edit Role</DropdownMenuItem>
                                        <DropdownMenuItem>Reset Password</DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-destructive focus:text-destructive">Remove User</DropdownMenuItem>
                                      </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Password & Authentication</CardTitle>
                    <CardDescription>
                      Update your password and secure your account.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 max-w-sm">
                      <div className="space-y-2">
                        <Label>New Password</Label>
                        <Input 
                          type="password"
                          value={passwords.newPw}
                          onChange={(e) => setPasswords(prev => ({ ...prev, newPw: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Confirm New Password</Label>
                        <Input 
                          type="password"
                          value={passwords.confirm}
                          onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                          placeholder="••••••••"
                        />
                      </div>
                      <Button className="w-fit" onClick={handleChangePassword} disabled={isSaving}>
                        {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Change Password
                      </Button>
                    </div>

                    <div className="pt-6 border-t flex items-center justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium flex items-center">
                          <Smartphone className="w-4 h-4 mr-2" />
                          Two-Factor Authentication (2FA)
                        </h4>
                        <p className="text-sm text-muted-foreground max-w-[400px]">
                          Add an extra layer of security to your account by requiring a code from your mobile device upon login.
                        </p>
                      </div>
                      <Switch id="2fa" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Active Sessions</CardTitle>
                    <CardDescription>
                      Review and manage your active web sessions.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-primary/5">
                        <div className="flex items-center gap-4">
                          <Monitor className="w-8 h-8 text-primary" />
                          <div className="space-y-1">
                            <p className="text-sm font-medium">Current Session <Badge variant="secondary" className="ml-2 text-[10px]">Active</Badge></p>
                            <div className="flex items-center text-xs text-muted-foreground gap-2">
                              <Globe className="w-3 h-3" /> {profile.email}
                              <span>•</span>
                              <Clock className="w-3 h-3" /> Active now
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle>Account Info</CardTitle>
                    <CardDescription>
                      Details about your authentication provider and account creation.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-3 text-sm">
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-muted-foreground">Email</span>
                        <span className="font-medium">{profile.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-muted-foreground">User ID</span>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{profile.id}</code>
                      </div>
                      <div className="flex justify-between items-center p-3 rounded-lg border">
                        <span className="text-muted-foreground">Role</span>
                        {getRoleBadge(profile.role)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  )
}
