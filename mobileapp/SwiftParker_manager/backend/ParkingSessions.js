import API from './api';

// Create a new parking session on user entry.

export const createParkingSession = async ({ userId, parkingLotId, isSubscribed }) => {
    try {
        // Compose the parking session object
        const newSession = {
            userId,
            parkingLotId,
            entryTime: new Date().toISOString(),
            exitTime: "",
            duration: 0,
            isSubscribed,
            amountCharged: isSubscribed ? 0 : 0,
            paymentStatus: isSubscribed ? 'free' : 'pending'
        };

        // Post to parkingSessions (Firebase will auto generate the key)
        const response = await API.post(`/parkingSessions.json`, newSession);

        console.log('Parking session created:', response.data);
        return { success: true, sessionId: response.data.name, data: newSession };

    } catch (error) {
        console.error('Error creating parking session:', error);
        return { success: false, error };
    }
};
// Retrieves the ongoing parking session for a given userId.
export const getOngoingParkingSession = async (userId) => {
    try {
        // ✅ Firebase query with params ensures proper encoding
        const response = await API.get(`/parkingSessions.json`, {
            params: {
                orderBy: '"userId"',        // must be double-quoted!
                equalTo: `"${userId}"`      // userId must be double-quoted!
            }
        });

        const sessionsData = response.data;

        if (!sessionsData || Object.keys(sessionsData).length === 0) {
            console.log(`No sessions found for user ${userId}`);
            return null;
        }

        // ✅ Iterate through returned sessions
        const sessions = Object.entries(sessionsData);

        // ✅ Look for session with exitTime === ""
        const ongoingSessionEntry = sessions.find(([sessionId, session]) => {
            return session.exitTime === ""; // ongoing session check
        });

        if (!ongoingSessionEntry) {
            console.log(`No ongoing session found for user ${userId}`);
            return null;
        }

        const [sessionId, ongoingSession] = ongoingSessionEntry;

        console.log(`Ongoing session found for user ${userId}:`, sessionId);

        return {
            sessionId,
            ...ongoingSession
        };

    } catch (error) {
        console.error('Error fetching ongoing parking session:', error);
        throw error;
    }
};

 //Calculate parking fee based on duration, weekend, and rates.

export const calculateParkingFee = (durationMinutes, isWeekend, parkingLot) => {

    console.log("Raw parkingLot object:", parkingLot);


    const hourlyRate = isWeekend
        ? Number(parkingLot.hourlyRateWeekend)
        : Number(parkingLot.hourlyRateWeekday);

    const dailyRate = isWeekend
        ? Number(parkingLot.dailyRateWeekend)
        : Number(parkingLot.dailyRateWeekday);

    console.log("Rates used:", { hourlyRate, dailyRate });

    // ✅ Make sure the rates are valid numbers
    if (isNaN(hourlyRate) || isNaN(dailyRate)) {
        console.error("Invalid rates detected!", { hourlyRate, dailyRate });
        return 0;  // Fallback if your data is corrupted or missing
    }

    // ✅ Calculate the fee
    if (durationMinutes <= 60) {
        return hourlyRate; // Minimum one hour
    }

    if (durationMinutes <= 360) {
        const hours = Math.ceil(durationMinutes / 60);
        return hours * hourlyRate;
    }

    return dailyRate; // Over 6 hours, charge daily rate
};


 //Get ongoing session for specific user and parking lot.

export const getOngoingParkingSessionByLotAndUser = async (userId, parkingLotId) => {
    try {
        const response = await API.get(`/parkingSessions.json?orderBy="userId"&equalTo="${userId}"`);
        const sessionsData = response.data;

        if (!sessionsData || Object.keys(sessionsData).length === 0) {
            console.log(`No sessions found for user ${userId}`);
            return null;
        }

        const sessions = Object.entries(sessionsData);

        const ongoingSessionEntry = sessions.find(([sessionId, session]) => {
            return (
                session.exitTime === "" &&
                session.parkingLotId === parkingLotId
            );
        });

        if (!ongoingSessionEntry) {
            console.log(`No ongoing session found for user ${userId} in lot ${parkingLotId}`);
            return null;
        }

        const [sessionId, ongoingSession] = ongoingSessionEntry;

        return {
            sessionId,
            ...ongoingSession
        };

    } catch (error) {
        console.error('Error fetching ongoing parking session:', error);
        throw error;
    }
};


 // Finalize the parking session for a user in a parking lot.

export const finalizeParkingSession = async (userId, parkingLotId) => {
    try {
        // 1. Get the ongoing session for this user and parking lot
        const ongoingSession = await getOngoingParkingSessionByLotAndUser(userId, parkingLotId);

        if (!ongoingSession) {
            throw new Error('No ongoing parking session found for this user in this parking lot');
        }

        const sessionId = ongoingSession.sessionId;
        const sessionData = ongoingSession;

        // 2. Get full parking lot object (including rates)
        const parkingLotResponse = await API.get(`/parkingLots/${parkingLotId}.json`);
        const parkingLot = parkingLotResponse.data;

        if (!parkingLot) {
            throw new Error('Parking lot data not found');
        }

        console.log("Full parkingLot object:", parkingLot);

        // 3. Calculate the duration
        const entryTime = new Date(sessionData.entryTime);
        const exitTime = new Date();
        const durationMs = exitTime - entryTime;
        const durationMinutes = Math.ceil(durationMs / (1000 * 60));

        console.log("Parking duration:", durationMinutes, "minutes");

        // 4. Calculate charges if user is not subscribed
        let amountCharged = 0;
        let paymentStatus = 'paid'; // or 'pending' if you process payment later

        if (!sessionData.isSubscribed) {
            const isWeekend = exitTime.getDay() === 0 || exitTime.getDay() === 6;

            amountCharged = calculateParkingFee(durationMinutes, isWeekend, parkingLot);

            if (isNaN(amountCharged)) {
                throw new Error('Calculated amountCharged is NaN - check parkingLot rates!');
            }

            paymentStatus = 'pending'; // Mark as pending payment for non-subscribers
        }

        // 5. Prepare and patch the updated session
        const updatedSession = {
            ...sessionData,
            exitTime: exitTime.toISOString(),
            duration: durationMinutes,
            amountCharged,
            paymentStatus
        };

        await API.patch(`/parkingSessions/${sessionId}.json`, updatedSession);

        console.log('✅ Session finalized:', updatedSession);

        return updatedSession;

    } catch (error) {
        console.error('❌ Error finalizing parking session:', error.message);
        throw error;
    }
};