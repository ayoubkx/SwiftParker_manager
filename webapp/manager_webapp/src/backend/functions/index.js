const admin = require("firebase-admin");
require("dotenv").config();

// Initialize Firebase Admin SDK
admin.initializeApp();

// Import function modules
const sensorFunctions = require("./sensorFunctions");
const userFunctions = require("./userFunctions");
const managerFunctions = require("./managerFunctions");

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
    stripeWebhook: managerFunctions.stripeWebhook,
};
