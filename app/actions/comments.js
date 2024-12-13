"use server";
import { verifySession } from "../lib/sessions";
import {
  createComment,
  updateCommentDb,
  removeCommentDb,
} from "../lib/db/db_functions";
import { redirect } from "next/navigation";

export async function submitComment(postId, text) {
  const { userId, username } = await verifySession();
  if (!userId) {
    redirect("/login");
  }

  const comment = await createComment(postId, userId, text);
  return comment;
}

export async function updateComment(commentId, text) {
  const { userId, username } = await verifySession();
  if (!userId) {
    redirect("/login");
  }
  let result = await updateCommentDb(commentId, userId, text);
  return result;
}

export async function removeComment(commentId) {
  const { userId, username } = await verifySession();
  if (!userId) {
    redirect("/login");
  }
  let result = await removeCommentDb(commentId, userId);
  return result;
}
