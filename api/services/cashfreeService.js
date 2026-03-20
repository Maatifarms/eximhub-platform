const { Cashfree, CFEnvironment } = require('cashfree-pg');
require('dotenv').config();

// Default values for Sandbox testing if credentials are not set
const DEFAULT_CASHFREE_APP_ID = process.env.CASHFREE_APP_ID || '';
const DEFAULT_CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY || '';
const ENVIRONMENT = process.env.CASHFREE_ENVIRONMENT || 'SANDBOX'; // SANDBOX or PRODUCTION

Cashfree.XClientId = DEFAULT_CASHFREE_APP_ID;
Cashfree.XClientSecret = DEFAULT_CASHFREE_SECRET_KEY;
Cashfree.XEnvironment = ENVIRONMENT === 'PRODUCTION' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

async function createOrder({ orderId, orderAmount, orderCurrency, customerDetails, orderMeta }) {
    if (!Cashfree.XClientId || !Cashfree.XClientSecret) {
        throw new Error('CASHFREE Credentials missing in env.');
    }

    try {
        const response = await Cashfree.PGCreateOrder("2023-08-01", {
            order_id: orderId,
            order_amount: orderAmount,
            order_currency: orderCurrency || "INR",
            customer_details: customerDetails,
            order_meta: orderMeta,
        });

        return response.data; // Includes payment_session_id
    } catch (error) {
        console.error('CASHFREE Create Order Error:', error.response?.data || error.message);
        throw error;
    }
}

async function getOrderDetails(orderId) {
    try {
        const response = await Cashfree.PGGetOrder("2023-08-01", orderId);
        return response.data;
    } catch (error) {
        console.error('CASHFREE Get Order Error:', error.response?.data || error.message);
        throw error;
    }
}

module.exports = {
    createOrder,
    getOrderDetails,
};
