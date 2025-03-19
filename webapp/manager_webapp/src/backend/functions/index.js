const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
    admin.initializeApp();
}

// Add Express for webhook handling
const express = require("express");
const functions = require("firebase-functions");

// Import function modules
const sensorFunctions = require("./sensorFunctions");
const userFunctions = require("./userFunctions");
const managerFunctions = require("./managerFunctions");

// Create Express app for webhook
const app = express();

// This is crucial for Stripe webhook signature verification
app.use(express.json({
    verify: (req, res, buf) => {
        req.rawBody = buf.toString();
    },
}));

// Create the webhook handler
app.post("/webhook", async (req, res) => {
    // Updated configuration access
    const stripeSecretKey =
        process.env.STRIPE_SECRET_KEY ||
        (functions.config().stripe && functions.config().stripe.secret_key);

    const webhookSecret =
        process.env.STRIPE_WEBHOOK_SECRET ||
        (functions.config().stripe && functions.config().stripe.webhook_secret);

    // Additional logging for configuration debugging
    console.log("Stripe Secret Key present:", !!stripeSecretKey);
    console.log("Webhook Secret present:", !!webhookSecret);

    // Validate configuration
    if (!stripeSecretKey || !webhookSecret) {
        console.error("Missing Stripe configuration");
        return res.status(500).send("Server configuration error");
    }

    const stripe = require("stripe")(stripeSecretKey);
    const sig = req.headers["stripe-signature"];

    console.log("Received webhook request");
    console.log("Using webhook secret starting with:", webhookSecret ? webhookSecret.substring(0, 5) + "..." : "Not set");

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);
        console.log("Webhook signature verified successfully for event type:", event.type);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        console.error("Raw body length:", req.rawBody ? req.rawBody.length : "No raw body");
        console.error("Signature received:", sig ? sig.substring(0, 20) + "..." : "No signature");
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
    case "account.updated": {
        const account = event.data.object;
        console.log(`Received account.updated event for account: ${account.id}`);

        // Find the manager with this Stripe account ID
        const managersSnapshot = await admin.database()
            .ref("/managers")
            .orderByChild("stripeAccount/stripeAccountId")
            .equalTo(account.id)
            .once("value");

        let managersUpdated = 0;
        managersSnapshot.forEach((managerSnapshot) => {
            const managerId = managerSnapshot.key;
            const onboardingComplete =
                account.details_submitted &&
                account.charges_enabled &&
                account.payouts_enabled;

            console.log(`Updating manager ${managerId} onboarding status to: ${onboardingComplete}`, {
                details_submitted: account.details_submitted,
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
            });

            admin.database()
                .ref(`/managers/${managerId}/stripeAccount/onboardingComplete`)
                .set(onboardingComplete);

            // Also update timestamp
            if (onboardingComplete) {
                admin.database()
                    .ref(`/managers/${managerId}/stripeAccount/onboardingCompletedAt`)
                    .set(admin.database.ServerValue.TIMESTAMP);
            }

            managersUpdated++;
        });

        console.log(`Updated onboarding status for ${managersUpdated} managers`);
        break;
    }

    case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const sessionId = paymentIntent.metadata.sessionId;

        if (sessionId) {
            await admin.database().ref(`/parkingSessions/${sessionId}`).update({
                paymentStatus: "succeeded",
                status: "completed",
                updatedAt: admin.database.ServerValue.TIMESTAMP,
            });
            console.log(`Updated payment session ${sessionId} to succeeded`);
        } else {
            console.log("Payment intent succeeded but no sessionId found in metadata");
        }
        break;
    }

    case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        const sessionId = paymentIntent.metadata.sessionId;

        if (sessionId) {
            await admin.database().ref(`/parkingSessions/${sessionId}`).update({
                paymentStatus: "failed",
                status: "failed",
                failureMessage: paymentIntent.last_payment_error?.message || "Payment failed",
                updatedAt: admin.database.ServerValue.TIMESTAMP,
            });
            console.log(`Updated payment session ${sessionId} to failed`);
        } else {
            console.log("Payment intent failed but no sessionId found in metadata");
        }
        break;
    }

    default:
        console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    res.json({received: true});
});

// Export all functions
module.exports = {
    // Sensor functions
    updateSpotStatusOnSensorDetection: sensorFunctions.updateSpotStatusOnSensorDetection,

    // User-related Stripe functions
    createStripeCustomer: userFunctions.createStripeCustomer,
    setupPaymentMethod: userFunctions.setupPaymentMethod,
    listPaymentMethods: userFunctions.listPaymentMethods,
    setDefaultPaymentMethod: userFunctions.setDefaultPaymentMethod,
    removePaymentMethod: userFunctions.removePaymentMethod,

    // Manager-related Stripe functions
    createStripeConnectAccount: managerFunctions.createStripeConnectAccount,
    generateAccountLink: managerFunctions.generateAccountLink,
    checkStripeAccountStatus: managerFunctions.checkStripeAccountStatus,
    processParkingPayment: managerFunctions.processParkingPayment,
    processParkingPaymentOnExit: managerFunctions.processParkingPaymentOnExit,

    manualProcessParkingPayment:  managerFunctions.manualProcessParkingPayment,
    getSessionPaymentDetails:  managerFunctions.getSessionPaymentDetails,


    stripeWebhook: functions.https.onRequest(app),
};
