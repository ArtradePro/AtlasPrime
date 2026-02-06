import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users & Organizations
  users: defineTable({
    email: v.string(),
    name: v.string(),
    organizationId: v.id("organizations"),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("user")),
    avatar: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_org", ["organizationId"]),

  organizations: defineTable({
    name: v.string(),
    plan: v.union(
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    apiCredits: v.number(),
    settings: v.object({
      autoEnrich: v.boolean(),
      emailVerification: v.boolean(),
      aiAnalysis: v.boolean(),
    }),
    createdAt: v.number(),
  }),

  // Companies/Leads Database
  companies: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    industry: v.string(),
    description: v.optional(v.string()),

    // Location Data
    primaryAddress: v.object({
      street: v.string(),
      city: v.string(),
      state: v.string(),
      country: v.string(),
      zipCode: v.string(),
      coordinates: v.optional(
        v.object({
          lat: v.number(),
          lng: v.number(),
        }),
      ),
    }),
    additionalLocations: v.array(
      v.object({
        name: v.string(),
        address: v.string(),
        city: v.string(),
        state: v.string(),
        country: v.string(),
        type: v.union(
          v.literal("headquarters"),
          v.literal("branch"),
          v.literal("franchise"),
        ),
      }),
    ),
    isChain: v.boolean(),
    totalLocations: v.number(),

    // Chain Intelligence
    chainClusterId: v.optional(v.string()),
    chainConfidence: v.optional(v.number()),
    chainRole: v.optional(
      v.union(
        v.literal("headquarters"),
        v.literal("branch"),
        v.literal("franchise"),
        v.literal("independent"),
      ),
    ),
    chainMatchReasons: v.optional(v.array(v.string())),

    // Business Info
    foundedYear: v.optional(v.number()),
    yearsInBusiness: v.optional(v.number()),
    longevityVerified: v.optional(v.boolean()),
    longevityConfidence: v.optional(
      v.union(
        v.literal("verified"),
        v.literal("estimated"),
        v.literal("unknown"),
      ),
    ),
    stabilityScore: v.optional(v.number()),
    employeeCount: v.optional(v.string()),
    annualRevenue: v.optional(v.string()),

    // Contact Information
    phone: v.optional(v.string()),
    website: v.optional(v.string()),

    // Social & Online Presence
    socialProfiles: v.object({
      linkedin: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitter: v.optional(v.string()),
      instagram: v.optional(v.string()),
    }),

    // Ratings & Reviews
    googleRating: v.optional(v.number()),
    googleReviewCount: v.optional(v.number()),

    // Data Sources Tracking
    dataSources: v.array(
      v.object({
        source: v.string(),
        scrapedAt: v.number(),
        dataPoints: v.array(v.string()),
      }),
    ),

    // Ad Intelligence
    adData: v.optional(
      v.object({
        googleAdsDetected: v.boolean(),
        estimatedMonthlySpend: v.optional(v.string()),
        activeAdPlatforms: v.array(v.string()),
        lastAdSeen: v.optional(v.number()),
      }),
    ),

    // Pipeline Status
    status: v.union(
      v.literal("new"),
      v.literal("qualified"),
      v.literal("contacted"),
      v.literal("pre-onboarding"),
      v.literal("onboarding"),
      v.literal("active"),
      v.literal("churned"),
    ),

    // AI Analysis
    aiScore: v.optional(v.number()),
    aiInsights: v.optional(v.string()),

    // AI Outreach Strategy (the "reason to contact")
    outreachStrategy: v.optional(
      v.object({
        generatedAt: v.number(),
        urgencyLevel: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low"),
        ),
        primaryAngle: v.object({
          gap: v.string(),
          impact: v.string(),
          openingLine: v.string(),
          estimatedValue: v.optional(v.string()),
          category: v.string(),
        }),
        alternativeAngles: v.array(
          v.object({
            gap: v.string(),
            openingLine: v.string(),
            category: v.string(),
          }),
        ),
        personalizationHooks: v.array(v.string()),
        bestContactMethod: v.union(
          v.literal("email"),
          v.literal("phone"),
          v.literal("linkedin"),
          v.literal("in_person"),
        ),
        doNotContact: v.boolean(),
        doNotContactReason: v.optional(v.string()),
      }),
    ),

    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
    lastEnrichedAt: v.optional(v.number()),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["organizationId", "status"])
    .index("by_years", ["organizationId", "yearsInBusiness"])
    .index("by_chain", ["organizationId", "isChain"])
    .index("by_chain_cluster", ["organizationId", "chainClusterId"])
    .searchIndex("search_companies", {
      searchField: "name",
      filterFields: ["organizationId", "industry", "status"],
    }),

  // Chain Clusters (for grouping related businesses)
  chainClusters: defineTable({
    organizationId: v.id("organizations"),
    clusterId: v.string(),
    canonicalName: v.string(),
    totalLocations: v.number(),
    confidence: v.number(),
    metadata: v.object({
      phonePatterns: v.array(v.string()),
      addressCities: v.array(v.string()),
      websiteDomain: v.optional(v.string()),
    }),
    memberCompanyIds: v.array(v.id("companies")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_cluster_id", ["organizationId", "clusterId"]),

  // Contacts
  contacts: defineTable({
    organizationId: v.id("organizations"),
    companyId: v.id("companies"),

    firstName: v.string(),
    lastName: v.string(),
    fullName: v.string(),
    title: v.optional(v.string()),
    department: v.optional(v.string()),
    seniority: v.optional(
      v.union(
        v.literal("c-level"),
        v.literal("vp"),
        v.literal("director"),
        v.literal("manager"),
        v.literal("staff"),
      ),
    ),

    // Contact Methods
    emails: v.array(
      v.object({
        email: v.string(),
        type: v.union(
          v.literal("primary"),
          v.literal("secondary"),
          v.literal("personal"),
        ),
        verified: v.boolean(),
        verifiedAt: v.optional(v.number()),
        source: v.string(),
      }),
    ),
    phones: v.array(
      v.object({
        phone: v.string(),
        type: v.union(
          v.literal("work"),
          v.literal("mobile"),
          v.literal("direct"),
        ),
        source: v.string(),
      }),
    ),

    // Social
    linkedinUrl: v.optional(v.string()),

    // Engagement
    lastContactedAt: v.optional(v.number()),
    contactAttempts: v.number(),

    // Source Tracking
    dataSource: v.string(),
    confidence: v.number(),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_org", ["organizationId"])
    .index("by_seniority", ["companyId", "seniority"]),

  // Scraper Jobs
  scraperJobs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),

    type: v.union(
      v.literal("google_maps"),
      v.literal("linkedin"),
      v.literal("email_finder"),
      v.literal("enrichment"),
      v.literal("ad_intelligence"),
    ),

    config: v.object({
      query: v.optional(v.string()),
      location: v.optional(v.string()),
      radius: v.optional(v.number()),
      filters: v.optional(
        v.object({
          minYearsInBusiness: v.optional(v.number()),
          industries: v.optional(v.array(v.string())),
          minEmployees: v.optional(v.number()),
          hasWebsite: v.optional(v.boolean()),
        }),
      ),
      maxResults: v.optional(v.number()),
      targetCompanyIds: v.optional(v.array(v.id("companies"))),
    }),

    status: v.union(
      v.literal("pending"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled"),
    ),

    progress: v.object({
      total: v.number(),
      processed: v.number(),
      succeeded: v.number(),
      failed: v.number(),
    }),

    results: v.optional(
      v.object({
        companiesFound: v.number(),
        contactsFound: v.number(),
        emailsFound: v.number(),
      }),
    ),

    error: v.optional(v.string()),

    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["organizationId", "status"]),

  // Campaigns
  campaigns: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),

    type: v.union(
      v.literal("email"),
      v.literal("linkedin"),
      v.literal("multi-channel"),
    ),

    targetCriteria: v.object({
      industries: v.array(v.string()),
      locations: v.array(v.string()),
      minYearsInBusiness: v.optional(v.number()),
      minEmployees: v.optional(v.number()),
      isChain: v.optional(v.boolean()),
    }),

    leads: v.array(v.id("companies")),

    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
    ),

    aiAnalysis: v.optional(
      v.object({
        overallScore: v.number(),
        recommendations: v.array(v.string()),
        predictedResponseRate: v.number(),
        predictedConversionRate: v.number(),
        analyzedAt: v.number(),
      }),
    ),

    metrics: v.object({
      totalLeads: v.number(),
      contacted: v.number(),
      responded: v.number(),
      converted: v.number(),
      revenue: v.number(),
    }),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["organizationId", "status"]),

  // Analytics Events
  analyticsEvents: defineTable({
    organizationId: v.id("organizations"),
    type: v.string(),
    category: v.union(
      v.literal("sales"),
      v.literal("pipeline"),
      v.literal("campaign"),
      v.literal("scraper"),
      v.literal("engagement"),
    ),
    data: v.any(),
    timestamp: v.number(),
  })
    .index("by_org_category", ["organizationId", "category"])
    .index("by_timestamp", ["organizationId", "timestamp"]),

  // AI Reports
  aiReports: defineTable({
    organizationId: v.id("organizations"),
    type: v.union(
      v.literal("campaign_analysis"),
      v.literal("lead_scoring"),
      v.literal("market_insights"),
      v.literal("competitor_analysis"),
      v.literal("growth_recommendations"),
    ),
    title: v.string(),
    content: v.string(),
    insights: v.array(
      v.object({
        category: v.string(),
        insight: v.string(),
        importance: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low"),
        ),
        actionable: v.boolean(),
      }),
    ),
    dataRange: v.object({
      start: v.number(),
      end: v.number(),
    }),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_type", ["organizationId", "type"]),

  // CEI (Customer Experience Index) Tracking
  ceiMetrics: defineTable({
    organizationId: v.id("organizations"),
    companyId: v.id("companies"),

    scores: v.object({
      overall: v.number(),
      responsiveness: v.number(),
      satisfaction: v.number(),
      retention: v.number(),
      advocacy: v.number(),
    }),

    touchpoints: v.array(
      v.object({
        type: v.string(),
        date: v.number(),
        sentiment: v.union(
          v.literal("positive"),
          v.literal("neutral"),
          v.literal("negative"),
        ),
        notes: v.optional(v.string()),
      }),
    ),

    calculatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_company", ["companyId"]),

  // =====================
  // EMAIL SEQUENCES
  // =====================
  emailSequences: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    steps: v.array(
      v.object({
        order: v.number(),
        type: v.union(
          v.literal("email"),
          v.literal("wait"),
          v.literal("condition"),
        ),
        delayDays: v.optional(v.number()),
        subject: v.optional(v.string()),
        body: v.optional(v.string()),
        useAiPersonalization: v.boolean(),
        condition: v.optional(
          v.object({
            field: v.string(),
            operator: v.string(),
            value: v.string(),
          }),
        ),
      }),
    ),
    targetCriteria: v.optional(
      v.object({
        industries: v.optional(v.array(v.string())),
        minYearsInBusiness: v.optional(v.number()),
        isChain: v.optional(v.boolean()),
        statuses: v.optional(v.array(v.string())),
      }),
    ),
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("paused"),
    ),
    metrics: v.object({
      enrolled: v.number(),
      completed: v.number(),
      replied: v.number(),
      bounced: v.number(),
      unsubscribed: v.number(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["organizationId", "status"]),

  sequenceEnrollments: defineTable({
    sequenceId: v.id("emailSequences"),
    companyId: v.id("companies"),
    contactId: v.id("contacts"),
    currentStep: v.number(),
    status: v.union(
      v.literal("active"),
      v.literal("paused"),
      v.literal("completed"),
      v.literal("replied"),
      v.literal("unsubscribed"),
    ),
    enrolledAt: v.number(),
    nextActionAt: v.number(),
    history: v.array(
      v.object({
        eventType: v.string(),
        stepIndex: v.number(),
        timestamp: v.number(),
        metadata: v.optional(v.any()),
      }),
    ),
  })
    .index("by_sequence", ["sequenceId"])
    .index("by_company", ["companyId"])
    .index("by_status", ["sequenceId", "status"])
    .index("by_next_action", ["status", "nextActionAt"]),

  // =====================
  // TECH STACK DETECTION
  // =====================
  techStackAnalysis: defineTable({
    companyId: v.id("companies"),
    website: v.string(),
    detectedAt: v.number(),
    technologies: v.array(
      v.object({
        name: v.string(),
        category: v.string(),
        version: v.optional(v.string()),
        confidence: v.number(),
      }),
    ),
    categories: v.object({
      cms: v.optional(v.array(v.string())),
      ecommerce: v.optional(v.array(v.string())),
      analytics: v.optional(v.array(v.string())),
      crm: v.optional(v.array(v.string())),
      marketing: v.optional(v.array(v.string())),
      payments: v.optional(v.array(v.string())),
      hosting: v.optional(v.array(v.string())),
      framework: v.optional(v.array(v.string())),
    }),
    insights: v.array(v.string()),
    lastUpdated: v.number(),
  }).index("by_company", ["companyId"]),

  // =====================
  // REVIEW SENTIMENT ANALYSIS
  // =====================
  reviewAnalysis: defineTable({
    companyId: v.id("companies"),
    source: v.union(
      v.literal("google"),
      v.literal("yelp"),
      v.literal("facebook"),
    ),
    analyzedAt: v.number(),
    totalReviews: v.number(),
    averageRating: v.number(),
    sentimentBreakdown: v.object({
      positive: v.number(),
      neutral: v.number(),
      negative: v.number(),
    }),
    topThemes: v.array(
      v.object({
        theme: v.string(),
        sentiment: v.union(
          v.literal("positive"),
          v.literal("negative"),
          v.literal("mixed"),
        ),
        frequency: v.number(),
        exampleQuotes: v.array(v.string()),
      }),
    ),
    painPoints: v.array(
      v.object({
        issue: v.string(),
        frequency: v.number(),
        severity: v.union(
          v.literal("high"),
          v.literal("medium"),
          v.literal("low"),
        ),
        opportunity: v.string(),
      }),
    ),
    competitorMentions: v.array(
      v.object({
        competitor: v.string(),
        sentiment: v.string(),
        count: v.number(),
      }),
    ),
    aiSummary: v.string(),
    outreachAngles: v.array(v.string()),
  })
    .index("by_company", ["companyId"])
    .index("by_source", ["companyId", "source"]),

  // =====================
  // CALL TRACKING (Auto-Dialer)
  // =====================
  callLogs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    companyId: v.id("companies"),
    contactId: v.optional(v.id("contacts")),
    phoneNumber: v.string(),
    direction: v.union(v.literal("outbound"), v.literal("inbound")),
    status: v.union(
      v.literal("completed"),
      v.literal("no_answer"),
      v.literal("busy"),
      v.literal("voicemail"),
      v.literal("failed"),
    ),
    duration: v.optional(v.number()),
    recordingUrl: v.optional(v.string()),
    transcription: v.optional(v.string()),
    aiSummary: v.optional(v.string()),
    sentiment: v.optional(
      v.union(
        v.literal("positive"),
        v.literal("neutral"),
        v.literal("negative"),
      ),
    ),
    nextSteps: v.optional(v.array(v.string())),
    twilioCallSid: v.optional(v.string()),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
  })
    .index("by_org", ["organizationId"])
    .index("by_company", ["companyId"])
    .index("by_user", ["userId"]),

  // =====================
  // COMPETITOR TRACKING
  // =====================
  competitorAlerts: defineTable({
    organizationId: v.id("organizations"),
    companyId: v.id("companies"),
    alertType: v.union(
      v.literal("new_competitor"),
      v.literal("competitor_ad"),
      v.literal("competitor_review"),
      v.literal("competitor_expansion"),
    ),
    competitor: v.object({
      name: v.string(),
      address: v.optional(v.string()),
      distance: v.optional(v.number()),
      website: v.optional(v.string()),
    }),
    details: v.string(),
    urgency: v.union(v.literal("high"), v.literal("medium"), v.literal("low")),
    isRead: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_company", ["companyId"])
    .index("by_unread", ["organizationId", "isRead"]),

  // =====================
  // TERRITORIES
  // =====================
  territories: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    assignedUserId: v.optional(v.id("users")),
    boundaries: v.object({
      type: v.union(
        v.literal("zip_codes"),
        v.literal("cities"),
        v.literal("states"),
        v.literal("radius"),
        v.literal("custom"),
      ),
      zipCodes: v.optional(v.array(v.string())),
      cities: v.optional(v.array(v.string())),
      states: v.optional(v.array(v.string())),
      center: v.optional(v.object({ lat: v.number(), lng: v.number() })),
      radiusMiles: v.optional(v.number()),
      customPolygon: v.optional(
        v.array(v.object({ lat: v.number(), lng: v.number() })),
      ),
    }),
    metrics: v.object({
      totalLeads: v.number(),
      activeLeads: v.number(),
      convertedLeads: v.number(),
      revenue: v.number(),
    }),
    color: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_user", ["assignedUserId"]),

  // =====================
  // INDUSTRY BENCHMARKS
  // =====================
  industryBenchmarks: defineTable({
    industry: v.string(),
    region: v.optional(v.string()),
    metrics: v.object({
      avgYearsInBusiness: v.number(),
      avgEmployeeCount: v.number(),
      avgGoogleRating: v.number(),
      avgReviewCount: v.number(),
      avgAdSpend: v.optional(v.number()),
      commonTechStack: v.array(v.string()),
      avgConversionRate: v.number(),
      avgDealSize: v.number(),
      avgSalesCycle: v.number(),
    }),
    sampleSize: v.number(),
    calculatedAt: v.number(),
  })
    .index("by_industry", ["industry"])
    .index("by_region", ["industry", "region"]),

  // =====================
  // LEAD SIMILARITY
  // =====================
  leadSimilarity: defineTable({
    organizationId: v.id("organizations"),
    companyId: v.id("companies"),
    similarToCompanyId: v.id("companies"),
    similarityScore: v.number(),
    matchingFactors: v.array(
      v.object({
        factor: v.string(),
        weight: v.number(),
        match: v.boolean(),
      }),
    ),
    outcome: v.optional(
      v.union(v.literal("won"), v.literal("lost"), v.literal("pending")),
    ),
    calculatedAt: v.number(),
  })
    .index("by_company", ["companyId"])
    .index("by_org", ["organizationId"]),

  // =====================
  // INTEGRATIONS
  // =====================
  integrations: defineTable({
    organizationId: v.id("organizations"),
    provider: v.union(
      v.literal("hubspot"),
      v.literal("salesforce"),
      v.literal("twilio"),
      v.literal("calendly"),
      v.literal("slack"),
      v.literal("zapier"),
      v.literal("stripe"),
      v.literal("quickbooks"),
    ),
    status: v.union(
      v.literal("connected"),
      v.literal("disconnected"),
      v.literal("error"),
    ),
    credentials: v.optional(v.any()), // Encrypted in production
    settings: v.optional(v.any()),
    lastSyncAt: v.optional(v.number()),
    syncErrors: v.optional(v.array(v.string())),
    connectedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_provider", ["organizationId", "provider"]),

  // =====================
  // CREDITS & BILLING
  // =====================
  creditTransactions: defineTable({
    organizationId: v.id("organizations"),
    type: v.union(
      v.literal("purchase"),
      v.literal("usage"),
      v.literal("refund"),
      v.literal("bonus"),
    ),
    amount: v.number(),
    balance: v.number(),
    description: v.string(),
    metadata: v.optional(
      v.object({
        feature: v.optional(v.string()),
        companyId: v.optional(v.id("companies")),
        stripePaymentId: v.optional(v.string()),
      }),
    ),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_type", ["organizationId", "type"]),

  // =====================
  // PROPOSALS
  // =====================
  proposals: defineTable({
    organizationId: v.id("organizations"),
    companyId: v.id("companies"),
    contactId: v.optional(v.id("contacts")),
    title: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("accepted"),
      v.literal("rejected"),
      v.literal("expired"),
    ),
    content: v.object({
      executiveSummary: v.string(),
      problemStatement: v.string(),
      proposedSolution: v.string(),
      pricing: v.array(
        v.object({
          item: v.string(),
          description: v.string(),
          price: v.number(),
          recurring: v.optional(v.boolean()),
        }),
      ),
      timeline: v.optional(v.string()),
      terms: v.optional(v.string()),
    }),
    aiGenerated: v.boolean(),
    basedOnGaps: v.optional(v.array(v.string())),
    validUntil: v.number(),
    viewedAt: v.optional(v.number()),
    respondedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_company", ["companyId"])
    .index("by_status", ["organizationId", "status"]),

  // =====================
  // OBJECTION HANDLING
  // =====================
  objectionScripts: defineTable({
    organizationId: v.id("organizations"),
    industry: v.optional(v.string()),
    objection: v.string(),
    category: v.union(
      v.literal("price"),
      v.literal("timing"),
      v.literal("competition"),
      v.literal("authority"),
      v.literal("need"),
      v.literal("trust"),
    ),
    responses: v.array(
      v.object({
        response: v.string(),
        tone: v.union(
          v.literal("empathetic"),
          v.literal("assertive"),
          v.literal("educational"),
        ),
        followUp: v.optional(v.string()),
        effectiveness: v.optional(v.number()),
      }),
    ),
    aiGenerated: v.boolean(),
    usageCount: v.number(),
    successRate: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_category", ["organizationId", "category"])
    .index("by_industry", ["organizationId", "industry"]),

  // =====================
  // TEAM ROLES & PERMISSIONS
  // =====================
  teamRoles: defineTable({
    organizationId: v.id("organizations"),
    name: v.string(),
    description: v.optional(v.string()),
    isDefault: v.boolean(),
    permissions: v.object({
      // Lead Management
      leads_view: v.boolean(),
      leads_create: v.boolean(),
      leads_edit: v.boolean(),
      leads_delete: v.boolean(),
      leads_export: v.boolean(),
      // Campaigns
      campaigns_view: v.boolean(),
      campaigns_create: v.boolean(),
      campaigns_edit: v.boolean(),
      campaigns_delete: v.boolean(),
      // Scraper
      scraper_run: v.boolean(),
      scraper_configure: v.boolean(),
      // Analytics
      analytics_view: v.boolean(),
      analytics_export: v.boolean(),
      // Integrations
      integrations_view: v.boolean(),
      integrations_manage: v.boolean(),
      // Team
      team_view: v.boolean(),
      team_invite: v.boolean(),
      team_manage: v.boolean(),
      // Billing
      billing_view: v.boolean(),
      billing_manage: v.boolean(),
      // Settings
      settings_view: v.boolean(),
      settings_manage: v.boolean(),
      // API
      api_access: v.boolean(),
    }),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_default", ["organizationId", "isDefault"]),

  teamInvites: defineTable({
    organizationId: v.id("organizations"),
    email: v.string(),
    roleId: v.id("teamRoles"),
    invitedBy: v.id("users"),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("revoked"),
    ),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
    acceptedAt: v.optional(v.number()),
  })
    .index("by_org", ["organizationId"])
    .index("by_email", ["email"])
    .index("by_token", ["token"]),

  // =====================
  // WHITE-LABEL SETTINGS
  // =====================
  whiteLabelSettings: defineTable({
    organizationId: v.id("organizations"),
    enabled: v.boolean(),
    branding: v.object({
      companyName: v.string(),
      logoUrl: v.optional(v.string()),
      faviconUrl: v.optional(v.string()),
      primaryColor: v.string(),
      secondaryColor: v.string(),
      accentColor: v.string(),
      darkMode: v.boolean(),
    }),
    domain: v.optional(
      v.object({
        customDomain: v.string(),
        verified: v.boolean(),
        sslEnabled: v.boolean(),
        dnsRecords: v.array(
          v.object({
            type: v.string(),
            name: v.string(),
            value: v.string(),
            verified: v.boolean(),
          }),
        ),
      }),
    ),
    emailSettings: v.optional(
      v.object({
        fromName: v.string(),
        fromEmail: v.string(),
        replyTo: v.string(),
        customDomain: v.optional(v.string()),
      }),
    ),
    hidePoweredBy: v.boolean(),
    customTermsUrl: v.optional(v.string()),
    customPrivacyUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["organizationId"]),

  // =====================
  // API ACCESS
  // =====================
  apiKeys: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    name: v.string(),
    keyPrefix: v.string(), // First 8 chars for display
    keyHash: v.string(), // Hashed full key
    permissions: v.array(v.string()), // API scopes
    rateLimit: v.object({
      requestsPerMinute: v.number(),
      requestsPerDay: v.number(),
    }),
    lastUsedAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_prefix", ["keyPrefix"])
    .index("by_active", ["organizationId", "isActive"]),

  apiUsage: defineTable({
    organizationId: v.id("organizations"),
    apiKeyId: v.id("apiKeys"),
    endpoint: v.string(),
    method: v.string(),
    statusCode: v.number(),
    responseTime: v.number(),
    creditsUsed: v.number(),
    requestIp: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_key", ["apiKeyId"])
    .index("by_endpoint", ["organizationId", "endpoint"])
    .index("by_timestamp", ["organizationId", "timestamp"]),

  // =====================
  // SUBSCRIPTION & BILLING
  // =====================
  subscriptions: defineTable({
    organizationId: v.id("organizations"),
    plan: v.union(
      v.literal("free"),
      v.literal("starter"),
      v.literal("pro"),
      v.literal("enterprise"),
    ),
    status: v.union(
      v.literal("active"),
      v.literal("past_due"),
      v.literal("canceled"),
      v.literal("trialing"),
    ),
    stripeCustomerId: v.optional(v.string()),
    stripeSubscriptionId: v.optional(v.string()),
    currentPeriodStart: v.number(),
    currentPeriodEnd: v.number(),
    cancelAtPeriodEnd: v.boolean(),
    features: v.object({
      maxUsers: v.number(),
      maxLeads: v.number(),
      maxScrapesPerMonth: v.number(),
      maxEmailsPerMonth: v.number(),
      aiCreditsPerMonth: v.number(),
      customBranding: v.boolean(),
      apiAccess: v.boolean(),
      prioritySupport: v.boolean(),
      dedicatedSuccess: v.boolean(),
    }),
    usage: v.object({
      users: v.number(),
      leads: v.number(),
      scrapesThisMonth: v.number(),
      emailsThisMonth: v.number(),
      aiCreditsUsed: v.number(),
    }),
    trialEndsAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_org", ["organizationId"]),

  invoices: defineTable({
    organizationId: v.id("organizations"),
    stripeInvoiceId: v.string(),
    amount: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("paid"),
      v.literal("void"),
      v.literal("uncollectible"),
    ),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitAmount: v.number(),
        amount: v.number(),
      }),
    ),
    pdfUrl: v.optional(v.string()),
    hostedUrl: v.optional(v.string()),
    periodStart: v.number(),
    periodEnd: v.number(),
    dueDate: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_status", ["organizationId", "status"]),

  // =====================
  // AUDIT LOG
  // =====================
  auditLogs: defineTable({
    organizationId: v.id("organizations"),
    userId: v.id("users"),
    action: v.string(),
    resourceType: v.string(),
    resourceId: v.optional(v.string()),
    changes: v.optional(
      v.object({
        before: v.optional(v.any()),
        after: v.optional(v.any()),
      }),
    ),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    timestamp: v.number(),
  })
    .index("by_org", ["organizationId"])
    .index("by_user", ["userId"])
    .index("by_resource", ["organizationId", "resourceType"])
    .index("by_timestamp", ["organizationId", "timestamp"]),
});
