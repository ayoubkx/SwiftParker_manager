import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import RowCard from "../Cards/RowCard/RowCard";
import "./FloorDetails.css";

const FloorDetails = () => {
  const { floorNumber } = useParams();

  const rows = [
    { rowNumber: 1, spotCount: 10 },
    { rowNumber: 2, spotCount: 12 },
    { rowNumber: 3, spotCount: 15 },
  ];

  const navigate = useNavigate();

  const handleManageSpots = (rowNumber) => {
    navigate(`/row/${rowNumber}/spots`);
  };

  return (
    <div className="floor-details-container">
      <div className="floor-title">
        Floor {floorNumber} Details
      </div>      
      <div className="rows-container">
        {rows.map((row) => (
          <RowCard key={row.rowNumber} row={row} onManageSpots={handleManageSpots} />
        ))}
      </div>
    </div>
  );
};

export default FloorDetails;
