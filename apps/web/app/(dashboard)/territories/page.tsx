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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  MapPin,
  Users,
  DollarSign,
  Building2,
  Percent,
  MoreVertical,
  User,
  TrendingUp,
} from "lucide-react";

// Mock territories
const mockTerritories = [
  {
    id: "1",
    name: "Northeast Region",
    assignedTo: "Sarah Johnson",
    color: "#3B82F6",
    type: "states",
    areas: ["NY", "NJ", "CT", "MA", "PA"],
    metrics: {
      totalLeads: 234,
      activeLeads: 89,
      convertedLeads: 45,
      revenue: 125000,
    },
  },
  {
    id: "2",
    name: "Southeast Region",
    assignedTo: "Mike Chen",
    color: "#10B981",
    type: "states",
    areas: ["FL", "GA", "NC", "SC", "VA"],
    metrics: {
      totalLeads: 187,
      activeLeads: 67,
      convertedLeads: 38,
      revenue: 98000,
    },
  },
  {
    id: "3",
    name: "Midwest Region",
    assignedTo: "Emily Davis",
    color: "#F59E0B",
    type: "states",
    areas: ["IL", "OH", "MI", "IN", "WI"],
    metrics: {
      totalLeads: 156,
      activeLeads: 54,
      convertedLeads: 29,
      revenue: 76000,
    },
  },
  {
    id: "4",
    name: "West Coast",
    assignedTo: "James Wilson",
    color: "#EF4444",
    type: "states",
    areas: ["CA", "WA", "OR", "AZ", "NV"],
    metrics: {
      totalLeads: 312,
      activeLeads: 124,
      convertedLeads: 67,
      revenue: 189000,
    },
  },
  {
    id: "5",
    name: "Texas Metro",
    assignedTo: "Lisa Rodriguez",
    color: "#8B5CF6",
    type: "cities",
    areas: ["Houston", "Dallas", "Austin", "San Antonio"],
    metrics: {
      totalLeads: 145,
      activeLeads: 56,
      convertedLeads: 31,
      revenue: 82000,
    },
  },
];

export default function TerritoriesPage() {
  const [territories] = useState(mockTerritories);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const totalLeads = territories.reduce(
    (sum, t) => sum + t.metrics.totalLeads,
    0,
  );
  const totalRevenue = territories.reduce(
    (sum, t) => sum + t.metrics.revenue,
    0,
  );
  const avgConversion =
    territories.reduce(
      (sum, t) => sum + (t.metrics.convertedLeads / t.metrics.totalLeads) * 100,
      0,
    ) / territories.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Territories</h1>
          <p className="text-muted-foreground">
            Manage sales territories and track regional performance
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Territory
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Total Territories
            </CardTitle>
            <MapPin className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{territories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Building2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalLeads.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(totalRevenue / 1000).toFixed(0)}K
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Conversion
            </CardTitle>
            <Percent className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgConversion.toFixed(1)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Territory Map</CardTitle>
          <CardDescription>Visual overview of all territories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] bg-muted/30 rounded-lg flex items-center justify-center border-2 border-dashed">
            <div className="text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">
                Interactive map visualization
              </p>
              <p className="text-sm text-muted-foreground">
                Connect Mapbox or Google Maps API for full functionality
              </p>
            </div>
          </div>
          {/* Territory legend */}
          <div className="mt-4 flex flex-wrap gap-4">
            {territories.map((territory) => (
              <div key={territory.id} className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: territory.color }}
                />
                <span className="text-sm">{territory.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Territories Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {territories.map((territory) => (
          <Card key={territory.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: territory.color }}
                  />
                  <CardTitle className="text-lg">{territory.name}</CardTitle>
                </div>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription className="flex items-center gap-2 mt-2">
                <User className="h-4 w-4" />
                {territory.assignedTo}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Coverage */}
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Coverage</p>
                <div className="flex flex-wrap gap-1">
                  {territory.areas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Leads</p>
                  <p className="text-xl font-semibold">
                    {territory.metrics.totalLeads}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active</p>
                  <p className="text-xl font-semibold">
                    {territory.metrics.activeLeads}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Converted</p>
                  <p className="text-xl font-semibold text-green-600">
                    {territory.metrics.convertedLeads}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-xl font-semibold text-emerald-600">
                    ${(territory.metrics.revenue / 1000).toFixed(0)}K
                  </p>
                </div>
              </div>

              {/* Conversion rate bar */}
              <div className="mt-4 pt-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">
                    Conversion Rate
                  </span>
                  <span className="text-sm font-medium">
                    {(
                      (territory.metrics.convertedLeads /
                        territory.metrics.totalLeads) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(territory.metrics.convertedLeads / territory.metrics.totalLeads) * 100}%`,
                      backgroundColor: territory.color,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Workload Balance */}
      <Card>
        <CardHeader>
          <CardTitle>Workload Balance</CardTitle>
          <CardDescription>Lead distribution across sales reps</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {territories.map((territory) => {
              const utilization = (territory.metrics.activeLeads / 100) * 100; // Assuming 100 is max capacity
              return (
                <div key={territory.id} className="flex items-center gap-4">
                  <div className="w-32 truncate">
                    <p className="font-medium text-sm">
                      {territory.assignedTo}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {territory.name}
                    </p>
                  </div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(utilization, 100)}%`,
                          backgroundColor:
                            utilization > 90
                              ? "#EF4444"
                              : utilization > 70
                                ? "#F59E0B"
                                : "#10B981",
                        }}
                      />
                    </div>
                  </div>
                  <div className="w-20 text-right">
                    <Badge
                      variant={
                        utilization > 90
                          ? "destructive"
                          : utilization > 70
                            ? "default"
                            : "secondary"
                      }
                    >
                      {territory.metrics.activeLeads} active
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Create Territory Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create New Territory</CardTitle>
              <CardDescription>Define a new sales territory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Territory Name</Label>
                <Input placeholder="e.g., Southwest Region" />
              </div>
              <div className="space-y-2">
                <Label>Assign To</Label>
                <Input placeholder="Select team member" />
              </div>
              <div className="space-y-2">
                <Label>Coverage Type</Label>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    States
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Cities
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    ZIP Codes
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Radius
                  </Button>
                </div>
              </div>
              <div className="pt-4 flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateModal(false)}>
                  Create Territory
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
