const {onValueCreated} = require("firebase-functions/v2/database");
const {onCall} = require("firebase-functions/v2/https");
const {onRequest} = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const cors = require("cors");

// Create a Stripe Connect account for a new manager
exports.createStripeConnectAccount = onValueCreated({
    ref: "/managers/{managerId}",
    region: "us-central1",
}, async (event) => {
    try {
        const managerId = event.params.managerId;
        const managerData = event.data.val();

        console.log(`[STRIPE-DEBUG] Starting Stripe Connect account creation for manager ${managerId}`, {
            managerId,
            email: managerData.email,
            firstName: managerData.firstName,
            lastName: managerData.lastName,
            stripeSecretKeyLength: process.env.STRIPE_SECRET_KEY ? process.env.STRIPE_SECRET_KEY.length : 0,
            timestamp: new Date().toISOString(),
        });

        // Validate manager data
        if (!managerData.email) {
            console.error(`[STRIPE-ERROR] Cannot create Stripe account for manager ${managerId}: No email provided`, {
                managerId,
                managerData: JSON.stringify(managerData),
            });
            return null;
        }

        console.log("[STRIPE-DEBUG] Creating Stripe Connect account with params:", {
            email: managerData.email,
            businessName: `${managerData.firstName || ""} ${managerData.lastName || ""}'s Parking Business`.trim(),
            accountType: "express",
            capabilities: {
                card_payments: true,
                transfers: true,
            },
        });

        // Create a Stripe Connect Express account
        const account = await stripe.accounts.create({
            type: "express",
            email: managerData.email,
            business_type: "company",
            company: {
                name: `${managerData.firstName || ""} ${managerData.lastName || ""}'s Parking Business`.trim(),
            },
            capabilities: {
                card_payments: {requested: true},
                transfers: {requested: true},
            },
            metadata: {
                firebaseManagerId: managerId,
            },
        }).catch((error) => {
            console.error("[STRIPE-ERROR] Failed to create Stripe account:", {
                managerId,
                error: {
                    message: error.message,
                    type: error.type,
                    code: error.code,
                    param: error.param,
                    statusCode: error.statusCode,
                },
                stripeSecretKeyIsSet: !!process.env.STRIPE_SECRET_KEY,
            });
            throw error;
        });

        console.log(`[STRIPE-SUCCESS] Created Stripe Connect account for manager ${managerId}`, {
            managerId,
            stripeAccountId: account.id,
            accountCreatedAt: account.created,
            accountDetails: {
                chargesEnabled: account.charges_enabled,
                detailsSubmitted: account.details_submitted,
                payoutsEnabled: account.payouts_enabled,
            },
        });

        // Update the manager record with the Stripe account ID
        await admin.database().ref(`/managers/${managerId}/stripeAccount`).set({
            stripeAccountId: account.id,
            onboardingComplete: false,
            created: admin.database.ServerValue.TIMESTAMP,
        }).catch((error) => {
            console.error("[STRIPE-ERROR] Failed to update manager record with Stripe account ID:", {
                managerId,
                stripeAccountId: account.id,
                error: error.message,
            });
            throw error;
        });

        console.log(`[STRIPE-SUCCESS] Updated manager ${managerId} record with Stripe account ID ${account.id}`);
        return null;
    } catch (error) {
        console.error("[STRIPE-ERROR] Error creating Stripe Connect account:", {
            managerId: event.params.managerId,
            errorDetails: {
                message: error.message,
                stack: error.stack,
            },
        });
        return null;
    }
});

// Generate onboarding link for manager
exports.generateAccountLink = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {managerId} = request.data;

        console.log(`[STRIPE-DEBUG] Starting onboarding link generation for manager ${managerId}`, {
            managerId,
            timestamp: new Date().toISOString(),
            callerAuth: request.auth ? {uid: request.auth.uid} : "unauthenticated",
        });

        // Get manager's Stripe account ID
        console.log("[STRIPE-DEBUG] Fetching manager's Stripe account data from database");
        const managerSnapshot = await admin.database().ref(`/managers/${managerId}/stripeAccount`).once("value");
        const managerData = managerSnapshot.val();

        if (!managerData) {
            console.error(`[STRIPE-ERROR] No Stripe data found for manager ${managerId}`);
            throw new Error("Manager has no Stripe data");
        }

        if (!managerData.stripeAccountId) {
            console.error(`[STRIPE-ERROR] No Stripe account ID found for manager ${managerId}`, {
                managerData: JSON.stringify(managerData),
            });
            throw new Error("Manager has no Stripe account ID");
        }

        console.log(`[STRIPE-DEBUG] Found Stripe account ID for manager ${managerId}:`, {
            stripeAccountId: managerData.stripeAccountId,
            onboardingComplete: managerData.onboardingComplete,
        });

        // Check if we have the required environment variables
        if (!process.env.STRIPE_DOMAIN) {
            console.error("[STRIPE-ERROR] Missing STRIPE_DOMAIN environment variable");
            throw new Error("Server configuration error: Missing STRIPE_DOMAIN");
        }

        console.log("[STRIPE-DEBUG] Creating account link with params:", {
            account: managerData.stripeAccountId,
            refresh_url: `${process.env.STRIPE_DOMAIN}/stripe/refresh?managerId=${managerId}`,
            return_url: `${process.env.STRIPE_DOMAIN}/stripe/return?managerId=${managerId}`,
        });

        // Create account link
        const accountLink = await stripe.accountLinks.create({
            account: managerData.stripeAccountId,
            refresh_url: `${process.env.STRIPE_DOMAIN}/stripe/refresh?managerId=${managerId}`,
            return_url: `${process.env.STRIPE_DOMAIN}/login`,
            type: "account_onboarding",
        }).catch((error) => {
            console.error("[STRIPE-ERROR] Failed to create account link:", {
                managerId,
                stripeAccountId: managerData.stripeAccountId,
                error: {
                    message: error.message,
                    type: error.type,
                    code: error.code,
                    param: error.param,
                    statusCode: error.statusCode,
                },
            });
            throw error;
        });

        console.log(`[STRIPE-SUCCESS] Generated onboarding link for manager ${managerId}`, {
            accountLinkGenerated: true,
            linkExpiresAt: accountLink.expires_at,
            urlLength: accountLink.url ? accountLink.url.length : 0,
        });

        // Update timestamp of last link generation
        await admin.database().ref(`/managers/${managerId}/stripeAccount/lastLinkGenerated`).set(admin.database.ServerValue.TIMESTAMP);

        return {
            accountLinkUrl: accountLink.url,
            expires_at: accountLink.expires_at,
        };
    } catch (error) {
        console.error("[STRIPE-ERROR] Error generating account link:", {
            managerId: request.data?.managerId,
            errorDetails: {
                message: error.message,
                code: error.code,
                type: error.type,
                stack: error.stack,
            },
        });
        throw new Error(error.message);
    }
});

// Add this new function to test Stripe configuration

exports.verifyStripeSetup = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        console.log("[STRIPE-DEBUG] Starting Stripe configuration verification", {
            timestamp: new Date().toISOString(),
            callerAuth: request.auth ? {uid: request.auth.uid} : "unauthenticated",
        });

        // Check if Stripe API key is set
        if (!process.env.STRIPE_SECRET_KEY) {
            console.error("[STRIPE-ERROR] STRIPE_SECRET_KEY environment variable is not set");
            return {
                success: false,
                error: "Missing Stripe API key configuration",
            };
        }

        // Check if STRIPE_DOMAIN is set
        if (!process.env.STRIPE_DOMAIN) {
            console.error("[STRIPE-ERROR] STRIPE_DOMAIN environment variable is not set");
            return {
                success: false,
                error: "Missing Stripe domain configuration",
            };
        }

        console.log("[STRIPE-DEBUG] Attempting to access Stripe API");

        // Try to access Stripe API to verify credentials
        try {
            // Get Stripe account capabilities (a lightweight operation)
            const stripeBalance = await stripe.balance.retrieve();
            console.log("[STRIPE-SUCCESS] Successfully connected to Stripe API", {
                availableCurrencies: stripeBalance.available.map((bal) => bal.currency),
                pendingCurrencies: stripeBalance.pending.map((bal) => bal.currency),
            });
        } catch (stripeError) {
            console.error("[STRIPE-ERROR] Failed to connect to Stripe API:", {
                error: {
                    message: stripeError.message,
                    type: stripeError.type,
                    code: stripeError.code,
                },
            });
            return {
                success: false,
                error: `Stripe API connection failed: ${stripeError.message}`,
            };
        }

        // Try to create a test Connect account link (will fail with a specific error)
        try {
            console.log("[STRIPE-DEBUG] Testing Connect account link creation");
            await stripe.accountLinks.create({
                account: "acct_testing_only",
                refresh_url: `${process.env.STRIPE_DOMAIN}/stripe/refresh`,
                return_url: `${process.env.STRIPE_DOMAIN}/stripe/return`,
                type: "account_onboarding",
            });
            // This should fail with a specific error about the account not existing
        } catch (linkError) {
            if (linkError.type === "StripeInvalidRequestError" &&
                linkError.message.includes("No such account")) {
                console.log("[STRIPE-DEBUG] Expected test error received for non-existent account:", {
                    message: linkError.message,
                });
                // This is the expected error, continue
            } else {
                // This is an unexpected error
                console.error("[STRIPE-ERROR] Unexpected error testing Connect accounts:", {
                    error: {
                        message: linkError.message,
                        type: linkError.type,
                        code: linkError.code,
                    },
                });
                return {
                    success: false,
                    error: `Connect account verification failed: ${linkError.message}`,
                };
            }
        }

        console.log("[STRIPE-SUCCESS] Stripe configuration verification completed successfully");
        return {
            success: true,
            apiConnected: true,
            domainConfigured: true,
            timestamp: new Date().toISOString(),
        };
    } catch (error) {
        console.error("[STRIPE-ERROR] Unexpected error verifying Stripe setup:", {
            errorDetails: {
                message: error.message,
                stack: error.stack,
            },
        });
        return {
            success: false,
            error: "Unexpected error during Stripe setup verification",
        };
    }
});
// Check manager's Stripe account status
exports.checkStripeAccountStatus = onCall({
    region: "us-central1",
}, async (request) => {
    try {
        const {managerId} = request.data;

        console.log(`[STRIPE-DEBUG] Checking Stripe account status for manager ${managerId}`, {
            managerId,
            timestamp: new Date().toISOString(),
            callerAuth: request.auth ? {uid: request.auth.uid} : "unauthenticated",
        });

        // Get manager's Stripe account ID
        const managerSnapshot = await admin.database().ref(`/managers/${managerId}/stripeAccount`).once("value");
        const managerData = managerSnapshot.val();

        if (!managerData) {
            console.log(`[STRIPE-DEBUG] No stripe account data found for manager ${managerId}`);
            return {
                hasAccount: false,
                message: "No Stripe account found",
            };
        }

        if (!managerData.stripeAccountId) {
            console.log(`[STRIPE-DEBUG] No stripe account ID found for manager ${managerId}`);
            return {
                hasAccount: false,
                message: "No Stripe account ID found",
            };
        }

        console.log(`[STRIPE-DEBUG] Found Stripe account ID ${managerData.stripeAccountId} for manager ${managerId}`);

        // Check account status with Stripe
        console.log("[STRIPE-DEBUG] Retrieving account details from Stripe API");
        const account = await stripe.accounts.retrieve(managerData.stripeAccountId).catch((error) => {
            console.error("[STRIPE-ERROR] Failed to retrieve Stripe account:", {
                managerId,
                stripeAccountId: managerData.stripeAccountId,
                error: {
                    message: error.message,
                    type: error.type,
                    code: error.code,
                },
            });
            throw error;
        });

        const onboardingComplete =
            account.details_submitted &&
            account.charges_enabled &&
            account.payouts_enabled;

        console.log(`[STRIPE-DEBUG] Retrieved Stripe account status for manager ${managerId}`, {
            detailsSubmitted: account.details_submitted,
            chargesEnabled: account.charges_enabled,
            payoutsEnabled: account.payouts_enabled,
            onboardingComplete,
        });

        // Update onboarding status if needed
        if (onboardingComplete !== managerData.onboardingComplete) {
            console.log(`[STRIPE-DEBUG] Updating onboarding status from ${managerData.onboardingComplete} to ${onboardingComplete}`);
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
        console.error("[STRIPE-ERROR] Error checking Stripe account:", {
            managerId: request.data?.managerId,
            errorDetails: {
                message: error.message,
                stack: error.stack,
            },
        });
        throw new Error(error.message);
    }
});

// Keep the rest of the functions as they were...

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


