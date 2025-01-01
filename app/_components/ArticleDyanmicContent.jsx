"use client";
import ArticleHeader from "@/app/_components/ArticleHeader";
import styles from "@/app/_styles/Article.module.css";
import ArticleBody from "@/app/_components/ArticleBody";
import AgreeDisagreeSection from "@/app/_components/AgreeDisagreeSection";
import Comment from "@/app/_components/Comment";
import { useState } from "react";
import { submitComment } from "../actions/comments";
import { formatDateToHumanReadable } from "../client_utils/utils";
import courierPrime from "./CourierPrime";
import PostModal from "./PostModal";
import { useRouter } from "next/navigation";
import { deletePostRequest } from "../actions/postActions";
import { useRef } from "react";

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
}) {
  const router = useRouter();

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

  // State to store the new comment input by the user
  const [newComment, setNewComment] = useState("");

  // Function to handle input change in the textarea
  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  // Function to handle comment submission
  const handleSubmitComment = async () => {
    if (newComment.trim() === "") {
      return; // Don't submit if the comment is empty
    }

    try {
      const savedComment = await submitComment(id, newComment);

      // Check if the response is savedCommentful

      if (savedComment) {
        // Update the comments list with the new comment

        let alteredComment = {
          created_at: formatDateToHumanReadable(savedComment.created_at, true),
          username: savedComment.username,
          accuracy: savedComment.accuracy,
          text: savedComment.text,
          post_opinion: savedComment.agreement_status,
          comment_id: savedComment.id,
          is_owner: true,
        };

        setCommentsList((prevComments) => [
          alteredComment,
          ...prevComments,
          // Add the newly added comment to the top of the list
        ]);
        setNewComment(""); // Clear the input field
      } else {
        console.log("Failed to save comment");
      }
    } catch (error) {
      console.log("Error submitting comment:" + error);
    }
  };

  async function deletePost() {
    const postId = id;
    const success = await deletePostRequest(postId);
    if (success) {
      setDeletePostModal(null);
      router.push("/");
    }
  }

  const commentsRef = useRef(null);

  const scrollToComments = () => {
    if (commentsRef.current) {
      commentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {deletePostModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete {ticker} Post</h3>

            <div className={styles.modalActions}>
              <button
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={() => {
                  setDeletePostModal(null);
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
        />
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
            value={newComment} // Bind the textarea value to the state
            onChange={(e) => {
              if (e.target.value.length <= 1000) {
                handleCommentChange(e); // Update the state only if the input length is <= 1000
              }
            }}
          ></textarea>
          <button
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
                key={comment.comment_id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
