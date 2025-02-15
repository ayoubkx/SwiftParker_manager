import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import {Camera, CameraView} from 'expo-camera';

const AddEntryExitModuleScreen = ({ navigation }) => {
    const [deviceID, setDeviceID] = useState('');
    const [moduleType, setModuleType] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    // Request Camera Permission
    useEffect(() => {
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    // Handle QR Code Scan
    const handleBarCodeScanned = ({ data }) => {
        if (!scanned) {
            setScanned(true);
            setScanning(false);
            setDeviceID(data);
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>

            <Text style={styles.title}>Add Entry/Exit Module</Text>

            {/* Device ID Input with QR Scanner */}
            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Device ID</Text>
                <View style={styles.inputWithButton}>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Device ID"
                        value={deviceID}
                        onChangeText={setDeviceID}
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

            {/* Entry/Exit Selection */}
            <Text style={styles.inputLabel}>Select Module Type</Text>
            <View style={styles.selectionRow}>
                <TouchableOpacity
                    style={[styles.moduleButton, moduleType === "Entry" && styles.selected]}
                    onPress={() => setModuleType("Entry")}
                >
                    <FontAwesome5 name="sign-in-alt" size={24} color={moduleType === "Entry" ? "#fff" : "#073b4c"} />
                    <Text style={[styles.moduleText, moduleType === "Entry" && styles.selectedText]}>Entry</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.moduleButton, moduleType === "Exit" && styles.selected]}
                    onPress={() => setModuleType("Exit")}
                >
                    <FontAwesome5 name="sign-out-alt" size={24} color={moduleType === "Exit" ? "#fff" : "#073b4c"} />
                    <Text style={[styles.moduleText, moduleType === "Exit" && styles.selectedText]}>Exit</Text>
                </TouchableOpacity>
            </View>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={() => navigation.goBack()}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {/* QR Code Scanner Modal */}
            <Modal visible={scanning} transparent animationType="slide">
                <View style={styles.scannerContainer}>
                    {hasPermission === null ? (
                        <Text style={styles.permissionText}>Checking permissions...</Text>
                    ) : hasPermission ? (
                        <CameraView
                            style={styles.camera}
                            facing= "back"
                            barcodeScannerSettings={{
                                barcodeTypes: ['qr'],
                            }}
                            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                        />
                    ) : (
                        <Text style={styles.permissionText}>Permission Denied. Enable Camera in Settings.</Text>
                    )}
                    <TouchableOpacity style={styles.closeScanner} onPress={() => setScanning(false)}>
                        <Text style={styles.closeScannerText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf2fb',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    backButton: {
        position: 'absolute',
        top: 60,
        left: 20,
        zIndex: 10,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        color: '#073b4c',
        marginBottom: 5,
    },
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
    },
    input: {
        flex: 1,
        height: 50,
        borderWidth: 1,
        borderColor: '#073b4c',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#073b4c',
        backgroundColor: '#ffffff',
    },
    scanButton: {
        backgroundColor: '#073b4c',
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    selectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    moduleButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#073b4c',
        flexDirection: 'row',
        gap: 10,
    },
    selected: {
        backgroundColor: '#073b4c',
    },
    moduleText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#073b4c',
    },
    selectedText: {
        color: '#ffffff',
    },
    saveButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#073b4c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 20,
    },
    saveButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    scannerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    camera: {
        width: '90%',
        height: '50%',
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
        fontSize: 18,
        color: '#ffffff',
        textAlign: 'center',
    },
});

export default AddEntryExitModuleScreen;
