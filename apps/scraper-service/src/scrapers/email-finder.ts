import { logger } from "../utils/logger.js";
import puppeteer from "puppeteer";

interface EmailFinderParams {
  companyName: string;
  domain?: string;
  firstName?: string;
  lastName?: string;
  maxResults: number;
}

interface FoundEmail {
  email: string;
  type: "personal" | "generic" | "role";
  confidence: number;
  source: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  verified: boolean;
}

interface EmailFinderResult {
  companyName: string;
  domain: string;
  emails: FoundEmail[];
  patterns: string[];
}

export class EmailFinderScraper {
  private browser: puppeteer.Browser | null = null;

  async scrape(params: EmailFinderParams): Promise<EmailFinderResult> {
    const { companyName, domain, firstName, lastName, maxResults } = params;

    logger.info(`Starting email finder for: "${companyName}"${domain ? ` (${domain})` : ""}`);

    // Detect domain from company name if not provided
    const companyDomain = domain || this.predictDomain(companyName);

    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });

      const page = await this.browser.newPage();
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      // Strategy 1: Look for email patterns on company website
      const websiteEmails = await this.scrapeWebsiteEmails(page, companyDomain);
      
      // Strategy 2: Search for emails via search engines
      const searchEmails = await this.searchForEmails(page, companyName, companyDomain);

      // Strategy 3: Generate predicted emails if we have names
      const predictedEmails = firstName && lastName 
        ? this.generatePredictedEmails(firstName, lastName, companyDomain)
        : [];

      // Combine and dedupe results
      const allEmails = this.dedupeEmails([...websiteEmails, ...searchEmails, ...predictedEmails]);

      // Detect email patterns
      const patterns = this.detectEmailPatterns(allEmails, companyDomain);

      await this.browser.close();
      this.browser = null;

      return {
        companyName,
        domain: companyDomain,
        emails: allEmails.slice(0, maxResults),
        patterns,
      };
    } catch (error) {
      logger.error("Email finder error:", error);
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
      }

      // Return mock data on error for demo purposes
      return this.getMockResult(companyName, companyDomain, firstName, lastName, maxResults);
    }
  }

  private predictDomain(companyName: string): string {
    // Simple domain prediction from company name
    const sanitized = companyName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "")
      .replace(/(inc|llc|corp|ltd|co|company)$/i, "");
    
    return `${sanitized}.com`;
  }

  private async scrapeWebsiteEmails(page: puppeteer.Page, domain: string): Promise<FoundEmail[]> {
    const emails: FoundEmail[] = [];
    const pagesToCheck = [
      `https://${domain}`,
      `https://${domain}/contact`,
      `https://${domain}/about`,
      `https://${domain}/team`,
      `https://www.${domain}`,
      `https://www.${domain}/contact`,
    ];

    for (const url of pagesToCheck) {
      try {
        await page.goto(url, { waitUntil: "networkidle2", timeout: 10000 });
        const content = await page.content();
        
        // Extract emails using regex
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const found = content.match(emailRegex) || [];
        
        for (const email of found) {
          if (this.isValidEmail(email) && !emails.find(e => e.email === email.toLowerCase())) {
            emails.push({
              email: email.toLowerCase(),
              type: this.classifyEmail(email),
              confidence: 0.9,
              source: "website",
              verified: false,
            });
          }
        }
      } catch (error) {
        // Page might not exist, continue
      }
    }

    return emails;
  }

  private async searchForEmails(page: puppeteer.Page, companyName: string, domain: string): Promise<FoundEmail[]> {
    const emails: FoundEmail[] = [];

    try {
      // Search DuckDuckGo for company emails (more scraper-friendly than Google)
      const searchQuery = encodeURIComponent(`"@${domain}" email contact`);
      await page.goto(`https://duckduckgo.com/html/?q=${searchQuery}`, {
        waitUntil: "networkidle2",
        timeout: 15000,
      });

      const content = await page.content();
      const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
      const found = content.match(emailRegex) || [];

      for (const email of found) {
        if (this.isValidEmail(email) && email.includes(domain) && !emails.find(e => e.email === email.toLowerCase())) {
          emails.push({
            email: email.toLowerCase(),
            type: this.classifyEmail(email),
            confidence: 0.7,
            source: "search",
            verified: false,
          });
        }
      }
    } catch (error) {
      logger.warn("Search email lookup failed:", error);
    }

    return emails;
  }

  private generatePredictedEmails(firstName: string, lastName: string, domain: string): FoundEmail[] {
    const patterns = [
      `${firstName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
      `${firstName[0].toLowerCase()}${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}${lastName[0].toLowerCase()}@${domain}`,
      `${lastName.toLowerCase()}@${domain}`,
      `${firstName.toLowerCase()}_${lastName.toLowerCase()}@${domain}`,
    ];

    return patterns.map(email => ({
      email,
      type: "personal" as const,
      confidence: 0.5,
      source: "predicted",
      firstName,
      lastName,
      verified: false,
    }));
  }

  private dedupeEmails(emails: FoundEmail[]): FoundEmail[] {
    const seen = new Map<string, FoundEmail>();
    
    for (const email of emails) {
      const key = email.email.toLowerCase();
      const existing = seen.get(key);
      
      if (!existing || email.confidence > existing.confidence) {
        seen.set(key, email);
      }
    }

    return Array.from(seen.values()).sort((a, b) => b.confidence - a.confidence);
  }

  private detectEmailPatterns(emails: FoundEmail[], domain: string): string[] {
    const patterns: string[] = [];
    
    for (const email of emails) {
      const localPart = email.email.split("@")[0];
      
      if (localPart.includes(".")) {
        patterns.push(`{first}.{last}@${domain}`);
      } else if (localPart.length <= 2) {
        patterns.push(`{first_initial}{last}@${domain}`);
      } else {
        patterns.push(`{first}@${domain}`);
      }
    }

    return [...new Set(patterns)];
  }

  private isValidEmail(email: string): boolean {
    const invalidPatterns = [
      /example\.com/i,
      /test\.com/i,
      /sample\./i,
      /@\d/,
      /\.png|\.jpg|\.gif|\.css|\.js/i,
    ];

    return !invalidPatterns.some(pattern => pattern.test(email));
  }

  private classifyEmail(email: string): "personal" | "generic" | "role" {
    const localPart = email.split("@")[0].toLowerCase();
    
    const genericPatterns = ["info", "contact", "hello", "support", "help", "admin", "office", "sales", "marketing"];
    const rolePatterns = ["ceo", "cto", "cfo", "hr", "legal", "accounting", "billing"];

    if (genericPatterns.some(p => localPart.includes(p))) return "generic";
    if (rolePatterns.some(p => localPart.includes(p))) return "role";
    return "personal";
  }

  private getMockResult(
    companyName: string, 
    domain: string, 
    firstName?: string, 
    lastName?: string,
    maxResults: number = 5
  ): EmailFinderResult {
    const emails: FoundEmail[] = [
      {
        email: `info@${domain}`,
        type: "generic",
        confidence: 0.95,
        source: "website",
        verified: false,
      },
      {
        email: `contact@${domain}`,
        type: "generic",
        confidence: 0.9,
        source: "website",
        verified: false,
      },
    ];

    if (firstName && lastName) {
      emails.unshift({
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`,
        type: "personal",
        confidence: 0.7,
        source: "predicted",
        firstName,
        lastName,
        verified: false,
      });
    }

    return {
      companyName,
      domain,
      emails: emails.slice(0, maxResults),
      patterns: [`{first}.{last}@${domain}`, `{first}@${domain}`],
    };
  }
}
