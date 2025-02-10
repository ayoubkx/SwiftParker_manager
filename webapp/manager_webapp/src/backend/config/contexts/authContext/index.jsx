import React, { useEffect, useState, useContext } from "react";
import { auth } from "../../firebaseconfig";
import { onAuthStateChanged } from "@firebase/auth";
import API from '../../../../backend/api';

const AuthContext = React.createContext();

export function useAuth() {
    return useContext(AuthContext);
}

// Function to get manager profile
async function getManagerProfile(authId) {
    try {
        const response = await API.get(`/managers.json?orderBy="authId"&equalTo="${authId}"`);
        const managers = response.data;

        if (!managers || Object.keys(managers).length === 0) {
            return null;
        }

        const managerId = Object.keys(managers)[0];
        return {
            id: managerId,
            ...managers[managerId]
        };
    } catch (error) {
        console.error('Error fetching manager profile:', error);
        return null;
    }
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [userLoggedIn, setUserLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [managerProfile, setManagerProfile] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, initializeUser);
        return unsubscribe;
    }, []);

    async function initializeUser(user) {
        if (user) {
            setCurrentUser({ ...user });
            setUserLoggedIn(true);

            try {
                const managerData = await getManagerProfile(user.uid);
                setManagerProfile(managerData);
            } catch (error) {
                console.error('Error fetching manager profile:', error);
                setManagerProfile(null);
            }
        } else {
            setCurrentUser(null);
            setUserLoggedIn(false);
            setManagerProfile(null);
        }
        setLoading(false);
    }

    // Function to refresh manager profile
    const refreshManagerProfile = async () => {
        if (currentUser) {
            try {
                const managerData = await getManagerProfile(currentUser.uid);
                setManagerProfile(managerData);
            } catch (error) {
                console.error('Error refreshing manager profile:', error);
            }
        }
    };

    const value = {
        currentUser,
        userLoggedIn,
        loading,
        managerProfile,
        refreshManagerProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}