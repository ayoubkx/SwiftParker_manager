import React from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();

  const managerName = localStorage.getItem("managerName") || "Manager";


  return (
    <div className="home-container">
      <h1 className="home-title">Dashboard</h1>
      <p className="welcome-message">Welcome back, {managerName}!</p>
      <div className="card-container">
        {/* Users Card */}
        <div className="card">
          <div className="card-header bg-gradient-to-r from-blue-500 to-blue-600"></div>
          <div className="card-body">
            <h5 className="card-title">Manage Users</h5>
            <p className="card-description">
              Perform CRUD operations for user management, including creating, editing, and deleting user details.
            </p>
          </div>
          <div className="card-footer">
            <button
              className="card-button"
              onClick={() => navigate("/CRUD")}
            >
              Go to Users
            </button>
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
              onClick={() => navigate("/parkinglot")}
            >
              Go to Parking Lot
            </button>
          </div>
        </div>

        {/* Payments Card */}
        <div className="card">
          <div className="card-header bg-gradient-to-r from-yellow-500 to-yellow-600"></div>
          <div className="card-body">
            <h5 className="card-title">Payments</h5>
            <p className="card-description">
              View and manage payment details for transactions within the system.
            </p>
          </div>
          <div className="card-footer">
            <button
              className="card-button"
              onClick={() => navigate("/payments")}
            >
              Go to Payments
            </button>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="card">
          <div className="card-header bg-gradient-to-r from-purple-500 to-purple-600"></div>
          <div className="card-body">
            <h5 className="card-title">Analytics</h5>
            <p className="card-description">
              View insights and analytics for system usage, trends, and reports.
            </p>
          </div>
          <div className="card-footer">
            <button
              className="card-button"
              onClick={() => navigate("/analytics")}
            >
              Go to Analytics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
