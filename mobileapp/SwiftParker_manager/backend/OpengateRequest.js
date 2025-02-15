import database from '@react-native-firebase/database';

const sendOpenGateRequest = async (microcontrollerID) => {
    try {
        // Retrieve the microprocessor's IP from Firebase
        const snapshot = await database().ref(`/microcontrollers/${microcontrollerID}`).once('value');
        const microcontroller = snapshot.val();

        if (!microcontroller || !microcontroller.ip) {
            alert("Microcontroller not found!");
            return;
        }

        const microprocessorIP = microcontroller.ip;
        console.log(`Sending request to ESP32 at: ${microprocessorIP}`);

        // Send HTTP request directly to ESP32
        const response = await fetch(`http://${microprocessorIP}/open-gate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command: "OPEN_GATE" }),
        });

        const data = await response.json();
        if (data.success) {
            alert("Gate opened successfully!");
        } else {
            alert("Failed to open gate.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Could not send request to microcontroller.");
    }
};
