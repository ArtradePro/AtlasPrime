"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Users,
  Mail,
  Shield,
  Clock,
  MoreVertical,
  Plus,
  UserPlus,
  Check,
  X,
  Edit,
  Trash2,
} from "lucide-react";

// Mock team data
const mockTeamMembers = [
  {
    id: "1",
    name: "John Admin",
    email: "john@company.com",
    role: "Admin",
    avatar: null,
    status: "active",
    lastActive: "Just now",
  },
  {
    id: "2",
    name: "Sarah Manager",
    email: "sarah@company.com",
    role: "Manager",
    avatar: null,
    status: "active",
    lastActive: "2 hours ago",
  },
  {
    id: "3",
    name: "Mike Sales",
    email: "mike@company.com",
    role: "Sales Rep",
    avatar: null,
    status: "active",
    lastActive: "1 day ago",
  },
  {
    id: "4",
    name: "Emily Rep",
    email: "emily@company.com",
    role: "Sales Rep",
    avatar: null,
    status: "active",
    lastActive: "3 hours ago",
  },
];

const mockInvites = [
  {
    id: "1",
    email: "newuser@company.com",
    role: "Sales Rep",
    invitedBy: "John Admin",
    createdAt: "2 days ago",
    expiresIn: "5 days",
  },
];

const mockRoles = [
  {
    name: "Admin",
    description: "Full access to all features",
    members: 1,
    color: "bg-red-500",
  },
  {
    name: "Manager",
    description: "Team and campaign management",
    members: 1,
    color: "bg-blue-500",
  },
  {
    name: "Sales Rep",
    description: "Lead management and outreach",
    members: 2,
    color: "bg-green-500",
  },
  {
    name: "Viewer",
    description: "Read-only access",
    members: 0,
    color: "bg-gray-500",
  },
];

export default function TeamPage() {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Sales Rep");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">
            Manage team members, roles, and permissions
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockTeamMembers.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Invites
            </CardTitle>
            <Mail className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockInvites.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockRoles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                mockTeamMembers.filter((m) => m.lastActive === "Just now")
                  .length
              }
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Manage your team and their access levels
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTeamMembers.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-semibold text-primary">
                      {member.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {member.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant="outline">{member.role}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {member.lastActive}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {mockInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Invites</CardTitle>
            <CardDescription>
              Invitations waiting for acceptance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockInvites.map((invite) => (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium">{invite.email}</p>
                      <p className="text-sm text-muted-foreground">
                        Invited by {invite.invitedBy} • {invite.createdAt}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <Badge variant="secondary">{invite.role}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires in {invite.expiresIn}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Roles */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Manage access levels for your team
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            New Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {mockRoles.map((role) => (
              <div key={role.name} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${role.color}`} />
                    <h4 className="font-semibold">{role.name}</h4>
                  </div>
                  <Badge variant="secondary">{role.members} members</Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  {role.description}
                </p>
                <Button variant="ghost" size="sm" className="w-full">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Permissions
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
              <CardDescription>
                Send an invitation to join your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="grid grid-cols-2 gap-2">
                  {mockRoles.map((role) => (
                    <Button
                      key={role.name}
                      variant={inviteRole === role.name ? "default" : "outline"}
                      size="sm"
                      className="justify-start"
                      onClick={() => setInviteRole(role.name)}
                    >
                      <div
                        className={`h-2 w-2 rounded-full ${role.color} mr-2`}
                      />
                      {role.name}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowInviteModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowInviteModal(false)}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Invite
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
