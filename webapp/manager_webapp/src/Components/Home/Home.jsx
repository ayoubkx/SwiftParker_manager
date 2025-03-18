import React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../../backend/config/contexts/authContext";
import { getManagerInfo } from "../../backend/apiFunction";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [managerName, setManagerName] = useState("");


  useEffect(() => {
    const fetchManagerInfo = async () => {
      if (!currentUser) return; // Ensure currentUser exists
      try {
        const managerData = await getManagerInfo(currentUser.uid);
        setManagerName(`${managerData.firstName} ${managerData.lastName}`);
      } catch (error) {
        console.error("Error fetching manager info:", error);
      }
    };

    fetchManagerInfo();
  }, [currentUser]);
  
  return (
    <div className="home-container">
      <h1 className="home-title">Dashboard</h1>
      <p className="welcome-message">Welcome back, {managerName}!</p>
      <div className="card-container">
        {/* Users Card */}
        <div className="card">
          <div className="card-header bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="card-body">
            <h5 className="card-title">Manage Subscribed Users</h5>
            <p className="card-description">
              Perform operations for subscribed user management, including renewing and canceling their subscription.
            </p>
          </div>
          <div className="card-footer">
          </div>
        </div>

        {/* Parking Lot Card */}
        <div className="card">
          <div className="card-header bg-gradient-to-r from-green-500 to-green-600"></div>
          <div className="card-body">
            <h5 className="card-title">Parking Lot Management</h5>
            <p className="card-description">
              Manage parking lots, floors, rows, and parking spots with ease.
            </p>
          </div>
          <div className="card-footer">
            <button
              className="card-button"
              onClick={() => navigate("/parking-list")}
            >
              Go to Parking Lot
            </button>
          </div>
        </div>

        {/* Payments Card */}
        <div className="card">
          <div className="card-header bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          <div className="card-body">
            <h5 className="card-title">Parking Session Logs</h5>
            <p className="card-description">
              View updates about your parking lots, including and exit times, payment status.
            </p>
          </div>
          <div className="card-footer">
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
