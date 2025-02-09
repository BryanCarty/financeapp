"use client";
import dynamic from "next/dynamic";

import styles from "@/app/_styles/PostModal.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";
import "react-quill-new/dist/quill.snow.css";
//import ReactQuill from "react-quill-new";
const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });
import { submitPost, updatePost } from "../_actions/postActions";

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ["bold", "italic", "underline", "strike", "blockquote"],
    [{ align: ["", "right", "center", "justify"] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["link", "image"],
  ],
};

const formats = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "list",
  "bullet",
  "indent",
  "link",
  "image",
  "color",
  "clean",
  "align",
];

export default function PostModal({ isOpen, onClose, data }) {
  if (!isOpen) return null;

  let isUpdate = false;
  if (data) {
    isUpdate = true;
  }

  let {
    ticker = "",
    comparison = "",
    price = "",
    expiry = "",
    content = "",
    articleId = "",
  } = data || {};

  const futureDate =
    expiry instanceof Date
      ? expiry.toISOString().split("T")[0]
      : expiry
      ? new Date(expiry).toISOString().split("T")[0]
      : "";
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [value, setValue] = useState(content || "");
  const [formData, setFormData] = useState({
    ticker: ticker || "",
    condition: comparison
      ? comparison == ">"
        ? "greater than"
        : "less than"
      : "greater than", // default value
    price: price || "",
    futureDate: futureDate,
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
      setError("");
      let success, message;
      if (isUpdate) {
        ({ success, message } = await updatePost({
          ...formData,
          reasoning: value, // Add the reasoning content
          articleId: articleId,
        }));
        console.log(`update post success: ${success}, message: ${message}`);
      } else {
        ({ success, message } = await submitPost({
          ...formData,
          reasoning: value, // Add the reasoning content
        }));
        console.log(`submit post success: ${success}, message: ${message}`);
      }
      if (!success && message) {
        setError(message);
      } else {
        setError("");
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error(`Error submitting/updating post: ${error}`);
      setError("An Unexpected Error Occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`${styles.overlayStyle} ${courierPrime.className}`}>
      <div className={styles.modalStyle}>
        <div className={styles.modalHeading}>
          <span className={` ${styles.typedSiteName}`}>
            {isUpdate ? "Update a Post" : "Create a Post"}
          </span>
          <div className={styles.closeButton} onClick={onClose}>
            &times;
          </div>
        </div>
        <div className={styles.modalBody}>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.claimSection}>
            <div className={styles.rowOne}>
              <input
                className={`${courierPrime.className} ${styles.tickerField}`}
                type="text"
                name="ticker"
                value={formData.ticker}
                onChange={handleInputChange}
                placeholder="Ticker"
                maxLength={8}
                disabled={isUpdate}
              />
              will be
              <select
                className={`${courierPrime.className} ${styles.conditionField}`}
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                disabled={isUpdate}
              >
                <option value="greater than">above</option>
                <option value="less than">below</option>
              </select>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="price"
                step={0.01}
                className={`${courierPrime.className} ${styles.priceField}`}
                disabled={isUpdate}
              />
            </div>
            <div className={styles.rowTwo}>
              {" "}
              by market close on the
              <input
                type="date"
                name="futureDate"
                value={formData.futureDate}
                onChange={handleInputChange}
                className={`${courierPrime.className} ${styles.dateField}`}
                min={
                  new Date(new Date().setDate(new Date().getDate() + 1))
                    .toISOString()
                    .split("T")[0]
                } // Set minimum to tomorrow
                disabled={isUpdate}
              />
            </div>
          </div>

          <div className={styles.because}>because ...</div>

          <ReactQuill
            modules={modules}
            formats={formats}
            theme="snow"
            value={value}
            onChange={setValue}
            className={styles.textareaStyle}
            placeholder="What's your reasoning..............."
          />
        </div>
        <div className={styles.buttonContainerStyle}>
          <button
            aria-label="cancel button"
            onClick={onClose}
            className={`${styles.buttonStyle} ${courierPrime.className}`}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            aria-label="post button"
            className={`${styles.buttonStyle} ${courierPrime.className}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isUpdate
              ? isSubmitting
                ? "Updating..."
                : "Update"
              : isSubmitting
              ? "Posting..."
              : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
}
