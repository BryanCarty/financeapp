"use server";
import { redirect } from "next/navigation";
import { loadUserStats } from "../_lib/db/db_functions";
import { verifySession } from "../_lib/sessions";
import { logger } from "../_lib/logger";

export default async function getUserStats() {
  try {
    const { userId, username } = await verifySession();
    logger.info(`getUserStats called by user: ${userId}`);
    if (!userId) {
      logger.info("user is not logged in, redirecting...");
      redirect("/login");
    }
    const userStats = await loadUserStats(userId);
    return userStats;
  } catch (error) {
    logger.error(`An error occurred in getUserStats: ${error}`);
    return false;
  }
}
