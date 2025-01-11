"use server";

import { fetchArticleUrls } from "./lib/db/db_functions";
import { logger } from "./lib/logger";

function formatExpiryDate(expiryDateStr) {
  const date = new Date(expiryDateStr);

  const day = date.getDate();
  const month = date.toLocaleString("en-US", { month: "long" }).toLowerCase();
  const year = date.getFullYear();

  // Get the correct suffix for the day (st, nd, rd, th)
  let daySuffix = "th";
  if (day === 1 || day === 21 || day === 31) daySuffix = "st";
  if (day === 2 || day === 22) daySuffix = "nd";
  if (day === 3 || day === 23) daySuffix = "rd";

  // Format as '31st-of-march-2025'
  return `${day}${daySuffix}-of-${month}-${year}`;
}

export default async function sitemap() {
  try {
    logger.info(`user accessing sitemap page: ${error}`);
    // Fetch dynamic article URLs
    const dynamicArticleUrls = await fetchArticleUrls();

    // Format dynamic URLs based on fetched data
    const dynamicPages = dynamicArticleUrls.map((article) => {
      const { id, ticker, comparison, price, expiry } = article;
      const comparisonVal = comparison == ">" ? "greater" : "less";
      const formattedExpiry = formatExpiryDate(expiry);
      const formattedUrl = `https://insightsofatrader.com/articles/why-${ticker.toLowerCase()}-stock-will-be-${comparisonVal}-than-${price}-by-market-close-on-the-${formattedExpiry}-${id}`;

      return {
        url: formattedUrl,
        lastModified: new Date(), // Assuming the articles are modified now
        changeFrequency: "daily", // You can adjust this frequency based on your needs
        priority: 0.8, // Lower priority for dynamic articles, adjust if needed
      };
    });

    // Static pages that will be included in the sitemap
    const staticPages = [
      {
        url: "https://insightsofatrader.com",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1,
      },
      {
        url: "https://insightsofatrader.com/about",
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.9,
      },
      {
        url: "https://insightsofatrader.com/login",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: "https://insightsofatrader.com/signup",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: "https://insightsofatrader.com/reset-password",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: "https://insightsofatrader.com/new-password",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      },
      {
        url: "https://insightsofatrader.com/terms-and-conditions",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: "https://insightsofatrader.com/privacy-policy",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];

    // Combine dynamic pages with static pages
    const allPages = [...staticPages, ...dynamicPages];

    // Return the combined pages
    return allPages;
  } catch (error) {
    logger.error(`error in sitemap(): ${error}`);
  }
}
