"use client";

import styles from "@/app/_styles/FollowingTable.module.css";
import courierPrime from "./CourierPrime";
import { useState, useEffect } from "react";
import loadTable from "../actions/tables";
import { followUser, unfollowUser } from "../actions/following";
import LoadingSquiggle from "./LoadingSquiggle";
import { useRouter } from "next/navigation";

export default function FollowingTable({ type, searchQuery, isLoggedIn }) {
  const [selectedFollowProfile, setSelectedFollowProfile] = useState(null);
  const [selectedUnfollowProfile, setSelectedUnfollowProfile] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const router = useRouter();

  const followUserClient = async (selectedFollowProfile, emailAlerts) => {
    try {
      const success = await followUser(selectedFollowProfile, emailAlerts);
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
      console.log("Error attempting to follow user:", error);
    }
  };

  const unfollowUserClient = async (selectedUnfollowProfile) => {
    try {
      const success = await unfollowUser(selectedUnfollowProfile); // Your backend API route
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
      console.log("Error attempting to unfollow user:", error);
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        const tableData = await loadTable(type, searchQuery);
        if (!tableData || tableData.length === 0) {
          console.log(tableData);
          setLoadingError("Hmm.. There appears to be no data 😞");
          setLoading(false);
          return;
        }
        setProfiles(tableData);
        setLoading(false);
      } catch (error) {
        setLoadingError("An Unexpected Error Occurred!");
        setLoading(false);
        console.log("Error fetching table data:", error);
      }
    };

    fetchProfiles();
  }, [type, searchQuery]);

  const handleFollowClick = (profile) => {
    setSelectedFollowProfile(profile);
  };

  const handleUnfollowClick = (profile) => {
    setSelectedUnfollowProfile(profile);
  };

  const handleConfirmFollow = () => {
    console.log(
      `Followed ${selectedFollowProfile.name} with email alerts: ${emailAlerts}`
    );
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
    return <div className={`${courierPrime.className}`}>{loadingError}</div>;
  }

  if (type == "se" && !searchQuery) return null;
  return (
    <div className={`${styles.tableContainer} ${courierPrime.className}`}>
      <table className={styles.profileTable}>
        <thead>
          <tr>
            <th>Profile</th>
            <th>Accuracy</th>
            <th>Total Trades</th>
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
              {item.is_following ? (
                <td>
                  <button
                    className={`${styles.followBtn} ${courierPrime.className}`}
                    onClick={() =>
                      handleUnfollowClick({
                        id: item.user_id,
                        name: item.profile,
                      })
                    }
                  >
                    UnFollow
                  </button>
                </td>
              ) : (
                <td>
                  <button
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
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedFollowProfile && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Follow {selectedFollowProfile.name}</h3>
            <label>
              Receive email alerts when John Doe makes a post
              <input
                type="checkbox"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </label>
            <div className={styles.modalActions}>
              <button
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
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
                className={`${styles.btn} ${courierPrime.className}`}
                onClick={handleCancel}
              >
                Cancel
              </button>
              <button
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
