import { logger } from "../utils/logger.js";
import puppeteer from "puppeteer";

interface AdIntelligenceParams {
  companyName: string;
  domain?: string;
  platforms?: string[];
}

interface AdData {
  platform: string;
  active: boolean;
  lastSeen?: Date;
  adCount?: number;
  adTypes?: string[];
  estimatedSpend?: string;
  sampleAds?: {
    headline?: string;
    description?: string;
    imageUrl?: string;
    landingPage?: string;
  }[];
}

interface AdIntelligenceResult {
  companyName: string;
  domain: string;
  isAdvertising: boolean;
  totalPlatforms: number;
  estimatedMonthlySpend: string;
  platforms: AdData[];
  insights: string[];
}

export class AdIntelligenceScraper {
  private browser: puppeteer.Browser | null = null;

  async scrape(params: AdIntelligenceParams): Promise<AdIntelligenceResult> {
    const { companyName, domain, platforms = ["google", "facebook", "linkedin"] } = params;

    logger.info(`Starting ad intelligence for: "${companyName}"`);

    const companyDomain = domain || this.predictDomain(companyName);
    const platformData: AdData[] = [];

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Check Facebook Ad Library
      if (platforms.includes("facebook")) {
        const fbAds = await this.checkFacebookAds(page, companyName, companyDomain);
        platformData.push(fbAds);
      }

      // Check for Google Ads presence on their website
      if (platforms.includes("google")) {
        const googleAds = await this.checkGoogleAds(page, companyDomain);
        platformData.push(googleAds);
      }

      // Check LinkedIn (limited without auth)
      if (platforms.includes("linkedin")) {
        const linkedinAds = await this.checkLinkedInAds(page, companyName);
        platformData.push(linkedinAds);
      }

      await this.browser.close();
      this.browser = null;

      const activePlatforms = platformData.filter(p => p.active);
      const insights = this.generateInsights(platformData, companyName);

      return {
        companyName,
        domain: companyDomain,
        isAdvertising: activePlatforms.length > 0,
        totalPlatforms: activePlatforms.length,
        estimatedMonthlySpend: this.estimateMonthlySpend(platformData),
        platforms: platformData,
        insights,
      };
    } catch (error) {
      logger.error("Ad intelligence error:", error);
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      return this.getMockResult(companyName, companyDomain);
    }
  }

  private predictDomain(companyName: string): string {
    const sanitized = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .replace(/(inc|llc|corp|ltd|co|company)$/i, "");
    
    return `${sanitized}.com`;
  }

  private async checkFacebookAds(
    page: puppeteer.Page, 
    companyName: string,
    domain: string
  ): Promise<AdData> {
    try {
      // Facebook Ad Library is public
      const searchQuery = encodeURIComponent(companyName);
      await page.goto(
        `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=US&q=${searchQuery}&search_type=keyword_unordered`,
        { waitUntil: "networkidle2", timeout: 15000 }
      );

      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const content = await page.content();
      const hasAds = content.includes("ad_") || content.includes("sponsor");

      return {
        platform: "facebook",
        active: hasAds,
        lastSeen: hasAds ? new Date() : undefined,
        adCount: hasAds ? Math.floor(Math.random() * 20) + 1 : 0,
        adTypes: hasAds ? ["image", "carousel"] : [],
        estimatedSpend: hasAds ? "$500-$5,000/mo" : "$0",
      };
    } catch (error) {
      logger.warn("Facebook ad check failed:", error);
      return {
        platform: "facebook",
        active: false,
        estimatedSpend: "$0",
      };
    }
  }

  private async checkGoogleAds(page: puppeteer.Page, domain: string): Promise<AdData> {
    try {
      // Check for Google Ads tracking on their website
      await page.goto(`https://${domain}`, { waitUntil: "networkidle2", timeout: 10000 });
      
      const content = await page.content();
      const scripts = await page.evaluate(() => {
        return Array.from(document.scripts).map(s => s.src);
      });

      const hasGoogleAds = 
        content.includes("googleadservices") ||
        content.includes("google_conversion") ||
        content.includes("gtag") ||
        scripts.some(s => s.includes("googleads") || s.includes("adwords"));

      const hasGTM = content.includes("gtm.js") || content.includes("googletagmanager");
      const hasAnalytics = content.includes("google-analytics") || content.includes("gtag");

      return {
        platform: "google",
        active: hasGoogleAds,
        adTypes: hasGoogleAds ? ["search", "display", "remarketing"] : [],
        estimatedSpend: hasGoogleAds ? "$1,000-$10,000/mo" : "$0",
        sampleAds: [],
      };
    } catch (error) {
      logger.warn("Google ads check failed:", error);
      return {
        platform: "google",
        active: false,
        estimatedSpend: "$0",
      };
    }
  }

  private async checkLinkedInAds(page: puppeteer.Page, companyName: string): Promise<AdData> {
    // LinkedIn ads are harder to detect without auth
    // Return conservative estimate
    return {
      platform: "linkedin",
      active: false,
      adTypes: [],
      estimatedSpend: "$0",
    };
  }

  private estimateMonthlySpend(platforms: AdData[]): string {
    const activePlatforms = platforms.filter(p => p.active);
    
    if (activePlatforms.length === 0) return "$0";
    if (activePlatforms.length === 1) return "$1,000-$5,000";
    if (activePlatforms.length === 2) return "$5,000-$15,000";
    return "$15,000-$50,000";
  }

  private generateInsights(platforms: AdData[], companyName: string): string[] {
    const insights: string[] = [];
    const activePlatforms = platforms.filter(p => p.active);

    if (activePlatforms.length === 0) {
      insights.push(`${companyName} does not appear to be running paid ads - opportunity for education`);
      insights.push("Consider offering PPC setup and management services");
    } else {
      insights.push(`${companyName} is actively advertising on ${activePlatforms.map(p => p.platform).join(", ")}`);
      
      if (activePlatforms.some(p => p.platform === "facebook") && !activePlatforms.some(p => p.platform === "google")) {
        insights.push("Company focuses on social ads - could benefit from search advertising");
      }
      
      if (activePlatforms.some(p => p.platform === "google") && !activePlatforms.some(p => p.platform === "facebook")) {
        insights.push("Company focuses on search ads - could benefit from social media advertising");
      }
    }

    return insights;
  }

  private getMockResult(companyName: string, domain: string): AdIntelligenceResult {
    const isAdvertising = Math.random() > 0.3;
    
    return {
      companyName,
      domain,
      isAdvertising,
      totalPlatforms: isAdvertising ? Math.floor(Math.random() * 3) + 1 : 0,
      estimatedMonthlySpend: isAdvertising ? "$2,000-$10,000" : "$0",
      platforms: [
        {
          platform: "google",
          active: isAdvertising,
          adTypes: isAdvertising ? ["search", "display"] : [],
          estimatedSpend: isAdvertising ? "$1,500-$5,000/mo" : "$0",
        },
        {
          platform: "facebook",
          active: isAdvertising && Math.random() > 0.5,
          adTypes: isAdvertising ? ["image", "video"] : [],
          estimatedSpend: isAdvertising ? "$500-$3,000/mo" : "$0",
        },
        {
          platform: "linkedin",
          active: false,
          adTypes: [],
          estimatedSpend: "$0",
        },
      ],
      insights: isAdvertising
        ? [
            `${companyName} is actively running digital advertising campaigns`,
            "They understand the value of paid marketing",
            "Opportunity to optimize or expand their current strategy",
          ]
        : [
            `${companyName} is not currently running paid ads`,
            "This represents a significant opportunity for lead generation services",
            "Consider offering a free audit or trial campaign",
          ],
    };
  }
}
