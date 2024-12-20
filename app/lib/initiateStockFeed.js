"server-only";

import { websocketClient } from "@polygon.io/client-js";

export default function initiateStockFeed() {
  console.log("Beginning Initialization");
  const ws = websocketClient(
    process.env.POLY_API_KEY,
    process.env.POLY_URL
  ).stocks(); // real-time webscoket

  ws.onerror = (err) => console.log("Failed to connect", err);

  return ws;
}
