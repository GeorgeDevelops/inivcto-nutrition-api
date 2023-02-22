const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const APP_SECRET = process.env.PAYPAL_APP_SECRET;

const base = process.env.PAYPAL_BASE_URL;

// const CLIENT_ID = "AWWtKRrhmFYvQMI_hJ9-Ks4HPUkAsXdAAbfcq0Zggw4u4WzWbAdAEhcRjo3DnrBFYJvtnikt_73g86r3";
// const APP_SECRET = "EGl7ZopMWSjGf5X0Q_EG5wcJcQdI-th8a4hDIUuyJR0D9dHJmUpUHiJqJg9EtUyPL2oAfb1nd0uAblQZ";

// const base = "https://api-m.sandbox.paypal.com";

async function createOrder(total) {
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
                        value: `${total}`,
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