const paypal = require("./../tools/paypal");
const express = require("express");
const router = express.Router();
const Product = require("./../models/product");
const auth = require("./../middlewares/authenticated");
const Log = require("../middlewares/logger");

router.post("/paypal/create-order", auth, async (req, res) => {
    const { content } = req.body;

    if (content.length < 1) return res.status(400).send("Debe agregar al menos un producto para realizar pedido");

    try {
        function GET_PRODUCTS() {
            return new Promise((resolve, reject) => {
                let products = [];
                content.forEach(async item => {
                    let product = await Product.findById(item._id);
                    products.push({ id: item._id, price: product.weight[item.index].price, flavor: product.weight[item.index].flavor, quantity: item.quantity });
                    if (products.length === content.length) return resolve(products);
                });
            });
        }
        let response = await GET_PRODUCTS();

        if (!response || response.length < 1) return res.status(400).send("Algo ha salido mas al validar los productos, por favor contacte soporte para una rapida solucion a este problema.");

        let subtotal = response.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        let sub = subtotal + 250;

        let currency_conversion = sub / 56;

        let total = currency_conversion.toString();

        if (currency_conversion.toString().includes(".")) {
            console.log("INCLUDES");
            let format = currency_conversion.toString().split(".");

            let f1 = format[0];

            let f2 = format[1].split("")[0];

            let f3 = format[1].split("")[1]

            total = `${f1}.${f2}${f3 ? f3 : ""}`.trim();
        }

        let order = await paypal.order.create(total);

        return res.status(200).send(order);
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.post("/paypal/capture-payment", auth, async (req, res) => {
    try {
        const { orderId } = req.body;
        let response = await paypal.payment.capture(orderId.orderID);
        return res.status(200).send(response);
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

module.exports = router;