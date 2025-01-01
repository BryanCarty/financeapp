"use server";
import { redirect } from "next/navigation";
import {
  getLeaderboard,
  getFollowerTable,
  getFollowingTable,
  getSearchTable,
} from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function loadTable(type, searchQuery) {
  try {
    // Simulate database or external API call
    const { userId, username } = await verifySession();
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
    console.log("An error occurred in loadTable: " + error);
    return false;
  }
}
