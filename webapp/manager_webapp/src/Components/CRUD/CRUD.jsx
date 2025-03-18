import React, { useState, useEffect } from "react";
import {
  getSubscribedUsersByParkingLot,
  cancelSubscription,
  renewSubscription
} from "../../backend/subscriptions"; // Make sure to update the correct path!
import "./CRUD.css";

const CRUD = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    licensePlate: "",
    isSubscribed: false
  });

  const parkingLotId = "-OLZako6w9ybiHHQj5LW"; // <-- hardcoded, or pass as prop if needed

  // Fetch subscribed users when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const fetchedUsers = await getSubscribedUsersByParkingLot(parkingLotId);

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
  };

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
      <div className="crud-container">
        <div className="crud-title">User Management</div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {!loading && (
            <>
              <table>
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
                        <button onClick={() => setEditingUser(user)}>Edit</button>
                        <button
                            onClick={() => handleDeleteUser(user.id, user.subscriptionId)}
                            className="delete-button"
                        >
                          Cancel
                        </button>
                        <button
                            onClick={() => handleRenewSubscription(user.id, user.subscriptionId)}
                            className="renew-button"
                        >
                          Renew
                        </button>
                      </td>
                    </tr>
                ))}
                </tbody>
              </table>

              {/* Add User Button */}
              {!showAddForm && (
                  <button
                      className="add-user-button"
                      onClick={() => setShowAddForm(true)}
                  >
                    Add User
                  </button>
              )}

              {/* Add User Form (Optional - only works locally for now) */}
              {showAddForm && (
                  <div className="add-form">
                    <h2>Add User</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={newUser.name}
                        onChange={(e) =>
                            setNewUser({ ...newUser, name: e.target.value })
                        }
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={newUser.email}
                        onChange={(e) =>
                            setNewUser({ ...newUser, email: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={newUser.phoneNumber}
                        onChange={(e) =>
                            setNewUser({ ...newUser, phoneNumber: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="License Plate"
                        value={newUser.licensePlate}
                        onChange={(e) =>
                            setNewUser({ ...newUser, licensePlate: e.target.value })
                        }
                    />
                    <label>
                      <span>Subscribed</span>
                      <input
                          type="checkbox"
                          checked={newUser.isSubscribed}
                          onChange={(e) =>
                              setNewUser({ ...newUser, isSubscribed: e.target.checked })
                          }
                      />
                    </label>
                    <div className="form-buttons">
                      <button
                          onClick={() => {
                            if (newUser.name && newUser.email) {
                              setUsers([
                                ...users,
                                { ...newUser, id: Date.now(), subscriptionId: "local" }
                              ]);
                              setNewUser({
                                name: "",
                                email: "",
                                phoneNumber: "",
                                licensePlate: "",
                                isSubscribed: false
                              });
                              setShowAddForm(false);
                            }
                          }}
                      >
                        Add (Local)
                      </button>
                      <button
                          onClick={() => setShowAddForm(false)}
                          className="close-button"
                      >
                        Close
                      </button>
                    </div>
                  </div>
              )}

              {/* Edit User Form (Local Only for now) */}
              {editingUser && (
                  <div className="edit-form">
                    <h2>Edit User</h2>
                    <input
                        type="text"
                        placeholder="Name"
                        value={editingUser.name}
                        onChange={(e) =>
                            setEditingUser({ ...editingUser, name: e.target.value })
                        }
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={editingUser.email}
                        onChange={(e) =>
                            setEditingUser({ ...editingUser, email: e.target.value })
                        }
                    />
                    <input
                        type="text"
                        placeholder="Phone Number"
                        value={editingUser.phoneNumber}
                        onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              phoneNumber: e.target.value
                            })
                        }
                    />
                    <input
                        type="text"
                        placeholder="License Plate"
                        value={editingUser.licensePlate}
                        onChange={(e) =>
                            setEditingUser({
                              ...editingUser,
                              licensePlate: e.target.value
                            })
                        }
                    />
                    <label>
                      <span>Subscribed</span>
                      <input
                          type="checkbox"
                          checked={editingUser.isSubscribed}
                          onChange={(e) =>
                              setEditingUser({
                                ...editingUser,
                                isSubscribed: e.target.checked
                              })
                          }
                      />
                    </label>
                    <div className="form-buttons">
                      <button
                          onClick={() => {
                            setUsers(
                                users.map((user) =>
                                    user.id === editingUser.id ? editingUser : user
                                )
                            );
                            setEditingUser(null);
                          }}
                      >
                        Update (Local)
                      </button>
                      <button
                          onClick={() => setEditingUser(null)}
                          className="close-button"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
              )}
            </>
        )}
      </div>
  );
};

export default CRUD;
