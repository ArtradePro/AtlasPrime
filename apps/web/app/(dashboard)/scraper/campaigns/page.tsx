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
import { Plus, Play, Pause, Calendar, Target } from "lucide-react";

const campaigns = [
  {
    name: "Q1 Restaurant Outreach",
    type: "google_maps",
    status: "active",
    progress: 65,
    leadsFound: 342,
    target: 500,
    startDate: "Jan 15, 2024",
  },
  {
    name: "Healthcare LinkedIn Campaign",
    type: "linkedin",
    status: "active",
    progress: 45,
    leadsFound: 189,
    target: 400,
    startDate: "Jan 20, 2024",
  },
  {
    name: "Legal Services Email Finder",
    type: "email_finder",
    status: "paused",
    progress: 80,
    leadsFound: 256,
    target: 300,
    startDate: "Jan 10, 2024",
  },
  {
    name: "Competitor Analysis",
    type: "ad_intelligence",
    status: "completed",
    progress: 100,
    leadsFound: 150,
    target: 150,
    startDate: "Jan 5, 2024",
  },
];

const typeLabels: Record<string, string> = {
  google_maps: "Google Maps",
  linkedin: "LinkedIn",
  email_finder: "Email Finder",
  ad_intelligence: "Ad Intelligence",
};

export default function ScraperCampaignsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Scraper Campaigns</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your lead generation campaigns
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Leads Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">937</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Lead Quality
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cost per Lead
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$0.12</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaign List</CardTitle>
          <CardDescription>All scraper campaigns and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {campaigns.map((campaign, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-semibold">{campaign.name}</p>
                      <Badge variant="outline">{typeLabels[campaign.type]}</Badge>
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
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Started {campaign.startDate}
                      </span>
                      <span className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Target: {campaign.target} leads
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {campaign.status === "active" ? (
                      <Button variant="outline" size="sm">
                        <Pause className="h-4 w-4 mr-1" />
                        Pause
                      </Button>
                    ) : campaign.status === "paused" ? (
                      <Button variant="outline" size="sm">
                        <Play className="h-4 w-4 mr-1" />
                        Resume
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>
                      {campaign.leadsFound} / {campaign.target} leads
                    </span>
                    <span className="text-muted-foreground">{campaign.progress}%</span>
                  </div>
                  <Progress value={campaign.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
