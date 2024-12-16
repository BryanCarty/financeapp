"use client";
import styles from "@/app/_styles/Article.module.css";
import courierPrime from "./CourierPrime";

import updateAgreementStatus from "../actions/agree";

export default function AgreeDisagreeSection({
  id,
  current_user_id,
  currentAgreementStatus,
  setAgreeDisagreeStatus,
  setAgreeCount,
  setDisagreeCount,
  setCommentsList,
}) {
  async function agreeToggle(params) {
    if (currentAgreementStatus == 0) {
      const { success } = await updateAgreementStatus(id, 1);
      setAgreeCount((count) => (count += 1));
      setAgreeDisagreeStatus(1);
      setCommentsList((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: true } // Update the opinion field
              : comment // Leave other comments unchanged
        )
      );
    } else if (currentAgreementStatus == -1) {
      const { success } = await updateAgreementStatus(id, 1);
      setAgreeCount((count) => (count += 1));
      setDisagreeCount((count) => (count -= 1));
      setAgreeDisagreeStatus(1);
      setCommentsList((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: true } // Update the opinion field
              : comment // Leave other comments unchanged
        )
      );
    } else {
      //currentAgreementStatus == 1
      const { success } = await updateAgreementStatus(id, 0);
      setAgreeCount((count) => (count -= 1));
      setAgreeDisagreeStatus(0);
      setCommentsList((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: null } // Update the opinion field
              : comment // Leave other comments unchanged
        )
      );
    }
  }

  async function disagreeToggle(params) {
    if (currentAgreementStatus == 0) {
      const { success } = await updateAgreementStatus(id, -1);
      setDisagreeCount((count) => (count += 1));
      setAgreeDisagreeStatus(-1);
      setCommentsList((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: false } // Update the opinion field
              : comment // Leave other comments unchanged
        )
      );
    } else if (currentAgreementStatus == 1) {
      const { success } = await updateAgreementStatus(id, -1);
      setDisagreeCount((count) => (count += 1));
      setAgreeCount((count) => (count -= 1));
      setAgreeDisagreeStatus(-1);
      setCommentsList((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: false } // Update the opinion field
              : comment // Leave other comments unchanged
        )
      );
    } else {
      //currentAgreementStatus == -1
      const { success } = await updateAgreementStatus(id, 0);
      setDisagreeCount((count) => (count -= 1));
      setAgreeDisagreeStatus(0);
      setCommentsList((prevComments) =>
        prevComments.map(
          (comment) =>
            comment.user_id === current_user_id
              ? { ...comment, post_opinion: null } // Update the opinion field
              : comment // Leave other comments unchanged
        )
      );
    }
  }

  return (
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
  );
}
