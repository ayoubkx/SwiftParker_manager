import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        console.log('Logging in with:', email, password);
        navigation.navigate('ParkingSelection');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
                <Image source={require('../assets/Swift.png')} style={styles.logo} />
                <Text style={styles.title}>Manager Console</Text>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email</Text>
                    <TextInput
                        style={styles.input}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Password</Text>
                    <TextInput
                        style={styles.input}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>

                <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
                    <Text style={styles.loginButtonText}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf2fb', // Light blue background
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    logo: {
        width: 230,
        height: 230,
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#073b4c', // Dark blue title
        marginBottom: 40,
    },
    inputContainer: {
        width: '100%',
        marginBottom: 15,
    },
    inputLabel: {
        fontSize: 16,
        color: '#073b4c', // Dark blue text for clarity
        marginBottom: 5,
    },
    input: {
        width: '100%',
        height: 50,
        borderWidth: 1,
        borderColor: '#073b4c', // Border color for consistency
        borderRadius: 8,
        paddingHorizontal: 15,
        fontSize: 16,
        color: '#073b4c', // Text color for readability
        backgroundColor: '#ffffff', // White input field
    },
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#073b4c', // Dark blue button
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    loginButtonText: {
        color: '#ffffff', // White text on dark button
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#073b4c', // Dark blue text
        marginTop: 10,
        fontSize: 14,
    },
});

export default LoginScreen;
