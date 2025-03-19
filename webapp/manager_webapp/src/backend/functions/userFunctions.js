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

// Setup payment method for user - UPDATED to include billing details
// Updated setupPaymentMethod function to handle cardholder name
// Updated setupPaymentMethod function to handle cardholder name using Firebase Functions v2 SDK
// Make sure to match your existing structure
exports.setupPaymentMethod = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId, paymentMethodId, billingDetails} = request.data;

        // Get user's Stripe customer ID
        const userSnapshot = await admin.database().ref(`/users/${userId}/stripeCustomer`).once("value");
        const userData = userSnapshot.val();

        if (!userData || !userData.stripeCustomerId) {
            throw new Error("User has no Stripe customer account");
        }

        // If billingDetails were provided, update the payment method first
        if (billingDetails && billingDetails.name) {
            try {
                // Update the payment method's billing details
                await stripe.paymentMethods.update(paymentMethodId, {
                    billing_details: {name: billingDetails.name},
                });
                console.log(`Updated payment method ${paymentMethodId} with billing name: ${billingDetails.name}`);
            } catch (updateError) {
                // Log error but continue - don't fail the whole operation if just the name update fails
                console.error("Error updating payment method with billing details:", updateError);
            }
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
        const paymentMethodData = {
            added: admin.database.ServerValue.TIMESTAMP,
            isDefault: true,
        };

        // Add billingName if provided
        if (billingDetails && billingDetails.name) {
            paymentMethodData.billingName = billingDetails.name;
        }

        await admin.database().ref(`/users/${userId}/paymentMethods/${paymentMethodId}`).set(paymentMethodData);

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

        // Get the Stripe customer to get the default payment method
        const customer = await stripe.customers.retrieve(userData.stripeCustomerId);

        // Get payment methods from Stripe
        const paymentMethods = await stripe.paymentMethods.list({
            customer: userData.stripeCustomerId,
            type: "card",
        });

        // Get stored payment method data from database
        const paymentMethodsSnapshot = await admin.database().ref(`/users/${userId}/paymentMethods`).once("value");
        const storedPaymentMethods = paymentMethodsSnapshot.val() || {};

        // Merge Stripe data with our database data
        const enhancedPaymentMethods = paymentMethods.data.map((pm) => {
            const storedData = storedPaymentMethods[pm.id] || {};
            return {
                ...pm,
                customer_invoice_settings: customer.invoice_settings,
                isDefault: customer.invoice_settings.default_payment_method === pm.id,
                billingName: storedData.billingName || "",
            };
        });

        return {paymentMethods: enhancedPaymentMethods};
    } catch (error) {
        console.error("Error listing payment methods:", error);
        throw new Error(error.message);
    }
});
// Set default payment method
// Set default payment method - UPDATED to properly update Stripe and database
exports.setDefaultPaymentMethod = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {userId, paymentMethodId} = request.data;

        // Validate input
        if (!userId || !paymentMethodId) {
            throw new Error("User ID and Payment Method ID are required");
        }

        // Get user's Stripe customer ID
        const userSnapshot = await admin.database().ref(`/users/${userId}/stripeCustomer`).once("value");
        const userData = userSnapshot.val();

        if (!userData || !userData.stripeCustomerId) {
            throw new Error("User has no Stripe customer account");
        }

        // Update default payment method in Stripe
        await stripe.customers.update(userData.stripeCustomerId, {
            invoice_settings: {
                default_payment_method: paymentMethodId,
            },
        });

        // Get all payment methods for the user
        const paymentMethodsSnapshot = await admin.database().ref(`/users/${userId}/paymentMethods`).once("value");
        const paymentMethods = paymentMethodsSnapshot.val() || {};

        // Prepare database updates
        const updates = {};

        // Set all payment methods to non-default
        Object.keys(paymentMethods).forEach((pmId) => {
            updates[`/users/${userId}/paymentMethods/${pmId}/isDefault`] = false;
        });

        // Set the selected payment method as default
        updates[`/users/${userId}/paymentMethods/${paymentMethodId}/isDefault`] = true;

        // Perform the update
        await admin.database().ref().update(updates);

        return {
            success: true,
            message: "Default payment method updated successfully",
        };
    } catch (error) {
        console.error("Error setting default payment method:", error);
        throw new Error(error.message);
    }
});

// Remove payment method - UPDATED to handle Stripe and database removal
exports.removePaymentMethod = onCall({
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

        // Get user's payment methods
        const paymentMethodsSnapshot = await admin.database().ref(`/users/${userId}/paymentMethods`).once("value");
        const paymentMethods = paymentMethodsSnapshot.val() || {};

        // Check if it's the only payment method
        if (Object.keys(paymentMethods).length <= 1) {
            throw new Error("Cannot remove the only payment method");
        }

        // If removing the default payment method, find another method to set as default
        if (paymentMethods[paymentMethodId]?.isDefault) {
            const remainingMethodIds = Object.keys(paymentMethods).filter((id) => id !== paymentMethodId);
            const newDefaultId = remainingMethodIds[0];

            // Set the first remaining method as default
            await stripe.customers.update(userData.stripeCustomerId, {
                invoice_settings: {
                    default_payment_method: newDefaultId,
                },
            });
        }

        // Detach from Stripe
        try {
            await stripe.paymentMethods.detach(paymentMethodId);
        } catch (stripeError) {
            console.error("Error detaching payment method from Stripe:", stripeError);
            // Continue with database removal even if Stripe detachment fails
        }

        // Remove the specific payment method from the database
        await admin.database().ref(`/users/${userId}/paymentMethods/${paymentMethodId}`).remove();

        return {success: true};
    } catch (error) {
        console.error("Error removing payment method:", error);
        throw new Error(error.message);
    }
});
