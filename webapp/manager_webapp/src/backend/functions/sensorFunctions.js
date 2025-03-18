const {onValueWritten} = require("firebase-functions/v2/database");
const admin = require("firebase-admin");

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

        // If there's no change in value, exit early
        if (beforeValue === afterValue) {
            console.log("No change in detecting value, skipping update");
            return null;
        }

        const deviceId = event.params.deviceId;
        const sensorIndex = parseInt(event.params.sensorIndex);
        console.log(`Processing event for deviceId: ${deviceId}, sensorIndex: ${sensorIndex}`);

        // Get device data
        const deviceSnapshot = await admin.database()
            .ref(`/device/${deviceId}`)
            .once("value");

        const deviceData = deviceSnapshot.val();
        console.log("Device data:", JSON.stringify(deviceData));

        // Check if device exists
        if (!deviceData) {
            console.log("Device not found, skipping update");
            return null;
        }

        // Get the sensors array and verify it exists
        if (!deviceData.sensors || !Array.isArray(deviceData.sensors)) {
            console.log("Device has no sensors array, skipping update");
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

        // Check if device has required location data
        if (!deviceData.parkingLotId || deviceData.floorId === undefined ||
            deviceData.floorId === null || !deviceData.rowId) {
            console.log("Device missing location data:", {
                parkingLotId: deviceData.parkingLotId,
                floorId: deviceData.floorId,
                rowId: deviceData.rowId,
            });
            return null;
        }

        const {parkingLotId, floorId, rowId} = deviceData;
        console.log(`Device location: parkingLotId=${parkingLotId}, floorId=${floorId}, rowId=${rowId}`);

        // Get parking lot data
        const parkingLotSnapshot = await admin.database()
            .ref(`/parkingLots/${parkingLotId}`)
            .once("value");

        const parkingLotData = parkingLotSnapshot.val();

        // Log parking lot information for debugging
        if (parkingLotData && parkingLotData.availableSpots) {
            console.log("Current availableSpots:", JSON.stringify(parkingLotData.availableSpots));
        } else {
            console.log("No availableSpots found in parking lot data");
        }

        if (!parkingLotData) {
            console.log("Parking lot not found, skipping update");
            return null;
        }

        if (!parkingLotData.floors || !Array.isArray(parkingLotData.floors)) {
            console.log("Parking lot has no floors array, skipping update");
            return null;
        }

        // Find the floor
        const floor = parkingLotData.floors.find((f) => f.floorId === floorId);
        if (!floor) {
            console.log(`Floor with ID ${floorId} not found, skipping update`);
            return null;
        }

        if (!floor.rows || !Array.isArray(floor.rows)) {
            console.log("Floor has no rows array, skipping update");
            return null;
        }

        // Find the row
        const row = floor.rows.find((r) => r.rowId === rowId);
        if (!row) {
            console.log(`Row with ID ${rowId} not found, skipping update`);
            return null;
        }

        if (!row.spots || !Array.isArray(row.spots)) {
            console.log("Row has no spots array, skipping update");
            return null;
        }

        // Find the spot with matching deviceId and sensorId
        // First try with strict matching (both deviceId and sensorId)
        let spotToUpdate = row.spots.find((spot) =>
            spot.deviceId === deviceId && spot.sensorId === sensorId,
        );

        // If no spot found, try just matching deviceId if there's only one sensor
        if (!spotToUpdate && row.spots.filter((spot) => spot.deviceId === deviceId).length === 1) {
            spotToUpdate = row.spots.find((spot) => spot.deviceId === deviceId);
            console.log("Found spot by deviceId only (single sensor device)");
        }

        if (!spotToUpdate) {
            console.log(`No spot found matching deviceId=${deviceId}, sensorId=${sensorId}`);
            console.log("Available spots in row:", row.spots.map((s) => ({
                spotId: s.spotId,
                deviceId: s.deviceId,
                sensorId: s.sensorId,
            })));
            return null;
        }

        console.log("Found spot to update:", JSON.stringify(spotToUpdate));

        // Determine the new status based on the detecting value
        const newStatus = afterValue === true ? "unavailable" : "available";
        console.log(`Current spot status: ${spotToUpdate.status}`);
        console.log(`Setting status to ${newStatus} because afterValue is ${afterValue}`);

        // Get the spot type for availability updates
        const spotType = spotToUpdate.type;
        console.log(`Spot type: ${spotType}`);

        if (!spotType) {
            console.log("Spot has no type, cannot update availability count");
        }

        // Calculate the availability change based on status change
        let availabilityChange = 0;

        // If changing from available to unavailable, decrement availability
        if (spotToUpdate.status === "available" && newStatus === "unavailable") {
            availabilityChange = -1;
            console.log(`Decreasing availability for ${spotType} by 1`);
        }
        // If changing from unavailable to available, increment availability
        else if (spotToUpdate.status === "unavailable" && newStatus === "available") {
            availabilityChange = 1;
            console.log(`Increasing availability for ${spotType} by 1`);
        }
        else {
            console.log(`No availability change needed. Current: ${spotToUpdate.status}, New: ${newStatus}`);
        }

        // Initialize availableSpots if it doesn't exist
        if (!parkingLotData.availableSpots) {
            parkingLotData.availableSpots = {};
            console.log("Initializing availableSpots object");
        }

        // Get current availability count for this spot type
        const currentAvailability = parkingLotData.availableSpots[spotType] || 0;
        console.log(`Current availability for ${spotType}: ${currentAvailability}`);

        // Calculate new availability (ensure it doesn't go below 0)
        const newAvailability = Math.max(0, currentAvailability + availabilityChange);
        console.log(`New availability for ${spotType}: ${newAvailability}`);

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
                                    if (s.spotId === spotToUpdate.spotId) {
                                        console.log(`Updating spot ${s.spotId} from ${s.status} to ${newStatus}`);
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

        // Create an object for the updates
        const updates = {};

        // Update the floors
        updates[`/parkingLots/${parkingLotId}/floors`] = updatedFloors;

        // Only update the availability count if there's a change and the spot has a type
        if (availabilityChange !== 0 && spotType) {
            updates[`/parkingLots/${parkingLotId}/availableSpots/${spotType}`] = newAvailability;
            console.log(`Updating availableSpots/${spotType} to ${newAvailability}`);
        }

        // Log the updates we're about to perform
        console.log("Performing database updates:", JSON.stringify(updates));

        try {
            // Perform all updates in a single operation
            await admin.database().ref().update(updates);
            console.log("Database update successful");
        } catch (updateError) {
            console.error("Error updating database:", updateError);
            throw updateError;  // Re-throw to be caught by outer try/catch
        }

        console.log(`Successfully updated spot status to ${newStatus} and availability counts for device ${deviceId}, sensor ${sensorId}`);
        return null;
    } catch (error) {
        console.error("Error in updateSpotStatusOnSensorDetection:", error);
        return null;
    }
});
