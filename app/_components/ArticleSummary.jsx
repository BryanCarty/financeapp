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
  const humanReadableExpiry = formatDateToHumanReadable(expiry);
  const humanReadablePostDate = formatDateToHumanReadable(postDate);
  const daysUntilExpiry = calculateDaysUntilExpiry(expiry);
  const snippet = extractSnippet(content);

  async function deletePost() {
    const postId = showDeleteModal.articleId;
    const id = await deletePostRequest(postId);
    if (id) {
      setShowDeleteModal(null);
    }
  }

  return (
    <>
      <div
        className={styles.articleSummary}
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
            {humanReadablePostDate} | {username} ({accuracy})
          </div>
        </div>
        <div className={`${styles.summaryBody} ${courierPrime.className}`}>
          <p>{snippet}</p>
          <a href="more-content.html" className={styles.seemorebtn}>
            See More
          </a>
        </div>
        <div className={styles.summaryFooter}>
          <div className={`${styles.leftFooter} ${courierPrime.className}`}>
            Agree: {agreeCount} | Disagree: {disagreeCount} | Status:
            {priceStatus}
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
