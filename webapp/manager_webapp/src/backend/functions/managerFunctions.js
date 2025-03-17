const {onValueCreated} = require("firebase-functions/v2/database");
const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a Stripe Connect account for a new manager
exports.createStripeConnectAccount = onValueCreated({
    ref: "/managers/{managerId}",
    region: "us-central1",
}, async (event) => {
    try {
        const managerId = event.params.managerId;
        const managerData = event.data.val();

        // Create a Stripe Connect Express account
        const account = await stripe.accounts.create({
            type: "express",
            email: managerData.email,
            business_type: "company",
            company: {
                name: `${managerData.firstName} ${managerData.lastName}'s Parking Business`.trim(),
            },
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
            },
            metadata: {
                firebaseManagerId: managerId,
            },
        });

        // Update the manager record with the Stripe account ID
        await admin.database().ref(`/managers/${managerId}/stripeAccount`).set({
            stripeAccountId: account.id,
            onboardingComplete: false,
            created: admin.database.ServerValue.TIMESTAMP,
        });

        return null;
    } catch (error) {
        console.error("Error creating Stripe Connect account:", error);
        return null;
    }
});

// Generate onboarding link for manager
exports.generateAccountLink = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {managerId} = request.data;

        // Get manager's Stripe account ID
        const managerSnapshot = await admin.database().ref(`/managers/${managerId}/stripeAccount`).once("value");
        const managerData = managerSnapshot.val();

        if (!managerData || !managerData.stripeAccountId) {
            throw new Error("Manager has no Stripe account");
        }

        // Create account link
        const accountLink = await stripe.accountLinks.create({
            account: managerData.stripeAccountId,
            refresh_url: `${process.env.STRIPE_DOMAIN}/stripe/refresh?managerId=${managerId}`,
            return_url: `${process.env.STRIPE_DOMAIN}/stripe/return?managerId=${managerId}`,
            type: "account_onboarding",
        });

        return {accountLinkUrl: accountLink.url};
    } catch (error) {
        console.error("Error generating account link:", error);
        throw new Error(error.message);
    }
});

// Check manager's Stripe account status
exports.checkStripeAccountStatus = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {managerId} = request.data;

        // Get manager's Stripe account ID
        const managerSnapshot = await admin.database().ref(`/managers/${managerId}/stripeAccount`).once("value");
        const managerData = managerSnapshot.val();

        if (!managerData || !managerData.stripeAccountId) {
            return {
                hasAccount: false,
                message: "No Stripe account found",
            };
        }

        // Check account status with Stripe
        const account = await stripe.accounts.retrieve(managerData.stripeAccountId);

        const onboardingComplete =
      account.details_submitted &&
      account.charges_enabled &&
      account.payouts_enabled;

        // Update onboarding status if needed
        if (onboardingComplete !== managerData.onboardingComplete) {
            await admin.database().ref(`/managers/${managerId}/stripeAccount/onboardingComplete`).set(onboardingComplete);
        }

        return {
            hasAccount: true,
            accountId: account.id,
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            onboardingComplete,
        };
    } catch (error) {
        console.error("Error checking Stripe account:", error);
        throw new Error(error.message);
    }
});

// Process parking payment
exports.processParkingPayment = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId, parkingLotId, entryTime, exitTime} = request.data;

        // Get user data
        const userSnapshot = await admin.database().ref(`/users/${userId}`).once("value");
        const userData = userSnapshot.val();

        if (!userData.stripeCustomer || !userData.stripeCustomer.stripeCustomerId) {
            throw new Error("User has no payment method set up");
        }

        // Get parking lot data
        const parkingLotSnapshot = await admin.database().ref(`/parkingLots/${parkingLotId}`).once("value");
        const parkingLotData = parkingLotSnapshot.val();

        if (!parkingLotData) {
            throw new Error("Parking lot not found");
        }

        // Get manager data
        const managerSnapshot = await admin.database().ref(`/managers/${parkingLotData.managerId}`).once("value");
        const managerData = managerSnapshot.val();

        if (!managerData.stripeAccount || !managerData.stripeAccount.stripeAccountId) {
            throw new Error("Manager has no Stripe account");
        }

        // Calculate amount to charge
        const entry = new Date(entryTime);
        const exit = new Date(exitTime);
        const durationHours = (exit - entry) / (1000 * 60 * 60);

        const day = entry.getDay();
        const isWeekend = day === 0 || day === 6;

        const hourlyRate = isWeekend ?
            parkingLotData.hourlyRateWeekend :
            parkingLotData.hourlyRateWeekday;

        const dailyRate = isWeekend ?
            parkingLotData.dailyRateWeekend :
            parkingLotData.dailyRateWeekday;

        // Use daily rate if it's cheaper than hourly
        let amount = Math.min(
            hourlyRate * durationHours,
            dailyRate,
        );

        // Round to nearest cent and convert to cents for Stripe
        const amountInCents = Math.round(amount * 100);

        // Create a parking session
        const sessionRef = admin.database().ref("/parkingSessions").push();
        const sessionId = sessionRef.key;

        await sessionRef.set({
            userId,
            parkingLotId,
            managerId: parkingLotData.managerId,
            entryTime,
            exitTime,
            durationHours,
            amount,
            status: "processing",
            createdAt: admin.database.ServerValue.TIMESTAMP,
        });

        // Get user's payment methods
        const paymentMethodsSnapshot = await admin.database().ref(`/users/${userId}/paymentMethods`).once("value");
        const paymentMethods = paymentMethodsSnapshot.val() || {};

        // Find default payment method
        let paymentMethodId = null;

        for (const pmId in paymentMethods) {
            if (paymentMethods[pmId].isDefault) {
                paymentMethodId = pmId;
                break;
            }
        }

        // If no default found, get the first one
        if (!paymentMethodId && Object.keys(paymentMethods).length > 0) {
            paymentMethodId = Object.keys(paymentMethods)[0];
        }

        // If still no payment method, get one from Stripe
        if (!paymentMethodId) {
            const stripePaymentMethods = await stripe.paymentMethods.list({
                customer: userData.stripeCustomer.stripeCustomerId,
                type: "card",
            });

            if (stripePaymentMethods.data.length === 0) {
                throw new Error("User has no payment methods");
            }

            paymentMethodId = stripePaymentMethods.data[0].id;
        }

        // Create payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: "usd",
            customer: userData.stripeCustomer.stripeCustomerId,
            payment_method: paymentMethodId,
            off_session: true,
            confirm: true,
            application_fee_amount: Math.round(amountInCents * 0.05), // 5% fee
            transfer_data: {
                destination: managerData.stripeAccount.stripeAccountId,
            },
            metadata: {
                parkingLotId,
                userId,
                sessionId,
                entryTime,
                exitTime,
            },
        });

        // Update session with payment info
        await sessionRef.update({
            paymentIntentId: paymentIntent.id,
            paymentStatus: paymentIntent.status,
            paymentMethod: paymentMethodId,
            updatedAt: admin.database.ServerValue.TIMESTAMP,
        });

        return {
            success: true,
            sessionId,
            paymentIntentId: paymentIntent.id,
            status: paymentIntent.status,
            amount,
        };
    } catch (error) {
        console.error("Error processing payment:", error);
        throw new Error(error.message);
    }
});

// Stripe webhook handler for account updates and payment events
exports.stripeWebhook = onRequest({
    region: "us-central1",
}, async (req, res) => {
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    const sig = req.headers["stripe-signature"];
    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
    case "account.updated": {
        const account = event.data.object;

        // Find the manager with this Stripe account ID
        const managersSnapshot = await admin.database()
            .ref("/managers")
            .orderByChild("stripeAccount/stripeAccountId")
            .equalTo(account.id)
            .once("value");

        // Update onboarding status
        managersSnapshot.forEach((managerSnapshot) => {
            const managerId = managerSnapshot.key;
            const onboardingComplete = account.charges_enabled && account.details_submitted;

            admin.database()
                .ref(`/managers/${managerId}/stripeAccount/onboardingComplete`)
                .set(onboardingComplete);
        });

        break;
    }

    case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionId = paymentIntent.metadata.sessionId;

        if (sessionId) {
        // Update parking session status
            await admin.database().ref(`/parkingSessions/${sessionId}`).update({
                paymentStatus: "succeeded",
                status: "completed",
                updatedAt: admin.database.ServerValue.TIMESTAMP,
            });
        }

        break;
    }

    case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const sessionId = paymentIntent.metadata.sessionId;

        if (sessionId) {
        // Update parking session status
            await admin.database().ref(`/parkingSessions/${sessionId}`).update({
                paymentStatus: "failed",
                status: "failed",
                failureMessage: paymentIntent.last_payment_error?.message || "Payment failed",
                updatedAt: admin.database.ServerValue.TIMESTAMP,
            });
        }

        break;
    }
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
});
