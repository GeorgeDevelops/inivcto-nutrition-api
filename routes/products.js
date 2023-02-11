const express = require("express");
const router = express.Router();
const Product = require("./../models/product");
const Log = require("./../middlewares/logger");
const admin = require("./../middlewares/admin");
const auth = require("./../middlewares/authenticated");

router.get("/products", async (req, res) => {
    try {
        const products = await Product.find({});
        return res.status(200).send(products);
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.get("/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product || product === "") return res.status(404).send("Producto no disponible.");
        return res.status(200).send(product);
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.post("/products/new", [auth, admin], async (req, res) => {
    const { name, weight, brand, images, category, description } = req.body;
    try {
        const product = new Product({
            name,
            weight,
            category,
            brand,
            images,
            description
        });
        await product.save();

        res.status(200).send("Producto publicado exitosamente.");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.put("/products/update/:id", [auth, admin], async (req, res) => {
    const { body } = req;
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product || product === "") return res.status(404).send("Producto no disponible.");

        const updated = await Product.findByIdAndUpdate({ _id: id }, body, { new: true });

        let keys = Object.keys(body);
        for (let key of keys) {
            if (updated[key] !== body[key]) return res.status(400).send("Informacion no actualizada.");
            return res.status(200).send("Informacion actualizada exitosamente.");
        }
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.delete("/products/delete/:id", [auth, admin], async (req, res) => {
    const { params } = req;
    const { id } = params;
    try {
        const product = await Product.findById(id);
        if (!product || product === "") return res.status(404).send("Producto no disponible.");
        await product.remove();
        return res.status(200).send("Producto eliminado exitosamente.");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

module.exports = router;