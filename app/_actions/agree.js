"use server";
import { updateAgreementStatusDb } from "../_lib/db/db_functions";
import { verifySession } from "../_lib/sessions";
import { redirect } from "next/navigation";
import { logger } from "../_lib/logger";

export default async function updateAgreementStatus(
  postId,
  status,
  redirectUrl
) {
  try {
    const { userId, username } = await verifySession();
    logger.info(`updateAgreementStatus called by user: ${userId}`);
    if (!userId) {
      const redirectVal = redirectUrl
        ? `/login?redirect=${redirectUrl}`
        : `/login`;

      redirect(redirectVal);
    }
    const success = await updateAgreementStatusDb(postId, userId, status);
    return { success: success };
  } catch (error) {
    if (error.message === "NEXT_REDIRECT") throw error;
    logger.error(`An error occurred from updateAgreementStatus: ${error}`);
    return { success: false };
  }
}
