import API from "./api";

export const getUserByLicensePlate = async (licensePlate, parkingLotId) => {
    try {
        const response = await API.get(`/users.json`);
        const usersData = response.data;

        if (!usersData) {
            throw new Error('No users found');
        }

        // Convert to an array of users with their ID
        const users = Object.entries(usersData).map(([id, user]) => ({
            id,
            ...user
        }));

        // Search for the user who has this license plate
        const matchedUser = users.find(user => {
            const plates = user.licensePlates || [];
            // Check if license plate exists in their array
            return Object.values(plates).includes(licensePlate);
        });

        if (!matchedUser) {
            throw new Error(`No user found with license plate: ${licensePlate}`);
        }

        // Check if the user is subscribed to the parking lot
        const subscriptions = matchedUser.subscriptions || [];
        const isSubscribed = Object.values(subscriptions).includes(parkingLotId);

        // Return user info and subscription status
        return {
            userId: matchedUser.id,
            fullName: matchedUser.fullName,
            email: matchedUser.email,
            phoneNumber: matchedUser.phoneNumber,
            licensePlates: matchedUser.licensePlates,
            subscriptions: subscriptions,
            isSubscribed
        };

    } catch (error) {
        console.error('Error fetching user by license plate:', error);
        throw error;
    }
};



/**
 * Checks if a user exists and if they are subscribed to a specific parking lot.
 */
export const checkUserSubscription = async (userId, parkingLotId) => {
    try {
        // Fetch user data by userId
        const userResponse = await API.get(`/users/${userId}.json`);

        if (!userResponse.data) {
            console.log(`User ${userId} not found`);
            return { exists: false, isSubscribed: false, user: null };
        }

        const user = userResponse.data;

        // Get subscriptions array/object (default to empty array if none)
        const subscriptions = user.subscriptions || [];

        // Check if parkingLotId exists in subscriptions
        const isSubscribed = Object.values(subscriptions).includes(parkingLotId);

        return {
            exists: true,
            isSubscribed,
            user,
        };

    } catch (error) {
        console.error(`Error checking subscription for user ${userId}:`, error);
        throw error;
    }
};

