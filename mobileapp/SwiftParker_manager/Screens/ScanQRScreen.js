import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';




const ScanQRScreen = ({ navigation }) => {
    useEffect(() => {
        const checkSession = async () => {
            const session = await AsyncStorage.getItem('userSession');
            if (!session) {
                navigation.replace('Login'); // Redirect if no session
            }
        };
        checkSession();
    }, []);

    const [hasPermission, setHasPermission] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [scanned, setScanned] = useState(false);
    const [alertVisible, setAlertVisible] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ data }) => {
        if (!scanned && !alertVisible) {
            setScanned(true);
            setAlertVisible(true); // Prevent multiple alerts

            // Show a nice alert with detected user ID and confirmation
            Alert.alert(
                "QR Code Detected 🚀",
                `✅ User ID: ${data}\n\n🚪 Gate is opening...`,
                [
                    {
                        text: "OK",
                        onPress: () => {
                            setScanned(false);
                            setAlertVisible(false); // Reset alert visibility on dismiss
                        },
                        style: "default"
                    }
                ]
            );
        }
    };

    const startScan = () => setScanning(true);
    const stopScan = () => setScanning(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Scan Type</Text>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.option} onPress={startScan}>
                    <FontAwesome5 name="sign-in-alt" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Scan for Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.option} onPress={startScan}>
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
