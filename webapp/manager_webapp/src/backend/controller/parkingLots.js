// import API from '../api.js';

// // Parking Lot Management

// Add a new parking lot for a specific manager. 
// export const addParkingLot = async (
//   managerId, 
//   name, 
//   location, 
//   hourlyRateWeekday,
//   dailyRateWeekday,
//   hourlyRateWeekend,
//   dailyRateWeekend,
//   subscriptionRate,
//   phoneNumber
// ) => {
//   try {
//     // Get current manager data
//     const managerResponse = await API.get(`/managers/${managerId}.json`);
//     const managerData = managerResponse.data;

//     if (!managerData) {
//       throw new Error('Manager not found');
//     }

//     // Get all existing parking lots
//     const parkingLotsResponse = await API.get('/parkingLots.json');
//     const parkingLotsData = parkingLotsResponse.data;

//     if (parkingLotsData) {
//       const existingLot = Object.values(parkingLotsData).find(
//         (lot) => lot.name === name && lot.location === location
//       );
//       if (existingLot) {
//         throw new Error('Parking lot with the same name and address already exists');
//       }
//     }

//     // Geocode the location using OpenStreetMap Nominatim API
//     const geocodingResponse = await fetch(
//       `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
//     );
//     const geocodingData = await geocodingResponse.json();

//     if (!geocodingData || geocodingData.length === 0) {
//       throw new Error('Unable to geocode the provided location');
//     }

//     // Get the first result and extract coordinates and formatted address
//     const firstResult = geocodingData[0];
//     const latitude = parseFloat(firstResult.lat);
//     const longitude = parseFloat(firstResult.lon);
//     const formattedLocation = firstResult.display_name;

//     // Create the parking lot with coordinates, formatted address, and rates
//     const newParkingLot = {
//       name,
//       location: formattedLocation, // Use the formatted address from geocoding
//       latitude,
//       longitude,
//       hourlyRateWeekday,
//       dailyRateWeekday,
//       hourlyRateWeekend,
//       dailyRateWeekend,
//       subscriptionRate,
//       phoneNumber,
//       managerId,
//       floors: [],
//       createdAt: new Date().toISOString(),
//       // Initialize available spots structure
//       availableSpots: {
//         general: 0,
//         handicapped: 0,
//         EV: 0,
//         subscription: 0
//       }
//     };

//     // Add the parking lot to the parkingLots collection
//     const parkingLotResponse = await API.post('/parkingLots.json', newParkingLot);
//     const parkingLotId = parkingLotResponse.data.name;

//     // Add the parking lot ID to the manager's parkingLots array
//     const updatedParkingLots = [...(managerData.parkingLots || []), parkingLotId];

//     // Update the manager's parkingLots array
//     await API.patch(`/managers/${managerId}.json`, {
//       parkingLots: updatedParkingLots
//     });

//     return {
//       success: true,
//       parkingLotId,
//       parkingLot: {
//         id: parkingLotId,
//         ...newParkingLot
//       }
//     };
//   } catch (error) {
//     console.error('Error adding parking lot:', error);
//     throw error;
//   }
// };

// // Get all parking lots for a specific manager.
// export const getManagerParkingLots = async (managerId) => {
//   try {
//     const managerResponse = await API.get(`/managers/${managerId}.json`);
//     const parkingLotIds = managerResponse.data.parkingLots || [];

//     if (parkingLotIds.length === 0) {
//       return [];
//     }

//     const parkingLots = await Promise.all(
//       parkingLotIds.map(async (id) => {
//         const response = await API.get(`/parkingLots/${id}.json`);
//         return {
//           id,
//           ...response.data
//         };
//       })
//     );

//     return parkingLots;
//   } catch (error) {
//     console.error('Error getting parking lots:', error);
//     throw error;
//   }
// };

// // Get the all the info of a specific parking lot by its ID.
// export const getParkingLot = async (parkingLotId) => {
//   try {
//     const response = await API.get(`/parkingLots/${parkingLotId}.json`);

//     if (!response.data) {
//       throw new Error('Parking lot not found');
//     }

//     return {
//       id: parkingLotId,
//       ...response.data
//     };
//   } catch (error) {
//     console.error('Error getting parking lot:', error);
//     throw error;
//   }
// };

// //--------------------get the parking lot info needed by the user
// export const getParkingLotInfo = async (parkingLotId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     return {
//       name: parkingLotData.name,
//       location: parkingLotData.location,
//       hourlyRateWeekday: parkingLotData.hourlyRateWeekday,
//       dailyRateWeekday: parkingLotData.dailyRateWeekday,
//       hourlyRateWeekend: parkingLotData.hourlyRateWeekend,
//       dailyRateWeekend: parkingLotData.dailyRateWeekend,
//       subscriptionRate: parkingLotData.subscriptionRate,
//       phoneNumber: parkingLotData.phoneNumber,
//       availableSpots: parkingLotData.availableSpots || {
//         general: 0,
//         handicapped: 0,
//         EV: 0,
//         subscription: 0
//       }
//     };
//   } catch (error) {
//     console.error('Error getting parking lot information:', error);
//     throw error;
//   }
// };

// // Update the info of a specific parking lot by its ID.
// export const updateParkingLot = async (parkingLotId, updateData) => {
//   try {
//     const currentLot = await API.get(`/parkingLots/${parkingLotId}.json`);

//     if (!currentLot.data) {
//       throw new Error('Parking lot not found');
//     }

//     const updatedLot = {
//       ...currentLot.data,
//       ...updateData,
//       updatedAt: new Date().toISOString()
//     };

//     await API.patch(`/parkingLots/${parkingLotId}.json`, updatedLot);

//     return {
//       id: parkingLotId,
//       ...updatedLot
//     };
//   } catch (error) {
//     console.error('Error updating parking lot:', error);
//     throw error;
//   }
// };

// // Delete a specific parking lot by its ID.
// export const deleteParkingLot = async (managerId, parkingLotId) => {
//   try {
//     // Get the parking lot data first to find all devices
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     // Collect all devices in the parking lot using flatMap
//     const deviceReferences = new Set(
//       (parkingLotData.floors || [])
//         .flatMap(floor => floor.rows || [])
//         .flatMap(row => row.spots || [])
//         .filter(spot => spot?.deviceId)
//         .map(spot => spot.deviceId)
//     );

//     // Clean up all device references in parallel
//     const deviceCleanupPromises = Array.from(deviceReferences).map(async deviceId => {
//       try {
//         // Reset all device location data
//         return API.patch(`/device/${deviceId}.json`, {
//           parkingLotId: null,
//           floorId: null,
//           rowId: null,
//           spots: []
//         });
//       } catch (deviceError) {
//         console.error(`Error cleaning up device ${deviceId}:`, deviceError);
//       }
//     });

//     // Wait for all device cleanup operations to complete
//     await Promise.all(deviceCleanupPromises);

//     // Get manager data
//     const managerResponse = await API.get(`/managers/${managerId}.json`);
//     const managerData = managerResponse.data;

//     // Remove parking lot from manager's list
//     const updatedParkingLots = (managerData.parkingLots || []).filter(
//       id => id !== parkingLotId
//     );

//     // Update manager's parking lots array
//     await API.patch(`/managers/${managerId}.json`, {
//       parkingLots: updatedParkingLots
//     });

//     // Finally, delete the parking lot
//     await API.delete(`/parkingLots/${parkingLotId}.json`);

//     return {
//       success: true,
//       message: 'Parking lot and associated device references deleted successfully'
//     };
//   } catch (error) {
//     console.error('Error deleting parking lot:', error);
//     throw error;
//   }
// };
// // Floor Management

// // ---------Add a floor to a parking lot------------
// export const addFloor = async (parkingLotId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     let floorId;
//     let updatedFloors;

//     if (parkingLotData.floors === undefined || parkingLotData.floors.length === 0) {
//       floorId = 0;
//       updatedFloors = [{
//         floorId,
//         rows: []
//       }];
//     } else {
//       const lastFloor = parkingLotData.floors[parkingLotData.floors.length - 1];
//       floorId = lastFloor.floorId + 1;
//       updatedFloors = [...parkingLotData.floors, {
//         floorId,
//         rows: []
//       }];
//     }

//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     return {
//       success: true,
//       floorId
//     };
//   } catch (error) {
//     console.error('Error adding floor:', error);
//     throw error;
//   }
// };

// // ---------Get floors for a parking lot------------
// export const getFloors = async (parkingLotId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     return parkingLotData.floors;
//   } catch (error) {
//     console.error('Error getting floors:', error);
//     throw error;
//   }
// };

//  // --------Delete a floor from a parking lot
// export const deleteFloor = async (parkingLotId, floorId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floorIndex = parkingLotData.floors.findIndex((f) => f.floorId === parseInt(floorId));

//     if (floorIndex === -1) {
//       throw new Error('Floor not found');
//     }

//     const floor = parkingLotData.floors[floorIndex];
//     if (floor.rows && floor.rows.length > 0) {
//       throw new Error('Cannot delete floor with existing rows');
//     }

//     const updatedFloors = parkingLotData.floors.filter((f) => f.floorId !== parseInt(floorId));

//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     return {
//       success: true,
//       message: 'Floor deleted successfully'
//     };
//   } catch (error) {
//     console.error('Error deleting floor:', error);
//     throw error;
//   }
// };

// // Row Management

// // -------Add a row to a floor
// export const addRow = async (parkingLotId, floorId, rowId) => {
//   try {
//     if (rowId === undefined || rowId === null) {
//       throw new Error('Row ID is required');
//     }

//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     if (floor.rows) {
//       const rowExists = floor.rows.some((row) => row.rowId === rowId);
//       if (rowExists) {
//         throw new Error(`Row with ID ${rowId} already exists on this floor`);
//       }
//     }

//     let updatedFloors;
//     const newRow = {
//       rowId: rowId,
//       spots: []
//     };

//     if (floor.rows === undefined) {
//       updatedFloors = parkingLotData.floors.map((f) =>
//         f.floorId === parseInt(floorId) ? { ...f, rows: [newRow] } : f
//       );
//     } else {
//       updatedFloors = parkingLotData.floors.map((f) =>
//         f.floorId === parseInt(floorId) ? { ...f, rows: [...f.rows, newRow] } : f
//       );
//     }

//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     return {
//       success: true,
//       rowId: rowId
//     };
//   } catch (error) {
//     console.error('Error adding row:', error);
//     throw error;
//   }
// };

// // ------Get all rows in a floor

// export const getFloorRows = async (parkingLotId, floorId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     return floor.rows;
//   } catch (error) {
//     console.error('Error getting floor rows:', error);
//     throw error;
//   }
// };

// //------- Delete a row from a floor
// export const deleteRow = async (parkingLotId, floorId, rowId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     const rowIndex = floor.rows.findIndex((r) => r.rowId === rowId);

//     if (rowIndex === -1) {
//       throw new Error('Row not found');
//     }

//     const row = floor.rows[rowIndex];
//     if (row.spots && row.spots.length > 0) {
//       throw new Error('Cannot delete row with existing spots');
//     }

//     const updatedRows = floor.rows.filter((r) => r.rowId !== rowId);
//     const updatedFloors = parkingLotData.floors.map((f) =>
//       f.floorId === parseInt(floorId) ? { ...f, rows: updatedRows } : f
//     );

//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     return {
//       success: true,
//       message: 'Row deleted successfully'
//     };
//   } catch (error) {
//     console.error('Error deleting row:', error);
//     throw error;
//   }
// };

// // Spot Management

// //--------- Add a spot to a row
// export const addSpot = async (parkingLotId, floorId, rowId, spotData) => {
//   try {
//     const { type, isReserved, deviceId, sensorId } = spotData;

//     // Make sensorId mandatory when deviceId is provided
//     if (deviceId && (sensorId === undefined || sensorId === null)) {
//       throw new Error('Sensor ID is required when assigning a device');
//     }

//     // If deviceId is not provided but sensorId is, throw error
//     if (!deviceId && sensorId !== undefined) {
//       throw new Error('Cannot assign a sensor ID without a device');
//     }

//     // Validate sensorId if provided
//     if (deviceId && (sensorId !== 0 && sensorId !== 1)) {
//       throw new Error('Sensor ID must be either 0 or 1');
//     }
    
//     // Internal helper function to generate random spot ID
//     const generateSpotId = (length = 8) => {
//       const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//       let result = '';
//       for (let i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length));
//       }
//       return `SPOT-${result}`;
//     };

//     // Get the current parking lot data
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const managerId = parkingLotData.managerId;

//     // Function to check if spotId is unique within manager's parking lots
//     const isSpotIdUniqueForManager = async (spotId) => {
//       const parkingLotsResponse = await API.get('/parkingLots.json');
//       const parkingLots = parkingLotsResponse.data;
      
//       if (!parkingLots) return true;

//       for (const lot of Object.values(parkingLots)) {
//         if (lot.managerId !== managerId) continue;

//         for (const floor of lot.floors || []) {
//           for (const row of floor.rows || []) {
//             const spotExists = (row.spots || []).some(spot => spot.spotId === spotId);
//             if (spotExists) return false;
//           }
//         }
//       }
//       return true;
//     };

//     // Generate a unique spot ID
//     let spotId;
//     let isUnique = false;
//     let attempts = 0;
//     const maxAttempts = 10;

//     while (!isUnique && attempts < maxAttempts) {
//       spotId = generateSpotId();
//       isUnique = await isSpotIdUniqueForManager(spotId);
//       attempts++;
//     }

//     if (!isUnique) {
//       throw new Error('Failed to generate unique spot ID after multiple attempts');
//     }

//     // Find the floor
//     const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     // Find the row
//     const row = floor.rows.find((r) => r.rowId === rowId);
//     if (!row) {
//       throw new Error('Row not found');
//     }

//     // If deviceId is provided, validate it and check location constraints
//     let deviceData;
//     if (deviceId) {
//       const deviceResponse = await API.get(`/device/${deviceId}.json`);
//       deviceData = deviceResponse.data;

//       if (!deviceData) {
//         throw new Error('Device not found');
//       }

//       if (deviceData.spots && deviceData.spots.length >= 2) {
//         throw new Error('Device cannot be assigned to more spots. Maximum limit is 2 spots per device.');
//       }

//       if (deviceData.spots && deviceData.spots.length > 0) {
//         if (deviceData.parkingLotId !== parkingLotId || 
//             deviceData.floorId !== parseInt(floorId) || 
//             deviceData.rowId !== rowId) {
//           throw new Error('All spots for a device must be in the same parking lot, floor, and row');
//         }

//         const existingSpot = parkingLotData.floors
//           .find(f => f.floorId === parseInt(floorId))
//           ?.rows.find(r => r.rowId === rowId)
//           ?.spots.find(s => s.deviceId === deviceId);

//         if (existingSpot && existingSpot.sensorId === sensorId) {
//           throw new Error(`Sensor ID ${sensorId} is already used by another spot in this device`);
//         }
//       }
//     }

//     // Create new spot
//     const newSpot = {
//       spotId,
//       type,
//       status: 'available',
//       isReserved: isReserved || false,
//       ...(deviceId && { deviceId, sensorId })
//     };

//     // Update floors array
//     const updatedFloors = parkingLotData.floors.map((f) =>
//       f.floorId === parseInt(floorId)
//         ? {
//             ...f,
//             rows: f.rows.map((r) =>
//               r.rowId === rowId
//                 ? {
//                     ...r,
//                     spots: [...(r.spots || []), newSpot]
//                   }
//                 : r
//             )
//           }
//         : f
//     );

//     // Update the parking lot
//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     // If device was provided, update device and availability count
//     if (deviceId) {
//       const updatedSpots = deviceData.spots === undefined 
//         ? [spotId]
//         : [...deviceData.spots, spotId];

//       // Update device information
//       await API.patch(`/device/${deviceId}.json`, {
//         spots: updatedSpots,
//         parkingLotId,
//         floorId: parseInt(floorId),
//         rowId: rowId
//       });
//     }

//       // Update available spots count
//       const currentAvailability = parkingLotData.availableSpots?.[type] || 0;
//       const updatedAvailableSpots = {
//         ...parkingLotData.availableSpots,
//         [type]: currentAvailability + 1
//       };

//       await API.patch(`/parkingLots/${parkingLotId}.json`, {
//         availableSpots: updatedAvailableSpots
//       });
//     return {
//       success: true,
//       spotId,
//       spot: newSpot
//     };
//   } catch (error) {
//     console.error('Error adding spot:', error);
//     throw error;
//   }
// };

// //----  Get spot information for the whole parking lot
// export const getParkingSpots = async (parkingLotId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const spots = parkingLotData.floors.flatMap((floor) =>
//       floor.rows.flatMap((row) => row.spots)
//     );

//     return spots;
//   } catch (error) {
//     console.error('Error getting parking spots:', error);
//     throw error;
//   }
// };

// // ---- Get spot information for a specific floor
// export const getFloorSpots = async (parkingLotId, floorId) => {
//   try {
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     if (!floor.rows) {
//       return [];
//     }

//     const spots = floor.rows.flatMap((row) => {
//       if (!row.spots) {
//         return [];
//       }
//       return row.spots;
//     });

//     return spots;
//   } catch (error) {
//     console.error('Error getting floor spots:', error);
//     throw error;
//   }
// };

//  // Delete a spot
// export const deleteSpot = async (parkingLotId, floorId, rowId, spotId) => {
//   try {
//     // Get the parking lot data
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     // Find the floor
//     const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));
//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     // Find the row
//     const row = floor.rows.find(r => r.rowId === rowId);
//     if (!row) {
//       throw new Error('Row not found');
//     }

//     // Find the spot
//     const spot = row.spots.find(s => s.spotId === spotId);
//     if (!spot) {
//       throw new Error('Spot not found');
//     }

//     // Update availableSpots count based on spot type
//     const spotType = spot.type;
//     const currentCount = parkingLotData.availableSpots[spotType] || 0;
//     const updatedAvailableSpots = {
//       ...parkingLotData.availableSpots,
//       [spotType]: Math.max(0, currentCount - 1)
//     };

//     // If spot has a device, update the device's spots array
//     if (spot.deviceId) {
//       const deviceResponse = await API.get(`/device/${spot.deviceId}.json`);
//       const deviceData = deviceResponse.data;

//       if (deviceData) {
//         const updatedSpots = deviceData.spots.filter(s => s !== spotId);
        
//         if (updatedSpots.length === 0) {
//           await API.patch(`/device/${spot.deviceId}.json`, {
//             spots: [],
//             parkingLotId: null,
//             floorId: null,
//             rowId: null
//           });
//         } else {
//           await API.patch(`/device/${spot.deviceId}.json`, {
//             spots: updatedSpots
//           });
//         }
//       }
//     }

//     // Remove the spot from the row
//     const updatedFloors = parkingLotData.floors.map(f => {
//       if (f.floorId === parseInt(floorId)) {
//         return {
//           ...f,
//           rows: f.rows.map(r => {
//             if (r.rowId === rowId) {
//               return {
//                 ...r,
//                 spots: r.spots.filter(s => s.spotId !== spotId)
//               };
//             }
//             return r;
//           })
//         };
//       }
//       return f;
//     });

//     // Update the parking lot
//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors,
//       availableSpots: updatedAvailableSpots
//     });

//     return {
//       success: true,
//       message: 'Spot deleted successfully',
//       updatedAvailability: updatedAvailableSpots
//     };
//   } catch (error) {
//     console.error('Error deleting spot:', error);
//     throw error;
//   }
// };
// //------ Update a spot
// export const updateSpot = async (parkingLotId, floorId, rowId, spotId, updateData) => {
//   try {
//     const { type, status, isReserved } = updateData;
    
//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     const row = floor.rows.find((r) => r.rowId === rowId);

//     if (!row) {
//       throw new Error('Row not found');
//     }

//     const spot = row.spots.find((s) => s.spotId === spotId);

//     if (!spot) {
//       throw new Error('Spot not found');
//     }

//     const updatedSpot = {
//       ...spot,
//       type: type || spot.type,
//       status: status || spot.status,
//       isReserved: isReserved !== undefined ? isReserved : spot.isReserved
//     };

//     const updatedFloors = parkingLotData.floors.map((f) =>
//       f.floorId === parseInt(floorId)
//         ? {
//             ...f,
//             rows: f.rows.map((r) =>
//               r.rowId === rowId
//                 ? {
//                     ...r,
//                     spots: r.spots.map((s) =>
//                       s.spotId === spotId ? updatedSpot : s
//                     )
//                   }
//                 : r
//             )
//           }
//         : f
//     );

//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     return {
//       success: true,
//       spot: updatedSpot
//     };
//   } catch (error) {
//     console.error('Error updating spot:', error);
//     throw error;
//   }
// };

// // Device Management

// //---------add Device 
// export const addDevice = async () => {
//   try {
//     const newDevice = {
//       deviceId: null
//     };

//     const deviceResponse = await API.post('/device.json', newDevice);
//     const deviceId = deviceResponse.data.name;

//     await API.patch(`/device/${deviceId}.json`, {
//       deviceId: deviceId,
//       sensors: [
//         { sensorId: 0, detecting: false },
//         { sensorId: 1, detecting: false }
//       ]
//     });

//     return {
//       success: true,
//       deviceId
//     };
//   } catch (error) {
//     console.error('Error adding device:', error);
//     throw error;
//   }
// };

// //----------  Get all devices from the database
// export const getAllDevices = async () => {
//   try {
//     const devicesResponse = await API.get('/device.json');
//     const devices = devicesResponse.data;

//     if (!devices) {
//       return [];
//     }

//     const formattedDevices = Object.entries(devices).map(([id, device]) => ({
//       id,
//       ...device
//     }));

//     return formattedDevices;
//   } catch (error) {
//     console.error('Error getting devices:', error);
//     throw error;
//   }
// };

// //--------- Delete a device
// export const deleteDevice = async (deviceId) => {
//   try {
//     const deviceResponse = await API.get(`/device/${deviceId}.json`);
//     const deviceData = deviceResponse.data;

//     if (!deviceData) {
//       throw new Error('Device not found');
//     }

//     if (deviceData.spots && deviceData.spots.length > 0) {
//       const { parkingLotId, floorId, rowId } = deviceData;
      
//       const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//       const parkingLotData = parkingLotResponse.data;

//       const updatedFloors = parkingLotData.floors.map(floor => {
//         if (floor.floorId !== floorId) return floor;
        
//         return {
//           ...floor,
//           rows: floor.rows.map(row => {
//             if (row.rowId !== rowId) return row;
            
//             return {
//               ...row,
//               spots: row.spots.map(spot => {
//                 if (deviceData.spots.includes(spot.spotId)) {
//                   const { deviceId, sensorId, ...spotWithoutDevice } = spot;
//                   return spotWithoutDevice;
//                 }
//                 return spot;
//               })
//             };
//           })
//         };
//       });

//       await API.patch(`/parkingLots/${parkingLotId}.json`, {
//         floors: updatedFloors
//       });
//     }

//     await API.delete(`/device/${deviceId}.json`);

//     return {
//       success: true,
//       message: 'Device deleted successfully'
//     };
//   } catch (error) {
//     console.error('Error deleting device:', error);
//     throw error;
//   }
// };

// //---------add Device to a spot
// export const addDeviceToSpot = async (parkingLotId, floorId, rowId, spotId, deviceId, sensorId) => {
//   try {
//     if (!deviceId) {
//       throw new Error('Device ID is required');
//     }

//     if (sensorId === undefined || sensorId === null) {
//       throw new Error('Sensor ID is required when assigning a device');
//     }

//     if (sensorId !== 0 && sensorId !== 1) {
//       throw new Error('Sensor ID must be either 0 or 1');
//     }

//     const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//     const parkingLotData = parkingLotResponse.data;

//     if (!parkingLotData) {
//       throw new Error('Parking lot not found');
//     }

//     const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));
//     if (!floor) {
//       throw new Error('Floor not found');
//     }

//     const row = floor.rows.find(r => r.rowId === rowId);
//     if (!row) {
//       throw new Error('Row not found');
//     }

//     const spot = row.spots.find(s => s.spotId === spotId);
//     if (!spot) {
//       throw new Error('Spot not found');
//     }

//     if (spot.deviceId) {
//       throw new Error('Spot already has a device assigned');
//     }

//     const deviceResponse = await API.get(`/device/${deviceId}.json`);
//     const deviceData = deviceResponse.data;

//     if (!deviceData) {
//       throw new Error('Device not found');
//     }

//     if (deviceData.spots && deviceData.spots.length >= 2) {
//       throw new Error('Device cannot be assigned to more spots. Maximum limit is 2 spots per device.');
//     }

//     if (deviceData.spots && deviceData.spots.length > 0) {
//       if (deviceData.parkingLotId !== parkingLotId || 
//           deviceData.floorId !== parseInt(floorId) || 
//           deviceData.rowId !== rowId) {
//         throw new Error('All spots for a device must be in the same parking lot, floor, and row');
//       }

//       const existingSpot = parkingLotData.floors
//         .find(f => f.floorId === parseInt(floorId))
//         ?.rows.find(r => r.rowId === rowId)
//         ?.spots.find(s => s.deviceId === deviceId);

//       if (existingSpot && existingSpot.sensorId === sensorId) {
//         throw new Error(`Sensor ID ${sensorId} is already used by another spot in this device`);
//       }
//     }

//     const updatedFloors = parkingLotData.floors.map(f => {
//       if (f.floorId === parseInt(floorId)) {
//         return {
//           ...f,
//           rows: f.rows.map(r => {
//             if (r.rowId === rowId) {
//               return {
//                 ...r,
//                 spots: r.spots.map(s => {
//                   if (s.spotId === spotId) {
//                     return {
//                       ...s,
//                       deviceId,
//                       sensorId
//                     };
//                   }
//                   return s;
//                 })
//               };
//             }
//             return r;
//           })
//         };
//       }
//       return f;
//     });

//     await API.patch(`/parkingLots/${parkingLotId}.json`, {
//       floors: updatedFloors
//     });

//     const updatedSpots = deviceData.spots === undefined 
//       ? [spotId]
//       : [...deviceData.spots, spotId];

//       await API.patch(`/device/${deviceId}.json`, {
//         spots: updatedSpots,
//         parkingLotId,
//         floorId: parseInt(floorId),
//         rowId: rowId
//       });
  
//       return {
//         success: true,
//         message: 'Device added to spot successfully'
//       };
//     } catch (error) {
//       console.error('Error adding device to spot:', error);
//       throw error;
//     }
//   };

//   //----------removeDevice from a spot
//   export const removeDeviceFromSpot = async (parkingLotId, floorId, rowId, spotId) => {
//     try {
//       const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
//       const parkingLotData = parkingLotResponse.data;
  
//       if (!parkingLotData) {
//         throw new Error('Parking lot not found');
//       }
  
//       const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));
//       if (!floor) {
//         throw new Error('Floor not found');
//       }
  
//       const row = floor.rows.find(r => r.rowId === rowId);
//       if (!row) {
//         throw new Error('Row not found');
//       }
  
//       const spot = row.spots.find(s => s.spotId === spotId);
//       if (!spot) {
//         throw new Error('Spot not found');
//       }
  
//       if (!spot.deviceId) {
//         throw new Error('No device assigned to this spot');
//       }
  
//       const deviceId = spot.deviceId;
  
//       const updatedFloors = parkingLotData.floors.map(f => {
//         if (f.floorId === parseInt(floorId)) {
//           return {
//             ...f,
//             rows: f.rows.map(r => {
//               if (r.rowId === rowId) {
//                 return {
//                   ...r,
//                   spots: r.spots.map(s => {
//                     if (s.spotId === spotId) {
//                       const { deviceId, sensorId, ...spotWithoutDevice } = s;
//                       return spotWithoutDevice;
//                     }
//                     return s;
//                   })
//                 };
//               }
//               return r;
//             })
//           };
//         }
//         return f;
//       });
  
//       await API.patch(`/parkingLots/${parkingLotId}.json`, {
//         floors: updatedFloors
//       });
  
//       const deviceResponse = await API.get(`/device/${deviceId}.json`);
//       const deviceData = deviceResponse.data;
  
//       if (deviceData) {
//         const updatedSpots = deviceData.spots.filter(s => s !== spotId);
  
//         if (updatedSpots.length === 0) {
//           await API.patch(`/device/${deviceId}.json`, {
//             spots: [],
//             parkingLotId: null,
//             floorId: null,
//             rowId: null
//           });
//         } else {
//           await API.patch(`/device/${deviceId}.json`, {
//             spots: updatedSpots
//           });
//         }//       }
  
//       return {
//         success: true,
//         message: 'Device removed from spot successfully'
//       };
//     } catch (error) {
//       console.error('Error removing device from spot:', error);
//       throw error;
//     }
//   };




// **********COMMENT THE CODE ABOVE AND UNCOMMENT THE CODE BELOW FOR TESTING IN POSTMAN************

//----------- add a parking lot for an existing manager

import API from '../api.js';
export const addParkingLot = async (req, res) => {
  try {
    const { 
      managerId, 
      name, 
      location, 
      hourlyRateWeekday,
      dailyRateWeekday,
      hourlyRateWeekend,
      dailyRateWeekend,
      subscriptionRate,
      phoneNumber
    } = req.body;

    // Validate required fields
    if (!managerId || !name || !location) {
      return res.status(400).json({ 
        error: 'Missing required fields: managerId, name, and location are required' 
      });
    }

    // Validate rate fields are numbers if provided
    const rates = [hourlyRateWeekday, dailyRateWeekday, hourlyRateWeekend, dailyRateWeekend, subscriptionRate];
    if (rates.some(rate => rate && isNaN(parseFloat(rate)))) {
      return res.status(400).json({ 
        error: 'All rate fields must be valid numbers' 
      });
    }

    // Get current manager data
    const managerResponse = await API.get(`/managers/${managerId}.json`);
    const managerData = managerResponse.data;

    if (!managerData) {
      return res.status(404).json({ error: 'Manager not found' });
    }

    // Get all existing parking lots
    const parkingLotsResponse = await API.get('/parkingLots.json');
    const parkingLotsData = parkingLotsResponse.data;

    if (parkingLotsData) {
      const existingLot = Object.values(parkingLotsData).find(
        (lot) => lot.name === name && lot.location === location
      );
      if (existingLot) {
        return res.status(400).json({ 
          error: 'Parking lot with the same name and address already exists' 
        });
      }
    }

    try {
      const geocodingResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`
      );
      const geocodingData = await geocodingResponse.json();

      if (!geocodingData || geocodingData.length === 0) {
        return res.status(400).json({ 
          error: 'Unable to geocode the provided location. Please check the address.' 
        });
      }

      const firstResult = geocodingData[0];
      const latitude = parseFloat(firstResult.lat);
      const longitude = parseFloat(firstResult.lon);
      const formattedLocation = firstResult.display_name;

      const newParkingLot = {
        name,
        location: formattedLocation,
        latitude,
        longitude,
        hourlyRateWeekday: parseFloat(hourlyRateWeekday) || 0,
        dailyRateWeekday: parseFloat(dailyRateWeekday) || 0,
        hourlyRateWeekend: parseFloat(hourlyRateWeekend) || 0,
        dailyRateWeekend: parseFloat(dailyRateWeekend) || 0,
        subscriptionRate: parseFloat(subscriptionRate) || 0,
        phoneNumber,
        managerId,
        floors: [],
        createdAt: new Date().toISOString(),
        availableSpots: {
          general: 0,
          handicapped: 0,
          EV: 0,
          subscription: 0
        }
      };

      // Add the parking lot to the parkingLots collection
      const parkingLotResponse = await API.post('/parkingLots.json', newParkingLot);
      const parkingLotId = parkingLotResponse.data.name;

      // Initialize parkingLots array if it doesn't exist
      const currentParkingLots = Array.isArray(managerData.parkingLots) 
        ? managerData.parkingLots 
        : [];

      // Add the new parking lot ID
      const updatedParkingLots = [...currentParkingLots, parkingLotId];

      // Update the manager's parkingLots array
      await API.patch(`/managers/${managerId}.json`, {
        parkingLots: updatedParkingLots
      });

      res.status(201).json({
        success: true,
        parkingLotId,
        parkingLot: {
          id: parkingLotId,
          ...newParkingLot
        }
      });

    } catch (geocodingError) {
      console.error('Geocoding error:', geocodingError);
      return res.status(500).json({ 
        error: 'Failed to geocode location. Please try again later.' 
      });
    }

  } catch (error) {
    console.error('Error adding parking lot:', error);
    res.status(500).json({ error: 'Failed to add parking lot' });
  }
};
 // ------------get all the parking lots of a manager
export const getManagerParkingLots = async (req, res) => {
  try {
    const managerId = req.params.managerId;
    const managerResponse = await API.get(`/managers/${managerId}.json`);
    const parkingLotIds = managerResponse.data.parkingLots || [];

    if (parkingLotIds.length === 0) {
      return res.status(200).json([]);
    }

    const parkingLots = await Promise.all(
      parkingLotIds.map(async (id) => {
        const response = await API.get(`/parkingLots/${id}.json`);
        return {
          id,
          ...response.data
        };
      })
    );

    res.status(200).json(parkingLots);
  } catch (error) {
    console.error('Error getting parking lots:', error);
    res.status(500).json({ error: 'Failed to get parking lots' });
  }  
};
//------------Fetch all the info related to a parking lot
export const getParkingLot = async (req, res) => {
  try {
    const parkingLotId = req.params.parkingLotId;
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);

    if (!response.data) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    res.status(200).json({
      id: parkingLotId,
      ...response.data
    });
  } catch (error) {
    console.error('Error getting parking lot:', error);
    res.status(404).json({ error: 'Parking lot not found' });
  }
};

//------------get the parking lot info needed by the user

export const getParkingLotInfo = async (req, res) => {
  try {
    const { parkingLotId } = req.params;

    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Extract the information needed by users
    const lotInfo = {
      name: parkingLotData.name,
      location: parkingLotData.location,
      hourlyRateWeekday: parkingLotData.hourlyRateWeekday,
      dailyRateWeekday: parkingLotData.dailyRateWeekday,
      hourlyRateWeekend: parkingLotData.hourlyRateWeekend,
      dailyRateWeekend: parkingLotData.dailyRateWeekend,
      subscriptionRate: parkingLotData.subscriptionRate,
      phoneNumber: parkingLotData.phoneNumber,
      availableSpots: parkingLotData.availableSpots || {
        general: 0,
        handicapped: 0,
        EV: 0,
        subscription: 0
      }
    };

    res.status(200).json(lotInfo);
  } catch (error) {
    console.error('Error getting parking lot information:', error);
    res.status(500).json({ error: 'Failed to get parking lot information' });
  }
};


//----update a manager parking lot
export const updateParkingLot = async (req, res) => {
  try {
    const parkingLotId = req.params.parkingLotId;
    const updateData = req.body;
    const currentLot = await API.get(`/parkingLots/${parkingLotId}.json`);

    if (!currentLot.data) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    const updatedLot = {
      ...currentLot.data,
      ...updateData,
      hourlyRateWeekday: parseFloat(updateData.hourlyRateWeekday) || currentLot.data.hourlyRateWeekday,
      dailyRateWeekday: parseFloat(updateData.dailyRateWeekday) || currentLot.data.dailyRateWeekday,
      hourlyRateWeekend: parseFloat(updateData.hourlyRateWeekend) || currentLot.data.hourlyRateWeekend,
      dailyRateWeekend: parseFloat(updateData.dailyRateWeekend) || currentLot.data.dailyRateWeekend,
      subscriptionRate: parseFloat(updateData.subscriptionRate) || currentLot.data.subscriptionRate,
      updatedAt: new Date().toISOString()
    };

    await API.patch(`/parkingLots/${parkingLotId}.json`, updatedLot);

    res.status(200).json({
      id: parkingLotId,
      ...updatedLot
    });
  } catch (error) {
    console.error('Error updating parking lot:', error);
    res.status(404).json({ error: 'Parking lot not found' });
  }
};

//-------------delete a parking lot
export const deleteParkingLot = async (req, res) => {
  try {
    const { managerId, parkingLotId } = req.params;

    // Get the parking lot data first to find all devices
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Collect all devices in the parking lot using flatMap
    const deviceReferences = new Set(
      (parkingLotData.floors || [])
        .flatMap(floor => floor.rows || [])
        .flatMap(row => row.spots || [])
        .filter(spot => spot?.deviceId)
        .map(spot => spot.deviceId)
    );

    // Clean up all device references
    for (const deviceId of deviceReferences) {
      try {
        // Reset all device location data
        await API.patch(`/device/${deviceId}.json`, {
          parkingLotId: null,
          floorId: null,
          rowId: null,
          spots: []
        });
      } catch (deviceError) {
        console.error(`Error cleaning up device ${deviceId}:`, deviceError);
      }
    }

    // Get manager data
    const managerResponse = await API.get(`/managers/${managerId}.json`);
    const managerData = managerResponse.data;

    // Remove parking lot from manager's list
    const updatedParkingLots = (managerData.parkingLots || []).filter(
      id => id !== parkingLotId
    );

    // Update manager's parking lots array
    await API.patch(`/managers/${managerId}.json`, {
      parkingLots: updatedParkingLots
    });

    // Finally, delete the parking lot
    await API.delete(`/parkingLots/${parkingLotId}.json`);

    res.status(200).json({ 
      success: true,
      message: 'Parking lot and associated device references deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    res.status(500).json({ error: 'Failed to delete parking lot' });
  }
};


// ---------Add a floor to a parking lot

export const addFloor = async (req, res) => {
  try {
    const { parkingLotId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    var floorId;
    let updatedFloors;

    if (parkingLotData.floors === undefined || parkingLotData.floors.length === 0) {
      // If floors array is empty or undefined, start with ID 0
      floorId = 0;
      const newFloor = {
        floorId,
        rows: []
      };
      updatedFloors = [newFloor];
    } else {
      // Get the last floor's ID and add 1
      const lastFloor = parkingLotData.floors[parkingLotData.floors.length - 1];
      floorId = lastFloor.floorId + 1;

      const newFloor = {
        floorId,
        rows: []
      };
      updatedFloors = [...parkingLotData.floors, newFloor];
    }

    // Update the parking lot document with the updated floors array
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Return the success response
    res.status(201).json({
      success: true,
      floorId
    });
  } catch (error) {
    console.error('Error adding floor:', error);
    res.status(500).json({ error: 'Failed to add floor' });
  }
};

// -------Add a row to a floor
export const addRow = async (req, res) => {
  try {
    const { parkingLotId, floorId } = req.params;
    const { rowId } = req.body;  // Row ID now comes from request body

    // Validate rowId is provided
    if (rowId === undefined || rowId === null) {
      return res.status(400).json({ error: 'Row ID is required' });
    }

    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor with the matching floor ID
    const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

    // Check if the floor exists
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Check if rowId already exists in this floor
    if (floor.rows) {
      const rowExists = floor.rows.some((row) => row.rowId === rowId);
      if (rowExists) {
        return res.status(400).json({ 
          error: `Row with ID ${rowId} already exists on this floor` 
        });
      }
    }

    let updatedFloors;
    const newRow = {
      rowId:rowId,
      spots: []
    };

    if (floor.rows === undefined) {
      // Create first row in the floor
      updatedFloors = parkingLotData.floors.map((f) =>
        f.floorId === parseInt(floorId) ? { ...f, rows: [newRow] } : f
      );
    } else {
      // Add row to existing rows array
      updatedFloors = parkingLotData.floors.map((f) =>
        f.floorId === parseInt(floorId) ? { ...f, rows: [...f.rows, newRow] } : f
      );
    }

    // Update the parking lot document with the updated floors array
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Return the success response
    res.status(201).json({
      success: true,
      rowId: rowId
    });
  } catch (error) {
    console.error('Error adding row:', error);
    res.status(500).json({ error: 'Failed to add row' });
  }
};
//--------- Add a spot to a row

// Original addSpot function without position attribute
export const addSpot = async (req, res) => {
  try {
    const { parkingLotId, floorId, rowId } = req.params;
    const { type, isReserved, deviceId, sensorId } = req.body;

    // Make sensorId mandatory when deviceId is provided
    if (deviceId && (sensorId === undefined || sensorId === null)) {
      return res.status(400).json({ 
        error: 'Sensor ID is required when assigning a device' 
      });
    }

    // If deviceId is not provided but sensorId is, return error
    if (!deviceId && sensorId !== undefined) {
      return res.status(400).json({ 
        error: 'Cannot assign a sensor ID without a device' 
      });
    }

    // Validate sensorId if provided
    if (deviceId && (sensorId !== 0 && sensorId !== 1)) {
      return res.status(400).json({ 
        error: 'Sensor ID must be either 0 or 1' 
      });
    }
    
    // Internal helper function to generate random spot ID
    const generateSpotId = (length = 8) => {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      return `SPOT-${result}`;
    };

    // Get the current parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    const managerId = parkingLotData.managerId;

    // Function to check if spotId is unique within manager's parking lots
    const isSpotIdUniqueForManager = async (spotId) => {
      const parkingLotsResponse = await API.get('/parkingLots.json');
      const parkingLots = parkingLotsResponse.data;
      
      if (!parkingLots) return true;

      for (const lotId in parkingLots) {
        const lot = parkingLots[lotId];
        
        if (lot.managerId !== managerId) continue;

        if (lot.floors && Array.isArray(lot.floors)) {
          for (const floor of lot.floors) {
            if (floor.rows && Array.isArray(floor.rows)) {
              for (const row of floor.rows) {
                if (row.spots && Array.isArray(row.spots)) {
                  const spotExists = row.spots.some(spot => spot.spotId === spotId);
                  if (spotExists) return false;
                }
              }
            }
          }
        }
      }
      return true;
    };

    // Generate a unique spot ID
    let spotId;
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 10;

    while (!isUnique && attempts < maxAttempts) {
      spotId = generateSpotId();
      isUnique = await isSpotIdUniqueForManager(spotId);
      attempts++;
    }

    if (!isUnique) {
      return res.status(500).json({ 
        error: 'Failed to generate unique spot ID after multiple attempts' 
      });
    }

    // Find the floor with the matching floor ID
    const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Find the row with the matching row ID
    const row = floor.rows.find((r) => r.rowId === rowId);
    if (!row) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // If deviceId is provided, validate it and check location constraints
    let deviceData;
    if (deviceId) {
      // Check if device exists
      const deviceResponse = await API.get(`/device/${deviceId}.json`);
      deviceData = deviceResponse.data;

      if (!deviceData) {
        return res.status(404).json({ error: 'Device not found' });
      }

      // Check device spots array length
      if (deviceData.spots && deviceData.spots.length >= 2) {
        return res.status(400).json({ 
          error: 'Device cannot be assigned to more spots. Maximum limit is 2 spots per device.'
        });
      }

      // If device already has a spot, check if new spot is in the same location
      if (deviceData.spots && deviceData.spots.length > 0) {
        if (deviceData.parkingLotId !== parkingLotId || 
            deviceData.floorId !== parseInt(floorId) || 
            deviceData.rowId !== rowId) {
          return res.status(400).json({ 
            error: 'All spots for a device must be in the same parking lot, floor, and row'
          });
        }

        // Check if sensorId is already used in another spot for this device
        const existingSpot = parkingLotData.floors
          .find(f => f.floorId === parseInt(floorId))
          ?.rows.find(r => r.rowId === rowId)
          ?.spots.find(s => s.deviceId === deviceId);

        if (existingSpot && existingSpot.sensorId === sensorId) {
          return res.status(400).json({ 
            error: `Sensor ID ${sensorId} is already used by another spot in this device` 
          });
        }
      }
    }

    let updatedFloors;

    // Create the new spot
    const newSpot = {
      spotId,
      type,
      status: 'available',
      isReserved: isReserved || false,
      ...(deviceId && { deviceId, sensorId })
    };

    if (row.spots === undefined) {
      // If no spots exist yet, create a new spots array
      updatedFloors = parkingLotData.floors.map((f) =>
        f.floorId === parseInt(floorId) 
          ? {
              ...f,
              rows: f.rows.map((r) =>
                r.rowId === rowId
                  ? { ...r, spots: [newSpot] }
                  : r
              )
            }
          : f
      );
    } else {
      // Add to existing spots array
      updatedFloors = parkingLotData.floors.map((f) =>
        f.floorId === parseInt(floorId)
          ? {
              ...f,
              rows: f.rows.map((r) =>
                r.rowId === rowId
                  ? { ...r, spots: [...r.spots, newSpot] }
                  : r
              )
            }
          : f
      );
    }

    // Update the parking lot document with the updated floors array
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // If device was provided, update the device with spot and location information
    if (deviceId) {
      const updatedSpots = deviceData.spots === undefined 
        ? [spotId]
        : [...deviceData.spots, spotId];

      await API.patch(`/device/${deviceId}.json`, {
        spots: updatedSpots,
        parkingLotId,
        floorId: parseInt(floorId),
        rowId: rowId
      });

      // Only update availableSpots if type is not empty
      if (type && type.trim() !== '') {
        try {
          // Update available spots count
          const currentAvailability = parkingLotData.availableSpots?.[type] || 0;
          const updatedAvailableSpots = {
            ...parkingLotData.availableSpots,
            [type]: currentAvailability + 1
          };

          await API.patch(`/parkingLots/${parkingLotId}.json`, {
            availableSpots: updatedAvailableSpots
          });
        } catch (error) {
          console.error('Error updating availability count:', error);
          // Continue despite availability update error
        }
      }
    }

    // Return the success response
    res.status(201).json({
      success: true,
      spotId
    });
  } catch (error) {
    console.error('Error adding spot:', error);
    res.status(500).json({ error: 'Failed to add spot' });
  }
};

//-----Add Devices
export const addDevice= async (req, res) => {
  try {
    
    const newDevice = {
      deviceId:null,
 
    };

    const deviceResponse = await API.post('/device.json',newDevice);
    const deviceId = deviceResponse.data.name;

   
    await API.patch(`/device/${deviceId}.json`, {
      deviceId: deviceId,
      sensors:[
        {sensorId:0,detecting:false},
        {sensorId:1,detecting:false}
    
      ]
      
    });

    res.status(201).json({
      success: true,
      deviceId,
    
    });
  } catch (error) {
    console.error('Error adding device:', error);
    res.status(500).json({ error: 'Failed to add device' });
  }
};


// ---- Get all floors of a parking lot
export const getFloors = async (req, res) => {
  try {
    const { parkingLotId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Return the floors array
    res.status(200).json(parkingLotData.floors);
  } catch (error) {
    console.error('Error getting floors:', error);
    res.status(500).json({ error: 'Failed to get floors' });
  }
};

//----  Get spot information for the whole parking lot
export const getParkingSpots = async (req, res) => {
  try {
    const { parkingLotId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Extract spot information from each floor and row
    const spots = parkingLotData.floors.flatMap((floor) =>
      floor.rows.flatMap((row) => row.spots)
    );

    // Return the spot information
    res.status(200).json(spots);
  } catch (error) {
    console.error('Error getting parking spots:', error);
    res.status(500).json({ error: 'Failed to get parking spots' });
  }
};

// ---- Get spot information for a specific floor
export const getFloorSpots = async (req, res) => {
  try {
    const { parkingLotId, floorId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor with the matching floor ID
    const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

    // Check if the floor exists
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // If no rows exist, return empty array
    if (!floor.rows) {
      return res.status(200).json([]);
    }

    // Extract spot information from each row of the floor, handling undefined spots
    const spots = floor.rows.flatMap((row) => {
      if (!row.spots) {
        return [];
      }
      return row.spots;
    });

    // Return the spot information for the floor
    res.status(200).json(spots);
  } catch (error) {
    console.error('Error getting floor spots:', error);
    res.status(500).json({ error: 'Failed to get floor spots' });
  }
};
// ------Get all rows in a floor
export const getFloorRows = async (req, res) => {
  try {
    const { parkingLotId, floorId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor with the matching floor ID
    const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

    // Check if the floor exists
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Return the rows array
    res.status(200).json(floor.rows);
  } catch (error) {
    console.error('Error getting floor rows:', error);
    res.status(500).json({ error: 'Failed to get floor rows' });
  }
};


// --------Delete a floor from a parking lot
export const deleteFloor = async (req, res) => {
  try {
    const { parkingLotId, floorId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor with the matching floor ID
    const floorIndex = parkingLotData.floors.findIndex((f) => f.floorId === parseInt(floorId));

    // Check if the floor exists
    if (floorIndex === -1) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Check if the floor has any rows
    const floor = parkingLotData.floors[floorIndex];
    if (floor.rows && floor.rows.length > 0) {
      const rowIds = floor.rows.map(row => row.rowId);
      return res.status(400).json({ 
        error: 'Cannot delete floor with existing rows',
        message: 'Please delete the following rows first',
        rowIds: rowIds
      });
    }

    // Remove the floor from the floors array
    const updatedFloors = parkingLotData.floors.filter((f) => f.floorId !== parseInt(floorId));

    // Update the parking lot document with the updated floors array
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Return the success response
    res.status(200).json({ 
      success: true,
      message: 'Floor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting floor:', error);
    res.status(500).json({ error: 'Failed to delete floor' });
  }
};
//------- Delete a row from a floor
export const deleteRow = async (req, res) => {
  try {
    const { parkingLotId, floorId, rowId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor with the matching floor ID
    const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

    // Check if the floor exists
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Find the row with the matching row ID
    const rowIndex = floor.rows.findIndex((r) => r.rowId === rowId);

    // Check if the row exists
    if (rowIndex === -1) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Check if the row has any spots
    const row = floor.rows[rowIndex];
    if (row.spots && row.spots.length > 0) {
      const spotIds = row.spots.map(spot => spot.spotId);
      return res.status(400).json({ 
        error: 'Cannot delete row with existing spots',
        message: 'Please delete the following spots first',
        spotIds: spotIds
      });
    }

    // Remove the row from the rows array
    const updatedRows = floor.rows.filter((r) => r.rowId !== rowId);

    // Update the floors array with the updated floor
    const updatedFloors = parkingLotData.floors.map((f) =>
      f.floorId === parseInt(floorId) ? { ...f, rows: updatedRows } : f
    );

    // Update the parking lot document with the updated floors array
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Return the success response
    res.status(200).json({ 
      success: true,
      message: 'Row deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting row:', error);
    res.status(500).json({ error: 'Failed to delete row' });
  }
};
// -------Delete a spot from a row
// Delete a spot

export const deleteSpot = async (req, res) => {
  try {
    const { parkingLotId, floorId, rowId, spotId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    const row = floor.rows.find(r => r.rowId === rowId);
    if (!row) {
      return res.status(404).json({ error: 'Row not found' });
    }

    const spot = row.spots.find(s => s.spotId === spotId);
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    // Get the spot type for availability update
    const spotType = spot.type;

    // Handle device if present
    if (spot.deviceId) {
      try {
        const deviceResponse = await API.get(`/device/${spot.deviceId}.json`);
        const deviceData = deviceResponse.data;

        if (deviceData) {
          const updatedSpots = deviceData.spots.filter(s => s !== spotId);
          
          if (updatedSpots.length === 0) {
            await API.patch(`/device/${spot.deviceId}.json`, {
              spots: [],
              parkingLotId: null,
              floorId: null,
              rowId: null
            });
          } else {
            await API.patch(`/device/${spot.deviceId}.json`, {
              spots: updatedSpots
            });
          }
        }
      } catch (error) {
        console.error('Error updating device:', error);
        // Continue with spot deletion even if device update fails
      }
    }

    // Remove the spot from the row
    const updatedFloors = parkingLotData.floors.map(f => {
      if (f.floorId === parseInt(floorId)) {
        return {
          ...f,
          rows: f.rows.map(r => {
            if (r.rowId === rowId) {
              return {
                ...r,
                spots: r.spots.filter(s => s.spotId !== spotId)
              };
            }
            return r;
          })
        };
      }
      return f;
    });

    // Update the parking lot
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Only update availableSpots if type is not empty
    if (spotType && spotType.trim() !== '') {
      try {
        // Update availableSpots count
        const currentCount = parkingLotData.availableSpots?.[spotType] || 0;
        const updatedAvailableSpots = {
          ...parkingLotData.availableSpots,
          [spotType]: Math.max(0, currentCount - 1)
        };

        await API.patch(`/parkingLots/${parkingLotId}.json`, {
          availableSpots: updatedAvailableSpots
        });
      } catch (error) {
        console.error('Error updating availability count:', error);
        // Continue despite availability update error
      }
    }

    res.status(200).json({
      success: true,
      message: 'Spot deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting spot:', error);
    res.status(500).json({ error: 'Failed to delete spot' });
  }
};

//------ Update a spot
export const updateSpot = async (req, res) => {
  try {
    const { parkingLotId, floorId, rowId, spotId } = req.params;
    const { type, status, isReserved } = req.body;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor with the matching floor ID
    const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));

    // Check if the floor exists
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Find the row with the matching row ID
    const row = floor.rows.find((r) => r.rowId === rowId);

    // Check if the row exists
    if (!row) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Find the spot with the matching spot ID
    const spot = row.spots.find((s) => s.spotId === spotId);

    // Check if the spot exists
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    // Update the spot with the provided data
    const updatedSpot = {
      ...spot,
      type: type || spot.type,
      status: status || spot.status,
      isReserved: isReserved !== undefined ? isReserved : spot.isReserved
    };

    // Update the spots array with the updated spot
    const updatedSpots = row.spots.map((s) =>
      s.spotId === parseInt(spotId) ? updatedSpot : s
    );

    // Update the rows array with the updated row
    const updatedRows = floor.rows.map((r) =>
      r.rowId === rowId ? { ...r, spots: updatedSpots } : r
    );

    // Update the floors array with the updated floor
    const updatedFloors = parkingLotData.floors.map((f) =>
      f.floorId === parseInt(floorId) ? { ...f, rows: updatedRows } : f
    );

    // Update the parking lot document with the updated floors array
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Return the success response with the updated spot
    res.status(200).json({
      success: true,
      spot: updatedSpot
    });
  } catch (error) {
    console.error('Error updating spot:', error);
    res.status(500).json({ error: 'Failed to update spot' });
  }
};

//----------  Get all devices from the database

export const getAllDevices = async (req, res) => {
  try {
   
    const devicesResponse = await API.get('/device.json');
    const devices = devicesResponse.data;

    if (!devices) {
      return res.status(200).json([]);
    }

    // Transform the data to include the ID in each device object
    const formattedDevices = Object.entries(devices).map(([id, device]) => ({
      id,
      ...device
    }));

    res.status(200).json(formattedDevices);
  } catch (error) {
    console.error('Error getting devices:', error);
    res.status(500).json({ error: 'Failed to get devices' });
  }
};

//--------- Delete a device
export const deleteDevice = async (req, res) => {
  try {
    const { deviceId } = req.params;

    // Check if device exists
    const deviceResponse = await API.get(`/device/${deviceId}.json`);
    const deviceData = deviceResponse.data;

    if (!deviceData) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // If device has spots, remove device reference from those spots
    if (deviceData.spots && deviceData.spots.length > 0) {
      const { parkingLotId, floorId, rowId } = deviceData;
      
      // Get the parking lot
      const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = parkingLotResponse.data;

      // Update the spots in the specific row
      const updatedFloors = parkingLotData.floors.map(floor => {
        if (floor.floorId !== floorId) return floor;
        
        return {
          ...floor,
          rows: floor.rows.map(row => {
            if (row.rowId !== rowId) return row;
            
            return {
              ...row,
              spots: row.spots.map(spot => {
                if (deviceData.spots.includes(spot.spotId)) {
                  // Remove deviceId from spot
                  const { deviceId,sensorId, ...spotWithoutDevice } = spot;
                  return spotWithoutDevice;
                }
                return spot;
              })
            };
          })
        };
      });

      // Update the parking lot
      await API.patch(`/parkingLots/${parkingLotId}.json`, {
        floors: updatedFloors
      });
    }

    // Delete the device
    await API.delete(`/device/${deviceId}.json`);

    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting device:', error);
    res.status(500).json({ error: 'Failed to delete device' });
  }
};

//---------add Device to a spot

export const addDeviceToSpot = async (req, res) => {
  try {
    const { parkingLotId, floorId, rowId, spotNumber } = req.params;
    const { deviceId, sensorId } = req.body;

    // Validate required fields
    if (!deviceId) {
      return res.status(400).json({ error: 'Device ID is required' });
    }

    if (sensorId === undefined || sensorId === null) {
      return res.status(400).json({ error: 'Sensor ID is required when assigning a device' });
    }

    // Validate spotNumber is a positive integer (since we're using 1-based numbering)
    const spotNumber1Based = parseInt(spotNumber);
    if (isNaN(spotNumber1Based) || spotNumber1Based < 1) {
      return res.status(400).json({ error: 'Spot number must be a positive integer (starting from 1)' });
    }
    
    // Convert from 1-based (user-facing) to 0-based (array index)
    const spotIndex = spotNumber1Based - 1;

    // Validate sensorId value
    if (sensorId !== 0 && sensorId !== 1) {
      return res.status(400).json({ error: 'Sensor ID must be either 0 or 1' });
    }

    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor
    const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Find the row
    const row = floor.rows.find(r => r.rowId === rowId);
    if (!row) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Check if the spotNumber is valid (within array bounds)
    if (spotIndex >= row.spots.length) {
      return res.status(404).json({ 
        error: `Spot number ${spotNumber1Based} not found. The row only has ${row.spots.length} spots (numbered 1-${row.spots.length}).`
      });
    }

    // Get the actual spot using the provided index
    const spot = row.spots[spotIndex];
    const spotId = spot.spotId;

    // Check if spot already has a device
    if (spot.deviceId) {
      return res.status(400).json({ error: 'Spot already has a device assigned' });
    }

    // Check if device exists and get device data
    const deviceResponse = await API.get(`/device/${deviceId}.json`);
    const deviceData = deviceResponse.data;

    if (!deviceData) {
      return res.status(404).json({ error: 'Device not found' });
    }

    // Check device spots array length
    if (deviceData.spots && deviceData.spots.length >= 2) {
      return res.status(400).json({ 
        error: 'Device cannot be assigned to more spots. Maximum limit is 2 spots per device.'
      });
    }

    // If device already has a spot, check location and sensor constraints
    if (deviceData.spots && deviceData.spots.length > 0) {
      // Check location constraints
      if (deviceData.parkingLotId !== parkingLotId || 
          deviceData.floorId !== parseInt(floorId) || 
          deviceData.rowId !== rowId) {
        return res.status(400).json({ 
          error: 'All spots for a device must be in the same parking lot, floor, and row'
        });
      }

      // Check if sensorId is already used
      const existingSpot = parkingLotData.floors
        .find(f => f.floorId === parseInt(floorId))
        ?.rows.find(r => r.rowId === rowId)
        ?.spots.find(s => s.deviceId === deviceId);

      if (existingSpot && existingSpot.sensorId === sensorId) {
        return res.status(400).json({ 
          error: `Sensor ID ${sensorId} is already used by another spot in this device`
        });
      }
    }

    // Update the spot with device and sensor ID
    const updatedFloors = parkingLotData.floors.map(f => {
      if (f.floorId === parseInt(floorId)) {
        return {
          ...f,
          rows: f.rows.map(r => {
            if (r.rowId === rowId) {
              return {
                ...r,
                spots: r.spots.map((s, index) => {
                  if (index === spotIndex) {
                    return {
                      ...s,
                      deviceId,
                      sensorId
                    };
                  }
                  return s;
                })
              };
            }
            return r;
          })
        };
      }
      return f;
    });

    // Update the parking lot
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Update device with spot and location information
    const updatedSpots = deviceData.spots === undefined 
      ? [spotId]
      : [...deviceData.spots, spotId];

    await API.patch(`/device/${deviceId}.json`, {
      spots: updatedSpots,
      parkingLotId,
      floorId: parseInt(floorId),
      rowId: rowId
    });

    res.status(200).json({
      success: true,
      message: 'Device added to spot successfully',
      spotId: spotId,
      spotNumber: spotNumber1Based
    });
  } catch (error) {
    console.error('Error adding device to spot:', error);
    res.status(500).json({ error: 'Failed to add device to spot' });
  }
};
//----------removeDevice from a spot
export const removeDeviceFromSpot = async (req, res) => {
  try {
    const { parkingLotId, floorId, rowId, spotId } = req.params;
    
    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Check if the parking lot exists
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Find the floor
    const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));
    if (!floor) {
      return res.status(404).json({ error: 'Floor not found' });
    }

    // Find the row
    const row = floor.rows.find(r => r.rowId === rowId);
    if (!row) {
      return res.status(404).json({ error: 'Row not found' });
    }

    // Find the spot
    const spot = row.spots.find(s => s.spotId === spotId);
    if (!spot) {
      return res.status(404).json({ error: 'Spot not found' });
    }

    // Check if spot has a device
    if (!spot.deviceId) {
      return res.status(400).json({ error: 'No device assigned to this spot' });
    }

    const deviceId = spot.deviceId;

    // Update the spot to remove device and sensor
    const updatedFloors = parkingLotData.floors.map(f => {
      if (f.floorId === parseInt(floorId)) {
        return {
          ...f,
          rows: f.rows.map(r => {
            if (r.rowId === rowId) {
              return {
                ...r,
                spots: r.spots.map(s => {
                  if (s.spotId === spotId) {
                    // Remove deviceId and sensorId from spot
                    const { deviceId, sensorId, ...spotWithoutDevice } = s;
                    return spotWithoutDevice;
                  }
                  return s;
                })
              };
            }
            return r;
          })
        };
      }
      return f;
    });

    // Update parking lot
    await API.patch(`/parkingLots/${parkingLotId}.json`, {
      floors: updatedFloors
    });

    // Update device collection
    const deviceResponse = await API.get(`/device/${deviceId}.json`);
    const deviceData = deviceResponse.data;

    if (deviceData) {
      // Remove the spot from device's spots array
      const updatedSpots = deviceData.spots.filter(s => s !== spotId);

      if (updatedSpots.length === 0) {
        // If no spots left, remove location info
        await API.patch(`/device/${deviceId}.json`, {
          spots: [],
          parkingLotId: null,
          floorId: null,
          rowId: null
        });
      } else {
        // Otherwise just update spots array
        await API.patch(`/device/${deviceId}.json`, {
          spots: updatedSpots
        });
      }
    }

    res.status(200).json({
      success: true,
      message: 'Device removed from spot successfully'
    });
  } catch (error) {
    console.error('Error removing device from spot:', error);
    res.status(500).json({ error: 'Failed to remove device from spot' });
  }
};
//------add qr scanner
export const addQrScanner= async (req, res) => {
  try {
    
    const newScanner = {
      QrScannerId:null,
 
    };

    const QrScannerResponse = await API.post('/QrScanner.json',newScanner);
    const QrScannerId = QrScannerResponse.data.name;

   
    await API.patch(`/QrScanner/${QrScannerId}.json`, {
      QrScannerId: QrScannerId,
     
    });

    res.status(201).json({
      success: true,
      QrScannerId,
    
    });
  } catch (error) {
    console.error('Error adding Qr Scanner:', error);
    res.status(500).json({ error: 'Failed to add Qr Scanner' });
  }
};
//------- add qr scanner to a parking lot
export const addQrScannerToParkingLot = async (req, res) => {
  try {
    const { QrScannerId, parkingLotId } = req.params;
    const {type}=req.body;
    
    // Validate required parameters
    if (!QrScannerId || !parkingLotId) {
      return res.status(400).json({ 
        error: 'QrScannerId and parkingLotId are required' 
      });
    }
    
    // Check if the QR scanner exists
    const scannerResponse = await API.get(`/QrScanner/${QrScannerId}.json`);
    const scannerData = scannerResponse.data;
    
    if (!scannerData) {
      return res.status(404).json({ error: 'QR scanner not found' });
    }
    
    // Check if the parking lot exists
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;
    
    if (!parkingLotData) {
      return res.status(404).json({ error: 'Parking lot not found' });
    }

    // Update QR scanner with parking lot reference
    await API.patch(`/QrScanner/${QrScannerId}.json`, {
      parkingLotId: parkingLotId,
      type:type
    });
    
    // Update parking lot with QR scanner reference
    // First, initialize or get the existing qrScanners array
    const currentScanners = Array.isArray(parkingLotData.qrScanners) 
      ? parkingLotData.qrScanners 
      : [];
    
    // Check if the scanner is already in the array
    if (!currentScanners.includes(QrScannerId)) {
      const updatedScanners = [...currentScanners, QrScannerId];
      
      // Update the parking lot
      await API.patch(`/parkingLots/${parkingLotId}.json`, {
        qrScanners: updatedScanners
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'QR scanner successfully associated with parking lot',
      QrScannerId,
      parkingLotId
    });
  } catch (error) {
    console.error('Error associating QR scanner with parking lot:', error);
    res.status(500).json({ error: 'Failed to associate QR scanner with parking lot' });
  }
};
//------ remove qr scanner from parking lot
export const removeQrScannerFromParkingLot = async (req, res) => {
  try {
    const { QrScannerId } = req.params;
    
    // Validate required parameter
    if (!QrScannerId) {
      return res.status(400).json({ 
        error: 'QrScannerId is required' 
      });
    }
    
    // Check if the QR scanner exists
    const scannerResponse = await API.get(`/QrScanner/${QrScannerId}.json`);
    const scannerData = scannerResponse.data;
    
    if (!scannerData) {
      return res.status(404).json({ error: 'QR scanner not found' });
    }
    
    // Check if QR scanner is associated with any parking lot
    if (!scannerData.parkingLotId) {
      return res.status(400).json({ 
        error: 'QR scanner is not associated with any parking lot' 
      });
    }

    // Store the previous parking lot ID for updates and response
    const parkingLotId = scannerData.parkingLotId;

    // Get the parking lot data
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    // Remove scanner reference from parking lot if parking lot exists
    if (parkingLotData && parkingLotData.qrScanners) {
      const updatedScanners = parkingLotData.qrScanners.filter(
        scannerId => scannerId !== QrScannerId
      );
      
      // Update the parking lot
      await API.patch(`/parkingLots/${parkingLotId}.json`, {
        qrScanners: updatedScanners
      });
    }

    // Remove parking lot reference from scanner
    await API.patch(`/QrScanner/${QrScannerId}.json`, {
      parkingLotId: null
    });
    
    res.status(200).json({
      success: true,
      message: 'QR scanner successfully removed from parking lot',
      QrScannerId,
      previousParkingLotId: parkingLotId
    });
  } catch (error) {
    console.error('Error removing QR scanner from parking lot:', error);
    res.status(500).json({ error: 'Failed to remove QR scanner from parking lot' });
  }
};

//--------Delete Qr Scanner

export const deleteQrScanner = async (req, res) => {
  try {
    const { QrScannerId } = req.params;
    
    // Validate required parameter
    if (!QrScannerId) {
      return res.status(400).json({ 
        error: 'QrScannerId is required' 
      });
    }
    
    // Check if the QR scanner exists
    const scannerResponse = await API.get(`/QrScanner/${QrScannerId}.json`);
    const scannerData = scannerResponse.data;
    
    if (!scannerData) {
      return res.status(404).json({ error: 'QR scanner not found' });
    }
    
    // Check if QR scanner is associated with a parking lot
    if (scannerData.parkingLotId) {
      const parkingLotId = scannerData.parkingLotId;
      
      // Get the parking lot data
      const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = parkingLotResponse.data;
      
      // Remove scanner reference from parking lot if parking lot exists
      if (parkingLotData && parkingLotData.qrScanners) {
        const updatedScanners = parkingLotData.qrScanners.filter(
          scannerId => scannerId !== QrScannerId
        );
        
        // Update the parking lot
        await API.patch(`/parkingLots/${parkingLotId}.json`, {
          qrScanners: updatedScanners
        });
      }
    }
    
    // Delete the QR scanner
    await API.delete(`/QrScanner/${QrScannerId}.json`);
    
    res.status(200).json({
      success: true,
      message: 'QR scanner successfully deleted',
      QrScannerId
    });
  } catch (error) {
    console.error('Error deleting QR scanner:', error);
    res.status(500).json({ error: 'Failed to delete QR scanner' });
  }
};

