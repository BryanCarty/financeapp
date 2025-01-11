"use client";
import styles from "@/app/_styles/Comment.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";
import { updateComment } from "../actions/comments";
import { removeComment } from "../actions/comments";

export default function Comment({
  created_at,
  author,
  accuracy,
  commentBody,
  opinion,
  commentId,
  isOwner,
  setCommentsList,
  setErrorMessage,
}) {
  const [editText, setEditText] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  async function editComment() {
    setEditText(commentBody);
  }

  async function saveComment() {
    setErrorMessage("");
    let success = await updateComment(commentId, editText);
    console.log(`updateComment success: ${success}`);
    if (success) {
      setEditText(null);
      setCommentsList((prevComments) =>
        prevComments.map((comment) =>
          comment.comment_id === commentId
            ? { ...comment, text: editText }
            : comment
        )
      );
      setErrorMessage("");
    } else {
      console.error(`unable to update comment`);
      setErrorMessage("Unable to save comment");
    }
  }

  const handleCommentChange = (e) => {
    setEditText(e.target.value);
  };

  async function deleteComment() {
    setErrorMessage("");
    let id = await removeComment(commentId);
    console.log(`removeComment success: ${success}`);
    if (id) {
      setShowDeleteModal(false);
      setCommentsList((prevComments) =>
        prevComments.filter((comment) => comment.comment_id !== id)
      );
      setErrorMessage("");
    } else {
      setErrorMessage("Unable to delete comment");
      console.error(`Unable to delete comment`);
    }
  }

  return (
    <>
      <div className={styles.comment}>
        <div className={`${styles.upperComment} ${courierPrime.className}`}>
          <span className={styles.upperSpan}>
            {created_at} | {author} | {accuracy}
          </span>
        </div>

        {editText ? (
          <textarea
            className={styles.commentInput}
            placeholder="Write your comment here..."
            rows="6"
            aria-label="Comment Input"
            value={editText}
            onChange={handleCommentChange}
          ></textarea>
        ) : (
          <div className={`${styles.commentBody} ${courierPrime.className}`}>
            {commentBody}
          </div>
        )}
        <div className={`${styles.lowerComment} ${courierPrime.className}`}>
          <span className={styles.lowerSpan}>Opinion: {opinion}</span>
          {isOwner && (
            <>
              {editText ? (
                <div onClick={saveComment} className={styles.btn}>
                  Save
                </div>
              ) : (
                <div onClick={editComment} className={styles.btn}>
                  Edit
                </div>
              )}
              <div className={styles.editDelBtnSpace}>|</div>
              <div
                className={styles.delBtn}
                onClick={() => {
                  setShowDeleteModal(true);
                }}
              >
                Delete
              </div>
            </>
          )}
        </div>
      </div>
      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Delete Comment</h3>

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
                onClick={deleteComment}
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
