import React, { useState, useEffect } from "react";
import { getParkingSessions, getUserById } from "../../backend/apiFunction";
import "./ParkingLog.css";

const ParkingLog = () => {
  const parkingLotId = "-OLZako6w9ybiHHQj5LW"; // Hardcoded lot ID for now
  const [parkingSessions, setParkingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParkingSessions = async () => {
      try {
        setLoading(true);
        setError("");

        // Fetch sessions for the parking lot
        const sessions = await getParkingSessions(parkingLotId);

        // Fetch user details for each session
        const sessionsWithUserData = await Promise.all(
          sessions.map(async (session) => {
            try {
              const user = await getUserById(session.userId);
              return {
                ...session,
                userName: user.fullName,
                userPhone: user.phoneNumber,
              };
            } catch (err) {
              console.warn(`User not found for session ${session.sessionId}`);
              return {
                ...session,
                userName: "Unknown",
                userPhone: "N/A",
              };
            }
          })
        );

        setParkingSessions(sessionsWithUserData);
      } catch (err) {
        console.error("Error fetching parking sessions:", err);
        setError("Failed to load parking log.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSessions();
  }, []);

  if (loading) return <div className="loading-message">Loading parking log...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="parking-log-container">
      <h1 className="parking-log-title">Parking Log</h1>
      <p className="parking-log-description">Detailed log of parking sessions</p>
      
      <div className="parking-log-table-container">
        <table className="parking-log-table">
          <thead>
            <tr>
              <th>Session ID</th>
              <th>User Name</th>
              <th>Phone Number</th>
              <th>Entry Time</th>
              <th>Exit Time</th>
              <th>Duration (hrs)</th>
              <th>Amount Charged ($)</th>
              <th>Payment Status</th>
            </tr>
          </thead>
          <tbody>
            {parkingSessions.map((session) => (
              <tr key={session.sessionId}>
                <td>{session.sessionId}</td>
                <td>{session.userName}</td>
                <td>{session.userPhone}</td>
                <td>{new Date(session.entryTime).toLocaleString()}</td>
                <td>
                  {session.exitTime ? new Date(session.exitTime).toLocaleString() : "Ongoing"}
                </td>
                <td>{session.duration}</td>
                <td>${session.amountCharged}</td>
                <td>
                  <span className={`payment-status ${session.paymentStatus.toLowerCase()}`}>
                    {session.paymentStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParkingLog;