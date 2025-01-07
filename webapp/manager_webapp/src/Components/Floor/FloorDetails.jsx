import React from "react";
import { useParams } from "react-router-dom";
import RowCard from "../Cards/RowCard/RowCard";
import "./FloorDetails.css";

const FloorDetails = () => {
  const { floorNumber } = useParams();

  const rows = [
    { rowNumber: 1, image: "https://via.placeholder.com/150?text=Row+1", spotCount: 10 },
    { rowNumber: 2, image: "https://via.placeholder.com/150?text=Row+2", spotCount: 12 },
    { rowNumber: 3, image: "https://via.placeholder.com/150?text=Row+3", spotCount: 15 },
  ];

  const handleManageSpots = (rowNumber) => {
    alert(`Manage spots for Row ${rowNumber}`);
  };

  return (
    <div className="floor-details-container">
      <h1>Floor {floorNumber} Details</h1>
      <div className="rows-container">
        {rows.map((row) => (
          <RowCard key={row.rowNumber} row={row} onManageSpots={handleManageSpots} />
        ))}
      </div>
    </div>
  );
};

export default FloorDetails;
