"use client";
import styles from "@/app/_styles/Article.module.css";
import courierPrime from "./CourierPrime";
import { usePathname } from "next/navigation";
import updateAgreementStatus from "../_actions/agree";
import { useState } from "react";
import ErrorPopUP from "./ErrorPopUp";

export default function AgreeDisagreeSection({
  id,
  current_user_id,
  currentAgreementStatus,
  setAgreeDisagreeStatus,
  setAgreeCount,
  setDisagreeCount,
  setCommentsList,
}) {
  const currentPath = usePathname();
  const [showError, setShowError] = useState(false);

  async function agreeToggle(params) {
    console.log(
      `agreeToggle called, current agreement status: ${currentAgreementStatus}`
    );
    setShowError("");
    if (currentAgreementStatus == 0) {
      const { success } = await updateAgreementStatus(id, 1, currentPath);
      console.log(`updateAgreementStatus success: ${success}`);
      if (success) {
        setAgreeCount((count) => (count += 1));
        setAgreeDisagreeStatus(1);
        setCommentsList((prevComments) =>
          prevComments.map((comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: true }
              : comment
          )
        );
        setShowError("");
      } else {
        setShowError("An Error Occurred. Unable to Update Status.");
        console.error("unable to update agreement status");
      }
    } else if (currentAgreementStatus == -1) {
      const { success } = await updateAgreementStatus(id, 1, currentPath);
      console.log(`updateAgreementStatus success: ${success}`);
      if (success) {
        setAgreeCount((count) => (count += 1));
        setDisagreeCount((count) => (count -= 1));
        setAgreeDisagreeStatus(1);
        setCommentsList((prevComments) =>
          prevComments.map((comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: true }
              : comment
          )
        );
        setShowError("");
      } else {
        setShowError("An Error Occurred. Unable to Update Status.");
        console.error("unable to update agreement status");
      }
    } else {
      const { success } = await updateAgreementStatus(id, 0, currentPath);
      console.log(`updateAgreementStatus success: ${success}`);
      if (success) {
        setAgreeCount((count) => (count -= 1));
        setAgreeDisagreeStatus(0);
        setCommentsList((prevComments) =>
          prevComments.map((comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: null }
              : comment
          )
        );
        setShowError("");
      } else {
        setShowError("An Error Occurred. Unable to Update Status.");
        console.error("unable to update agreement status");
      }
    }
  }

  async function disagreeToggle(params) {
    console.log(
      `disagreeToggle called, current agreement status: ${currentAgreementStatus}`
    );
    setShowError("");
    if (currentAgreementStatus == 0) {
      const { success } = await updateAgreementStatus(id, -1, currentPath);
      console.log(`updateAgreementStatus success: ${success}`);
      if (success) {
        setDisagreeCount((count) => (count += 1));
        setAgreeDisagreeStatus(-1);
        setCommentsList((prevComments) =>
          prevComments.map((comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: false }
              : comment
          )
        );
        setShowError("");
      } else {
        setShowError("An Error Occurred. Unable to Update Status.");
        console.error("unable to update agreement status");
      }
    } else if (currentAgreementStatus == 1) {
      const { success } = await updateAgreementStatus(id, -1, currentPath);
      console.log(`updateAgreementStatus success: ${success}`);

      if (success) {
        setDisagreeCount((count) => (count += 1));
        setAgreeCount((count) => (count -= 1));
        setAgreeDisagreeStatus(-1);
        setCommentsList((prevComments) =>
          prevComments.map((comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: false }
              : comment
          )
        );
        setShowError("");
      } else {
        setShowError("An Error Occurred. Unable to Update Status.");
        console.error("unable to update agreement status");
      }
    } else {
      const { success } = await updateAgreementStatus(id, 0, currentPath);
      console.log(`updateAgreementStatus success: ${success}`);
      if (success) {
        setDisagreeCount((count) => (count -= 1));
        setAgreeDisagreeStatus(0);
        setCommentsList((prevComments) =>
          prevComments.map((comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: null }
              : comment
          )
        );
        setShowError("");
      } else {
        setShowError("An Error Occurred. Unable to Update Status.");
        console.error("unable to update agreement status");
      }
    }
  }

  return (
    <>
      {showError && showError.length > 0 && <ErrorPopUP message={showError} />}
      <div className={styles.agreeDisagreeSection}>
        <div
          className={`${styles.disagree} ${courierPrime.className} ${
            currentAgreementStatus === -1 ? styles.active : ""
          }`}
          onClick={disagreeToggle}
        >
          Disagree
        </div>
        <div className={styles.separator}>~~ 🧐🤔 ~~</div>
        <div
          className={`${styles.agree} ${courierPrime.className} ${
            currentAgreementStatus === 1 ? styles.active : ""
          }`}
          onClick={agreeToggle}
        >
          Agree
        </div>
      </div>
    </>
  );
}
