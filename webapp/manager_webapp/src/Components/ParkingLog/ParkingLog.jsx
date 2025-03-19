import React, { useState, useEffect } from "react";
import { getParkingSessions, getUserById } from "../../backend/apiFunction";
import "./ParkingLog.css";
import { useParams } from "react-router-dom";

const ParkingLog = () => {
  const { lotId } = useParams();
  const [parkingSessions, setParkingSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchParkingSessions = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch sessions for the parking lot
        const sessions = await getParkingSessions(lotId);
        
        // Fetch user details for each session
        const sessionsWithUserData = await Promise.all(
          sessions.map(async (session) => {
            try {
              const user = await getUserById(session.userId);
              return {
                ...session,
                userName: user.fullName || "Unknown",
                userPhone: user.phoneNumber || "N/A",
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

        // Sort sessions by entry time, most recent first
        const sortedSessions = sessionsWithUserData.sort((a, b) => 
          new Date(b.entryTime) - new Date(a.entryTime)
        );

        setParkingSessions(sortedSessions);
      } catch (err) {
        console.error("Error fetching parking sessions:", err);
        setError("Failed to load parking log.");
      } finally {
        setLoading(false);
      }
    };

    if (lotId) {
      fetchParkingSessions();
    }
  }, [lotId]);

  if (loading) return <div className="loading-message">Loading parking log...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="parking-log-container">
      <h1 className="parking-log-title">Parking Log</h1>
      <p className="parking-log-description">Detailed log of parking sessions</p>
     
      <div className="parking-log-table-container">
        {parkingSessions.length === 0 ? (
          <div className="no-sessions-message">
            No parking sessions found for this parking lot.
          </div>
        ) : (
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
                    {session.exitTime 
                      ? new Date(session.exitTime).toLocaleString() 
                      : "Ongoing"}
                  </td>
                  <td>{session.durationHours?.toFixed(2) || "N/A"}</td>
                  <td>${session.amount?.toFixed(2) || "0.00"}</td>
                  <td>
                    <span className={`payment-status ${session.paymentStatus?.toLowerCase()}`}>
                      {session.paymentStatus || "Unknown"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ParkingLog;