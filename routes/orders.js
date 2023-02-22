const express = require("express");
const router = express.Router();
const Log = require("../middlewares/logger");
const Order = require("./../models/order");
const Product = require("./../models/product");
const auth = require("./../middlewares/authenticated");
const admin = require("../middlewares/admin");
const Customer = require("./../models/customer");
const _ = require("lodash");
const Promo = require("./../models/promo");

router.get("/admin/orders", [auth, admin], async (req, res) => {
    try {
        const orders = await Order.find({});
        return res.status(200).send(orders);

    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.get("/admin/orders/:status/filter", [auth, admin], async (req, res) => {
    const { status } = req.params;
    try {
        const orders = await Order.find({});

        let filtered_orders = orders.filter(order => order.status === status);

        return res.status(200).send(filtered_orders);

    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.get("/orders/:customerId", auth, async (req, res) => {
    const { customerId } = req.params;
    try {
        const orders = await Order.find({ customerId });
        if (!orders || orders === "" || orders.length < 1) return res.status(404).send("No hay pedidos disponibles");

        let matches = [];
        orders.forEach(order => {
            let obj = _.pick(order, ["orderId", "status", "date"]);
            matches.push(obj);
        });

        return res.status(200).send(matches);
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.get("/admin/orders/:orderId/single", [auth, admin], async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findById(orderId);
        if (!order || order === "") return res.status(404).send("Este pedido no existe.");
        let limited = _.pick(order, ["_id", "orderId", "customerId", "content", "total", "date", "status"])
        return res.status(200).send(limited);
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.get("/orders/:orderId/confirm", auth, async (req, res) => {
    const { orderId } = req.params;
    try {
        const order = await Order.findOne({ orderId });
        if (!order || order === "") return res.status(404).send("Este pedido no existe!");
        return res.status(200).send("Found!");
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.post("/orders/new", auth, async (req, res) => {
    const { content, customerId, payment_details, promotionId, paid } = req.body;

    try {
        if (content.length < 1) return res.status(400).send("Debe agregar al menos un producto para realizar pedido");
        if (!customerId || customerId === "") return res.status(400).send("Algo ha salido mal - ERROR00");

        function GET_PRODUCTS() {
            return new Promise((resolve, reject) => {
                let products = [];
                content.forEach(async item => {
                    let product = await Product.findById(item._id);
                    let p = { id: item._id, product, weight: { weight: product.weight[item.index].weight, measure: product.weight[item.index].measure }, price: product.weight[item.index].price, flavor: product.weight[item.index].flavor, quantity: item.quantity }
                    products.push(p);
                    if (products.length === content.length) return resolve(products);
                });
            });
        }
        let response = await GET_PRODUCTS().catch(error => {
            Log.error("Error: ", error);
            return res.status(400).send("Algo ha salido mal al someter pedido.");
        });

        let total = response.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        if (promotionId) {
            let promotion = await Promo.findById(promotionId);

            if (!promotion || promotion === "") return res.status(404).send("Esta promocion no existe.");

            total = total - ((promotion.discount / 100) * total);
        }

        let orderId = `IN${Math.ceil(Math.random() * 999999999)}`;

        let order = new Order({
            orderId,
            customerId,
            content: response,
            total: Number(total) + 250,
            isPaid: paid,
            payment_details,
            promotionId
        });

        let newOrder = await order.save();

        let customer = await Customer.find({ customerId: customerId });

        if (!customer || customer === "") {
            let customer = new Customer({
                customerId,
                orderId
            });

            await customer.save();
        }

        let detailed = _.pick(newOrder, ["orderId", "content", "total", "date"]);

        return res.status(200).send({ message: "Pedido enviado correctamente", order_details: detailed });
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.put("/admin/orders/:id/update", [auth, admin], async (req, res) => {
    const { body, params } = req;
    let { id } = params;
    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).send("Este pedido no existe.");

        const updated = await Order.findByIdAndUpdate({ _id: id }, body, { new: true });

        let keys = Object.keys(body);

        for (let key of keys) {
            if (updated[key] !== body[key]) return res.status(400).send("Informacion no actualizada.");
            return res.status(200).send("Informacion actualizada exitosamente");
        }
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});
router.delete("/orders/delete/:id", [auth, admin], async (req, res) => {
    const { params } = req;
    const { id } = params;
    try {
        const order = await Order.findById(id);
        if (!order) return res.status(404).send("Este pedido ya no existe.");
        await order.remove();
        return res.status(200).send("Pedido eliminado exitosamente.");
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

module.exports = router;