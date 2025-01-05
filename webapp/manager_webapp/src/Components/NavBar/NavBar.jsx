import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './NavBar.css';
import logo from '../../Images/SP_logo.png'

const NavBar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login'); 
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo or Home */}
        
        <Link to="/" className="navbar-logo">
        <img src={logo} alt="SwiftParker Logo" className="navbar-logo-image" />
        <span className="navbar-logo-text">SwiftParker Manager</span>
        </Link>


        {/* Navigation Menu */}
        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/crud" className="nav-links">CRUD</Link>
          </li>
          <li className="nav-item">
            <Link to="/parkinglot" className="nav-links">Parking Lot</Link>
          </li>
          <li className="nav-item logout-button" onClick={handleLogout}>
            <span className="nav-links">Logout</span>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default NavBar;
