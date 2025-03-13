import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 👉 Import the backend function here
import { getUserByLicensePlate } from '../backend/userManagement'; // Adjust path as needed

const CheckPlatesScreen = ({ navigation }) => {
    useEffect(() => {
        const checkSession = async () => {
            const session = await AsyncStorage.getItem('userSession');
            if (!session) {
                navigation.replace('Login');
            }
        };
        checkSession();
    }, []);

    const [licensePlate, setLicensePlate] = useState('');
    const [userData, setUserData] = useState(null);

    const handleSearch = async () => {
        if (!licensePlate) {
            Alert.alert('Input Error', 'Please enter a license plate.');
            return;
        }

        try {
            // Retrieve the selected parking lot from AsyncStorage (assuming it's stored there)
            const storedLot = await AsyncStorage.getItem('selectedParkingLot');
            const parkingLot = storedLot ? JSON.parse(storedLot) : null;

            if (!parkingLot || !parkingLot.id) {
                Alert.alert('Error', 'No parking lot selected.');
                return;
            }

            console.log(`Searching for License Plate: ${licensePlate} in lot ${parkingLot.id}`);

            const user = await getUserByLicensePlate(licensePlate, parkingLot.id);

            if (!user) {
                Alert.alert('Not Found', `No user found with license plate ${licensePlate}`);
                setUserData(null);
                return;
            }

            // Prepare user data for display
            const displayData = {
                name: user.fullName || 'Unknown',
                phone: user.phoneNumber || 'Unknown',
                email: user.email || 'Unknown',
                subscription: user.isSubscribed ? 'Subscribed' : 'Not Subscribed',
            };

            setUserData(displayData);

        } catch (error) {
            console.error('Error during search:', error);
            Alert.alert('Error', 'Failed to fetch user data');
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>

            <Text style={styles.title}>Check License Plates</Text>

            <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Enter License Plate</Text>
                <TextInput
                    style={styles.input}
                    value={licensePlate}
                    onChangeText={setLicensePlate}
                    placeholder="ABC-1234"
                    autoCapitalize="characters"
                />
            </View>

            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                <FontAwesome5 name="search" size={20} color="#ffffff" />
                <Text style={styles.searchButtonText}>Search</Text>
            </TouchableOpacity>

            {/* Display User Details */}
            {userData && (
                <View style={styles.resultContainer}>
                    <Text style={styles.resultText}>👤 Name: {userData.name}</Text>
                    <Text style={styles.resultText}>📞 Phone: {userData.phone}</Text>
                    <Text style={styles.resultText}>✉️ Email: {userData.email}</Text>
                    <Text style={styles.resultText}>🚗 Subscription: {userData.subscription}</Text>
                </View>
            )}
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
    searchButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: 50,
        backgroundColor: '#073b4c',
        borderRadius: 8,
        marginTop: 10,
    },
    searchButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    resultContainer: {
        width: '100%',
        backgroundColor: '#ffffff',
        padding: 15,
        borderRadius: 10,
        marginTop: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    resultText: {
        fontSize: 16,
        color: '#073b4c',
        marginVertical: 5,
    },
});

export default CheckPlatesScreen;
