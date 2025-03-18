import API from './api';

/**
 * Finds a QR scanner by its macAdress and assigns it a type and parking lot ID.
 * If type and parkingLotId are not present, they will be added.
 *
 * @param {string} macAdress - The MAC address of the scanner (typo from DB).
 * @param {string} type - The type to assign ('Entry' or 'Exit').
 * @param {string} parkingLotId - The parking lot ID to assign.
 */
export const findAndAssignQRScanner = async (macAdress, type, parkingLotId) => {
    try {
        // Step 1: Query for scanner by macAdress
        const encodedMac = encodeURIComponent(`"${macAdress}"`);
        const query = `/qrScanners.json?orderBy="macAdress"&equalTo=${encodedMac}`;

        const response = await API.get(query);
        const data = response.data;

        if (!data || Object.keys(data).length === 0) {
            console.log(`No scanner found with MAC address: ${macAdress}`);
            return { success: false, message: `Scanner with MAC address ${macAdress} not found.` };
        }

        // Step 2: Get scannerId and data
        const [scannerId, scannerData] = Object.entries(data)[0];

        // Step 3: Add or update the type and parkingLotId
        const updatedData = {
            ...scannerData, // Keep existing data
            type,
            parkingLotId
        };

        // Step 4: Patch the scanner node
        await API.patch(`/qrScanners/${scannerId}.json`, updatedData);

        console.log(`QR Scanner ${scannerId} updated with type "${type}" and parkingLotId "${parkingLotId}"`);
        return {
            success: true,
            message: `QR Scanner ${scannerId} updated.`,
            data: updatedData
        };

    } catch (error) {
        console.error('Error finding and assigning QR scanner:', error);
        return { success: false, error };
    }
};
