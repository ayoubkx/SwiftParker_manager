import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import NavBar from './Components/NavBar/NavBar';
import Login from './Components/Login/Login';
import CRUD from './Components/CRUD/CRUD';
import ParkingLot from './Components/ParkingLot/ParkingLot';
import FloorDetails from './Components/Floor/FloorDetails';
import './App.css';

function App() {
  return (

    <Router>
      <NavBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/CRUD" element={<CRUD />} />
        <Route path="/parkinglot" element={<ParkingLot />} />
        <Route path="/floor/:floorNumber" element={<FloorDetails />} /> 
      </Routes>
    </Router>
  );
}

export default App;