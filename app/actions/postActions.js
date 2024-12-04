"use server";
import { verifySession } from "../lib/sessions";
import { createPost, updatePostDb, deletePostDb } from "../lib/db/db_functions";

export async function submitPost(postData) {
  try {
    // Destructure and validate data

    const { userId, username } = await verifySession();
    if (!userId) {
      throw new Error("User is not logged in");
    }
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
      userId
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

export async function updatePost(postData) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      throw new Error("User is not logged in");
    }
    // Destructure and validate data
    const { ticker, condition, price, futureDate, reasoning, articleId } =
      postData;

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

    const postId = await updatePostDb(
      ticker,
      condition,
      price,
      futureDate,
      reasoning,
      0.0,
      userId,
      articleId
    );
    if (!postId) {
      throw new Error("Unable to update post");
    }
    return postId; // Return the result for further use
  } catch (error) {
    console.log("Failed to update post:", error);
    throw error; // Propagate the error so the UI can handle it
  }
}

export async function deletePostRequest(articleId) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      throw new Error("User is not logged in");
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
    throw error; // Propagate the error so the UI can handle it
  }
}
