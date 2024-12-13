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
  // Simulate database or external API call
  const { userId, username } = await verifySession();

  switch (type) {
    case "fe": //follower
      if (!userId) {
        redirect("/login");
      }
      const followerTable = await getFollowerTable(userId);
      return followerTable;
    case "fi": //following
      if (!userId) {
        redirect("/login");
      }
      const followingTable = await getFollowingTable(userId);
      return followingTable;
    case "se":
      if (!userId) {
        redirect("/login");
      }
      const searchTable = await getSearchTable(userId, searchQuery);
      return searchTable;
    case "l": //leaderboard
      const leaderboardData = await getLeaderboard(userId);
      return leaderboardData;
    default:
      return null;
  }
}
