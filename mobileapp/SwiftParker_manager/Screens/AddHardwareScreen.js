import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const AddHardwareScreen = ({ navigation }) => {
    const handleSelection = (type) => {
        if (type === "entry_exit") {
            navigation.navigate("AddEntryExitModule"); // Correct screen name
        } else if (type === "sensor") {
            navigation.navigate("AddSensorModule"); // Correct screen name
        }
    };

    return (
        <View style={styles.container}>
            {/* Back Button */}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>

            <Text style={styles.title}>Select Hardware Type</Text>

            <View style={styles.grid}>
                {/* Entry/Exit Module */}
                <TouchableOpacity style={styles.option} onPress={() => handleSelection("entry_exit")}>
                    <FontAwesome5 name="warehouse" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Entry/Exit Module</Text>
                </TouchableOpacity>

                {/* Sensor Module */}
                <TouchableOpacity style={styles.option} onPress={() => handleSelection("sensor")}>
                    <FontAwesome5 name="car" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Sensor Module</Text>
                </TouchableOpacity>
            </View>
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
        paddingTop: 60, // Added padding to prevent overlap with back button
    },
    backButton: {
        position: 'absolute',
        top: 60, // Adjusted for better alignment
        left: 20,
        zIndex: 10,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#073b4c',
        marginBottom: 30,
    },
    grid: {
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
    },
    option: {
        width: 140,
        height: 140,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        margin: 15,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    optionText: {
        fontSize: 16,
        color: '#073b4c',
        marginTop: 10,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default AddHardwareScreen;
