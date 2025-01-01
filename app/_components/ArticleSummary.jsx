"use client";
import styles from "@/app/_styles/ArticleSummary.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useRouter } from "next/navigation"; // if using Next.js for routing
import { useState } from "react";
import { deletePostRequest } from "../actions/postActions";
import {
  extractSnippet,
  calculateDaysUntilExpiry,
  formatDateToHumanReadable,
} from "../client_utils/utils";

export default function ArticleSummary({
  articleId,
  ticker,
  comparison,
  price,
  expiry,
  postDate,
  username,
  accuracy,
  content,
  agreeCount,
  disagreeCount,
  priceStatus,
  commentCount,
  setEditPostData,
  result,
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handler for clicking on the article summary
  const handleArticleClick = () => {
    // Redirect to the article page
    router.push(`/articles/${articleId}`);
  };

  // Handler for clicking on the comment icon
  const handleCommentClick = () => {
    // Redirect to the comment section of the article page
    router.push(`/articles/${articleId}#comments`);
  };

  let glow = null;
  const now = new Date();
  let finalResult = null;

  // Compare the two dates
  if (now > expiry) {
    glow = result ? styles.greenGlow : styles.redGlow;
    finalResult = result ? "ACCURATE FORECAST" : "MISSED PROJECTION";
  }

  const humanReadableExpiry = formatDateToHumanReadable(expiry);
  const humanReadablePostDate = formatDateToHumanReadable(postDate);
  const daysUntilExpiry = calculateDaysUntilExpiry(expiry);
  const snippet = extractSnippet(content);

  async function deletePost() {
    const postId = showDeleteModal.articleId;
    const id = await deletePostRequest(postId);
    if (id) {
      setShowDeleteModal(null);
      window.location.reload();
    }
  }
  const percentageDifference = ((priceStatus - price) / price) * 100;
  const formattedPercentageDifference = percentageDifference.toFixed(2); // Ensures 2 decimal places
  let color = null;
  if (now <= expiry) {
    if (comparison == ">") {
      color = formattedPercentageDifference >= 0 ? styles.green : styles.red;
    } else if (comparison == "<") {
      color = formattedPercentageDifference >= 0 ? styles.red : styles.green;
    }
  } else {
    color = result ? styles.green : styles.red;
  }

  function redirectToUserInfo() {
    router.push(`/settings?tab=search&query=${username}`);
  }

  return (
    <>
      <div
        className={`${styles.articleSummary} ${glow}`}
        onClick={handleArticleClick}
        data-article-ticker={ticker}
        data-article-id={articleId}
      >
        <div className={styles.summaryHeading}>
          <div className={`${styles.claim} ${courierPrime.className}`}>
            <span className={styles.claimText}>
              {ticker} {comparison} {price} by {humanReadableExpiry}
            </span>
            <span className={styles.claimExpiry}>({daysUntilExpiry} days)</span>
          </div>
          <div className={`${styles.profile} ${courierPrime.className}`}>
            {humanReadablePostDate} |&nbsp;
            <span
              className={styles.profileUsername}
              onClick={(e) => {
                e.stopPropagation();
                redirectToUserInfo();
              }}
            >
              {username}
            </span>
            ({accuracy})
          </div>
        </div>
        <div className={`${styles.summaryBody} ${courierPrime.className}`}>
          <p className={styles.snippetText}>{snippet}</p>
          <a href="more-content.html" className={styles.seemorebtn}>
            See More
          </a>
        </div>
        <div className={styles.summaryFooter}>
          <div className={`${styles.leftFooter} ${courierPrime.className}`}>
            Agree: {agreeCount} | Disagree: {disagreeCount} | Status:
            <span className={color}>
              {finalResult ||
                `${priceStatus} (${formattedPercentageDifference}%)`}
            </span>
          </div>

          <div
            className={`${styles.rightFooter} ${courierPrime.className}`}
            onClick={(e) => {
              // Prevent the click from bubbling up to the article summary
              e.stopPropagation();
              handleCommentClick();
            }}
          >
            <div className={styles.commentContainer}>
              <Image
                className={`${styles.commentIcon}`}
                src={comment}
                alt="A comments icon"
                priority
                width={35}
                height={35}
              />
              <div className={styles.commentCount}>({commentCount})</div>
            </div>
            {setEditPostData && (
              <>
                <div className={styles.editDelBtnSpace}>|</div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditPostData({
                      ticker,
                      comparison,
                      price,
                      expiry,
                      content,
                      articleId,
                    });
                  }}
                >
                  Edit
                </div>
                <div className={styles.editDelBtnSpace}>|</div>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteModal({ ticker, articleId });
                  }}
                >
                  Delete
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete {showDeleteModal.ticker} Post</h3>

            <div className={styles.modalActions}>
              <button
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={() => {
                  setShowDeleteModal(null);
                }}
              >
                Cancel
              </button>
              <button
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={deletePost}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
