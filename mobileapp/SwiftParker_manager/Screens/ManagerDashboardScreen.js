import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const ManagerDashboardScreen = ({ route, navigation }) => {

    useEffect(() => {
        const checkSession = async () => {
            const session = await AsyncStorage.getItem('userSession');
            if (!session) {
                navigation.replace('Login'); // Redirect if no session
            }
        };
        checkSession();
    }, []);


    const { parkingLot } = route.params;

    const handleNavigation = (screenName) => {
        navigation.navigate(screenName, { parkingLot });
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>

            <Text style={styles.title}>{parkingLot.name} Dashboard</Text>

            <View style={styles.grid}>
                {/* Add Hardware Devices */}
                <TouchableOpacity style={styles.option} onPress={() => handleNavigation('AddHardware')}>
                    <FontAwesome5 name="microchip" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Add Hardware</Text>
                </TouchableOpacity>

                {/* Scan QR Code */}
                <TouchableOpacity style={styles.option} onPress={() => handleNavigation('ScanQRCode')}>
                    <FontAwesome5 name="qrcode" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Scan QR Code</Text>
                </TouchableOpacity>

                {/* Check License Plates */}
                <TouchableOpacity style={styles.option} onPress={() => handleNavigation('CheckPlates')}>
                    <FontAwesome5 name="car" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Check Plates</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf2fb',
        paddingHorizontal: 20,
        paddingTop: 50, // Adjusted for back button
        alignItems: 'center',
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
        marginBottom: 30,
        marginTop: 10,
        marginLeft: 25,
    },
    grid: {
        flexDirection: "column",
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 100,
    },
    option: {
        width: 150,
        height: 150,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        margin: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    optionText: {
        fontSize: 14,
        color: '#073b4c',
        marginTop: 10,
        textAlign: 'center',
    },
});

export default ManagerDashboardScreen;
