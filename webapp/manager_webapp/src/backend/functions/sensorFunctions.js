const {ref, onValueWritten} = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

// Export the sensor detection function
exports.updateSpotStatusOnSensorDetection = onValueWritten("/device/{deviceId}/sensors/{sensorIndex}/detecting", async (event) => {
    try {
        // Get both before and after values
        const beforeValue = event.data.before.val();  // Add .val() to get the actual value
        const afterValue = event.data.after.val();    // Add .val() to get the actual value

        console.log("Before value:", beforeValue); // Debug log
        console.log("After value:", afterValue);   // Debug log

        const deviceId = event.params.deviceId;
        const sensorIndex = event.params.sensorIndex;

        // Get device data
        const deviceSnapshot = await admin.database()
            .ref(`/device/${deviceId}`)
            .once("value");

        const deviceData = deviceSnapshot.val();

        // Check if device exists and has spots array with items
        if (!deviceData || !deviceData.spots || deviceData.spots.length === 0) {
            console.log("Device has no spots assigned, skipping update");
            return null;
        }

        // Get the sensorId from the sensor that triggered the function
        const sensor = deviceData.sensors[sensorIndex];
        if (!sensor) return null;

        const sensorId = sensor.sensorId;
        const {parkingLotId, floorId, rowId} = deviceData;
        if (!parkingLotId || !floorId || !rowId) return null;

        // Get parking lot data
        const parkingLotSnapshot = await admin.database()
            .ref(`/parkingLots/${parkingLotId}`)
            .once("value");

        const parkingLotData = parkingLotSnapshot.val();
        if (!parkingLotData || !parkingLotData.floors) return null;

        // Find the floor
        const floor = parkingLotData.floors.find((f) => f.floorId === floorId);
        if (!floor || !floor.rows) return null;

        // Find the row
        const row = floor.rows.find((r) => r.rowId === rowId);
        if (!row || !row.spots) return null;

        // Find the spot with matching sensorId
        const spotToUpdate = row.spots.find((spot) => spot.sensorId === sensorId);
        if (!spotToUpdate) return null;

        // Determine the new status based on the detecting value
        const newStatus = afterValue === true ? "unavailable" : "available";

        // Debug log
        console.log(`Setting status to ${newStatus} because afterValue is ${afterValue}`);

        // Update the spot status based on detecting value
        const updatedFloors = parkingLotData.floors.map((f) => {
            if (f.floorId === floorId) {
                return {
                    ...f,
                    rows: f.rows.map((r) => {
                        if (r.rowId === rowId) {
                            return {
                                ...r,
                                spots: r.spots.map((s) => {
                                    if (s.sensorId === sensorId) {
                                        return {
                                            ...s,
                                            status: newStatus,
                                        };
                                    }
                                    return s;
                                }),
                            };
                        }
                        return r;
                    }),
                };
            }
            return f;
        });

        // Update the parking lot with the new spot status
        await admin.database()
            .ref(`/parkingLots/${parkingLotId}/floors`)
            .set(updatedFloors);

        console.log(`Updated spot status to ${newStatus} for device ${deviceId}, sensor ${sensorId}`);
        return null;
    } catch (error) {
        console.error("Error in updateSpotStatusOnSensorDetection:", error);
        return null;
    }
});
