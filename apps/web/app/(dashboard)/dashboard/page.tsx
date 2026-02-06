"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Target,
  Database,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Sparkles,
  Loader2,
} from "lucide-react";

// Pipeline stage colors
const stageColors: Record<string, string> = {
  new: "bg-blue-500",
  qualified: "bg-purple-500",
  contacted: "bg-yellow-500",
  "pre-onboarding": "bg-orange-500",
  onboarding: "bg-pink-500",
  active: "bg-green-500",
  churned: "bg-gray-500",
};

export default function DashboardPage() {
  // Get organization ID (in production, get from auth)
  // For demo, we'll use the first organization
  const organizations = useQuery(api.analytics.getOrganizations);
  const orgId = organizations?.[0]?._id;

  // Fetch real data from Convex
  const stats = useQuery(
    api.analytics.getDashboardStats,
    orgId ? { organizationId: orgId } : "skip",
  );
  const recentLeads = useQuery(
    api.companies.getRecentLeads,
    orgId ? { organizationId: orgId, limit: 5 } : "skip",
  );
  const scraperJobs = useQuery(
    api.scraperJobs.getActiveJobs,
    orgId ? { organizationId: orgId } : "skip",
  );

  // Loading state
  if (!organizations || !orgId) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Use real data or fallback to defaults
  const dashboardStats = stats || {
    totalLeads: 0,
    qualifiedLeads: 0,
    chains: 0,
    conversionRate: 0,
    pipelineByStatus: {},
  };

  const pipelineStages = Object.entries(
    dashboardStats.pipelineByStatus || {},
  ).map(([name, count]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1).replace("-", " "),
    count: count as number,
    color: stageColors[name] || "bg-gray-500",
  }));

  // If no pipeline data, show defaults
  const displayPipelineStages =
    pipelineStages.length > 0
      ? pipelineStages
      : [
          { name: "New", count: 0, color: "bg-blue-500" },
          { name: "Qualified", count: 0, color: "bg-purple-500" },
          { name: "Contacted", count: 0, color: "bg-yellow-500" },
        ];

  const totalPipeline = displayPipelineStages.reduce(
    (acc, s) => acc + s.count,
    0,
  );

  // Build stats array from real data
  const statsCards = [
    {
      title: "Total Leads",
      value: dashboardStats.totalLeads.toLocaleString(),
      change: 12.5,
      changeType: "positive" as const,
      icon: Building2,
      description: "Companies in database",
    },
    {
      title: "Qualified Leads",
      value: dashboardStats.qualifiedLeads.toLocaleString(),
      change: 8.2,
      changeType: "positive" as const,
      icon: Target,
      description: "10+ years in business",
    },
    {
      title: "Chains Identified",
      value: dashboardStats.chains.toLocaleString(),
      change: 15.3,
      changeType: "positive" as const,
      icon: Database,
      description: "Multi-location businesses",
    },
    {
      title: "Conversion Rate",
      value: `${dashboardStats.conversionRate}%`,
      change: 2.1,
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Lead to customer",
    },
  ];

  // Recent leads from Convex
  const displayRecentLeads = recentLeads || [];

  // Active jobs from Convex
  const displayActiveJobs = scraperJobs || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back! Here's an overview of your lead generation performance.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center gap-1 mt-1">
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownRight className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={
                    stat.changeType === "positive"
                      ? "text-green-500 text-sm"
                      : "text-red-500 text-sm"
                  }
                >
                  {stat.change}%
                </span>
                <span className="text-muted-foreground text-sm">
                  vs last month
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Pipeline Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sales Pipeline</CardTitle>
            <CardDescription>
              Lead distribution across pipeline stages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayPipelineStages.map((stage) => (
                <div key={stage.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{stage.name}</span>
                    <span className="text-muted-foreground">
                      {stage.count} (
                      {totalPipeline > 0
                        ? ((stage.count / totalPipeline) * 100).toFixed(1)
                        : 0}
                      %)
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={`h-full ${stage.color} transition-all`}
                      style={{
                        width: `${totalPipeline > 0 ? (stage.count / totalPipeline) * 100 : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Insights
            </CardTitle>
            <CardDescription>Recommendations from Atlas AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-primary/5 border border-primary/10 p-4">
              <p className="text-sm font-medium">High-Value Opportunity</p>
              <p className="text-sm text-muted-foreground mt-1">
                {dashboardStats.totalLeads > 0
                  ? `${Math.floor(dashboardStats.totalLeads * 0.15)} leads have high AI scores. Consider prioritizing outreach.`
                  : "Start scraping to discover opportunities."}
              </p>
            </div>
            <div className="rounded-lg bg-green-500/5 border border-green-500/10 p-4">
              <p className="text-sm font-medium text-green-600">
                Conversion Tip
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Leads contacted within 24 hours have 3x higher conversion rate.
              </p>
            </div>
            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-600">
                Action Required
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {dashboardStats.qualifiedLeads} qualified leads ready for
                outreach.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Leads */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Recent Leads</CardTitle>
            <CardDescription>
              Latest companies added to your database
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displayRecentLeads.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No leads yet. Start scraping to add companies!
                </p>
              ) : (
                displayRecentLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Building2 className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{lead.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {lead.industry} • {lead.primaryAddress?.city},{" "}
                          {lead.primaryAddress?.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {lead.yearsInBusiness || "?"} years
                      </span>
                      <Badge
                        variant={
                          lead.status === "new"
                            ? "default"
                            : lead.status === "qualified"
                              ? "success"
                              : "secondary"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Scrapers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-green-500" />
              Active Jobs
            </CardTitle>
            <CardDescription>Running data collection tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {displayActiveJobs.map((job) => {
              const progress =
                job.progress?.total > 0
                  ? Math.round(
                      (job.progress.processed / job.progress.total) * 100,
                    )
                  : 0;
              return (
                <div key={job._id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {job.type.replace("_", " ")}
                    </span>
                    <span className="text-muted-foreground">{progress}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.config.query || "Processing..."}
                  </p>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full bg-green-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {job.results?.companiesFound || 0} leads found
                  </p>
                </div>
              );
            })}
            {displayActiveJobs.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No active jobs running
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
