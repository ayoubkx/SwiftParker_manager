const {onValueWritten} = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp();
}

// Export the sensor detection function
exports.updateSpotStatusOnSensorDetection = onValueWritten({
    ref: "/device/{deviceId}/sensors/{sensorIndex}/detecting",
    region: "us-central1", // Set your preferred region
}, async (event) => {
    try {
    // Get both before and after values
        const beforeValue = event.data.before?.val();
        const afterValue = event.data.after?.val();

        console.log("Before value:", beforeValue);
        console.log("After value:", afterValue);

        const deviceId = event.params.deviceId;
        const sensorIndex = event.params.sensorIndex;
        console.log(`Processing event for deviceId: ${deviceId}, sensorIndex: ${sensorIndex}`);

        // Get device data
        const deviceSnapshot = await admin.database()
            .ref(`/device/${deviceId}`)
            .once("value");

        const deviceData = deviceSnapshot.val();
        console.log("Device data retrieved:", deviceData ? "Success" : "Null");

        // Check if device exists and has spots array with items
        if (!deviceData || !deviceData.spots || deviceData.spots.length === 0) {
            console.log("Device has no spots assigned, skipping update");
            return null;
        }

        // Get the sensorId from the sensor that triggered the function
        const sensor = deviceData.sensors[sensorIndex];
        if (!sensor) {
            console.log(`No sensor found at index ${sensorIndex}`);
            return null;
        }

        const sensorId = sensor.sensorId;
        console.log(`Found sensorId: ${sensorId}`);

        const {parkingLotId, floorId, rowId} = deviceData;
        console.log(`Device location: parkingLotId=${parkingLotId}, floorId=${floorId}, rowId=${rowId}`);

        if (!parkingLotId || floorId === undefined || floorId === null || !rowId) {
            console.log("Missing location information");
            return null;
        }

        // Get parking lot data
        const parkingLotSnapshot = await admin.database()
            .ref(`/parkingLots/${parkingLotId}`)
            .once("value");

        const parkingLotData = parkingLotSnapshot.val();
        console.log("Parking lot data retrieved:", parkingLotData ? "Success" : "Null");

        if (!parkingLotData || !parkingLotData.floors) {
            console.log("Parking lot has no floors data");
            return null;
        }

        // Find the floor
        const floor = parkingLotData.floors.find((f) => f.floorId === floorId);
        console.log("Floor found:", floor ? "Yes" : "No");

        if (!floor || !floor.rows) {
            console.log("Floor not found or has no rows");
            return null;
        }

        // Find the row
        const row = floor.rows.find((r) => r.rowId === rowId);
        console.log("Row found:", row ? "Yes" : "No");

        if (!row || !row.spots) {
            console.log("Row not found or has no spots");
            return null;
        }

        // Find the spot with matching sensorId
        const spotToUpdate = row.spots.find((spot) => spot.sensorId === sensorId);
        console.log(`Spot with sensorId ${sensorId} found:`, spotToUpdate ? "Yes" : "No");

        if (!spotToUpdate) {
            console.log(`No spot found with sensorId ${sensorId}. Available sensorIds in row:`,
                row.spots.map((s) => s.sensorId).join(", "));
            return null;
        }

        // Determine the new status based on the detecting value
        const newStatus = afterValue === true ? "unavailable" : "available";
        console.log(`Current spot status: ${spotToUpdate.status}`);
        console.log(`Setting status to ${newStatus} because afterValue is ${afterValue}`);

        // Add this to check if we're actually changing anything
        if (spotToUpdate.status === newStatus) {
            console.log(`Spot status is already ${newStatus}, no update needed`);
            return null;
        }

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
                                        console.log(`Updating spot ${s.spotId} with sensorId ${sensorId} from ${s.status} to ${newStatus}`);
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

        // Before the final update, log the full path
        const updatePath = `/parkingLots/${parkingLotId}/floors`;
        console.log(`Updating at path: ${updatePath}`);

        // Update the parking lot with the new spot status
        await admin.database()
            .ref(updatePath)
            .set(updatedFloors);

        console.log(`Successfully updated spot status to ${newStatus} for device ${deviceId}, sensor ${sensorId}`);
        return null;
    } catch (error) {
        console.error("Error in updateSpotStatusOnSensorDetection:", error);
        return null;
    }
});
