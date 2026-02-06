import axios from "axios";
import { logger } from "../utils/logger.js";

interface EmailFinderParams {
  companyName: string;
  domain?: string;
  firstName?: string;
  lastName?: string;
}

interface EmailResult {
  email: string;
  confidence: number;
  verified: boolean;
  source: string;
}

export class EmailFinderService {
  private commonPatterns = [
    "{first}@{domain}",
    "{last}@{domain}",
    "{first}.{last}@{domain}",
    "{first}{last}@{domain}",
    "{f}{last}@{domain}",
    "{first}.{l}@{domain}",
    "info@{domain}",
    "contact@{domain}",
    "hello@{domain}",
  ];

  async findEmails(params: EmailFinderParams): Promise<EmailResult[]> {
    const { companyName, domain, firstName, lastName } = params;

    logger.info(`Finding emails for: ${companyName}`);

    const results: EmailResult[] = [];
    const emailDomain = domain || this.deriveDomain(companyName);

    if (!emailDomain) {
      logger.warn("Could not determine domain for email search");
      return results;
    }

    // Generate potential email patterns
    if (firstName && lastName) {
      const patterns = this.generatePatterns(firstName, lastName, emailDomain);
      for (const email of patterns) {
        const verified = await this.verifyEmail(email);
        results.push({
          email,
          confidence: verified ? 90 : 50,
          verified,
          source: "pattern_matching",
        });
      }
    }

    // Add generic company emails
    const genericEmails = [
      `info@${emailDomain}`,
      `contact@${emailDomain}`,
      `hello@${emailDomain}`,
      `support@${emailDomain}`,
      `sales@${emailDomain}`,
    ];

    for (const email of genericEmails) {
      const verified = await this.verifyEmail(email);
      if (verified) {
        results.push({
          email,
          confidence: 70,
          verified: true,
          source: "generic_pattern",
        });
      }
    }

    logger.info(`Found ${results.length} potential emails`);

    return results;
  }

  private deriveDomain(companyName: string): string | null {
    // Simple domain derivation from company name
    const normalized = companyName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 63);

    if (!normalized) return null;

    return `${normalized}.com`;
  }

  private generatePatterns(
    firstName: string,
    lastName: string,
    domain: string
  ): string[] {
    const first = firstName.toLowerCase();
    const last = lastName.toLowerCase();
    const f = first[0];
    const l = last[0];

    return [
      `${first}@${domain}`,
      `${last}@${domain}`,
      `${first}.${last}@${domain}`,
      `${first}${last}@${domain}`,
      `${f}${last}@${domain}`,
      `${first}.${l}@${domain}`,
      `${first}_${last}@${domain}`,
    ];
  }

  private async verifyEmail(email: string): Promise<boolean> {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Note: For production, you would use an email verification service
    // This is a placeholder that returns true for basic validation

    try {
      // Check if domain has MX records
      const dns = await import("dns").then((m) => m.promises);
      const domain = email.split("@")[1];
      const mxRecords = await dns.resolveMx(domain);
      return mxRecords.length > 0;
    } catch {
      return false;
    }
  }
}
