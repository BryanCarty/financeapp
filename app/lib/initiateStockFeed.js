"server-only";

import { websocketClient } from "@polygon.io/client-js";
import { errorEmail } from "./email";

export default function initiateStockFeed() {
  console.log("Beginning Initialization");
  const ws = websocketClient(
    process.env.POLY_API_KEY,
    process.env.POLY_URL
  ).stocks(); // real-time webscoket

  ws.onerror = (err) => {
    console.log("websocker error", err);
    errorEmail(err);
  };

  return ws;
}
