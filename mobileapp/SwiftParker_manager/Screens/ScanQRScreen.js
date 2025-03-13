import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {checkUserSubscription} from "../backend/userManagement";
import { createParkingSession, getOngoingParkingSessionByLotAndUser, getOngoingParkingSession , finalizeParkingSession } from "../backend/ParkingSessions";


const ScanQRScreen = ({ navigation }) => {


    const [hasPermission, setHasPermission] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [scanType, setScanType] = useState(null);
    const [alertVisible, setAlertVisible] = useState(false);


    useEffect(() => {
        const checkSession = async () => {
            const session = await AsyncStorage.getItem('userSession');
            if (!session) {
                navigation.replace('Login'); // Redirect if no session
            }
        };
        checkSession();
    }, []);



    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const startScan = (type) => {
        setScanType(type);
        setScanning(true);
    };

    const handleEntryScan = async (userId, parkingLotId, isSubscribed) => {
        try {
            const existingSession = await getOngoingParkingSessionByLotAndUser(userId, parkingLotId);

            if (existingSession) {
                showAlertOnce('🚫 Duplicate Entry', 'User already has an ongoing session!');
                return;
            }


            const createResult = await createParkingSession({ userId, parkingLotId, isSubscribed });

            if (createResult.success) {
                const actionMessage = `Opening gate for entry...\n✅ User  ${isSubscribed ? 'is subscribed' : 'is a visitor'}.`;
                showAlertOnce('✅ Entry Granted', actionMessage);
            } else {
                showAlertOnce('❌ Error', 'Failed to create parking session.');
            }

        } catch (error) {
            console.error('Error handling entry:', error);
            showAlertOnce('Error', 'Could not process entry scan.');
        }
    };


    const handleExitScan = async (userId, parkingLot) => {
        try {
            const ongoingSession = await getOngoingParkingSessionByLotAndUser(userId, parkingLot.id);

            if (!ongoingSession) {
                showAlertOnce('🚫 No Active Session', 'This user has no ongoing parking session.');
                return;
            }

            const finalizedSession = await finalizeParkingSession(userId, parkingLot);

            const message = `
        ✅ Exit Granted
        Duration: ${finalizedSession.duration} minutes
        Amount Charged: $${finalizedSession.amountCharged}
        ${finalizedSession.isSubscribed ? 'Subscriber (Free Access)' : 'Visitor (Charge Applied)'}
        `;

            showAlertOnce('✅ Exit Complete', message);

        } catch (error) {
            console.error('Error handling exit:', error);
            showAlertOnce('Error', 'Could not process exit scan.');
        }
    };

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned || alertVisible) return; // Prevent multiple alerts
        setScanned(true);
        setAlertVisible(true);

        try {
            const scannedUserId = data.trim();

            // Get the parking lot from AsyncStorage
            const storedParkingLot = await AsyncStorage.getItem('selectedParkingLot');
            if (!storedParkingLot) {
                showAlertOnce('Error', 'No parking lot selected.');
                return;
            }

            const parkingLot = JSON.parse(storedParkingLot);
            const parkingLotId = parkingLot.id;

            // Check if the user exists + subscription
            const result = await checkUserSubscription(scannedUserId, parkingLotId);

            if (!result.exists) {
                showAlertOnce('❌ User Not Found', `No user found with ID: ${scannedUserId}`);
                return;
            }

            if (scanType === 'Entry') {
                await handleEntryScan(scannedUserId, parkingLotId, result.isSubscribed);
                stopScan();
            } else if (scanType === 'Exit') {
                await handleExitScan(scannedUserId, parkingLot);
                stopScan();
            }

        } catch (error) {
            console.error('Error during QR scan processing:', error);
            showAlertOnce('Error', 'An unexpected error occurred.');
        }
    };




// ✅ Helper function for consistent alerts + scanner reset
    const showAlertOnce = (title, message) => {
        Alert.alert(title, message, [
            {
                text: 'OK',
                onPress: resetScanner,
                style: 'default'
            }
        ]);
    };

// ✅ Clean scanner reset after alert dismissal
    const resetScanner = () => {
        setTimeout(() => {
            setScanned(false);
            setAlertVisible(false);
            stopScan(); // 🚀 stops the camera scanning
        }, 500);
    };




    const stopScan = () => setScanning(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Scan Type</Text>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.option} onPress={() => startScan('Entry')}>
                    <FontAwesome5 name="sign-in-alt" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Scan for Entry</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => startScan('Exit')}>
                    <FontAwesome5 name="sign-out-alt" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Scan for Exit</Text>
                </TouchableOpacity>
            </View>

            {scanning && (
                <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#edf2fb', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    backButton: { position: 'absolute', top: 60, left: 20, zIndex: 10 },
    title: { fontSize: 22, fontWeight: 'bold', color: '#073b4c', marginBottom: 30 },
    grid: { flexDirection: 'row', justifyContent: 'center', width: '100%' },
    option: { width: 140, height: 140, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', borderRadius: 10, margin: 15, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
    optionText: { fontSize: 16, color: '#073b4c', marginTop: 10, textAlign: 'center', fontWeight: 'bold' },
    camera: { width: '90%', height: '50%' }
});

export default ScanQRScreen;
