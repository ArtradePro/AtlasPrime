import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { logger } from "../utils/logger.js";

puppeteer.use(StealthPlugin());

interface GoogleMapsParams {
  query: string;
  location?: string;
  maxResults: number;
}

interface ScrapedBusiness {
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  city?: string;
  state?: string;
  sourceUrl: string;
}

export class GoogleMapsScraper {
  async scrape(params: GoogleMapsParams): Promise<ScrapedBusiness[]> {
    const { query, location, maxResults } = params;
    const searchQuery = location ? `${query} in ${location}` : query;

    logger.info(`Starting Google Maps scrape: "${searchQuery}"`);

    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const results: ScrapedBusiness[] = [];

    try {
      const page = await browser.newPage();
      await page.setViewport({ width: 1920, height: 1080 });

      // Navigate to Google Maps
      const mapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`;
      await page.goto(mapsUrl, { waitUntil: "networkidle0", timeout: 60000 });

      // Wait for results to load
      await page.waitForSelector('[role="feed"]', { timeout: 30000 });

      // Scroll to load more results
      let previousCount = 0;
      while (results.length < maxResults) {
        // Extract visible businesses
        const businesses = await page.evaluate(() => {
          const items = document.querySelectorAll('[role="feed"] > div');
          return Array.from(items)
            .map((item) => {
              const nameEl = item.querySelector("div.fontHeadlineSmall");
              const ratingEl = item.querySelector("span.ZkP5Je");
              const reviewEl = item.querySelector("span.UY7F9");
              const categoryEl = item.querySelector(
                "div.W4Efsd:nth-child(2) > span:first-child",
              );
              const addressEl = item.querySelector("div.W4Efsd:nth-child(3)");
              const phoneEl = item.querySelector("span[data-phone-number]");

              return {
                name: nameEl?.textContent?.trim() || "",
                rating: ratingEl
                  ? parseFloat(ratingEl.textContent || "0")
                  : undefined,
                reviewCount: reviewEl
                  ? parseInt(reviewEl.textContent?.replace(/[()]/g, "") || "0")
                  : undefined,
                category: categoryEl?.textContent?.trim(),
                address: addressEl?.textContent?.trim(),
                phone: phoneEl?.getAttribute("data-phone-number") || undefined,
              };
            })
            .filter((b) => b.name);
        });

        for (const business of businesses) {
          if (results.length >= maxResults) break;
          if (!results.find((r) => r.name === business.name)) {
            results.push({
              ...business,
              sourceUrl: page.url(),
            });
          }
        }

        if (results.length === previousCount) {
          // No new results, try scrolling
          await page.evaluate(() => {
            const feed = document.querySelector('[role="feed"]');
            if (feed) feed.scrollTop = feed.scrollHeight;
          });
          // Use setTimeout instead of deprecated waitForTimeout
          await new Promise((resolve) => setTimeout(resolve, 2000));

          // Check if we've reached the end
          const endOfResults = await page.evaluate(() => {
            const feed = document.querySelector('[role="feed"]');
            return (
              feed?.scrollHeight === feed?.scrollTop + (feed?.clientHeight || 0)
            );
          });

          if (endOfResults) break;
        }

        previousCount = results.length;
      }

      logger.info(`Google Maps scrape completed: ${results.length} results`);
    } catch (error) {
      logger.error("Google Maps scrape error:", error);
      throw error;
    } finally {
      await browser.close();
    }

    return results;
  }
}
