"use server";
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
  if (!userId) {
    throw new Error("User is not logged in");
  }
  switch (type) {
    case "fe": //follower
      const followerTable = await getFollowerTable(userId);
      return followerTable;
    case "fi": //following
      const followingTable = await getFollowingTable(userId);
      return followingTable;
    case "se":
      const searchTable = await getSearchTable(userId, searchQuery);
      return searchTable;
    case "l": //leaderboard
      const leaderboardData = await getLeaderboard(userId);
      return leaderboardData;
    default:
      return null;
  }
}
