import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "../utils/logger.js";

interface TechStackResult {
  technologies: Technology[];
  categories: TechCategories;
  insights: string[];
  websiteAge?: string;
  lastUpdated?: string;
}

interface Technology {
  name: string;
  category: string;
  version?: string;
  confidence: number;
}

interface TechCategories {
  cms?: string[];
  ecommerce?: string[];
  analytics?: string[];
  crm?: string[];
  marketing?: string[];
  payments?: string[];
  hosting?: string[];
  framework?: string[];
}

// Technology detection patterns
const TECH_PATTERNS: Record<
  string,
  { pattern: RegExp | string; category: string; name: string }[]
> = {
  cms: [
    {
      pattern: /wp-content|wp-includes|wordpress/i,
      category: "cms",
      name: "WordPress",
    },
    { pattern: /sites\/all\/themes|drupal/i, category: "cms", name: "Drupal" },
    { pattern: /\/joomla/i, category: "cms", name: "Joomla" },
    { pattern: /squarespace/i, category: "cms", name: "Squarespace" },
    { pattern: /wix\.com|wixstatic/i, category: "cms", name: "Wix" },
    { pattern: /weebly/i, category: "cms", name: "Weebly" },
    { pattern: /ghost/i, category: "cms", name: "Ghost" },
    { pattern: /webflow/i, category: "cms", name: "Webflow" },
    { pattern: /shopify/i, category: "cms", name: "Shopify" },
    {
      pattern: /godaddy.*website/i,
      category: "cms",
      name: "GoDaddy Website Builder",
    },
  ],
  ecommerce: [
    { pattern: /shopify/i, category: "ecommerce", name: "Shopify" },
    { pattern: /woocommerce/i, category: "ecommerce", name: "WooCommerce" },
    { pattern: /magento/i, category: "ecommerce", name: "Magento" },
    { pattern: /bigcommerce/i, category: "ecommerce", name: "BigCommerce" },
    { pattern: /prestashop/i, category: "ecommerce", name: "PrestaShop" },
    { pattern: /opencart/i, category: "ecommerce", name: "OpenCart" },
    {
      pattern: /squarespace.*commerce/i,
      category: "ecommerce",
      name: "Squarespace Commerce",
    },
  ],
  analytics: [
    {
      pattern: /google-analytics|gtag|ga\.js|analytics\.js/i,
      category: "analytics",
      name: "Google Analytics",
    },
    {
      pattern: /gtm\.js|googletagmanager/i,
      category: "analytics",
      name: "Google Tag Manager",
    },
    {
      pattern: /facebook.*pixel|fbevents/i,
      category: "analytics",
      name: "Facebook Pixel",
    },
    { pattern: /hotjar/i, category: "analytics", name: "Hotjar" },
    { pattern: /mixpanel/i, category: "analytics", name: "Mixpanel" },
    {
      pattern: /segment\.com|segment\.io/i,
      category: "analytics",
      name: "Segment",
    },
    { pattern: /heap-/i, category: "analytics", name: "Heap Analytics" },
    {
      pattern: /clarity\.ms/i,
      category: "analytics",
      name: "Microsoft Clarity",
    },
  ],
  crm: [
    { pattern: /hubspot/i, category: "crm", name: "HubSpot" },
    { pattern: /salesforce|pardot/i, category: "crm", name: "Salesforce" },
    { pattern: /zoho/i, category: "crm", name: "Zoho" },
    { pattern: /pipedrive/i, category: "crm", name: "Pipedrive" },
    { pattern: /intercom/i, category: "crm", name: "Intercom" },
    { pattern: /drift/i, category: "crm", name: "Drift" },
    { pattern: /freshdesk|freshworks/i, category: "crm", name: "Freshworks" },
  ],
  marketing: [
    { pattern: /mailchimp/i, category: "marketing", name: "Mailchimp" },
    {
      pattern: /constantcontact/i,
      category: "marketing",
      name: "Constant Contact",
    },
    { pattern: /klaviyo/i, category: "marketing", name: "Klaviyo" },
    {
      pattern: /activecampaign/i,
      category: "marketing",
      name: "ActiveCampaign",
    },
    { pattern: /optinmonster/i, category: "marketing", name: "OptinMonster" },
    { pattern: /sumo\.com/i, category: "marketing", name: "Sumo" },
    { pattern: /convertkit/i, category: "marketing", name: "ConvertKit" },
  ],
  payments: [
    { pattern: /stripe/i, category: "payments", name: "Stripe" },
    { pattern: /paypal/i, category: "payments", name: "PayPal" },
    { pattern: /square/i, category: "payments", name: "Square" },
    { pattern: /braintree/i, category: "payments", name: "Braintree" },
    { pattern: /authorize\.net/i, category: "payments", name: "Authorize.net" },
  ],
  hosting: [
    { pattern: /cloudflare/i, category: "hosting", name: "Cloudflare" },
    { pattern: /amazonaws|aws/i, category: "hosting", name: "AWS" },
    { pattern: /azure/i, category: "hosting", name: "Microsoft Azure" },
    {
      pattern: /googleapis|gstatic/i,
      category: "hosting",
      name: "Google Cloud",
    },
    { pattern: /vercel/i, category: "hosting", name: "Vercel" },
    { pattern: /netlify/i, category: "hosting", name: "Netlify" },
    { pattern: /heroku/i, category: "hosting", name: "Heroku" },
  ],
  framework: [
    { pattern: /react/i, category: "framework", name: "React" },
    { pattern: /vue/i, category: "framework", name: "Vue.js" },
    { pattern: /angular/i, category: "framework", name: "Angular" },
    { pattern: /next/i, category: "framework", name: "Next.js" },
    { pattern: /jquery/i, category: "framework", name: "jQuery" },
    { pattern: /bootstrap/i, category: "framework", name: "Bootstrap" },
    { pattern: /tailwind/i, category: "framework", name: "Tailwind CSS" },
  ],
};

// Header-based detection
const HEADER_PATTERNS: Record<
  string,
  { header: string; pattern: RegExp; name: string; category: string }[]
> = {
  server: [
    { header: "server", pattern: /nginx/i, name: "Nginx", category: "hosting" },
    {
      header: "server",
      pattern: /apache/i,
      name: "Apache",
      category: "hosting",
    },
    {
      header: "server",
      pattern: /cloudflare/i,
      name: "Cloudflare",
      category: "hosting",
    },
    {
      header: "x-powered-by",
      pattern: /php/i,
      name: "PHP",
      category: "framework",
    },
    {
      header: "x-powered-by",
      pattern: /express/i,
      name: "Express.js",
      category: "framework",
    },
    {
      header: "x-powered-by",
      pattern: /asp\.net/i,
      name: "ASP.NET",
      category: "framework",
    },
  ],
};

/**
 * Tech Stack Detection Service
 *
 * Analyzes a website to detect its technology stack including:
 * - CMS platforms
 * - E-commerce solutions
 * - Analytics tools
 * - CRM systems
 * - Marketing automation
 * - Payment processors
 * - Hosting providers
 * - Frameworks
 */
export class TechStackDetectionService {
  private timeout = 15000;

  /**
   * Analyze a website's tech stack
   */
  async analyze(url: string): Promise<TechStackResult> {
    const normalizedUrl = this.normalizeUrl(url);
    logger.info(`Analyzing tech stack for: ${normalizedUrl}`);

    const technologies: Technology[] = [];
    const categories: TechCategories = {};

    try {
      // Fetch the webpage
      const response = await axios.get(normalizedUrl, {
        timeout: this.timeout,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        maxRedirects: 5,
      });

      const html = response.data;
      const headers = response.headers;
      const $ = cheerio.load(html);

      // Analyze HTML content
      this.analyzeHtml(html, technologies);

      // Analyze script sources
      this.analyzeScripts($, technologies);

      // Analyze link tags
      this.analyzeLinks($, technologies);

      // Analyze meta tags
      this.analyzeMeta($, technologies);

      // Analyze headers
      this.analyzeHeaders(headers, technologies);

      // Deduplicate and organize by category
      const uniqueTechs = this.deduplicateTechnologies(technologies);
      this.organizeByCategory(uniqueTechs, categories);

      // Generate insights
      const insights = this.generateInsights(uniqueTechs, categories);

      logger.info(
        `Found ${uniqueTechs.length} technologies for ${normalizedUrl}`,
      );

      return {
        technologies: uniqueTechs,
        categories,
        insights,
      };
    } catch (error) {
      logger.error(`Tech stack analysis failed for ${normalizedUrl}:`, error);
      return {
        technologies: [],
        categories: {},
        insights: [
          "Unable to analyze website - may be offline or blocking requests",
        ],
      };
    }
  }

  /**
   * Normalize URL
   */
  private normalizeUrl(url: string): string {
    if (!url.startsWith("http")) {
      url = `https://${url}`;
    }
    return url;
  }

  /**
   * Analyze HTML content for technology patterns
   */
  private analyzeHtml(html: string, technologies: Technology[]): void {
    for (const [, patterns] of Object.entries(TECH_PATTERNS)) {
      for (const tech of patterns) {
        if (tech.pattern instanceof RegExp && tech.pattern.test(html)) {
          technologies.push({
            name: tech.name,
            category: tech.category,
            confidence: 0.8,
          });
        }
      }
    }
  }

  /**
   * Analyze script tags
   */
  private analyzeScripts(
    $: cheerio.CheerioAPI,
    technologies: Technology[],
  ): void {
    $("script[src]").each((_, element) => {
      const src = $(element).attr("src") || "";

      for (const [, patterns] of Object.entries(TECH_PATTERNS)) {
        for (const tech of patterns) {
          if (tech.pattern instanceof RegExp && tech.pattern.test(src)) {
            technologies.push({
              name: tech.name,
              category: tech.category,
              confidence: 0.9,
            });
          }
        }
      }
    });

    // Check inline scripts
    $("script:not([src])").each((_, element) => {
      const content = $(element).html() || "";

      for (const [, patterns] of Object.entries(TECH_PATTERNS)) {
        for (const tech of patterns) {
          if (tech.pattern instanceof RegExp && tech.pattern.test(content)) {
            technologies.push({
              name: tech.name,
              category: tech.category,
              confidence: 0.7,
            });
          }
        }
      }
    });
  }

  /**
   * Analyze link tags
   */
  private analyzeLinks(
    $: cheerio.CheerioAPI,
    technologies: Technology[],
  ): void {
    $("link[href]").each((_, element) => {
      const href = $(element).attr("href") || "";

      for (const [, patterns] of Object.entries(TECH_PATTERNS)) {
        for (const tech of patterns) {
          if (tech.pattern instanceof RegExp && tech.pattern.test(href)) {
            technologies.push({
              name: tech.name,
              category: tech.category,
              confidence: 0.85,
            });
          }
        }
      }
    });
  }

  /**
   * Analyze meta tags
   */
  private analyzeMeta($: cheerio.CheerioAPI, technologies: Technology[]): void {
    // Check generator meta tag
    const generator = $('meta[name="generator"]').attr("content") || "";
    if (generator) {
      if (/wordpress/i.test(generator)) {
        technologies.push({
          name: "WordPress",
          category: "cms",
          confidence: 1.0,
          version: generator.replace(/WordPress\s*/i, ""),
        });
      } else if (/drupal/i.test(generator)) {
        technologies.push({ name: "Drupal", category: "cms", confidence: 1.0 });
      } else if (/joomla/i.test(generator)) {
        technologies.push({ name: "Joomla", category: "cms", confidence: 1.0 });
      }
    }
  }

  /**
   * Analyze response headers
   */
  private analyzeHeaders(
    headers: Record<string, unknown>,
    technologies: Technology[],
  ): void {
    for (const patterns of Object.values(HEADER_PATTERNS)) {
      for (const tech of patterns) {
        const headerValue = headers[tech.header];
        if (typeof headerValue === "string" && tech.pattern.test(headerValue)) {
          technologies.push({
            name: tech.name,
            category: tech.category,
            confidence: 0.95,
          });
        }
      }
    }
  }

  /**
   * Remove duplicate technologies
   */
  private deduplicateTechnologies(technologies: Technology[]): Technology[] {
    const seen = new Map<string, Technology>();

    for (const tech of technologies) {
      const key = tech.name.toLowerCase();
      const existing = seen.get(key);

      if (!existing || tech.confidence > existing.confidence) {
        seen.set(key, tech);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Organize technologies by category
   */
  private organizeByCategory(
    technologies: Technology[],
    categories: TechCategories,
  ): void {
    for (const tech of technologies) {
      const category = tech.category as keyof TechCategories;
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category]!.push(tech.name);
    }
  }

  /**
   * Generate actionable insights based on detected tech stack
   */
  private generateInsights(
    technologies: Technology[],
    categories: TechCategories,
  ): string[] {
    const insights: string[] = [];

    // CMS insights
    if (categories.cms?.includes("WordPress")) {
      insights.push(
        "Using WordPress - check if plugins and themes are up to date",
      );
    }
    if (
      categories.cms?.includes("Wix") ||
      categories.cms?.includes("Squarespace")
    ) {
      insights.push(
        "Using website builder - limited customization, potential upgrade opportunity",
      );
    }
    if (categories.cms?.includes("GoDaddy Website Builder")) {
      insights.push(
        "Using basic GoDaddy builder - strong candidate for website redesign",
      );
    }

    // Analytics insights
    if (!categories.analytics?.length) {
      insights.push(
        "No analytics detected - missing critical business intelligence",
      );
    }
    if (
      categories.analytics?.includes("Google Analytics") &&
      !categories.analytics?.includes("Google Tag Manager")
    ) {
      insights.push(
        "Has Google Analytics but no Tag Manager - room for better tracking",
      );
    }

    // CRM insights
    if (!categories.crm?.length) {
      insights.push(
        "No CRM detected - potential CRM implementation opportunity",
      );
    }

    // Marketing insights
    if (!categories.marketing?.length) {
      insights.push(
        "No email marketing tools detected - missing lead nurture capability",
      );
    }

    // E-commerce insights
    if (
      categories.ecommerce?.length &&
      !categories.payments?.includes("Stripe")
    ) {
      insights.push(
        "E-commerce site without Stripe - may be using older payment methods",
      );
    }

    // Framework insights
    if (
      categories.framework?.includes("jQuery") &&
      !categories.framework?.includes("React") &&
      !categories.framework?.includes("Vue.js")
    ) {
      insights.push(
        "Using jQuery without modern framework - website may be outdated",
      );
    }

    // Age indicators
    if (categories.cms?.includes("WordPress")) {
      const hasModernTools = categories.framework?.some((f) =>
        ["React", "Vue.js", "Next.js", "Tailwind CSS"].includes(f),
      );
      if (!hasModernTools) {
        insights.push(
          "Traditional WordPress setup - may benefit from modern development practices",
        );
      }
    }

    return insights;
  }
}

export const techStackDetectionService = new TechStackDetectionService();
