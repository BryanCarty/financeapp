"use server";
import { updateAgreementStatusDb } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";
import { redirect } from "next/navigation";

export default async function updateAgreementStatus(
  postId,
  status,
  redirectUrl
) {
  try {
    const { userId, username } = await verifySession();
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
    console.log("An error occurred from updateAgreementStatus: " + error);
    return { success: false };
  }
}
