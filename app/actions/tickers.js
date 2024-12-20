"use server";
import { getTickerPrices } from "../lib/db/db_functions";
export default async function getPriceByTickers(tickers) {
  try {
    const tickerPrices = getTickerPrices(tickers);
    return tickerPrices;
  } catch (error) {
    console.log("An error occurred getting ticker prices: " + error);
    return false;
  }
}
