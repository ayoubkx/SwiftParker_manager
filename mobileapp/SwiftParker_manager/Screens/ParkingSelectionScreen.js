import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../backend/firebaseConfig';
import { signOut } from 'firebase/auth';
import {getManagerParkingLots , getParkingLot} from "../backend/apiFunction";




const ParkingSelectionScreen = ({ navigation }) => {
    const [managerName, setManagerName] = useState('');
    const [parkingLots, setParkingLots] = useState([]);
    const [loading, setLoading] = useState(true);

    // Start Session and Retrieve Manager Info
    const startSession = async () => {
        const user = auth.currentUser;
        if (user) {
            const session = {
                email: user.email,
                uid: user.uid,
            };
            await AsyncStorage.setItem('userSession', JSON.stringify(session));

            // Get stored manager details from AsyncStorage
            const firstName = await AsyncStorage.getItem('managerName');
            if (firstName) {
                setManagerName(firstName);
            }
        }
    };

    const fetchParkingLots = async () => {
        try {
            setLoading(true);
            const user = auth.currentUser;

            if (user) {
                const managerId = user.uid;

                // Fetch all parking lots for the manager
                const parkingLots = await getManagerParkingLots(managerId);
                console.log('Raw Parking Lots:', parkingLots);

                // Filter out any null, undefined, or empty objects
                const validLots = parkingLots.filter(
                    (lot) => lot && lot.id !== null && lot.id !== undefined
                );

                // Map them into display format
                const formattedLots = validLots.map((lot) => ({
                    id: lot.id,
                    name: lot.name || 'Unnamed Lot',
                    location: lot.location || 'No Location',
                    available: calculateAvailableSpots(lot.availableSpots),
                }));

                setParkingLots(formattedLots);
            }
        } catch (error) {
            console.error('Error loading parking lots:', error.message);
        } finally {
            setLoading(false);
        }
    };


    const calculateAvailableSpots = (availableSpots) => {
        if (!availableSpots) return 0;
        const { EV = 0, general = 0, handicapped = 0, subscription = 0 } = availableSpots;
        return EV + general + handicapped + subscription;
    };

    useEffect(() => {
        startSession();
        fetchParkingLots()
    }, []);

    // Handle Parking Lot Selection


    const handleSelect = async (parkingLot) => {
        if (parkingLot && parkingLot.id) {
            try {
                // Save parking lot info in AsyncStorage
                await AsyncStorage.setItem('selectedParkingLot', JSON.stringify(parkingLot));

                // Navigate to next screen with parking lot info
                navigation.navigate('ManagerDashboard', { parkingLot });
            } catch (error) {
                console.error('Error saving parking lot:', error);
            }
        } else {
            console.warn('Invalid parking lot selected');
        }
    };



    // Handle Logout
    const handleLogout = async () => {
        try {
            await signOut(auth);
            await AsyncStorage.clear();
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to log out');
        }
    };

    return (
        <View style={styles.container}>
            {/* Show Manager Name */}
            <Text style={styles.greeting}>{managerName || 'Manager'}'s Parking Lots</Text>


            {/* Parking Lot List */}
            <FlatList
                data={parkingLots}
                keyExtractor={(item, index) => item.id ?? index.toString()} // Fallback to index
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.lotName}>{item.name}</Text>
                        <Text style={styles.details}>📍 {item.location}</Text>
                        <Text style={styles.details}>
                            🅿️ Available Spots: {item.available}
                        </Text>
                        <TouchableOpacity
                            style={styles.selectButton}
                            onPress={() => handleSelect(item)}
                        >
                            <Text style={styles.buttonText}>Select</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />



            {/* Logout Button */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Log Out</Text>
            </TouchableOpacity>
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf2fb',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
    },
    greeting: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#073b4c',
        textAlign: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#073b4c',
        marginBottom: 20,
        textAlign: 'center',
    },
    card: {
        backgroundColor: '#ffffff',
        padding: 15,
        marginVertical: 10,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    lotName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#073b4c',
    },
    details: {
        fontSize: 14,
        color: '#555',
        marginVertical: 3,
    },
    selectButton: {
        marginTop: 10,
        backgroundColor: '#073b4c',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    logoutButton: {
        marginTop: 20,
        marginBottom: 40,
        backgroundColor: '#d9534f',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default ParkingSelectionScreen;

