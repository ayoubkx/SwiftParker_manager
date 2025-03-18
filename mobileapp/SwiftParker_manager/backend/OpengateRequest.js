import API from './api';
import axios from 'axios';

// Get QRScanner by parkingLotId and type (Entry/Exit)
export const getQRScannerByParkingLotAndType = async (parkingLotId, type) => {
    try {
        const response = await API.get(`/qrScanners.json?orderBy="parkingLotId"&equalTo="${parkingLotId}"`);
        const scanners = response.data;

        if (!scanners) {
            console.warn('No scanners found for this parking lot.');
            return null;
        }

        const scannerArray = Object.entries(scanners).map(([id, data]) => ({
            id,
            ...data
        }));

        const scanner = scannerArray.find(s => s.type.toLowerCase() === type.toLowerCase());

        if (!scanner) {
            console.warn(`No ${type} scanner found for this parking lot.`);
            return null;
        }

        return scanner;

    } catch (error) {
        console.error('Error fetching QR scanners:', error);
        return null;
    }
};

// Send command to scanner to open gate
export const openGateForParkingLot = async (parkingLotId, type) => {
    try {
        const scanner = await getQRScannerByParkingLotAndType(parkingLotId, type);

        if (!scanner) {
            console.warn('Scanner not found or not assigned.');
            return;
        }

        const ipAddress = scanner.ipAddress;

        if (!ipAddress) {
            console.warn('No IP address assigned to this scanner.');
            return;
        }

        // Send HTTP request to the MCU/scanner to open the gate
        const endpoint = `http://${ipAddress}/openGate?ip=${ipAddress}`;

        const response = await axios.get(endpoint);

        if (response.status === 200) {
            console.log(`Gate opened successfully via ${ipAddress}`);
        } else {
            console.warn('Failed to open gate:', response.status);
        }

    } catch (error) {
        console.error('Error opening gate:', error);
    }
};

