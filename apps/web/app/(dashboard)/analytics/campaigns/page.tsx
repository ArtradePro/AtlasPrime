"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Users,
  Target,
  TrendingUp,
  ArrowUpRight,
  Calendar,
  MoreHorizontal,
} from "lucide-react";

const campaigns = [
  {
    name: "Miami Restaurant Outreach",
    type: "email",
    status: "active",
    leads: 234,
    contacted: 189,
    responded: 45,
    converted: 12,
    responseRate: 23.8,
  },
  {
    name: "Healthcare Q1 Campaign",
    type: "multi-channel",
    status: "active",
    leads: 156,
    contacted: 120,
    responded: 34,
    converted: 8,
    responseRate: 28.3,
  },
  {
    name: "Legal Services Push",
    type: "linkedin",
    status: "paused",
    leads: 89,
    contacted: 67,
    responded: 12,
    converted: 3,
    responseRate: 17.9,
  },
  {
    name: "Automotive Winter Sale",
    type: "email",
    status: "completed",
    leads: 312,
    contacted: 312,
    responded: 89,
    converted: 23,
    responseRate: 28.5,
  },
];

export default function CampaignsAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Campaign Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and optimize your outreach campaigns
          </p>
        </div>
        <Button>
          <Mail className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">791</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Response Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.6%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">46</div>
          </CardContent>
        </Card>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>Overview of all your outreach campaigns</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{campaign.name}</p>
                      <Badge
                        variant={
                          campaign.status === "active"
                            ? "success"
                            : campaign.status === "paused"
                            ? "warning"
                            : "secondary"
                        }
                      >
                        {campaign.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground capitalize">
                      {campaign.type.replace("-", " ")} campaign
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.leads}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.contacted}</p>
                    <p className="text-xs text-muted-foreground">Contacted</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.responded}</p>
                    <p className="text-xs text-muted-foreground">Responded</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">{campaign.converted}</p>
                    <p className="text-xs text-muted-foreground">Converted</p>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center gap-1 text-sm">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      <span className="text-green-500">{campaign.responseRate}%</span>
                    </div>
                    <Progress value={campaign.responseRate} className="h-1 mt-1" />
                  </div>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
