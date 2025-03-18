import React from "react";
import "./LotCard.css";

const LotCard = ({ lot, onManageLot, onCRUD, onParkingLogs }) => {
  const { id, name, image, location } = lot;

  return (
    <div className="lot-card-container">
      <div className="lot-card-header">
        <img
          src={image || "https://media.istockphoto.com/id/1083622428/fr/vectoriel/ic%C3%B4ne-de-stationnement-de-voiture.jpg?s=612x612&w=0&k=20&c=CvZiRcQXZhmHUSaQsCY2GcuVvAb4955jEoWe5nBOIPI="}
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
          onClick={() => onManageLot(id)}
        >
          Manage Lot
        </button>
        <button
          className="lot-card-button"
          onClick={() => onCRUD(id)}
        >
          Manage Users
        </button>
        <button
          className="lot-card-button"
          onClick={() => onParkingLogs(id)}
        >
          View Session Logs
        </button>
      </div>
    </div>
  );
};

export default LotCard;
