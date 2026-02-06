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
  Key,
  Plus,
  Copy,
  Eye,
  EyeOff,
  Trash2,
  Clock,
  Activity,
  Shield,
  Check,
} from "lucide-react";

// Mock API keys
const mockApiKeys = [
  {
    id: "1",
    name: "Production API",
    keyPrefix: "ap_prod_x8k",
    permissions: [
      "leads:read",
      "leads:write",
      "contacts:read",
      "analytics:read",
    ],
    lastUsed: "2 hours ago",
    createdAt: "Jan 15, 2026",
    requestsToday: 1234,
    isActive: true,
  },
  {
    id: "2",
    name: "Development API",
    keyPrefix: "ap_dev_7qm",
    permissions: ["leads:read", "contacts:read"],
    lastUsed: "1 week ago",
    createdAt: "Dec 1, 2025",
    requestsToday: 45,
    isActive: true,
  },
  {
    id: "3",
    name: "Zapier Integration",
    keyPrefix: "ap_zap_3fj",
    permissions: ["leads:read", "leads:write", "webhooks:manage"],
    lastUsed: "Just now",
    createdAt: "Feb 1, 2026",
    requestsToday: 567,
    isActive: true,
  },
];

const availableScopes = [
  { scope: "leads:read", description: "Read lead data" },
  { scope: "leads:write", description: "Create and update leads" },
  { scope: "leads:delete", description: "Delete leads" },
  { scope: "contacts:read", description: "Read contact data" },
  { scope: "contacts:write", description: "Create and update contacts" },
  { scope: "campaigns:read", description: "Read campaign data" },
  { scope: "campaigns:write", description: "Create and manage campaigns" },
  { scope: "scraper:run", description: "Run scraper jobs" },
  { scope: "analytics:read", description: "Read analytics data" },
  { scope: "ai:analyze", description: "Use AI analysis features" },
  { scope: "webhooks:manage", description: "Manage webhooks" },
];

export default function ApiKeysPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope],
    );
  };

  const totalRequests = mockApiKeys.reduce(
    (sum, k) => sum + k.requestsToday,
    0,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="text-muted-foreground">
            Manage API keys for programmatic access
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create API Key
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
            <Key className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockApiKeys.filter((k) => k.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Requests Today
            </CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRequests.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">60/min</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Daily Limit</CardTitle>
            <Shield className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">10,000</div>
          </CardContent>
        </Card>
      </div>

      {/* API Keys List */}
      <Card>
        <CardHeader>
          <CardTitle>Your API Keys</CardTitle>
          <CardDescription>
            Keep your API keys secure. Never share them publicly.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockApiKeys.map((apiKey) => (
              <div key={apiKey.id} className="p-4 rounded-lg border bg-card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-semibold">{apiKey.name}</h4>
                      <Badge
                        variant={apiKey.isActive ? "default" : "secondary"}
                      >
                        {apiKey.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    {/* Key preview */}
                    <div className="flex items-center gap-2 mt-2">
                      <code className="px-2 py-1 rounded bg-muted text-sm font-mono">
                        {apiKey.keyPrefix}••••••••••••
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => copyToClipboard(apiKey.keyPrefix)}
                      >
                        {copiedKey === apiKey.keyPrefix ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>

                    {/* Permissions */}
                    <div className="flex items-center gap-2 mt-3 flex-wrap">
                      {apiKey.permissions.map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          {perm}
                        </Badge>
                      ))}
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                      <span>Created {apiKey.createdAt}</span>
                      <span>•</span>
                      <span>Last used {apiKey.lastUsed}</span>
                      <span>•</span>
                      <span>
                        {apiKey.requestsToday.toLocaleString()} requests today
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Get started with the Atlas Prime API
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Base URL</h4>
              <code className="block p-3 rounded bg-muted text-sm font-mono">
                https://api.atlasprime.com/v1
              </code>
            </div>

            <div>
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Include your API key in the Authorization header:
              </p>
              <code className="block p-3 rounded bg-muted text-sm font-mono overflow-x-auto">
                {`curl -H "Authorization: Bearer YOUR_API_KEY" \\
  https://api.atlasprime.com/v1/leads`}
              </code>
            </div>

            <div>
              <h4 className="font-medium mb-2">Example: List Leads</h4>
              <code className="block p-3 rounded bg-muted text-sm font-mono overflow-x-auto">
                {`GET /v1/leads?limit=50&status=new

Response:
{
  "data": [...],
  "pagination": { "page": 1, "total": 234 }
}`}
              </code>
            </div>

            <Button variant="outline">View Full Documentation</Button>
          </div>
        </CardContent>
      </Card>

      {/* Create API Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Create API Key</CardTitle>
              <CardDescription>
                Generate a new API key with specific permissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input
                  placeholder="e.g., Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Permissions</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Select the scopes this key should have access to
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {availableScopes.map((item) => (
                    <button
                      key={item.scope}
                      onClick={() => toggleScope(item.scope)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedScopes.includes(item.scope)
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-4 w-4 rounded border flex items-center justify-center ${
                            selectedScopes.includes(item.scope)
                              ? "bg-primary border-primary"
                              : "border-muted-foreground"
                          }`}
                        >
                          {selectedScopes.includes(item.scope) && (
                            <Check className="h-3 w-3 text-primary-foreground" />
                          )}
                        </div>
                        <span className="font-mono text-xs">{item.scope}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {item.description}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName("");
                    setSelectedScopes([]);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewKeyName("");
                    setSelectedScopes([]);
                  }}
                  disabled={!newKeyName || selectedScopes.length === 0}
                >
                  <Key className="mr-2 h-4 w-4" />
                  Create Key
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
