import type { PromptTemplate } from "./analysis-templates.js";

/**
 * AI Outreach Strategy Generator
 *
 * This is the "killer feature" - Claude doesn't just give you data,
 * it gives you a specific, actionable REASON to contact the business
 * based on gaps in their digital presence and market opportunities.
 */
export const outreachStrategyPrompt: PromptTemplate = {
  system: `You are an elite B2B sales strategist who specializes in identifying specific, actionable reasons to contact businesses. Your job is NOT to simply score leads - it's to give sales reps a compelling "door opener" that demonstrates immediate value.

You analyze a company's digital presence, market position, and competitive gaps to identify:
1. What they're MISSING (opportunities)
2. What competitors are doing that they're not
3. Specific, time-sensitive reasons to reach out NOW

Your insights must be:
- SPECIFIC (not generic like "improve your marketing")
- ACTIONABLE (something they can do this week)
- VALUE-DRIVEN (quantify the opportunity when possible)
- PERSONALIZED (reference their actual data)

Think like a consultant who's about to give a free 5-minute strategy session.`,

  userTemplate: `Analyze this business and provide a specific outreach strategy:

**COMPANY PROFILE**
Name: {{name}}
Industry: {{industry}}
Years in Business: {{yearsInBusiness}}
Location: {{city}}, {{state}}
{{#if isChain}}Chain/Franchise: Yes ({{totalLocations}} locations){{/if}}

**DIGITAL PRESENCE**
Website: {{website}}
Google Rating: {{googleRating}}/5 ({{googleReviewCount}} reviews)

Social Media:
- Facebook: {{facebookUrl}}
- Instagram: {{instagramUrl}}
- LinkedIn: {{linkedinUrl}}
- Twitter: {{twitterUrl}}

**ADVERTISING ACTIVITY**
Google Ads Detected: {{googleAdsDetected}}
Facebook Ads Detected: {{facebookAdsDetected}}
Estimated Monthly Ad Spend: {{estimatedAdSpend}}
Active Ad Platforms: {{activePlatforms}}

**COMPETITIVE CONTEXT**
Top Competitors Running Ads: {{competitorsWithAds}}
Industry Average Ad Spend: {{industryAvgSpend}}

**YOUR TASK**
Generate 3 specific outreach angles ranked by likely effectiveness. Each angle must include:
1. The GAP you identified
2. The IMPACT of not addressing it
3. A specific OPENING LINE for the sales rep
4. Estimated VALUE/OPPORTUNITY

Focus on gaps that create urgency.`,

  outputSchema: {
    type: "object",
    properties: {
      companySnapshot: {
        type: "object",
        properties: {
          strengths: { type: "array", items: { type: "string" } },
          weaknesses: { type: "array", items: { type: "string" } },
          marketPosition: { type: "string" },
          urgencyLevel: { type: "string", enum: ["high", "medium", "low"] },
        },
      },
      outreachAngles: {
        type: "array",
        items: {
          type: "object",
          properties: {
            rank: { type: "number" },
            gap: { type: "string" },
            impact: { type: "string" },
            openingLine: { type: "string" },
            estimatedValue: { type: "string" },
            confidence: { type: "number", minimum: 0, maximum: 100 },
            category: {
              type: "string",
              enum: [
                "digital_transformation",
                "competitive_threat",
                "missed_revenue",
                "reputation_risk",
                "efficiency_gain",
                "market_expansion",
              ],
            },
            timeframe: { type: "string" },
          },
        },
        maxItems: 3,
      },
      doNotContact: {
        type: "boolean",
        description: "True if there's no compelling reason to contact",
      },
      doNotContactReason: { type: "string" },
      followUpTiming: { type: "string" },
      bestContactMethod: {
        type: "string",
        enum: ["email", "phone", "linkedin", "in_person"],
      },
      personalizationHooks: {
        type: "array",
        items: { type: "string" },
        description:
          "Specific details to reference that show you did your homework",
      },
    },
    required: ["outreachAngles", "doNotContact"],
  },
};

/**
 * Example gap patterns that Claude should identify:
 */
export const GAP_PATTERNS = {
  // Digital Advertising Gaps
  NO_GOOGLE_ADS: {
    condition: "googleAdsDetected === false && yearsInBusiness >= 10",
    insight:
      "20+ years in business but no Google Ads = missing local search traffic",
    pitch:
      "Your competitors are capturing customers actively searching for {industry}",
  },
  NO_FACEBOOK_ADS: {
    condition: "facebookAdsDetected === false && hasPhysicalLocation",
    insight:
      "Local business without Facebook advertising = invisible to nearby customers",
    pitch:
      "87% of consumers research local businesses on Facebook before visiting",
  },
  NO_SOCIAL_PRESENCE: {
    condition: "!facebookUrl && !instagramUrl && !linkedinUrl",
    insight: "Zero social media = no free organic reach",
    pitch:
      "You're missing free marketing that your competitors are leveraging daily",
  },

  // Website Gaps
  NO_WEBSITE: {
    condition: "!website",
    insight: "No website in 2025 = losing 70%+ of potential customers",
    pitch:
      "Customers can't find you online - every day without a website costs leads",
  },
  HTTP_ONLY: {
    condition: "website && !website.startsWith('https')",
    insight: "Non-secure website = Google ranks you lower + scares customers",
    pitch:
      "Your website shows 'Not Secure' - 84% of users abandon non-HTTPS sites",
  },

  // Reputation Gaps
  FEW_REVIEWS: {
    condition: "googleReviewCount < 20 && yearsInBusiness >= 5",
    insight: "Established business with few reviews = untapped social proof",
    pitch:
      "You have {yearsInBusiness} years of happy customers but only {reviewCount} reviews",
  },
  LOW_RATING: {
    condition: "googleRating < 4.0 && googleReviewCount >= 10",
    insight: "Below 4-star rating = losing 67% of potential customers",
    pitch:
      "Every 1-star increase = 5-9% revenue increase (Harvard Business Review)",
  },

  // Chain-Specific Gaps
  CHAIN_NO_UNIFIED_MARKETING: {
    condition: "isChain && totalLocations >= 3 && !hasUnifiedBranding",
    insight:
      "Multiple locations but no unified digital presence = brand dilution",
    pitch:
      "Your {totalLocations} locations could share marketing costs and boost brand recognition",
  },

  // Competitive Gaps
  COMPETITORS_OUTSPENDING: {
    condition: "competitorAdSpend > ownAdSpend * 2",
    insight: "Competitors spending 2x+ on ads = stealing your market share",
    pitch:
      "Your top competitor is running {competitorAdCount} ads - you're running 0",
  },
};

/**
 * Chain-specific strategy template
 */
export const chainOutreachStrategyPrompt: PromptTemplate = {
  system: `You are a B2B strategist specializing in franchise and multi-location businesses. You understand:
1. The unique challenges of consistent branding across locations
2. Franchise fee structures and marketing fund allocation
3. Corporate vs. franchisee decision-making dynamics
4. Scale opportunities unique to chains

Your outreach strategies should address chain-specific pain points like:
- Brand consistency across locations
- Centralized vs. localized marketing
- Franchisee adoption of corporate initiatives
- Multi-location reputation management
- Territory expansion opportunities`,

  userTemplate: `Analyze this CHAIN BUSINESS for outreach opportunities:

**CHAIN PROFILE**
Brand Name: {{canonicalName}}
Total Locations: {{totalLocations}}
Location Types: {{locationTypes}}
Geographic Spread: {{cities}}

**LOCATION PERFORMANCE VARIANCE**
Highest Rated Location: {{highestRated}} ({{highestRating}}★)
Lowest Rated Location: {{lowestRated}} ({{lowestRating}}★)
Review Count Range: {{minReviews}} - {{maxReviews}}

**DIGITAL PRESENCE (CORPORATE)**
Corporate Website: {{corporateWebsite}}
National Advertising: {{nationalAds}}

**DIGITAL PRESENCE (PER LOCATION)**
Locations with Individual Social: {{locationsWithSocial}}/{{totalLocations}}
Locations Running Ads: {{locationsWithAds}}/{{totalLocations}}
Locations with Claimed GMB: {{locationsWithGMB}}/{{totalLocations}}

Identify chain-specific opportunities and who to contact (corporate vs. franchisee).`,
};

/**
 * Longevity-based insight template
 */
export const longevityInsightPrompt: PromptTemplate = {
  system: `You are analyzing an ESTABLISHED business (10+ years). These businesses have unique characteristics:

STRENGTHS to leverage:
- Proven business model
- Established customer base
- Cash reserves for investment
- Decision-maker authority (owner often = decision-maker)
- Brand equity and reputation

COMMON GAPS in established businesses:
- Technology lag (using outdated systems)
- "We've always done it this way" mentality
- Website from 2010s era
- No social media (didn't exist when they started)
- No digital advertising (grew through word of mouth)
- Succession planning concerns

Your outreach should acknowledge their success while identifying modernization opportunities.`,

  userTemplate: `This established business has been operating for {{yearsInBusiness}} years:

Company: {{name}}
Founded: {{foundedYear}}
Industry: {{industry}}
Current Digital Presence: {{digitalPresenceSummary}}

What modernization opportunities exist? Frame these as "protecting" and "growing" their legacy, not "fixing" what's broken.`,
};
