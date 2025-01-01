"use server";
import { redirect } from "next/navigation";
import { getArticleById } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function fetchArticleById(articleId) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    const article = await getArticleById(articleId, userId);
    article["current_user_id"] = userId;

    // If comments exist, order them by latest created_at
    if (article.comments && Array.isArray(article.comments)) {
      article.comments.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      );
    }

    return article;
  } catch (error) {
    console.log("An error occurred in fetchArticleById: " + error);
    return false;
  }
}
