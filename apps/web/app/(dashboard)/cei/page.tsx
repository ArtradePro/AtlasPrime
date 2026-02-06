"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, TrendingUp, TrendingDown, Building2 } from "lucide-react";

const ceiScores = [
  {
    name: "Downtown Fitness Center",
    overall: 92,
    responsiveness: 95,
    satisfaction: 90,
    retention: 88,
    advocacy: 94,
    trend: "up",
  },
  {
    name: "Ocean View Hotel",
    overall: 87,
    responsiveness: 85,
    satisfaction: 88,
    retention: 90,
    advocacy: 85,
    trend: "stable",
  },
  {
    name: "Tech Solutions Inc",
    overall: 72,
    responsiveness: 70,
    satisfaction: 68,
    retention: 75,
    advocacy: 74,
    trend: "down",
  },
];

export default function CEIPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Customer Experience Index</h1>
        <p className="text-muted-foreground mt-1">
          Monitor and improve customer satisfaction metrics
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Average CEI Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84</div>
            <Progress value={84} className="h-2 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promoters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">67%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Passives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">25%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Detractors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">8%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Client CEI Scores</CardTitle>
          <CardDescription>Individual client experience metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {ceiScores.map((client, i) => (
              <div key={i} className="p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">{client.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold">{client.overall}</span>
                        {client.trend === "up" && (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        )}
                        {client.trend === "down" && (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      client.overall >= 85
                        ? "success"
                        : client.overall >= 70
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {client.overall >= 85 ? "Excellent" : client.overall >= 70 ? "Good" : "Needs Attention"}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Responsiveness", value: client.responsiveness },
                    { label: "Satisfaction", value: client.satisfaction },
                    { label: "Retention", value: client.retention },
                    { label: "Advocacy", value: client.advocacy },
                  ].map((metric) => (
                    <div key={metric.label}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{metric.label}</span>
                        <span>{metric.value}</span>
                      </div>
                      <Progress value={metric.value} className="h-1" />
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
