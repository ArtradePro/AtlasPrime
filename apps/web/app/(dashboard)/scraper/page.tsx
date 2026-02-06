"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  MapPin,
  Linkedin,
  Mail,
  TrendingUp,
  Loader2,
  Info,
  Play,
  Pause,
  History,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const industries = [
  "Restaurants",
  "Retail",
  "Healthcare",
  "Real Estate",
  "Legal Services",
  "Financial Services",
  "Manufacturing",
  "Construction",
  "Technology",
  "Education",
  "Hospitality",
  "Automotive",
  "Professional Services",
];

const recentJobs = [
  {
    id: 1,
    type: "Google Maps",
    query: "Restaurants in Miami, FL",
    status: "completed",
    results: 234,
    date: "2 hours ago",
  },
  {
    id: 2,
    type: "Email Finder",
    query: "Healthcare leads enrichment",
    status: "running",
    progress: 67,
    results: 89,
    date: "45 min ago",
  },
  {
    id: 3,
    type: "LinkedIn",
    query: "Tech companies in Austin",
    status: "completed",
    results: 156,
    date: "1 day ago",
  },
];

export default function ScraperPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [radius, setRadius] = useState([25]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [minYearsInBusiness, setMinYearsInBusiness] = useState("10");
  const [maxResults, setMaxResults] = useState("100");
  const [requireWebsite, setRequireWebsite] = useState(true);
  const [findEmails, setFindEmails] = useState(true);

  const handleStartScrape = async (type: string) => {
    if (!searchQuery.trim() || !location.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a search query and location.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          query: searchQuery,
          location,
          radius: radius[0],
          filters: {
            industries:
              selectedIndustries.length > 0 ? selectedIndustries : undefined,
            minYearsInBusiness: parseInt(minYearsInBusiness),
            hasWebsite: requireWebsite,
          },
          maxResults: parseInt(maxResults),
          findEmails,
          // Demo org ID - in production this comes from auth
          organizationId: "demo_org_atlas_prime",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to start scraping job");
      }

      const result = await response.json();

      toast({
        title: "Scraper Job Started",
        description: `Job ID: ${result.jobId || "queued"}. Your ${type.replace("_", " ")} scraping job has been queued.`,
      });
    } catch (error) {
      toast({
        title: "Error Starting Job",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start scraping job. Make sure the scraper service is running.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Lead Scraper</h1>
        <p className="text-muted-foreground mt-1">
          Configure and launch data collection from multiple sources
        </p>
      </div>

      {/* Scraper Types */}
      <Tabs defaultValue="google_maps" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="google_maps" className="gap-2">
            <MapPin className="h-4 w-4" />
            <span className="hidden sm:inline">Google Maps</span>
          </TabsTrigger>
          <TabsTrigger value="linkedin" className="gap-2">
            <Linkedin className="h-4 w-4" />
            <span className="hidden sm:inline">LinkedIn</span>
          </TabsTrigger>
          <TabsTrigger value="email_finder" className="gap-2">
            <Mail className="h-4 w-4" />
            <span className="hidden sm:inline">Email Finder</span>
          </TabsTrigger>
          <TabsTrigger value="ad_intelligence" className="gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Ad Intel</span>
          </TabsTrigger>
        </TabsList>

        {/* Google Maps Tab */}
        <TabsContent value="google_maps">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Search Configuration */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Google Maps Search</CardTitle>
                <CardDescription>
                  Find businesses by location, category, and keywords
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="search">Search Query</Label>
                    <Input
                      id="search"
                      placeholder="e.g., restaurants, law firms"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g., Miami, FL"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Search Radius: {radius[0]} miles</Label>
                  <Slider
                    value={radius}
                    onValueChange={setRadius}
                    max={100}
                    min={1}
                    step={1}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Industries (optional)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {industries.slice(0, 9).map((industry) => (
                      <div key={industry} className="flex items-center gap-2">
                        <Checkbox
                          id={industry}
                          checked={selectedIndustries.includes(industry)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedIndustries([
                                ...selectedIndustries,
                                industry,
                              ]);
                            } else {
                              setSelectedIndustries(
                                selectedIndustries.filter(
                                  (i) => i !== industry,
                                ),
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={industry}
                          className="text-sm font-normal cursor-pointer"
                        >
                          {industry}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => handleStartScrape("google_maps")}
                  disabled={isLoading || !searchQuery || !location}
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 mr-2" />
                  )}
                  Start Scrape
                </Button>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filters</CardTitle>
                <CardDescription>Refine your results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Min. Years in Business</Label>
                  <Select
                    value={minYearsInBusiness}
                    onValueChange={setMinYearsInBusiness}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Any</SelectItem>
                      <SelectItem value="5">5+ years</SelectItem>
                      <SelectItem value="10">10+ years</SelectItem>
                      <SelectItem value="15">15+ years</SelectItem>
                      <SelectItem value="20">20+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Results</Label>
                  <Select value={maxResults} onValueChange={setMaxResults}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="50">50 results</SelectItem>
                      <SelectItem value="100">100 results</SelectItem>
                      <SelectItem value="250">250 results</SelectItem>
                      <SelectItem value="500">500 results</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="website"
                      checked={requireWebsite}
                      onCheckedChange={(c) => setRequireWebsite(!!c)}
                    />
                    <Label
                      htmlFor="website"
                      className="font-normal cursor-pointer"
                    >
                      Must have website
                    </Label>
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="emails"
                      checked={findEmails}
                      onCheckedChange={(c) => setFindEmails(!!c)}
                    />
                    <Label
                      htmlFor="emails"
                      className="font-normal cursor-pointer"
                    >
                      Auto-find emails
                    </Label>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4 mt-0.5 shrink-0" />
                    <p>
                      Est. credits:{" "}
                      <span className="font-semibold text-foreground">
                        {parseInt(maxResults) * (findEmails ? 3 : 1)}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* LinkedIn Tab */}
        <TabsContent value="linkedin">
          <Card>
            <CardHeader>
              <CardTitle>LinkedIn Company Search</CardTitle>
              <CardDescription>
                Find decision-makers and company information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Linkedin className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>LinkedIn integration coming soon.</p>
                <p className="text-sm mt-2">
                  Connect your account in Settings to enable.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Finder Tab */}
        <TabsContent value="email_finder">
          <Card>
            <CardHeader>
              <CardTitle>Email Finder</CardTitle>
              <CardDescription>
                Find and verify contact emails for existing leads
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Target Companies</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select companies to enrich" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All without emails</SelectItem>
                    <SelectItem value="recent">Recently added</SelectItem>
                    <SelectItem value="qualified">Qualified leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Email Types</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="cLevel" defaultChecked />
                    <Label htmlFor="cLevel" className="font-normal">
                      C-Level
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="managers" defaultChecked />
                    <Label htmlFor="managers" className="font-normal">
                      Managers
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="general" />
                    <Label htmlFor="general" className="font-normal">
                      General
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleStartScrape("email_finder")}
              >
                <Mail className="h-4 w-4 mr-2" />
                Start Email Discovery
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ad Intelligence Tab */}
        <TabsContent value="ad_intelligence">
          <Card>
            <CardHeader>
              <CardTitle>Ad Intelligence</CardTitle>
              <CardDescription>
                Track advertising activity and estimated spend
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Platforms to Monitor</Label>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Checkbox id="googleAds" defaultChecked />
                    <Label htmlFor="googleAds" className="font-normal">
                      Google Ads
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="facebookAds" defaultChecked />
                    <Label htmlFor="facebookAds" className="font-normal">
                      Meta Ads
                    </Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Checkbox id="linkedinAds" />
                    <Label htmlFor="linkedinAds" className="font-normal">
                      LinkedIn Ads
                    </Label>
                  </div>
                </div>
              </div>

              <Button
                className="w-full"
                size="lg"
                onClick={() => handleStartScrape("ad_intelligence")}
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Recent Jobs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Jobs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div
                key={job.id}
                className="flex items-center justify-between p-4 rounded-lg border"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    {job.type === "Google Maps" && (
                      <MapPin className="h-5 w-5 text-primary" />
                    )}
                    {job.type === "LinkedIn" && (
                      <Linkedin className="h-5 w-5 text-primary" />
                    )}
                    {job.type === "Email Finder" && (
                      <Mail className="h-5 w-5 text-primary" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{job.query}</p>
                    <p className="text-sm text-muted-foreground">{job.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {job.status === "running" && (
                    <div className="w-32">
                      <Progress value={job.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.progress}%
                      </p>
                    </div>
                  )}
                  <Badge
                    variant={job.status === "completed" ? "success" : "warning"}
                  >
                    {job.status}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {job.results} leads
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
