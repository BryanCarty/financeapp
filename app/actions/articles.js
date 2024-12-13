"use server";
import { redirect } from "next/navigation";
import { getArticleById } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function fetchArticleById(articleId) {
  const { userId, username } = await verifySession();
  if (!userId) {
    redirect("/login");
  }
  const article = await getArticleById(articleId, userId);
  article["current_user_id"] = userId;
  return article;
}
