import { mutation } from "./_generated/server";

// Extended seed script with more sample data
export const seedExtendedData = mutation({
  args: {},
  handler: async (ctx) => {
    // Get the existing organization
    const existingOrgs = await ctx.db.query("organizations").collect();
    if (existingOrgs.length === 0) {
      return { error: "Please run seedSampleData first" };
    }

    const orgId = existingOrgs[0]._id;
    const users = await ctx.db
      .query("users")
      .withIndex("by_org", (q) => q.eq("organizationId", orgId))
      .collect();
    const userId = users[0]?._id;

    // Additional companies from various industries and locations
    const additionalCompanies = [
      // Healthcare Sector
      {
        name: "Northside Medical Group",
        industry: "Healthcare",
        description:
          "Multi-specialty medical practice serving the community for 25 years",
        city: "Atlanta",
        state: "GA",
        zipCode: "30305",
        phone: "(404) 555-1001",
        website: "https://northsidemedical.com",
        foundedYear: 2001,
        googleRating: 4.6,
        googleReviewCount: 423,
        status: "qualified" as const,
        aiScore: 89,
        isChain: true,
        totalLocations: 4,
      },
      {
        name: "Wellness Physical Therapy",
        industry: "Healthcare",
        description: "Sports medicine and rehabilitation center",
        city: "Denver",
        state: "CO",
        zipCode: "80202",
        phone: "(303) 555-1002",
        website: "https://wellnesspt.com",
        foundedYear: 2008,
        googleRating: 4.9,
        googleReviewCount: 287,
        status: "new" as const,
        aiScore: 92,
      },
      // Restaurant Sector
      {
        name: "The Golden Fork",
        industry: "Restaurants",
        description: "Upscale American cuisine with farm-to-table focus",
        city: "Portland",
        state: "OR",
        zipCode: "97201",
        phone: "(503) 555-2001",
        website: "https://thegoldenfork.com",
        foundedYear: 2005,
        googleRating: 4.7,
        googleReviewCount: 512,
        status: "contacted" as const,
        aiScore: 85,
      },
      {
        name: "Mama Rosa's Trattoria",
        industry: "Restaurants",
        description: "Authentic Italian family restaurant since 1988",
        city: "Boston",
        state: "MA",
        zipCode: "02108",
        phone: "(617) 555-2002",
        website: "https://mamarosas.com",
        foundedYear: 1988,
        googleRating: 4.5,
        googleReviewCount: 834,
        status: "pre-onboarding" as const,
        aiScore: 94,
        isChain: true,
        totalLocations: 3,
      },
      {
        name: "Sushi Zen Master",
        industry: "Restaurants",
        description: "Premium Japanese sushi and omakase experience",
        city: "Los Angeles",
        state: "CA",
        zipCode: "90012",
        phone: "(213) 555-2003",
        website: "https://sushizenmaster.com",
        foundedYear: 2010,
        googleRating: 4.8,
        googleReviewCount: 678,
        status: "qualified" as const,
        aiScore: 88,
      },
      // Legal Services
      {
        name: "Morrison & Associates Law",
        industry: "Legal Services",
        description: "Full-service law firm specializing in corporate law",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        phone: "(312) 555-3001",
        website: "https://morrisonlaw.com",
        foundedYear: 1995,
        googleRating: 4.8,
        googleReviewCount: 156,
        status: "new" as const,
        aiScore: 91,
      },
      {
        name: "Family First Legal",
        industry: "Legal Services",
        description: "Family law and estate planning specialists",
        city: "Phoenix",
        state: "AZ",
        zipCode: "85001",
        phone: "(602) 555-3002",
        website: "https://familyfirstlegal.com",
        foundedYear: 2003,
        googleRating: 4.7,
        googleReviewCount: 234,
        status: "contacted" as const,
        aiScore: 83,
      },
      // Automotive
      {
        name: "Premier Auto Care",
        industry: "Automotive",
        description: "European car specialists - BMW, Mercedes, Audi",
        city: "Dallas",
        state: "TX",
        zipCode: "75201",
        phone: "(214) 555-4001",
        website: "https://premierautocare.com",
        foundedYear: 1998,
        googleRating: 4.6,
        googleReviewCount: 445,
        status: "qualified" as const,
        aiScore: 87,
        isChain: true,
        totalLocations: 5,
      },
      {
        name: "Quick Tire & Brake",
        industry: "Automotive",
        description: "Fast, reliable tire and brake services",
        city: "Houston",
        state: "TX",
        zipCode: "77001",
        phone: "(713) 555-4002",
        website: "https://quicktirebrake.com",
        foundedYear: 1992,
        googleRating: 4.4,
        googleReviewCount: 567,
        status: "active" as const,
        aiScore: 79,
        isChain: true,
        totalLocations: 12,
      },
      // Real Estate
      {
        name: "Skyline Properties",
        industry: "Real Estate",
        description: "Luxury residential and commercial real estate",
        city: "Miami",
        state: "FL",
        zipCode: "33101",
        phone: "(305) 555-5001",
        website: "https://skylineproperties.com",
        foundedYear: 2000,
        googleRating: 4.5,
        googleReviewCount: 189,
        status: "new" as const,
        aiScore: 90,
      },
      {
        name: "HomeFirst Realty",
        industry: "Real Estate",
        description: "First-time homebuyer specialists",
        city: "Seattle",
        state: "WA",
        zipCode: "98101",
        phone: "(206) 555-5002",
        website: "https://homefirstrealty.com",
        foundedYear: 2006,
        googleRating: 4.7,
        googleReviewCount: 312,
        status: "contacted" as const,
        aiScore: 84,
      },
      // Construction
      {
        name: "BuildRight Construction",
        industry: "Construction",
        description: "Commercial and residential general contractor",
        city: "San Diego",
        state: "CA",
        zipCode: "92101",
        phone: "(619) 555-6001",
        website: "https://buildrightconstruction.com",
        foundedYear: 1985,
        googleRating: 4.6,
        googleReviewCount: 267,
        status: "qualified" as const,
        aiScore: 93,
      },
      {
        name: "Green Home Builders",
        industry: "Construction",
        description: "Sustainable and eco-friendly home construction",
        city: "Austin",
        state: "TX",
        zipCode: "78701",
        phone: "(512) 555-6002",
        website: "https://greenhomebuilders.com",
        foundedYear: 2009,
        googleRating: 4.8,
        googleReviewCount: 198,
        status: "pre-onboarding" as const,
        aiScore: 86,
      },
      // Retail
      {
        name: "The Book Corner",
        industry: "Retail",
        description: "Independent bookstore with rare and collectible books",
        city: "San Francisco",
        state: "CA",
        zipCode: "94102",
        phone: "(415) 555-7001",
        website: "https://thebookcorner.com",
        foundedYear: 1978,
        googleRating: 4.9,
        googleReviewCount: 456,
        status: "new" as const,
        aiScore: 88,
      },
      {
        name: "Outdoor Adventure Gear",
        industry: "Retail",
        description: "Hiking, camping, and outdoor sports equipment",
        city: "Denver",
        state: "CO",
        zipCode: "80203",
        phone: "(303) 555-7002",
        website: "https://outdooradventuregear.com",
        foundedYear: 1995,
        googleRating: 4.7,
        googleReviewCount: 623,
        status: "onboarding" as const,
        aiScore: 85,
        isChain: true,
        totalLocations: 7,
      },
      // Professional Services
      {
        name: "TaxPro Accounting",
        industry: "Professional Services",
        description: "Small business accounting and tax preparation",
        city: "Charlotte",
        state: "NC",
        zipCode: "28201",
        phone: "(704) 555-8001",
        website: "https://taxproaccounting.com",
        foundedYear: 2001,
        googleRating: 4.6,
        googleReviewCount: 234,
        status: "qualified" as const,
        aiScore: 82,
      },
      {
        name: "Creative Marketing Solutions",
        industry: "Professional Services",
        description: "Full-service marketing and advertising agency",
        city: "Nashville",
        state: "TN",
        zipCode: "37201",
        phone: "(615) 555-8002",
        website: "https://creativemarketingsolutions.com",
        foundedYear: 2007,
        googleRating: 4.8,
        googleReviewCount: 178,
        status: "active" as const,
        aiScore: 91,
      },
      // Fitness & Wellness
      {
        name: "Iron Temple Gym",
        industry: "Health & Fitness",
        description: "Hardcore powerlifting and bodybuilding gym",
        city: "Las Vegas",
        state: "NV",
        zipCode: "89101",
        phone: "(702) 555-9001",
        website: "https://irontemplegym.com",
        foundedYear: 2003,
        googleRating: 4.5,
        googleReviewCount: 345,
        status: "new" as const,
        aiScore: 78,
      },
      {
        name: "Serenity Yoga Studio",
        industry: "Health & Fitness",
        description: "Hot yoga, meditation, and wellness classes",
        city: "San Jose",
        state: "CA",
        zipCode: "95101",
        phone: "(408) 555-9002",
        website: "https://serenityyogastudio.com",
        foundedYear: 2011,
        googleRating: 4.9,
        googleReviewCount: 289,
        status: "contacted" as const,
        aiScore: 87,
        isChain: true,
        totalLocations: 3,
      },
    ];

    // Insert additional companies
    const companyIds = [];
    for (const company of additionalCompanies) {
      const companyId = await ctx.db.insert("companies", {
        organizationId: orgId,
        name: company.name,
        industry: company.industry,
        description: company.description,
        primaryAddress: {
          street: `${Math.floor(Math.random() * 9999)} Main Street`,
          city: company.city,
          state: company.state,
          country: "USA",
          zipCode: company.zipCode,
        },
        additionalLocations: [],
        isChain: company.isChain || false,
        totalLocations: company.totalLocations || 1,
        foundedYear: company.foundedYear,
        yearsInBusiness: 2026 - company.foundedYear,
        phone: company.phone,
        website: company.website,
        socialProfiles: {},
        googleRating: company.googleRating,
        googleReviewCount: company.googleReviewCount,
        dataSources: [
          {
            source: "google_maps",
            scrapedAt: Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
            dataPoints: ["name", "address", "phone", "rating", "website"],
          },
        ],
        status: company.status,
        aiScore: company.aiScore,
        aiInsights: `${company.isChain ? `Multi-location chain with ${company.totalLocations} locations. ` : ""}Established ${2026 - company.foundedYear} years ago with ${company.googleReviewCount} reviews at ${company.googleRating} rating.`,
        createdAt: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
      companyIds.push(companyId);
    }

    // Additional contacts for new companies
    const additionalContacts = [
      {
        companyIndex: 0,
        firstName: "Dr. Robert",
        lastName: "Chen",
        title: "Medical Director",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 0,
        firstName: "Lisa",
        lastName: "Martinez",
        title: "Practice Manager",
        seniority: "manager" as const,
      },
      {
        companyIndex: 3,
        firstName: "Rosa",
        lastName: "DiNapoli",
        title: "Owner",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 5,
        firstName: "James",
        lastName: "Morrison",
        title: "Managing Partner",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 5,
        firstName: "Patricia",
        lastName: "Williams",
        title: "Senior Associate",
        seniority: "director" as const,
      },
      {
        companyIndex: 7,
        firstName: "David",
        lastName: "Kim",
        title: "General Manager",
        seniority: "manager" as const,
      },
      {
        companyIndex: 9,
        firstName: "Alexandra",
        lastName: "Stone",
        title: "Broker",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 11,
        firstName: "Michael",
        lastName: "Turner",
        title: "CEO",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 11,
        firstName: "Jennifer",
        lastName: "Lopez",
        title: "Project Manager",
        seniority: "manager" as const,
      },
      {
        companyIndex: 15,
        firstName: "Steven",
        lastName: "Park",
        title: "Founder & CEO",
        seniority: "c-level" as const,
      },
      {
        companyIndex: 16,
        firstName: "Amanda",
        lastName: "Davis",
        title: "Creative Director",
        seniority: "director" as const,
      },
      {
        companyIndex: 18,
        firstName: "Priya",
        lastName: "Sharma",
        title: "Studio Owner",
        seniority: "c-level" as const,
      },
    ];

    for (const contact of additionalContacts) {
      const companyName = additionalCompanies[contact.companyIndex].name;
      const emailDomain = companyName
        .toLowerCase()
        .replace(/[^a-z]/g, "")
        .slice(0, 15);

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
            email: `${contact.firstName.toLowerCase().replace(/[^a-z]/g, "")}@${emailDomain}.com`,
            type: "primary",
            verified: Math.random() > 0.3,
            verifiedAt: Math.random() > 0.3 ? Date.now() : undefined,
            source: "email_finder",
          },
        ],
        phones:
          Math.random() > 0.5
            ? [
                {
                  phone: `(${Math.floor(Math.random() * 900) + 100}) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
                  type: "work",
                  source: "website",
                },
              ]
            : [],
        linkedinUrl:
          Math.random() > 0.4
            ? `https://linkedin.com/in/${contact.firstName.toLowerCase()}${contact.lastName.toLowerCase()}`
            : undefined,
        contactAttempts: Math.floor(Math.random() * 5),
        dataSource: Math.random() > 0.5 ? "linkedin" : "email_finder",
        confidence: 75 + Math.floor(Math.random() * 25),
        createdAt: Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
    }

    // Additional campaigns
    const campaigns = [
      {
        name: "Healthcare Q1 Outreach",
        description: "Targeting medical practices and healthcare providers",
        type: "multi-channel" as const,
        industries: ["Healthcare"],
        locations: ["Atlanta, GA", "Denver, CO"],
        status: "active" as const,
      },
      {
        name: "Multi-Location Chains",
        description: "Focus on businesses with 3+ locations",
        type: "email" as const,
        industries: ["Restaurants", "Automotive", "Health & Fitness"],
        locations: [],
        status: "active" as const,
      },
      {
        name: "Legal Services Campaign",
        description: "Law firm digital marketing outreach",
        type: "linkedin" as const,
        industries: ["Legal Services"],
        locations: ["Chicago, IL", "Phoenix, AZ"],
        status: "draft" as const,
      },
      {
        name: "Construction & Real Estate",
        description: "B2B outreach for construction and real estate",
        type: "multi-channel" as const,
        industries: ["Construction", "Real Estate"],
        locations: ["San Diego, CA", "Austin, TX", "Miami, FL"],
        status: "paused" as const,
      },
    ];

    for (const campaign of campaigns) {
      await ctx.db.insert("campaigns", {
        organizationId: orgId,
        name: campaign.name,
        description: campaign.description,
        type: campaign.type,
        targetCriteria: {
          industries: campaign.industries,
          locations: campaign.locations,
          minYearsInBusiness: 10,
        },
        leads: companyIds.slice(0, Math.floor(Math.random() * 5) + 2),
        status: campaign.status,
        metrics: {
          totalLeads: Math.floor(Math.random() * 50) + 10,
          contacted: Math.floor(Math.random() * 30) + 5,
          responded: Math.floor(Math.random() * 15) + 2,
          converted: Math.floor(Math.random() * 5),
          revenue: Math.floor(Math.random() * 50000),
        },
        createdAt: Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now(),
      });
    }

    // Additional scraper jobs
    const scraperJobs = [
      {
        type: "google_maps" as const,
        query: "healthcare clinics",
        location: "Atlanta, GA",
        status: "completed" as const,
        total: 150,
        processed: 150,
        succeeded: 132,
        failed: 18,
      },
      {
        type: "google_maps" as const,
        query: "law firms",
        location: "Chicago, IL",
        status: "completed" as const,
        total: 80,
        processed: 80,
        succeeded: 74,
        failed: 6,
      },
      {
        type: "google_maps" as const,
        query: "auto repair shops",
        location: "Dallas, TX",
        status: "running" as const,
        total: 200,
        processed: 145,
        succeeded: 128,
        failed: 17,
      },
      {
        type: "email_finder" as const,
        query: "construction companies",
        location: "San Diego, CA",
        status: "pending" as const,
        total: 100,
        processed: 0,
        succeeded: 0,
        failed: 0,
      },
    ];

    for (const job of scraperJobs) {
      await ctx.db.insert("scraperJobs", {
        organizationId: orgId,
        userId: userId!,
        type: job.type,
        config: {
          query: job.query,
          location: job.location,
          radius: 25,
          filters: { minYearsInBusiness: 10, hasWebsite: true },
          maxResults: job.total,
        },
        status: job.status,
        progress: {
          total: job.total,
          processed: job.processed,
          succeeded: job.succeeded,
          failed: job.failed,
        },
        results:
          job.status === "completed"
            ? {
                companiesFound: job.succeeded,
                contactsFound: Math.floor(job.succeeded * 0.6),
                emailsFound: Math.floor(job.succeeded * 0.4),
              }
            : undefined,
        startedAt:
          job.status !== "pending" ? Date.now() - 60 * 60 * 1000 : undefined,
        completedAt:
          job.status === "completed" ? Date.now() - 30 * 60 * 1000 : undefined,
        createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000,
      });
    }

    return {
      message: "Extended sample data seeded successfully!",
      companiesAdded: additionalCompanies.length,
      contactsAdded: additionalContacts.length,
      campaignsAdded: campaigns.length,
      scraperJobsAdded: scraperJobs.length,
    };
  },
});
