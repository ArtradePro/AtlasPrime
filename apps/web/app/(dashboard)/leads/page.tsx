"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building2,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  MapPin,
  Globe,
  Phone,
  Star,
  ChevronLeft,
  ChevronRight,
  Link2,
  Clock,
  Sparkles,
  TrendingUp,
  AlertCircle,
  Target,
  Zap,
  Loader2,
  Mail,
  ExternalLink,
  UserPlus,
  MessageSquare,
  Brain,
  RefreshCw,
  CheckCircle,
  XCircle,
  ArrowUpDown,
} from "lucide-react";
import {
  AILeadAnalysis,
  AIScoreBadge,
} from "@/components/leads/ai-lead-analysis";
import { toast } from "sonner";

const statusColors: Record<string, "default" | "success" | "warning" | "secondary" | "destructive"> = {
  new: "default",
  qualified: "success",
  contacted: "warning",
  "pre-onboarding": "secondary",
  onboarding: "secondary",
  active: "success",
  churned: "destructive",
};

const statusOptions = [
  { value: "new", label: "New" },
  { value: "qualified", label: "Qualified" },
  { value: "contacted", label: "Contacted" },
  { value: "pre-onboarding", label: "Pre-Onboarding" },
  { value: "onboarding", label: "Onboarding" },
  { value: "active", label: "Active" },
  { value: "churned", label: "Churned" },
];

type SortField = "name" | "aiScore" | "rating" | "reviews" | "years" | "createdAt";
type SortOrder = "asc" | "desc";

export default function LeadsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [showChainsOnly, setShowChainsOnly] = useState(false);
  const [hideLowLongevity, setHideLowLongevity] = useState(false);
  const [minYears, setMinYears] = useState("10");
  const [minScore, setMinScore] = useState("0");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [isScoring, setIsScoring] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [selectedLeadForStatus, setSelectedLeadForStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Get organization for demo mode
  const organizations = useQuery(api.analytics.getOrganizations);
  const orgId = organizations?.[0]?._id;

  // Get companies from Convex
  const companiesData = useQuery(
    api.companies.getCompanies,
    orgId ? { organizationId: orgId } : "skip"
  );

  // Mutations
  const updateStatus = useMutation(api.companies.updateCompanyStatus);

  // Transform Convex data to match our UI format
  const leads = useMemo(() => {
    if (!companiesData) return [];
    return companiesData.map((company) => ({
      id: company._id,
      name: company.name,
      industry: company.industry,
      city: company.primaryAddress?.city || "",
      state: company.primaryAddress?.state || "",
      years: company.yearsInBusiness || 0,
      website: company.website || "",
      phone: company.phone || "",
      rating: company.googleRating || 0,
      reviews: company.googleReviewCount || 0,
      status: company.status,
      isChain: company.isChain || false,
      chainConfidence: 0,
      totalLocations: company.totalLocations || 1,
      longevityVerified: (company.yearsInBusiness || 0) >= 10,
      aiScore: company.aiScore || 0,
      aiInsights: company.aiInsights || "",
      dataSources: company.dataSources?.map((ds: { source: string }) => ds.source) || [],
      outreachStrategy: company.outreachStrategy || null,
      createdAt: company.createdAt,
    }));
  }, [companiesData]);

  // Get unique industries from leads
  const industries = useMemo(() => {
    const uniqueIndustries = [...new Set(leads.map((l) => l.industry))].filter(Boolean);
    return uniqueIndustries.sort();
  }, [leads]);

  // Filter and sort leads
  const filteredLeads = useMemo(() => {
    let result = leads.filter((lead) => {
      const matchesSearch = lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lead.city.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
      const matchesIndustry = industryFilter === "all" || lead.industry === industryFilter;
      const matchesChain = !showChainsOnly || lead.isChain;
      const matchesLongevity = !hideLowLongevity || lead.years >= parseInt(minYears);
      const matchesScore = lead.aiScore >= parseInt(minScore);
      
      return matchesSearch && matchesStatus && matchesIndustry && matchesChain && matchesLongevity && matchesScore;
    });

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case "name":
          comparison = a.name.localeCompare(b.name);
          break;
        case "aiScore":
          comparison = (a.aiScore || 0) - (b.aiScore || 0);
          break;
        case "rating":
          comparison = a.rating - b.rating;
          break;
        case "reviews":
          comparison = a.reviews - b.reviews;
          break;
        case "years":
          comparison = a.years - b.years;
          break;
        case "createdAt":
          comparison = a.createdAt - b.createdAt;
          break;
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

    return result;
  }, [leads, searchQuery, statusFilter, industryFilter, showChainsOnly, hideLowLongevity, minYears, minScore, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredLeads.length / pageSize);
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Handle select all
  const handleSelectAll = () => {
    if (selectedLeads.size === paginatedLeads.length) {
      setSelectedLeads(new Set());
    } else {
      setSelectedLeads(new Set(paginatedLeads.map((l) => l.id)));
    }
  };

  // Handle individual selection
  const handleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  // Score all leads
  const handleScoreAllLeads = async () => {
    setIsScoring(true);
    try {
      const response = await fetch("/api/ai/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "batch" }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success(`Scored ${data.results.length} leads`);
      } else {
        toast.error("Failed to score leads");
      }
    } catch (error) {
      toast.error("Failed to score leads");
    } finally {
      setIsScoring(false);
    }
  };

  // Update lead status
  const handleUpdateStatus = async (leadId: string, newStatus: string) => {
    try {
      await updateStatus({
        id: leadId as Id<"companies">,
        status: newStatus as any,
      });
      toast.success("Status updated");
      setShowStatusDialog(false);
      setSelectedLeadForStatus(null);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  // Export to CSV
  const handleExport = () => {
    const headers = ["Name", "Industry", "City", "State", "Years", "Rating", "Reviews", "AI Score", "Status", "Phone", "Website"];
    const csvContent = [
      headers.join(","),
      ...filteredLeads.map((lead) =>
        [
          `"${lead.name}"`,
          `"${lead.industry}"`,
          `"${lead.city}"`,
          `"${lead.state}"`,
          lead.years,
          lead.rating,
          lead.reviews,
          lead.aiScore,
          lead.status,
          `"${lead.phone}"`,
          `"${lead.website}"`,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${filteredLeads.length} leads`);
  };

  // Loading state
  if (!organizations || !companiesData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leads</h1>
          <p className="text-muted-foreground mt-1">
            {filteredLeads.length} leads • {leads.filter((l) => l.aiScore > 0).length} scored
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleScoreAllLeads} disabled={isScoring}>
            {isScoring ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Brain className="h-4 w-4 mr-2" />
            )}
            {isScoring ? "Scoring..." : "Score All"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Building2 className="h-4 w-4 mr-2" />
            Add Lead
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">High Score (70+)</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter((l) => l.aiScore >= 70).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">New</CardTitle>
            <Sparkles className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter((l) => l.status === "new").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            <Mail className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leads.filter((l) => l.status === "contacted").length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leads.length > 0
                ? (leads.reduce((sum, l) => sum + l.rating, 0) / leads.filter((l) => l.rating > 0).length || 0).toFixed(1)
                : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search companies, industries, cities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {industries.map((ind) => (
                    <SelectItem key={ind} value={ind}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={minScore} onValueChange={setMinScore}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Min Score" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">All Scores</SelectItem>
                  <SelectItem value="50">50+ Score</SelectItem>
                  <SelectItem value="60">60+ Score</SelectItem>
                  <SelectItem value="70">70+ Score</SelectItem>
                  <SelectItem value="80">80+ Score</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Advanced Filters */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="chains-only"
                  checked={showChainsOnly}
                  onCheckedChange={(checked) => setShowChainsOnly(checked as boolean)}
                />
                <label htmlFor="chains-only" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
                  <Link2 className="h-4 w-4 text-blue-500" />
                  Chains Only
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="longevity-filter"
                  checked={hideLowLongevity}
                  onCheckedChange={(checked) => setHideLowLongevity(checked as boolean)}
                />
                <label htmlFor="longevity-filter" className="text-sm font-medium flex items-center gap-1 cursor-pointer">
                  <Clock className="h-4 w-4 text-green-500" />
                  Min Years:
                </label>
                <Select value={minYears} onValueChange={setMinYears} disabled={!hideLowLongevity}>
                  <SelectTrigger className="w-[80px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5+</SelectItem>
                    <SelectItem value="10">10+</SelectItem>
                    <SelectItem value="15">15+</SelectItem>
                    <SelectItem value="20">20+</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Sort by:</span>
                <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
                  <SelectTrigger className="w-[120px] h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Added</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="aiScore">AI Score</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                    <SelectItem value="reviews">Reviews</SelectItem>
                    <SelectItem value="years">Years</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>

              <div className="ml-auto text-sm text-muted-foreground">
                {filteredLeads.length} leads match filters
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedLeads.size > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{selectedLeads.size} leads selected</span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                <Button variant="outline" size="sm">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add to Sequence
                </Button>
                <Button variant="outline" size="sm" onClick={() => setSelectedLeads(new Set())}>
                  Clear Selection
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Leads</CardTitle>
          <CardDescription>
            Showing {(currentPage - 1) * pageSize + 1}-{Math.min(currentPage * pageSize, filteredLeads.length)} of{" "}
            {filteredLeads.length} leads
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table Header */}
          <div className="flex items-center gap-4 px-4 py-2 bg-muted/50 rounded-lg mb-2 text-sm font-medium">
            <Checkbox
              checked={selectedLeads.size === paginatedLeads.length && paginatedLeads.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <div className="flex-1">Company</div>
            <div className="w-24 text-center">AI Score</div>
            <div className="w-20 text-center">Rating</div>
            <div className="w-20 text-center">Reviews</div>
            <div className="w-24 text-center">Status</div>
            <div className="w-20 text-center">Actions</div>
          </div>

          <div className="space-y-2">
            {paginatedLeads.map((lead) => (
              <div
                key={lead.id}
                className={`flex items-center gap-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors ${
                  selectedLeads.has(lead.id) ? "bg-primary/5 border-primary/30" : ""
                }`}
              >
                <Checkbox
                  checked={selectedLeads.has(lead.id)}
                  onCheckedChange={() => handleSelectLead(lead.id)}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold truncate">{lead.name}</h3>
                        {lead.isChain && (
                          <Badge variant="outline" className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                            <Link2 className="h-3 w-3 mr-1" />
                            Chain
                          </Badge>
                        )}
                        {lead.years >= 10 && (
                          <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {lead.years}yr
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {lead.city}, {lead.state}
                        </span>
                        <span>{lead.industry}</span>
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-24 text-center">
                  {lead.aiScore > 0 ? (
                    <AIScoreBadge score={lead.aiScore} />
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </div>

                <div className="w-20 text-center">
                  <span className="flex items-center justify-center gap-1">
                    <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                    {lead.rating > 0 ? lead.rating.toFixed(1) : "—"}
                  </span>
                </div>

                <div className="w-20 text-center text-sm">{lead.reviews > 0 ? lead.reviews : "—"}</div>

                <div className="w-24 text-center">
                  <Badge
                    variant={statusColors[lead.status] || "default"}
                    className="cursor-pointer"
                    onClick={() => {
                      setSelectedLeadForStatus(lead.id);
                      setShowStatusDialog(true);
                    }}
                  >
                    {lead.status}
                  </Badge>
                </div>

                <div className="w-20 flex items-center justify-center gap-1">
                  <AILeadAnalysis
                    lead={{
                      name: lead.name,
                      industry: lead.industry,
                      yearsInBusiness: lead.years,
                      city: lead.city,
                      state: lead.state,
                      website: lead.website,
                      googleRating: lead.rating,
                      googleReviewCount: lead.reviews,
                      isChain: lead.isChain,
                      totalLocations: lead.totalLocations,
                    }}
                  />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {lead.website && (
                        <DropdownMenuItem onClick={() => window.open(lead.website, "_blank")}>
                          <Globe className="h-4 w-4 mr-2" />
                          Visit Website
                        </DropdownMenuItem>
                      )}
                      {lead.phone && (
                        <DropdownMenuItem onClick={() => window.open(`tel:${lead.phone}`)}>
                          <Phone className="h-4 w-4 mr-2" />
                          Call
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Mail className="h-4 w-4 mr-2" />
                        Send Email
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedLeadForStatus(lead.id);
                          setShowStatusDialog(true);
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Change Status
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add to Sequence
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Lead Status</DialogTitle>
            <DialogDescription>Select a new status for this lead</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 py-4">
            {statusOptions.map((opt) => (
              <Button
                key={opt.value}
                variant="outline"
                className="justify-start"
                onClick={() => selectedLeadForStatus && handleUpdateStatus(selectedLeadForStatus, opt.value)}
              >
                <Badge variant={statusColors[opt.value]} className="mr-2">
                  {opt.label}
                </Badge>
              </Button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowStatusDialog(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
