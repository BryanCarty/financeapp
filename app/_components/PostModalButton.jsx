"use client";
import { useState } from "react";
import styles from "@/app/_styles/StandardPageHeader.module.css";
import PostModal from "./PostModal";
import courierPrime from "./CourierPrime";

export default function PostModalButton({ id }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const mobileStyle =
    id == "mobile" ? styles.postButtonMobile : styles.postButtonStandard;
  return (
    <>
      <button
        onClick={openModal}
        className={`${styles.postButton} ${courierPrime.className} ${mobileStyle}`}
      >
        Post
      </button>
      {isModalOpen && (
        <PostModal isOpen={isModalOpen} onClose={closeModal} data={null} />
      )}
    </>
  );
}
