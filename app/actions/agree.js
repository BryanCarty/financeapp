"use server";
import { updateAgreementStatusDb } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";

export default async function updateAgreementStatus(postId, status) {
  const { userId, username } = await verifySession();
  if (!userId) {
    throw new Error("User is not logged in");
  }
  const success = await updateAgreementStatusDb(postId, userId, status);
  return success;
}
