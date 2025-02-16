import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth } from '../backend/firebaseConfig';
import { signOut } from 'firebase/auth';

const parkingLots = [
    { id: '1', name: 'Downtown Parking', location: '123 Main St', available: 12, total: 50 },
    { id: '2', name: 'Airport Parking', location: '456 Airport Rd', available: 30, total: 100 },
    { id: '3', name: 'Mall Parking', location: '789 Shopping Blvd', available: 5, total: 200 },
];

const ParkingSelectionScreen = ({ navigation }) => {
    const [managerName, setManagerName] = useState('');

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

    useEffect(() => {
        startSession();
    }, []);

    // Handle Parking Lot Selection
    const handleSelect = (parkingLot) => {
        console.log('Selected Parking Lot:', parkingLot.name);
        navigation.navigate('ManagerDashboard', { parkingLot });
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
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.lotName}>{item.name}</Text>
                        <Text style={styles.details}>📍 {item.location}</Text>
                        <Text style={styles.details}>🅿️ Available Spots: {item.available}/{item.total}</Text>
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

