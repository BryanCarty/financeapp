"use server";

import { createPost } from "../lib/db/db_functions";

export default async function submitPost(postData) {
  try {
    // Destructure and validate data
    const { ticker, condition, price, futureDate, reasoning } = postData;

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

    const postId = await createPost(
      ticker,
      condition,
      price,
      futureDate,
      reasoning,
      0.0,
      49
    );
    if (!postId) {
      throw new Error("Unable to create post");
    }
    return postId; // Return the result for further use
  } catch (error) {
    console.log("Failed to submit post:", error);
    throw error; // Propagate the error so the UI can handle it
  }
}
