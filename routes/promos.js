const express = require("express");
const router = express.Router();
const Promo = require("./../models/promo");
const Log = require("../middlewares/logger");
const auth = require("../middlewares/authenticated");
const admin = require("../middlewares/admin");

router.post("/admin/promos/new", [auth, admin], async (req, res) => {
    try {
        let body = req.body;

        if (!body.name || body.name === "") return res.status(400).send("Nombre de promocion es obligatorio.");
        if (!body.code || body.code === "") return res.status(400).send("Codigo de promocion es obligatorio.");
        if (!body.start || body.start === "") return res.status(400).send("Fecha inicial de promocion es obligatoria.");
        if (!body.discount || body.discount === "") return res.status(400).send("Descuento de promocion es obligatorio.");
        if (!body.type || body.type === "") return res.status(400).send("Tipo de promocion es obligatorio.");

        let promo = new Promo({
            name: body.name,
            code: body.code,
            start: body.start,
            deadline: body.deadline,
            type: body.type,
            discount: body.discount
        });

        await promo.save();

        return res.status(200).send("Promocion creada con exito.");
    } catch (error) {
        Log.error("ERROR: ", error);
        return res.status(500).send("Algo ha salido mal favor comunicar a soporte.");
    }
});

router.put("/admin/promos/:id/disable", [auth, admin], async (req, res) => {
    try {
        let { id } = req.params;

        Promo.findByIdAndUpdate(id, { enabled: false },
            function (err, docs) {
                if (err) {
                    return res.status(400).send("Algo ha salido mal al deshabilitar esta promocion, intente nuevamente.")
                }
                else {
                    return res.status(200).send("Promocion deshabilitada permanentemente.");
                }
            });
    } catch (error) {
        Log.error(error);
        return res.status(500).send("Algo ha salido mal favor comunicar a soporte.")
    }
});

router.get("/admin/promos", [auth, admin], async (req, res) => {
    try {
        let promos = await Promo.find({});
        return res.status(200).send(promos);
    } catch (error) {
        Log.error(error);
        return res.status(500).send("Algo ha salido mal favor comunicar ha soporte.");
    }
});

router.get("/promotions/:code", [auth, admin], async (req, res) => {
    const code = req.params;
    try {
        let promotion = await Promo.find({ code });

        if (!promotion || promotion.length < 1 || !promotion[0]) return res.status(404).send({ isAvailable: false, message: "Codigo de promocion no valido." });

        if (!promotion[0].enabled) return res.status(400).send({ isAvailable: false, message: "Lo sentimos, esta promocion ya no esta disponible." });

        return res.status(200).send({ isAvailable: true, promotion, message: "Promocion aplicada." });
    } catch (error) {
        Log.error(error);
        return res.status(500).send("Algo ha salido mal favor comunicar ha soporte.");
    }
});

module.exports = router;