"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, DollarSign, Calendar, TrendingUp } from "lucide-react";

const activeClients = [
  {
    name: "Downtown Fitness Center",
    industry: "Fitness",
    location: "Austin, TX",
    revenue: "$4,200/mo",
    since: "Jan 2024",
    health: "good",
  },
  {
    name: "Ocean View Hotel",
    industry: "Hospitality",
    location: "San Diego, CA",
    revenue: "$8,500/mo",
    since: "Dec 2023",
    health: "good",
  },
  {
    name: "Tech Solutions Inc",
    industry: "Technology",
    location: "Boston, MA",
    revenue: "$12,000/mo",
    since: "Nov 2023",
    health: "at-risk",
  },
];

export default function OperationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operations</h1>
        <p className="text-muted-foreground mt-1">
          Manage active clients and ongoing operations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Clients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">892</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Monthly Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$124,500</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Client Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$5,413</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Clients</CardTitle>
          <CardDescription>Currently active client accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeClients.map((client, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{client.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {client.industry} • {client.location}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    {client.revenue}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    Since {client.since}
                  </div>
                  <Badge variant={client.health === "good" ? "success" : "warning"}>
                    {client.health === "good" ? "Healthy" : "At Risk"}
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
