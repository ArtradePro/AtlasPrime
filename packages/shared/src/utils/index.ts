/**
 * Format a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: string = "en-US",
): string {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format a number with compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompactNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(num);
}

/**
 * Format a date as relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | number): string {
  const now = new Date();
  const target = typeof date === "number" ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 30) {
    return target.toLocaleDateString();
  } else if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  } else if (diffMins > 0) {
    return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

/**
 * Calculate a lead score based on company attributes
 */
export function calculateLeadScore(company: {
  yearsInBusiness?: number;
  employeeCount?: number;
  hasWebsite?: boolean;
  hasEmail?: boolean;
  hasPhone?: boolean;
}): number {
  let score = 50; // Base score

  // Years in business (max +20)
  if (company.yearsInBusiness) {
    if (company.yearsInBusiness >= 10) score += 20;
    else if (company.yearsInBusiness >= 5) score += 15;
    else if (company.yearsInBusiness >= 2) score += 10;
    else score += 5;
  }

  // Employee count (max +15)
  if (company.employeeCount) {
    if (company.employeeCount >= 100) score += 15;
    else if (company.employeeCount >= 50) score += 12;
    else if (company.employeeCount >= 10) score += 8;
    else score += 4;
  }

  // Contact info (max +15)
  if (company.hasWebsite) score += 5;
  if (company.hasEmail) score += 5;
  if (company.hasPhone) score += 5;

  return Math.min(100, score);
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Truncate a string with ellipsis
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + "...";
}

/**
 * Validate an email address
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate a URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string | null {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/**
 * Deep merge objects
 */
export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
): T {
  const result = { ...target } as Record<string, any>;

  for (const key in source) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      result[key] = deepMerge((target as any)[key] || {}, source[key] as any);
    } else if (source[key] !== undefined) {
      result[key] = source[key];
    }
  }

  return result as T;
}
