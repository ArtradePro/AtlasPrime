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
import { Building2, Clock, ArrowRight, MoreHorizontal } from "lucide-react";

const leads = [
  {
    name: "Coastal Seafood Restaurant",
    industry: "Restaurant",
    location: "Miami, FL",
    years: 15,
    score: 92,
    addedAt: "2 hours ago",
    status: "Ready for contact",
  },
  {
    name: "Metro Auto Services",
    industry: "Automotive",
    location: "Chicago, IL",
    years: 22,
    score: 88,
    addedAt: "5 hours ago",
    status: "Needs review",
  },
  {
    name: "Summit Legal Group",
    industry: "Legal",
    location: "Denver, CO",
    years: 18,
    score: 85,
    addedAt: "1 day ago",
    status: "Ready for contact",
  },
];

export default function PreOnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Pre-Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Qualified leads ready for initial contact
          </p>
        </div>
        <Button>
          <ArrowRight className="h-4 w-4 mr-2" />
          Move to Onboarding
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total in Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">67</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Time in Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pre-Onboarding Queue</CardTitle>
          <CardDescription>Leads awaiting initial outreach</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leads.map((lead, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.industry} • {lead.location} • {lead.years} years
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <Badge variant="outline">Score: {lead.score}</Badge>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {lead.addedAt}
                    </p>
                  </div>
                  <Badge variant={lead.status === "Ready for contact" ? "success" : "warning"}>
                    {lead.status}
                  </Badge>
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
