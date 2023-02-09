const config = require("config");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const { CLIENT_ID, APP_SECRET } = config.get("payment_settings");

const base = "https://api-m.sandbox.paypal.com";

async function createOrder(total) {
    let price = Math.ceil(total / 55);
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders`;

    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: `${price}`,
                    },
                },
            ],
        }),
    });

    const data = await response.json();
    return data;
}

// use the orders api to capture payment for an order

async function capturePayment(orderId) {
    const accessToken = await generateAccessToken();
    const url = `${base}/v2/checkout/orders/${orderId}/capture`;

    const response = await fetch(url, {
        method: "post",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    const data = await response.json();
    return data;
}

// generate an access token using client id and app secret

async function generateAccessToken() {
    const auth = Buffer.from(CLIENT_ID + ":" + APP_SECRET).toString("base64")
    const response = await fetch(`${base}/v1/oauth2/token`, {
        method: "post",
        body: "grant_type=client_credentials",
        headers: {
            Authorization: `Basic ${auth}`,
        },
    });

    const data = await response.json();
    return data.access_token;
}

module.exports = {
    order: {
        create: createOrder
    },
    payment: {
        capture: capturePayment
    }
}