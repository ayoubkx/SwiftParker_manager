import React, { useState } from "react";
import "./CRUD.css";

const CRUD = () => {
  const [users, setUsers] = useState([
    { 
      id: 1, 
      name: "John Doe", 
      email: "john.doe@example.com", 
      phoneNumber: "123-456-7890", 
      licensePlate: "ABC123", 
      isSubscribed: true 
    },
    { 
      id: 2, 
      name: "Jane Smith", 
      email: "jane.smith@example.com", 
      phoneNumber: "987-654-3210", 
      licensePlate: "XYZ789", 
      isSubscribed: false 
    },
  ]);

  const [newUser, setNewUser] = useState({ 
    name: "", 
    email: "", 
    phoneNumber: "", 
    licensePlate: "", 
    isSubscribed: false 
  });

  const [editingUser, setEditingUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false); 

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      setUsers([...users, { id: Date.now(), ...newUser }]);
      setNewUser({ name: "", email: "", phoneNumber: "", licensePlate: "", isSubscribed: false });
      setShowAddForm(false); 
    }
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
  };

  const handleUpdateUser = () => {
    setUsers(
      users.map((user) =>
        user.id === editingUser.id ? editingUser : user
      )
    );
    setEditingUser(null);
  };

  const handleDeleteUser = (id) => {
    setUsers(users.filter((user) => user.id !== id));
  };

  return (
    <div className="crud-container">
      <h1>User Management</h1>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>License Plate</th>
            <th>Subscribed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phoneNumber}</td>
              <td>{user.licensePlate}</td>
              <td>{user.isSubscribed ? "Yes" : "No"}</td>
              <td>
                <button onClick={() => handleEditUser(user)}>Edit</button>
                <button onClick={() => handleDeleteUser(user.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add User Button */}
      {!showAddForm && (
        <button className="add-user-button" onClick={() => setShowAddForm(true)}>
          Add User
        </button>
      )}

      {/* Add User Form */}
      {showAddForm && (
        <div className="add-form">
          <h2>Add User</h2>
          <input
            type="text"
            placeholder="Name"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
          />
          <input
            type="text"
            placeholder="Phone Number"
            value={newUser.phoneNumber}
            onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
          />
          <input
            type="text"
            placeholder="License Plate"
            value={newUser.licensePlate}
            onChange={(e) => setNewUser({ ...newUser, licensePlate: e.target.value })}
          />
          <label>
            <span>Subscribed</span>
            <input
              type="checkbox"
              checked={newUser.isSubscribed}
              onChange={(e) => setNewUser({ ...newUser, isSubscribed: e.target.checked })}
            />
          </label>
          <div className="form-buttons">
            <button onClick={handleAddUser}>Add</button>
            <button onClick={() => setShowAddForm(false)} className="close-button">
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit User Form */}
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
              setEditingUser({ ...editingUser, phoneNumber: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="License Plate"
            value={editingUser.licensePlate}
            onChange={(e) =>
              setEditingUser({ ...editingUser, licensePlate: e.target.value })
            }
          />
          <label>
            <span>Subscribed</span>
            <input
              type="checkbox"
              checked={editingUser.isSubscribed}
              onChange={(e) =>
                setEditingUser({ ...editingUser, isSubscribed: e.target.checked })
              }
            />
          </label>
          <button onClick={handleUpdateUser}>Update</button>
        </div>
      )}
    </div>
  );
};

export default CRUD;
