"use server";
import { verifySession } from "../lib/sessions";
import {
  createComment,
  updateCommentDb,
  removeCommentDb,
} from "../lib/db/db_functions";
import { redirect } from "next/navigation";

export async function submitComment(postId, text) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }

    const comment = await createComment(postId, userId, text);
    return comment;
  } catch (error) {
    console.log("An error occurred in submitComment");
    return false;
  }
}

export async function updateComment(commentId, text) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    let result = await updateCommentDb(commentId, userId, text);
    return result;
  } catch (error) {
    console.log("An error occurred in updateComment");
    return false;
  }
}

export async function removeComment(commentId) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    let result = await removeCommentDb(commentId, userId);
    return result;
  } catch (error) {
    console.log("An error occurred in removeComment()");
    return false;
  }
}
