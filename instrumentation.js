import * as Sentry from "@sentry/nextjs";
import { scheduleWebSocketLifecycle } from "./app/_lib/db/db_functions";

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("./sentry.server.config");
    await scheduleWebSocketLifecycle();
  }

  if (process.env.NEXT_RUNTIME === "edge") {
    await import("./sentry.edge.config");
  }
}

export const onRequestError = Sentry.captureRequestError;
