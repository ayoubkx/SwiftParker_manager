import React from "react";
import { useNavigate } from "react-router-dom";
import "./ParkingLot.css";

const ParkingLot = () => {
  // Mock data for the parking lot
  const parkingLot = {
    lotId: 1,
    name: "Eaton Center Parking",
    manager: "Khaled",
    location: "1801 Av. McGill College, Montréal, QC H3A 1Z4",
    tariffs: "$3/hour, $20/day",
    floors: ["Floor 1", "Floor 2", "Floor 3"],
    devices: ["Controller A", "Controller B", "Controller C"],
  };

  const navigate = useNavigate();

  const handleManageFloor = (floor) => {
    const floorNumber = floor.split(" ")[1]; // Extract floor number
    navigate(`/floor/${floorNumber}`);
  };

  return (
    <div className="parking-lot-container">
      <h1>Parking Lot Details</h1>
      <table className="parking-lot-table">
        <tbody>
          <tr>
            <td>Lot ID</td>
            <td>{parkingLot.lotId}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td>{parkingLot.name}</td>
          </tr>
          <tr>
            <td>Manager</td>
            <td>{parkingLot.manager}</td>
          </tr>
          <tr>
            <td>Location</td>
            <td>{parkingLot.location}</td>
          </tr>
          <tr>
            <td>Tariffs</td>
            <td>{parkingLot.tariffs}</td>
          </tr>
          <tr>
            <td>Floors</td>
            <td>
            {parkingLot.floors.map((floor, index) => (
                <div key={index} className="item-row">
                  <span>{floor}</span>
                  <button onClick={() => handleManageFloor(floor)}>Manage</button>
                </div>
              ))}
            </td>
          </tr>
          <tr>
            <td>Devices</td>
            <td>
              {parkingLot.devices.map((device, index) => (
                <div key={index} className="item-row">
                  <span>{device}</span>
                </div>
              ))}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ParkingLot;
