export interface PromptTemplate {
  system: string;
  userTemplate: string;
  outputSchema?: Record<string, any>;
}

export const leadScoringPrompt: PromptTemplate = {
  system: `You are an expert B2B lead scoring analyst with deep knowledge of business valuation and sales qualification. Your task is to analyze company data and provide a comprehensive lead quality assessment.

Consider these factors:
1. Company maturity (years in business, established presence)
2. Market position (industry, revenue potential)
3. Digital presence (website quality, online reviews)
4. Contact information quality
5. Growth indicators

Provide actionable insights and next steps for the sales team.`,

  userTemplate: `Analyze this company as a potential B2B lead:

Company Name: {{name}}
Industry: {{industry}}
Years in Business: {{yearsInBusiness}}
Employee Count: {{employeeCount}}
Annual Revenue: {{annualRevenue}}
Location: {{city}}, {{state}}
Website: {{website}}
Contact Email: {{email}}
Phone: {{phone}}

Additional context:
{{additionalContext}}

Provide a detailed lead scoring analysis.`,

  outputSchema: {
    type: "object",
    properties: {
      score: { type: "number", minimum: 0, maximum: 100 },
      priority: { type: "string", enum: ["high", "medium", "low"] },
      factors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            name: { type: "string" },
            impact: { type: "string", enum: ["positive", "negative", "neutral"] },
            description: { type: "string" },
          },
        },
      },
      recommendations: { type: "array", items: { type: "string" } },
      idealContactApproach: { type: "string" },
    },
  },
};

export const marketAnalysisPrompt: PromptTemplate = {
  system: `You are a market research analyst specializing in B2B markets. Analyze the provided market data to identify trends, opportunities, and competitive dynamics.

Focus on:
1. Market size and growth potential
2. Key players and competitive landscape
3. Industry trends and disruptions
4. Entry barriers and opportunities
5. Customer segments and needs`,

  userTemplate: `Perform a market analysis for the following segment:

Industry: {{industry}}
Geographic Focus: {{location}}
Target Company Size: {{companySize}}
Key Players:
{{competitors}}

Market Indicators:
{{marketData}}

Provide comprehensive market insights and strategic recommendations.`,
};

export const campaignOptimizationPrompt: PromptTemplate = {
  system: `You are a marketing optimization specialist with expertise in B2B lead generation campaigns. Analyze campaign performance data and provide actionable recommendations for improvement.

Consider:
1. Lead quality vs quantity tradeoffs
2. Channel effectiveness
3. Targeting optimization
4. Message resonance
5. Cost efficiency`,

  userTemplate: `Analyze and optimize this lead generation campaign:

Campaign Name: {{campaignName}}
Campaign Type: {{campaignType}}
Duration: {{startDate}} to {{endDate}}

Performance Metrics:
- Leads Generated: {{leadsGenerated}}
- Qualified Leads: {{qualifiedLeads}}
- Conversion Rate: {{conversionRate}}
- Cost per Lead: {{costPerLead}}
- Total Spend: {{totalSpend}}

Targeting:
- Industries: {{targetIndustries}}
- Locations: {{targetLocations}}
- Keywords: {{targetKeywords}}

Provide detailed optimization recommendations.`,
};

export const competitorAnalysisPrompt: PromptTemplate = {
  system: `You are a competitive intelligence analyst. Analyze competitor data to provide strategic insights about market positioning, strengths, weaknesses, and opportunities.

Focus on:
1. Product/service differentiation
2. Pricing strategies
3. Market share and positioning
4. Marketing and messaging
5. Customer perception`,

  userTemplate: `Analyze these competitors in the {{industry}} industry:

{{competitorList}}

Our Company Profile:
{{ourProfile}}

Key Questions:
1. What are each competitor's key strengths and weaknesses?
2. How are they positioned in the market?
3. What opportunities exist for differentiation?
4. What threats do they pose?

Provide a comprehensive competitive analysis.`,
};

export const growthRecommendationsPrompt: PromptTemplate = {
  system: `You are a growth strategist specializing in B2B companies. Analyze business performance data and market conditions to provide actionable growth recommendations.

Consider:
1. Market expansion opportunities
2. Product/service optimization
3. Customer acquisition strategies
4. Retention and upselling
5. Operational efficiency`,

  userTemplate: `Provide growth recommendations based on this business data:

Current Performance:
- Monthly Revenue: {{monthlyRevenue}}
- Customer Count: {{customerCount}}
- Average Deal Size: {{avgDealSize}}
- Customer Acquisition Cost: {{cac}}
- Customer Lifetime Value: {{ltv}}
- Churn Rate: {{churnRate}}

Pipeline:
- Leads in Pipeline: {{pipelineLeads}}
- Conversion Rate: {{conversionRate}}
- Average Sales Cycle: {{salesCycle}}

Market Context:
{{marketContext}}

Provide strategic growth recommendations with prioritized action items.`,
};

/**
 * Fill a template with provided data
 */
export function fillTemplate(template: string, data: Record<string, any>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    const value = data[key];
    if (value === undefined || value === null) return "";
    if (typeof value === "object") return JSON.stringify(value, null, 2);
    return String(value);
  });
}

/**
 * Get a prompt template by type
 */
export function getPromptTemplate(type: string): PromptTemplate | null {
  const templates: Record<string, PromptTemplate> = {
    lead_scoring: leadScoringPrompt,
    market_analysis: marketAnalysisPrompt,
    campaign_optimization: campaignOptimizationPrompt,
    competitor_analysis: competitorAnalysisPrompt,
    growth_recommendations: growthRecommendationsPrompt,
  };

  return templates[type] || null;
}
