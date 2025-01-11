"use server";
import { getTickerPrices } from "../lib/db/db_functions";
import { logger } from "../lib/logger";
export default async function getPriceByTickers(tickers) {
  try {
    logger.info(`getPriceByTickers called`);
    const tickerPrices = getTickerPrices(tickers);
    return tickerPrices;
  } catch (error) {
    logger.error(`An error occurred in getPriceByTickers: ${error}`);
    return false;
  }
}
