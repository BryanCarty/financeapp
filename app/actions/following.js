"use server";
import { followUserDb, unfollowUserDb } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export async function followUser(otherUserId, notified) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  const success = await followUserDb(userId, otherUserId, notified);
  return success;
}

export async function unfollowUser(otherUserId) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  const { success, message } = await unfollowUserDb(userId, otherUserId);
  return success;
}
