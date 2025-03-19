import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';

const AddHardwareScreen = ({ navigation }) => {
    useEffect(() => {
        const checkSession = async () => {
            const session = await AsyncStorage.getItem('userSession');
            if (!session) {
                navigation.replace('Login');
            }
        };
        checkSession();
    }, []);

    const handleSelection = (type) => {
        if (type === "entry_exit") {
            navigation.navigate("AddEntryExitModule");
        } else if (type === "sensor") {
            navigation.navigate("AddSensorModule");
        } else if (type === "edit_sensor") {
            navigation.navigate("EditSensor"); // New screen name (make sure it matches your navigator)
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>

            <Text style={styles.title}>Select Hardware Type</Text>

            <View style={styles.grid}>
                <TouchableOpacity style={styles.option} onPress={() => handleSelection("entry_exit")}>
                    <FontAwesome5 name="warehouse" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Entry/Exit Module</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.option} onPress={() => handleSelection("sensor")}>
                    <FontAwesome5 name="car" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Sensor Module</Text>
                </TouchableOpacity>

                {/* New Option for Editing Sensor Modules */}
                <TouchableOpacity style={styles.option} onPress={() => handleSelection("edit_sensor")}>
                    <FontAwesome5 name="edit" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Edit Sensor Modules</Text>
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
        paddingTop: 60,
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
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap', // Enable wrapping if you add more options
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
