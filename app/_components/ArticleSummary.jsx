import styles from "@/app/_styles/ArticleSummary.module.css";
import comment from "@/app/_assets/comments.svg";
import Image from "next/image";
import courierPrime from "./CourierPrime";
import { useRouter } from "next/navigation"; // if using Next.js for routing
import { useState } from "react";
import { deletePostRequest } from "../actions/postActions";

function extractSnippet(content, length = 200) {
  // Remove <img> tags with base64 encoded image data
  content = content.replace(/<img [^>]*src="data:image[^"]+"[^>]*>/g, "");

  // Remove all HTML tags
  content = content.replace(/<[^>]*>/g, "");

  // Optionally, remove extra spaces or line breaks
  content = content.replace(/\s+/g, " ").trim();

  // Truncate to the specified length and append "..." if necessary
  if (content.length > length) {
    content = content.substring(0, length) + "...";
  }

  return content;
}

function calculateDaysUntilExpiry(expiry) {
  expiry = new Date(expiry);

  const currentDate = new Date();

  // Calculate the difference in milliseconds
  const timeDifference = expiry - currentDate;

  // Convert milliseconds to days
  const daysUntilExpiry = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
  return daysUntilExpiry;
}

function formatDateToHumanReadable(dateString) {
  const date = new Date(dateString);

  // Format the date (e.g., Dec 2nd, 2024)
  const options = { month: "short", day: "numeric", year: "numeric" };
  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);

  // Add suffix to the day (1st, 2nd, 3rd, etc.)
  const day = date.getDate();
  const suffix =
    day === 1 || day === 21 || day === 31
      ? "st"
      : day === 2 || day === 22
      ? "nd"
      : day === 3 || day === 23
      ? "rd"
      : "th";

  // Return the formatted date with the suffix
  return formattedDate.replace(day, `${day}${suffix}`);
}

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
      <div className={styles.articleSummary} onClick={handleArticleClick}>
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
                |
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
                |
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
