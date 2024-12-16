"use server";
import { redirect } from "next/navigation";
import { loadUserStats } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function getUserStats() {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      console.log("user is not logged in, redirecting...");
      redirect("/login");
    }
    const userStats = await loadUserStats(userId);
    return userStats;
  } catch (error) {
    console.log("An error occurred in getUserStats(): " + error);
    return false;
  }
}
