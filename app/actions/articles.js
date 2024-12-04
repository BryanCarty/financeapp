"use server";
import { getArticleById } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function fetchArticleById(articleId) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  const article = await getArticleById(articleId, userId);
  article["current_user_id"] = userId;
  return article;
}
