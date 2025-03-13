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
    phoneNumber: "",
    hourlyRateWeekday: "",
    dailyRateWeekday: "",
    hourlyRateWeekend: "",
    dailyRateWeekend: "",
    subscriptionRate: "",
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
            phoneNumber: response.data.phoneNumber || "",
            hourlyRateWeekday: response.data.hourlyRateWeekday || "",
            dailyRateWeekday: response.data.dailyRateWeekday || "",
            hourlyRateWeekend: response.data.hourlyRateWeekend || "",
            dailyRateWeekend: response.data.dailyRateWeekend || "",
            subscriptionRate: response.data.subscriptionRate || "",
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

  const handleAddFloor = () => {
    const newFloorId = formData.floors.length;
    setFormData((prevData) => ({
      ...prevData,
      floors: [...prevData.floors, { floorId: newFloorId, rows: [] }],
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const updatedData = {
        ...formData,
        hourlyRateWeekday: parseFloat(formData.hourlyRateWeekday) || 0,
        dailyRateWeekday: parseFloat(formData.dailyRateWeekday) || 0,
        hourlyRateWeekend: parseFloat(formData.hourlyRateWeekend) || 0,
        dailyRateWeekend: parseFloat(formData.dailyRateWeekend) || 0,
        subscriptionRate: parseFloat(formData.subscriptionRate) || 0,
      };

      await API.patch(`/parkingLots/${lotId}.json`, updatedData);
      alert("Parking lot details updated successfully!");
    } catch (error) {
      console.error("Error updating parking lot:", error);
      setError("Failed to update parking lot.");
    }
  };

  const calculateTotalSpots = (type) => {
    return formData.floors.reduce((total, floor) => {
      if (!Array.isArray(floor.rows)) return total;
      return total + floor.rows.reduce((rowTotal, row) => {
        return rowTotal + row.spots.filter(spot => spot.type === type && spot.status === "available").length;
      }, 0);
    }, 0);
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
            <td>Phone Number</td>
            <td><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Hourly Rate (Weekday)</td>
            <td><input type="number" name="hourlyRateWeekday" value={formData.hourlyRateWeekday} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Daily Rate (Weekday)</td>
            <td><input type="number" name="dailyRateWeekday" value={formData.dailyRateWeekday} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Hourly Rate (Weekend)</td>
            <td><input type="number" name="hourlyRateWeekend" value={formData.hourlyRateWeekend} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Daily Rate (Weekend)</td>
            <td><input type="number" name="dailyRateWeekend" value={formData.dailyRateWeekend} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Subscription Rate</td>
            <td><input type="number" name="subscriptionRate" value={formData.subscriptionRate} onChange={handleChange} /></td>
          </tr>
          <tr>
            <td>Available Spots</td>
            <td>
              <div>Total General Spots: {calculateTotalSpots("general")}</div>
              <div>Total EV Spots: {calculateTotalSpots("EV")}</div>
              <div>Total Handicapped Spots: {calculateTotalSpots("handicapped")}</div>
              <div>Total Subscription Spots: {calculateTotalSpots("subscription")}</div>
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
