import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doSignOut } from '../../backend/config/auth';
import { useAuth } from '../../backend/config/contexts/authContext';
import './NavBar.css';
import logo from '../../Images/SP_logo.png';

const NavBar = () => {
  const navigate = useNavigate();
  const { userLoggedIn } = useAuth();

  const handleLogout = async () => {
    try {
      await doSignOut();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!userLoggedIn) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo or Home */}

        <Link to="/home" className="navbar-logo">
          <img src={logo} alt="SwiftParker Logo" className="navbar-logo-image" />
          <span className="navbar-logo-text">SwiftParker Manager</span>
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/crud" className="nav-links">Users</Link>
          </li>
          <li className="nav-item">
            <Link to="/parking-list" className="nav-links">My Parking Lots</Link>
          </li>
          <li className="nav-item">
            <Link to="/payments" className="nav-links">Payments</Link>
          </li>
          <li className="nav-item">
            <Link to="/parkinglog" className="nav-links">Logs</Link>
          </li>
          <li className="nav-item logout-button" onClick={handleLogout}>
            <span className="nav-links">Logout</span>
          </li>
        </ul>
      </div>
    </nav >
  );
};

export default NavBar;



