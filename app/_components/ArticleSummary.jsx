"use client";
import styles from "@/app/_styles/ArticleSummary.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useRouter } from "next/navigation"; // if using Next.js for routing
import { useState } from "react";
import { deletePostRequest } from "../_actions/postActions";
import {
  extractSnippet,
  calculateDaysUntilExpiry,
  formatDateToHumanReadable,
  formatDateToUrl,
} from "../_client_utils/utils";
const { DateTime } = require("luxon");

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
  setLoading,
}) {
  const router = useRouter();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tooltipVisible, setToolTipVisible] = useState(false);

  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  let comparisonText = null;
  if (comparison == ">") {
    comparisonText = "greater-than";
  } else if (comparison == "<") {
    comparisonText = "less-than";
  }

  function toggleTooltip(e) {
    e.stopPropagation();
    setToolTipVisible((visible) => !visible);
  }

  const handleArticleClick = () => {
    setLoading(true);
    const redirectStr = `/articles/why-${ticker.toLowerCase()}-stock-will-be-${comparisonText}-${parseFloat(
      price
    ).toFixed(2)}-by-market-close-on-the-${formatDateToUrl(
      expiry
    )}-${articleId}`;
    router.push(redirectStr);
  };

  const handleCommentClick = () => {
    router.push(`/articles/${articleId}#comments`);
  };

  let glow = null;
  let finalResult = null;

  const newYorkTimeNow = DateTime.now().setZone("America/New_York");
  const expiryTimeGMT = DateTime.fromJSDate(expiry);
  const expiryTimeNY = expiryTimeGMT.setZone("America/New_York", {
    keepLocalTime: true,
  });

  if (newYorkTimeNow > expiryTimeNY && result !== null) {
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
    console.log(`deletePostRequest success: ${postId}`);
    if (id) {
      setShowDeleteModal(null);
      window.location.reload();
    } else {
      console.error(`deletePostRequest failed`);
      router.push(
        `/?tab=latest&error=${encodeURIComponent("Failed to delete post")}`
      );
    }
  }
  const percentageDifference = ((priceStatus?.price - price) / price) * 100;
  const formattedPercentageDifference = percentageDifference.toFixed(2);
  let color = null;
  if (newYorkTimeNow <= expiryTimeNY || result === null) {
    if (comparison == ">") {
      color = formattedPercentageDifference >= 0 ? styles.green : styles.red;
    } else if (comparison == "<") {
      color = formattedPercentageDifference >= 0 ? styles.red : styles.green;
    }
  } else {
    color = result ? styles.green : styles.red;
  }

  function redirectToUserInfo() {
    router.push(`/profile?tab=search&query=${username}`);
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
            <span className={styles.claimExpiry}>
              {" "}
              ({daysUntilExpiry} days)
            </span>
          </div>
          <div
            className={`${styles.profile} ${courierPrime.className}`}
            onClick={(e) => {
              e.stopPropagation();
              redirectToUserInfo();
            }}
          >
            {humanReadablePostDate} |&nbsp;
            <span className={styles.profileUsername}>
              {username} ({accuracy})
            </span>
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
                `${priceStatus?.price} (${formattedPercentageDifference}%)`}
            </span>
            {result === null && (
              <span className={`${styles.tooltip} ${courierPrime.className}`}>
                <span className={styles.tooltipIcon} onClick={toggleTooltip}>
                  i
                </span>
                <span
                  className={`${styles.tooltipText} ${
                    isTouchDevice &&
                    (tooltipVisible
                      ? styles.toolTipTextVisible
                      : styles.toolTipTextInvisible)
                  }`}
                >
                  Price is at least 15 minutes delayed. The displayed price
                  reflects the price as of{" "}
                  {priceStatus.last_updated.toLocaleString()}
                </span>
              </span>
            )}
          </div>

          <div
            className={`${styles.rightFooter} ${courierPrime.className}`}
            onClick={(e) => {
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
              <div className={styles.editDeleteOption}>
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
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete {showDeleteModal.ticker} Post</h3>
            <p
              className={`${courierPrime.className} ${styles.deleteModalWarning}`}
            >
              This will negatively affect your accuracy unless the post has
              expired being true to its claim.
            </p>
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
