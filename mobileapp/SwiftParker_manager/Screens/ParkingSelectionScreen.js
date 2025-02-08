import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

const parkingLots = [
    { id: '1', name: 'Downtown Parking', location: '123 Main St', available: 12, total: 50 },
    { id: '2', name: 'Airport Parking', location: '456 Airport Rd', available: 30, total: 100 },
    { id: '3', name: 'Mall Parking', location: '789 Shopping Blvd', available: 5, total: 200 },
];

const ParkingSelectionScreen = ({ navigation }) => {
    const handleSelect = (parkingLot) => {
        console.log('Selected Parking Lot:', parkingLot.name);
        navigation.navigate('ManagerDashboard', { parkingLot });
    };



    return (
        <View style={styles.container}>
            <Text style={styles.title}>Your Parking Lots</Text>
            <FlatList
                data={parkingLots}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <View style={styles.card}>
                        <Text style={styles.lotName}>{item.name}</Text>
                        <Text style={styles.details}>📍 {item.location}</Text>
                        <Text style={styles.details}>🅿️ Available Spots: {item.available}/{item.total}</Text>
                        <TouchableOpacity style={styles.selectButton} onPress={() => handleSelect(item)}>
                            <Text style={styles.buttonText}>Select</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf2fb',
        paddingHorizontal: 20,
        paddingTop: 40,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#073b4c',
        marginBottom: 20,
        marginTop: 50,
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
});

export default ParkingSelectionScreen;
