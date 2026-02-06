"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import {
  LayoutDashboard,
  Building2,
  Search,
  BarChart3,
  GitBranch,
  Heart,
  FileText,
  Settings,
  ChevronLeft,
  LogOut,
  Sparkles,
  Mail,
  Map,
  Phone,
  Users,
  CreditCard,
  Key,
  Palette,
  Plug,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Leads",
    href: "/leads",
    icon: Building2,
  },
  {
    name: "Scraper",
    href: "/scraper",
    icon: Search,
  },
  {
    name: "Sequences",
    href: "/sequences",
    icon: Mail,
  },
  {
    name: "Territories",
    href: "/territories",
    icon: Map,
  },
  {
    name: "Call Center",
    href: "/calls",
    icon: Phone,
  },
  {
    name: "Analytics",
    href: "/analytics/sales",
    icon: BarChart3,
    children: [
      { name: "Sales", href: "/analytics/sales" },
      { name: "Campaigns", href: "/analytics/campaigns" },
      { name: "Growth", href: "/analytics/growth" },
      { name: "Benchmarks", href: "/analytics/benchmarks" },
    ],
  },
  {
    name: "Pipeline",
    href: "/pipeline/pre-onboarding",
    icon: GitBranch,
    children: [
      { name: "Pre-Onboarding", href: "/pipeline/pre-onboarding" },
      { name: "Onboarding", href: "/pipeline/onboarding" },
      { name: "Operations", href: "/pipeline/operations" },
    ],
  },
  {
    name: "CEI",
    href: "/cei",
    icon: Heart,
  },
  {
    name: "Reports",
    href: "/reports",
    icon: FileText,
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    children: [
      { name: "General", href: "/settings" },
      { name: "Team", href: "/settings/team" },
      { name: "Integrations", href: "/settings/integrations" },
      { name: "Billing", href: "/settings/billing" },
      { name: "API Keys", href: "/settings/api" },
      { name: "Branding", href: "/settings/branding" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300",
        collapsed ? "w-16" : "w-64",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-24 items-center justify-center border-b px-4">
          {!collapsed && (
            <Link href="/" className="flex items-center justify-center">
              <img src="/logo.png" alt="Atlas Prime" className="h-16 w-auto" />
            </Link>
          )}
          {collapsed && (
            <Link href="/" className="flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Atlas Prime"
                className="h-12 w-12 object-contain"
              />
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              item.children?.some((child) => pathname === child.href);

            return (
              <div key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <item.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>

                {/* Submenu */}
                {!collapsed && item.children && isActive && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={cn(
                          "block rounded-lg px-3 py-1.5 text-sm transition-colors",
                          pathname === child.href
                            ? "text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        {child.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse Toggle & User */}
        <div className="border-t p-2 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            {!collapsed && (
              <span className="text-sm text-muted-foreground">Account</span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-3"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                "h-5 w-5 transition-transform",
                collapsed && "rotate-180",
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}
