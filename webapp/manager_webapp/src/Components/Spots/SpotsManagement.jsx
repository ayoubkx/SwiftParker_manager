import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import API from "../../backend/api";
import "./SpotsManagement.css";

const SpotsManagement = () => {
  const { parkingLotId, floorId, rowId } = useParams();
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newSpot, setNewSpot] = useState({
    type: "",
    status: "available",
    isReserved: false,
  });
  const [editingSpot, setEditingSpot] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Fetch spots when the component mounts
  useEffect(() => {
    const fetchSpots = async () => {
      try {
        const response = await API.get(`/parkingLots/${parkingLotId}.json`);
        const parkingLotData = response.data;
    
        if (!parkingLotData) {
          setError("Parking lot not found.");
          return;
        }
    
        // Ensure floors exist
        const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
        if (!floor) {
          setError("Floor not found.");
          return;
        }
    
        // Normalize rows to an array
        let rowsArray = Array.isArray(floor.rows) ? floor.rows : Object.values(floor.rows || {});
    
        // Ensure row exists
        const row = rowsArray.find((r) => r.rowId === rowId);
        if (!row) {
          setError("Row not found.");
          return;
        }
    
        // Ensure spots array exists, even if empty
        setSpots(row.spots || []);
      } catch (err) {
        console.error("Error fetching spots:", err);
        setError("Failed to fetch spots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchSpots();
  }, [parkingLotId, floorId, rowId]);

  const handleAddSpot = async () => {
    try {
      // Fetch the current parking lot data
      const response = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = response.data;
  
      if (!parkingLotData) {
        setError("Parking lot not found.");
        return;
      }
  
      // Find the correct floor
      const floorIndex = parkingLotData.floors.findIndex((f) => f.floorId === parseInt(floorId));
      if (floorIndex === -1) {
        setError("Floor not found.");
        return;
      }
  
      // Ensure rows is an array
      let rowsArray = Array.isArray(parkingLotData.floors[floorIndex].rows)
        ? parkingLotData.floors[floorIndex].rows
        : Object.values(parkingLotData.floors[floorIndex].rows || {});
  
      // Find the correct row
      const rowIndex = rowsArray.findIndex((r) => r.rowId === rowId);
      if (rowIndex === -1) {
        setError("Row not found.");
        return;
      }
  
      // Ensure spots exist
      const existingSpots = rowsArray[rowIndex].spots || [];
  
      // Generate a unique spotId
      const newSpotId = `SPOT-${Math.random().toString(36).substr(2, 8)}`;
  
      // Create new spot object
      const spotData = {
        ...newSpot,
        spotId: newSpotId,
      };
  
      // Add new spot to the row
      existingSpots.push(spotData);
      rowsArray[rowIndex].spots = existingSpots;
  
      // Update the entire floor structure in Firebase
      parkingLotData.floors[floorIndex].rows = rowsArray;
  
      // Save updated parking lot back to Firebase
      await API.patch(`/parkingLots/${parkingLotId}.json`, {
        floors: parkingLotData.floors,
      });
  
      // Update UI
      setSpots(existingSpots);
      setNewSpot({ type: "", status: "available", isReserved: false });
      setShowAddForm(false);
    } catch (error) {
      console.error("Error adding spot:", error);
      setError("Failed to add spot.");
    }
  };
  
  const handleEditSpot = (spot) => {
    setEditingSpot(spot);
  };

  const handleUpdateSpot = async () => {
    try {
      const response = await API.patch(
        `/parkingLots/${parkingLotId}/floors/${floorId}/rows/${rowId}/spots/${editingSpot.spotId}.json`,
        editingSpot
      );

      if (response.data) {
        setSpots(
          spots.map((spot) =>
            spot.spotId === editingSpot.spotId ? editingSpot : spot
          )
        );
        setEditingSpot(null);
      }
    } catch (error) {
      console.error("Error updating spot:", error);
      setError("Failed to update spot.");
    }
  };

  const handleDeleteSpot = async (spotId) => {
    try {
      await API.delete(
        `/parkingLots/${parkingLotId}/floors/${floorId}/rows/${rowId}/spots/${spotId}.json`
      );

      setSpots(spots.filter((spot) => spot.spotId !== spotId));
    } catch (error) {
      console.error("Error deleting spot:", error);
      setError("Failed to delete spot.");
    }
  };

  if (loading) {
    return <div className="loading-message">Loading spots...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="spots-management-container">
      <div className="spots-management-title">
        Manage Spots for Row {rowId}
      </div>

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
            <option value="general">General</option>
            <option value="handicapped">Handicapped</option>
            <option value="EV">EV</option>
            <option value="subscription">Subscription</option>
          </select>
          <select
            value={newSpot.status}
            onChange={(e) =>
              setNewSpot({ ...newSpot, status: e.target.value })
            }
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
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
            <option value="general">General</option>
            <option value="handicapped">Handicapped</option>
            <option value="EV">EV</option>
            <option value="subscription">Subscription</option>
          </select>
          <select
            value={editingSpot.status}
            onChange={(e) =>
              setEditingSpot({ ...editingSpot, status: e.target.value })
            }
          >
            <option value="available">Available</option>
            <option value="occupied">Occupied</option>
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
          <button
            onClick={() => setEditingSpot(null)}
            className="spots-management-close-button"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default SpotsManagement;