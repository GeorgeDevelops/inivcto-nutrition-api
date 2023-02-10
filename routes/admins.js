const express = require("express");
const router = express.Router();
const Admin = require("./../models/admin");
const bcrypt = require("bcrypt");
const Log = require("./../middlewares/logger");
const _ = require("lodash");
const { Validator } = require("./../middlewares/validator");
const admin = require("./../middlewares/admin");
const auth = require("./../middlewares/authenticated");

router.post("/admin/signup", [auth, admin], async (req, res) => {
    const { first_name, last_name, cedula, phone, email, password } = req.body;
    const object = _.pick(req.body, ["first_name", "last_name", "cedula", "phone", "email", "password"]);
    try {
        const response = Validator.validate(object);
        if (response.error) return res.status(400).send(response.error.details[0].message);

        const duplicated = await Admin.find({ cedula: cedula });
        if (duplicated.length > 0) return res.status(400).send("Esta cuenta ya existe.");

        let encrypted = await bcrypt.hash(password, 10);

        const user = new Admin({
            first_name: first_name,
            last_name: last_name,
            cedula: cedula,
            phone: phone,
            email: email,
            password: encrypted,
        });
        await user.save();

        let token = user.generateJWT();
        return res.header("x-auth-token", token).status(200).send("Se ha registrado exitosamente!");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

router.post("/admin/login", async (req, res) => {
    const { cedula, password } = req.body;
    try {
        if (Object.keys(req.body).length < 2) return res.status(400).send("Solicitud Invalida.")

        const user = await Admin.findOne({ cedula: cedula });
        if (!user || user === "") return res.status(404).send("Cedula o contraseña incorrecta");

        const isCorrect = await bcrypt.compare(password, user.password);
        if (!isCorrect) return res.status(404).send("Cedula o contraseña incorrecta");

        const token = user.generateJWT();

        return res
            .header("x-auth-token", token)
            .header("access-control-expose-headers", "x-auth-token")
            .status(200)
            .send("Has iniciado seccion exitosamente.");
    } catch (err) {
        Log.error(err.message);
        return res.status(500).send(`Ha ocurrido un error, por favor comuniquese con soporte`);
    }
});

module.exports = router;