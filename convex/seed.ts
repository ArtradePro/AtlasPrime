import { mutation } from "./_generated/server";

// Seed script to populate sample data for testing
export const seedSampleData = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if we already have data
    const existingOrgs = await ctx.db.query("organizations").collect();
    if (existingOrgs.length > 0) {
      return { message: "Database already seeded", orgId: existingOrgs[0]._id };
    }

    // Create organization
    const orgId = await ctx.db.insert("organizations", {
      name: "Atlas Prime Demo",
      plan: "pro",
      apiCredits: 10000,
      settings: {
        autoEnrich: true,
        emailVerification: true,
        aiAnalysis: true,
      },
      createdAt: Date.now(),
    });

    // Create admin user
    const userId = await ctx.db.insert("users", {
      email: "admin@atlasprime.com",
      name: "Admin User",
      organizationId: orgId,
      role: "admin",
      createdAt: Date.now(),
    });

    // Sample companies data
    const companies = [
      {
        name: "Mario's Italian Kitchen",
        industry: "Restaurants",
        description:
          "Family-owned Italian restaurant serving authentic cuisine since 1985",
        primaryAddress: {
          street: "123 Main Street",
          city: "New York",
          state: "NY",
          country: "USA",
          zipCode: "10001",
        },
        phone: "(212) 555-0101",
        website: "https://mariositalian.com",
        foundedYear: 1985,
        yearsInBusiness: 41,
        googleRating: 4.7,
        googleReviewCount: 342,
        status: "qualified" as const,
        aiScore: 87,
      },
      {
        name: "Johnson & Associates Law Firm",
        industry: "Legal Services",
        description:
          "Full-service law firm specializing in corporate and real estate law",
        primaryAddress: {
          street: "456 Park Avenue",
          city: "New York",
          state: "NY",
          country: "USA",
          zipCode: "10022",
        },
        phone: "(212) 555-0202",
        website: "https://johnsonlawfirm.com",
        foundedYear: 1998,
        yearsInBusiness: 28,
        googleRating: 4.9,
        googleReviewCount: 89,
        status: "new" as const,
        aiScore: 92,
      },
      {
        name: "Sunrise Auto Repair",
        industry: "Automotive",
        description: "Trusted auto repair shop with certified mechanics",
        primaryAddress: {
          street: "789 Industrial Blvd",
          city: "Brooklyn",
          state: "NY",
          country: "USA",
          zipCode: "11201",
        },
        phone: "(718) 555-0303",
        website: "https://sunriseauto.com",
        foundedYear: 2005,
        yearsInBusiness: 21,
        googleRating: 4.5,
        googleReviewCount: 156,
        status: "contacted" as const,
        aiScore: 74,
      },
      {
        name: "Green Valley Dental",
        industry: "Healthcare",
        description: "Modern dental practice offering comprehensive care",
        primaryAddress: {
          street: "321 Healthcare Way",
          city: "Manhattan",
          state: "NY",
          country: "USA",
          zipCode: "10016",
        },
        phone: "(212) 555-0404",
        website: "https://greenvalleydental.com",
        foundedYear: 2010,
        yearsInBusiness: 16,
        googleRating: 4.8,
        googleReviewCount: 234,
        status: "pre-onboarding" as const,
        aiScore: 81,
      },
      {
        name: "Brooklyn Pizza Co.",
        industry: "Restaurants",
        description: "Award-winning New York style pizza since 1972",
        primaryAddress: {
          street: "555 Pizza Lane",
          city: "Brooklyn",
          state: "NY",
          country: "USA",
          zipCode: "11215",
        },
        phone: "(718) 555-0505",
        website: "https://brooklynpizzaco.com",
        foundedYear: 1972,
        yearsInBusiness: 54,
        googleRating: 4.6,
        googleReviewCount: 567,
        status: "onboarding" as const,
        aiScore: 95,
        isChain: true,
        totalLocations: 5,
      },
      {
        name: "Elite Fitness Center",
        industry: "Health & Fitness",
        description: "Premium gym with state-of-the-art equipment",
        primaryAddress: {
          street: "888 Fitness Drive",
          city: "Queens",
          state: "NY",
          country: "USA",
          zipCode: "11375",
        },
        phone: "(718) 555-0606",
        website: "https://elitefitnesscenter.com",
        foundedYear: 2008,
        yearsInBusiness: 18,
        googleRating: 4.4,
        googleReviewCount: 198,
        status: "active" as const,
        aiScore: 78,
      },
      {
        name: "Classic Barbershop",
        industry: "Personal Services",
        description: "Traditional barbershop with modern styling",
        primaryAddress: {
          street: "222 Style Street",
          city: "Bronx",
          state: "NY",
          country: "USA",
          zipCode: "10451",
        },
        phone: "(718) 555-0707",
        website: "",
        foundedYear: 1995,
        yearsInBusiness: 31,
        googleRating: 4.3,
        googleReviewCount: 87,
        status: "new" as const,
        aiScore: 65,
      },
      {
        name: "Tech Solutions NYC",
        industry: "Technology",
        description: "IT consulting and managed services provider",
        primaryAddress: {
          street: "999 Tech Tower",
          city: "Manhattan",
          state: "NY",
          country: "USA",
          zipCode: "10005",
        },
        phone: "(212) 555-0808",
        website: "https://techsolutionsnyc.com",
        foundedYear: 2012,
        yearsInBusiness: 14,
        googleRating: 4.7,
        googleReviewCount: 45,
        status: "qualified" as const,
        aiScore: 88,
      },
    ];

    // Insert companies
    const companyIds = [];
    for (const company of companies) {
      const companyId = await ctx.db.insert("companies", {
        organizationId: orgId,
        name: company.name,
        industry: company.industry,
        description: company.description,
        primaryAddress: company.primaryAddress,
        additionalLocations: [],
        isChain: company.isChain || false,
        totalLocations: company.totalLocations || 1,
        foundedYear: company.foundedYear,
        yearsInBusiness: company.yearsInBusiness,
        phone: company.phone,
        website: company.website || undefined,
        socialProfiles: {},
        googleRating: company.googleRating,
        googleReviewCount: company.googleReviewCount,
        dataSources: [
          {
            source: "google_maps",
            scrapedAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
            dataPoints: ["name", "address", "phone", "rating"],
          },
        ],
        status: company.status,
        aiScore: company.aiScore,
        aiInsights: `High-value lead with ${company.yearsInBusiness} years in business. Strong online presence with ${company.googleReviewCount} reviews.`,
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
      companyIds.push(companyId);
    }

    // Create sample contacts for some companies
    const contacts = [
      {
        companyIndex: 0,
        firstName: "Mario",
        lastName: "Rossi",
        title: "Owner",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 1,
        firstName: "Sarah",
        lastName: "Johnson",
        title: "Managing Partner",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 1,
        firstName: "Michael",
        lastName: "Chen",
        title: "Associate",
        seniority: "staff" as const,
      },
      {
        companyIndex: 3,
        firstName: "Dr. Emily",
        lastName: "Green",
        title: "Lead Dentist",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 4,
        firstName: "Tony",
        lastName: "Brooklyn",
        title: "Franchise Owner",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 7,
        firstName: "Alex",
        lastName: "Rivera",
        title: "CTO",
        seniority: "c-level" as const,
      },
    ];

    for (const contact of contacts) {
      await ctx.db.insert("contacts", {
        organizationId: orgId,
        companyId: companyIds[contact.companyIndex],
        firstName: contact.firstName,
        lastName: contact.lastName,
        fullName: `${contact.firstName} ${contact.lastName}`,
        title: contact.title,
        seniority: contact.seniority,
        emails: [
          {
            email: `${contact.firstName.toLowerCase()}@${companies[contact.companyIndex].name.toLowerCase().replace(/[^a-z]/g, "")}.com`,
            type: "primary",
            verified: true,
            verifiedAt: Date.now(),
            source: "email_finder",
          },
        ],
        phones: [],
        contactAttempts: 0,
        dataSource: "linkedin",
        confidence: 85 + Math.floor(Math.random() * 15),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    // Create a sample campaign
    await ctx.db.insert("campaigns", {
      organizationId: orgId,
      name: "Q1 Restaurant Outreach",
      description: "Targeting established restaurants in NYC area",
      type: "email",
      targetCriteria: {
        industries: ["Restaurants"],
        locations: ["New York, NY", "Brooklyn, NY"],
        minYearsInBusiness: 10,
      },
      leads: [companyIds[0], companyIds[4]],
      status: "active",
      metrics: {
        totalLeads: 2,
        contacted: 1,
        responded: 1,
        converted: 0,
        revenue: 0,
      },
      createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now(),
    });

    // Create sample scraper job
    await ctx.db.insert("scraperJobs", {
      organizationId: orgId,
      userId: userId,
      type: "google_maps",
      config: {
        query: "restaurants",
        location: "New York, NY",
        radius: 25,
        filters: {
          minYearsInBusiness: 10,
          hasWebsite: true,
        },
        maxResults: 100,
      },
      status: "completed",
      progress: {
        total: 100,
        processed: 100,
        succeeded: 87,
        failed: 13,
      },
      results: {
        companiesFound: 87,
        contactsFound: 45,
        emailsFound: 32,
      },
      startedAt: Date.now() - 2 * 60 * 60 * 1000,
      completedAt: Date.now() - 1 * 60 * 60 * 1000,
      createdAt: Date.now() - 2 * 60 * 60 * 1000,
    });

    return {
      message: "Sample data seeded successfully!",
      orgId,
      userId,
      companiesCreated: companies.length,
      contactsCreated: contacts.length,
    };
  },
});
