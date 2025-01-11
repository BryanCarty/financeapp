"server-only";

import { websocketClient } from "@polygon.io/client-js";
import { errorEmail } from "./email";
import { logger } from "./logger";

export default function initiateStockFeed() {
  try {
    logger.info(`initializing stock feed`);
    const ws = websocketClient(
      process.env.POLY_API_KEY,
      process.env.POLY_URL
    ).stocks(); // real-time webscoket

    ws.onerror = (err) => {
      console.log("websocker error", err);
      errorEmail(err);
    };

    return ws;
  } catch (error) {
    logger.error(`error occurred initializing stock feed: ${error}`);
    throw error;
  }
}
