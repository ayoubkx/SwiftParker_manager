import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

const ScanQRScreen = ({ navigation }) => {
    const handleSelection = (type) => {
        console.log(`Selected: ${type}`);
        // Later, this will navigate to a dedicated QR scanner screen
        // navigation.navigate('QRScanner', { scanType: type });
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <FontAwesome5 name="arrow-left" size={24} color="#073b4c" />
            </TouchableOpacity>
            <Text style={styles.title}>Select Scan Type</Text>

            <View style={styles.grid}>
                {/* Entry Scan */}
                <TouchableOpacity style={styles.option} onPress={() => handleSelection('Entry')}>
                    <FontAwesome5 name="sign-in-alt" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Scan for Entry</Text>
                </TouchableOpacity>

                {/* Exit Scan */}
                <TouchableOpacity style={styles.option} onPress={() => handleSelection('Exit')}>
                    <FontAwesome5 name="sign-out-alt" size={50} color="#073b4c" />
                    <Text style={styles.optionText}>Scan for Exit</Text>
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

export default ScanQRScreen;
