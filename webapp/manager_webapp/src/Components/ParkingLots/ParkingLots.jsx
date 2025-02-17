import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import LotCard from "../Cards/LotCard/LotCard";
import API from "../../backend/api";
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
    floors: [],
  });

  useEffect(() => {
    const fetchParkingLots = async () => {
      try {
        if (!currentUser) {
          throw new Error("No manager is logged in.");
        }

        const response = await API.get(`/managers/${currentUser.uid}/parkingLots.json`);
        const parkingLotIds = response.data || [];

        const validParkingLotIds = parkingLotIds.filter((id) => id !== null && typeof id === "string");

        if (validParkingLotIds.length === 0) {
          setParkingLots([]);
          setLoading(false);
          return;
        }

        const parkingLotsData = await Promise.all(
          validParkingLotIds.map(async (id) => {
            const lotResponse = await API.get(`/parkingLots/${id}.json`);
            if (lotResponse.data) {
              return {
                id,
                ...lotResponse.data,
              };
            }
            return null;
          })
        );

        const validParkingLots = parkingLotsData.filter((lot) => lot !== null);
        setParkingLots(validParkingLots);
      } catch (err) {
        console.error("Error fetching parking lots:", err);
        setError("Failed to fetch parking lots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLots();
  }, [currentUser]);

  const handleManageLot = (lotId) => {
    navigate(`/parkinglot/${lotId}`);
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
  };

  const handleAddFloor = () => {
    setFormData({
      ...formData,
      floors: [
        ...formData.floors,
        {
          floorId: formData.floors.length,
          rows: [],
        },
      ],
    });
  };

  const handleAddRow = (floorIndex) => {
    const updatedFloors = [...formData.floors];
    updatedFloors[floorIndex].rows.push({
      rowId: `R${updatedFloors[floorIndex].rows.length + 1}`,
      spots: [],
    });
    setFormData({
      ...formData,
      floors: updatedFloors,
    });
  };

  const handleAddSpot = (floorIndex, rowIndex) => {
    const updatedFloors = [...formData.floors];
    updatedFloors[floorIndex].rows[rowIndex].spots.push({
      spotId: `SPOT-${Math.random().toString(36).substr(2, 8)}`,
      type: "general",
      isReserved: false,
      status: "available",
    });
    setFormData({
      ...formData,
      floors: updatedFloors,
    });
  };

  const { refreshManagerProfile } = useAuth(); // Get refresh function from AuthContext

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Step 1: Add the new parking lot
      const response = await API.post("/parkingLots.json", {
        ...formData,
        managerId: currentUser.uid,
        createdAt: new Date().toISOString(),
      });
      const parkingLotId = response.data.name;
  
      // Step 2: Get the current list of parkingLots from Firebase
      const managerResponse = await API.get(`/managers/${currentUser.uid}.json`);
      const existingParkingLots = managerResponse.data.parkingLots || [];
  
      // Step 3: Update the manager's parkingLots array in Firebase
      await API.patch(`/managers/${currentUser.uid}.json`, {
        parkingLots: [...existingParkingLots, parkingLotId],
      });
  
      // Step 4: Refresh the manager's profile to ensure we get updated parking lots
      await refreshManagerProfile();
  
      // Step 5: Fetch updated parking lots again
      const updatedResponse = await API.get(`/managers/${currentUser.uid}/parkingLots.json`);
      const updatedParkingLotIds = updatedResponse.data || [];
      
      const updatedParkingLots = await Promise.all(
        updatedParkingLotIds.map(async (id) => {
          const lotResponse = await API.get(`/parkingLots/${id}.json`);
          return {
            id,
            ...lotResponse.data,
          };
        })
      );
  
      // Step 6: Update state
      setParkingLots(updatedParkingLots);
      setShowForm(false);
      setFormData({ name: "", location: "", floors: [] });
  
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
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                required
              />
            </label>
            <label>
              Location:
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleFormChange}
                required
              />
            </label>

            <h3>Floors</h3>
            {formData.floors.map((floor, floorIndex) => (
              <div key={floorIndex} className="floor-section">
                <h4>Floor {floorIndex + 1}</h4>
                <button type="button" onClick={() => handleAddRow(floorIndex)}>
                  Add Row
                </button>

                {floor.rows.map((row, rowIndex) => (
                  <div key={rowIndex} className="row-section">
                    <h5>Row {rowIndex + 1}</h5>
                    <button type="button" onClick={() => handleAddSpot(floorIndex, rowIndex)}>
                      Add Spot
                    </button>

                    {row.spots.map((spot, spotIndex) => (
                      <div key={spotIndex} className="spot-section">
                        <h6>Spot {spotIndex + 1}</h6>
                        <label>
                          Type:
                          <select
                            value={spot.type}
                            onChange={(e) => {
                              const updatedFloors = [...formData.floors];
                              updatedFloors[floorIndex].rows[rowIndex].spots[spotIndex].type =
                                e.target.value;
                              setFormData({
                                ...formData,
                                floors: updatedFloors,
                              });
                            }}
                          >
                            <option value="general">General</option>
                            <option value="handicapped">Handicapped</option>
                            <option value="EV">EV</option>
                            <option value="subscription">Subscription</option>
                          </select>
                        </label>
                        <label>
                          Reserved:
                          <input
                            type="checkbox"
                            checked={spot.isReserved}
                            onChange={(e) => {
                              const updatedFloors = [...formData.floors];
                              updatedFloors[floorIndex].rows[rowIndex].spots[spotIndex].isReserved =
                                e.target.checked;
                              setFormData({
                                ...formData,
                                floors: updatedFloors,
                              });
                            }}
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            <button type="button" onClick={handleAddFloor}>
              Add Floor
            </button>
            <button type="submit">Submit</button>
            <button type="button" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ParkingLots;