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
    ScrollView,
    Alert,
    ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../backend/firebaseConfig';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (email.trim() === '' || password.trim() === '') {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        try {
            setLoading(true);
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Logged in user:', userCredential.user.email);
            navigation.navigate('ParkingSelection');
        } catch (error) {
            let errorMessage = 'An error occurred during login';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No user found with this email';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Invalid password';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Invalid email address';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many failed login attempts. Please try again later';
                    break;
            }
            
            Alert.alert('Error', errorMessage);
            console.error('Login error:', error);
        } finally {
            setLoading(false);
        }
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
                        editable={!loading}
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
                        editable={!loading}
                    />
                </View>
                <TouchableOpacity 
                    style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#ffffff" />
                    ) : (
                        <Text style={styles.loginButtonText}>Login</Text>
                    )}
                </TouchableOpacity>
                <TouchableOpacity disabled={loading}>
                    <Text style={styles.forgotPassword}>Forgot Password?</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#edf2fb',
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
        color: '#073b4c',
        marginBottom: 40,
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
    loginButton: {
        width: '100%',
        height: 50,
        backgroundColor: '#073b4c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
        marginTop: 10,
    },
    loginButtonDisabled: {
        opacity: 0.7,
    },
    loginButtonText: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    forgotPassword: {
        color: '#073b4c',
        marginTop: 10,
        fontSize: 14,
    },
});

export default LoginScreen;