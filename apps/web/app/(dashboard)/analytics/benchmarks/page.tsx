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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Users,
  DollarSign,
  Clock,
  Award,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";

// Industry benchmark data
const industryBenchmarks = {
  restaurant: {
    name: "Restaurant",
    avgConversionRate: 18.5,
    avgDealSize: 2800,
    avgSalesCycle: 21,
    avgResponseRate: 32,
    topPerformerConversion: 28,
  },
  healthcare: {
    name: "Healthcare",
    avgConversionRate: 22.3,
    avgDealSize: 5200,
    avgSalesCycle: 35,
    avgResponseRate: 28,
    topPerformerConversion: 35,
  },
  legal: {
    name: "Legal Services",
    avgConversionRate: 15.8,
    avgDealSize: 8500,
    avgSalesCycle: 45,
    avgResponseRate: 22,
    topPerformerConversion: 25,
  },
  automotive: {
    name: "Automotive",
    avgConversionRate: 20.1,
    avgDealSize: 3200,
    avgSalesCycle: 28,
    avgResponseRate: 35,
    topPerformerConversion: 32,
  },
  construction: {
    name: "Construction",
    avgConversionRate: 16.4,
    avgDealSize: 12000,
    avgSalesCycle: 52,
    avgResponseRate: 25,
    topPerformerConversion: 24,
  },
  fitness: {
    name: "Health & Fitness",
    avgConversionRate: 24.2,
    avgDealSize: 1800,
    avgSalesCycle: 14,
    avgResponseRate: 38,
    topPerformerConversion: 36,
  },
};

// Your performance data
const yourPerformance = {
  conversionRate: 24.8,
  avgDealSize: 4200,
  avgSalesCycle: 18,
  responseRate: 42,
  totalDeals: 156,
  totalRevenue: 655200,
};

// Monthly trend data
const monthlyTrends = [
  { month: "Sep", conversion: 21.2, deals: 12, revenue: 48000 },
  { month: "Oct", conversion: 22.8, deals: 15, revenue: 62000 },
  { month: "Nov", conversion: 23.5, deals: 14, revenue: 58000 },
  { month: "Dec", conversion: 24.1, deals: 18, revenue: 75000 },
  { month: "Jan", conversion: 24.8, deals: 21, revenue: 88000 },
];

export default function BenchmarksPage() {
  const [selectedIndustry, setSelectedIndustry] = useState<string>("restaurant");
  const benchmark = industryBenchmarks[selectedIndustry as keyof typeof industryBenchmarks];

  const getComparisonBadge = (yours: number, benchmark: number, higherIsBetter = true) => {
    const diff = yours - benchmark;
    const percentage = ((diff / benchmark) * 100).toFixed(1);
    const isPositive = higherIsBetter ? diff > 0 : diff < 0;

    return (
      <Badge
        variant="outline"
        className={isPositive ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}
      >
        {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
        {isPositive ? "+" : ""}{percentage}% vs industry
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benchmarks</h1>
          <p className="text-muted-foreground mt-1">
            Compare your performance against industry standards
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="restaurant">Restaurant</SelectItem>
              <SelectItem value="healthcare">Healthcare</SelectItem>
              <SelectItem value="legal">Legal Services</SelectItem>
              <SelectItem value="automotive">Automotive</SelectItem>
              <SelectItem value="construction">Construction</SelectItem>
              <SelectItem value="fitness">Health & Fitness</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Performance vs Industry */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Conversion Rate
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yourPerformance.conversionRate}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getComparisonBadge(yourPerformance.conversionRate, benchmark.avgConversionRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Industry avg: {benchmark.avgConversionRate}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Deal Size
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${yourPerformance.avgDealSize.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              {getComparisonBadge(yourPerformance.avgDealSize, benchmark.avgDealSize)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Industry avg: ${benchmark.avgDealSize.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sales Cycle
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yourPerformance.avgSalesCycle} days</div>
            <div className="flex items-center gap-2 mt-2">
              {getComparisonBadge(yourPerformance.avgSalesCycle, benchmark.avgSalesCycle, false)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Industry avg: {benchmark.avgSalesCycle} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Response Rate
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{yourPerformance.responseRate}%</div>
            <div className="flex items-center gap-2 mt-2">
              {getComparisonBadge(yourPerformance.responseRate, benchmark.avgResponseRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Industry avg: {benchmark.avgResponseRate}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Ranking Card */}
      <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle>Top Performer Status</CardTitle>
                <CardDescription>Based on {benchmark.name} industry benchmarks</CardDescription>
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-lg px-4 py-2">
              Top 15%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Your Conversion</p>
              <p className="text-2xl font-bold text-purple-600">{yourPerformance.conversionRate}%</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Industry Average</p>
              <p className="text-2xl font-bold">{benchmark.avgConversionRate}%</p>
            </div>
            <div className="text-center p-4 bg-white/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Top Performers</p>
              <p className="text-2xl font-bold text-green-600">{benchmark.topPerformerConversion}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Performance Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Monthly Performance Trend
          </CardTitle>
          <CardDescription>Your performance over the last 5 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {monthlyTrends.map((month, index) => {
              const prevConversion = index > 0 ? monthlyTrends[index - 1].conversion : month.conversion;
              const trend = month.conversion - prevConversion;
              
              return (
                <div key={month.month} className="flex items-center gap-4">
                  <div className="w-12 text-sm font-medium">{month.month}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div 
                        className="h-8 bg-primary/20 rounded"
                        style={{ width: `${(month.conversion / 30) * 100}%` }}
                      >
                        <div 
                          className="h-full bg-primary rounded"
                          style={{ width: `${(month.conversion / benchmark.topPerformerConversion) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{month.conversion}%</span>
                      {trend > 0 && (
                        <Badge variant="outline" className="text-green-600 bg-green-50">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          +{trend.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="w-24 text-right text-sm text-muted-foreground">
                    {month.deals} deals
                  </div>
                  <div className="w-24 text-right text-sm font-medium">
                    ${month.revenue.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            AI Performance Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">Strengths</h4>
              <ul className="space-y-1 text-sm text-green-700">
                <li>• Conversion rate {((yourPerformance.conversionRate / benchmark.avgConversionRate - 1) * 100).toFixed(0)}% above industry average</li>
                <li>• Sales cycle {benchmark.avgSalesCycle - yourPerformance.avgSalesCycle} days faster than competitors</li>
                <li>• Response rate exceeds top performer threshold</li>
              </ul>
            </div>
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-2">Opportunities</h4>
              <ul className="space-y-1 text-sm text-blue-700">
                <li>• Increase deal size by targeting enterprise accounts</li>
                <li>• Expand into {benchmark.name} vertical for faster growth</li>
                <li>• Leverage high response rate for upselling campaigns</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
