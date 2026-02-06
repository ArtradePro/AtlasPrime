"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const growthMetrics = [
  {
    title: "Lead Growth",
    value: "+234",
    change: 18.5,
    changeType: "positive",
    period: "This month",
  },
  {
    title: "New Companies",
    value: "+89",
    change: 12.3,
    changeType: "positive",
    period: "This week",
  },
  {
    title: "Conversion Growth",
    value: "+5.2%",
    change: 2.1,
    changeType: "positive",
    period: "vs last month",
  },
  {
    title: "Churn Rate",
    value: "2.3%",
    change: -0.5,
    changeType: "positive",
    period: "Decreased",
  },
];

export default function GrowthAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Growth Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Track your business growth and expansion metrics
        </p>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {growthMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {metric.changeType === "positive" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    metric.changeType === "positive"
                      ? "text-green-500 text-sm"
                      : "text-red-500 text-sm"
                  }
                >
                  {Math.abs(metric.change)}%
                </span>
                <span className="text-muted-foreground text-sm">{metric.period}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Growth Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Lead Acquisition</CardTitle>
            <CardDescription>Monthly lead growth trend</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Industry Distribution</CardTitle>
            <CardDescription>Leads by industry sector</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "Restaurant", count: 456, percent: 32 },
                { name: "Healthcare", count: 312, percent: 22 },
                { name: "Legal Services", count: 234, percent: 16 },
                { name: "Automotive", count: 189, percent: 13 },
                { name: "Construction", count: 156, percent: 11 },
                { name: "Other", count: 89, percent: 6 },
              ].map((item) => (
                <div key={item.name} className="flex items-center gap-4">
                  <div className="w-32 text-sm">{item.name}</div>
                  <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                  <div className="w-16 text-sm text-right text-muted-foreground">
                    {item.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
