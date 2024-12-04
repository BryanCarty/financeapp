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
      commentBody = editText;
      setEditText(null);
    }
  }

  const handleCommentChange = (e) => {
    setEditText(e.target.value);
  };

  async function deleteComment() {
    let success = await removeComment(commentId);
    if (success) {
      setShowDeleteModal(false);
    }
  }

  return (
    <>
      <div className={styles.comment}>
        <div className={`${styles.upperComment} ${courierPrime.className}`}>
          <span className={styles.upperSpan}>
            {created_at} • {author} • {accuracy}
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
                <div onClick={saveComment}>Save</div>
              ) : (
                <div onClick={editComment}>Edit</div>
              )}
              <div
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
