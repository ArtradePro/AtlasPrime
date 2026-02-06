/**
 * AI Enhancement Prompts for Atlas Prime
 *
 * - Objection Handling Scripts
 * - Personalized Proposal Generator
 * - Lead Similarity Scoring
 */

// ============================================
// OBJECTION HANDLING
// ============================================

export interface ObjectionContext {
  objection: string;
  industry: string;
  businessName: string;
  businessDetails?: string;
  previousInteractions?: string[];
  competitorMentioned?: string;
}

export const objectionHandlingPrompt = (context: ObjectionContext): string => `
You are an expert sales consultant specializing in ${context.industry} businesses.

A prospect from ${context.businessName} has raised this objection:
"${context.objection}"

${context.businessDetails ? `Business context: ${context.businessDetails}` : ""}
${context.previousInteractions?.length ? `Previous interactions: ${context.previousInteractions.join("; ")}` : ""}
${context.competitorMentioned ? `They mentioned competitor: ${context.competitorMentioned}` : ""}

Generate 3 different response strategies:

1. **Acknowledge & Redirect** - Validate their concern, then pivot to value
2. **Social Proof** - Use industry-specific examples/stats
3. **Question-Based** - Ask clarifying questions to understand deeper concerns

For each strategy, provide:
- The exact response script (2-3 sentences)
- Follow-up question to keep conversation going
- Red flags to watch for in their response

Also identify:
- Root cause: What's the real concern behind this objection?
- Buying signal: Is there hidden interest in this objection?
- Timing advice: Should this be addressed now or revisited later?

Format as JSON:
{
  "strategies": [
    {
      "type": "acknowledge_redirect" | "social_proof" | "question_based",
      "script": "...",
      "followUp": "...",
      "redFlags": ["..."]
    }
  ],
  "rootCause": "...",
  "buyingSignal": "..." | null,
  "timingAdvice": "address_now" | "revisit_later"
}
`;

// Common objections database
export const commonObjections = {
  price: [
    "It's too expensive",
    "We don't have the budget",
    "Your competitor is cheaper",
    "We need to cut costs right now",
  ],
  timing: [
    "We're not ready yet",
    "Call me back in 6 months",
    "We just signed with someone else",
    "This isn't a priority right now",
  ],
  authority: [
    "I need to talk to my partner",
    "I'm not the decision maker",
    "Our corporate office handles this",
    "Let me check with my team",
  ],
  trust: [
    "I've never heard of your company",
    "How do I know this will work?",
    "We've been burned before",
    "Send me some case studies",
  ],
  need: [
    "We're happy with our current solution",
    "We don't need this",
    "We handle this in-house",
    "Our business is different",
  ],
};

// ============================================
// PROPOSAL GENERATOR
// ============================================

export interface ProposalContext {
  businessName: string;
  industry: string;
  contactName: string;
  contactTitle: string;
  painPoints: string[];
  discussedSolutions: string[];
  proposedValue: number;
  competitiveAdvantages: string[];
  timeline?: string;
  customTerms?: string[];
}

export const proposalGeneratorPrompt = (context: ProposalContext): string => `
Generate a personalized business proposal for ${context.businessName}.

**Client Details:**
- Business: ${context.businessName} (${context.industry})
- Contact: ${context.contactName}, ${context.contactTitle}

**Identified Pain Points:**
${context.painPoints.map((p, i) => `${i + 1}. ${p}`).join("\n")}

**Discussed Solutions:**
${context.discussedSolutions.map((s, i) => `${i + 1}. ${s}`).join("\n")}

**Our Advantages:**
${context.competitiveAdvantages.map((a, i) => `- ${a}`).join("\n")}

**Proposed Investment:** $${context.proposedValue.toLocaleString()}
${context.timeline ? `**Timeline:** ${context.timeline}` : ""}
${context.customTerms?.length ? `**Special Terms:** ${context.customTerms.join(", ")}` : ""}

Create a compelling proposal with these sections:

1. **Executive Summary** (2-3 sentences personalized to their situation)
2. **Understanding Your Challenges** (reflect back their pain points)
3. **Proposed Solution** (map solutions to their specific needs)
4. **Expected Outcomes** (quantified where possible)
5. **Investment & ROI** (justify the value)
6. **Implementation Timeline** (milestone-based)
7. **Why Choose Us** (differentiated value prop)
8. **Next Steps** (clear CTA)

Format as JSON:
{
  "executiveSummary": "...",
  "challenges": [{ "challenge": "...", "impact": "..." }],
  "solutions": [{ "solution": "...", "benefit": "...", "addressesPainPoint": 1 }],
  "outcomes": [{ "metric": "...", "expectedImprovement": "...", "timeframe": "..." }],
  "investment": {
    "total": number,
    "breakdown": [{ "item": "...", "amount": number }],
    "roi": "...",
    "paybackPeriod": "..."
  },
  "timeline": [{ "milestone": "...", "duration": "...", "deliverables": ["..."] }],
  "differentiators": ["..."],
  "nextSteps": [{ "action": "...", "owner": "client" | "us", "deadline": "..." }]
}
`;

// ============================================
// LEAD SIMILARITY SCORING
// ============================================

export interface LeadProfile {
  id: string;
  businessName: string;
  industry: string;
  subIndustry?: string;
  employeeCount?: number;
  revenue?: number;
  yearsInBusiness: number;
  location: {
    city: string;
    state: string;
    region?: string;
  };
  techStack?: string[];
  painPoints?: string[];
  decisionMakerTitle?: string;
  dealSize?: number;
  salesCycle?: number;
  outcome?: "won" | "lost" | "pending";
}

export const leadSimilarityPrompt = (
  targetLead: LeadProfile,
  wonDeals: LeadProfile[],
): string => `
Analyze the similarity between a new lead and our successful closed deals.

**New Lead:**
- Business: ${targetLead.businessName}
- Industry: ${targetLead.industry}${targetLead.subIndustry ? ` / ${targetLead.subIndustry}` : ""}
- Size: ${targetLead.employeeCount || "Unknown"} employees, ${targetLead.revenue ? `$${targetLead.revenue.toLocaleString()} revenue` : "revenue unknown"}
- Age: ${targetLead.yearsInBusiness} years in business
- Location: ${targetLead.location.city}, ${targetLead.location.state}
${targetLead.techStack?.length ? `- Tech Stack: ${targetLead.techStack.join(", ")}` : ""}
${targetLead.painPoints?.length ? `- Pain Points: ${targetLead.painPoints.join(", ")}` : ""}
${targetLead.decisionMakerTitle ? `- Decision Maker: ${targetLead.decisionMakerTitle}` : ""}

**Won Deals to Compare (Top 5):**
${wonDeals
  .slice(0, 5)
  .map(
    (deal, i) => `
${i + 1}. ${deal.businessName} (${deal.industry})
   - Size: ${deal.employeeCount || "?"} employees
   - Age: ${deal.yearsInBusiness} years
   - Location: ${deal.location.city}, ${deal.location.state}
   - Deal: $${deal.dealSize?.toLocaleString() || "?"} in ${deal.salesCycle || "?"} days
   ${deal.painPoints?.length ? `- Pain Points: ${deal.painPoints.join(", ")}` : ""}
`,
  )
  .join("")}

Analyze and score similarity:

1. **Overall Similarity Score** (0-100)
2. **Dimension Scores:**
   - Industry Match (0-100)
   - Size Match (0-100)  
   - Geographic Match (0-100)
   - Pain Point Overlap (0-100)
   - Tech Stack Fit (0-100)

3. **Most Similar Won Deal** - Which deal is most similar and why?
4. **Winning Approach** - Based on similar deals, what approach worked?
5. **Predicted Deal Size** - Based on patterns
6. **Predicted Sales Cycle** - Based on patterns
7. **Risk Factors** - What's different that could be a risk?
8. **Success Probability** - Likelihood of closing (percentage)

Format as JSON:
{
  "overallScore": number,
  "dimensions": {
    "industry": number,
    "size": number,
    "geography": number,
    "painPoints": number,
    "techStack": number
  },
  "mostSimilarDeal": {
    "businessName": "...",
    "similarityScore": number,
    "keyMatchFactors": ["..."]
  },
  "winningApproach": {
    "messaging": "...",
    "keyValueProps": ["..."],
    "objectionsToPrepareFor": ["..."]
  },
  "predictions": {
    "dealSize": { "min": number, "max": number, "likely": number },
    "salesCycle": { "min": number, "max": number, "likely": number }
  },
  "riskFactors": ["..."],
  "successProbability": number
}
`;

/**
 * Calculate lead similarity score programmatically
 * (Complement to AI analysis for quick scoring)
 */
export function calculateLeadSimilarity(
  lead: LeadProfile,
  compareTo: LeadProfile,
): number {
  let score = 0;
  let weights = 0;

  // Industry match (weight: 30)
  if (lead.industry === compareTo.industry) {
    score += 30;
    if (lead.subIndustry === compareTo.subIndustry) {
      score += 10;
    }
  }
  weights += 40;

  // Size match (weight: 20)
  if (lead.employeeCount && compareTo.employeeCount) {
    const sizeRatio =
      Math.min(lead.employeeCount, compareTo.employeeCount) /
      Math.max(lead.employeeCount, compareTo.employeeCount);
    score += sizeRatio * 20;
  }
  weights += 20;

  // Age match (weight: 15)
  const ageRatio =
    Math.min(lead.yearsInBusiness, compareTo.yearsInBusiness) /
    Math.max(lead.yearsInBusiness, compareTo.yearsInBusiness);
  score += ageRatio * 15;
  weights += 15;

  // Geographic match (weight: 15)
  if (lead.location.state === compareTo.location.state) {
    score += 10;
    if (lead.location.city === compareTo.location.city) {
      score += 5;
    }
  } else if (lead.location.region === compareTo.location.region) {
    score += 5;
  }
  weights += 15;

  // Pain point overlap (weight: 10)
  if (lead.painPoints?.length && compareTo.painPoints?.length) {
    const overlap = lead.painPoints.filter((p) =>
      compareTo.painPoints!.some(
        (cp) =>
          cp.toLowerCase().includes(p.toLowerCase()) ||
          p.toLowerCase().includes(cp.toLowerCase()),
      ),
    ).length;
    score +=
      (overlap /
        Math.max(lead.painPoints.length, compareTo.painPoints.length)) *
      10;
  }
  weights += 10;

  return Math.round((score / weights) * 100);
}

/**
 * Find most similar leads from a pool
 */
export function findSimilarLeads(
  targetLead: LeadProfile,
  leadPool: LeadProfile[],
  limit: number = 5,
): Array<{ lead: LeadProfile; score: number }> {
  return leadPool
    .map((lead) => ({
      lead,
      score: calculateLeadSimilarity(targetLead, lead),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
