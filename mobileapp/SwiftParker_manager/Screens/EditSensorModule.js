import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, ActivityIndicator, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera'; // ✅ Imported CameraView
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateDeviceTypeByMac } from "../backend/sensorModuleOps"; // ✅ Make sure the path is correct

const ReassignDeviceScreen = ({ navigation }) => {
    const [loading, setLoading] = useState(true);

    const [deviceMac, setDeviceMac] = useState('');
    const [moduleType, setModuleType] = useState('');
    const [scanning, setScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {
        const initialize = async () => {
            setLoading(true);
            try {
                const session = await AsyncStorage.getItem('userSession');
                if (!session) {
                    navigation.replace('Login');
                    return;
                }
            } catch (error) {
                Alert.alert('Error', 'Initialization failed');
                navigation.goBack();
            }
            setLoading(false);
        };

        initialize();
    }, []);

    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = ({ data }) => {
        if (!scanned) {
            setScanned(true);
            setScanning(false);
            setDeviceMac(data);
        }
    };

    const handleSave = async () => {
        if (!deviceMac || !moduleType) {
            Alert.alert('Missing Info', 'Please scan a device and select its type');
            return;
        }

        try {
            const result = await updateDeviceTypeByMac(deviceMac.trim(), moduleType);
            if (result.success) {
                Alert.alert('Success', result.message);
                navigation.goBack();
            } else {
                Alert.alert('Error', result.error);
            }
        } catch (error) {
            Alert.alert('Error', 'Something went wrong');
        }
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#073b4c" />
                <Text style={styles.loadingText}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerContainer}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Change Device Type</Text>
            </View>

            {/* Device MAC Address */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Device MAC Address</Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter or Scan Device MAC Address"
                        value={deviceMac}
                        onChangeText={setDeviceMac}
                    />
                    <TouchableOpacity
                        style={styles.scanButton}
                        onPress={() => {
                            setScanned(false);
                            setScanning(true);
                        }}
                    >
                        <FontAwesome5 name="qrcode" size={24} color="#ffffff" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* QR Scanner Modal */}
            <Modal visible={scanning} transparent animationType="slide" onRequestClose={() => setScanning(false)}>
                <View style={styles.scannerContainer}>
                    {hasPermission === null ? (
                        <Text style={styles.permissionText}>Requesting camera permission...</Text>
                    ) : hasPermission === false ? (
                        <Text style={styles.permissionText}>No access to camera</Text>
                    ) : (
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        />
                    )}
                    <TouchableOpacity style={styles.closeScanner} onPress={() => setScanning(false)}>
                        <Text style={styles.closeScannerText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>

            {/* Spot Type Selection */}
            <Text style={styles.inputLabel}>Select Spot Type</Text>
            <View style={styles.selectionRow}>
                <TouchableOpacity
                    style={[styles.sensorButton, moduleType === 'general' && styles.selected]}
                    onPress={() => setModuleType('general')}
                >
                    <Text style={[styles.sensorText, moduleType === 'general' && styles.selectedText]}>General</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sensorButton, moduleType === 'EV' && styles.selected]}
                    onPress={() => setModuleType('EV')}
                >
                    <Text style={[styles.sensorText, moduleType === 'EV' && styles.selectedText]}>EV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sensorButton, moduleType === 'handicapped' && styles.selected]}
                    onPress={() => setModuleType('handicapped')}
                >
                    <Text style={[styles.sensorText, moduleType === 'handicapped' && styles.selectedText]}>Handicapped</Text>
                </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#edf2fb', padding: 20, paddingTop: 60 },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    loadingText: { marginTop: 10, fontSize: 16, color: '#073b4c' },
    headerContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    backButton: { marginRight: 10 },
    headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#073b4c' },
    inputContainer: { marginBottom: 15 },
    inputLabel: { fontSize: 16, color: '#073b4c', marginBottom: 5 },
    inputWithButton: { flexDirection: 'row', alignItems: 'center' },
    input: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#073b4c',
        borderRadius: 8,
        paddingHorizontal: 15,
        height: 50,
        backgroundColor: '#fff',
    },
    scanButton: { backgroundColor: '#073b4c', padding: 12, borderRadius: 8, marginLeft: 10 },
    selectionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
    sensorButton: {
        flex: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#073b4c',
        marginHorizontal: 5,
    },
    selected: { backgroundColor: '#073b4c' },
    sensorText: { fontSize: 16, color: '#073b4c' },
    selectedText: { color: '#fff' },
    saveButton: { backgroundColor: '#073b4c', padding: 15, borderRadius: 8 },
    saveButtonText: { color: '#fff', textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    camera: {
        width: '90%',
        height: '50%',
        borderRadius: 10,
    },
    closeScanner: {
        marginTop: 20,
        backgroundColor: 'red',
        padding: 10,
        borderRadius: 5,
    },
    closeScannerText: {
        color: '#fff',
        fontSize: 16,
    },
    permissionText: {
        color: '#fff',
        fontSize: 16,
        marginBottom: 20,
    },
});

export default ReassignDeviceScreen;
