"use server";
import { redirect } from "next/navigation";
import {
  getLeaderboard,
  getFollowerTable,
  getFollowingTable,
  getSearchTable,
} from "../_lib/db/db_functions";
import { verifySession } from "../_lib/sessions";
import { logger } from "../_lib/logger";

export default async function loadTable(type, searchQuery) {
  try {
    // Simulate database or external API call
    const { userId, username } = await verifySession();
    logger.info(`loadTable called by user: ${userId}`);
    let tableData = false;
    switch (type) {
      case "fe": //follower
        if (!userId) {
          redirect("/login");
        }

        tableData = await getFollowerTable(userId);
        return { tableData, userId };
      case "fi": //following
        if (!userId) {
          redirect("/login");
        }

        tableData = await getFollowingTable(userId);

        return { tableData, userId };
      case "se":
        if (!userId) {
          redirect("/login");
        }
        tableData = await getSearchTable(userId, searchQuery);
        return { tableData, userId };
      case "l": //leaderboard
        tableData = await getLeaderboard(userId);
        return { tableData, userId };
      default:
        return { tableData, userId };
    }
  } catch (error) {
    logger.error(`An error occurred in loadTable: ${error}`);
    return false;
  }
}
