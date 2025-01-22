import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './backend/config/contexts/authContext';
import NavBar from './Components/NavBar/NavBar';
import Login from './Components/Login/Login';
import Register from './Components/Login/Register';
import ForgotPassword from './Components/Login/ForgotPassword';
import CRUD from './Components/CRUD/CRUD';
import ParkingLot from './Components/ParkingLot/ParkingLot';
import FloorDetails from './Components/Floor/FloorDetails';
import './App.css';

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

export default App;