"use server";
import { verifySession } from "../lib/sessions";
import { createPost, updatePostDb, deletePostDb } from "../lib/db/db_functions";
import { redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";

import fs from "fs/promises";

let tickers = null; // Initialize tickers to null for clarity
function sanitizePostData(postData) {
  const sanitizedData = {
    ticker: DOMPurify.sanitize(postData.ticker),
    condition: DOMPurify.sanitize(postData.condition),
    price: DOMPurify.sanitize(postData.price.toString()), // Convert to string before sanitizing
    futureDate: DOMPurify.sanitize(postData.futureDate), // Assuming it's a string; if it's a Date object, validate it
    reasoning: DOMPurify.sanitize(postData.reasoning),
  };

  if (postData.articleId) {
    sanitizedData.articleId = DOMPurify.sanitize(postData.articleId);
  }

  return sanitizedData;
}

async function loadTickers() {
  try {
    const data = await fs.readFile(process.env.TICKER_DATA_DIR, "utf8");
    tickers = JSON.parse(data).tickers;
    console.log("Tickers loaded:", tickers);
  } catch (error) {
    console.error("Failed to load tickers:", error);
  }
}

async function ensureTickersLoaded() {
  if (!tickers) {
    console.log("Tickers not loaded, loading now...");
    await loadTickers();
  }
}

async function isValidTicker(ticker) {
  await ensureTickersLoaded(); // Ensure tickers are loaded before accessing
  if (!tickers) {
    throw new Error("Tickers data could not be loaded");
  }
  console.log("Validating ticker:", ticker);
  return tickers.includes(ticker.toUpperCase());
}

export async function submitPost(postData) {
  try {
    // Destructure and validate data

    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }

    let { ticker, condition, price, futureDate, reasoning } =
      sanitizePostData(postData);

    if (!ticker || typeof ticker !== "string" || ticker.trim() === "") {
      return {
        success: false,
        message: "Ticker is required and must be a non-empty string.",
      };
    }

    if (!(await isValidTicker(ticker))) {
      return { success: false, message: "Invalid ticker" };
    }
    if (!["greater than", "less than"].includes(condition)) {
      return {
        success: false,
        message: "Condition must be 'greater than' or 'less than'.",
      };
    }

    if (!price || isNaN(price)) {
      return {
        success: false,
        message: "Price is required and must be a valid number.",
      };
    }

    if (price < 0 || price > 1000000) {
      return {
        success: false,
        message: "Price must be in the range 0 -> 1M",
      };
    }

    if (!futureDate || isNaN(Date.parse(futureDate))) {
      return {
        success: false,
        message: "Future date is required and must be a valid date.",
      };
    }

    // Parse the futureDate and the current date
    const parsedFutureDate = new Date(futureDate);
    const today = new Date();

    // Set the "tomorrow" date by adding one day to today's date
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // Check if futureDate is earlier than tomorrow
    if (parsedFutureDate < tomorrow) {
      return {
        success: false,
        message: "Future date must be tomorrow or later.",
      };
    }

    // Set the "10 years from now" date
    const tenYearsFromNow = new Date(today);
    tenYearsFromNow.setFullYear(today.getFullYear() + 10);

    if (parsedFutureDate > tenYearsFromNow) {
      return {
        success: false,
        message: "Future date must be within 10 years from now.",
      };
    }

    if (
      !reasoning ||
      typeof reasoning !== "string" ||
      reasoning.trim() === "" ||
      reasoning.replace(/<[^>]*>/g, "") === ""
    ) {
      return {
        success: false,
        message: "Reasoning is required and must be a non-empty string.",
      };
    }

    // Check the size of the reasoning string (in bytes)
    const reasoningSizeInBytes = new Blob([reasoning]).size;

    // 5MB limit in bytes
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB = 5 * 1024 * 1024 bytes

    // Ensure the reasoning is less than 5MB
    if (reasoningSizeInBytes > maxSizeInBytes) {
      return {
        success: false,
        message: "Reasoning must be less than 5MB in size.",
      };
    }

    const postId = await createPost(
      ticker,
      condition,
      price,
      futureDate,
      reasoning,
      0.0,
      userId
    );
    if (!postId) {
      return { success: false, message: "Unable to create post" };
    }

    return { success: true, message: "Success" }; // Return the result for further use
  } catch (error) {
    console.error("Failed to submit post:" + error);
    return {
      success: false,
      message: "An internal server error occurred",
    };
  }
}

export async function updatePost(postData) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    // Destructure and validate data

    let { ticker, condition, price, futureDate, reasoning, articleId } =
      sanitizePostData(postData);

    if (!articleId) {
      throw new Error("ArticleId must be provided");
    }

    if (!ticker || typeof ticker !== "string" || ticker.trim() === "") {
      throw new Error("Ticker is required and must be a non-empty string.");
    }

    if (!["greater than", "less than"].includes(condition)) {
      throw new Error("Condition must be 'greater than' or 'less than'.");
    }

    if (!price || isNaN(price)) {
      throw new Error("Price is required and must be a valid number.");
    }

    if (!futureDate || isNaN(Date.parse(futureDate))) {
      throw new Error("Future date is required and must be a valid date.");
    }

    if (
      !reasoning ||
      typeof reasoning !== "string" ||
      reasoning.trim() === ""
    ) {
      throw new Error("Reasoning is required and must be a non-empty string.");
    }

    const postId = await updatePostDb(reasoning, userId, articleId);
    if (!postId) {
      throw new Error("Unable to update post");
    }
    return { success: true, message: "Success" }; // Return the result for further use
  } catch (error) {
    console.log("Failed to update post:", error);
    return {
      success: false,
      message: "An internal server error occurred",
    };
  }
}

export async function deletePostRequest(articleId) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }

    if (!articleId) {
      throw new Error("ArticleId must be provided");
    }

    const postId = await deletePostDb(userId, articleId);
    if (!postId) {
      throw new Error("Unable to update post");
    }
    return postId; // Return the result for further use
  } catch (error) {
    console.log("Failed to update post:", error);
    return false;
  }
}
