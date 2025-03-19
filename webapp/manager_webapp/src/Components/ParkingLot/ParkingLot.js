import React, { useEffect, useState } from "react"
import { useAuth } from "../../backend/config/contexts/authContext";
import { useParams, useNavigate } from "react-router-dom";
import { deleteParkingLot, updateParkingLot, createFloor, getParkingLotInfo, getFloors } from "../../backend/apiFunction";
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
        const parkingLotData = await getParkingLotInfo(lotId);
        setParkingLot({ id: lotId, ...parkingLotData });

        // Fetch floors data
        const floorsData = await getFloors(lotId);

        setFormData({
          name: parkingLotData.name,
          location: parkingLotData.location,
          phoneNumber: parkingLotData.phoneNumber || "",
          hourlyRateWeekday: parkingLotData.hourlyRateWeekday || "",
          dailyRateWeekday: parkingLotData.dailyRateWeekday || "",
          hourlyRateWeekend: parkingLotData.hourlyRateWeekend || "",
          dailyRateWeekend: parkingLotData.dailyRateWeekend || "",
          subscriptionRate: parkingLotData.subscriptionRate || "",
          availableSpots: parkingLotData.availableSpots,
          floors: floorsData || [], 
        });
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

  const handleAddFloor = async () => {
    try {
      await createFloor(parkingLot.id);
      
      // Fetch updated floors list
      const updatedFloors = await getFloors(parkingLot.id);

      setFormData((prevData) => ({
        ...prevData,
        floors: updatedFloors || [],
      }));

      alert("New floor added successfully!");
    } catch (error) {
      console.error("Error adding new floor:", error);
      setError("Failed to add new floor.");
    }
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

      await updateParkingLot(parkingLot.id, updatedData);
      alert("Parking lot details updated successfully!");
    } catch (error) {
      console.error("Error updating parking lot:", error);
      setError("Failed to update parking lot.");
    }
  };

  const { currentUser } = useAuth();
  const handleDeleteParkingLot = async () => {
    if (window.confirm("Are you sure you want to delete this parking lot?")) {
      try {
        if (!currentUser) {
          throw new Error("No manager is logged in.");
        }
  
        await deleteParkingLot(currentUser.uid, parkingLot.id); // Use currentUser.uid for managerId
        alert("Parking lot deleted successfully!");
        navigate("/parking-list");
      } catch (error) {
        console.error("Error deleting parking lot:", error);
        setError("Failed to delete parking lot.");
      }
    }
  };

  const getTotalSpots = (type) => {
    return formData.availableSpots?.[type] || 0;
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
          <td><input type="text" name="name" value={formData.name} onChange={handleChange}/></td>
        </tr>
        <tr>
          <td>Location</td>
          <td><input type="text" name="location" value={formData.location} onChange={handleChange}/></td>
        </tr>
        <tr>
          <td>Phone Number</td>
          <td><input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange}/></td>
        </tr>
        <tr>
          <td>Hourly Rate (Weekday)</td>
          <td><input type="number" name="hourlyRateWeekday" value={formData.hourlyRateWeekday} onChange={handleChange}/>
          </td>
        </tr>
        <tr>
          <td>Daily Rate (Weekday)</td>
          <td><input type="number" name="dailyRateWeekday" value={formData.dailyRateWeekday} onChange={handleChange}/>
          </td>
        </tr>
        <tr>
          <td>Hourly Rate (Weekend)</td>
          <td><input type="number" name="hourlyRateWeekend" value={formData.hourlyRateWeekend} onChange={handleChange}/>
          </td>
        </tr>
        <tr>
          <td>Daily Rate (Weekend)</td>
          <td><input type="number" name="dailyRateWeekend" value={formData.dailyRateWeekend} onChange={handleChange}/>
          </td>
        </tr>
        <tr>
          <td>Subscription Rate</td>
          <td><input type="number" name="subscriptionRate" value={formData.subscriptionRate} onChange={handleChange}/>
          </td>
        </tr>
        <tr>
          <td>Available Spots</td>
          <td>
            <div className="spots-grid">
              <div className="spot-card">
                <span className="spot-type">General</span>
                <span className="spot-count">{getTotalSpots("general")}</span>
              </div>
              <div className="spot-card">
                <span className="spot-type">EV</span>
                <span className="spot-count">{getTotalSpots("EV")}</span>
              </div>
              <div className="spot-card">
                <span className="spot-type">Handicapped</span>
                <span className="spot-count">{getTotalSpots("handicapped")}</span>
              </div>
              <div className="spot-card">
                <span className="spot-type">Subscription</span>
                <span className="spot-count">{getTotalSpots("subscription")}</span>
              </div>
            </div>
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
      <div className="button-container">
        <button className="save-button" onClick={handleSaveChanges}>Save Changes</button>
        <button className="delete-button" onClick={handleDeleteParkingLot}>Delete Parking Lot</button>
      </div>
    </div>
  );
};

export default ParkingLot;
