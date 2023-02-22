const stripe = require("stripe")("sk_test_51MBTikFgUifPBWavyFqo5ahgtRw4scP2FpuQmcxXA2nyEo5qPBoYEi1C8IlKOiu0MeuUZO7RE3rG6slajXdMLhm100GC52vUF5");
const Product = require("./../models/product");
const express = require("express");
const router = express.Router();

router.post("/create-payment-intent", async (req, res) => {
    const { items } = req.body;

    function calculateOrderAmount() {
        return new Promise((resolve, reject) => {
            let products = [];
            items.forEach(async item => {
                let product = await Product.findById(item._id);
                let p = { id: item._id, price: product.weight[item.index].price, quantity: item.quantity }
                products.push(p);
                if (products.length === items.length) return resolve(products);
            });
        });
    }

    let response = await calculateOrderAmount().catch(error => {
        return res.status(400).send("Algo ha salido mal");
    });

    let subtotal = response.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    let total = (Math.ceil(Number(subtotal) / 56) * 100) + 600;

    const paymentIntent = await stripe.paymentIntents.create({
        amount: total,
        currency: "usd",
    });

    return res.status(200).send({
        clientSecret: paymentIntent.client_secret,
    });
});

module.exports = router;