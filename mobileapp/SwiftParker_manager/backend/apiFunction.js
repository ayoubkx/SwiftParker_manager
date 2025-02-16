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

