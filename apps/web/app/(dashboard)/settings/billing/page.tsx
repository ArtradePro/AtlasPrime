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
import { Progress } from "@/components/ui/progress";
import {
  CreditCard,
  Zap,
  Building2,
  Mail,
  Brain,
  Search,
  ArrowUpRight,
  Check,
  Download,
  Calendar,
} from "lucide-react";

// Mock subscription
const mockSubscription = {
  plan: "pro",
  status: "active",
  currentPeriodEnd: "March 15, 2026",
  features: {
    maxUsers: 10,
    maxLeads: 10000,
    maxScrapesPerMonth: 5000,
    maxEmailsPerMonth: 10000,
    aiCreditsPerMonth: 500,
    customBranding: true,
    apiAccess: true,
    prioritySupport: true,
  },
  usage: {
    users: 4,
    leads: 2847,
    scrapesThisMonth: 1234,
    emailsThisMonth: 3456,
    aiCreditsUsed: 178,
  },
};

// Mock credit history
const mockCreditHistory = [
  { type: "usage", amount: -5, description: "AI Lead Analysis", date: "Today" },
  {
    type: "usage",
    amount: -10,
    description: "Bulk Email Send",
    date: "Yesterday",
  },
  {
    type: "purchase",
    amount: 100,
    description: "Credit Top-up",
    date: "3 days ago",
  },
  {
    type: "bonus",
    amount: 25,
    description: "Referral Bonus",
    date: "1 week ago",
  },
];

// Mock invoices
const mockInvoices = [
  { id: "INV-001", date: "Feb 1, 2026", amount: 99, status: "paid" },
  { id: "INV-002", date: "Jan 1, 2026", amount: 99, status: "paid" },
  { id: "INV-003", date: "Dec 1, 2025", amount: 99, status: "paid" },
];

const plans = [
  {
    name: "Starter",
    price: 29,
    description: "For small teams getting started",
    features: ["3 users", "1,000 leads", "500 scrapes/mo", "100 AI credits"],
  },
  {
    name: "Pro",
    price: 99,
    description: "For growing businesses",
    features: [
      "10 users",
      "10,000 leads",
      "5,000 scrapes/mo",
      "500 AI credits",
      "Custom branding",
      "API access",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: null,
    description: "For large organizations",
    features: [
      "Unlimited users",
      "Unlimited leads",
      "Unlimited scrapes",
      "Unlimited AI credits",
      "Dedicated success manager",
      "Custom integrations",
    ],
  },
];

export default function BillingPage() {
  const [sub] = useState(mockSubscription);

  const getUsagePercent = (used: number, limit: number) => {
    if (limit === -1) return 0;
    return Math.min((used / limit) * 100, 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Billing & Usage</h1>
        <p className="text-muted-foreground">
          Manage your subscription and track usage
        </p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span className="capitalize">{sub.plan}</span> Plan
                <Badge variant="default">{sub.status}</Badge>
              </CardTitle>
              <CardDescription>
                Next billing date: {sub.currentPeriodEnd}
              </CardDescription>
            </div>
            <Button variant="outline">
              <ArrowUpRight className="mr-2 h-4 w-4" />
              Upgrade Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
            {/* Users */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                Team Members
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold">{sub.usage.users}</span>
                <span className="text-muted-foreground">
                  / {sub.features.maxUsers}
                </span>
              </div>
              <Progress
                value={getUsagePercent(sub.usage.users, sub.features.maxUsers)}
              />
            </div>

            {/* Leads */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Building2 className="h-4 w-4" />
                Leads
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold">
                  {sub.usage.leads.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  / {sub.features.maxLeads.toLocaleString()}
                </span>
              </div>
              <Progress
                value={getUsagePercent(sub.usage.leads, sub.features.maxLeads)}
              />
            </div>

            {/* Scrapes */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Search className="h-4 w-4" />
                Scrapes This Month
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold">
                  {sub.usage.scrapesThisMonth.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  / {sub.features.maxScrapesPerMonth.toLocaleString()}
                </span>
              </div>
              <Progress
                value={getUsagePercent(
                  sub.usage.scrapesThisMonth,
                  sub.features.maxScrapesPerMonth,
                )}
              />
            </div>

            {/* Emails */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Mail className="h-4 w-4" />
                Emails This Month
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold">
                  {sub.usage.emailsThisMonth.toLocaleString()}
                </span>
                <span className="text-muted-foreground">
                  / {sub.features.maxEmailsPerMonth.toLocaleString()}
                </span>
              </div>
              <Progress
                value={getUsagePercent(
                  sub.usage.emailsThisMonth,
                  sub.features.maxEmailsPerMonth,
                )}
              />
            </div>

            {/* AI Credits */}
            <div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Brain className="h-4 w-4" />
                AI Credits
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold">
                  {sub.usage.aiCreditsUsed}
                </span>
                <span className="text-muted-foreground">
                  / {sub.features.aiCreditsPerMonth}
                </span>
              </div>
              <Progress
                value={getUsagePercent(
                  sub.usage.aiCreditsUsed,
                  sub.features.aiCreditsPerMonth,
                )}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Balance & History */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              AI Credits
            </CardTitle>
            <CardDescription>
              Buy additional credits for AI features
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-4">
              {sub.features.aiCreditsPerMonth - sub.usage.aiCreditsUsed}
              <span className="text-lg font-normal text-muted-foreground ml-2">
                credits remaining
              </span>
            </div>
            <div className="space-y-3">
              {mockCreditHistory.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        item.amount > 0 ? "bg-green-500" : "bg-gray-400"
                      }`}
                    />
                    <span>{item.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={
                        item.amount > 0
                          ? "text-green-600"
                          : "text-muted-foreground"
                      }
                    >
                      {item.amount > 0 ? "+" : ""}
                      {item.amount}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {item.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4">
              <CreditCard className="mr-2 h-4 w-4" />
              Buy More Credits
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>Download past invoices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="font-medium">{invoice.id}</p>
                    <p className="text-sm text-muted-foreground">
                      {invoice.date}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">${invoice.amount}</span>
                    <Badge variant="secondary">{invoice.status}</Badge>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Plan Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Compare Plans</CardTitle>
          <CardDescription>
            Choose the right plan for your needs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-6 rounded-lg border-2 ${
                  plan.popular ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                {plan.popular && <Badge className="mb-2">Most Popular</Badge>}
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <div className="mt-2 mb-4">
                  {plan.price ? (
                    <span className="text-3xl font-bold">${plan.price}</span>
                  ) : (
                    <span className="text-xl font-medium">Custom</span>
                  )}
                  {plan.price && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  {plan.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  disabled={sub.plan.toLowerCase() === plan.name.toLowerCase()}
                >
                  {sub.plan.toLowerCase() === plan.name.toLowerCase()
                    ? "Current Plan"
                    : plan.price
                      ? "Upgrade"
                      : "Contact Sales"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Method */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>Manage your payment information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div className="flex items-center gap-4">
              <div className="h-12 w-16 rounded bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="font-medium">•••• •••• •••• 4242</p>
                <p className="text-sm text-muted-foreground">Expires 12/27</p>
              </div>
            </div>
            <Button variant="outline">Update</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
