import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./Components/NavBar/NavBar";
import Login from "./Components/Login/Login";
import CRUD from "./Components/CRUD/CRUD";
import ParkingLot from "./Components/ParkingLot/ParkingLot";
import FloorDetails from "./Components/Floor/FloorDetails";
import SpotsManagement from "./Components/Spots/SpotsManagement";
import Payments from "./Components/Payments/Payments";
import ParkingLog from "./Components/ParkingLog/ParkingLog";
import Home from "./Components/Home/Home";

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
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
