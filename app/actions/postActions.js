"use server";
import { verifySession } from "../lib/sessions";
import {
  createPost,
  updatePostDb,
  deletePostDb,
  getValidTickers,
  getFollowerEmailsAndName,
  eligibleToPost,
} from "../lib/db/db_functions";
import { redirect } from "next/navigation";
import DOMPurify from "isomorphic-dompurify";
import { sendNewPostEmail } from "../lib/email";
import { logger } from "../lib/logger";

let tickers = null; // Initialize tickers to null for clarity
function sanitizePostData(postData) {
  try {
    logger.info(`sanitizePostData called`);
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
  } catch (error) {
    logger.error(`An error occurred in sanitizePostData: ${error}`);
    throw error;
  }
}

async function isValidTickerPrice(specificTicker, price, condition) {
  try {
    logger.info(`isValidTickerPrice called`);
    const result = await getValidTickers();
    const entry = result.find(({ ticker }) => ticker === specificTicker);

    let closePrice = parseFloat(entry.close_price);

    if (
      !entry ||
      entry === undefined ||
      !closePrice ||
      closePrice === undefined
    ) {
      return { validTicker: false, message: "Unrecognized Ticker" };
    }

    if (condition == "greater than" && price < closePrice) {
      return {
        validTicker: false,
        message: "Price must be greater than current price",
      };
    } else if (condition == "less than" && price > closePrice) {
      return {
        validTicker: false,
        message: "Price must be less than current price",
      };
    }

    return { validTicker: true, message: "Success" };
  } catch (error) {
    logger.error(`An error occurred in isValidTickerPrice: ${error}`);
    return { validTicker: false, message: "Internal Server Error" };
  }
}

export async function submitPost(postData) {
  try {
    // Destructure and validate data

    const { userId, username } = await verifySession();
    logger.info(`submitPost called by user: ${userId}`);
    if (!userId) {
      redirect("/login");
    }

    let { ticker, condition, price, futureDate, reasoning } =
      sanitizePostData(postData);
    ticker = ticker.toUpperCase();

    if (!ticker || typeof ticker !== "string" || ticker.trim() === "") {
      return {
        success: false,
        message: "Ticker is required and must be a non-empty string.",
      };
    }

    const { validTicker, message } = await isValidTickerPrice(
      ticker,
      price,
      condition
    );
    if (!validTicker) {
      return { success: false, message: message };
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
    parsedFutureDate.setHours(16, 0, 0, 0);

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

    let removedTags = reasoning.replace(/<[^>]*>/g, "");
    if (
      !reasoning ||
      typeof reasoning !== "string" ||
      reasoning.trim() === "" ||
      removedTags === ""
    ) {
      return {
        success: false,
        message: "Reasoning is required and must be a non-empty string.",
      };
    }

    if (removedTags.length <= 250) {
      return {
        success: false,
        message: "Reasoning must be greater than 250 characters in length",
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

    const isEligibleToPost = await eligibleToPost(userId);
    if (!isEligibleToPost) {
      return {
        success: false,
        message: "Looks like you've exceeded the limit of 5 posts/day",
      };
    }

    const postId = await createPost(
      ticker,
      condition,
      price,
      parsedFutureDate,
      reasoning,
      0.0,
      userId
    );
    if (!postId) {
      return { success: false, message: "Unable to create post" };
    }

    //Send Alert message to followers
    const followerEmailsAndNames = await getFollowerEmailsAndName(userId);
    if (followerEmailsAndNames && followerEmailsAndNames.length) {
      let { success, message } = await sendNewPostEmail(
        followerEmailsAndNames,
        username,
        postId
      );
    }

    return { success: true, message: "Success" }; // Return the result for further use
  } catch (error) {
    logger.error(`An error occurred in submitPost: ${error}`);
    return {
      success: false,
      message: "An internal server error occurred",
    };
  }
}

export async function updatePost(postData) {
  try {
    const { userId, username } = await verifySession();
    logger.info(`updatePost called by user: ${userId}`);
    if (!userId) {
      redirect("/login");
    }
    // Destructure and validate data

    let { ticker, condition, price, futureDate, reasoning, articleId } =
      sanitizePostData(postData);
    ticker = ticker.toUpperCase();

    if (!articleId) {
      return {
        success: false,
        message: "ArticleId must be provided",
      };
    }

    if (!ticker || typeof ticker !== "string" || ticker.trim() === "") {
      return {
        success: false,
        message: "Ticker is required and must be a non-empty string.",
      };
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

    if (!futureDate || isNaN(Date.parse(futureDate))) {
      return {
        success: false,
        message: "Future date is required and must be a valid date.",
      };
    }

    if (
      !reasoning ||
      typeof reasoning !== "string" ||
      reasoning.trim() === ""
    ) {
      return {
        success: false,
        message: "Reasoning is required and must be a non-empty string.",
      };
    }

    const postId = await updatePostDb(reasoning, userId, articleId);
    if (!postId) {
      return {
        success: false,
        message: "Unable to update post",
      };
    }
    return { success: true, message: "Success" }; // Return the result for further use
  } catch (error) {
    logger.error(`An error occurred in updatePost: ${error}`);
    return {
      success: false,
      message: "An internal server error occurred",
    };
  }
}

export async function deletePostRequest(articleId) {
  try {
    const { userId, username } = await verifySession();
    logger.info(`deletePostRequest called by user: ${userId}`);
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
    logger.error(`An error occurred in deletePostRequest: ${error}`);
    return false;
  }
}
