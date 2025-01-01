"use client";
import { useState } from "react";
import styles from "@/app/_styles/StandardPageHeader.module.css";
import PostModal from "./PostModal";
import courierPrime from "./CourierPrime";

export default function PostModalButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  return (
    <>
      <button
        onClick={openModal}
        className={`${styles.postButton} ${courierPrime.className} `}
      >
        Post
      </button>
      {isModalOpen && (
        <PostModal isOpen={isModalOpen} onClose={closeModal} data={null} />
      )}
    </>
  );
}
