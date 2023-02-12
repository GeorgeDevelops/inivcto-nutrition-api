const express = require("express");
const router = express.Router();
const Product = require("./../models/product");
const Promo = require("./../models/promo");

router.post("/payment/process", async (req, res) => {
    const { content, promotionId } = req.body;

    if (!content || content.length < 1) return res.status(400).send("Debe agregar al menos un producto para realizar pedido");

    function GET_PRODUCTS() {
        return new Promise((resolve, reject) => {
            let products = [];
            content.forEach(async item => {
                let product = await Product.findById(item._id);
                let p = { price: product.weight[item.index].price, quantity: item.quantity }
                products.push(p);
                if (products.length === content.length) return resolve(products);
            });
        });
    }

    let response = await GET_PRODUCTS().catch(error => {
        Log.error("Error: ", error);
        return res.status(400).send("Algo ha salido mal al someter pedido.");
    });

    let subtotal = response.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    if (!promotionId || promotionId === "") {

        let total = subtotal + 300; // $300 DOP Delivery service
        let URL = `Pagara un total de ${total} por su compra.`;
        return res.status(200).send(URL);
    }

    let promotion = await Promo.findById(promotionId);

    if (!promotion || promotion === "") return res.status(400).send("Promocion no pudo ser aplicada. Invalida.");

    if (!promotion.enabled) return res.status(400).send("Esta promocion ya no esta disponible.");

    let discount = (promotion.discount / 100) * subtotal;

    let total = (subtotal - discount) + 300; // $300 DOP delivery service

    promotion.enabled = false;
    promotion.save();

    let URL = `Pagara un total de ${total} por su compra.`;
    return res.status(200).send(URL);
});

module.exports = router;