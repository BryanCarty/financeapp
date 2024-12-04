"use server";
import {
  getLatestFeed,
  getTrendingFeed,
  getPersonalFeed,
} from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

function calculateStatus(value) {
  return "3% above 232.23";
}

export default async function loadFeed(type) {
  // Simulate database or external API call
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  switch (type) {
    case "latest": //follower
      const latestFeed = await getLatestFeed(userId);
      //need to calculate status
      for (let i = 0; i < latestFeed.length; i++) {
        const value = latestFeed[i].value;
        const status = calculateStatus(value);
        latestFeed[i]["status"] = status;
      }
      return latestFeed;
    case "trending":
      const trendingFeed = await getTrendingFeed(userId);
      //need to calculate status
      for (let i = 0; i < trendingFeed.length; i++) {
        const value = trendingFeed[i].value;
        const status = calculateStatus(value);
        trendingFeed[i]["status"] = status;
      }
      return trendingFeed;
    case "personalFeed":
      const personalFeed = await getPersonalFeed(userId);
      //need to calculate status
      for (let i = 0; i < personalFeed.length; i++) {
        const value = personalFeed[i].value;
        const status = calculateStatus(value);
        personalFeed[i]["status"] = status;
      }
      return personalFeed;
    default:
      return null;
  }
}
