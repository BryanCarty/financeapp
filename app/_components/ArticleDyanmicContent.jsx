"use client";
import ArticleHeader from "@/app/_components/ArticleHeader";
import styles from "@/app/_styles/Article.module.css";
import ArticleBody from "@/app/_components/ArticleBody";
import AgreeDisagreeSection from "@/app/_components/AgreeDisagreeSection";
import Comment from "@/app/_components/Comment";
import { useState } from "react";
import { submitComment } from "../actions/comments";
import { formatDateToHumanReadable } from "../client_utils/utils";

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
}) {
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
          created_at: formatDateToHumanReadable(savedComment.created_at),
          username: savedComment.username,
          accuracy: savedComment.accuracy,
          text: savedComment.text,
          post_opinion: savedComment.agreement_status,
          comment_id: savedComment.id,
        };

        setCommentsList((prevComments) => [
          ...prevComments,
          alteredComment, // Add the newly added comment to the list
        ]);
        setNewComment(""); // Clear the input field
      } else {
        console.log("Failed to save comment");
      }
    } catch (error) {
      console.log("Error submitting comment:" + error);
    }
  };

  return (
    <>
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
            onChange={handleCommentChange}
          ></textarea>
          <button
            className={styles.submitButton}
            type="button"
            onClick={handleSubmitComment}
          >
            Submit Comment
          </button>
          <div id="comments" className={styles.hr}></div>
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
                key={comment.comment_id}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
