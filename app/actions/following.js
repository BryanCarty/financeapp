"use server";
import { redirect } from "next/navigation";
import { followUserDb, unfollowUserDb } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export async function followUser(otherUserId, notified) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    const success = await followUserDb(userId, otherUserId, notified);
    return success;
  } catch (error) {
    console.log("An error occurred in followUser: " + error);
    return false;
  }
}

export async function unfollowUser(otherUserId) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    const { success, message } = await unfollowUserDb(userId, otherUserId);
    return success;
  } catch (error) {
    console.log("An error occurred in unfollowUser: " + error);
    return false;
  }
}
