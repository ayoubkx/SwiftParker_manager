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

    const newParkingLot = {
      ...parkingLotData,
      location: formattedLocation,
      latitude,
      longitude,
      managerId,
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

// ---------------------- FLOOR MANAGEMENT ----------------------

// Create a new floor
export const createFloor = async (parkingLotId) => {
  try {
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);
    if (!response.data) throw new Error('Parking lot not found.');

    const newFloor = { floorId: response.data.floors?.length || 0, rows: [] };
    const updatedFloors = [...(response.data.floors || []), newFloor];

    await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });

    return { success: true, floorId: newFloor.floorId };
  } catch (error) {
    console.error('Error creating floor:', error);
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

// ---------------------- SPOT MANAGEMENT ----------------------

// Create a new spot
export const createSpot = async (parkingLotId, floorId, rowId, spotData) => {
  try {
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);
    if (!response.data) throw new Error('Parking lot not found.');

    const updatedFloors = response.data.floors.map(f =>
      f.floorId === parseInt(floorId)
        ? {
            ...f,
            rows: f.rows.map(r =>
              r.rowId === rowId
                ? { ...r, spots: [...(r.spots || []), { ...spotData, spotId: `SPOT-${Date.now()}` }] }
                : r
            )
          }
        : f
    );

    await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });

    return { success: true };
  } catch (error) {
    console.error('Error creating spot:', error);
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

// Delete a spot
export const deleteSpot = async (parkingLotId, floorId, rowId, spotId) => {
  try {
    const response = await API.get(`/parkingLots/${parkingLotId}.json`);
    if (!response.data) throw new Error('Parking lot not found.');

    const updatedFloors = response.data.floors.map(f =>
      f.floorId === parseInt(floorId)
        ? {
            ...f,
            rows: f.rows.map(r =>
              r.rowId === rowId ? { ...r, spots: r.spots.filter(s => s.spotId !== spotId) } : r
            )
          }
        : f
    );

    await API.patch(`/parkingLots/${parkingLotId}.json`, { floors: updatedFloors });

    return { success: true };
  } catch (error) {
    console.error('Error deleting spot:', error);
    throw error;
  }
};
