"use server";
import { verifySession } from "../lib/sessions";
import { createComment } from "../lib/db/db_functions";

export default async function submitComment(postId, text) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }

  const comment = await createComment(postId, userId, text);
  return comment;
}
