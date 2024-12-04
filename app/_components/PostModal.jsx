"use client";
// Modal Component
import styles from "@/app/_styles/PostModal.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";
import "react-quill-new/dist/quill.snow.css";
import ReactQuill from "react-quill-new";
import submitPost from "../actions/postActions";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ align: ["right", "center", "justify"] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
  ],
};

export default function PostModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [value, setValue] = useState("");
  const [formData, setFormData] = useState({
    ticker: "",
    condition: "greater than", // default value
    price: "",
    futureDate: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.ticker || !formData.price || !formData.futureDate || !value) {
      setError("All fields are required");
    }

    setIsSubmitting(true);

    try {
      // Sending data to the server action
      const postId = await submitPost({
        ...formData,
        reasoning: value, // Add the reasoning content
      });
      setError("");
      onClose(); // Close the modal after successful submission
    } catch (error) {
      console.error("Error submitting post:", error);
      setError("An unexpected error occurred!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.overlayStyle} ${courierPrime.className}`}>
      <div className={styles.modalStyle}>
        <div className={styles.modalHeading}>
          <span className={` ${styles.typedSiteName}`}>Create a Post</span>
          <div className={styles.closeButton} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.claimSection}>
            <input
              className={courierPrime.className}
              type="text"
              name="ticker"
              value={formData.ticker}
              onChange={handleInputChange}
              placeholder="Ticker e.g. AAPL"
              maxLength={8}
            />
            will be
            <select
              className={courierPrime.className}
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
            >
              <option value="greater than">greater than</option>
              <option value="less than">less than</option>
            </select>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="price e.g. 234.20"
              step={0.01}
              className={courierPrime.className}
            />
            by market close on the
            <input
              type="date"
              name="futureDate"
              value={formData.futureDate}
              onChange={handleInputChange}
              className={courierPrime.className}
              min={
                new Date(new Date().setDate(new Date().getDate() + 1))
                  .toISOString()
                  .split("T")[0]
              } // Set minimum to tomorrow
            />
          </div>
          <div className={styles.because}>because ...</div>

          <ReactQuill
            modules={modules}
            theme="snow"
            value={value}
            onChange={setValue}
            className={styles.textareaStyle}
            placeholder="What's your reasoning..............."
          />
        </div>
        <div className={styles.buttonContainerStyle}>
          <button
            onClick={onClose}
            className={`${styles.buttonStyle} ${courierPrime.className}`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            className={`${styles.buttonStyle} ${courierPrime.className}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
