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
    const hourlyRate = isWeekend
        ? parkingLot?.hourlyRateWeekend ?? 0
        : parkingLot?.hourlyRateWeekday ?? 0;

    const dailyRate = isWeekend
        ? parkingLot?.dailyRateWeekend ?? 0
        : parkingLot?.dailyRateWeekday ?? 0;

    console.log("Rates:", { hourlyRate, dailyRate });

    if (durationMinutes <= 60) {
        return hourlyRate; // Charge minimum one hour
    }

    if (durationMinutes <= 360) {
        const hours = Math.ceil(durationMinutes / 60);
        return hours * hourlyRate;
    }

    return dailyRate; // Over 6 hours, daily rate applies
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

export const finalizeParkingSession = async (userId, parkingLot) => {
    try {
        const ongoingSession = await getOngoingParkingSessionByLotAndUser(userId, parkingLot.id);

        if (!ongoingSession) {
            throw new Error('No ongoing parking session found');
        }

        const sessionId = ongoingSession.sessionId;
        const sessionData = ongoingSession;

        const entryTime = new Date(sessionData.entryTime);
        const exitTime = new Date();
        const durationMs = exitTime - entryTime;
        const durationMinutes = Math.ceil(durationMs / (1000 * 60));

        console.log("Duration:", durationMinutes, "minutes");

        let amountCharged = 0;
        let paymentStatus = 'paid';

        if (!sessionData.isSubscribed) {
            const isWeekend = exitTime.getDay() === 0 || exitTime.getDay() === 6;
            amountCharged = calculateParkingFee(durationMinutes, isWeekend, parkingLot);
            paymentStatus = 'pending'; // Or 'paid' if auto payment is implemented
        }

        const updatedSession = {
            ...sessionData,
            exitTime: exitTime.toISOString(),
            duration: durationMinutes,
            amountCharged,
            paymentStatus
        };

        await API.patch(`/parkingSessions/${sessionId}.json`, updatedSession);

        console.log('Session finalized:', updatedSession);
        return updatedSession;
    } catch (error) {
        console.error('Error finalizing parking session:', error);
        throw error;
    }
};
