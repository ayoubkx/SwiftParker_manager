import React from "react";
import "./ParkingLot.css";

const ParkingLot = () => {
  // Mock data for the parking lot
  const parkingLot = {
    lotId: 1,
    name: "Eaton Center Parking",
    manager: "Khaled",
    location: "Montreal, QC",
    tariffs: "$3/hour, $20/day",
    floors: 3,
    devices: ["Controller A", "Controller B", "Controller C"],
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
            <td>{parkingLot.floors}</td>
          </tr>
          <tr>
            <td>Devices</td>
            <td>
              <ul>
                {parkingLot.devices.map((device, index) => (
                  <li key={index}>{device}</li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default ParkingLot;
