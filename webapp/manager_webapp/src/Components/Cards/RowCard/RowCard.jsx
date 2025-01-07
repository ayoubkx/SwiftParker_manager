import React from "react";
import "./RowCard.css";

const RowCard = ({ row, onManageSpots }) => {
  const { rowNumber, image, spotCount } = row;

  return (
    <div className="row-card">
      <div className="row-image">
        <img
          src={image || "https://via.placeholder.com/300"}
          alt={`Row ${rowNumber}`}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            borderRadius: "8px",
          }}
        />
      </div>
      <div className="row-details">
        <span>Row {rowNumber}</span>
        <span>Spots: {spotCount}</span>
      </div>
      <button
        onClick={() => onManageSpots(rowNumber)}
        className="manage-button"
      >
        Manage Spots
      </button>
    </div>
  );
};

export default RowCard;
