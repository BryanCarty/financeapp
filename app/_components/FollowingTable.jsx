import styles from "@/app/_styles/FollowingTable.module.css";
import courierPrime from "./CourierPrime";
import { useState } from "react";

export default function FollowingTable() {
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [emailAlerts, setEmailAlerts] = useState(false);

  const handleFollowClick = (profile) => {
    setSelectedProfile(profile);
  };

  const handleConfirmFollow = () => {
    console.log(
      `Followed ${selectedProfile} with email alerts: ${emailAlerts}`
    );
    setSelectedProfile(null); // Close the modal
    setEmailAlerts(false); // Reset checkbox
  };

  const handleCancel = () => {
    setSelectedProfile(null); // Close the modal
    setEmailAlerts(false); // Reset checkbox
  };
  const data = [
    {
      profile: "John Doe",
      accuracy: "90%",
      tradesPerWeek: 15,
      averageDuration: "2 hours",
      followers: 12,
    },
    {
      profile: "Jane Smith",
      accuracy: "85%",
      tradesPerWeek: 20,
      averageDuration: "1.5 hours",
      followers: 12,
    },
    {
      profile: "Alice Johnson",
      accuracy: "92%",
      tradesPerWeek: 10,
      averageDuration: "3 hours",
      followers: 12,
    },
  ];
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
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item.profile}</td>
              <td>{item.accuracy}</td>
              <td>{item.tradesPerWeek}</td>
              <td>{item.followers}</td>
              <td>
                <button
                  className={`${styles.followBtn} ${courierPrime.className}`}
                  onClick={() => handleFollowClick(item.profile)}
                >
                  Follow
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedProfile && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Follow {selectedProfile}</h3>
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
    </div>
  );
}
