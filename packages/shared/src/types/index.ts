// User types
export interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "manager" | "user";
  organizationId: string;
  createdAt: number;
  updatedAt: number;
}

// Organization types
export interface Organization {
  id: string;
  name: string;
  plan: "starter" | "pro" | "enterprise";
  settings: OrganizationSettings;
  createdAt: number;
}

export interface OrganizationSettings {
  autoEnrichLeads: boolean;
  emailVerification: boolean;
  aiAnalysis: boolean;
}

// Company (Lead) types
export interface Company {
  id: string;
  organizationId: string;
  name: string;
  industry?: string;
  yearsInBusiness?: number;
  employeeCount?: number;
  annualRevenue?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  leadScore?: number;
  pipelineStage: PipelineStage;
  source: DataSource;
  sourceUrl?: string;
  createdAt: number;
  updatedAt: number;
}

export type PipelineStage =
  | "new"
  | "pre-onboarding"
  | "onboarding"
  | "operations"
  | "churned";

export type DataSource =
  | "google_maps"
  | "linkedin"
  | "manual"
  | "import"
  | "referral";

// Contact types
export interface Contact {
  id: string;
  companyId: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  title?: string;
  linkedinUrl?: string;
  isPrimary: boolean;
  createdAt: number;
}

// Scraper types
export interface ScraperJob {
  id: string;
  organizationId: string;
  type: ScraperType;
  status: JobStatus;
  params: Record<string, any>;
  resultsCount?: number;
  error?: string;
  progress?: number;
  startedAt?: number;
  completedAt?: number;
  createdAt: number;
}

export type ScraperType =
  | "google_maps"
  | "linkedin"
  | "email_finder"
  | "ad_intelligence";

export type JobStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

// Campaign types
export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  type: ScraperType;
  status: "active" | "paused" | "completed";
  config: CampaignConfig;
  metrics: CampaignMetrics;
  createdAt: number;
  updatedAt: number;
}

export interface CampaignConfig {
  targetLeads: number;
  keywords?: string[];
  locations?: string[];
  industries?: string[];
}

export interface CampaignMetrics {
  leadsFound: number;
  emailsFound: number;
  qualifiedLeads: number;
  costPerLead?: number;
}

// Analytics types
export interface AnalyticsEvent {
  id: string;
  organizationId: string;
  eventType: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: number;
}

// CEI types
export interface CEIMetric {
  id: string;
  companyId: string;
  organizationId: string;
  overallScore: number;
  responsiveness: number;
  satisfaction: number;
  retention: number;
  advocacy: number;
  measuredAt: number;
}

// AI Report types
export interface AIReport {
  id: string;
  organizationId: string;
  type: ReportType;
  title: string;
  content: string;
  insights: string[];
  data?: Record<string, any>;
  createdAt: number;
}

export type ReportType =
  | "lead_scoring"
  | "market_analysis"
  | "campaign_analysis"
  | "competitor_analysis"
  | "growth_recommendations";
