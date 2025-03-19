
import API from "./api";

export const reassignDeviceToSpot = async (
    deviceId,
    newParkingLotId,
    newFloorId,
    newRowId,
    newSpotNumber,
    newSensorId
) => {
    try {
        // Validate inputs
        if (!deviceId) throw new Error('Device ID is required');
        if (newSensorId === undefined || newSensorId === null) throw new Error('Sensor ID is required');
        if (newSensorId !== 0 && newSensorId !== 1) throw new Error('Sensor ID must be 0 or 1');
        const spotIndex = parseInt(newSpotNumber) - 1;
        if (spotIndex < 0) throw new Error('Spot number must be 1 or greater');

        // Get device data
        const deviceResponse = await API.get(`/device/${deviceId}.json`);
        const deviceData = deviceResponse.data;
        if (!deviceData) throw new Error('Device not found');

        // Get new parking lot data
        const parkingLotResponse = await API.get(`/parkingLots/${newParkingLotId}.json`);
        const parkingLotData = parkingLotResponse.data;
        if (!parkingLotData) throw new Error('Parking lot not found');

        // Find the floor and row in the parking lot
        const floor = parkingLotData.floors.find(f => f.floorId === parseInt(newFloorId));
        if (!floor) throw new Error(`Floor ${newFloorId} not found`);

        const row = floor.rows.find(r => r.rowId === newRowId);
        if (!row) throw new Error(`Row ${newRowId} not found`);

        if (spotIndex >= row.spots.length) {
            throw new Error(`Spot number ${newSpotNumber} is out of bounds`);
        }

        const newSpot = row.spots[spotIndex];
        const newSpotId = newSpot.spotId;

        // Make sure the spot doesn't already have a device
        if (newSpot.deviceId) {
            throw new Error(`Spot ${newSpotNumber} already has a device assigned`);
        }

        // OPTIONAL: Remove the device from old spots in the **old** parking lot
        if (deviceData.parkingLotId && deviceData.floorId && deviceData.rowId) {
            const oldLotId = deviceData.parkingLotId;
            const oldFloorId = deviceData.floorId;
            const oldRowId = deviceData.rowId;

            const oldLotResponse = await API.get(`/parkingLots/${oldLotId}.json`);
            const oldLotData = oldLotResponse.data;

            if (oldLotData) {
                const oldFloor = oldLotData.floors.find(f => f.floorId === oldFloorId);
                if (oldFloor) {
                    const oldRow = oldFloor.rows.find(r => r.rowId === oldRowId);
                    if (oldRow) {
                        const updatedOldRowSpots = oldRow.spots.map(s => {
                            if (s.deviceId === deviceId) {
                                return { ...s, deviceId: null, sensorId: null };
                            }
                            return s;
                        });

                        oldFloor.rows = oldFloor.rows.map(r => {
                            if (r.rowId === oldRowId) {
                                return { ...r, spots: updatedOldRowSpots };
                            }
                            return r;
                        });

                        // Update the old parking lot
                        await API.patch(`/parkingLots/${oldLotId}.json`, {
                            floors: oldLotData.floors
                        });
                    }
                }
            }
        }

        // Update the new spot with the deviceId and sensorId
        const updatedNewFloors = parkingLotData.floors.map(f => {
            if (f.floorId === parseInt(newFloorId)) {
                return {
                    ...f,
                    rows: f.rows.map(r => {
                        if (r.rowId === newRowId) {
                            return {
                                ...r,
                                spots: r.spots.map((s, idx) => {
                                    if (idx === spotIndex) {
                                        return { ...s, deviceId, sensorId: newSensorId };
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

        // Update the new parking lot floors
        await API.patch(`/parkingLots/${newParkingLotId}.json`, {
            floors: updatedNewFloors
        });

        // Update device data: parkingLotId, floorId, rowId, spots
        const updatedDeviceData = {
            ...deviceData,
            parkingLotId: newParkingLotId,
            floorId: parseInt(newFloorId),
            rowId: newRowId,
            spots: [newSpotId],
            type: newSpot.type
        };

        await API.patch(`/device/${deviceId}.json`, updatedDeviceData);

        return {
            success: true,
            message: `Device ${deviceId} reassigned to Parking Lot ${newParkingLotId}, Floor ${newFloorId}, Row ${newRowId}, Spot ${newSpotNumber}`,
            device: updatedDeviceData
        };
    } catch (error) {
        console.error('Error reassigning device:', error);
        return { success: false, error: error.message || 'Failed to reassign device' };
    }
};


export const updateDeviceTypeByMac = async (macAddress, newType) => {
    try {
        if (!macAddress) throw new Error('MAC address is required');
        if (!newType) throw new Error('New type is required');

        // Get all devices (assuming a reasonable number; if large, optimize this query)
        const allDevicesResponse = await API.get('/device.json');
        const allDevicesData = allDevicesResponse.data;

        if (!allDevicesData) {
            throw new Error('No devices found in the database');
        }

        // Find the device by macAddress
        const foundDeviceEntry = Object.entries(allDevicesData).find(
            ([, device]) => device.macAddress === macAddress
        );

        if (!foundDeviceEntry) {
            throw new Error(`Device with MAC address ${macAddress} not found`);
        }

        const [deviceId, deviceData] = foundDeviceEntry;

        // Update the type field of the device
        const updatedDeviceData = {
            ...deviceData,
            type: newType
        };

        await API.patch(`/device/${deviceId}.json`, { type: newType });

        return {
            success: true,
            message: `Device ${deviceId} type updated to ${newType}`,
            updatedDevice: updatedDeviceData
        };
    } catch (error) {
        console.error('Error updating device type:', error);
        return { success: false, error: error.message || 'Failed to update device type' };
    }
};
