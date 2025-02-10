import { BrowserRouter as Router, Routes, Route, Navigate,useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './backend/config/contexts/authContext';
import NavBar from './Components/NavBar/NavBar';
import Login from './Components/Login/Login';
import Register from './Components/Login/Register';
import ForgotPassword from './Components/Login/ForgotPassword';
import CRUD from './Components/CRUD/CRUD';
import ParkingLot from './Components/ParkingLot/ParkingLot';
import FloorDetails from './Components/Floor/FloorDetails';
import './App.css';
import SpotsManagement from "./Components/Spots/SpotsManagement";
import Payments from "./Components/Payments/Payments";
import ParkingLog from "./Components/ParkingLog/ParkingLog";
import Home from "./Components/Home/Home";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!userLoggedIn) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <NavBar />
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/crud" element={
            <ProtectedRoute>
              <CRUD />
            </ProtectedRoute>
          } />
          <Route path="/parkinglot" element={
            <ProtectedRoute>
              <ParkingLot />
            </ProtectedRoute>
          } />
          <Route path="/floor/:floorNumber" element={
            <ProtectedRoute>
              <FloorDetails />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const location = useLocation();

  // Hide the NavBar for login pages
  const hideNavBar = location.pathname === "/" || location.pathname === "/login";

  return (
    <>
      {!hideNavBar && <NavBar />}
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CRUD" element={<CRUD />} />
        <Route path="/parkinglot" element={<ParkingLot />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/parkinglog" element={<ParkingLog />} />
        <Route path="/floor/:floorNumber" element={<FloorDetails />} />
        <Route path="/row/:rowNumber/spots" element={<SpotsManagement />} />
      </Routes>
    </>
  );
}

export default App;
