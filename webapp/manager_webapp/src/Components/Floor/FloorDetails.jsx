import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../backend/api";
import RowCard from "../Cards/RowCard/RowCard";
import "./FloorDetails.css";

const FloorDetails = () => {
  const { parkingLotId, floorId } = useParams();
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [floorExists, setFloorExists] = useState(true);
  const [addingRow, setAddingRow] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    fetchRows();
  }, [parkingLotId, floorId]);

  const fetchRows = async () => {
    try {
      const response = await API.get(`/parkingLots/${parkingLotId}/floors/${floorId}.json`);

      if (!response.data) {
        setFloorExists(false);
        return;
      }

      const rowsArray = response.data.rows
        ? Object.entries(response.data.rows).map(([key, row]) => ({
            rowId: row.rowId || key,
            spotCount: row.spots ? row.spots.length : 0,
          }))
        : [];

      setRows(rowsArray);
    } catch (err) {
      console.error("Error fetching rows:", err);
      setError("Failed to fetch rows.");
    } finally {
      setLoading(false);
    }
  };

  const handleManageSpots = (rowId) => {
    navigate(`/parkinglot/${parkingLotId}/floor/${floorId}/row/${rowId}/spots`);
  };

  const handleAddRow = async () => {
    setAddingRow(true);
    try {
      const newRowId = `R${rows.length + 1}`;
      const response = await API.post(`/parkingLots/${parkingLotId}/floors/${floorId}/rows.json`, {
        rowId: newRowId,
      });

      if (response.data) {
        fetchRows();
      }
    } catch (error) {
      console.error("Error adding row:", error);
      setError("Failed to add new row.");
    } finally {
      setAddingRow(false);
    }
  };

  const handleDeleteFloor = async () => {
    setDeleting(true);
    try {
      // Get current floors data
      const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = parkingLotResponse.data;
  
      if (!parkingLotData || !parkingLotData.floors) {
        throw new Error("Parking lot or floors data missing.");
      }
  
      // Remove the selected floor
      const updatedFloors = parkingLotData.floors.filter((f) => f.floorId !== parseInt(floorId));
  
      // Re-index floor IDs sequentially to prevent gaps
      const normalizedFloors = updatedFloors.map((f, index) => ({
        ...f,
        floorId: index, // Reset IDs in order
      }));
  
      // Update Firebase
      await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: normalizedFloors });
  
      alert("Floor deleted successfully!");
      navigate(`/parkinglot/${parkingLotId}`);
    } catch (error) {
      console.error("Error deleting floor:", error);
      setError("Failed to delete floor.");
    } finally {
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };
  

  if (!floorExists) {
    return (
      <div className="error-message">
        Floor does not exist. Redirecting to the parking lot...
      </div>
    );
  }

  if (loading) return <div className="loading-message">Loading rows...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="floor-details-container">
      <div className="floor-title">Floor {floorId} Details</div>

      <div className="rows-container">
        {rows.length > 0 ? (
          rows.map((row) => (
            <RowCard key={row.rowId} row={row} onManageSpots={handleManageSpots} />
          ))
        ) : (
          <div className="no-rows-message">No rows found.</div>
        )}
      </div>

      <button className="add-row-button" onClick={handleAddRow} disabled={addingRow}>
        {addingRow ? "Adding..." : "New Row"}
      </button>

      <button className="delete-floor-button" onClick={() => setShowConfirmDelete(true)} disabled={deleting}>
        {deleting ? "Deleting..." : "Delete Floor"}
      </button>

      {showConfirmDelete && (
        <div className="confirm-delete-modal">
          <p>Are you sure you want to delete this floor?</p>
          <button className="confirm-delete" onClick={handleDeleteFloor}>Confirm</button>
          <button className="cancel-delete" onClick={() => setShowConfirmDelete(false)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default FloorDetails;
