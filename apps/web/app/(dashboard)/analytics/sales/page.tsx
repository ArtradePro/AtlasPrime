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
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from "lucide-react";

const salesMetrics = [
  {
    title: "Total Revenue",
    value: "$124,500",
    change: 12.5,
    changeType: "positive",
    icon: DollarSign,
    period: "This month",
  },
  {
    title: "Deals Closed",
    value: "23",
    change: 8.2,
    changeType: "positive",
    icon: Target,
    period: "This month",
  },
  {
    title: "Avg Deal Size",
    value: "$5,413",
    change: 2.1,
    changeType: "positive",
    icon: TrendingUp,
    period: "vs last month",
  },
  {
    title: "Active Leads",
    value: "156",
    change: -3.2,
    changeType: "negative",
    icon: Users,
    period: "In pipeline",
  },
];

const recentDeals = [
  {
    company: "Coastal Seafood Restaurant",
    value: "$8,500",
    status: "won",
    date: "Today",
  },
  {
    company: "Metro Auto Services",
    value: "$12,000",
    status: "won",
    date: "Yesterday",
  },
  {
    company: "Summit Legal Group",
    value: "$6,500",
    status: "pending",
    date: "2 days ago",
  },
  {
    company: "Harbor Health Clinic",
    value: "$15,000",
    status: "won",
    date: "3 days ago",
  },
  {
    company: "Downtown Fitness Center",
    value: "$4,200",
    status: "lost",
    date: "4 days ago",
  },
];

export default function SalesAnalyticsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales Analytics</h1>
          <p className="text-muted-foreground mt-1">
            Track your sales performance and revenue metrics
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Calendar className="h-4 w-4 mr-2" />
          Last 30 Days
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {salesMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {metric.title}
              </CardTitle>
              <metric.icon className="h-4 w-4 text-muted-foreground" />
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

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Chart Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Chart visualization</p>
            </div>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>Lead to customer journey</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: "Leads", count: 2847, width: 100 },
                { stage: "Qualified", count: 1234, width: 75 },
                { stage: "Contacted", count: 856, width: 50 },
                { stage: "Proposal", count: 234, width: 25 },
                { stage: "Closed", count: 89, width: 15 },
              ].map((item) => (
                <div key={item.stage} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.stage}</span>
                    <span className="text-muted-foreground">{item.count}</span>
                  </div>
                  <div className="h-8 bg-secondary rounded overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${item.width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Deals */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Deals</CardTitle>
          <CardDescription>Latest closed and pending deals</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentDeals.map((deal, i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium">{deal.company}</p>
                  <p className="text-sm text-muted-foreground">{deal.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold">{deal.value}</span>
                  <Badge
                    variant={
                      deal.status === "won"
                        ? "success"
                        : deal.status === "pending"
                        ? "warning"
                        : "destructive"
                    }
                  >
                    {deal.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
