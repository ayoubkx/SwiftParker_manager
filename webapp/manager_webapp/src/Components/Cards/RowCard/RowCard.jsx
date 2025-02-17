import React from "react";
import "./RowCard.css";

const RowCard = ({ row, onManageSpots }) => {
  const { rowId, spotCount } = row;

  return (
    <div className="row-card-container">
      <div className="row-card-header">
        <img
          src={"https://media.istockphoto.com/id/689971600/photo/empty-car-parking-lots-outdoor-public-parking.jpg?s=612x612&w=0&k=20&c=fZ2Ow457arZxAHUDVYfEeX3blIRDRrdsU2DWRve3l38="}
          alt={`Row ${rowId}`}
          className="row-card-image"
        />
      </div>
      <div className="row-card-body">
        <h5 className="row-card-title">Row {rowId}</h5>
        <p className="row-card-description">Total Spots: {spotCount}</p>
      </div>
      <div className="row-card-footer">
        <button className="row-card-button" onClick={() => onManageSpots(row.rowId)}>
          Manage Spots
        </button>
      </div>
    </div>
  );
};

export default RowCard;
