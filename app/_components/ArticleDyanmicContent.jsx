"use client";
import ArticleHeader from "@/app/_components/ArticleHeader";
import styles from "@/app/_styles/Article.module.css";
import ArticleBody from "@/app/_components/ArticleBody";
import AgreeDisagreeSection from "@/app/_components/AgreeDisagreeSection";
import Comment from "@/app/_components/Comment";
import { useState, useEffect } from "react";
import { submitComment } from "../_actions/comments";
import { formatDateToHumanReadable } from "../_client_utils/utils";
import courierPrime from "./CourierPrime";
import PostModal from "./PostModal";
import { useRouter } from "next/navigation";
import { deletePostRequest } from "../_actions/postActions";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import barChart from "@/app/_assets/barchart.png";
import Image from "next/image";
import ArticleTitle from "./ArticleTitle";
import ErrorPopUP from "./ErrorPopUp";

export default function ArticleDynamicContent({
  id,
  ticker,
  comparison,
  price,
  expiry,
  rawExpiry,
  daysUntilExpiry,
  content,
  status,
  comments,
  post_date,
  username,
  accuracy,
  total_agreements,
  total_disagreements,
  user_agreement_status,
  current_user_id,
  result,
  isPostOwner,
  title,
  isTouchScreenDevice,
}) {
  const router = useRouter();
  const currentPath = usePathname();

  const [errorMessage, setErrorMessage] = useState(false);

  const [agreeDisagreeStatus, setAgreeDisagreeStatus] = useState(
    user_agreement_status
  );
  const [agreeCount, setAgreeCount] = useState(
    parseInt(total_agreements, 10) || 0
  );
  const [disagreeCount, setDisagreeCount] = useState(
    parseInt(total_disagreements, 10) || 0
  );

  const [commentsList, setCommentsList] = useState(comments);
  const [editPostModal, setEditPostModal] = useState(false);
  const [deletePostModal, setDeletePostModal] = useState(false);

  const [newComment, setNewComment] = useState("");

  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSignUp = () => {
    router.push(`/signup?redirect=${currentPath}`);
  };

  const handleCloseCTA = () => {
    setShowCTA(false);
  };

  const handleSubmitComment = async () => {
    if (newComment.trim() === "") {
      return;
    }

    try {
      setErrorMessage("");
      const savedComment = await submitComment(id, newComment, currentPath);
      console.log(`submitComment success: ${savedComment}`);

      if (savedComment) {
        let alteredComment = {
          created_at: formatDateToHumanReadable(savedComment.created_at, true),
          username: savedComment.username,
          accuracy: savedComment.accuracy,
          text: savedComment.text,
          post_opinion: savedComment.agreement_status,
          comment_id: savedComment.id,
          is_owner: true,
        };

        setCommentsList((prevComments) => [alteredComment, ...prevComments]);
        setNewComment("");
        setErrorMessage("");
      } else {
        console.error("Failed to save comment");
        setErrorMessage("Failed to create comment.");
      }
    } catch (error) {
      setErrorMessage("Failed to create comment.");
    }
  };

  async function deletePost() {
    const postId = id;
    setErrorMessage("");
    const success = await deletePostRequest(postId);
    console.log(`deletePostRequest success: ${success}`);
    if (success) {
      setDeletePostModal(null);
      setErrorMessage("");
      router.push("/");
    } else {
      setErrorMessage("Failed to delete post");
      console.error(`deletePostRequest request failed`);
    }
  }

  const commentsRef = useRef(null);

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {
    if (current_user_id === null) {
      const interval = setInterval(() => {
        setShowCTA(true);
      }, 25000);

      return () => clearInterval(interval);
    }
  }, [current_user_id]);

  return (
    <>
      {errorMessage && <ErrorPopUP message={errorMessage} />}
      {showCTA && current_user_id === null && (
        <div className={`${styles.ctaWrapper} ${courierPrime.className}`}>
          <div className={styles.ctaContent}>
            <button
              className={styles.closeButton}
              onClick={handleCloseCTA}
              aria-label="Close CTA"
            >
              &times;
            </button>
            <div className={styles.popupContainer}>
              <h3>Why should you sign up?</h3>
              <p>
                Sign up to activate the Consensus Search tab, where you can view
                the <b>{ticker}</b> stock price outlook for <b>{expiry}</b>,
                based on <b>ALL</b> user estimates!
              </p>
              <Image
                src={barChart}
                className={styles.barChart}
                alt="CTA Image"
              />
              <button
                aria-label="Sign up button"
                className={`${styles.ctaButton} ${courierPrime.className}`}
                onClick={handleSignUp}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
      {deletePostModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete {ticker} Post</h3>
            <p
              className={`${courierPrime.className} ${styles.deleteModalWarning}`}
            >
              This will negatively affect your accuracy unless the post has
              expired being true to its claim.
            </p>
            <div className={styles.modalActions}>
              <button
                aria-label="Cancel button"
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={() => {
                  setDeletePostModal(null);
                }}
              >
                Cancel
              </button>
              <button
                aria-label="Confirm button"
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={deletePost}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {editPostModal && (
        <PostModal
          isOpen={editPostModal}
          onClose={() => {
            setEditPostModal(null);
          }}
          data={{
            ticker,
            comparison,
            price,
            expiry,
            content,
            articleId: id,
          }}
        />
      )}

      <div className={styles.article}>
        <ArticleHeader
          ticker={ticker}
          comparison={comparison}
          price={price}
          expiry={expiry}
          rawExpiry={rawExpiry}
          agreeCount={agreeCount}
          disagreeCount={disagreeCount}
          status={status}
          author={username}
          postDate={post_date}
          authorAccuracy={accuracy}
          commentCount={commentsList.length}
          daysUntilExpiry={daysUntilExpiry}
          result={result}
          setEditPost={isPostOwner ? setEditPostModal : null}
          setDeletePostModal={isPostOwner ? setDeletePostModal : null}
          scrollToComments={scrollToComments}
          isTouchScreenDevice={isTouchScreenDevice}
        />

        <ArticleTitle text={title} />
        <ArticleBody body={content} />

        <AgreeDisagreeSection
          id={id}
          current_user_id={current_user_id}
          currentAgreementStatus={agreeDisagreeStatus}
          setAgreeDisagreeStatus={setAgreeDisagreeStatus}
          setAgreeCount={setAgreeCount}
          setDisagreeCount={setDisagreeCount}
          setCommentsList={setCommentsList}
        />
        <div className={styles.commentSection}>
          <textarea
            className={styles.commentInput}
            placeholder="Write your comment here..."
            rows="6"
            aria-label="Comment Input"
            value={newComment}
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                handleCommentChange(e);
              }
            }}
          ></textarea>
          <button
            aria-label="submit button"
            className={`${styles.commentButton} ${courierPrime.className}`}
            type="button"
            onClick={handleSubmitComment}
          >
            Submit Comment
          </button>
          <div id="comments" className={styles.hr} ref={commentsRef}></div>
          <div className={styles.commentContainer}>
            {commentsList.map((comment) => (
              <Comment
                created_at={comment.created_at}
                author={comment.username}
                accuracy={parseFloat(comment.accuracy).toFixed(2) + "%"}
                commentBody={comment.text}
                opinion={
                  comment.post_opinion === null
                    ? "No Opinion"
                    : comment.post_opinion
                    ? "Agree"
                    : "Disagree"
                }
                commentId={comment.comment_id}
                isOwner={comment.is_owner}
                setCommentsList={setCommentsList}
                setErrorMessage={setErrorMessage}
                key={comment.comment_id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
