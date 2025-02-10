import { 
  addParkingLot,
  getManagerParkingLots,
  getParkingLot,
  updateParkingLot,
  deleteParkingLot,
  addFloor,
  addRow,
  addSpot,
  getFloors,
  getParkingSpots,
  getFloorSpots,
  getFloorRows,
  deleteFloor,
  deleteRow,
  deleteSpot,
  updateSpot,
  addDevice,
  getAllDevices,
  deleteDevice,
  addDeviceToSpot,
  removeDeviceFromSpot
} from '../controller/parkingLots.js';

export default function setupParkingLotRoutes(app) {
  app.post('/api/parkingLots', addParkingLot);
  app.get('/api/managers/:managerId/parkingLots', getManagerParkingLots);
  app.get('/api/parkingLots/:parkingLotId', getParkingLot);
  app.patch('/api/parkingLots/:parkingLotId', updateParkingLot);
  app.delete('/api/managers/:managerId/parkingLots/:parkingLotId', deleteParkingLot);
  
 // Floor management routes
 app.post('/api/parkingLots/:parkingLotId/floors', addFloor);
 app.get('/api/parkingLots/:parkingLotId/floors', getFloors);
 app.delete('/api/parkingLots/:parkingLotId/floors/:floorId', deleteFloor);

 // Row management routes
 app.post('/api/parkingLots/:parkingLotId/floors/:floorId/rows', addRow);
 app.get('/api/parkingLots/:parkingLotId/floors/:floorId/rows', getFloorRows);
 app.delete('/api/parkingLots/:parkingLotId/floors/:floorId/rows/:rowId', deleteRow);

 // Spot management routes
 app.post('/api/parkingLots/:parkingLotId/floors/:floorId/rows/:rowId/spots', addSpot);
 app.get('/api/parkingLots/:parkingLotId/spots', getParkingSpots);
 app.get('/api/parkingLots/:parkingLotId/floors/:floorId/spots', getFloorSpots);
 app.delete('/api/parkingLots/:parkingLotId/floors/:floorId/rows/:rowId/spots/:spotId', deleteSpot);
 app.patch('/api/parkingLots/:parkingLotId/floors/:floorId/rows/:rowId/spots/:spotId', updateSpot);

 //device management routes
 app.post('/api/device',addDevice);
 app.get('/api/device', getAllDevices);
 app.delete('/api/device/:deviceId', deleteDevice);
 app.patch('/api/parkingLots/:parkingLotId/floors/:floorId/rows/:rowId/spots/:spotId/device',addDeviceToSpot);
 app.delete('/api/parkingLots/:parkingLotId/floors/:floorId/rows/:rowId/spots/:spotId/device', removeDeviceFromSpot);

}