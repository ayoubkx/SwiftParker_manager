import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { createRow, getFloorRows, getRowSpots } from "../../backend/apiFunction";
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


  
  const fetchRows = useCallback(async () => {
    try {
      const floorRows = await getFloorRows(parkingLotId, floorId);
  
      if (!floorRows) {
        setFloorExists(false);
        return;
      }
  
      // Fetch spot count for each row
      const rowsWithSpotCount = await Promise.all(
        floorRows.map(async (row) => {
          const spots = await getRowSpots(parkingLotId, floorId, row.rowId);
          return { ...row, spotCount: spots.length };
        })
      );
  
      setRows(rowsWithSpotCount);
    } catch (err) {
      console.error("Error fetching rows:", err);
      setError("Failed to fetch rows.");
    } finally {
      setLoading(false);
    }
  }, [parkingLotId, floorId]); // ✅ Added dependencies
  
  useEffect(() => {
    fetchRows();
  }, [fetchRows]); // ✅ Fixed missing dependency warning
  

  const handleManageSpots = (rowId) => {
    navigate(`/parkinglot/${parkingLotId}/floor/${floorId}/row/${rowId}/spots`);
  };

  const handleAddRow = async () => {
    setAddingRow(true);
    try {
      const response = await createRow(parkingLotId, floorId);

      if (response && response.rowId) {
        fetchRows(); // Refresh rows after adding
      }
    } catch (error) {
      console.error("Error adding row:", error);
      setError("Failed to add new row.");
    } finally {
      setAddingRow(false);
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
            <RowCard key={row.rowId} row={row} spotCount={row.spotCount} onManageSpots={handleManageSpots} />
          ))
        ) : (
          <div className="no-rows-message">No rows found.</div>
        )}
      </div>


      <div className="floor-actions-container">
        <button className="floor-add-row-button" onClick={handleAddRow} disabled={addingRow}>
          {addingRow ? "Adding..." : "New Row"}
        </button>
      </div>

    </div>
  );
};

export default FloorDetails;
