import React, {useEffect, useState} from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Camera, CameraView } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {getFloors , getFloorSpots, getFloorRows, getRowSpots} from "../backend/apiFunction";



const AddSensorModuleScreen = ({ navigation }) => {

    useEffect(() => {
        const checkSession = async () => {
            const session = await AsyncStorage.getItem('userSession');
            if (!session) {
                navigation.replace('Login'); // Redirect if no session
            }
        };
        checkSession();
    }, []);

    const [parkingLot, setParkingLot] = useState(null);
    useEffect(() => {
        const fetchParkingLot = async () => {
            try {
                const storedData = await AsyncStorage.getItem('selectedParkingLot');
                if (storedData) {
                    const parsedData = JSON.parse(storedData);
                    setParkingLot(parsedData);
                }
            } catch (error) {
                console.error('Error retrieving parking lot:', error);
            }
        };
        fetchParkingLot();
    }, []);

    const [deviceID, setDeviceID] = useState('');
    const [selectedSensor, setSelectedSensor] = useState(null);
    const [selectedFloor, setSelectedFloor] = useState('');
    const [selectedRow, setSelectedRow] = useState('');
    const [selectedSpot, setSelectedSpot] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [currentSelection, setCurrentSelection] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);
    const [selectedSpotType, setSelectedSpotType] = useState('');
    const [spotTypeModalVisible, setSpotTypeModalVisible] = useState(false);
    const [modalOptions, setModalOptions] = useState([]);



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
            setDeviceID(data);  // Directly set Device ID
        }
    };

    const handleOpenModal = async (selectionType) => {
        if (!parkingLot) {
            alert("No parking lot selected");
            return;
        }

        setCurrentSelection(selectionType);

        try {
            let options = [];

            if (selectionType === 'floor') {
                const floors = await getFloors(parkingLot.id);
                // Assuming floors is an array of objects with floorId
                options = floors.map((floor) => floor.floorId.toString());
            }

            if (selectionType === 'row') {
                if (!selectedFloor) {
                    alert("Please select a floor first");
                    return;
                }
                const rows = await getFloorRows(parkingLot.id, selectedFloor);
                // Assuming rows is an array of objects with rowId
                options = rows.map((row) => row.rowId);
            }

            if (selectionType === 'spot') {
                if (!selectedFloor || !selectedRow) {
                    alert("Please select both a floor and a row first");
                    return;
                }

                // ✅ USE NEW FUNCTION HERE:
                const spots = await getRowSpots(parkingLot.id, selectedFloor, selectedRow);

                // Assuming spots is an array of objects with spotId
                options = spots.map((spot) => spot.spotId);
            }

            setModalOptions(options);
            setModalVisible(true);
        } catch (error) {
            console.error(`Error loading ${selectionType}s:`, error);
            alert(`Error loading ${selectionType}s`);
        }
    };


    const handleSelect = (value) => {
        if (currentSelection === 'floor') setSelectedFloor(value);
        if (currentSelection === 'row') setSelectedRow(value);
        if (currentSelection === 'spot') setSelectedSpot(value);
        setModalVisible(false);
    };

    const handleSave = () => {
        if (!deviceID || !selectedSensor || !selectedFloor || !selectedRow || !selectedSpot) {
            alert("Please complete all fields.");
            return;
        }

        console.log("Sensor Module Added:", {
            deviceID,
            selectedSensor,
            selectedFloor,
            selectedRow,
            selectedSpot
        });

        alert("Sensor Module Successfully Added!");
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>

            <Text style={styles.title}>Add Sensor Module</Text>

            {/* Device ID Input */}
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


            <Modal visible={scanning} transparent animationType="slide">
                <View style={styles.scannerContainer}>
                    {hasPermission === null ? (
                        <Text style={styles.permissionText}>Checking permissions...</Text>
                    ) : hasPermission ? (
                        <CameraView
                            style={styles.camera}
                            facing="back"
                            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
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


            {/* Sensor Selection */}
            <Text style={styles.inputLabel}>Select Sensor</Text>
            <View style={styles.selectionRow}>
                <TouchableOpacity
                    style={[styles.sensorButton, selectedSensor === "A" && styles.selected]}
                    onPress={() => setSelectedSensor("A")}
                >
                    <Text style={[styles.sensorText, selectedSensor === "A" && styles.selectedText]}>Sensor A</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sensorButton, selectedSensor === "B" && styles.selected]}
                    onPress={() => setSelectedSensor("B")}
                >
                    <Text style={[styles.sensorText, selectedSensor === "B" && styles.selectedText]}>Sensor B</Text>
                </TouchableOpacity>
            </View>


            {/* Floor Selection */}
            <TouchableOpacity style={styles.dropdown} onPress={() => handleOpenModal('floor')}>
                <Text style={styles.dropdownText}>{selectedFloor ? `Floor ${selectedFloor}` : "Select Floor"}</Text>
            </TouchableOpacity>

            {/* Row Selection */}
            <TouchableOpacity style={styles.dropdown} onPress={() => handleOpenModal('row')}>
                <Text style={styles.dropdownText}>{selectedRow ? `Row ${selectedRow}` : "Select Row"}</Text>
            </TouchableOpacity>

            {/* Spot Selection */}
            <TouchableOpacity style={styles.dropdown} onPress={() => handleOpenModal('spot')}>
                <Text style={styles.dropdownText}>{selectedSpot ? `Spot ${selectedSpot}` : "Select Spot"}</Text>
            </TouchableOpacity>

            {/* Save Button */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>

            {/* Modal for Selecting Floor, Row, Spot */}
            <Modal visible={modalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        <FlatList
                            data={modalOptions}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.modalItem} onPress={() => handleSelect(item)}>
                                    <Text style={styles.modalItemText}>{item}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <TouchableOpacity style={styles.closeModal} onPress={() => setModalVisible(false)}>
                            <Text style={styles.closeModalText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>


            {/* Spot Type Modal */}
            <Modal visible={spotTypeModalVisible} transparent animationType="slide">
                <View style={styles.modalContainer}>
                    <View style={styles.modalContent}>
                        {["General", "EV", "Handicapped", "Reserved"].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={styles.modalItem}
                                onPress={() => {
                                    setSelectedSpotType(type);
                                    setSpotTypeModalVisible(false);
                                }}
                            >
                                <Text style={styles.modalItemText}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                        <TouchableOpacity
                            style={styles.closeModal}
                            onPress={() => setSpotTypeModalVisible(false)}
                        >
                            <Text style={styles.closeModalText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
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
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#073b4c',
        marginBottom: 20,
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
    input: {
        flex: 1,
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#073b4c',
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#073b4c',
        backgroundColor: '#ffffff',
    },
    selectionRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 15,
    },
    sensorButton: {
        flex: 1,
        height: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 5,
        borderWidth: 1,
        borderColor: '#073b4c',
    },
    selected: {
        backgroundColor: '#073b4c',
    },
    selectedText: {
        color: '#ffffff',
    },
    dropdown: {
        width: '100%',
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#073b4c',
        borderRadius: 8,
        backgroundColor: '#ffffff',
        marginVertical: 10,
    },
    dropdownText: {
        fontSize: 16,
        color: '#073b4c',
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
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: 250,
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
    },
    modalItem: {
        padding: 10,
    },
    modalItemText: {
        fontSize: 18,
    },
    closeModal: {
        marginTop: 10,
        alignItems: 'center',
    },
    closeModalText: {
        color: 'red',
        fontSize: 16,
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
    scanButton: {
        backgroundColor: '#073b4c',
        padding: 12,
        borderRadius: 8,
        marginLeft: 10,
    },
    inputWithButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
    },



});

export default AddSensorModuleScreen;
