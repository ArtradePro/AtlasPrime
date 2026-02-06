"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  MapPin,
  Globe,
  Phone,
  Mail,
  Star,
  Calendar,
  Users,
  DollarSign,
  ArrowLeft,
  Edit,
  ExternalLink,
  Linkedin,
  Facebook,
  Twitter,
} from "lucide-react";
import Link from "next/link";

// Mock lead data
const lead = {
  id: 1,
  name: "Coastal Seafood Restaurant",
  industry: "Restaurant",
  description: "Premium seafood dining experience established in 2009, known for fresh catches and waterfront views.",
  address: "1234 Ocean Drive",
  city: "Miami",
  state: "FL",
  zipCode: "33139",
  country: "USA",
  years: 15,
  foundedYear: 2009,
  website: "coastalseafood.com",
  phone: "(305) 555-0123",
  rating: 4.5,
  reviews: 234,
  status: "qualified",
  isChain: false,
  totalLocations: 1,
  employeeCount: "50-100",
  annualRevenue: "$2M-$5M",
  socialProfiles: {
    linkedin: "linkedin.com/company/coastalseafood",
    facebook: "facebook.com/coastalseafood",
    twitter: "twitter.com/coastalseafood",
  },
  contacts: [
    {
      name: "John Martinez",
      title: "Owner & General Manager",
      email: "john@coastalseafood.com",
      phone: "(305) 555-0124",
      seniority: "c-level",
    },
    {
      name: "Sarah Chen",
      title: "Marketing Director",
      email: "sarah@coastalseafood.com",
      phone: "(305) 555-0125",
      seniority: "director",
    },
  ],
  aiScore: 85,
  aiInsights: "High potential lead with strong local presence. Restaurant has been operating profitably for 15 years with excellent reviews. Recommend immediate outreach focusing on digital marketing solutions.",
};

export default function LeadDetailPage({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/leads">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{lead.name}</h1>
              <Badge variant="success">{lead.status}</Badge>
            </div>
            <p className="text-muted-foreground mt-1">
              {lead.industry} • {lead.city}, {lead.state}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button>Contact Lead</Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overview Card */}
          <Card>
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{lead.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Calendar className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-2xl font-bold mt-2">{lead.years}</p>
                  <p className="text-sm text-muted-foreground">Years in Business</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Star className="h-5 w-5 mx-auto text-yellow-500" />
                  <p className="text-2xl font-bold mt-2">{lead.rating}</p>
                  <p className="text-sm text-muted-foreground">{lead.reviews} Reviews</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <Users className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-2xl font-bold mt-2">{lead.employeeCount}</p>
                  <p className="text-sm text-muted-foreground">Employees</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-muted/50">
                  <DollarSign className="h-5 w-5 mx-auto text-muted-foreground" />
                  <p className="text-2xl font-bold mt-2">{lead.annualRevenue}</p>
                  <p className="text-sm text-muted-foreground">Est. Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contacts Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lead.contacts.map((contact, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-semibold">
                          {contact.name.split(" ").map(n => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{contact.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contact.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Mail className="h-4 w-4 mr-2" />
                        {contact.email}
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4 mr-2" />
                        {contact.phone}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI Insights
                <Badge variant="secondary">Score: {lead.aiScore}/100</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
                <p className="text-sm">{lead.aiInsights}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Details */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm">{lead.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {lead.city}, {lead.state} {lead.zipCode}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <p className="text-sm">{lead.phone}</p>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-5 w-5 text-muted-foreground" />
                <a
                  href={`https://${lead.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  {lead.website}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Social Profiles Card */}
          <Card>
            <CardHeader>
              <CardTitle>Social Profiles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lead.socialProfiles.linkedin && (
                <a
                  href={`https://${lead.socialProfiles.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Linkedin className="h-5 w-5 text-[#0077b5]" />
                  <span className="text-sm">LinkedIn</span>
                </a>
              )}
              {lead.socialProfiles.facebook && (
                <a
                  href={`https://${lead.socialProfiles.facebook}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Facebook className="h-5 w-5 text-[#1877f2]" />
                  <span className="text-sm">Facebook</span>
                </a>
              )}
              {lead.socialProfiles.twitter && (
                <a
                  href={`https://${lead.socialProfiles.twitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  <Twitter className="h-5 w-5 text-[#1da1f2]" />
                  <span className="text-sm">Twitter</span>
                </a>
              )}
            </CardContent>
          </Card>

          {/* Business Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Founded</dt>
                  <dd className="text-sm font-medium">{lead.foundedYear}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Industry</dt>
                  <dd className="text-sm font-medium">{lead.industry}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Locations</dt>
                  <dd className="text-sm font-medium">{lead.totalLocations}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-sm text-muted-foreground">Is Chain</dt>
                  <dd className="text-sm font-medium">{lead.isChain ? "Yes" : "No"}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
