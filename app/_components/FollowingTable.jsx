"use client";

import styles from "@/app/_styles/FollowingTable.module.css";
import courierPrime from "./CourierPrime";
import { useState, useEffect } from "react";
import loadTable from "../_actions/tables";
import { followUser, unfollowUser } from "../_actions/following";
import LoadingSquiggle from "./LoadingSquiggle";
import { useRouter } from "next/navigation";

export default function FollowingTable({ type, searchQuery, isLoggedIn }) {
  const [selectedFollowProfile, setSelectedFollowProfile] = useState(null);
  const [selectedUnfollowProfile, setSelectedUnfollowProfile] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  const followUserClient = async (selectedFollowProfile, emailAlerts) => {
    try {
      const { success, message } = await followUser(
        selectedFollowProfile,
        emailAlerts
      );
      console.log(`followUser success: ${success}, ${message}`);
      if (message == "Follow Inelligibillity") {
        setLoadingError(
          "Your account type cannot follow users 😔 Consider upgrading your account. 🚀"
        );
        return;
      }
      if (!success) throw new Error("Failed to follow user");
      setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.user_id === selectedFollowProfile
            ? { ...profile, is_following: true }
            : profile
        )
      );
    } catch (error) {
      setLoadingError("An Unexpected Error Occurred (Follow)");
    }
  };

  const unfollowUserClient = async (selectedUnfollowProfile) => {
    try {
      const success = await unfollowUser(selectedUnfollowProfile); // Your backend API route
      console.log(`unfollowUser success: ${success}`);

      if (!success) throw new Error("Failed to unfollow user");
      // Update the local state optimistically
      setProfiles((prevProfiles) =>
        prevProfiles.map((profile) =>
          profile.user_id === selectedUnfollowProfile
            ? { ...profile, is_following: false }
            : profile
        )
      );
    } catch (error) {
      setLoadingError("An Unexpected Error Occurred (UnFollow)");
      console.error(`Error attempting to unfollow user: ${error}`);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const { tableData, userId } = await loadTable(type, searchQuery);
        console.log(`loadTable success: ${tableData != false}`);
        if (!tableData || tableData.length === 0) {
          let errorText = "Hmm.. There appears to be no data 😞";
          switch (type) {
            case "se":
              errorText =
                "Hmm.. There appears to be no user matching your search 😞";
              break;
            case "fe":
              errorText =
                "Hmm.. looks like you've no followers yet 😞. Try making a post.";
              break;
            case "fi":
              errorText = "Hmm.. Looks like you haven't followed anyone yet 😞";
              break;
          }
          setLoadingError(errorText);
          setLoading(false);
          return;
        }

        setProfiles(tableData);
        setLoggedIn(userId);
        setLoading(false);
      } catch (error) {
        setLoadingError("An Unexpected Error Occurred!");
        setLoading(false);
        console.error(`Error fetching table data: ${error}`);
      }
    };

    fetchProfiles();
  }, [type, searchQuery]);

  const handleFollowClick = (profile) => {
    if (!loggedIn) {
      router.push("/login");
    }
    setSelectedFollowProfile(profile);
  };

  const handleUnfollowClick = (profile) => {
    if (!loggedIn) {
      router.push("/login");
    }
    setSelectedUnfollowProfile(profile);
  };

  const handleConfirmFollow = () => {
    followUserClient(selectedFollowProfile.id, emailAlerts);
    setSelectedFollowProfile(null); // Close the modal
    setEmailAlerts(false); // Reset checkbox
  };

  const handleConfirmUnfollow = () => {
    console.log(`Unfollowed ${selectedUnfollowProfile.name}`);
    unfollowUserClient(selectedUnfollowProfile.id);
    setSelectedUnfollowProfile(null); // Close the modal
  };

  const handleCancel = () => {
    setSelectedFollowProfile(null); // Close the modal
    setSelectedUnfollowProfile(null); // Close the modal
    setEmailAlerts(false); // Reset checkbox
  };

  if (loading) {
    return (
      <div>
        <LoadingSquiggle />
      </div>
    );
  }

  if (loadingError) {
    return (
      <div className={`${courierPrime.className} ${styles.loadingError}`}>
        {loadingError}
      </div>
    );
  }

  if (type == "se" && !searchQuery) return null;
  return (
    <div className={`${styles.tableContainer} ${courierPrime.className}`}>
      <table className={styles.profileTable}>
        <thead>
          <tr>
            <th>Profile</th>
            <th>Accuracy</th>
            <th>Total Posts (Expired)</th>
            <th>Followers</th>
            <th>Connect</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((item, index) => (
            <tr key={item.user_id}>
              <td>{item.profile}</td>
              <td>{item.accuracy}</td>
              <td>{item.totalTrades}</td>
              <td>{item.followers}</td>
              {item.is_following === true ? (
                <td>
                  <button
                    aria-label="unfollow button"
                    className={`${styles.followBtn} ${courierPrime.className}`}
                    onClick={() =>
                      handleUnfollowClick({
                        id: item.user_id,
                        name: item.profile,
                      })
                    }
                  >
                    Unfollow
                  </button>
                </td>
              ) : item.is_following === false ? (
                <td>
                  <button
                    aria-label="follow button"
                    className={`${styles.followBtn} ${courierPrime.className}`}
                    onClick={() =>
                      handleFollowClick({
                        id: item.user_id,
                        name: item.profile,
                      })
                    }
                  >
                    Follow
                  </button>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedFollowProfile && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Follow {selectedFollowProfile.name}</h3>
            <label className={styles.followInstruction}>
              Receive email alerts when {selectedFollowProfile.name} makes a
              post
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                aria-label="cancel button"
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                aria-label="confirm button"
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={handleConfirmFollow}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
      {selectedUnfollowProfile && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>UnFollow {selectedUnfollowProfile.name}</h3>
            <div className={styles.modalActions}>
              <button
                aria-label="cancel button"
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
                aria-label="confirm button"
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={handleConfirmUnfollow}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
