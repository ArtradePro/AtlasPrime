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
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Plug,
  Check,
  X,
  RefreshCw,
  ExternalLink,
  Settings,
  AlertCircle,
} from "lucide-react";

// Mock integrations
const integrations = [
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sync contacts and deals with HubSpot CRM",
    icon: "🧡",
    status: "connected",
    lastSync: "2 hours ago",
    syncedRecords: 1243,
  },
  {
    id: "salesforce",
    name: "Salesforce",
    description: "Bi-directional sync with Salesforce",
    icon: "☁️",
    status: "disconnected",
    lastSync: null,
    syncedRecords: 0,
  },
  {
    id: "calendly",
    name: "Calendly",
    description: "Schedule meetings directly from lead pages",
    icon: "📅",
    status: "connected",
    lastSync: "5 minutes ago",
    syncedRecords: 89,
  },
  {
    id: "slack",
    name: "Slack",
    description: "Get notifications for new leads and deals",
    icon: "💬",
    status: "connected",
    lastSync: "Just now",
    syncedRecords: null,
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 5000+ apps via Zapier",
    icon: "⚡",
    status: "connected",
    lastSync: "1 hour ago",
    syncedRecords: null,
  },
  {
    id: "google_calendar",
    name: "Google Calendar",
    description: "Sync meetings and follow-ups",
    icon: "📆",
    status: "disconnected",
    lastSync: null,
    syncedRecords: 0,
  },
  {
    id: "mailchimp",
    name: "Mailchimp",
    description: "Sync contacts for email marketing",
    icon: "🐵",
    status: "error",
    lastSync: "Failed 3 hours ago",
    error: "API key expired",
    syncedRecords: 456,
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Track payments and subscriptions",
    icon: "💳",
    status: "disconnected",
    lastSync: null,
    syncedRecords: 0,
  },
];

export default function IntegrationsPage() {
  const [activeIntegrations] = useState(integrations);

  const connectedCount = activeIntegrations.filter(
    (i) => i.status === "connected",
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">
          Connect Atlas Prime with your favorite tools
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <Check className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectedCount}</div>
            <p className="text-xs text-muted-foreground">
              of {activeIntegrations.length} available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Synced Records
            </CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeIntegrations
                .reduce((sum, i) => sum + (i.syncedRecords || 0), 0)
                .toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeIntegrations.filter((i) => i.status === "error").length}
            </div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Integrations Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {activeIntegrations.map((integration) => (
          <Card
            key={integration.id}
            className={
              integration.status === "error" ? "border-yellow-500/50" : ""
            }
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{integration.icon}</span>
                  <div>
                    <CardTitle className="text-lg">
                      {integration.name}
                    </CardTitle>
                    <CardDescription>{integration.description}</CardDescription>
                  </div>
                </div>
                <Badge
                  variant={
                    integration.status === "connected"
                      ? "default"
                      : integration.status === "error"
                        ? "destructive"
                        : "secondary"
                  }
                >
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Error message */}
              {integration.status === "error" && integration.error && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-200 text-sm flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {integration.error}
                </div>
              )}

              {/* Sync info */}
              {integration.status === "connected" && (
                <div className="mb-4 text-sm text-muted-foreground">
                  <p>Last sync: {integration.lastSync}</p>
                  {integration.syncedRecords !== null && (
                    <p>
                      {integration.syncedRecords.toLocaleString()} records
                      synced
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2">
                {integration.status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Configure
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                    >
                      Disconnect
                    </Button>
                  </>
                ) : integration.status === "error" ? (
                  <>
                    <Button size="sm">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Reconnect
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Button>
                  </>
                ) : (
                  <Button size="sm">
                    <Plug className="mr-2 h-4 w-4" />
                    Connect
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Settings</CardTitle>
          <CardDescription>
            Configure webhooks for real-time data sync
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>New Lead Webhook</Label>
              <p className="text-sm text-muted-foreground">
                Trigger when a new lead is created
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Deal Stage Change</Label>
              <p className="text-sm text-muted-foreground">
                Trigger when a deal moves stages
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Task Completed</Label>
              <p className="text-sm text-muted-foreground">
                Trigger when a task is marked complete
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
