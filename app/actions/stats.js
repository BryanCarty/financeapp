"use server";
import { redirect } from "next/navigation";
import { loadUserStats } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function getUserStats() {
  const { userId, username } = await verifySession();
  if (!userId) {
    console.log("user is not logged in, redirecting...");
    redirect("/login");
  }
  const userStats = await loadUserStats(userId);
  return userStats;
}
