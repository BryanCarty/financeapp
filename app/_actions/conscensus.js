"use server";
import { verifySession } from "../_lib/sessions";
import { redirect } from "next/navigation";
import { getConscensusData } from "../_lib/db/db_functions";
import { logger } from "../_lib/logger";

export default async function fetchConscensusDataDb(ticker, date) {
  try {
    const { userId, username } = await verifySession();
    logger.info(`fetchConscensusDataDb called by user: ${userId}`);
    if (!userId) {
      redirect("/login");
    }

    // Ensure the date is >= today
    const inputDate = new Date(date); // Convert the input date string to a Date object
    const today = new Date(); // Get the current date
    today.setHours(0, 0, 0, 0); // Normalize time to 00:00:00 for accurate comparison

    if (inputDate < today) {
      throw new Error("The date must be greater than or equal to today.");
    }

    const conscensusData = await getConscensusData(ticker.toUpperCase(), date);
    if (!conscensusData) {
      return false;
    }

    let greaterThans = [];
    let lessThans = [];

    for (const item of conscensusData) {
      if (item.comparison == ">") {
        greaterThans.push(item);
      } else if (item.comparison == "<") {
        lessThans.push(item);
      }
    }

    const greaterThanPrices = greaterThans.map((item) =>
      parseFloat(item.price)
    );
    const lessThanPrices = lessThans.map((item) => parseFloat(item.price));

    const returnData = {
      greater_thans: greaterThanPrices,
      less_thans: lessThanPrices,
    };

    return returnData;
  } catch (error) {
    if (error.message === "NEXT_REDIRECT") throw error;
    logger.error(`An error occurred in fetchConscensusData(): ${error}`);
    return false;
  }
}
