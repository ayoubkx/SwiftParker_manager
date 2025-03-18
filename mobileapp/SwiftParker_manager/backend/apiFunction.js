import API from "./api";

// Fetches all managers from the database and returns them as an array with their IDs
export const getAllManagers = async () => {
    try {
      const managersResponse = await API.get('/managers.json');
      const managersData = managersResponse.data;
  
      if (!managersData) {
        return [];
      }
  
      const managers = Object.entries(managersData).map(([id, manager]) => ({
        id,
        ...manager
      }));
  
      return managers;
    } catch (error) {
      console.error('Error getting managers:', error);
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




  // ------Get all floors in a parking lot
  export const getFloors = async (parkingLotId) => {
    try {
      const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = parkingLotResponse.data;
  
      if (!parkingLotData) {
        throw new Error('Parking lot not found');
      }
  
      return parkingLotData.floors;
    } catch (error) {
      console.error('Error getting floors:', error);
      throw error;
    }
  };


  

// ------Get all rows in a floor
  export const getFloorRows = async (parkingLotId, floorId) => {
    try {
      const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = parkingLotResponse.data;
  
      if (!parkingLotData) {
        throw new Error('Parking lot not found');
      }
  
      const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
  
      if (!floor) {
        throw new Error('Floor not found');
      }
  
      return floor.rows;
    } catch (error) {
      console.error('Error getting floor rows:', error);
      throw error;
    }
  };


  // ---- Get all spot informations for a specific floor
export const getFloorSpots = async (parkingLotId, floorId) => {
    try {
      const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
      const parkingLotData = parkingLotResponse.data;
  
      if (!parkingLotData) {
        throw new Error('Parking lot not found');
      }
  
      const floor = parkingLotData.floors.find((f) => f.floorId === parseInt(floorId));
  
      if (!floor) {
        throw new Error('Floor not found');
      }
  
      if (!floor.rows) {
        return [];
      }
  
      const spots = floor.rows.flatMap((row) => {
        if (!row.spots) {
          return [];
        }
        return row.spots;
      });
  
      return spots;
    } catch (error) {
      console.error('Error getting floor spots:', error);
      throw error;
    }

  };


// ---- Get all spot informations for a specific row
export const getRowSpots = async (parkingLotId, floorId, rowId) => {
  try {
    const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
    const parkingLotData = parkingLotResponse.data;

    if (!parkingLotData) {
      throw new Error('Parking lot not found');
    }

    const floor = parkingLotData.floors.find(f => f.floorId === parseInt(floorId));

    if (!floor) {
      throw new Error(`Floor ${floorId} not found`);
    }

    // ✅ Ensure rowId is correct ("R1")
    const row = floor.rows.find(r => r.rowId === rowId);

    if (!row) {
      throw new Error(`Row ${rowId} not found`);
    }
    const spotIndexesAsStrings = row.spots.map((_, index) => index.toString());

    return spotIndexesAsStrings;
  } catch (error) {
    console.error('Error getting row spots:', error);
    throw error;
  }
};



  //---------add Device 
export const addDevice = async () => {
  try {
    const newDevice = {
      deviceId: null
    };

    const deviceResponse = await API.post('/device.json', newDevice);
    const deviceId = deviceResponse.data.name;

    await API.patch(`/device/${deviceId}.json`, {
      deviceId: deviceId,
      sensors: [
        { sensorId: 0, detecting: false },
        { sensorId: 1, detecting: false }
      ]
    });

    return {
      success: true,
      deviceId
    };
  } catch (error) {
    console.error('Error adding device:', error);
    throw error;
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