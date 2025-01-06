"use server";
import { useId } from "react";
//import { redirect } from "next/navigation";
import { getArticleBySlug } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

//Example slug = 'why-aapl-stock-will-be-greater-than-232.23-by-market-close-on-the-31st-of-march-2025-232'
//Example slug = 'why-goog-stock-will-be-less-than-160.34-by-market-close-on-the-2nd-of-june-2026-12'
//Example slug = 'why-{ticker}-stock-will-be-{comparison}-{price}-by-market-close-on-the-{day}-of-{month}-{year}-{unique_id}'
export default async function fetchArticleBySlug(slug) {
  try {
    let { userId, username } = await verifySession();
    userId = userId === undefined ? null : userId;
    //if (!userId) {
    //  redirect("/login");
    //}

    // Step 1: Extract key information from the slug
    //const slugPattern =
    //  /^why-(\w+)-stock-will-be-(\w+)-than-(\d+(\.\d+)?)-by-market-close-on-the-(\d+)(?:st|nd|rd|th)-of-(\w+)-(\d{4})-(\d+)$/;

    const slugPattern =
      /^why-(\w+)-stock-will-be-(greater|less)-than-(\d+\.\d+)-by-market-close-on-the-(\d+)(?:st|nd|rd|th)-of-(\w+)-(\d{4})-(\d+)$/;

    //why-appl-stock-will-be-greater-than-310.09-by-market-close-on-the-31st-of-march-2025-23
    //why-aapl-will-be-greater-than-310.00-by-market-close-on-the-31st-of-march-2025-39
    console.log(slug);

    // Match the slug against the pattern
    const match = slug.match(slugPattern);

    if (!match) {
      return false;
    }

    // Extracted values from the slug
    const [, ticker, comparison, price, day, month, year, articleId] = match;

    const article = await getArticleBySlug(
      ticker,
      comparison,
      price,
      day,
      month,
      year,
      articleId,
      userId
    );
    article["current_user_id"] = userId;

    console.log(article);

    // If comments exist, order them by latest created_at
    if (article.comments && Array.isArray(article.comments)) {
      article.comments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    return article;
  } catch (error) {
    console.log("An error occurred in fetchArticleBySlug: " + error);
    return false;
  }
}
