"use server";
import { updateAgreementStatusDb } from "../lib/db/db_functions";
import { verifySession } from "../lib/sessions";
import { redirect } from "next/dist/server/api-utils";

export default async function updateAgreementStatus(postId, status) {
  try {
    const { userId, username } = await verifySession();
    if (!userId) {
      redirect("/login");
    }
    const success = await updateAgreementStatusDb(postId, userId, status);
    return { success: success };
  } catch (error) {
    console.log("An error occurred from updateAgreementStatus: " + error);
    return { success: false };
  }
}
