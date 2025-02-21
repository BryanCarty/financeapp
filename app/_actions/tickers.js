"use server";
import {
  getTickerPrices,
  scheduleWebSocketLifecycle,
} from "../_lib/db/db_functions";
import { logger } from "../_lib/logger";

let websocketIsRunning = false;
export default async function getPriceByTickers(tickers) {
  try {
    logger.info(`getPriceByTickers called`);
    const tickerPrices = await getTickerPrices(tickers);

    // If websocket to receive stock data has not been started, then start it
    if (!websocketIsRunning && process.env.STOCK_FEED_ENABLED == "true") {
      logger.info(`scheduling stock feed websocket...`);
      scheduleWebSocketLifecycle();
      websocketIsRunning = true;
    }

    return tickerPrices;
  } catch (error) {
    logger.error(`An error occurred in getPriceByTickers: ${error}`);
    return false;
  }
}
