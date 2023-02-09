const express = require("express");
const router = express.Router();
const admin = require("./../middlewares/admin");
const auth = require("./../middlewares/authenticated");
const Customer = require("../models/customer");
const Log = require("../middlewares/logger");

router.get("/admin/customers", [auth, admin], async (req, res) => {
    try {
        const customers = await Customer.find({});
        return res.status(200).send({ customers });
    } catch (error) {
        Log.error(error.message);
        return res.status(500).send("Ha ocurrido un error inesperado, por favor reportar a soporte");
    }
});

module.exports = router;