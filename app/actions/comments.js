"use server";
import { verifySession } from "../lib/sessions";
import {
  createComment,
  updateCommentDb,
  removeCommentDb,
} from "../lib/db/db_functions";

export async function submitComment(postId, text) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }

  const comment = await createComment(postId, userId, text);
  return comment;
}

export async function updateComment(commentId, text) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  let result = await updateCommentDb(commentId, userId, text);
  return result;
}

export async function removeComment(commentId) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  let result = await removeCommentDb(commentId, userId);
  return result;
}
