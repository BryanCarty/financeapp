"use server";
import { redirect } from "next/navigation";
import {
  followUserDb,
  isEligibleToFollow,
  unfollowUserDb,
} from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export async function followUser(otherUserId, notified) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    // Get users account type if 0 and they're currently following less than one
    // if account type is 1 and they're currently following less than 10
    // if account type is 2 and currently following less than 25
    // return true, else return false
    const eligibleToFollow = await isEligibleToFollow(userId);
    if (!eligibleToFollow) {
      return {
        success: false,
        message: "Follow Inelligibillity", //"Your account type cannot follow more users. Consider upgrading your account."
      };
    }

    const success = await followUserDb(userId, otherUserId, notified);
    return { success: success, message: null };
  } catch (error) {
    if (error.message === "NEXT_REDIRECT") throw error;
    console.log("An error occurred in followUser: " + error);
    return { success: false, message: "Internal Server Error" };
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
    if (error.message === "NEXT_REDIRECT") throw error;
    console.log("An error occurred in unfollowUser: " + error);
    return false;
  }
}
