import React, { useState, useEffect, useCallback } from "react";
import {
  getSubscribedUsersByParkingLot,
  cancelSubscription,
  renewSubscription
} from "../../backend/subscriptions"; 
import "./CRUD.css";
import { useParams } from "react-router-dom";

const CRUD = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");


  const { lotId } = useParams(); // Get parking lot ID from URL


  const fetchUsers = useCallback(async () => { // ✅ Wrap in useCallback
    if (!lotId) return; // Ensure lotId is available before making API calls

    setLoading(true);
    setError("");
  
    try {
      const fetchedUsers = await getSubscribedUsersByParkingLot(lotId);
  
      const transformedUsers = fetchedUsers.map((item) => ({
        id: item.userId,
        name: item.fullName,
        email: item.email,
        phoneNumber: item.phoneNumber,
        licensePlate: item.licensePlates[0] || "N/A",
        isSubscribed: true,
        subscriptionId: item.subscription.id,
        endDate: item.subscription.endDate
      }));
  
      setUsers(transformedUsers);
    } catch (error) {
      console.error("Fetch Error:", error);
      setError("Failed to load users.");
    }
  
    setLoading(false);
  }, [lotId]); // ✅ Add parkingLotId as a dependency


  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); 

  // Handle cancel subscription (Delete)
  const handleDeleteUser = async (userId, subscriptionId) => {
    if (!window.confirm("Are you sure you want to cancel this subscription?")) return;

    try {
      await cancelSubscription(userId, subscriptionId);

      // Remove user from local state after successful deletion
      setUsers(users.filter((user) => user.id !== userId));
    } catch (error) {
      console.error("Delete Error:", error);
      setError("Failed to cancel subscription.");
    }
  };

  // Handle renew subscription
  const handleRenewSubscription = async (userId, subscriptionId) => {
    try {
      const updatedSubscription = await renewSubscription(userId, subscriptionId);

      // Update endDate in UI
      const updatedUsers = users.map((user) =>
          user.id === userId
              ? { ...user, endDate: updatedSubscription.endDate }
              : user
      );

      setUsers(updatedUsers);
    } catch (error) {
      console.error("Renew Error:", error);
      setError("Failed to renew subscription.");
    }
  };

  return (
    <div className="crud-container-v2">
      <div className="crud-title-v2">Subscribed User Management</div>
  
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
  
      {!loading && (
        <>
          <table className="crud-table-v2">
            <thead>
              <tr>
                <th>User ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>License Plate</th>
                <th>Subscribed</th>
                <th>End Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && (
                <tr>
                  <td colSpan="8">No users found.</td>
                </tr>
              )}
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.phoneNumber}</td>
                  <td>{user.licensePlate}</td>
                  <td>{user.isSubscribed ? "Yes" : "No"}</td>
                  <td>{user.endDate ? new Date(user.endDate).toLocaleDateString() : "N/A"}</td>
                  <td>
                    <button
                      className="crud-button-v2 danger"
                      onClick={() => handleDeleteUser(user.id, user.subscriptionId)}
                    >
                      Cancel
                    </button>
                    <button
                      className="crud-button-v2 primary"
                      onClick={() => handleRenewSubscription(user.id, user.subscriptionId)}
                    >
                      Renew
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
  

        </>
      )}
    </div>
  );
};

export default CRUD;
