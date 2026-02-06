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
import { Building2, CheckCircle2, Circle, MoreHorizontal } from "lucide-react";

const onboardingLeads = [
  {
    name: "Harbor Health Clinic",
    industry: "Healthcare",
    location: "Seattle, WA",
    progress: 75,
    steps: [
      { name: "Initial Call", completed: true },
      { name: "Requirements Gathered", completed: true },
      { name: "Proposal Sent", completed: true },
      { name: "Contract Signed", completed: false },
    ],
    assignee: "John D.",
  },
  {
    name: "Pacific Construction Co",
    industry: "Construction",
    location: "San Francisco, CA",
    progress: 50,
    steps: [
      { name: "Initial Call", completed: true },
      { name: "Requirements Gathered", completed: true },
      { name: "Proposal Sent", completed: false },
      { name: "Contract Signed", completed: false },
    ],
    assignee: "Sarah M.",
  },
];

export default function OnboardingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Onboarding</h1>
          <p className="text-muted-foreground mt-1">
            Leads in active onboarding process
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Onboarding
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Completion Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 days</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Onboarding</CardTitle>
          <CardDescription>Track progress of leads being onboarded</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {onboardingLeads.map((lead, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.industry} • {lead.location}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant="secondary">{lead.assignee}</Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Progress</span>
                    <span className="text-muted-foreground">{lead.progress}%</span>
                  </div>
                  <Progress value={lead.progress} className="h-2" />
                </div>

                <div className="flex gap-4 mt-4">
                  {lead.steps.map((step, j) => (
                    <div key={j} className="flex items-center gap-2 text-sm">
                      {step.completed ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={step.completed ? "text-foreground" : "text-muted-foreground"}>
                        {step.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
