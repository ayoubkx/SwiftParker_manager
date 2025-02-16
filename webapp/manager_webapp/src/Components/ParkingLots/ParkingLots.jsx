import React from "react";
import { useNavigate } from "react-router-dom";
import LotCard from "../Cards/LotCard/LotCard";
import "./ParkingLots.css";

const ParkingLots = () => {
  const navigate = useNavigate();

  const parkingLots = [
    { lotId: 1, name: "Downtown Parking", location: "123 Main St" },
    { lotId: 2, name: "Mall Parking", location: "456 Shopping Blvd" },
    { lotId: 3, name: "Airport Parking", location: "789 Terminal Rd" },
  ];

  const handleManageLot = (lotId) => {
    navigate(`/parkinglot/${lotId}`);
  };

  return (
    <div className="parking-lots-container">
      <div className="parking-lots-title">
        Parking Lots
      </div>
      <div className="parking-lots-grid">
        {parkingLots.map((lot) => (
          <LotCard key={lot.lotId} lot={lot} onManageLot={handleManageLot} />
        ))}
      </div>
    </div>
  );
};

export default ParkingLots;
