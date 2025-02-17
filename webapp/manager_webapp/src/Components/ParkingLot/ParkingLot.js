import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../backend/api";
import "./ParkingLot.css";

const ParkingLot = () => {
  const { lotId } = useParams(); 
  const navigate = useNavigate();

  const [parkingLot, setParkingLot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    dailyRateWeekday: "",
    dailyRateWeekend: "",
    availableSpots: { EV: 0, general: 0, handicapped: 0, subscription: 0 },
    floors: [],
  });

  useEffect(() => {
    const fetchParkingLot = async () => {
      try {
        const response = await API.get(`/parkingLots/${lotId}.json`);
        if (response.data) {
          setParkingLot({ id: lotId, ...response.data });
          setFormData({
            name: response.data.name,
            location: response.data.location,
            dailyRateWeekday: response.data.dailyRateWeekday || "",
            dailyRateWeekend: response.data.dailyRateWeekend || "",
            availableSpots: response.data.availableSpots || { EV: 0, general: 0, handicapped: 0, subscription: 0 },
            floors: response.data.floors || [],
          });
        } else {
          setError("Parking lot not found.");
        }
      } catch (err) {
        console.error("Error fetching parking lot:", err);
        setError("Failed to load parking lot details.");
      } finally {
        setLoading(false);
      }
    };

    fetchParkingLot();
  }, [lotId]);

  const handleManageFloor = (floorId) => {
    navigate(`/parking-lot/${parkingLot.id}/floor/${floorId}`);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSpotChange = (e, type) => {
    const value = parseInt(e.target.value) || 0;
    setFormData((prevData) => ({
      ...prevData,
      availableSpots: { ...prevData.availableSpots, [type]: value },
    }));
  };

  const handleAddFloor = () => {
    const newFloorId = formData.floors.length;
    setFormData((prevData) => ({
      ...prevData,
      floors: [...prevData.floors, { floorId: newFloorId, rows: [] }],
    }));
  };

  const handleSaveChanges = async () => {
    try {
      await API.patch(`/parkingLots/${lotId}.json`, formData);
      alert("Parking lot details updated successfully!");
    } catch (error) {
      console.error("Error updating parking lot:", error);
      setError("Failed to update parking lot.");
    }
  };

  if (loading) return <div className="loading-message">Loading parking lot details...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="parking-lot-container">
      <div className="parking-details-title">
        <h1>Edit Parking Lot Details</h1>
      </div>
      <table className="parking-lot-table">
        <tbody>
          <tr>
            <td>Lot ID</td>
            <td>{parkingLot.id}</td>
          </tr>
          <tr>
            <td>Name</td>
            <td><input type="text" name="name" value={formData.name} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Location</td>
            <td><input type="text" name="location" value={formData.location} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Daily Rate (Weekday)</td>
            <td><input type="number" name="dailyRateWeekday" value={formData.dailyRateWeekday} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Daily Rate (Weekend)</td>
            <td><input type="number" name="dailyRateWeekend" value={formData.dailyRateWeekend} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Available Spots</td>
            <td>
              <label>General: <input type="number" value={formData.availableSpots.general} onChange={(e) => handleSpotChange(e, "general")} /></label>
              <label>EV: <input type="number" value={formData.availableSpots.EV} onChange={(e) => handleSpotChange(e, "EV")} /></label>
              <label>Handicapped: <input type="number" value={formData.availableSpots.handicapped} onChange={(e) => handleSpotChange(e, "handicapped")} /></label>
              <label>Subscription: <input type="number" value={formData.availableSpots.subscription} onChange={(e) => handleSpotChange(e, "subscription")} /></label>
            </td>
          </tr>
          <tr>
            <td>Floors</td>
            <td>
              {formData.floors.length > 0 ? (
                formData.floors.map((floor, index) => (
                  <div key={index} className="item-row">
                    <span>Floor {floor.floorId}</span>
                    <button className="manage-button" onClick={() => handleManageFloor(floor.floorId)}>Manage</button>
                  </div>
                ))
              ) : (
                <span>No floors available.</span>
              )}
              <button className="add-floor-button" onClick={handleAddFloor}>New Floor</button>
            </td>
          </tr>
        </tbody>
      </table>
      <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
    </div>
  );
};

export default ParkingLot;

