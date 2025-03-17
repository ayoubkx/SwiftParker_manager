const {onValueCreated} = require("firebase-functions/v2/database");
const {onCall} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Create a Stripe customer when a new user is created
exports.createStripeCustomer = onValueCreated({
    ref: "/users/{userId}",
    region: "us-central1",
}, async (event) => {
    try {
        const userId = event.params.userId;
        const userData = event.data.val();

        // Create a Stripe customer
        const customer = await stripe.customers.create({
            email: userData.email,
            name: userData.fullName || "",
            phone: userData.phoneNumber || "",
            metadata: {
                firebaseUserId: userId,
            },
        });

        // Update the user record with the Stripe customer ID
        await admin.database().ref(`/users/${userId}/stripeCustomer`).set({
            stripeCustomerId: customer.id,
            created: admin.database.ServerValue.TIMESTAMP,
        });

        return null;
    } catch (error) {
        console.error("Error creating Stripe customer:", error);
        return null;
    }
});

// Setup payment method for user
exports.setupPaymentMethod = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId, paymentMethodId} = request.data;

        // Get user's Stripe customer ID
        const userSnapshot = await admin.database().ref(`/users/${userId}/stripeCustomer`).once("value");
        const userData = userSnapshot.val();

        if (!userData || !userData.stripeCustomerId) {
            throw new Error("User has no Stripe customer account");
        }

        // Attach payment method to the customer
        await stripe.paymentMethods.attach(paymentMethodId, {
            customer: userData.stripeCustomerId,
        });

        // Set as default payment method
        await stripe.customers.update(userData.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Save reference in database
        await admin.database().ref(`/users/${userId}/paymentMethods/${paymentMethodId}`).set({
            added: admin.database.ServerValue.TIMESTAMP,
            isDefault: true,
        });

        return {success: true};
    } catch (error) {
        console.error("Error setting up payment method:", error);
        throw new Error(error.message);
    }
});

// List payment methods for user
exports.listPaymentMethods = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId} = request.data;

        // Get user's Stripe customer ID
        const userSnapshot = await admin.database().ref(`/users/${userId}/stripeCustomer`).once("value");
        const userData = userSnapshot.val();

        if (!userData || !userData.stripeCustomerId) {
            return {paymentMethods: []};
        }

        // Get payment methods from Stripe
        const paymentMethods = await stripe.paymentMethods.list({
            customer: userData.stripeCustomerId,
            type: "card",
        });

        return {paymentMethods: paymentMethods.data};
    } catch (error) {
        console.error("Error listing payment methods:", error);
        throw new Error(error.message);
    }
});

// Set default payment method
exports.setDefaultPaymentMethod = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId, paymentMethodId} = request.data;

        // Get user's Stripe customer ID
        const userSnapshot = await admin.database().ref(`/users/${userId}/stripeCustomer`).once("value");
        const userData = userSnapshot.val();

        if (!userData || !userData.stripeCustomerId) {
            throw new Error("User has no Stripe customer account");
        }

        // Set as default in Stripe
        await stripe.customers.update(userData.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Update database
        const paymentMethodsSnapshot = await admin.database().ref(`/users/${userId}/paymentMethods`).once("value");
        const paymentMethods = paymentMethodsSnapshot.val() || {};

        // Set all to non-default
        const updates = {};
        Object.keys(paymentMethods).forEach((pmId) => {
            updates[`/users/${userId}/paymentMethods/${pmId}/isDefault`] = false;
        });

        // Set selected one as default
        updates[`/users/${userId}/paymentMethods/${paymentMethodId}/isDefault`] = true;

        await admin.database().ref().update(updates);

        return {success: true};
    } catch (error) {
        console.error("Error setting default payment method:", error);
        throw new Error(error.message);
    }
});

// Remove payment method
exports.removePaymentMethod = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId, paymentMethodId} = request.data;

        // Get user's payment methods
        const paymentMethodsSnapshot = await admin.database().ref(`/users/${userId}/paymentMethods`).once("value");
        const paymentMethods = paymentMethodsSnapshot.val() || {};

        // Check if it's the only payment method
        if (Object.keys(paymentMethods).length <= 1) {
            throw new Error("Cannot remove the only payment method");
        }

        // Check if it's the default payment method
        if (paymentMethods[paymentMethodId]?.isDefault) {
            throw new Error("Cannot remove the default payment method. Set another method as default first.");
        }

        // Get user's Stripe customer ID
        const userSnapshot = await admin.database().ref(`/users/${userId}/stripeCustomer`).once("value");
        const userData = userSnapshot.val();

        if (userData && userData.stripeCustomerId) {
            // Detach from Stripe
            await stripe.paymentMethods.detach(paymentMethodId);
        }

        // Remove from database
        await admin.database().ref(`/users/${userId}/paymentMethods/${paymentMethodId}`).remove();

        return {success: true};
    } catch (error) {
        console.error("Error removing payment method:", error);
        throw new Error(error.message);
    }
});
