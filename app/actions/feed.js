"use server";
import {
  getLatestFeed,
  getTrendingFeed,
  getPersonalFeed,
  getMyPosts,
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
        if (latestFeed[i]["author_id"] == userId) {
          latestFeed[i]["owned_by_me"] = true;
        } else {
          latestFeed[i]["owned_by_me"] = false;
        }
      }
      return latestFeed;
    case "trending":
      const trendingFeed = await getTrendingFeed(userId);
      //need to calculate status
      for (let i = 0; i < trendingFeed.length; i++) {
        const value = trendingFeed[i].value;
        const status = calculateStatus(value);
        trendingFeed[i]["status"] = status;
        if (trendingFeed[i]["author_id"] == userId) {
          trendingFeed[i]["owned_by_me"] = true;
        } else {
          trendingFeed[i]["owned_by_me"] = false;
        }
      }
      return trendingFeed;
    case "personalFeed":
      const personalFeed = await getPersonalFeed(userId);
      //need to calculate status
      for (let i = 0; i < personalFeed.length; i++) {
        const value = personalFeed[i].value;
        const status = calculateStatus(value);
        personalFeed[i]["status"] = status;
        if (personalFeed[i]["author_id"] == userId) {
          personalFeed[i]["owned_by_me"] = true;
        } else {
          personalFeed[i]["owned_by_me"] = false;
        }
      }
      return personalFeed;
    case "myPosts":
      const myPosts = await getMyPosts(userId);
      //need to calculate status
      for (let i = 0; i < myPosts.length; i++) {
        const value = myPosts[i].value;
        const status = calculateStatus(value);
        myPosts[i]["status"] = status;
        myPosts[i]["owned_by_me"] = true;
      }

      return myPosts;
    default:
      return null;
  }
}
