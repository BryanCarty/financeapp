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
}) {
  const [editText, setEditText] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  async function editComment() {
    // What if you try save back to back ?
    setEditText(commentBody);
  }

  //NOte it does not update without a reload
  async function saveComment() {
    let success = await updateComment(commentId, editText);
    if (success) {
      setEditText(null); // Reset the edit text field after saving
      setCommentsList((prevComments) =>
        prevComments.map((comment) =>
          comment.comment_id === commentId
            ? { ...comment, text: editText } // Update the comment's text
            : comment
        )
      );
    }
  }

  const handleCommentChange = (e) => {
    setEditText(e.target.value);
  };

  async function deleteComment() {
    let id = await removeComment(commentId);
    if (id) {
      setShowDeleteModal(false);
      //also need to remove the comment, iterate over and remove comment with id
      setCommentsList((prevComments) =>
        prevComments.filter((comment) => comment.comment_id !== id)
      );
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
            value={editText} // Bind the textarea value to the state
            onChange={handleCommentChange}
          ></textarea>
        ) : (
          <div className={styles.commentBody}>{commentBody}</div>
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
