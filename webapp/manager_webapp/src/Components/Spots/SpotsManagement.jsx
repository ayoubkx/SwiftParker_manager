import React, { useState } from "react";
import { useParams } from "react-router-dom";
import "./SpotsManagement.css";

const SpotsManagement = () => {
  const { rowNumber } = useParams();

  const [spots, setSpots] = useState([
    { spotId: 1, type: "EV", status: "Available", isReserved: false },
    { spotId: 2, type: "Standard", status: "Occupied", isReserved: true },
    { spotId: 3, type: "Handicapped", status: "Available", isReserved: true },
  ]);

  const [newSpot, setNewSpot] = useState({
    type: "",
    status: "",
    isReserved: false,
  });

  const [editingSpot, setEditingSpot] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const handleAddSpot = () => {
    if (newSpot.type && newSpot.status) {
      setSpots([...spots, { spotId: Date.now(), ...newSpot }]);
      setNewSpot({ type: "", status: "", isReserved: false });
      setShowAddForm(false);
    }
  };

  const handleEditSpot = (spot) => {
    setEditingSpot(spot);
  };

  const handleUpdateSpot = () => {
    setSpots(
      spots.map((spot) =>
        spot.spotId === editingSpot.spotId ? editingSpot : spot
      )
    );
    setEditingSpot(null);
  };

  const handleDeleteSpot = (spotId) => {
    setSpots(spots.filter((spot) => spot.spotId !== spotId));
  };

  return (
    <div className="spots-management-container">
      <div className="spots-management-title">Manage Spots for Row {rowNumber}</div>

      <table className="spots-management-table">
        <thead>
          <tr>
            <th>Spot ID</th>
            <th>Type</th>
            <th>Status</th>
            <th>Reserved</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {spots.map((spot) => (
            <tr key={spot.spotId}>
              <td>{spot.spotId}</td>
              <td>{spot.type}</td>
              <td>{spot.status}</td>
              <td>{spot.isReserved ? "Yes" : "No"}</td>
              <td>
                <button
                  className="spots-management-edit-button"
                  onClick={() => handleEditSpot(spot)}
                >
                  Edit
                </button>
                <button
                  className="spots-management-delete-button"
                  onClick={() => handleDeleteSpot(spot.spotId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {!showAddForm && (
        <button
          className="spots-management-add-button"
          onClick={() => setShowAddForm(true)}
        >
          Add Spot
        </button>
      )}

      {showAddForm && (
        <div className="spots-management-add-form">
          <h2>Add Spot</h2>
          <select
            value={newSpot.type}
            onChange={(e) => setNewSpot({ ...newSpot, type: e.target.value })}
          >
            <option value="">Select Type</option>
            <option value="EV">EV</option>
            <option value="Standard">Standard</option>
            <option value="Handicapped">Handicapped</option>
          </select>
          <select
            value={newSpot.status}
            onChange={(e) =>
              setNewSpot({ ...newSpot, status: e.target.value })
            }
          >
            <option value="">Select Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
          </select>
          <label>
            <span>Reserved</span>
            <input
              type="checkbox"
              checked={newSpot.isReserved}
              onChange={(e) =>
                setNewSpot({ ...newSpot, isReserved: e.target.checked })
              }
            />
          </label>
          <div className="spots-management-form-buttons">
            <button onClick={handleAddSpot}>Add</button>
            <button
              onClick={() => setShowAddForm(false)}
              className="spots-management-close-button"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {editingSpot && (
        <div className="spots-management-edit-form">
          <h2>Edit Spot</h2>
          <select
            value={editingSpot.type}
            onChange={(e) =>
              setEditingSpot({ ...editingSpot, type: e.target.value })
            }
          >
            <option value="">Select Type</option>
            <option value="EV">EV</option>
            <option value="Standard">Standard</option>
            <option value="Handicapped">Handicapped</option>
          </select>
          <select
            value={editingSpot.status}
            onChange={(e) =>
              setEditingSpot({ ...editingSpot, status: e.target.value })
            }
          >
            <option value="">Select Status</option>
            <option value="Available">Available</option>
            <option value="Occupied">Occupied</option>
          </select>
          <label>
            <span>Reserved</span>
            <input
              type="checkbox"
              checked={editingSpot.isReserved}
              onChange={(e) =>
                setEditingSpot({ ...editingSpot, isReserved: e.target.checked })
              }
            />
          </label>
          <button onClick={handleUpdateSpot}>Update</button>
        </div>
      )}
    </div>
  );
};

export default SpotsManagement;
