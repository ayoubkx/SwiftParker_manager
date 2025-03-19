import API from './api.js';

export const getSubscribedUsersByParkingLot = async (parkingLotId) => {
    try {
        // Fetch subscriptions
        const subscriptionsSnap = await API.get('/subscriptions.json');
        const subscriptionsData = subscriptionsSnap.data;

        if (!subscriptionsData) {
            console.log('No subscriptions found.');
            return [];
        }

        // Filter subscriptions for the given parking lot ID
        const filteredSubs = Object.entries(subscriptionsData).filter(
            ([_, sub]) => sub.parkingLotId === parkingLotId
        );

        if (filteredSubs.length === 0) {
            console.log('No subscriptions found for this parking lot.');
            return [];
        }

        // Now fetch users based on userId from each subscription
        const userPromises = filteredSubs.map(async ([subId, sub]) => {
            const userSnap = await API.get(`/users/${sub.userId}.json`);
            const userData = userSnap.data;

            return {
                userId: sub.userId,
                fullName: userData.fullName,
                email: userData.email,
                phoneNumber: userData.phoneNumber,
                licensePlates: userData.licensePlates || [],
                subscription: {
                    id: subId,
                    ...sub
                }
            };
        });

        const subscribedUsers = await Promise.all(userPromises);

        return subscribedUsers;
    } catch (error) {
        console.error('Error fetching subscribed users:', error.message);
        throw error;
    }
};

export const cancelSubscription = async (userId, subscriptionId) => {
    try {
        // Fetch user's subscriptions
        const response = await API.get(`/users/${userId}/subscriptions.json`);
        let subscriptions = response.data || [];

        if (!Array.isArray(subscriptions) || !subscriptions.includes(subscriptionId)) {
            throw new Error("Subscription not found.");
        }

        // Remove subscription ID from user object
        subscriptions = subscriptions.filter(id => id !== subscriptionId);
        await API.put(`/users/${userId}/subscriptions.json`, subscriptions.length ? subscriptions : null);

        // Remove subscription from database
        await API.delete(`/subscriptions/${subscriptionId}.json`);

        // Fetch the subscription details before deletion (if not fetched earlier)
        const subscriptionResponse = await API.get(`/subscriptions/${subscriptionId}.json`);
        const subscriptionData = subscriptionResponse.data;

        if (!subscriptionData) {
            throw new Error("Subscription details not found.");
        }

        const parkingLotId = subscriptionData.parkingLotId;

        // Fetch current available subscription spots
        const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}/availableSpots.json`);
        const availableSubscriptionSpots = parkingLotResponse.data.subscription;

        // Increment the subscription spot by 1
        const updatedSpots = availableSubscriptionSpots + 1;

        // Update Firebase with the incremented value
        await API.patch(`/parkingLots/${parkingLotId}/availableSpots.json`, {
            subscription: updatedSpots
        });


        return subscriptions;
    } catch (error) {
        console.error("Error canceling subscription:", error);
        throw error;
    }
};

// Renew subscription by 1 month
export const renewSubscription = async (userId, subscriptionId) => {
    try {
        // Fetch existing subscription
        const response = await API.get(`/subscriptions/${subscriptionId}.json`);

        if (!response.data) {
            throw new Error("Subscription not found.");
        }

        let subscription = response.data;

        // Extend end date by 1 month (or set from today if missing)
        let newEndDate;
        if (subscription.endDate) {
            newEndDate = new Date(subscription.endDate);
        } else {
            newEndDate = new Date();
        }

        newEndDate.setMonth(newEndDate.getMonth() + 1);
        subscription.endDate = newEndDate.toISOString();

        // Update Firebase (same subscription object, no duplicates)
        await API.put(`/subscriptions/${subscriptionId}.json`, subscription);

        // Return the updated subscription (optional)
        return {
            id: subscriptionId,
            ...subscription
        };
    } catch (error) {
        console.error("Error renewing subscription:", error);
        throw error;
    }
};
