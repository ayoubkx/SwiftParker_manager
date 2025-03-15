import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LotCard from "../Cards/LotCard/LotCard";
import { createParkingLot, createFloor, createRow, createSpot, getManagerParkingLots, getParkingLot } from "../../backend/apiFunction";
import { useAuth } from "../../backend/config/contexts/authContext";
import "./ParkingLots.css";

const ParkingLots = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    hourlyRateWeekday: "",
    dailyRateWeekday: "",
    hourlyRateWeekend: "",
    dailyRateWeekend: "",
    subscriptionRate: "",
    phoneNumber: "",
    floors: 0,
    floorData: [],
  });

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        if (!currentUser) {
          throw new Error("No manager is logged in.");
        }
    
        const parkingLotsData = await getManagerParkingLots(currentUser.uid);
    
        setParkingLots(parkingLotsData);
      } catch (err) {
        console.error("Error fetching parking lots:", err);
        setError("Failed to fetch parking lots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchParkingLots();
  }, [currentUser]);

  const handleManageLot = async (lotId) => {
    try {
      const parkingLotInfo = await getParkingLot(lotId);
      navigate(`/parkinglot/${lotId}`, { state: { parkingLot: parkingLotInfo } });
    } catch (error) {
      console.error("Error fetching parking lot details:", error);
    }
  };
  

  const handleAddParkingLot = () => {
    setShowForm(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    if (name === "floors") {
      const updatedFloorData = Array.from({ length: value }, (_, index) => ({
        rowsPerFloor: 0,
        rowData: [],
      }));
      setFormData({
        ...formData,
        floors: value,
        floorData: updatedFloorData,
      });
    }
  };

  const handleFloorChange = (index, e) => {
    const { name, value } = e.target;
    const updatedFloorData = [...formData.floorData];
    updatedFloorData[index][name] = value;

    if (name === "rowsPerFloor") {
      const updatedRowData = Array.from({ length: value }, () => ({
        generalSpotsPerRow: 0,
        handicappedSpotsPerRow: 0,
        evSpotsPerRow: 0,
        subscriptionSpotsPerRow: 0,
      }));
      updatedFloorData[index].rowData = updatedRowData;
    }

    setFormData({
      ...formData,
      floorData: updatedFloorData,
    });
  };

  const handleRowChange = (floorIndex, rowIndex, e) => {
    const { name, value } = e.target;
    const updatedFloorData = [...formData.floorData];
    updatedFloorData[floorIndex].rowData[rowIndex][name] = value;
    setFormData({
      ...formData,
      floorData: updatedFloorData,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parkingLotData = {
        name: formData.name,
        location: formData.location,
        hourlyRateWeekday: parseFloat(formData.hourlyRateWeekday) || 0,
        dailyRateWeekday: parseFloat(formData.dailyRateWeekday) || 0,
        hourlyRateWeekend: parseFloat(formData.hourlyRateWeekend) || 0,
        dailyRateWeekend: parseFloat(formData.dailyRateWeekend) || 0,
        subscriptionRate: parseFloat(formData.subscriptionRate) || 0,
        phoneNumber: formData.phoneNumber,
      };
  
      const { parkingLotId } = await createParkingLot(currentUser.uid, parkingLotData);
  
      for (let floorIndex = 0; floorIndex < formData.floors; floorIndex++) {
        const { floorId } = await createFloor(parkingLotId);
  
        for (let rowIndex = 0; rowIndex < formData.floorData[floorIndex].rowsPerFloor; rowIndex++) {
          const rowId = `R${floorIndex}${rowIndex}`;
          await createRow(parkingLotId, floorId, rowId);
  
          const rowData = formData.floorData[floorIndex].rowData[rowIndex];
          const spotTypes = [
            { type: "general", count: rowData.generalSpotsPerRow },
            { type: "handicapped", count: rowData.handicappedSpotsPerRow },
            { type: "EV", count: rowData.evSpotsPerRow },
            { type: "subscription", count: rowData.subscriptionSpotsPerRow },
          ];
  
          for (const spotType of spotTypes) {
            for (let i = 0; i < spotType.count; i++) {
              await createSpot(parkingLotId, floorId, rowId, { type: spotType.type, isReserved: false });
            }
          }
        }
      }
      
      const updatedParkingLots = await getManagerParkingLots(currentUser.uid);
      setParkingLots(updatedParkingLots);


      setShowForm(false);
      setFormData({
        name: "",
        location: "",
        hourlyRateWeekday: "",
        dailyRateWeekday: "",
        hourlyRateWeekend: "",
        dailyRateWeekend: "",
        subscriptionRate: "",
        phoneNumber: "",
        floors: 0,
        floorData: [],
      });
    } catch (error) {
      console.error("Error adding parking lot:", error);
      setError("Failed to add parking lot. Please try again.");
    }
  };
  
  

  if (loading) {
    return <div className="loading-message">Loading parking lots...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="parking-lots-container">
      <div className="parking-lots-title">Parking Lots</div>
      <div className="parking-lots-grid">
        {parkingLots.length > 0 ? (
          parkingLots.map((lot) => (
            <LotCard key={lot.id} lot={lot} onManageLot={handleManageLot} />
          ))
        ) : (
          <div className="no-lots-message">No parking lots found.</div>
        )}
      </div>
      <div className="add-parking-lot-container">
        <button className="add-parking-lot-button" onClick={handleAddParkingLot}>
          Add New Parking Lot
        </button>
      </div>

      {showForm && (
        <div className="parking-lot-form">
          <h2>Add New Parking Lot</h2>
          <form onSubmit={handleSubmit}>
            <label>
              Name:
              <input type="text" name="name" value={formData.name} onChange={handleFormChange} required />
            </label>
            <label>
              Location:
              <input type="text" name="location" value={formData.location} onChange={handleFormChange} required />
            </label>
            <label>
              Phone Number:
              <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleFormChange} />
            </label>
            <label>
              Hourly Rate (Weekday):
              <input type="number" name="hourlyRateWeekday" value={formData.hourlyRateWeekday} onChange={handleFormChange} />
            </label>
            <label>
              Daily Rate (Weekday):
              <input type="number" name="dailyRateWeekday" value={formData.dailyRateWeekday} onChange={handleFormChange} />
            </label>
            <label>
              Hourly Rate (Weekend):
              <input type="number" name="hourlyRateWeekend" value={formData.hourlyRateWeekend} onChange={handleFormChange} />
            </label>
            <label>
              Daily Rate (Weekend):
              <input type="number" name="dailyRateWeekend" value={formData.dailyRateWeekend} onChange={handleFormChange} />
            </label>
            <label>
              Subscription Rate:
              <input type="number" name="subscriptionRate" value={formData.subscriptionRate} onChange={handleFormChange} />
            </label>
            <label>
              Floors:
              <input type="number" name="floors" value={formData.floors} onChange={handleFormChange} min="0" required />
            </label>
            {formData.floorData.map((floor, floorIndex) => (
              <div key={floorIndex} className="floor-section">
                <h3><strong>Floor {floorIndex + 1}</strong></h3>
                <label>
                  Rows per Floor:
                  <input
                    type="number"
                    name="rowsPerFloor"
                    value={floor.rowsPerFloor}
                    onChange={(e) => handleFloorChange(floorIndex, e)}
                    min="0"
                    required
                  />
                </label>
                {floor.rowData.map((row, rowIndex) => (
                  <div key={rowIndex} className="row-section">
                    <h4><strong>Row {rowIndex + 1}</strong></h4>
                    <label>
                      General Spots per Row:
                      <input
                        type="number"
                        name="generalSpotsPerRow"
                        value={row.generalSpotsPerRow}
                        onChange={(e) => handleRowChange(floorIndex, rowIndex, e)}
                        min="0"
                        required
                      />
                    </label>
                    <label>
                      Handicapped Spots per Row:
                      <input
                        type="number"
                        name="handicappedSpotsPerRow"
                        value={row.handicappedSpotsPerRow}
                        onChange={(e) => handleRowChange(floorIndex, rowIndex, e)}
                        min="0"
                        required
                      />
                    </label>
                    <label>
                      EV Spots per Row:
                      <input
                        type="number"
                        name="evSpotsPerRow"
                        value={row.evSpotsPerRow}
                        onChange={(e) => handleRowChange(floorIndex, rowIndex, e)}
                        min="0"
                        required
                      />
                    </label>
                    <label>
                      Subscription Spots per Row:
                      <input
                        type="number"
                        name="subscriptionSpotsPerRow"
                        value={row.subscriptionSpotsPerRow}
                        onChange={(e) => handleRowChange(floorIndex, rowIndex, e)}
                        min="0"
                        required
                      />
                    </label>
                  </div>
                ))}
              </div>
            ))}
            <div className="form-buttons">
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setShowForm(false)} className="cancel-button">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ParkingLots;
