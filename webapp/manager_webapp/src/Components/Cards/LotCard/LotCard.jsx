import React from "react";
import "./LotCard.css";

const LotCard = ({ lot, onManageLot }) => {
  const { lotId, name, image, location } = lot;

  return (
    <div className="lot-card-container">
      <div className="lot-card-header">
        <img
          src={image || "https://www.shutterstock.com/image-photo/indoor-full-modern-parking-supermarket-600w-1276486783.jpg"}
          alt={`Parking Lot ${name}`}
          className="lot-card-image"
        />
      </div>
      <div className="lot-card-body">
        <h5 className="lot-card-title">{name}</h5>
        <p className="lot-card-description">Location: {location}</p>
      </div>
      <div className="lot-card-footer">
        <button
          className="lot-card-button"
          onClick={() => onManageLot(lotId)}
        >
          Manage Lot
        </button>
      </div>
    </div>
  );
};

export default LotCard;
