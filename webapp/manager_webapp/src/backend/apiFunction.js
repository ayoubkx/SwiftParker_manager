import API from './api.js';

// ---------------------- PARKING LOT MANAGEMENT ----------------------

// Create a new parking lot
export const createParkingLot = async (managerId, parkingLotData) => {
    try {
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(parkingLotData.location)}`
      );
      const geoData = await geoResponse.json();
  
      if (!geoData || geoData.length === 0) {
        throw new Error('Unable to find location. Please check the address.');
      }
  
      const firstResult = geoData[0];
      const latitude = parseFloat(firstResult.lat);
      const longitude = parseFloat(firstResult.lon);
      const formattedLocation = firstResult.display_name;
  
      // Ensure availableSpots is calculated correctly
      const totalAvailableSpots = { EV: 0, general: 0, handicapped: 0, subscription: 0 };
  
      if (parkingLotData.floors) {
        parkingLotData.floors.forEach(floor => {
          if (floor.rows) {
            floor.rows.forEach(row => {
              row.spots = row.spots || []; // 🔹 Fix: Ensure spots is always an array
              row.spots.forEach(spot => {
                if (totalAvailableSpots.hasOwnProperty(spot.type)) {
                  totalAvailableSpots[spot.type] += 1;
                }
              });
            });
          }
        });
      }
  
      const newParkingLot = {
        ...parkingLotData,
        location: formattedLocation,
        latitude,
        longitude,
        managerId,
        availableSpots: totalAvailableSpots, // Store calculated values
        floors: parkingLotData.floors || [],
        createdAt: new Date().toISOString(),
      };
  
      const response = await API.post('/parkingLots.json', newParkingLot);
      const parkingLotId = response.data.name;
  
      const managerResponse = await API.get(`/managers/${managerId}.json`);
      const updatedParkingLots = [...(managerResponse.data?.parkingLots || []), parkingLotId];
  
      await API.patch(`/managers/${managerId}.json`, { parkingLots: updatedParkingLots });
  
      return { success: true, parkingLotId, parkingLot: { id: parkingLotId, ...newParkingLot } };
    } catch (error) {
      console.error('Error creating parking lot:', error);
      throw error;
    }
  };
  

// Update an existing parking lot
export const updateParkingLot = async (parkingLotId, updateData) => {
    try {
      const currentLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const currentLotData = currentLotResponse.data;
  
      if (!currentLotData) {
        throw new Error('Parking lot not found.');
      }
  
      // If the location is being updated, re-geocode the address
      let updatedLatitude = currentLotData.latitude;
      let updatedLongitude = currentLotData.longitude;
      let formattedLocation = currentLotData.location;
  
      if (updateData.location && updateData.location !== currentLotData.location) {
        const geoResponse = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(updateData.location)}`
        );
        const geoData = await geoResponse.json();
  
        if (!geoData || geoData.length === 0) {
          throw new Error('Unable to find the updated location. Please check the address.');
        }
  
        const firstResult = geoData[0];
        updatedLatitude = parseFloat(firstResult.lat);
        updatedLongitude = parseFloat(firstResult.lon);
        formattedLocation = firstResult.display_name;
      }
  
      const updatedParkingLot = {
        ...currentLotData,
        ...updateData,
        location: formattedLocation,
        latitude: updatedLatitude,
        longitude: updatedLongitude,
        updatedAt: new Date().toISOString(),
      };
  
      await API.patch(`/parkingLots/${parkingLotId}.json`, updatedParkingLot);
  
      return { id: parkingLotId, ...updatedParkingLot };
    } catch (error) {
      console.error('Error updating parking lot:', error);
      throw error;
    }
  };
  

// Delete a parking lot
export const deleteParkingLot = async (managerId, parkingLotId) => {
  try {
    const managerResponse = await API.get(`/managers/${managerId}.json`);
    const updatedParkingLots = (managerResponse.data.parkingLots || []).filter(id => id !== parkingLotId);

    await API.patch(`/managers/${managerId}.json`, { parkingLots: updatedParkingLots });
    await API.delete(`/parkingLots/${parkingLotId}.json`);

    return { success: true };
  } catch (error) {
    console.error('Error deleting parking lot:', error);
    throw error;
  }
};

// Get the all the info of a specific parking lot by its ID.
export const getParkingLot = async (parkingLotId) => {
  try {
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);

    if (!response.data) {
      throw new Error('Parking lot not found');
    }

    return {
      id: parkingLotId,
      ...response.data
    };
  } catch (error) {
    console.error('Error getting parking lot:', error);
    throw error;
  }
};

//--------------------get the parking lot info needed by the user
export const getParkingLotInfo = async (parkingLotId) => {
  try {
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    if (!parkingLotData) {
      throw new Error('Parking lot not found');
    }

    return {
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
  } catch (error) {
    console.error('Error getting parking lot information:', error);
    throw error;
  }
};

// Get all parking lots for a specific manager.
export const getManagerParkingLots = async (managerId) => {
  try {
    const managerResponse = await API.get(`/managers/${managerId}.json`);
    const parkingLotIds = managerResponse.data.parkingLots || [];

    if (parkingLotIds.length === 0) {
      return [];
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

    return parkingLots;
  } catch (error) {
    console.error('Error getting parking lots:', error);
    throw error;
  }
};

// ---------------------- FLOOR MANAGEMENT ----------------------

// Create a new floor
export const createFloor = async (parkingLotId) => {
    try {
      const response = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = response.data;
  
      if (!parkingLotData) {
        throw new Error('Parking lot not found');
      }
  
      let floorId;
      let updatedFloors;
  
      if (!parkingLotData.floors || parkingLotData.floors.length === 0) {
        floorId = 0;
        updatedFloors = [{ floorId, rows: [] }];
      } else {
        const lastFloor = parkingLotData.floors[parkingLotData.floors.length - 1];
        floorId = lastFloor.floorId + 1;
        updatedFloors = [...parkingLotData.floors, { floorId, rows: [] }];
      }
  
      await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });
  
      return { success: true, floorId };
    } catch (error) {
      console.error('Error adding floor:', error);
      throw error;
    }
  };

// Update a floor
export const updateFloor = async (parkingLotId, floorId, updateData) => {
  try {
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);
    if (!response.data) throw new Error('Parking lot not found.');

    const updatedFloors = response.data.floors.map(f => 
      f.floorId === parseInt(floorId) ? { ...f, ...updateData } : f
    );

    await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });

    return { success: true };
  } catch (error) {
    console.error('Error updating floor:', error);
    throw error;
  }
};

// ---------------------- ROW MANAGEMENT ----------------------

// Add a new row to a specific floor in a parking lot
export const createRow = async (parkingLotId, floorId, rowId) => {
    try {
      const response = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = response.data;
  
      if (!parkingLotData) {
        throw new Error('Parking lot not found');
      }
  
      const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
  
      if (!floor) {
        throw new Error('Floor not found');
      }
  
      if (!floor.rows) {
        floor.rows = [];
      }
  
      if (floor.rows.some((row) => row.rowId === rowId)) {
        throw new Error(`Row with ID ${rowId} already exists`);
      }
  
      // 🔹 Ensure spots is an empty array
      const newRow = { rowId, spots: [] };
  
      const updatedFloors = parkingLotData.floors.map((f) =>
        f.floorId === parseInt(floorId) ? { ...f, rows: [...f.rows, newRow] } : f
      );
  
      await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });
  
      return { success: true, rowId };
    } catch (error) {
      console.error('Error adding row:', error);
      throw error;
    }
  };
  
  

// ---------------------- SPOT MANAGEMENT ----------------------
// Create a new spot
export const createSpot = async (parkingLotId, floorId, rowId, spotData) => {
    try {
      const { type, isReserved } = spotData;
  
      const response = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = response.data;
  
      if (!parkingLotData) {
        throw new Error('Parking lot not found');
      }
  
      const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
      if (!floor) {
        throw new Error('Floor not found');
      }
  
      const row = floor.rows.find((r) => r.rowId === rowId);
      if (!row) {
        throw new Error('Row not found');
      }
  
      // Ensure spots is always an array
      if (!row.spots) {
        row.spots = [];
      }
  
      // Generate a unique spot ID
      const spotId = `SPOT-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
  
      const newSpot = {
        spotId,
        type,
        isReserved: isReserved || false,
        status: 'available',
      };
  
      // Update only the targeted row
      const updatedRows = floor.rows.map((r) =>
        r.rowId === rowId ? { ...r, spots: [...r.spots, newSpot] } : r
      );
  
      // Update available spots count
      const updatedAvailableSpots = {
        ...parkingLotData.availableSpots,
        [type]: (parkingLotData.availableSpots?.[type] || 0) + 1,
      };
  
      // Patch only the modified floor
      await API.patch(`/parkingLots/${parkingLotId}/floors/${floorId}.json`, { rows: updatedRows });
  
      // Update available spots separately
      await API.patch(`/parkingLots/${parkingLotId}.json`, {
        availableSpots: updatedAvailableSpots,
      });
  
      return { success: true, spotId };
    } catch (error) {
      console.error('Error adding spot:', error);
      throw error;
    }
  };
  


// Update a spot
export const updateSpot = async (parkingLotId, floorId, rowId, spotId, updateData) => {
  try {
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);
    if (!response.data) throw new Error('Parking lot not found.');

    const updatedFloors = response.data.floors.map(f =>
      f.floorId === parseInt(floorId)
        ? {
            ...f,
            rows: f.rows.map(r =>
              r.rowId === rowId
                ? {
                    ...r,
                    spots: r.spots.map(s =>
                      s.spotId === spotId ? { ...s, ...updateData } : s
                    )
                  }
                : r
            )
          }
        : f
    );

    await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });

    return { success: true };
  } catch (error) {
    console.error('Error updating spot:', error);
    throw error;
  }
};


