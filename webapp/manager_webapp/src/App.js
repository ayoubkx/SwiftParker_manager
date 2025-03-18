import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './backend/config/contexts/authContext';
import NavBar from './Components/NavBar/NavBar';
import Login from './Components/Login/Login';
import Register from './Components/Login/Register';
import ForgotPassword from './Components/Login/ForgotPassword';
import CRUD from './Components/CRUD/CRUD';
import ParkingLot from './Components/ParkingLot/ParkingLot';
import FloorDetails from './Components/Floor/FloorDetails';
import SpotsManagement from "./Components/Spots/SpotsManagement";
import Payments from "./Components/Payments/Payments";
import ParkingLog from "./Components/ParkingLog/ParkingLog";
import Home from "./Components/Home/Home";
import ParkingLots from './Components/ParkingLots/ParkingLots';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { userLoggedIn, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!userLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// AppContent Component to handle NavBar visibility
const AppContent = () => {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password', '/'].includes(location.pathname);

  return (
    <>
      {!isAuthPage && <NavBar />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route path="/home" element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        } />
          <Route path="/crud/:lotId" element={
          <ProtectedRoute>
            <CRUD />
          </ProtectedRoute>
        } />
        <Route path="/parkinglot/:lotId" element={
          <ProtectedRoute>
            <ParkingLot />
          </ProtectedRoute>
        } />
        <Route path="/parking-list" element={
          <ProtectedRoute>
            <ParkingLots />
          </ProtectedRoute>
        } />
        <Route path="/payments" element={
          <ProtectedRoute>
            <Payments />
          </ProtectedRoute>
        } />
        <Route path="/parkinglog/:lotId" element={
          <ProtectedRoute>
            <ParkingLog />
          </ProtectedRoute>
        } />
        <Route path="/parking-lot/:parkingLotId/floor/:floorId" element={
          <ProtectedRoute>
            <FloorDetails />
          </ProtectedRoute>
        } />
        <Route path="/parkinglot/:parkingLotId/floor/:floorId/row/:rowId/spots" element={
          <ProtectedRoute>
            <SpotsManagement />
          </ProtectedRoute>
        } />

        {/* Catch all route - redirect to home if logged in, login if not */}
        <Route path="*" element={
          <ProtectedRoute>
            <Navigate to="/home" replace />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;